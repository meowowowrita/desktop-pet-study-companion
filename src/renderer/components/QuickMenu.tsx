import { useState, useEffect, useRef } from 'react'
import type { PetInstance, SaveData, InteractionResult } from '@shared/types'
import { bathePet, cleanPet, playWithPet } from '@shared/game/petState'
import { useInventoryItem } from '@shared/game/inventory'
import { getShopItem } from '@shared/data/items'

interface Props {
  pet: PetInstance
  save: SaveData
  onSave: (s: SaveData) => void
  onOpenPanel: () => void
  /** 当菜单动作即将执行时回调，用于触发临时动画覆盖 */
  onActionRequest?: (action: string) => void
  /** 当拖拽开始/结束时回调 */
  onDragChange?: (dragging: boolean) => void
}

type MenuAction = 'feed' | 'bathe' | 'clean' | 'play' | 'focus' | 'panel'

const MENU_ITEMS: { id: MenuAction; icon: string; label: string }[] = [
  { id: 'feed', icon: '🍖', label: '喂食' },
  { id: 'bathe', icon: '🛁', label: '洗澡' },
  { id: 'clean', icon: '🧹', label: '清理' },
  { id: 'play', icon: '🎾', label: '玩耍' },
  { id: 'focus', icon: '⏱️', label: '开始学习' },
  { id: 'panel', icon: '📋', label: '控制面板' },
]

export default function QuickMenu({ pet, save, onSave, onOpenPanel, onActionRequest, onDragChange }: Props) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  // 拖动状态
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)
  const dragNotified = useRef(false)

  // 全局鼠标事件（JS 拖动 + 右键菜单）
  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (e.button === 0) {
        dragging.current = true
        hasMoved.current = false
        dragStart.current = { x: e.screenX, y: e.screenY }
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return
      const dx = e.screenX - dragStart.current.x
      const dy = e.screenY - dragStart.current.y
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        hasMoved.current = true
        dragStart.current = { x: e.screenX, y: e.screenY }
        window.petApi.moveWindow(dx, dy)
        if (!dragNotified.current) {
          dragNotified.current = true
          onDragChange?.(true)
        }
      }
    }

    const onMouseUp = () => {
      dragging.current = false
      if (dragNotified.current) {
        dragNotified.current = false
        onDragChange?.(false)
      }
    }

    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setMenuPos({ x: e.clientX, y: e.clientY })
      setOpen(true)
    }

    document.addEventListener('mousedown', onMouseDown)
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
    document.addEventListener('contextmenu', onContextMenu)

    return () => {
      document.removeEventListener('mousedown', onMouseDown)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('contextmenu', onContextMenu)
    }
  }, [])

  const handleAction = (action: MenuAction) => {
    let result: InteractionResult | null = null

    switch (action) {
      case 'feed': {
        // 优先查找背包中 category 为 food/snack 且有库存的物品
        const invEntry = save.inventory.items.find(i => {
          const item = getShopItem(i.itemId)
          return item && (item.category === 'food' || item.category === 'snack') && i.quantity > 0
        })
        if (!invEntry) {
          setFeedback('背包里没有食物，先去商店买吧！')
          setTimeout(() => setFeedback(''), 2000)
          setOpen(false)
          return
        }
        onActionRequest?.('happy')
        // 使用统一背包逻辑：应用 item.effect、扣库存、更新成长阶段
        result = useInventoryItem(save, pet.id, invEntry.itemId)
        break
      }
      case 'bathe':
        onActionRequest?.('happy')
        result = bathePet(pet)
        break
      case 'clean':
        onActionRequest?.('happy')
        result = cleanPet(pet)
        break
      case 'play':
        onActionRequest?.('playing')
        result = playWithPet(pet)
        break
      case 'focus':
      case 'panel':
        onOpenPanel()
        setOpen(false)
        return
    }

    if (result) {
      setFeedback(result.petDialogue ?? result.message)
      setTimeout(() => setFeedback(''), 2000)
      onSave({ ...save })
    }
    setOpen(false)
  }

  return (
    <>
      {feedback && <div className="action-feedback">{feedback}</div>}

      {open && (
        <>
          <div className="menu-backdrop" onClick={() => setOpen(false)} />
          <div className="quick-menu-popup" style={{ left: menuPos.x, top: menuPos.y }}>
            {MENU_ITEMS.map(item => (
              <button
                key={item.id}
                className="quick-menu-item"
                onClick={() => handleAction(item.id)}
              >
                <span className="menu-icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </>
  )
}
