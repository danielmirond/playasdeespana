// src/components/municipio/Pictograma.tsx — el sitio sin foto lleva el
// pictograma de su tipo sobre color liso. Es lo que se aprobó en el lienzo:
// nada de degradados anónimos con el nombre encima. Trazo, sin relleno,
// mismo registro que los iconos de estado del mar.
export type TipoPictograma = 'museo' | 'monumento' | 'mirador' | 'faro' | 'parque' | 'cultura' | 'playa' | 'castillo' | 'yacimiento' | 'camping'

export function tipoPictograma(tipo: string): TipoPictograma {
  const t = tipo.toLowerCase()
  if (/camping|acampada|caravan/.test(t)) return 'camping'
  if (/faro/.test(t)) return 'faro'
  if (/castillo|castell|fort|torre|muralla/.test(t)) return 'castillo'
  if (/yacimiento|castro|ruinas|dolmen|necr/.test(t)) return 'yacimiento'
  if (/mirador/.test(t)) return 'mirador'
  if (/museo|museu|galer|acuario|zoo/.test(t)) return 'museo'
  if (/parque|jard/.test(t)) return 'parque'
  if (/teatro|cine|biblioteca|centro cultural|auditorio/.test(t)) return 'cultura'
  if (/playa|cala|praia|platja/.test(t)) return 'playa'
  return 'monumento'
}

const TRAZOS: Record<TipoPictograma, string> = {
  museo:      'M4 20h16M6 20V9l6-5 6 5v11M10 20v-6h4v6M4 9h16',
  monumento:  'M9 21h6M10 21V9h4v12M8 9h8l-4-5-4 5M6 21h12',
  castillo:   'M4 21V8l2-2v3h3V6l2-2 2 2v3h3V6l2 2v13M4 21h16M10 21v-5h4v5',
  yacimiento: 'M3 20h18M5 20v-6a7 7 0 0 1 14 0v6M9 20v-4a3 3 0 0 1 6 0v4',
  mirador:    'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8',
  faro:       'M9 21h6M10 21l1-12h2l1 12M9 9h6l-1-4h-4zM12 3v2M4 8l3 1M20 8l-3 1',
  parque:     'M12 22v-6M12 16a5 5 0 1 1 4-8 4 4 0 1 1-1 8zM12 16a5 5 0 1 0-4-8',
  cultura:    'M4 5h16v12H4zM8 21h8M12 17v4M8 9l3 2-3 2M13 13h3',
  playa:      'M2 17c2-2 4-2 6 0s4 2 6 0 4-2 6 0M2 12c2-2 4-2 6 0s4 2 6 0 4-2 6 0',
  camping:    'M3 20L12 4l9 16H3zM12 4v16M8 20l4-7 4 7',
}

export default function Pictograma({ tipo, size = 44, color = '#faf4e6' }: { tipo: string; size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={TRAZOS[tipoPictograma(tipo)]} />
    </svg>
  )
}
