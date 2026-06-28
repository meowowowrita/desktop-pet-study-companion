import { useState, useCallback } from 'react'
import type { SaveData } from '@shared/types'
import StatusPanel from '../components/StatusPanel'
import FocusTimer from '../components/FocusTimer'
import ShopPanel from '../components/ShopPanel'
import InventoryPanel from '../components/InventoryPanel'
import SettingsPanel from '../components/SettingsPanel'

interface Props {
  save: SaveData
  onUpdateSave: (s: SaveData) => void
}

type TabId = 'status' | 'focus' | 'shop' | 'inventory' | 'settings'

const TABS: { id: TabId; label: string; labelEn: string; icon: string }[] = [
  { id: 'status', label: '状态', labelEn: 'Status', icon: '📊' },
  { id: 'focus', label: '专注', labelEn: 'Focus', icon: '⏱️' },
  { id: 'shop', label: '商店', labelEn: 'Shop', icon: '🛒' },
  { id: 'inventory', label: '背包', labelEn: 'Bag', icon: '🎒' },
  { id: 'settings', label: '设置', labelEn: 'Settings', icon: '⚙️' },
]

export default function ControlPanel({ save, onUpdateSave }: Props) {
  const [tab, setTab] = useState<TabId>('status')
  const lang = save.settings.language
  const pet = save.pets.find(p => p.id === save.activePetId)
  const focusToday = save.focus.today.completedMinutes
  const streak = save.user.currentStreakDays

  const persist = useCallback((newSave: SaveData) => {
    onUpdateSave(newSave)
    window.petApi.updateSave(newSave)
  }, [onUpdateSave])

  return (
    <div className="control-panel">
      {/* 紧凑仪表盘头部 */}
      <header className="cp-dashboard">
        <div className="cp-dash-title">
          <span className="cp-dash-icon">🎓</span>
          <span className="cp-dash-name">
            {lang === 'zh' ? '学习伴侣' : 'Study Buddy'}
          </span>
        </div>
        <div className="cp-dash-stats">
          <span className="cp-stat-pill cp-stat-coins" title={lang === 'zh' ? '金币' : 'Coins'}>
            <span className="cp-stat-icon">💰</span>
            <span className="cp-stat-val">{save.economy.coins}</span>
          </span>
          {pet && (
            <span className="cp-stat-pill cp-stat-pet" title={lang === 'zh' ? '当前宠物' : 'Active Pet'}>
              <span className="cp-stat-icon">🐾</span>
              <span className="cp-stat-val">{pet.name}</span>
            </span>
          )}
          <span className="cp-stat-pill cp-stat-focus" title={lang === 'zh' ? '今日专注' : 'Today Focus'}>
            <span className="cp-stat-icon">⏱️</span>
            <span className="cp-stat-val">{focusToday}{lang === 'zh' ? '分' : 'm'}</span>
          </span>
          {streak > 0 && (
            <span className="cp-stat-pill cp-stat-streak" title={lang === 'zh' ? '连续天数' : 'Streak'}>
              <span className="cp-stat-icon">🔥</span>
              <span className="cp-stat-val">{streak}{lang === 'zh' ? '天' : 'd'}</span>
            </span>
          )}
        </div>
      </header>

      {/* 标签页导航 — 精简横向标签栏 */}
      <nav className="cp-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cp-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
            title={lang === 'zh' ? t.label : t.labelEn}
          >
            <span className="cp-tab-icon">{t.icon}</span>
            <span className="cp-tab-label">{lang === 'zh' ? t.label : t.labelEn}</span>
          </button>
        ))}
      </nav>

      {/* 标签页内容 */}
      <main className="cp-content">
        {tab === 'status' && pet && (
          <StatusPanel pet={pet} economy={save.economy} user={save.user} lang={lang} />
        )}
        {tab === 'focus' && (
          <FocusTimer save={save} onSave={persist} />
        )}
        {tab === 'shop' && (
          <ShopPanel save={save} onUpdateSave={persist} />
        )}
        {tab === 'inventory' && (
          <InventoryPanel save={save} onUpdateSave={persist} />
        )}
        {tab === 'settings' && (
          <SettingsPanel save={save} onUpdateSave={persist} />
        )}
      </main>
    </div>
  )
}
