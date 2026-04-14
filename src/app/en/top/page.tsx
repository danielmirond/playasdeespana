import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { COSTAS } from '@/lib/rutas'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Top 10 Best Beaches by Coast — Spain Rankings', description: 'Rankings of the 10 best beaches on each coast of Spain.', alternates: { canonical: '/en/top' } }
export default function Page() {
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'2rem'}}>Top 10 Best Beaches by Coast</h1>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'.65rem'}}>
      {COSTAS.map(c => (
        <Link key={c.slug} href={`/en/top/${c.slug}`} style={{display:'flex',alignItems:'center',gap:'.75rem',padding:'1rem 1.15rem',background:'var(--card-bg)',border:'1.5px solid var(--line)',borderLeft:`4px solid ${c.color==='#f8fafc'?'var(--accent)':c.color}`,borderRadius:14,textDecoration:'none'}}>
          <div style={{flex:1}}><div style={{fontWeight:800,color:'var(--ink)'}}>Top 10 {c.nombre}</div><div style={{fontSize:'.75rem',color:'var(--muted)'}}>{c.provincias.join(', ')}</div></div>
          <span style={{color:'var(--accent)',fontWeight:700}}>→</span>
        </Link>
      ))}
    </div>
  </main></>)
}
