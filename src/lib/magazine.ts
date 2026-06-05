// src/lib/magazine.ts
// Capa de datos del Magazine editorial: rutas, curiosidades, restaurantes
// y guías prácticas. Sin MDX — contenido en TS (mismo patrón que el resto
// del site: data-driven, SSG, sin red en build).
//
// Para añadir un artículo: añade una entrada a ARTICLES con bloques de
// cuerpo (parr/h2/lista/cita/cta). El índice, las fichas, el sitemap y el
// enlazado se generan solos desde aquí.

export type MagazineCategory = 'rutas' | 'curiosidades' | 'gastronomia' | 'guias'

export interface CategoryMeta {
  slug: MagazineCategory
  label: string
  emoji: string
  description: string
}

export const CATEGORIES: Record<MagazineCategory, CategoryMeta> = {
  rutas: { slug: 'rutas', label: 'Rutas', emoji: '🗺️', description: 'Itinerarios por las costas de España, playa a playa.' },
  curiosidades: { slug: 'curiosidades', label: 'Curiosidades', emoji: '🐚', description: 'Historia, leyendas y datos sorprendentes del litoral.' },
  gastronomia: { slug: 'gastronomia', label: 'Gastronomía', emoji: '🦐', description: 'Dónde comer junto al mar: chiringuitos, producto y recetas.' },
  guias: { slug: 'guias', label: 'Guías prácticas', emoji: '🧭', description: 'Consejos para disfrutar la playa: épocas, familias, seguridad.' },
}

// Bloques de cuerpo (render simple, sin MDX).
export type Block =
  | { t: 'p'; html: string }                          // párrafo (permite <strong>,<em>,<a>)
  | { t: 'h2'; text: string; id?: string }            // subtítulo
  | { t: 'ul'; items: string[] }                      // lista
  | { t: 'quote'; text: string; cite?: string }       // cita destacada
  | { t: 'cta'; href: string; label: string; sub?: string } // enlace interno destacado

export interface Article {
  slug: string
  category: MagazineCategory
  title: string
  excerpt: string          // 1-2 frases para índice + meta description
  heroAlt: string
  heroQuery: string        // term para la OG / unsplash
  author: string
  datePublished: string    // ISO
  readingMin: number
  /** Enlaces internos relacionados (rutas del propio site) */
  related: Array<{ href: string; label: string }>
  body: Block[]
  faq?: Array<{ q: string; a: string }>
  /** Traducción inglesa. Si falta, el artículo no se publica en /en/magazine. */
  en?: {
    title: string
    excerpt: string
    related: Array<{ href: string; label: string }>
    body: Block[]
    faq?: Array<{ q: string; a: string }>
  }
}

// Etiquetas de categoría en inglés (para /en/magazine).
export const CATEGORIES_EN: Record<MagazineCategory, { label: string; description: string }> = {
  rutas: { label: 'Routes', description: 'Coastal itineraries across Spain, beach by beach.' },
  curiosidades: { label: 'Curiosities', description: 'History, legends and surprising facts about the coast.' },
  gastronomia: { label: 'Food', description: 'Where to eat by the sea: beach bars, local produce and recipes.' },
  guias: { label: 'Practical guides', description: 'Tips to make the most of the beach: seasons, families, safety.' },
}

