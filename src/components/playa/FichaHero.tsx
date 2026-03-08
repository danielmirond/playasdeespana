// src/components/playa/FichaHero.tsx
import Link from 'next/link'
import FichaHeroActions from './FichaHeroActions'
import type { Playa } from '@/types'
import type { EstadoConfig } from '@/lib/estados'
import IluEstado from './IluEstado'
import styles from './FichaHero.module.css'

interface Meteo {
  agua: number; olas: number; viento: number
  uv: number; tempAire: number; estado: string
}
interface Props {
  playa:  Playa
  meteo:  Meteo
  estado: EstadoConfig
  frase:  string
}

export default function FichaHero({ playa, meteo, estado, frase }: Props) {
  return (
    <section className={styles.hero} style={{ '--ring': estado.ringColor, background: estado.ringBg } as React.CSSProperties}>

      {/* Anillos */}
      <div className={styles.rings} aria-hidden>
        <svg viewBox="0 0 600 500" fill="none">
          <ellipse cx="300" cy="280" rx="560" ry="440" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="440" ry="340" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="320" ry="240" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="210" ry="155" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="110" ry="80"  stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      {/* Breadcrumb */}
      <div className={styles.bc}>
        <Link href="/">Inicio</Link>
        <span>›</span>
        <Link href={`/comunidad/${playa.comunidad.toLowerCase().replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'')}`}>{playa.comunidad}</Link>
        <span>›</span>
        <span>{playa.nombre}</span>
      </div>

      <h1 className={styles.nombre}>{playa.nombre}</h1>
      <div className={styles.lugar}>
        <span>{playa.municipio}</span>
        <span className={styles.dot}>·</span>
        <span>{playa.provincia}</span>
      </div>

      {/* Badges */}
      <div className={styles.badges}>
        {playa.bandera   && <span className={styles.badge}>🏖 Bandera Azul</span>}
        {playa.socorrismo && <span className={styles.badge}>🏊 Socorrismo</span>}
        {playa.accesible  && <span className={styles.badge}>♿ Accesible</span>}
      </div>

      {/* Acciones */}
      <FichaHeroActions slug={playa.slug} nombre={playa.nombre} lat={playa.lat} lng={playa.lng} />

      {/* Ilustración */}
      <div className={styles.ilu}>
        <IluEstado estado={meteo.estado} size="lg" />
      </div>

      {/* Métricas */}
      <div className={styles.metrics}>
        <div className={styles.m}>
          <span className={styles.mi}>💧</span>
          <span className={styles.mv}>{meteo.agua}°C</span>
          <span className={styles.ml}>Agua</span>
        </div>
        <div className={styles.m}>
          <span className={styles.mi}>🌊</span>
          <span className={styles.mv}>{meteo.olas}m</span>
          <span className={styles.ml}>Olas</span>
        </div>
        <div className={styles.m}>
          <span className={styles.mi}>💨</span>
          <span className={styles.mv}>{meteo.viento}km/h</span>
          <span className={styles.ml}>Viento</span>
        </div>
        <div className={styles.m}>
          <span className={styles.mi}>☀️</span>
          <span className={styles.mv}>UV {meteo.uv}</span>
          <span className={styles.ml}>Índice</span>
        </div>
        <div className={styles.m}>
          <span className={styles.mi}>🌡</span>
          <span className={styles.mv}>{meteo.tempAire}°C</span>
          <span className={styles.ml}>Aire</span>
        </div>
      </div>

      {/* Estado */}
      <div className={styles.estadoLabel} style={{ color: estado.dot }}>{estado.label}</div>
      <div className={styles.frase}><em>{frase}</em></div>

      {/* Scroll cue */}
      <div className={styles.scrollCue}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <span>Ver ficha completa</span>
      </div>
    </section>
  )
}
