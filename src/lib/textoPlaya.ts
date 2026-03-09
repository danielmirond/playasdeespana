// src/lib/textoPlaya.ts
// Genera un texto SEO único de ~150 palabras por playa en segunda persona
import type { Playa } from '@/types'

const ZONA_CLIMA: Record<string, string> = {
  'Andalucía':       'el sur de España, con veranos muy calurosos y agua cálida',
  'Cataluña':        'el nordeste mediterráneo, con aguas cristalinas y tramontana ocasional',
  'C. Valenciana':   'el Mediterráneo valenciano, con más de 300 días de sol al año',
  'Baleares':        'las islas Baleares, con calas de agua turquesa y fondo rocoso',
  'Canarias':        'las Islas Canarias, donde puedes bañarte prácticamente todo el año',
  'Galicia':         'el Atlántico gallego, con olas potentes y agua fría pero espectacular',
  'Asturias':        'la costa asturiana, con acantilados verdes y aguas atlánticas',
  'Cantabria':       'el Cantábrico, con playas salvajes rodeadas de naturaleza',
  'País Vasco':      'el País Vasco, donde el mar y la gastronomía se dan la mano',
  'Murcia':          'el Mar Menor y el Mediterráneo murciano, con aguas tranquilas',
}

const COMPOSICION: Record<string, string> = {
  'arena':          'arena fina',
  'arena gruesa':   'arena gruesa y dorada',
  'arena dorada':   'arena dorada',
  'arena blanca':   'arena blanca',
  'arena negra':    'arena volcánica negra',
  'grava':          'guijarros y piedras pequeñas',
  'roca':           'roca y charcos naturales',
  'mixta':          'arena y grava mezclada',
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

// Determinista basado en el slug para que no cambie en cada render
function deterministicPick<T>(arr: T[], seed: string): T {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) & 0xffffffff
  return arr[Math.abs(hash) % arr.length]
}

