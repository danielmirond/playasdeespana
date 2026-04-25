import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import MapaPlayas from '@/components/ui/MapaPlayas'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Accessible Beaches in Spain | PMR List', description: 'Beaches with wheelchair access, ramps, amphibious chairs and adapted facilities in Spain.', alternates: { canonical: '/en/accessible-beaches', languages: { 'es': '/playas-accesibles', 'en': '/en/accessible-beaches' } } }
function toSlug(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') }
export default async function Page() {
  const playas = (await getPlayas()).filter(p => p.accesible === true)
  const byCom = new Map<string, typeof playas>()
  for (const p of playas) { const l = byCom.get(p.comunidad) ?? []; l.push(p); byCom.set(p.comunidad, l) }
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <nav style={{display:'flex',gap:'.4rem',fontSize:'.75rem',color:'var(--muted)',marginBottom:'.85rem'}} aria-label="Breadcrumb">
      <Link href="/en">Home</Link><span aria-hidden="true">›</span><span aria-current="page">Accessible Beaches in Spain</span>
    </nav>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>Accessible Beaches in Spain</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem'}}>{playas.length} beaches across Spain</p>
    {playas.length > 0 && <div style={{background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:6,overflow:'hidden',marginBottom:'2rem'}}><MapaPlayas playas={playas} height="400px" /></div>}
    {Array.from(byCom.entries()).map(([com, list]) => (
      <section key={com} style={{marginBottom:'2rem'}}>
        <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.2rem',fontWeight:800,color:'var(--ink)',marginBottom:'.5rem'}}>{com} ({list.length})</h2>
        <div style={{display:'flex',flexDirection:'column',gap:'.4rem'}}>
          {list.slice(0,8).map(p => (
            <Link key={p.slug} href={`/en/beaches/${p.slug}`} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'.7rem 1rem',background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:4,textDecoration:'none'}}>
              <div style={{flex:1}}><div style={{fontWeight:700,fontSize:'.88rem',color:'var(--ink)'}}>{p.nombre}</div><div style={{fontSize:'.72rem',color:'var(--muted)'}}>{p.municipio} · {p.provincia}</div></div>
              <span style={{color:'var(--accent)',fontWeight:700}}>→</span>
            </Link>
          ))}
        </div>
      </section>
    ))}
  </main></>)
}
