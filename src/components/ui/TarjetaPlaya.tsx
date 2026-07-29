// src/components/ui/TarjetaPlaya.tsx
// Tarjeta de playa — presentacional y CLIENT-SAFE.
//
// El sitio tenía dos gramáticas para lo mismo: TopBeachCardsConHero
// (municipio, provincia, mejores playas) y una maqueta a mano dentro de
// "playas cerca de mí", que además es lo PRIMERO que ve el visitante en
// la home. Aprendía un lenguaje visual que no volvía a aparecer.
//
// Esta es la misma tarjeta, sin el async: TopBeachCardsConHero resuelve
// fotos en servidor y filtra las playas que no tienen, cosa que en
// "cerca de mí" no vale — la playa más cercana tiene que salir aunque no
// haya foto. Por eso el hueco de imagen degrada a un bloque de color con
// el estado del mar en vez de descartar la ficha.
import Link from 'next/link'

export interface TarjetaPlayaProps {
  slug: string
  nombre: string
  /** Línea de contexto: "Getxo · Bizkaia" */
  meta: string
  /** Miniatura ya resuelta. Sin ella, el hueco cae a bloque de color. */
  foto?: string | null
  /** Posición en el listado. Sin valor, no se pinta. */
  rank?: number
  score?: number
  /** Color del score, ya validado en contraste por quien llama */
  scoreColor?: string
  /** Etiqueta corta del veredicto ("Muy buena") */
  veredicto?: string
  bandera?: boolean
  /** Fila inferior de datos: agua, olas, distancia… */
  datos?: Array<{ v: string; l: string }>
  /** Distintivo superior derecho sobre la imagen (p. ej. la distancia) */
  distintivo?: string
  locale?: 'es' | 'en'
}

export default function TarjetaPlaya({
  slug, nombre, meta, foto, rank, score, scoreColor = 'var(--accent, #6b400a)',
  veredicto, bandera, datos, distintivo, locale = 'es',
}: TarjetaPlayaProps) {
  const href = locale === 'en' ? `/en/beaches/${slug}` : `/playas/${slug}`

  return (
    <Link
      href={href}
      prefetch={false}
      style={{
        display: 'flex', flexDirection: 'column',
        background: 'var(--card-bg, #faf6ef)',
        border: '1px solid var(--line, #e8dcc8)',
        borderRadius: 8, overflow: 'hidden',
        textDecoration: 'none', color: 'inherit',
        transition: 'border-color .15s, transform .15s',
        height: '100%',
      }}
    >
      <div style={{
        position: 'relative', aspectRatio: '3 / 2',
        background: 'var(--metric-bg, #f0e6d0)', overflow: 'hidden',
      }}>
        {foto && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={foto}
            alt=""
            loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 55%' }}
          />
        )}
        <div aria-hidden="true" style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          background: 'linear-gradient(180deg, rgba(0,0,0,.28) 0%, rgba(0,0,0,0) 38%, rgba(0,0,0,0) 60%, rgba(0,0,0,.34) 100%)',
        }} />

        {rank !== undefined && (
          <span style={{
            position: 'absolute', top: 10, left: 10, zIndex: 2,
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: '1.35rem', color: 'var(--arena-50, #faf4e6)',
            textShadow: '0 1px 8px rgba(0,0,0,.6)',
            lineHeight: 1, letterSpacing: '-.02em',
          }}>nº{rank}</span>
        )}

        {/* El distintivo (distancia) va sobre papel, no sobre la foto:
            texto claro sobre imagen no garantiza contraste. */}
        {distintivo && (
          <span style={{
            position: 'absolute', bottom: 10, left: 10, zIndex: 2,
            background: 'var(--arena-50, #faf4e6)', color: 'var(--ink, #2a1a08)',
            padding: '3px 9px', borderRadius: 999,
            fontFamily: 'var(--font-mono, monospace)', fontSize: '.68rem',
            fontWeight: 600, fontVariantNumeric: 'tabular-nums',
          }}>{distintivo}</span>
        )}

        {score !== undefined && (
          <span style={{
            position: 'absolute', top: 10, right: 10, zIndex: 2,
            background: 'var(--arena-50, #faf4e6)',
            padding: '4px 10px', borderRadius: 999,
            fontFamily: 'var(--font-serif)', fontWeight: 700,
            fontSize: '.85rem', color: scoreColor,
            lineHeight: 1, fontVariantNumeric: 'tabular-nums',
          }}>{score}</span>
        )}

        {bandera && (
          <span style={{
            position: 'absolute', bottom: 10, right: 10, zIndex: 2,
            background: '#1d4ed8', color: '#fff',
            padding: '2px 7px', borderRadius: 4,
            fontSize: '.62rem', fontWeight: 700,
            letterSpacing: '.04em', textTransform: 'uppercase',
          }}>{locale === 'en' ? 'Blue flag' : 'B. Azul'}</span>
        )}
      </div>

      <div style={{ padding: '.75rem .85rem .9rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{
          fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '1rem',
          color: 'var(--ink)', lineHeight: 1.15,
        }}>{nombre}</div>
        <div style={{ fontSize: '.74rem', color: 'var(--muted)', marginTop: '.15rem' }}>{meta}</div>

        {veredicto && (
          <div style={{
            fontFamily: 'var(--font-serif)', fontStyle: 'italic',
            fontSize: '.88rem', color: scoreColor, marginTop: '.35rem',
          }}>{veredicto}</div>
        )}

        {datos && datos.length > 0 && (
          <div style={{
            display: 'flex', gap: '.7rem', marginTop: 'auto', paddingTop: '.5rem',
            fontSize: '.74rem', color: 'var(--muted)',
          }}>
            {datos.map(d => (
              <span key={d.l}>
                <strong style={{ color: 'var(--ink)', fontWeight: 700 }}>{d.v}</strong> {d.l}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  )
}
