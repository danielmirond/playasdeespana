'use client'
import dynamic from 'next/dynamic'

const Favoritas = dynamic(() => import('./Favoritas'), { ssr: false })
const Cercanas  = dynamic(() => import('./Cercanas'),  { ssr: false })

interface Props { locale?: 'es' | 'en' }

export default function ClientBlocks({ locale = 'es' }: Props) {
  return (
    <>
      <Favoritas locale={locale} />
      <Cercanas  locale={locale} />
    </>
  )
}
