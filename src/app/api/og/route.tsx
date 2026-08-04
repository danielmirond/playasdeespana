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
import { paletaOG } from '@/lib/paleta-og'

export const runtime = 'edge'

// Satori no resuelve var(): necesita valores. La paleta entera se elige
// según el flag en lib/paleta-og, así el sistema sigue mandando en vez de
// quedar hex sueltos por la ruta.
function verdictFor(score: number | null): { label: string; color: string } {
  const s = paletaOG().score
  if (score === null) return { label: '',            color: s.sindato }
  if (score >= 85)    return { label: 'excelente',   color: s.excelente }
  if (score >= 70)    return { label: 'muy bueno',   color: s.muybueno }
  if (score >= 50)    return { label: 'aceptable',   color: s.aceptable }
  if (score >= 30)    return { label: 'limitado',    color: s.limitado }
  return                     { label: 'no apto',     color: s.noapto }
}

// Si el caller pasa "calidad" string la convertimos a verdict
function verdictFromCalidad(calidad: string | null): { label: string; color: string } {
  const s = paletaOG().score
  if (!calidad) return { label: '', color: s.sindato }
  const map: Record<string, { label: string; color: string }> = {
    'Excelente':  { label: 'excelente',   color: s.excelente },
    'Buena':      { label: 'muy bueno',   color: s.muybueno },
    'Suficiente': { label: 'aceptable',   color: s.aceptable },
    'Deficiente': { label: 'no apto',     color: s.noapto },
  }
  return map[calidad] ?? { label: '', color: s.sindato }
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
  // Foto real de la playa. Con foto, la tarjeta social gana muchísimo:
  // la ilustración abstracta queda como respaldo para las fichas sin
  // imagen. Solo aceptamos https, para no inyectar orígenes raros.
  const fotoRaw   = sp.get('foto')
  const foto      = fotoRaw && /^https:\/\//.test(fotoRaw) ? fotoRaw : null
  // Sobre foto el texto va en blanco con sombra; sin foto, tinta sobre arena.
  const pal       = paletaOG()
  const tinta     = foto ? pal.onPhoto : pal.ink
  // Satori no tolera `textShadow: undefined` — llama a .toString() sobre el
  // valor y revienta con «failed to pipe response». Por eso la sombra se
  // esparce como objeto: sin foto la propiedad no llega a existir. Era la
  // causa de que toda tarjeta social sin foto devolviera 500.
  const sombra    = foto ? { textShadow: '0 2px 14px rgba(0,0,0,0.45)' } : {}

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

  // La columna de texto es flex, no absoluta. Antes se estimaba a mano
  // cuántas líneas ocuparía el título (caracteres por línea × alto de
  // línea) para colocar el score en un `top` calculado; con dos líneas el
  // score se salía de los 630 px y la fila de datos se le montaba encima.
  // Un flex column que se centra en el hueco disponible lo resuelve sin
  // adivinar nada.

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          background: pal.bg,
          fontFamily: pal.serif,
          overflow: 'hidden',
        }}
      >
        {/* Foto real a sangre + degradado editorial. Mismo criterio que
            el hero de la ficha: la foto es el gancho, el degradado
            protege la legibilidad del texto. */}
        {foto && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex' }}>
            <img src={foto} width={1200} height={630} style={{ objectFit: 'cover' }} alt="" />
            <div style={{
              position: 'absolute', top: 0, left: 0, width: 1200, height: 630, display: 'flex',
              background: 'linear-gradient(90deg, rgba(26,15,4,0.96) 0%, rgba(26,15,4,0.93) 38%, rgba(26,15,4,0.72) 66%, rgba(26,15,4,0.42) 100%)',
            }}/>
          </div>
        )}

        {/* Decoración: playa ilustrada abstracta a la derecha. Solo sin foto. */}
        {!foto && <div style={{
          position: 'absolute',
          right: 0, top: 0,
          width: 540, height: 360,
          display: 'flex',
        }}>
          {/* Cielo/mar gradiente */}
          <div style={{
            position: 'absolute', left: 60, top: 40,
            width: 480, height: 200,
            background: `linear-gradient(180deg, ${pal.ilustracion[0]} 0%, ${pal.ilustracion[1]} 60%, ${pal.ilustracion[2]} 100%)`,
            borderRadius: '2px',
            display: 'flex',
          }}/>
          {/* Onda del horizonte */}
          <svg viewBox="0 0 480 60" width="480" height="60"
               style={{ position: 'absolute', left: 60, top: 200, display: 'block' }}>
            <path d="M0,20 Q120,5 240,20 T480,20"
                  fill="none" stroke={pal.ink} strokeWidth="1.5"/>
            {/* Pin decorativo */}
            <circle cx="240" cy="18" r="6" fill={pal.bg} stroke={pal.ink} strokeWidth="1.5"/>
            <circle cx="240" cy="18" r="2" fill={pal.accent}/>
          </svg>
        </div>}

        {/* Logo arriba-izquierda */}
        <div style={{
          position: 'absolute', top: 52, left: 56,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          {/* Ondita ≈ */}
          <svg viewBox="0 0 40 20" width="36" height="18" style={{ display: 'block' }}>
            <path d="M2 8 Q8 4 14 8 T26 8 T38 8" fill="none" stroke={pal.accent} strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M2 14 Q8 10 14 14 T26 14 T38 14" fill="none" stroke={pal.accent} strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          <span style={{
            fontFamily: pal.serif,
            fontStyle: 'italic',
            fontSize: 30,
            fontWeight: 700,
            color: tinta,
            ...sombra,
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

        {/* Columna editorial: antetítulo, nombre, estado y score. */}
        <div style={{
          position: 'absolute',
          left: 56, top: 128, width: 660, bottom: 104,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}>
          {municipio && (
            <div style={{
              display: 'flex',
              fontFamily: 'system-ui, sans-serif',
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: foto ? 'rgba(255,255,255,0.82)' : pal.inkMute,
              marginBottom: 14,
            }}>
              {municipio}
            </div>
          )}

          <div style={{
            fontFamily: pal.serif,
            fontSize: titleSize,
            fontWeight: 700,
            color: tinta,
            ...sombra,
            lineHeight: 1.02,
            letterSpacing: '-0.02em',
            display: 'flex',
          }}>
            {playa}
          </div>

          <div style={{
            display: 'flex',
            marginTop: 26,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 15,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: foto ? 'rgba(255,255,255,0.82)' : pal.inkMute,
          }}>
            Estado del mar · Hoy
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: 20,
            marginTop: 6,
          }}>
            {showScore && (
              <>
                <span style={{
                  fontFamily: pal.serif,
                  fontSize: 128,
                  fontWeight: 700,
                  color: tinta,
                  ...sombra,
                  lineHeight: 1.08,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                }}>{score}</span>
                <span style={{
                  fontFamily: 'system-ui, sans-serif',
                  fontSize: 26,
                  fontWeight: 500,
                  color: foto ? 'rgba(255,255,255,0.82)' : pal.inkMute,
                  display: 'flex',
                }}>/100</span>
              </>
            )}
            <span style={{
              fontFamily: pal.serif,
              fontStyle: 'italic',
              fontSize: 46,
              fontWeight: 400,
              color: verdict.color,
              display: 'flex',
              marginLeft: showScore ? 12 : 0,
            }}>{verdict.label}</span>
          </div>
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
            color: pal.inkSoft,
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
          background: pal.accent,
          display: 'flex',
        }}/>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      // Cache-Control agresivo: la OG es determinista por params (mismo
      // slug → misma imagen). Con 1d en CDN evitamos recomputar en cada
      // petición de Google Imágenes / image sitemap (5000+ URLs en sitemap
      // image apuntan aquí). 7d stale-while-revalidate sirve la versión
      // anterior mientras se regenera, sin TTFB hit visible.
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  )
}
