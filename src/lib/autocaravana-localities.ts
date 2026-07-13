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
  /** Guía local: 2-3 párrafos únicos por ciudad (logística real de recogida,
   *  salida, pernocta y temporada). Nada de plantilla: cada ciudad cuenta lo
   *  suyo. Se renderiza como sección "Consejos locales" en la página. */
  guia?: string[]
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
    guia: [
      'Madrid tiene una ventaja que ninguna ciudad costera puede ofrecer: eliges costa según el viento. Con la autocaravana recogida un viernes por la tarde, la A-3 te planta en las playas de Valencia en tres horas y media; si el Levante sopla fuerte, giras el plan por la A-5 hacia Cádiz o subes la A-1 al Cantábrico. Los alquileres madrileños lo saben y por eso el parque de vehículos es el mayor de España: conviene reservar con 2-3 meses de antelación para puentes y agosto, pero fuera de pico hay más oferta y mejores precios que en la costa.',
      'Dos consejos de salida: evita recoger un viernes de operación salida (la M-30 y la A-3 entre las 15h y las 21h añaden dos horas al viaje) y planea la primera noche a una hora de Madrid, no a cinco. Las áreas de la sierra (Buitrago, Rascafría) o los embalses de la A-3 (Alarcón) son primera etapa perfecta: pruebas el vehículo con luz y llegas a la costa descansado.',
    ],
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
    guia: [
      'En Barcelona la decisión clave es la dirección: hacia el norte, la Costa Brava concentra las calas y también las áreas más caras y llenas de Cataluña en verano; hacia el sur, el Delta del Ebro ofrece pernocta tranquila y sin masificación a dos horas. Si tu plan es julio o agosto y no has reservado áreas de la Costa Brava, el sur es la jugada inteligente.',
      'La ZBE de las Rondas no debería preocuparte —los vehículos de alquiler llevan etiqueta C o ECO—, pero sí la hora de salida: cruzar Barcelona un viernes entre las 16h y las 20h puede costarte hora y media. Recoge por la mañana o sal el sábado temprano. Y una particularidad local: muchos municipios costeros catalanes prohíben pernoctar en el paseo marítimo y lo vigilan; usa áreas señalizadas, la multa ronda los 200 €.',
    ],
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
    guia: [
      'Valencia es la recogida más cómoda del Mediterráneo para estrenarse: en veinte minutos desde cualquier punto de entrega estás aparcado frente a El Saler, con la Albufera detrás y la ciudad aún visible. Esa primera noche fácil, sin peajes ni puertos de montaña, es oro si nunca has conducido una autocaravana.',
      'La pernocta dentro del Parque Natural de la Albufera está regulada: no acampes fuera de las áreas habilitadas (El Palmar y El Saler tienen opciones) porque la vigilancia es real en verano. Hacia el sur, la N-332 encadena Cullera, Gandía y Dénia sin un solo peaje; hacia el norte, la costa de Castellón (Benicàssim, Peñíscola) suele tener sitio en áreas cuando la Costa Blanca ya está llena.',
    ],
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
    guia: [
      'Desde Sevilla se sale temprano o se sufre: en julio y agosto el termómetro pasa de 40° a mediodía y la autocaravana estacionada se convierte en un horno. El patrón local es salir al amanecer, hacer los 90 minutos hasta la Costa de la Luz de una tirada y pasar las horas centrales ya en la playa con levante o poniente.',
      'La Costa de la Luz tiene dos caracteres: con poniente, Conil, El Palmar y Zahara son el paraíso; con levante fuerte, la arena vuela y el día de playa se arruina — mira el viento antes de elegir destino, no después. Las áreas de Conil y El Palmar se llenan a diario en agosto; Barbate y Zahora son el plan B con hueco. Y Doñana merece el desvío: el área de El Rocío al atardecer, con las marismas delante, es de las estampas grandes del sur.',
    ],
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
    guia: [
      'Málaga es la única recogida española pensada para el viajero que aterriza: las estaciones están junto al aeropuerto (AGP) y en una hora desde la cinta de equipajes puedes estar conduciendo por la A-7. Si vienes de fuera, pide la recogida con kit de ropa de cama incluido y haz la primera compra en el Mercadona de El Viso antes de salir — luego la costa es más cara.',
      'La Costa del Sol es también el gran destino europeo de invierno: de noviembre a marzo las áreas se llenan de matrículas alemanas y nórdicas en larga estancia, así que si tu viaje es invernal reserva área con más antelación que en verano. En temporada alta, huye del tramo Fuengirola-Marbella para pernoctar (saturado y caro) y tira hacia el este: Nerja, La Herradura y la Costa Tropical tienen mejores calas y más sitio.',
    ],
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
    guia: [
      'El norte se conduce distinto: distancias cortas, curvas y un tiempo que cambia tres veces al día. Desde Bilbao, la costa vasca entera cabe en una hora de radio —Sopelana, Bakio, Mundaka, Lekeitio— y esa es su gran baza: si llueve en Bizkaia, en cuarenta minutos estás probando suerte en Zarautz o San Sebastián.',
      'Dos realidades locales: los pueblos costeros vascos restringen el aparcamiento de autocaravanas en verano (altura limitada en parkings de playa, vigilancia activa) y las áreas son pequeñas y se llenan pronto — la de Sopelana o la de Getxo a mediodía ya no tienen hueco en agosto. Reserva donde se pueda y llega antes de las 12h donde no. La recompensa: pintxos, playas de surf y el Cantábrico verde que no necesita filtro.',
    ],
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
    guia: [
      'Alicante parte la Costa Blanca en dos planes distintos: hacia el norte, las calas de roca y agua transparente (Jávea, Moraira, Calpe) donde las áreas escasean y se reservan; hacia el sur, los arenales infinitos y las salinas (Santa Pola, La Marina, Torrevieja) con más sitio y mejores precios. Elegir dirección antes de recoger el vehículo te ahorra kilómetros en vacío.',
      'De octubre a abril esta costa es el cuartel de invierno de media Europa: las áreas del sur alicantino funcionan casi como campings de larga estancia, con ambiente propio y tarifas mensuales. En verano la película cambia: julio y agosto saturan todo, y la jugada es pernoctar tierra adentro (Guadalest, el embalse de Amadorio) y bajar a la cala por la mañana temprano, cuando aún hay parking.',
    ],
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
    guia: [
      'Zaragoza es la base más barata del cuadrante noreste y un secreto logístico: a dos horas del Pirineo, a dos horas y media de la Costa Dorada y con la AP-2/AP-68 ya sin peaje. El mismo alquiler que en Barcelona cuesta menos y sale a carretera abierta sin cruzar ninguna área metropolitana.',
      'En verano, la ruta lógica es el Pirineo: Ordesa, Benasque y los valles a 20° cuando el Ebro está a 38°. El cierzo es el factor local a respetar — con rachas fuertes en el valle, una autocaravana alta se conduce incómoda por la AP-68; si el parte lo anuncia, elige la salida hacia Huesca. Las áreas pirenaicas (Aínsa, Biescas, Panticosa) son de las mejor equipadas de España y en agosto conviene llegar antes del mediodía.',
    ],
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
    guia: [
      'Granada permite el viaje que ninguna otra ciudad ofrece: desayunar a 1.200 metros con Sierra Nevada delante y comer frente al mar en la Costa Tropical, una hora exacta por la A-44. Esa doble naturaleza marca el equipaje — incluso en pleno agosto, las noches en el altiplano y la Alpujarra refrescan hasta pedir manta.',
      'La Costa Tropical (Salobreña, Almuñécar, La Herradura) es la gran infravalorada del sur: calas de cantos, agua limpia y áreas con hueco cuando Málaga revienta. Si sigues hacia el este, Cabo de Gata está a dos horas: allí la pernocta libre está prohibida y controlada en verano — usa las áreas de San José o Los Escullos y madruga para las calas, que cierran el acceso en coche a media mañana.',
    ],
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
    guia: [
      'Murcia es el plan familiar por excelencia: el Mar Menor a media hora, con agua caliente, sin olas y con fondo que cubre a los cincuenta metros — niños pequeños, cero sustos. Las áreas de Los Alcázares y Santiago de la Ribera están pensadas exactamente para ese público y en verano se reservan solas.',
      'El contraste está a veinte minutos: Calblanque, el parque regional de calas vírgenes junto a Cartagena, restringe el acceso en coche en verano (lanzadera obligatoria en las horas centrales) — ve al amanecer o no vayas en agosto. Y un dato de conducción local: el calor de julio castiga; los desplazamientos largos, mejor a primera hora, y revisa la presión de los neumáticos, que el asfalto murciano en agosto quema.',
    ],
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
    guia: [
      'Asturias es el destino soñado del autocaravanista y el más estricto con la acampada libre: pernoctar (dormir dentro, sin sacar nada) se tolera en muchos aparcamientos, pero acampar fuera de áreas está multado y vigilado, especialmente en las playas estrella como Gulpiyuri o Torimbia. La red de áreas municipales es excelente y barata — úsala.',
      'El error clásico aquí es el exceso de ambición: las carreteras nacionales asturianas son lentas y hermosas, y 80 kilómetros de costa pueden ser dos horas de volante. Planifica por comarcas (oriente: Llanes-Ribadesella; centro: Gijón-Cudillero; occidente: Luarca-Tapia) en vez de saltar de punta a punta. Junio y septiembre dan los mejores días: luz larga, áreas con hueco y los Picos de Europa sin niebla de valle.',
    ],
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
    guia: [
      'Galicia engaña en el mapa: las rías multiplican los kilómetros reales y lo que parece un salto de media hora son noventa minutos de curvas. La regla local es elegir una ría por etapa — Arousa, Pontevedra o Vigo — y agotarla, en lugar de perseguir toda la costa en una semana.',
      'La tradición gallega de áreas portuarias gratuitas o casi (O Grove, Muros, Fisterra) sigue viva y es de lo mejor de viajar aquí, pero en agosto las Rías Baixas se llenan: ten plan B hacia la Costa da Morte, más salvaje y con sitio siempre. Para As Catedrais, recuerda que la visita en marea baja exige reserva previa en verano — mira la tabla de mareas antes de organizar el día, no después.',
    ],
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
    guia: [
      'Cantabria es la comunidad que se puede viajar entera desde una sola base: de San Vicente de la Barquera a Castro Urdiales hay hora y media, y los Picos de Europa quedan a cuarenta minutos de la costa. Si te agobia mover el campamento cada noche, aquí puedes plantarte en un área céntrica (Santillana, Suances) y radiar.',
      'Santander y su arco (Somo, Loredo, Langre) concentran la demanda de agosto y los precios; el occidente —Oyambre, Comillas, la ría de la Rabia— da las mismas playas con la mitad de gente. La acampada libre está prohibida y en las playas señeras se vigila; la red de áreas es corta pero suficiente si reservas. Con el sirimiri, la jugada local es girar hacia Fuente Dé: si llueve en la costa, muchas veces los Picos están despejados por el sur.',
    ],
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

// Coordenadas de la ciudad de recogida (centroide aprox.). Se usan para listar
// las playas reales aptas más cercanas (helper getPlayasCercaDe). Las ciudades
// de interior (Madrid, Zaragoza, Granada, Sevilla) devuelven así la costa más
// próxima de forma natural, por distancia.
export const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  madrid:    { lat: 40.4168, lng: -3.7038 },
  barcelona: { lat: 41.3874, lng: 2.1686 },
  valencia:  { lat: 39.4699, lng: -0.3763 },
  sevilla:   { lat: 37.3891, lng: -5.9845 },
  malaga:    { lat: 36.7213, lng: -4.4213 },
  bilbao:    { lat: 43.2630, lng: -2.9350 },
  alicante:  { lat: 38.3452, lng: -0.4810 },
  zaragoza:  { lat: 41.6488, lng: -0.8891 },
  granada:   { lat: 37.1773, lng: -3.5986 },
  murcia:    { lat: 37.9922, lng: -1.1307 },
  asturias:  { lat: 43.3619, lng: -5.8494 },
  galicia:   { lat: 42.8782, lng: -8.5448 },
  cantabria: { lat: 43.4623, lng: -3.8100 },
}

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
