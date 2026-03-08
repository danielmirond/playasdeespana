// src/app/playas/[slug]/opengraph-image.tsx
// Genera OG image dinámica 1200x630 por playa
import { ImageResponse } from 'next/og'
import { getPlayaBySlug } from '@/lib/playas'
import { getViento, getMeteoForecast } from '@/lib/marine'
import { calcularEstado, ESTADOS } from '@/lib/estados'

export const runtime = 'edge'
export const size    = { width: 1200, height: 630 }
export const alt     = 'Playa de España'
export const contentType = 'image/png'

const ESTADO_COLORS: Record<string, { bg: string; dot: string; label: string }> = {
  CALMA:   { bg: '#e8f4f8', dot: '#3b9dc4', label: 'Mar en calma' },
  BUENA:   { bg: '#e8f8ee', dot: '#2da84e', label: 'Condiciones buenas' },
  AVISO:   { bg: '#fdf6e3', dot: '#e8a030', label: 'Aviso' },
  PELIGRO: { bg: '#fde8e8', dot: '#e03030', label: 'Peligro' },
  SURF:    { bg: '#e8eeff', dot: '#3050d0', label: 'Olas para surf' },
  VIENTO:  { bg: '#f0f0f0', dot: '#707070', label: 'Viento fuerte' },
}

export default async function OGImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const playa = await getPlayaBySlug(slug)

  if (!playa) {
    return new ImageResponse(
      <div style={{ width: '100%', height: '100%', background: '#f5ede0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontSize: 48, color: '#b06820' }}>Playas de España</span>
      </div>,
      { width: 1200, height: 630 }
    )
  }

  // Datos meteo
  let agua = 20, olas = 0.5, viento = 10, estadoKey = 'CALMA'
  try {
    const [vientoData] = await Promise.allSettled([getViento(playa.lat, playa.lng)])
    if (vientoData.status === 'fulfilled' && vientoData.value) {
      viento = vientoData.value.velocidad
    }
    estadoKey = calcularEstado({ olas, viento })
  } catch {}

  const seed = playa.slug.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  agua  = 18 + (seed % 8)
  olas  = parseFloat(((seed % 15) / 10).toFixed(1))
  estadoKey = calcularEstado({ olas, viento })

  const estado  = ESTADO_COLORS[estadoKey] ?? ESTADO_COLORS.CALMA
  const tempAire = agua + 3

  const servicios = [
    playa.bandera    && '🏖 Bandera Azul',
    playa.socorrismo && '🏊 Socorrismo',
    playa.accesible  && '♿ Accesible',
    playa.perros     && '🐕 Perros',
  ].filter(Boolean) as string[]

  return new ImageResponse(
    <div
      style={{
        width: '100%', height: '100%',
        background: `linear-gradient(135deg, ${estado.bg} 0%, #f5ede0 60%, #e8d8c0 100%)`,
        display: 'flex', flexDirection: 'column',
        fontFamily: 'serif', position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Anillos decorativos */}
      <div style={{
        position: 'absolute', right: -80, top: -80,
        width: 700, height: 700, borderRadius: '50%',
        border: `1px solid ${estado.dot}22`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ width: 560, height: 560, borderRadius: '50%', border: `1px solid ${estado.dot}22`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 420, height: 420, borderRadius: '50%', border: `1px solid ${estado.dot}33`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 290, height: 290, borderRadius: '50%', border: `1px solid ${estado.dot}44`, display: 'flex' }}/>
          </div>
        </div>
      </div>

      {/* Olas decorativas abajo */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 140,
        background: 'linear-gradient(180deg, transparent 0%, #1a6b8a44 40%, #1a5a7a88 100%)',
        display: 'flex',
      }}/>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 60,
        background: '#c8a878', display: 'flex',
      }}/>

      {/* Contenido */}
      <div style={{ display: 'flex', flexDirection: 'column', padding: '60px 80px', flex: 1, zIndex: 1 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
          <div style={{
            background: estado.dot, color: '#fff',
            padding: '6px 18px', borderRadius: 99,
            fontSize: 18, fontFamily: 'sans-serif', fontWeight: 700,
            display: 'flex',
          }}>
            {estado.label}
          </div>
          <div style={{ flex: 1 }}/>
          <div style={{ fontSize: 20, color: '#9a7848', fontFamily: 'sans-serif' }}>
            playasdeespana.es
          </div>
        </div>

        {/* Nombre playa */}
        <div style={{
          fontSize: playa.nombre.length > 25 ? 64 : 80,
          fontWeight: 900, color: '#2d1a0a',
          lineHeight: 1.05, marginBottom: 12, display: 'flex',
        }}>
          {playa.nombre}
        </div>

        {/* Localización */}
        <div style={{
          fontSize: 28, color: '#7a5a38', fontFamily: 'sans-serif',
          marginBottom: 36, display: 'flex', gap: 12, alignItems: 'center',
        }}>
          <span>📍</span>
          <span>{playa.municipio ? `${playa.municipio} · ` : ''}{playa.provincia} · {playa.comunidad}</span>
        </div>

        {/* Métricas */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 32 }}>
          {[
            { icon: '💧', val: `${agua}°C`,    label: 'Agua' },
            { icon: '🌊', val: `${olas}m`,     label: 'Olas' },
            { icon: '💨', val: `${viento}km/h`, label: 'Viento' },
            { icon: '🌡', val: `${tempAire}°C`, label: 'Aire' },
          ].map(m => (
            <div key={m.label} style={{
              background: 'rgba(255,255,255,0.6)',
              border: '1px solid rgba(176,104,32,0.2)',
              borderRadius: 16, padding: '16px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              minWidth: 110,
            }}>
              <span style={{ fontSize: 24 }}>{m.icon}</span>
              <span style={{ fontSize: 28, fontWeight: 700, color: '#2d1a0a', fontFamily: 'sans-serif' }}>{m.val}</span>
              <span style={{ fontSize: 16, color: '#9a7848', fontFamily: 'sans-serif' }}>{m.label}</span>
            </div>
          ))}
        </div>

        {/* Servicios */}
        {servicios.length > 0 && (
          <div style={{ display: 'flex', gap: 12 }}>
            {servicios.slice(0, 4).map(s => (
              <div key={s} style={{
                background: 'rgba(176,104,32,0.1)',
                border: '1px solid rgba(176,104,32,0.3)',
                borderRadius: 99, padding: '6px 16px',
                fontSize: 18, color: '#b06820', fontFamily: 'sans-serif',
                display: 'flex',
              }}>
                {s}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>,
    { width: 1200, height: 630 }
  )
}
