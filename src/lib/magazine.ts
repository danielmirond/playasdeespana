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
  },
]

// ── Helpers ──────────────────────────────────────────────────
export const getAllArticles = (): Article[] =>
  [...ARTICLES].sort((a, b) => b.datePublished.localeCompare(a.datePublished))

export const getArticleBySlug = (slug: string): Article | undefined =>
  ARTICLES.find((a) => a.slug === slug)

export const getArticlesByCategory = (cat: MagazineCategory): Article[] =>
  getAllArticles().filter((a) => a.category === cat)
