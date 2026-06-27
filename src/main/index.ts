import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, screen, protocol, net } from 'electron'
import { join } from 'path'
import { pathToFileURL } from 'url'
import { createDefaultSaveData, todayDateString } from '../shared/defaults'
import { loadSaveData, saveGameData, getSavePath } from './storage'
import { createPet } from '../shared/game/petFactory'
import { getCommonSpecies } from '../shared/data/species'
import type { SaveData } from '../shared/types'

// ---- 窗口引用 ----
let petWindow: BrowserWindow | null = null
let controlPanel: BrowserWindow | null = null
let tray: Tray | null = null
let isQuitting = false

// ---- 存档 ----
let gameSave: SaveData

// ============================================
// 窗口创建
// ============================================

function createPetWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 220,
    height: 260,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // preload 需要访问 Node API
    },
  })

  // 恢复上次位置，或默认屏幕右下角
  const savedPos = gameSave.settings.petWindowPosition
  if (savedPos.x >= 0 && savedPos.y >= 0) {
    win.setPosition(savedPos.x, savedPos.y)
  } else {
    const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize
    win.setPosition(sw - 260, sh - 320)
  }

  // 开发模式加载 Vite dev server
  if (isDev()) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL!)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide() // 关闭按钮 = 隐藏而不是退出
    }
  })

  win.on('moved', () => {
    const [x, y] = win.getPosition()
    gameSave.settings.petWindowPosition = { x, y }
  })

  // 拦截右键：即使在 drag 区域也能触发，转发给渲染进程
  win.webContents.on('context-menu', (e, params) => {
    e.preventDefault()
    win.webContents.send('show-context-menu', { x: params.x, y: params.y })
  })

  return win
}

function createControlPanel(): BrowserWindow {
  const win = new BrowserWindow({
    width: 420,
    height: 560,
    minWidth: 360,
    minHeight: 480,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  })

  if (isDev()) {
    win.loadURL(process.env.ELECTRON_RENDERER_URL! + '#/panel')
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'), { hash: '/panel' })
  }

  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      win.hide()
    }
  })

  return win
}

// ============================================
// 系统托盘
// ============================================

function createTray() {
  // 用 16x16 透明图标做占位托盘图标
  const icon = nativeImage.createEmpty()
  tray = new Tray(icon.resize({ width: 16, height: 16 }))

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示宠物',
      click: () => petWindow?.show(),
    },
    {
      label: '打开控制面板',
      click: () => {
        controlPanel?.show()
        controlPanel?.focus()
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      },
    },
  ])

  tray.setToolTip('桌面宠物')
  tray.setContextMenu(contextMenu)

  tray.on('double-click', () => {
    petWindow?.show()
  })
}

// ============================================
// IPC 通信
// ============================================

function setupIPC() {
  // 获取完整存档
  ipcMain.handle('game:getSave', () => {
    return gameSave
  })

  // 更新存档（渲染进程计算完状态后回传）
  ipcMain.handle('game:updateSave', (_event, newSave: SaveData) => {
    gameSave = newSave
    gameSave.timestamps.updatedAt = new Date().toISOString()
    saveGameData(gameSave)
    return { ok: true }
  })

  // 获取存档文件路径
  ipcMain.handle('game:getSavePath', () => {
    return getSavePath()
  })

  // 打开控制面板
  ipcMain.handle('ui:openControlPanel', () => {
    if (!controlPanel) {
      controlPanel = createControlPanel()
    }
    controlPanel.show()
    controlPanel.focus()
  })

  // 关闭控制面板
  ipcMain.handle('ui:closeControlPanel', () => {
    controlPanel?.hide()
  })

  // 设置置顶
  ipcMain.handle('ui:setAlwaysOnTop', (_event, flag: boolean) => {
    petWindow?.setAlwaysOnTop(flag)
    gameSave.settings.alwaysOnTop = flag
    return true
  })

  // 系统通知
  ipcMain.handle('ui:notify', (_event, title: string, body: string) => {
    if (gameSave.settings.enableNotifications) {
      const { Notification } = require('electron')
      new Notification({ title, body }).show()
    }
    return true
  })

  // JS 拖动窗口
  ipcMain.handle('ui:moveWindow', (_event, dx: number, dy: number) => {
    if (petWindow) {
      const [x, y] = petWindow.getPosition()
      petWindow.setPosition(x + dx, y + dy)
    }
  })

  // 获取素材 file:// 路径
  ipcMain.handle('asset:getPath', (_event, relativePath: string) => {
    const absolutePath = join(getAssetsDir(), relativePath)
    return pathToFileURL(absolutePath).href
  })
}

