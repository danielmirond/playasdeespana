// src/app/page.tsx — Homepage orientada a producto.
//
// Estructura:
//   1. Hero — "¿A qué playa voy hoy?" + CTAs
//   2. Buscador (con filtros funcionales)
//   3. Top playas hoy (por score 0-100 real)
//   4. Evita hoy (playas con peor score)
//   5. Favoritas + Cercanas (client blocks)
//   6. Hub SEO: comunidades + banderas + perros + nudistas
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import Hero from '@/components/home/Hero'
import Buscador from '@/components/home/Buscador'
import Destacadas from '@/components/home/Destacadas'
import Comunidades from '@/components/home/Comunidades'
import ClientBlocks from '@/components/home/ClientBlocks'
import TopCercanas from '@/components/home/TopCercanas'
import ActividadesHoy from '@/components/home/ActividadesHoy'
import ParkingHoy from '@/components/home/ParkingHoy'
import MonetizacionBlock from '@/components/home/MonetizacionBlock'
import { getPlayas, getComunidades } from '@/lib/playas'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Playas de España — ¿A qué playa voy hoy?',
  description: 'Motor de decisión en tiempo real: puntuamos cada playa de 0 a 100 según el viento, oleaje, temperatura y servicios. Elige la mejor playa para hoy.',
  openGraph: {
    title: 'Playas de España — ¿A qué playa voy hoy?',
    description: 'Puntuamos cada playa de 0 a 100 en tiempo real.',
    url: 'https://playas-espana.com',
    images: [{ url: '/api/og?playa=Playas+de+España', width: 1200, height: 630 }],
  },
}

