// src/lib/autocaravana-localities.ts
// Datos del hub de alquiler de autocaravanas/campers, por ciudad de recogida.
// Priorización basada en volumen real (Semrush) + estación Camperdays + nuestro
// foso (playas/áreas). F1 = Madrid, Barcelona, Valencia, Sevilla, Málaga.
//
// Cada página de ciudad targetea DOS vocabularios: "autocaravana" + "camper".

export interface VehiculoTipo {
  nombre: string
  desc: string
}

export interface CamperCity {
  slug: string            // "madrid"
  ciudad: string          // "Madrid"
  provincia: string
  comunidad: string
  zona: string            // macro-zona / costa
  aeropuerto: string      // código + nombre
  zbe: boolean            // ¿tiene Zona de Bajas Emisiones? (aviso relevante)
  /** Path en camperdays.es para deep-link del CTA (sin dominio). Si null → España genérica. */
  camperdaysPath: string | null
  /** Volumen mensual de la mejor keyword "alquiler autocaravana(s) [ciudad]" (Semrush). */
  volMes: number
  intro: string
  // Precios orientativos €/día por temporada (autocaravana capuchina estándar)
  precios: { baja: string; media: string; alta: string }
  recogida: string        // dónde se recoge (aeropuerto / centro)
  rutas: { nombre: string; desc: string }[]
  // Foso: playas/áreas cercanas (texto; enlazaremos a datos propios donde aplique)
  playasNota: string
  areasNota: string
  faqs: { q: string; a: string }[]
}

// Tipos de autocaravana/camper (cluster con volumen: 4x4 720, lujo, integral, pick-up)
export const TIPOS_VEHICULO: VehiculoTipo[] = [
  { nombre: 'Camper / furgoneta', desc: 'Ágil y económica, ideal parejas y escapadas. Fácil de aparcar en ciudad y costa.' },
  { nombre: 'Capuchina', desc: 'La más demandada en familia: cama sobre la cabina, mucho espacio y plazas.' },
  { nombre: 'Perfilada', desc: 'Equilibrio entre tamaño y consumo, cómoda para rutas de varios días.' },
  { nombre: 'Integral', desc: 'La más amplia y premium, salón espacioso. Gama alta / lujo.' },
]

const FAQS_COMUNES = (ciudad: string): { q: string; a: string }[] => [
  { q: `¿Qué carnet necesito para alquilar una autocaravana en ${ciudad}?`, a: 'Con el carnet B basta para vehículos de hasta 3.500 kg (la mayoría de autocaravanas y campers). Por encima necesitas el C. Edad mínima habitual: 25 años con 2 de antigüedad.' },
  { q: `¿Cuánto cuesta alquilar una autocaravana en ${ciudad}?`, a: 'Orientativo: 80-120 €/día en temporada baja y 130-200 €/día en verano. Reservando con 2-3 meses de antelación y entre semana se ahorra un 20-30%.' },
  { q: '¿Dónde puedo dormir / pernoctar?', a: 'Puedes pernoctar (dormir dentro, sin desplegar toldos ni sillas) donde esté permitido estacionar. Para acampar usa áreas de autocaravanas o campings. Apps útiles: Park4Night, Areas Autocaravanas.' },
  { q: '¿Puedo llevar mascota?', a: 'Sí, la mayoría de vehículos admiten mascota (a veces con suplemento de limpieza). Indícalo al filtrar en el comparador.' },
]

