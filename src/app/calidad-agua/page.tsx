import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Calidad del agua en playas de España | Datos EEA', description: 'Clasificación de calidad del agua de baño en las playas de España según la Directiva europea 2006/7/CE.', alternates: { canonical: '/calidad-agua' } }
export default async function Page() {
  const playas = await getPlayas()
  const conBandera = playas.filter(p => p.bandera).length
  const total = playas.length
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>💧 Calidad del agua de baño</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem',maxWidth:560}}>
      La calidad del agua se mide según la Directiva europea 2006/7/CE. Las playas con Bandera Azul ({conBandera} de {total}) garantizan calidad excelente.
      En cada ficha de playa mostramos la clasificación actualizada.
    </p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'.65rem'}}>
      {[{label:'Excelente',color:'#3d6b1f',desc:'Cumple los estándares más altos'},{label:'Buena',color:'#4a7a90',desc:'Apta para el baño'},{label:'Suficiente',color:'#c48a1e',desc:'Cumple el mínimo'},{label:'Insuficiente',color:'#7a2818',desc:'No recomendada para el baño'}].map(q => (
        <div key={q.label} style={{background:'var(--card-bg)',border:'1px solid var(--line)',borderLeft:`4px solid ${q.color}`,borderRadius:6,padding:'1rem'}}>
          <div style={{fontWeight:800,color:q.color}}>{q.label}</div>
          <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:'.2rem'}}>{q.desc}</div>
        </div>
      ))}
    </div>
    <div style={{marginTop:'2rem'}}>
      <Link href="/banderas-azules" style={{color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Ver playas con Bandera Azul →</Link>
    </div>
  </main></>)
}
