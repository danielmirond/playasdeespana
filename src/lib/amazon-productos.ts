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
    { asin: 'B00WG29EH8', nombre: 'Protector solar SPF50', precio: '20-30', categoria: 'sol' },
    { asin: 'B07HHMC55Z', nombre: 'Funda móvil estanca', precio: '8-15', categoria: 'tech' },
    { asin: 'B0BLM5R5JN', nombre: 'Botella térmica 1L', precio: '25-40', categoria: 'hidratación' },
  ],
  calma: [
    { asin: 'B003E5EVN8', nombre: 'Set snorkel Cressi Palau', precio: '40-60', categoria: 'snorkel' },
    { asin: 'B07R7H3X5C', nombre: 'Paddle surf hinchable', precio: '350-500', categoria: 'paddle' },
    { asin: 'B009RQUYNS', nombre: 'Kayak hinchable Intex', precio: '150-220', categoria: 'kayak' },
  ],
  surf: [
    { asin: 'B01N1WGRHS', nombre: 'Mochila estanca 30L', precio: '35-55', categoria: 'surf' },
    { asin: 'B0CGW8HBGS', nombre: 'GoPro Hero 12', precio: '350-450', categoria: 'tech' },
    { asin: 'B003U3K1WM', nombre: 'Escarpines neopreno Cressi', precio: '15-25', categoria: 'calzado' },
  ],
  familia: [
    { asin: 'B07KQHQH3X', nombre: 'Carpa playa UPF50', precio: '40-60', categoria: 'sombra' },
    { asin: 'B073RXPZTL', nombre: 'Palas y set playa niños', precio: '15-25', categoria: 'juego' },
    { asin: 'B07VTJBZWY', nombre: 'Nevera portátil Coleman 28L', precio: '50-80', categoria: 'nevera' },
  ],
  arena: [
    { asin: 'B07PYM2YLS', nombre: 'Sombrilla antiviento 200cm', precio: '30-45', categoria: 'sombra' },
    { asin: 'B07YHFK5DY', nombre: 'Toalla microfibra XL', precio: '25-40', categoria: 'toalla' },
    { asin: 'B0014C5O5K', nombre: 'Crocs Classic Clog', precio: '35-55', categoria: 'calzado' },
  ],
  rocosa: [
    { asin: 'B003U3K1WM', nombre: 'Escarpines neopreno Cressi', precio: '15-25', categoria: 'calzado' },
    { asin: 'B003E5EVN8', nombre: 'Set snorkel Cressi Palau', precio: '40-60', categoria: 'snorkel' },
    { asin: 'B003E5GBBQ', nombre: 'Aletas snorkel cortas', precio: '30-50', categoria: 'snorkel' },
  ],
  lectura: [
    { asin: 'B0CFPJYX7P', nombre: 'Kindle Paperwhite', precio: '160-180', categoria: 'lectura' },
    { asin: 'B07HJSL8KL', nombre: 'Manta picnic impermeable XL', precio: '25-40', categoria: 'picnic' },
    { asin: 'B0CTKXG1HW', nombre: 'Altavoz JBL Clip 5 waterproof', precio: '60-80', categoria: 'audio' },
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
