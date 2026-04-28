// src/lib/textoQueLlevar.ts
// Generador editorial de la página /playas/[slug]/que-llevar.
//
// Idea: el texto NO es boilerplate. Varía por composición, estado típico,
// ubicación (Mediterráneo/Atlántico/Cantábrico/Canarias), accesibilidad,
// perros, tipo de playa y actividades. Combina párrafos estructurales
// con justificación específica del producto para esa playa concreta.

import type { Playa } from '@/types'
import type { ProductoAmazon } from './amazon-productos'

// ── Detección de zona costera ────────────────────────────────────────
type Zona = 'mediterraneo' | 'atlantico_sur' | 'atlantico_norte' | 'cantabrico' | 'canarias' | 'baleares'

const COMUNIDAD_ZONA: Record<string, Zona> = {
  'Cataluña':           'mediterraneo',
  'Comunidad Valenciana': 'mediterraneo',
  'Murcia':             'mediterraneo',
  'Andalucía':          'mediterraneo',  // por defecto; Cádiz/Huelva se ajustan abajo
  'Galicia':            'atlantico_norte',
  'Asturias':           'cantabrico',
  'Cantabria':          'cantabrico',
  'País Vasco':         'cantabrico',
  'Islas Baleares':     'baleares',
  'Canarias':           'canarias',
  'Islas Canarias':     'canarias',
  'Ceuta':              'mediterraneo',
  'Melilla':            'mediterraneo',
}

function detectZona(playa: Playa): Zona {
  const com = playa.comunidad ?? ''
  // Cádiz y Huelva son atlántico sur, no mediterráneo
  if (com === 'Andalucía' && /cádiz|cadiz|huelva/i.test(playa.provincia ?? '')) return 'atlantico_sur'
  return COMUNIDAD_ZONA[com] ?? 'mediterraneo'
}

const ZONA_FRASE: Record<Zona, string> = {
  mediterraneo:   'mediterránea',
  atlantico_sur:  'del Atlántico sur',
  atlantico_norte:'del Atlántico norte',
  cantabrico:     'cantábrica',
  canarias:       'canaria',
  baleares:       'balear',
}

// ── Razones contextuales por producto/playa ──────────────────────────
function razonProducto(p: ProductoAmazon, playa: Playa): string {
  const comp = (playa.composicion ?? '').toLowerCase()
  const accesible = !!playa.accesible
  const cat = p.categoria.toLowerCase()
  const tipo = (playa.tipo ?? '').toLowerCase()

  // Reglas específicas: priorizan claves visibles
  if (cat === 'calzado' || cat === 'snorkel') {
    if (/roca|grava|piedra/.test(comp)) {
      return 'En esta playa el acceso al agua tiene tramos rocosos. Los escarpines evitan cortes y son cómodos para caminar entre piedras.'
    }
    if (cat === 'snorkel' && /arena/.test(comp)) {
      return 'Aguas suficientemente claras para ver bajo la superficie. El snorkel es habitual en los días de poca ola.'
    }
  }
  if (cat === 'sombra') {
    return 'Sombra natural escasa: lleva sombrilla o carpa, especialmente en los meses de UV alto (mayo-septiembre).'
  }
  if (cat === 'sol') {
    return 'Protección imprescindible: la radiación reflejada en arena+agua multiplica la dosis. SPF50 reaplicado cada 2 h.'
  }
  if (cat === 'tech') {
    if (/familia|niñ|surf|kayak|paddle/.test(p.nombre.toLowerCase())) {
      return 'Para grabar las sesiones o proteger el móvil del agua salada y la arena fina.'
    }
    return 'La sal y la arena fina entran en cualquier puerto USB. Funda estanca o bolsa zip son seguros baratos.'
  }
  if (cat === 'hidratación') {
    if (tipo === 'urbana') {
      return 'Hay servicios cerca, pero el chiringuito en agosto inflará el precio. Termo barato para mantener el agua fresca todo el día.'
    }
    return 'No hay fuentes potables a la vista. Llévate un litro mínimo por persona.'
  }
  if (cat === 'paddle' || cat === 'kayak') {
    return 'Las condiciones de calma habituales aquí permiten salir a remar sin problema. Inflables: caben en el coche desinflados.'
  }
  if (cat === 'nevera') {
    return 'Si vienes desde lejos o piensas pasar el día, una nevera de 25-30 L te ahorra euros y plástico. Hielo se vende en gasolineras y supermercados de la zona.'
  }
  if (cat === 'juego') {
    return 'Si vienes con peques: la arena y la pendiente suave invitan a quedarse horas. Un set básico marca la diferencia.'
  }
  if (cat === 'lectura' || cat === 'audio' || cat === 'picnic') {
    return 'Para los días tranquilos en los que vienes a desconectar más que a meterte al agua.'
  }
  if (cat === 'toalla') {
    return 'La microfibra seca rápido y ocupa la cuarta parte que una toalla normal. Útil si combinas playa con visitas en el mismo día.'
  }
  if (cat === 'surf') {
    return 'Lleva la mochila estanca para meter llaves, móvil y cartera mientras estás dentro. Se ven robos puntuales en aparcamientos abiertos.'
  }

  if (accesible) {
    return 'Esta playa es accesible. Verifica que el producto tenga ruedas anchas o asas si vas a moverlo por arena suelta.'
  }
  return 'Selección habitual para playas similares en composición y servicios disponibles.'
}

