import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
export const revalidate = 3600
export const metadata: Metadata = { title: 'Playa del día — La mejor playa de España hoy', description: 'Cada día seleccionamos la playa con mejor puntuación en tiempo real de toda España.', alternates: { canonical: '/playa-del-dia' } }
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
  return (<><Nav /><main style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem 5rem',textAlign:'center'}}>
    <p style={{fontSize:'.82rem',color:'var(--muted)',marginBottom:'.5rem'}}>🗓 {new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long'})}</p>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(2rem,5vw,3rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>Playa del día</h1>
    <div style={{fontSize:'3rem',marginBottom:'.5rem'}}>🏖️</div>
    <Link href={`/playas/${pick.p.slug}`} style={{fontFamily:'var(--font-serif)',fontSize:'1.8rem',fontWeight:900,color:'var(--accent)',textDecoration:'none'}}>{pick.p.nombre}</Link>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginTop:'.35rem'}}>{pick.p.municipio} · {pick.p.provincia} · {pick.p.comunidad}</p>
    {pick.p.descripcion && <p style={{fontSize:'.88rem',color:'var(--ink)',maxWidth:500,margin:'1rem auto',lineHeight:1.6,fontStyle:'italic'}}>{(pick.p.descripcion??'').slice(0,200)}…</p>}
    <div style={{display:'flex',gap:'.5rem',justifyContent:'center',flexWrap:'wrap',marginTop:'1.5rem'}}>
      <Link href={`/playas/${pick.p.slug}`} style={{background:'var(--accent)',color:'#fff',padding:'.75rem 1.25rem',borderRadius:12,fontWeight:800,textDecoration:'none'}}>Ver ficha completa →</Link>
      <Link href="/buscar" style={{background:'var(--card-bg)',color:'var(--accent)',border:'1.5px solid var(--line)',padding:'.65rem 1.15rem',borderRadius:10,fontWeight:700,textDecoration:'none'}}>Buscar otra</Link>
    </div>
  </main></>)
}
