'use client'
// src/components/home/BoatRentalCTA.tsx
// CTA para alquiler de barcos - sección prominente en home
// Posiciona experiencias marinas como complemento a la búsqueda de playas

import Link from 'next/link'
import { Sailboat, Anchor, MapPin, ArrowRight } from '@phosphor-icons/react/dist/ssr'
import styles from './BoatRentalCTA.module.css'

interface Props {
  locale?: 'es' | 'en'
}

export default function BoatRentalCTA({ locale = 'es' }: Props) {
  const es = locale === 'es'

  const features = es ? [
    { icon: MapPin, label: 'Playas accesibles por barco', desc: 'Descubre calas y playas secretas' },
    { icon: Anchor, label: 'Amarraderos recomendados', desc: 'Los mejores puntos de fondeo' },
    { icon: Sailboat, label: '3 plataformas de alquiler', desc: 'SamBoat, Nautal, ClickBoat' },
  ] : [
    { icon: MapPin, label: 'Beaches accessible by boat', desc: 'Discover secret coves' },
    { icon: Anchor, label: 'Recommended moorings', desc: 'Best anchorages' },
    { icon: Sailboat, label: '3 rental platforms', desc: 'SamBoat, Nautal, ClickBoat' },
  ]

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Contenido izquierdo */}
        <div className={styles.leftContent}>
          <div className={styles.label}>
            <Sailboat size={28} color="#6363ed" weight="fill" aria-hidden="true" />
            <span>
              {es ? 'Experiencias marinas' : 'Maritime experiences'}
            </span>
          </div>

          <h2>
            {es
              ? 'Alquila un barco y navega las mejores playas de España'
              : 'Rent a boat and explore Spain\'s best beaches'}
          </h2>

          <p>
            {es
              ? 'Accede a calas secretas, amarraderos recomendados y explora la costa como nunca antes. Comparamos precios en las mejores plataformas de alquiler.'
              : 'Access secret coves, recommended moorings and explore the coast like never before. We compare prices on the best rental platforms.'}
          </p>

          <Link
            href={es ? '/alquiler-barco' : '/en/boat-rental'}
            className={styles.cta}
          >
            {es ? 'Explorar alquiler de barcos' : 'Explore boat rentals'}
            <ArrowRight size={16} weight="bold" aria-hidden="true" />
          </Link>
        </div>

        {/* Grid de características derecha */}
        <div className={styles.rightContent}>
          {features.map(f => {
            const Icon = f.icon
            return (
              <div
                key={f.label}
                className={styles.featureCard}
              >
                <div className={styles.featureIcon}>
                  <Icon size={22} color="#6363ed" weight="bold" aria-hidden="true" />
                </div>
                <div>
                  <div className={styles.featureLabel}>
                    {f.label}
                  </div>
                  <div className={styles.featureDesc}>
                    {f.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
