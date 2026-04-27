'use client'
// src/components/playa/FichaHero.tsx
// Editorial single-column hero. AnimatedSea promoted to right column.
// Status line con avisos (reportes 24h) integrada bajo las quick stats.

import Link from 'next/link'
import FichaHeroActions from './FichaHeroActions'
import type { Playa } from '@/types'
import type { EstadoConfig } from '@/lib/estados'
import type { PlayaScore } from '@/lib/scoring'
import type { ReportesPlaya } from '@/lib/reportes'
import AnimatedSea from './AnimatedSea'
import styles from './FichaHero.module.css'
import { MapPin } from '@phosphor-icons/react'
import { nombreConPlaya } from '@/lib/geo'

interface Meteo {
  agua: number; olas: number; viento: number
  uv: number; tempAire: number; estado: string
}
interface Props {
  playa:          Playa
  meteo:          Meteo
  estado:         EstadoConfig
  frase:          string
  locale?:        'es' | 'en'
  municipioSlug?: string
  provinciaSlug?: string
  playaScore?:    PlayaScore
  reportes?:      ReportesPlaya | null
}

const t = {
  es: {
    inicio: 'Inicio', agua: 'agua', olas: 'olas',
    como: 'Cómo llegar', meteoMore: '+ meteo',
    comunidadBase: (s: string) => `/comunidad/${s}`,
    comoEsta: 'Cómo está hoy', avisar: '+ avisar',
    sinAvisos: 'Sin avisos hoy.',
  },
  en: {
    inicio: 'Home', agua: 'water', olas: 'waves',
    como: 'Directions', meteoMore: '+ weather',
    comunidadBase: (s: string) => `/en/communities/${s}`,
    comoEsta: 'Status today', avisar: '+ report',
    sinAvisos: 'No reports today.',
  },
}

function reportesActivos(r: ReportesPlaya | null | undefined, locale: 'es' | 'en'): string[] {
  if (!r || r.total === 0) return []
  const out: string[] = []
  if (r.bandera_roja > 0)     out.push(locale === 'en' ? 'red flag'        : 'bandera roja')
  if (r.bandera_amarilla > 0) out.push(locale === 'en' ? 'yellow flag'     : 'bandera amarilla')
  if (r.medusas > 0)          out.push(locale === 'en' ? 'jellyfish'       : 'medusas')
  if (r.mucho_oleaje > 0)     out.push(locale === 'en' ? 'high waves'      : 'mucho oleaje')
  if (r.mucho_viento > 0)     out.push(locale === 'en' ? 'strong wind'     : 'mucho viento')
  if (r.parking_dificil > 0)  out.push(locale === 'en' ? 'parking issues'  : 'parking difícil')
  if (r.acceso_roto > 0)      out.push(locale === 'en' ? 'broken access'   : 'acceso roto')
  return out
}

function statusDot(r: ReportesPlaya | null | undefined): 'ok' | 'warn' | 'danger' {
  if (!r || r.total === 0) return 'ok'
  if (r.bandera_roja > 0) return 'danger'
  if (r.medusas > 0 || r.mucho_oleaje > 0 || r.bandera_amarilla > 0) return 'warn'
  return 'ok'
}

