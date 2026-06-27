import { useRef, useEffect, useState } from 'react'
import type { PetInstance, PetStatus } from '@shared/types'

interface Props {
  pet: PetInstance
}

function getVideoState(status: PetStatus): string {
  if (status.hunger < 25) return 'hungry'
  if (status.cleanliness < 25) return 'dirty'
  if (status.energy < 15) return 'sleeping'
  if (status.mood < 20) return 'sad'
  if (status.boredom > 75) return 'playing'
  if (status.mood > 80 && status.bond > 60) return 'happy'
  return 'idle'
}

const SPECIES_EMOJI: Record<string, string> = {
  cat: '🐱', dog: '🐶', frog: '🐸', bunny: '🐰', chick: '🐣',
  hamster: '🐹', fox: '🦊', panda: '🐼', deer: '🦌', penguin: '🐧',
  alpaca: '🦙', dragon: '🐲', snow_leopard: '🐆', phoenix: '🐦‍🔥', unicorn: '🦄',
}

export default function PetSprite({ pet }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [useFallback, setUseFallback] = useState(false)
  const [debugMsg, setDebugMsg] = useState('')

  const { stage } = pet.growth
  const { speciesId } = pet
  const videoState = getVideoState(pet.status)
  const targetSrc = `asset://pets/${speciesId}/${stage}/${videoState}.mp4`
  const idleSrc = `asset://pets/${speciesId}/${stage}/idle.mp4`

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    setUseFallback(false)
    setDebugMsg('加载中...')

    const onError = (e: Event) => {
      const v = e.target as HTMLVideoElement
      const err = v.error
      console.warn('[PetSprite] 视频错误:', err?.code, err?.message)
      setDebugMsg(`错误: ${err?.code ?? 'unknown'}`)

      // target 失败 → 回退到 idle
      if (v.src === targetSrc) {
        setDebugMsg('回退 idle...')
        v.src = idleSrc
        v.load()
        v.play().catch(() => {})
        return
      }

      // idle 也失败 → emoji 兜底
      setDebugMsg('视频不可用，显示占位图')
      setUseFallback(true)
    }

    const onLoaded = () => {
      setDebugMsg(`播放中: ${videoState}`)
      setUseFallback(false)
      video.play().catch((e) => console.warn('[PetSprite] play() 失败:', e))
    }

    video.addEventListener('error', onError)
    video.addEventListener('loadeddata', onLoaded)

    video.src = targetSrc
    video.load()

    return () => {
      video.removeEventListener('error', onError)
      video.removeEventListener('loadeddata', onLoaded)
    }
  }, [targetSrc, idleSrc, videoState])

  const scale = stage === 'baby' ? 0.7 : stage === 'child' ? 0.85 : 1.0
  const emoji = SPECIES_EMOJI[speciesId] ?? '🐾'

  return (
    <div className="pet-sprite" style={{ transform: `scale(${scale})` }}>
      {useFallback ? (
        <div className="pet-sprite-fallback" style={{
          fontSize: '80px', textAlign: 'center', lineHeight: '180px',
        }}>
          {emoji}
        </div>
      ) : (
        <video
          ref={videoRef}
          loop
          muted
          autoPlay
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        fontSize: '9px', color: '#999', textAlign: 'center',
      }}>
        {debugMsg}
      </div>
    </div>
  )
}
