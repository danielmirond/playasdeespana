// src/app/banderas-negras/page.tsx — Banderas Negras 2026 (Ecologistas en
// Acción): los 48 puntos negros del litoral español, con cruce contra
// nuestras fichas y alternativas limpias cerca de cada playa afectada.
import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import AuthorByline from '@/components/seo/AuthorByline'
import { getFileLastModified } from '@/lib/dateModified'
import { getPlayas, getPlayaBySlug } from '@/lib/playas'
import { haversine } from '@/lib/geo'
import { BANDERAS_NEGRAS_2026, TIPOLOGIAS, type TipologiaBN } from '@/data/banderas-negras-2026'

export const revalidate = 86400

const MODIFIED = getFileLastModified('src/app/banderas-negras/page.tsx')
const BASE = 'https://playas-espana.com'

export const metadata: Metadata = {
  // SEO: sin la cifra en el title (la respuesta se da dentro, no en SERP).
  title: 'Banderas Negras 2026 en España | Lista por provincias',
  description: 'Todas las Banderas Negras 2026 de Ecologistas en Acción: playas y puntos del litoral señalados por vertidos, contaminación o mala gestión, por provincias, y alternativas limpias cerca.',
  alternates: { canonical: '/banderas-negras' },
  openGraph: {
    type: 'article', modifiedTime: MODIFIED, url: `${BASE}/banderas-negras`,
    images: [{ url: '/api/og?playa=Banderas%20Negras%202026', width: 1200, height: 630 }],
  },
  other: { 'article:modified_time': MODIFIED },
}