export const CAMPER_CITIES: CamperCity[] = [
  {
    slug: 'madrid', ciudad: 'Madrid', provincia: 'Madrid', comunidad: 'Comunidad de Madrid',
    zona: 'Centro peninsular', aeropuerto: 'MAD · Adolfo Suárez Madrid-Barajas', zbe: true,
    camperdaysPath: 'campervans-spain/madrid.html', volMes: 2900,
    intro: 'Madrid es el mayor punto de recogida de autocaravanas y campers de España y el mejor campamento base para salir hacia cualquier costa. Compara precios y recoge en el centro o en Barajas.',
    precios: { baja: '85-120 €/día', media: '110-150 €/día', alta: '140-210 €/día' },
    recogida: 'Recogida en estaciones del centro y cerca del aeropuerto de Barajas (MAD).',
    rutas: [
      { nombre: 'Madrid → Levante (playas)', desc: 'En ~3-4 h llegas a las playas de Valencia y la Costa Blanca.' },
      { nombre: 'Madrid → Andalucía', desc: 'Ruta hacia Costa del Sol y Cádiz, parando en pueblos blancos.' },
      { nombre: 'Sierra de Madrid', desc: 'Escapada corta ideal para estrenarte: áreas y naturaleza a 1 h.' },
    ],
    playasNota: 'Madrid no tiene costa, pero es la mejor base para salir a las playas de Levante (3-4 h) o el norte. En la ficha enlazamos rutas a la costa.',
    areasNota: 'Áreas de autocaravanas y campings en la Sierra y alrededores para la primera/última noche.',
    faqs: [
      { q: '¿Afecta la ZBE de Madrid a mi autocaravana?', a: 'Sí: Madrid tiene Zona de Bajas Emisiones. Las autocaravanas de alquiler suelen tener etiqueta C/ECO y pueden circular, pero conviene confirmar la etiqueta al reservar y evitar el centro restringido.' },
      ...FAQS_COMUNES('Madrid'),
    ],
  },
  {
    slug: 'barcelona', ciudad: 'Barcelona', provincia: 'Barcelona', comunidad: 'Cataluña',
    zona: 'Costa Brava / Maresme', aeropuerto: 'BCN · Josep Tarradellas Barcelona-El Prat', zbe: true,
    camperdaysPath: 'campervans-spain/barcelona.html', volMes: 2900,
    intro: 'Barcelona combina alta demanda y una costa espectacular a un paso: la Costa Brava. Compara autocaravanas y campers y sal a descubrir calas en cuestión de minutos.',
    precios: { baja: '90-130 €/día', media: '120-160 €/día', alta: '150-220 €/día' },
    recogida: 'Estaciones en la ciudad y cerca del aeropuerto de El Prat (BCN).',
    rutas: [
      { nombre: 'Costa Brava', desc: 'Cadaqués, Tossa de Mar, calas de Begur: la ruta camper por excelencia.' },
      { nombre: 'Pirineos catalanes', desc: 'Vall de Boí, Aigüestortes: montaña a 2-3 h.' },
      { nombre: 'Maresme / Costa Dorada', desc: 'Playas al norte y sur de la ciudad.' },
    ],
    playasNota: 'Costa Brava y Maresme a menos de 1 h. Enlazamos las playas aptas y calas accesibles cerca de Barcelona.',
    areasNota: 'Buena red de áreas y campings en la Costa Brava; muchos abiertos todo el año.',
    faqs: [
      { q: '¿Afecta la ZBE de Barcelona?', a: 'Sí, Barcelona tiene ZBE Rondas. Las autocaravanas de alquiler con etiqueta C/ECO circulan con normalidad; confirma la etiqueta al reservar.' },
      ...FAQS_COMUNES('Barcelona'),
    ],
  },
  {
    slug: 'valencia', ciudad: 'Valencia', provincia: 'Valencia', comunidad: 'Comunitat Valenciana',
    zona: 'Costa de Valencia / Costa Blanca', aeropuerto: 'VLC · Valencia', zbe: false,
    camperdaysPath: 'campervans-spain/valencia.html', volMes: 1900,
    intro: 'Valencia es recogida cómoda, clima ideal y playa a pie de ciudad. Compara autocaravanas y campers para recorrer la Costa Blanca y la Albufera.',
    precios: { baja: '80-115 €/día', media: '105-145 €/día', alta: '135-200 €/día' },
    recogida: 'Estaciones en la ciudad y cerca del aeropuerto de Manises (VLC).',
    rutas: [
      { nombre: 'Costa Blanca', desc: 'Hacia el sur: Gandía, Dénia, Jávea, Alicante.' },
      { nombre: 'Albufera y arrozales', desc: 'Atardeceres y playas vírgenes a 20 min.' },
      { nombre: 'Interior: Requena / Chera', desc: 'Naturaleza y enoturismo a 1 h.' },
    ],
    playasNota: 'Malvarrosa, El Saler y toda la Costa Blanca al sur. Enlazamos playas aptas para autocaravana cerca de Valencia.',
    areasNota: 'Áreas y campings junto a la costa, muchos a pie de playa.',
    faqs: FAQS_COMUNES('Valencia'),
  },
  {
    slug: 'sevilla', ciudad: 'Sevilla', provincia: 'Sevilla', comunidad: 'Andalucía',
    zona: 'Andalucía occidental', aeropuerto: 'SVQ · Sevilla', zbe: false,
    camperdaysPath: 'campervans-spain/seville.html', volMes: 1600,
    intro: 'Sevilla es la puerta de Andalucía en autocaravana: Costa de la Luz, Doñana y pueblos blancos a un paso. Compara autocaravanas y campers y diseña tu ruta.',
    precios: { baja: '80-115 €/día', media: '105-145 €/día', alta: '135-195 €/día' },
    recogida: 'Estaciones en la ciudad y cerca del aeropuerto de Sevilla (SVQ).',
    rutas: [
      { nombre: 'Costa de la Luz', desc: 'Cádiz, Conil, Tarifa: playas salvajes y viento.' },
      { nombre: 'Pueblos Blancos', desc: 'Ronda, Grazalema, Arcos: ruta de interior icónica.' },
      { nombre: 'Doñana', desc: 'Naturaleza y aldeas marismeñas hacia Huelva.' },
    ],
    playasNota: 'La Costa de la Luz (Cádiz/Huelva) está a 1-1,5 h. Enlazamos playas aptas y calas de la zona.',
    areasNota: 'Áreas en la Costa de la Luz y campings junto a las mejores playas.',
    faqs: FAQS_COMUNES('Sevilla'),
  },
  {
    slug: 'malaga', ciudad: 'Málaga', provincia: 'Málaga', comunidad: 'Andalucía',
    zona: 'Costa del Sol', aeropuerto: 'AGP · Málaga-Costa del Sol', zbe: false,
    camperdaysPath: 'campervans-spain/malaga.html', volMes: 1300,
    intro: 'Málaga y la Costa del Sol son sinónimo de sol, playa y áreas bien preparadas. Compara autocaravanas y campers y recorre la costa de cala en cala.',
    precios: { baja: '85-120 €/día', media: '110-150 €/día', alta: '140-205 €/día' },
    recogida: 'Estaciones en la ciudad y junto al aeropuerto de Málaga (AGP).',
    rutas: [
      { nombre: 'Costa del Sol', desc: 'Nerja, Marbella, Estepona: playas y chiringuitos.' },
      { nombre: 'Cabo de Gata (Almería)', desc: 'Las calas más vírgenes del Mediterráneo, hacia el este.' },
      { nombre: 'Sierra Nevada / Alpujarras', desc: 'Montaña y pueblos blancos a 1-2 h.' },
    ],
    playasNota: 'Toda la Costa del Sol a pie de carretera. Enlazamos playas aptas para autocaravana cerca de Málaga.',
    areasNota: 'Excelente red de áreas y campings en la Costa del Sol, muchos abiertos todo el año.',
    faqs: FAQS_COMUNES('Málaga'),
  },
]

export function getCamperCities(): CamperCity[] {
  return CAMPER_CITIES
}
export function getCamperCity(slug: string): CamperCity | undefined {
  return CAMPER_CITIES.find(c => c.slug === slug)
}
