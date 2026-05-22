// src/lib/asistentePlaya.ts
//
// Asistente inteligente "qué necesitas hoy para esta playa". Combina
// tres capas en orden:
//
//   1. REGLAS deterministas (siempre activas, garantizan seguridad)
//      Bandera roja → NUNCA recomendar paddle/colchoneta.
//      Playa de roca → escarpines top-1.
//      Medusas alto → vinagre + after-bite.
//      UV ≥ 8 → SPF50+ obligatorio.
//      etc.
//
//   2. IA opcional (Claude) — enriquece la lista con matiz local
//      (Mediterráneo vs Atlántico vs Canarias), reescribe los
//      "porQue" para que suenen a recomendación de amigo, no robot.
//      Si NO hay ANTHROPIC_API_KEY → se salta limpiamente, las
//      reglas funcionan solas.
//
//   3. CACHE en KV (24h positivo, 1h negativo). Clave =
//      slug + conditions_bucket. Las condiciones se "bucketizan" para
//      maximizar reuso (no creamos una cache por cada km/h de viento).
//
// La salida es una lista de Necesidad[], no de productos concretos.
// La capa de afiliación (Amazon Creators API) toma la necesidad y
// busca el mejor producto real. Así la IA NUNCA inventa marcas.

import type { Playa } from '@/types'
import type { BanderaPlaya, MedusasRiesgo } from './seguridad'
import { fetchWithTimeout } from './fetch-timeout'

/** Una necesidad detectada. NO menciona marcas concretas: solo qué
 *  cosa hace falta y por qué. La integración Amazon convierte
 *  cada necesidad en producto real. */
export interface Necesidad {
  /** id estable para tracking de conversión. Ej: 'escarpines' */
  id:        string
  /** Título corto. Ej: 'Escarpines de neopreno' */
  titulo:    string
  /** 1 frase explicando POR QUÉ en este contexto concreto. */
  porQue:    string
  /** Importancia. Las críticas siempre se renderizan; las bajas se
   *  ocultan si hay más de 5. */
  prioridad: 'critica' | 'alta' | 'media' | 'baja'
  /** Query Amazon para fallback (search) o categoría Creators API. */
  amazonQuery: string
  /** Si tenemos un ASIN concreto del catálogo estático, ya viene
   *  emparejado. Si no, el componente cae a search. */
  asin?:     string
  /** Icono opcional (emoji) para visual rápido en mobile. */
  icono?:    string
}

export interface ContextoAsistente {
  playa:      Playa
  meteo: {
    agua:        number
    olas:        number
    viento:      number
    vientoRacha: number
    uv?:         number | null
    tempAire?:   number
  }
  bandera?:   BanderaPlaya | null
  medusas?:   MedusasRiesgo | null
  estado:     string
}

// ── Constantes catálogo ──────────────────────────────────────────────

/** ASINs por necesidad. Se enlaza al producto concreto cuando existe
 *  en el catálogo estático (src/lib/amazon-productos.ts). Si la
 *  Creators API está activa, este ASIN se enriquece con datos vivos.
 *  Si no hay ASIN, el frontend hace búsqueda con `amazonQuery`. */
const ASIN_POR_ID: Record<string, string> = {
  'spf50':             'B00WG29EH8',  // Protector solar SPF50
  'movil-impermeable': 'B07HHMC55Z',  // Funda móvil estanca
  'escarpines':        'B003U3K1WM',  // Escarpines Cressi
  'sombrilla-viento':  'B07PYM2YLS',  // Sombrilla antiviento
  'set-snorkel':       'B003E5EVN8',  // Set Cressi Palau
  'nevera-portatil':   'B07VTJBZWY',  // Nevera Coleman 28L
  'toalla-microfibra': 'B07YHFK5DY',  // Toalla microfibra XL
  'botella-termo':     'B0BLM5R5JN',  // Botella térmica 1L
  'palas-ninos':       'B073RXPZTL',  // Set palas niños
  'carpa-playa':       'B07KQHQH3X',  // Carpa playa UPF50
  'paddle-surf':       'B07R7H3X5C',  // Paddle hinchable
  'kayak':             'B009RQUYNS',  // Kayak Intex
  'gopro':             'B0CGW8HBGS',  // GoPro Hero 12
  'kindle':            'B0CFPJYX7P',  // Kindle Paperwhite
  'altavoz-jbl':       'B0CTKXG1HW',  // JBL Clip 5
  'manta-picnic':      'B07HJSL8KL',  // Manta picnic XL
  'aletas-snorkel':    'B003E5GBBQ',  // Aletas cortas
  'crocs':             'B0014C5O5K',  // Crocs Classic
}

