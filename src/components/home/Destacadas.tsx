// src/components/home/Destacadas.tsx
import Link from 'next/link'
import type { Playa } from '@/types'
import { ESTADOS } from '@/lib/estados'
import styles from './Destacadas.module.css'

// ── Meteo real vía Open-Meteo (servidor) ──────────────────────────
interface MeteoCard {
  agua:   number
  olas:   number
  viento: number
  uv:     number
  estado: string
}

async function fetchMeteoCard(lat: number, lng: number): Promise<MeteoCard> {
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

    const olas   = parseFloat((marine?.hourly?.wave_height?.[ahora] ?? 0.3).toFixed(1))
    const agua   = Math.round(marine?.hourly?.sea_surface_temperature?.[ahora] ?? 18)
    const viento = Math.round(meteo?.hourly?.wind_speed_10m?.[ahora] ?? 10)
    const uv     = Math.round(meteo?.hourly?.uv_index?.[ahora] ?? 3)

    const estado =
      olas >= 2.5 || viento >= 50 ? 'PELIGRO' :
      olas >= 1.5                  ? 'SURF'    :
      viento >= 35                 ? 'VIENTO'  :
      olas >= 0.8 || viento >= 25  ? 'AVISO'   :
      olas >= 0.4 || viento >= 15  ? 'BUENA'   : 'CALMA'

    return { agua, olas, viento, uv, estado }
  } catch {
    return { agua: 18, olas: 0.4, viento: 10, uv: 4, estado: 'CALMA' }
  }
}

// ── Ilustración compacta ──────────────────────────────────────────
function IluCard({ estado }: { estado: string }) {
  if (estado === 'CALMA' || estado === 'BUENA') return (
    <svg viewBox="0 0 110 80" fill="none">
      <rect x="5" y="60" width="100" height="8" rx="2" fill="#c4884a" opacity=".5"/>
      <rect x="0" y="66" width="110" height="14" fill="#c4884a" opacity=".7"/>
      <path d="M5,62 C15,57 28,63 42,59 C56,55 70,62 84,58 C96,55 104,60 110,57" fill="none" stroke="#a8cce0" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
      <path d="M40,60 A15,15 0 0,1 70,60" fill="#e8a030" opacity=".9"/>
      <circle cx="55" cy="60" r="12" fill="#e8a030"/>
      <circle cx="55" cy="60" r="9"  fill="#f5be40"/>
      <line x1="55" y1="38" x2="55" y2="44" stroke="#e8a030" strokeWidth="2" strokeLinecap="round"/>
      <line x1="37" y1="44" x2="41" y2="49" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <line x1="73" y1="44" x2="69" y2="49" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
    </svg>
  )
  if (estado === 'SURF') return (
    <svg viewBox="0 0 110 80" fill="none">
      <path d="M0,40 C8,28 18,42 28,32 C38,22 50,38 64,26 C76,16 90,36 110,24 L110,80 L0,80Z" fill="#2e7bb4" opacity=".25"/>
      <path d="M0,56 C14,46 28,58 44,48 C60,38 78,54 110,44 L110,80 L0,80Z" fill="#2e7bb4" opacity=".4"/>
      <path d="M4,42 Q16,30 28,40" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
      <path d="M62,58 L56,36 L64,30 L72,50Z" fill="#f5be40" opacity=".7"/>
    </svg>
  )
  if (estado === 'PELIGRO') return (
    <svg viewBox="0 0 110 80" fill="none">
      <path d="M0,52 C8,42 18,54 28,44 C38,34 50,50 62,40 C74,30 86,46 98,38 L110,36 L110,80 L0,80Z" fill="#7a9ab0" opacity=".3"/>
      <path d="M0,64 C14,56 28,66 44,58 C60,50 76,62 92,55 L110,52 L110,80 L0,80Z" fill="#7a9ab0" opacity=".5"/>
      <line x1="46" y1="12" x2="64" y2="28" stroke="#8a2020" strokeWidth="2.5" strokeLinecap="round" opacity=".55"/>
      <line x1="64" y1="12" x2="46" y2="28" stroke="#8a2020" strokeWidth="2.5" strokeLinecap="round" opacity=".55"/>
    </svg>
  )
  return (
    <svg viewBox="0 0 110 80" fill="none">
      <path d="M0,50 C10,40 22,52 34,42 C46,32 58,48 70,38 C82,28 96,44 110,36 L110,80 L0,80Z" fill="#6a9ab8" opacity=".25"/>
      <path d="M0,62 C15,54 30,64 46,56 C62,48 78,60 94,53 L110,50 L110,80 L0,80Z" fill="#6a9ab8" opacity=".45"/>
      <polygon points="55,8 62,22 48,22" fill="#e8a030" opacity=".7"/>
    </svg>
  )
}

interface Props {
  locale?: 'es' | 'en'
  playas: Playa[]
  titulo?: string
}

export default async function Destacadas({ playas, titulo = 'Playas destacadas', locale = 'es' }: Props) {
  // Cargar meteo real para las primeras 12 en paralelo
  const meteos = await Promise.all(
    playas.slice(0, 12).map(p => fetchMeteoCard(p.lat, p.lng))
  )

  return (
    <section className={styles.section}>
      <div className={styles.hd}>
        <span className={styles.hdTitle}>{titulo}</span>
        <Link href="/mapa" className={styles.hdAction}>{locale === 'en' ? 'View map →' : 'Ver mapa →'}</Link>
      </div>

      <div className={styles.grid}>
        {playas.length === 0 && (
          <p className={styles.empty}>No hay playas cargadas.</p>
        )}
        {playas.slice(0, 12).map((p, i) => {
          const m = meteos[i] ?? { agua: 18, olas: 0.4, viento: 10, uv: 4, estado: 'CALMA' }
          const e = ESTADOS[m.estado as keyof typeof ESTADOS] ?? ESTADOS.CALMA
          return (
            <Link
              key={p.slug}
              href={`${locale === 'en' ? '/en/beaches' : '/playas'}/${p.slug}`}
              className={styles.card}
              prefetch={true}
            >
              <div className={styles.vis}>
                <div className={styles.visIlu}><IluCard estado={m.estado}/></div>
                <div className={styles.estadoPill} style={{ background: e.bg, color: e.text }}>
                  <span className={styles.dot} style={{ background: e.dot }}/>
                  {locale === 'en' ? e.labelEn : e.label}
                </div>
                <div className={styles.temp}>{m.agua}°</div>
              </div>
              <div className={styles.body}>
                <div className={styles.nombre}>{p.nombre}</div>
                <div className={styles.lugar}>{p.municipio} · {p.provincia}</div>
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
                    {p.bandera    && <span className={styles.badge}>{locale === 'en' ? 'Blue Flag' : 'Bandera Azul'}</span>}
                    {p.socorrismo && <span className={styles.badge}>{locale === 'en' ? 'Lifeguard' : 'Socorrismo'}</span>}
                    {p.accesible  && <span className={`${styles.badge} ${styles.badgeVerde}`}>PMR</span>}
                  </div>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={styles.arrow}>
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12,5 19,12 12,19"/>
                  </svg>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
