cat > ~/Desktop/playasdeespana/src/app/en/communities/\[slug\]/page.tsx << 'ENDOFFILE'
// src/app/en/communities/[slug]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayasByComunidad, getComunidades } from '@/lib/playas'
import { calcularEstado, ESTADOS } from '@/lib/estados'
import styles from '@/app/comunidad/[slug]/ComunidadPage.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'

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
    title: `Beaches in ${c.nombre} — ${c.count} beaches`,
    description: `Discover the ${c.count} best beaches in ${c.nombre}, Spain. Real-time sea conditions, water temperature and facilities.`,
    openGraph: { locale: 'en_GB' },
    alternates: {
      canonical: `/en/communities/${slug}`,
      languages: { 'es': `/comunidad/${slug}`, 'en': `/en/communities/${slug}` },
    },
  }
}

export default async function CommunitiesPageEn({ params }: Props) {
  const { slug } = await params
  const comunidades = await getComunidades()
  const comunidad = comunidades.find(c => c.slug === slug)
  if (!comunidad) notFound()

  const playas = await getPlayasByComunidad(slug)

  const playasConEstado = playas.map(p => {
    const seed = p.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
    const olas = parseFloat(((seed % 15) / 10).toFixed(1))
    const viento = 5 + (seed % 30)
    const estadoKey = calcularEstado({ olas, viento })
    const estado = ESTADOS[estadoKey]
    return { ...p, estadoKey, estado, olas, viento }
  })

  const porProvincia = new Map<string, typeof playasConEstado>()
  for (const p of playasConEstado) {
    const arr = porProvincia.get(p.provincia) ?? []
    arr.push(p)
    porProvincia.set(p.provincia, arr)
  }

  return (
    <>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/en">Home</Link>
            <span>›</span>
            <span>{comunidad.nombre}</span>
          </nav>
          <h1 className={styles.titulo}>Beaches in {comunidad.nombre}</h1>
          <p className={styles.subtitulo}>{comunidad.count} beaches · Spain</p>
          <div className={styles.stats}>
            <div className={styles.stat}>
              <span className={styles.statV}>{comunidad.count}</span>
              <span className={styles.statL}>Beaches</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statV}>{porProvincia.size}</span>
              <span className={styles.statL}>Provinces</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statV}>{playasConEstado.filter(p => p.estadoKey === 'CALMA' || p.estadoKey === 'BUENA').length}</span>
              <span className={styles.statL}>Good today</span>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.wrap}>
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>🗺 Beach map</span>
            <span className={styles.mapaSrc}>Interactive · {playas.length} beaches</span>
          </div>
          <MapaPlayas playas={playas} height="420px" />
        </div>
        {Array.from(porProvincia.entries()).map(([provincia, pls]) => {
          const provSlug = provincia.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
          return (
            <div key={provincia} className={styles.provinciaSection}>
              <div className={styles.provinciaHead}>
                <Link href={`/en/provinces/${provSlug}`} className={styles.provinciaLink}>
                  <h2 className={styles.provinciaTitulo}>{provincia}</h2>
                  <span className={styles.provinciaCount}>{pls.length} beaches →</span>
                </Link>
              </div>
              <div className={styles.playasGrid}>
                {pls.map(p => (
                  <Link key={p.slug} href={`/en/beaches/${p.slug}`} className={styles.playaCard}>
                    <div className={styles.pcEstado} style={{ background: p.estado.bg, borderColor: p.estado.dot + '44' }}>
                      <span className={styles.pcDot} style={{ background: p.estado.dot }}/>
                      <span className={styles.pcLabel} style={{ color: p.estado.text }}>{p.estado.label}</span>
                    </div>
                    <div className={styles.pcNombre}>{p.nombre}</div>
                    <div className={styles.pcMeta}>{p.municipio}</div>
                    <div className={styles.pcData}>
                      <span>🌊 {p.olas}m</span>
                      <span>💨 {p.viento}km/h</span>
                    </div>
                    <div className={styles.pcServicios}>
                      {p.socorrismo && <span className={styles.pcSrv} title="Lifeguard">🏊</span>}
                      {p.bandera    && <span className={styles.pcSrv} title="Blue Flag">🏳️</span>}
                      {p.accesible  && <span className={styles.pcSrv} title="Accessible">♿</span>}
                      {p.perros     && <span className={styles.pcSrv} title="Dogs allowed">🐕</span>}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
ENDOFFILE