// ── Reglas deterministas ─────────────────────────────────────────────

/** Genera necesidades a partir del contexto, aplicando reglas
 *  hardcoded de seguridad + utilidad. Determinista: mismo input →
 *  mismo output. Sin IA aquí — es el suelo de garantías. */
function necesidadesPorReglas(ctx: ContextoAsistente): Necesidad[] {
  const out: Necesidad[] = []
  const { playa, meteo, bandera, medusas } = ctx
  const composicion = (playa.composicion ?? '').toLowerCase()
  const acts = playa.actividades ?? {}
  const uv = meteo.uv ?? 0
  const viento = meteo.viento ?? 0
  const olas = meteo.olas ?? 0
  const agua = meteo.agua ?? 18

  // ── SEGURIDAD (priorita 'critica' siempre arriba) ──
  if (bandera?.color === 'roja') {
    out.push({
      id:          'movil-impermeable',
      titulo:      'Funda móvil estanca',
      porQue:      'Bandera roja hoy: no te metas en el mar. Lleva el móvil estanco con el 112 a mano por si acaso.',
      prioridad:   'critica',
      amazonQuery: 'funda movil estanca playa',
      asin:        ASIN_POR_ID['movil-impermeable'],
      icono:       '🚨',
    })
  }

  if (uv >= 8) {
    out.push({
      id:          'spf50',
      titulo:      'Protector solar SPF50+',
      porQue:      `Índice UV de ${uv} (extremo). Sin SPF50 resistente al agua, quemadura en 15 minutos.`,
      prioridad:   'critica',
      amazonQuery: 'protector solar SPF50 resistente agua',
      asin:        ASIN_POR_ID['spf50'],
      icono:       '☀️',
    })
  } else if (uv >= 6) {
    out.push({
      id:          'spf50',
      titulo:      'Protector solar SPF50',
      porQue:      `UV de ${uv}: usa SPF50, no menos. Reaplica cada 2 h en agua.`,
      prioridad:   'alta',
      amazonQuery: 'protector solar SPF50 resistente agua',
      asin:        ASIN_POR_ID['spf50'],
      icono:       '☀️',
    })
  }

  if (medusas?.nivel === 'alto') {
    out.push({
      id:          'after-bite-medusas',
      titulo:      'Vinagre + crema after-bite',
      porQue:      'Riesgo alto de medusas hoy. El vinagre neutraliza la picadura mejor que el agua dulce.',
      prioridad:   'alta',
      amazonQuery: 'after bite medusas vinagre',
      icono:       '🪼',
    })
  }

  // ── COMPOSICIÓN DEL SUELO ──
  if (composicion.includes('roca') || composicion.includes('grava')) {
    out.push({
      id:          'escarpines',
      titulo:      'Escarpines de neopreno',
      porQue:      composicion.includes('roca')
        ? 'Playa rocosa: los escarpines protegen de erizos y rocas resbaladizas al entrar al agua.'
        : 'Playa de guijarros: los pies te lo agradecerán al andar y entrar al mar.',
      prioridad:   'alta',
      amazonQuery: 'escarpines neopreno adulto',
      asin:        ASIN_POR_ID['escarpines'],
      icono:       '🦶',
    })
  }

  // ── VIENTO ──
  if (viento >= 25) {
    out.push({
      id:          'sombrilla-viento',
      titulo:      'Sombrilla con anclaje de viento',
      porQue:      `Viento de ${viento} km/h: una sombrilla normal sale volando. Llévala con tornillo de arena o no la abras.`,
      prioridad:   'media',
      amazonQuery: 'sombrilla anclaje viento tornillo',
      asin:        ASIN_POR_ID['sombrilla-viento'],
      icono:       '💨',
    })
  }

  // ── ACTIVIDADES VIABLES ──
  if (olas < 0.5 && bandera?.color !== 'roja') {
    if (acts.snorkel) {
      out.push({
        id:          'set-snorkel',
        titulo:      'Set de snorkel',
        porQue:      `Mar en calma (${olas.toFixed(1)} m) y agua a ${agua}°C: hoy es día perfecto para ver fondos.`,
        prioridad:   'media',
        amazonQuery: 'set snorkel adultos cressi',
        asin:        ASIN_POR_ID['set-snorkel'],
        icono:       '🤿',
      })
    }
    if (acts.paddle) {
      out.push({
        id:          'paddle-surf',
        titulo:      'Tabla de paddle surf hinchable',
        porQue:      `Sin oleaje y poco viento (${viento} km/h): condiciones ideales para paddle.`,
        prioridad:   'media',
        amazonQuery: 'paddle surf hinchable adulto',
        asin:        ASIN_POR_ID['paddle-surf'],
        icono:       '🏄',
      })
    }
  }

  // Surf — solo si la playa es de surf Y hay olas, pero no excesivas
  if (acts.surf && olas >= 0.7 && olas <= 2.0 && bandera?.color !== 'roja') {
    out.push({
      id:          'gopro',
      titulo:      'GoPro o cámara acuática',
      porQue:      `Olas de ${olas.toFixed(1)} m y bandera ${bandera?.color ?? 'sin avisos'}: graba la jornada de surf desde el agua.`,
      prioridad:   'baja',
      amazonQuery: 'camara acuatica deportiva',
      asin:        ASIN_POR_ID['gopro'],
      icono:       '🎥',
    })
  }

  // ── FAMILIA / NIÑOS (basado en servicios) ──
  if (playa.socorrismo && playa.duchas && olas < 1.0) {
    out.push({
      id:          'palas-ninos',
      titulo:      'Set de palas y juegos de playa',
      porQue:      'Playa con socorrismo, duchas y mar tranquilo: condiciones óptimas para venir con niños.',
      prioridad:   'baja',
      amazonQuery: 'palas playa niños cubo',
      asin:        ASIN_POR_ID['palas-ninos'],
      icono:       '🪣',
    })
  }

  // ── BÁSICOS UNIVERSALES (si la lista está corta) ──
  if (out.length < 3) {
    out.push({
      id:          'toalla-microfibra',
      titulo:      'Toalla de microfibra XL',
      porQue:      'Pesa la mitad y se seca en 10 min. La toalla normal multiplicada por 3 al volver mojada.',
      prioridad:   'baja',
      amazonQuery: 'toalla microfibra playa XL',
      asin:        ASIN_POR_ID['toalla-microfibra'],
      icono:       '🏖️',
    })
  }
  if (out.length < 4 && agua >= 22) {
    out.push({
      id:          'botella-termo',
      titulo:      'Botella térmica',
      porQue:      `Agua del mar a ${agua}°C: el calor pega. Lleva 1 L de agua fría que aguante la jornada.`,
      prioridad:   'baja',
      amazonQuery: 'botella termica 1L acero',
      asin:        ASIN_POR_ID['botella-termo'],
      icono:       '💧',
    })
  }

  // ── Sort por prioridad y limit ──
  const orden = { critica: 0, alta: 1, media: 2, baja: 3 }
  out.sort((a, b) => orden[a.prioridad] - orden[b.prioridad])

  // Dedup por id (la familia y los snorkel pueden colisionar)
  const vistos = new Set<string>()
  const dedup: Necesidad[] = []
  for (const n of out) {
    if (vistos.has(n.id)) continue
    vistos.add(n.id)
    dedup.push(n)
    if (dedup.length >= 5) break
  }
  return dedup
}

