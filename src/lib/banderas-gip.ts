// src/lib/banderas-gip.ts — Bandera OFICIAL izada en las playas de Gipuzkoa.
//
// Fuente: sistema KostaSystem de la Diputación Foral de Gipuzkoa (con AZTI),
// el mismo backend que alimenta la app oficial «Nik Hondartzak» y la webapp
// pública hondartzak.kostasystem.com. Sin clave.
//
// DOS TRAMPAS QUE HAY QUE RESPETAR ───────────────────────────────────────
//
// 1. EL TIMESTAMP MANDA. Cada registro trae `tspub` (epoch ms). Si no es de
//    HOY, el parte es viejo y la app oficial lo pinta GRIS. Verificado en
//    vivo: Zarautz venía con flag "yellow" y tspub del día anterior. Sin
//    esta comprobación publicaríamos el parte de ayer como si fuera de hoy,
//    que es peor que no publicar nada.
// 2. `flag: "auto"` NO es una bandera: significa que el valor lo pone un
//    sistema automático por cámara y la app no lo sobrescribe. Se ignora.
//
// No hay CORS, así que solo se puede llamar desde servidor. Da también
// aviso de medusas (`jelly`), estado del mar (`sea`) y del agua (`water`).
//
// Licencia: no declarada. Es el backend de un contratista (Tokitek), no un
// portal de datos abiertos, aunque el dato sea el oficial de la Diputación.
// Atribución visible y caché para no martillear.
import type { BanderaPlaya, MedusasRiesgo } from './seguridad'
import { kvCached } from './kv-cache'

// id KostaSystem → slug nuestro. Escrito a mano, como Bizkaia y por lo
// mismo: aquí no hay coordenadas.
//
// La colisión que obliga a revisarlo a ojo: `san001` y `deb001` se llaman
// los DOS «Santiago» y son playas distintas, una en Zumaia y otra en Deba.
// Un emparejamiento por nombre las mandaba a la misma ficha, dejando una
// playa con la bandera de la otra.
const MAPA: Record<string, string> = {
  lac002: 'kontxa-hondartza',            // La Concha, Donostia
  zur001: 'zurriola',                    // La Zurriola, Donostia
  ond001: 'ondarreta',                   // Ondarreta, Donostia
  ant001: 'orioko-hondartza',            // Antilla, Orio
  hon001: 'hondarribiko-hondartza',      // Hondarribia
  zar002: 'zarauzko-hondartza',          // Zarautz
  itz001: 'itzurun-hondartza',           // Itzurun, Zumaia
  san001: 'santiago-hondartza',          // Santiago de ZUMAIA
  deb001: 'debako-santiago-hondartza',   // Santiago de DEBA — no es la misma
  lap001: 'lapari',                      // Lapari, Deba
  otz001: 'ondarbeltz-hondartza',        // Ondarbeltz, Mutriku
  sat001: 'saturraran',                  // Saturrarán, Mutriku
  // FUERA a propósito: `mut001` (Portua) y `mut002` (Piscina), de Mutriku.
  // Tenemos seis fichas en Mutriku y ninguna se llama así de forma
  // reconocible; adivinar cuál es cada una pondría el aviso en la playa
  // equivocada. Se añadirán cuando alguien lo compruebe sobre el terreno.
}

const POR_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(MAPA).map(([id, slug]) => [slug, id]),
)

const URL_FEED = 'https://backend.tokitek.com/data/apps/105/neodata.json'

export interface EstadoOficialGip {
  bandera: BanderaPlaya | null
  medusas: MedusasRiesgo | null
  /** Hora local del parte, "HH:MM" */
  hora: string | null
}

/** ¿Esta playa está en la tabla revisada a mano? */
export function tieneBanderaGip(slug: string): boolean {
  return slug in POR_SLUG
}

interface FilaGip { flag: string; jelly: string; sea: string; water: string; tspub: number }

let _snap: { hoy: string; p: Promise<Record<string, FilaGip>> } | null = null

