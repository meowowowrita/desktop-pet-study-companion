import type { PersonalityConfig } from '../types'

/**
 * 宠物性格配置
 *
 * 每种性格有不同的衰减倍率和对话风格。
 */
export const PERSONALITIES: PersonalityConfig[] = [
  {
    id: 'clingy',
    name: '黏人型',
    nameEn: 'Clingy',
    description: '更需要陪伴，长时间不互动心情下降更快',
    hungerDecayModifier: 1.0,
    moodDecayModifier: 1.3,
    boredomGainModifier: 1.2,
    favoriteItemTags: ['plush', 'snack'],
    dialogueStyle: 'soft',
  },
  {
    id: 'proud',
    name: '傲娇型',
    nameEn: 'Proud',
    description: '对话更嘴硬，但亲密度高后反馈更明显',
    hungerDecayModifier: 0.9,
    moodDecayModifier: 1.0,
    boredomGainModifier: 1.0,
    favoriteItemTags: ['luxury', 'gem'],
    dialogueStyle: 'proud',
  },
  {
    id: 'lazy',
    name: '懒散型',
    nameEn: 'Lazy',
    description: '精力恢复快，但学习陪伴反馈较慢',
    hungerDecayModifier: 0.7,
    moodDecayModifier: 0.8,
    boredomGainModifier: 0.6,
    favoriteItemTags: ['snack', 'plush'],
    dialogueStyle: 'lazy',
  },
  {
    id: 'hardworking',
    name: '努力型',
    nameEn: 'Hardworking',
    description: '用户学习后心情提升更多',
    hungerDecayModifier: 1.0,
    moodDecayModifier: 0.8,
    boredomGainModifier: 0.8,
    favoriteItemTags: ['book', 'puzzle'],
    dialogueStyle: 'energetic',
  },
  {
    id: 'greedy',
    name: '贪吃型',
    nameEn: 'Greedy',
    description: '食物效果更明显，但饥饿下降更快',
    hungerDecayModifier: 1.5,
    moodDecayModifier: 0.9,
    boredomGainModifier: 1.0,
    favoriteItemTags: ['food', 'snack'],
    dialogueStyle: 'greedy',
  },
]

/** 按 id 查找 */
export function getPersonality(id: string): PersonalityConfig | undefined {
  return PERSONALITIES.find(p => p.id === id)
}
