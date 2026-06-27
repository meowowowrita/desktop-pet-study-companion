// ============================================================
// 桌面宠物学习陪伴应用 — 全局数据类型定义
// 所有模块共享的 TypeScript 接口
// ============================================================

// ---- 存档 ----

export interface SaveData {
  version: number
  user: UserProfile
  economy: EconomyState
  pets: PetInstance[]
  activePetId: string
  inventory: InventoryState
  focus: FocusState
  settings: AppSettings
  timestamps: SaveTimestamps
}

export interface SaveTimestamps {
  createdAt: string
  updatedAt: string
  lastOpenedAt: string
  lastTickAt: string
}

// ---- 用户 ----

export interface UserProfile {
  id: string
  nickname?: string
  startedAt: string
  totalFocusMinutes: number
  currentStreakDays: number
  longestStreakDays: number
}

// ---- 经济 ----

export interface EconomyState {
  coins: number
  lifetimeCoinsEarned: number
  lifetimeCoinsSpent: number
}

// ---- 宠物种类 ----

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary'
export type GrowthStage = 'baby' | 'child' | 'adult'
export type PersonalityId = 'clingy' | 'proud' | 'lazy' | 'hardworking' | 'greedy'

export interface SpeciesConfig {
  id: string
  name: string
  nameEn: string
  rarity: Rarity
  basePrice: number
  defaultPersonalityPool: PersonalityId[]
  growthStages: GrowthStageConfig[]
  favoriteFoodTags: string[]
  favoriteToyTags: string[]
  canProduce?: 'egg' | 'wool' | 'none'
  assetKey: string
}

export interface GrowthStageConfig {
  stage: GrowthStage
  minGrowthPoints: number
  spritePath: string // 相对于 assets/pets/{species}/ 的路径
  scale: number
}

// ---- 宠物实例 ----

export interface PetInstance {
  id: string
  speciesId: string
  name: string
  personality: PersonalityId
  status: PetStatus
  growth: PetGrowth
  ownership: PetOwnership
  preferences: PetPreferences
  currentOutfitIds: string[]
}

export interface PetOwnership {
  obtainedAt: string
  source: 'starter' | 'shop' | 'event'
  isStarter: boolean
}

export interface PetPreferences {
  favoriteFoodId?: string
  favoriteToyId?: string
}

// ---- 宠物状态 ----

export interface PetStatus {
  hunger: number       // 0-100，越高越饱
  cleanliness: number  // 0-100，越高越干净
  mood: number         // 0-100，越高越开心
  energy: number       // 0-100，越高越精神
  health: number       // 0-100，越高越健康
  boredom: number      // 0-100，越高越无聊
  bond: number         // 0-100，越高越亲密
  poopCount: number    // 当前待清理排泄物数量
  lastFedAt?: string
  lastBathedAt?: string
  lastPlayedAt?: string
}

// ---- 宠物成长 ----

export interface PetGrowth {
  stage: GrowthStage
  growthPoints: number
  ageDays: number
}

// ---- 性格 ----

export interface PersonalityConfig {
  id: PersonalityId
  name: string
  nameEn: string
  description: string
  hungerDecayModifier: number
  moodDecayModifier: number
  boredomGainModifier: number
  favoriteItemTags: string[]
  dialogueStyle: 'soft' | 'proud' | 'lazy' | 'energetic' | 'greedy'
}

// ---- 物品 ----

export type ItemCategory = 'food' | 'snack' | 'toy' | 'outfit' | 'decoration' | 'pet' | 'seed'

export interface ShopItem {
  id: string
  name: string
  nameEn: string
  category: ItemCategory
  price: number
  rarity: Rarity
  tags: string[]
  effect: ItemEffect
  unlockCondition?: UnlockCondition
}

export interface ItemEffect {
  hunger?: number
  mood?: number
  cleanliness?: number
  energy?: number
  health?: number
  boredom?: number
  bond?: number
  growthPoints?: number
}

export interface UnlockCondition {
  minBond?: number
  minGrowthStage?: GrowthStage
  minStreakDays?: number
  requiredPetSpeciesId?: string
}

// ---- 背包 ----

export interface InventoryState {
  items: InventoryItem[]
}

export interface InventoryItem {
  itemId: string
  quantity: number
  acquiredAt: string
}

// ---- 专注计时 ----

export type FocusType = 'study' | 'work' | 'lecture' | 'reading'
export type FocusStatus = 'running' | 'paused' | 'completed' | 'cancelled'

export interface FocusState {
  activeSession?: FocusSession
  today: DailyFocusStats
  history: DailyFocusStats[]
}

export interface FocusSession {
  id: string
  type: FocusType
  plannedMinutes: number
  startedAt: string
  pausedAt?: string
  totalPausedSeconds: number
  status: FocusStatus
}

export interface DailyFocusStats {
  date: string
  completedMinutes: number
  sessionsCompleted: number
  coinsEarned: number
}

// ---- 对话 ----

export interface DialogueRule {
  id: string
  priority: number
  condition: DialogueCondition
  personality?: PersonalityId
  lines: string[]      // 中文台词
  linesEn?: string[]   // 英文台词
}

export interface DialogueCondition {
  hungerBelow?: number
  cleanlinessBelow?: number
  moodBelow?: number
  energyBelow?: number
  boredomAbove?: number
  bondAbove?: number
  poopCountAbove?: number
  justFinishedFocus?: boolean
  longTimeNoInteraction?: boolean
  growthStage?: GrowthStage
}

// ---- 设置 ----

export type IdleBehavior = 'sleep' | 'wander' | 'talk'

export interface AppSettings {
  language: 'zh' | 'en'
  alwaysOnTop: boolean
  startOnBoot: boolean
  enableNotifications: boolean
  petWindowPosition: { x: number; y: number }
  petWindowScale: number
  tickIntervalSeconds: number
  idleBehavior: IdleBehavior
}

// ---- 交互结果 ----

export interface InteractionResult {
  success: boolean
  message: string
  messageEn: string
  effects: ItemEffect
  petDialogue?: string
  petDialogueEn?: string
}
