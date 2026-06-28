import type { SaveData, AppSettings } from '@shared/types'

interface Props {
  save: SaveData
  onUpdateSave: (s: SaveData) => void
}

export default function SettingsPanel({ save, onUpdateSave }: Props) {
  const lang = save.settings.language

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    const newSave: SaveData = {
      ...save,
      settings: { ...save.settings, [key]: value },
    }
    onUpdateSave(newSave)
  }

  const handleAlwaysOnTop = async (flag: boolean) => {
    updateSetting('alwaysOnTop', flag)
    try {
      await window.petApi.setAlwaysOnTop(flag)
    } catch {
      // 如果 API 调用失败，设置已保存，下次启动会生效
    }
  }

  const label = (zh: string, en: string) => (lang === 'zh' ? zh : en)

  return (
    <div className="settings-panel">
      {/* 语言 */}
      <div className="stg-section">
        <div className="stg-row">
          <div className="stg-label">
            <span className="stg-title">{label('语言', 'Language')}</span>
            <span className="stg-desc">{label('切换界面语言', 'Switch interface language')}</span>
          </div>
          <div className="stg-toggle-group">
            <button
              className={`stg-toggle-btn ${lang === 'zh' ? 'active' : ''}`}
              onClick={() => updateSetting('language', 'zh')}
            >
              中文
            </button>
            <button
              className={`stg-toggle-btn ${lang === 'en' ? 'active' : ''}`}
              onClick={() => updateSetting('language', 'en')}
            >
              EN
            </button>
          </div>
        </div>
      </div>

      {/* 窗口置顶 */}
      <div className="stg-section">
        <div className="stg-row">
          <div className="stg-label">
            <span className="stg-title">{label('窗口置顶', 'Always on Top')}</span>
            <span className="stg-desc">
              {label('宠物窗口始终显示在最前', 'Keep pet window always on top')}
            </span>
          </div>
          <button
            className={`stg-switch ${save.settings.alwaysOnTop ? 'on' : 'off'}`}
            onClick={() => handleAlwaysOnTop(!save.settings.alwaysOnTop)}
          >
            <span className="stg-switch-knob" />
          </button>
        </div>
      </div>

      {/* 通知 */}
      <div className="stg-section">
        <div className="stg-row">
          <div className="stg-label">
            <span className="stg-title">{label('系统通知', 'Notifications')}</span>
            <span className="stg-desc">
              {label('学习提醒和宠物状态通知', 'Study reminders and pet status notifications')}
            </span>
          </div>
          <button
            className={`stg-switch ${save.settings.enableNotifications ? 'on' : 'off'}`}
            onClick={() => updateSetting('enableNotifications', !save.settings.enableNotifications)}
          >
            <span className="stg-switch-knob" />
          </button>
        </div>
      </div>

      {/* 空闲行为 */}
      <div className="stg-section">
        <div className="stg-label-block">
          <span className="stg-title">{label('空闲行为', 'Idle Behavior')}</span>
          <span className="stg-desc">
            {label('宠物在没有互动时的行为', 'How the pet behaves when idle')}
          </span>
        </div>
        <div className="stg-radio-group">
          {([
            { id: 'sleep' as const, zh: '😴 睡觉', en: '😴 Sleep' },
            { id: 'wander' as const, zh: '🚶 散步', en: '🚶 Wander' },
            { id: 'talk' as const, zh: '💬 说话', en: '💬 Talk' },
          ]).map(opt => (
            <button
              key={opt.id}
              className={`stg-radio-btn ${save.settings.idleBehavior === opt.id ? 'active' : ''}`}
              onClick={() => updateSetting('idleBehavior', opt.id)}
            >
              {lang === 'zh' ? opt.zh : opt.en}
            </button>
          ))}
        </div>
      </div>

      {/* 缩放 */}
      <div className="stg-section">
        <div className="stg-row">
          <div className="stg-label">
            <span className="stg-title">{label('宠物大小', 'Pet Scale')}</span>
            <span className="stg-desc">
              {lang === 'zh'
                ? `当前: ${save.settings.petWindowScale.toFixed(1)}x`
                : `Current: ${save.settings.petWindowScale.toFixed(1)}x`}
            </span>
          </div>
          <div className="stg-stepper">
            <button
              className="stg-step-btn"
              onClick={() => updateSetting('petWindowScale', Math.max(0.5, save.settings.petWindowScale - 0.1))}
              disabled={save.settings.petWindowScale <= 0.5}
            >
              −
            </button>
            <span className="stg-step-val">{save.settings.petWindowScale.toFixed(1)}</span>
            <button
              className="stg-step-btn"
              onClick={() => updateSetting('petWindowScale', Math.min(2.0, save.settings.petWindowScale + 0.1))}
              disabled={save.settings.petWindowScale >= 2.0}
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
