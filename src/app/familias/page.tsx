// src/app/familias/page.tsx. Playas para familias con niños
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'

export const revalidate = 86400

const FAQ = [
  { q: '¿Qué hace a una playa familiar?', a: 'Una playa familiar reúne varios criterios: servicio de socorrismo activo, duchas y aseos públicos, baja o media ocupación y, preferiblemente, aguas poco profundas con entrada progresiva. También es importante que cuente con acceso adaptado para carritos y sillas de ruedas.' },
  { q: '¿Son seguras las playas familiares en España?', a: 'Sí, las playas que seleccionamos tienen socorrismo y bandera azul en muchos casos, lo que garantiza controles de calidad del agua, señalización de corrientes y personal de rescate. Aun así, conviene vigilar siempre a los niños y respetar las indicaciones del socorrista.' },
  { q: '¿Qué llevar a la playa con niños?', a: 'Lo imprescindible incluye protector solar de alta protección (SPF 50+), gorra o sombrero, agua abundante, algo de fruta y una sombrilla o carpa de playa. Para los más pequeños, un chaleco de flotación y calzado acuático para evitar cortes en las rocas.' },
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

export const metadata: Metadata = {
  title: 'Playas para familias con niños en España | Las más seguras',
  description: 'Playas familiares en España: socorrismo, duchas, baja ocupación, accesibles y agua poco profunda. Las más seguras para ir con niños.',
  alternates: { canonical: '/familias' },
}

export default async function Page() {
  const playas = await getPlayas()
  // Family = socorrismo + duchas + baja/media ocupación + preferible accesible
  const familiares = playas.filter(p =>
    p.socorrismo && p.duchas &&
    !((p.grado_ocupacion ?? '').toLowerCase().includes('alto')) &&
    p.lat && p.lng
  ).sort((a, b) => {
    // Score: accesible + parking + bandera + aseos + baja ocupación
    const sa = (a.accesible ? 3 : 0) + (a.parking ? 2 : 0) + (a.bandera ? 2 : 0) + (a.aseos ? 1 : 0) + ((a.grado_ocupacion ?? '').toLowerCase().includes('bajo') ? 2 : 0)
    const sb = (b.accesible ? 3 : 0) + (b.parking ? 2 : 0) + (b.bandera ? 2 : 0) + (b.aseos ? 1 : 0) + ((b.grado_ocupacion ?? '').toLowerCase().includes('bajo') ? 2 : 0)
    return sb - sa
  }).slice(0, 100)

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, color: 'var(--ink)', marginBottom: '.5rem' }}>
          👨‍👩‍👧‍👦 Playas para familias con niños
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', marginBottom: '2rem', maxWidth: 520 }}>
          {familiares.length} playas con socorrismo, duchas y ocupación media-baja.
          Las más seguras para ir con niños.
        </p>
        <div style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, overflow: 'hidden', marginBottom: '2rem' }}>
          <MapaPlayas playas={familiares.slice(0, 50)} height="400px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '.55rem' }}>
          {familiares.map(p => (
            <Link key={p.slug} href={`/playas/${p.slug}`} style={{
              display: 'flex', alignItems: 'center', gap: '.75rem',
              padding: '.75rem 1rem', background: 'var(--card-bg)',
              border: '1px solid var(--line)', borderRadius: 6,
              textDecoration: 'none',
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{p.nombre}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                <div style={{ display: 'flex', gap: '.2rem', marginTop: '.25rem', flexWrap: 'wrap' }}>
                  {p.bandera && <span style={{ fontSize: '.62rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.1rem .3rem', borderRadius: 4 }}>B. Azul</span>}
                  {p.accesible && <span style={{ fontSize: '.62rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>PMR</span>}
                  {p.parking && <span style={{ fontSize: '.62rem', background: 'var(--metric-bg)', border: '1px solid var(--line)', padding: '.1rem .3rem', borderRadius: 4 }}>P</span>}
                </div>
              </div>
              <span style={{ color: 'var(--accent)', fontWeight: 700 }}>→</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  )
}
