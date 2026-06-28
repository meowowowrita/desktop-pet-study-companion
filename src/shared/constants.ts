// 常量配置 — 所有游戏数值集中管理，方便调平衡

/** 存档版本（每次改数据结构都要 +1） */
export const SAVE_VERSION = 1

/** 时间 tick 间隔（秒） */
export const TICK_INTERVAL_SECONDS = 60

/** 离线追赶上限（分钟） */
export const MAX_OFFLINE_MINUTES = 24 * 60

/** 每小时基础衰减值 */
export const DECAY_PER_HOUR = {
  hunger: 6,
  cleanliness: 4,
  energy: 3,
  boredom: 5,
}

/** 心情计算公式权重 */
export const MOOD_WEIGHTS = {
  hunger: 0.25,
  cleanliness: 0.20,
  health: 0.25,
  energy: 0.10,
  bond: 0.15,
  boredom: -0.20,
}

/** 喂养冷却 */
export const PLAY_COOLDOWN_MINUTES = 5

/** 排泄物 */
export const POOP_CHANCE_PER_HOUR = 0.08
export const POOP_MAX_COUNT = 5
export const POOP_CLEANLINESS_PENALTY = -2 // 每堆每小时额外降低清洁度

/** 成长 */
export const GROWTH_STAGES = {
  baby: { max: 99 },
  child: { min: 100, max: 299 },
  adult: { min: 300 },
} as const

/** ── 专注奖励 ── */

/** 分段费率：按今日累计分钟所在区间收取不同金币/分钟 */
export const FOCUS_TIER_RATES = [
  { startMinute: 0,   endMinute: 60,   rate: 0.25 },
  { startMinute: 60,  endMinute: 120,  rate: 0.45 },
  { startMinute: 120, endMinute: 240,  rate: 0.75 },
  { startMinute: 240, endMinute: 300,  rate: 0.50 },
  { startMinute: 300, endMinute: Infinity, rate: 0.15 },
]

/** 单次 session 完成奖励：至少专注 N 分钟才触发 */
export const FOCUS_COMPLETION_BONUS_MINUTES = 25
/** 单次 session 完成奖励金币（>= 25 分钟 +1） */
export const FOCUS_COMPLETION_BONUS_COINS = 1

/** 每日专注目标（分钟） */
export const FOCUS_DAILY_TARGET_MINUTES = 240
/** 首次达到每日目标奖励金币 */
export const FOCUS_DAILY_TARGET_BONUS_COINS = 30

/** 连续学习天数倍率（分段已内置衰减，连续倍率单独应用） */
export const STREAK_MULTIPLIERS = [
  { maxDays: 2,    multiplier: 1.0 },
  { maxDays: 6,    multiplier: 1.05 },
  { maxDays: 13,   multiplier: 1.10 },
  { maxDays: Infinity, multiplier: 1.15 },
]

/** 每日收益上限说明（已改用 FOCUS_TIER_RATES 分段费率，本常量仅作参考） */
export const DAILY_EARN_LIMITS = [
  { maxMinutes: 60,   rate: 0.25 },
  { maxMinutes: 120,  rate: 0.45 },
  { maxMinutes: 240,  rate: 0.75 },
  { maxMinutes: 300,  rate: 0.50 },
  { maxMinutes: Infinity, rate: 0.15 },
]

/** 自动保存间隔（秒） */
export const AUTO_SAVE_INTERVAL_SECONDS = 30

/** 备份存档份数 */
export const MAX_BACKUP_COUNT = 3

/** 窗口默认尺寸 */
export const PET_WINDOW_SIZE = { width: 220, height: 260 }
export const CONTROL_PANEL_SIZE = { width: 420, height: 560 }
