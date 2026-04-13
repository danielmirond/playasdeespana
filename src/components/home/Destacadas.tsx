// src/components/home/Destacadas.tsx — Ranked beach cards: "Top hoy" + "Evita hoy"
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

// ── Meteo real vía Open-Meteo (servidor) ──────────────────────────
async function fetchMeteoCard(lat: number, lng: number): Promise<MeteoInput> {
  try {
    const ahora = new Date().getHours()
    const [rMarine, rMeteo] = await Promise.all([
      fetch(
        `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}`
        + `&hourly=wave_height,sea_surface_temperature&forecast_days=1&timezone=Europe%2FMadrid`,
        { next: { revalidate: 3600 } }
      ),
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}`
        + `&hourly=wind_speed_10m,uv_index&wind_speed_unit=kmh&forecast_days=1&timezone=Europe%2FMadrid`,
        { next: { revalidate: 3600 } }
      ),
    ])

    const marine = rMarine.ok ? await rMarine.json() : null
    const meteo  = rMeteo.ok  ? await rMeteo.json()  : null

    return {
      olas:   parseFloat((marine?.hourly?.wave_height?.[ahora] ?? 0.3).toFixed(1)),
      agua:   Math.round(marine?.hourly?.sea_surface_temperature?.[ahora] ?? 18),
      viento: Math.round(meteo?.hourly?.wind_speed_10m?.[ahora] ?? 10),
      uv:     Math.round(meteo?.hourly?.uv_index?.[ahora] ?? 3),
    }
  } catch {
    return { agua: 18, olas: 0.4, viento: 10, uv: 4 }
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

// ── Score badge ───────────────────────────────────────────────────
function ScoreBadge({ ps }: { ps: PlayaScore }) {
  return (
    <div
      style={{
        position: 'absolute', top: 8, right: 8, zIndex: 3,
        background: ps.color, color: '#fff',
        fontFamily: 'var(--font-serif)', fontWeight: 900,
        fontSize: '.95rem', lineHeight: 1,
        padding: '.35rem .55rem', borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,.15)',
        display: 'flex', alignItems: 'center', gap: '.3rem',
      }}
      aria-label={`Score ${ps.score}/100 — ${ps.label}`}
    >
      {ps.score}
      <span style={{ fontSize: '.6rem', fontWeight: 600, opacity: .8 }}>/100</span>
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
  // Fetch meteo real for all candidates in parallel
  const meteos = await Promise.all(
    playas.map(p => fetchMeteoCard(p.lat, p.lng))
  )

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
          <ScoreBadge ps={ps} />
          <div className={styles.estadoPill} style={{ background: e.bg, color: e.text }}>
            <span className={styles.dot} style={{ background: e.dot }}/>
            {locale === 'en' ? e.labelEn : e.label}
          </div>
          <div className={styles.temp}>{m.agua}°</div>
          {rank !== undefined && (
            <div style={{
              position: 'absolute', top: 8, left: 8, zIndex: 3,
              background: 'rgba(0,0,0,.45)', color: '#fff',
              fontFamily: 'var(--font-serif)', fontWeight: 900,
              fontSize: '.85rem', width: 28, height: 28, borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {rank}
            </div>
          )}
        </div>
        <div className={styles.body}>
          <div className={styles.nombre}>{p.nombre}</div>
          <div className={styles.lugar}>{p.municipio} · {p.provincia}</div>
          {/* Score reasons */}
          {ps.reasons.length > 0 && (
            <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.25rem', lineHeight: 1.4 }}>
              {(locale === 'en' ? ps.reasonsEn : ps.reasons).join(' · ')}
            </div>
          )}
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
            <span className={styles.hdTitle} style={{ color: '#ef4444' }}>
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
