/**
 * 宠物互动逻辑 — 纯函数，不依赖 Electron
 *
 * 每个函数输入当前状态，输出变化后的结果。
 * 所有函数都返回 InteractionResult，方便单元测试。
 */

import type { PetInstance, InteractionResult, ItemEffect, ShopItem } from '../types'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function now(): string {
  return new Date().toISOString()
}

/** 喂食 */
export function feedPet(pet: PetInstance, food: { itemId: string; effect: ItemEffect }): InteractionResult {
  const oldHunger = pet.status.hunger
  const newHunger = clamp(oldHunger + (food.effect.hunger ?? 30), 0, 100)

  pet.status.hunger = newHunger
  pet.status.lastFedAt = now()

  const moodBonus = food.effect.mood ?? (newHunger - oldHunger > 40 ? 5 : 0)
  pet.status.mood = clamp(pet.status.mood + moodBonus, 0, 100)

  return {
    success: true,
    message: `喂食成功！饥饿度 +${newHunger - oldHunger}`,
    messageEn: `Fed! Hunger +${newHunger - oldHunger}`,
    effects: { hunger: newHunger - oldHunger, mood: moodBonus },
    petDialogue: '好吃好吃~谢谢！',
    petDialogueEn: 'Yummy, thanks!',
  }
}

/** 洗澡 */
export function bathePet(pet: PetInstance): InteractionResult {
  const oldClean = pet.status.cleanliness
  const newClean = clamp(oldClean + 40, 0, 100)

  pet.status.cleanliness = newClean
  pet.status.lastBathedAt = now()

  // 某些性格不喜欢洗澡
  const moodChange = pet.personality === 'proud' ? 0 : 10
  pet.status.mood = clamp(pet.status.mood + moodChange, 0, 100)

  return {
    success: true,
    message: `洗澡完成！清洁度 +${newClean - oldClean}`,
    messageEn: `Bathed! Cleanliness +${newClean - oldClean}`,
    effects: { cleanliness: newClean - oldClean, mood: moodChange },
    petDialogue: pet.personality === 'proud'
      ? '哼…洗得还行吧'
      : '好舒服呀~干干净净！',
    petDialogueEn: pet.personality === 'proud'
      ? 'Hmph... acceptable.'
      : 'So clean and fresh!',
  }
}

/** 清理排泄物 */
export function cleanPet(pet: PetInstance): InteractionResult {
  const cleaned = Math.min(pet.status.poopCount, 1)
  pet.status.poopCount = Math.max(0, pet.status.poopCount - 1)
  pet.status.cleanliness = clamp(pet.status.cleanliness + 5, 0, 100)
  pet.status.bond = clamp(pet.status.bond + 1, 0, 100)

  return {
    success: true,
    message: `清理完成！`,
    messageEn: `Cleaned up!`,
    effects: { cleanliness: 5, bond: 1, poopCount: -cleaned },
    petDialogue: '谢谢你帮我清理~',
    petDialogueEn: 'Thanks for cleaning up!',
  }
}

/** 玩耍 */
export function playWithPet(pet: PetInstance): InteractionResult {
  // 冷却检查（5 分钟内不能重复玩）
  if (pet.status.lastPlayedAt) {
    const elapsed = (Date.now() - new Date(pet.status.lastPlayedAt).getTime()) / 1000 / 60
    if (elapsed < 5) {
      return {
        success: false,
        message: '刚才玩过了，休息一下吧',
        messageEn: 'We just played! Wait a bit.',
        effects: {},
        petDialogue: '我还有点累，等会儿再玩吧~',
        petDialogueEn: 'I\'m still tired, let\'s play later~',
      }
    }
  }

  pet.status.boredom = clamp(pet.status.boredom - 25, 0, 100)
  pet.status.mood = clamp(pet.status.mood + 15, 0, 100)
  pet.status.bond = clamp(pet.status.bond + 3, 0, 100)
  pet.status.lastPlayedAt = now()

  return {
    success: true,
    message: '玩得开心！',
    messageEn: 'Playtime!',
    effects: { boredom: -25, mood: 15, bond: 3 },
    petDialogue: '哈哈哈，好好玩！再来再来！',
    petDialogueEn: 'Haha, that was fun!',
  }
}

/** 应用时间衰减 */
export function applyTimeDecay(
  status: PetInstance['status'],
  hours: number,
  decayModifier: number = 1
): void {
  status.hunger = clamp(status.hunger - 6 * hours * decayModifier, 0, 100)
  status.cleanliness = clamp(status.cleanliness - 4 * hours, 0, 100)
  status.energy = clamp(status.energy - 3 * hours, 0, 100)
  status.boredom = clamp(status.boredom + 5 * hours * decayModifier, 0, 100)

  // 心情 = 综合状态加权
  const moodTarget =
    status.hunger * 0.25 +
    status.cleanliness * 0.20 +
    status.health * 0.25 +
    status.energy * 0.10 +
    status.bond * 0.15 -
    status.boredom * 0.20

  status.mood = clamp(status.mood * 0.7 + moodTarget * 0.3, 0, 100)

  // 健康变化
  if (status.hunger < 20) status.health = clamp(status.health - 2 * hours, 0, 100)
  if (status.cleanliness < 20) status.health = clamp(status.health - 1 * hours, 0, 100)
  if (status.hunger > 50 && status.cleanliness > 50) {
    status.health = clamp(status.health + 1 * hours, 0, 100)
  }

  // 排泄物概率
  if (Math.random() < 0.08 * hours) {
    status.poopCount = Math.min(status.poopCount + 1, 5)
  }
}
