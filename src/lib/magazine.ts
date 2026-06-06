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

  // ─────────── CURIOSIDADES · voice NatGeo (gancho geológico) ───────────
  {
    slug: 'playa-murcia-esculturas-arena-erosion',
    category: 'curiosidades',
    title: 'La playa de Murcia con esculturas de arena que talló el viento: parecen de otro planeta',
    excerpt:
      'En Bolnuevo, junto a Mazarrón, la erosión ha modelado durante miles de años unas formas que parecen sacadas de un decorado de ciencia ficción.',
    heroAlt: 'Formaciones erosionadas de arenisca dorada junto al mar en Bolnuevo, Murcia',
    heroQuery: 'bolnuevo,gredas,erosion,murcia',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-05T00:00:00Z',
    readingMin: 4,
    related: [
      { href: '/comunidad/murcia', label: 'Playas de Murcia' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas de España' },
      { href: '/calas-secretas', label: 'Calas secretas y poco masificadas' },
    ],
    body: [
      { t: 'p', html: 'Al final de un paseo marítimo cualquiera, donde uno esperaría más arena y más sombrillas, el paisaje se quiebra: media docena de torres ocres se levantan del suelo como setas gigantes, agujereadas y retorcidas, recortadas contra el azul del Mediterráneo. No es una instalación de arte. Es lo que el viento y la lluvia llevan miles de años esculpiendo en la costa de Murcia.' },
      { t: 'h2', text: 'Cuatro millones de años de paciencia', id: 'geologia' },
      { t: 'p', html: 'Las Gredas de Bolnuevo, en el municipio de Mazarrón, son formaciones de <strong>arenisca y arcilla</strong> del Plioceno. La roca, blanda y desigual, cede de forma distinta según su dureza: las capas más resistentes quedan arriba a modo de sombrero y protegen un pedestal más frágil que el agua y el viento van afilando. El resultado son esos hongos y agujas que parecen a punto de derrumbarse y, sin embargo, llevan ahí siglos.' },
      { t: 'h2', text: 'Un decorado natural', id: 'paisaje' },
      { t: 'p', html: 'La estampa, especialmente al atardecer cuando la luz rasante enciende el ocre, ha convertido este rincón en uno de los más fotografiados del litoral murciano. Justo al lado se abre una <strong>playa amplia de arena oscura</strong> y aguas tranquilas, así que la visita combina el asombro geológico con el baño.' },
      { t: 'h2', text: 'Cómo llegar y cuándo ir', id: 'visita' },
      { t: 'p', html: 'Las gredas están al pie de la carretera, en el extremo oeste del paseo de Bolnuevo, a unos 5 km de Mazarrón; hay aparcamiento cerca. Se ven en cualquier momento, pero la mejor luz para fotografiarlas es la primera y la última hora del día. Conviene <strong>no caminar sobre las formaciones</strong>: son frágiles y están protegidas.' },
      { t: 'quote', text: 'Lo que parece un capricho de escenógrafo es, en realidad, geología pura: la prueba de que el viento también esculpe.' },
    ],
    faq: [
      { q: '¿Qué son las Gredas de Bolnuevo?', a: 'Formaciones de arenisca y arcilla del Plioceno (unos 4 millones de años) erosionadas por el viento y la lluvia en Mazarrón, Murcia. Tienen forma de hongos y agujas y están protegidas.' },
      { q: '¿Se puede uno bañar allí?', a: 'Sí: junto a las gredas hay una playa amplia de arena oscura y aguas tranquilas, con servicios en el paseo de Bolnuevo.' },
    ],
    en: {
      title: 'The Murcia beach with sand sculptures carved by the wind: they look from another planet',
      excerpt: 'At Bolnuevo, near Mazarrón, erosion has shaped formations over thousands of years that look straight out of a science-fiction set.',
      related: [
        { href: '/en/communities/murcia', label: 'Beaches of Murcia' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'At the end of an ordinary promenade, where you’d expect more sand and more parasols, the landscape cracks open: half a dozen ochre towers rise from the ground like giant mushrooms, pitted and twisted, silhouetted against the blue Mediterranean. It isn’t an art installation. It’s what wind and rain have been sculpting on the Murcia coast for thousands of years.' },
        { t: 'h2', text: 'Four million years of patience', id: 'geology' },
        { t: 'p', html: 'The Gredas de Bolnuevo, in the municipality of Mazarrón, are <strong>sandstone and clay</strong> formations from the Pliocene. The soft, uneven rock erodes differently depending on its hardness: the tougher layers cap the top and shield a more fragile pedestal that water and wind keep whittling. The result is those mushrooms and spires that look about to collapse and yet have stood for centuries.' },
        { t: 'h2', text: 'A natural film set', id: 'landscape' },
        { t: 'p', html: 'The scene — especially at sunset, when low light sets the ochre ablaze — has made this one of the most photographed corners of the Murcia coast. Right beside it stretches a <strong>broad dark-sand beach</strong> with calm water, so a visit combines geological wonder with a swim.' },
        { t: 'h2', text: 'How to get there and when to go', id: 'visit' },
        { t: 'p', html: 'The formations sit right by the road, at the western end of the Bolnuevo promenade, about 5 km from Mazarrón; there’s parking nearby. They’re visible any time, but the best light for photos is early morning and late afternoon. Please <strong>don’t walk on the formations</strong>: they’re fragile and protected.' },
        { t: 'quote', text: 'What looks like a set designer’s whim is, in fact, pure geology: proof that the wind sculpts too.' },
      ],
      faq: [
        { q: 'What are the Gredas de Bolnuevo?', a: 'Pliocene sandstone and clay formations (about 4 million years old) eroded by wind and rain in Mazarrón, Murcia. They’re shaped like mushrooms and spires and are protected.' },
        { q: 'Can you swim there?', a: 'Yes: next to the formations there’s a broad dark-sand beach with calm water and services along the Bolnuevo promenade.' },
      ],
    },
  },

  // ─────────── RUTAS · voice NatGeo (parque natural + acceso) ───────────
  {
    slug: 'ruta-calas-cabo-de-gata-almeria',
    category: 'rutas',
    title: 'Las calas vírgenes de Cabo de Gata: una ruta por el rincón más salvaje del Mediterráneo',
    excerpt:
      'Mónsul, Los Genoveses, El Playazo: un itinerario por las playas de un parque natural volcánico donde el desierto se asoma al mar.',
    heroAlt: 'Cala de arena dorada entre rocas volcánicas en el Cabo de Gata, Almería',
    heroQuery: 'cabo-de-gata,monsul,almeria,volcanic',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-05T00:00:00Z',
    readingMin: 6,
    related: [
      { href: '/comunidad/andalucia', label: 'Playas de Andalucía' },
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas cristalinas' },
      { href: '/calas-secretas', label: 'Calas secretas' },
    ],
    body: [
      { t: 'p', html: 'Hay un trozo de costa en Almería donde no hay paseo marítimo, ni hileras de hoteles, ni apenas sombra. Solo roca volcánica, arena dorada y un mar tan transparente que cuesta creer que siga siendo España. Es el Parque Natural de Cabo de Gata-Níjar, el rincón más árido y, para muchos, el más bello del litoral mediterráneo.' },
      { t: 'h2', text: 'Mónsul, la playa de cine', id: 'monsul' },
      { t: 'p', html: 'Quien haya visto <em>Indiana Jones y la última cruzada</em> reconocerá la <strong>duna y la roca con forma de ola</strong> de Mónsul: aquí se rodó la escena de la playa. También pasó por estas arenas <em>El viento y el león</em>. Es pequeña, sin servicios y con aparcamiento restringido en verano, lo que la mantiene asombrosamente virgen para su fama.' },
      { t: 'h2', text: 'Los Genoveses, la gran bahía', id: 'genoveses' },
      { t: 'p', html: 'A un paso, <strong>Los Genoveses</strong> es lo contrario: un arco de casi un kilómetro de arena fina, dunas y agaves, con aguas someras ideales para familias. Debe su nombre a la flota genovesa que fondeó aquí en el siglo XVI. Sin chiringuitos ni edificios: el parque la protege intacta.' },
      { t: 'h2', text: 'El Playazo y las calas escondidas', id: 'playazo' },
      { t: 'p', html: 'Más al norte, <strong>El Playazo de Rodalquilar</strong> se abre entre un castillo del XVIII y antiguas minas de oro. Y entre cala y cala se esconden rincones a los que solo se llega a pie o en barco —Cala de San Pedro, con su manantial y su ambiente alternativo, es la más mítica.' },
      { t: 'quote', text: 'En Cabo de Gata el lujo es la ausencia: ni un edificio en el horizonte, ni una farola que apague las estrellas.' },
      { t: 'h2', text: 'Cómo recorrerlo', id: 'plan' },
      { t: 'ul', items: [
        'Base en San José o Las Negras; el resto son pistas y senderos.',
        'En julio-agosto el acceso a Mónsul y Los Genoveses se regula con bus y aparcamiento de pago: llega temprano.',
        'Lleva agua y sombra: es un desierto, hay poquísima.',
        'Las calas más vírgenes (San Pedro) se alcanzan a pie o en barco.',
      ] },
    ],
    faq: [
      { q: '¿Dónde se rodó la escena de la playa de Indiana Jones?', a: 'En la playa de Mónsul, en el Parque Natural de Cabo de Gata (Almería), reconocible por su gran roca con forma de ola. También se rodó allí "El viento y el león".' },
      { q: '¿Hay que pagar por acceder a las calas de Cabo de Gata?', a: 'En temporada alta (julio-agosto) el acceso en coche a Mónsul y Los Genoveses se restringe; suele haber bus lanzadera y aparcamiento de pago. Fuera de temporada se llega en coche.' },
      { q: '¿Cuál es la cala más virgen?', a: 'Cala de San Pedro, accesible solo a pie o en barco, con un manantial de agua dulce y un característico ambiente alternativo.' },
    ],
    en: {
      title: 'The wild coves of Cabo de Gata: a route through the Mediterranean’s most untamed corner',
      excerpt: 'Mónsul, Los Genoveses, El Playazo: an itinerary through the beaches of a volcanic natural park where the desert meets the sea.',
      related: [
        { href: '/en/communities/andalucia', label: 'Beaches of Andalusia' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'There’s a stretch of coast in Almería with no promenade, no rows of hotels, barely any shade. Just volcanic rock, golden sand and water so clear it’s hard to believe it’s still Spain. This is the Cabo de Gata-Níjar Natural Park, the most arid — and, for many, the most beautiful — corner of the Mediterranean coast.' },
        { t: 'h2', text: 'Mónsul, the film-set beach', id: 'monsul' },
        { t: 'p', html: 'Anyone who’s seen <em>Indiana Jones and the Last Crusade</em> will recognise Mónsul’s <strong>dune and wave-shaped rock</strong>: the beach scene was filmed here, as was <em>The Wind and the Lion</em>. It’s small, has no services and restricted parking in summer, which keeps it astonishingly unspoilt for its fame.' },
        { t: 'h2', text: 'Los Genoveses, the great bay', id: 'genoveses' },
        { t: 'p', html: 'Right next door, <strong>Los Genoveses</strong> is the opposite: an arc of nearly a kilometre of fine sand, dunes and agaves, with shallow water ideal for families. It takes its name from the Genoese fleet that anchored here in the 16th century. No beach bars, no buildings: the park keeps it intact.' },
        { t: 'h2', text: 'El Playazo and the hidden coves', id: 'playazo' },
        { t: 'p', html: 'Further north, <strong>El Playazo de Rodalquilar</strong> opens between an 18th-century castle and old gold mines. And between cove and cove hide spots reachable only on foot or by boat — Cala de San Pedro, with its spring and alternative vibe, is the most legendary.' },
        { t: 'quote', text: 'At Cabo de Gata the luxury is absence: not a building on the horizon, not a street lamp to dim the stars.' },
        { t: 'h2', text: 'How to do it', id: 'plan' },
        { t: 'ul', items: [
          'Base yourself in San José or Las Negras; the rest are tracks and trails.',
          'In July-August access to Mónsul and Los Genoveses is regulated with a shuttle bus and paid parking: arrive early.',
          'Bring water and shade: it’s a desert, there’s very little.',
          'The wildest coves (San Pedro) are reached on foot or by boat.',
        ] },
      ],
      faq: [
        { q: 'Where was the Indiana Jones beach scene filmed?', a: 'At Mónsul beach, in the Cabo de Gata Natural Park (Almería), recognisable by its large wave-shaped rock. "The Wind and the Lion" was also filmed there.' },
        { q: 'Do you have to pay to reach the Cabo de Gata coves?', a: 'In high season (July-August) car access to Mónsul and Los Genoveses is restricted; there’s usually a shuttle bus and paid parking. Off-season you can drive in.' },
        { q: 'Which is the wildest cove?', a: 'Cala de San Pedro, reachable only on foot or by boat, with a freshwater spring and a distinctive alternative atmosphere.' },
      ],
    },
  },

  // ─────────── GUÍAS · voice NatGeo (gancho récord/noticia) ───────────
  {
    slug: 'banderas-azules-espana-record-2026',
    category: 'guias',
    title: 'España revalida el récord de banderas azules en 2026: dónde están y qué garantizan',
    excerpt:
      'El país lidera el mundo en banderas azules. Te explicamos qué significa de verdad el distintivo y en qué costas se concentra.',
    heroAlt: 'Bandera azul ondeando en un puesto de socorrismo en una playa española',
    heroQuery: 'blue-flag,beach,spain,lifeguard',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-05T00:00:00Z',
    readingMin: 5,
    related: [
      { href: '/banderas-azules', label: 'Todas las playas con bandera azul' },
      { href: '/calidad-agua', label: 'Calidad del agua de baño' },
      { href: '/comunidad/comunitat-valenciana', label: 'Playas de la Comunidad Valenciana' },
    ],
    body: [
      { t: 'p', html: 'Cada primavera, antes de que empiece la temporada de baño, se reparte un galardón que medio país mira de reojo: la bandera azul. España vuelve a ser, un año más, el <strong>país con más banderas azules del mundo</strong>, muy por delante de Grecia y Turquía. Pero, ¿qué garantiza exactamente esa bandera que ondea en el chiringuito?' },
      { t: 'h2', text: 'Qué es (y qué no es) una bandera azul', id: 'que-es' },
      { t: 'p', html: 'La concede la FEE (Fundación para la Educación Ambiental) a través de ADEAC en España, y exige cumplir una treintena de criterios: <strong>calidad de agua excelente</strong>, socorrismo, accesibilidad, información ambiental, gestión de residuos y servicios. No mide la belleza de la playa ni su transparencia: una cala virgen espectacular puede no tener bandera azul simplemente porque carece de servicios, y una playa urbana muy equipada sí tenerla.' },
      { t: 'h2', text: 'Dónde se concentran', id: 'donde' },
      { t: 'p', html: 'La Comunidad Valenciana, Galicia, Andalucía y Cataluña encabezan el reparto año tras año. El Mediterráneo domina por número, pero el Atlántico gallego y el Cantábrico suman cada vez más. En nuestra página de banderas azules puedes ver el listado completo, playa por playa y actualizado con la resolución oficial.' },
      { t: 'h2', text: 'Cómo usar el distintivo al elegir playa', id: 'como-usar' },
      { t: 'p', html: 'La bandera azul es una buena garantía de <strong>servicios y agua limpia</strong>, ideal si viajas con niños o buscas comodidad. Pero si lo que persigues es una cala salvaje y solitaria, no la tomes como criterio: ahí manda la naturaleza, no el distintivo.' },
      { t: 'quote', text: 'La bandera azul no dice "esta es la playa más bonita", sino "esta playa está bien cuidada". Son cosas distintas.' },
    ],
    faq: [
      { q: '¿Cuántas banderas azules tiene España?', a: 'España es el país con más banderas azules del mundo, con más de 600 playas galardonadas, por delante de Grecia y Turquía. El número se actualiza cada año con la resolución de ADEAC/FEE.' },
      { q: '¿Qué garantiza una bandera azul?', a: 'Calidad de agua excelente, socorrismo, accesibilidad, gestión ambiental y servicios. No mide la belleza ni la transparencia del agua: es un distintivo de gestión y seguridad, no de paisaje.' },
      { q: '¿Una playa sin bandera azul es peor?', a: 'No necesariamente. Muchas calas vírgenes espectaculares no tienen bandera azul porque carecen de servicios o socorrismo, no porque su agua o su entorno sean malos.' },
    ],
    en: {
      title: 'Spain keeps the Blue Flag world record in 2026: where they are and what they guarantee',
      excerpt: 'The country leads the world in Blue Flags. Here’s what the award really means and which coasts have the most.',
      related: [
        { href: '/en/blue-flag', label: 'All Blue Flag beaches' },
        { href: '/en/communities/comunidad-valenciana', label: 'Beaches of the Valencia region' },
      ],
      body: [
        { t: 'p', html: 'Every spring, before the bathing season starts, an award half the country watches out for is handed out: the Blue Flag. Spain is once again the <strong>country with the most Blue Flags in the world</strong>, well ahead of Greece and Turkey. But what exactly does that flag flying at the beach bar guarantee?' },
        { t: 'h2', text: 'What a Blue Flag is (and isn’t)', id: 'what' },
        { t: 'p', html: 'It’s awarded by the FEE (Foundation for Environmental Education), through ADEAC in Spain, and requires meeting around thirty criteria: <strong>excellent water quality</strong>, lifeguards, accessibility, environmental information, waste management and services. It doesn’t measure a beach’s beauty or clarity: a stunning wild cove may have no Blue Flag simply because it lacks services, while a well-equipped urban beach may have one.' },
        { t: 'h2', text: 'Where they cluster', id: 'where' },
        { t: 'p', html: 'The Valencia region, Galicia, Andalusia and Catalonia top the list year after year. The Mediterranean dominates by number, but the Galician Atlantic and the Cantabrian coast keep adding more. On our Blue Flag page you can see the full list, beach by beach, updated with the official ruling.' },
        { t: 'h2', text: 'How to use it when choosing a beach', id: 'how' },
        { t: 'p', html: 'The Blue Flag is a good guarantee of <strong>services and clean water</strong>, ideal if you travel with kids or want comfort. But if you’re after a wild, lonely cove, don’t use it as your criterion: there, nature rules, not the award.' },
        { t: 'quote', text: 'A Blue Flag doesn’t say "this is the prettiest beach", it says "this beach is well looked after". Those are different things.' },
      ],
      faq: [
        { q: 'How many Blue Flags does Spain have?', a: 'Spain has the most Blue Flags in the world, with over 600 awarded beaches, ahead of Greece and Turkey. The number is updated each year with the ADEAC/FEE ruling.' },
        { q: 'What does a Blue Flag guarantee?', a: 'Excellent water quality, lifeguards, accessibility, environmental management and services. It doesn’t measure beauty or water clarity: it’s a management and safety mark, not a scenery one.' },
        { q: 'Is a beach without a Blue Flag worse?', a: 'Not necessarily. Many stunning wild coves have no Blue Flag because they lack services or lifeguards, not because their water or surroundings are poor.' },
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
