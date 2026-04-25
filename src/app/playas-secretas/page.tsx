// src/app/playas-secretas/page.tsx. Hidden gems: low occupancy, high score
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Playas secretas en España | Calas escondidas y poco masificadas',
  description: 'Las playas menos masificadas de España: baja ocupación, sin parking, sin chiringuito. Calas escondidas y rincones vírgenes.',
  alternates: { canonical: '/playas-secretas' },
}

const FAQ = [
  { q: '¿Qué es una playa secreta?', a: 'Llamamos playa secreta a aquella con baja ocupación, acceso difícil o a pie, y mínimos servicios como parking o chiringuito. Son calas y rincones que no aparecen en las guías turísticas convencionales y que conservan un entorno natural casi virgen.' },
  { q: '¿Cómo llegar a playas escondidas?', a: 'La mayoría requiere caminar entre 15 minutos y una hora por senderos costeros, a veces sin señalizar. Conviene llevar calzado deportivo, agua y protección solar. Algunas calas solo son accesibles en barco o kayak, especialmente en Baleares y la Costa Brava.' },
  { q: '¿Son seguras las calas aisladas?', a: 'Generalmente sí, pero al no contar con socorrismo ni cobertura móvil en muchos casos, es importante tomar precauciones: no bañarse solo, informar a alguien de tu ruta y comprobar el estado del mar antes de ir. Evita días de fuerte oleaje o bandera roja en playas cercanas.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default async function Page() {
  const playas = await getPlayas()
  const secretas = playas.filter(p => {
    const g = (p.grado_ocupacion ?? '').toLowerCase()
    return g.includes('bajo') && p.lat && p.lng
  }).sort((a, b) => {
    // "Secretness" score: no parking, no bus, difficult access, no bar, low services
    const sa = (!a.parking ? 3 : 0) + (!a.autobus ? 2 : 0) + ((a.forma_acceso ?? '').toLowerCase().includes('difícil') ? 3 : 0) + (!a.establecimientos ? 1 : 0)
    const sb = (!b.parking ? 3 : 0) + (!b.autobus ? 2 : 0) + ((b.forma_acceso ?? '').toLowerCase().includes('difícil') ? 3 : 0) + (!b.establecimientos ? 1 : 0)
    return sb - sa
  }).slice(0, 100)

  const byCom = new Map<string, typeof secretas>()
  for (const p of secretas) { const l = byCom.get(p.comunidad) ?? []; l.push(p); byCom.set(p.comunidad, l) }

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>
          🤫 Playas secretas
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2rem', maxWidth: 520 }}>
          Calas escondidas y playas poco masificadas: baja ocupación, sin parking, acceso a pie.
          Los rincones que solo conocen los locales.
        </p>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', marginBottom: '2rem' }}>
          <MapaPlayas playas={secretas.slice(0, 50)} height="400px" />
        </div>
        {Array.from(byCom.entries()).map(([com, list]) => (
          <section key={com} style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>
              {com} ({list.length})
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.5rem' }}>
              {list.map(p => (
                <Link key={p.slug} href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.75rem 1rem', background: 'var(--card-bg)',
                  border: '1px solid var(--line)', borderRadius: 6, textDecoration: 'none',
                }}>
                  <span aria-hidden="true">🤫</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
