// src/lib/fotos.ts — Fotos de playas con matching preciso playa↔ubicación
// Estrategia en cascada (de más preciso a más genérico):
//   1. Wikimedia Commons: geosearch por coordenadas (radio 700m) — sin key
//   2. Wikipedia ES: lead-image del artículo (pageimage canónico) — sin key
//   3. OpenVerse: agregador CC (Wikimedia + Flickr + más) por nombre+municipio — sin key
//   4. Flickr: feed público con tags (nombre+municipio+beach) — sin key
//   5. Wikimedia Commons: text search con nombre + municipio — sin key
//   6. Pexels: búsqueda con nombre + municipio (requiere PEXELS_API_KEY)
//   7. Unsplash: búsqueda con nombre + municipio (requiere UNSPLASH_ACCESS_KEY)
import { fetchWithTimeout } from './fetch-timeout'
import { IS_BUILD } from './buildGuard'
// Fotos pre-resueltas offline por scripts/enrich-playas-images.mjs (misma
// cascada, pero ejecutada una vez con timeouts largos y User-Agent → sin
// rate limit ni dependencia de KV). Mapa slug → FotoPlaya[]. Si una playa
// está aquí, getFotos la sirve al instante sin red. Si no, cae a la cascada.
// Carga lazy con dynamic import (mismo patrón que getPlayas con playas.json):
// el JSON crece con la cola larga (~MBs) y no debe inflar el bundle estático.
let _sidecar: Record<string, FotoPlaya[]> | null | undefined
async function getSidecar(): Promise<Record<string, FotoPlaya[]> | null> {
  if (_sidecar !== undefined) return _sidecar
  try {
    const { default: data } = await import('@/../public/data/playas-images.json', {
      assert: { type: 'json' },
    })
    _sidecar = data as unknown as Record<string, FotoPlaya[]>
  } catch {
    _sidecar = null
  }
  return _sidecar
}

const UNSPLASH_KEY = process.env.UNSPLASH_ACCESS_KEY ?? ''
const PEXELS_KEY   = process.env.PEXELS_API_KEY ?? ''

export interface FotoPlaya {
  url:    string
  thumb:  string
  fuente: 'unsplash' | 'wikimedia' | 'flickr' | 'openverse' | 'pexels'
  autor?: string
}

// Palabras negativas que descartamos de títulos / nombres de archivo.
// Cubre: cartografía y símbolos; arquitectura urbana y religiosa;
// vehículos, militar, eventos deportivos no costeros; industria;
// otros falsos positivos que el filtro original dejaba pasar (Melilla
// con tanques de 'arena' del desierto, Castro-Urdiales con iglesia,
// Mapillary street-view en El Chorrillo, etc.).
const NEGATIVAS = new RegExp(
  '\\b(' +
  // Cartografía y símbolos
  'map|mapa|plan(o|os)?|logo|flag|bandera|diagram|diagrama|' +
  'coat|escudo|sign|placa|coordinate|rotulo|icon|chart|grafic|' +
  // Arquitectura religiosa
  'iglesia|church|ermita|capilla|basilica|catedral|cathedral|' +
  'convento|monasterio|monastery|abadia|abbey|santuario|' +
  // Arquitectura civil / monumentos / culturales
  'monumento|monument|estatua|statue|busto|bust|escultura|sculpture|' +
  'museo|museum|ayuntamiento|edificio|building|fachada|facade|' +
  'castillo|castle|fortaleza|fortress|alcazaba|alcazar|tower|' +
  'cementerio|cemetery|tumba|tomb|necropolis|' +
  // Captura urbana y vehículos
  'street(view)?|streetview|mapillary|panoramio|driving|coche|car|' +
  'vehiculo|vehicle|camion|truck|bus|train|aerial|drone|' +
  // Interiores y detalles arquitectónicos
  'interior(_de)?|fachada|' +
  // Militar / vehículos pesados
  'tanque|tank|militar|military|ejercito|army|guerra|war|soldado|soldier|' +
  'arma|weapon|cuartel|barracks|maniobra|training_exercise|' +
  // Eventos deportivos no costeros
  'motocross|motorbike|motorcycle|motocicleta|moto_|enduro|' +
  'carrera|race|racing|carreras|competicion|maraton|marathon|' +
  'futbol|football|baloncesto|basketball|tenis|tennis|golf|' +
  // Conciertos / festivales / fiestas
  'concierto|concert|festival|fiesta|party|disco|nightclub|' +
  // Industrial / no recreativo
  'fabrica|factory|industrial|silo|chimenea|chimney|grua|crane|' +
  // Personas en primer plano (queremos paisaje, no retratos)
  'retrato|portrait|selfie|autorretrato|self_portrait|posing|posando|' +
  'modelo|model|models|modelos|modeling|fashion|moda|' +
  'family|familia|wedding|boda|novio|novia|bride|groom|' +
  'niño|niños|nina|ninas|kid|kids|child|children|baby|bebe|toddler|' +
  'gente|people|crowd|multitud|grupo|group|equipo|team|' +
  'bañista|bañistas|bather|bathers|swimmer|swimmers|' +
  'sunbather|tomando_el_sol|tumbado|tumbada|broncear|tanning|' +
  'beachgoer|beachgoers|turista|tourist|visitante|visitor|' +
  'amigos|friends|pareja|couple|abrazo|hug|kissing|besando|' +
  'bikini|swimsuit|topless|nudista|nudist|naked|nude|desnudo|desnuda|' +
  // Otros típicos falsos positivos
  'parking_lot|garaje|garage|hotel(?!_playa)|restaurante(?!_playa)' +
  ')\\b',
  'i'
)

// Palabras positivas que se requieren para aceptar fotos en modo
// estricto (cards, listados). Si el título no menciona playa/costa/
// mar/arena/etc., se descarta.
const POSITIVAS = new RegExp(
  '\\b(' +
  // Términos directos
  'beach|playa(?!_de_aparcamiento)|platja|praia|' +
  // Geografía costera
  'costa|coast|shore|orilla|ribera|litoral|seaside|seafront|' +
  'mar|sea|ocean|oceano|bahia|bay|ensenada|cala|caleta|' +
  // Elementos típicos de playa
  'arena|sand|sandy|duna|dune|guijarro|pebble|rocosa|' +
  'acantilado|cliff|escarpado|rompiente|cantera|paseo_maritimo|' +
  // Elementos visibles (sin personas en primer plano)
  'chiringuito|sombrilla|umbrella|hamaca|paseo|' +
  // Actividades como signal de contexto playero (la mayoría muestran
  // mar/olas, no retratos): mantenemos pero NEGATIVAS personas filtra
  // primero los que sí son retratos de surfistas/etc.
  'surf|surfing|kitesurf|windsurf|snorkel|paddle|kayak|' +
  // Estados visuales asociables
  'atardecer|sunset|amanecer|sunrise|horizonte|horizon|' +
  // Conceptos editoriales
  'panoramica|panorama|vista|view' +
  ')\\b',
  'i'
)

