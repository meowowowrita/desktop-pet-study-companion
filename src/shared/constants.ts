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

/** 专注奖励 */
export const FOCUS_COINS_PER_MINUTE = 1
export const FOCUS_COMPLETION_BONUS_MINUTES = 25
export const FOCUS_COMPLETION_BONUS_COINS = 5

/** 连续学习倍率 */
export const STREAK_MULTIPLIERS = [
  { maxDays: 2, multiplier: 1.0 },
  { maxDays: 6, multiplier: 1.1 },
  { maxDays: 13, multiplier: 1.2 },
  { maxDays: Infinity, multiplier: 1.3 },
]

/** 每日收益上限 */
export const DAILY_EARN_LIMITS = [
  { maxMinutes: 120, rate: 1.0 },
  { maxMinutes: 240, rate: 0.5 },
  { maxMinutes: Infinity, rate: 0.2 },
]

/** 自动保存间隔（秒） */
export const AUTO_SAVE_INTERVAL_SECONDS = 30

/** 备份存档份数 */
export const MAX_BACKUP_COUNT = 3

/** 窗口默认尺寸 */
export const PET_WINDOW_SIZE = { width: 220, height: 260 }
export const CONTROL_PANEL_SIZE = { width: 420, height: 560 }
