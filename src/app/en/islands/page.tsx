import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import UpdatedBadge from '@/components/seo/UpdatedBadge'
import { getEditorialModified } from '@/lib/dateModified'

export const revalidate = 86400
const MODIFIED = getEditorialModified('src/app/islas/page.tsx', ['public/data/playas.json'])

export const metadata: Metadata = {
  title: 'Beaches by island | Mallorca, Tenerife, Ibiza, Fuerteventura & more',
  description: 'Beaches of Spain’s islands: the Balearics (Mallorca, Menorca, Ibiza, Formentera) and the Canaries (Tenerife, Gran Canaria, Lanzarote, Fuerteventura).',
  openGraph: { type: 'website', images: [{ url: '/api/og?playa=Beaches%20by%20island%20in%20Spain', width: 1200, height: 630 }] },
  alternates: { canonical: '/en/islands', languages: { es: '/islas', en: '/en/islands' } },
}

const FAQ = [
  { q: 'Which is the best island in Spain for beaches?', a: 'It depends what you’re after. Menorca stands out for unspoilt turquoise coves, Fuerteventura has the longest, wildest beaches, and Mallorca mixes small coves with broad, well-equipped beaches. For black volcanic sand, Lanzarote and Tenerife are unique.' },
  { q: 'Can you reach the island beaches without a car?', a: 'On the main islands yes, within limits. Mallorca, Tenerife and Gran Canaria have good bus networks linking the popular beaches. On smaller islands like Formentera or La Graciosa you can get around by bike. For remote coves, a rental car or scooter is usually needed.' },
  { q: 'When is the best time to visit the islands?', a: 'The Balearics offer the best beach weather from June to September, with warm water and long sunny days. The Canaries can be enjoyed year-round thanks to their subtropical climate, mild even in winter. May and October are ideal to avoid the crowds on both archipelagos.' },
]
const faqSchema = { '@context': 'https://schema.org', '@type': 'FAQPage', inLanguage: 'en', mainEntity: FAQ.map(i => ({ '@type': 'Question', name: i.q, acceptedAnswer: { '@type': 'Answer', text: i.a } })) }

export default async function IslandsPageEn() {
  const playas = await getPlayas()
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
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.5rem'}}>Beaches by island in Spain <span aria-hidden="true">🏝️</span></h1>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'1.25rem'}}>The Balearics and the Canaries: every island with its beaches.</p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:'.65rem',marginTop:'1.25rem'}}>
      {islas.map(isla => {
        const count = playas.filter(isla.filter).length
        return <Link key={isla.nombre} href={`/en/search?q=${encodeURIComponent(isla.nombre)}`} style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'1rem 1.15rem',background:'var(--card-bg)',border:'1px solid var(--line)',borderRadius:6,textDecoration:'none'}}>
          <div style={{fontWeight:800,fontSize:'.95rem',color:'var(--ink)'}}>{isla.nombre}</div>
          <span style={{fontSize:'.82rem',fontWeight:700,color:'var(--accent)',background:'color-mix(in srgb, var(--accent) 10%, var(--card-bg))',padding:'.2rem .55rem',borderRadius:100}}>{count}</span>
        </Link>
      })}
    </div>
    <section style={{marginTop:'2.5rem'}}>
      <h2 style={{fontFamily:'var(--font-serif)',fontSize:'1.3rem',fontWeight:800,color:'var(--ink)',marginBottom:'1rem'}}>FAQ</h2>
      <div style={{display:'grid',gap:'.6rem'}}>
        {FAQ.map((f,i)=>(<details key={i} style={{border:'1px solid var(--line)',borderRadius:8,padding:'.9rem 1.1rem',background:'var(--card-bg)'}}><summary style={{fontWeight:700,color:'var(--ink)',cursor:'pointer',fontSize:'.95rem'}}>{f.q}</summary><p style={{margin:'.6rem 0 0',color:'var(--muted)',lineHeight:1.6,fontSize:'.9rem'}}>{f.a}</p></details>))}
      </div>
    </section>
    <UpdatedBadge iso={MODIFIED} url="https://playas-espana.com/en/islands" name="Beaches by island in Spain" visible={false} />
  </main></>)
}
