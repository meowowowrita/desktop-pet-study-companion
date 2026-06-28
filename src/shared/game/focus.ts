/**
 * 专注计时器 — 金币结算逻辑
 *
 * 典型日收益（无 streak，多个 session 累计 240 分钟）：
 *   约 170 金币左右（允许因 floor、session 大小和分布有细微差异）。
 *   300 分钟后收益明显下降（0.15 金币/分钟），鼓励维持约 4 小时专注。
 */

import {
  FOCUS_TIER_RATES,
  FOCUS_COMPLETION_BONUS_MINUTES,
  FOCUS_COMPLETION_BONUS_COINS,
  FOCUS_DAILY_TARGET_MINUTES,
  FOCUS_DAILY_TARGET_BONUS_COINS,
} from '../constants'

export interface FocusReward {
  coins: number
  /** 按分段费率累加的基础金币（已乘连续天数倍率前的值） */
  baseCoins: number
  /** session bonus + 首次达到每日目标 bonus */
  completionBonus: number
  streakMultiplier: number
  /** 保留字段，含义改为 effectiveRate，当前恒为 1（分段已内置衰减） */
  dailyCapRate: number
}

/**
 * 计算完成专注任务后的金币奖励
 *
 * 奖励由三部分构成：
 * 1. 分段基础金币：按今日累计分钟所在区间分别累加，不同区间费率不同
 * 2. 完成奖励：单次 >=25 分钟 +1，首次达到 240 分钟 +30
 * 3. 连续天数倍率：3-6 天 1.05x, 7-13 天 1.10x, 14+ 天 1.15x
 *
 * @param completedMinutes — 实际完成的分钟数
 * @param streakDays — 当前连续学习天数
 * @param todayCompletedMinutes — 今日已完成总分钟数（本次 session 开始前）
 */
export function calcFocusReward(
  completedMinutes: number,
  streakDays: number,
  todayCompletedMinutes: number,
): FocusReward {
  // ── 1. 分段基础收益 ──
  const sessionStart = todayCompletedMinutes
  const sessionEnd = todayCompletedMinutes + completedMinutes

  let baseCoins = 0
  for (const tier of FOCUS_TIER_RATES) {
    const overlapStart = Math.max(sessionStart, tier.startMinute)
    const overlapEnd = Math.min(sessionEnd, tier.endMinute)
    if (overlapStart < overlapEnd) {
      baseCoins += (overlapEnd - overlapStart) * tier.rate
    }
  }

  // ── 2. 完成奖励 ──
  let completionBonus = 0

  // 单次 session >= 25 分钟
  if (completedMinutes >= FOCUS_COMPLETION_BONUS_MINUTES) {
    completionBonus += FOCUS_COMPLETION_BONUS_COINS
  }

  // 首次达到每日目标（本次 session 使累计首次 >= 240 分钟）
  if (
    todayCompletedMinutes < FOCUS_DAILY_TARGET_MINUTES &&
    todayCompletedMinutes + completedMinutes >= FOCUS_DAILY_TARGET_MINUTES
  ) {
    completionBonus += FOCUS_DAILY_TARGET_BONUS_COINS
  }

  // ── 3. 连续天数倍率 ──
  let streakMultiplier = 1.0
  if (streakDays >= 14) streakMultiplier = 1.15
  else if (streakDays >= 7) streakMultiplier = 1.10
  else if (streakDays >= 3) streakMultiplier = 1.05

  // 分段费率已内置每日衰减，不再额外打折
  const dailyCapRate = 1.0

  const coins = Math.floor((baseCoins + completionBonus) * streakMultiplier * dailyCapRate)

  return { coins, baseCoins, completionBonus, streakMultiplier, dailyCapRate }
}
