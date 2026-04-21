'use client'
// src/components/playa/FichaHero.tsx
// Brand book 08 — Ficha desktop: breadcrumb + h1 + lugar (izq),
// score card con métricas (der). Ficha móvil: compacto.
import Link from 'next/link'
import FichaHeroActions from './FichaHeroActions'
import type { Playa } from '@/types'
import type { EstadoConfig } from '@/lib/estados'
import type { PlayaScore } from '@/lib/scoring'
import IluEstado from './IluEstado'
import styles from './FichaHero.module.css'
import { Drop, Waves, Sun, Wind, MapPin } from '@phosphor-icons/react'
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
}

const t = {
  es: {
    inicio: 'Inicio', agua: 'Agua', olas: 'Olas', viento: 'Viento',
    uv: 'UV', bandera: 'Bandera Azul', socorrismo: 'Socorrismo',
    accesible: 'Accesible', como: 'Cómo llegar', cercanas: '¿Mejores cerca?',
    comunidadBase: (s: string) => `/comunidad/${s}`,
  },
  en: {
    inicio: 'Home', agua: 'Water', olas: 'Waves', viento: 'Wind',
    uv: 'UV', bandera: 'Blue Flag', socorrismo: 'Lifeguard',
    accesible: 'Accessible', como: 'Directions', cercanas: 'Better nearby?',
    comunidadBase: (s: string) => `/en/communities/${s}`,
  },
}

export default function FichaHero({ playa, meteo, estado, frase, locale = 'es', municipioSlug, provinciaSlug, playaScore }: Props) {
  const i18n = t[locale]
  const slug = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  const homeHref = locale === 'en' ? '/en' : '/'
  const comunidadSlug = slug(playa.comunidad)
  const municipioHref = municipioSlug ? (locale === 'en' ? `/en/towns/${municipioSlug}` : `/municipio/${municipioSlug}`) : null
  const provinciaHref = provinciaSlug ? (locale === 'en' ? `/en/provinces/${provinciaSlug}` : `/provincia/${provinciaSlug}`) : null
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${playa.lat},${playa.lng}`

  return (
    <section className={styles.hero} style={{ background: estado.ringBg } as React.CSSProperties}>
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

      {/* Two-column grid */}
      <div className={styles.grid}>
        {/* Left — editorial */}
        <div className={styles.left}>
          <div className={styles.eyebrow}>
            {locale === 'en' ? 'Beach report · today' : 'Estado del mar · hoy'}
          </div>
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
          <div className={styles.badges}>
            {playa.bandera    && <span className={styles.badge}>{i18n.bandera}</span>}
            {playa.socorrismo && <span className={styles.badge}>{i18n.socorrismo}</span>}
            {playa.accesible  && <span className={styles.badge}>{i18n.accesible}</span>}
          </div>
          <div className={styles.actions}>
            <FichaHeroActions slug={playa.slug} nombre={playa.nombre} />
          </div>
          <div className={styles.frase}>
            <em>{locale === 'en' ? estado.fraseEn : frase}</em>
          </div>
        </div>

        {/* Right — score card */}
        <div className={styles.scoreCard}>
          <div className={styles.scoreHead}>
            <div className={styles.iluWrap}><IluEstado estado={meteo.estado} size="sm" /></div>
            {playaScore ? (
              <>
                <span className={styles.scoreNum}>{playaScore.score}</span>
                <span className={styles.scoreOf}>/100</span>
                <span className={styles.scoreVerdict} style={{ color: playaScore.color }}>
                  {locale === 'en' ? playaScore.labelEn : playaScore.label}
                </span>
              </>
            ) : (
              <span className={styles.scoreVerdict} style={{ color: estado.dot }}>
                {locale === 'en' ? estado.labelEn : estado.label}
              </span>
            )}
          </div>
          <div className={styles.scoreFrase}>
            <em>{locale === 'en' ? estado.fraseEn : frase}</em>
          </div>

          {/* Factor pills */}
          {playaScore && playaScore.factors.length > 0 && (
            <div className={styles.pills}>
              {playaScore.factors.map(f => (
                <span key={f.icon} className={styles.pill} style={{ color: f.color, borderColor: `${f.color}50` }}>
                  {locale === 'en' ? f.labelEn : f.label}
                </span>
              ))}
            </div>
          )}

          {/* Metrics 2×2 — brand book 05 "Métricas card: 2×2 grid" */}
          <div className={styles.metrics}>
            <div className={styles.m}>
              <Drop size={14} weight="fill" color="var(--accent)" aria-hidden="true" />
              <span className={styles.mv}>{meteo.agua}°C</span>
              <span className={styles.ml}>{i18n.agua}</span>
            </div>
            <div className={styles.m}>
              <Waves size={14} weight="bold" color="var(--accent)" aria-hidden="true" />
              <span className={styles.mv}>{meteo.olas}m</span>
              <span className={styles.ml}>{i18n.olas}</span>
            </div>
            <div className={styles.m}>
              <Wind size={14} weight="bold" color="var(--accent)" aria-hidden="true" />
              <span className={styles.mv}>{meteo.viento}km/h</span>
              <span className={styles.ml}>{i18n.viento}</span>
            </div>
            <div className={styles.m}>
              <Sun size={14} weight="bold" color="var(--accent)" aria-hidden="true" />
              <span className={styles.mv}>UV {meteo.uv}</span>
              <span className={styles.ml}>{i18n.uv}</span>
            </div>
          </div>

          {/* CTA */}
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className={styles.ctaLink}>
            <MapPin size={14} weight="fill" aria-hidden="true" />
            {i18n.como} →
          </a>

          {/* Nearby link */}
          <Link
            href={`/buscar?lat=${playa.lat}&lng=${playa.lng}&orden=cercanas`}
            className={styles.ctaLink}
            style={{ borderTop: 'none', color: 'var(--muted)', fontSize: '.72rem' }}
          >
            {i18n.cercanas} →
          </Link>
        </div>
      </div>
    </section>
  )
}
