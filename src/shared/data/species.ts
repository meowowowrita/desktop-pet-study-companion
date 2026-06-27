import type { SpeciesConfig } from '../types'

/**
 * 宠物种类配置
 *
 * 每只宠物有不同的稀有度、价格、喜欢的食物/玩具标签。
 * 后期扩展只需要在这里加条目即可。
 */
export const SPECIES: SpeciesConfig[] = [
  // ====== 普通 ======
  {
    id: 'frog',
    name: '小青蛙',
    nameEn: 'Frog',
    rarity: 'common',
    basePrice: 0, // 新手免费
    defaultPersonalityPool: ['clingy', 'hardworking', 'lazy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['vegetable', 'bug'],
    favoriteToyTags: ['ball', 'water'],
    assetKey: 'frog',
  },
  {
    id: 'bunny',
    name: '小兔子',
    nameEn: 'Bunny',
    rarity: 'common',
    basePrice: 0,
    defaultPersonalityPool: ['clingy', 'lazy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['vegetable', 'fruit'],
    favoriteToyTags: ['ball', 'plush'],
    assetKey: 'bunny',
  },
  {
    id: 'cat',
    name: '小猫',
    nameEn: 'Cat',
    rarity: 'common',
    basePrice: 0,
    defaultPersonalityPool: ['proud', 'clingy', 'greedy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['fish', 'meat'],
    favoriteToyTags: ['ball', 'string'],
    assetKey: 'cat',
  },
  {
    id: 'dog',
    name: '小狗',
    nameEn: 'Dog',
    rarity: 'common',
    basePrice: 0,
    defaultPersonalityPool: ['clingy', 'hardworking', 'greedy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['meat', 'bone'],
    favoriteToyTags: ['ball', 'rope'],
    assetKey: 'dog',
  },
  {
    id: 'chick',
    name: '小鸡',
    nameEn: 'Chick',
    rarity: 'common',
    basePrice: 0,
    defaultPersonalityPool: ['clingy', 'lazy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['seed', 'bug'],
    favoriteToyTags: ['bell', 'mirror'],
    canProduce: 'egg',
    assetKey: 'chick',
  },
  {
    id: 'hamster',
    name: '小仓鼠',
    nameEn: 'Hamster',
    rarity: 'common',
    basePrice: 0,
    defaultPersonalityPool: ['greedy', 'lazy', 'clingy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['seed', 'fruit'],
    favoriteToyTags: ['wheel', 'ball'],
    assetKey: 'hamster',
  },

  // ====== 稀有 ======
  {
    id: 'fox',
    name: '小狐狸',
    nameEn: 'Fox',
    rarity: 'rare',
    basePrice: 1500,
    defaultPersonalityPool: ['proud', 'hardworking'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['meat', 'fruit'],
    favoriteToyTags: ['ball', 'puzzle'],
    assetKey: 'fox',
  },
  {
    id: 'panda',
    name: '小熊猫',
    nameEn: 'Panda',
    rarity: 'rare',
    basePrice: 1800,
    defaultPersonalityPool: ['lazy', 'greedy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['vegetable', 'fruit'],
    favoriteToyTags: ['ball', 'plush'],
    assetKey: 'panda',
  },
  {
    id: 'deer',
    name: '小鹿',
    nameEn: 'Deer',
    rarity: 'rare',
    basePrice: 1600,
    defaultPersonalityPool: ['hardworking', 'clingy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['vegetable', 'grass'],
    favoriteToyTags: ['bell', 'mirror'],
    assetKey: 'deer',
  },
  {
    id: 'penguin',
    name: '小企鹅',
    nameEn: 'Penguin',
    rarity: 'rare',
    basePrice: 1700,
    defaultPersonalityPool: ['clingy', 'lazy', 'hardworking'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['fish'],
    favoriteToyTags: ['water', 'ball'],
    assetKey: 'penguin',
  },

  // ====== 史诗 ======
  {
    id: 'alpaca',
    name: '羊驼',
    nameEn: 'Alpaca',
    rarity: 'epic',
    basePrice: 3500,
    defaultPersonalityPool: ['proud', 'lazy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['grass', 'vegetable'],
    favoriteToyTags: ['plush', 'ball'],
    canProduce: 'wool',
    assetKey: 'alpaca',
  },
  {
    id: 'dragon',
    name: '小龙',
    nameEn: 'Dragon',
    rarity: 'epic',
    basePrice: 4000,
    defaultPersonalityPool: ['proud', 'hardworking'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['meat', 'gem'],
    favoriteToyTags: ['puzzle', 'ball'],
    assetKey: 'dragon',
  },
  {
    id: 'snow_leopard',
    name: '雪豹',
    nameEn: 'Snow Leopard',
    rarity: 'epic',
    basePrice: 3800,
    defaultPersonalityPool: ['proud', 'hardworking', 'clingy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['meat', 'fish'],
    favoriteToyTags: ['ball', 'rope'],
    assetKey: 'snow_leopard',
  },

  // ====== 传说 ======
  {
    id: 'phoenix',
    name: '凤凰',
    nameEn: 'Phoenix',
    rarity: 'legendary',
    basePrice: 8000,
    defaultPersonalityPool: ['proud', 'hardworking'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['gem', 'fruit'],
    favoriteToyTags: ['mirror', 'bell'],
    assetKey: 'phoenix',
  },
  {
    id: 'unicorn',
    name: '独角兽',
    nameEn: 'Unicorn',
    rarity: 'legendary',
    basePrice: 8500,
    defaultPersonalityPool: ['hardworking', 'clingy'],
    growthStages: [
      { stage: 'baby', minGrowthPoints: 0, spritePath: 'baby', scale: 0.7 },
      { stage: 'child', minGrowthPoints: 100, spritePath: 'child', scale: 0.85 },
      { stage: 'adult', minGrowthPoints: 300, spritePath: 'adult', scale: 1.0 },
    ],
    favoriteFoodTags: ['fruit', 'gem'],
    favoriteToyTags: ['mirror', 'bell'],
    assetKey: 'unicorn',
  },
]

/** 按 id 查找种类 */
export function getSpecies(id: string): SpeciesConfig | undefined {
  return SPECIES.find(s => s.id === id)
}

/** 获取所有普通种类（新手初始抽奖池） */
export function getCommonSpecies(): SpeciesConfig[] {
  return SPECIES.filter(s => s.rarity === 'common')
}
