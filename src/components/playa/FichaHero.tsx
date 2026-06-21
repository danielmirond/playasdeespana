'use client'
// src/components/playa/FichaHero.tsx
// Hero photo-led: foto real de la playa a sangre con contenido en overlay.
// Fallback a AnimatedSea editorial si no hay foto. Status line de avisos
// como tira independiente bajo el hero, con CTA Avisar (icono SVG, no emoji).

import Link from 'next/link'
import Image from 'next/image'
import FichaHeroActions from './FichaHeroActions'
import type { Playa } from '@/types'
import type { EstadoConfig } from '@/lib/estados'
import type { PlayaScore } from '@/lib/scoring'
import type { ReportesPlaya } from '@/lib/reportes'
import type { FotoPlaya } from '@/lib/fotos'
import AnimatedSea from './AnimatedSea'
import styles from './FichaHero.module.css'
import { MapPin, Megaphone, Waves } from '@phosphor-icons/react'
import { nombreConPlaya } from '@/lib/geo'
import { nombreMostrado, nombreOficialAside } from '@/lib/nombres-populares'

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
  foto?:          FotoPlaya | null
}

const t = {
  es: {
    inicio: 'Inicio', agua: 'agua', olas: 'olas',
    como: 'Cómo llegar', meteoMore: '+ meteo',
    comunidadBase: (s: string) => `/comunidad/${s}`,
    comoEsta: 'Cómo está hoy', avisar: 'Avisar',
    sinAvisos: 'Sin avisos',
  },
  en: {
    inicio: 'Home', agua: 'water', olas: 'waves',
    como: 'Directions', meteoMore: '+ weather',
    comunidadBase: (s: string) => `/en/communities/${s}`,
    comoEsta: 'Status today', avisar: 'Report',
    sinAvisos: 'No reports',
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
  municipioSlug, provinciaSlug, playaScore, reportes, foto,
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
  // Tinte del icono de estado para la barra inferior (fondo oscuro):
  // tonos brillantes para contraste sobre tinta-900.
  const dotColorBar = dot === 'danger' ? '#e8755e' : dot === 'warn' ? '#e6b24a' : '#5fbf7f'
  const hasPhoto = !!foto?.url
  // Nombre popular (castellano) si la playa está en idioma cooficial
  // y tiene alias curado (ej. Kontxa Hondartza → "La Concha de San
  // Sebastián"). El campo `popular` ya contiene el nombre completo
  // como lo quieras mostrar (no se concatena municipio).
  const nombrePopular = nombreMostrado(playa.slug, playa.nombre)
  const nombreOficial = nombreOficialAside(playa.slug, playa.nombre)  // null si no hay alias
  const tieneAlias    = nombreOficial !== null
  const nombreH1 = locale === 'en'
    ? playa.nombre
    : tieneAlias
      ? nombrePopular                       // alias popular tal cual (ej. "Playa de las Catedrales")
      : nombreConPlaya(playa.nombre)        // dataset name con prefijo "Playa de"

  return (
    <>
      <section
        className={`${styles.hero} ${hasPhoto ? styles.heroPhoto : styles.heroPainted}`}
        style={{ '--hero-bg': estado.tileBg, '--hero-bg-dark': estado.tileBgDark } as React.CSSProperties}
      >
        {/* Capa de fondo: foto real o SVG editorial como fallback */}
        {hasPhoto ? (
          <div className={styles.photoLayer} aria-hidden="true">
            <Image
              src={foto!.url}
              // alt descriptivo para Google Imágenes (imageQualityClick-
              // Signals). El div padre es aria-hidden para no ensuciar
              // el flujo accesible del H1 visible.
              alt={`${nombreH1} en ${playa.municipio}, ${playa.provincia}`}
              fill
              priority
              sizes="100vw"
              className={styles.photoImg}
            />
            <div className={styles.photoGradient} />
          </div>
        ) : (
          <div className={styles.seaLayer} aria-hidden="true">
            <AnimatedSea estado={meteo.estado} />
          </div>
        )}

        {/* Breadcrumb pegado arriba sobre la foto */}
        <nav className={styles.bcTop} aria-label={locale === 'en' ? 'Breadcrumb' : 'Ruta de navegación'}>
          <div className={styles.bcInner}>
            <Link href={homeHref}>{i18n.inicio}</Link>
            <span aria-hidden="true">›</span>
            <Link href={i18n.comunidadBase(comunidadSlug)}>{playa.comunidad}</Link>
            <span aria-hidden="true">›</span>
            {provinciaHref ? <Link href={provinciaHref}>{playa.provincia}</Link> : <span>{playa.provincia}</span>}
            <span aria-hidden="true">›</span>
            {municipioHref ? <Link href={municipioHref}>{playa.municipio}</Link> : <span>{playa.municipio}</span>}
            <span aria-hidden="true">›</span>
            <span aria-current="page">{playa.nombre}</span>
          </div>
        </nav>

        {/* Contenido editorial en overlay inferior */}
        <div className={styles.contentBottom}>
          <div className={styles.inner}>
            <h1 className={styles.nombre}>{nombreH1}</h1>
            {/* Nombre oficial bilingüe si difiere del popular. SEO + UX:
                refuerza ambas variantes (búsquedas en castellano y euskera/
                catalán/gallego encuentran la misma playa). */}
            {nombreOficial && locale === 'es' && (
              <p style={{
                fontSize:     '.85rem',
                fontStyle:    'italic',
                color:        'rgba(255,255,255,.85)',
                marginTop:    '.15rem',
                marginBottom: '.5rem',
              }}>
                Conocida también como <span>{nombreOficial}</span>
              </p>
            )}

            <div className={styles.scoreLine}>
              {playaScore && (
                <span className={styles.scoreNum} aria-label={`Puntuación ${playaScore.score} sobre 100`}>
                  {playaScore.score}
                </span>
              )}
              <span
                className={styles.verdictTxt}
                style={!hasPhoto ? { color: playaScore?.color ?? estado.dot } : undefined}
              >
                {playaScore
                  ? (locale === 'en' ? playaScore.labelEn : playaScore.label)
                  : (locale === 'en' ? estado.labelEn : estado.label)}
                <span className={styles.verdictSub}>{frase}</span>
              </span>
            </div>

            <div className={styles.metaLine}>
              {municipioHref
                ? <Link href={municipioHref} className={styles.metaLink}>{playa.municipio}</Link>
                : <span>{playa.municipio}</span>}
              <span className={styles.metaSep} aria-hidden="true">·</span>
              {provinciaHref
                ? <Link href={provinciaHref} className={styles.metaLink}>{playa.provincia}</Link>
                : <span>{playa.provincia}</span>}
              <span className={styles.metaSep} aria-hidden="true">·</span>
              <span><strong>{meteo.agua}°</strong> {i18n.agua}</span>
              <span className={styles.metaSep} aria-hidden="true">·</span>
              <span><strong>{meteo.olas} m</strong> {i18n.olas}</span>
              <a href="#s-meteo" className={styles.more}>{i18n.meteoMore}</a>
            </div>

            <div className={styles.actions}>
              <FichaHeroActions
                slug={playa.slug}
                nombre={playa.nombre}
                meteo={meteo}
                scoreLabel={playaScore?.label}
                theme={hasPhoto ? 'light' : 'dark'}
              />
            </div>
          </div>
        </div>

        {hasPhoto && foto?.autor && (
          <span className={styles.fotoCredito}>
            Foto: {foto.autor} · {foto.fuente}
          </span>
        )}
      </section>

      {/* Tira de avisos — fila independiente bajo el hero */}
      <div className={styles.avisosStrip} data-state={dot}>
        <div className={styles.avisosInner}>
          <span className={`${styles.dotMini} ${styles[`dot_${dot}`]}`} aria-hidden="true" />
          <span className={styles.statusTxt}>
            <strong>{i18n.comoEsta}:</strong>{' '}
            {avisos.length > 0 ? avisos.join(' · ') : i18n.sinAvisos}
          </span>
          <button
            type="button"
            className={styles.avisarCTA}
            onClick={() => window.dispatchEvent(new CustomEvent('open-reportar-drawer'))}
          >
            <Megaphone size={17} weight="bold" aria-hidden="true" />
            {i18n.avisar}
          </button>
        </div>
      </div>

      {/* Sticky bar mobile — interacción (cómo está / valora / informa) +
          cómo llegar. El primer segmento abre el drawer "¿Cómo está hoy?"
          (reportar estado + valorar); el evento lo escucha ReportarDrawer. */}
      <div className={styles.stickyMobile}>
        <button
          type="button"
          className={styles.stickyAction}
          onClick={() => window.dispatchEvent(new CustomEvent('open-reportar-drawer'))}
          aria-haspopup="dialog"
        >
          <Waves size={17} weight="bold" color={dotColorBar} aria-hidden="true" />
          {i18n.comoEsta}
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.stickyLink}
        >
          <MapPin size={16} weight="fill" aria-hidden="true" />
          {i18n.como}
        </a>
      </div>
    </>
  )
}
