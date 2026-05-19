// src/components/playa/BeachVideo.tsx
//
// Componente embed de video YouTube con:
//   - youtube-nocookie.com (privacy-friendly, no cookies sin click)
//   - loading="lazy" (no afecta LCP del hero)
//   - Aspect-ratio 16/9 con CSS contenedor (sin layout shift)
//   - Atribución al canal + link canonical YouTube
//
// Schema VideoObject se inyecta aparte (en SchemaPlaya, server-side)
// para que Google indexe el video junto con la ficha.

import { videoEmbedUrl, type VideoPlaya } from '@/lib/videos'

interface Props {
  video:    VideoPlaya
  nombre:   string             // Nombre de la playa (para alt/title)
}

export default function BeachVideo({ video, nombre }: Props) {
  const embedUrl = videoEmbedUrl(video.videoId)
  const titleAttr = `${video.title} — vídeo de ${nombre}`

  return (
    <section
      aria-labelledby={`video-${video.videoId}`}
      style={{
        margin: '2rem 0',
        background: 'var(--card-bg)',
        border: '1px solid var(--line)',
        borderRadius: 8,
        overflow: 'hidden',
      }}
    >
      <h2
        id={`video-${video.videoId}`}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: '1.05rem',
          fontWeight: 700,
          color: 'var(--ink)',
          margin: 0,
          padding: '.85rem 1rem',
          borderBottom: '1px solid var(--line)',
        }}
      >
        Vídeo de <em style={{ fontStyle: 'italic', fontWeight: 500, color: 'var(--accent)' }}>{nombre}</em>
      </h2>

      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16 / 9',
          background: '#000',
        }}
      >
        <iframe
          src={embedUrl}
          title={titleAttr}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            border: 0,
          }}
        />
      </div>

      {/* Atribución mínima en texto plano (sin enlaces salientes).
          Mantenemos channelTitle como cumplimiento ligero de
          atribución, pero sin CTAs a youtube.com — fuga de tráfico
          que queremos evitar en una ficha turística. */}
      <div
        style={{
          padding: '.55rem 1rem',
          fontSize: '.72rem',
          color: 'var(--muted)',
          fontStyle: 'italic',
        }}
      >
        Imágenes aéreas vía {video.channelTitle || 'YouTube'}
      </div>
    </section>
  )
}
