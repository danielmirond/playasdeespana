import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
export const revalidate = 3600
export const metadata: Metadata = { title: 'Surf Forecast Spain | Wave & Wind Conditions', description: 'Real-time surf forecast for Spain: wave height, period, wind and water temperature.', alternates: { canonical: '/en/surf', languages: { 'es': '/surf', 'en': '/en/surf' } } }
export default async function Page() {
  const playas = (await getPlayas()).filter(p => p.actividades?.surf && p.lat && p.lng)
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>🏄 Surf Forecast Spain</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem'}}>{playas.length} surf beaches with real-time conditions</p>
    <div style={{background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:6,overflow:'hidden',marginBottom:'2rem'}}><MapaPlayas playas={playas} height="400px" /></div>
    <div style={{display:'flex',flexDirection:'column',gap:'.5rem'}}>
      {playas.slice(0,20).map(p => (
        <Link key={p.slug} href={`/en/beaches/${p.slug}`} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.85rem 1rem',background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:4,textDecoration:'none'}}>
          <div style={{flex:1}}><div style={{fontWeight:700,color:'var(--ink)'}}>{p.nombre}</div><div style={{fontSize:'.75rem',color:'var(--muted)'}}>{p.municipio} · {p.provincia}</div></div>
          <span style={{color:'var(--accent)',fontWeight:700}}>→</span>
        </Link>
      ))}
    </div>
  </main></>)
}
