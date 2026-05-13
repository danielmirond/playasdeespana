// src/app/en/blue-flag/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import styles from '@/app/banderas-azules/BanderasAzules.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'
import TopBeachCardsConHero from '@/components/seo/TopBeachCardsConHero'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Blue Flag Beaches in Spain | Complete list',
  description: 'All Blue Flag certified beaches in Spain. Water quality, facilities and real-time sea conditions.',
  alternates: {
    canonical: '/en/blue-flag',
    languages: { 'es': '/banderas-azules', 'en': '/en/blue-flag' },
  },
}

export default async function BlueFlagPage() {
  const playas = await getPlayas()
  const azules = playas.filter(p => p.bandera)

  const porComunidad = new Map<string, typeof azules>()
  for (const p of azules) {
    const list = porComunidad.get(p.comunidad) ?? []
    list.push(p)
    porComunidad.set(p.comunidad, list)
  }
  const grupos = Array.from(porComunidad.entries())
    .map(([comunidad, playas]) => ({ comunidad, playas, count: playas.length }))
    .sort((a, b) => b.count - a.count)

  return (
    <>
      <Nav />

      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/en">Home</Link>
            <span aria-hidden="true">›</span>
            <span aria-current="page">Blue Flag</span>
          </nav>
          <h1 className={styles.titulo}>Blue Flag Beaches</h1>
          <p className={styles.subtitulo}>
            {azules.length} certified beaches across {grupos.length} regions
          </p>
          <p className={styles.desc}>
            The Blue Flag certification guarantees water quality, environmental management, safety, services and public information.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        {azules.filter(p => p.lat && p.lng).length >= 6 && (
          <section aria-labelledby="top-bba-en" style={{ margin: '2rem 0' }}>
            <h2 id="top-bba-en" style={{ fontFamily: 'var(--font-serif)', fontSize: '1.45rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '1rem' }}>
              A selection of <em style={{ fontWeight: 500, color: 'var(--accent)' }}>{azules.length} Blue Flag beaches</em>
            </h2>
            <TopBeachCardsConHero
              playas={azules
                .filter(p => p.lat && p.lng)
                .sort((a, b) => (b.accesible ? 1 : 0) + (b.socorrismo ? 1 : 0) - (a.accesible ? 1 : 0) - (a.socorrismo ? 1 : 0))
                .slice(0, 6)
                .map(p => ({
                  slug: p.slug, nombre: p.nombre, municipio: p.municipio, provincia: p.provincia,
                  comunidad: p.comunidad, lat: p.lat, lng: p.lng, bandera: p.bandera,
                }))}
              limit={6}
              eyebrow={`Top 6 · ${azules.length} Blue Flag beaches`}
            />
          </section>
        )}

        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>Blue Flag beaches map</span>
            <span className={styles.mapaSrc}>{azules.length} beaches</span>
          </div>
          <MapaPlayas playas={azules} height="400px" />
        </div>

        {grupos.map(g => (
          <div key={g.comunidad} className={styles.grupo}>
            <div className={styles.grupoHead}>
              <h2 className={styles.grupoTitulo}>{g.comunidad}</h2>
              <span className={styles.grupoCount}>{g.count} beaches</span>
            </div>
            <div className={styles.lista}>
              {g.playas.map(p => (
                <Link key={p.slug} href={`/en/beaches/${p.slug}`} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <div className={styles.rowNombre}>{p.nombre}</div>
                    <div className={styles.rowMeta}>
                      {p.municipio} · {p.provincia}
                      {p.socorrismo && <span className={styles.badge}>Lifeguard</span>}
                      {p.accesible  && <span className={styles.badge}>Accessible</span>}
                    </div>
                  </div>
                  <span className={styles.rowArrow}>→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
