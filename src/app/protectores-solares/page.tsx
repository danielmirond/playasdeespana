// src/app/protectores-solares/page.tsx
// Landing comercial: "Protectores solares para playa" — Amazon affiliate.
// Query de alto volumen comercial + informativo. La audiencia de la web
// (gente que busca playas) es exactamente la que compra crema solar.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const revalidate = 604800 // 7 días — contenido evergreen

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const AMAZON_TAG = process.env.NEXT_PUBLIC_AMAZON_TAG ?? ''

export const metadata: Metadata = {
  title: 'Mejores protectores solares para playa 2026 — Guía y recomendaciones',
  description: 'Guía completa de protectores solares para la playa: SPF, resistencia al agua, reef-safe, niños y pieles sensibles. Recomendaciones actualizadas con enlaces de compra.',
  alternates: { canonical: '/protectores-solares' },
  openGraph: {
    title: 'Mejores protectores solares para playa 2026',
    description: 'SPF, resistencia al agua, reef-safe. Guía práctica con recomendaciones.',
    url: `${BASE}/protectores-solares`,
    type: 'article',
  },
}

interface Producto {
  nombre:     string
  categoria:  string
  spf:        string
  puntos:     string[]
  query:      string // búsqueda Amazon
  badge?:     string
  badgeColor?: string
}

const PRODUCTOS: Producto[] = [
  {
    nombre: 'ISDIN Fotoprotector Fusion Water SPF50+',
    categoria: 'Mejor para uso diario',
    spf: '50+',
    puntos: ['Textura ultraligera', 'No deja residuo blanco', 'Apto rostro y cuerpo'],
    query: 'ISDIN+Fusion+Water+SPF50',
    badge: 'Top ventas',
    badgeColor: '#f59e0b',
  },
  {
    nombre: 'Hawaiian Tropic Silk Hydration SPF50',
    categoria: 'Mejor hidratante',
    spf: '50',
    puntos: ['Con cintas de seda hidratantes', 'Resistente al agua (80 min)', 'Aroma tropical'],
    query: 'Hawaiian+Tropic+Silk+Hydration+SPF50',
  },
  {
    nombre: 'Nivea Sun Protección & Hidratación SPF50+',
    categoria: 'Mejor relación calidad-precio',
    spf: '50+',
    puntos: ['Formato familiar 400ml', 'Resistente al agua', 'Absorción rápida'],
    query: 'Nivea+Sun+proteccion+hidratacion+SPF50',
    badge: 'Mejor precio',
    badgeColor: '#22c55e',
  },
  {
    nombre: 'La Roche-Posay Anthelios UVMune 400 SPF50+',
    categoria: 'Mejor para piel sensible',
    spf: '50+',
    puntos: ['Protección UVA ultra-larga', 'Sin perfume', 'Testado en pieles atópicas'],
    query: 'La+Roche+Posay+Anthelios+UVMune+400+SPF50',
  },
  {
    nombre: 'Garnier Delial Niños Sensitive Advanced SPF50+',
    categoria: 'Mejor para niños',
    spf: '50+',
    puntos: ['Hipoalergénico', 'Sin parabenos', 'Resistente al agua, arena y cloro'],
    query: 'Garnier+Delial+ninos+sensitive+SPF50',
    badge: 'Niños',
    badgeColor: '#3b82f6',
  },
  {
    nombre: 'Avène Solar Spray SPF50+ 200ml',
    categoria: 'Mejor spray',
    spf: '50+',
    puntos: ['Aplicación fácil en spray', 'Agua termal calmante', 'Muy alta protección'],
    query: 'Avene+solar+spray+SPF50',
  },
  {
    nombre: 'Stream2Sea Mineral SPF30 Reef Safe',
    categoria: 'Mejor reef-safe (respetuoso con el mar)',
    spf: '30',
    puntos: ['Sin oxibenzona ni octinoxato', 'Certificado biodegradable', 'Filtros minerales'],
    query: 'Stream2Sea+mineral+reef+safe+SPF30',
    badge: 'Eco',
    badgeColor: '#059669',
  },
  {
    nombre: 'Heliocare 360° Gel Oil-Free SPF50+',
    categoria: 'Mejor para piel grasa',
    spf: '50+',
    puntos: ['Oil-free, toque seco', 'Antioxidantes (Fernblock+)', 'No comedogénico'],
    query: 'Heliocare+360+gel+oil+free+SPF50',
  },
]

