// src/app/api/og/cuaderno/route.tsx
// Imagen compartible del cuaderno — entregable §5.5 de la propuesta 2026.
// 1080×1350: página de cuaderno, no tarjeta de resultado. Filete doble,
// pauta horizontal y sellos estampados; la cifra es el titular.
//
// El cuaderno vive en localStorage, así que los datos llegan por query.
// El cliente construye la URL al compartir (CuadernoClient).
//
// Satori (el motor de next/og) solo entiende un subconjunto de CSS: nada
// de variables, ni grid, ni textPath. Por eso el sello se compone aquí
// con primitivas de flex —círculo con borde y anillo interior discontinuo
// que hace de troquel— en vez de reutilizar el SVG de la página. El
// resultado es el mismo lenguaje: grabado en línea fina y segunda tinta
// desplazada.
import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

const INK    = '#2a1a08'
const ACCENT = '#6b400a'
const PAPEL  = '#faf4e6'
const RULE   = 'rgba(42,26,8,0.18)'
const RULE_S = 'rgba(42,26,8,0.32)'

interface SelloData { nombre: string; provincia: string; fecha: string }

/** Una pasada del sello. Se pinta dos veces con desplazamiento. */
function Pasada({ s, size, color, opacity }: { s: SelloData; size: number; color: string; opacity: number }) {
  return (
    <div style={{
      position: 'absolute', top: 0, left: 0,
      width: size, height: size, borderRadius: size,
      border: `2px solid ${color}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      opacity,
    }}>
      {/* anillo interior discontinuo = dientes del troquel */}
      <div style={{
        position: 'absolute', top: size * 0.055, left: size * 0.055,
        width: size * 0.89, height: size * 0.89, borderRadius: size,
        border: `1px dashed ${color}`, opacity: 0.5,
        display: 'flex',
      }} />
      <div style={{
        fontSize: size * 0.062, letterSpacing: size * 0.014, color,
        opacity: 0.8, marginBottom: size * 0.03, display: 'flex',
      }}>
        PLAYAS DE ESPAÑA
      </div>
      <div style={{
        fontSize: size * (s.nombre.length > 16 ? 0.082 : s.nombre.length > 11 ? 0.098 : 0.122), fontWeight: 700,
        color, textAlign: 'center', lineHeight: 1.08, maxWidth: size * 0.66,
        display: 'flex',
      }}>
        {s.nombre}
      </div>
      {s.provincia && (
        <div style={{ fontSize: size * 0.058, color, opacity: 0.75, marginTop: size * 0.02, display: 'flex' }}>
          {s.provincia.toUpperCase()}
        </div>
      )}
      <div style={{ width: size * 0.3, height: 1, background: color, opacity: 0.5, marginTop: size * 0.045, display: 'flex' }} />
      <div style={{ fontSize: size * 0.068, color, marginTop: size * 0.035, display: 'flex' }}>
        {s.fecha}
      </div>
    </div>
  )
}

function Sello({ s, size, tono, rot }: { s: SelloData; size: number; tono: 'ink' | 'accent'; rot: number }) {
  const col = tono === 'accent' ? ACCENT : INK
  return (
    <div style={{
      width: size, height: size, position: 'relative', display: 'flex',
      transform: `rotate(${rot}deg)`, margin: 10,
    }}>
      {/* segunda tinta, fuera de registro */}
      <div style={{ position: 'absolute', top: 3, left: 3, width: size, height: size, display: 'flex' }}>
        <Pasada s={s} size={size} color={ACCENT} opacity={0.32} />
      </div>
      <Pasada s={s} size={size} color={col} opacity={0.88} />
    </div>
  )
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams
  const n = q.get('n') ?? '0'
  const comunidades = q.get('c') ?? '0'
  const provincias = q.get('p') ?? '0'
  const periodo = q.get('t') ?? ''
  // s = "Nombre|Provincia|dd·mm·aa" repetido
  const sellos: SelloData[] = q.getAll('s').slice(0, 6).map(v => {
    const [nombre = '', provincia = '', fecha = ''] = v.split('|')
    return { nombre: nombre.slice(0, 22), provincia: provincia.slice(0, 18), fecha: fecha.slice(0, 10) }
  })

  // Pauta del cuaderno: líneas cada 48px dibujadas a mano (Satori no
  // resuelve repeating-linear-gradient de forma fiable).
  const pauta = Array.from({ length: 26 }, (_, i) => (
    <div key={i} style={{
      position: 'absolute', left: 0, right: 0, top: 90 + i * 48,
      height: 1, background: 'rgba(42,26,8,0.05)', display: 'flex',
    }} />
  ))

  return new ImageResponse(
    (
      <div style={{
        width: '1080px', height: '1350px', background: PAPEL, color: INK,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '68px', position: 'relative',
      }}>
        {pauta}
        {/* filete doble de página */}
        <div style={{ position: 'absolute', top: 30, left: 30, right: 30, bottom: 30, border: `2px solid ${RULE_S}`, display: 'flex' }} />
        <div style={{ position: 'absolute', top: 38, left: 38, right: 38, bottom: 38, border: `1px solid ${RULE}`, display: 'flex' }} />

        {/* Cabecera */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 14 }}>
          <div style={{ fontSize: 20, letterSpacing: 7, color: 'rgba(42,26,8,0.55)', display: 'flex' }}>
            MI CUADERNO DE PLAYAS
          </div>
          <div style={{ fontSize: 96, fontWeight: 700, fontStyle: 'italic', marginTop: 20, lineHeight: 1.02, display: 'flex' }}>
            {n} playa{n === '1' ? '' : 's'}
          </div>
          <div style={{ fontSize: 34, color: ACCENT, marginTop: 4, display: 'flex' }}>
            del litoral español
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 22, fontSize: 19, color: 'rgba(42,26,8,0.55)', letterSpacing: 1 }}>
            <span>{provincias} PROVINCIAS</span>
            <span>·</span>
            <span>{comunidades} COMUNIDADES</span>
            {periodo && <span>·</span>}
            {periodo && <span>{periodo.toUpperCase()}</span>}
          </div>
        </div>

        {/* Hoja de sellos */}
        <div style={{
          flex: 1, display: 'flex', flexWrap: 'wrap',
          alignItems: 'center', alignContent: 'center', justifyContent: 'center',
          marginTop: 30, maxWidth: 940,
        }}>
          {sellos.map((s, i) => (
            <Sello key={i} s={s} size={sellos.length > 4 ? (i % 3 === 1 ? 238 : 218) : (i % 3 === 1 ? 282 : 262)} tono={i % 2 ? 'accent' : 'ink'} rot={((i * 41) % 11) - 5} />
          ))}
        </div>

        {/* Pie con marca y URL: la imagen tiene que funcionar recortada */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: 24, borderTop: `1px solid ${RULE}`, width: 860,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12 }}>
            <span style={{ fontSize: 42, fontWeight: 700, fontStyle: 'italic' }}>playas</span>
            <span style={{ fontSize: 15, letterSpacing: 6, color: 'rgba(42,26,8,0.55)' }}>DE ESPAÑA</span>
          </div>
          <div style={{ fontSize: 17, color: 'rgba(42,26,8,0.55)', marginTop: 8, display: 'flex' }}>
            playas-espana.com
          </div>
        </div>
      </div>
    ),
    { width: 1080, height: 1350 },
  )
}
