/**
 * 宠物工厂 — 创建新宠物实例
 */

import type { PetInstance, PetStatus, PetGrowth, SpeciesConfig } from '../types'
import { generateId } from '../defaults'

/** 新手初始名称池 */
const STARTER_NAMES: Record<string, string[]> = {
  frog: ['小跳跳', '呱呱', '绿泡泡'],
  bunny: ['小团团', '蹦蹦', '棉花糖'],
  cat: ['小咪', '毛球', '花花'],
  dog: ['旺财', '豆豆', '小汪'],
  chick: ['小叽', '蛋黄', '啾啾'],
  hamster: ['团子', '滚滚', '小胖'],
}

/** 创建全新的宠物初始状态 */
function createInitialStatus(): PetStatus {
  return {
    hunger: 80,
    cleanliness: 80,
    mood: 75,
    energy: 70,
    health: 100,
    boredom: 30,
    bond: 10,
    poopCount: 0,
  }
}

/** 创建初始成长状态 */
function createInitialGrowth(): PetGrowth {
  return {
    stage: 'baby',
    growthPoints: 0,
    ageDays: 0,
  }
}

/**
 * 创建一只新宠物
 *
 * @param species — 宠物种类配置
 * @param personalityId — 性格（不传则从种类的性格池里随机选）
 * @param customName — 自定义名字（不传则从名字池随机选）
 */
export function createPet(
  species: SpeciesConfig,
  personalityId?: string,
  customName?: string,
): PetInstance {
  // 性格：随机从种类的性格池选
  const pool = species.defaultPersonalityPool
  const personality = (personalityId ?? pool[Math.floor(Math.random() * pool.length)])

  // 名字
  const names = STARTER_NAMES[species.id] ?? [species.name]
  const name = customName ?? names[Math.floor(Math.random() * names.length)]

  return {
    id: generateId(),
    speciesId: species.id,
    name,
    personality: personality as PetInstance['personality'],
    status: createInitialStatus(),
    growth: createInitialGrowth(),
    ownership: {
      obtainedAt: new Date().toISOString(),
      source: 'starter',
      isStarter: true,
    },
    preferences: {},
    currentOutfitIds: [],
  }
}
