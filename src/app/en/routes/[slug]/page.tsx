import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { getPlayas } from '@/lib/playas'
import { getRutas } from '@/lib/rutas'
export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }
export async function generateStaticParams() { return (await getRutas(await getPlayas())).map(r => ({ slug: r.slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const r = (await getRutas(await getPlayas())).find(x => x.slug === slug); if (!r) return {}
  return { title: `${r.nombre} — Beach Itinerary`, alternates: { canonical: `/en/routes/${slug}` } }
}
export default async function Page({ params }: Props) {
  const { slug } = await params; const ruta = (await getRutas(await getPlayas())).find(r => r.slug === slug); if (!ruta) notFound()
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>{ruta.nombre}</h1>
    <p style={{fontSize:'.88rem',color:'var(--muted)',marginBottom:'1rem'}}>{ruta.costa.descripcion}</p>
    <a href={ruta.googleMapsUrl} target="_blank" rel="noopener noreferrer" style={{display:'inline-flex',alignItems:'center',gap:'.4rem',background:'var(--accent)',color:'#fff',padding:'.75rem 1.25rem',borderRadius:12,fontSize:'.92rem',fontWeight:800,textDecoration:'none',marginBottom:'2rem'}}>🗺️ Open in Google Maps</a>
    <div style={{background:'var(--card-bg)',border:'1.5px solid var(--line)',borderRadius:20,overflow:'hidden',marginBottom:'2rem'}}><MapaPlayas playas={ruta.paradas.map(p=>p.playa)} height="400px" /></div>
    <ol style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:'.55rem'}}>
      {ruta.paradas.map((p,i) => (
        <li key={p.playa.slug}><Link href={`/en/beaches/${p.playa.slug}`} style={{display:'flex',alignItems:'center',gap:'1rem',background:'var(--card-bg)',border:'1.5px solid var(--line)',borderRadius:14,padding:'1rem',textDecoration:'none'}}>
          <span style={{width:32,height:32,borderRadius:'50%',background:ruta.costa.color,color:'#fff',fontWeight:900,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</span>
          <div style={{flex:1}}><div style={{fontWeight:800,color:'var(--ink)'}}>{p.playa.nombre}</div><div style={{fontSize:'.75rem',color:'var(--muted)'}}>{p.playa.municipio}{p.distFromPrev>0?` · ${p.distFromPrev.toFixed(1)} km`:''}</div></div>
          <span style={{background:p.score>=75?'#22c55e':p.score>=55?'#eab308':'#f97316',color:'#fff',fontWeight:900,padding:'.2rem .4rem',borderRadius:6}}>{p.score}</span>
        </Link></li>
      ))}
    </ol>
  </main></>)
}