export function generarTextoPlaya(playa: Playa): string {
  const {
    nombre, municipio, provincia, comunidad, slug,
    longitud, anchura, composicion, tipo,
    bandera, socorrismo, accesible, perros, duchas, parking, nudista,
    actividades,
  } = playa

  const zona     = ZONA_CLIMA[comunidad] ?? `la costa de ${provincia}`
  const arena    = composicion ? (COMPOSICION[composicion.toLowerCase()] ?? composicion) : 'arena'
  const esUrbana = tipo?.toLowerCase().includes('urban') ?? false
  const actsArr  = Object.entries(actividades ?? {}).filter(([,v]) => v).map(([k]) => k)
  const seed     = slug

  // Intro variada
  const intros = [
    `Si tienes pensado visitar ${nombre}, estás eligiendo una de las playas más ${bandera ? 'reconocidas' : 'auténticas'} de ${provincia}.`,
    `${nombre} es una de esas playas de ${provincia} que merece la pena tener en tu lista antes de este verano.`,
    `Cuando llegues a ${nombre}, en ${municipio}, entenderás por qué esta playa tiene tanta fama en ${provincia}.`,
    `¿Estás buscando una buena playa en ${municipio}? ${nombre} es una apuesta segura en el corazón de ${provincia}.`,
  ]
  const intro = deterministicPick(intros, seed + '1')

  // Descripción física
  const fisicas: string[] = []
  if (longitud) fisicas.push(`Tiene unos ${longitud} metros de longitud`)
  if (anchura)  fisicas.push(`${anchura} metros de anchura`)
  const fisicaStr = fisicas.length
    ? `${fisicas.join(' y ')}, con ${arena} y aguas propias de ${zona}.`
    : `Está situada en ${zona}, con ${arena} y un entorno que no te va a decepcionar.`

  // Servicios
  const servicios: string[] = []
  if (socorrismo) servicios.push('socorrismo')
  if (duchas)     servicios.push('duchas')
  if (parking)    servicios.push('aparcamiento cercano')
  if (accesible)  servicios.push('acceso adaptado')

  const servicioStr = servicios.length >= 2
    ? `Cuenta con ${servicios.slice(0, -1).join(', ')} y ${servicios[servicios.length - 1]}, así que puedes ir con tranquilidad.`
    : servicios.length === 1
    ? `Dispone de ${servicios[0]} para que tu visita sea más cómoda.`
    : `Es una playa más natural, sin grandes infraestructuras, perfecta si buscas algo más tranquilo y auténtico.`

  // Actividades
  let actividadStr = ''
  if (actsArr.length > 0) {
    const nombresActs: Record<string, string> = {
      surf: 'surf', windsurf: 'windsurf', kite: 'kitesurf',
      snorkel: 'snorkel', buceo: 'buceo', kayak: 'kayak', paddle: 'paddle surf',
    }
    const actsEsp = actsArr.map(a => nombresActs[a] ?? a)
    actividadStr = actsEsp.length === 1
      ? `Si te gusta el ${actsEsp[0]}, estás en el sitio adecuado.`
      : `Para los amantes del deporte acuático, aquí puedes practicar ${actsEsp.slice(0, -1).join(', ')} y ${actsEsp[actsEsp.length - 1]}.`
  }

  // Bandera azul
  const banderaStr = bandera
    ? `La bandera azul que luce ${nombre} es garantía de calidad del agua y gestión responsable del entorno.`
    : ''

  // Perros / nudista
  let extraStr = ''
  if (nudista) {
    extraStr = `Es una playa nudista, así que si buscas un ambiente libre y sin restricciones, aquí lo encontrarás.`
  } else if (perros) {
    extraStr = `Si vas con tu perro, estás de suerte — en ${nombre} está permitido, algo cada vez más difícil de encontrar en la costa española.`
  } else if (perros === false) {
    extraStr = `Ten en cuenta que no se permiten perros en esta playa, especialmente en temporada alta.`
  }

  // Cierre con intención
  const cierres = [
    `Antes de salir, consulta el estado del mar en tiempo real desde esta misma página para no llevarte ninguna sorpresa.`,
    `Revisa la temperatura del agua, el oleaje y la afluencia antes de ir — todo lo tienes actualizado aquí en tiempo real.`,
    `Usa esta página para ver cómo está el mar hoy, la afluencia esperada y cómo llegar sin complicaciones.`,
  ]
  const cierre = deterministicPick(cierres, seed + '2')

  return [intro, fisicaStr, servicioStr, actividadStr, banderaStr, extraStr, cierre]
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}


const ZONA_CLIMA_EN: Record<string, string> = {
  'Andalucía':     'southern Spain, with very hot summers and warm water',
  'Cataluña':      'the northeast Mediterranean, with crystal-clear waters and occasional tramontane wind',
  'C. Valenciana': 'the Valencian Mediterranean, with over 300 sunny days a year',
  'Baleares':      'the Balearic Islands, with turquoise coves and rocky seabeds',
  'Canarias':      'the Canary Islands, where you can swim almost all year round',
  'Galicia':       'the Atlantic coast of Galicia, with powerful waves and cold but spectacular water',
  'Asturias':      'the Asturian coast, with green cliffs and Atlantic waters',
  'Cantabria':     'the Cantabrian Sea, with wild beaches surrounded by nature',
  'País Vasco':    'the Basque Country, where the sea and gastronomy go hand in hand',
  'Murcia':        'the Mar Menor and the Murcian Mediterranean, with calm waters',
}

const COMPOSICION_EN: Record<string, string> = {
  'arena':        'fine sand',
  'arena gruesa': 'coarse golden sand',
  'arena dorada': 'golden sand',
  'arena blanca': 'white sand',
  'arena negra':  'black volcanic sand',
  'grava':        'pebbles and small stones',
  'roca':         'rock and natural pools',
  'mixta':        'mixed sand and gravel',
}

