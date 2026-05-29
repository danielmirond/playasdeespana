// src/app/alquiler-yate/[destino]/page.tsx
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Nav from '@/components/ui/Nav'
import LandingDestino from '@/components/embarcaciones/LandingDestino'
import { DESTINOS_PREMIUM, getDestinoBySlug } from '@/lib/embarcaciones'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const maxDuration = 60
export const revalidate = 86400

export function generateStaticParams() {
  return DESTINOS_PREMIUM
    .filter(d => d.precios.yateSemana)              // solo destinos con yates
    .map(d => ({ destino: d.slug }))
}

interface Props { params: Promise<{ destino: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { destino: slug } = await params
  const d = getDestinoBySlug(slug)
  if (!d) return {}
  const title = `Alquiler de yate en ${d.nombre}: precios y calas | Playas de España`
  const description = `Alquila yate en ${d.nombre} (${d.provincia}). Precios reales, fondeos accesibles solo por mar (${d.fondeos.slice(0, 3).map(f => f.nombre).join(', ')}). Catálogo Samboat.`
  return {
    title, description,
    alternates: { canonical: `/alquiler-yate/${slug}` },
    openGraph: {
      title, description,
      url: `${BASE}/alquiler-yate/${slug}`,
      type: 'website',
    },
  }
}

export default async function YateDestinoPage({ params }: Props) {
  const { destino: slug } = await params
  const d = getDestinoBySlug(slug)
  if (!d || !d.precios.yateSemana) notFound()
  return (
    <>
      <Nav />
      <LandingDestino tipo="yate" destino={d} />
    </>
  )
}
