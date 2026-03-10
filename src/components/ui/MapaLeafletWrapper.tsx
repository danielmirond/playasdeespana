'use client'
import dynamic from 'next/dynamic'

const MapaLeaflet = dynamic(() => import('./MapaLeaflet'), { ssr: false })

interface Props {
  lat: number
  lng: number
  nombre?: string
  zoom?: number
  height?: string
}

export default function MapaLeafletWrapper(props: Props) {
  return <MapaLeaflet {...props} />
}
