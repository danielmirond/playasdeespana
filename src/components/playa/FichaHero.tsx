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
import { Flag, MapPin, Megaphone, Waves } from '@phosphor-icons/react'
import { nombreConPlaya } from '@/lib/geo'
import { nombreMostrado, nombreOficialAside } from '@/lib/nombres-populares'
import { hayBanderaRoja } from '@/lib/bandera-roja'
import type { BanderaPlaya } from '@/lib/seguridad'
import RejillaMediciones from './RejillaMediciones'

interface Meteo {
  agua: number | null; olas: number | null; viento: number | null
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
  /** La bandera vigente. Con roja, el hero cambia de forma — ver abajo. */
  banderaPlaya?:  BanderaPlaya | null
  /**
   * De dónde sale esa bandera. El hero la usa para decidir el PESO del
   * icono, no su color: rellena si la izó alguien (socorrismo, AEMET),
   * hueca si la ha deducido nuestro modelo del oleaje y el viento.
   *
   * Es la misma convención que el resto de la ficha —«glifo relleno =
   * sensor, hueco = modelo», globals.css— y aquí importa más que en
   * ningún otro sitio: una bandera de color en el hero se lee como
   * veredicto, y un veredicto que en realidad es una estimación es
   * exactamente el error que este trabajo vino a corregir.
   */
  certBandera?:   'medido' | 'oficial' | 'reportado' | 'estimado' | 'sindato'
  /**
   * Qué sistema visual está activo. Llega como prop y no se lee aquí
   * porque este componente es de cliente y los flags se resuelven en
   * servidor: leerlos aquí obligaría a exponerlos al bundle con
   * NEXT_PUBLIC_, y a que el cliente pudiera discrepar del servidor.
   */
  variante?:      'litoral' | 'arena'
}

