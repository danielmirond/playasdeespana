import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import { getRutas, COSTAS } from '@/lib/rutas'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Beach Routes Along the Spanish Coast', description: 'Driving itineraries of the 5 best beaches on each coast of Spain with Google Maps link.', alternates: { canonical: '/en/routes', languages: { 'es': '/rutas', 'en': '/en/routes' } } }
export default async function Page() {
  const rutas = await getRutas(await getPlayas())
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'2rem'}}>Beach Routes Along the Coast</h1>
    <Link href="/en/routes/configure" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',background:'var(--accent)',color:'#fff',padding:'.75rem 1.25rem',borderRadius:4,fontSize:'.92rem',fontWeight:800,textDecoration:'none',marginBottom:'2rem'}}>🛣️ Build Your Own Route</Link>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:'.75rem'}}>
      {rutas.map(r => (
        <Link key={r.slug} href={`/en/routes/${r.slug}`} style={{display:'flex',flexDirection:'column',background:'var(--card-bg)',border:'1px solid var(--line)',borderLeft:`4px solid ${r.costa.color}`,borderRadius:6,padding:'1.1rem 1.2rem',textDecoration:'none'}}>
          <div style={{fontWeight:900,fontSize:'1rem',color:'var(--ink)',fontFamily:'var(--font-serif)'}}>{r.nombre}</div>
          <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:'.2rem'}}>{r.paradas.length} stops · {r.totalKm} km</div>
        </Link>
      ))}
    </div>
  </main></>)
}
