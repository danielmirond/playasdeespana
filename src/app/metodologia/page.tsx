// src/app/metodologia/page.tsx. Página EEAT
// Señales de Experience, Expertise, Authoritativeness, Trustworthiness:
// fuentes con URL + año, metodología del scoring 0-100, política
// editorial, frecuencia de actualización, equipo y contacto.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export const revalidate = 604800

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

export const metadata: Metadata = {
  title: 'Metodología y fuentes | De dónde salen los datos',
  description: 'De dónde vienen los datos de cada playa, cómo se calcula la nota 0-100 y con qué frecuencia se actualizan. Fuentes: Open-Meteo, MITECO, EEA, IGN, ADEAC, OpenStreetMap.',
  alternates: { canonical: '/metodologia' },
  openGraph: {
    title: 'Metodología y fuentes de playas-espana.com',
    description: 'De dónde salen los datos de cada playa y cómo se calcula la nota.',
    url: `${BASE}/metodologia`,
    type: 'article',
  },
}

interface Fuente {
  nombre:    string
  url:       string
  rol:       string
  dato:      string
  frecuencia: string
}

const FUENTES: Fuente[] = [
  {
    nombre:     'Open-Meteo Marine API',
    url:        'https://open-meteo.com/en/docs/marine-weather-api',
    rol:        'Oleaje y temperatura del agua',
    dato:       'Altura de ola, periodo y temperatura superficial del mar (SST) en cada coordenada.',
    frecuencia: 'Cada hora',
  },
  {
    nombre:     'Open-Meteo Forecast API',
    url:        'https://open-meteo.com/en/docs',
    rol:        'Meteorología y viento',
    dato:       'Velocidad y dirección del viento, UV, temperatura del aire, humedad, horas de luz.',
    frecuencia: 'Cada hora',
  },
  {
    nombre:     'MITECO. Ministerio para la Transición Ecológica',
    url:        'https://www.miteco.gob.es/es/costas/temas/proteccion-medio-marino/playas.html',
    rol:        'Inventario oficial de playas',
    dato:       'Composición, servicios, accesibilidad, longitud y tipo de cada playa española.',
    frecuencia: 'Anual (actualización temporada)',
  },
  {
    nombre:     'EEA. European Environment Agency',
    url:        'https://www.eea.europa.eu/themes/water/europes-seas-and-coasts/assessments/state-of-bathing-water',
    rol:        'Calidad del agua de baño',
    dato:       'Clasificación oficial EEA (Excelente / Buena / Suficiente / Deficiente) por punto de muestreo.',
    frecuencia: 'Anual (temporada pasada)',
  },
  {
    nombre:     'ADEAC. Bandera Azul',
    url:        'https://www.adeac.es/',
    rol:        'Distintivo Bandera Azul',
    dato:       'Listado oficial de playas galardonadas en España, actualizado cada temporada.',
    frecuencia: 'Anual (mayo)',
  },
  {
    nombre:     'IGN. Instituto Geográfico Nacional',
    url:        'https://www.ign.es/',
    rol:        'Cartografía base',
    dato:       'Coordenadas oficiales, mapas ortofoto e información geográfica del territorio.',
    frecuencia: 'Continuo',
  },
  {
    nombre:     'CartoCiudad',
    url:        'https://www.cartociudad.es/',
    rol:        'Callejero y geocoding',
    dato:       'Resolución de municipios y provincias a partir de coordenadas geográficas.',
    frecuencia: 'Continuo',
  },
  {
    nombre:     'OpenStreetMap · Overpass API',
    url:        'https://overpass-api.de/',
    rol:        'Servicios y puntos de interés',
    dato:       'Parkings, duchas, chiringuitos, hoteles, campings, centros de buceo y escuelas.',
    frecuencia: 'Continuo (colaborativo)',
  },
]

interface Factor {
  nombre: string
  peso:   string
  desc:   string
}

const FACTORES: Factor[] = [
  { nombre: 'Oleaje',            peso: '25 pts', desc: 'Altura de ola. <0.3m = óptimo, >2m = peligroso.' },
  { nombre: 'Viento',            peso: '20 pts', desc: 'Velocidad sostenida. <15 km/h = óptimo, >35 km/h = desaconsejado.' },
  { nombre: 'Temperatura agua',  peso: '15 pts', desc: 'SST. 22-26°C = ideal, <18°C penaliza para baño.' },
  { nombre: 'UV + aire',         peso: '10 pts', desc: 'Índice UV y temperatura ambiente.' },
  { nombre: 'Calidad del agua',  peso: '15 pts', desc: 'Clasificación EEA oficial de la última temporada.' },
  { nombre: 'Servicios',         peso: '10 pts', desc: 'Socorrismo, duchas, parking, aseos, accesibilidad.' },
  { nombre: 'Distintivos',       peso: '5 pts',  desc: 'Bandera Azul y reconocimientos oficiales.' },
]

