// src/app/alquiler-catamaran/[destino]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import LandingDestino from '@/components/embarcaciones/LandingDestino'
import { DESTINOS_PREMIUM, getDestinoBySlug } from '@/lib/embarcaciones'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const revalidate = 86400

export function generateStaticParams() {
  return DESTINOS_PREMIUM
    .filter(d => d.precios.catamaranDia)
    .map(d => ({ destino: d.slug }))
}

interface Props { params: Promise<{ destino: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destino: slug } = await params
  const d = getDestinoBySlug(slug)
  if (!d) return {}
  const title = `Alquiler de catamarán en ${d.nombre}: precios día y semana | Playas de España`
  const description = `Catamarán en ${d.nombre} (${d.provincia}). Precios reales, calas accesibles solo por mar (${d.fondeos.slice(0, 3).map(f => f.nombre).join(', ')}). Sin patrón disponible.`
  return {
    title, description,
    alternates: { canonical: `/alquiler-catamaran/${slug}` },
    openGraph: {
      title, description,
      url: `${BASE}/alquiler-catamaran/${slug}`,
      type: 'website',
    },
  }
}

export default async function CatamaranDestinoPage({ params }: Props) {
  const { destino: slug } = await params
  const d = getDestinoBySlug(slug)
  if (!d || !d.precios.catamaranDia) notFound()
  return (
    <>
      <Nav />
      <LandingDestino tipo="catamaran" destino={d} />
    </>
  )
}