function extraerFotosDePages(pages: any[]): FotoPlaya[] {
  return pages
    .map((p: any) => {
      const ii = p.imageinfo?.[0]
      if (!ii?.thumburl) return null
      const titulo = (p.title ?? '').toLowerCase()
      if (NEGATIVAS.test(titulo)) return null
      const ext = ii.url?.split('.').pop()?.toLowerCase()
      if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext ?? '')) return null

      // Validar que URL de Wikimedia tenga estructura esperada (evita URLs rotas)
      // Formato válido: https://*.wikimedia.org/.../{archivo}.{ext}?...
      const isValidWikimediaUrl = (url: string): boolean => {
        try {
          const u = new URL(url)
          return u.hostname?.includes('wikimedia.org') === true &&
                 /\.(jpg|jpeg|png|webp)(\?|$)/i.test(url)
        } catch { return false }
      }

      if (!isValidWikimediaUrl(ii.thumburl)) return null

      const w = ii.width ?? 0
      const h = ii.height ?? 0
      // Descartar imágenes muy pequeñas, verticales raras o mapas
      if (w > 0 && h > 0) {
        if (w < 500) return null
        // Aspect ratio razonable (ni cuadrados raros ni verticales extremos)
        const ratio = w / h
        if (ratio < 0.7 || ratio > 3) return null
      }
      const score = POSITIVAS.test(titulo) ? 1 : 0
      // Wikimedia devuelve un thumb a 800px (iiurlwidth). Usamos esa misma
      // URL para ambos tamaños: evita falsos 404 que aparecían antes por
      // intentar reconstruir un /300px-/ que no siempre existe (imágenes
      // más pequeñas que 800, o con nombres con dígitos que rompían el regex).
      // Ahora también validamos URL para evitar links rotos en cache.
      return {
        score,
        url: ii.thumburl,
        thumb: ii.thumburl,
        fuente: 'wikimedia' as const,
        autor: ii.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').slice(0, 60) ?? undefined,
      }
    })
    .filter(Boolean)
    .sort((a: any, b: any) => b.score - a.score)
    .map(({ score, ...rest }: any) => rest) as FotoPlaya[]
}

// Wikimedia — geosearch por coordenadas (1500m). MODO ESTRICTO:
// la geosearch devuelve cualquier foto subida en la zona (iglesias,
// monumentos, edificios). Filtramos exigiendo que el nombre del
// archivo contenga al menos una palabra del catálogo POSITIVAS. Si
// no hay matches, devolvemos vacío y dejamos que otra fuente lo
// intente, en lugar de servir un edificio cercano.
async function getFotosWikimediaGeo(lat: number, lon: number, nombre?: string): Promise<FotoPlaya[]> {
  try {
    // Radio reducido de 1500m a 700m: con 1500m, playas vecinas a 500m
    // (Kontxa-Zurriola, Cala A-Cala B en mismo cabo) obtenían el mismo
    // pool de fotos. 700m sigue cubriendo la propia playa + entorno
    // inmediato sin solapamiento entre playas diferentes.
    const params = new URLSearchParams({
      action:       'query',
      generator:    'geosearch',
      ggsnamespace: '6',
      ggscoord:     `${lat}|${lon}`,
      ggsradius:    '1000',
      ggslimit:     '40',
      prop:         'imageinfo|pageprops',
      iiprop:       'url|extmetadata|size',
      iiurlwidth:   '800',
      format:       'json',
      origin:       '*',
    })
    const res = await fetchWithTimeout(
      `https://commons.wikimedia.org/w/api.php?${params}`,
      { next: { revalidate: 86400 } },
      1000,  // Reducido de 3500: durante build timeout global es 1.5s total
    )
    if (!res.ok) return []
    const data = await res.json()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pages = Object.values(data.query?.pages ?? {}) as any[]
    const fotos = extraerFotosDePages(pages)
    const beachish = fotos.filter(f => {
      try {
        return POSITIVAS.test(decodeURIComponent(f.url).toLowerCase())
      } catch { return false }
    })

    // Término medio (decisión jun-2026): radio ampliado a 1000m pero
    // EXIGIENDO que el nombre del archivo contenga el nombre de la playa.
    // Antes, si ninguna foto cercana llevaba el nombre, se devolvían las
    // "geo-cercanas" genéricas → colaba el pueblo, un restaurante o las
    // montañas (ej. 'Vista al Restaurante El Chicle' en Playa de Ferrara).
    // Ahora: si no hay match de nombre, devolvemos [] y otra fuente / el
    // fallback por estado del mar actúa. Más cobertura por el radio, sin
    // fotos equivocadas.
    const normalizar = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
    const tokens = [
      normalizar(nombre ?? ''),
      ...(nombre ?? '').toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t)),
    ].filter(Boolean)
    if (tokens.length === 0) return []
    const conNombre = beachish.filter(f => {
      try {
        const url = normalizar(decodeURIComponent(f.url))
        return tokens.some(t => t.length >= 4 && url.includes(t))
      } catch { return false }
    })

    return conNombre.slice(0, 6)
  } catch {
    return []
  }
}

// Wikipedia ES — lead-image del artículo (pageimage canónico).
// Las playas con artículo en Wikipedia (~600 españolas, sobre todo
// las "famosas") tienen una foto principal seleccionada por editores
// humanos en Commons. Es prácticamente siempre la mejor foto posible:
// específica, encuadre correcto, libre de NEGATIVAS.
//
// Estrategia:
//   1. Para playas con nombre cooficial (vasco/gallego/catalán) buscamos
//      también el alias castellano (NOMBRES_POPULARES).
//   2. action=query&generator=search devuelve hasta 5 artículos por query.
//   3. Filtramos: no-disambiguation, con pageimage, título contiene
//      un token discriminante del nombre concreto.
//   4. Ranking: exact-match > "Playa de {nombre}" > Wikipedia score.
//
// Endpoint: https://es.wikipedia.org/w/api.php — público, sin clave.
//
// PALABRAS_GENERICAS: tokens demasiado comunes para discriminar. Si
// el nombre es "Playa de Bolonia", el token "playa" matchea con
// cualquier artículo de playa — no aporta señal. Excluidos del set.
const PALABRAS_GENERICAS = new Set([
  'playa', 'playas', 'platja', 'platges', 'praia', 'praias', 'cala', 'caleta',
  'calas', 'beach', 'beaches', 'plage', 'plages', 'punta', 'puntas', 'acces',
  'access', 'area', 'pequena', 'grande', 'principal', 'islas', 'isla', 'illa',
  'illes', 'illas', 'mar', 'sea', 'costa', 'east', 'oeste', 'norte', 'sur',
])