const FAQ = [
  { q: '¿Qué es una bandera negra en una playa?', a: 'Es una denuncia ambiental que Ecologistas en Acción otorga cada año desde 2005 a los puntos del litoral español más castigados por la contaminación o la mala gestión: dos por provincia costera, una por cada motivo. No es una clasificación oficial ni implica prohibición de baño.' },
  { q: '¿Bandera negra significa que está prohibido bañarse?', a: 'No. La bandera negra señala un problema ambiental (vertidos, urbanización, contaminación química…), no el estado del agua ese día. La aptitud para el baño la determinan los muestreos oficiales de calidad del agua y la bandera del socorrista de cada jornada.' },
  { q: '¿Quién otorga las banderas negras y las banderas azules?', a: 'Las banderas negras las concede la organización Ecologistas en Acción como denuncia. Las banderas azules las otorga la FEE (ADEAC en España) como distintivo de calidad y servicios. Son sistemas independientes y de signo opuesto.' },
  { q: '¿Una playa con bandera negra puede tener buena calidad de agua?', a: 'Sí, puede ocurrir: la bandera negra a veces señala un problema de gestión o un impacto en el entorno (obras, urbanización, biodiversidad) y no necesariamente la calidad microbiológica del agua de baño, que se mide con muestreos oficiales.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })),
}

interface Alternativa { slug: string; nombre: string; municipio: string; distKm: number }

export default async function BanderasNegrasPage() {
  const playas = await getPlayas()

  // Para cada bandera con ficha propia: 3 alternativas limpias cerca
  // (Bandera Azul, <45 km), calculadas server-side.
  const alternativas = new Map<string, Alternativa[]>()
  for (const bn of BANDERAS_NEGRAS_2026) {
    if (!bn.slug) continue
    const p = await getPlayaBySlug(bn.slug)
    if (!p?.lat || !p?.lng) continue
    const alts = playas
      .filter(x => x.slug !== p.slug && x.bandera && x.lat && x.lng)
      .map(x => ({ slug: x.slug, nombre: x.nombre, municipio: x.municipio, distKm: haversine(p.lat, p.lng, x.lat, x.lng) / 1000 }))
      .filter(x => x.distKm <= 45)
      .sort((a, b) => a.distKm - b.distKm)
      .slice(0, 3)
    if (alts.length) alternativas.set(bn.slug, alts)
  }

  // Agrupar por comunidad (orden por nº de banderas desc)
  const porComunidad = new Map<string, typeof BANDERAS_NEGRAS_2026>()
  for (const bn of BANDERAS_NEGRAS_2026) {
    const list = porComunidad.get(bn.comunidad) ?? []
    list.push(bn)
    porComunidad.set(bn.comunidad, list)
  }
  const comunidades = [...porComunidad.entries()].sort((a, b) => b[1].length - a[1].length)

  // Stats por tipología (orden desc)
  const stats = (Object.keys(TIPOLOGIAS) as TipologiaBN[])
    .map(t => ({ t, ...TIPOLOGIAS[t], count: BANDERAS_NEGRAS_2026.filter(b => b.tipologia === t).length }))
    .sort((a, b) => b.count - a.count)

  return (
    <>
      <Nav />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
        <nav style={{ display: 'flex', gap: '.4rem', fontSize: '.75rem', color: 'var(--muted)', marginBottom: '.85rem' }} aria-label="Ruta de navegación">
          <Link href="/">Inicio</Link><span aria-hidden="true">›</span><span aria-current="page">Banderas Negras</span>
        </nav>

        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'clamp(1.6rem,4vw,2.4rem)', fontWeight: 900, color: 'var(--ink)', marginBottom: '.25rem' }}>
          Banderas Negras 2026: los puntos negros del litoral español <span aria-hidden="true">🏴</span>
        </h1>
        <AuthorByline
          headline="Banderas Negras 2026 en España: lista por provincias"
          url={`${BASE}/banderas-negras`}
          dateModified={MODIFIED}
          description="Las Banderas Negras 2026 de Ecologistas en Acción por provincias, con las playas afectadas y alternativas limpias cerca."
          articleSection="Calidad del agua y medio ambiente"
        />
        <p data-speakable style={{ fontSize: '.95rem', color: 'var(--ink)', lineHeight: 1.65, margin: '0 0 1rem', maxWidth: 640 }}>
          Cada verano, <a href="https://www.ecologistasenaccion.org/372065/informe-banderas-negras-2026/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', fontWeight: 600 }}>Ecologistas en Acción</a> recorre
          los más de 8.000 km de costa española y señala con <strong>48 banderas negras</strong> —dos por provincia costera— los
          puntos más castigados por los vertidos, la contaminación y la mala gestión ambiental. Esta es la lista de 2026,
          cruzada con nuestras fichas para que sepas qué playas están afectadas y qué alternativas limpias tienes cerca.
        </p>
        <div style={{ background: 'rgba(196,138,30,.08)', border: '1px solid rgba(196,138,30,.3)', borderRadius: 6, padding: '.85rem 1rem', fontSize: '.82rem', color: 'var(--ink)', lineHeight: 1.55, marginBottom: '2rem', maxWidth: 640 }}>
          <strong>Ojo:</strong> una bandera negra es una <em>denuncia ambiental</em>, no una prohibición de baño ni una medición
          del agua de ese día. La aptitud para el baño la marcan los <Link href="/calidad-agua" style={{ color: 'var(--accent)', fontWeight: 600 }}>muestreos oficiales de calidad del agua</Link> y
          la bandera del socorrista.
        </div>

        {/* Stats por tipología */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .85rem' }}>
          ¿Por qué se conceden? <em style={{ fontWeight: 500, color: 'var(--accent)' }}>Las causas de 2026</em>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: '.55rem', marginBottom: '2.5rem' }}>
          {stats.map(s => (
            <div key={s.t} style={{ display: 'flex', alignItems: 'center', gap: '.65rem', background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.7rem .85rem' }}>
              <span aria-hidden="true" style={{ fontSize: '1.1rem' }}>{s.emoji}</span>
              <span style={{ flex: 1, fontSize: '.8rem', color: 'var(--ink)', lineHeight: 1.3 }}>{s.label}</span>
              <span style={{ background: s.color, color: '#fff', fontWeight: 800, fontSize: '.78rem', minWidth: 26, height: 26, borderRadius: 999, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>{s.count}</span>
            </div>
          ))}
        </div>

        {/* Lista por comunidad */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>
          La lista completa, <em style={{ fontWeight: 500, color: 'var(--accent)' }}>por comunidades</em>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', marginBottom: '2.5rem' }}>
          {comunidades.map(([com, items]) => (
            <section key={com} aria-label={`Banderas negras en ${com}`}>
              <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 .6rem', display: 'flex', alignItems: 'baseline', gap: '.5rem' }}>
                {com}
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.68rem', color: 'var(--muted)', fontWeight: 400 }}>
                  {items.length} bandera{items.length !== 1 ? 's' : ''}
                </span>
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                {items.map((bn, i) => {
                  const tip = TIPOLOGIAS[bn.tipologia]
                  const alts = bn.slug ? alternativas.get(bn.slug) : undefined
                  return (
                    <div key={`${bn.provincia}-${i}`} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderLeft: `3px solid ${tip.color}`, borderRadius: 6, padding: '.8rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap', marginBottom: '.3rem' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '.62rem', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', background: tip.color, padding: '.15rem .45rem', borderRadius: 4 }}>
                          {tip.emoji} {tip.label}
                        </span>
                        <span style={{ fontSize: '.68rem', color: 'var(--muted)' }}>{bn.provincia}</span>
                      </div>
                      <div style={{ fontSize: '.9rem', fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>
                        {bn.slug ? (
                          <Link href={`/playas/${bn.slug}`} style={{ color: 'var(--ink)', textDecorationColor: 'var(--accent)' }}>{bn.titulo}</Link>
                        ) : bn.titulo}
                      </div>
                      {alts && (
                        <div style={{ marginTop: '.5rem', fontSize: '.76rem', color: 'var(--muted)', lineHeight: 1.5 }}>
                          <span style={{ fontWeight: 700, color: '#3d6b1f' }}>Alternativas limpias cerca:</span>{' '}
                          {alts.map((a, j) => (
                            <span key={a.slug}>
                              <Link href={`/playas/${a.slug}`} style={{ color: 'var(--accent)', fontWeight: 600 }}>{a.nombre}</Link>
                              {` (${a.municipio}, a ${a.distKm < 10 ? a.distKm.toFixed(1) : Math.round(a.distKm)} km)`}
                              {j < alts.length - 1 ? ' · ' : ''}
                            </span>
                          ))}
                          {' '}— con Bandera Azul 2026.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {/* FAQ */}
        <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--ink)', margin: '0 0 1rem' }}>
          Preguntas frecuentes
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.6rem', marginBottom: '2.5rem' }}>
          {FAQ.map(f => (
            <details key={f.q} style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.8rem 1rem' }}>
              <summary style={{ fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)', cursor: 'pointer' }}>{f.q}</summary>
              <p style={{ fontSize: '.84rem', color: 'var(--muted)', lineHeight: 1.6, margin: '.6rem 0 0' }}>{f.a}</p>
            </details>
          ))}
        </div>

        {/* Cross-links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '.6rem' }}>
          <Link href="/calidad-agua" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Calidad del agua oficial <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Muestreos EEA por playa: la medición que sí marca el baño.</span>
          </Link>
          <Link href="/banderas-azules" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas Azules 2026 <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>El reverso: las playas premiadas por calidad y servicios.</span>
          </Link>
          <Link href="/buscar?orden=score" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Las mejores playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Score 0-100 en tiempo real con datos oficiales.</span>
          </Link>
          <Link href="/banderas-hoy" style={{ background: 'var(--card-bg)', border: '1px solid var(--line)', borderRadius: 6, padding: '.85rem 1rem', textDecoration: 'none' }}>
            <span style={{ display: 'block', fontWeight: 700, fontSize: '.88rem', color: 'var(--ink)' }}>Banderas en las playas hoy <span aria-hidden="true">→</span></span>
            <span style={{ fontSize: '.74rem', color: 'var(--muted)' }}>Semáforo en vivo por provincias, cada 30 minutos.</span>
          </Link>
        </div>
      </main>
    </>
  )
}
