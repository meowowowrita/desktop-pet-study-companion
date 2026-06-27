import { useCallback } from 'react'
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
      {/* 宠物视频 */}
      <PetSprite pet={pet} />

      {/* 对话气泡 */}
      <DialogueBubble pet={pet} />

      {/* 快捷菜单 */}
      <QuickMenu
        pet={pet}
        save={save}
        onSave={persist}
        onOpenPanel={onOpenPanel}
      />
    </div>
  )
}