async function getFotosWikipediaLeadImage(
  nombre: string,
  municipio: string,
  playaLat?: number,
  playaLon?: number,
): Promise<FotoPlaya[]> {
  const normalizar = (s: string) => s
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')

  // Tokens discriminantes del nombre. Excluimos palabras genéricas
  // (playa, cala, isla...) que matchearían cualquier artículo costero.
  const tokensCrudos = nombre.toLowerCase().split(/[\s-]+/).map(normalizar)
    .filter(t => t.length >= 4)
  const tokensDiscriminantes = tokensCrudos.filter(t => !PALABRAS_GENERICAS.has(t))
  if (tokensDiscriminantes.length === 0) return []

  // Para playas con alias castellano (Kontxa → La Concha, As Catedrais
  // → Las Catedrales, Pantín → Playa de Pantín), buscar también por el
  // alias. El dataset usa el nombre OFICIAL del MITECO (cooficial), que
  // puede aparecer como `oficial` o `corto` en NOMBRES_POPULARES.
  const { NOMBRES_POPULARES } = await import('./nombres-populares')
  const aliases: string[] = []
  const nombreNorm = normalizar(nombre)
  for (const [, info] of Object.entries(NOMBRES_POPULARES)) {
    const candidatos = [info.oficial, info.corto, info.popular].filter(Boolean) as string[]
    if (candidatos.some(c => normalizar(c) === nombreNorm)) {
      aliases.push(info.popular)
      // tokens del alias también valen como discriminantes
      for (const tok of info.popular.toLowerCase().split(/[\s-]+/).map(normalizar)) {
        if (tok.length >= 4 && !PALABRAS_GENERICAS.has(tok)) tokensDiscriminantes.push(tok)
      }
      break
    }
  }

  // Queries en orden de especificidad. Si una query devuelve match
  // válido, paramos. No mezclamos "playa de" + "tarifa playa" porque
  // añadir ruido baja el ranking del articulo correcto.
  const queries: string[] = [
    `Playa de ${nombre}`,           // título canónico esperado
    nombre,                          // nombre bare
    ...aliases.flatMap(a => [`Playa de ${a}`, a]),
    `${nombre} ${municipio}`,        // último recurso para desambiguar
  ]

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        action:    'query',
        generator: 'search',
        gsrsearch: q,
        gsrlimit:  '8',
        // coordinates: añade `prop=coordinates` para que Wikipedia
        // devuelva las coords del artículo. Lo usamos para descartar
        // artículos lejanos (ej: "Faro de la playa de Capao da Canoa",
        // Brasil, vs. "Playa del Faro" en Hondarribia, España).
        prop:      'pageimages|pageprops|coordinates',
        piprop:    'original|thumbnail',
        pithumbsize: '800',
        colimit:   '5',
        format:    'json',
        origin:    '*',
      })
      const res = await fetchWithTimeout(
        `https://es.wikipedia.org/w/api.php?${params}`,
        { next: { revalidate: 86400 } },
        4000,
      )
      if (!res.ok) continue
      const data = await res.json()
      const pagesObj = data?.query?.pages ?? {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pages = Object.values(pagesObj) as any[]

      // Filtrar candidatos válidos.
      //
      // Bug previo: matching demasiado laxo aceptaba "Mairie de Pantin"
      // (ayuntamiento Pantin, Francia) para nuestra "Praia de Pantín"
      // (Galicia), y "Farol litoral Capão da Canoa" (Brasil) para
      // "Playa Faro de Trafalgar". Porque:
      //   1. tituloNorm.includes(token) trata "farol" como match de "faro"
      //      (substring, no word-boundary).
      //   2. Aceptábamos cualquier título con el token, sin exigir
      //      contexto geográfico (palabras como "playa", "praia"...).
      //
      // Fix doble:
      //   A. Tokenizar el título en palabras y exigir match exacto sobre
      //      una palabra (no substring).
      //   B. Exigir que el título o bien contenga un marcador geográfico
      //      costero (Playa/Beach/Praia/Platja/Cala/Caleta/Bahía/...) o
      //      bien sea EXACTAMENTE el nombre de la playa (caso "Cofete",
      //      "Maspalomas", donde el artículo Wikipedia es el del topónimo).
      const MARCADORES_COSTEROS = /^(playa|playas|beach|beaches|praia|praias|platja|platges|cala|caleta|calita|bahia|bahía|ensenada|hondartza|cap|cabo)$/i
      const NEGATIVAS_TITULO_EXTRA = /^(mairie|ayuntamiento|udaletxe|concello|prefectura|prefecture|hoteldeville|townhall|consistorio|alcaldia|alcaldía)$/i

      const palabras = (t: string): string[] => (t ?? '')
        .toLowerCase()
        .split(/[\s\-_().,;:'"·•/]+/)
        .map(w => normalizar(w))
        .filter(Boolean)

      const candidatos = pages
        .filter((p) => !p?.pageprops?.disambiguation)
        .filter((p) => typeof p?.original?.source === 'string')
        // Sólo imágenes raster (jpg/jpeg/png/webp). Algunos artículos tienen
        // pageimage mal puesto: SVG de bandera, mapa, escudo. Ej: el artículo
        // "Playa de Doniños" lleva como pageimage `La_Coruña-loc.svg`.
        .filter((p) => /\.(jpe?g|png|webp)(\?|$)/i.test(p.original.source))
        // Descartar URLs cuyo nombre de archivo cae en NEGATIVAS (mapa,
        // escudo, bandera, edificios, etc.) o en negativas-título-extra
        // (mairie, ayuntamiento...).
        .filter((p) => {
          const filename = decodeURIComponent(p.original.source.split('/').pop() ?? '').toLowerCase()
          if (NEGATIVAS.test(filename)) return false
          // Word-level check del filename para mairie/ayuntamiento/...
          const fnPalabras = palabras(filename.replace(/\.(jpe?g|png|webp).*/i, ''))
          if (fnPalabras.some(w => NEGATIVAS_TITULO_EXTRA.test(w))) return false
          return true
        })
        // Mismo rechazo word-level sobre el TÍTULO del artículo.
        .filter((p) => {
          const titPalabras = palabras(p.title ?? '')
          return !titPalabras.some(w => NEGATIVAS_TITULO_EXTRA.test(w))
        })
        // Token discriminante DEBE aparecer como PALABRA del título,
        // no substring. Antes "faro" matcheaba "farol" — ahora no.
        .filter((p) => {
          const titPalabras = palabras(p.title ?? '')
          return tokensDiscriminantes.some((t) => titPalabras.includes(t))
        })
        // Contexto geográfico: el título debe incluir un marcador
        // costero (Playa/Beach/Praia/Cala...) O bien ser EXACTAMENTE
        // un token del nombre (caso "Cofete", "Maspalomas").
        .filter((p) => {
          const titPalabras = palabras(p.title ?? '')
          if (titPalabras.some(w => MARCADORES_COSTEROS.test(w))) return true
          // Acepta si el título normalizado completo == algún token discriminante
          const tituloFlat = titPalabras.join('')
          if (tokensDiscriminantes.some(t => t === tituloFlat)) return true
          // O si el título completo == nombre (con/sin alias).
          if (tituloFlat === normalizar(nombre)) return true
          if (aliases.some(a => tituloFlat === normalizar(a))) return true
          return false
        })
        // GEO-DISTANCIA: si Wikipedia devuelve coords del artículo Y
        // tenemos coords de la playa, rechazamos artículos a >50km.
        // Caso real: "Faro de la playa de Capão da Canoa" (Brasil)
        // contiene 'faro' y 'playa', pasa el filtro de contexto, pero
        // está a ~9.000 km de Hondarribia — claramente otro continente.
        // Si el artículo no tiene coords, no aplica el filtro (no
        // sabemos dónde está, dejamos pasar como antes).
        .filter((p) => {
          if (playaLat == null || playaLon == null) return true
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const coords = (p as any).coordinates as Array<{ lat?: number, lon?: number, primary?: string }> | undefined
          if (!coords || coords.length === 0) return true
          const c = coords[0]
          if (typeof c.lat !== 'number' || typeof c.lon !== 'number') return true
          // Haversine simplificado (km).
          const toRad = (d: number) => d * Math.PI / 180
          const R = 6371
          const dLat = toRad(c.lat - playaLat)
          const dLon = toRad(c.lon - playaLon)
          const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(playaLat)) * Math.cos(toRad(c.lat)) *
            Math.sin(dLon / 2) ** 2
          const dist = 2 * R * Math.asin(Math.sqrt(a))
          return dist <= 50
        })

      if (candidatos.length === 0) continue

      // Ranking: exact match > "Playa de {token}" > otros con token.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scored = candidatos.map((p: any) => {
        const tituloNorm = normalizar(p.title ?? '')
        let score = 0
        // Exact match contra cualquier query intentada
        if (tituloNorm === normalizar(`playa de ${nombre}`)) score += 100
        if (tituloNorm === normalizar(nombre)) score += 90
        if (aliases.some(a => tituloNorm === normalizar(`playa de ${a}`))) score += 100
        if (aliases.some(a => tituloNorm === normalizar(a))) score += 90
        // Empieza con "Playa de"
        if (/^playa de /i.test(p.title ?? '')) score += 30
        // El primer token discriminante aparece (más peso al principal)
        if (tokensDiscriminantes[0] && tituloNorm.includes(tokensDiscriminantes[0])) score += 20
        // Wikipedia search ya devuelve por relevancia: bonus por orden inverso
        return { p, score }
      })

      scored.sort((a, b) => b.score - a.score)

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fotos: FotoPlaya[] = scored.map(({ p }: any): FotoPlaya => ({
        url:    p.original.source,
        thumb:  p.thumbnail?.source ?? p.original.source,
        fuente: 'wikimedia',
        autor:  undefined,
      }))

      if (fotos.length >= 1) return fotos.slice(0, 3)
    } catch {
      continue
    }
  }
  return []
}

