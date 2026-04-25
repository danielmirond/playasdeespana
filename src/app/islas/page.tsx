import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
export const revalidate = 86400
export const metadata: Metadata = { title: 'Playas por isla | Mallorca, Tenerife, Ibiza, Fuerteventura y más', description: 'Playas de las islas de España: Baleares (Mallorca, Menorca, Ibiza, Formentera) y Canarias (Tenerife, Gran Canaria, Lanzarote, Fuerteventura).', alternates: { canonical: '/islas' } }

const FAQ = [
  { q: '¿Cuál es la mejor isla de España para playas?', a: 'Depende de lo que busques. Menorca destaca por sus calas vírgenes de agua turquesa, Fuerteventura ofrece las playas más extensas y salvajes, y Mallorca combina calas pequeñas con playas amplias y buen equipamiento. Para arena negra volcánica, Lanzarote y Tenerife son únicas.' },
  { q: '¿Se puede ir a las playas de las islas sin coche?', a: 'En las islas principales sí, aunque con limitaciones. Mallorca, Tenerife y Gran Canaria tienen buenas redes de autobuses que conectan las playas más populares. En islas más pequeñas como Formentera o La Graciosa puedes moverte en bicicleta. Para llegar a calas apartadas, el coche o la moto de alquiler suelen ser necesarios.' },
  { q: '¿Cuándo es la mejor época para visitar las islas?', a: 'Baleares ofrece el mejor clima playero entre junio y septiembre, con agua cálida y muchas horas de sol. Canarias se puede disfrutar todo el año gracias a su clima subtropical, con temperaturas suaves incluso en invierno. Mayo y octubre son meses ideales para evitar aglomeraciones en ambos archipiélagos.' },
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

function toSlug(s: string) { return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'-').replace(/[^a-z0-9-]/g,'') }
export default async function Page() {
  const playas = await getPlayas()
  // Group by municipio for island approximation (each island has distinct municipios)
  const baleares = playas.filter(p => p.comunidad === 'Islas Baleares')
  const canarias = playas.filter(p => p.comunidad === 'Canarias')
  // Island heuristic: group by known island names in municipio
  const islas = [
    { nombre: 'Mallorca', filter: (p: any) => p.comunidad === 'Islas Baleares' && !['Menorca','Ciutadella','Es Mercadal','Ferreries','Alaior','Maó','Sant Lluís','Es Migjorn Gran'].some(m => p.municipio?.includes(m)) && !['Ibiza','Sant Antoni','Sant Joan','Sant Josep','Santa Eulalia','Eivissa'].some(m => p.municipio?.includes(m)) && !['Formentera'].some(m => p.municipio?.includes(m)) },
    { nombre: 'Menorca', filter: (p: any) => ['Menorca','Ciutadella','Es Mercadal','Ferreries','Alaior','Maó','Sant Lluís'].some(m => p.municipio?.includes(m)) },
    { nombre: 'Ibiza', filter: (p: any) => ['Ibiza','Sant Antoni','Sant Joan','Sant Josep','Santa Eulalia','Eivissa'].some(m => p.municipio?.includes(m)) },
    { nombre: 'Formentera', filter: (p: any) => p.municipio?.includes('Formentera') },
    { nombre: 'Tenerife', filter: (p: any) => p.provincia === 'Santa Cruz de Tenerife' && !['La Palma','La Gomera','El Hierro'].some(m => p.municipio?.includes(m)) },
    { nombre: 'Gran Canaria', filter: (p: any) => p.provincia === 'Las Palmas' && !['Lanzarote','Fuerteventura','La Graciosa'].some(m => p.municipio?.includes(m)) },
    { nombre: 'Lanzarote', filter: (p: any) => ['Teguise','Yaiza','Tinajo','Haría','Arrecife','San Bartolomé','Tías'].some(m => p.municipio?.includes(m)) },
    { nombre: 'Fuerteventura', filter: (p: any) => ['La Oliva','Puerto del Rosario','Tuineje','Pájara','Antigua','Betancuria'].some(m => p.municipio?.includes(m)) },
  ]
  return (<><Nav /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>🏝️ Playas por isla</h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem'}}>Baleares y Canarias: cada isla con sus playas.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'.65rem'}}>
      {islas.map(isla => {
        const count = playas.filter(isla.filter).length
        return <Link key={isla.nombre} href={`/buscar?q=${encodeURIComponent(isla.nombre)}`} style={{
          display:'flex',alignItems:'center',justifyContent:'space-between',
          padding:'1rem 1.15rem',background:'var(--card-bg)',border:'1px solid var(--line)',
          borderRadius:6,textDecoration:'none',
        }}>
          <div><div style={{fontWeight:800,fontSize:'.95rem',color:'var(--ink)'}}>{isla.nombre}</div></div>
          <span style={{fontSize:'.82rem',fontWeight:700,color:'var(--accent)',background:'color-mix(in srgb, var(--accent) 10%, var(--card-bg))',padding:'.2rem .55rem',borderRadius:100}}>{count}</span>
        </Link>
      })}
    </div>
  </main></>)
}
