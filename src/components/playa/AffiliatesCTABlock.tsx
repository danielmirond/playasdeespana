'use client'
// src/components/playa/AffiliatesCTABlock.tsx
// Bloque unificado de CTAs afiliados con tabs por categoría
// Evita dispersión visual de Booking, TheFork, Civitatis, RentalCars, Pitchup

import { useState } from 'react'
import { ForkKnife, Bed, Car, Tent, Compass } from '@phosphor-icons/react'
import styles from './FichaBody.module.css'

interface Props {
  playa: { nombre: string; municipio: string; lat: number; lng: number; slug: string }
  affiliates: {
    booking?: string
    thefork?: string
    civitatis?: string
    rentalcars?: string
    pitchup?: string
  }
  locale?: 'es' | 'en'
}

type TabId = 'comer' | 'dormir' | 'transporte' | 'campings' | 'actividades'

const TABS: Array<{ id: TabId; label: { es: string; en: string }; icon: React.ReactNode }> = [
  { id: 'comer', label: { es: 'Comer', en: 'Eat' }, icon: <ForkKnife size={16} weight="bold" /> },
  { id: 'dormir', label: { es: 'Dormir', en: 'Sleep' }, icon: <Bed size={16} weight="bold" /> },
  { id: 'transporte', label: { es: 'Transporte', en: 'Transport' }, icon: <Car size={16} weight="bold" /> },
  { id: 'campings', label: { es: 'Campings', en: 'Camping' }, icon: <Tent size={16} weight="bold" /> },
  { id: 'actividades', label: { es: 'Actividades', en: 'Activities' }, icon: <Compass size={16} weight="bold" /> },
]

