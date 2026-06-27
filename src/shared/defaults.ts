import type { SaveData, AppSettings } from './types'
import { SAVE_VERSION } from './constants'

/** 生成唯一 ID */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

/** 默认应用设置 */
export function createDefaultSettings(): AppSettings {
  return {
    language: 'zh',
    alwaysOnTop: true,
    startOnBoot: false,
    enableNotifications: true,
    petWindowPosition: { x: -1, y: -1 }, // -1 表示让窗口管理器自动定位
    petWindowScale: 1,
    tickIntervalSeconds: 60,
    idleBehavior: 'talk',
  }
}

/** 创建一份全新的初始存档 */
export function createDefaultSaveData(): SaveData {
  const now = new Date().toISOString()
  return {
    version: SAVE_VERSION,
    user: {
      id: generateId(),
      startedAt: now,
      totalFocusMinutes: 0,
      currentStreakDays: 0,
      longestStreakDays: 0,
    },
    economy: {
      coins: 50, // 初始赠送 50 金币，让新用户能立刻体验喂食
      lifetimeCoinsEarned: 50,
      lifetimeCoinsSpent: 0,
    },
    pets: [],
    activePetId: '',
    inventory: {
      items: [
        { itemId: 'basic_food', quantity: 3, acquiredAt: now },
      ],
    },
    focus: {
      today: { date: todayDateString(), completedMinutes: 0, sessionsCompleted: 0, coinsEarned: 0 },
      history: [],
    },
    settings: createDefaultSettings(),
    timestamps: {
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
      lastTickAt: now,
    },
  }
}

/** 获取今天的日期字符串 YYYY-MM-DD */
export function todayDateString(): string {
  return new Date().toISOString().slice(0, 10)
}
