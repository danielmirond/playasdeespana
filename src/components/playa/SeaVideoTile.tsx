'use client'
import { useRef, useState, useCallback } from 'react'

export interface SeaVideoConfig {
  poster: string
  src:    string
  label:  string
  tint:   string
}

export const SEA_VIDEOS: Record<string, SeaVideoConfig> = {
  CALMA:   { poster: 'https://images.pexels.com/videos/7222004/pexels-photo-7222004.jpeg',  src: 'https://videos.pexels.com/video-files/7222004/7222004-hd_1920_1080_30fps.mp4',   label: 'mar espejo',          tint: '#0f6b5d' },
  BUENA:   { poster: 'https://images.pexels.com/videos/855438/free-video-855438.jpg',        src: 'https://videos.pexels.com/video-files/855438/855438-hd_1920_1080_30fps.mp4',     label: 'oleaje suave',        tint: '#3a6320' },
  AVISO:   { poster: 'https://images.pexels.com/videos/11961260/pexels-photo-11961260.jpeg', src: 'https://videos.pexels.com/video-files/11961260/11961260-hd_1920_1080_30fps.mp4', label: 'cielo cubierto',      tint: '#b07a14' },
  SURF:    { poster: 'https://images.pexels.com/videos/1093662/pictures/preview-0.jpg',      src: 'https://videos.pexels.com/video-files/1093662/1093662-hd_1920_1080_30fps.mp4',   label: 'rompiente',           tint: '#13345e' },
  VIENTO:  { poster: 'https://images.pexels.com/videos/1722593/pictures/preview-0.jpg',      src: 'https://videos.pexels.com/video-files/1722593/1722593-hd_1920_1080_30fps.mp4',   label: 'racha SW',            tint: '#3f3f3a' },
  PELIGRO: { poster: 'https://images.pexels.com/videos/3719411/pexels-photo-3719411.jpeg',   src: 'https://videos.pexels.com/video-files/3719411/3719411-hd_1920_1080_30fps.mp4',   label: 'mar gruesa',          tint: '#7a1a12' },
}

interface Props {
  estado:    string
  className?: string
}

export default function SeaVideoTile({ estado, className }: Props) {
  const v = SEA_VIDEOS[estado] ?? SEA_VIDEOS.CALMA
  const ref = useRef<HTMLVideoElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [errored, setErrored] = useState(false)

  const onEnter = useCallback(() => {
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const el = ref.current
    if (!el || errored) return
    if (!loaded) {
      el.src = v.src
      setLoaded(true)
    }
    el.currentTime = 0
    const p = el.play()
    if (p && p.catch) p.catch(() => setErrored(true))
    setPlaying(true)
  }, [v.src, loaded, errored])

  const onLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.pause()
    setPlaying(false)
  }, [])

  if (errored) return null

  return (
    <div
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={className}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0, pointerEvents: 'auto' }}
    >
      {/* Poster — img element (not backgroundImage) to avoid duplicate load with <video poster> */}
      {!playing && (
        <img
          src={v.poster}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          style={{
            position: 'absolute', inset: 0, width: '100%', height: '100%',
            objectFit: 'cover',
            filter: 'grayscale(1) contrast(1.2) brightness(0.78)',
          }}
        />
      )}

      <video
        ref={ref}
        muted
        playsInline
        loop
        preload="none"
        crossOrigin="anonymous"
        onError={() => setErrored(true)}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover',
          opacity: playing ? 1 : 0,
          transition: 'opacity 500ms ease',
          filter: 'grayscale(1) contrast(1.18) brightness(0.78)',
        }}
      />

      {/* Color layer — flatten to state hue */}
      <div style={{
        position: 'absolute', inset: 0,
        background: v.tint,
        mixBlendMode: 'color',
        opacity: 1,
        pointerEvents: 'none',
      }}/>

      {/* Multiply — push to duotone */}
      <div style={{
        position: 'absolute', inset: 0,
        background: v.tint,
        mixBlendMode: 'multiply',
        opacity: playing ? 0.55 : 0.7,
        transition: 'opacity 500ms ease',
        pointerEvents: 'none',
      }}/>

      {/* Screen lift — keep highlights in state hue */}
      <div style={{
        position: 'absolute', inset: 0,
        background: v.tint,
        mixBlendMode: 'screen',
        opacity: 0.18,
        pointerEvents: 'none',
      }}/>

      {/* Vignette */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(130% 90% at 50% 0%, transparent 30%, rgba(0,0,0,0.32) 100%)',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
      }}/>
    </div>
  )
}
