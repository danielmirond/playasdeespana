import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TopicProvinciaPage, { type TopicConfig } from '@/components/seo/TopicProvinciaPage'
import { getProvinciasCosteras, getPlayasByProvinciaSlug } from '@/lib/provinciaTopicHelpers'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const CLICKBOAT_AFF = process.env.NEXT_PUBLIC_CLICKBOAT_AFF ?? ''

export async function generateStaticParams() {
  const provs = await getProvinciasCosteras()
  return provs.map(p => ({ provincia: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) return {}
  const title = `Alquiler de barco en ${data.provincia.nombre}`
  return {
    title: `${title} | Con y sin licencia`,
    description: `Alquila un barco en ${data.provincia.nombre} para descubrir las mejores calas. Lanchas sin licencia desde 80€/día, veleros con patrón, catamaranes para grupos.`,
    alternates: { canonical: `/alquiler-barco/${provincia}` },
    openGraph: { title, url: `${BASE}/alquiler-barco/${provincia}`, type: 'article' },
  }
}

function ExtraSections({ provincia }: { provincia: string }) {
  if (!CLICKBOAT_AFF) return null
  return (
    <div style={{
      background: 'linear-gradient(135deg, #003d82 0%, #0071c2 100%)',
      borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap',
    }}>
      <div style={{ flex: 1, minWidth: 200, color: '#fff' }}>
        <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '.2rem' }}>
          Alquilar barco en {provincia}
        </div>
        <div style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.85)' }}>
          40.000+ barcos en el Mediterráneo. Con o sin patrón. Cancelación gratis.
        </div>
      </div>
      <a
        href={`https://www.clickandboat.com/es/alquiler-barco/${encodeURIComponent(provincia.toLowerCase())}?aff=${CLICKBOAT_AFF}`}
        target="_blank" rel="noopener noreferrer sponsored"
        style={{
          padding: '.7rem 1.3rem', background: '#fff', color: '#003d82',
          borderRadius: 4, fontSize: '.9rem', fontWeight: 800, textDecoration: 'none',
        }}
      >
        Buscar en Click&Boat →
      </a>
    </div>
  )
}

const CONFIG: TopicConfig = {
  slug: 'alquiler-barco',
  emoji: '⛵',
  color: '#003d82',
  tituloTopic: 'Alquiler de barco',
  intro: 'Alquila un barco para descubrir las mejores calas y playas de {provincia} desde el mar. Lanchas sin licencia para principiantes, veleros con patrón para grupos y catamaranes premium para eventos.',
  score: p => (p.bandera ? 2 : 0) + (p.actividades?.snorkel ? 1 : 0),
  highlights: [
    { icon: '⛵', label: 'Sin licencia', desc: 'Lancha hasta 15CV, desde 80€/día' },
    { icon: '🌊', label: 'Con patrón', desc: 'Velero con skipper desde 400€/día' },
    { icon: '🥂', label: 'Catamarán', desc: 'Para grupos grandes, eventos' },
    { icon: '🐠', label: 'Snorkel', desc: 'Descubre calas vírgenes' },
  ],
  faqs: [
    { q: '¿Cuánto cuesta alquilar un barco en {provincia}?', aGeneric: 'Lancha sin licencia 5m: 80-150€/día. Semirrígida 6m con licencia: 200-350€/día. Velero 10m con patrón: 400-800€/día. Catamarán 12m: 1.000-2.500€/día. Precios suben 30-50% en julio-agosto.' },
    { q: '¿Necesito licencia para alquilar barco en {provincia}?', aGeneric: 'No si es motor hasta 15CV y eslora hasta 5m (navegas hasta 2 millas de costa). Para barcos mayores necesitas PER (Patrón de Embarcaciones de Recreo) o contratar skipper (+150-300€/día).' },
    { q: '¿Qué calas visitar en barco en {provincia}?', aProvincia: (p) => `Las mejores calas de ${p} son visibles desde el mar: muchas sólo son accesibles en barco. Consulta nuestra página de aguas cristalinas para ver los spots top, o reserva un charter con itinerario guiado.` },
    { q: '¿Qué incluye el alquiler?', aGeneric: 'Normalmente: barco, seguro básico, equipo de seguridad. NO incluye: combustible (150-400€/día), limpieza (50-150€), patrón si no tienes licencia (+150-300€/día), comida y bebida.' },
  ],
  relacionados: [
    { href: '/alquiler-barco-playa', label: 'Alquiler de barco en España' },
    { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
    { href: '/buceo', label: 'Buceo' },
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
