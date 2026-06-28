/**
 * 物品目录 — 商店中可购买的物品定义
 *
 * 所有物品效果定义在此集中管理，方便调平衡。
 * 价格对标每日约 4 小时专注（无 streak ~170 金币），确保基础维护可行、高端物品有储蓄感。
 */

import type { ShopItem } from '../types'

export const SHOP_ITEMS: ShopItem[] = [
  // ---- 食物（food） ----
  {
    id: 'basic_food',
    name: '简单饲料',
    nameEn: 'Basic Food',
    category: 'food',
    price: 6,
    rarity: 'common',
    tags: ['basic', 'staple'],
    effect: { hunger: 30 },
  },
  {
    id: 'premium_food',
    name: '高级饲料',
    nameEn: 'Premium Food',
    category: 'food',
    price: 36,
    rarity: 'rare',
    tags: ['premium'],
    effect: { hunger: 55, mood: 5 },
  },
  {
    id: 'organic_food',
    name: '有机饲料',
    nameEn: 'Organic Food',
    category: 'food',
    price: 60,
    rarity: 'epic',
    tags: ['organic', 'healthy'],
    effect: { hunger: 50, health: 10, growthPoints: 5 },
  },
  {
    id: 'fish',
    name: '鲜鱼',
    nameEn: 'Fresh Fish',
    category: 'food',
    price: 28,
    rarity: 'common',
    tags: ['fresh', 'protein'],
    effect: { hunger: 40, mood: 8 },
  },

  // ---- 零食（snack） ----
  {
    id: 'cookie',
    name: '小饼干',
    nameEn: 'Cookie',
    category: 'snack',
    price: 14,
    rarity: 'common',
    tags: ['sweet', 'treat'],
    effect: { hunger: 10, mood: 15 },
  },
  {
    id: 'candy',
    name: '糖果',
    nameEn: 'Candy',
    category: 'snack',
    price: 10,
    rarity: 'common',
    tags: ['sweet', 'tiny'],
    effect: { hunger: 5, mood: 12, energy: 5 },
  },
  {
    id: 'fruit_snack',
    name: '水果零食',
    nameEn: 'Fruit Snack',
    category: 'snack',
    price: 18,
    rarity: 'common',
    tags: ['fruit', 'healthy'],
    effect: { hunger: 8, mood: 10, health: 5 },
  },
  {
    id: 'cake',
    name: '蛋糕',
    nameEn: 'Cake',
    category: 'snack',
    price: 45,
    rarity: 'rare',
    tags: ['sweet', 'celebration'],
    effect: { hunger: 15, mood: 25, bond: 3 },
  },

  // ---- 玩具（toy） ----
  {
    id: 'ball',
    name: '小球',
    nameEn: 'Ball',
    category: 'toy',
    price: 25,
    rarity: 'common',
    tags: ['active', 'classic'],
    effect: { boredom: -25, mood: 10, energy: -5 },
  },
  {
    id: 'yarn',
    name: '毛线球',
    nameEn: 'Yarn Ball',
    category: 'toy',
    price: 30,
    rarity: 'common',
    tags: ['playful', 'classic'],
    effect: { boredom: -20, mood: 15, bond: 3 },
  },
  {
    id: 'feather_wand',
    name: '逗猫棒',
    nameEn: 'Feather Wand',
    category: 'toy',
    price: 55,
    rarity: 'rare',
    tags: ['interactive', 'bonding'],
    effect: { boredom: -30, mood: 15, bond: 5, energy: -8 },
  },
  {
    id: 'puzzle',
    name: '益智玩具',
    nameEn: 'Puzzle Toy',
    category: 'toy',
    price: 90,
    rarity: 'epic',
    tags: ['smart', 'growth'],
    effect: { boredom: -35, mood: 10, growthPoints: 8, energy: -10 },
  },
]

/** 根据 ID 查找物品 */
export function getShopItem(id: string): ShopItem | undefined {
  return SHOP_ITEMS.find(item => item.id === id)
}

/** 按分类筛选物品 */
export function getItemsByCategory(category: string): ShopItem[] {
  return SHOP_ITEMS.filter(item => item.category === category)
}
