/**
 * 生命周期逻辑 — 每日重置、连续天数、成长阶段、离线追赶
 *
 * 所有函数都是纯数据操作，不依赖 Electron API，
 * 主进程和渲染进程都可以安全导入。
 */

import type { SaveData, PetInstance, SpeciesConfig } from '../types'
import { getSpecies } from '../data/species'
import { getPersonality } from '../data/personalities'
import { applyTimeDecay } from './petState'
import { MAX_OFFLINE_MINUTES } from '../constants'

// ============================================================
// 日期工具
// ============================================================

/** 本地日期 YYYY-MM-DD（使用系统时区，非 UTC） */
export function localTodayDateString(): string {
  const d = new Date()
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** 昨天的本地日期 YYYY-MM-DD */
function yesterdayDateString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// ============================================================
// 每日重置
// ============================================================

/**
 * 每日重置：跨天时把旧日期的 focus.today 合并/upsert 到 focus.history，
 * 然后重置 today 为新一天的空统计。
 *
 * 幂等：如果已经是今天的日期则什么都不做。
 */
export function performDailyRollover(save: SaveData): void {
  const today = localTodayDateString()
  if (save.focus.today.date === today) return

  // 把旧日期的统计 upsert 到历史中（避免同一天多条记录）
  const oldToday = save.focus.today
  const existingIdx = save.focus.history.findIndex(h => h.date === oldToday.date)
  if (existingIdx >= 0) {
    save.focus.history[existingIdx] = { ...oldToday }
  } else if (oldToday.sessionsCompleted > 0 || oldToday.completedMinutes > 0) {
    // 只有有数据的才写入历史
    save.focus.history.push({ ...oldToday })
  }

  // 重置为今天
  save.focus.today = {
    date: today,
    completedMinutes: 0,
    sessionsCompleted: 0,
    coinsEarned: 0,
  }
}

// ============================================================
// 专注完成记录
// ============================================================

/**
 * 记录一次专注完成。
 *
 * 职责：
 * - 更新 today 统计（分钟、次数、金币）
 * - 更新 user 总分钟、economy 金币
 * - 连续天数：当天第一场专注时判断昨天是否有记录，续接或重置
 * - 成长点与成长阶段
 *
 * 调用者仍需自己计算 calcFocusReward 来决定 coins 值。
 */
export function recordFocusCompletion(
  save: SaveData,
  completedMinutes: number,
  coins: number,
): void {
  // 先确保每日重置已执行（防止跨天计时完成时未重置）
  performDailyRollover(save)

  // 更新今日统计
  save.focus.today.completedMinutes += completedMinutes
  save.focus.today.sessionsCompleted += 1
  save.focus.today.coinsEarned += coins

  // 更新用户总数据
  save.user.totalFocusMinutes += completedMinutes
  save.economy.coins += coins
  save.economy.lifetimeCoinsEarned += coins

  // 连续天数：仅当天第一场专注时更新
  if (save.focus.today.sessionsCompleted === 1) {
    const yesterday = yesterdayDateString()
    const hadYesterday = save.focus.history.some(
      h => h.date === yesterday && h.sessionsCompleted > 0,
    )

    if (hadYesterday && save.user.currentStreakDays > 0) {
      // 昨天有过专注 → 续接 streak
      save.user.currentStreakDays += 1
    } else {
      // 昨天没有专注（或第一天使用）→ 重置为 1
      save.user.currentStreakDays = 1
    }

    if (save.user.currentStreakDays > save.user.longestStreakDays) {
      save.user.longestStreakDays = save.user.currentStreakDays
    }
  }

  // 成长点
  const pet = save.pets.find(p => p.id === save.activePetId)
  if (pet) {
    const growthPoints = completedMinutes >= 25 ? 8 : 2
    pet.growth.growthPoints += growthPoints

    // 更新成长阶段
    const species = getSpecies(pet.speciesId)
    if (species) {
      updateGrowthStage(pet, species)
    }
  }
}

// ============================================================
// 成长阶段
// ============================================================

/**
 * 根据 species.growthStages 和 pet.growth.growthPoints 更新
 * pet 的 baby/child/adult 阶段。
 */
export function updateGrowthStage(pet: PetInstance, species: SpeciesConfig): void {
  // 从高到低排序，找到第一个满足 minGrowthPoints 的阶段
  const sorted = [...species.growthStages].sort(
    (a, b) => b.minGrowthPoints - a.minGrowthPoints,
  )
  for (const s of sorted) {
    if (pet.growth.growthPoints >= s.minGrowthPoints) {
      pet.growth.stage = s.stage
      break
    }
  }
}

// ============================================================
// 离线追赶
// ============================================================

/**
 * 追赶离线时间衰减。
 *
 * 从 save.timestamps.lastTickAt 到 now 的经过分钟数，
 * 最多按 MAX_OFFLINE_MINUTES 追赶，对每只宠物调用 applyTimeDecay。
 *
 * 每只宠物使用各自的 personality.hungerDecayModifier；
 * 找不到 personality 配置则回退为 1。
 */
export function applyOfflineDecay(save: SaveData): void {
  const now = Date.now()
  const lastTick = new Date(save.timestamps.lastTickAt).getTime()
  const elapsedMinutes = (now - lastTick) / 60000

  if (elapsedMinutes <= 0) return

  const cappedMinutes = Math.min(elapsedMinutes, MAX_OFFLINE_MINUTES)
  const hours = cappedMinutes / 60

  for (const pet of save.pets) {
    const pConfig = getPersonality(pet.personality)
    const modifier = pConfig?.hungerDecayModifier ?? 1
    applyTimeDecay(pet.status, hours, modifier)
  }

  save.timestamps.lastTickAt = new Date().toISOString()
}