const t = {
  es: {
    inicio: 'Inicio', agua: 'agua', olas: 'olas', viento: 'viento', uv: 'UV',
    como: 'Cómo llegar', meteoMore: '+ meteo',
    comunidadBase: (s: string) => `/comunidad/${s}`,
    comoEsta: 'Cómo está hoy', avisar: 'Avisar',
    sinAvisos: 'Sin avisos',
  },
  en: {
    inicio: 'Home', agua: 'water', olas: 'waves', viento: 'wind', uv: 'UV',
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

// Estilo de los segmentos de la barra inferior móvil. Inline para no
// depender del CSS module (icono + texto SIEMPRE en línea y centrados).
const SEG_STYLE: React.CSSProperties = {
  flex: '1 1 0',
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.45rem',
  minHeight: 52, padding: '.85rem .75rem',
  color: 'var(--arena-50)',
  background: 'transparent', border: 'none',
  fontFamily: 'inherit', fontSize: 'inherit', fontWeight: 'inherit',
  textDecoration: 'none', cursor: 'pointer', whiteSpace: 'nowrap',
  WebkitTapHighlightColor: 'transparent',
}
const SEG_STYLE_BTN: React.CSSProperties = {
  ...SEG_STYLE,
  borderRight: '1px solid var(--tinta-700)',
}

function statusDot(r: ReportesPlaya | null | undefined): 'ok' | 'warn' | 'danger' {
  if (!r || r.total === 0) return 'ok'
  if (r.bandera_roja > 0) return 'danger'
  if (r.medusas > 0 || r.mucho_oleaje > 0 || r.bandera_amarilla > 0) return 'warn'
  return 'ok'
}

export default function FichaHero({
  playa, meteo, estado, frase, locale = 'es',
  municipioSlug, provinciaSlug, playaScore, reportes, foto, banderaPlaya,
  certBandera = 'estimado',
  variante = 'arena',
}: Props) {
  const i18n = t[locale]
  // El criterio vive en lib/bandera-roja, no aquí: es el mismo que decide
  // qué bloques de afiliación se retiran en FichaBody, y tiene que ser uno.
  const rojo = hayBanderaRoja(banderaPlaya)   // type guard: dentro, no es null
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
  // Agua y olas del hero salen SIEMPRE del modelo de Open-Meteo: el dato
  // medido por boya vive, con su trazo sólido, en la tarjeta de seguridad.
  // No mentimos el grado de confianza por quedar mejor.
  const certMeteo = 'estimado'
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
        style={{
          '--hero-bg': estado.tileBg,
          '--hero-bg-dark': estado.tileBgDark,
          // C7: el tinte multiply toma el color del estado del mar, no un
          // tono decorativo. Así la misma playa se ve distinta en calma
          // que en temporal, y eso es información.
          '--hero-estado': estado.dot,
        } as React.CSSProperties}
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
            {/* C7. Siempre en el DOM; quien decide si pintan es el CSS,
                según el flag en <html>. Este componente es de cliente y no
                puede leer flags — y el manual pide justamente eso: «hacerlo
                por data-flags en CSS donde sea posible». Sin el flag las dos
                capas son transparentes y no cuestan nada. */}
            <div className={styles.photoTint} />
            <div className={styles.photoVineta} />
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

            {/* Bifurcación del hero. Con bandera roja el score NO se
                renderiza: ni pequeño, ni en rojo, ni degradado. Una cifra
                invita a negociar con una prohibición —«23, bueno, tampoco
                es 5»—, y una bandera roja es binaria. La pantalla también.

                El alcance es este hero y solo este: en una tarjeta de
                ranking o de «cerca de aquí» el 23 sí se pinta, porque ahí
                la cifra sirve para comparar y no está sustituyendo a una
                prohibición. */}
            {rojo ? (
              <div className={styles.noBanyo} role="alert">
                <span className={styles.noBanyoTitulo}>
                  <Flag size={19} weight="fill" aria-hidden="true" />
                  {locale === 'en' ? 'Do not swim' : 'No te bañes'}
                </span>
                <span className={styles.noBanyoMotivo}>
                  {locale === 'en' ? banderaPlaya.motivoEn : banderaPlaya.motivo}
                </span>
              </div>
            ) : (
              <div className={styles.scoreLine}>
                {/* Bandera del día, discreta, junto al score.
                    La roja no pasa por aquí: tiene su propio bloque
                    arriba, y repetirla la abarataría.

                    Dos reglas la gobiernan:
                    · El COLOR dice qué bandera ondea.
                    · El PESO dice quién lo dice. Rellena = la izó alguien;
                      hueca = la ha deducido nuestro modelo. Sin esa
                      distinción, un icono de color convierte una
                      estimación en un permiso, que es justo lo que hacía
                      la ficha cuando decía "BUENA" en una playa con el
                      baño prohibido por E. coli.
                    · Y si no hay dato, no hay icono. Un hueco es honesto. */}
                {banderaPlaya && certBandera !== 'sindato' && (
                  <span
                    className={styles.banderaIcono}
                    style={{ color: banderaPlaya.hex }}
                    title={locale === 'en' ? banderaPlaya.motivoEn : banderaPlaya.motivo}
                  >
                    <Flag
                      size="1em"      /* escala con el veredicto, no fijo */
                      weight={certBandera === 'oficial' || certBandera === 'medido' ? 'fill' : 'regular'}
                      aria-hidden="true"
                    />
                    <span className={styles.banderaSr}>
                      {locale === 'en' ? banderaPlaya.labelEn : banderaPlaya.label}
                      {' — '}
                      {locale === 'en' ? banderaPlaya.motivoEn : banderaPlaya.motivo}
                    </span>
                  </span>
                )}
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
            )}

            {/* Metadatos: cinco → tres en móvil (propuesta 2026 §5.2).
                Municipio y provincia ya están en las migas y se repiten en
                la primera tarjeta; en el hero solo queda lo del DÍA —
                agua, olas y el enlace a meteo. Cada medición lleva su
                trazo de certeza: sobre foto pasa a blanco, porque ahí el
                color no distingue pero el patrón sí. */}
            <div className={styles.metaLine}>
              <span className={styles.metaGeo}>
                {municipioHref
                  ? <Link href={municipioHref} className={styles.metaLink}>{playa.municipio}</Link>
                  : <span>{playa.municipio}</span>}
                <span className={styles.metaSep} aria-hidden="true">·</span>
                {provinciaHref
                  ? <Link href={provinciaHref} className={styles.metaLink}>{playa.provincia}</Link>
                  : <span>{playa.provincia}</span>}
                <span className={styles.metaSep} aria-hidden="true">·</span>
              </span>
              {/* Chips solo con dato real: sin fetch no se inventa 18°/0 m.
                  Bajo Litoral las mediciones salen de la línea de metadatos
                  y pasan a la rejilla 2×2 de abajo, que es donde el sistema
                  las quiere: con etiqueta, trazo de certeza y antigüedad.
                  Aquí se quedan solo la geografía y el enlace a meteo. */}
              {variante === 'arena' && meteo.agua != null && (
                <span>
                  <strong className={hasPhoto ? 'dato dato-ondark' : 'dato'} data-cert={certMeteo}>{meteo.agua}°</strong> {i18n.agua}
                </span>
              )}
              {variante === 'arena' && meteo.olas != null && (<>
                <span className={styles.metaSep} aria-hidden="true">·</span>
                <span>
                  <strong className={hasPhoto ? 'dato dato-ondark' : 'dato'} data-cert={certMeteo}>{meteo.olas} m</strong> {i18n.olas}
                </span>
              </>)}
              <a href="#s-meteo" className={styles.more}>{i18n.meteoMore}</a>
            </div>

            {/* Rejilla 2×2. Solo bajo Litoral: en Arena las dos mediciones
                siguen en la línea de arriba y meter aquí una malla sería
                duplicarlas. La certeza es la misma para las cuatro porque
                salen del mismo fetch de meteo; cuando cada una tenga su
                procedencia, este es el sitio donde se nota. */}
            {variante === 'litoral' && (
              <RejillaMediciones
                onDark={hasPhoto}
                mediciones={[
                  { etiqueta: i18n.agua,   valor: meteo.agua ?? null,   unidad: '°',    cert: certMeteo },
                  { etiqueta: i18n.olas,   valor: meteo.olas ?? null,   unidad: 'm',    cert: certMeteo },
                  { etiqueta: i18n.viento, valor: meteo.viento ?? null, unidad: 'km/h', cert: certMeteo },
                  { etiqueta: i18n.uv,     valor: meteo.uv ?? null,     unidad: '',     cert: certMeteo },
                ]}
              />
            )}

            <div className={styles.actions}>
              <FichaHeroActions
                slug={playa.slug}
                nombre={playa.nombre}
                municipio={playa.municipio}
                provincia={playa.provincia}
                comunidad={playa.comunidad}
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
          style={SEG_STYLE_BTN}
          onClick={() => window.dispatchEvent(new CustomEvent('open-reportar-drawer'))}
          aria-haspopup="dialog"
        >
          <Waves size={17} weight="bold" color={dotColorBar} aria-hidden="true" style={{ flexShrink: 0 }} />
          {i18n.comoEsta}
        </button>
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.stickyLink}
          style={SEG_STYLE}
        >
          <MapPin size={16} weight="fill" aria-hidden="true" style={{ flexShrink: 0 }} />
          {i18n.como}
        </a>
      </div>
    </>
  )
}
