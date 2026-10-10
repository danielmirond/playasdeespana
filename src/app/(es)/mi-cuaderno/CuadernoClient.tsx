'use client'
// Cliente del cuaderno: lee localStorage (visitas + reportes), computa
// insignias con el motor puro de cuaderno.ts y pinta stats. El top100
// del ranking 2026 se importa estático (~100 slugs, unos pocos KB).
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { leerCuaderno, borrarVisita, calcularInsignias, contarReportesLocales, type Cuaderno } from '@/lib/cuaderno'
import Sello, { Insignia } from '@/components/cuaderno/Sello'
import ranking from '@/data/ranking-2026.json'

const TOP100 = new Set((ranking.top100 as Array<{ slug: string }>).map(p => p.slug))

export default function CuadernoClient() {
  const [cuaderno, setCuaderno] = useState<Cuaderno | null>(null)
  const [reportes, setReportes] = useState({ total: 0, medusas: 0 })

  useEffect(() => {
    setCuaderno(leerCuaderno())
    setReportes(contarReportesLocales())
  }, [])

  const visitas = useMemo(() =>
    Object.entries(cuaderno ?? {}).sort((a, b) => b[1].ts - a[1].ts), [cuaderno])
  const insignias = useMemo(() =>
    calcularInsignias(cuaderno ?? {}, reportes, TOP100), [cuaderno, reportes])

  if (cuaderno === null) {
    return <div style={{ padding: '3rem 0', textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>Abriendo tu cuaderno…</div>
  }

  const n = visitas.length
  const provincias = new Set(visitas.map(([, v]) => v.p).filter(Boolean)).size
  const comunidades = new Set(visitas.map(([, v]) => v.c).filter(Boolean)).size
  const conseguidas = insignias.filter(i => i.progreso === null)

  // La imagen compartible se genera en el borde con los datos del
  // cuaderno en la query: el cuaderno vive en localStorage, así que el
  // servidor no puede saberlos de otra forma. Solo viajan los que ya se
  // van a ver impresos — nombre, provincia y fecha del sello.
  function urlImagen(): string {
    const p = new URLSearchParams()
    p.set('n', String(n))
    p.set('c', String(comunidades))
    p.set('p', String(provincias))
    const fechas = visitas.map(([, v]) => v.ts).sort((a, b) => a - b)
    if (fechas.length) {
      const fmt = (t: number) => new Date(t).toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).replace('.', '')
      const desde = fmt(fechas[0]), hasta = fmt(fechas[fechas.length - 1])
      p.set('t', desde === hasta ? desde : `${desde} – ${hasta}`)
    }
    // Los seis sellos más recientes: es lo que cabe en la hoja
    for (const [, v] of visitas.slice(0, 6)) {
      const f = new Date(v.ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '·')
      p.append('s', `${v.n}|${v.p}|${f}`)
    }
    return `https://playas-espana.com/api/og/cuaderno?${p.toString()}`
  }

  function compartir() {
    const texto = n === 0
      ? 'Estoy empezando mi cuaderno de playas de España'
      : `Llevo ${n} playa${n === 1 ? '' : 's'} de España en mi cuaderno (${provincias} provincia${provincias === 1 ? '' : 's'}) y ${conseguidas.length} insignia${conseguidas.length === 1 ? '' : 's'}. ¿Cuántas llevas tú?`
    const url = 'https://playas-espana.com/mi-cuaderno'
    if (navigator.share) navigator.share({ title: 'Mi cuaderno de playas', text: texto, url }).catch(() => {})
    else navigator.clipboard?.writeText(`${texto}\n${url}`).catch(() => {})
  }

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '.6rem', marginBottom: '2rem' }}>
        {[
          [String(n), n === 1 ? 'playa visitada' : 'playas visitadas'],
          [String(provincias), provincias === 1 ? 'provincia' : 'provincias'],
          [String(comunidades), comunidades === 1 ? 'comunidad' : 'comunidades'],
          [`${conseguidas.length}/${insignias.length}`, 'insignias'],
        ].map(([v, l]) => (
          <div key={l} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.9rem 1rem', textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.7rem', fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>{v}</div>
            <div style={{ fontSize: '.68rem', color: 'var(--muted)', marginTop: '.3rem', textTransform: 'uppercase', letterSpacing: '.08em' }}>{l}</div>
          </div>
        ))}
      </div>

      <button onClick={compartir} style={{
        display: 'inline-flex', alignItems: 'center', gap: '.4rem',
        padding: '.6rem 1.2rem', borderRadius: 99, border: '1px solid var(--accent)',
        background: 'transparent', color: 'var(--accent)', fontWeight: 600,
        fontSize: '.85rem', cursor: 'pointer', marginBottom: '2.5rem',
      }}>
        ↗ Compartir mi cuaderno
      </button>
      {n > 0 && (
        <a
          href={urlImagen()}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '.4rem',
            padding: '.6rem 1.2rem', borderRadius: 99,
            border: '1px solid var(--line-strong)', color: 'var(--ink)',
            fontWeight: 600, fontSize: '.85rem', textDecoration: 'none',
            marginLeft: '.5rem', marginBottom: '2.5rem',
          }}
        >
          Descargar imagen
        </a>
      )}

      {/* Hoja de sellos — el cuaderno propiamente dicho */}
      {n > 0 && (
        <>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.9rem' }}>
            Tus sellos
          </h2>
          <div style={{
            padding: '1.25rem .75rem 1rem',
            background: 'var(--surface-2)',
            border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm, 4px)',
            // pauta de cuaderno
            backgroundImage: 'repeating-linear-gradient(to bottom, transparent 0 27px, color-mix(in srgb, var(--ink) 5%, transparent) 27px 28px)',
            marginBottom: '2.5rem',
          }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
              {visitas.map(([slug, v], i) => (
                <Sello
                  key={slug}
                  nombre={v.n}
                  provincia={v.p}
                  fecha={new Date(v.ts).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '·')}
                  size={96}
                  tono={i % 2 ? 'accent' : 'ink'}
                  rot={((i * 37) % 9) - 4}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Insignias */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.9rem' }}>
        Insignias
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.6rem', marginBottom: '2.5rem' }}>
        {insignias.map(i => (
          <Insignia
            key={i.id}
            numeral={i.numeral}
            titulo={i.nombre}
            detalle={i.progreso === null ? i.descripcion : i.progreso}
            conseguida={i.progreso === null}
          />
        ))}
      </div>

      {/* Visitas */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.9rem' }}>
        Registro
      </h2>
      {n === 0 ? (
        <div style={{ background: 'var(--card-bg)', border: '1px dashed var(--line)', borderRadius: 6, padding: '2rem 1.5rem', textAlign: 'center' }}>
          <p style={{ fontSize: '.9rem', color: 'var(--muted)', marginBottom: '1rem' }}>
            Aún no has marcado ninguna playa. Entra en la ficha de una que
            hayas pisado y pulsa «Estuve aquí».
          </p>
          <Link href="/playas-cerca-de-mi" style={{ color: 'var(--accent)', fontWeight: 600, fontSize: '.88rem', textDecoration: 'none' }}>
            Empezar por las playas cerca de mí →
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
          {visitas.map(([slug, v]) => (
            <div key={slug} style={{ display: 'flex', alignItems: 'baseline', gap: '.6rem', padding: '.55rem .75rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6 }}>
              <Link href={`/playas/${slug}`} style={{ flex: 1, textDecoration: 'none' }}>
                <span style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.95rem', color: 'var(--ink)' }}>{v.n}</span>
                <span style={{ fontSize: '.75rem', color: 'var(--muted)' }}> · {v.m}{v.p ? `, ${v.p}` : ''}</span>
                {TOP100.has(slug) && (
                  <span title="Top 100 de España 2026" style={{
                    fontFamily: 'var(--font-mono)', fontSize: '.56rem', letterSpacing: '.08em',
                    color: 'var(--sello-accent)', border: '1px solid currentColor',
                    borderRadius: 'var(--r-sello, 3px)', padding: '.05rem .28rem', marginLeft: '.4rem',
                    verticalAlign: 'middle',
                  }}>TOP 100</span>
                )}
              </Link>
              <span style={{ fontSize: '.68rem', color: 'var(--muted)', flexShrink: 0 }}>
                {new Date(v.ts).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
              </span>
              <button
                onClick={() => setCuaderno(borrarVisita(slug))}
                title="Quitar del cuaderno"
                style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '.8rem', padding: '0 .2rem' }}
              >×</button>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
