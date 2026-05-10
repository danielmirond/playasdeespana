import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'

export const revalidate = 3600

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'
const ORG_REF = { '@id': `${BASE}/#organization` }

export const metadata: Metadata = {
  title: 'Playa del día | La mejor playa de España hoy',
  description: 'Cada día seleccionamos la playa con mejor puntuación en tiempo real de toda España.',
  alternates: { canonical: '/playa-del-dia' },
  openGraph: {
    type:  'article',
    url:   `${BASE}/playa-del-dia`,
    title: 'Playa del día | La mejor playa de España hoy',
    images: [{ url: '/api/og?playa=Playa%20del%20d%C3%ADa', width: 1200, height: 630 }],
  },
}
function score(p: any) { let s=40; if(p.bandera)s+=15;if(p.socorrismo)s+=12;if(p.duchas)s+=8;if(p.parking)s+=8;if(p.accesible)s+=5; const g=(p.grado_ocupacion??'').toLowerCase(); if(g.includes('bajo'))s+=8; return Math.min(100,s) }
export default async function Page() {
  const playas = await getPlayas()
  const day = new Date().getDate()
  // Deterministic daily pick: hash day + high score
  const candidates = playas.filter(p => p.lat && p.lng && p.descripcion && !(p as any).descripcion_generada)
    .map(p => ({p, sc: score(p) + (p.slug.charCodeAt(day % p.slug.length) % 10)}))
    .sort((a,b) => b.sc - a.sc)
  const pick = candidates[0]
  if (!pick) return <><Nav /><main style={{padding:'3rem',textAlign:'center'}}>No hay playa del día</main></>

  // NewsArticle — contenido fresco diario, candidato a Google Discover.
  // datePublished = inicio del día UTC para que cada deploy del día
  // declare la misma fecha (no actualiza el timestamp en cada build).
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  const todayIso = today.toISOString()

  const newsSchema = {
    '@context':       'https://schema.org',
    '@type':          'NewsArticle',
    '@id':            `${BASE}/playa-del-dia#article-${todayIso.split('T')[0]}`,
    headline:         `Playa del día: ${pick.p.nombre} (${pick.p.municipio})`,
    description:      `Hoy destacamos ${pick.p.nombre} en ${pick.p.municipio} (${pick.p.provincia}) por su combinación de servicios, calidad del agua y baja ocupación.`,
    url:              `${BASE}/playa-del-dia`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${BASE}/playa-del-dia` },
    image:            [`${BASE}/api/og?slug=${encodeURIComponent(pick.p.slug)}`],
    author:           ORG_REF,
    publisher:        ORG_REF,
    datePublished:    todayIso,
    dateModified:     todayIso,
    inLanguage:       'es-ES',
    articleSection:   'Playa del día',
    about:            { '@id': `${BASE}/playas/${pick.p.slug}#beach` },
  }

  return (<><Nav />
  <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsSchema) }} />
  <main style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem 5rem',textAlign:'center'}}>
    <p style={{fontSize:'.82rem',color:'var(--muted)',marginBottom:'.5rem'}}>🗓 {new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})}</p>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(2rem,5vw,3rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>Playa del día</h1>
    <div style={{fontSize:'3rem',marginBottom:'.5rem'}}>🏖️</div>
    <Link href={`/playas/${pick.p.slug}`} style={{fontFamily:'var(--font-serif)',fontSize:'1.8rem',fontWeight:900,color:'var(--accent)',textDecoration:'none'}}>{pick.p.nombre}</Link>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginTop:'.35rem'}}>{pick.p.municipio} · {pick.p.provincia} · {pick.p.comunidad}</p>
    {pick.p.descripcion && <p style={{fontSize:'.88rem',color:'var(--ink)',maxWidth:500,margin:'1rem auto',lineHeight:1.6,fontStyle:'italic'}}>{(pick.p.descripcion??'').slice(0,200)}…</p>}
    <div style={{display:'flex',gap:'.5rem',justifyContent:'center',flexWrap:'wrap',marginTop:'1.5rem'}}>
      <Link href={`/playas/${pick.p.slug}`} style={{background:'var(--accent)',color:'#fff',padding:'.75rem 1.25rem',borderRadius:4,fontWeight:800,textDecoration:'none'}}>Ver ficha completa →</Link>
      <Link href="/buscar" style={{background:'var(--card-bg)',color:'var(--accent)',border:'1px solid var(--line)',padding:'.65rem 1.15rem',borderRadius:4,fontWeight:700,textDecoration:'none'}}>Buscar otra</Link>
    </div>
  </main></>)
}
