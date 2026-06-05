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
  /** Traducción EN. Si falta, la ciudad no se publica en /en/campervan-rental/[city]. */
  en?: {
    intro: string
    recogida: string
    rutas: { nombre: string; desc: string }[]
    playasNota: string
    areasNota: string
    faqs: { q: string; a: string }[]
  }
}

// FAQs comunes en inglés (espejo de FAQS_COMUNES).
export const FAQS_COMUNES_EN = (city: string): { q: string; a: string }[] => [
  { q: `What licence do I need to rent a motorhome in ${city}?`, a: 'A standard category B licence covers vehicles up to 3,500 kg (most motorhomes and campers). Above that you need category C. Usual minimum: 25 years old with 2 years’ driving experience.' },
  { q: `How much does it cost to rent a motorhome in ${city}?`, a: 'As a guide: €80-120/day in low season and €130-200/day in summer. Booking 2-3 months ahead and midweek saves 20-30%.' },
  { q: 'Where can I sleep / spend the night?', a: 'You can overnight (sleep inside, without putting out awnings or chairs) wherever parking is allowed. To camp, use motorhome areas or campsites. Handy apps: Park4Night, Areas Autocaravanas.' },
  { q: 'Can I bring a pet?', a: 'Yes, most vehicles allow pets (sometimes with a cleaning surcharge). Flag it when filtering in the comparison tool.' },
]

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
    en: {
      intro: 'Madrid is Spain’s biggest motorhome and campervan pickup point and the best base camp for heading to any coast. Compare prices and pick up in the centre or at Barajas airport.',
      recogida: 'Pickup at downtown depots and near Barajas airport (MAD).',
      rutas: [
        { nombre: 'Madrid → Levante (beaches)', desc: 'In ~3-4 h you reach the beaches of Valencia and the Costa Blanca.' },
        { nombre: 'Madrid → Andalusia', desc: 'Route to the Costa del Sol and Cádiz, stopping at white villages.' },
        { nombre: 'Sierra de Madrid', desc: 'A short getaway, ideal for a first trip: areas and nature 1 h away.' },
      ],
      playasNota: 'Madrid has no coast, but it’s the best base for reaching the Levante beaches (3-4 h) or the north. We link routes to the coast on the page.',
      areasNota: 'Motorhome areas and campsites in the Sierra and nearby for the first/last night.',
      faqs: [
        { q: 'Does Madrid’s low-emission zone affect my motorhome?', a: 'Yes: Madrid has a Low Emission Zone. Rental motorhomes usually carry a C/ECO sticker and can drive, but confirm the sticker when booking and avoid the restricted centre.' },
        ...FAQS_COMUNES_EN('Madrid'),
      ],
    },
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
    en: {
      intro: 'Barcelona combines high demand with a spectacular coast right next door: the Costa Brava. Compare motorhomes and campers and head out to discover coves within minutes.',
      recogida: 'Depots in the city and near El Prat airport (BCN).',
      rutas: [
        { nombre: 'Costa Brava', desc: 'Cadaqués, Tossa de Mar, the coves of Begur: the camper route par excellence.' },
        { nombre: 'Catalan Pyrenees', desc: 'Vall de Boí, Aigüestortes: mountains 2-3 h away.' },
        { nombre: 'Maresme / Costa Dorada', desc: 'Beaches north and south of the city.' },
      ],
      playasNota: 'Costa Brava and Maresme under 1 h away. We link the suitable beaches and accessible coves near Barcelona.',
      areasNota: 'Good network of areas and campsites on the Costa Brava; many open year-round.',
      faqs: [
        { q: 'Does Barcelona’s low-emission zone affect me?', a: 'Yes, Barcelona has the ZBE Rondas. Rental motorhomes with a C/ECO sticker drive normally; confirm the sticker when booking.' },
        ...FAQS_COMUNES_EN('Barcelona'),
      ],
    },
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
    en: {
      intro: 'Valencia means easy pickup, ideal weather and a beach right by the city. Compare motorhomes and campers to tour the Costa Blanca and the Albufera.',
      recogida: 'Depots in the city and near Manises airport (VLC).',
      rutas: [
        { nombre: 'Costa Blanca', desc: 'Heading south: Gandía, Dénia, Jávea, Alicante.' },
        { nombre: 'Albufera & rice fields', desc: 'Sunsets and unspoilt beaches 20 min away.' },
        { nombre: 'Inland: Requena / Chera', desc: 'Nature and wine tourism 1 h away.' },
      ],
      playasNota: 'Malvarrosa, El Saler and the whole Costa Blanca to the south. We link motorhome-friendly beaches near Valencia.',
      areasNota: 'Areas and campsites along the coast, many right on the beach.',
      faqs: FAQS_COMUNES_EN('Valencia'),
    },
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
    en: {
      intro: 'Seville is Andalusia’s gateway by motorhome: the Costa de la Luz, Doñana and the white villages are all close by. Compare motorhomes and campers and plan your route.',
      recogida: 'Depots in the city and near Seville airport (SVQ).',
      rutas: [
        { nombre: 'Costa de la Luz', desc: 'Cádiz, Conil, Tarifa: wild, windswept beaches.' },
        { nombre: 'White Villages', desc: 'Ronda, Grazalema, Arcos: the iconic inland route.' },
        { nombre: 'Doñana', desc: 'Nature and marsh villages towards Huelva.' },
      ],
      playasNota: 'The Costa de la Luz (Cádiz/Huelva) is 1-1.5 h away. We link suitable beaches and coves in the area.',
      areasNota: 'Areas on the Costa de la Luz and campsites next to the best beaches.',
      faqs: FAQS_COMUNES_EN('Seville'),
    },
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
    en: {
      intro: 'Málaga and the Costa del Sol mean sun, beaches and well-equipped areas. Compare motorhomes and campers and travel the coast cove by cove.',
      recogida: 'Depots in the city and next to Málaga airport (AGP).',
      rutas: [
        { nombre: 'Costa del Sol', desc: 'Nerja, Marbella, Estepona: beaches and beach bars.' },
        { nombre: 'Cabo de Gata (Almería)', desc: 'The most unspoilt coves of the Mediterranean, heading east.' },
        { nombre: 'Sierra Nevada / Alpujarras', desc: 'Mountains and white villages 1-2 h away.' },
      ],
      playasNota: 'The whole Costa del Sol right off the road. We link motorhome-friendly beaches near Málaga.',
      areasNota: 'Excellent network of areas and campsites on the Costa del Sol, many open year-round.',
      faqs: FAQS_COMUNES_EN('Málaga'),
    },
  },

  // ── F2: ciudades de alta demanda ──────────────────────────────
  {
    slug: 'bilbao', ciudad: 'Bilbao', provincia: 'Bizkaia', comunidad: 'País Vasco',
    zona: 'Costa Vasca / Norte', aeropuerto: 'BIO · Bilbao', zbe: true,
    camperdaysPath: 'campervans-spain/northern-spain.html', volMes: 720,
    intro: 'Bilbao es una de las recogidas que más crece y la puerta a la Costa Vasca y la cornisa cantábrica. Compara autocaravanas y campers y recorre el verde norte.',
    precios: { baja: '85-120 €/día', media: '110-150 €/día', alta: '140-205 €/día' },
    recogida: 'Estaciones en la ciudad y cerca del aeropuerto de Bilbao (BIO).',
    rutas: [
      { nombre: 'Costa Vasca', desc: 'Hondarribia, San Sebastián, Zumaia: gastronomía y acantilados.' },
      { nombre: 'Cornisa Cantábrica', desc: 'Hacia Cantabria, Picos de Europa y Asturias.' },
      { nombre: 'Rioja Alavesa', desc: 'Enoturismo y pueblos a 1 h.' },
    ],
    playasNota: 'Playas de la Costa Vasca a un paso (La Concha, Zarautz, Bakio). Enlazamos las aptas para autocaravana.',
    areasNota: 'Áreas y campings por toda la cornisa cantábrica, muy populares en verano.',
    faqs: [
      { q: '¿Afecta la ZBE de Bilbao?', a: 'Bilbao tiene ZBE. Las autocaravanas de alquiler con etiqueta C/ECO circulan; confirma la etiqueta al reservar.' },
      ...FAQS_COMUNES('Bilbao'),
    ],
  },
  {
    slug: 'alicante', ciudad: 'Alicante', provincia: 'Alicante', comunidad: 'Comunitat Valenciana',
    zona: 'Costa Blanca', aeropuerto: 'ALC · Alicante-Elche', zbe: false,
    camperdaysPath: null, volMes: 1000,
    intro: 'Alicante y la Costa Blanca: sol casi todo el año, calas y áreas bien preparadas. Compara autocaravanas y campers para tu ruta por el Mediterráneo.',
    precios: { baja: '80-115 €/día', media: '105-145 €/día', alta: '135-195 €/día' },
    recogida: 'Estaciones en la ciudad y junto al aeropuerto de Alicante-Elche (ALC).',
    rutas: [
      { nombre: 'Costa Blanca norte', desc: 'Calpe, Jávea, Dénia: calas turquesa.' },
      { nombre: 'Costa Blanca sur', desc: 'Santa Pola, Torrevieja, salinas y playas largas.' },
      { nombre: 'Interior: Guadalest', desc: 'Pueblos de montaña y embalses a 1 h.' },
    ],
    playasNota: 'Toda la Costa Blanca a pie de carretera. Enlazamos playas aptas cerca de Alicante.',
    areasNota: 'Gran densidad de áreas y campings en la Costa Blanca, muchos abiertos todo el año.',
    faqs: FAQS_COMUNES('Alicante'),
  },
  {
    slug: 'zaragoza', ciudad: 'Zaragoza', provincia: 'Zaragoza', comunidad: 'Aragón',
    zona: 'Valle del Ebro / acceso Pirineos', aeropuerto: 'ZAZ · Zaragoza', zbe: false,
    camperdaysPath: null, volMes: 1300,
    intro: 'Zaragoza es base estratégica en el centro del cuadrante noreste: Pirineos, costa mediterránea y norte a tiro. Compara autocaravanas y campers.',
    precios: { baja: '80-115 €/día', media: '105-145 €/día', alta: '135-195 €/día' },
    recogida: 'Estaciones en la ciudad y cerca del aeropuerto de Zaragoza (ZAZ).',
    rutas: [
      { nombre: 'Pirineo aragonés', desc: 'Ordesa, Benasque, valles glaciares a 2 h.' },
      { nombre: 'Hacia el Mediterráneo', desc: 'Costa Dorada y Costa del Azahar en ~2,5-3 h.' },
      { nombre: 'Comarcas de Teruel', desc: 'Pueblos con encanto y cielos estrellados.' },
    ],
    playasNota: 'Zaragoza es interior, pero a 2,5-3 h tienes la Costa Dorada y del Azahar. Enlazamos rutas a la costa.',
    areasNota: 'Áreas en el Pirineo y el valle del Ebro para primera/última noche.',
    faqs: FAQS_COMUNES('Zaragoza'),
  },
  {
    slug: 'granada', ciudad: 'Granada', provincia: 'Granada', comunidad: 'Andalucía',
    zona: 'Sierra Nevada / Costa Tropical', aeropuerto: 'GRX · Granada-Jaén', zbe: false,
    camperdaysPath: null, volMes: 720,
    intro: 'Granada combina Sierra Nevada y la Costa Tropical en pocos kilómetros. Compara autocaravanas y campers para una ruta de montaña y mar.',
    precios: { baja: '80-115 €/día', media: '105-145 €/día', alta: '135-195 €/día' },
    recogida: 'Estaciones en la ciudad y cerca del aeropuerto de Granada (GRX).',
    rutas: [
      { nombre: 'Costa Tropical', desc: 'Salobreña, Almuñécar: playas y caña de azúcar a 1 h.' },
      { nombre: 'Las Alpujarras', desc: 'Pueblos blancos colgados de la montaña.' },
      { nombre: 'Sierra Nevada', desc: 'Alta montaña y áreas para dormir bajo las estrellas.' },
    ],
    playasNota: 'La Costa Tropical está a ~1 h. Enlazamos playas aptas para autocaravana de la zona.',
    areasNota: 'Áreas en la Alpujarra y campings en la Costa Tropical.',
    faqs: FAQS_COMUNES('Granada'),
  },
  {
    slug: 'murcia', ciudad: 'Murcia', provincia: 'Murcia', comunidad: 'Región de Murcia',
    zona: 'Mar Menor / Costa Cálida', aeropuerto: 'RMU · Región de Murcia (Corvera)', zbe: false,
    camperdaysPath: null, volMes: 720,
    intro: 'Murcia es la puerta del Mar Menor y la Costa Cálida, con clima suave todo el año. Compara autocaravanas y campers y disfruta de calas y aguas tranquilas.',
    precios: { baja: '78-112 €/día', media: '100-140 €/día', alta: '130-190 €/día' },
    recogida: 'Estaciones en la ciudad y junto al aeropuerto de Corvera (RMU).',
    rutas: [
      { nombre: 'Mar Menor', desc: 'Aguas cálidas y poco profundas, ideal en familia.' },
      { nombre: 'Calblanque', desc: 'Calas vírgenes protegidas cerca de Cartagena.' },
      { nombre: 'Costa Cálida', desc: 'Hacia Águilas y Mazarrón: playas y áreas.' },
    ],
    playasNota: 'Mar Menor y Calblanque a 30-45 min. Enlazamos playas aptas para autocaravana.',
    areasNota: 'Áreas y campings junto al Mar Menor y la Costa Cálida.',
    faqs: FAQS_COMUNES('Murcia'),
  },

  // ── F2: regiones con alta demanda (norte verde) ──────────────
  {
    slug: 'asturias', ciudad: 'Asturias', provincia: 'Asturias', comunidad: 'Asturias',
    zona: 'Costa Cantábrica / Picos de Europa', aeropuerto: 'OVD · Asturias', zbe: false,
    camperdaysPath: 'campervans-spain/northern-spain.html', volMes: 1300,
    intro: 'Asturias es el paraíso del autocaravanista: playas salvajes, Picos de Europa y aldeas con encanto. Compara autocaravanas y campers para recorrer el paraíso natural.',
    precios: { baja: '85-120 €/día', media: '110-150 €/día', alta: '140-200 €/día' },
    recogida: 'Recogida en Oviedo/Gijón y cerca del aeropuerto de Asturias (OVD).',
    rutas: [
      { nombre: 'Costa asturiana', desc: 'Playas de Gulpiyuri, Torimbia, Cuevas del Mar.' },
      { nombre: 'Picos de Europa', desc: 'Covadonga, Cangas de Onís, lagos y desfiladeros.' },
      { nombre: 'Occidente / Oriente', desc: 'De Llanes a Luarca, pueblos marineros.' },
    ],
    playasNota: 'Decenas de playas y calas espectaculares. Enlazamos las aptas para autocaravana en Asturias.',
    areasNota: 'Buena red de áreas; la acampada libre está prohibida, usa áreas/campings.',
    faqs: FAQS_COMUNES('Asturias'),
  },
  {
    slug: 'galicia', ciudad: 'Galicia', provincia: 'A Coruña / Pontevedra', comunidad: 'Galicia',
    zona: 'Rías Baixas y Altas', aeropuerto: 'SCQ · Santiago / LCG · A Coruña / VGO · Vigo', zbe: false,
    camperdaysPath: 'campervans-spain/northern-spain.html', volMes: 880,
    intro: 'Galicia y sus rías: playas de arena blanca como As Catedrais o las Cíes, marisco y Camino de Santiago. Compara autocaravanas y campers para descubrir el noroeste.',
    precios: { baja: '85-120 €/día', media: '110-150 €/día', alta: '135-195 €/día' },
    recogida: 'Recogida en Santiago, A Coruña o Vigo y sus aeropuertos.',
    rutas: [
      { nombre: 'Rías Baixas', desc: 'O Grove, Sanxenxo, mirador de A Lanzada y las Cíes.' },
      { nombre: 'Costa da Morte', desc: 'Faros, acantilados y As Catedrais hacia el norte.' },
      { nombre: 'Camino de Santiago', desc: 'Tramos finales hacia Compostela y Fisterra.' },
    ],
    playasNota: 'Playas de bandera azul y calas vírgenes por todas las rías. Enlazamos las aptas para autocaravana.',
    areasNota: 'Amplia red de áreas costeras; muy demandadas en verano.',
    faqs: FAQS_COMUNES('Galicia'),
  },
  {
    slug: 'cantabria', ciudad: 'Cantabria', provincia: 'Cantabria', comunidad: 'Cantabria',
    zona: 'Costa Cantábrica', aeropuerto: 'SDR · Santander', zbe: false,
    camperdaysPath: 'campervans-spain/northern-spain.html', volMes: 880,
    intro: 'Cantabria concentra playas, los Picos de Europa y pueblos como Santillana del Mar en poco espacio. Compara autocaravanas y campers para una ruta redonda.',
    precios: { baja: '85-120 €/día', media: '110-150 €/día', alta: '140-200 €/día' },
    recogida: 'Recogida en Santander y cerca del aeropuerto Seve Ballesteros (SDR).',
    rutas: [
      { nombre: 'Costa cántabra', desc: 'Santander, Comillas, San Vicente de la Barquera.' },
      { nombre: 'Picos de Europa', desc: 'Fuente Dé y los valles del sur.' },
      { nombre: 'Saja-Besaya', desc: 'Naturaleza y pueblos de interior.' },
    ],
    playasNota: 'El Sardinero, Oyambre, Langre… Enlazamos las playas aptas para autocaravana en Cantabria.',
    areasNota: 'Áreas y campings por toda la costa; acampada libre prohibida.',
    faqs: FAQS_COMUNES('Cantabria'),
  },
]

export function getCamperCities(): CamperCity[] {
  return CAMPER_CITIES
}
export function getCamperCity(slug: string): CamperCity | undefined {
  return CAMPER_CITIES.find(c => c.slug === slug)
}
// EN: solo ciudades con traducción publicada.
export function getCamperCitiesEn(): CamperCity[] {
  return CAMPER_CITIES.filter(c => !!c.en)
}
