// src/components/home/Destacadas.tsx. Ranked beach cards: "Top hoy" + "Evita hoy"
//
// Recibe un subconjunto de playas candidatas (seleccionadas por page.tsx),
// fetcha meteo real para cada una en servidor, calcula el score 0-100 y
// renderiza:
//   - Top N (descendente por score) con score badge
//   - Bottom N (ascendente) como "Evita hoy"
import Link from 'next/link'
import type { Playa } from '@/types'
import { ESTADOS } from '@/lib/estados'
import { calcularPlayaScore, type PlayaScore, type MeteoInput } from '@/lib/scoring'
import styles from './Destacadas.module.css'

// ── Meteo batch vía Open-Meteo (1 request por API en vez de N) ────
// Open-Meteo acepta coordenadas separadas por coma. Esto convierte
// 96 fetches (48 playas × 2 APIs) en solo 2 fetches.
async function fetchMeteoBatch(coords: { lat: number; lng: number }[]): Promise<MeteoInput[]> {
  if (coords.length === 0) return []
  const ahora = new Date().getHours()
  const lats = coords.map(c => c.lat.toFixed(4)).join(',')
  const lngs = coords.map(c => c.lng.toFixed(4)).join(',')
  const fallback: MeteoInput = { agua: 18, olas: 0.4, viento: 10, uv: 4 }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 3000)

  try {
    const [rMarine, rMeteo] = await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lats}&longitude=${lngs}`
        + `&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`,
        { next: { revalidate: 3600 }, signal: controller.signal }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lats}&longitude=${lngs}`
        + `&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`,
        { next: { revalidate: 3600 }, signal: controller.signal }
      ),
    ])
    clearTimeout(timer)

    const marine = rMarine.ok ? await rMarine.json() : null
    const meteo  = rMeteo.ok  ? await rMeteo.json()  : null

    return coords.map((_, i) => {
      const mArr = coords.length === 1 ? marine?.hourly : marine?.[i]?.hourly
      const fArr = coords.length === 1 ? meteo?.hourly : meteo?.[i]?.hourly
      if (!mArr && !fArr) return fallback
      return {
        olas:   parseFloat((mArr?.wave_height?.[ahora] ?? 0.4).toFixed(1)),
        agua:   Math.round(mArr?.sea_surface_temperature?.[ahora] ?? 18),
        viento: Math.round(fArr?.wind_speed_10m?.[ahora] ?? 10),
        uv:     Math.round(fArr?.uv_index?.[ahora] ?? 4),
      }
    })
  } catch {
    clearTimeout(timer)
    return coords.map(() => fallback)
  }
}

function calcEstado(m: MeteoInput): string {
  if (m.olas >= 2.5 || m.viento >= 50) return 'PELIGRO'
  if (m.olas >= 1.5) return 'SURF'
  if (m.viento >= 35) return 'VIENTO'
  if (m.olas >= 0.8 || m.viento >= 25) return 'AVISO'
  if (m.olas >= 0.4 || m.viento >= 15) return 'BUENA'
  return 'CALMA'
}

// ── Score chip · pill with tinted bg (design system .score-chip) ──
function ScoreChip({ ps }: { ps: PlayaScore }) {
  return (
    <div
      style={{
        position: 'absolute', top: 10, right: 10, zIndex: 3,
        display: 'inline-flex', alignItems: 'baseline', gap: 3,
        background: `color-mix(in srgb, ${ps.color} 8%, var(--surface, #faf4e6))`,
        border: `1px solid ${ps.color}`,
        padding: '4px 9px',
        borderRadius: 'var(--r-pill, 999px)',
        fontFamily: 'var(--font-serif)', fontWeight: 700,
        fontSize: 15, letterSpacing: '-.01em',
        color: ps.color, lineHeight: 1,
      }}
      aria-label={`Score ${ps.score}/100. ${ps.label}`}
    >
      {ps.score}
      <small style={{
        fontFamily: 'var(--font-sans)', fontWeight: 500,
        fontSize: 9, color: 'var(--muted)',
        letterSpacing: '.04em',
      }}>/100</small>
    </div>
  )
}

// ── Mini ilu (kept from original) ─────────────────────────────────
function IluCard({ estado }: { estado: string }) {
  if (estado === 'CALMA' || estado === 'BUENA') return (
    <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
      <rect x="5" y="60" width="100" height="8" rx="2" fill="#c4884a" opacity=".5"/>
      <rect x="0" y="66" width="110" height="14" fill="#c4884a" opacity=".7"/>
      <path d="M5,62 C15,57 28,63 42,59 C56,55 70,62 84,58 C96,55 104,60 110,57" fill="none" stroke="#a8cce0" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
      <path d="M40,60 A15,15 0 0,1 70,60" fill="#e8a030" opacity=".9"/>
      <circle cx="55" cy="60" r="12" fill="#e8a030"/>
      <circle cx="55" cy="60" r="9"  fill="#f5be40"/>
      <line x1="55" y1="38" x2="55" y2="44" stroke="#e8a030" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  )
  if (estado === 'PELIGRO') return (
    <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
      <path d="M0,52 C8,42 18,54 28,44 C38,34 50,50 62,40 C74,30 86,46 98,38 L110,36 L110,80 L0,80Z" fill="#7a9ab0" opacity=".3"/>
      <path d="M0,64 C14,56 28,66 44,58 C60,50 76,62 92,55 L110,52 L110,80 L0,80Z" fill="#7a9ab0" opacity=".5"/>
      <line x1="46" y1="12" x2="64" y2="28" stroke="#8a2020" strokeWidth="2.5" strokeLinecap="round" opacity=".55"/>
      <line x1="64" y1="12" x2="46" y2="28" stroke="#8a2020" strokeWidth="2.5" strokeLinecap="round" opacity=".55"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 110 80" fill="none" aria-hidden="true">
      <path d="M0,50 C10,40 22,52 34,42 C46,32 58,48 70,38 C82,28 96,44 110,36 L110,80 L0,80Z" fill="#6a9ab8" opacity=".25"/>
      <path d="M0,62 C15,54 30,64 46,56 C62,48 78,60 94,53 L110,50 L110,80 L0,80Z" fill="#6a9ab8" opacity=".45"/>
      <polygon points="55,8 62,22 48,22" fill="#e8a030" opacity=".7"/>
    </svg>
  )
}

