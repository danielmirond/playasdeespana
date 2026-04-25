// src/app/api/og/route.tsx. Brand book v1 · plantilla social
// OG image 1200×630 conforme al brand book:
// - Fondo arena
// - Logo "≈ playas de España" arriba-izquierda
// - Eyebrow municipio · provincia
// - Título en Playfair h1 display (nombre o tema)
// - Score huge + verdict italic
// - Data row: agua, oleaje, viento
// - Miniatura mapa derecha con pin
// - Borde inferior terracota

import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

// Colores semánticos por score (brand book semantic palette)
function verdictFor(score: number | null): { label: string; color: string } {
  if (score === null) return { label: '',            color: '#7a6858' }
  if (score >= 85)    return { label: 'excelente',   color: '#3d6b1f' }
  if (score >= 70)    return { label: 'muy bueno',   color: '#7a8a30' }
  if (score >= 50)    return { label: 'aceptable',   color: '#c48a1e' }
  if (score >= 30)    return { label: 'limitado',    color: '#a04818' }
  return                     { label: 'no apto',     color: '#7a2818' }
}

// Si el caller pasa "calidad" string la convertimos a verdict
function verdictFromCalidad(calidad: string | null): { label: string; color: string } {
  if (!calidad) return { label: '', color: '#7a6858' }
  const map: Record<string, { label: string; color: string }> = {
    'Excelente':  { label: 'excelente',   color: '#3d6b1f' },
    'Buena':      { label: 'muy bueno',   color: '#7a8a30' },
    'Suficiente': { label: 'aceptable',   color: '#c48a1e' },
    'Deficiente': { label: 'no apto',     color: '#7a2818' },
  }
  return map[calidad] ?? { label: '', color: '#7a6858' }
}

