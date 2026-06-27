import { useState, useCallback } from 'react'
import type { SaveData } from '@shared/types'
import StatusPanel from '../components/StatusPanel'
import FocusTimer from '../components/FocusTimer'

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

  const persist = useCallback((newSave: SaveData) => {
    onUpdateSave(newSave)
    window.petApi.updateSave(newSave)
  }, [onUpdateSave])

  return (
    <div className="control-panel">
      {/* 顶部标题栏 */}
      <header className="cp-header">
        <h1>{lang === 'zh' ? '🎓 学习伴侣' : '🎓 Study Buddy'}</h1>
        <div className="cp-header-coins">
          💰 {save.economy.coins}
        </div>
      </header>

      {/* 标签页导航 */}
      <nav className="cp-tabs">
        {TABS.map(t => (
          <button
            key={t.id}
            className={`cp-tab ${tab === t.id ? 'active' : ''}`}
            onClick={() => setTab(t.id)}
          >
            <span className="cp-tab-icon">{t.icon}</span>
            <span>{lang === 'zh' ? t.label : t.labelEn}</span>
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
          <div className="cp-placeholder">
            <p>🛒 {lang === 'zh' ? '商店 — 即将开放' : 'Shop — Coming soon'}</p>
          </div>
        )}
        {tab === 'inventory' && (
          <div className="cp-placeholder">
            <p>🎒 {lang === 'zh' ? '背包 — 即将开放' : 'Bag — Coming soon'}</p>
          </div>
        )}
        {tab === 'settings' && (
          <div className="cp-placeholder">
            <p>⚙️ {lang === 'zh' ? '设置 — 即将开放' : 'Settings — Coming soon'}</p>
          </div>
        )}
      </main>
    </div>
  )
}
