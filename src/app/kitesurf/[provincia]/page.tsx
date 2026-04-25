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
  const title = `Kitesurf en ${data.provincia.nombre}. Spots, escuelas y cursos`
  return {
    title,
    description: `Mejores spots de kitesurf en ${data.provincia.nombre}, escuelas IKO, cursos IKO nivel 1-3 y alquiler de material.`,
    alternates: { canonical: `/kitesurf/${provincia}` },
    openGraph: { title, url: `${BASE}/kitesurf/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'kitesurf',
  emoji: '🪁',
  color: '#ec4899',
  tituloTopic: 'Kitesurf',
  intro: 'Spots, escuelas y cursos de kitesurf en las playas de {provincia}. Vientos térmicos consistentes en verano, agua plana en bahías y olas para waves en puntos específicos. Certificación IKO y alquiler de material.',
  score: p => (p.actividades?.kite ? 3 : 0) + (p.actividades?.windsurf ? 1 : 0),
  highlights: [
    { icon: '🪁', label: 'Cursos IKO', desc: 'Nivel 1-3 desde 250€, 6-9h de práctica' },
    { icon: '💨', label: 'Viento ideal', desc: '15-25 nudos en térmico de tarde' },
    { icon: '🏪', label: 'Alquiler material', desc: 'Kite + tabla desde 60€/día' },
    { icon: '🛟', label: 'Barco rescate', desc: 'Incluido en escuelas grandes' },
  ],
  faqs: [
    { q: '¿Dónde se practica kitesurf en {provincia}?', aProvincia: (p) => `En ${p} hay playas de viento lateral constante ideales para kitesurf. Las escuelas están en las playas con acceso fácil y zona de agua plana (bahías o ensenadas).` },
    { q: '¿Cuánto cuesta un curso de kitesurf?', aGeneric: 'Curso IKO nivel 1 (iniciación, 3h): 120-180€. Curso completo nivel 1-3 (9h, autonomía básica): 350-500€. Curso intensivo semana: 450-700€ con alojamiento opcional.' },
    { q: '¿Qué mejor época para aprender kite en España?', aGeneric: 'Mayo-octubre en casi toda la costa (térmico fiable). Tarifa y Fuerteventura tienen viento todo el año. Verano en Cataluña y Valencia es irregular, mejor junio o septiembre.' },
    { q: '¿Necesito saber nadar para hacer kitesurf?', aGeneric: 'Sí, nivel básico es suficiente. El arnés te mantiene a flote y siempre llevas chaleco. Pero es recomendable sentirse cómodo en agua profunda.' },
  ],
  relacionados: [
    { href: '/clases-surf', label: 'Clases de surf' },
    { href: '/surf', label: 'Surf en España' },
    { href: '/seguros-viaje', label: 'Seguros deportes' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
