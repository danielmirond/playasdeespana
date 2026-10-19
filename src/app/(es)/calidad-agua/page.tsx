import type { Metadata } from 'next'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'
import { getPlayas } from '@/lib/playas'
import { getCalidadDB } from '@/lib/calidad'
import EnlacesRelacionados from '@/components/seo/EnlacesRelacionados'
import AuthorByline from '@/components/seo/AuthorByline'
import { getEditorialModified } from '@/lib/dateModified'
// (UpdatedBadge sustituido por AuthorByline: emite Article schema con
//  dateModified Y author en el mismo bloque, evitando schema duplicado.)
export const revalidate = 86400
const MODIFIED = getEditorialModified('src/app/calidad-agua/page.tsx', ['public/data/playas.json'])
export const metadata: Metadata = {
  title: 'Calidad del agua en playas de España | Datos EEA',
  description: 'Clasificación de calidad del agua de baño en las playas de España según la Directiva europea 2006/7/CE.',
  alternates: { canonical: '/calidad-agua' },
  openGraph: { type: 'article', modifiedTime: MODIFIED, url: 'https://playas-espana.com/calidad-agua',
    images: [{ url: '/api/og?playa=Calidad%20del%20agua%20de%20ba%C3%B1o', width: 1200, height: 630 }],
  },
  other: { 'article:modified_time': MODIFIED },
}
export default async function Page() {
  const playas = await getPlayas()
  const calidad = await getCalidadDB()
  const total = playas.length

  // Recuentos reales sobre el dataset de la Agencia Europea de Medio
  // Ambiente, no estimaciones. Se calculan aquí para que la página no
  // pueda quedarse desfasada respecto al sidecar.
  // Punto de millar a mano: toLocaleString('es-ES') depende de los datos ICU
  // de Node y aquí devuelve «4337» pelado. Mismo motivo que el comentario de
  // TOTAL_PLAYAS_TXT en lib/playas.ts.
  const mil = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.')

  const clasificadas = playas.filter(p => calidad[p.slug])
  const porNivel = (n: string) => clasificadas.filter(p => calidad[p.slug].nivel === n).length
  const temporada = clasificadas[0] ? calidad[clasificadas[0].slug].temporada : null

  const conBandera = playas.filter(p => p.bandera).length
  // Comprobado, no supuesto: de las 600 playas con Bandera Azul que
  // tienen clasificación de la EEA, 18 NO figuran como excelentes. La
  // página decía que la bandera «garantiza calidad excelente».
  const banderaClasificada = playas.filter(p => p.bandera && calidad[p.slug])
  const banderaNoExcelente = banderaClasificada.filter(p => calidad[p.slug].nivel !== 'Excelente').length
  return (<><Nav /><main style={{maxWidth:1000,margin:'0 auto',padding:'2rem 1.5rem 5rem'}}>
    <h1 style={{fontFamily:'var(--font-serif)',fontSize:'clamp(1.6rem,4vw,2.4rem)',fontWeight:900,color:'var(--ink)',marginBottom:'.25rem'}}>Calidad del agua de baño en España <span aria-hidden="true">💧</span></h1>
    <AuthorByline
      headline="Calidad del agua de baño en las playas de España"
      url="https://playas-espana.com/calidad-agua"
      dateModified={MODIFIED}
      description="Clasificación oficial de calidad del agua de baño en las playas españolas según la Directiva europea 2006/7/CE."
      articleSection="Calidad del agua"
    />
    <p data-speakable style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem',maxWidth:560}}>
      La calidad del agua se mide según la Directiva europea 2006/7/CE, que clasifica cada punto de baño
      en cuatro niveles a partir de las muestras de los últimos cuatro años. De las {mil(total)} playas
      del sitio, <b>{mil(clasificadas.length)}</b> tienen clasificación oficial
      {temporada && <> de la temporada {temporada}</>}: {mil(porNivel('Excelente'))} excelente,
      {' '}{porNivel('Buena')} buena, {porNivel('Suficiente')} suficiente y {porNivel('Deficiente')} deficiente.
      El resto no tiene punto de muestreo propio en el registro europeo, y entonces su ficha no muestra clasificación
      en lugar de suponerla.
    </p>
    <p style={{fontSize:'.92rem',color:'var(--muted)',marginBottom:'2rem',maxWidth:560}}>
      La Bandera Azul ({mil(conBandera)} playas) exige agua excelente entre sus criterios, pero no
      es lo mismo que la clasificación europea y no siempre coinciden: de las {banderaClasificada.length} con bandera
      que además están clasificadas, <b>{banderaNoExcelente}</b> no figuran como excelentes en el último dato de la EEA.
      Cuando quieras el dato concreto, está en la ficha de cada playa, con el nombre del punto de muestreo del que sale.
    </p>
    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:'.65rem'}}>
      {[{label:'Excelente',color:'var(--excelente)',desc:'Cumple los estándares más altos'},{label:'Buena',color:'var(--mar-500)',desc:'Apta para el baño'},{label:'Suficiente',color:'var(--aceptable)',desc:'Cumple el mínimo'},{label:'Insuficiente',color:'var(--noapto)',desc:'No recomendada para el baño'}].map(q => (
        <div key={q.label} style={{background:'var(--card-bg)',border:'1px solid var(--line)',borderLeft:`4px solid ${q.color}`,borderRadius:6,padding:'1rem'}}>
          <div style={{fontWeight:800,color:q.color}}>{q.label}</div>
          <div style={{fontSize:'.78rem',color:'var(--muted)',marginTop:'.2rem'}}>{q.desc}</div>
        </div>
      ))}
    </div>
    <div style={{marginTop:'2rem'}}>
      <Link href="/banderas-azules" style={{color:'var(--accent)',fontWeight:700,textDecoration:'none'}}>Ver playas con Bandera Azul →</Link>
    </div>
  
        <EnlacesRelacionados topic="calidad-agua" />
      </main></>)
}
