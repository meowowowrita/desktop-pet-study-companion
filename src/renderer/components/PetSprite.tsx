import { useState, useCallback } from 'react'
import type { PetInstance, PetStatus } from '@shared/types'

interface Props {
  pet: PetInstance
  actionOverride?: string | null
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

/** 素材类型探测顺序 */
type AssetType = 'gif' | 'mp4'

export default function PetSprite({ pet, actionOverride }: Props) {
  const [assetType, setAssetType] = useState<AssetType>('gif')  // 先试 GIF
  const [gifFailed, setGifFailed] = useState(false)
  const [useFallback, setUseFallback] = useState(false)
  const [currentSrc, setCurrentSrc] = useState('')  // video 的当前 src

  const { stage } = pet.growth
  const { speciesId } = pet
  const statusState = getVideoState(pet.status)
  const effectiveState = actionOverride ?? statusState

  // 资源路径
  const gifSrc = `asset://pets/${speciesId}/${stage}/${effectiveState}.gif`
  const gifIdleSrc = `asset://pets/${speciesId}/${stage}/idle.gif`
  const mp4Src = `asset://pets/${speciesId}/${stage}/${effectiveState}.mp4`
  const mp4IdleSrc = `asset://pets/${speciesId}/${stage}/idle.mp4`

  const scale = stage === 'baby' ? 0.7 : stage === 'child' ? 0.85 : 1.0
  const emoji = SPECIES_EMOJI[speciesId] ?? '🐾'

  // ── GIF 加载失败处理 ──
  const handleGifError = useCallback(() => {
    if (!gifFailed && effectiveState !== 'idle') {
      // 先试 idle.gif
      setGifFailed(true)
    } else {
      // idle.gif 也失败 → 切到 mp4
      setAssetType('mp4')
    }
  }, [gifFailed, effectiveState])

  // ── Video 加载失败处理 ──
  const handleVideoError = useCallback((e: React.SyntheticEvent<HTMLVideoElement>) => {
    const v = e.target as HTMLVideoElement
    const currentTarget = v.src.replace('asset://', '')

    if (currentTarget === mp4Src && effectiveState !== 'idle') {
      setCurrentSrc(mp4IdleSrc)
    } else {
      setUseFallback(true)
    }
  }, [mp4Src, mp4IdleSrc, effectiveState])

  const handleVideoLoaded = useCallback(() => {
    setUseFallback(false)
  }, [])

  // ── 渲染 ──
  return (
    <div className="pet-sprite" style={{ transform: `scale(${scale})` }}>
      {useFallback ? (
        <div style={{ fontSize: '80px', textAlign: 'center', lineHeight: '180px' }}>
          {emoji}
        </div>
      ) : assetType === 'gif' ? (
        <img
          src={gifFailed ? gifIdleSrc : gifSrc}
          onError={handleGifError}
          style={{
            width: '100%', height: '100%', objectFit: 'contain',
            imageRendering: 'pixelated',
          }}
          alt={effectiveState}
        />
      ) : (
        <video
          key={currentSrc || mp4Src}
          src={currentSrc || mp4Src}
          loop muted autoPlay playsInline
          onError={handleVideoError}
          onLoadedData={handleVideoLoaded}
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      )}
    </div>
  )
}
