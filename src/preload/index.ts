import { contextBridge, ipcRenderer } from 'electron'
import type { SaveData } from '../shared/types'

/**
 * 预加载脚本 — 在渲染进程和主进程之间建立安全桥梁。
 * 渲染进程只能调用这里暴露的 API，无法直接访问 Node.js 或文件系统。
 */

const petApi = {
  /** 读取完整存档 */
  getSave: (): Promise<SaveData> => ipcRenderer.invoke('game:getSave'),

  /** 保存存档（渲染进程修改状态后回传） */
  updateSave: (data: SaveData): Promise<{ ok: boolean }> =>
    ipcRenderer.invoke('game:updateSave', data),

  /** 获取存档文件路径 */
  getSavePath: (): Promise<string> => ipcRenderer.invoke('game:getSavePath'),

  /** 打开控制面板 */
  openControlPanel: (): Promise<void> => ipcRenderer.invoke('ui:openControlPanel'),

  /** 关闭控制面板 */
  closeControlPanel: (): Promise<void> => ipcRenderer.invoke('ui:closeControlPanel'),

  /** 设置宠物窗口是否始终置顶 */
  setAlwaysOnTop: (flag: boolean): Promise<boolean> =>
    ipcRenderer.invoke('ui:setAlwaysOnTop', flag),

  /** 发送系统通知 */
  notify: (title: string, body: string): Promise<boolean> =>
    ipcRenderer.invoke('ui:notify', title, body),

  /** 获取素材文件的绝对 file:// 路径 */
  getAssetPath: (relativePath: string): Promise<string> =>
    ipcRenderer.invoke('asset:getPath', relativePath),

  /** 监听主进程转发的右键菜单事件 */
  onContextMenu: (callback: (pos: { x: number; y: number }) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, pos: { x: number; y: number }) => callback(pos)
    ipcRenderer.on('show-context-menu', handler)
    return () => ipcRenderer.removeListener('show-context-menu', handler)
  },

  /** 监听主进程发出的存档更新广播 */
  onSaveUpdated: (callback: (save: SaveData) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, save: SaveData) => callback(save)
    ipcRenderer.on('game:saveUpdated', handler)
    return () => ipcRenderer.removeListener('game:saveUpdated', handler)
  },

  /** JS 拖动：移动宠物窗口 */
  moveWindow: (dx: number, dy: number): Promise<void> =>
    ipcRenderer.invoke('ui:moveWindow', dx, dy),
}

contextBridge.exposeInMainWorld('petApi', petApi)
