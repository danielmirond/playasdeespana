// src/app/playas/[slug]/opengraph-image.tsx
// OG image estática — sin API calls, genera en <50ms
import { ImageResponse } from 'next/og'
import { getPlayaBySlug } from '@/lib/playas'
import { nombreConPlaya } from '@/lib/geo'

export const runtime = 'nodejs'
export const size    = { width: 1200, height: 630 }
export const alt     = 'Estado del mar en tiempo real'
export const contentType = 'image/png'

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)

  if (!playa) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, color: '#b06820', fontFamily: 'serif' }}>Playas de España</span>
      </div>,
      size
    )
  }

  const nombre = nombreConPlaya(playa.nombre)
  const badges = [
    playa.bandera    && 'Bandera Azul',
    playa.socorrismo && 'Socorrismo',
    playa.accesible  && 'Accesible',
    playa.perros     && 'Perros',
    playa.nudista    && 'Nudista',
  ].filter(Boolean) as string[]

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: 'linear-gradient(160deg, #0a2a3a 0%, #0a1a2a 100%)',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative', overflow: 'hidden', color: 'white',
    }}>
      {/* Accent line */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: '#b06820', display: 'flex' }}/>

      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -100, top: -100, width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(176,104,32,0.1)', display: 'flex' }}/>
      <div style={{ position: 'absolute', right: -40, top: -40, width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(176,104,32,0.08)', display: 'flex' }}/>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px 56px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#b06820', display: 'flex' }}/>
          <span style={{ fontSize: 15, fontWeight: 600, color: '#b06820', letterSpacing: '0.08em' }}>ESTADO DEL MAR HOY</span>
        </div>
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.35)', letterSpacing: '0.1em' }}>playas-espana.com</span>
      </div>

      {/* Beach name */}
      <div style={{ padding: '40px 56px 0', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ fontSize: nombre.length > 32 ? 54 : 68, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          {nombre}
        </div>
        <div style={{ fontSize: 24, color: 'rgba(255,255,255,0.45)', marginTop: 12, letterSpacing: '0.1em', textTransform: 'uppercase' as const, fontWeight: 300 }}>
          {playa.municipio} · {playa.provincia} · {playa.comunidad}
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '24px 56px',
        background: 'rgba(0,0,0,0.3)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {badges.slice(0, 4).map(b => (
            <div key={b} style={{
              background: 'rgba(176,104,32,0.15)', border: '1px solid rgba(176,104,32,0.3)',
              borderRadius: 99, padding: '6px 16px', fontSize: 15, fontWeight: 600, display: 'flex',
            }}>
              {b}
            </div>
          ))}
          {badges.length === 0 && (
            <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.3)' }}>
              Oleaje · Viento · Temperatura · Mareas · Medusas
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4ade80', display: 'flex' }}/>
          <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Datos en tiempo real</span>
        </div>
      </div>
    </div>,
    size
  )
}
