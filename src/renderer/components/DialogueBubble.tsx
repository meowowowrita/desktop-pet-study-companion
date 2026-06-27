import { useState, useEffect } from 'react'
import type { PetInstance } from '@shared/types'

interface Props {
  pet: PetInstance
}

/**
 * 对话气泡组件
 *
 * 根据宠物状态选择对应台词，在气泡中显示。
 * 每 15 秒刷新一次对话内容。
 */

function pickDialogue(pet: PetInstance): string {
  const s = pet.status

  if (s.hunger < 25) return '好饿呀…有吃的吗？'
  if (s.hunger < 50) return '肚子有点空了~'
  if (s.cleanliness < 25) return '身上好脏，想洗澡！'
  if (s.cleanliness < 50) return '差不多该洗洗了…'
  if (s.energy < 20) return '好困…zzZ'
  if (s.boredom > 75) return '好无聊呀，陪我玩嘛！'
  if (s.poopCount >= 2) return '那个…该清理一下了…'
  if (s.mood > 80 && s.bond > 60) return '和你在一起真开心~'
  if (s.bond < 20) return '我们还不太熟呢…'
  if (s.bond > 80) return '你是我最好的朋友！'
  if (s.mood < 30) return '今天心情不太好…'

  // 默认台词（按性格微调）
  const lines: Record<string, string[]> = {
    clingy: ['陪陪我嘛~', '你在做什么呀？', '别走太远哦'],
    proud: ['哼，我才没有在等你', '还不错嘛', '随便看看'],
    lazy: ['今天不用太努力也没关系…', '一起发呆吧', '躺平～'],
    hardworking: ['一起加油！', '今天也要努力！', '冲呀！'],
    greedy: ['什么时候开饭？', '零食在哪？', '有什么好吃的吗？'],
  }

  const pool = lines[pet.personality] ?? lines.clingy
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function DialogueBubble({ pet }: Props) {
  const [text, setText] = useState('')
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    // 初始显示
    setText(pickDialogue(pet))
    setVisible(true)

    // 每 15 秒换一句
    const timer = setInterval(() => {
      setText(pickDialogue(pet))
      setVisible(true)
      // 显示 4 秒后自动消失
      setTimeout(() => setVisible(false), 4000)
    }, 15000)

    // 4 秒后自动隐藏
    const hideTimer = setTimeout(() => setVisible(false), 4000)

    return () => {
      clearInterval(timer)
      clearTimeout(hideTimer)
    }
  }, [pet.id])

  // 点击气泡重新显示
  const handleClick = () => {
    setText(pickDialogue(pet))
    setVisible(true)
    setTimeout(() => setVisible(false), 4000)
  }

  if (!visible) return null

  return (
    <div className="dialogue-bubble" onClick={handleClick}>
      <p>{text}</p>
    </div>
  )
}