// ── Reglas de SEGURIDAD que filtran la salida IA ──

/** Bloquea recomendaciones peligrosas independientemente de qué diga
 *  la IA. Esto es defensa en profundidad: la IA NO debería recomendar
 *  paddle con bandera roja, pero si lo hiciera, esto lo borra. */
function filtroSeguridad(ctx: ContextoAsistente, lista: Necesidad[]): Necesidad[] {
  const peligrosasConBanderaRoja = new Set([
    'paddle-surf', 'kayak', 'colchoneta', 'flotador', 'set-snorkel',
    'aletas-snorkel', 'gopro',
  ])
  if (ctx.bandera?.color === 'roja') {
    return lista.filter(n => !peligrosasConBanderaRoja.has(n.id))
  }
  return lista
}

// ── Bucket de condiciones para cache key ─────────────────────────────

/** Convierte condiciones continuas en buckets discretos para
 *  maximizar reuso de cache. Ej: viento 18 y viento 22 caen en
 *  el mismo bucket "20", así no creamos 2 cache entries. */
function conditionsBucket(ctx: ContextoAsistente): string {
  const m = ctx.meteo
  const olas = m.olas == null ? '0' :
    m.olas < 0.5 ? '0' :
    m.olas < 1.0 ? '1' :
    m.olas < 2.0 ? '2' : '3'
  const viento = m.viento == null ? '0' :
    m.viento < 15 ? '0' :
    m.viento < 25 ? '1' :
    m.viento < 40 ? '2' : '3'
  const uv = (m.uv ?? 0) < 5 ? '0' : (m.uv ?? 0) < 8 ? '1' : '2'
  const bandera = ctx.bandera?.color?.[0] ?? '-'
  const medusas = ctx.medusas?.nivel?.[0] ?? '-'
  return `o${olas}v${viento}u${uv}b${bandera}m${medusas}`
}

// ── KV cache ────────────────────────────────────────────────────────

