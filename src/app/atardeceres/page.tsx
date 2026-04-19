// src/app/atardeceres/page.tsx — Mejores playas para ver el atardecer
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'

export const revalidate = 86400

export const metadata: Metadata = {
  title: 'Mejores playas para ver el atardecer en España — Puestas de sol',
  description: 'Playas españolas con las mejores puestas de sol: orientadas al oeste y suroeste. Costa de la Luz, Rías Baixas, Costa da Morte, Baleares y Canarias.',
  alternates: { canonical: '/atardeceres' },
}

// Playas que miran al oeste/suroeste son las mejores para atardeceres.
// Heurística: en la costa atlántica (lng < -2) casi todas miran al oeste.
// En la mediterránea solo las que están en cabos/puntas con orientación W.
// En las islas depende de la posición en la isla.
// Simplificación pragmática: seleccionamos por zona geográfica.
function esPlayaAtardecer(p: { lat: number; lng: number; provincia: string; comunidad: string }): boolean {
  // Costa atlántica (Galicia, Huelva, Cádiz atlántico) — casi todas miran al oeste
  if (p.comunidad === 'Galicia') return true
  if (p.provincia === 'Huelva') return true
  if (p.provincia === 'Cádiz' && p.lng < -5.5) return true // Cádiz atlántico

  // Asturias y Cantabria — miran al norte, pero con puestas de sol laterales espectaculares en verano
  if (p.comunidad === 'Asturias' || p.comunidad === 'Cantabria') return true

  // Baleares — costa oeste de cada isla
  if (p.comunidad === 'Islas Baleares' && p.lng < 2.8) return true // Mallorca/Ibiza west coast

  // Canarias — costa oeste
  if (p.comunidad === 'Canarias' && p.lng < -15.5) return true

  // Costa mediterránea — solo calas puntuales que miran al SW (raras)
  // Incluimos las del Delta del Ebro y costa sur de Tarragona
  if (p.provincia === 'Tarragona' && p.lat < 41) return true

  return false
}

export default async function AtardeceresPage() {
  const playas = await getPlayas()
  const atardeceres = playas
    .filter(p => typeof p.lat === 'number' && typeof p.lng === 'number' && esPlayaAtardecer(p))
    .sort((a, b) => {
      // Sort by "westness" — more negative lng = faces more into the sunset
      return a.lng - b.lng
    })

  // Agrupar por comunidad
  const porCom = new Map<string, typeof atardeceres>()
  for (const p of atardeceres) {
    const list = porCom.get(p.comunidad) ?? []
    list.push(p)
    porCom.set(p.comunidad, list)
  }

  // Sunset time estimate (based on month — rough but atmospheric)
  const month = new Date().getMonth() // 0-11
  const sunsetHours = [18, 18.5, 19, 20, 21, 21.5, 21.5, 21, 20, 19, 18.5, 18]
  const h = Math.floor(sunsetHours[month])
  const m = Math.round((sunsetHours[month] - h) * 60)
  const sunsetStr = `${h}:${m.toString().padStart(2, '0')}`

  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{
          display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem',
        }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link>
          <span aria-hidden="true">›</span>
          <span aria-current="page">Atardeceres</span>
        </nav>

        <h1 style={{
          fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.9rem, 5.4vw, 3rem)',
          fontWeight: 700, letterSpacing: '-.02em', color: 'var(--ink)',
          lineHeight: 1.02, marginBottom: '.5rem',
        }}>
          Playas <em style={{ fontWeight: 500, color: 'var(--accent)' }}>para ver el atardecer</em>
        </h1>
        <p style={{ fontSize: '.92rem', color: 'var(--muted)', maxWidth: 560, lineHeight: 1.6, marginBottom: '.5rem' }}>
          {atardeceres.length} playas orientadas al oeste y suroeste, donde el sol se pone sobre el mar.
          Costa de la Luz, Rías Baixas, Costa da Morte, Baleares y Canarias.
        </p>
        <p style={{
          fontSize: '1.15rem', fontFamily: 'var(--font-serif)', fontWeight: 800,
          color: 'var(--accent)', marginBottom: '2rem',
        }}>
          🌅 Atardecer hoy aprox. {sunsetStr}h
        </p>

        {/* Mapa */}
        <div style={{
          background: 'var(--card-bg)', border: '1.5px solid var(--line)',
          borderRadius: 20, overflow: 'hidden', marginBottom: '2.5rem',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '.85rem 1.25rem .75rem',
          }}>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '.95rem', fontWeight: 700, color: 'var(--ink)' }}>
              Mapa de playas con puesta de sol
            </span>
            <span style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{atardeceres.length} playas</span>
          </div>
          <MapaPlayas playas={atardeceres} height="440px" />
        </div>

        {/* Grouped by comunidad */}
        {Array.from(porCom.entries()).map(([com, list]) => (
          <section key={com} style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 800,
              color: 'var(--ink)', margin: '0 0 .75rem',
            }}>
              {com} <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--muted)' }}>({list.length} playas)</span>
            </h2>
            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '.55rem',
            }}>
              {list.slice(0, 12).map(p => (
                <Link key={p.slug} href={`/playas/${p.slug}`} style={{
                  display: 'flex', alignItems: 'center', gap: '.75rem',
                  padding: '.75rem 1rem',
                  background: 'var(--card-bg)', border: '1.5px solid var(--line)',
                  borderRadius: 12, textDecoration: 'none', transition: 'all .15s',
                }}>
                  <span style={{ fontSize: '1.2rem' }} aria-hidden="true">🌅</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>{p.nombre}</div>
                    <div style={{ fontSize: '.72rem', color: 'var(--muted)' }}>{p.municipio} · {p.provincia}</div>
                  </div>
                  {p.bandera && <span style={{ fontSize: '.65rem', fontWeight: 700, color: 'var(--accent)', background: 'color-mix(in srgb, var(--accent) 10%, var(--card-bg))', padding: '.1rem .3rem', borderRadius: 4 }}>B. Azul</span>}
                </Link>
              ))}
              {list.length > 12 && (
                <div style={{ padding: '.75rem', fontSize: '.82rem', color: 'var(--muted)', textAlign: 'center' }}>
                  +{list.length - 12} playas más en {com}
                </div>
              )}
            </div>
          </section>
        ))}
      </main>
    </>
  )
}
