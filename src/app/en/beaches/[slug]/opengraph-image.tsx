// src/app/playas/[slug]/opengraph-image.tsx
// OG image dinámica 1200x630 con datos en tiempo real
import { ImageResponse } from 'next/og'
import { getPlayaBySlug } from '@/lib/playas'
import { getMareas } from '@/lib/marine'
import { getMeteoPlaya } from '@/lib/meteo'
import { calcularEstado } from '@/lib/estados'
import { calcularBandera, estimarMedusas } from '@/lib/seguridad'
import { nombreConPlaya } from '@/lib/geo'

export const runtime = 'edge'
export const size    = { width: 1200, height: 630 }
export const alt     = 'Estado del mar en tiempo real'
export const contentType = 'image/png'

const COLORES: Record<string, { bg: string; accent: string; label: string }> = {
  CALMA:   { bg: '#0a4a3a', accent: '#4ade80', label: 'Mar en calma' },
  BUENA:   { bg: '#0a3a5a', accent: '#60a5fa', label: 'Buenas condiciones' },
  AVISO:   { bg: '#4a3a0a', accent: '#fbbf24', label: 'Precaución' },
  PELIGRO: { bg: '#4a0a0a', accent: '#f87171', label: 'Peligro' },
  SURF:    { bg: '#1a2a5a', accent: '#818cf8', label: 'Olas para surf' },
  VIENTO:  { bg: '#2a2a2a', accent: '#a1a1aa', label: 'Viento fuerte' },
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)

  if (!playa) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#1a1a1a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, color: '#b06820' }}>Playas de España</span>
      </div>,
      size
    )
  }

  let agua = 20, olas = 0.5, viento = 10, vientoRacha = 15, tempAire = 23, uvMax = 5, vientoDir = 'N'
  try {
    const [mareasR, meteoR] = await Promise.allSettled([
      getMareas(playa.lat, playa.lng),
      getMeteoPlaya(playa.lat, playa.lng),
    ])
    const m = mareasR.status === 'fulfilled' ? mareasR.value : null
    const w = meteoR.status === 'fulfilled' ? meteoR.value : null
    agua = m?.temp_agua?.[0] ?? 20
    olas = m?.oleaje_m?.[0] ?? 0.5
    viento = w?.viento_kmh ?? 10
    vientoRacha = w?.viento_racha ?? 15
    tempAire = w?.temp_aire ?? 23
    uvMax = w?.uv_max ?? 5
    vientoDir = w?.viento_dir ?? 'N'
  } catch {}

  const estadoKey = calcularEstado({ olas, viento })
  const estado = COLORES[estadoKey] ?? COLORES.CALMA
  const bandera = calcularBandera(olas, viento, vientoRacha)
  const medusas = estimarMedusas(playa.lat, playa.lng, agua, viento, vientoDir)
  const nombre = nombreConPlaya(playa.nombre)

  const BANDERA_EMOJI: Record<string, string> = { verde: '🟢', amarilla: '🟡', roja: '🔴' }
  const MEDUSAS_EMOJI: Record<string, string> = { bajo: '🟢', medio: '🟡', alto: '🔴' }

  return new ImageResponse(
    <div style={{
      width: '100%', height: '100%',
      background: `linear-gradient(160deg, ${estado.bg} 0%, #0a0a0a 100%)`,
      display: 'flex', flexDirection: 'column',
      fontFamily: 'system-ui, sans-serif',
      position: 'relative', overflow: 'hidden', color: 'white',
    }}>
      {/* Accent line top */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: estado.accent, display: 'flex' }}/>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '36px 56px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: estado.accent, display: 'flex' }}/>
          <span style={{ fontSize: 16, fontWeight: 700, color: estado.accent, letterSpacing: '0.08em', textTransform: 'uppercase' as const }}>{estado.label}</span>
        </div>
        <span style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>playas-espana.com</span>
      </div>

      {/* Nombre */}
      <div style={{ padding: '28px 56px 0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontSize: nombre.length > 30 ? 52 : 64, fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em' }}>
          {nombre}
        </div>
        <div style={{ fontSize: 22, color: 'rgba(255,255,255,0.5)', marginTop: 8, letterSpacing: '0.12em', textTransform: 'uppercase' as const, fontWeight: 300 }}>
          {playa.municipio} · {playa.provincia}
        </div>
      </div>

      {/* Badges */}
      <div style={{ display: 'flex', gap: 10, padding: '20px 56px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 99, fontSize: 14, fontWeight: 600 }}>
          {BANDERA_EMOJI[bandera.color]} {bandera.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 99, fontSize: 14, fontWeight: 600 }}>
          {MEDUSAS_EMOJI[medusas.nivel]} {medusas.label}
        </div>
        {playa.bandera && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.08)', padding: '6px 14px', borderRadius: 99, fontSize: 14, fontWeight: 600 }}>
            🏖 Bandera Azul
          </div>
        )}
      </div>

      {/* Métricas — barra inferior */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        display: 'flex',
        background: 'rgba(0,0,0,0.4)',
        borderTop: `1px solid rgba(255,255,255,0.08)`,
      }}>
        {[
          { icon: '💧', val: `${agua}°C`, label: 'Agua' },
          { icon: '🌊', val: `${olas}m`, label: 'Olas' },
          { icon: '💨', val: `${viento}km/h`, label: 'Viento' },
          { icon: '🌡', val: `${tempAire}°C`, label: 'Aire' },
          { icon: '☀️', val: `UV ${uvMax}`, label: 'Índice UV' },
        ].map((m, i) => (
          <div key={m.label} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
            padding: '24px 0',
            borderRight: i < 4 ? '1px solid rgba(255,255,255,0.06)' : 'none',
          }}>
            <span style={{ fontSize: 14, marginBottom: 4 }}>{m.icon}</span>
            <span style={{ fontSize: 30, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em' }}>{m.val}</span>
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4, letterSpacing: '0.12em', textTransform: 'uppercase' as const }}>{m.label}</span>
          </div>
        ))}
      </div>
    </div>,
    size
  )
}