export function generarTextoPlayaEn(playa: Playa): string {
  const { nombre, municipio, provincia, comunidad, slug, longitud, anchura, composicion, bandera, socorrismo, accesible, perros, duchas, parking, nudista, actividades } = playa
  const zona  = ZONA_CLIMA_EN[comunidad] ?? `the coast of ${provincia}`
  const arena = composicion ? (COMPOSICION_EN[composicion.toLowerCase()] ?? composicion) : 'sand'
  const actsArr = Object.entries(actividades ?? {}).filter(([,v]) => v).map(([k]) => k)
  const seed  = slug

  const intros = [
    `If you're planning to visit ${nombre}, you're choosing one of the most ${bandera ? 'acclaimed' : 'authentic'} beaches in ${provincia}.`,
    `${nombre} is one of those beaches in ${provincia} that deserves a spot on your list this summer.`,
    `When you arrive at ${nombre}, in ${municipio}, you'll understand why this beach is so popular in ${provincia}.`,
    `Looking for a great beach in ${municipio}? ${nombre} is a safe bet in the heart of ${provincia}.`,
  ]
  const intro = deterministicPick(intros, seed + '1')

  const fisicas: string[] = []
  if (longitud) fisicas.push(`It stretches ${longitud} metres in length`)
  if (anchura)  fisicas.push(`${anchura} metres wide`)
  const fisicaStr = fisicas.length
    ? `${fisicas.join(' and ')}, with ${arena} and waters typical of ${zona}.`
    : `Located in ${zona}, with ${arena} and surroundings that won't disappoint.`

  const servicios: string[] = []
  if (socorrismo) servicios.push('lifeguard service')
  if (duchas)     servicios.push('showers')
  if (parking)    servicios.push('nearby parking')
  if (accesible)  servicios.push('accessible facilities')

  const servicioStr = servicios.length >= 2
    ? `It has ${servicios.slice(0, -1).join(', ')} and ${servicios[servicios.length - 1]}, so you can visit with peace of mind.`
    : servicios.length === 1
    ? `It has ${servicios[0]} to make your visit more comfortable.`
    : `It's a more natural beach, without major facilities — perfect if you're looking for something quieter and more unspoiled.`

  let actividadStr = ''
  if (actsArr.length > 0) {
    const nombresActs: Record<string, string> = { surf:'surfing', windsurf:'windsurfing', kite:'kitesurfing', snorkel:'snorkelling', buceo:'scuba diving', kayak:'kayaking', paddle:'paddleboarding' }
    const actsEn = actsArr.map(a => nombresActs[a] ?? a)
    actividadStr = actsEn.length === 1
      ? `If you enjoy ${actsEn[0]}, you're in the right place.`
      : `For water sports enthusiasts, you can practise ${actsEn.slice(0, -1).join(', ')} and ${actsEn[actsEn.length - 1]} here.`
  }

  const banderaStr = bandera ? `The Blue Flag at ${nombre} is a guarantee of water quality and responsible environmental management.` : ''

  let extraStr = ''
  if (nudista) {
    extraStr = `This is a naturist beach, so if you're looking for a free and unrestricted atmosphere, you'll find it here.`
  } else if (perros) {
    extraStr = `If you're bringing your dog, you're in luck — dogs are allowed at ${nombre}, which is increasingly rare on the Spanish coast.`
  } else if (perros === false) {
    extraStr = `Please note that dogs are not allowed on this beach, especially during the high season.`
  }

  const cierres = [
    `Before you head out, check the real-time sea conditions on this page so there are no surprises.`,
    `Check the water temperature, wave height and crowd levels before you go — everything is updated here in real time.`,
    `Use this page to see current sea conditions, expected crowds and how to get there without any hassle.`,
  ]
  const cierre = deterministicPick(cierres, seed + '2')

  return [intro, fisicaStr, servicioStr, actividadStr, banderaStr, extraStr, cierre].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim()
}