// ============================================
// 应用生命周期
// ============================================

app.whenReady().then(() => {
  // 注册自定义协议（必须在窗口创建前）
  registerAssetProtocol()

  // 加载或创建存档
  gameSave = loadSaveData() ?? createDefaultSaveData()
  gameSave.timestamps.lastOpenedAt = new Date().toISOString()

  // 如果存档中的今日日期不是今天，重置今日统计
  const today = todayDateString()
  if (gameSave.focus.today.date !== today) {
    gameSave.focus.today = {
      date: today,
      completedMinutes: 0,
      sessionsCompleted: 0,
      coinsEarned: 0,
    }
  }

  // 首次启动：送一只小猫（当前只有 cat 有视频素材）
  if (gameSave.pets.length === 0) {
    const starterPet = createPet(getCommonSpecies().find(s => s.id === 'cat')!)
    gameSave.pets.push(starterPet)
    gameSave.activePetId = starterPet.id
    saveGameData(gameSave)
  }

  setupIPC()
  petWindow = createPetWindow()
  createTray()

  app.on('activate', () => {
    petWindow?.show()
  })
})

app.on('before-quit', () => {
  isQuitting = true
  saveGameData(gameSave)
})

app.on('window-all-closed', () => {
  // 不退出，托盘继续运行
})

// ============================================
// 工具函数
// ============================================

function isDev(): boolean {
  return process.env.ELECTRON_RENDERER_URL !== undefined
}

/** 获取 assets 素材文件夹的实际路径 */
function getAssetsDir(): string {
  if (isDev()) {
    // 开发模式：out/main → 项目根目录
    const projectRoot = join(__dirname, '..', '..')
    return join(projectRoot, 'assets')
  }
  // 生产模式：放在 resources 目录
  return join(process.resourcesPath!, 'assets')
}

/** 注册 asset:// 自定义协议，支持视频 Range 请求 */
function registerAssetProtocol() {
  protocol.handle('asset', async (request) => {
    const relativePath = request.url.replace('asset://', '')
    const absolutePath = join(getAssetsDir(), relativePath)

    try {
      const fs = await import('fs')
      const stat = fs.statSync(absolutePath)
      const fileSize = stat.size

      // 解析 Range 请求头
      const rangeHeader = request.headers.get('range')
      if (rangeHeader) {
        const match = rangeHeader.match(/bytes=(\d+)-(\d*)/)
        if (match) {
          const start = parseInt(match[1], 10)
          const end = match[2] ? parseInt(match[2], 10) : fileSize - 1
          const chunkSize = end - start + 1

          const buf = Buffer.alloc(chunkSize)
          const fd = fs.openSync(absolutePath, 'r')
          fs.readSync(fd, buf, 0, chunkSize, start)
          fs.closeSync(fd)

          return new Response(buf, {
            status: 206,
            headers: {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': String(chunkSize),
              'Content-Type': 'video/mp4',
            },
          })
        }
      }

      // 无 Range 请求，返回完整文件
      const data = fs.readFileSync(absolutePath)
      return new Response(data, {
        status: 200,
        headers: {
          'Content-Length': String(fileSize),
          'Content-Type': 'video/mp4',
          'Accept-Ranges': 'bytes',
        },
      })
    } catch (err) {
      console.error('[asset] 加载失败:', absolutePath, err)
      return new Response(null, { status: 404 })
    }
  })
}