export default function FichaHero({
  playa, meteo, estado, frase, locale = 'es',
  municipioSlug, provinciaSlug, playaScore, reportes,
}: Props) {
  const i18n = t[locale]
  const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const homeHref = locale === 'en' ? '/en' : '/'
  const comunidadSlug = slug(playa.comunidad)
  const municipioHref = municipioSlug ? (locale === 'en' ? `/en/towns/${municipioSlug}` : `/municipio/${municipioSlug}`) : null
  const provinciaHref = provinciaSlug ? (locale === 'en' ? `/en/provinces/${provinciaSlug}` : `/provincia/${provinciaSlug}`) : null
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${playa.lat},${playa.lng}`

  const avisos = reportesActivos(reportes, locale)
  const dot = statusDot(reportes)

  return (
    <section
      className={styles.hero}
      style={{ '--hero-bg': estado.tileBg, '--hero-bg-dark': estado.tileBgDark } as React.CSSProperties}
    >
      {/* Breadcrumb */}
      <nav className={styles.bc} aria-label={locale === 'en' ? 'Breadcrumb' : 'Ruta de navegación'}>
        <Link href={homeHref}>{i18n.inicio}</Link>
        <span aria-hidden="true">›</span>
        <Link href={i18n.comunidadBase(comunidadSlug)}>{playa.comunidad}</Link>
        <span aria-hidden="true">›</span>
        {provinciaHref ? <Link href={provinciaHref}>{playa.provincia}</Link> : <span>{playa.provincia}</span>}
        <span aria-hidden="true">›</span>
        {municipioHref ? <Link href={municipioHref}>{playa.municipio}</Link> : <span>{playa.municipio}</span>}
        <span aria-hidden="true">›</span>
        <span aria-current="page">{playa.nombre}</span>
      </nav>

      {/* Two columns: editorial left + AnimatedSea right */}
      <div className={styles.grid}>
        <div className={styles.left}>
          <h1 className={styles.nombre}>
            {locale === 'en' ? playa.nombre : nombreConPlaya(playa.nombre)}
          </h1>
          <div className={styles.lugar}>
            {municipioHref
              ? <Link href={municipioHref} className={styles.lugarLink}>{playa.municipio}</Link>
              : <span>{playa.municipio}</span>}
            <span className={styles.dot} aria-hidden="true">·</span>
            {provinciaHref
              ? <Link href={provinciaHref} className={styles.lugarLink}>{playa.provincia}</Link>
              : <span>{playa.provincia}</span>}
          </div>

          {/* Score editorial inline + verdict */}
          <div className={styles.verdictRow}>
            {playaScore ? (
              <>
                <span className={styles.scoreNum}>{playaScore.score}</span>
                <span className={styles.verdictTxt} style={{ color: playaScore.color }}>
                  {locale === 'en' ? playaScore.labelEn : playaScore.label}
                  <span className={styles.verdictSub}>{frase}</span>
                </span>
              </>
            ) : (
              <span className={styles.verdictTxt} style={{ color: estado.dot }}>
                {locale === 'en' ? estado.labelEn : estado.label}
                <span className={styles.verdictSub}>{frase}</span>
              </span>
            )}
          </div>

          {/* Quick stats: solo agua + olas */}
          <div className={styles.quickStats}>
            <span><strong>{meteo.agua}°</strong> {i18n.agua}</span>
            <span className={styles.qDiv} aria-hidden="true">·</span>
            <span><strong>{meteo.olas} m</strong> {i18n.olas}</span>
            <a href="#s-meteo" className={styles.more}>{i18n.meteoMore}</a>
          </div>

          {/* Status line: avisos 24h + trigger reportar */}
          <div className={styles.statusLine} data-state={dot}>
            <span className={`${styles.dotMini} ${styles[`dot_${dot}`]}`} aria-hidden="true" />
            <span className={styles.statusTxt}>
              <strong>{i18n.comoEsta}:</strong>{' '}
              {avisos.length > 0 ? avisos.join(' · ') : i18n.sinAvisos}
            </span>
            {/* el trigger del drawer lo añade FichaBody/Drawer en commit 2.
                Por ahora link al ancla del módulo de reportes. */}
            <a href="#s-reportar" className={styles.linkBtn}>{i18n.avisar}</a>
          </div>

          <div className={styles.actions}>
            <FichaHeroActions slug={playa.slug} nombre={playa.nombre} meteo={meteo} scoreLabel={playaScore?.label} />
          </div>
        </div>

        {/* Atmósfera animada — antes era capa de fondo, ahora columna derecha */}
        <div className={styles.atmos} aria-hidden="true">
          <AnimatedSea estado={meteo.estado} />
        </div>
      </div>

      {/* Sticky CTA mobile. brand book 08: "CTA sticky bottom Cómo llegar" */}
      <a
        href={mapsUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.stickyMobile}
      >
        <MapPin size={16} weight="fill" aria-hidden="true" />
        {i18n.como}
      </a>
    </section>
  )
}
