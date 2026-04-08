'use client'
// src/components/playa/FichaHero.tsx
import Link from 'next/link'
import FichaHeroActions from './FichaHeroActions'
import type { Playa } from '@/types'
import type { EstadoConfig } from '@/lib/estados'
import IluEstado from './IluEstado'
import styles from './FichaHero.module.css'
import { Drop, Waves, Sun, Wind, Thermometer, Umbrella } from '@phosphor-icons/react'
import { nombreConPlaya } from '@/lib/geo'

interface Meteo {
  agua: number; olas: number; viento: number
  uv: number; tempAire: number; estado: string
}
interface Props {
  playa:   Playa
  meteo:   Meteo
  estado:  EstadoConfig
  frase:   string
  locale?: 'es' | 'en'
}

const t = {
  es: {
    inicio:        'Inicio',
    agua:          'Agua',
    olas:          'Olas',
    viento:        'Viento',
    indice:        'Índice',
    aire:          'Aire',
    bandera:       'Bandera Azul',
    socorrismo:    '🏊 Socorrismo',
    accesible:     '♿ Accesible',
    verFicha:      'Ver ficha completa',
    comunidadBase: (slug: string) => `/comunidad/${slug}`,
  },
  en: {
    inicio:        'Home',
    agua:          'Water',
    olas:          'Waves',
    viento:        'Wind',
    indice:        'Index',
    aire:          'Air',
    bandera:       'Blue Flag',
    socorrismo:    '🏊 Lifeguard',
    accesible:     '♿ Accessible',
    verFicha:      'View full beach info',
    comunidadBase: (slug: string) => `/en/communities/${slug}`,
  },
}

export default function FichaHero({ playa, meteo, estado, frase, locale = 'es' }: Props) {
  const i18n = t[locale]
  const comunidadSlug = playa.comunidad.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const homeHref = locale === 'en' ? '/en' : '/'

  return (
    <section className={styles.hero} style={{ '--ring': estado.ringColor, background: estado.ringBg } as React.CSSProperties}>
      <div className={styles.rings} aria-hidden>
        <svg viewBox="0 0 600 500" fill="none">
          <ellipse cx="300" cy="280" rx="560" ry="440" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="440" ry="340" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="320" ry="240" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="210" ry="155" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="300" cy="280" rx="110" ry="80"  stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>
      <div className={styles.bc}>
        <Link href={homeHref}>{i18n.inicio}</Link>
        <span>›</span>
        <Link href={i18n.comunidadBase(comunidadSlug)}>{playa.comunidad}</Link>
        <span>›</span>
        <span>{playa.nombre}</span>
      </div>
      <h1 className={styles.nombre}>{locale === 'en' ? `${playa.nombre} today — ${playa.municipio}` : `${nombreConPlaya(playa.nombre)} hoy — ${playa.municipio}`}</h1>
      <div className={styles.lugar}>
        <span>{playa.municipio}</span>
        <span className={styles.dot}>·</span>
        <span>{playa.provincia}</span>
      </div>
      <div className={styles.badges}>
        {playa.bandera    && <span className={styles.badge}>{i18n.bandera}</span>}
        {playa.socorrismo && <span className={styles.badge}>{i18n.socorrismo}</span>}
        {playa.accesible  && <span className={styles.badge}>{i18n.accesible}</span>}
      </div>
      <FichaHeroActions slug={playa.slug} nombre={playa.nombre} />
      <div className={styles.ilu}>
        <IluEstado estado={meteo.estado} size="lg" />
      </div>
      <div className={styles.metrics}>
        <div className={styles.m}>
          <Drop size={15} weight='fill' color='var(--accent,#b06820)'/>
          <span className={styles.mv}>{meteo.agua}°C</span>
          <span className={styles.ml}>{i18n.agua}</span>
        </div>
        <div className={styles.m}>
          <Waves size={15} weight='bold' color='var(--accent,#b06820)'/>
          <span className={styles.mv}>{meteo.olas}m</span>
          <span className={styles.ml}>{i18n.olas}</span>
        </div>
        <div className={styles.m}>
          <span className={styles.mi}>💨</span>
          <span className={styles.mv}>{meteo.viento}km/h</span>
          <span className={styles.ml}>{i18n.viento}</span>
        </div>
        <div className={styles.m}>
          <Sun size={15} weight='bold' color='var(--accent,#b06820)'/>
          <span className={styles.mv}>UV {meteo.uv}</span>
          <span className={styles.ml}>{i18n.indice}</span>
        </div>
        <div className={styles.m}>
          <span className={styles.mi}>🌡</span>
          <span className={styles.mv}>{meteo.tempAire}°C</span>
          <span className={styles.ml}>{i18n.aire}</span>
        </div>
      </div>
      <div className={styles.estadoLabel} style={{ color: estado.dot }}>{locale === 'en' ? estado.labelEn : estado.label}</div>
      <div className={styles.frase}><em>{locale === 'en' ? estado.fraseEn : frase}</em></div>
      <div className={styles.scrollCue}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <path d="M6 9l6 6 6-6"/>
        </svg>
        <span>{i18n.verFicha}</span>
      </div>
    </section>
  )
}
