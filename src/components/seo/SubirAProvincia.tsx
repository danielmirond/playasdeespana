// src/components/seo/SubirAProvincia.tsx
//
// El remate de una subpágina de municipio: el enlace a la landing
// provincial de SU MISMA vertical.
//
// Es el enlace interno con mejor afinidad que tiene el sitio y hasta
// ahora no existía. /municipio/nijar/camping-cerca va entera de
// campings y enlazaba a /campings, el hub nacional, con el ancla
// «Campings cerca de la playa». Son ~3.500 páginas (584 municipios por
// seis subpáginas con vertical equivalente) tirando su señal temática
// al hub en vez de a la provincia, que es justo la página que compite
// por «campings en Almería».
//
// Va en el cuerpo y no en un sidebar: la página acaba de enumerar los
// campings de un municipio, y el siguiente paso natural del lector —y
// del rastreador— es verlos todos en la provincia.
import Link from 'next/link'
import { enlacesConversion } from '@/lib/enlaces-conversion'

/** Verticales con subpágina de municipio equivalente. */
export type Vertical =
  | 'campings' | 'hoteles-playa' | 'buceo' | 'clases-surf'
  | 'chiringuitos' | 'alquiler-barco' | 'alquiler-autocaravana'

interface Props {
  vertical:  Vertical
  provincia: string
  municipio: string
}

export default async function SubirAProvincia({ vertical, provincia, municipio }: Props) {
  const enlaces = await enlacesConversion(provincia, municipio)
  const e = enlaces.find(x => x.href === `/${vertical}` || x.href.startsWith(`/${vertical}/`))
  // Si la vertical cayó al hub nacional, no se pinta: un «ver todos» que
  // lleva a España entera desde la página de un municipio no es un paso
  // adelante, es perder al lector.
  if (!e || !e.local) return null

  return (
    <p style={{ margin: '20px 0 0', padding: '14px 0', borderBlock: '1px solid var(--line)' }}>
      <Link
        href={e.href}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto',
          gap: 10,
          alignItems: 'baseline',
          minHeight: 44,
          fontSize: 15,
          textDecoration: 'none',
          color: 'var(--ink)',
        }}
      >
        <span>{e.label}</span>
        <span aria-hidden style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--accent)' }}>→</span>
      </Link>
    </p>
  )
}
