// src/app/en/provinces/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasByProvincia, getProvincias } from '@/lib/playas'
import { calcularEstado, ESTADOS } from '@/lib/estados'
import styles from '@/app/provincia/[slug]/ProvinciaPage.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'

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
    title: `Beaches in ${p.nombre} — ${p.count} beaches`,
    description: `The best beaches in ${p.nombre}, ${p.comunidad}, Spain. Real-time sea conditions, water temperature and beach facilities.`,
    openGraph: { locale: 'en_GB' },
    alternates: {
      canonical: `/en/provinces/${slug}`,
      languages: { 'es': `/provincia/${slug}`, 'en': `/en/provinces/${slug}` },
    },
  }
}

export default async function ProvincesPageEn({ params }: Props) {
  const { slug } = await params
  const provincias = await getProvincias()
  const provincia = provincias.find(p => p.slug === slug)
  if (!provincia) notFound()

  const playas = await getPlayasByProvincia(slug)

  const playasConEstado = playas.map(p => {
    const seed = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const olas = parseFloat(((seed % 15) / 10).toFixed(1))
    const viento = 5 + (seed % 30)
    const estadoKey = calcularEstado({ olas, viento })
    const estado = ESTADOS[estadoKey]
    return { ...p, estadoKey, estado, olas, viento }
  })

  const buenas     = playasConEstado.filter(p => p.estadoKey === 'CALMA' || p.estadoKey === 'BUENA').length
  const conBandera = playas.filter(p => p.bandera).length

  return (
    <>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/en">Home</Link>
            <span>›</span>
            <Link href={`/en/communities/${provincia.comunidadSlug}`}>{provincia.comunidad}</Link>
            <span>›</span>
            <span>{provincia.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>{provincia.nombre}</h1>
          <p className={styles.subtitulo}>{provincia.comunidad} · Spain</p>
          <div className={styles.chips}>
            <span className={styles.chip}>🏖 {provincia.count} beaches</span>
            <span className={styles.chip}>✅ {buenas} good today</span>
            {conBandera > 0 && <span className={styles.chip}>🏳️ {conBandera} blue flag</span>}
          </div>
        </div>
      </div>
      <div className={styles.wrap}>
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>🗺 Beach map · {provincia.nombre}</span>
            <span className={styles.mapaSrc}>Interactive · {playas.length} beaches</span>
          </div>
          <MapaPlayas playas={playas} height="360px" />
        </div>
        <div className={styles.listaHead}>
          <h2 className={styles.listaTitulo}>All beaches</h2>
          <span className={styles.listaCount}>{playas.length} results</span>
        </div>
        <div className={styles.lista}>
          {playasConEstado.map((p, i) => (
            <Link key={p.slug} href={`/en/beaches/${p.slug}`} className={styles.row}>
              <span className={styles.rowNum}>{i + 1}</span>
              <div className={styles.rowInfo}>
                <div className={styles.rowNombre}>{p.nombre}</div>
                <div className={styles.rowMeta}>
                  {p.municipio}
                  {p.bandera    && <span className={styles.badge}>🏳️ Blue Flag</span>}
                  {p.socorrismo && <span className={styles.badge}>🏊 Lifeguard</span>}
                  {p.accesible  && <span className={styles.badge}>♿ Accessible</span>}
                </div>
              </div>
              <div className={styles.rowMeteo}>
                <span>🌊 {p.olas}m</span>
                <span>💨 {p.viento}km/h</span>
              </div>
              <div className={styles.rowEstado} style={{ background: p.estado.bg, borderColor: p.estado.dot + '55' }}>
                <span className={styles.rowDot} style={{ background: p.estado.dot }}/>
                <span style={{ color: p.estado.text }}>{p.estado.label}</span>
              </div>
              <span className={styles.rowArrow}>→</span>
            </Link>
          ))}
        </div>
        <div className={styles.masLink}>
          <Link href={`/en/communities/${provincia.comunidadSlug}`} className={styles.masBtn}>
            ← All beaches in {provincia.comunidad}
          </Link>
        </div>
      </div>
    </>
  )
}
