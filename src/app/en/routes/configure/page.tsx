import type { Metadata } from 'next'
import Nav from '@/components/ui/Nav'
import ConfiguradorRuta from '@/app/rutas/configurar/ConfiguradorRuta'
export const metadata: Metadata = { title: 'Build Your Beach Route | Spain', alternates: { canonical: '/en/routes/configure', languages: { 'es': '/rutas/configurar', 'en': '/en/routes/configure' } } }
export default function Page() {
  return (<><Nav /><main style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>Build Your Beach Route</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem'}}>Choose a coast, set the number of stops and filter by services.</p>
    <ConfiguradorRuta />
  </main></>)
}