// Wikimedia — búsqueda textual con nombre + municipio entre comillas
async function getFotosWikimediaText(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  // Preparar queries combinando nombre de playa + municipio en varias formas
  const n = nombre.replace(/"/g, '')
  const m = municipio.replace(/"/g, '')

  // Tokens del nombre para validar que el archivo realmente menciona
  // la playa concreta. Sin esto, Commons fuzzy-search casa archivos
  // de otros continentes que comparten palabras (ej: "Playa del Faro
  // Hondarribia" → "Farol_litoral_Capao_da_Canoa_Praia_Araça" Brasil).
  const normalizarTok = (s: string) => s
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
  const tokensDiscriminantes = nombre.toLowerCase().split(/[\s-]+/)
    .map(normalizarTok)
    .filter(t => t.length >= 4 && !PALABRAS_GENERICAS.has(t))

  const queries = [
    `"${n}" "${m}"`,            // nombre + municipio (máxima precisión)
    `"${n}" ${m} beach`,
    `"${n}" ${m} playa`,
    `"${n}" ${m}`,
    // ELIMINADA query 5 sin comillas: era el origen de matches fuzzy
    // como `Playa del Faro Hondarribia` → archivo de Brasil porque
    // Commons puntua tokens individuales (faro/farol, playa/praia).
  ]

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        action:      'query',
        generator:   'search',
        gsrnamespace:'6',
        gsrsearch:   `${q} filetype:bitmap`,
        gsrlimit:    '10',
        prop:        'imageinfo|pageprops',
        iiprop:      'url|extmetadata|size',
        iiurlwidth:  '800',
        format:      'json',
        origin:      '*',
      })
      const res = await fetchWithTimeout(
        `https://commons.wikimedia.org/w/api.php?${params}`,
        { next: { revalidate: 86400 } },
        1000,  // Reducido de 3500: durante build timeout global es 1.5s total
      )
      if (!res.ok) continue
      const data = await res.json()
      const pages = Object.values(data.query?.pages ?? {}) as any[]
      const fotosRaw = extraerFotosDePages(pages)
      // Filtro extra: el filename debe contener algun token discriminante
      // del nombre. Evita matches fuzzy de Commons que pasan NEGATIVAS+
      // POSITIVAS pero son de otro contexto (continente distinto).
      const fotos = tokensDiscriminantes.length > 0
        ? fotosRaw.filter(f => {
            const filename = normalizarTok(
              decodeURIComponent(f.url.split('/').pop() ?? '').replace(/\.(jpe?g|png|webp).*/i, '')
            )
            return tokensDiscriminantes.some(t => filename.includes(t))
          })
        : fotosRaw
      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

// Unsplash — búsqueda con NOMBRE (requerido) + municipio.
// IMPORTANTE: no usamos queries genéricas por provincia/municipio porque
// devolvían SIEMPRE la misma foto popular para todas las playas de la
// zona (ej: 15 playas de A Coruña compartían foto `photo-1546527041...`).
// Si no hay match por nombre, devolvemos vacío y dejamos que el fallback
// genérico por estado del mar (en getFotos) actúe.
async function getFotosUnsplash(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  if (!UNSPLASH_KEY) return []

  // Tokens del nombre para verificar matching del título/descripción
  // del resultado y descartar fotos genéricas que no mencionen la playa.
  const normalizar = (s: string) => s
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
  const tokensNombre = [
    normalizar(nombre),
    ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4),
  ].filter(Boolean)
  if (tokensNombre.length === 0) return []

  // Solo queries que incluyan el nombre concreto de la playa.
  const queries = [
    `${nombre} ${municipio} beach`,
    `${nombre} ${municipio} playa`,
    `${nombre} beach`,
  ]
  for (const q of queries) {
    try {
      const res = await fetchWithTimeout(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&content_filter=high`,
        {
          headers: { Authorization: `Client-ID ${UNSPLASH_KEY}` },
          next: { revalidate: 86400 },
        },
        1000,  // Reducido de 3500: durante build timeout global es 1.5s total
      )
      if (!res.ok) continue
      const data = await res.json()
      const results = data.results ?? []
      if (results.length === 0) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtradas: FotoPlaya[] = results.map((p: any): FotoPlaya | null => {
        const texto = `${p.description ?? ''} ${p.alt_description ?? ''} ${(p.tags ?? []).map((t: { title?: string }) => t?.title ?? '').join(' ')}`
        const textoNorm = normalizar(texto)
        // Exigir que algún token del nombre aparezca en el meta del resultado.
        const matchNombre = tokensNombre.some(t => t && textoNorm.includes(t))
        if (!matchNombre) return null
        return {
          url:    p.urls.regular,
          thumb:  p.urls.small,
          fuente: 'unsplash',
          autor:  p.user?.name,
        }
      }).filter((f: FotoPlaya | null): f is FotoPlaya => f !== null)

      if (filtradas.length >= 1) return filtradas.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

// OpenVerse — agregador CC (Wikimedia + Flickr + Smithsonian + …)
// API pública sin key. Rate limit: 100 req/min anónimo, 5000/min con key.
// https://api.openverse.org/v1/images/
async function getFotosOpenVerse(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  // Probar de más específico a más general. La query 4 (solo municipio)
  // se quita: para playas en municipios con varias (Donostia, Marbella,
  // Mallorca...) devolvía la misma foto para todas. Si no encontramos
  // por nombre, mejor dejar que otra fuente o el fallback genérico actúe.
  const queries = [
    `"${nombre}" "${municipio}"`,
    `"${nombre}" ${municipio} beach`,
    `${nombre} ${municipio} playa`,
  ]

  // Tokens del nombre para verificar matching del título.
  const normalizar = (s: string) => s
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
  const tokensNombre = [
    normalizar(nombre),
    ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4),
  ].filter(Boolean)

  for (const q of queries) {
    try {
      const params = new URLSearchParams({
        q,
        license_type: 'all-cc',
        category:     'photograph',
        size:         'large',
        aspect_ratio: 'wide',
        page_size:    '8',
      })
      const res = await fetchWithTimeout(
        `https://api.openverse.org/v1/images/?${params}`,
        { next: { revalidate: 86400 } },
        1000,  // Reducido de 3500: durante build timeout global es 1.5s total
      )
      if (!res.ok) continue
      const data = await res.json()
      const results = data?.results ?? []
      if (results.length === 0) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fotos: FotoPlaya[] = results.map((r: any): FotoPlaya | null => {
        const url = r.url
        const thumb = r.thumbnail ?? r.url
        if (!url || typeof url !== 'string') return null
        const titulo = (r.title ?? '').toLowerCase()
        if (NEGATIVAS.test(titulo)) return null
        if (!POSITIVAS.test(titulo)) return null
        // Exigir que el título mencione un token del nombre concreto.
        // Evita que dos playas del mismo municipio compartan foto si
        // la query devuelve algo genérico.
        const tituloNorm = normalizar(titulo)
        const matchToken = tokensNombre.some(t => t.length >= 4 && tituloNorm.includes(t))
        if (!matchToken) return null
        return {
          url,
          thumb,
          fuente: 'openverse' as const,
          autor: r.creator?.slice(0, 60) ?? undefined,
        }
      }).filter(Boolean) as FotoPlaya[]

      if (fotos.length >= 1) return fotos.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

// Pexels — fotos profesionales con API key gratuita (200 req/h).
// Solo queries con NOMBRE concreto: las queries genéricas por
// municipio/provincia generaban colisiones entre playas vecinas
// (mismo problema que Unsplash y Flickr).
async function getFotosPexels(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  if (!PEXELS_KEY) return []

  const normalizar = (s: string) => s
    .toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]/g, '')
  const tokensNombre = [
    normalizar(nombre),
    ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4),
  ].filter(Boolean)
  if (tokensNombre.length === 0) return []

  const queries = [
    `${nombre} ${municipio} beach`,
    `${nombre} ${municipio} playa`,
    `${nombre} beach`,
  ]
  for (const q of queries) {
    try {
      const res = await fetchWithTimeout(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=6&orientation=landscape&size=large`,
        {
          headers: { Authorization: PEXELS_KEY },
          next: { revalidate: 86400 },
        },
        1000,  // Reducido de 3500: durante build timeout global es 1.5s total
      )
      if (!res.ok) continue
      const data = await res.json()
      const photos = data?.photos ?? []
      if (photos.length === 0) continue

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const filtradas: FotoPlaya[] = photos.map((p: any): FotoPlaya | null => {
        const url = p.src?.large2x ?? p.src?.large ?? p.src?.original
        if (!url) return null
        // Pexels devuelve `alt` con descripción de la foto.
        const texto = `${p.alt ?? ''} ${p.url ?? ''}`
        const textoNorm = normalizar(texto)
        const matchNombre = tokensNombre.some(t => t && textoNorm.includes(t))
        if (!matchNombre) return null
        return {
          url,
          thumb:  p.src?.medium ?? p.src?.small,
          fuente: 'pexels',
          autor:  p.photographer,
        }
      }).filter((f: FotoPlaya | null): f is FotoPlaya => f !== null)

      if (filtradas.length >= 1) return filtradas.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

// Flickr — feed público sin API key (usando tags)
// Limitación: no soporta geosearch, solo filtrado por tags
// Devuelve hasta 20 fotos públicas recientes con esos tags
async function getFotosFlickr(nombre: string, municipio: string): Promise<FotoPlaya[]> {
  // Normalizar: tags en Flickr no admiten tildes ni espacios
  const normalizar = (s: string) => s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')

  const nombreTag = normalizar(nombre)
  const municipioTag = normalizar(municipio)

  // Tokens del nombre para filtrar resultados de queries genéricas.
  // Ej: 'kontxahondartza' → ['kontxa','hondartza','concha']
  // 'lazurriola' → ['lazurriola','zurriola']
  const tokensNombre = [
    nombreTag,
    ...nombre.toLowerCase().split(/[\s-]+/).map(normalizar).filter(t => t.length >= 4),
  ].filter(Boolean)

  // SOLO queries que incluyan el nombre concreto de la playa. Las
  // queries genéricas por municipio (`donostia,playa`) devolvian la
  // misma foto popular para todas las playas del municipio (ej. La
  // Concha y Zurriola ambas obtenían la foto 51820147191 porque tenia
  // tags "kontxa,zurriola,donostia" — el filtro requiereNombre no era
  // suficiente porque la foto mencionaba a ambas).
  //
  // Sin queries genéricas, las playas sin matching Flickr específico
  // caen a Wikimedia geo → OpenVerse → Wikimedia text → Pexels → Unsplash
  // → genérica por estado. Es mejor genérica que foto compartida
  // incorrecta entre playas próximas.
  const queries: Array<{ tags: string; requiereNombre: boolean }> = [
    { tags: `${nombreTag},${municipioTag},beach`, requiereNombre: true },
    { tags: `${nombreTag},beach`,                 requiereNombre: true },
    { tags: `${nombreTag},playa`,                 requiereNombre: true },
  ].filter(q => !q.tags.startsWith(',') && !q.tags.endsWith(','))

  for (const { tags, requiereNombre } of queries) {
    try {
      const params = new URLSearchParams({
        format:         'json',
        nojsoncallback: '1',
        tags:           tags,
        tagmode:        'all', // debe tener TODOS los tags
      })
      const res = await fetchWithTimeout(
        `https://www.flickr.com/services/feeds/photos_public.gne?${params}`,
        { next: { revalidate: 86400 } },
        1000,  // Reducido de 3500: durante build timeout global es 1.5s total
      )
      if (!res.ok) continue
      const data = await res.json()
      const items = data?.items ?? []
      if (items.length === 0) continue

      const fotos: FotoPlaya[] = items
        .map((item: any): FotoPlaya | null => {
          const titulo = (item.title ?? '').toLowerCase()
          const tagsStr = (item.tags ?? '').toLowerCase()
          // NEGATIVAS también sobre tags: 'Desembarco en Melilla' tenía
          // título limpio pero tags 'ejercito soldado guerra playa' que
          // delatan el contenido. Sin esto pasaba el filtro porque
          // 'playa' está en tags (POSITIVAS match).
          if (NEGATIVAS.test(titulo) || NEGATIVAS.test(tagsStr)) return null
          // Modo estricto: Flickr devuelve muchas fotos con título críptico
          // (DSC_1234, IMG_001). Aceptamos si título O tags incluyen
          // POSITIVAS (descarta DSC_xxxx con tags neutros).
          if (!POSITIVAS.test(titulo) && !POSITIVAS.test(tagsStr)) return null
          // Si la query era genérica (solo municipio), exigimos que el
          // título o los tags mencionen el nombre concreto de la playa.
          // Evita que dos playas del mismo municipio compartan foto:
          // ej. Kontxa Hondartza y Zurriola están ambas en Donostia.
          if (requiereNombre) {
            const tituloNorm = normalizar(titulo)
            const tagsNorm   = normalizar(tagsStr)
            const matchToken = tokensNombre.some(t =>
              t.length >= 4 && (tituloNorm.includes(t) || tagsNorm.includes(t))
            )
            if (!matchToken) return null
          }
          // item.media.m es el thumbnail de tamaño M (240px). Subimos a _c
          // (800px, disponible desde 2012) en vez de _b (1024px) porque
          // _b falta en fotos pequeñas o antiguas y producía imágenes rotas.
          const mediaUrl = item.media?.m ?? ''
          if (!mediaUrl) return null
          if (!/_m\.(jpg|jpeg|png)/i.test(mediaUrl)) return null
          const url = mediaUrl.replace(/_m\.(jpg|jpeg|png)/i, '_c.$1')
          const thumb = mediaUrl // _m queda como thumb
          return {
            url,
            thumb,
            fuente: 'flickr' as const,
            autor: item.author?.replace(/^.*\("(.+)"\)$/, '$1') ?? undefined,
          }
        })
        .filter(Boolean) as FotoPlaya[]

      if (fotos.length >= 2) return fotos.slice(0, 6)
    } catch {
      continue
    }
  }
  return []
}

