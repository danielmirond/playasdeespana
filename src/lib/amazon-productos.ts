// src/lib/amazon-productos.ts
// Catálogo de productos Amazon afiliados organizados por contexto de playa.
// Tag: nuus-21

export const AMAZON_TAG = 'nuus-21'

export interface ProductoAmazon {
  asin: string
  nombre: string
  precio: string
  categoria: string
}

export const PRODUCTOS = {
  siempre: [
    { asin: 'B0D7HZSDMC', nombre: 'Protector solar SPF50+ premium', precio: '18-28', categoria: 'sol' },
    { asin: 'B0CQGZG8Y8', nombre: 'Funda móvil estanca certificada', precio: '10-18', categoria: 'tech' },
    { asin: 'B0BX9R1H3V', nombre: 'Botella térmica inox 1L', precio: '28-45', categoria: 'hidratación' },
  ],
  calma: [
    { asin: 'B0BWTY4VDK', nombre: 'Set snorkel Cressi máscara+tubo', precio: '38-58', categoria: 'snorkel' },
    { asin: 'B0B3Q8KZQK', nombre: 'Paddle surf hinchable 10 pies', precio: '280-420', categoria: 'paddle' },
    { asin: 'B0BSCLKKXZ', nombre: 'Kayak hinchable Intex 2 plazas', precio: '140-200', categoria: 'kayak' },
  ],
  surf: [
    { asin: 'B0C2LQM5ZQ', nombre: 'Mochila estanca 25L', precio: '32-52', categoria: 'surf' },
    { asin: 'B0C7GZQ8C5', nombre: 'Cámara acción 4K sumergible', precio: '120-200', categoria: 'tech' },
    { asin: 'B0C5WVQPBG', nombre: 'Neopreno escarpines 3mm', precio: '18-28', categoria: 'calzado' },
  ],
  familia: [
    { asin: 'B0D2G3MJXV', nombre: 'Tienda playa pop-up UPF50', precio: '35-55', categoria: 'sombra' },
    { asin: 'B0CXKC8LSV', nombre: 'Set playa niños palas+cubos', precio: '12-22', categoria: 'juego' },
    { asin: 'B0BZZH2JJ5', nombre: 'Nevera portátil 30L ruedas', precio: '55-85', categoria: 'nevera' },
  ],
  arena: [
    { asin: 'B0BYLDV3FQ', nombre: 'Sombrilla playa 180cm anti-UV', precio: '28-42', categoria: 'sombra' },
    { asin: 'B0C9JQPLFR', nombre: 'Toalla microfibra secado rápido', precio: '22-35', categoria: 'toalla' },
    { asin: 'B0C4WXGJM2', nombre: 'Chanclas neopreno ajustables', precio: '32-50', categoria: 'calzado' },
  ],
  rocosa: [
    { asin: 'B0C5WVQPBG', nombre: 'Neopreno escarpines 3mm', precio: '18-28', categoria: 'calzado' },
    { asin: 'B0BWTY4VDK', nombre: 'Set snorkel Cressi máscara+tubo', precio: '38-58', categoria: 'snorkel' },
    { asin: 'B0D1GVKHXQ', nombre: 'Aletas snorkel cortas adulto', precio: '28-45', categoria: 'snorkel' },
  ],
  lectura: [
    { asin: 'B0CK3YJDH8', nombre: 'Kindle 11 ed. + funda', precio: '145-170', categoria: 'lectura' },
    { asin: 'B0C4ZXY8MJ', nombre: 'Manta picnic impermeable 200x150', precio: '20-35', categoria: 'picnic' },
    { asin: 'B0BYYBZ3HW', nombre: 'Altavoz Bluetooth waterproof', precio: '45-75', categoria: 'audio' },
  ],
} as const

export type ContextoPlaya = keyof typeof PRODUCTOS

export function getProductosParaPlaya(playa: {
  composicion?: string | null
  accesible?: boolean
  perros?: boolean
  tipo?: string | null
  actividades?: Record<string, boolean>
}, estado: string): ProductoAmazon[] {
  const picks: ProductoAmazon[] = [...PRODUCTOS.siempre]

  const esRocosa = playa.composicion?.toLowerCase().includes('roca') ||
                   playa.composicion?.toLowerCase().includes('grava') ||
                   playa.composicion?.toLowerCase().includes('piedra')
  const esArena = playa.composicion?.toLowerCase().includes('arena')
  const esCala = playa.tipo?.toLowerCase().includes('cala')
  const esFamiliar = playa.accesible || false

  if (estado === 'CALMA' || estado === 'BUENA') {
    picks.push(...PRODUCTOS.calma.slice(0, 2))
  }
  if (estado === 'SURF') {
    picks.push(...PRODUCTOS.surf.slice(0, 2))
  }
  if (esRocosa || esCala) {
    picks.push(...PRODUCTOS.rocosa.slice(0, 2))
  } else if (esArena) {
    picks.push(...PRODUCTOS.arena.slice(0, 2))
  }
  if (esFamiliar) {
    picks.push(...PRODUCTOS.familia.slice(0, 2))
  }

  // Deduplicate by ASIN
  const seen = new Set<string>()
  return picks.filter(p => {
    if (seen.has(p.asin)) return false
    seen.add(p.asin)
    return true
  }).slice(0, 6)
}
