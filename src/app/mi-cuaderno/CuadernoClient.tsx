'use client'
// Cliente del cuaderno: lee localStorage (visitas + reportes), computa
// insignias con el motor puro de cuaderno.ts y pinta stats. El top100
// del ranking 2026 se importa estático (~100 slugs, unos pocos KB).
import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { leerCuaderno, borrarVisita, calcularInsignias, contarReportesLocales, type Cuaderno } from '@/lib/cuaderno'
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

  function compartir() {
    const texto = n === 0
      ? 'Estoy empezando mi cuaderno de playas de España 🏖️'
      : `Llevo ${n} playa${n === 1 ? '' : 's'} de España en mi cuaderno 🏖️ (${provincias} provincia${provincias === 1 ? '' : 's'}) y ${conseguidas.length} insignia${conseguidas.length === 1 ? '' : 's'}. ¿Cuántas llevas tú?`
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

      {/* Insignias */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.9rem' }}>
        Insignias
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '.6rem', marginBottom: '2.5rem' }}>
        {insignias.map(i => {
          const ok = i.progreso === null
          return (
            <div key={i.id} style={{
              background: 'var(--card-bg)', border: '1px solid',
              borderColor: ok ? 'var(--accent)' : 'var(--line)',
              borderRadius: 6, padding: '.8rem .95rem',
              opacity: ok ? 1 : .55,
            }}>
              <div style={{ fontSize: '1.5rem', filter: ok ? 'none' : 'grayscale(1)' }} aria-hidden>{i.emoji}</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontWeight: 700, fontSize: '.92rem', color: 'var(--ink)', margin: '.25rem 0 .1rem' }}>{i.nombre}</div>
              <div style={{ fontSize: '.72rem', color: 'var(--muted)', lineHeight: 1.45 }}>
                {i.descripcion}{!ok && <> · <em>{i.progreso}</em></>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Visitas */}
      <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--ink)', marginBottom: '.9rem' }}>
        Tus playas
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
                {TOP100.has(slug) && <span style={{ fontSize: '.7rem', marginLeft: '.35rem' }} title="Top 100 España 2026">🏆</span>}
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