/**
 * Pool de fotos genéricas por estado. Cuando ninguna fuente devuelve
 * foto específica, se usa una imagen Unsplash de las que proyecta la
 * atmósfera del estado (3 por estado para evitar repeticiones cuando
 * varias cards comparten estado).
 */
export const FOTOS_GENERICAS_POR_ESTADO: Record<string, string[]> = {
  CALMA: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=900&q=70',
    'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=900&q=70',
    'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=900&q=70',
  ],
  BUENA: [
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=70',
    'https://images.unsplash.com/photo-1525428781336-2bc7a72d68a8?w=900&q=70',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900&q=70',
  ],
  AVISO: [
    'https://images.unsplash.com/photo-1535262971677-1c823d4c814e?w=900&q=70',
    'https://images.unsplash.com/photo-1493558103817-58b2924bce98?w=900&q=70',
    'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=900&q=70',
  ],
  SURF: [
    'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?w=900&q=70',
    'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=900&q=70',
    'https://images.unsplash.com/photo-1455729552865-3658a5d39692?w=900&q=70',
  ],
  VIENTO: [
    'https://images.unsplash.com/photo-1505142468610-359e7d316be0?w=900&q=70',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=900&q=70',
    'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=900&q=70',
  ],
  PELIGRO: [
    'https://images.unsplash.com/photo-1500964757637-c85e8a162699?w=900&q=70',
    'https://images.unsplash.com/photo-1505144808419-1957a94ca61e?w=900&q=70',
    'https://images.unsplash.com/photo-1502136969935-8d8eef54d77b?w=900&q=70',
  ],
}

