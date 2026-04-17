// src/components/playa/HubsRelacionados.tsx
// Cross-linking semántico: muestra hubs temáticos relevantes para esta
// playa concreta basándose en sus atributos. Refuerza el topic cluster
// señalando a Google/lectores la relación entre la ficha (long-tail) y
// las páginas pilar (head terms).
//
// Solo se muestran los hubs aplicables — una playa nudista linkea al hub
// nudista, una con bandera azul al hub bandera azul, etc. Esto evita
// link-stuffing y mantiene la relevancia semántica.
import Link from 'next/link'
import type { Playa } from '@/types'

interface Props {
  playa:   Playa
  locale?: 'es' | 'en'
}

interface Hub {
  href:  string
  label: string
}

function slugify(s: string) {
  return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

function buildHubs(playa: Playa, locale: 'es' | 'en'): Hub[] {
  const es = locale === 'es'
  const provSlug = slugify(playa.provincia)
  const comSlug  = slugify(playa.comunidad)
  const hubs: Hub[] = []

  // Bandera Azul — hub principal de calidad
  if (playa.bandera) {
    hubs.push({
      href: es ? '/banderas-azules' : '/en/blue-flag',
      label: es ? 'Banderas Azules en España' : 'Blue Flag beaches in Spain',
    })
  }

  // Nudistas — hubs jerárquicos
  if (playa.nudista) {
    hubs.push({
      href: es ? `/playas-nudistas/provincia/${provSlug}` : '/en/nudist-beaches',
      label: es ? `Playas nudistas en ${playa.provincia}` : `Nudist beaches in ${playa.provincia}`,
    })
  }

  // Perros — hubs jerárquicos
  if (playa.perros) {
    hubs.push({
      href: es ? `/playas-perros/provincia/${provSlug}` : '/en/dog-beaches',
      label: es ? `Playas para perros en ${playa.provincia}` : `Dog-friendly beaches in ${playa.provincia}`,
    })
  }

  // Accesibilidad
  if (playa.accesible) {
    hubs.push({
      href: es ? `/playas-accesibles/provincia/${provSlug}` : '/en/accessible-beaches',
      label: es ? `Playas accesibles en ${playa.provincia}` : `Accessible beaches in ${playa.provincia}`,
    })
  }

  // Surf — si la playa tiene actividades de surf
  if (playa.actividades?.surf) {
    hubs.push({
      href: es ? '/surf' : '/en/surf',
      label: es ? 'Surf en España: previsión y mejores spots' : 'Surf in Spain: forecast and best spots',
    })
  }

  // Hub de la comunidad — siempre presente
  hubs.push({
    href: es ? `/comunidad/${comSlug}` : `/en/communities/${comSlug}`,
    label: es ? `Todas las playas de ${playa.comunidad}` : `All beaches in ${playa.comunidad}`,
  })

  // Hub de la provincia
  hubs.push({
    href: es ? `/provincia/${provSlug}` : `/en/provinces/${provSlug}`,
    label: es ? `Playas de ${playa.provincia}` : `Beaches in ${playa.provincia}`,
  })

  // Comparador como utilidad
  hubs.push({
    href: '/comparar',
    label: es ? `Comparar ${playa.nombre} con otras playas` : `Compare ${playa.nombre} with other beaches`,
  })

  return hubs
}

export default function HubsRelacionados({ playa, locale = 'es' }: Props) {
  const hubs = buildHubs(playa, locale)
  if (hubs.length === 0) return null
  const es = locale === 'es'

  return (
    <nav
      aria-label={es ? 'Páginas relacionadas' : 'Related pages'}
      style={{
        background: 'var(--card-bg, #faf6ef)',
        border: '1.5px solid var(--line, #e8dcc8)',
        borderRadius: 16,
        padding: '1rem 1.15rem',
        marginBottom: '.85rem',
      }}
    >
      <div style={{
        fontSize: '.6rem',
        fontWeight: 700,
        letterSpacing: '.1em',
        textTransform: 'uppercase',
        color: 'var(--muted, #5a3d12)',
        marginBottom: '.75rem',
      }}>
        {es ? 'Explora más' : 'Explore more'}
      </div>
      <ul style={{
        listStyle: 'none', padding: 0, margin: 0,
        display: 'flex', flexWrap: 'wrap', gap: '.4rem',
      }}>
        {hubs.map(h => (
          <li key={h.href}>
            <Link
              href={h.href}
              style={{
                display: 'inline-flex',
                padding: '.4rem .75rem',
                background: 'rgba(107,64,10,.14)',
                color: '#4a2c05',
                borderRadius: 100,
                fontSize: '.75rem',
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(107,64,10,.3)',
              }}
            >
              {h.label} →
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  )
}
