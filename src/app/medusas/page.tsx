import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Temporada de medusas en España — Cuándo y dónde', description: 'Mapa de riesgo de medusas por región y mes en España. Cuándo hay medusas, qué playas se ven más afectadas y cómo protegerse.', alternates: { canonical: '/medusas' } }

const FAQ = [
  { q: '¿Cuándo hay más medusas en España?', a: 'La mayor concentración de medusas se da entre junio y septiembre, con el pico en agosto. En el Mediterráneo el riesgo es especialmente alto cuando el agua supera los 25 °C y las corrientes empujan los enjambres hacia la costa.' },
  { q: '¿Qué hacer si te pica una medusa?', a: 'Lava la zona afectada con agua salada, nunca con agua dulce. No frotes ni rasques la picadura. Si es una medusa mediterránea, aplica vinagre durante 30 segundos para neutralizar los nematocistos. Si se trata de una carabela portuguesa, no uses vinagre y acude al puesto de socorrismo.' },
  { q: '¿Dónde hay menos medusas en España?', a: 'Las costas del Cantábrico (Asturias, Cantabria, País Vasco) y el Atlántico norte gallego registran muchas menos medusas gracias a sus aguas más frías. En el Mediterráneo, las playas con praderas de posidonia también tienden a tener menor presencia de medusas.' },
]

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ.map(item => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
}

export default function Page() {
  const meses = [
    {mes:'Ene-Mar',riesgo:'Bajo',color:'#22c55e',desc:'Agua fría, pocas medusas en todas las costas.'},
    {mes:'Abr-May',riesgo:'Medio',color:'#eab308',desc:'Empieza a subir en Mediterráneo. Atlántico bajo.'},
    {mes:'Jun-Jul',riesgo:'Alto',color:'#f97316',desc:'Pico en Mediterráneo y Canarias. Carabelas en Atlántico sur.'},
    {mes:'Ago-Sep',riesgo:'Muy alto',color:'#ef4444',desc:'Máxima concentración en Mediterráneo. Reducción en Atlántico norte.'},
    {mes:'Oct-Dic',riesgo:'Bajo',color:'#22c55e',desc:'Agua se enfría, las medusas desaparecen gradualmente.'},
  ]
  return (<><Nav /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main style={{maxWidth:800,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>🪼 Temporada de medusas</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem',maxWidth:520}}>
      El riesgo de medusas depende de la temperatura del agua, las corrientes y la estación.
      En cada ficha de playa estimamos el riesgo en tiempo real.
    </p>
    <div style={{display:'flex',flexDirection:'column',gap:'.55rem',marginBottom:'2.5rem'}}>
      {meses.map(m => (
        <div key={m.mes} style={{display:'flex',alignItems:'center',gap:'1rem',background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:4,padding:'.85rem 1rem'}}>
          <div style={{width:90,fontWeight:800,fontSize:'.88rem',color:'var(--ink)',flexShrink:0}}>{m.mes}</div>
          <span style={{background:m.color,color:'#fff',fontWeight:800,fontSize:'.72rem',padding:'.2rem .5rem',borderRadius:6,flexShrink:0}}>{m.riesgo}</span>
          <div style={{fontSize:'.82rem',color:'var(--muted)',flex:1}}>{m.desc}</div>
        </div>
      ))}
    </div>
    <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.2rem',fontWeight:800,color:'var(--ink)',marginBottom:'.75rem'}}>Consejos</h2>
    <ul style={{fontSize:'.88rem',color:'var(--ink)',lineHeight:1.65,paddingLeft:'1.5rem'}}>
      <li>No toques una medusa varada en la arena — sigue picando.</li>
      <li>Si te pica, lava con agua salada (nunca dulce). No frotes.</li>
      <li>Aplica vinagre si es medusa mediterránea. Si es carabela portuguesa, NO uses vinagre.</li>
      <li>Consulta la ficha de cada playa para ver el riesgo estimado en tiempo real.</li>
    </ul>
    <div style={{marginTop:'1.5rem'}}><Link href="/buscar" style={{color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Buscar playas con bajo riesgo →</Link></div>
  </main></>)
}