export default function AffiliatesCTABlock({ playa, affiliates, locale = 'es' }: Props) {
  const [activeTab, setActiveTab] = useState<TabId>('comer')
  const es = locale === 'es'

  // Filtrar tabs disponibles según qué affiliates están configurados
  const availableTabs = TABS.filter(tab => {
    if (tab.id === 'comer') return !!affiliates.thefork
    if (tab.id === 'dormir') return !!affiliates.booking
    if (tab.id === 'transporte') return !!affiliates.rentalcars
    if (tab.id === 'campings') return !!affiliates.pitchup || !!affiliates.booking
    if (tab.id === 'actividades') return !!affiliates.civitatis
    return false
  })

  if (availableTabs.length === 0) return null

  // Actualizar tab activo si el actual no está disponible
  if (!availableTabs.find(t => t.id === activeTab)) {
    setActiveTab(availableTabs[0]?.id || 'comer')
  }

  return (
    <div className={styles.card} style={{ marginTop: '1.5rem' }}>
      <div className={styles.cardHead}>
        <h2 className={styles.cardTitle}>{es ? '🎯 Reserva ahora' : '🎯 Book now'}</h2>
        <span className={styles.cardSrc} style={{ fontSize: '.7rem', opacity: 0.7 }}>
          {es ? 'Enlaces afiliados' : 'Affiliate links'}
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '.5rem',
        borderBottom: '1px solid var(--line, #e8dcc8)',
        padding: '0 1rem 0.5rem 1rem',
        overflowX: 'auto',
        scrollSnapType: 'x mandatory',
      }}>
        {availableTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '.4rem',
              padding: '.5rem 1rem',
              border: 'none',
              background: activeTab === tab.id ? 'var(--accent, #d48a1a)' : 'transparent',
              color: activeTab === tab.id ? '#fff' : 'var(--ink, #000)',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: '.85rem',
              fontWeight: activeTab === tab.id ? 700 : 500,
              transition: 'all 200ms ease',
              whiteSpace: 'nowrap',
              scrollSnapAlign: 'start',
            }}
          >
            {tab.icon}
            {tab.label[locale]}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {activeTab === 'comer' && affiliates.thefork && (
          <a
            href={`https://www.thefork.es/search?cityId=&geoSlug=&q=${encodeURIComponent(playa.municipio)}&partner=${affiliates.thefork}`}
            target="_blank" rel="noopener noreferrer sponsored"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              width: '100%', padding: '.75rem', background: '#00665c', color: '#fff',
              borderRadius: 6, fontSize: '.9rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <ForkKnife size={18} weight="bold" />
            {es ? `Reservar mesa en ${playa.municipio}` : `Book a table in ${playa.municipio}`}
          </a>
        )}

        {activeTab === 'dormir' && affiliates.booking && (
          <a
            href={`https://www.booking.com/searchresults.html?aid=${affiliates.booking}&label=playa-${playa.slug}&latitude=${playa.lat}&longitude=${playa.lng}&radius=5`}
            target="_blank" rel="noopener noreferrer sponsored"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              width: '100%', padding: '.75rem', background: '#003580', color: '#fff',
              borderRadius: 6, fontSize: '.9rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Bed size={18} weight="bold" />
            {es ? `Buscar hoteles en ${playa.municipio}` : `Search hotels in ${playa.municipio}`}
          </a>
        )}

        {activeTab === 'transporte' && affiliates.rentalcars && (
          <a
            href={`https://www.rentalcars.com/search-results?latitude=${playa.lat}&longitude=${playa.lng}&affiliateCode=${affiliates.rentalcars}`}
            target="_blank" rel="noopener noreferrer sponsored"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              width: '100%', padding: '.75rem', background: '#FF6B00', color: '#fff',
              borderRadius: 6, fontSize: '.9rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Car size={18} weight="bold" />
            {es ? `Alquilar coche` : `Rent a car`}
          </a>
        )}

        {activeTab === 'campings' && (
          <>
            {affiliates.pitchup ? (
              <a
                href={`https://www.pitchup.com/search/results.html?country=es&search=${encodeURIComponent(playa.municipio)}`}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  width: '100%', padding: '.75rem', background: '#27AE60', color: '#fff',
                  borderRadius: 6, fontSize: '.9rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                <Tent size={18} weight="bold" />
                {es ? `Buscar campings en Pitchup` : `Search campsites on Pitchup`}
              </a>
            ) : affiliates.booking ? (
              <a
                href={`https://www.booking.com/searchresults.html?aid=${affiliates.booking}&label=camping-${playa.slug}&latitude=${playa.lat}&longitude=${playa.lng}&radius=10&nflt=privacy_type%3D3`}
                target="_blank" rel="noopener noreferrer sponsored"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  width: '100%', padding: '.75rem', background: '#003580', color: '#fff',
                  borderRadius: 6, fontSize: '.9rem', fontWeight: 700, textDecoration: 'none',
                }}
              >
                <Tent size={18} weight="bold" />
                {es ? `Buscar campings en Booking` : `Search campsites on Booking`}
              </a>
            ) : null}
          </>
        )}

        {activeTab === 'actividades' && affiliates.civitatis && (
          <a
            href={`https://www.civitatis.com/es/${playa.municipio.toLowerCase().replace(/\s+/g, '-')}/?aid=${affiliates.civitatis}`}
            target="_blank" rel="noopener noreferrer sponsored"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem',
              width: '100%', padding: '.75rem', background: '#0066CC', color: '#fff',
              borderRadius: 6, fontSize: '.9rem', fontWeight: 700, textDecoration: 'none',
            }}
          >
            <Compass size={18} weight="bold" />
            {es ? `Actividades en ${playa.municipio}` : `Activities in ${playa.municipio}`}
          </a>
        )}
      </div>
      {/* C4 · Transparencia de afiliación (una vez por bloque) */}
      <p style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.75rem', lineHeight: 1.5 }}>
        {es
          ? 'Mismo precio para ti. Nos ayuda a mantener los datos gratis.'
          : 'Same price for you. It helps us keep the data free.'}
      </p>
    </div>
  )
}
