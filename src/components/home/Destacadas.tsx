// src/components/home/Destacadas.tsx. Ranked beach cards: "Top hoy" + "Evita hoy"
//
// Recibe un subconjunto de playas candidatas (seleccionadas por page.tsx),
// fetcha meteo real para cada una en servidor, calcula el score 0-100 y
// renderiza:
//   - Top N (descendente por score) con score badge
//   - Bottom N (ascendente) como "Evita hoy"
import Link from 'next/link'
import Image from 'next/image'
import type { Playa } from '@/types'
import { ESTADOS } from '@/lib/estados'
import { calcularPlayaScore, type PlayaScore, type MeteoInput } from '@/lib/scoring'
import AnimatedSea from '@/components/playa/AnimatedSea'
import { getFotoThumb } from '@/lib/fotos'
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

  // Fetch fotos en paralelo solo para las playas que se van a mostrar
  // (top + avoid). Wikimedia geo, 1000m, 1 fetch por playa, ISR 24h
  // por URL gracias al revalidate del fetch interno.
  const visibles = [...top, ...avoid]
  const fotos = await Promise.all(
    visibles.map(item => getFotoThumb(item.playa.lat, item.playa.lng))
  )
  const fotoBySlug = new Map<string, string | null>(
    visibles.map((item, i) => [item.playa.slug, fotos[i]])
  )

  const GRADIENTS = [
    'linear-gradient(180deg, #c7d8dc 0%, #a3b9c0 35%, #e8d9b8 55%, #d9c7a0 100%)',
    'linear-gradient(180deg, #a3b6b8 0%, #6b8890 40%, #d4c090 60%, #b8a06a 100%)',
    'linear-gradient(180deg, #d8ccae 0%, #b5a582 45%, #9d8a62 70%, #6b5840 100%)',
    'linear-gradient(180deg, #b8c8c8 0%, #8aa4a8 35%, #c9b890 55%, #a8956c 100%)',
    'linear-gradient(180deg, #d0bba0 0%, #ac9670 40%, #826444 70%, #4e3a22 100%)',
    'linear-gradient(180deg, #c4d0d0 0%, #94adb0 30%, #b9a57c 55%, #7a6040 100%)',
  ]

  const renderCard = (item: typeof top[number], rank?: number, idx = 0) => {
    const { playa: p, ps, estado } = item
    const e = ESTADOS[estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
    const foto = fotoBySlug.get(p.slug)
    const hasPhoto = !!foto
    return (
      <Link
        key={p.slug}
        href={`${locale === 'en' ? '/en/beaches' : '/playas'}/${p.slug}`}
        className={styles.card}
        prefetch={true}
      >
        <div
          className={styles.vis}
          style={!hasPhoto ? { background: GRADIENTS[idx % GRADIENTS.length] } : undefined}
        >
          {hasPhoto ? (
            <>
              <Image
                src={foto!}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 250px"
                className={styles.photoImg}
              />
              <div className={styles.photoTint} aria-hidden="true" />
            </>
          ) : (
            <div className={styles.seaOverlay}>
              <AnimatedSea estado={estado} color="rgba(255,255,255,0.85)" tint="transparent" />
            </div>
          )}
          {rank !== undefined && (
            <span className={styles.rank} aria-label={`Posición ${rank}`}>nº{rank}</span>
          )}
          <span className={styles.scorePill} style={{ color: ps.color }}>{ps.score}</span>
        </div>
        <div className={styles.body}>
          <div className={styles.nombre}>{p.nombre}</div>
          <div className={styles.lugar}>{p.municipio} · {p.provincia}</div>
          <div className={styles.estado} style={{ color: e.dot }}>
            <span className={styles.dot} style={{ background: e.dot }}/>
            <em>{locale === 'en' ? e.labelEn.toLowerCase() : e.label.toLowerCase()}</em>
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
          {top.map((item, i) => renderCard(item, i + 1, i))}
        </div>
      </section>

      {/* EVITA HOY */}
      {avoid.length > 0 && (
        <section className={styles.section} style={{ marginTop: '2.5rem' }}>
          <div className={styles.hd}>
            <span className={styles.hdTitle} style={{ color: 'var(--sea-peligro,#7a2818)' }}>
              {locale === 'en' ? 'Avoid today' : 'Evita hoy'}
            </span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>
              {locale === 'en' ? 'Poor conditions right now' : 'Condiciones desfavorables'}
            </span>
          </div>
          <div className={styles.grid}>
            {avoid.map((item, i) => renderCard(item, undefined, i))}
          </div>
        </section>
      )}
    </>
  )
}
