import { useState } from 'react'
import type { SaveData } from '@shared/types'
import { getShopItem } from '@shared/data/items'
import { useInventoryItem } from '@shared/game/inventory'

interface Props {
  save: SaveData
  onUpdateSave: (s: SaveData) => void
}

export default function InventoryPanel({ save, onUpdateSave }: Props) {
  const [feedback, setFeedback] = useState('')
  const lang = save.settings.language
  const pet = save.pets.find(p => p.id === save.activePetId)
  const inventory = save.inventory.items

  const handleUse = (itemId: string) => {
    if (!pet) return
    const newSave = JSON.parse(JSON.stringify(save)) as SaveData
    const result = useInventoryItem(newSave, pet.id, itemId)
    setFeedback(lang === 'zh' ? result.message : result.messageEn)
    onUpdateSave(newSave)
    setTimeout(() => setFeedback(''), 2500)
  }

  return (
    <div className="inventory-panel">
      {/* 反馈 */}
      {feedback && <div className="inv-feedback">{feedback}</div>}

      {/* 空状态 */}
      {inventory.length === 0 && (
        <div className="inv-empty">
          <p className="inv-empty-icon">🎒</p>
          <p>{lang === 'zh' ? '背包空空如也' : 'Your bag is empty'}</p>
          <p className="inv-empty-hint">
            {lang === 'zh' ? '去商店购买一些物品吧！' : 'Visit the shop to buy some items!'}
          </p>
        </div>
      )}

      {/* 物品列表 */}
      <div className="inv-items-grid">
        {inventory.map(entry => {
          const item = getShopItem(entry.itemId)
          if (!item) return null
          const canUse = pet !== undefined

          return (
            <div key={entry.itemId} className={`inv-item-card rarity-${item.rarity}`}>
              <div className="inv-item-header">
                <span className="inv-item-name">
                  {lang === 'zh' ? item.name : item.nameEn}
                </span>
                <span className="inv-item-qty">×{entry.quantity}</span>
              </div>

              <div className="inv-item-category">
                <span className={`inv-cat-tag cat-${item.category}`}>
                  {item.category}
                </span>
              </div>

              <div className="inv-item-effects">
                {Object.entries(item.effect).map(([key, val]) => {
                  const labelMap: Record<string, string> = {
                    hunger: lang === 'zh' ? '饱食' : 'Hunger',
                    mood: lang === 'zh' ? '心情' : 'Mood',
                    cleanliness: lang === 'zh' ? '清洁' : 'Clean',
                    energy: lang === 'zh' ? '精力' : 'Energy',
                    health: lang === 'zh' ? '健康' : 'Health',
                    boredom: lang === 'zh' ? '无聊' : 'Boredom',
                    bond: lang === 'zh' ? '亲密度' : 'Bond',
                    growthPoints: lang === 'zh' ? '成长' : 'Growth',
                  }
                  const label = labelMap[key] ?? key
                  const sign = val > 0 ? '+' : ''
                  return (
                    <span key={key} className={`sp-effect-tag ${val > 0 ? 'positive' : 'negative'}`}>
                      {label} {sign}{val}
                    </span>
                  )
                })}
              </div>

              <button
                className={`inv-use-btn ${canUse ? '' : 'disabled'}`}
                onClick={() => canUse && handleUse(entry.itemId)}
                disabled={!canUse}
              >
                {lang === 'zh' ? '使用' : 'Use'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