// ── Intro contextual ─────────────────────────────────────────────────
export interface ContextoQueLlevar {
  intro:        string
  cuando:       string
  qHacer:       string
  zona:         Zona
}

export function generarTextoQueLlevar(playa: Playa, estado: string): ContextoQueLlevar {
  const zona = detectZona(playa)
  const zonaFrase = ZONA_FRASE[zona]
  const comp = (playa.composicion ?? 'Arena').toLowerCase()
  const tipo = (playa.tipo ?? '').toLowerCase()
  const np = playa.nombre

  // Intro: 2-3 frases con datos concretos
  const partsIntro: string[] = []
  partsIntro.push(`${np} es una playa ${zonaFrase} de ${comp}, situada en ${playa.municipio} (${playa.provincia}).`)

  if (/roca|grava|piedra/.test(comp)) {
    partsIntro.push('La composición rocosa cambia lo que hay que llevar respecto a una playa de arena: calzado de neopreno y precaución al entrar al agua marcan la diferencia.')
  } else if (tipo === 'urbana') {
    partsIntro.push('Al estar en zona urbana hay servicios cerca, pero los precios en temporada alta suben rápido. Llevarse lo básico evita gastos innecesarios.')
  } else {
    partsIntro.push('Sin chiringuitos a la vista en buena parte del año, lo recomendable es venir autosuficiente: agua, sombra y comida para el día.')
  }

  if (estado === 'VIENTO' || estado === 'SURF') {
    partsIntro.push('El viento suele ser el factor que decide la jornada aquí. Sombrilla con anclaje y no salir sin protección térmica si te metes al agua mucho rato.')
  } else if (estado === 'CALMA' || estado === 'BUENA') {
    partsIntro.push('Las condiciones habituales son calmadas, ideales para un día relajado o para quien quiera meter la cabeza con gafas y tubo.')
  }

  // Cuándo ir y qué esperar
  let cuando = ''
  if (zona === 'mediterraneo' || zona === 'baleares' || zona === 'canarias') {
    cuando = 'La temporada alta va de junio a septiembre. Los meses de junio y septiembre tienen el agua templada con menos masificación que julio-agosto. Ir temprano (antes de las 11 h) o al atardecer evita el pico de UV y de gente.'
  } else if (zona === 'atlantico_sur') {
    cuando = 'En el Atlántico sur la temporada se alarga: el agua aguanta templada hasta octubre y las temperaturas son agradables casi todo el año. Las mareas marcan mucho la experiencia, así que conviene mirar la tabla antes de venir.'
  } else {
    cuando = 'Las playas del norte tienen un agua fresca todo el año y las condiciones cambian rápido. La mejor ventana suele ser de junio a septiembre, con neopreno corto recomendable fuera de julio y agosto.'
  }

  // Qué hacer
  const acts: string[] = []
  if (playa.actividades?.surf)     acts.push('hacer surf cuando entran olas del oeste')
  if (playa.actividades?.windsurf) acts.push('windsurf en los días de poniente')
  if (playa.actividades?.kite)     acts.push('kitesurf')
  if (playa.actividades?.snorkel)  acts.push('snorkel en las zonas más resguardadas')
  if (playa.actividades?.buceo)    acts.push('buceo recreativo cerca, con centros homologados')
  if (playa.actividades?.kayak || playa.actividades?.paddle) acts.push('paddle surf y kayak los días de calma')

  let qHacer = ''
  if (acts.length === 0) {
    qHacer = `${np} es una playa para venir a desconectar. Lo habitual es bañarse, leer y comer. Si quieres más actividad, hay opciones cerca en el mismo municipio.`
  } else {
    qHacer = `Aquí se puede ${acts.slice(0, -1).join(', ')}${acts.length > 1 ? ' y ' : ''}${acts[acts.length - 1]}. Las condiciones de cada actividad varían según el día — consulta el estado del mar antes de venir.`
  }
  if (playa.perros) qHacer += ' Es una playa que admite perros (consulta horarios estacionales en el ayuntamiento).'
  if (playa.accesible) qHacer += ' Está catalogada como accesible: hay rampas o pasarelas para personas con movilidad reducida.'

  return {
    intro: partsIntro.join(' '),
    cuando,
    qHacer,
    zona,
  }
}

// ── Producto + razón contextual (para la lista) ──────────────────────
export interface ProductoContextual extends ProductoAmazon {
  razon: string
}

export function productosConRazon(productos: ProductoAmazon[], playa: Playa): ProductoContextual[] {
  return productos.map(p => ({ ...p, razon: razonProducto(p, playa) }))
}
