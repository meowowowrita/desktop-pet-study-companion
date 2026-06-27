import { useState, useEffect } from 'react'
import PetWindow from './routes/PetWindow'
import ControlPanel from './routes/ControlPanel'
import type { SaveData } from '@shared/types'

/**
 * App 入口
 *
 * 通过 URL hash 区分两个窗口：
 *   - 无 hash → 透明宠物窗口
 *   - #/panel  → 控制面板窗口
 */
export default function App() {
  const [save, setSave] = useState<SaveData | null>(null)
  const [ready, setReady] = useState(false)

  const isPetWindow = !window.location.hash.includes('panel')

  // 启动时从主进程加载存档
  useEffect(() => {
    window.petApi.getSave().then((data) => {
      setSave(data)
      setReady(true)
    })
  }, [])

  if (!ready || !save) {
    return (
      <div className="loading-screen">
        <p>{isPetWindow ? '加载中…' : '加载中…'}</p>
      </div>
    )
  }

  return isPetWindow ? (
    <PetWindow
      save={save}
      onUpdateSave={setSave}
      onOpenPanel={() => window.petApi.openControlPanel()}
    />
  ) : (
    <ControlPanel
      save={save}
      onUpdateSave={setSave}
    />
  )
}
