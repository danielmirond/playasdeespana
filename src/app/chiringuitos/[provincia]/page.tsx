import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import TopicProvinciaPage, { type TopicConfig } from '@/components/seo/TopicProvinciaPage'
import { getProvinciasCosteras, getPlayasByProvinciaSlug } from '@/lib/provinciaTopicHelpers'

export const revalidate = 86400
const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export async function generateStaticParams() {
  const provs = await getProvinciasCosteras()
  return provs.map(p => ({ provincia: p.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ provincia: string }> }): Promise<Metadata> {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) return {}
  const title = `Chiringuitos en las playas de ${data.provincia.nombre}`
  return {
    title: `${title} | Los mejores 2026`,
    description: `Guía de chiringuitos, bares y restaurantes con vistas al mar en ${data.provincia.nombre}. Listado por playa con precios y reservas.`,
    alternates: { canonical: `/chiringuitos/${provincia}` },
    openGraph: { title, url: `${BASE}/chiringuitos/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'chiringuitos',
  emoji: '🍹',
  color: '#c48a1e',
  tituloTopic: 'Chiringuitos',
  intro: 'Guía de chiringuitos, beach clubs y restaurantes con vistas al mar en las playas de {provincia}. Desde chiringuitos tradicionales hasta beach clubs premium. En cada playa mostramos los restaurantes más cercanos con rating y precios.',
  score: p => (p.bandera ? 2 : 0) + (p.parking ? 1 : 0),
  highlights: [
    { icon: '🍹', label: 'Beach clubs', desc: 'Con hamacas, DJ y carta cocktail' },
    { icon: '🐟', label: 'Pescaíto frito', desc: 'Chiringuitos tradicionales familiares' },
    { icon: '🥘', label: 'Paella en la arena', desc: 'Cocina mediterránea con vistas' },
    { icon: '🌅', label: 'Atardecer', desc: 'Mejores vistas 1h antes del sunset' },
  ],
  faqs: [
    { q: '¿Cuánto se paga por una comida en un chiringuito de {provincia}?', aGeneric: 'Menú del día 15-25€. Carta à la carte: entrantes 6-14€, principales 12-22€, pescado fresco al peso 50-80€/kg. Beach clubs premium: +30-50% del precio estándar.' },
    { q: '¿Hay que reservar chiringuito en {provincia}?', aProvincia: (p) => `En ${p} los chiringuitos con vistas top y los beach clubs se llenan en verano. Reserva con 2-3 días de antelación para comida (más horario español, 14:30-15:30). Los más turísticos tienen TheFork.` },
    { q: '¿Chiringuitos abiertos todo el año en {provincia}?', aGeneric: 'Sólo algunos en Costa del Sol, Levante y Canarias. La mayoría abren de Semana Santa a octubre. En verano extendido (junio-septiembre) abren todos.' },
    { q: '¿Se puede llegar andando desde la playa?', aGeneric: 'Sí, los chiringuitos están literalmente en la arena o en el paseo marítimo. Basta ir en chanclas. Los beach clubs suelen tener zona de descanso con hamacas reservables.' },
  ],
  relacionados: [
    { href: '/atardeceres', label: 'Atardeceres' },
    { href: '/familias', label: 'Playas para familias' },
    { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
