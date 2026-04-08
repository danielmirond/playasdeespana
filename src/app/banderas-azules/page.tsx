// src/app/banderas-azules/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas, getComunidades } from '@/lib/playas'
import styles from './BanderasAzules.module.css'
import MapaPlayas from '@/components/ui/MapaPlayas'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas con Bandera Azul en España — Listado completo',
  description: 'Todas las playas con Bandera Azul de España. Calidad del agua, servicios y estado del mar en tiempo real.',
  alternates: {
    canonical: '/banderas-azules',
    languages: { 'es': '/banderas-azules', 'en': '/en/blue-flag' },
  },
}

export default async function BanderasAzulesPage() {
  const [playas, comunidades] = await Promise.all([getPlayas(), getComunidades()])
  const azules = playas.filter(p => p.bandera)

  // Agrupar por comunidad
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
          <nav className={styles.breadcrumb}>
            <Link href="/">Inicio</Link>
            <span>›</span>
            <span>Banderas Azules</span>
          </nav>
          <h1 className={styles.titulo}>🏖 Playas con Bandera Azul</h1>
          <p className={styles.subtitulo}>
            {azules.length} playas certificadas en {grupos.length} comunidades autónomas
          </p>
          <p className={styles.desc}>
            La Bandera Azul garantiza calidad del agua, gestión medioambiental, seguridad, servicios e información al usuario.
          </p>
        </div>
      </div>

      <div className={styles.wrap}>
        <div className={styles.mapaCard}>
          <div className={styles.mapaHead}>
            <span className={styles.mapaTitle}>🗺 Mapa de playas Bandera Azul</span>
            <span className={styles.mapaSrc}>{azules.length} playas</span>
          </div>
          <MapaPlayas playas={azules} height="400px" />
        </div>

        {grupos.map(g => (
          <div key={g.comunidad} className={styles.grupo}>
            <div className={styles.grupoHead}>
              <h2 className={styles.grupoTitulo}>{g.comunidad}</h2>
              <span className={styles.grupoCount}>{g.count} playas</span>
            </div>
            <div className={styles.lista}>
              {g.playas.map(p => (
                <Link key={p.slug} href={`/playas/${p.slug}`} className={styles.row}>
                  <div className={styles.rowInfo}>
                    <div className={styles.rowNombre}>{p.nombre}</div>
                    <div className={styles.rowMeta}>
                      {p.municipio} · {p.provincia}
                      {p.socorrismo && <span className={styles.badge}>🏊 Socorrismo</span>}
                      {p.accesible  && <span className={styles.badge}>♿ Accesible</span>}
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