export const FOTO_GENERICA_DEFAULT = FOTOS_GENERICAS_POR_ESTADO.CALMA[0]

function poolFor(estado?: string): string[] {
  const key = (estado ?? 'CALMA').toUpperCase()
  return FOTOS_GENERICAS_POR_ESTADO[key] ?? FOTOS_GENERICAS_POR_ESTADO.CALMA
}

/**
 * Helper para cards de listado y otros usos donde solo necesitamos el
 * thumb principal. Reusa la cascada completa de getFotos() (Wikimedia
 * geo → OpenVerse → Flickr → Wikimedia text → Pexels → Unsplash) para
 * coherencia visual con la ficha.
 *
 * Acepta `excluir?: Set<string>` para dedupe entre cards: si la primera
 * foto válida ya está en el set, prueba con la siguiente, y así. Si
 * ninguna candidata es única, recurre al pool genérico del estado
 * eligiendo el primer item no usado.
 *
 * Pasar `fallback: false` para devolver null cuando no hay alternativa.
 */
export async function getFotoThumb(
  nombre: string,
  municipio: string,
  lat: number,
  lon: number,
  provincia: string = '',
  options: { fallback?: boolean; estado?: string; excluir?: Set<string> } = {}
): Promise<string | null> {
  const fotos = await getFotos(nombre, municipio, lat, lon, provincia)
  const usado = options.excluir
  // Buscar el primer thumb que no esté ya en uso
  for (const f of fotos) {
    if (f?.thumb && (!usado || !usado.has(f.thumb))) return f.thumb
  }
  if (options.fallback === false) return null
  // Pool genérico: primer item del estado que no esté ya en uso
  const pool = poolFor(options.estado)
  for (const url of pool) {
    if (!usado || !usado.has(url)) return url
  }
  // Si todo está usado (caso muy improbable), devolvemos el primero
  return pool[0] ?? FOTO_GENERICA_DEFAULT
}

