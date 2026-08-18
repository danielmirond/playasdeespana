// src/lib/banderas-biz.ts — Bandera OFICIAL izada en las playas de Bizkaia.
//
// Fuente: Diputación Foral de Bizkaia, servicio de situación de playas
// (apps.bizkaia.eus/HKDE000M). XML bilingüe eu/es, sin clave, con sello de
// hora por playa y refresco horario. Licencia CC BY 4.0 vía los datasets de
// Open Data Bizkaia; el endpoint en sí no está documentado como API pública,
// se llega a él desde el recurso del catálogo.
//
// Aporta algo que ninguna otra fuente española da: el ESTADO va separado del
// color. Una playa puede estar «Cerrado» o «Precintado» sin bandera izada, y
// eso es más grave que cualquier color. También trae aviso de medusas.
//
// EL MAPEO ES A MANO, Y ESO ES DELIBERADO ────────────────────────────────
//
// Este XML no trae coordenadas, así que no se puede casar por cercanía como
// en Canarias y Andalucía. Y `KODEA-CODIGO` no identifica la playa sino el
// MUNICIPIO: el código 044 cubre a la vez Arrigunaga, Barinatxe, Ereaga,
// Gorrondatxe y Las Arenas, que son cinco playas de Getxo. Así que la clave
// es el nombre tal cual lo escribe la Diputación.
//
// Casar por nombre automáticamente ya falló aquí, y por eso esta tabla se
// revisó a ojo antes de existir:
//   · «Las Arenas» (Getxo) se emparejaba con playa-la-arena, que es
//     ZIERBENA, a 20 km. Habría publicado la bandera de una playa en otra.
//   · «La Arena» tiene dos fichas nuestras —Zierbena y Muskiz— y hay que
//     elegir la canónica, no sortearla.
//   · «Bakio» solo tiene como candidata «Bakioko Aritza», que se le parece
//     pero no es evidentemente lo mismo.
// Las tres quedan FUERA hasta que alguien las resuelva mirando un mapa.
// Añadir una entrada aquí es afirmar que se ha comprobado.
//
// Fuera también, porque no tenemos ficha: San Antonio, Kanalape y Kanala.
//
// Coste de mantenimiento, dicho claro: si la Diputación añade una playa,
// aparecerá en el feed y no se pintará hasta que se añada aquí a mano. Es el
// precio de no tener coordenadas, y es preferible a acertar por casualidad.
import type { BanderaPlaya, MedusasRiesgo } from './seguridad'
import { kvCached } from './kv-cache'

/** Nombre en el feed de la Diputación → slug nuestro. 22 comprobadas. */
const MAPA: Record<string, string> = {
  'Aritzatxu': 'aritzatxu-hondartza',
  'Armintza': 'armintzako-hondartza',
  'Arriatera - Atxabiribil': 'atxabiribil',
  'Arrigorri': 'arrigorri-hondartza',
  'Arrigunaga': 'arrigunaga-getxo',
  'Barinatxe': 'barinatxe',
  'Barrika': 'barrikako-hondartza',
  'Ea': 'ea-hondartza',
  'Ereaga': 'ereaga-getxo',
  'Gorliz': 'gorliz',
  'Gorrondatxe': 'gorrondatxe-azkorri',
  'Hondartzape': 'hondartzape',
  'Isuntza': 'isuntza-hondartza',
  'Karraspio': 'karraspio-hondartza',
  'Laga': 'laga',
  'Laida': 'laida',
  'Laidatxu': 'laidatxu',
  'Meñakoz': 'menakoz',
  'Muriola': 'muriola',
  'Ogella': 'ogella-hondartza',
  'Plentzia': 'plentzia',
  'Toña': 'tonako-hondartza',
}

// slug → nombre en el feed. Se invierte una vez al cargar el módulo.
const POR_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(MAPA).map(([nombre, slug]) => [slug, nombre]),
)

const URL_FEED = 'https://apps.bizkaia.eus/HKDE000M/rest/situacion'

export interface EstadoOficialBiz {
  bandera: BanderaPlaya | null
  /** «Cerrado» o «Precintado»: más grave que cualquier color */
  cerrada: boolean
  /** Texto del estado tal cual lo publica la Diputación */
  estado: string
  medusas: MedusasRiesgo | null
  /** Hora local del parte, "HH:MM" */
  hora: string | null
}