export async function GET(req: NextRequest) {
  const sp = new URL(req.url).searchParams

  const playa     = sp.get('playa')     ?? 'Playa'
  const municipio = sp.get('municipio') ?? ''
  const tempAgua  = sp.get('temp_agua')
  const oleaje    = sp.get('oleaje')
  const viento    = sp.get('viento')
  const calidad   = sp.get('calidad')
  const scoreStr  = sp.get('score')
  const azul      = sp.get('azul') === 'true'

  const score = scoreStr ? parseInt(scoreStr, 10) : null
  const verdict = score != null ? verdictFor(score) : verdictFromCalidad(calidad)

  // Si no hay score numérico, mostramos verdict centrado sin número
  const showScore = score != null

  // Data row (solo valores presentes)
  const dataRow: string[] = []
  if (tempAgua) dataRow.push(`agua ${tempAgua}°`)
  if (oleaje)   dataRow.push(`oleaje ${oleaje} m`)
  if (viento)   dataRow.push(`viento ${viento} km/h`)

  // Tamaño título según longitud
  const titleSize =
    playa.length > 32 ? 68 :
    playa.length > 22 ? 82 :
    playa.length > 14 ? 98 :
                        110

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: '#f5ecd5',          // arena-100
          fontFamily: 'Georgia, serif',
          overflow: 'hidden',
        }}
      >
        {/* Decoración: playa ilustrada abstracta a la derecha */}
        <div style={{
          position: 'absolute',
          right: 0, top: 0,
          width: 540, height: 360,
          display: 'flex',
        }}>
          {/* Cielo/mar gradiente */}
          <div style={{
            position: 'absolute', left: 60, top: 40,
            width: 480, height: 200,
            background: 'linear-gradient(180deg, #a8b8c4 0%, #c8c090 60%, #b8a06a 100%)',
            borderRadius: '2px',
            display: 'flex',
          }}/>
          {/* Onda del horizonte */}
          <svg viewBox="0 0 480 60" width="480" height="60"
               style={{ position: 'absolute', left: 60, top: 200, display: 'block' }}>
            <path d="M0,20 Q120,5 240,20 T480,20"
                  fill="none" stroke="#2a1a08" strokeWidth="1.5"/>
            {/* Pin decorativo */}
            <circle cx="240" cy="18" r="6" fill="#f5ecd5" stroke="#2a1a08" strokeWidth="1.5"/>
            <circle cx="240" cy="18" r="2" fill="#6b400a"/>
          </svg>
        </div>

        {/* Logo arriba-izquierda */}
        <div style={{
          position: 'absolute', top: 52, left: 56,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* Ondita ≈ */}
          <svg viewBox="0 0 40 20" width="36" height="18" style={{ display: 'block' }}>
            <path d="M2 8 Q8 4 14 8 T26 8 T38 8" fill="none" stroke="#6b400a" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M2 14 Q8 10 14 14 T26 14 T38 14" fill="none" stroke="#6b400a" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 30,
            fontWeight: 700,
            color: '#2a1a08',
            display: 'flex',
          }}>playas de España</span>
        </div>

        {/* Badge Bandera Azul (si aplica) */}
        {azul && (
          <div style={{
            position: 'absolute', top: 52, right: 56,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '7px 16px', borderRadius: 100,
            background: '#1e3a8a',
            fontSize: 15, fontWeight: 600, color: '#fff',
            fontFamily: 'system-ui, sans-serif',
          }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff', display: 'flex' }}/>
            Bandera Azul
          </div>
        )}

        {/* Eyebrow: municipio · provincia */}
        {municipio && (
          <div style={{
            position: 'absolute',
            left: 56, top: 190,
            display: 'flex',
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: '#7a6858',
          }}>
            {municipio}
          </div>
        )}

        {/* Título. nombre playa en Playfair-style */}
        <div style={{
          position: 'absolute',
          left: 56, top: 224,
          maxWidth: 720,
          fontFamily: 'Georgia, serif',
          fontSize: titleSize,
          fontWeight: 700,
          color: '#2a1a08',
          lineHeight: 1.02,
          letterSpacing: '-0.02em',
          display: 'flex',
        }}>
          {playa}
        </div>

        {/* Eyebrow ESTADO DEL MAR · HOY */}
        <div style={{
          position: 'absolute',
          left: 56, top: showScore ? 380 : 370,
          display: 'flex',
          fontFamily: 'system-ui, sans-serif',
          fontSize: 15,
          fontWeight: 500,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#7a6858',
        }}>
          Estado del mar · Hoy
        </div>

        {/* Score + verdict */}
        <div style={{
          position: 'absolute',
          left: 56, top: 410,
          display: 'flex',
          alignItems: 'baseline',
          gap: 20,
        }}>
          {showScore && (
            <>
              <span style={{
                fontFamily: 'Georgia, serif',
                fontSize: 140,
                fontWeight: 700,
                color: '#2a1a08',
                lineHeight: 1,
                letterSpacing: '-0.02em',
                display: 'flex',
              }}>{score}</span>
              <span style={{
                fontFamily: 'system-ui, sans-serif',
                fontSize: 26,
                fontWeight: 500,
                color: '#7a6858',
                display: 'flex',
              }}>/100</span>
            </>
          )}
          <span style={{
            fontFamily: 'Georgia, serif',
            fontStyle: 'italic',
            fontSize: 46,
            fontWeight: 400,
            color: verdict.color,
            display: 'flex',
            marginLeft: showScore ? 12 : 0,
          }}>{verdict.label}</span>
        </div>

        {/* Data row (agua · oleaje · viento) */}
        {dataRow.length > 0 && (
          <div style={{
            position: 'absolute',
            left: 56, bottom: 68,
            display: 'flex',
            gap: 36,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,
            fontWeight: 400,
            color: '#524030',
          }}>
            {dataRow.map((s, i) => (
              <span key={i} style={{ display: 'flex' }}>{s}</span>
            ))}
          </div>
        )}

        {/* Borde inferior terracota */}
        <div style={{
          position: 'absolute',
          bottom: 0, left: 0, right: 0,
          height: 8,
          background: '#6b400a',
          display: 'flex',
        }}/>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
