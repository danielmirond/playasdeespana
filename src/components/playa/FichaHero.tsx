'use client'
// src/components/playa/FichaHero.tsx
import Link from 'next/link'
import FichaHeroActions from './FichaHeroActions'
import type { Playa } from '@/types'
import type { EstadoConfig } from '@/lib/estados'
import type { PlayaScore } from '@/lib/scoring'
import IluEstado from './IluEstado'
import styles from './FichaHero.module.css'
import { Drop, Waves, Sun, Wind, Thermometer } from '@phosphor-icons/react'
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
  /**
   * Slug del municipio si la página existe (municipio con ≥4 playas).
   * Cuando se pasa, el nombre del municipio en el hero se renderiza como
   * enlace a `/municipio/{slug}` (o `/en/towns/{slug}`). Si es undefined
   * se renderiza como texto plano.
   */
  municipioSlug?: string
  /**
   * Slug de la provincia. Siempre presente para playas con provincia
   * asignada. Enlaza a `/provincia/{slug}` (o `/en/provinces/{slug}`).
   */
  provinciaSlug?: string
  /** Score 0-100 calculado en tiempo real con meteo + servicios. */
  playaScore?: PlayaScore
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
    socorrismo:    'Socorrismo',
    accesible:     'Accesible',
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
    socorrismo:    'Lifeguard',
    accesible:     'Accessible',
    verFicha:      'View full beach info',
    comunidadBase: (slug: string) => `/en/communities/${slug}`,
  },
}

export default function FichaHero({ playa, meteo, estado, frase, locale = 'es', municipioSlug, provinciaSlug, playaScore }: Props) {
  const i18n = t[locale]
  const comunidadSlug = playa.comunidad.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const homeHref = locale === 'en' ? '/en' : '/'
  // Solo enlazamos el municipio si la página existe (pasa minPlayas). Cuando
  // municipioSlug coincide con provinciaSlug (p. ej. Cádiz/Cádiz) las dos
  // <Link> siguen siendo distintas porque van a /municipio/... y /provincia/...
  const municipioHref = municipioSlug
    ? (locale === 'en' ? `/en/towns/${municipioSlug}` : `/municipio/${municipioSlug}`)
    : null
  const provinciaHref = provinciaSlug
    ? (locale === 'en' ? `/en/provinces/${provinciaSlug}` : `/provincia/${provinciaSlug}`)
    : null

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
      <nav className={styles.bc} aria-label={locale === 'en' ? 'Breadcrumb' : 'Ruta de navegación'}>
        <Link href={homeHref}>{i18n.inicio}</Link>
        <span aria-hidden="true">›</span>
        <Link href={i18n.comunidadBase(comunidadSlug)}>{playa.comunidad}</Link>
        <span aria-hidden="true">›</span>
        {provinciaHref
          ? <Link href={provinciaHref}>{playa.provincia}</Link>
          : <span>{playa.provincia}</span>}
        <span aria-hidden="true">›</span>
        {municipioHref
          ? <Link href={municipioHref}>{playa.municipio}</Link>
          : <span>{playa.municipio}</span>}
        <span aria-hidden="true">›</span>
        <span aria-current="page">{playa.nombre}</span>
      </nav>
      <h1 className={styles.nombre}>{locale === 'en' ? `${playa.nombre} today — ${playa.municipio}` : `${nombreConPlaya(playa.nombre)} hoy — ${playa.municipio}`}</h1>

      {/* Score badge — "¿Ir hoy?" */}
      {playaScore && (
        <div style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', gap: '.65rem',
          justifyContent: 'center', flexWrap: 'wrap',
          marginBottom: '.6rem',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.45rem',
            background: 'rgba(255,255,255,.65)',
            backdropFilter: 'blur(8px)',
            border: `2px solid ${playaScore.color}50`,
            borderRadius: 14, padding: '.55rem 1rem',
          }}>
            <span style={{
              background: playaScore.color, color: '#fff',
              fontFamily: 'var(--font-serif)', fontWeight: 900,
              fontSize: '1.25rem', lineHeight: 1,
              padding: '.4rem .6rem', borderRadius: 10,
              display: 'inline-flex', alignItems: 'center', gap: '.25rem',
            }}>
              {playaScore.score}
              <span style={{ fontSize: '.65rem', fontWeight: 600, opacity: .8 }}>/100</span>
            </span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '.95rem', color: playaScore.color, lineHeight: 1.1 }}>
                {locale === 'en' ? playaScore.labelEn : playaScore.label}
              </div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.2 }}>
                {locale === 'en' ? 'Score today' : 'Puntuación hoy'}
              </div>
            </div>
          </div>
          {/* Factor pills */}
          {playaScore.factors.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.3rem', justifyContent: 'center' }}>
              {playaScore.factors.map(f => (
                <span key={f.icon} style={{
                  fontSize: '.72rem', fontWeight: 700, color: f.color,
                  background: `rgba(255,255,255,.7)`,
                  border: `1.5px solid ${f.color}50`,
                  padding: '.25rem .55rem', borderRadius: 8,
                  backdropFilter: 'blur(4px)',
                  whiteSpace: 'nowrap',
                }}>
                  {locale === 'en' ? f.labelEn : f.label}
                </span>
              ))}
            </div>
          )}
          {/* CTA: ver mejores playas cercanas */}
          <Link
            href={`/buscar?lat=${playa.lat}&lng=${playa.lng}&orden=cercanas`}
            style={{
              fontSize: '.78rem', fontWeight: 700,
              color: 'var(--accent)',
              background: 'rgba(255,255,255,.65)',
              backdropFilter: 'blur(4px)',
              border: '1.5px solid var(--line)',
              borderRadius: 8, padding: '.4rem .8rem',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            {locale === 'en' ? '📍 Better beaches nearby?' : '📍 ¿Hay mejores playas cerca?'}
          </Link>
        </div>
      )}

      <div className={styles.lugar}>
        {municipioHref
          ? <Link href={municipioHref} className={styles.lugarLink}>{playa.municipio}</Link>
          : <span>{playa.municipio}</span>}
        <span className={styles.dot} aria-hidden="true">·</span>
        {provinciaHref
          ? <Link href={provinciaHref} className={styles.lugarLink}>{playa.provincia}</Link>
          : <span>{playa.provincia}</span>}
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
          <Drop size={15} weight='fill' color='var(--accent,#6b400a)'/>
          <span className={styles.mv}>{meteo.agua}°C</span>
          <span className={styles.ml}>{i18n.agua}</span>
        </div>
        <div className={styles.m}>
          <Waves size={15} weight='bold' color='var(--accent,#6b400a)'/>
          <span className={styles.mv}>{meteo.olas}m</span>
          <span className={styles.ml}>{i18n.olas}</span>
        </div>
        <div className={styles.m}>
          <Wind size={15} weight='bold' color='var(--accent,#6b400a)'/>
          <span className={styles.mv}>{meteo.viento}km/h</span>
          <span className={styles.ml}>{i18n.viento}</span>
        </div>
        <div className={styles.m}>
          <Sun size={15} weight='bold' color='var(--accent,#6b400a)'/>
          <span className={styles.mv}>UV {meteo.uv}</span>
          <span className={styles.ml}>{i18n.indice}</span>
        </div>
        <div className={styles.m}>
          <Thermometer size={15} weight='bold' color='var(--accent,#6b400a)'/>
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