export default async function HomePage() {
  const [playas, comunidades] = await Promise.all([
    getPlayas(),
    getComunidades(),
  ])

  // Seleccionar ~48 candidatas: 2 bien equipadas + 2 al azar por comunidad.
  // La mezcla es clave: las bien equipadas compiten por "Top playas hoy" y
  // las aleatorias (que pueden tener pocos servicios o malas condiciones)
  // alimentan "Evita hoy". Sin diversidad de candidatas, "Evita" queda
  // siempre vacío porque las mejores playas NUNCA bajan de 45.
  const candidatas: typeof playas = []
  const porComunidad = new Map<string, typeof playas>()
  for (const p of playas) {
    if (!p.lat || !p.lng) continue
    const list = porComunidad.get(p.comunidad) ?? []
    list.push(p)
    porComunidad.set(p.comunidad, list)
  }

  const COSTERAS = ['Galicia', 'Asturias', 'Cantabria', 'País Vasco',
    'Cataluña', 'Comunitat Valenciana', 'Murcia', 'Andalucía',
    'Islas Baleares', 'Canarias', 'Ceuta', 'Melilla']

  for (const com of COSTERAS) {
    const list = porComunidad.get(com) ?? []
    if (list.length === 0) continue

    // Top 2 por servicios (candidatas a "Top playas hoy")
    const scored = list.map(p => ({
      p,
      pts: (p.bandera ? 3 : 0) + (p.socorrismo ? 2 : 0) + (p.parking ? 1 : 0) + (p.duchas ? 1 : 0),
    })).sort((a, b) => b.pts - a.pts)
    candidatas.push(...scored.slice(0, 2).map(x => x.p))

    // 2 aleatorias (potenciales candidatas a "Evita hoy" si las condiciones son malas)
    // Usamos un hash determinista del slug para que el resultado sea estable por hora
    const hour = new Date().getHours()
    const shuffled = list
      .filter(p => !scored.slice(0, 2).some(s => s.p.slug === p.slug))
      .sort((a, b) => {
        const ha = (a.slug.charCodeAt(0) * 31 + hour) % 997
        const hb = (b.slug.charCodeAt(0) * 31 + hour) % 997
        return ha - hb
      })
    candidatas.push(...shuffled.slice(0, 2))
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <TopCercanas />
        <Buscador />
        <Destacadas playas={candidatas} topCount={8} avoidCount={4} />
        <ParkingHoy playas={playas} />
        <ActividadesHoy playas={playas} />
        <MonetizacionBlock />
        <ClientBlocks />
        <Comunidades comunidades={comunidades} />

        {/* Hub SEO — links a secciones temáticas */}
        <section style={{
          maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 1rem',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.45rem, 3vw, 1.75rem)', fontWeight: 700,
            color: 'var(--ink)', margin: '0 0 1rem', letterSpacing: '-.015em',
            lineHeight: 1.1,
          }}>
            Descubre <em style={{ fontWeight: 500, color: 'var(--accent)' }}>más</em>
          </h2>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '.55rem',
          }}>
            {[
              { href: '/banderas-azules', label: 'Banderas Azules', count: playas.filter(p => p.bandera).length },
              { href: '/playas-perros', label: 'Playas para perros', count: playas.filter(p => p.perros).length },
              { href: '/playas-nudistas', label: 'Playas nudistas', count: playas.filter(p => p.nudista).length },
              { href: '/comunidades', label: 'Todas las comunidades', count: comunidades.length },
              { href: '/mapa', label: 'Mapa interactivo', count: playas.length },
            ].map(item => (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '.85rem 1.1rem',
                background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                borderRadius: 12, textDecoration: 'none',
                transition: 'all .15s',
              }}>
                <span style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{item.label}</span>
                <span style={{
                  fontSize: '.78rem', fontWeight: 700, color: 'var(--accent)',
                  background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))',
                  padding: '.2rem .55rem', borderRadius: 100,
                }}>{item.count}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* EEAT · Por qué confiar en nuestros datos */}
        <section aria-labelledby="eeat-title" style={{
          maxWidth: 1000, margin: '3rem auto 0', padding: '2.5rem 1.5rem 0',
        }}>
          <div style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '.7rem', fontWeight: 500,
            letterSpacing: '.16em', textTransform: 'uppercase',
            color: 'var(--muted)', marginBottom: '.5rem',
          }}>
            Transparencia editorial
          </div>
          <h2 id="eeat-title" style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.5rem, 3.8vw, 2rem)',
            fontWeight: 700, color: 'var(--ink)',
            lineHeight: 1.1, letterSpacing: '-.015em',
            marginBottom: '.5rem',
          }}>
            Datos <em style={{ fontWeight: 500, color: 'var(--accent)' }}>independientes</em> de fuentes oficiales
          </h2>
          <p style={{
            fontSize: '.95rem', color: 'var(--muted)', lineHeight: 1.65,
            maxWidth: 640, marginBottom: '1.5rem',
          }}>
            Cada score 0–100 combina siete factores calculados con APIs oficiales, actualizadas
            cada hora. Ninguna playa, municipio o anunciante puede comprar posición.
          </p>

          {/* Grid de fuentes con URL (señal EEAT explícita) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
            gap: '.5rem',
            marginBottom: '1.25rem',
          }}>
            {[
              { nombre: 'Open-Meteo',        rol: 'Oleaje y viento',       ref: 'open-meteo.com',   href: 'https://open-meteo.com' },
              { nombre: 'MITECO',            rol: 'Inventario oficial',    ref: 'miteco.gob.es',     href: 'https://www.miteco.gob.es' },
              { nombre: 'EEA',               rol: 'Calidad del agua',      ref: 'eea.europa.eu',     href: 'https://www.eea.europa.eu' },
              { nombre: 'ADEAC',             rol: 'Bandera Azul',          ref: 'adeac.es',          href: 'https://www.adeac.es' },
              { nombre: 'IGN · CartoCiudad', rol: 'Cartografía',           ref: 'ign.es',            href: 'https://www.ign.es' },
              { nombre: 'OpenStreetMap',     rol: 'Servicios y POI',       ref: 'openstreetmap.org', href: 'https://www.openstreetmap.org' },
            ].map(f => (
              <a
                key={f.nombre}
                href={f.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', flexDirection: 'column', gap: '.15rem',
                  padding: '.75rem .9rem',
                  background: 'var(--card-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 4,
                  textDecoration: 'none',
                  transition: 'border-color .15s',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-serif)', fontWeight: 700,
                  fontSize: '.88rem', color: 'var(--ink)',
                }}>
                  {f.nombre}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--accent)', fontWeight: 500 }}>
                  {f.rol}
                </div>
                <div style={{
                  fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                  fontSize: '.65rem', color: 'var(--muted)',
                  marginTop: '.15rem', opacity: .85,
                }}>
                  {f.ref} ↗
                </div>
              </a>
            ))}
          </div>

          <div style={{
            display: 'flex', flexWrap: 'wrap', gap: '1rem',
            alignItems: 'center',
            fontSize: '.82rem',
          }}>
            <Link
              href="/metodologia"
              style={{
                color: 'var(--accent)', fontWeight: 500,
                textDecoration: 'none',
                borderBottom: '1px solid var(--accent)',
                paddingBottom: 1,
              }}
            >
              Ver metodología completa →
            </Link>
            <span style={{ color: 'var(--muted)', fontSize: '.78rem' }}>
              Última revisión del método:{' '}
              <span style={{ fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                abril 2026
              </span>
            </span>
          </div>
        </section>
      </main>

      <footer style={{
        borderTop: '1px solid var(--line)',
        background: 'color-mix(in srgb, var(--accent) 3%, var(--bg))',
        marginTop: '3rem',
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: '3.5rem 2rem 2rem',
          color: 'var(--muted)',
        }}>
          {/* Brand + claim editorial */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(260px, 1fr) 3fr',
            gap: '3rem',
            marginBottom: '2.5rem',
            paddingBottom: '2.5rem',
            borderBottom: '1px solid var(--line)',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-serif)', fontStyle: 'italic',
                fontWeight: 700,
                color: 'var(--ink)', fontSize: '1.5rem',
                letterSpacing: '-.01em',
                lineHeight: 1.1,
                marginBottom: '.75rem',
              }}>≈ playas de España</div>
              <p style={{
                fontSize: '.88rem', lineHeight: 1.6,
                color: 'var(--muted)', margin: 0,
              }}>
                Motor de decisión en tiempo real. Puntuamos cada playa de 0 a 100 según
                el estado del mar, el viento, los servicios y el acceso — para que elijas
                la mejor hoy, no la más fotografiada.
              </p>
              <div style={{
                marginTop: '1rem',
                fontFamily: 'var(--font-mono, ui-monospace, monospace)',
                fontSize: '.68rem', letterSpacing: '.08em',
                textTransform: 'uppercase', color: 'var(--muted)',
                opacity: .8,
              }}>
                5.054 playas · datos cada hora
              </div>
            </div>

            {/* Columnas de navegación */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '2rem',
            }}>
              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500, fontSize: '.7rem',
                  textTransform: 'uppercase', letterSpacing: '.14em',
                  marginBottom: '.9rem', color: 'var(--ink)',
                }}>Explorar</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.82rem' }}>
                  <Link href="/comunidades">Comunidades y provincias</Link>
                  <Link href="/banderas-azules">Banderas Azules</Link>
                  <Link href="/top">Top 10 por costa</Link>
                  <Link href="/mapa">Mapa interactivo</Link>
                  <Link href="/playa-del-dia">Playa del día</Link>
                  <Link href="/atardeceres">Atardeceres</Link>
                </nav>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500, fontSize: '.7rem',
                  textTransform: 'uppercase', letterSpacing: '.14em',
                  marginBottom: '.9rem', color: 'var(--ink)',
                }}>Temáticas</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.82rem' }}>
                  <Link href="/playas-perros">Playas para perros</Link>
                  <Link href="/playas-nudistas">Playas nudistas</Link>
                  <Link href="/playas-accesibles">Accesibles PMR</Link>
                  <Link href="/familias">Para familias</Link>
                  <Link href="/playas-aguas-cristalinas">Aguas cristalinas</Link>
                  <Link href="/playas-secretas">Playas secretas</Link>
                  <Link href="/islas">Playas por isla</Link>
                </nav>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500, fontSize: '.7rem',
                  textTransform: 'uppercase', letterSpacing: '.14em',
                  marginBottom: '.9rem', color: 'var(--ink)',
                }}>Deportes y escapadas</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.82rem' }}>
                  <Link href="/surf">Surf</Link>
                  <Link href="/buceo">Buceo</Link>
                  <Link href="/rutas">Rutas por la costa</Link>
                  <Link href="/campings">Campings</Link>
                  <Link href="/playas-autocaravana">Autocaravana</Link>
                  <Link href="/alquiler-barco-playa">Alquiler de barco</Link>
                </nav>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500, fontSize: '.7rem',
                  textTransform: 'uppercase', letterSpacing: '.14em',
                  marginBottom: '.9rem', color: 'var(--ink)',
                }}>Guías prácticas</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.82rem' }}>
                  <Link href="/seguros-viaje">Seguros de viaje</Link>
                  <Link href="/protectores-solares">Protectores solares</Link>
                  <Link href="/calidad-agua">Calidad del agua</Link>
                  <Link href="/medusas">Temporada de medusas</Link>
                </nav>
              </div>

              <div>
                <div style={{
                  fontFamily: 'var(--font-sans)',
                  fontWeight: 500, fontSize: '.7rem',
                  textTransform: 'uppercase', letterSpacing: '.14em',
                  marginBottom: '.9rem', color: 'var(--ink)',
                }}>Herramientas</div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.82rem' }}>
                  <Link href="/buscar">Buscar playas</Link>
                  <Link href="/comparar">Comparador</Link>
                  <Link href="/rutas/configurar">Configurar ruta</Link>
                  <Link href="/metodologia">Metodología y fuentes</Link>
                  <Link href="/en">English version</Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Fuentes de datos */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1.5rem',
            marginBottom: '2rem',
            paddingBottom: '1.75rem',
            borderBottom: '1px solid var(--line)',
          }}>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500, fontSize: '.68rem',
                textTransform: 'uppercase', letterSpacing: '.14em',
                marginBottom: '.5rem', color: 'var(--ink)',
              }}>Fuentes oficiales</div>
              <p style={{ fontSize: '.75rem', lineHeight: 1.55, margin: 0, fontFamily: 'var(--font-mono, ui-monospace, monospace)' }}>
                Open-Meteo · MITECO · IGN · EEA · CartoCiudad · OpenStreetMap · ADEAC
              </p>
              <Link href="/metodologia" style={{
                fontSize: '.72rem', color: 'var(--accent)',
                fontFamily: 'var(--font-sans)', fontWeight: 500,
                display: 'inline-block', marginTop: '.5rem',
                borderBottom: '1px solid var(--accent)', paddingBottom: 1,
                textDecoration: 'none',
              }}>
                Ver todas con URL y frecuencia →
              </Link>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500, fontSize: '.68rem',
                textTransform: 'uppercase', letterSpacing: '.14em',
                marginBottom: '.5rem', color: 'var(--ink)',
              }}>Metodología</div>
              <p style={{ fontSize: '.75rem', lineHeight: 1.55, margin: '0 0 .5rem' }}>
                Puntuación independiente basada en datos públicos.
                Sin pagar por aparecer, sin rankings patrocinados.
              </p>
              <Link href="/metodologia" style={{
                fontSize: '.72rem', color: 'var(--accent)',
                fontFamily: 'var(--font-sans)', fontWeight: 500,
                borderBottom: '1px solid var(--accent)', paddingBottom: 1,
                textDecoration: 'none',
              }}>
                Cómo calculamos el score →
              </Link>
            </div>
            <div>
              <div style={{
                fontFamily: 'var(--font-sans)',
                fontWeight: 500, fontSize: '.68rem',
                textTransform: 'uppercase', letterSpacing: '.14em',
                marginBottom: '.5rem', color: 'var(--ink)',
              }}>Contribuye</div>
              <p style={{ fontSize: '.75rem', lineHeight: 1.55, margin: 0 }}>
                Reporta medusas, banderas o estado real desde cada ficha.
                Los datos de usuarios son anónimos y caducan a las 24 h.
              </p>
            </div>
          </div>

          {/* Disclosure de afiliación */}
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '1rem 1.15rem',
            marginBottom: '1.5rem',
            fontSize: '.75rem', lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--ink)' }}>Transparencia de afiliación.</strong>{' '}
            Algunas páginas contienen enlaces patrocinados a Booking, Amazon, Civitatis,
            Click&Boat, Rentalcars, TheFork, Parclick, Pitchup, Heymondo, IATI, Chapka y
            Direct Ferries. Si reservas o compras a través de ellos, podemos recibir una
            comisión sin coste adicional para ti. <strong>Los datos, rankings y puntuaciones
            no están influenciados por estas colaboraciones.</strong>{' '}
            <Link href="/cookies" style={{ textDecoration: 'underline' }}>Más información</Link>.
          </div>

          {/* Bottom bar */}
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: '1rem',
            paddingTop: '1rem',
            fontSize: '.75rem',
          }}>
            <div style={{
              fontFamily: 'var(--font-mono, ui-monospace, monospace)',
              fontSize: '.7rem', color: 'var(--muted)',
              letterSpacing: '.04em',
            }}>
              © {new Date().getFullYear()} playas-espana.com · Hecho con mimo para el Mediterráneo y el Atlántico
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap' }}>
              <Link href="/aviso-legal">Aviso legal</Link>
              <Link href="/privacidad">Privacidad</Link>
              <Link href="/cookies">Cookies</Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
