// src/app/api/og/route.tsx
// OG Image dinámica 1200×630 por playa
// Edge runtime — genera en <50ms
// npm install @vercel/og (ya incluido en Next.js 14)
//
// Parámetros:
//   playa       nombre de la playa
//   municipio   municipio + provincia
//   temp_agua   temperatura del agua (°C)
//   temp_aire   temperatura del aire (°C)
//   oleaje      altura de olas (m)
//   viento      velocidad viento (km/h)
//   calidad     Excelente | Buena | Suficiente | Deficiente
//   azul        true | false
//   comunidad   para el color de fondo

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Paleta por comunidad / zona geográfica
const PALETAS: Record<string, { from: string; to: string; via: string }> = {
  'Cataluña':             { from: '#1a4a7a', via: '#2e7bb4', to: '#1a6b5a' },
  'Andalucía':            { from: '#b94a1a', via: '#d4722a', to: '#1a5a7a' },
  'Canarias':             { from: '#c4922a', via: '#d4a840', to: '#1a7ab4' },
  'Islas Baleares':       { from: '#1a6b5a', via: '#2a9d6a', to: '#1a5a9a' },
  'Galicia':              { from: '#2a3a5a', via: '#3a5a8a', to: '#2a4a6a' },
  'Comunitat Valenciana': { from: '#c46a1a', via: '#2e7bb4', to: '#1a5a7a' },
  'Asturias':             { from: '#2a3a4a', via: '#3a6a7a', to: '#2a5a3a' },
  'Cantabria':            { from: '#3a4a5a', via: '#4a7a8a', to: '#2a5a4a' },
  'País Vasco':           { from: '#1a3a2a', via: '#2a6a4a', to: '#1a4a6a' },
  'Murcia':               { from: '#8a3a1a', via: '#2e7bb4', to: '#1a5a4a' },
  default:                { from: '#1a4a6a', via: '#2e7bb4', to: '#1a6a5a' },
}

// Icono de calidad del agua
function iconCalidad(calidad: string | null) {
  if (!calidad) return null
  const map: Record<string, { icon: string; color: string }> = {
    'Excelente':  { icon: '●', color: '#4ade80' },
    'Buena':      { icon: '●', color: '#60a5fa' },
    'Suficiente': { icon: '●', color: '#fbbf24' },
    'Deficiente': { icon: '●', color: '#f87171' },
  }
  return map[calidad] ?? null
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams

  const playa     = sp.get('playa')     ?? 'Playa'
  const municipio = sp.get('municipio') ?? ''
  const tempAgua  = sp.get('temp_agua') ?? null
  const tempAire  = sp.get('temp_aire') ?? null
  const oleaje    = sp.get('oleaje')    ?? null
  const viento    = sp.get('viento')    ?? null
  const calidad   = sp.get('calidad')   ?? null
  const azul      = sp.get('azul') === 'true'
  const comunidad = sp.get('comunidad') ?? 'default'

  const pal = PALETAS[comunidad] ?? PALETAS.default
  const cal = iconCalidad(calidad)

  // Stats que se muestran si existen
  const stats = [
    tempAgua ? { label: 'Agua',   value: `${tempAgua}°C` } : null,
    tempAire ? { label: 'Aire',   value: `${tempAire}°C` } : null,
    oleaje   ? { label: 'Oleaje', value: `${oleaje} m`   } : null,
    viento   ? { label: 'Viento', value: `${viento} km/h`} : null,
  ].filter(Boolean) as { label: string; value: string }[]

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          fontFamily: 'Georgia, "Times New Roman", serif',
          background: `linear-gradient(145deg, ${pal.from} 0%, ${pal.via} 50%, ${pal.to} 100%)`,
          overflow: 'hidden',
        }}
      >
        {/* Círculos decorativos de fondo */}
        <div style={{
          position: 'absolute', right: '-80px', top: '-80px',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', right: '60px', bottom: '-120px',
          width: '320px', height: '320px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.04)', display: 'flex',
        }} />
        <div style={{
          position: 'absolute', left: '-60px', bottom: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.03)', display: 'flex',
        }} />

        {/* Línea superior — dominio */}
        <div style={{
          position: 'absolute', top: '44px', left: '60px',
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.5)', display: 'flex',
          }} />
          <div style={{
            fontSize: '15px', color: 'rgba(255,255,255,0.5)',
            fontFamily: 'system-ui, sans-serif',
            letterSpacing: '0.1em', fontWeight: '300',
          }}>
            playasdeespana.es
          </div>
        </div>

        {/* Badges — Bandera Azul + Calidad */}
        <div style={{
          position: 'absolute', top: '44px', right: '60px',
          display: 'flex', gap: '10px',
        }}>
          {azul && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.15)',
              padding: '7px 18px', borderRadius: '100px',
              fontSize: '14px', color: 'white',
              fontFamily: 'system-ui, sans-serif',
              fontWeight: '500', letterSpacing: '0.08em',
            }}>
              Bandera Azul
            </div>
          )}
          {cal && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '7px',
              background: 'rgba(255,255,255,0.12)',
              padding: '7px 18px', borderRadius: '100px',
              fontSize: '14px', color: 'white',
              fontFamily: 'system-ui, sans-serif',
              letterSpacing: '0.08em',
            }}>
              <div style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: cal.color, display: 'flex',
              }} />
              {calidad}
            </div>
          )}
        </div>

        {/* Nombre de la playa — protagonista */}
        <div style={{
          position: 'absolute',
          bottom: stats.length > 0 ? '180px' : '120px',
          left: '60px', right: '60px',
          display: 'flex', flexDirection: 'column', gap: '14px',
        }}>
          <div style={{
            fontSize: stats.length > 0
              ? (playa.length > 24 ? '68px' : '82px')
              : (playa.length > 24 ? '72px' : '96px'),
            fontWeight: '400',
            color: 'white',
            lineHeight: '1',
            letterSpacing: '-0.02em',
            textShadow: '0 4px 24px rgba(0,0,0,0.25)',
          }}>
            {playa}
          </div>
          <div style={{
            fontSize: '22px',
            color: 'rgba(255,255,255,0.68)',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: '300',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
          }}>
            {municipio}
          </div>
        </div>

        {/* Stats row — abajo */}
        {stats.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '0', left: '0', right: '0',
            display: 'flex',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            background: 'rgba(0,0,0,0.18)',
          }}>
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '22px 0',
                  borderRight: i < stats.length - 1
                    ? '1px solid rgba(255,255,255,0.1)'
                    : 'none',
                }}
              >
                <div style={{
                  fontSize: '34px',
                  fontWeight: '400',
                  color: 'white',
                  lineHeight: '1',
                  marginBottom: '6px',
                  letterSpacing: '-0.02em',
                }}>
                  {s!.value}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.5)',
                  fontFamily: 'system-ui, sans-serif',
                  letterSpacing: '0.14em',
                  textTransform: 'uppercase',
                  fontWeight: '400',
                }}>
                  {s!.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
