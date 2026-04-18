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
  const title = `Buceo y centros de inmersión en ${data.provincia.nombre}`
  return {
    title: `${title} — Guía completa`,
    description: `Mejores playas para bucear en ${data.provincia.nombre}, centros PADI/SSI, bautismos y reservas marinas. ${data.provincia.count} playas con datos actualizados.`,
    alternates: { canonical: `/buceo/${provincia}` },
    openGraph: { title, url: `${BASE}/buceo/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'buceo',
  emoji: '🤿',
  color: '#0891b2',
  tituloTopic: 'Centros de buceo',
  intro: 'Centros de buceo y spots de inmersión cerca de las playas de {provincia}. Certificaciones PADI y SSI, bautismos desde 40€ y acceso a reservas marinas. En cada ficha de playa mostramos los centros más cercanos con contacto directo.',
  score: p => (p.actividades?.buceo ? 3 : 0) + (p.actividades?.snorkel ? 1 : 0),
  highlights: [
    { icon: '🐠', label: 'Bautismos', desc: 'Primera inmersión desde 40€, sin experiencia' },
    { icon: '📜', label: 'Certificación PADI/SSI', desc: 'Open Water desde 300€, 2-4 días' },
    { icon: '🌊', label: 'Reservas marinas', desc: 'Inmersiones con permiso previo' },
    { icon: '🔦', label: 'Nocturnas', desc: 'Especialidades y fototurismo submarino' },
  ],
  faqs: [
    { q: '¿Dónde se puede bucear en {provincia}?', aProvincia: (p) => `En ${p} hay múltiples puntos de buceo conocidos. Los centros cercanos a las playas ofrecen tanto bautismos como inmersiones avanzadas. En cada ficha de playa mostramos los centros a 15 km o menos.` },
    { q: '¿Cuánto cuesta un bautismo de buceo?', aGeneric: 'Entre 40€ y 80€ por persona. Incluye equipo completo, briefing e inmersión guiada de 30-45 min. En reservas marinas puede costar 10-20€ más.' },
    { q: '¿Qué certificación es mejor, PADI o SSI?', aGeneric: 'Ambas son equivalentes y reconocidas internacionalmente. PADI tiene más centros en España (80%). SSI es un poco más barata y con material digital gratuito. Elige la del centro más cercano.' },
    { q: '¿Cuándo es mejor bucear en {provincia}?', aGeneric: 'De junio a octubre para Mediterráneo (agua 20-26°C, visibilidad 15-25m). Canarias todo el año. Atlántico Norte (Galicia, Cantábrico) mejor en julio-septiembre.' },
  ],
  relacionados: [
    { href: '/buceo', label: 'Buceo en España' },
    { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
    { href: '/seguros-viaje', label: 'Seguros (deportes acuáticos)' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
