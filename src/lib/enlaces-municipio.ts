// src/lib/enlaces-municipio.ts — qué páginas tiene un municipio, en un solo sitio.
//
// POR QUÉ. Del municipio cuelgan cinco páginas —playas, qué hacer, el tiempo,
// mareas, barcos— y cada una decidía por su cuenta a cuáles enlazar, con su
// bloque «Y también» escrito a mano. Resultado medido: la ficha de playa,
// que es donde está el tráfico, no enlazaba ni a «qué hacer» ni a barcos;
// barcos no enlazaba a qué hacer; el tiempo no enlazaba a barcos. Cada
// página nueva volvía a olvidarse en tres sitios.
//
// AQUÍ SE DECIDE UNA VEZ qué existe para ese municipio, con la misma regla
// que usa cada página para publicarse o no: si aquí sale, allí hay página.
// Quien pinta el bloque (DelMunicipio) solo quita la página en la que está.
import { getMunicipioSlugsSet, getPlayasByMunicipio } from './playas'
import { campingsDelMunicipio, MINIMO_CAMPINGS } from './campings-municipio'
import { tienePois } from './municipio-pois'
import { tieneBarcos } from './barcos-municipio'
import { tieneMareas, ubicacionMareas } from './mareas-portus'

export type ClaveMunicipio = 'playas' | 'queHacer' | 'elTiempo' | 'mareas' | 'campings' | 'barcos'

export interface EnlaceMunicipio {
  clave: ClaveMunicipio
  href: string
  /** Con la palabra que se busca: «Qué hacer en X», no «ver más». */
  texto: string
  nota: string
}

export async function enlacesMunicipio(slug: string, nombre: string): Promise<EnlaceMunicipio[]> {
  const [conPagina, conAlgunaPlaya, hayPois, playas] = await Promise.all([
    getMunicipioSlugsSet(4), getMunicipioSlugsSet(1), tienePois(slug), getPlayasByMunicipio(slug),
  ])
  const campings = await campingsDelMunicipio(playas)
  const out: EnlaceMunicipio[] = []

  if (conPagina.has(slug)) out.push({
    clave: 'playas', href: `/municipio/${slug}`,
    texto: `Playas de ${nombre}`, nota: 'bandera, oleaje y servicios de todas, cada hora',
  })
  if (hayPois) out.push({
    clave: 'queHacer', href: `/municipio/${slug}/que-hacer`,
    texto: `Qué hacer en ${nombre}`, nota: 'museos, miradores y un plan de 1 y de 3 días',
  })
  if (conAlgunaPlaya.has(slug)) out.push({
    clave: 'elTiempo', href: `/municipio/${slug}/el-tiempo`,
    texto: `El tiempo en las playas de ${nombre}`, nota: 'si hace día de playa hoy y qué día ir esta semana',
  })
  // Mareas solo donde la marea es un dato: en el Mediterráneo son 25 cm.
  if (tieneMareas(slug) && ubicacionMareas(slug)?.zona !== 'mediterraneo') out.push({
    clave: 'mareas', href: `/municipio/${slug}/tabla-de-mareas`,
    texto: `Tabla de mareas de ${nombre}`, nota: 'pleamar y bajamar según Puertos del Estado',
  })
  if (campings.length >= MINIMO_CAMPINGS) out.push({
    clave: 'campings', href: `/municipio/${slug}/camping-cerca`,
    texto: `Campings cerca de ${nombre}`, nota: `${campings.length} campings y a qué playa les queda más cerca`,
  })
  if (tieneBarcos(slug)) out.push({
    clave: 'barcos', href: `/municipio/${slug}/alquiler-de-barcos`,
    texto: `Alquiler de barcos en ${nombre}`, nota: 'de qué puerto se sale y a qué calas ir',
  })
  return out
}
