'use client'
import dynamic from 'next/dynamic'

const Favoritas = dynamic(() => import('./Favoritas'), { ssr: false })
const Cercanas  = dynamic(() => import('./Cercanas'),  { ssr: false })

export default function ClientBlocks() {
  return (
    <>
      <Favoritas />
      <Cercanas />
    </>
  )
}