/**
 * Obtiene fotos de una playa con cascada multi-fuente.
 *
 * Cinco fuentes en paralelo, ordenadas de más específico (geo) a más
 * genérico (municipio). Combina sin duplicados:
 *   1. Wikimedia Commons geosearch (1500m) — sin key
 *   2. OpenVerse agregador CC — sin key
 *   3. Flickr feed público por tags — sin key
 *   4. Wikimedia Commons text search — sin key
 *   5. Pexels por municipio — requiere PEXELS_API_KEY
 *   6. Unsplash por municipio — requiere UNSPLASH_ACCESS_KEY
 */
// ── KV cache abstraction ────────────────────────────────────────────
// Mismo patrón que opiniones.ts / votos.ts. Cacheamos el resultado
// completo de la cascada por (lat, lon) con TTL 7 días — las fotos de
// una playa cambian poquísimo. El primer hit hace los 6 fetches; el
// resto sirve desde KV en ms. TTFB de la ficha cae drásticamente.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type KV = { get: (key: string) => Promise<any>; set: (key: string, value: any, opts?: any) => Promise<any> }
let _kv: KV | null | undefined
async function getKV(): Promise<KV | null> {
  if (_kv !== undefined) return _kv
  try {
    const mod = await (import("@vercel/kv") as Promise<{ kv: KV }>)
    _kv = mod.kv
    return _kv
  } catch {
    _kv = null
    return null
  }
}

const KV_TTL_SEC = 7 * 24 * 3600  // 7 días

// Normaliza un nombre/municipio para usarlo como discriminador en la
// cache key. Quita acentos, espacios, mayúsculas y caracteres especiales.
function normalizarParaKey(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)
}

// La cache key incluye nombre + lat + lon. Antes era solo (lat, lon)
// pero dos playas a <500m pueden recibir la MISMA foto vía Wikimedia
// geosearch (radio 1500m) → colisión. Ejemplo: Kontxa Hondartza y
// Zurriola están a 500m y compartían la foto de La Concha. Añadiendo
// el nombre normalizado al hash, cada playa tiene su propia entrada
// aunque la cascada devuelva temporalmente lo mismo (la siguiente
// visita persiste la foto correcta para cada slug).
function cacheKey(nombre: string, lat: number, lon: number): string {
  return `fotos:${normalizarParaKey(nombre)}:${lat.toFixed(4)}:${lon.toFixed(4)}`
}

// Legacy: la cache key anterior (solo coordenadas). Se mantiene para
// hacer migración suave: si existe entry vieja, la leemos como fallback.
function cacheKeyLegacy(lat: number, lon: number): string {
  return `fotos:${lat.toFixed(4)}:${lon.toFixed(4)}`
}

