// src/app/widget/page.tsx. Página de docs del widget embebible
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const revalidate = 604800

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Widget de playa | Embebe el estado del mar en tu web',
  description: 'Widget gratuito con el score de cualquier playa de España. Copia y pega una línea de HTML en tu blog, hotel o web de turismo.',
  alternates: { canonical: '/widget' },
}

const EXAMPLE_SLUG = 'playa-de-la-concha'
const SNIPPET = `<div data-playa="${EXAMPLE_SLUG}"></div>
<script src="${BASE}/api/widget/embed" defer><\/script>`

export default function WidgetPage() {
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{ fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem' }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Widget</span>
        </nav>

        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '.72rem', fontWeight: 500,
          letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          Para webs y blogs
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(2rem, 5.5vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)',
          lineHeight: 1.02, letterSpacing: '-.02em',
          marginBottom: '.75rem',
        }}>
          Widget <em style={{ fontWeight: 500, color: 'var(--accent)' }}>de playa</em>
        </h1>

        <p style={{
          fontSize: '1.05rem', color: 'var(--muted)',
          lineHeight: 1.65, maxWidth: 640, marginBottom: '2.5rem',
        }}>
          Muestra el estado del mar de cualquier playa de España en tu web.
          Gratuito, sin registro, datos actualizados cada hora. Solo copia y pega.
        </p>

        {/* Preview */}
        <section style={{ marginBottom: '3rem' }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.65rem',
          }}>
            Vista previa
          </div>
          <div style={{
            padding: '2rem',
            background: '#f8f8f8',
            border: '1px solid var(--line)',
            borderRadius: 6,
            display: 'flex', justifyContent: 'center',
          }}>
            {/* Simulated widget output */}
            <a
              href={`${BASE}/playas/${EXAMPLE_SLUG}`}
              target="_blank"
              rel="noopener"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 10,
                padding: '10px 14px',
                background: '#faf4e6', border: '1px solid #e5d6b4', borderRadius: 6,
                fontFamily: 'Georgia, serif', textDecoration: 'none', color: '#2a1a08',
                maxWidth: 360,
              }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#3d6b1f', color: '#fff', fontWeight: 700, fontSize: 15,
                flexShrink: 0,
              }}>
                87
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>Playa de la Concha</div>
                <div style={{ fontSize: 11, color: '#7a6858', marginTop: 2 }}>San Sebastián · Gipuzkoa</div>
                <div style={{ fontSize: 11, color: '#7a6858', marginTop: 3, fontFamily: 'ui-monospace, monospace' }}>19°C · 0.3m olas · 12km/h</div>
                <div style={{ fontSize: 9, color: '#a89880', marginTop: 4, letterSpacing: '.08em', textTransform: 'uppercase' }}>playas-espana.com</div>
              </div>
            </a>
          </div>
        </section>

        {/* Código */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.75rem',
          }}>
            Cómo <em style={{ fontWeight: 500, color: 'var(--accent)' }}>instalarlo</em>
          </h2>
          <p style={{
            fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.6,
            marginBottom: '1rem', maxWidth: 600,
          }}>
            Pega este código donde quieras que aparezca el widget.
            Cambia <code style={{
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              fontSize: '.85em', background: 'var(--card-bg)',
              padding: '2px 6px', borderRadius: 3, border: '1px solid var(--line)',
            }}>data-playa</code> por el slug de tu playa (lo encuentras en la URL de la ficha).
          </p>

          <pre style={{
            background: 'var(--tinta-900, #1a0f04)',
            color: 'var(--arena-50, #faf4e6)',
            padding: '1.25rem 1.5rem',
            borderRadius: 6,
            fontSize: '.82rem',
            lineHeight: 1.65,
            overflow: 'auto',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            border: '1px solid var(--tinta-700, #3d2a14)',
          }}>
            {SNIPPET}
          </pre>
        </section>

        {/* Múltiples widgets */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.65rem',
          }}>
            Varias playas a la vez
          </h2>
          <p style={{
            fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.6,
            marginBottom: '1rem', maxWidth: 600,
          }}>
            Añade tantos <code style={{
              fontFamily: 'var(--font-mono)', fontSize: '.85em',
              background: 'var(--card-bg)', padding: '2px 6px',
              borderRadius: 3, border: '1px solid var(--line)',
            }}>data-playa</code> como necesites. El script carga todos en paralelo.
          </p>
          <pre style={{
            background: 'var(--tinta-900)', color: 'var(--arena-50)',
            padding: '1.25rem 1.5rem', borderRadius: 6,
            fontSize: '.82rem', lineHeight: 1.65, overflow: 'auto',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            border: '1px solid var(--tinta-700)',
          }}>
{`<div data-playa="playa-de-la-concha"></div>
<div data-playa="playa-de-la-malvarrosa"></div>
<div data-playa="playa-de-las-canteras"></div>
<script src="${BASE}/api/widget/embed" defer><\/script>`}
          </pre>
        </section>

        {/* API directa */}
        <section style={{ marginBottom: '3rem' }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.2rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.65rem',
          }}>
            API JSON directa
          </h2>
          <p style={{
            fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.6,
            marginBottom: '1rem', maxWidth: 600,
          }}>
            Si prefieres hacer tu propio diseño, usa la API directamente.
            Devuelve JSON con CORS abierto.
          </p>
          <pre style={{
            background: 'var(--tinta-900)', color: 'var(--arena-50)',
            padding: '1.25rem 1.5rem', borderRadius: 6,
            fontSize: '.82rem', lineHeight: 1.65, overflow: 'auto',
            fontFamily: 'var(--font-mono, ui-monospace, monospace)',
            border: '1px solid var(--tinta-700)',
          }}>
{`GET ${BASE}/api/widget?slug=playa-de-la-concha

Response:
{
  "slug": "playa-de-la-concha",
  "nombre": "Playa de la Concha",
  "municipio": "San Sebastián",
  "score": 87,
  "label": "Excelente",
  "color": "#3d6b1f",
  "agua": 19,
  "olas": 0.3,
  "viento": 12,
  "url": "${BASE}/playas/playa-de-la-concha"
}`}
          </pre>
        </section>

        {/* Condiciones */}
        <section style={{
          padding: '1.5rem 1.75rem',
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6,
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.5rem',
          }}>
            Condiciones de uso
          </h2>
          <ul style={{
            fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.65,
            paddingLeft: '1.25rem', margin: 0,
          }}>
            <li>Gratuito para uso personal, blogs, hoteles, campings y webs de turismo.</li>
            <li>El widget incluye un enlace a playas-espana.com. no lo elimines.</li>
            <li>Los datos se actualizan cada hora. No caches los resultados más de 1 hora.</li>
            <li>Para uso comercial masivo ({'>'} 10.000 peticiones/día), contacta a <a href="mailto:hola@playas-espana.com" style={{ color: 'var(--accent)' }}>hola@playas-espana.com</a>.</li>
          </ul>
        </section>
      </main>
    </>
  )
}