interface Props {
  locale?: 'es' | 'en'
  playas: Playa[]
  topCount?: number
  avoidCount?: number
}

export default async function Destacadas({ playas, topCount = 8, avoidCount = 4, locale = 'es' }: Props) {
  // Batch fetch: 2 requests total instead of N×2
  const meteos = await fetchMeteoBatch(playas.map(p => ({ lat: p.lat, lng: p.lng })))

  // Score each playa
  const scored = playas.map((p, i) => {
    const m = meteos[i]
    const ps = calcularPlayaScore(p, m)
    const estado = calcEstado(m)
    return { playa: p, meteo: m, ps, estado }
  }).sort((a, b) => b.ps.score - a.ps.score)

  const top   = scored.slice(0, topCount)
  const avoid = scored.filter(s => s.ps.score < 45).slice(-avoidCount).reverse()

  const renderCard = (item: typeof top[number], rank?: number) => {
    const { playa: p, meteo: m, ps, estado } = item
    const e = ESTADOS[estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
    return (
      <Link
        key={p.slug}
        href={`${locale === 'en' ? '/en/beaches' : '/playas'}/${p.slug}`}
        className={styles.card}
        prefetch={true}
      >
        <div className={styles.vis}>
          <div className={styles.visIlu}><IluCard estado={estado}/></div>
          <ScoreChip ps={ps} />
          <div className={styles.estadoPill} style={{ background: e.bg, color: e.text }}>
            <span className={styles.dot} style={{ background: e.dot }}/>
            {locale === 'en' ? e.labelEn : e.label}
          </div>
          {rank !== undefined && (
            <div style={{
              position: 'absolute', top: 10, left: 12, zIndex: 3,
              fontFamily: 'var(--font-serif)', fontStyle: 'italic',
              fontWeight: 400,
              fontSize: '1.35rem', color: '#2a1a08',
              lineHeight: 1,
              letterSpacing: '-.02em',
            }}
            aria-label={`Posición ${rank}`}
            >
              n°{rank}
            </div>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.lugar}>{p.municipio} · {p.provincia}</div>
          <div className={styles.nombre}>{p.nombre}</div>
          <div className={styles.datos}>
            <div className={styles.dato}>
              <span className={styles.datoV}>{m.olas}m</span>
              <span className={styles.datoL}>{locale === 'en' ? 'Waves' : 'Olas'}</span>
            </div>
            <div className={styles.dato}>
              <span className={styles.datoV}>{m.viento}km/h</span>
              <span className={styles.datoL}>{locale === 'en' ? 'Wind' : 'Viento'}</span>
            </div>
            <div className={styles.dato}>
              <span className={styles.datoV}>UV {m.uv}</span>
              <span className={styles.datoL}>UV</span>
            </div>
          </div>
          <div className={styles.foot}>
            <div className={styles.badges}>
              {p.bandera    && <span className={styles.badge}>{locale === 'en' ? 'Blue Flag' : 'B. Azul'}</span>}
              {p.socorrismo && <span className={styles.badge}>{locale === 'en' ? 'Lifeguard' : 'Socorr.'}</span>}
              {p.accesible  && <span className={`${styles.badge} ${styles.badgeVerde}`}><abbr title={locale === 'en' ? 'Reduced mobility access' : 'Personas con movilidad reducida'}>PMR</abbr></span>}
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.arrow} aria-hidden="true">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
            </svg>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      {/* TOP PLAYAS HOY */}
      <section className={styles.section}>
        <div className={styles.hd}>
          <span className={styles.hdTitle}>
            {locale === 'en' ? 'Best beaches right now' : 'Top playas hoy'}
          </span>
          <Link href="/buscar?orden=score" className={styles.hdAction}>
            {locale === 'en' ? 'See all →' : 'Ver todas →'}
          </Link>
        </div>
        <div className={styles.grid}>
          {top.map((item, i) => renderCard(item, i + 1))}
        </div>
      </section>

      {/* EVITA HOY */}
      {avoid.length > 0 && (
        <section className={styles.section} style={{ marginTop: '2.5rem' }}>
          <div className={styles.hd}>
            <span className={styles.hdTitle} style={{ color: '#7a2818' }}>
              {locale === 'en' ? 'Avoid today' : 'Evita hoy'}
            </span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              {locale === 'en' ? 'Poor conditions right now' : 'Condiciones desfavorables'}
            </span>
          </div>
          <div className={styles.grid}>
            {avoid.map(item => renderCard(item))}
          </div>
        </section>
      )}
    </>
  )
}