async function getFotosUncached(
  nombre: string, municipio: string, lat: number, lon: number, provincia: string,
): Promise<FotoPlaya[]> {
  // CAUSA RAÍZ de los timeouts SSG en Vercel: esta cascada de hasta 7 APIs
  // externas, con la caché KV fría durante `next build`, superaba los 60s por
  // página. getFotos() ya devolvió la KV-cache antes de llamarnos; aquí solo
  // quedaría la red en vivo, que saltamos durante el build. En runtime/ISR
  // (primera visita o /api/cron/warm) se ejecuta normalmente y se cachea.
  if (IS_BUILD) return []

  // Usar allSettled para no fallar si una API es lenta. Mejor tener
  // algunas fotos que ninguna. Build timeout total: 1.5s en PlayaPage.
  //
  // Timeout global adicional: si todo el array tarda > 1.2s, retorna lo que tenga.
  const startTime = Date.now()
  const timeoutPromise = new Promise<typeof results>((resolve) => {
    const timer = setTimeout(() => {
      clearTimeout(timer)
      resolve([]) // Simular allSettled vacío si timeout global
    }, 1200)
  })

  const fetchPromise = Promise.allSettled([
    getFotosWikimediaGeo(lat, lon, nombre),
    getFotosWikipediaLeadImage(nombre, municipio, lat, lon),
    getFotosOpenVerse(nombre, municipio),
    getFotosFlickr(nombre, municipio),
    getFotosWikimediaText(nombre, municipio),
    getFotosPexels(nombre, municipio),
    getFotosUnsplash(nombre, municipio),
  ])

  const results = await Promise.race([fetchPromise, timeoutPromise as any])

  const [wikiGeo, wikiLead, openverse, flickr, wikiText, pexels, unsplash] = (Array.isArray(results) && results.length > 0)
    ? results.map(r => r && 'status' in r && r.status === 'fulfilled' ? r.value : [])
    : [[], [], [], [], [], [], []]

  // Combinar sin duplicados (por URL)
  const vistas = new Set<string>()
  const combinadas: FotoPlaya[] = []

  const agregar = (fotos: FotoPlaya[]) => {
    for (const f of fotos) {
      if (vistas.has(f.url)) continue
      vistas.add(f.url)
      combinadas.push(f)
      if (combinadas.length >= 6) return
    }
  }

  // Prioridad:
  //   1. Wikimedia geo (700m) — la más precisa cuando hay matches
  //   2. Wikipedia lead-image — foto canónica del artículo si la playa
  //      tiene Wiki (la mejor "una sola foto" para playas conocidas)
  //   3. OpenVerse — agregador CC (Wikimedia + Flickr + más)
  //   4. Flickr — feed público con tags
  //   5. Wikimedia text — búsqueda textual en Commons
  //   6-7. Pexels, Unsplash — stock filtrado por nombre
  agregar(wikiGeo)
  if (combinadas.length < 6) agregar(wikiLead)
  if (combinadas.length < 6) agregar(openverse)
  if (combinadas.length < 6) agregar(flickr)
  if (combinadas.length < 6) agregar(wikiText)
  if (combinadas.length < 6) agregar(pexels)
  if (combinadas.length < 6) agregar(unsplash)

  return combinadas.slice(0, 6)
}

// Negative caching: si la cascada devuelve [], persistimos un marcador
// 'EMPTY' en KV con TTL corto (10 min) para evitar martilleo. Si tras 10 min
// vuelve a haber visita, reintentamos por si el API se ha recuperado.
// TTL anterior (3600s) era demasiado largo cuando APIs fallaban.
const KV_TTL_NEGATIVE = 10 * 60

// Marcador especial: array con un objeto sentinela. Se distingue de un
// array de FotoPlaya válida porque tiene fuente='__empty__'.
type EmptyMarker = { __empty: true; ts: number }

export async function getFotos(
  nombre: string,
  municipio: string,
  lat: number,
  lon: number,
  provincia: string = '',
  slug: string = ''
): Promise<FotoPlaya[]> {
  // 0. Sidecar pre-resuelto (offline-first): si la playa tiene fotos
  // resueltas, las servimos sin red, sin KV y sin riesgo de rate limit.
  if (slug) {
    const sidecar = await getSidecar()
    const pre = sidecar?.[slug]
    if (pre && Array.isArray(pre) && pre.length > 0) return pre
  }

  const key       = cacheKey(nombre, lat, lon)
  const keyLegacy = cacheKeyLegacy(lat, lon)
  const kv = await getKV()

  // 1. Intentar KV cache (nueva clave, luego legacy)
  if (kv) {
    try {
      let cached = await kv.get(key) as FotoPlaya[] | EmptyMarker | null
      // Fallback a clave legacy si la nueva no tiene nada todavía. Las
      // entradas viejas se migran cuando expire su TTL (7d) o vía
      // /api/cron/warm.
      if (cached === null) {
        cached = await kv.get(keyLegacy) as FotoPlaya[] | EmptyMarker | null
      }
      if (cached && Array.isArray(cached) && cached.length > 0) {
        return cached
      }
      // Negative cache hit: el último intento (< 1h) devolvió vacío.
      if (cached && typeof cached === 'object' && '__empty' in cached) {
        return []
      }
    } catch {
      // KV down: caemos al fetch directo, no rompemos.
    }
  }

  // Build SSG: si la KV no tenía foto cacheada, NO hacemos red ni escribimos
  // marcador negativo (envenenaría la caché). Devolvemos [] y dejamos que el
  // fallback genérico actúe. En runtime/ISR (o /api/cron/warm) se piden de
  // verdad y se cachean → la próxima revalidación ya sirve foto real.
  if (IS_BUILD) return []

  // 2. Cascada en vivo
  const fotos = await getFotosUncached(nombre, municipio, lat, lon, provincia)

  // 3. Persistir resultado en la nueva clave (fire-and-forget)
  if (kv) {
    if (fotos.length > 0) {
      kv.set(key, fotos, { ex: KV_TTL_SEC }).catch(() => {})
    } else {
      const marker: EmptyMarker = { __empty: true, ts: Date.now() }
      kv.set(key, marker, { ex: KV_TTL_NEGATIVE }).catch(() => {})
    }
  }

  return fotos
}

/**
 * Re-ejecuta la cascada de fotos saltándose el cache (incluido el
 * negative marker) y persiste el resultado en KV si hay fotos.
 * Para uso desde `after()` post-respuesta: si el SSR cayó a [] por
 * deadline, este reintento sin restricciones de tiempo puede recuperar
 * fotos y poblar el cache para la próxima visita.
 */
export async function refetchAndStoreFotos(
  nombre: string,
  municipio: string,
  lat: number,
  lon: number,
  provincia: string = ''
): Promise<FotoPlaya[]> {
  const fotos = await getFotosUncached(nombre, municipio, lat, lon, provincia)
  if (fotos.length > 0) {
    const kv = await getKV()
    if (kv) {
      const key       = cacheKey(nombre, lat, lon)
      const keyLegacy = cacheKeyLegacy(lat, lon)
      // Escribimos en la clave nueva. También sobrescribimos la legacy
      // (si existe) para que entradas con coordenadas idénticas pero
      // playas diferentes no compartan foto incorrecta.
      kv.set(key,       fotos, { ex: KV_TTL_SEC }).catch(() => {})
      kv.set(keyLegacy, fotos, { ex: KV_TTL_SEC }).catch(() => {})
    }
  }
  return fotos
}
