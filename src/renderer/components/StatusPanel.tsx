import type { PetInstance, EconomyState, UserProfile } from '@shared/types'

interface Props {
  pet: PetInstance
  economy: EconomyState
  user: UserProfile
  lang: 'zh' | 'en'
}

const PERSONALITY_LABELS: Record<string, { zh: string; en: string }> = {
  clingy: { zh: '黏人型', en: 'Clingy' },
  proud: { zh: '傲娇型', en: 'Proud' },
  lazy: { zh: '懒散型', en: 'Lazy' },
  hardworking: { zh: '努力型', en: 'Hardworking' },
  greedy: { zh: '贪吃型', en: 'Greedy' },
}

interface StatBarProps {
  label: string
  value: number
  color: string
}

function StatBar({ label, value, color }: StatBarProps) {
  return (
    <div className="stat-bar-row">
      <span className="stat-bar-label">{label}</span>
      <div className="stat-bar-track">
        <div
          className="stat-bar-fill"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="stat-bar-value">{Math.round(value)}</span>
    </div>
  )
}

export default function StatusPanel({ pet, economy, user, lang }: Props) {
  const s = pet.status
  const p = PERSONALITY_LABELS[pet.personality] ?? { zh: pet.personality, en: pet.personality }
  const growthLabel = pet.growth.stage === 'baby' ? '幼年' : pet.growth.stage === 'child' ? '少年' : '成年'

  return (
    <div className="status-panel">
      {/* 宠物基本信息 */}
      <div className="sp-pet-info">
        <div className="sp-pet-name">
          {pet.name} <span className="sp-pet-species">({pet.speciesId})</span>
        </div>
        <div className="sp-pet-meta">
          {lang === 'zh' ? `性格：${p.zh}` : `Personality: ${p.en}`}
          {' · '}
          {lang === 'zh' ? `阶段：${growthLabel}` : `Stage: ${pet.growth.stage}`}
        </div>
      </div>

      {/* 状态条 */}
      <div className="sp-stats">
        <StatBar label={lang === 'zh' ? '饥饿' : 'Hunger'} value={s.hunger} color="#f59e0b" />
        <StatBar label={lang === 'zh' ? '清洁' : 'Clean'} value={s.cleanliness} color="#3b82f6" />
        <StatBar label={lang === 'zh' ? '心情' : 'Mood'} value={s.mood} color="#ec4899" />
        <StatBar label={lang === 'zh' ? '精力' : 'Energy'} value={s.energy} color="#10b981" />
        <StatBar label={lang === 'zh' ? '健康' : 'Health'} value={s.health} color="#ef4444" />
        <StatBar label={lang === 'zh' ? '无聊' : 'Boredom'} value={100 - s.boredom} color="#8b5cf6" />
        <StatBar label={lang === 'zh' ? '亲密度' : 'Bond'} value={s.bond} color="#f472b6" />
      </div>

      {/* 经济信息 */}
      <div className="sp-economy">
        <div className="sp-eco-item">
          💰 {economy.coins} {lang === 'zh' ? '金币' : 'coins'}
        </div>
        <div className="sp-eco-item">
          📅 {lang === 'zh' ? `连续 ${user.currentStreakDays} 天` : `${user.currentStreakDays} day streak`}
        </div>
        <div className="sp-eco-item">
          ⏱️ {lang === 'zh' ? `累计 ${user.totalFocusMinutes} 分钟` : `${user.totalFocusMinutes} min total`}
        </div>
      </div>
    </div>
  )
}
