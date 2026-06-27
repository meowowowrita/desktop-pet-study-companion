import { app } from 'electron'
import { join } from 'path'
import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'fs'
import type { SaveData } from '../shared/types'
import { SAVE_VERSION, MAX_BACKUP_COUNT } from '../shared/constants'

/** 存档文件所在目录 */
function getSaveDir(): string {
  const userData = app.getPath('userData')
  const dir = join(userData, 'saves')
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
  return dir
}

/** 主存档路径 */
export function getSavePath(): string {
  return join(getSaveDir(), 'save.json')
}

/** 备份存档路径 */
function backupPath(index: number): string {
  return join(getSaveDir(), `save.backup.${index}.json`)
}

/** 读取存档，失败返回 null */
export function loadSaveData(): SaveData | null {
  const mainPath = getSavePath()

  try {
    const raw = readFileSync(mainPath, 'utf-8')
    const data = JSON.parse(raw) as SaveData

    // 版本迁移（当前是 V1，暂无迁移逻辑，保留接口）
    if (data.version < SAVE_VERSION) {
      return migrateSaveData(data)
    }
    return data
  } catch {
    // 主存档损坏，尝试从备份恢复
    for (let i = 0; i < MAX_BACKUP_COUNT; i++) {
      try {
        const raw = readFileSync(backupPath(i), 'utf-8')
        const data = JSON.parse(raw) as SaveData
        if (data && data.version) {
          console.log(`从备份 ${i} 恢复存档`)
          return data
        }
      } catch {
        continue
      }
    }
    return null
  }
}

/** 保存存档（含自动备份轮转） */
export function saveGameData(data: SaveData): boolean {
  const mainPath = getSavePath()
  data.timestamps.updatedAt = new Date().toISOString()

  try {
    // 轮转备份：只有主存档已存在时才做备份
    if (existsSync(mainPath)) {
      copyFileSync(mainPath, backupPath(0))
      for (let i = MAX_BACKUP_COUNT - 1; i >= 1; i--) {
        const older = backupPath(i - 1)
        const newer = backupPath(i)
        try {
          if (existsSync(older)) copyFileSync(older, newer)
        } catch {
          // 某份备份可能不存在，跳过
        }
      }
    }

    writeFileSync(mainPath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error('保存存档失败:', err)
    return false
  }
}

/** 存档版本迁移 */
function migrateSaveData(data: SaveData): SaveData {
  // V1 → V2 占位
  let current = data
  if (current.version < 2) {
    // 暂无
  }
  current.version = SAVE_VERSION
  return current
}
