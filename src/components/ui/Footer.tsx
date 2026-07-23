// src/components/ui/Footer.tsx
// Footer común desplegado en layout.tsx. Cumple 4 funciones:
//   1. Internal linking SEO: anchors coinciden con H1 destino para evitar
//      anchorMismatch (señal documentada en la Content Warehouse leak).
//   2. Brand info / legal (privacidad, cookies, aviso legal, metodología).
//   3. Disclosure de afiliación (legal en España).
//   4. E-E-A-T: atribución visible a fuentes oficiales + última sincro.

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
                ? 'Estado del mar y guía de más de 4.500 playas españolas, actualizado cada hora con datos oficiales (MITECO, EEA, AEMET).'
                : '4,500+ Spanish beaches with real-time conditions, updated hourly from official sources.'}
            </p>
          </div>

          {/* Por tipo de playa */}
          <div>
            <FootHeading>{es ? 'Por tipo de playa' : 'By beach type'}</FootHeading>
            <FootList>
              <Link href="/playas-aguas-cristalinas" style={ls}>{es ? 'Playas con aguas cristalinas' : 'Crystal-clear water beaches'}</Link>
              <Link href="/playas-paradisiacas" style={ls}>{es ? 'Playas paradisíacas' : 'Paradise beaches'}</Link>
              <Link href="/calas-secretas" style={ls}>{es ? 'Calas secretas' : 'Secret coves'}</Link>
              <Link href="/familias" style={ls}>{es ? 'Playas para familias' : 'Family-friendly beaches'}</Link>
              <Link href="/atardeceres" style={ls}>{es ? 'Playas para ver el atardecer' : 'Sunset beaches'}</Link>
              <Link href="/playas-perros" style={ls}>{es ? 'Playas para perros' : 'Dog-friendly beaches'}</Link>
              <Link href="/playas-nudistas" style={ls}>{es ? 'Playas nudistas' : 'Nudist beaches'}</Link>
              <Link href="/playas-accesibles" style={ls}>{es ? 'Playas accesibles' : 'Accessible beaches'}</Link>
              <Link href="/banderas-azules" style={ls}>{es ? 'Playas con Bandera Azul' : 'Blue Flag beaches'}</Link>
            </FootList>
          </div>

          {/* Servicios cerca de la playa */}
          <div>
            <FootHeading>{es ? 'Servicios cerca' : 'Nearby services'}</FootHeading>
            <FootList>
              <Link href="/campings" style={ls}>{es ? 'Campings cerca de la playa' : 'Campsites near beaches'}</Link>
              <Link href="/buceo" style={ls}>{es ? 'Buceo en España' : 'Diving in Spain'}</Link>
              <Link href="/surf" style={ls}>{es ? 'Surf en España' : 'Surf in Spain'}</Link>
              <Link href="/alquiler-barco" style={ls}>{es ? 'Alquiler de barcos' : 'Boat rental'}</Link>
              <Link href="/playas-autocaravana" style={ls}>{es ? 'Playas para autocaravana' : 'Beaches for campervans'}</Link>
              <Link href="/alquiler-autocaravana" style={ls}>{es ? 'Alquiler de autocaravanas' : 'Campervan rental'}</Link>
              <Link href="/hoteles-playa" style={ls}>{es ? 'Hoteles en la playa' : 'Beach hotels'}</Link>
              <Link href="/yoga-playa" style={ls}>{es ? 'Yoga y pilates en la playa' : 'Beach yoga & pilates'}</Link>
              <Link href="/protectores-solares" style={ls}>{es ? 'Protectores solares' : 'Sunscreens'}</Link>
              <Link href="/seguros-viaje" style={ls}>{es ? 'Seguros de viaje' : 'Travel insurance'}</Link>
            </FootList>
          </div>

          {/* Por destino */}
          <div>
            <FootHeading>{es ? 'Por comunidad' : 'By region'}</FootHeading>
            <FootList>
              <Link href={es ? '/comunidades' : '/en/communities'} style={ls}>{es ? 'Todas las comunidades' : 'All regions'}</Link>
              <Link href="/comunidad/andalucia" style={ls}>{es ? 'Playas de Andalucía' : 'Beaches of Andalusia'}</Link>
              <Link href="/comunidad/cataluna" style={ls}>{es ? 'Playas de Cataluña' : 'Beaches of Catalonia'}</Link>
              <Link href="/comunidad/comunitat-valenciana" style={ls}>{es ? 'Playas de la Comunidad Valenciana' : 'Beaches of Valencia'}</Link>
              <Link href="/comunidad/galicia" style={ls}>{es ? 'Playas de Galicia' : 'Beaches of Galicia'}</Link>
              <Link href="/comunidad/islas-baleares" style={ls}>{es ? 'Playas de Baleares' : 'Beaches of the Balearics'}</Link>
              <Link href="/comunidad/canarias" style={ls}>{es ? 'Playas de Canarias' : 'Beaches of the Canaries'}</Link>
              <Link href="/islas" style={ls}>{es ? 'Playas por isla' : 'Beaches by island'}</Link>
            </FootList>
          </div>

          {/* Guías */}
          <div>
            <FootHeading>{es ? 'Guías' : 'Guides'}</FootHeading>
            <FootList>
              <Link href="/magazine" style={ls}>Magazine</Link>
              <Link href="/que-llevar/playa-arenosa" style={ls}>{es ? 'Qué llevar a la playa' : 'What to bring to the beach'}</Link>
              <Link href="/calidad-agua" style={ls}>{es ? 'Calidad del agua de baño' : 'Bathing water quality'}</Link>
              <Link href="/medusas" style={ls}>{es ? 'Temporada de medusas' : 'Jellyfish season'}</Link>
              <Link href="/mapa" style={ls}>{es ? 'Mapa interactivo de playas' : 'Interactive beach map'}</Link>
              <Link href="/comparar" style={ls}>{es ? 'Comparar playas' : 'Compare beaches'}</Link>
              <Link href="/rutas" style={ls}>{es ? 'Rutas costeras por España' : 'Coastal routes in Spain'}</Link>
              <Link href="/playas-cerca-de-mi" style={ls}>{es ? 'Playas cerca de mí' : 'Beaches near me'}</Link>
            </FootList>
          </div>

          {/* Sobre */}
          <div>
            <FootHeading>{es ? 'Sobre Playas de España' : 'About'}</FootHeading>
            <FootList>
              <Link href="/metodologia" style={ls}>{es ? 'Metodología y fuentes de datos' : 'Methodology'}</Link>
              <Link href="/widget" style={ls}>{es ? 'Widget para tu web' : 'Widget for your site'}</Link>
              <Link href="/aviso-legal" style={ls}>{es ? 'Aviso legal' : 'Legal notice'}</Link>
              <Link href="/privacidad" style={ls}>{es ? 'Política de privacidad' : 'Privacy policy'}</Link>
              <Link href="/cookies" style={ls}>{es ? 'Política de cookies' : 'Cookie policy'}</Link>
            </FootList>
          </div>
        </div>

        {/* Bloque E-E-A-T: atribución visible + última sincro */}
        <div style={{
          background:    'var(--bg, #fffaf0)',
          border:        '1px solid var(--line, #e8dcc8)',
          borderRadius:  6,
          padding:       '1rem 1.15rem',
          marginBottom:  '1.5rem',
          fontSize:      '.78rem',
          color:         'var(--ink, #2a1a08)',
          lineHeight:    1.55,
        }}>
          <div style={{
            fontFamily:    'var(--font-mono, monospace)',
            fontSize:      '.7rem',
            fontWeight:    600,
            letterSpacing: '.12em',
            textTransform: 'uppercase',
            color:         'var(--muted, #5a3d12)',
            marginBottom:  '.5rem',
          }}>
            {es ? 'Datos oficiales' : 'Official data sources'}
          </div>
          <p style={{ margin: '0 0 .35rem' }}>
            {es
              ? <>Información de las {' '}
                  <Link href="/metodologia" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                    fuentes oficiales españolas y europeas
                  </Link>
                  : Ministerio para la Transición Ecológica (MITECO),
                  Agencia Europea de Medio Ambiente (EEA), AEMET y Open-Meteo.
                </>
              : <>Data from official Spanish and European sources: MITECO, EEA, AEMET and Open-Meteo.{' '}
                  <Link href="/metodologia" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
                    Read our methodology
                  </Link>.
                </>}
          </p>
          {/* Atribución honesta: dos timescales distintos.
              Antes mostrábamos "Última sincronización con MITECO: hace 8 años"
              que sonaba a abandono total siendo que (a) MITECO no ha publicado
              dataset nuevo desde 2018 y (b) los datos meteo SÍ se refrescan
              cada hora. Separar las dos cosas evita el claim engañoso
              "actualizado cada hora" + "hace 8 años" en la misma página. */}
          <p style={{ margin: 0, fontSize: '.72rem', color: 'var(--muted, #5a3d12)' }}>
            {es
              ? <>Meteo en tiempo real ·{' '}
                  <a href="https://www.aemet.es/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>AEMET</a>
                  {', '}
                  <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>Open-Meteo</a>
                  {' · Datos físicos: dataset '}
                  <a href="https://www.miteco.gob.es/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>MITECO</a>
                  {' 2018 (última edición publicada) · Calidad del agua: '}
                  <a href="https://www.eea.europa.eu/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>EEA</a>
                </>
              : <>Real-time weather ·{' '}
                  <a href="https://www.aemet.es/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>AEMET</a>
                  {', '}
                  <a href="https://open-meteo.com/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>Open-Meteo</a>
                  {' · Physical data: '}
                  <a href="https://www.miteco.gob.es/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>MITECO</a>
                  {' 2018 dataset · Water quality: '}
                  <a href="https://www.eea.europa.eu/" target="_blank" rel="noopener noreferrer nofollow" style={{ color: 'inherit' }}>EEA</a>
                </>
            }
          </p>
        </div>

        {/* Bottom row: copyright + disclosure */}
        <div style={{
          paddingTop:     '1.5rem',
          borderTop:      '1px solid var(--line, #e8dcc8)',
          display:        'flex',
          flexWrap:       'wrap',
          gap:            '1rem',
          justifyContent: 'space-between',
          alignItems:     'flex-start',
          fontSize:       '.72rem',
          color:          'var(--muted, #5a3d12)',
          lineHeight:     1.5,
        }}>
          <div>
            © {new Date().getFullYear()} Playas de España ·{' '}
            <Link href="/metodologia" style={{ color: 'inherit' }}>{es ? 'Metodología' : 'Methodology'}</Link>
            {' · '}
            <Link href="/aviso-legal" style={{ color: 'inherit' }}>{es ? 'Aviso legal' : 'Legal'}</Link>
            {' · '}
            <Link href="/privacidad" style={{ color: 'inherit' }}>{es ? 'Privacidad' : 'Privacy'}</Link>
          </div>
          <div style={{ maxWidth: 480, textAlign: 'right' }}>
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