function amazonUrl(query: string) {
  return `https://www.amazon.es/s?k=${query}${AMAZON_TAG ? `&tag=${AMAZON_TAG}` : ''}`
}

export default function ProtectoresSolaresPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Protectores solares</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05, letterSpacing: '-.02em',
          marginBottom: '.75rem',
        }}>
          Los <em style={{ fontWeight: 500, color: 'var(--accent)' }}>mejores protectores solares</em> para la playa
        </h1>
        <p style={{ fontSize: '1rem', color: 'var(--muted)', maxWidth: 700, marginBottom: '2rem', lineHeight: 1.65 }}>
          Guía actualizada con los protectores solares más recomendados para ir a la playa en España:
          alto SPF, resistencia al agua, opciones para niños, pieles sensibles y respetuosos con el
          coral. Cada playa de nuestra web muestra el índice UV en tiempo real para que sepas qué nivel
          de protección necesitas.
        </p>

        {/* Guía rápida SPF */}
        <section aria-labelledby="h2-spf" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2rem',
        }}>
          <h2 id="h2-spf" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            ¿Qué SPF necesito según el índice UV?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '.5rem' }}>
            {[
              { uv: '1-2',  nivel: 'Bajo',      spf: 'SPF 15-20', color: '#22c55e' },
              { uv: '3-5',  nivel: 'Moderado',   spf: 'SPF 30',    color: '#eab308' },
              { uv: '6-7',  nivel: 'Alto',        spf: 'SPF 50',    color: '#f97316' },
              { uv: '8-10', nivel: 'Muy alto',    spf: 'SPF 50+',   color: '#ef4444' },
              { uv: '11+',  nivel: 'Extremo',     spf: 'SPF 50+ (reaplicar cada 60 min)', color: '#7c3aed' },
            ].map(r => (
              <div key={r.uv} style={{
                borderLeft: `4px solid ${r.color}`, background: `${r.color}08`,
                borderRadius: '0 4px 4px 0', padding: '.65rem .8rem',
              }}>
                <div style={{ fontWeight: 800, fontSize: '.88rem', color: r.color }}>UV {r.uv}</div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', marginTop: '.1rem' }}>{r.nivel}</div>
                <div style={{ fontSize: '.78rem', fontWeight: 700, color: 'var(--ink)', marginTop: '.25rem' }}>{r.spf}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginTop: '.75rem', lineHeight: 1.5 }}>
            En cada ficha de playa mostramos el <strong>índice UV actual</strong> para que elijas el SPF adecuado.
            En verano en España el UV medio es 8-10 — siempre SPF50+.
          </p>
        </section>

        {/* Productos */}
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '1rem' }}>
          Recomendaciones por categoría
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem', marginBottom: '2.5rem' }}>
          {PRODUCTOS.map(p => (
            <div key={p.nombre} style={{
              background: 'var(--card-bg)', border: '1px solid var(--line)',
              borderRadius: 6, padding: '1.1rem 1.25rem',
              display: 'flex', gap: '1rem', alignItems: 'flex-start',
            }}>
              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 6, flexShrink: 0,
                background: 'rgba(249,115,22,.1)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.5rem',
              }} aria-hidden="true">☀️</div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.2rem' }}>
                  <span style={{ fontWeight: 800, fontSize: '.95rem', color: 'var(--ink)' }}>{p.nombre}</span>
                  {p.badge && (
                    <span style={{
                      fontSize: '.62rem', fontWeight: 700, padding: '.15rem .5rem',
                      borderRadius: 100, background: `${p.badgeColor}18`, color: p.badgeColor,
                      border: `1px solid ${p.badgeColor}44`,
                    }}>{p.badge}</span>
                  )}
                </div>
                <div style={{ fontSize: '.78rem', color: 'var(--accent, #6b400a)', fontWeight: 600, marginBottom: '.35rem' }}>
                  {p.categoria} · SPF {p.spf}
                </div>
                <ul style={{ fontSize: '.82rem', color: 'var(--muted)', paddingLeft: '1rem', lineHeight: 1.7, margin: 0 }}>
                  {p.puntos.map(pt => <li key={pt}>{pt}</li>)}
                </ul>
                {AMAZON_TAG && (
                  <a
                    href={amazonUrl(p.query)}
                    target="_blank" rel="noopener noreferrer sponsored"
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '.4rem',
                      marginTop: '.6rem', padding: '.4rem .85rem',
                      background: '#ff9900', color: '#111', borderRadius: 4,
                      fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
                    }}
                  >
                    Ver precio en Amazon →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Consejos */}
        <section aria-labelledby="h2-tips" style={{
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <h2 id="h2-tips" style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.65rem' }}>
            Cómo usar el protector solar en la playa
          </h2>
          <ol style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.75, paddingLeft: '1.2rem' }}>
            <li><strong>30 minutos antes</strong> de exponerte al sol — necesita tiempo para absorberse.</li>
            <li><strong>2 mg/cm²</strong> — equivale a una cucharada sopera para cara y cuello, otra para cada brazo.</li>
            <li><strong>Reaplicar cada 2 horas</strong> — y siempre tras bañarse, aunque diga "waterproof".</li>
            <li><strong>No olvidar</strong>: orejas, nuca, empeines, labios (con stick SPF).</li>
            <li><strong>Sombra 12-16h</strong> — el UV es máximo; ni el SPF50+ sustituye la sombra.</li>
          </ol>
        </section>

        {/* Reef-safe */}
        <section aria-labelledby="h2-reef" style={{
          background: 'rgba(5,150,105,.06)', border: '1px solid rgba(5,150,105,.3)',
          borderRadius: 6, padding: '1.25rem', marginBottom: '2.5rem',
        }}>
          <h2 id="h2-reef" style={{ fontSize: '1.05rem', fontWeight: 800, color: '#065f46', marginBottom: '.65rem' }}>
            Protector solar reef-safe: ¿por qué importa?
          </h2>
          <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65 }}>
            La <strong>oxibenzona</strong> y el <strong>octinoxato</strong> dañan los corales y la vida marina.
            En zonas de snorkel (Canarias, Cabo de Gata, Menorca) es especialmente importante usar filtros
            minerales (óxido de zinc o dióxido de titanio). Busca el sello <strong>"Reef Safe"</strong> o
            <strong>"Ocean Friendly"</strong>. Hawái y Palau ya los han prohibido; en España todavía no hay
            legislación, pero la conciencia crece.
          </p>
          {AMAZON_TAG && (
            <a
              href={amazonUrl('protector+solar+reef+safe+mineral')}
              target="_blank" rel="noopener noreferrer sponsored"
              style={{
                display: 'inline-flex', marginTop: '.6rem', padding: '.4rem .85rem',
                background: '#059669', color: '#fff', borderRadius: 4,
                fontSize: '.78rem', fontWeight: 700, textDecoration: 'none',
              }}
            >
              Ver protectores reef-safe en Amazon →
            </a>
          )}
        </section>

        {/* Cross-links */}
        <section aria-labelledby="h2-rel" style={{ marginBottom: '2rem' }}>
          <h2 id="h2-rel" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Relacionado
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem' }}>
            {[
              { href: '/playas-aguas-cristalinas', label: 'Aguas cristalinas' },
              { href: '/familias',                  label: 'Playas para familias' },
              { href: '/playas-nudistas',            label: 'Playas nudistas' },
              { href: '/atardeceres',                label: 'Atardeceres' },
              { href: '/surf',                       label: 'Surf en España' },
            ].map(l => (
              <Link key={l.href} href={l.href} style={{
                display: 'inline-flex', padding: '.45rem .85rem',
                background: 'rgba(107,64,10,.14)', color: '#4a2c05', borderRadius: 100,
                fontSize: '.78rem', fontWeight: 600, textDecoration: 'none',
                border: '1px solid rgba(107,64,10,.3)',
              }}>{l.label} →</Link>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section aria-labelledby="h2-faq">
          <h2 id="h2-faq" style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--ink)', marginBottom: '.75rem' }}>
            Preguntas frecuentes
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
            {[
              {
                q: '¿Qué SPF debo usar en la playa en España?',
                a: 'En verano, con índice UV entre 8 y 10, siempre SPF 50+. En primavera y otoño (UV 4-6) puedes usar SPF 30. En invierno (UV 1-3) basta con SPF 15-20 si vas a estar poco rato. Nuestra web muestra el UV actual en cada playa.',
              },
              {
                q: '¿El protector solar caduca?',
                a: 'Sí. La mayoría tiene 12 meses de vida útil una vez abierto (símbolo 12M en el envase). El SPF pierde efectividad con el calor y la exposición al sol. Si huele raro o ha cambiado de textura, descártalo.',
              },
              {
                q: '¿SPF 30 o SPF 50? ¿Cuánta diferencia hay?',
                a: 'SPF 30 bloquea el 97% de los UVB. SPF 50 bloquea el 98%. La diferencia parece mínima, pero SPF 50 da un 50% más de tiempo de exposición. Para playa en España, siempre 50+.',
              },
              {
                q: '¿Los niños necesitan protector solar especial?',
                a: 'Sí. Los menores de 6 meses no deben exponerse al sol directo. A partir de los 6 meses, usar cremas pediátricas SPF 50+, hipoalergénicas y sin perfume. Los filtros minerales son mejor tolerados que los químicos.',
              },
              {
                q: '¿El protector solar resiste realmente al agua?',
                a: 'La etiqueta "water resistant" significa que mantiene su SPF tras 40 minutos en agua. "Very water resistant" son 80 minutos. Pero siempre debes reaplicar al salir del agua: el roce con la toalla y la arena elimina gran parte del producto.',
              },
            ].map((f, i) => (
              <details key={i} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem' }}>
                <summary style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
                <p style={{ fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65, marginTop: '.55rem' }}>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      {/* FAQPage schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            { '@type': 'Question', name: '¿Qué SPF debo usar en la playa en España?', acceptedAnswer: { '@type': 'Answer', text: 'En verano (UV 8-10) siempre SPF 50+. En primavera y otoño (UV 4-6) SPF 30. Nuestra web muestra el UV actual en cada playa.' } },
            { '@type': 'Question', name: '¿El protector solar caduca?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. La mayoría tiene 12 meses de vida útil una vez abierto. El SPF pierde efectividad con el calor y la exposición al sol.' } },
            { '@type': 'Question', name: '¿SPF 30 o SPF 50? ¿Cuánta diferencia hay?', acceptedAnswer: { '@type': 'Answer', text: 'SPF 30 bloquea el 97% de los UVB. SPF 50 bloquea el 98%. La diferencia es un 50% más de tiempo de exposición segura.' } },
            { '@type': 'Question', name: '¿Los niños necesitan protector solar especial?', acceptedAnswer: { '@type': 'Answer', text: 'Sí. A partir de 6 meses, usar cremas pediátricas SPF 50+, hipoalergénicas y sin perfume. Los filtros minerales son mejor tolerados.' } },
            { '@type': 'Question', name: '¿El protector solar resiste realmente al agua?', acceptedAnswer: { '@type': 'Answer', text: '"Water resistant" son 40 minutos. "Very water resistant" 80 minutos. Reaplicar siempre al salir del agua.' } },
          ],
        })}}
      />
    </>
  )
}
