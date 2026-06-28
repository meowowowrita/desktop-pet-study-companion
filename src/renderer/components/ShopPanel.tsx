import { useState } from 'react'
import type { SaveData } from '@shared/types'
import { SHOP_ITEMS, getItemsByCategory } from '@shared/data/items'
import { buyItem } from '@shared/game/inventory'

interface Props {
  save: SaveData
  onUpdateSave: (s: SaveData) => void
}

type CategoryTab = 'all' | 'food' | 'snack' | 'toy'

const CATEGORY_TABS: { id: CategoryTab; label: string; labelEn: string }[] = [
  { id: 'all', label: '全部', labelEn: 'All' },
  { id: 'food', label: '食物', labelEn: 'Food' },
  { id: 'snack', label: '零食', labelEn: 'Snacks' },
  { id: 'toy', label: '玩具', labelEn: 'Toys' },
]

export default function ShopPanel({ save, onUpdateSave }: Props) {
  const [filter, setFilter] = useState<CategoryTab>('all')
  const [feedback, setFeedback] = useState('')
  const lang = save.settings.language

  const items = filter === 'all' ? SHOP_ITEMS : getItemsByCategory(filter)

  const handleBuy = (itemId: string) => {
    // 深拷贝 save 以避免直接修改导致 react 不更新
    const newSave = JSON.parse(JSON.stringify(save)) as SaveData
    const result = buyItem(newSave, itemId)
    setFeedback(lang === 'zh' ? result.message : result.messageEn)
    onUpdateSave(newSave)
    setTimeout(() => setFeedback(''), 2000)
  }

  const coins = save.economy.coins

  return (
    <div className="shop-panel">
      {/* 金币与反馈 */}
      <div className="sp-shop-header">
        <span className="sp-coins-display">💰 {coins}</span>
        {feedback && <span className="sp-feedback">{feedback}</span>}
      </div>

      {/* 分类筛选 */}
      <div className="sp-category-tabs">
        {CATEGORY_TABS.map(t => (
          <button
            key={t.id}
            className={`sp-cat-btn ${filter === t.id ? 'active' : ''}`}
            onClick={() => setFilter(t.id)}
          >
            {lang === 'zh' ? t.label : t.labelEn}
          </button>
        ))}
      </div>

      {/* 物品列表 */}
      <div className="sp-items-grid">
        {items.map(item => {
          const canAfford = coins >= item.price
          const owned = save.inventory.items.find(i => i.itemId === item.id)?.quantity ?? 0
          return (
            <div key={item.id} className={`sp-item-card rarity-${item.rarity}`}>
              <div className="sp-item-header">
                <span className="sp-item-name">
                  {lang === 'zh' ? item.name : item.nameEn}
                </span>
                <span className={`sp-item-rarity rarity-tag-${item.rarity}`}>
                  {item.rarity}
                </span>
              </div>

              <div className="sp-item-effects">
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

              <div className="sp-item-footer">
                <span className="sp-item-price">
                  💰 {item.price}
                </span>
                {owned > 0 && (
                  <span className="sp-item-owned">
                    {lang === 'zh' ? `已拥有 ×${owned}` : `Owned ×${owned}`}
                  </span>
                )}
                <button
                  className={`sp-buy-btn ${canAfford ? '' : 'disabled'}`}
                  onClick={() => canAfford && handleBuy(item.id)}
                  disabled={!canAfford}
                >
                  {lang === 'zh' ? '购买' : 'Buy'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {items.length === 0 && (
        <p className="sp-empty">
          {lang === 'zh' ? '该分类暂无物品' : 'No items in this category'}
        </p>
      )}
    </div>
  )
}
