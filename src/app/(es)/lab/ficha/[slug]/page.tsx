/*
 * LABORATORIO · ficha "E3 · todo en diagonal".
 *
 * No sustituye a /playas/[slug]: vive aparte, con noindex, para poder ver
 * el sistema con datos reales antes de decidir si entra en la ficha de
 * verdad. Carga solo las fuentes que el diseño enseña — foto, mar, aire,
 * calidad — en vez de las treinta y tantas de la ficha buena: lo que se
 * está probando es la maqueta, no el pipeline.
 */
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Libre_Franklin } from 'next/font/google'
import { getPlayaBySlug } from '@/lib/playas'
import { getFotos } from '@/lib/fotos'
import { getMareas } from '@/lib/marine'
import { getMeteoPlaya } from '@/lib/meteo'
import { getCalidad } from '@/lib/calidad'
import { calcularBandera } from '@/lib/seguridad'
import { nombreConPlaya } from '@/lib/geo'
import styles from './ficha-e3.module.css'

// Instanciada aquí y no en src/app/fonts.ts: es una prueba, y meterla en el
// layout compartido la serviría en las 4.329 fichas buenas para nada.
const franklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-franklin',
  display: 'swap',
  weight: ['200', '400', '500', '600'],
})

export const dynamic = 'force-static'
export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Laboratorio · ficha E3',
  robots: { index: false, follow: false },
}

/** Una cifra con coma decimal, como se escribe en español. */
const coma = (n: number, dec = 1) => n.toFixed(dec).replace('.', ',')

/** Rumbo en grados → rosa de 8 vientos, para el pie de la lámina. */
function rumbo(deg: number): string {
  const r = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
  return r[Math.round(deg / 45) % 8]
}

export default async function FichaLab({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)
  if (!playa) notFound()

  const [fotos, mar, aire, calidad] = await Promise.all([
    getFotos(playa.nombre, playa.municipio, playa.lat, playa.lng, playa.provincia, playa.slug),
    getMareas(playa.lat, playa.lng),
    getMeteoPlaya(playa.lat, playa.lng),
    getCalidad(playa.slug),
  ])

  const foto      = fotos[0] ?? null
  const tempAgua  = mar?.temp_agua?.[0] ?? null
  const oleaje    = mar?.oleaje_m?.[0] ?? null
  const periodo   = mar?.wave_period?.[0] ?? null
  const dirOla    = mar?.wave_dir?.[0] ?? null
  const bandera   = oleaje != null && aire
    ? calcularBandera(oleaje, aire.viento_kmh, aire.viento_racha)
    : null

  // Las marcas son lo MEDIDO, no lo adjetivado: cada línea lleva su cifra
  // al margen y se cae entera si el dato no ha llegado.
  const marcas: { texto: string; dato: string }[] = []
  if (tempAgua != null) marcas.push({ texto: 'Temperatura del agua en superficie.', dato: `${coma(tempAgua)} °C` })
  if (oleaje != null)   marcas.push({ texto: periodo != null ? 'Altura de ola y periodo.' : 'Altura de ola.', dato: periodo != null ? `${coma(oleaje, 1)} m · ${Math.round(periodo)} s` : `${coma(oleaje, 1)} m` })
  if (aire)             marcas.push({ texto: `Viento del ${aire.viento_dir}.`, dato: `${Math.round(aire.viento_kmh)} km/h · racha ${Math.round(aire.viento_racha)}` })
  // El UV de la hora, no "el máximo del día": de noche la API devuelve 0 y
  // una línea que dijera «máximo del día: UV 0» sería sencillamente falsa.
  if (aire?.uv_max != null && aire.uv_max >= 1) marcas.push({ texto: 'Índice ultravioleta ahora.', dato: `UV ${Math.round(aire.uv_max)}` })
  if (bandera)          marcas.push({ texto: `Bandera estimada: ${bandera.label.toLowerCase()}.`, dato: bandera.color })

  const hora = new Date().toLocaleTimeString('es-ES', {
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Madrid',
  })

  return (
    <main className={`${styles.hoja} ${franklin.variable}`}>

      {/* Cartela recta: el único bloque sin inclinar, para anclar la vista */}
      <header className={styles.cartela}>
        <p className={styles['hoja-num']}>
          {playa.municipio} · {playa.provincia} · laboratorio
        </p>
        <h1 className={styles.titulo}>
          {nombreConPlaya(playa.nombre).replace(playa.nombre, '')}
          <em>{playa.nombre}</em>
        </h1>
      </header>

      {/* La lámina: la foto recortada en el rumbo de la costa */}
      {foto && (
        <figure className={styles.lamina}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={foto.url} alt={`${playa.nombre}, en ${playa.municipio}`} />
          <svg viewBox="0 0 390 196" className={styles.trazo} aria-hidden="true" preserveAspectRatio="none">
            <polyline points="0,150 70,138 150,132 230,136 310,124 390,116" fill="none" stroke="rgba(255,255,255,.5)" strokeWidth="1" />
            <polyline points="0,108 80,96 160,92 240,98 320,86 390,80" fill="none" stroke="rgba(255,255,255,.28)" strokeWidth="1" strokeDasharray="6 5" />
          </svg>
          <figcaption className={styles.pieLamina}>
            {dirOla != null ? `Lámina I · mar de fondo del ${rumbo(dirOla)}` : 'Lámina I'}
            {foto.autor && <span className={styles.credito}> · foto: {foto.autor}</span>}
          </figcaption>
        </figure>
      )}

      {/* La banda inclinada: la caja se tuerce, la cifra no */}
      {calidad && calidad.nivel !== 'Sin datos' && (
        <section className={`${styles.banda} ${styles.indice}`} aria-label="Calidad del agua">
          <div className={styles.indiceFila}>
            <span className={styles.indiceCifra}>{calidad.temporada}</span>
            <span className={styles.indiceTexto}>
              <span className={styles.rotulo}>Clasificación EEA</span>
              <span className={styles.indiceNivel}>{calidad.nivel}</span>
            </span>
          </div>
        </section>
      )}

      {/* El agua entra en cuña bajo el texto */}
      {playa.descripcion && (
        <section className={styles.observaciones} aria-label="Observaciones">
          <div className={styles.cuna} aria-hidden="true" />
          <p className={styles.entrada}>{playa.descripcion}</p>
          <div className={styles.limpia} />
        </section>
      )}

      <div className={styles.fileteDiag} />

      {/* Las marcas: lo medido, numerado en romanos */}
      {marcas.length > 0 && (
        <section className={styles.marcasBloque} aria-label="Lo medido">
          <h2 className={styles.rotulo}>Lo medido, ahora mismo</h2>
          <ol className={styles.marcas}>
            {marcas.map(m => (
              <li key={m.texto}>
                <span className={styles.marcaTexto}>{m.texto}</span>
                <span className={styles.marcaDato}>{m.dato}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* El pie, inclinado al revés: cierra el corte que abre la lámina */}
      <footer className={`${styles.banda} ${styles.pie}`}>
        <div className={styles.pieDentro}>
          <div>
            <div className={styles.escala} aria-hidden="true" />
            <span className={styles.escalaPie}>0 · 250 · 500 m</span>
          </div>
          <p className={styles.fuentes}>
            MITECO · OPEN-METEO<br />
            {calidad ? 'EEA · ' : ''}{hora} CEST
          </p>
        </div>
      </footer>

    </main>
  )
}
