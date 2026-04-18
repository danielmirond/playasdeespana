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
  const title = `Yoga y pilates en la playa de ${data.provincia.nombre}`
  return {
    title,
    description: `Clases de yoga, pilates y SUP yoga al amanecer y atardecer en las playas de ${data.provincia.nombre}. Horarios, precios y reservas.`,
    alternates: { canonical: `/yoga-playa/${provincia}` },
    openGraph: { title, url: `${BASE}/yoga-playa/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'yoga-playa',
  emoji: '🧘',
  color: '#8b5cf6',
  tituloTopic: 'Yoga y pilates',
  intro: 'Clases de yoga, pilates y SUP yoga en las playas de {provincia}. Experiencia al amanecer o al atardecer con el mar de fondo. Estilos Hatha, Vinyasa, Yin y retiros de fin de semana cerca del mar.',
  score: p => (p.parking ? 2 : 0) + (p.bandera ? 1 : 0) + (p.accesible ? 1 : 0),
  highlights: [
    { icon: '🧘', label: 'Yoga al amanecer', desc: 'Sesiones 7-8am con vistas' },
    { icon: '🌅', label: 'Yoga al atardecer', desc: 'Vinyasa + meditación final' },
    { icon: '🏄', label: 'SUP yoga', desc: 'Sobre paddle surf en agua plana' },
    { icon: '🎒', label: 'Retiros', desc: 'Fines de semana con alojamiento' },
  ],
  faqs: [
    { q: '¿Cuánto cuesta una clase de yoga en la playa en {provincia}?', aGeneric: 'Clase suelta al aire libre: 10-20€. Bono 10 clases: 80-150€. Retiros de fin de semana (2 noches + 4 clases + comidas): 250-450€/persona. SUP yoga (90 min): 30-45€.' },
    { q: '¿Necesito llevar mi esterilla?', aGeneric: 'Lo ideal sí, pero muchas clases en la playa usan toallas grandes o las alquilan (2-3€). SUP yoga te proporcionan todo el material. Lleva agua, crema solar y un pareo fino.' },
    { q: '¿Qué estilos de yoga se practican en {provincia}?', aProvincia: (p) => `En ${p} lo más común es Hatha suave (principiantes) y Vinyasa (fluido) al aire libre. También Yin al atardecer. Los retiros mezclan estilos y añaden meditación y pranayama.` },
    { q: '¿Qué mejor hora para hacer yoga en la playa?', aGeneric: 'Amanecer (6:30-8:30 en verano) es la mejor: poca gente, fresco, luz suave. Atardecer también muy popular. Evita las horas centrales (12-17h): calor, UV extremo y masificación.' },
  ],
  relacionados: [
    { href: '/atardeceres', label: 'Atardeceres' },
    { href: '/protectores-solares', label: 'Protección solar' },
    { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
