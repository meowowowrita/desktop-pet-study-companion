/**
 * 背包 / 商店纯函数 — 不依赖 Electron
 *
 * buyItem:  购买物品，扣钱、增加/合并库存、更新 lifetimeCoinsSpent
 * useInventoryItem: 使用物品，应用效果到宠物状态、扣除库存
 */

import type { SaveData, PetInstance, InteractionResult } from '../types'
import { getShopItem } from '../data/items'
import { getSpecies } from '../data/species'
import { updateGrowthStage } from './lifecycle'

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v))
}

function now(): string {
  return new Date().toISOString()
}

/**
 * 购买物品
 * - 金币足够时扣钱、增加/合并 inventory.items、更新 lifetimeCoinsSpent
 * - 返回 InteractionResult 风格结果
 */
export function buyItem(
  save: SaveData,
  itemId: string,
): InteractionResult {
  const item = getShopItem(itemId)
  if (!item) {
    return {
      success: false,
      message: `物品不存在：${itemId}`,
      messageEn: `Item not found: ${itemId}`,
      effects: {},
    }
  }

  if (save.economy.coins < item.price) {
    return {
      success: false,
      message: `金币不足！需要 ${item.price}💰，当前 ${save.economy.coins}💰`,
      messageEn: `Not enough coins! Need ${item.price}💰, have ${save.economy.coins}💰`,
      effects: {},
    }
  }

  // 扣钱
  save.economy.coins -= item.price
  save.economy.lifetimeCoinsSpent += item.price

  // 合并库存
  const existing = save.inventory.items.find(i => i.itemId === itemId)
  if (existing) {
    existing.quantity += 1
  } else {
    save.inventory.items.push({
      itemId,
      quantity: 1,
      acquiredAt: now(),
    })
  }

  return {
    success: true,
    message: `购买成功！${item.name} ×1，花费 ${item.price}💰`,
    messageEn: `Purchased! ${item.nameEn} ×1, spent ${item.price}💰`,
    effects: {},
  }
}

/**
 * 使用背包物品
 * - 根据物品效果更新当前宠物状态、growthPoints
 * - 减少库存，数值 clamp 0-100
 * - 返回 InteractionResult 风格结果
 */
export function useInventoryItem(
  save: SaveData,
  petId: string,
  itemId: string,
): InteractionResult {
  const pet = save.pets.find(p => p.id === petId)
  if (!pet) {
    return {
      success: false,
      message: '宠物不存在',
      messageEn: 'Pet not found',
      effects: {},
    }
  }

  const item = getShopItem(itemId)
  if (!item) {
    return {
      success: false,
      message: `物品不存在：${itemId}`,
      messageEn: `Item not found: ${itemId}`,
      effects: {},
    }
  }

  const invEntry = save.inventory.items.find(i => i.itemId === itemId)
  if (!invEntry || invEntry.quantity <= 0) {
    return {
      success: false,
      message: `背包里没有 ${item.name}`,
      messageEn: `No ${item.nameEn} in bag`,
      effects: {},
    }
  }

  // 应用效果
  const e = item.effect
  const applied: typeof e = {}

  if (e.hunger !== undefined) {
    const old = pet.status.hunger
    pet.status.hunger = clamp(old + e.hunger, 0, 100)
    applied.hunger = pet.status.hunger - old
  }
  if (e.mood !== undefined) {
    const old = pet.status.mood
    pet.status.mood = clamp(old + e.mood, 0, 100)
    applied.mood = pet.status.mood - old
  }
  if (e.cleanliness !== undefined) {
    const old = pet.status.cleanliness
    pet.status.cleanliness = clamp(old + e.cleanliness, 0, 100)
    applied.cleanliness = pet.status.cleanliness - old
  }
  if (e.energy !== undefined) {
    const old = pet.status.energy
    pet.status.energy = clamp(old + e.energy, 0, 100)
    applied.energy = pet.status.energy - old
  }
  if (e.health !== undefined) {
    const old = pet.status.health
    pet.status.health = clamp(old + e.health, 0, 100)
    applied.health = pet.status.health - old
  }
  if (e.boredom !== undefined) {
    const old = pet.status.boredom
    pet.status.boredom = clamp(old + e.boredom, 0, 100)
    applied.boredom = pet.status.boredom - old
  }
  if (e.bond !== undefined) {
    const old = pet.status.bond
    pet.status.bond = clamp(old + e.bond, 0, 100)
    applied.bond = pet.status.bond - old
  }
  if (e.growthPoints !== undefined) {
    pet.growth.growthPoints += e.growthPoints
    applied.growthPoints = e.growthPoints
    // 检查并更新成长阶段
    const species = getSpecies(pet.speciesId)
    if (species) {
      updateGrowthStage(pet, species)
    }
  }

  // 记录最后喂食时间（food/snack 类）
  if (item.category === 'food' || item.category === 'snack') {
    pet.status.lastFedAt = now()
  }
  // 记录最后玩耍时间（toy 类）
  if (item.category === 'toy') {
    pet.status.lastPlayedAt = now()
  }

  // 减少库存
  invEntry.quantity -= 1
  if (invEntry.quantity <= 0) {
    save.inventory.items = save.inventory.items.filter(i => i.itemId !== itemId)
  }

  const petName = pet.name || 'Pet'

  return {
    success: true,
    message: `对 ${petName} 使用了 ${item.name}！`,
    messageEn: `Used ${item.nameEn} on ${petName}!`,
    effects: applied,
    petDialogue: getPetReaction(item.category, 'zh'),
    petDialogueEn: getPetReaction(item.category, 'en'),
  }
}

function getPetReaction(category: string, lang: 'zh' | 'en'): string {
  const reactions: Record<string, { zh: string; en: string }> = {
    food: { zh: '好吃好吃~谢谢！', en: 'Yummy, thanks!' },
    snack: { zh: '哇！零食！最喜欢了！', en: 'Wow! A treat! My favorite!' },
    toy: { zh: '哈哈哈，好好玩！再来再来！', en: 'Haha, that was fun!' },
  }
  return reactions[category]?.[lang] ?? ''
}