function hoyMadrid(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(new Date())
}

async function getSnapshot(): Promise<Record<string, FilaGip>> {
  const hoy = hoyMadrid()
  if (_snap?.hoy === hoy) return _snap.p
  const p = cargar(hoy)
  _snap = { hoy, p }
  p.catch(() => { if (_snap?.p === p) _snap = null })
  return p
}

async function cargar(hoy: string): Promise<Record<string, FilaGip>> {
  return kvCached('banderas-gip', [hoy], 900, async () => {
    const res = await fetch(URL_FEED, {
      signal: AbortSignal.timeout(4000),
      headers: { 'User-Agent': 'playas-espana.com (+https://playas-espana.com)' },
      next: { revalidate: 900 },
    })
    if (!res.ok) return {}
    const filas = await res.json() as Array<Record<string, unknown>>
    const out: Record<string, FilaGip> = {}
    for (const f of filas ?? []) {
      const id = typeof f.id === 'string' ? f.id : ''
      if (!id) continue
      out[id] = {
        flag:  typeof f.flag === 'string' ? f.flag : '',
        jelly: typeof f.jelly === 'string' ? f.jelly : '',
        sea:   typeof f.sea === 'string' ? f.sea : '',
        water: typeof f.water === 'string' ? f.water : '',
        tspub: Number(f.tspub) || 0,
      }
    }
    return out
  })
}

/** Estado oficial de HOY. null si no está mapeada o el parte no es de hoy. */
export async function getBanderaGip(slug: string): Promise<EstadoOficialGip | null> {
  const id = POR_SLUG[slug]
  if (!id) return null
  try {
    const snap = await getSnapshot()
    const f = snap[id]
    if (!f) return null

    // Trampa 1: el parte tiene que ser de hoy en hora peninsular.
    if (!f.tspub) return null
    const diaParte = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
    }).format(new Date(f.tspub))
    if (diaParte !== hoyMadrid()) return null

    const hora = new Intl.DateTimeFormat('es-ES', {
      timeZone: 'Europe/Madrid', hour: '2-digit', minute: '2-digit', hour12: false,
    }).format(new Date(f.tspub))

    // Trampa 2: "auto" no es bandera izada.
    const motivos: string[] = []
    if (f.sea === 'bad') motivos.push('estado del mar')
    if (f.water === 'bad') motivos.push('calidad del agua')
    const porQue = motivos.length ? ` por ${motivos.join(' y ')}` : ''
    const attr = `(Diputación Foral de Gipuzkoa) (${hora} h)`

    let bandera: BanderaPlaya | null = null
    if (f.flag === 'red') {
      bandera = { color: 'roja', label: 'Bandera roja', labelEn: 'Red flag',
        motivo: `Bandera oficial izada hoy${porQue} — baño prohibido ${attr}`,
        motivoEn: 'Official flag flying today — no swimming', hex: '#ef4444' }
    } else if (f.flag === 'yellow') {
      bandera = { color: 'amarilla', label: 'Bandera amarilla', labelEn: 'Yellow flag',
        motivo: `Bandera oficial izada hoy${porQue} ${attr}`,
        motivoEn: 'Official flag flying today', hex: '#f59e0b' }
    } else if (f.flag === 'green') {
      bandera = { color: 'verde', label: 'Bandera verde', labelEn: 'Green flag',
        motivo: `Bandera oficial izada hoy en la playa ${attr}`,
        motivoEn: 'Official flag flying today', hex: '#22c55e' }
    }

    return {
      bandera,
      hora,
      medusas: f.jelly === 'bad'
        ? {
            nivel: 'medio', label: 'Medusas avistadas', labelEn: 'Jellyfish sighted',
            detalle: 'Aviso oficial por medusas del servicio de playas de Gipuzkoa.',
            detalleEn: 'Official jellyfish warning from the Gipuzkoa beach service.',
            hex: '#f59e0b', oficial: true, fuente: 'socorrismo',
          }
        : null,
    }
  } catch {
    return null
  }
}
