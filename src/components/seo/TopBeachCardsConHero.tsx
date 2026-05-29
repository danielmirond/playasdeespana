// src/components/seo/TopBeachCardsConHero.tsx
// Server component reutilizable: top 10 (o N) playas como cards con
// foto hero. Usado en /playas-aguas-cristalinas, /calas-con-encanto,
// /playas-paradisiacas, /playas-secretas, /familias, /banderas-azules,
// etc. para que el primer golpe visual no sea un listado de texto.
//
// Cascada de fotos: getFotos() multi-fuente con fallback genérico por
// estado del mar (ver lib/fotos.ts). Dedupe URL para no repetir entre
// cards.

import Link from 'next/link'
import Image from 'next/image'
import { getFotos, FOTOS_GENERICAS_POR_ESTADO, type FotoPlaya } from '@/lib/fotos'
import { IS_BUILD } from '@/lib/buildGuard'

interface PlayaInput {
  slug:       string
  nombre:     string
  municipio:  string
  provincia:  string
  comunidad?: string
  lat:        number
  lng:        number
  bandera?:   boolean
  /** Score 0-100 mostrado en la pill (opcional) */
  score?:     number
  /** Etiqueta opcional bajo el nombre (ej. "Aguas cristalinas", "Cala virgen") */
  badge?:     string
  /** Estado del mar para fallback genérico (CALMA / SURF / etc.) */
  estado?:    string
}

interface Props {
  playas:     PlayaInput[]
  /** Cuántas mostrar como hero. Default 10. */
  limit?:     number
  /** Texto del eyebrow encima del grid (ej. "Top 10 · Calidad EEA + Bandera Azul") */
  eyebrow?:   string
  /** Color de las score pills (default accent) */
  scoreColor?: string
  /** Texto a mostrar bajo el nombre cuando no hay badge (ej. "{municipio} · {provincia}") */
  metaFormat?: 'mun-prov' | 'comunidad' | 'mun-comunidad'
}

export default async function TopBeachCardsConHero({
  playas,
  limit = 10,
  eyebrow,
  scoreColor = 'var(--accent, #6b400a)',
  metaFormat = 'mun-prov',
}: Props) {
  const top = playas.slice(0, limit)

  // Fetch candidatos en paralelo + dedupe greedy (mismo patrón que home Destacadas).
  // CAUSA RAÍZ de los timeouts SSG: getFotos hace una cascada de hasta 7 APIs
  // externas por playa. Con la caché KV fría durante `next build`, cada página
  // superaba 60s. Por eso reducir el nº de páginas (TOP 1/TOP 5) nunca lo arregló:
  // el problema era el tiempo POR página. En build no pedimos fotos; el fallback
  // genérico por estado del mar cubre el hero. En runtime/ISR se piden y cachean.
  const candidatos: FotoPlaya[][] = IS_BUILD
    ? top.map(() => [] as FotoPlaya[])
    : await Promise.all(
        top.map(p => getFotos(p.nombre, p.municipio, p.lat, p.lng, p.provincia))
      )
  const usadas = new Set<string>()
  const fotos: (string | null)[] = top.map((p, i) => {
    const cands = candidatos[i] ?? []
    for (const c of cands) {
      if (c?.thumb && !usadas.has(c.thumb)) {
        usadas.add(c.thumb)
        return c.thumb
      }
    }
    const pool = FOTOS_GENERICAS_POR_ESTADO[(p.estado ?? 'CALMA').toUpperCase()] ?? FOTOS_GENERICAS_POR_ESTADO.CALMA
    for (const url of pool) {
      if (!usadas.has(url)) {
        usadas.add(url)
        return url
      }
    }
    return null
  })

  return (
    <section style={{ marginBottom: '2.5rem' }}>
      {eyebrow && (
        <div style={{
          fontFamily: 'var(--font-mono, monospace)',
          fontSize: '.7rem',
          fontWeight: 600,
          letterSpacing: '.12em',
          textTransform: 'uppercase',
          color: 'var(--muted, #5a3d12)',
          marginBottom: '.85rem',
        }}>
          {eyebrow}
        </div>
      )}
      <ol style={{
        listStyle: 'none',
        padding: 0,
        margin: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '.75rem',
      }}>
        {top.map((p, i) => {
          const foto = fotos[i]
          const meta =
            metaFormat === 'comunidad'      ? p.comunidad
            : metaFormat === 'mun-comunidad' ? `${p.municipio} · ${p.comunidad}`
            : `${p.municipio} · ${p.provincia}`

          return (
            <li key={p.slug}>
              <Link
                href={`/playas/${p.slug}`}
                prefetch={false}
                style={{
                  display: 'block',
                  background: 'var(--card-bg, #faf6ef)',
                  border: '1px solid var(--line, #e8dcc8)',
                  borderRadius: 8,
                  overflow: 'hidden',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform .15s, border-color .15s',
                }}
              >
                {/* Vis 3:2 con foto */}
                <div style={{ position: 'relative', aspectRatio: '3 / 2', background: 'var(--metric-bg, #f0e6d0)', overflow: 'hidden' }}>
                  {foto ? (
                    <Image
                      src={foto}
                      alt={`Playa ${p.nombre}, ${p.municipio} (${p.provincia})`}
                      fill
                      sizes="(max-width: 640px) 50vw, 250px"
                      style={{ objectFit: 'cover', objectPosition: 'center 55%' }}
                    />
                  ) : null}
                  {/* Tinte para legibilidad de overlays */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(180deg, rgba(0,0,0,.18) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0) 60%, rgba(0,0,0,.32) 100%)',
                  }} />
                  {/* Rank */}
                  <span style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 2,
                    fontFamily: 'var(--font-serif)',
                    fontSize: '1.35rem', fontStyle: 'italic',
                    color: 'var(--arena-50, #faf4e6)',
                    textShadow: '0 1px 8px rgba(0,0,0,.5)',
                    lineHeight: 1, letterSpacing: '-.02em',
                  }}>
                    nº{i + 1}
                  </span>
                  {/* Score pill (opcional) */}
                  {p.score !== undefined && (
                    <span style={{
                      position: 'absolute', top: 10, right: 10, zIndex: 2,
                      background: 'var(--arena-50, #faf4e6)',
                      padding: '4px 10px', borderRadius: 999,
                      fontFamily: 'var(--font-serif)', fontWeight: 700,
                      fontSize: '.85rem', color: scoreColor,
                      lineHeight: 1, fontVariantNumeric: 'tabular-nums',
                    }}>
                      {p.score}
                    </span>
                  )}
                  {/* Bandera azul indicator */}
                  {p.bandera && (
                    <span style={{
                      position: 'absolute', bottom: 10, right: 10, zIndex: 2,
                      background: '#2563eb', color: '#fff',
                      padding: '2px 7px', borderRadius: 4,
                      fontSize: '.62rem', fontWeight: 700,
                      letterSpacing: '.04em', textTransform: 'uppercase',
                    }} aria-label="Bandera Azul">★</span>
                  )}
                </div>
                <div style={{ padding: '.75rem .85rem .9rem' }}>
                  <div style={{
                    fontFamily: 'var(--font-serif)',
                    fontWeight: 700,
                    fontSize: '1rem',
                    color: 'var(--ink, #2a1a08)',
                    lineHeight: 1.2,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {p.nombre}
                  </div>
                  <div style={{
                    fontSize: '.74rem',
                    color: 'var(--muted, #5a3d12)',
                    marginTop: '.2rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {p.badge ?? meta}
                  </div>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
