import { getLocalitiesByProvince, getAllLocalities } from '@/lib/boat-rental-localities'
import { boatRentalSlug } from '@/lib/boat-rental-helpers'
import { redirect, notFound } from 'next/navigation'

// Ruta legacy plana. Para evitar contenido duplicado/delgado, redirige
// (308) a la URL jerárquica canónica /costas/{costa}/provincias/{provincia}.
interface ProvinciaParams { provincia: string }

export function generateStaticParams() {
  const provs = new Set(getAllLocalities().map((l) => boatRentalSlug(l.province)))
  return Array.from(provs).map((provincia) => ({ provincia }))
}

export default async function ProvinciaRedirect({ params }: { params: Promise<ProvinciaParams> }) {
  const { provincia } = await params
  const localities = getLocalitiesByProvince(decodeURIComponent(provincia))
  if (localities.length === 0) notFound()

  const { coast, province } = localities[0]
  redirect(`/alquiler-barco/costas/${boatRentalSlug(coast)}/provincias/${boatRentalSlug(province)}`)
}
