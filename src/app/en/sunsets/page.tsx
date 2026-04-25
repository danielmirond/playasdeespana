import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Best Sunset Beaches in Spain', description: 'West-facing beaches in Spain with the most beautiful sunsets. Atlantic coast, Galicia, Baleares, Canarias.', alternates: { canonical: '/en/sunsets', languages: { 'es': '/atardeceres', 'en': '/en/sunsets' } } }
function isWest(p: any): boolean { if (p.comunidad==='Galicia') return true; if (p.provincia==='Huelva') return true; if (p.provincia==='Cádiz'&&p.lng<-5.5) return true; if (p.comunidad==='Asturias'||p.comunidad==='Cantabria') return true; if (p.comunidad==='Islas Baleares'&&p.lng<2.8) return true; if (p.comunidad==='Canarias'&&p.lng<-15.5) return true; return false }
export default async function Page() {
  const playas = (await getPlayas()).filter(p => p.lat && p.lng && isWest(p))
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>🌅 Best Sunset Beaches</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem'}}>{playas.length} west-facing beaches where the sun sets over the sea</p>
    <div style={{background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:6,overflow:'hidden',marginBottom:'2rem'}}><MapaPlayas playas={playas} height="400px" /></div>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))',gap:'.55rem'}}>
      {playas.slice(0,30).map(p => (
        <Link key={p.slug} href={`/en/beaches/${p.slug}`} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.75rem 1rem',background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:4,textDecoration:'none'}}>
          <span aria-hidden="true">🌅</span><div style={{flex:1}}><div style={{fontWeight:700,fontSize:'.88rem',color:'var(--ink)'}}>{p.nombre}</div><div style={{fontSize:'.72rem',color:'var(--muted)'}}>{p.municipio}</div></div>
        </Link>
      ))}
    </div>
  </main></>)
}
