// src/components/ui/Footer.tsx
// Footer común desplegado en layout.tsx. Cumple 3 funciones:
//   1. Internal linking SEO: hubs por tipo de playa, comunidades top
//   2. Brand info / legal (privacidad, cookies, aviso legal, metodología)
//   3. Disclosure de afiliación (legal en España)

import Link from 'next/link'

interface Props {
  locale?: 'es' | 'en'
}

export default function Footer({ locale = 'es' }: Props) {
  const es = locale === 'es'

  return (
    <footer style={{
      marginTop: '4rem',
      padding: '3rem 1.5rem 2rem',
      borderTop: '1px solid var(--line, #e8dcc8)',
      background: 'var(--card-bg, #faf6ef)',
      color: 'var(--ink, #2a1a08)',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem',
          marginBottom: '2.5rem',
        }}>

          {/* Brand */}
          <div>
            <div style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: '1.15rem',
              fontWeight: 500,
              color: 'var(--ink, #2a1a08)',
              marginBottom: '.5rem',
            }}>
              Playas de España
            </div>
            <p style={{
              fontSize: '.78rem',
              color: 'var(--muted, #5a3d12)',
              lineHeight: 1.55,
              margin: 0,
            }}>
              {es
                ? 'Estado del mar y guía de las 5.000+ playas españolas, actualizado cada hora con datos oficiales (MITECO, EEA, AEMET).'
                : '5,000+ Spanish beaches with real-time conditions, updated hourly from official sources.'}
            </p>
          </div>

          {/* Por tipo */}
          <div>
            <FootHeading>{es ? 'Por tipo' : 'By type'}</FootHeading>
            <FootList>
              <Link href="/playas-aguas-cristalinas" style={ls}>{es ? 'Aguas cristalinas' : 'Crystal-clear waters'}</Link>
              <Link href="/calas-con-encanto" style={ls}>{es ? 'Calas con encanto' : 'Hidden coves'}</Link>
              <Link href="/playas-paradisiacas" style={ls}>{es ? 'Playas paradisíacas' : 'Paradise beaches'}</Link>
              <Link href="/playas-secretas" style={ls}>{es ? 'Playas secretas' : 'Secret beaches'}</Link>
              <Link href="/familias" style={ls}>{es ? 'Para familias' : 'For families'}</Link>
              <Link href="/atardeceres" style={ls}>{es ? 'Atardeceres' : 'Sunsets'}</Link>
              <Link href="/playas-perros" style={ls}>{es ? 'Para perros' : 'Dog-friendly'}</Link>
              <Link href="/playas-nudistas" style={ls}>{es ? 'Nudistas' : 'Nudist'}</Link>
              <Link href="/playas-accesibles" style={ls}>{es ? 'Accesibles' : 'Accessible'}</Link>
              <Link href="/banderas-azules" style={ls}>{es ? 'Banderas Azules 2026' : 'Blue Flag 2026'}</Link>
            </FootList>
          </div>

          {/* Servicios */}
          <div>
            <FootHeading>{es ? 'Servicios cerca' : 'Nearby'}</FootHeading>
            <FootList>
              <Link href="/campings" style={ls}>{es ? 'Campings' : 'Campsites'}</Link>
              <Link href="/buceo" style={ls}>{es ? 'Buceo' : 'Diving'}</Link>
              <Link href="/surf" style={ls}>Surf</Link>
              <Link href="/alquiler-barco-playa" style={ls}>{es ? 'Alquilar barco' : 'Boat rental'}</Link>
              <Link href="/playas-autocaravana" style={ls}>{es ? 'Autocaravana' : 'Camper'}</Link>
              <Link href="/protectores-solares" style={ls}>{es ? 'Protectores solares' : 'Sunscreens'}</Link>
              <Link href="/seguros-viaje" style={ls}>{es ? 'Seguros de viaje' : 'Travel insurance'}</Link>
            </FootList>
          </div>

          {/* Por destino */}
          <div>
            <FootHeading>{es ? 'Por destino' : 'By destination'}</FootHeading>
            <FootList>
              <Link href={es ? '/comunidades' : '/en/communities'} style={ls}>{es ? 'Todas las comunidades' : 'All communities'}</Link>
              <Link href="/comunidad/andalucia" style={ls}>Andalucía</Link>
              <Link href="/comunidad/cataluna" style={ls}>Cataluña</Link>
              <Link href="/comunidad/comunitat-valenciana" style={ls}>Valencia</Link>
              <Link href="/comunidad/galicia" style={ls}>Galicia</Link>
              <Link href="/comunidad/islas-baleares" style={ls}>Baleares</Link>
              <Link href="/comunidad/canarias" style={ls}>Canarias</Link>
              <Link href="/islas" style={ls}>{es ? 'Por isla' : 'By island'}</Link>
            </FootList>
          </div>

          {/* Guías */}
          <div>
            <FootHeading>{es ? 'Guías' : 'Guides'}</FootHeading>
            <FootList>
              <Link href="/que-llevar/playa-arenosa" style={ls}>{es ? 'Qué llevar' : 'What to bring'}</Link>
              <Link href="/calidad-agua" style={ls}>{es ? 'Calidad del agua' : 'Water quality'}</Link>
              <Link href="/medusas" style={ls}>{es ? 'Medusas' : 'Jellyfish'}</Link>
              <Link href="/mapa" style={ls}>{es ? 'Mapa interactivo' : 'Interactive map'}</Link>
              <Link href="/comparar" style={ls}>{es ? 'Comparar playas' : 'Compare beaches'}</Link>
              <Link href="/rutas" style={ls}>{es ? 'Rutas por la costa' : 'Coastal routes'}</Link>
              <Link href="/playas-cerca-de-mi" style={ls}>{es ? 'Cerca de mí' : 'Near me'}</Link>
            </FootList>
          </div>

          {/* Sobre */}
          <div>
            <FootHeading>{es ? 'Sobre' : 'About'}</FootHeading>
            <FootList>
              <Link href="/metodologia" style={ls}>{es ? 'Metodología y datos' : 'Methodology'}</Link>
              <Link href="/widget" style={ls}>{es ? 'Widget para tu web' : 'Widget for your site'}</Link>
              <Link href="/aviso-legal" style={ls}>{es ? 'Aviso legal' : 'Legal'}</Link>
              <Link href="/privacidad" style={ls}>{es ? 'Privacidad' : 'Privacy'}</Link>
              <Link href="/cookies" style={ls}>Cookies</Link>
            </FootList>
          </div>
        </div>

        {/* Bottom row: copyright + disclosure */}
        <div style={{
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--line, #e8dcc8)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          fontSize: '.72rem',
          color: 'var(--muted, #5a3d12)',
          lineHeight: 1.5,
        }}>
          <div>
            © {new Date().getFullYear()} Playas de España.{' '}
            <a href="https://www.miteco.gob.es/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>MITECO</a>
            {' · '}
            <a href="https://www.eea.europa.eu/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>EEA</a>
            {' · '}
            <a href="https://www.aemet.es/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>AEMET</a>
            {' · '}
            <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>Open-Meteo</a>
          </div>
          <div style={{ maxWidth: 460, textAlign: 'right' }}>
            {es
              ? 'Algunos enlaces son de afiliación. Si compras a través de ellos ganamos una comisión sin coste adicional para ti.'
              : 'Some links are affiliate. If you purchase through them we earn a commission at no extra cost.'}
          </div>
        </div>
      </div>
    </footer>
  )
}


// ── Subcomponents ───────────────────────────────────────────────────
function FootHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-mono, monospace)',
      fontSize: '.72rem',
      fontWeight: 600,
      letterSpacing: '.12em',
      textTransform: 'uppercase',
      color: 'var(--ink, #2a1a08)',
      margin: '0 0 .85rem',
    }}>
      {children}
    </h3>
  )
}

function FootList({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.45rem' }}>
      {children}
    </div>
  )
}

const ls: React.CSSProperties = {
  fontSize: '.82rem',
  color: 'var(--muted, #5a3d12)',
  textDecoration: 'none',
  transition: 'color .15s',
}