/** ¿Esta playa está en la tabla revisada a mano? (para gating barato) */
export function tieneBanderaBiz(slug: string): boolean {
  return slug in POR_SLUG
}

interface FilaBiz { bandera: string; estado: string; medusas: string; hora: string }

// Solo XML: con `Accept: application/json` el servicio devuelve 406.
// Se parsea con regex a propósito, sin dependencia nueva: el documento es
// plano, de un solo nivel de repetición, y añadir un parser XML al bundle
// del servidor por 31 registros no sale a cuenta.
function campo(bloque: string, tag: string): string {
  const m = new RegExp(`<${tag}>([^<]*)</${tag}>`).exec(bloque)
  return m ? m[1].trim() : ''
}

let _snap: { hoy: string; p: Promise<Record<string, FilaBiz>> } | null = null

async function getSnapshot(): Promise<Record<string, FilaBiz>> {
  const hoy = new Intl.DateTimeFormat('es-ES', {
    timeZone: 'Europe/Madrid', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date()).replace(/\//g, '-')
  if (_snap?.hoy === hoy) return _snap.p
  const p = cargar(hoy)
  _snap = { hoy, p }
  p.catch(() => { if (_snap?.p === p) _snap = null })
  return p
}

// ── Raíz de Izenpe, la CA del Gobierno Vasco ─────────────────────────
//
// POR QUÉ ESTÁ ESTO AQUÍ. El feed de la Diputación se sirve con un
// certificado emitido por Izenpe. Node 20 lleva esa raíz en su almacén;
// **el Node 24 que corre en Vercel ya no**. Resultado: funcionaba en local
// y en producción fallaba con SELF_SIGNED_CERT_IN_CHAIN, dejando las 22
// fichas de Bizkaia sin bandera. Diagnosticado con /api/admin/banderas-diag,
// no adivinado.
//
// Detalle que conviene conocer: el servidor sirve en su cadena una raíz
// Izenpe.com DISTINTA (SHA-256 23:80:42:03…) de la que publica el programa
// de CA de Mozilla (25:30:CC:8E…). Aquí se usa la de Mozilla, verificada
// por huella, y se comprobó con `openssl verify` que el intermedio del
// servidor encadena correctamente con ella.
//
// LO QUE ESTO NO HACE: no desactiva la verificación TLS y no toca el
// almacén global. La CA se pasa SOLO en esta petición, así que ningún otro
// fetch del proyecto se ve afectado. Si el certificado del servidor deja de
// encadenar con esta raíz, la petición falla —como debe— y la ficha dice
// "sin dato".
//
// Alternativa preferible a medio plazo: pedir a la Diputación que sirva la
// cadena con una CA de uso general. Mientras tanto, esto.
const IZENPE_ROOT = [
  '-----BEGIN CERTIFICATE-----',
  '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',
  '1V4tC5h9Pmzb/CaIxw==',
  '-----END CERTIFICATE-----',
].join('\n')

/**
 * GET con la raíz de Izenpe añadida SOLO a esta conexión.
 *
 * Se usa `node:https` en vez de `fetch` porque fetch no deja pasar
 * opciones de TLS por petición sin traerse undici como dependencia, y no
 * merece una dependencia nueva por un certificado.
 */
export function getConIzenpe(url: string, timeoutMs: number): Promise<string> {
  return new Promise((resolve, reject) => {
    import('node:https').then(https => {
      const req = https.get(url, {
        ca: IZENPE_ROOT,
        headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
        timeout: timeoutMs,
      }, res => {
        if (!res.statusCode || res.statusCode < 200 || res.statusCode >= 300) {
          res.resume()
          reject(new Error(`HTTP ${res.statusCode}`))
          return
        }
        let body = ''
        res.setEncoding('utf8')
        res.on('data', c => { body += c })
        res.on('end', () => resolve(body))
      })
      req.on('timeout', () => { req.destroy(new Error('timeout')) })
      req.on('error', reject)
    }).catch(reject)
  })
}

async function cargar(hoy: string): Promise<Record<string, FilaBiz>> {
  return kvCached('banderas-biz', [hoy], 900, async () => {
    const xml = await getConIzenpe(URL_FEED, 4000)
    const out: Record<string, FilaBiz> = {}
    for (const bloque of xml.match(/<SITUACION_PLAYA>[\s\S]*?<\/SITUACION_PLAYA>/g) ?? []) {
      const nombre = campo(bloque, 'HONDARTZA-PLAYA')
      if (!nombre) continue
      // La fecha viene ISO con offset: nos quedamos la hora local tal cual.
      const fecha = campo(bloque, 'DATA-FECHA')
      out[nombre] = {
        bandera: campo(bloque, 'BANDERA_CAS-BANDERA_CAS'),
        estado:  campo(bloque, 'EGOERA_CAS-ESTADO_CAS'),
        medusas: campo(bloque, 'MARMOKENGATIKO_ABISUA_CAS-AVISO_POR_MEDUSAS_CAS'),
        hora:    /T(\d{2}:\d{2})/.exec(fecha)?.[1] ?? '',
      }
    }
    return out
  })
}

/**
 * Estado oficial de HOY para una playa de Bizkaia. null si no está en la
 * tabla o si la Diputación no la reporta.
 */
export async function getBanderaBiz(slug: string): Promise<EstadoOficialBiz | null> {
  const nombre = POR_SLUG[slug]
  if (!nombre) return null
  try {
    const snap = await getSnapshot()
    const f = snap[nombre]
    if (!f) return null

    // «Cerrado» y «Precintado» son estados, no colores. Precintado es más
    // que cerrado: hay una barrera física. Los dos van al mismo sitio.
    const cerrada = /cerrad|precint/i.test(f.estado)
    const hora = f.hora ? ` (${f.hora} h)` : ''

    let bandera: BanderaPlaya | null = null
    if (f.bandera === 'Roja') {
      bandera = { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
        motivo: `Bandera oficial izada hoy — baño prohibido (Diputación Foral de Bizkaia)${hora}`,
        motivoEn: 'Official flag flying today — no swimming', hex: '#ef4444' }
    } else if (f.bandera === 'Amarilla') {
      bandera = { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
        motivo: `Bandera oficial izada hoy (Diputación Foral de Bizkaia)${hora}`,
        motivoEn: 'Official flag flying today', hex: '#f59e0b' }
    } else if (f.bandera === 'Verde') {
      bandera = { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
        motivo: `Bandera oficial izada hoy en la playa (Diputación Foral de Bizkaia)${hora}`,
        motivoEn: 'Official flag flying today', hex: '#22c55e' }
    }
    // «Sin datos» no es bandera: la playa está en el sistema pero hoy nadie
    // ha reportado. Devolver verde ahí sería inventar el parte.

    // Una playa cerrada manda sobre el color, y si no había color, lo crea.
    //
    // El estado se traduce, no se interpola. La Diputación lo publica en
    // masculino («Cerrado», «Precintado») y bajarlo a minúsculas producía
    // «Playa precintado hoy». Un texto de seguridad mal escrito se lee como
    // texto automático, y entonces se cree menos.
    if (cerrada) {
      const frase = /precint/i.test(f.estado) ? 'Playa precintada' : 'Playa cerrada'
      const fraseEn = /precint/i.test(f.estado) ? 'Beach sealed off' : 'Beach closed'
      bandera = { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
        motivo: `${frase} hoy (Diputación Foral de Bizkaia)${hora}`,
        motivoEn: `${fraseEn} today (Bizkaia Provincial Council)`, hex: '#ef4444' }
    }

    const hayMedusas = /^s[ií]$/i.test(f.medusas)
    return {
      bandera,
      cerrada,
      estado: f.estado,
      hora: f.hora || null,
      medusas: hayMedusas
        ? {
            nivel: 'medio',
            label: 'Medusas avistadas',
            labelEn: 'Jellyfish sighted',
            detalle: 'Aviso oficial por medusas del servicio de playas de Bizkaia.',
            detalleEn: 'Official jellyfish warning from the Bizkaia beach service.',
            hex: '#f59e0b',
            oficial: true,
            fuente: 'socorrismo',
          }
        : null,
    }
  } catch {
    return null
  }
}
