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
  const title = `Windsurf en ${data.provincia.nombre}. Spots y escuelas`
  return {
    title,
    description: `Mejores playas y escuelas de windsurf en ${data.provincia.nombre}. Cursos de iniciación y alquiler de material.`,
    alternates: { canonical: `/windsurf/${provincia}` },
    openGraph: { title, url: `${BASE}/windsurf/${provincia}`, type: 'article' },
  }
}

const CONFIG: TopicConfig = {
  slug: 'windsurf',
  emoji: '🏄‍♂️',
  color: '#8b5cf6',
  tituloTopic: 'Windsurf',
  intro: 'Spots y escuelas de windsurf en las playas de {provincia}. Ideal en vientos de 12-25 nudos, con escuelas para principiantes y zonas de freeride/slalom para avanzados.',
  score: p => (p.actividades?.windsurf ? 3 : 0) + (p.actividades?.kite ? 1 : 0),
  highlights: [
    { icon: '🏄‍♂️', label: 'Iniciación', desc: 'Curso 4h desde 80€, tabla + vela' },
    { icon: '💨', label: 'Viento', desc: 'Térmico de tarde 12-20 nudos' },
    { icon: '🏪', label: 'Alquiler', desc: 'Equipo completo desde 40€/día' },
    { icon: '👪', label: 'Para niños', desc: 'Material infantil desde 8 años' },
  ],
  faqs: [
    { q: '¿Cuánto cuesta iniciarse en windsurf en {provincia}?', aGeneric: 'Curso de iniciación (4h en 2 sesiones): 70-100€. Curso completo (nivel básico autónomo, 8h): 150-220€. Alquiler equipo: 40-60€/día.' },
    { q: '¿Qué es mejor, windsurf o kitesurf?', aGeneric: 'Windsurf es más físico pero fácil de aprender básico. Kitesurf requiere más técnica al inicio pero menos esfuerzo después. El windsurf necesita menos viento (desde 10 nudos) vs kite (desde 15).' },
    { q: '¿Dónde es mejor hacer windsurf en {provincia}?', aProvincia: (p) => `En ${p} busca playas con viento lateral u onshore ligero y poca corriente. Las escuelas están ubicadas en esos puntos. Consulta nuestras fichas de playa para ver dónde está cada escuela.` },
    { q: '¿Qué material necesito para empezar?', aGeneric: 'Nada al principio: la escuela incluye todo. Al comprar, la primera tabla (freeride 140-170L) + vela (5.5-6.5m²) + arnés sale por 800-1500€ segunda mano.' },
  ],
  relacionados: [
    { href: '/kitesurf', label: 'Kitesurf por comunidad' },
    { href: '/clases-surf', label: 'Clases de surf' },
    { href: '/surf', label: 'Surf en España' },
  ],
}

export default async function Page({ params }: { params: Promise<{ provincia: string }> }) {
  const { provincia } = await params
  const data = await getPlayasByProvinciaSlug(provincia)
  if (!data) notFound()
  return <TopicProvinciaPage config={CONFIG} provincia={data.provincia} playas={data.playas} />
}
