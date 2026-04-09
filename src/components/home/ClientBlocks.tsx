'use client'
import dynamic from 'next/dynamic'

function Placeholder() {
  return (
    <div style={{
      maxWidth: 1000, margin: '0 auto', padding: '0 2rem 2.5rem',
    }}>
      <div style={{
        height: 42,
        borderBottom: '1px solid var(--line, #e8dcc8)',
        marginBottom: '.85rem',
      }} />
      <div style={{
        height: 80,
        borderRadius: 14,
        background: 'var(--metric-bg, #f5ede0)',
        border: '1.5px solid var(--line, #e8dcc8)',
      }} />
    </div>
  )
}

const Favoritas = dynamic(() => import('./Favoritas'), { ssr: false })
const Cercanas  = dynamic(() => import('./Cercanas'),  { ssr: false, loading: () => <Placeholder /> })

interface Props { locale?: 'es' | 'en' }

export default function ClientBlocks({ locale = 'es' }: Props) {
  return (
    <>
      <Favoritas locale={locale} />
      <Cercanas  locale={locale} />
    </>
  )
}
