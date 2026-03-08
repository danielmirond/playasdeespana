import type { EstadoBano } from '@/types'

const frases: Record<EstadoBano, string[]> = {
  CALMA:   ['El mar te espera', 'Aguas de piscina. Sin el olor a cloro.', 'Ideal para flotar boca arriba sin pensar en nada.'],
  BUENA:   ['Condiciones ideales', 'Ni demasiado tranquilo ni demasiado emocionante.', 'El punto dulce del verano.'],
  AVISO:   ['Entra con precaución', 'El mar tiene carácter hoy.', 'Buenos días para ver las olas desde la orilla.'],
  PELIGRO: ['No recomendado el baño', 'El mar está de mal humor. Respétalo.', 'Hoy el mar gana. Sin discusión.'],
  SURF:    ['Olas para los valientes', 'Si tienes tabla, hoy es tu día.', 'El Atlántico en su salsa.'],
  VIENTO:  ['Cometas y kitesurf', 'Perfecto si tu deporte favorito necesita viento.', 'Llévate la chaqueta, en serio.'],
}

export function getFrase(estado: EstadoBano, seed = 0): string {
  const lista = frases[estado]
  return lista[seed % lista.length]
}

export function getFrases(estado: EstadoBano): string[] {
  return frases[estado]
}
