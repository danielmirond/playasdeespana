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
  const title = `Clases de surf en ${data.provincia.nombre}`
  return {
    title: `${title} — Escuelas, precios y mejores playas`,
    description: `Clases de surf para principiantes y perfeccionamiento en ${data.provincia.nombre}. Escuelas cerca de la playa, precios desde 30€, alquiler de tablas.`,
    alternates: { canonical: `/clases-surf/${provincia}` },
    openGraph: { title, url: `${BASE}/clases-surf/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'clases-surf',
  emoji: '🏄',
  color: '#0ea5e9',
  tituloTopic: 'Clases de surf',
  intro: 'Escuelas y clases de surf en las playas de {provincia}. Desde bautismos para principiantes (desde 30€) hasta perfeccionamiento con instructor titulado. En cada playa mostramos las escuelas cercanas con contacto directo.',
  score: p => (p.actividades?.surf ? 3 : 0) + (p.actividades?.paddle ? 1 : 0),
  highlights: [
    { icon: '🏄', label: 'Principiantes', desc: 'Clases grupales desde 30€/sesión' },
    { icon: '📈', label: 'Perfeccionamiento', desc: 'Clases individuales desde 60€/hora' },
    { icon: '🏕️', label: 'Surf camps', desc: 'Semanas completas con alojamiento' },
    { icon: '🛹', label: 'Alquiler tabla', desc: 'Desde 15€/día con neopreno' },
  ],
  faqs: [
    { q: '¿Cuánto cuesta una clase de surf en {provincia}?', aGeneric: 'Clase grupal 90 min: 30-40€/persona (incluye tabla y neopreno). Clase particular: 60-90€/hora. Curso semanal (5 días): 150-250€. Alquiler solo tabla: 15-20€/día.' },
    { q: '¿Qué edad mínima para empezar a surfear?', aGeneric: 'A partir de 6-7 años en escuelas con clases infantiles. En grupos de adultos, desde 12-14 años. No requiere saber nadar bien, pero sí sentirse cómodo en agua con chaleco.' },
    { q: '¿Mejores meses para aprender surf en {provincia}?', aGeneric: 'En Mediterráneo: septiembre-noviembre y marzo-mayo (olas pequeñas ideales). En Atlántico: abril-junio (olas suaves, agua templada). Verano en el Atlántico tiene poco oleaje.' },
    { q: '¿Qué llevar a una clase de surf?', aGeneric: 'Bañador, toalla, crema solar resistente al agua, agua para beber y algo de picar. La escuela proporciona tabla, neopreno y licra. Mejor no comer justo antes.' },
  ],
  relacionados: [
    { href: '/surf', label: 'Surf en España' },
    { href: '/protectores-solares', label: 'Protección solar' },
    { href: '/seguros-viaje', label: 'Seguros deportes acuáticos' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
