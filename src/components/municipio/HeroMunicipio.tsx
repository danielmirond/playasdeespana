// src/components/municipio/HeroMunicipio.tsx — la cabecera aprobada: la
// foto de la playa mejor equipada a sangre, la miga encima, y abajo el
// titular (o el veredicto, en «el tiempo») con el crédito de la foto. Sin
// foto con licencia, tinta lisa: nunca un degradado anónimo.
import type { ReactNode } from 'react'
import styles from './Municipio.module.css'

export default function HeroMunicipio({ foto, miga, children, veloLado = false }: {
  foto?: { url: string; autor?: string; alt: string } | null
  miga: ReactNode
  children: ReactNode
  /** Velo más oscuro abajo, para el veredicto grande de «el tiempo». */
  veloLado?: boolean
}) {
  return (
    <header className={styles.hero}>
      {foto && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={foto.url} alt={foto.alt} className={styles.heroFoto} fetchPriority="high" decoding="async" />
      )}
      <div className={veloLado ? styles.heroVeloLado : styles.heroVelo} aria-hidden="true" />
      <nav aria-label="Ruta de navegación" className={styles.heroMiga}>{miga}</nav>
      <div className={styles.heroCuerpo}>
        {children}
        {foto?.autor && <div className={styles.heroCredito}>Foto: {foto.autor}</div>}
      </div>
    </header>
  )
}
