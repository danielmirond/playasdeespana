// src/app/mapa/page.tsx
import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import styles from './MapaPage.module.css'

export const metadata: Metadata = {
  title: 'Mapa de playas de España | Busca por zona, bandera y servicios',
  description: 'Mapa interactivo con más de 4.500 playas de España. Filtra por estado del mar, bandera azul y servicios, y encuentra playas cerca de ti.',
  alternates: { canonical: '/mapa' },
  openGraph: {
    type:  'website',
    title: 'Mapa interactivo de playas de España',
    images: [{ url: '/api/og?playa=Mapa%20de%20playas%20de%20Espa%C3%B1a', width: 1200, height: 630 }],
  },
}

export default function MapaPage() {
  return (
    <>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.titulo}>Mapa de playas</h1>
          <p className={styles.subtitulo}>Más de 4.500 playas · España · Estado en tiempo real</p>
        </div>
      </div>
      <div className={styles.mapaWrap}>
        <MapaPlayas height="calc(100vh - 160px)" />
      </div>
    </>
  )
}
