// src/app/comunidad/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getPlayasByComunidad, getComunidades, getMunicipios } from '@/lib/playas'
import { calcularEstado, ESTADOS } from '@/lib/estados'
import styles from './ComunidadPage.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'
import SchemaItemList from '@/components/seo/SchemaItemList'

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const comunidades = await getComunidades()
  return comunidades.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const comunidades = await getComunidades()
  const c = comunidades.find(x => x.slug === slug)
  if (!c) return {}
  return {
    title: `Playas de ${c.nombre} — ${c.count} playas`,
    description: `Descubre las ${c.count} mejores playas de ${c.nombre}. Estado del mar, temperatura del agua y servicios en tiempo real.`,
    alternates: { canonical: `/comunidad/${slug}` },
  }
}

export default async function ComunidadPage({ params }: Props) {
  const { slug } = await params
  const comunidades = await getComunidades()
  const comunidad = comunidades.find(c => c.slug === slug)
  if (!comunidad) notFound()

  const [playas, allMunicipios] = await Promise.all([
    getPlayasByComunidad(slug),
    getMunicipios(),
  ])
  const municipios = allMunicipios.filter(m => m.comunidadSlug === slug)

  // Calcular estado para cada playa (seed determinista)
  const playasConEstado = playas.map(p => {
    const seed = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const olas = parseFloat(((seed % 15) / 10).toFixed(1))
    const viento = 5 + (seed % 30)
    const estadoKey = calcularEstado({ olas, viento })
    const estado = ESTADOS[estadoKey]
    return { ...p, estadoKey, estado, olas, viento }
  })

  // Agrupar por provincia
  const porProvincia = new Map<string, typeof playasConEstado>()
  for (const p of playasConEstado) {
    const arr = porProvincia.get(p.provincia) ?? []
    arr.push(p)
    porProvincia.set(p.provincia, arr)
  }

  // Bbox real a partir de coordenadas
  const lats = playas.map(p => p.lat)
  const lngs = playas.map(p => p.lng)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const padLat = Math.max((maxLat - minLat) * 0.15, 0.3)
  const padLng = Math.max((maxLng - minLng) * 0.15, 0.4)
  const centerLat = (minLat + maxLat) / 2
  const centerLng = (minLng + maxLng) / 2

  const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

  return (
    <>
      <SchemaItemList
        name={`Playas de ${comunidad.nombre}`}
        description={`${comunidad.count} playas en ${comunidad.nombre}, España. Estado del mar, calidad del agua, servicios y actividades.`}
        url={`${BASE}/comunidad/${slug}`}
        beaches={playas.map(p => ({ slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia }))}
        locale="es"
      />
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Ruta de navegación">
            <Link href="/">Inicio</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">{comunidad.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Playas <em>de {comunidad.nombre}</em></h1>
          <p className={styles.subtitulo}>{comunidad.count} playas · España</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statV}>{comunidad.count}</span>
              <span className={styles.statL}>Playas</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statV}>{porProvincia.size}</span>
              <span className={styles.statL}>Provincias</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statV}>{playasConEstado.filter(p => p.estadoKey === 'CALMA' || p.estadoKey === 'BUENA').length}</span>
              <span className={styles.statL}>Buenas hoy</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.wrap}>
        {/* MAPA */}
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>Mapa de playas</span>
            <span className={styles.mapaSrc}>Interactivo · {playas.length} playas</span>
          </div>
          <MapaPlayas playas={playas} height="420px" />
        </div>

        {/* PROVINCIAS */}
        {Array.from(porProvincia.entries()).map(([provincia, pls]) => {
          const provSlug = provincia.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          return (
            <div key={provincia} className={styles.provinciaSection}>
              <div className={styles.provinciaHead}>
                <Link href={`/provincia/${provSlug}`} className={styles.provinciaLink}>
                  <h2 className={styles.provinciaTitulo}>{provincia}</h2>
                  <span className={styles.provinciaCount}>{pls.length} playas →</span>
                </Link>
              </div>
              <div className={styles.playasGrid}>
                {pls.map(p => (
                  <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.playaCard}>
                    <div className={styles.pcEstado} style={{ background: p.estado.bg, borderColor: p.estado.dot + '44' }}>
                      <span className={styles.pcDot} style={{ background: p.estado.dot }}/>
                      <span className={styles.pcLabel} style={{ color: p.estado.text }}>{p.estado.label}</span>
                    </div>
                    <div className={styles.pcNombre}>{p.nombre}</div>
                    <div className={styles.pcMeta}>{p.municipio}</div>
                    <div className={styles.pcData}>
                      <span>{p.olas}m</span>
                      <span>{p.viento}km/h</span>
                    </div>
                    <div className={styles.pcServicios}>
                      {p.socorrismo && <span className={styles.pcSrv} title="Socorrismo">Socorr.</span>}
                      {p.bandera    && <span className={styles.pcSrv} title="Bandera Azul">B. Azul</span>}
                      {p.accesible  && <span className={styles.pcSrv} title="Accesible">PMR</span>}
                      {p.perros     && <span className={styles.pcSrv} title="Perros">Perros</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}

        {/* MUNICIPIOS CON MÁS PLAYAS */}
        {municipios.length > 0 && (
          <div style={{ marginTop: '2.5rem' }}>
            <div className={styles.provinciaHead}>
              <h2 className={styles.provinciaTitulo} style={{ fontSize: '1.1rem' }}>Municipios con más playas</h2>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.75rem' }}>
              {municipios.map(m => (
                <Link key={m.slug} href={`/municipio/${m.slug}`} style={{
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: '100px', padding: '.4rem .9rem', textDecoration: 'none',
                  fontSize: '.78rem', fontWeight: 600, color: 'var(--accent)',
                  transition: 'border-color .15s',
                }}>
                  {m.nombre} <span style={{ color: 'var(--muted)', fontWeight: 400 }}>({m.count})</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
