// /aparcar-playa — el hub nacional de aparcamiento, que no existía.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getProvinciasAparca } from '@/lib/aparcar-provincia'

export const revalidate = 86400
const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Dónde aparcar en la playa, provincia por provincia',
  description: 'Aparcamientos mapeados cerca de la playa en toda la costa española: a qué playa se llega en coche y a cuál conviene ir en autobús.',
  alternates: { canonical: '/aparcar-playa' },
  openGraph: { type: 'website', url: `${BASE}/aparcar-playa` },
}

export default async function AparcarHub() {
  const provs = [...(await getProvinciasAparca()).values()].sort((a, b) => b.total - a.total)
  const total = provs.reduce((s, p) => s + p.total, 0)
  const munis = provs.reduce((s, p) => s + p.municipios.length, 0)

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.7rem,4.5vw,2.5rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.35rem' }}>
          Dónde <em style={{ fontWeight: 500, color: 'var(--accent)' }}>aparcar</em> en la playa
        </h1>
        <p style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 2rem', maxWidth: 640 }}>
          {total.toLocaleString('es')} aparcamientos mapeados a menos de 1,5 km de la arena, en {munis} municipios
          de {provs.length} provincias. Salen de OpenStreetMap, que escribe gente voluntaria: puede faltar
          alguno y ninguno garantiza sitio un domingo de agosto.
        </p>

        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {provs.map(p => (
            <li key={p.slug} style={{ borderBottom: '1px solid var(--line)' }}>
              <Link href={`/aparcar-playa/${p.slug}`} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, alignItems: 'baseline', padding: '12px 0', minHeight: 44, boxSizing: 'border-box', textDecoration: 'none', color: 'var(--ink)' }}>
                <span style={{ fontSize: '.98rem' }}>
                  Aparcar en las playas de {p.nombre}
                  <span style={{ color: 'var(--muted)', fontSize: '.82rem' }}> · {p.municipios.length} municipios</span>
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.78rem', color: 'var(--muted)', whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>{p.total}</span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </>
  )
}