export default function MetodologiaPage() {
  // Schema.org AboutPage. ayuda a Google a entender la intención EEAT
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AboutPage',
    name: 'Metodología y fuentes. playas-espana.com',
    description: 'Cómo se calcula la nota de cada playa, fuentes y política editorial.',
    url: `${BASE}/metodologia`,
    publisher: {
      '@type': 'Organization',
      name: 'playas-espana.com',
      url: BASE,
    },
    mainEntity: {
      '@type': 'Article',
      headline: 'De dónde salen los datos y cómo se calcula la nota',
      datePublished: '2024-06-01',
      dateModified: new Date().toISOString().slice(0, 10),
      author: {
        '@type': 'Organization',
        name: 'Equipo editorial de playas-espana.com',
      },
      citation: FUENTES.map(f => ({
        '@type': 'CreativeWork',
        name: f.nombre,
        url: f.url,
      })),
    },
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Nav />
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav aria-label="Ruta de navegación" style={{
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '1rem',
        }}>
          <Link href="/">Inicio</Link>
          <span aria-hidden="true" style={{ margin: '0 .35rem', opacity: .5 }}>›</span>
          <span aria-current="page">Metodología y fuentes</span>
        </nav>

        <div style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '.72rem', fontWeight: 500,
          letterSpacing: '.16em', textTransform: 'uppercase',
          color: 'var(--muted)', marginBottom: '.5rem',
        }}>
          Transparencia editorial
        </div>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, color: 'var(--ink)', lineHeight: 1.05,
          letterSpacing: '-.02em', marginBottom: '.75rem',
        }}>
          De dónde salen <em style={{ fontWeight: 500, color: 'var(--accent)' }}>los datos</em>
        </h1>

        <p style={{
          fontSize: '1.08rem', color: 'var(--muted)',
          lineHeight: 1.65, marginBottom: '2.5rem', maxWidth: 680,
        }}>
          Cada playa tiene una nota de 0 a 100. Se calcula con datos públicos que se
          actualizan cada hora. En esta página explicamos qué fuentes usamos, qué pesa
          más en la nota y cómo nos aseguramos de que nadie pague por salir mejor.
        </p>

        {/* Última actualización + autoría */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '.85rem',
          marginBottom: '2.5rem',
          padding: '1.1rem 1.25rem',
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6,
          fontFamily: 'var(--font-mono, ui-monospace, monospace)',
          fontSize: '.78rem',
        }}>
          <div>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: '.25rem' }}>
              Publicado
            </div>
            <div style={{ color: 'var(--ink)', fontWeight: 500 }}>Junio 2024</div>
          </div>
          <div>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: '.25rem' }}>
              Última revisión
            </div>
            <div style={{ color: 'var(--ink)', fontWeight: 500 }}>Abril 2026</div>
          </div>
          <div>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: '.25rem' }}>
              Autor
            </div>
            <div style={{ color: 'var(--ink)', fontWeight: 500 }}>Equipo editorial</div>
          </div>
          <div>
            <div style={{ fontSize: '.65rem', textTransform: 'uppercase', letterSpacing: '.12em', color: 'var(--muted)', marginBottom: '.25rem' }}>
              Datos
            </div>
            <div style={{ color: 'var(--ink)', fontWeight: 500 }}>5.054 playas · España</div>
          </div>
        </div>

        {/* Scoring */}
        <section aria-labelledby="h2-scoring" style={{ marginBottom: '3rem' }}>
          <h2 id="h2-scoring" style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700,
            color: 'var(--ink)', letterSpacing: '-.015em', marginBottom: '.85rem',
          }}>
            Cómo se calcula la nota
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            La nota de cada playa sale de siete factores. Los pesos se basan en las
            recomendaciones de <strong>Cruz Roja Española</strong> y la <strong>RFESS</strong>
            {' '}(Real Federación Española de Salvamento y Socorrismo) sobre condiciones
            seguras de baño. El resultado es un número de 0 a 100 que puedes comparar
            entre playas y entre días.
          </p>

          <div style={{
            display: 'flex', flexDirection: 'column', gap: '.5rem',
            marginBottom: '1.5rem',
          }}>
            {FACTORES.map(f => (
              <div key={f.nombre} style={{
                display: 'grid',
                gridTemplateColumns: '180px 80px 1fr',
                alignItems: 'baseline', gap: '1rem',
                padding: '.75rem 1rem',
                background: 'var(--card-bg)', border: '1px solid var(--line)',
                borderRadius: 4,
              }}>
                <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)' }}>
                  {f.nombre}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '.78rem', color: 'var(--accent)', fontWeight: 500,
                }}>
                  {f.peso}
                </div>
                <div style={{ fontSize: '.85rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>

          <p style={{
            fontSize: '.88rem', color: 'var(--muted)', lineHeight: 1.6,
            borderLeft: '3px solid var(--accent)', paddingLeft: '1rem',
          }}>
            <strong style={{ color: 'var(--ink)' }}>La nota es orientativa.</strong>{' '}
            Una playa con 92 puede tener medusas ese día; una con 58 puede ser
            perfecta para surfear. Si ves bandera roja o el socorrista te dice que no,
            la nota da igual.
          </p>
        </section>

        {/* Fuentes */}
        <section aria-labelledby="h2-fuentes" style={{ marginBottom: '3rem' }}>
          <h2 id="h2-fuentes" style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700,
            color: 'var(--ink)', letterSpacing: '-.015em', marginBottom: '.85rem',
          }}>
            Fuentes oficiales y referencias
          </h2>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '1.5rem' }}>
            Todos los datos provienen de APIs públicas o catálogos oficiales. No reinventamos
            la medición. solo la presentamos con contexto útil. Cada ficha de playa enlaza
            a la fuente cuando aplica.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
            {FUENTES.map(f => (
              <a
                key={f.nombre}
                href={f.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr auto',
                  gap: '1rem',
                  padding: '.9rem 1.1rem',
                  background: 'var(--card-bg)', border: '1px solid var(--line)',
                  borderRadius: 4, textDecoration: 'none',
                  transition: 'border-color .15s',
                }}
              >
                <div>
                  <div style={{
                    fontFamily: 'var(--font-serif)', fontWeight: 700,
                    fontSize: '.98rem', color: 'var(--ink)',
                    marginBottom: '.15rem',
                  }}>
                    {f.nombre} <span style={{ fontSize: '.75rem', color: 'var(--accent)', fontWeight: 500 }}>↗</span>
                  </div>
                  <div style={{ fontSize: '.78rem', color: 'var(--accent)', fontWeight: 500, marginBottom: '.3rem' }}>
                    {f.rol}
                  </div>
                  <div style={{ fontSize: '.82rem', color: 'var(--muted)', lineHeight: 1.55 }}>
                    {f.dato}
                  </div>
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '.68rem', color: 'var(--muted)',
                  textTransform: 'uppercase', letterSpacing: '.08em',
                  whiteSpace: 'nowrap',
                  alignSelf: 'flex-start',
                  textAlign: 'right',
                }}>
                  {f.frecuencia}
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Política editorial */}
        <section aria-labelledby="h2-editorial" style={{ marginBottom: '3rem' }}>
          <h2 id="h2-editorial" style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.65rem', fontWeight: 700,
            color: 'var(--ink)', letterSpacing: '-.015em', marginBottom: '.85rem',
          }}>
            Política editorial
          </h2>
          <ul style={{
            fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.75,
            paddingLeft: '1.25rem', margin: 0,
          }}>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Los rankings no se pagan.</strong>{' '}
              Ninguna playa, municipio o comunidad puede comprar posición. La puntuación depende
              únicamente de datos públicos.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Los afiliados están señalizados.</strong>{' '}
              Cuando recomendamos Booking, Amazon, Civitatis, Heymondo o Click&Boat marcamos
              el enlace como patrocinado y explicamos la comisión.{' '}
              <Link href="/cookies" style={{ color: 'var(--accent)' }}>Política completa</Link>.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Los usuarios contribuyen.</strong>{' '}
              Los reportes (medusas, banderas, parking) se agregan de forma anónima y caducan
              a las 24 horas para mantener la señal reciente.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>Las correcciones son públicas.</strong>{' '}
              Si detectamos un error en un dato o metodología, lo corregimos y lo anotamos en
              la ficha afectada con fecha de corrección.
            </li>
            <li>
              <strong style={{ color: 'var(--ink)' }}>No sustituimos a las autoridades.</strong>{' '}
              Ante bandera roja, indicación del socorrista o aviso de Protección Civil,
              siempre prevalece la señal oficial sobre nuestra puntuación.
            </li>
          </ul>
        </section>

        {/* Contacto */}
        <section aria-labelledby="h2-contacto" style={{
          padding: '1.5rem 1.75rem',
          background: 'var(--card-bg)', border: '1px solid var(--line)',
          borderRadius: 6,
        }}>
          <h2 id="h2-contacto" style={{
            fontFamily: 'var(--font-serif)', fontSize: '1.15rem', fontWeight: 700,
            color: 'var(--ink)', marginBottom: '.5rem',
          }}>
            ¿Ves un dato incorrecto?
          </h2>
          <p style={{ fontSize: '.92rem', color: 'var(--muted)', lineHeight: 1.6, margin: 0 }}>
            Escríbenos a{' '}
            <a href="mailto:hola@playas-espana.com" style={{ color: 'var(--accent)', fontWeight: 500 }}>
              hola@playas-espana.com
            </a>{' '}
            con el nombre de la playa, el dato que parece incorrecto y, si puedes, el enlace a
            la fuente oficial. Revisamos todas las incidencias en menos de 72 horas.
          </p>
        </section>
      </main>
    </>
  )
}
