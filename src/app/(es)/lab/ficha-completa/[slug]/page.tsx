/*
 * LABORATORIO · la ficha ENTERA, repintada en E3.
 *
 * No copia la ficha: la importa. Lo que se ve aquí es exactamente
 * /playas/[slug] —sus cuarenta bloques, sus fuentes de datos, su lógica—
 * envuelto en un tema que cambia tokens de color, familia tipográfica y
 * radios. Si la página aguanta así, el paso a producción es cambiar esos
 * tokens en globals.css y borrar los radios de cada módulo, sin tocar un
 * solo componente.
 */
import type { Metadata } from 'next'
import { Libre_Franklin } from 'next/font/google'
import PlayaPage from '../../../playas/[slug]/page'
import tema from './tema-e3.module.css'

const franklin = Libre_Franklin({
  subsets: ['latin'],
  variable: '--font-franklin',
  display: 'swap',
  weight: ['200', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'Laboratorio · ficha completa en E3',
  robots: { index: false, follow: false },
}

export default async function FichaCompletaLab({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className={`${tema.tema} ${franklin.variable}`}>
      <p className={tema.aviso}>Laboratorio · la ficha real repintada en E3 · no indexable</p>
      <PlayaPage params={params} />
    </div>
  )
}
