import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import MapaPlayas from '@/components/ui/MapaPlayas'
import { getPlayas } from '@/lib/playas'
import { COSTAS } from '@/lib/rutas'
export const revalidate = 86400
interface Props { params: Promise<{ slug: string }> }
export async function generateStaticParams() { return COSTAS.map(c => ({ slug: c.slug })) }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params; const c = COSTAS.find(x => x.slug === slug); if (!c) return {}
  return { title: `Top 10 Best Beaches — ${c.nombre}`, alternates: { canonical: `/en/top/${slug}` } }
}
function score(p: any) { let s=40; if(p.bandera)s+=15;if(p.socorrismo)s+=12;if(p.duchas)s+=8;if(p.parking)s+=8;if(p.accesible)s+=5; return Math.min(100,s) }
export default async function Page({ params }: Props) {
  const { slug } = await params; const costa = COSTAS.find(c => c.slug === slug); if (!costa) notFound()
  const playas = await getPlayas()
  const top = playas.filter(p => costa.provincias.includes(p.provincia) && p.lat && p.lng).map(p => ({p, sc: score(p)})).sort((a,b) => b.sc-a.sc).slice(0,10)
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'1rem'}}>Top 10 Best Beaches — {costa.nombre}</h1>
    <p style={{fontSize:'.88rem',color:'var(--muted)',marginBottom:'2rem'}}>{costa.descripcion}</p>
    <div style={{background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:6,overflow:'hidden',marginBottom:'2rem'}}><MapaPlayas playas={top.map(x=>x.p)} height="400px" /></div>
    <ol style={{margin:0,padding:0,listStyle:'none',display:'flex',flexDirection:'column',gap:'.55rem'}}>
      {top.map(({p,sc},i) => {
        const c = sc>=75?'#22c55e':sc>=55?'#eab308':'#f97316'
        return <li key={p.slug}><Link href={`/en/beaches/${p.slug}`} style={{display:'flex',alignItems:'center',gap:'1rem',background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:6,padding:'1rem 1.15rem',textDecoration:'none'}}>
          <span style={{width:36,height:36,borderRadius:'50%',background:i<3?'var(--accent)':'var(--metric-bg)',color:i<3?'#fff':'var(--ink)',fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'1rem',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{i+1}</span>
          <div style={{flex:1}}><div style={{fontWeight:800,color:'var(--ink)'}}>{p.nombre}</div><div style={{fontSize:'.75rem',color:'var(--muted)'}}>{p.municipio} · {p.provincia}</div></div>
          <span style={{background:c,color:'#fff',fontFamily:'var(--font-serif)',fontWeight:900,fontSize:'.88rem',padding:'.25rem .45rem',borderRadius:6}}>{sc}</span>
        </Link></li>
      })}
    </ol>
  </main></>)
}
