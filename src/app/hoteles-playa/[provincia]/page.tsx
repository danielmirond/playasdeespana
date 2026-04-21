import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TopicProvinciaPage, { type TopicConfig } from '@/components/seo/TopicProvinciaPage'
import { getProvinciasCosteras, getPlayasByProvinciaSlug } from '@/lib/provinciaTopicHelpers'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID ?? ''

export async function generateStaticParams() {
  const provs = await getProvinciasCosteras()
  return provs.map(p => ({ provincia: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) return {}
  const title = `Hoteles en la playa de ${data.provincia.nombre}`
  return {
    title: `${title} — Con reservas en Booking`,
    description: `Mejores hoteles en primera línea de playa en ${data.provincia.nombre}. Comparador de precios y reserva con cancelación gratuita.`,
    alternates: { canonical: `/hoteles-playa/${provincia}` },
    openGraph: { title, url: `${BASE}/hoteles-playa/${provincia}`, type: 'article' },
  }
}

function ExtraSections({ provincia }: { provincia: string }) {
  if (!BOOKING_AID) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, #003580 0%, #0071c2 100%)',
      borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200, color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '.2rem' }}>
          Buscar hoteles en {provincia}
        </div>
        <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.85)' }}>
          Comparador oficial con cancelación gratuita en la mayoría de hoteles.
        </div>
      </div>
      <a
        href={`https://www.booking.com/searchresults.es.html?aid=${BOOKING_AID}&ss=${encodeURIComponent(provincia)}&label=provincia-${provincia}`}
        target="_blank" rel="noopener noreferrer sponsored"
        style={{
          padding: '.7rem 1.3rem', background: '#fff', color: '#003580',
          borderRadius: 4, fontSize: '.9rem', fontWeight: 800, textDecoration: 'none',
        }}
      >
        Ver hoteles en Booking →
      </a>
    </div>
  )
}

const CONFIG: TopicConfig = {
  slug: 'hoteles-playa',
  emoji: '🏨',
  color: '#003580',
  tituloTopic: 'Hoteles en la playa',
  intro: 'Los mejores hoteles en primera línea de playa de {provincia}. Desde boutique hotels con encanto hasta resorts familiares. En cada ficha de playa mostramos los hoteles más cercanos con web y teléfono.',
  score: p => (p.bandera ? 3 : 0) + (p.parking ? 1 : 0),
  highlights: [
    { icon: '🌊', label: 'Primera línea', desc: 'Salida directa a la arena' },
    { icon: '🏖️', label: 'Resort familiar', desc: 'Animación y club infantil' },
    { icon: '💎', label: 'Boutique', desc: 'Diseño y servicio personalizado' },
    { icon: '🧘', label: 'Spa y wellness', desc: 'Circuito termal y tratamientos' },
  ],
  faqs: [
    { q: '¿Cuánto cuesta un hotel de playa en {provincia}?', aGeneric: 'Media de 70-150€/noche en temporada media. En julio-agosto sube un 40-60%. Hoteles 5* de lujo desde 250€/noche. Apartahoteles familiares desde 60€.' },
    { q: '¿Qué hoteles están en primera línea de {provincia}?', aProvincia: (p) => `En ${p} hay numerosos hoteles con acceso directo a la playa. Usa el filtro "primera línea" o "beachfront" en Booking y ordena por valoración. Muchos ofrecen toallas y hamacas incluidas.` },
    { q: '¿Cuándo reservar hotel para la costa?', aGeneric: 'Con 3-4 meses de antelación para julio-agosto (mejor precio y disponibilidad). Temporada media (junio/septiembre) con 1-2 meses basta. Cancelación gratuita hasta 24-48h antes en la mayoría.' },
    { q: '¿Son mejores los apartamentos o los hoteles?', aGeneric: 'Apartamentos para estancias largas (7+ noches), familias numerosas o grupos. Hoteles para escapadas cortas, ubicación premium, desayuno incluido y sin preocuparse de limpieza.' },
  ],
  relacionados: [
    { href: '/campings', label: 'Campings cerca de playa' },
    { href: '/seguros-viaje', label: 'Seguros de viaje' },
    { href: '/alquiler-barco-playa', label: 'Alquiler de barco' },
  ],
  extraSections: () => <ExtraSections provincia="" />,
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  const config: TopicConfig = {
    ...CONFIG,
    extraSections: () => <ExtraSections provincia={data.provincia.nombre} />,
  }
  return <TopicProvinciaPage config={config} provincia={data.provincia} playas={data.playas} />
}
