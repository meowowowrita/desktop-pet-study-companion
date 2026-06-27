import { useState, useEffect, useRef } from 'react'
import type { SaveData, FocusType, FocusSession } from '@shared/types'
import { generateId } from '@shared/defaults'
import { calcFocusReward } from '@shared/game/focus'

interface Props {
  save: SaveData
  onSave: (s: SaveData) => void
}

const DURATIONS = [5, 15, 25, 45, 60]
const TYPES: { id: FocusType; label: string; labelEn: string; icon: string }[] = [
  { id: 'study', label: '学习', labelEn: 'Study', icon: '📚' },
  { id: 'work', label: '工作', labelEn: 'Work', icon: '💼' },
  { id: 'lecture', label: '听课', labelEn: 'Lecture', icon: '🎧' },
  { id: 'reading', label: '阅读', labelEn: 'Reading', icon: '📖' },
]

export default function FocusTimer({ save, onSave }: Props) {
  const lang = save.settings.language
  const session = save.focus.activeSession

  const [type, setType] = useState<FocusType>('study')
  const [duration, setDuration] = useState(25)
  const [remaining, setRemaining] = useState(session?.plannedMinutes ?? 25)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // 计算剩余秒数显示
  const displayMin = Math.floor(remaining / 60)
  const displaySec = remaining % 60
  const isRunning = session?.status === 'running'
  const isPaused = session?.status === 'paused'

  // 定时器
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setRemaining(prev => {
          if (prev <= 1) {
            // 计时完成！
            clearInterval(intervalRef.current!)
            completeSession()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isRunning])

  /** 开始计时 */
  const start = () => {
    const newSession: FocusSession = {
      id: generateId(),
      type,
      plannedMinutes: duration,
      startedAt: new Date().toISOString(),
      totalPausedSeconds: 0,
      status: 'running',
    }
    save.focus.activeSession = newSession
    setRemaining(duration * 60)
    onSave({ ...save })
  }

  /** 暂停 */
  const pause = () => {
    if (!session) return
    session.status = 'paused'
    session.pausedAt = new Date().toISOString()
    onSave({ ...save })
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  /** 继续 */
  const resume = () => {
    if (!session) return
    session.status = 'running'
    if (session.pausedAt) {
      session.totalPausedSeconds +=
        (Date.now() - new Date(session.pausedAt).getTime()) / 1000
      session.pausedAt = undefined
    }
    onSave({ ...save })
  }

  /** 放弃 */
  const cancel = () => {
    if (!session) return
    session.status = 'cancelled'
    save.focus.activeSession = undefined
    setRemaining(duration * 60)
    onSave({ ...save })
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  /** 完成计时 */
  const completeSession = () => {
    if (!session) return
    session.status = 'completed'

    const reward = calcFocusReward(session.plannedMinutes, save.user.currentStreakDays, save.focus.today.completedMinutes)
    save.economy.coins += reward.coins
    save.economy.lifetimeCoinsEarned += reward.coins
    save.user.totalFocusMinutes += session.plannedMinutes
    save.focus.today.completedMinutes += session.plannedMinutes
    save.focus.today.sessionsCompleted += 1
    save.focus.today.coinsEarned += reward.coins

    // 保存历史
    save.focus.history.push({ ...save.focus.today })

    // 成长点
    const pet = save.pets.find(p => p.id === save.activePetId)
    if (pet) {
      pet.growth.growthPoints += (session.plannedMinutes >= 25 ? 8 : 2)
    }

    save.focus.activeSession = undefined
    onSave({ ...save })

    // 通知
    window.petApi.notify(
      lang === 'zh' ? '专注完成！' : 'Focus Complete!',
      lang === 'zh'
        ? `获得 ${reward.coins} 金币！`
        : `Earned ${reward.coins} coins!`,
    )
  }

  return (
    <div className="focus-timer">
      {!session || session.status === 'cancelled' || session.status === 'completed' ? (
        <>
          {/* 设置界面 */}
          <div className="ft-setup">
            <h3>{lang === 'zh' ? '选择任务类型' : 'Task Type'}</h3>
            <div className="ft-types">
              {TYPES.map(t => (
                <button
                  key={t.id}
                  className={`ft-type-btn ${type === t.id ? 'active' : ''}`}
                  onClick={() => setType(t.id)}
                >
                  {t.icon} {lang === 'zh' ? t.label : t.labelEn}
                </button>
              ))}
            </div>

            <h3>{lang === 'zh' ? '选择时长（分钟）' : 'Duration (min)'}</h3>
            <div className="ft-durations">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  className={`ft-dur-btn ${duration === d ? 'active' : ''}`}
                  onClick={() => { setDuration(d); setRemaining(d * 60) }}
                >
                  {d}
                </button>
              ))}
            </div>

            <button className="ft-start-btn" onClick={start}>
              {lang === 'zh' ? '开始专注' : 'Start Focus'}
            </button>
          </div>

          {/* 今日统计 */}
          <div className="ft-today">
            <h3>{lang === 'zh' ? '今日统计' : 'Today'}</h3>
            <p>{lang === 'zh'
              ? `已完成 ${save.focus.today.completedMinutes} 分钟 · ${save.focus.today.sessionsCompleted} 次 · +${save.focus.today.coinsEarned} 金币`
              : `${save.focus.today.completedMinutes} min · ${save.focus.today.sessionsCompleted} sessions · +${save.focus.today.coinsEarned} coins`
            }</p>
          </div>
        </>
      ) : (
        <>
          {/* 计时中界面 */}
          <div className="ft-running">
            <div className="ft-timer-display">
              {String(displayMin).padStart(2, '0')}:{String(displaySec).padStart(2, '0')}
            </div>
            <p className="ft-timer-label">
              {TYPES.find(t => t.id === session.type)?.icon}{' '}
              {lang === 'zh'
                ? `${TYPES.find(t => t.id === session.type)?.label} · ${session.plannedMinutes} 分钟`
                : `${TYPES.find(t => t.id === session.type)?.labelEn} · ${session.plannedMinutes} min`
              }
            </p>
            <div className="ft-actions">
              {isRunning ? (
                <button className="ft-btn ft-pause" onClick={pause}>
                  ⏸️ {lang === 'zh' ? '暂停' : 'Pause'}
                </button>
              ) : (
                <button className="ft-btn ft-resume" onClick={resume}>
                  ▶️ {lang === 'zh' ? '继续' : 'Resume'}
                </button>
              )}
              <button className="ft-btn ft-cancel" onClick={cancel}>
                ❌ {lang === 'zh' ? '放弃' : 'Cancel'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
