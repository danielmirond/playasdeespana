// src/components/ui/DelMunicipio.tsx — el bloque «Del municipio».
//
// Un mismo bloque en las cinco páginas del municipio y en la ficha de playa.
// No decide nada: recibe la lista que calcula lib/enlaces-municipio y quita
// la página en la que está. Sin lógica aquí no hay forma de que dos páginas
// enlacen distinto.
//
// Sin 'use client' ni hooks a propósito: es puro, así que sirve igual desde
// un componente de servidor (las subpáginas) y desde FichaBody, que es de
// cliente y recibe la lista ya calculada por props.
import Link from 'next/link'
import type { ClaveMunicipio, EnlaceMunicipio } from '@/lib/enlaces-municipio'

interface Props {
  nombre: string
  enlaces: EnlaceMunicipio[]
  /** La página actual, que no se enlaza a sí misma. */
  actual?: ClaveMunicipio
  /** Sin la nota de cada enlace: para la ficha, que ya va cargada. */
  compacto?: boolean
}

export default function DelMunicipio({ nombre, enlaces, actual, compacto = false }: Props) {
  const lista = enlaces.filter(e => e.clave !== actual)
  if (!lista.length) return null
  return (
    <section aria-labelledby="del-municipio" style={{
      marginTop: '2rem', padding: '1.05rem 1.25rem',
      border: '1px solid var(--line)', borderRadius: 6, background: 'var(--card-bg, var(--surface))',
    }}>
      <div id="del-municipio" style={{
        fontSize: '.7rem', fontWeight: 500, letterSpacing: '.14em',
        textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '.5rem',
      }}>Más de {nombre}</div>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
        {lista.map(e => (
          <li key={e.clave}>
            <Link href={e.href} style={{ fontWeight: 600, color: 'var(--ink)' }}>{e.texto} →</Link>
            {!compacto && <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}> {e.nota}.</span>}
          </li>
        ))}
      </ul>
    </section>
  )
}