async function kvGet<T>(key: string): Promise<T | null> {
  try {
    const mod = await import('@vercel/kv')
    return await mod.kv.get<T>(key)
  } catch { return null }
}

async function kvSet(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  try {
    const mod = await import('@vercel/kv')
    await mod.kv.set(key, value, { ex: ttlSeconds })
  } catch { /* sin KV: cero impacto, simplemente no se persiste */ }
}

const TTL_POSITIVO_S = 24 * 3600
const TTL_NEGATIVO_S = 1 * 3600

interface CacheEntry {
  ts: number
  v:  Necesidad[]
}

// ── IA enriquecimiento (opcional) ────────────────────────────────────

const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY ?? ''

/** Si hay API key, llama a Claude Haiku para enriquecer la lista
 *  generada por reglas: reescribe `porQue` más natural y añade 1-2
 *  necesidades que aporten matiz local. Si la IA falla → devuelve
 *  la lista original sin tocar. NUNCA introduce marcas: solo
 *  necesidades genéricas. */
async function enriquecerConIA(
  ctx: ContextoAsistente,
  base: Necesidad[],
): Promise<Necesidad[]> {
  if (!ANTHROPIC_KEY) return base
  // Stub conservador: devolvemos `base` tal cual hasta que tengas
  // ANTHROPIC_API_KEY configurada y validemos el prompt en una
  // iteración futura. Ya el rules engine es valioso por sí solo.
  //
  // Cuando actives la IA, este es el prompt esqueleto:
  //
  //   const prompt = `Eres asistente de playas español. Esta es
  //   ${ctx.playa.nombre} en ${ctx.playa.municipio} (${ctx.playa.provincia}).
  //   Composición: ${ctx.playa.composicion}. Ahora mismo: oleaje ${ctx.meteo.olas}m,
  //   viento ${ctx.meteo.viento} km/h, agua ${ctx.meteo.agua}°C, UV ${ctx.meteo.uv ?? 'n/a'},
  //   bandera ${ctx.bandera?.color ?? 'sin avisos'}, medusas ${ctx.medusas?.nivel ?? 'bajo'}.
  //
  //   He generado estas necesidades con reglas: ${JSON.stringify(base)}.
  //
  //   1. Reescribe cada "porQue" como si fueras un amigo local explicándolo
  //      a un visitante (1 frase, natural, sin tópicos).
  //   2. Añade 1-2 necesidades extra si crees que faltan en este contexto
  //      LOCAL (Mediterráneo, Atlántico, Canarias, Cantábrico tienen
  //      contextos distintos).
  //   3. Devuelve JSON con el mismo shape: { id, titulo, porQue, prioridad,
  //      amazonQuery }. NO menciones marcas. NO inventes ASIN.
  //
  //   Devuelve SOLO JSON, sin texto extra.`
  //
  //   const res = await fetchWithTimeout('https://api.anthropic.com/v1/messages', {
  //     method:  'POST',
  //     headers: { 'x-api-key': ANTHROPIC_KEY, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' },
  //     body:    JSON.stringify({
  //       model:      'claude-haiku-4-5',
  //       max_tokens: 1500,
  //       system:     'Eres un asistente de playas. Responde solo con JSON válido.',
  //       messages:   [{ role: 'user', content: prompt }],
  //     }),
  //   }, 8000)
  //   ... parse + merge + filtroSeguridad
  return base
}

// ── Orquestador público ──────────────────────────────────────────────

/** API pública. Devuelve las 5 necesidades para esta playa+condiciones,
 *  pasando por cache KV, IA opcional y filtro de seguridad. */
export async function getNecesidades(ctx: ContextoAsistente): Promise<Necesidad[]> {
  const cacheKey = `asistente:${ctx.playa.slug}:${conditionsBucket(ctx)}`
  const cached = await kvGet<CacheEntry>(cacheKey)
  if (cached) {
    const ageS = (Date.now() - cached.ts) / 1000
    if (ageS < TTL_POSITIVO_S) return cached.v
  }

  let lista = necesidadesPorReglas(ctx)
  lista = await enriquecerConIA(ctx, lista)
  lista = filtroSeguridad(ctx, lista)

  await kvSet(cacheKey, { ts: Date.now(), v: lista } satisfies CacheEntry,
    lista.length > 0 ? TTL_POSITIVO_S : TTL_NEGATIVO_S)

  return lista
}

/** Sync convenience para componentes server que no quieren hacer await
 *  (ej. SSR críticos). NO consulta KV ni IA. Útil como fallback. */
export function getNecesidadesSync(ctx: ContextoAsistente): Necesidad[] {
  return filtroSeguridad(ctx, necesidadesPorReglas(ctx))
}
