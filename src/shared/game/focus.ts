/**
 * 专注计时器 — 金币结算逻辑
 */

import { FOCUS_COINS_PER_MINUTE, FOCUS_COMPLETION_BONUS_MINUTES, FOCUS_COMPLETION_BONUS_COINS } from '../constants'

export interface FocusReward {
  coins: number
  baseCoins: number
  completionBonus: number
  streakMultiplier: number
  dailyCapRate: number
}

/**
 * 计算完成专注任务后的金币奖励
 *
 * @param completedMinutes — 实际完成的分钟数
 * @param streakDays — 当前连续学习天数
 * @param todayCompletedMinutes — 今日已完成总分钟数（用于计算每日上限）
 */
export function calcFocusReward(
  completedMinutes: number,
  streakDays: number,
  todayCompletedMinutes: number,
): FocusReward {
  // 基础收益
  const baseCoins = completedMinutes * FOCUS_COINS_PER_MINUTE

  // 完成奖励（25 分钟以上才有）
  const completionBonus = completedMinutes >= FOCUS_COMPLETION_BONUS_MINUTES
    ? FOCUS_COMPLETION_BONUS_COINS
    : 0

  // 连续天数倍率
  let streakMultiplier = 1.0
  if (streakDays >= 14) streakMultiplier = 1.3
  else if (streakDays >= 7) streakMultiplier = 1.2
  else if (streakDays >= 3) streakMultiplier = 1.1

  // 每日收益上限衰减
  let dailyCapRate = 1.0
  if (todayCompletedMinutes > 240) dailyCapRate = 0.2
  else if (todayCompletedMinutes > 120) dailyCapRate = 0.5

  const coins = Math.floor((baseCoins + completionBonus) * streakMultiplier * dailyCapRate)

  return { coins, baseCoins, completionBonus, streakMultiplier, dailyCapRate }
}
