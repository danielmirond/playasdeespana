// src/app/provincia/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getPlayasByProvincia, getProvincias, getMunicipios } from '@/lib/playas'
import { calcularEstado, ESTADOS } from '@/lib/estados'
import styles from './ProvinciaPage.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'
import SchemaItemList from '@/components/seo/SchemaItemList'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const provincias = await getProvincias()
  return provincias.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const provincias = await getProvincias()
  const p = provincias.find(x => x.slug === slug)
  if (!p) return {}
  return {
    title: `Playas de ${p.nombre} — ${p.count} playas`,
    description: `Las mejores playas de ${p.nombre}, ${p.comunidad}. Estado del mar y condiciones en tiempo real.`,
    alternates: { canonical: `/provincia/${slug}` },
  }
}

export default async function ProvinciaPage({ params }: Props) {
  const { slug } = await params
  const provincias = await getProvincias()
  const provincia = provincias.find(p => p.slug === slug)
  if (!provincia) notFound()

  const [playas, allMunicipios] = await Promise.all([
    getPlayasByProvincia(slug),
    getMunicipios(),
  ])
  const municipios = allMunicipios.filter(m => m.provinciaSlug === slug)

  const playasConEstado = playas.map(p => {
    const seed = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const olas = parseFloat(((seed % 15) / 10).toFixed(1))
    const viento = 5 + (seed % 30)
    const estadoKey = calcularEstado({ olas, viento })
    const estado = ESTADOS[estadoKey]
    return { ...p, estadoKey, estado, olas, viento }
  })

  const lats = playas.map(p => p.lat)
  const lngs = playas.map(p => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const padLat = Math.max((maxLat - minLat) * 0.2, 0.2)
  const padLng = Math.max((maxLng - minLng) * 0.2, 0.3)

  const buenas = playasConEstado.filter(p => p.estadoKey === 'CALMA' || p.estadoKey === 'BUENA').length
  const conBandera = playas.filter(p => p.bandera).length

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

  return (
    <>
      <SchemaItemList
        name={`Playas de ${provincia.nombre}`}
        description={`${playas.length} playas en la provincia de ${provincia.nombre}, España. Estado del mar, calidad y servicios.`}
        url={`${BASE}/provincia/${slug}`}
        beaches={playas.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />

      {/* BREADCRUMB + HERO */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <Link href={`/comunidad/${provincia.comunidadSlug}`}>{provincia.comunidad}</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{provincia.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>{provincia.nombre}</h1>
          <p className={styles.subtitulo}>{provincia.comunidad} · España</p>
          <div className={styles.chips}>
            <span className={styles.chip}>{provincia.count} playas</span>
            <span className={styles.chip}>{buenas} buenas hoy</span>
            {conBandera > 0 && <span className={styles.chip}>{conBandera} bandera azul</span>}
          </div>
        </div>
      </div>

      <div className={styles.wrap}>
        {/* MAPA */}
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>Mapa de playas · {provincia.nombre}</span>
            <span className={styles.mapaSrc}>Interactivo · {playas.length} playas</span>
          </div>
          <MapaPlayas playas={playas} height="360px" />
        </div>

        {/* LISTA PLAYAS */}
        <div className={styles.listaHead}>
          <h2 className={styles.listaTitulo}>Todas las playas</h2>
          <span className={styles.listaCount}>{playas.length} resultados</span>
        </div>

        <div className={styles.lista}>
          {playasConEstado.map((p, i) => (
            <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
              <span className={styles.rowNum}>{i + 1}</span>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>{p.nombre}</div>
                <div className={styles.rowMeta}>
                  {p.municipio}
                  {p.bandera    && <span className={styles.badge}>Bandera Azul</span>}
                  {p.socorrismo && <span className={styles.badge}>Socorrismo</span>}
                  {p.accesible  && <span className={styles.badge}>PMR</span>}
                </div>
              </div>
              <div className={styles.rowMeteo}>
                <span>{p.olas}m</span>
                <span>{p.viento}km/h</span>
              </div>
              <div className={styles.rowEstado} style={{ background: p.estado.bg, borderColor: p.estado.dot + '55' }}>
                <span className={styles.rowDot} style={{ background: p.estado.dot }}/>
                <span style={{ color: p.estado.text }}>{p.estado.label}</span>
              </div>
              <span className={styles.rowArrow}>→</span>
            </Link>
          ))}
        </div>

        {/* MUNICIPIOS CON MÁS PLAYAS */}
        {municipios.length > 0 && (
          <>
            <div className={styles.listaHead} style={{ marginTop: '2.5rem' }}>
              <h2 className={styles.listaTitulo}>Municipios con más playas</h2>
              <span className={styles.listaCount}>{municipios.length} municipios</span>
            </div>
            <div className={styles.lista}>
              {municipios.map(m => (
                <Link key={m.slug} href={`/municipio/${m.slug}`} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <div className={styles.rowNombre}>{m.nombre}</div>
                    <div className={styles.rowMeta}>{m.count} playas</div>
                  </div>
                  <span className={styles.rowArrow}>→</span>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* OTRAS PROVINCIAS DE LA COMUNIDAD */}
        <div className={styles.masLink}>
          <Link href={`/comunidad/${provincia.comunidadSlug}`} className={styles.masBtn}>
            ← Ver todas las playas de {provincia.comunidad}
          </Link>
        </div>
      </div>
    </>
  )
}
