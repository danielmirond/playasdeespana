// src/app/mapa/page.tsx
import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import styles from './MapaPage.module.css'

export const metadata: Metadata = {
  title: 'Mapa de playas de España',
  description: 'Mapa interactivo con todas las playas de España. Filtra por estado del mar y busca playas cerca de ti.',
  alternates: { canonical: '/mapa' },
}

export default function MapaPage() {
  return (
    <>
      <Nav />
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.titulo}>Mapa de playas</h1>
          <p className={styles.subtitulo}>5.611 playas · España · Estado en tiempo real</p>
        </div>
      </div>
      <div className={styles.mapaWrap}>
        <MapaPlayas height="calc(100vh - 160px)" />
      </div>
    </>
  )
}
