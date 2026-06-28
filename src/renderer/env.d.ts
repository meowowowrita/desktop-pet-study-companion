/// <reference types="vite/client" />

import type { SaveData } from '@shared/types'

/** preload 暴露给渲染进程的 API 类型声明 */
interface PetApi {
  getSave(): Promise<SaveData>
  updateSave(data: SaveData): Promise<{ ok: boolean }>
  getSavePath(): Promise<string>
  openControlPanel(): Promise<void>
  closeControlPanel(): Promise<void>
  setAlwaysOnTop(flag: boolean): Promise<boolean>
  notify(title: string, body: string): Promise<boolean>
  getAssetPath(relativePath: string): Promise<string>
  onContextMenu(callback: (pos: { x: number; y: number }) => void): () => void
  onSaveUpdated(callback: (save: SaveData) => void): () => void
  moveWindow(dx: number, dy: number): Promise<void>
}

declare global {
  interface Window {
    petApi: PetApi
  }
}
