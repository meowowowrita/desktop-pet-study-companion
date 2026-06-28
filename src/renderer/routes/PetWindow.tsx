import { useCallback, useState, useRef } from 'react'
import type { SaveData } from '@shared/types'
import PetSprite from '../components/PetSprite'
import DialogueBubble from '../components/DialogueBubble'
import QuickMenu from '../components/QuickMenu'

interface Props {
  save: SaveData
  onUpdateSave: (s: SaveData) => void
  onOpenPanel: () => void
}

export default function PetWindow({ save, onUpdateSave, onOpenPanel }: Props) {
  const pet = save.pets.find(p => p.id === save.activePetId)

  // 临时动作覆盖 — 用于 hover/click/drag/menu 触发的动画切换
  const [actionOverride, setActionOverride] = useState<string | null>(null)
  const actionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  /** 请求一个临时动作覆盖，durationMs 后自动清除 */
  const requestAction = useCallback((action: string, durationMs = 1500) => {
    setActionOverride(action)
    if (actionTimerRef.current) clearTimeout(actionTimerRef.current)
    actionTimerRef.current = setTimeout(() => setActionOverride(null), durationMs)
  }, [])

  /** 立即清除动作覆盖 */
  const clearAction = useCallback(() => {
    setActionOverride(null)
    if (actionTimerRef.current) {
      clearTimeout(actionTimerRef.current)
      actionTimerRef.current = null
    }
  }, [])

  // 菜单动作 → 临时动画
  const handleMenuAction = useCallback((action: string) => {
    requestAction(action, 2000)
  }, [requestAction])

  // 拖拽 → playing
  const handleDragChange = useCallback((dragging: boolean) => {
    if (dragging) {
      requestAction('playing', 3000)
    } else {
      clearAction()
    }
  }, [requestAction, clearAction])

  /** 把新存档发给主进程保存 */
  const persist = useCallback((newSave: SaveData) => {
    onUpdateSave(newSave)
    window.petApi.updateSave(newSave)
  }, [onUpdateSave])

  if (!pet) {
    // 没有宠物时显示创建引导
    return (
      <div className="pet-window" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="welcome-hint">
          <p>🌱 你还没有宠物</p>
          <button onClick={onOpenPanel}>去领养一只</button>
        </div>
      </div>
    )
  }

  return (
    <div className="pet-window">
      {/* 宠物精灵 — 添加交互区域以触发临时动作覆盖 */}
      <div
        className="pet-interact-area"
        onMouseEnter={() => requestAction('happy', 2000)}
        onMouseLeave={clearAction}
        onClick={() => requestAction('happy', 800)}
      >
        <PetSprite pet={pet} actionOverride={actionOverride} />
      </div>

      {/* 对话气泡 */}
      <DialogueBubble pet={pet} />

      {/* 快捷菜单 */}
      <QuickMenu
        pet={pet}
        save={save}
        onSave={persist}
        onOpenPanel={onOpenPanel}
        onActionRequest={handleMenuAction}
        onDragChange={handleDragChange}
      />
    </div>
  )
}