export const ARTICLES: Article[] = [
  // ───────────────────────── RUTAS ─────────────────────────
  {
    slug: 'ruta-calas-costa-brava-barco',
    category: 'rutas',
    title: 'Ruta por las mejores calas de la Costa Brava en barco',
    excerpt:
      'De Lloret a las Islas Medes: un itinerario de un día por las calas más bonitas de la Costa Brava, muchas accesibles solo desde el mar.',
    heroAlt: 'Cala escondida entre pinos y acantilados de la Costa Brava',
    heroQuery: 'costa-brava,cove,mediterranean,boat',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-02T00:00:00Z',
    readingMin: 6,
    related: [
      { href: '/alquiler-barco/costas/costa-brava', label: 'Alquiler de barcos en la Costa Brava' },
      { href: '/alquiler-barco/costas/costa-brava/provincias/girona/estartit', label: 'Barcos en L’Estartit (Islas Medes)' },
      { href: '/rutas', label: 'Más rutas de playas por España' },
    ],
    body: [
      { t: 'p', html: 'La Costa Brava esconde su mejor cara lejos de los paseos marítimos: decenas de calas de agua turquesa encajadas entre acantilados de pizarra y pinares, muchas <strong>sin acceso por carretera</strong>. La única forma de encadenarlas en un día es desde el agua. Esta es nuestra ruta favorita, de sur a norte.' },
      { t: 'h2', text: 'Parada 1 · Cala Banys y Cala Boadella (Lloret de Mar)', id: 'lloret' },
      { t: 'p', html: 'Saliendo del puerto de Lloret, en 10 minutos llegas a <strong>Cala Banys</strong>, una entrante rocosa con un chiringuito mítico colgado del acantilado. Un poco más al sur, Cala Boadella regala un fondo de posidonia ideal para el primer snorkel del día.' },
      { t: 'h2', text: 'Parada 2 · Cala Giverola y Cala Pola (Tossa)', id: 'tossa' },
      { t: 'p', html: 'Rumbo norte aparece <strong>Tossa de Mar</strong>, con su villa medieval amurallada asomada al mar (espectacular desde el agua). Fondea en Cala Giverola o Cala Pola, dos calas de arena entre pinares con muy buen tenedero.' },
      { t: 'h2', text: 'Parada 3 · Las Islas Medes (L’Estartit)', id: 'medes' },
      { t: 'p', html: 'El gran final: las <strong>Islas Medes</strong>, la mayor reserva marina del Mediterráneo español. Aquí no se fondea con ancla —hay campo de boyas obligatorio— pero el snorkel sobre meros enormes y cuevas como la del Bisbe es de otro planeta.' },
      { t: 'quote', text: 'Sal temprano: en julio y agosto los fondeos de las Medes se llenan a media mañana y el acceso al buceo está limitado por cupo.', cite: 'Consejo de navegante' },
      { t: 'cta', href: '/alquiler-barco/costas/costa-brava', label: 'Alquilar un barco en la Costa Brava', sub: 'Con o sin patrón, precios y fondeos por localidad' },
      { t: 'h2', text: 'Cómo organizar el día', id: 'plan' },
      { t: 'ul', items: [
        'Madruga: a las 9-10h ya deberías estar navegando.',
        'Lleva 2 anclas y cabo de sobra; muchos fondeos son de roca.',
        'Combustible aparte: calcula 15-20 L/hora a velocidad de crucero.',
        'Con tramuntana (viento del norte) cambia el plan: refúgiate al sur.',
      ] },
    ],
    faq: [
      { q: '¿Necesito licencia para esta ruta?', a: 'Para lancha hasta 5,5 m y motor de 15CV no. Para barcos mayores necesitas el PER o contratar patrón. En días de tramuntana, mejor con patrón siempre.' },
      { q: '¿Cuánto cuesta el día de barco en la Costa Brava?', a: 'Una lancha pequeña desde unos 100-125 €/día sin combustible. Con patrón, desde 250 €. Consulta precios por localidad en nuestra sección de alquiler.' },
    ],
    en: {
      title: 'The best coves of the Costa Brava by boat: a one-day route',
      excerpt: 'From Lloret to the Medes Islands: a one-day itinerary through the most beautiful coves of the Costa Brava, many reachable only from the sea.',
      related: [
        { href: '/en/boat-rental/coasts/costa-brava', label: 'Boat rental on the Costa Brava' },
        { href: '/en/routes', label: 'More beach routes in Spain' },
      ],
      body: [
        { t: 'p', html: 'The Costa Brava hides its best face away from the promenades: dozens of turquoise coves wedged between slate cliffs and pine groves, many <strong>with no road access</strong>. The only way to string them together in a day is from the water. This is our favourite route, south to north.' },
        { t: 'h2', text: 'Stop 1 · Cala Banys & Cala Boadella (Lloret de Mar)', id: 'lloret' },
        { t: 'p', html: 'Leaving Lloret harbour, in 10 minutes you reach <strong>Cala Banys</strong>, a rocky inlet with a legendary beach bar clinging to the cliff. A little further south, Cala Boadella offers a posidonia seabed perfect for the first snorkel of the day.' },
        { t: 'h2', text: 'Stop 2 · Cala Giverola & Cala Pola (Tossa)', id: 'tossa' },
        { t: 'p', html: 'Heading north you reach <strong>Tossa de Mar</strong>, with its walled medieval old town overlooking the sea (stunning from the water). Anchor at Cala Giverola or Cala Pola, two sandy coves among pines with excellent holding.' },
        { t: 'h2', text: 'Stop 3 · The Medes Islands (L’Estartit)', id: 'medes' },
        { t: 'p', html: 'The grand finale: the <strong>Medes Islands</strong>, the largest marine reserve in the Spanish Mediterranean. You can’t drop anchor here —there’s a compulsory mooring field— but snorkelling over huge groupers and caves like the Cova del Bisbe is out of this world.' },
        { t: 'quote', text: 'Set off early: in July and August the Medes moorings fill up by mid-morning and diving access is capped.', cite: 'Sailor’s tip' },
        { t: 'cta', href: '/en/boat-rental/coasts/costa-brava', label: 'Rent a boat on the Costa Brava', sub: 'With or without a skipper, prices and anchorages by town' },
        { t: 'h2', text: 'Planning the day', id: 'plan' },
        { t: 'ul', items: [
          'Start early: you want to be sailing by 9-10am.',
          'Bring 2 anchors and plenty of rode; many anchorages are rocky.',
          'Fuel is extra: budget 15-20 L/hour at cruising speed.',
          'With tramuntana (north wind), change the plan and shelter to the south.',
        ] },
      ],
      faq: [
        { q: 'Do I need a licence for this route?', a: 'Not for a boat up to 5.5 m with a 15HP engine. For larger boats you need the Spanish PER licence or a hired skipper. On tramuntana days, always go with a skipper.' },
        { q: 'How much does a day on a boat cost on the Costa Brava?', a: 'A small boat from about €100-125/day without fuel. With a skipper, from €250. Check prices by town in our rental section.' },
      ],
    },
  },

  // ─────────────────────── CURIOSIDADES ───────────────────────
  {
    slug: 'por-que-arena-blanca-o-negra',
    category: 'curiosidades',
    title: '¿Por qué hay playas de arena blanca, dorada o negra?',
    excerpt:
      'El color de la arena cuenta la historia geológica de cada costa: del cuarzo del Caribe a la lava de Canarias. Te explicamos por qué.',
    heroAlt: 'Contraste entre arena negra volcánica y arena blanca',
    heroQuery: 'sand,beach,volcanic,texture',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-02T00:00:00Z',
    readingMin: 4,
    related: [
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas cristalinas' },
      { href: '/islas', label: 'Las mejores playas de las islas' },
      { href: '/comunidad/canarias', label: 'Playas de Canarias' },
    ],
    body: [
      { t: 'p', html: 'No hay dos arenas iguales. Su color y su tacto dependen de <strong>de qué roca proceden</strong> y de cuánto las ha trabajado el mar. Estos son los grandes tipos que verás en España.' },
      { t: 'h2', text: 'Arena dorada: la más común', id: 'dorada' },
      { t: 'p', html: 'El tono dorado del Mediterráneo y el Atlántico peninsular viene de la mezcla de <strong>cuarzo y feldespato</strong> erosionados de la montaña y arrastrados por los ríos. Cuanto más fina, más ha viajado.' },
      { t: 'h2', text: 'Arena blanca: cuarzo puro o conchas', id: 'blanca' },
      { t: 'p', html: 'Las arenas casi blancas (piensa en Ses Illetes, Formentera) son <strong>cuarzo muy puro</strong> o restos triturados de conchas y esqueletos calcáreos. Reflejan tanta luz que el agua encima parece turquesa.' },
      { t: 'h2', text: 'Arena negra: volcánica', id: 'negra' },
      { t: 'p', html: 'En Canarias —y en algún rincón de la costa— la arena negra es <strong>basalto pulverizado</strong>, lava enfriada y machacada por el oleaje. Se calienta muchísimo al sol: cuidado con los pies descalzos al mediodía.' },
      { t: 'quote', text: 'La playa de las Teresitas (Tenerife) es una excepción famosa: su arena dorada es importada del Sáhara, porque la original era negra.' },
      { t: 'h2', text: 'Callaos y gravas', id: 'callaos' },
      { t: 'p', html: 'En costas jóvenes y de mucha pendiente, como parte de la Costa Brava o el Cantábrico, el mar no ha tenido tiempo de triturar la roca: quedan <strong>cantos rodados</strong>. Incómodos para la toalla, pero suelen significar agua muy limpia.' },
    ],
    faq: [
      { q: '¿La arena negra es peligrosa?', a: 'No es tóxica, pero retiene mucho calor: puede quemar los pies a mediodía. Usa calzado de agua y evita tumbarte sin esterilla aislante.' },
      { q: '¿Por qué el agua sobre arena blanca se ve turquesa?', a: 'La arena clara refleja la luz solar hacia arriba a través del agua; el agua absorbe los rojos y deja pasar los azules y verdes, de ahí el turquesa.' },
    ],
    en: {
      title: 'Why are some beaches white, golden or black sand?',
      excerpt: 'The colour of the sand tells the geological story of each coast: from Caribbean quartz to Canary lava. Here’s why.',
      related: [
        { href: '/en/blue-flag', label: 'Blue Flag beaches in Spain' },
        { href: '/en/communities/canarias', label: 'Beaches of the Canary Islands' },
      ],
      body: [
        { t: 'p', html: 'No two sands are alike. Their colour and texture depend on <strong>which rock they come from</strong> and how much the sea has worked them. These are the main types you’ll see in Spain.' },
        { t: 'h2', text: 'Golden sand: the most common', id: 'golden' },
        { t: 'p', html: 'The golden tone of the Mediterranean and the Atlantic mainland comes from a mix of <strong>quartz and feldspar</strong> eroded from the mountains and carried down by rivers. The finer it is, the further it has travelled.' },
        { t: 'h2', text: 'White sand: pure quartz or shells', id: 'white' },
        { t: 'p', html: 'Near-white sands (think Ses Illetes, Formentera) are <strong>very pure quartz</strong> or crushed remains of shells and calcareous skeletons. They reflect so much light that the water above looks turquoise.' },
        { t: 'h2', text: 'Black sand: volcanic', id: 'black' },
        { t: 'p', html: 'In the Canary Islands —and the odd mainland spot— black sand is <strong>pulverised basalt</strong>, cooled lava ground down by the waves. It gets extremely hot in the sun: watch your bare feet at midday.' },
        { t: 'quote', text: 'Las Teresitas beach (Tenerife) is a famous exception: its golden sand was imported from the Sahara, because the original was black.' },
        { t: 'h2', text: 'Pebbles and gravel', id: 'pebbles' },
        { t: 'p', html: 'On young, steep coasts like parts of the Costa Brava or the Cantabrian coast, the sea hasn’t had time to grind the rock down: you get <strong>pebbles</strong>. Awkward for your towel, but usually a sign of very clean water.' },
      ],
      faq: [
        { q: 'Is black sand dangerous?', a: 'It’s not toxic, but it holds a lot of heat and can burn your feet at midday. Use water shoes and avoid lying down without an insulating mat.' },
        { q: 'Why does water over white sand look turquoise?', a: 'Pale sand reflects sunlight back up through the water; water absorbs reds and lets blues and greens through, hence the turquoise.' },
      ],
    },
  },

  // ─────────────────────── GASTRONOMÍA ───────────────────────
  {
    slug: 'guia-chiringuitos-comer-en-la-playa',
    category: 'gastronomia',
    title: 'Comer en la playa: guía de chiringuitos y producto local por costas',
    excerpt:
      'Del espeto malagueño a la caldereta menorquina: qué pedir y dónde en cada costa para comer bien a pie de arena.',
    heroAlt: 'Espetos de sardinas asándose en un chiringuito a pie de playa',
    heroQuery: 'beach,restaurant,seafood,spain',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-02T00:00:00Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/andalucia', label: 'Playas de Andalucía' },
      { href: '/comunidad/islas-baleares', label: 'Playas de Baleares' },
      { href: '/rutas', label: 'Rutas de playas por costas' },
    ],
    body: [
      { t: 'p', html: 'Comer junto al mar en España es media razón del viaje. Cada costa tiene su plato de chiringuito y su producto estrella. Esta es la chuleta para no fallar.' },
      { t: 'h2', text: 'Costa del Sol: el espeto', id: 'sol' },
      { t: 'p', html: 'En Málaga el rey es el <strong>espeto de sardinas</strong>, asado en una barca de arena con leña de olivo. Se pide por número de espetos y se come con las manos. Acompáñalo de ensalada malagueña y vino blanco fresco.' },
      { t: 'h2', text: 'Levante y Costa Blanca: arroces', id: 'levante' },
      { t: 'p', html: 'Aquí manda el <strong>arroz</strong>: paella valenciana de verdad (pollo, conejo, garrofó… nunca chorizo), arroz a banda o arroz del senyoret. Mediodía, nunca de noche, y a fuego de leña si puedes.' },
      { t: 'h2', text: 'Baleares: caldereta y peix', id: 'baleares' },
      { t: 'p', html: 'Menorca presume de <strong>caldereta de langosta</strong> (cara pero memorable, sobre todo en Fornells). En Mallorca e Ibiza busca el <em>peix sec</em>, la <em>bullit de peix</em> y el <em>guisat de marisc</em>.' },
      { t: 'h2', text: 'Galicia y Cantábrico: marisco y pescado', id: 'norte' },
      { t: 'p', html: 'En las Rías Baixas, <strong>pulpo á feira</strong>, mejillones y berberechos directos de la batea. En el Cantábrico, rabas, bonito del norte y sardinas. Producto sobre todo: cuanto menos lo toquen, mejor.' },
      { t: 'cta', href: '/comunidad/andalucia', label: 'Explorar playas de Andalucía', sub: 'Y los chiringuitos de la Costa del Sol' },
      { t: 'h2', text: 'Reglas de oro del chiringuito', id: 'reglas' },
      { t: 'ul', items: [
        'Mira dónde comen los locales, no dónde hay fotos en el menú.',
        'El pescado del día se pregunta, no se lee.',
        'Reserva en agosto o ve pronto: a las 14:30 ya no hay mesa.',
        'Producto de temporada > carta interminable.',
      ] },
    ],
    faq: [
      { q: '¿Qué es un espeto?', a: 'Sardinas (u otro pescado) ensartadas en una caña y asadas a un lado de las brasas, típicas de la Costa del Sol. Se hacen en una barca llena de arena para proteger la madera del fuego.' },
      { q: '¿Cuándo se come la paella, mediodía o noche?', a: 'En la Comunidad Valenciana la paella es plato de mediodía. Cenar paella es cosa de zonas muy turísticas; para comerla bien, hazlo a la hora del almuerzo.' },
    ],
    en: {
      title: 'Eating on the beach: a guide to chiringuitos and local food by coast',
      excerpt: 'From the Málaga espeto to Menorcan lobster stew: what to order and where, coast by coast, to eat well right on the sand.',
      related: [
        { href: '/en/communities/andalucia', label: 'Beaches of Andalusia' },
        { href: '/en/communities/islas-baleares', label: 'Beaches of the Balearic Islands' },
      ],
      body: [
        { t: 'p', html: 'Eating by the sea in Spain is half the reason for the trip. Every coast has its beach-bar dish and its star produce. Here’s the cheat sheet so you don’t get it wrong.' },
        { t: 'h2', text: 'Costa del Sol: the espeto', id: 'sol' },
        { t: 'p', html: 'In Málaga the king is the <strong>sardine espeto</strong>, grilled on a sand-filled boat over olive-wood embers. You order it by the number of skewers and eat with your hands, with a Málaga salad and chilled white wine.' },
        { t: 'h2', text: 'Levante & Costa Blanca: rice dishes', id: 'levante' },
        { t: 'p', html: 'Here <strong>rice</strong> rules: real Valencian paella (chicken, rabbit, garrofó beans… never chorizo), arroz a banda or arroz del senyoret. Lunchtime only, never at night, over a wood fire if you can.' },
        { t: 'h2', text: 'Balearics: stews and peix', id: 'balearics' },
        { t: 'p', html: 'Menorca boasts <strong>lobster stew</strong> (pricey but unforgettable, especially in Fornells). In Mallorca and Ibiza look for <em>peix sec</em>, <em>bullit de peix</em> and <em>guisat de marisc</em>.' },
        { t: 'h2', text: 'Galicia & the north: shellfish and fish', id: 'north' },
        { t: 'p', html: 'In the Rías Baixas, <strong>pulpo á feira</strong> (octopus), mussels and cockles straight from the raft. On the Cantabrian coast, fried squid, North Atlantic bonito and sardines. Produce above all: the less they touch it, the better.' },
        { t: 'cta', href: '/en/communities/andalucia', label: 'Explore the beaches of Andalusia', sub: 'And the chiringuitos of the Costa del Sol' },
        { t: 'h2', text: 'Golden rules of the chiringuito', id: 'rules' },
        { t: 'ul', items: [
          'Look where the locals eat, not where there are photos on the menu.',
          'The catch of the day is asked for, not read.',
          'Book in August or go early: by 2:30pm there are no tables left.',
          'Seasonal produce beats an endless menu.',
        ] },
      ],
      faq: [
        { q: 'What is an espeto?', a: 'Sardines (or other fish) skewered on a cane and grilled beside the embers, typical of the Costa del Sol. They’re cooked on a sand-filled boat to protect the wood from the fire.' },
        { q: 'Is paella eaten at lunch or dinner?', a: 'In the Valencia region paella is a lunch dish. Eating paella for dinner is a tourist-area thing; to have it at its best, go at lunchtime.' },
      ],
    },
  },

  // ─────────────────────── GUÍAS PRÁCTICAS ───────────────────────
  {
    slug: 'mejor-hora-ir-a-la-playa-verano',
    category: 'guias',
    title: 'La mejor hora para ir a la playa en verano (y cuándo evitarla)',
    excerpt:
      'Radiación UV, viento térmico, mareas y aparcamiento: la guía para elegir la hora perfecta y huir de las horas malas.',
    heroAlt: 'Playa tranquila a primera hora de la mañana con sombras largas',
    heroQuery: 'beach,morning,calm,summer',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-02T00:00:00Z',
    readingMin: 5,
    related: [
      { href: '/medusas', label: 'Riesgo de medusas por playa' },
      { href: '/banderas-azules', label: 'Playas con bandera azul' },
      { href: '/familias', label: 'Mejores playas para ir con niños' },
    ],
    body: [
      { t: 'p', html: 'No todas las horas de playa son iguales. Elegir bien la franja marca la diferencia entre un día redondo y volver quemado, sin sombra y sin sitio para el coche. Esta es la guía rápida.' },
      { t: 'h2', text: 'La franja de oro: antes de las 11:00', id: 'manana' },
      { t: 'p', html: 'Por la mañana temprano el sol aún no aprieta, el <strong>mar suele estar en calma</strong> (el viento térmico entra a mediodía) y encuentras aparcamiento. Es la mejor hora para familias con niños y para fotos.' },
      { t: 'h2', text: 'La hora a evitar: 12:00 a 16:00', id: 'mediodia' },
      { t: 'p', html: 'Es la franja de <strong>radiación UV máxima</strong>: el índice supera con frecuencia el nivel 8 (muy alto). Si vas, sombra obligatoria, crema cada 2 horas y nada de bebés al sol directo. También es cuando más aprieta el viento de tarde en el Mediterráneo.' },
      { t: 'quote', text: 'Regla de la sombra: si tu sombra es más corta que tu altura, el sol está lo bastante alto como para quemarte rápido. Busca sombra.' },
      { t: 'h2', text: 'La segunda ventana: a partir de las 17:00', id: 'tarde' },
      { t: 'p', html: 'Cae la UV, baja la gente y la luz se vuelve dorada. Ideal si te gusta el ambiente tranquilo y quedarte al atardecer. Ojo: en algunas playas el socorrismo termina su turno, así que extrema precaución con el baño.' },
      { t: 'h2', text: 'Factores que cambian la ecuación', id: 'factores' },
      { t: 'ul', items: [
        'Marea: en el Atlántico y Cantábrico la marea baja multiplica la arena disponible; consúltala antes de ir.',
        'Viento: el Levante y la tramuntana pueden estropear la tarde; mira el parte.',
        'Orientación: las playas que miran al este se quedan en sombra antes por la tarde.',
        'Medusas: con viento de mar y agua templada sube el riesgo; revisa la ficha de la playa.',
      ] },
      { t: 'cta', href: '/medusas', label: 'Ver el riesgo de medusas de tu playa', sub: 'Estimación por temperatura del agua y viento, playa a playa' },
    ],
    faq: [
      { q: '¿A qué hora pega más fuerte el sol?', a: 'Entre las 12:00 y las 16:00 (hora solar), cuando el sol está más alto y el índice UV es máximo. En verano en España puede superar el nivel 8 (muy alto). Evita el sol directo en esa franja.' },
      { q: '¿Es mejor la playa por la mañana o por la tarde?', a: 'La mañana (antes de las 11h) suele ganar: mar en calma, menos gente, aparcamiento y UV más baja. La tarde (tras las 17h) es la segunda mejor opción por el ambiente y la luz.' },
    ],
    en: {
      title: 'The best time to go to the beach in summer (and when to avoid it)',
      excerpt: 'UV radiation, thermal wind, tides and parking: the guide to picking the perfect hour and dodging the bad ones.',
      related: [
        { href: '/en/blue-flag', label: 'Blue Flag beaches' },
        { href: '/en/dog-beaches', label: 'Dog-friendly beaches' },
      ],
      body: [
        { t: 'p', html: 'Not all beach hours are equal. Picking the right slot is the difference between a perfect day and coming home sunburnt, with no shade and nowhere to park. Here’s the quick guide.' },
        { t: 'h2', text: 'The golden slot: before 11am', id: 'morning' },
        { t: 'p', html: 'Early morning the sun isn’t fierce yet, the <strong>sea is usually calm</strong> (the thermal wind kicks in at midday) and you’ll find parking. It’s the best time for families with kids and for photos.' },
        { t: 'h2', text: 'The hour to avoid: 12pm to 4pm', id: 'midday' },
        { t: 'p', html: 'This is the <strong>peak UV</strong> window: the index often tops level 8 (very high). If you go, shade is a must, sunscreen every 2 hours and no babies in direct sun. It’s also when the afternoon wind picks up in the Mediterranean.' },
        { t: 'quote', text: 'Shadow rule: if your shadow is shorter than your height, the sun is high enough to burn you fast. Find shade.' },
        { t: 'h2', text: 'The second window: after 5pm', id: 'afternoon' },
        { t: 'p', html: 'UV drops, crowds thin out and the light turns golden. Ideal if you like a quiet vibe and staying for sunset. Note: at some beaches the lifeguard shift ends, so take extra care swimming.' },
        { t: 'h2', text: 'Factors that change the equation', id: 'factors' },
        { t: 'ul', items: [
          'Tide: on the Atlantic and Cantabrian coasts low tide multiplies the available sand; check it before you go.',
          'Wind: the Levante and tramuntana can ruin the afternoon; check the forecast.',
          'Orientation: east-facing beaches fall into shade earlier in the afternoon.',
          'Jellyfish: onshore wind plus warm water raises the risk; check the beach page.',
        ] },
        { t: 'cta', href: '/en/blue-flag', label: 'Find top-quality beaches', sub: 'Blue Flag beaches across Spain' },
      ],
      faq: [
        { q: 'When is the sun strongest?', a: 'Between 12pm and 4pm (solar time), when the sun is highest and the UV index peaks. In summer in Spain it can exceed level 8 (very high). Avoid direct sun in that window.' },
        { q: 'Is the beach better in the morning or afternoon?', a: 'The morning (before 11am) usually wins: calm sea, fewer people, parking and lower UV. The afternoon (after 5pm) is the second-best option for the atmosphere and light.' },
      ],
    },
  },
]

// ── Helpers ──────────────────────────────────────────────────
export const getAllArticles = (): Article[] =>
  [...ARTICLES].sort((a, b) => b.datePublished.localeCompare(a.datePublished))

export const getArticleBySlug = (slug: string): Article | undefined =>
  ARTICLES.find((a) => a.slug === slug)

export const getArticlesByCategory = (cat: MagazineCategory): Article[] =>
  getAllArticles().filter((a) => a.category === cat)

// EN: solo artículos con traducción publicada.
export const getAllArticlesEn = (): Article[] =>
  getAllArticles().filter((a) => !!a.en)

export const getArticlesByCategoryEn = (cat: MagazineCategory): Article[] =>
  getAllArticlesEn().filter((a) => a.category === cat)
