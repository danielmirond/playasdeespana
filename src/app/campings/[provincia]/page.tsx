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
  const title = `Campings cerca de la playa en ${data.provincia.nombre}`
  return {
    title: `${title} — Guía actualizada`,
    description: `Campings, glamping y áreas de autocaravanas cerca de las playas de ${data.provincia.nombre}. ${data.provincia.count} playas con servicios y precios.`,
    alternates: { canonical: `/campings/${provincia}` },
    openGraph: { title, url: `${BASE}/campings/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'campings',
  emoji: '⛺',
  color: '#3d6b1f',
  tituloTopic: 'Campings',
  intro: 'Guía de campings, glamping y áreas de autocaravanas cerca de las playas de {provincia}. Selección de playas con buen acceso y servicios cercanos. En cada ficha mostramos los campings más cercanos con distancia real y datos de contacto.',
  score: p => (p.parking ? 2 : 0) + (p.bandera ? 1 : 0),
  highlights: [
    { icon: '⛺', label: 'Camping tradicional', desc: 'Parcelas para tienda y caravana' },
    { icon: '🏕️', label: 'Glamping', desc: 'Cabañas y tiendas de lujo' },
    { icon: '🚐', label: 'Autocaravanas', desc: 'Áreas de servicio y pernocta' },
    { icon: '🐕', label: 'Pet-friendly', desc: 'Campings que admiten mascotas' },
  ],
  faqs: [
    { q: '¿Cuánto cuesta un camping en {provincia}?', aGeneric: 'El precio medio por parcela en temporada alta es de 25-45€/noche. Glamping y bungalows 60-150€/noche. En temporada baja los precios bajan un 30-50%.' },
    { q: '¿Se puede acampar libremente en {provincia}?', aGeneric: 'No. La acampada libre está prohibida en toda la costa española. Usa siempre campings regulados.' },
    { q: '¿Cuándo reservar camping en {provincia}?', aGeneric: 'Con 1-2 meses de antelación en julio-agosto. El resto del año hay disponibilidad puntual, pero los mejores se llenan los fines de semana.' },
    { q: '¿Hay áreas gratuitas para autocaravanas?', aProvincia: (p) => `Sí, en ${p} hay áreas municipales gratuitas o de pago simbólico (1-5€). Muchas incluyen vaciado y agua potable. Consulta Park4Night o Caramaps para ver las disponibles.` },
  ],
  relacionados: [
    { href: '/campings', label: 'Todos los campings' },
    { href: '/playas-autocaravana', label: 'Autocaravana en España' },
    { href: '/rutas', label: 'Rutas por la costa' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
