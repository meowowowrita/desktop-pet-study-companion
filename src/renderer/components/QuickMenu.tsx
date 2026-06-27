import { useState, useEffect, useRef } from 'react'
import type { PetInstance, SaveData, InteractionResult } from '@shared/types'
import { feedPet, bathePet, cleanPet, playWithPet } from '@shared/game/petState'

interface Props {
  pet: PetInstance
  save: SaveData
  onSave: (s: SaveData) => void
  onOpenPanel: () => void
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

export default function QuickMenu({ pet, save, onSave, onOpenPanel }: Props) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState('')
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 })

  // 拖动状态
  const dragging = useRef(false)
  const dragStart = useRef({ x: 0, y: 0 })
  const hasMoved = useRef(false)

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
      }
    }

    const onMouseUp = () => {
      dragging.current = false
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
        const foodItem = save.inventory.items.find(i => i.quantity > 0)
        if (!foodItem) {
          setFeedback('背包里没有食物，先去商店买吧！')
          setTimeout(() => setFeedback(''), 2000)
          setOpen(false)
          return
        }
        result = feedPet(pet, { itemId: foodItem.itemId, effect: { hunger: 30 } })
        foodItem.quantity -= 1
        if (foodItem.quantity <= 0) {
          save.inventory.items = save.inventory.items.filter(i => i.itemId !== foodItem.itemId)
        }
        break
      }
      case 'bathe':
        result = bathePet(pet)
        break
      case 'clean':
        result = cleanPet(pet)
        break
      case 'play':
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
