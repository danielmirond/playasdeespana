// src/lib/magazine.ts
// Capa de datos del Magazine editorial: rutas, curiosidades, restaurantes
// y guías prácticas. Sin MDX — contenido en TS (mismo patrón que el resto
// del site: data-driven, SSG, sin red en build).
//
// Para añadir un artículo: añade una entrada a ARTICLES con bloques de
// cuerpo (parr/h2/lista/cita/cta). El índice, las fichas, el sitemap y el
// enlazado se generan solos desde aquí.

// Fotos reales resueltas offline por scripts/enrich-magazine-images.mjs
// (misma cascada que las fichas de playa). Mapa slug → { url, thumb, source,
// author }. Build sin red: solo importa el JSON ya resuelto.
import HERO_IMAGES from './magazine-images.json'

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
  heroQuery: string        // término para resolver foto en Unsplash
  /** Foto real pre-resuelta por scripts/enrich-magazine-images.mjs usando
   *  la MISMA cascada que las fichas de playa (Wikimedia/Wikipedia → CC →
   *  stock). Se inyecta desde magazine-images.json al cargar el módulo; NO
   *  se edita a mano. Si falta, las páginas caen a la OG de texto. */
  heroImage?: string
  heroThumb?: string
  heroCredit?: { author?: string; source: string }
  /** Si se define ("Ciudad, Spain" o destino), la ficha muestra el widget de
   *  actividades de GetYourGuide de esa zona. Solo en artículos con lugar. */
  gygQuery?: string
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
  // ───── Diario de playas · Lanzarote (voz bicéfala) ─────
  {
    slug: 'playa-de-famara-lanzarote-risco-resaca-viento',
    category: 'rutas',
    title: 'Famara (Lanzarote): 6 km de arena bajo el risco, con una resaca que manda sobre el baño',
    excerpt:
      'Un playón virgen al pie de una pared de cientos de metros, con La Graciosa enfrente y viento de surf casi todo el año. La letra pequeña: corrientes de retorno serias, poca sombra y una vigilancia justa; se mira mucho y se nada con la cabeza.',
    heroAlt: 'Playa ancha de arena dorada al pie del Risco de Famara, con el mar batido por el viento y la isla de La Graciosa recortada al fondo',
    heroQuery: 'famara,lanzarote,beach,cliff',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-15T15:14:17Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/canarias', label: 'Playas de Canarias' },
      { href: '/islas', label: 'Playas de islas' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
    ],
    body: [
      { t: 'p', html: 'Se llega a Famara por una carretera que baja desde Teguise hacia el noroeste de Lanzarote y, al doblar la última loma, el paisaje cambia de golpe: a la izquierda se abre un playón de arena dorada de varios kilómetros; a la derecha, cerrándolo entero, se levanta el Risco de Famara, una muralla de roca volcánica de cientos de metros que cae casi a plomo sobre la costa. Enfrente, recortada sobre un mar casi siempre picado, la silueta baja de La Graciosa. No hay palmeras de folleto ni chiringuitos en fila: hay viento, arena y una pared que empequeñece a todo lo que se le pone debajo.' },
      { t: 'p', html: 'Es media mañana y el alisio ya sopla del nordeste, como casi todos los días. Media docena de figuras con neopreno rema mar adentro entre las series; en la orilla, alguien pelea con la sombrilla que el viento intenta arrancarle. Aquí creció César Manrique y aquí se aprende a mirar el mar de otra forma, porque el mar de Famara no es un decorado: se mueve, tira y avisa. La estampa es enorme y hermosa; el baño, otra historia.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Empecemos por lo grande y lo cierto: Famara es una playa <strong>abierta al Atlántico</strong> de unos seis kilómetros, en el municipio de Teguise, al pie del <strong>Risco de Famara</strong>, el gran escarpe del norte de Lanzarote que corona el techo de la isla, las Peñas del Chache. La arena es dorada y con la marea baja —el Atlántico tiene un rango de marea muy superior al del Mediterráneo— descubre una lengua ancha y firme. Detrás asoma el <strong>Parque Natural del Archipiélago Chinijo</strong>, con La Graciosa enfrente. Es una de las postales grandes de Canarias, y no le hace falta ningún adjetivo prestado.' },
      { t: 'p', html: 'Ahora la letra pequeña, que en Famara pesa más que en casi ninguna otra playa de esta guía. Ese mismo mar abierto que la hace espectacular es el que la vuelve <strong>exigente para el baño</strong>: rompe con fuerza y genera <strong>corrientes de retorno</strong> —la resaca que forma el propio oleaje al volver mar adentro— que se llevan mar adentro a quien se confía. No es folclore: es la razón por la que Famara es meca del surf y no una piscina para chapotear. La vigilancia es limitada y estacional, así que buena parte del año <strong>nadie va a avisarte</strong> de que ese día el mar no está para meterse. La bandera que de verdad importa aquí no es ninguna distinción turística, sino la roja o amarilla del puesto de socorro cuando lo hay: si ondea, se respeta.' },
      { t: 'p', html: 'El segundo aviso es el <strong>viento</strong>. El alisio del nordeste sopla en Famara con constancia casi todo el año —por eso es un destino de surf, windsurf y kite reconocido—, y para el bañista que solo quiere tumbarse eso significa <strong>arena volando</strong> a ras de suelo y sombrillas que no aguantan. Súmale que <strong>no hay sombra natural</strong>: ni un árbol, ni un saliente del risco que cubra al mediodía. Los servicios están en <strong>Caleta de Famara</strong>, el pueblo bajo de casas blancas y escuelas de surf que hay en un extremo; el resto del arenal es abierto y desnudo. Lleva agua, crema y algo con que taparte del viento, porque abajo no hay dónde comprarlo.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Cuándo sí: si vas a <strong>surfear o a mirar</strong>, casi cualquier día es bueno —Famara funciona con marejada del norte y viento propio—, y para pasear el arenal a marea baja pocos sitios ganan a esto. Si lo que quieres es <strong>bañarte tranquilo</strong>, elige un día de mar plano, quédate en la parte de dentro cerca de Caleta de Famara, entra solo si hay socorrista y no te alejes de donde haces pie. Cuándo no: un día de mar de fondo del norte, con series grandes y el puesto sin vigilancia, metiéndote a nadar lejos de la orilla. Ahí es donde ocurren los sustos. El truco del que va a menudo: mirar el <strong>parte de oleaje y viento</strong> (AEMET, o cualquier parte de surf de la isla) antes de salir de casa, e ir por la <strong>mañana</strong>, cuando el alisio todavía no ha arreciado del todo.' },
      { t: 'p', html: 'El viento a vigilar es el propio <strong>alisio del nordeste</strong>: es el que levanta la arena y el que, cuando se combina con marejada, deja el mar imposible para el baño y perfecto para la tabla. ¿La alternativa si Famara está brava o el viento no deja ni sentarse? En el mismo norte, la <strong>playa del Risco</strong> —bajo el mirador del Río, a la que se baja por un sendero exigente— ofrece un baño mucho más resguardado frente a La Graciosa; y en la propia isla vecina, las <strong>playas de La Graciosa</strong> (Las Conchas también es ventosa y con corriente, pero La Francesa o el Salado son más mansas). Si viajas con niños pequeños y buscas agua quieta de verdad, Famara no es tu playa: cruza al sur turístico de Lanzarote, a las calas resguardadas de Papagayo, y guarda Famara para el paseo y la foto del risco.' },
      { t: 'quote', text: 'Famara no es una piscina natural: es un mar de surf con una pared de cientos de metros detrás. La foto es descomunal; el baño, con la resaca del día en la cabeza y un ojo puesto en la orilla.' },
      { t: 'p', html: 'A última hora, cuando el sol se pone por detrás de La Graciosa y el risco se tiñe de ocre, Famara se queda casi vacía y enseña por qué merece el viaje aunque no te bañes: seis kilómetros de arena batida por el alisio, la pared inmensa a la espalda y las tablas volviendo a la orilla como puntos negros sobre el naranja. Ve a mirar, a caminar la marea baja, a entender por qué de aquí salen surfistas; báñate solo el día que el mar lo permita y donde alguien vigile. Llega un día de series grandes creyendo que es una playa de sombrilla y toalla, métete lejos y sin mirar el parte, y entenderás por qué en Famara el respeto al mar no es una frase hecha.' },
    ],
    faq: [
      { q: '¿Es peligroso bañarse en la playa de Famara?', a: 'Puede serlo. Famara es una playa abierta al Atlántico con oleaje fuerte y corrientes de retorno (resaca) que arrastran mar adentro, y la vigilancia es limitada y estacional. No es una playa para nadar sin más: elige días de mar plano, quédate cerca de la orilla y de Caleta de Famara, y respeta siempre la bandera del puesto de socorro cuando esté izada. Por eso es un destino de surf antes que de baño tranquilo.' },
      { q: '¿Por qué hay tanto viento en Famara?', a: 'Por el alisio del nordeste, el viento dominante en Canarias, que sopla en esta costa norte de Lanzarote con constancia casi todo el año. Eso convierte a Famara en un lugar reconocido para surf, windsurf y kite, pero también significa arena volando y sombrillas difíciles de mantener. Conviene ir por la mañana, cuando el alisio aún no ha arreciado, y llevar con qué taparte.' },
      { q: '¿Famara es buena playa para ir con niños?', a: 'Para bañarse tranquilo con niños pequeños, no es la mejor opción de Lanzarote: el oleaje y las corrientes la hacen exigente y no siempre hay socorrista. Sí funciona para pasear el arenal a marea baja o ver surf. Si buscas agua quieta y resguardada, las calas del sur de la isla, como Papagayo, son mucho más adecuadas.' },
    ],
    en: {
      title: 'Famara (Lanzarote): six kilometres of sand below the cliff, where the rip currents rule the swim',
      excerpt: 'A wild strand at the foot of a several-hundred-metre wall, with La Graciosa across the water and surf wind most of the year. The small print: serious rip currents, little shade and patchy lifeguard cover — you watch the sea and swim with your head.',
      related: [
        { href: '/en/islands', label: 'Island beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You reach Famara down a road dropping from Teguise towards the north-west of Lanzarote, and at the last bend the scene changes all at once: to the left, a golden strand several kilometres long; to the right, closing it off entirely, the Risco de Famara, a wall of volcanic rock hundreds of metres high falling almost sheer to the coast. Ahead, cut against a sea that is nearly always ruffled, the low silhouette of La Graciosa. No postcard palms, no row of beach bars: wind, sand, and a cliff that dwarfs everything set beneath it.' },
        { t: 'p', html: 'It is mid-morning and the trade wind is already blowing from the north-east, as it does most days. Half a dozen wetsuited figures paddle out between the sets; on the shore, someone wrestles with a parasol the wind is trying to tear away. César Manrique grew up here, and here you learn to read the sea differently, because the sea at Famara is no backdrop: it moves, it pulls, it warns. The picture is huge and handsome; the swim is another matter.' },
        { t: 'h2', text: 'The facts (and what they leave out)', id: 'facts' },
        { t: 'p', html: 'Start with the big, true thing: Famara is an <strong>Atlantic-facing beach</strong> of some six kilometres, in the municipality of Teguise, at the foot of the <strong>Risco de Famara</strong>, the great northern escarpment that crowns the island’s highest ground, the Peñas del Chache. The sand is golden, and at low tide — the Atlantic has a far greater tidal range than the Mediterranean — it uncovers a wide, firm ribbon. Behind it lies the <strong>Chinijo Archipelago Natural Park</strong>, with La Graciosa across the water. It is one of the great set-pieces of the Canaries, and needs no borrowed adjective.' },
        { t: 'p', html: 'Now the small print, which at Famara weighs more than at almost any other beach in this guide. The very open sea that makes it spectacular is what makes it <strong>demanding to swim</strong>: it breaks hard and generates <strong>rip currents</strong> — the backwash the surf itself throws seaward — that carry the over-confident out. This is not folklore: it is why Famara is a surf mecca and not a paddling pool. Lifeguard cover is limited and seasonal, so for much of the year <strong>no one will tell you</strong> the sea is not for swimming that day. The flag that matters here is not any tourist award but the red or yellow one at the lifeguard post when there is one: if it flies, respect it.' },
        { t: 'p', html: 'The second warning is the <strong>wind</strong>. The north-easterly trade blows at Famara with near-constant force most of the year — hence its standing for surf, windsurf and kite — and for the bather who only wants to lie down it means <strong>sand streaming</strong> at ground level and parasols that will not hold. Add that there is <strong>no natural shade</strong>: not a tree, not a fold of the cliff that shelters you at midday. Services are in <strong>Caleta de Famara</strong>, the low village of white houses and surf schools at one end; the rest of the strand is open and bare. Bring water, sunscreen and something to break the wind, because down there is nowhere to buy it.' },
        { t: 'h2', text: 'The local’s verdict', id: 'verdict' },
        { t: 'p', html: 'When to go: if you mean to <strong>surf or just look</strong>, almost any day works — Famara feeds on northerly swell and its own wind — and for walking the strand at low tide few places beat it. If you want a <strong>calm swim</strong>, pick a flat day, stay on the inner stretch near Caleta de Famara, go in only when there is a lifeguard, and keep within your depth. When not: a day of heavy northerly ground swell, big sets and an unmanned post, swimming out from the shore. That is where the scares happen. The regular’s trick: check the <strong>swell and wind forecast</strong> (AEMET, or any island surf report) before you leave, and go in the <strong>morning</strong>, before the trade wind has fully built.' },
        { t: 'p', html: 'The wind to watch is the <strong>north-easterly trade</strong> itself: it lifts the sand and, combined with swell, leaves the sea impossible for bathing and perfect for a board. The alternative if Famara is wild or the wind won’t let you sit? On the same north coast, the <strong>Playa del Risco</strong> — below the Mirador del Río, reached by a stiff footpath — offers a far more sheltered swim facing La Graciosa; and on the neighbouring island the <strong>beaches of La Graciosa</strong> (Las Conchas is also windy and has current, but La Francesa or El Salado are gentler). If you are travelling with small children and want genuinely still water, Famara is not your beach: cross to the tourist south of Lanzarote, to the sheltered coves of Papagayo, and keep Famara for the walk and the cliff.' },
        { t: 'quote', text: 'Famara is no natural pool: it is a surfers’ sea with a wall hundreds of metres high behind it. The picture is vast; the swim is taken with the day’s rip current in mind and one eye on the shore.' },
        { t: 'p', html: 'Late in the day, when the sun drops behind La Graciosa and the cliff turns ochre, Famara empties out and shows why it is worth the trip even if you never swim: six kilometres of wind-scoured sand, the immense wall at your back and the boards coming in as black points against the orange. Come to look, to walk the low tide, to see where the surfers come from; swim only on the day the sea allows and where someone is watching. Arrive on a day of big sets thinking it is a beach for towels and parasols, wade out far without checking the forecast, and you will learn why at Famara respect for the sea is no figure of speech.' },
      ],
      faq: [
        { q: 'Is it dangerous to swim at Famara beach?', a: 'It can be. Famara is an Atlantic-facing beach with strong surf and rip currents that drag swimmers seaward, and lifeguard cover is limited and seasonal. It is not a swim-anywhere beach: choose flat days, stay near the shore and near Caleta de Famara, and always respect the lifeguard post’s flag when it is flying. That is why it is a surf destination first and a swimming beach second.' },
        { q: 'Why is it so windy at Famara?', a: 'Because of the north-easterly trade wind, the prevailing wind in the Canaries, which blows along this north coast of Lanzarote with near-constant force most of the year. That makes Famara a noted spot for surf, windsurf and kite, but it also means blowing sand and parasols that are hard to keep up. Go in the morning, before the trade has built, and bring something to shelter behind.' },
        { q: 'Is Famara a good beach for children?', a: 'For a calm swim with small children it is not the best option on Lanzarote: the surf and currents make it demanding and there is not always a lifeguard. It does work for walking the strand at low tide or watching surf. If you want still, sheltered water, the coves on the south of the island, such as Papagayo, are far more suitable.' },
      ],
    },
  },
  // ───── Diario de playas · Málaga (voz bicéfala) ─────
  {
    slug: 'playa-de-maro-nerja-malaga-cascada-agua-dulce-bajada-pie',
    category: 'rutas',
    title: 'Maro (Nerja): una cascada de agua dulce cae sobre la arena y al mar solo se baja a pie',
    excerpt:
      'Una cala de grava bajo los acantilados protegidos de Nerja, con una cascada que resbala por la roca hasta la orilla. La letra pequeña: se baja andando por un sendero, el aparcamiento es de tierra y se llena pronto, y en agosto el hilo de agua va a medio gas.',
    heroAlt: 'Cala de grava encajada entre acantilados en Nerja, con la huerta en terrazas arriba y un chorro de agua dulce cayendo por la pared de roca',
    heroQuery: 'maro,nerja,malaga,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-14T16:58:52Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/andalucia', label: 'Playas de Andalucía' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
    ],
    body: [
      { t: 'p', html: 'La N-340 pasa por encima de Maro sin que el mar se vea. A la izquierda, la huerta en terrazas —antaño cañaverales de azúcar— trepa por la ladera; a la derecha, un cartel discreto y un desvío que muere en un descampado de tierra. Desde ahí se baja a pie: un sendero entre cañas y aguacates que dobla una loma y, de golpe, abre la cala. Grava clara encajada entre paredes de roca, el Mediterráneo del este de Málaga rompiendo flojo y, en un extremo, algo que descoloca al que llega por primera vez: un chorro de agua dulce resbalando por el acantilado hasta morir en la orilla.' },
      { t: 'p', html: 'Es media mañana de junio y la luz entra rasante entre los cantiles. Un par de nadadores con tubo peinan la roca del fondo buscando pulpos; una fila de kayaks amarillos se desliza pegada a la pared, camino de las cuevas que hay más allá. Suena el mar, suena el hilo de la cascada y poco más. Maro, a esta hora y en esta época, todavía se parece a la postal que la puso de moda. A las dos de la tarde de un domingo de agosto, ya hablaremos.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Lo primero, lo bueno y lo cierto: el agua se ve. Maro está dentro del <strong>Paraje Natural Acantilados de Maro-Cerro Gordo</strong>, protegido desde 1989, una franja de unos 12 km de costa entre Nerja (Málaga) y La Herradura (Granada) que es en su mayor parte reserva marina. El fondo es de roca y grava, no de arena fina que se levante con cada brazada, y a eso se suman los aportes de agua dulce fría de la ladera: por eso la lámina se queda transparente y por eso es de las mejores zonas de snorkel de la provincia. La pega de ese mismo fondo es doble: <strong>es grava, no arena</strong> —se agradece el escarpín— y cubre pronto, con lo que no es la playa más cómoda para críos que aún no nadan.' },
      { t: 'p', html: 'La cascada es real y tiene explicación: no brota de un manantial mágico, sino de las <strong>acequias que riegan la huerta</strong> de arriba, herencia de los cañaverales que dieron de comer a Maro durante siglos. El agua sobrante se despeña por el cantil hasta la playa. Y aquí va el aviso honesto que el reel de Instagram nunca pone: en <strong>pleno verano las acequias llevan menos caudal</strong> y la famosa cascada baja a medio gas, un hilo fino; el chorro de foto se ve mucho más lleno en primavera o tras las lluvias que en el agosto en que todo el mundo va a buscarlo.' },
      { t: 'p', html: 'El resto de la letra pequeña está en el acceso. A la arena <strong>no llega el coche</strong>: se deja en un aparcamiento de tierra arriba y se baja un sendero de unos diez minutos, cómodo a la ida y cuesta arriba a la vuelta con la nevera a cuestas. Ese descampado es pequeño y <strong>se llena antes de media mañana</strong> en temporada; quien aparezca a mediodía en agosto se pasará un buen rato buscando hueco en el arcén de la N-340. Y una vez abajo, la playa es abierta y <strong>sin sombra natural</strong>: ni pinar ni acantilado que cubra al mediodía. Los servicios son mínimos y estacionales —algún chiringuito en verano—, así que baja con agua. En temporada alta, además, el desfile de kayaks y paddle pegados a la pared convierte la calma de la foto en una autopista de remos.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Cuándo sí: <strong>de finales de mayo a junio y en septiembre</strong>. El agua ya templa, la cascada baja con más fuerza que en pleno agosto, el aparcamiento aún respira y los kayaks no van en caravana. Y cuándo no: un mediodía de agosto sin escarpín, sin sombrilla ni agua, o justo después de un temporal de levante, cuando el mar se enturbia y empuja medusas hacia la orilla —un patrón de toda la costa de Málaga—. El truco del que va a menudo: <strong>llegar antes de las diez</strong>, por tres motivos —pillar sitio en el descampado, aprovechar la poca sombra que da la pared del este a primera hora y bañarte con el agua todavía plana— y bajar con todo resuelto: escarpín para la grava, agua de sobra, sombrilla y calzado que aguante el sendero.' },
      { t: 'p', html: 'El viento a vigilar es el <strong>levante</strong>: cuando sopla del este, remueve el fondo, se lleva la transparencia y arrima medusas. Con poniente o en calma, en cambio, la cala se queda como un cristal y el snorkel es de los buenos. ¿La alternativa si el descampado está imposible o quieres esquivar el gentío? Dentro del mismo paraje, a un paso, están la <strong>Cala del Cañuelo</strong> —a la que en verano se entra en bus lanzadera, justo para evitar el colapso—, <strong>Las Alberquillas</strong> y, ya en la raya de Granada, <strong>Cantarriján</strong>. Y si lo que quieres es comodidad con todos los servicios y aparcamiento fácil, baja a la <strong>playa de Burriana</strong>, en el propio Nerja: cambias la cala salvaje por chiringuitos y arena cómoda, pero llegas sin sudar el sendero.' },
      { t: 'quote', text: 'No es la piscina natural de anuncio que promete el vídeo: es una cala de grava con una cascada que en agosto va a medio gas y un aparcamiento de tierra que se llena antes que la propia playa. Lo bonito está; lo que no te cuentan, también.' },
      { t: 'p', html: 'A media tarde, cuando el sol ya baja por detrás del cantil y los kayaks vuelven en fila hacia Nerja, la cala recupera su tamaño verdadero: pequeña, de grava, con ese hilo de agua dulce cayendo por la roca como cae desde hace siglos, primero para regar la caña y ahora para asombrar a quien se molesta en bajar andando. Ve en junio o en septiembre, madruga, carga escarpín y agua, y devuelve la playa como la encontraste. Llega un domingo de agosto a las dos, sin nada de eso y buscando la cascada de la foto, y entenderás por qué la mejor versión de Maro no sale nunca en temporada alta.' },
    ],
    faq: [
      { q: '¿Cómo se llega y se aparca en la playa de Maro?', a: 'Desde la N-340 a la altura de Maro (Nerja) hay un desvío que termina en un aparcamiento de tierra; desde ahí se baja a pie por un sendero de unos diez minutos, ya que el coche no llega a la arena. El descampado es pequeño y se llena antes de media mañana en temporada, así que conviene madrugar o buscar alternativa.' },
      { q: '¿De verdad hay una cascada en la playa de Maro?', a: 'Sí, un chorro de agua dulce cae por el acantilado hasta la orilla, pero no es un manantial: procede de las acequias que riegan la huerta de arriba, heredadas de los antiguos cañaverales. En pleno verano llevan menos caudal, así que la cascada baja a medio gas; se ve mucho más llena en primavera o tras las lluvias.' },
      { q: '¿Cuál es la mejor época para ir a Maro?', a: 'De finales de mayo a junio y en septiembre: el agua ya está templada, la cascada baja con más fuerza que en agosto, el aparcamiento no está colapsado y los kayaks no van en caravana. Ve temprano, antes de las diez, y lleva escarpín para la grava, sombrilla y agua, porque no hay sombra natural.' },
    ],
    en: {
      title: 'Maro (Nerja): a freshwater waterfall spills onto the sand, and you can only walk down',
      excerpt: 'A gravel cove beneath the protected cliffs of Nerja, with a waterfall sliding down the rock to the shore. The small print: you reach it on foot, the dirt car park fills early, and in August the famous trickle runs thin.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'Magazine' },
      ],
      body: [
        { t: 'p', html: 'The N-340 runs above Maro without ever showing you the sea. To the left, terraced market gardens — once sugar-cane fields — climb the hillside; to the right, a modest sign and a turning that dies in a patch of bare earth. From there you go down on foot: a path through cane and avocado trees that rounds a spur and, all at once, opens the cove. Pale gravel wedged between rock walls, the eastern-Málaga Mediterranean breaking softly and, at one end, something that throws first-timers: a ribbon of fresh water sliding down the cliff to fade out on the shore.' },
        { t: 'p', html: 'It is mid-morning in June and the light rakes in between the crags. A couple of snorkellers comb the rocky bottom for octopus; a line of yellow kayaks glides along the wall, bound for the caves beyond. There is the sound of the sea, the sound of the waterfall, and little else. At this hour and this time of year, Maro still resembles the postcard that made it fashionable. At two in the afternoon on an August Sunday, we will talk again.' },
        { t: 'h2', text: 'The facts (and what they leave out)', id: 'facts' },
        { t: 'p', html: 'First, the good and true part: you can see the water. Maro sits inside the <strong>Acantilados de Maro-Cerro Gordo natural area</strong>, protected since 1989 — a strip of roughly 12 km of coast between Nerja (Málaga) and La Herradura (Granada), most of it a marine reserve. The seabed is rock and gravel, not fine sand that clouds up with every stroke, and to that you add cold freshwater running off the slope: that is why the water stays clear, and why this is one of the best snorkelling spots in the province. The catch with that same seabed is twofold: <strong>it is gravel, not sand</strong> — bring water shoes — and it drops off quickly, so it is not the easiest beach for small children who cannot yet swim.' },
        { t: 'p', html: 'The waterfall is real and it has an explanation: it does not spring from some magical source but from the <strong>irrigation channels that water the market gardens</strong> above, a legacy of the sugar cane that fed Maro for centuries. The surplus water tips over the cliff onto the beach. And here is the honest warning the Instagram reel never includes: in <strong>high summer the channels carry less water</strong> and the famous waterfall thins to a trickle; the full curtain you see in photos runs far fuller in spring, or after rain, than in the August when everyone turns up to look for it.' },
        { t: 'p', html: 'The rest of the small print is the access. <strong>No car reaches the sand</strong>: you leave it in a dirt car park up top and walk down a path of about ten minutes — easy going down, uphill on the way back with the cool box. That patch of earth is small and <strong>fills before mid-morning</strong> in season; anyone arriving at midday in August will spend a good while hunting for a gap on the N-340 verge. And once you are down, the beach is open and has <strong>no natural shade</strong>: no pines, no overhang to cover you at noon. Services are minimal and seasonal — the odd summer kiosk — so bring water. In peak season the parade of kayaks and paddleboards hugging the wall turns the calm of the photo into a rowing motorway.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'When to go: <strong>late May into June, and September</strong>. The water is warm enough, the waterfall runs stronger than in high August, the car park still breathes and the kayaks are not yet a convoy. When not to: a midday in August with no water shoes, no umbrella and no water, or right after an easterly blow, when the sea clouds over and pushes jellyfish inshore — a pattern along the whole Málaga coast. The regulars’ trick: <strong>arrive before ten</strong>, for three reasons — grab a space in the car park, use the little shade the east wall throws early on, and swim while the water is still glass — and go down with everything sorted: water shoes for the gravel, plenty of water, an umbrella and footwear that copes with the path.' },
        { t: 'p', html: 'The wind to watch is the <strong>levante</strong>, the easterly: when it blows, it stirs the bottom, takes away the clarity and brings jellyfish in. With a westerly or in calm, by contrast, the cove turns to glass and the snorkelling is the good kind. The alternative if the car park is hopeless or you want to dodge the crowd? Within the same protected area, a step away, are the <strong>Cala del Cañuelo</strong> — reached in summer by shuttle bus, precisely to stop it seizing up — <strong>Las Alberquillas</strong> and, over the Granada line, <strong>Cantarriján</strong>. And if what you want is comfort with full services and easy parking, drop down to <strong>Burriana beach</strong> in Nerja itself: you trade the wild cove for beach bars and easy sand, but you arrive without sweating the path.' },
        { t: 'quote', text: 'It is not the natural swimming pool the video promises: it is a gravel cove with a waterfall that runs thin in August and a dirt car park that fills before the beach does. The pretty part is there; so is the part they leave out.' },
        { t: 'p', html: 'By late afternoon, when the sun drops behind the crag and the kayaks file back towards Nerja, the cove returns to its true size: small, gravelly, with that ribbon of fresh water falling down the rock as it has for centuries — first to water the cane, now to astonish whoever bothers to walk down. Go in June or September, get there early, carry water shoes and water, and leave the beach as you found it. Turn up at two on an August Sunday with none of that, chasing the waterfall from the photo, and you will understand why the best version of Maro never appears in high season.' },
      ],
      faq: [
        { q: 'How do you get to Playa de Maro and where do you park?', a: 'From the N-340 at Maro (Nerja) a turning ends in a dirt car park; from there you walk down a path of about ten minutes, as no car reaches the sand. The lot is small and fills before mid-morning in season, so arrive early or have an alternative ready.' },
        { q: 'Is there really a waterfall on Playa de Maro?', a: 'Yes — a ribbon of fresh water falls down the cliff to the shore, but it is not a spring: it comes from the irrigation channels that water the market gardens above, inherited from the old sugar-cane fields. In high summer they carry less water, so the waterfall runs thin; it is far fuller in spring or after rain.' },
        { q: 'When is the best time to visit Maro?', a: 'Late May into June, and September: the water is already warm, the waterfall runs stronger than in August, the car park is not gridlocked and the kayaks are not a convoy. Go early, before ten, and bring water shoes for the gravel, an umbrella and water, because there is no natural shade.' },
      ],
    },
  },
  // ───── Diario de playas · Murcia (voz bicéfala) ─────
  {
    slug: 'playa-de-percheles-mazarron-murcia-pista-tierra',
    category: 'rutas',
    title: 'Percheles (Mazarrón): agua a 26°C, ni una sombra y una pista de tierra hasta la arena',
    excerpt:
      'Un tramo de Mediterráneo sin urbanizar en la costa de Mazarrón, con agua templada de junio a octubre. La letra pequeña: se accede por una pista sin asfaltar, no hay sombra natural y en agosto se llena igual.',
    heroAlt: 'Playa de arena oscura sin edificar en la costa de Mazarrón, con monte bajo detrás y el Mediterráneo en calma',
    heroQuery: 'percheles,mazarron,murcia,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-14T14:49:19Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/murcia', label: 'Playas de Murcia' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
    ],
    body: [
      { t: 'p', html: 'La carretera de la costa de Mazarrón hacia Calnegre no avisa. Un cartel pequeño, un desvío a la derecha y, de pronto, el asfalto se acaba: quedan un par de kilómetros de pista de tierra polvorienta, con baches que hacen chirriar la chapa y un mar que aparece y desaparece entre las lomas peladas del sureste murciano. Cuando por fin se abre el descampado que hace de aparcamiento, abajo espera una franja de arena oscura, sin un solo edificio detrás, con el Mediterráneo tan quieto que parece una balsa. Percheles es de esas playas que se ganan: el precio de entrada es el traqueteo.' },
      { t: 'p', html: 'No hay paseo marítimo, ni bloques, ni la fila de sombrillas de alquiler de las playas grandes de al lado. Solo monte bajo, algún acantilado bajo del color del óxido y el rumor del agua rompiendo floja sobre la orilla. A media mañana, con el sol todavía de perfil, es uno de los tramos más callados del litoral de Murcia. A las dos de la tarde de un sábado de agosto, ya veremos.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Empecemos por lo que la hace apetecible y es verdad: el agua. El Mediterráneo del suroeste de Murcia es de los más cálidos de la Península; en pleno verano, las series de temperatura del mar (climatología de Open-Meteo para la costa de Mazarrón) lo sitúan <strong>en torno a los 26°C</strong>, y en agosto no es raro rozar los 27-28. Se baña uno sin el respingo del Cantábrico ni del Atlántico gallego: aquí el mar acompaña de junio a octubre.' },
      { t: 'p', html: 'La letra pequeña empieza en el acceso. A Percheles se llega por una <strong>pista de tierra sin asfaltar</strong> de un par de kilómetros; ni turismo bajo ni prisas, y con lluvia reciente conviene ir con cuidado. Una vez abajo, la segunda pega es la que más duele a mediodía: <strong>no hay apenas sombra natural</strong>. Es una playa abierta, de monte pelado, sin pinar detrás ni chiringuito con toldos donde refugiarse; quien no se lleve sombrilla, se cuece. Los servicios son mínimos y estacionales: no des por hecho ni duchas, ni baños, ni socorrista fuera del pico de verano. Lleva agua, porque no hay dónde comprarla.' },
      { t: 'p', html: 'Y dos avisos honestos más. Uno: en la orilla suele haber <strong>arribazones de posidonia</strong>, esas alfombras de restos secos de la planta marina que el oleaje deja en la arena. No es suciedad —es una pradera protegida que amortigua el oleaje y frena la erosión de la propia playa—, pero a quien busca la estampa impoluta le chirría. Dos: lo de "cala solitaria" tiene fecha de caducidad. La pista de tierra espanta a mucha gente once meses al año, pero en <strong>agosto</strong> se corre la voz y el descampado se llena; a partir de las once o doce, la sensación de sitio salvaje se diluye entre coches y neveras.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Cuándo sí: <strong>de mayo a junio y de septiembre a octubre</strong>, con el agua ya caliente y el aparcamiento medio vacío, Percheles cumple lo que promete. Cuándo no: un mediodía de agosto sin sombrilla ni provisiones, o justo después de un temporal de levante, cuando el mar se remueve y la posidonia se amontona en la orilla. El truco de quien va a menudo: <strong>llegar temprano</strong>, antes de las diez, por dos motivos —pillar la poca sombra que dan las rocas del extremo y esquivar el sol a plomo—; y bajar con todo resuelto: nevera, agua de sobra, sombrilla y calzado que aguante la pista y los cantos.' },
      { t: 'p', html: 'El viento a vigilar es el <strong>levante</strong>: cuando sopla del este, enturbia el baño y empuja medusas hacia la orilla, un patrón que se repite en toda la costa de Murcia. Con poniente o en calma, en cambio, el agua se queda como un plato. ¿La alternativa si Percheles está imposible o no te apetece la pista? A un paso quedan otras calas sin urbanizar del mismo estilo: <strong>Calnegre</strong>, ya en término de Lorca, y las <strong>Cuatro Calas de Águilas</strong> algo más al sur; y para un plan cómodo con servicios, las <strong>gredas de Bolnuevo</strong>, con aparcamiento asfaltado y chiringuitos, aunque cambies soledad por comodidad.' },
      { t: 'quote', text: 'No es la cala secreta que nadie conoce: es la playa que la pista de tierra protege once meses y el boca a boca invade en agosto. Aquí lo salvaje no es un adorno, es una barrera física —y hasta esa se rinde en verano.' },
      { t: 'p', html: 'Al final, Percheles es un pacto: das el traqueteo de la pista y renuncias a la sombra y al chiringuito, y a cambio te llevas un tramo de Mediterráneo templado y sin edificar, de esos que en el sureste ya se cuentan con los dedos. Ve fuera de agosto, madruga, carga tu sombrilla y tu agua, y devuelve la playa como la encontraste, posidonia incluida. Llega un domingo de mediodía en pleno verano, sin nada de eso, y entenderás por qué algunos prefieren que la pista siga sin asfaltar.' },
    ],
    faq: [
      { q: '¿Cómo se llega a la playa de Percheles?', a: 'Por la carretera de la costa de Mazarrón en dirección a Calnegre, tomando un desvío que da a una pista de tierra sin asfaltar de un par de kilómetros. El aparcamiento es un descampado; con lluvia reciente conviene circular con precaución.' },
      { q: '¿Tiene sombra y servicios Percheles?', a: 'No hay sombra natural: es una playa abierta de monte bajo, sin pinar ni arbolado. Los servicios son mínimos y estacionales, así que no des por hecho duchas, baños ni socorrista fuera del pico de verano. Lleva sombrilla, agua y comida.' },
      { q: '¿Cuál es la mejor época para ir a Percheles?', a: 'De mayo a junio y de septiembre a octubre: el agua ya está caliente (ronda los 26°C en verano) y el aparcamiento está medio vacío. En agosto se masifica pese a la pista de tierra, sobre todo a partir del mediodía.' },
    ],
    en: {
      title: 'Percheles (Mazarrón): sea around 26°C, no shade and a dirt track down to the sand',
      excerpt: 'An undeveloped stretch of Mediterranean on the Mazarrón coast, with warm water from June to October. The small print: access is by an unpaved track, there is no natural shade and it fills up in August anyway.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'The coast road from Mazarrón towards Calnegre gives no warning. A small sign, a turning to the right and then the tarmac simply ends: a couple of kilometres of dusty dirt track remain, potholes rattling the bodywork and a sea that appears and vanishes between the bare hills of south-eastern Murcia. When the clearing that serves as a car park finally opens up, below waits a band of dark sand with not a single building behind it, the Mediterranean so still it looks like a millpond. Percheles is one of those beaches you earn: the entry fee is the rattle.' },
        { t: 'p', html: 'There is no promenade, no apartment blocks, none of the rows of hired parasols of the big beaches next door. Just scrub, a low rust-coloured cliff or two and the murmur of water breaking gently on the shore. Mid-morning, with the sun still low, it is one of the quietest stretches of the Murcian coast. At two in the afternoon on an August Saturday, we shall see.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'Start with what makes it appealing and is true: the water. The Mediterranean of south-western Murcia is among the warmest in mainland Spain; in high summer, sea-temperature records (Open-Meteo climatology for the Mazarrón coast) put it <strong>at around 26°C</strong>, and in August it often nudges 27-28. You swim without the flinch of the Cantabrian or the Galician Atlantic: here the sea keeps you company from June to October.' },
        { t: 'p', html: 'The small print begins at the access. Percheles is reached by an <strong>unpaved dirt track</strong> a couple of kilometres long; no low-slung cars, no hurry, and after recent rain it pays to take care. Once down, the second drawback is the one that bites at midday: <strong>there is barely any natural shade</strong>. It is an open beach backed by bare scrub, with no pine wood behind it and no awninged beach bar to hide under; anyone who forgets a parasol will roast. Facilities are minimal and seasonal: don’t count on showers, toilets or a lifeguard outside the peak weeks. Bring water, because there is nowhere to buy it.' },
        { t: 'p', html: 'Two more honest warnings. One: the shoreline often carries <strong>banks of dried Posidonia</strong>, those mats of dead seagrass the waves leave on the sand. It isn’t dirt — it’s a protected meadow that cushions the swell and slows the beach’s own erosion — but it grates on anyone after a spotless picture. Two: the "lonely cove" label has an expiry date. The dirt track scares plenty of people off for eleven months a year, but in <strong>August</strong> word gets round and the clearing fills; from eleven or midday, the wild-spot feeling dissolves among cars and cool boxes.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'When yes: <strong>May to June and September to October</strong>, with the water already warm and the car park half empty, Percheles delivers what it promises. When no: an August midday with no parasol or supplies, or right after an easterly blow, when the sea churns and the seagrass piles up on the shore. The regulars’ trick: <strong>arrive early</strong>, before ten, for two reasons — to grab what little shade the rocks at the far end throw, and to dodge the vertical sun — and come with everything sorted: cool box, plenty of water, a parasol and footwear that can handle the track and the pebbles.' },
        { t: 'p', html: 'The wind to watch is the <strong>levante</strong> (easterly): when it blows from the east it muddies the swim and pushes jellyfish towards the shore, a pattern repeated all along the Murcian coast. With a westerly or in calm, by contrast, the water goes flat as a plate. The alternative if Percheles is impossible or the track puts you off? A step away lie other undeveloped coves in the same vein: <strong>Calnegre</strong>, over the line in Lorca, and the <strong>Cuatro Calas of Águilas</strong> a little further south; and for an easy day with facilities, the <strong>Bolnuevo badlands</strong>, with a paved car park and beach bars — though you trade solitude for comfort.' },
        { t: 'quote', text: 'It isn’t the secret cove nobody knows: it’s the beach the dirt track protects for eleven months and word of mouth overruns in August. Here the wildness isn’t decoration, it’s a physical barrier — and even that gives way in summer.' },
        { t: 'p', html: 'In the end, Percheles is a bargain: you take the rattle of the track and give up the shade and the beach bar, and in return you get a stretch of warm, unbuilt Mediterranean, the kind you can now count on one hand in the south-east. Go outside August, get up early, carry your own parasol and water, and leave the beach as you found it, seagrass included. Turn up at midday on a summer Sunday with none of that, and you’ll understand why some prefer the track to stay unpaved.' },
      ],
      faq: [
        { q: 'How do you get to Playa de Percheles?', a: 'Via the Mazarrón coast road towards Calnegre, taking a turning onto an unpaved dirt track a couple of kilometres long. The car park is a clearing; after recent rain, drive with care.' },
        { q: 'Does Percheles have shade and facilities?', a: 'There is no natural shade: it’s an open beach on bare scrubland, with no pine wood or trees. Facilities are minimal and seasonal, so don’t count on showers, toilets or a lifeguard outside the peak of summer. Bring a parasol, water and food.' },
        { q: 'When is the best time to visit Percheles?', a: 'May to June and September to October: the water is already warm (around 26°C in summer) and the car park is half empty. In August it gets crowded despite the dirt track, especially from midday onwards.' },
      ],
    },
  },
  // ───── Diario de playas · Galicia (voz bicéfala) ─────
  {
    slug: 'playa-a-lanzada-o-grove-pontevedra-corrientes-nortada-nueve-olas',
    category: 'curiosidades',
    title: 'A Lanzada (Pontevedra): nortada, resaca y el rito de las nueve olas de fin de agosto',
    excerpt:
      'La gran playa atlántica de las Rías Baixas no es la piscina de ría que muchos esperan: mar bravo con corrientes de retorno, viento del norte por la tarde y un rito de fertilidad que llena la orilla a finales de agosto. Cómo pisarla con cabeza.',
    heroAlt: 'Playa de A Lanzada entre O Grove y Sanxenxo: largo arenal dorado frente al Atlántico abierto con dunas al fondo y la ermita sobre un promontorio rocoso en el extremo',
    heroQuery: 'a lanzada,o grove,beach,galicia',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-14T10:58:16Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/galicia', label: 'Playas de Galicia' },
      { href: '/banderas-azules', label: 'Playas con Bandera Azul' },
      { href: '/playas-sin-viento', label: 'Playas resguardadas del viento' },
    ],
    body: [
      { t: 'p', html: 'Desde la carretera PO-308, entre O Grove y Sanxenxo, el arenal aparece de golpe: más de dos kilómetros de arena dorada tendidos frente al Atlántico abierto, sin una roca que los interrumpa, con las dunas a la espalda y, en el extremo sur, una ermita blanca encaramada a un promontorio de piedra. Es la playa de A Lanzada, la más conocida de las Rías Baixas, y la estampa —viento en la cara, olas rompiendo en paralelo hasta donde alcanza la vista— explica en un segundo por qué los gallegos la tienen por suya.' },
      { t: 'p', html: 'Sobre ese promontorio, junto a los restos de una vieja torre defensiva, la ermita de Nosa Señora da Lanzada guarda un rito que sobrevive a los siglos: el <strong>baño das nove ondas</strong>. La víspera del último domingo de agosto, mujeres que buscan quedarse embarazadas se meten en el mar de noche y dejan que rompan sobre ellas nueve olas seguidas. La escena es tan antigua como el oleaje que la hace posible, y ese mismo oleaje es la letra pequeña que conviene leer antes de bajar con la toalla.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Empecemos por lo que la foto no cuenta. A Lanzada es una <strong>playa atlántica abierta</strong> de arena fina, de unos 2,3 kilómetros, sin apenas resguardo: el mar entra con fuerza y, como en casi todas las playas expuestas de la costa gallega, hay que contar con oleaje, <strong>corrientes de retorno y resaca</strong>. No es una piscina de ría de agua quieta; es mar de verdad, con bandera que puede pasar de verde a amarilla en cuestión de horas según el estado de la mar. Báñate donde vigila el socorrista y respeta las banderas: la amplitud del arenal no rebaja el riesgo del Atlántico.' },
      { t: 'p', html: 'El segundo aviso es el viento. En las tardes de verano las Rías Baixas se llevan la <strong>nortada</strong>, el viento del norte que en A Lanzada, por su orientación y su falta de barrera, pega sin freno y levanta la arena fina. Muchos días la mañana amanece plácida y a partir del mediodía el arenal se vuelve incómodo. Suma que la sombra natural es prácticamente nula —solo las dunas y algún pino disperso— y que el agua no engaña a nadie: es Atlántico, fría incluso en pleno agosto. A su favor, es playa de <strong>Bandera Azul</strong> (ADEAC), con servicios completos en temporada y un fondo muy popular entre surfistas y escuelas de surf, precisamente por ese oleaje que al bañista despistado le complica el día.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La norma es sencilla: A Lanzada se disfruta por la mañana. Antes del mediodía el viento aún duerme, la marea suele dejar más arena firme y aparcar no es todavía un problema (siendo de las playas más famosas del noroeste y con acceso fácil por carretera, en agosto se llena y dejar el coche cerca a mediodía es una pequeña odisea). Si vas con niños o no eres buen nadador, quédate dentro del tramo vigilado y cerca de la orilla; y si el mar viene bravo, cambia el plan sin pena.' },
      { t: 'p', html: 'El truco que conoce cualquiera de O Grove es para cuando la nortada arranca por la tarde y el arenal se convierte en un secador: cruzar a las <strong>playas interiores de la ría</strong>, más resguardadas del norte, con agua más calmada y templada; cambias las olas por tranquilidad sin moverte de la zona. ¿Cuándo NO ir? Un sábado de agosto a las cuatro de la tarde, con nortada y la PO-308 colapsada. ¿Cuándo sí? En junio o septiembre, entre semana, a primera hora, cuando el arenal recupera su escala y puedes caminar los dos kilómetros largos casi a solas. Y si te cuadra la última semana de agosto, acércate de noche a la ermita: no a bañarte —el rito tiene su historia y su respeto—, sino para entender que esta playa lleva siglos siendo un lugar de mar bravo al que la gente venía a pedirle algo, no un salón de arena mansa.' },
      { t: 'quote', text: 'No es una piscina natural ni un remanso de postal: es Atlántico abierto con nombre de ermita. Aquí el oleaje no es el decorado, es el protagonista, y conviene tratarlo como tal.' },
      { t: 'p', html: 'Al caer la tarde, cuando el sol se hunde por detrás de la isla de Ons y la nortada por fin afloja, A Lanzada se queda a media luz: la ermita recorta su silueta sobre el promontorio, las últimas tablas salen del agua y la marea empieza a borrar las huellas del día. No es la cala mansa donde uno se abandona sin pensar; es una playa que pide atención y la devuelve en forma de horizonte sin fin. Nueve olas, decían los antiguos, bastaban para pedir un deseo. Basta una tarde entera, mirando el mismo mar, para entender por qué eligieron este sitio.' },
    ],
    faq: [
      { q: '¿Es peligroso bañarse en la playa de A Lanzada?', a: 'Es una playa atlántica abierta, no una piscina de ría: puede tener oleaje fuerte, corrientes de retorno y resaca, y la bandera cambia según el estado de la mar. No es peligrosa si te bañas dentro del tramo vigilado por el socorrista, respetas las banderas y no te confías con el mar de fondo. Con niños o si no nadas bien, quédate cerca de la orilla.' },
      { q: '¿Qué es el baño das nove ondas de A Lanzada?', a: 'Es un rito de fertilidad ancestral ligado a la ermita de Nosa Señora da Lanzada. La víspera del último domingo de agosto, por la noche, mujeres que buscan quedarse embarazadas se bañan dejando que rompan sobre ellas nueve olas seguidas. Es una tradición popular, no un espectáculo turístico: se visita con respeto.' },
      { q: '¿Cuál es la mejor hora para ir a A Lanzada?', a: 'Por la mañana, antes de que arranque la nortada del mediodía y antes de que se llene el aparcamiento. Si por la tarde el viento del norte convierte el arenal en un secador, la alternativa es cruzar a las playas interiores de la ría de O Grove, más resguardadas y con agua más calmada.' },
    ],
    en: {
      title: 'A Lanzada (Pontevedra): north wind, rip currents and the ‘nine waves’ rite of late August',
      excerpt:
        'The great Atlantic beach of the Rías Baixas is not the sheltered ría pool many expect: rough sea with rip currents, an afternoon northerly, and a fertility rite that fills the shoreline in late August. How to do it with your head on.',
      related: [
        { href: '/en/islands', label: 'Spanish islands' },
        { href: '/en/magazine', label: 'Magazine' },
      ],
      body: [
        { t: 'p', html: 'From the PO-308 road, between O Grove and Sanxenxo, the beach appears all at once: more than two kilometres of golden sand laid out against the open Atlantic, with no rock to break it, dunes at your back and, at the southern end, a white hermitage perched on a stone headland. This is the playa de A Lanzada, the best known of the Rías Baixas, and the scene — wind in your face, waves breaking in parallel as far as the eye can see — explains in a second why Galicians think of it as theirs.' },
        { t: 'p', html: 'On that headland, beside the remains of an old defensive tower, the hermitage of Nosa Señora da Lanzada keeps a rite that has outlived the centuries: the <strong>baño das nove ondas</strong>, the bath of the nine waves. On the eve of the last Sunday in August, women hoping to conceive wade into the sea at night and let nine waves in a row break over them. The scene is as old as the swell that makes it possible, and that same swell is the small print worth reading before you head down with a towel.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'Start with what the photo leaves out. A Lanzada is an <strong>open Atlantic beach</strong> of fine sand, some 2.3 kilometres long, with almost no shelter: the sea comes in hard and, as on most exposed Galician beaches, you should reckon with swell, <strong>rip currents and undertow</strong>. This is not a still ría pool; it is real sea, with a flag that can go from green to yellow within hours depending on conditions. Swim where the lifeguard is watching and respect the flags: the sheer size of the sands does not lower the risk of the Atlantic.' },
        { t: 'p', html: 'The second warning is the wind. On summer afternoons the Rías Baixas get the <strong>nortada</strong>, the northerly that at A Lanzada — given its orientation and lack of any barrier — hits unchecked and lifts the fine sand. Many days dawn calm and, from midday on, the beach turns uncomfortable. Add that natural shade is virtually nil — only the dunes and a scattered pine — and that the water fools no one: this is the Atlantic, cold even in high August. In its favour, it is a <strong>Blue Flag</strong> beach (ADEAC), with full services in season and a seabed popular with surfers and surf schools, precisely because of the swell that trips up the unwary bather.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The rule is simple: A Lanzada is a morning beach. Before midday the wind is still asleep, the tide tends to leave firmer sand, and parking is not yet a problem (as one of the north-west’s most famous beaches, easily reached by road, it fills in August and leaving the car nearby at midday is a small ordeal). With children, or if you are not a strong swimmer, stay within the patrolled stretch and near the shore; and if the sea is rough, change the plan without regret.' },
        { t: 'p', html: 'The trick every local in O Grove knows is for when the nortada picks up in the afternoon and the beach becomes a sandblaster: cross to the <strong>ría-side beaches</strong>, more sheltered from the north, with calmer, milder water; you swap the waves for peace without leaving the area. When not to go? A Saturday in August at four in the afternoon, with the nortada blowing and the PO-308 gridlocked. When to go? In June or September, midweek, first thing, when the beach recovers its scale and you can walk the long two kilometres almost alone. And if the last week of August works for you, come by the hermitage at night: not to bathe — the rite has its history and deserves respect — but to grasp that this beach has spent centuries as a place of rough sea where people came to ask for something, not a lounge of tame sand.' },
        { t: 'quote', text: 'It is no natural pool or postcard millpond: it is the open Atlantic with the name of a hermitage. Here the swell is not the scenery, it is the lead role — and it should be treated as such.' },
        { t: 'p', html: 'As evening falls, when the sun drops behind the island of Ons and the nortada finally eases, A Lanzada settles into half-light: the hermitage cuts its outline against the headland, the last boards come out of the water and the tide begins to erase the day’s footprints. It is not the gentle cove where you switch off without a thought; it is a beach that asks for attention and gives it back as an endless horizon. Nine waves, the old people said, were enough to make a wish. A whole afternoon watching the same sea is enough to understand why they chose this spot.' },
      ],
      faq: [
        { q: 'Is it dangerous to swim at playa de A Lanzada?', a: 'It is an open Atlantic beach, not a sheltered ría pool: it can have strong swell, rip currents and undertow, and the flag changes with conditions. It is not dangerous if you swim within the lifeguarded stretch, respect the flags and don’t get complacent with the groundswell. With children, or if you are not a strong swimmer, stay close to the shore.' },
        { q: 'What is the baño das nove ondas at A Lanzada?', a: 'It is an ancient fertility rite tied to the hermitage of Nosa Señora da Lanzada. On the eve of the last Sunday in August, at night, women hoping to conceive bathe letting nine waves in a row break over them. It is a folk tradition, not a tourist show, and is best watched with respect.' },
        { q: 'What is the best time to visit A Lanzada?', a: 'In the morning, before the midday nortada gets going and before the car park fills. If the northerly turns the beach into a sandblaster in the afternoon, the alternative is to cross to the sheltered ría-side beaches of O Grove, calmer and with milder water.' },
      ],
    },
  },
  // ───── Diario de playas · Cataluña (voz bicéfala) ─────
  {
    slug: 'cala-montjoi-roses-girona-elbulli-cierre-coche-verano',
    category: 'curiosidades',
    title: 'Cala Montjoi, Girona: la cala de elBulli cierra al coche de 10:30 a 16:30 en verano',
    excerpt:
      'La ensenada del restaurante más influyente del mundo tiene truco: en pleno verano no se entra en coche a media jornada, y no es de arena fina sino de grava y cantos. Cómo pisarla bien.',
    heroAlt: 'Cala Montjoi en Roses, ensenada de grava entre tres colinas del Cap de Creus con agua transparente y barcos fondeados',
    heroQuery: 'cala montjoi,roses,cove,costa brava',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-13T16:14:27Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/cataluna', label: 'Playas de Cataluña' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas cristalinas' },
    ],
    body: [
      { t: 'p', html: 'Desde Roses, la GI-614 se retuerce hacia el sur durante siete kilómetros entre laderas de pizarra y matorral bajo, con el Mediterráneo que aparece y desaparece a la derecha en cada curva. Al final del descenso, tres colinas se abren y dejan ver una ensenada de agua transparente encajada en el Cap de Creus, el cabo más oriental de la península, donde la roca parece esculpida a golpes de viento. Es Cala Montjoi, y durante casi tres décadas fue el final del camino más famoso de la alta cocina del planeta.' },
      { t: 'p', html: 'Porque aquí, en una masía a pie de playa, Ferran Adrià convirtió <strong>elBulli</strong> en el restaurante más influyente del mundo antes de cerrarlo en 2011, en la cima de su fama. El local no ha desaparecido: desde 2023 es <strong>elBulli1846</strong>, un espacio-museo de su fundación que se visita con reserva previa. Lo que casi nadie te cuenta es que llegar hasta esta cala en agosto no es tan sencillo como parece en la foto.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Empecemos por la letra pequeña que decide el viaje. Del <strong>15 de julio al 31 de agosto, el Ayuntamiento de Roses cierra el acceso rodado a Cala Montjoi entre las 10:30 y las 16:30</strong>: si no has bajado antes de media mañana, no entras en coche hasta media tarde. El aparcamiento es reducido y se completa temprano, así que la ventana real para llegar con vehículo en pleno verano es estrecha. Fuera de esas fechas y esas horas la carretera está abierta, pero sigue siendo un tramo de siete kilómetros de curvas que conviene tomar con calma.' },
      { t: 'p', html: 'El segundo aviso es la arena, o más bien su ausencia. Montjoi es una cala de unos <strong>400 metros de grava gruesa mezclada con cantos</strong>, no la arena fina de postal: sin escarpines cuesta caminar hasta el agua y, para tumbarse, se agradece una colchoneta. A cambio, el agua es limpia y clara —la cala está dentro del <strong>Parque Natural del Cap de Creus</strong>, el primer parque marítimo-terrestre de Cataluña— y los fondos rocosos de los extremos dan buen snorkel. No esperes chiringuito de gran playa: los servicios son los de una cala, contados, y en temporada alta conviene bajar con agua y comida.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla cabe en un horario: <strong>o llegas antes de las 10:30, o vas después de las 16:30</strong>, o subes a pie, en bici o en barco. A primera hora tienes la cala tranquila, el aparcamiento libre y la mejor luz. A partir de las cinco de la tarde, cuando reabre la carretera, la ensenada ya mira al oeste y encara uno de los mejores atardeceres del cabo. El mediodía de agosto es justo lo contrario: la hora en que no puedes entrar en coche y en la que más aprieta el sol sobre una playa casi sin sombra.' },
      { t: 'p', html: 'Hay un detalle que el folleto olvida y que aquí juega a favor: las <strong>tres colinas que cierran la ensenada la resguardan de la tramuntana</strong>, el viento del norte que arruina tantos días en el Empordà. Cuando sopla fuerte y las playas abiertas de Roses se vuelven impracticables, Montjoi aguanta y es uno de los pocos fondeaderos seguros de la zona —de ahí que se llene de barcos—. Si aun así la encuentras a rebosar, sigue la misma carretera un poco más allá hasta <strong>Cala Jóncols</strong>: más remota, con un último tramo de pista peor, pero casi siempre más vacía.' },
      { t: 'quote', text: 'No es una cala secreta ni un chiringuito perdido: es el patio de mar del restaurante más copiado del mundo, con horario de entrada y suelo de piedras. Saberlo cambia el plan.' },
      { t: 'p', html: 'Así que Cala Montjoi no se descubre, se agenda. Elige la hora antes que el día, mete los escarpines en la mochila y bájala con la carretera abierta: al fondo te espera el mismo mar transparente que Adrià miraba mientras reinventaba la cocina, tres colinas que paran el viento y una ensenada que, a las siete de la tarde, se pone del color de la piedra dorada. El museo cierra con reserva; el atardecer, no.' },
    ],
    faq: [
      { q: '¿Se puede entrar en coche a Cala Montjoi en verano?', a: 'Del 15 de julio al 31 de agosto el acceso rodado está cerrado entre las 10:30 y las 16:30. Hay que llegar antes de media mañana (el aparcamiento es pequeño y se llena) o esperar a media tarde. También se puede subir a pie, en bici o llegar en barco.' },
      { q: '¿Se puede visitar elBulli en Cala Montjoi?', a: 'El restaurante de Ferran Adrià cerró en 2011. Desde 2023 el espacio es elBulli1846, un museo de su fundación que se visita con reserva previa; no es un restaurante ni una visita libre.' },
      { q: '¿Cala Montjoi es de arena?', a: 'No del todo: es una cala de grava gruesa y cantos, no de arena fina. Conviene llevar escarpines para entrar al agua y una colchoneta o esterilla para estar cómodo. El agua, eso sí, es limpia y buena para el snorkel en los extremos rocosos.' },
    ],
    en: {
      title: 'Cala Montjoi, Girona: the cove of elBulli closes to cars from 10.30 to 16.30 in summer',
      excerpt: 'The cove of the world’s most influential restaurant comes with a catch: in high summer you can’t drive in during the middle of the day, and it’s coarse gravel and pebbles, not fine sand. How to do it right.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'Magazine' },
      ],
      body: [
        { t: 'p', html: 'From Roses, the GI-614 twists seven kilometres south through slopes of slate and low scrub, the Mediterranean flashing in and out of view on the right at every bend. At the bottom of the descent three hills part to reveal a cove of clear water wedged into the Cap de Creus, the easternmost cape of the peninsula, where the rock looks carved by the wind. This is Cala Montjoi, and for almost three decades it was the end of the most famous road in the whole of haute cuisine.' },
        { t: 'p', html: 'Because here, in a farmhouse at the water’s edge, Ferran Adrià turned <strong>elBulli</strong> into the most influential restaurant in the world before closing it in 2011, at the height of its fame. The building hasn’t vanished: since 2023 it has been <strong>elBulli1846</strong>, a museum run by his foundation, visited by prior booking. What almost nobody tells you is that getting to this cove in August is not as simple as the photo suggests.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'Start with the small print that decides the trip. From <strong>15 July to 31 August, Roses council closes road access to Cala Montjoi between 10.30 and 16.30</strong>: if you haven’t driven down by mid-morning, you can’t get in by car until mid-afternoon. The car park is small and fills early, so the real window to arrive with a vehicle in high summer is narrow. Outside those dates and hours the road is open, but it’s still seven kilometres of bends best taken slowly.' },
        { t: 'p', html: 'The second warning is the sand, or rather the lack of it. Montjoi is a cove of about <strong>400 metres of coarse gravel mixed with pebbles</strong>, not the fine sand of the postcard: without water shoes it’s hard to walk to the water, and for lying down an air bed helps. In return the water is clean and clear — the cove sits inside the <strong>Cap de Creus Natural Park</strong>, Catalonia’s first land-and-sea park — and the rocky ground at either end is good for snorkelling. Don’t expect a big-beach bar: the services are those of a cove, minimal, and in peak season it’s wise to bring water and food.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The rule fits into a timetable: <strong>either arrive before 10.30, or come after 16.30</strong>, or walk, cycle or come by boat. First thing you get the cove quiet, the car park free and the best light. From five in the afternoon, when the road reopens, the bay already faces west and lines up one of the finest sunsets on the cape. Midday in August is exactly the opposite: the hour when you can’t drive in and when the sun is hardest on a beach with almost no shade.' },
        { t: 'p', html: 'There’s a detail the brochure forgets that here works in your favour: the <strong>three hills enclosing the cove shelter it from the tramuntana</strong>, the northerly wind that wrecks so many days in the Empordà. When it blows hard and the open beaches of Roses turn unusable, Montjoi holds and is one of the few safe anchorages around — which is why it fills with boats. If you still find it packed, follow the same road a little further to <strong>Cala Jóncols</strong>: more remote, with a rougher final track, but almost always emptier.' },
        { t: 'quote', text: 'It’s no secret cove or lost beach bar: it’s the sea-facing yard of the most copied restaurant in the world, with opening hours and a floor of stones. Knowing that changes the plan.' },
        { t: 'p', html: 'So Cala Montjoi isn’t discovered, it’s scheduled. Pick the hour before the day, pack the water shoes and drive down while the road is open: waiting at the far end is the same clear sea Adrià looked at while he reinvented cooking, three hills that stop the wind, and a bay that, at seven in the evening, turns the colour of golden stone. The museum closes by appointment; the sunset doesn’t.' },
      ],
      faq: [
        { q: 'Can you drive into Cala Montjoi in summer?', a: 'From 15 July to 31 August road access is closed between 10.30 and 16.30. You need to arrive before mid-morning (the car park is small and fills up) or wait until mid-afternoon. You can also walk in, cycle or come by boat.' },
        { q: 'Can you visit elBulli at Cala Montjoi?', a: 'Ferran Adrià’s restaurant closed in 2011. Since 2023 the space has been elBulli1846, a museum run by his foundation, visited by prior booking; it is not a restaurant or a free walk-in.' },
        { q: 'Is Cala Montjoi sandy?', a: 'Not really: it’s a cove of coarse gravel and pebbles, not fine sand. Bring water shoes to get into the water and an air bed or mat to be comfortable. The water, though, is clean and good for snorkelling at the rocky ends.' },
      ],
    },
  },
  // ───── Diario de playas · País Vasco (voz bicéfala) ─────
  {
    slug: 'playa-de-laga-ibarrangelu-bizkaia-bandera-roja-ogono',
    category: 'guias',
    title: 'Playa de Laga (Bizkaia): bandera roja habitual bajo el acantilado de Ogoño (279 m)',
    excerpt:
      'La lengua de arena dorada de Ibarrangelu, en la Reserva de la Biosfera de Urdaibai, mira al mar abierto y no perdona: genera corrientes de resaca que giran en corredores hacia fuera, la bandera roja ondea con frecuencia, el agua del Cantábrico se queda fría en pleno agosto y la marea estrecha mucho la arena. El cabo Ogoño le cae encima con 279 metros de acantilado.',
    heroAlt: 'Playa de arena fina y dorada de Laga, entre dunas y el acantilado verde del cabo Ogoño, abierta al mar Cantábrico, en Ibarrangelu (Bizkaia)',
    heroQuery: 'laga,urdaibai,bizkaia,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-13T11:09:17Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/pais-vasco', label: 'Playas del País Vasco' },
      { href: '/banderas-azules', label: 'Playas con Bandera Azul' },
      { href: '/playas-sin-viento', label: 'Playas resguardadas del viento' },
    ],
    body: [
      { t: 'p', html: 'Se baja hacia Laga por una carretera que primero esconde el mar y luego lo suelta de golpe: una lengua de arena rubia encajada entre dos moles de piedra, con el caserío verde de Ibarrangelu a la espalda y el peñón de Ogoño cayendo a plomo sobre el agua. Es de esas playas que el coche encuentra cuesta abajo, cuando ya no esperabas nada, y que obligan a levantar el pie del acelerador para mirar.' },
      { t: 'p', html: 'A media mañana de agosto huele a mar abierto y a monte húmedo, esa mezcla que solo da la cornisa cantábrica. Los surfistas ya están dentro; las familias extienden la toalla lejos de la orilla, donde el oleaje rompe corto y seco. Laga no es una piscina: es el Cantábrico haciendo lo que sabe hacer.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)' },
      { t: 'p', html: 'Laga está en <strong>Ibarrangelu (Bizkaia)</strong>, dentro de la <strong>Reserva de la Biosfera de Urdaibai</strong>, declarada por la UNESCO en 1984. Son unos <strong>574 metros de arena fina y dorada</strong>, con un cordón de dunas al fondo y el <strong>cabo Ogoño —279 metros, uno de los acantilados más altos de la costa vasca—</strong> cerrando el flanco sur. Esa pared es a la vez el gancho y el problema: regala sombra a última hora de la tarde, pero también encajona viento y oleaje.' },
      { t: 'p', html: 'El contra honesto está en el agua. Laga mira al norte, al mar abierto, sin cabo ni isla que la resguarde. El oleaje genera <strong>corrientes circulares que giran en sentidos opuestos</strong> y, donde se encuentran, forman corredores de resaca que empujan mar adentro. No es una rareza puntual: la <strong>bandera roja ondea con frecuencia</strong> y, cuando hay mar, el baño con niños está desaconsejado. Añade el agua del Cantábrico, que en pleno verano se queda en cifras que hacen dudar en la orilla, muy por debajo de las del Mediterráneo.' },
      { t: 'p', html: 'Y la marea manda. Con la pleamar la franja de arena se estrecha mucho y la gente se apiña contra las dunas, así que conviene mirar la tabla de mareas antes de salir de casa. El <strong>aparcamiento, de pago en temporada</strong>, se llena pronto: a partir de media mañana en julio y agosto, entrar en coche hasta la playa es una lotería.' },
      { t: 'h2', text: 'El criterio del local' },
      { t: 'p', html: '<strong>Cuándo SÍ:</strong> primavera y septiembre, con mar de fondo suave, marea bajando y el sol todavía calentando la arena. Entre semana y antes de las once tienes sitio, y el cabo Ogoño de testigo casi para ti.' },
      { t: 'p', html: '<strong>Cuándo NO:</strong> un día de galerna o de mar del noroeste con dos metros de ola. Ese día Laga es de tablas, no de bañistas, y si ves la bandera roja no es decoración. Tampoco es la playa para meter a críos pequeños si el socorrista lo desaconseja.' },
      { t: 'p', html: '<strong>El truco:</strong> llega temprano y, si el aparcamiento de abajo está completo, deja el coche arriba y baja andando; el paseo se hace. Si lo tuyo es el baño tranquilo y no el surf, la vecina <strong>Laida</strong> —al otro lado de la ría del Oka, donde la marea baja descubre grandes bancos de arena— perdona mucho más. Y si el noroeste sopla fuerte en toda la costa, tierra adentro por Urdaibai hay planes que no dependen del estado del mar.' },
      { t: 'quote', text: 'Laga no traiciona a nadie: enseña la bandera roja a la vista de todos. La foto perfecta la pones tú; la resaca la pone el Cantábrico.', cite: 'Criterio Playas de España' },
      { t: 'p', html: 'Al caer la tarde, cuando la sombra del Ogoño se come la arena y los últimos surfistas salen goteando, Laga se queda callada con el estuario de Urdaibai respirando a un lado. No es una playa cómoda ni pretende serlo. Es un trozo de Cantábrico con nombre propio que se disfruta más cuando se entiende: mirando la marea, respetando la bandera y aceptando que aquí el que decide es el mar.' },
    ],
    faq: [
      { q: '¿Se puede uno bañar con niños en la playa de Laga?', a: 'Con precaución y solo los días de mar en calma. Laga mira al mar abierto y genera corrientes de resaca; la bandera roja ondea con frecuencia y entonces el baño está desaconsejado. Haz caso al socorrista y a la bandera, y vigila la marea, que en pleamar estrecha mucho la arena.' },
      { q: '¿Dónde se aparca en Laga y es fácil encontrar sitio?', a: 'Hay aparcamiento de pago en temporada junto a la playa, pero se llena pronto: en julio y agosto, a partir de media mañana, entrar en coche es complicado. Lo práctico es llegar temprano o dejar el coche en las bolsas de arriba y bajar andando.' },
      { q: '¿Qué diferencia hay entre Laga y Laida?', a: 'Están casi enfrente, en Urdaibai. Laga mira al mar abierto, con más ola y corrientes, y es playa de surf. Laida se abre en la desembocadura del Oka y, con la marea baja, descubre enormes bancos de arena y un baño más resguardado. Para un chapuzón tranquilo, Laida; para surf y paisaje bravo, Laga.' },
    ],
    en: {
      title: 'Playa de Laga (Bizkaia): red flags are routine below the 279 m Ogoño cliff',
      excerpt:
        'The golden dune beach at Ibarrangelu, inside the Urdaibai Biosphere Reserve, looks a picture but faces the open Cantabrian Sea and does not forgive: circular rip currents run seaward, the red flag flies often, the water stays cold in high summer and the tide swallows the sand. Cabo Ogoño towers 279 metres above it.',
      related: [
        { href: '/en/magazine', label: 'Magazine' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'You drop down to Laga on a road that hides the sea and then hands it over all at once: a tongue of blond sand wedged between two blocks of stone, the green farmhouses of Ibarrangelu at your back and the Ogoño headland falling sheer into the water. It is one of those beaches the car finds on the way downhill, when you were expecting nothing, and that makes you ease off the throttle to look.' },
        { t: 'p', html: 'On an August mid-morning it smells of open sea and damp hillside, that mix only the Cantabrian coast gives you. The surfers are already in; families lay their towels well back from the shore, where the swell breaks short and hard. Laga is no swimming pool: it is the Cantabrian doing what it does.' },
        { t: 'h2', text: 'The facts (and what the brochure leaves out)' },
        { t: 'p', html: 'Laga sits in <strong>Ibarrangelu (Bizkaia)</strong>, inside the <strong>Urdaibai Biosphere Reserve</strong>, designated by UNESCO in 1984. It runs to some <strong>574 metres of fine golden sand</strong>, backed by a belt of dunes, with <strong>Cabo Ogoño —279 metres, one of the highest cliffs on the Basque coast—</strong> closing off its southern flank. That wall is both the draw and the catch: it throws welcome shade late in the day, but it also funnels wind and swell.' },
        { t: 'p', html: 'The honest downside is in the water. Laga faces north, out to open sea, with no cape or island to shelter it. The swell sets up <strong>circular currents spinning in opposite directions</strong>, and where they meet they form rip corridors that push you offshore. This is not a freak event: the <strong>red flag flies often</strong>, and when there is a sea running, swimming with children is not advised. Add the Cantabrian water, which even in high summer stays at temperatures that make you hesitate at the shoreline, well below the Mediterranean.' },
        { t: 'p', html: 'And the tide rules. At high water the strip of sand narrows sharply and people crowd against the dunes, so it pays to check the tide table before you leave home. The <strong>car park, paid in season</strong>, fills early: from mid-morning in July and August, driving down to the beach is a lottery.' },
        { t: 'h2', text: 'A local’s judgement' },
        { t: 'p', html: '<strong>When to go:</strong> spring and September, with a gentle groundswell, a falling tide and the sun still warming the sand. Midweek and before eleven you will have room, with Cabo Ogoño watching over almost only you.' },
        { t: 'p', html: '<strong>When not to:</strong> a day of galerna or a north-westerly sea with two-metre waves. On days like that Laga belongs to the boards, not to bathers, and if you see the red flag it is not decoration. Nor is it the beach for small children if the lifeguard advises against it.' },
        { t: 'p', html: '<strong>The trick:</strong> arrive early and, if the lower car park is full, leave the car up top and walk down; the stroll is easy enough. If you want a calm swim rather than surf, neighbouring <strong>Laida</strong> —across the Oka estuary, where the ebbing tide uncovers huge sandbanks— is far more forgiving. And if the north-westerly is blowing hard along the whole coast, inland Urdaibai has plans that do not depend on the state of the sea.' },
        { t: 'quote', text: 'Laga betrays no one: it flies the red flag in plain sight. The perfect photo is down to you; the rip current is down to the Cantabrian.', cite: 'Playas de España' },
        { t: 'p', html: 'As the light fades, when Ogoño’s shadow eats the sand and the last surfers walk out dripping, Laga falls quiet with the Urdaibai estuary breathing off to one side. It is not a comfortable beach and does not pretend to be. It is a piece of the Cantabrian with a name of its own, best enjoyed once you understand it: reading the tide, respecting the flag and accepting that here the sea is the one that decides.' },
      ],
      faq: [
        { q: 'Is Laga safe for swimming with children?', a: 'With care, and only on calm days. Laga faces the open sea and sets up rip currents; the red flag flies often, and when it does, swimming is not advised. Follow the lifeguard and the flag, and watch the tide, which narrows the sand sharply at high water.' },
        { q: 'Where do you park at Laga, and is it easy?', a: 'There is a paid seasonal car park by the beach, but it fills early: in July and August, from mid-morning, driving down is difficult. The practical move is to arrive early, or leave the car in the upper overflow areas and walk down.' },
        { q: 'What is the difference between Laga and Laida?', a: 'They sit almost opposite each other in Urdaibai. Laga faces the open sea, with more swell and currents, and is a surf beach. Laida opens at the mouth of the Oka and, at low tide, uncovers vast sandbanks and a more sheltered swim. For a quiet dip, Laida; for surf and wild scenery, Laga.' },
      ],
    },
  },
  // ───── Diario de playas · Andalucía (voz bicéfala) ─────
  {
    slug: 'playa-de-los-muertos-carboneras-agua-profunda-sin-socorrista',
    category: 'guias',
    title: 'Playa de los Muertos (Almería): 20 min de bajada, un mar que cubre de golpe y sin socorrista',
    excerpt:
      'La playa de bolos y arena gruesa de Carboneras que encabeza listas de viajeros esconde una letra pequeña dura: no se llega en coche hasta la orilla, hay que bajar 15-20 minutos por un sendero empinado de acantilado, el agua se hace honda a pocos metros, la resaca tira con levante y no tiene socorrista, sombra ni servicios. Su propio nombre viene de las corrientes.',
    heroAlt: 'Playa larga de bolos claros y arena gruesa de la Playa de los Muertos, al pie de un acantilado, con agua turquesa profunda, en Carboneras, Almería',
    heroQuery: 'los muertos,carboneras,almeria,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-09T17:04:10Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/andalucia', label: 'Playas de Andalucía' },
      { href: '/playas-secretas', label: 'Playas y calas poco masificadas' },
      { href: '/calas-con-encanto', label: 'Calas con encanto en España' },
    ],
    body: [
      { t: 'p', html: 'Desde el mirador que hay junto a la carretera de <strong>Carboneras</strong>, en el borde norte del Cabo de Gata almeriense, se ve de golpe: una lengua de casi un kilómetro de bolos claros y arena gruesa al pie de un acantilado, con el agua entrando de un azul tan denso que parece pintado. Y arriba, un cartel que avisa. La playa se llama de los Muertos y el nombre no es un adorno macabro para vender misterio: durante generaciones, las corrientes de esta parte del litoral empujaban hasta aquí a los ahogados y a los náufragos de los barcos que se perdían frente a la costa. El mar que hace tan bonita la postal es el mismo que puso el nombre.' },
      { t: 'p', html: 'Bajas por un sendero que serpentea por la ladera, entre matorral bajo y roca suelta, y la playa va creciendo a tus pies sin que llegues nunca del todo. Cuando por fin pisas los bolos, el sitio se explica solo: nada de paseo marítimo, ni chiringuito, ni sombrillas de alquiler; solo el acantilado a la espalda, el agua transparente delante y el ruido de las piedras rodando con cada ola. Es de esas playas que salen en todas las listas de "mejores de España" votadas por viajeros. Lo que esas listas rara vez cuentan es lo que cuesta llegar y lo que hay que respetar una vez abajo.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Primer dato, el que ordena todo lo demás: <strong>no se llega en coche hasta la playa</strong>. Se aparca arriba, en una explanada junto a la carretera de Carboneras a Agua Amarga, y desde ahí hay que bajar caminando <strong>entre 15 y 20 minutos por un sendero empinado</strong>, de tierra y roca suelta, sin barandilla y sin sombra. La bajada ya pide calzado con suela y cuidado; la <strong>subida de vuelta, al mediodía y con calor almeriense</strong>, es el tramo que de verdad castiga, sobre todo cargando nevera, niños o sombrilla. En verano la explanada se llena pronto y en los días punta se regula el acceso: si llegas tarde, te quedas sin sitio arriba y sin plan.' },
      { t: 'p', html: 'Segundo dato, el importante de verdad: <strong>el agua se hace honda a muy pocos metros de la orilla</strong>. El fondo cae rápido, no hay esa larga plataforma de poca profundidad que dan las playas de arena fina, y con levante la <strong>resaca tira hacia fuera</strong>. Aquí <strong>no hay socorrista</strong> —ni torre, ni vigilancia, ni bandera que te diga cómo está el mar—, así que la lectura del oleaje corre de tu cuenta. No es una playa mansa de flotador y orilla: es agua profunda y limpia para quien nada bien, y un sitio donde hay que tener respeto si el mar está movido o vas con niños. La superficie del suelo tampoco perdona: son <strong>bolos y arena gruesa</strong>, no polvo fino, de modo que descalzo se anda regular y el escarpín no sobra.' },
      { t: 'p', html: 'Tercer dato, la logística: <strong>abajo no hay absolutamente nada</strong>. Sin chiringuito fijo, sin agua potable, sin aseos, sin sombra natural más allá de la que dé el acantilado a ciertas horas y sin papeleras que aguanten agosto. Al ser Parque Natural de Cabo de Gata-Níjar, además, el entorno está protegido: lo que bajas, lo subes; la basura vuelve contigo cuesta arriba. Es también una playa donde el <strong>nudismo está normalizado</strong> en buena parte del arenal, sin que sea de uso exclusivo. En conjunto: agua espectacular y cero comodidades, que es justo lo que la ha salvado de convertirse en otra playa de sombrillas en fila.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: '<strong>Cuándo sí:</strong> a primera hora de la mañana, con el mar en calma y la explanada aún medio vacía, es cuando esta playa vale cada minuto de bajada; el agua está más quieta, el sol todavía no aprieta para la subida y tienes sitio de sobra en el kilómetro de bolos. <strong>Cuándo no:</strong> con <strong>levante</strong> soplando —el viento de componente este que aquí levanta oleaje y resaca— el baño se complica y sin socorrista no compensa el riesgo; y a mediodía de agosto, con la explanada llena, el acceso regulado y la cuesta a pleno sol, el plan se vuelve incómodo. El truco es ir <strong>temprano y entre semana</strong>, mirar el parte de viento antes de salir de casa y bajar solo lo que puedas subir a pulso.' },
      { t: 'p', html: 'Prepárate para no encontrar nada abajo: <strong>agua, comida, sombra portátil, escarpines y crema</strong>, porque no hay dónde comprar ni resguardarse. Si el mar está bravo o vas con peques pequeños que quieren orilla mansa, la <strong>alternativa</strong> está cerca: <strong>Agua Amarga</strong>, unos kilómetros al norte, es un pueblo con playa de arena, acceso a pie de coche, chiringuitos y una entrada al agua mucho más amable; y hacia el sur, ya en pleno parque, las calas del entorno de San José (Mónsul, Los Genoveses) ofrecen arena de verdad. Los Muertos es para un baño de agua honda a buena hora y volver a subir; no para plantar la nevera y pasar el día tumbado.' },
      { t: 'quote', text: 'No es la playa idílica de agua quieta que promete la foto: es agua profunda, sin socorrista y con una cuesta de veinte minutos de propina. Sabiendo nadar, yendo temprano y mirando el viento, es de las mejores de Almería; con el mar movido o con niños de flotador, mejor Agua Amarga.' },
      { t: 'p', html: 'Y aun con toda la letra pequeña, a la hora buena entiendes por qué figura en todas las listas. Cuando bajas los últimos metros del sendero con el sol aún tumbado, sin apenas nadie en el arenal, y te metes en un agua tan clara que ves el fondo a varios metros, la playa te devuelve el esfuerzo entero. Dura lo que dura la calma: a media mañana empezarán a llegar los primeros por la cuesta y, si entra el levante, el mar cambiará de humor. Ve al alba, respeta el agua, súbete la basura y guárdate el sitio en la memoria; esta no es una playa que se conquiste con prisa.' },
    ],
    faq: [
      { q: '¿Por qué se llama Playa de los Muertos?', a: 'El nombre viene del mar, no del marketing: las corrientes de esta zona del litoral de Carboneras arrastraban históricamente hasta la orilla los cuerpos de ahogados y de náufragos de barcos que se perdían frente a la costa. Es el mismo mar profundo y de corriente fuerte que hoy hay que respetar en el baño.' },
      { q: '¿Cómo se llega y se puede aparcar cerca de la Playa de los Muertos?', a: 'No se llega en coche hasta la arena. Se aparca arriba, en una explanada junto a la carretera de Carboneras a Agua Amarga, y desde ahí hay que bajar caminando entre 15 y 20 minutos por un sendero empinado de tierra y roca, sin sombra. La subida de vuelta, con calor, es exigente. En verano la explanada se llena pronto y en días punta se regula el acceso, así que conviene llegar temprano.' },
      { q: '¿Es peligroso bañarse en la Playa de los Muertos?', a: 'Hay que tomárselo en serio: el fondo se hace hondo a pocos metros de la orilla, con levante aparece resaca que tira hacia fuera y no hay socorrista ni vigilancia. Es agua limpia y estupenda para quien nada bien y va con el mar en calma, pero no es una playa mansa de orilla larga; con oleaje o con niños pequeños conviene una alternativa como Agua Amarga.' },
    ],
    en: {
      title: 'Playa de los Muertos (Almería): a 20-min cliff descent, water that drops off fast, no lifeguard',
      excerpt: 'The pebble-and-coarse-sand beach near Carboneras that tops travellers’ lists comes with hard small print: you can’t drive to the shore, it’s a steep 15-20 minute walk down a cliff path, the water deepens within a few metres, the undertow pulls when the levante blows, and there is no lifeguard, no shade and no services. Even the name comes from the currents.',
      related: [
        { href: '/en/magazine', label: 'More from the Magazine' },
        { href: '/en/crystal-clear-water-beaches', label: 'Clear-water beaches in Spain' },
      ],
      body: [
        { t: 'p', html: 'From the viewpoint beside the road out of <strong>Carboneras</strong>, on the northern edge of Almería’s Cabo de Gata, you see it all at once: a near-kilometre run of pale pebbles and coarse sand at the foot of a cliff, the sea coming in a blue so dense it looks painted. And at the top, a warning sign. The beach is called Playa de los Muertos — the Beach of the Dead — and the name is not macabre marketing: for generations the currents along this stretch pushed the drowned and the shipwrecked ashore here. The very sea that makes the postcard is the one that named it.' },
        { t: 'p', html: 'You walk down a path that zigzags across the slope, through low scrub and loose rock, the beach growing at your feet without ever quite arriving. When you finally step onto the pebbles, the place explains itself: no promenade, no beach bar, no hired parasols — just the cliff at your back, the clear water in front and the rattle of stones rolling with each wave. It’s one of those beaches that turn up on every traveller-voted "best in Spain" list. What those lists rarely mention is what it takes to get down here, and what you have to respect once you do.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'First fact, the one that governs the rest: <strong>you cannot drive to the beach</strong>. You park up top, on an open lot beside the Carboneras–Agua Amarga road, and from there it’s a <strong>15-20 minute walk down a steep path</strong> of earth and loose rock, no handrail and no shade. The descent already asks for proper soles and care; the <strong>climb back up, at midday in Almería heat</strong>, is the stretch that really punishes — especially carrying a cool box, children or a parasol. In summer the lot fills early and on peak days access is capped: arrive late and you’re left without a spot up top and without a plan.' },
        { t: 'p', html: 'Second fact, the important one: <strong>the water gets deep within a few metres of the shore</strong>. The bottom drops away quickly — there’s none of the long shallow shelf that fine-sand beaches give — and when the <strong>levante</strong> blows the <strong>undertow pulls seaward</strong>. There is <strong>no lifeguard</strong> here — no tower, no patrol, no flag to tell you how the sea is — so reading the swell is on you. This is not a gentle paddling beach: it’s clean, deep water for confident swimmers, and a place to treat with respect if the sea is up or you’re with children. The ground underfoot is no softer: <strong>pebbles and coarse sand</strong>, not fine powder, so bare feet struggle and water shoes earn their place.' },
        { t: 'p', html: 'Third fact, the logistics: <strong>there is absolutely nothing at the bottom</strong>. No fixed beach bar, no drinking water, no toilets, no natural shade beyond what the cliff throws at certain hours, and no bins that survive August. As it sits within the Cabo de Gata-Níjar Natural Park, the surroundings are protected: what you carry down, you carry up; the rubbish comes back with you, uphill. It’s also a beach where <strong>nudism is normalised</strong> across much of the sand, without being exclusively so. In short: superb water and zero comforts — which is precisely what has saved it from becoming another beach of parasols in a row.' },
        { t: 'h2', text: 'A local’s take', id: 'local' },
        { t: 'p', html: '<strong>When yes:</strong> early morning, sea calm and the car park still half-empty — that’s when this beach is worth every minute of the walk down; the water is stiller, the sun isn’t yet hammering the climb back, and you have the whole kilometre of pebbles to yourself. <strong>When no:</strong> with the <strong>levante</strong> blowing — the easterly that lifts swell and undertow here — swimming gets tricky and, with no lifeguard, the risk isn’t worth it; and at midday in August, with the lot full, access capped and the slope in full sun, the whole plan turns awkward. The trick is to go <strong>early and midweek</strong>, check the wind forecast before you leave home, and carry down only what you can carry back up.' },
        { t: 'p', html: 'Come prepared to find nothing below: <strong>water, food, portable shade, water shoes and sun cream</strong>, because there’s nowhere to buy or to shelter. If the sea is rough or you’re with small children who want gentle shallows, the <strong>alternative</strong> is close: <strong>Agua Amarga</strong>, a few kilometres north, is a village with a sandy beach, parking at the door, beach bars and a far kinder entry into the water; and to the south, deep in the park, the coves around San José (Mónsul, Los Genoveses) offer real sand. Los Muertos is for a deep-water swim at a good hour and a climb back out — not for pitching the cool box and lying about all day.' },
        { t: 'quote', text: 'It isn’t the idyllic still-water beach the photo promises: it’s deep water, no lifeguard and a twenty-minute climb thrown in. If you can swim, go early and check the wind, it’s among the best in Almería; with the sea up or small children on floats, Agua Amarga is the smarter call.' },
        { t: 'p', html: 'And even with all the small print, at the right hour you understand why it makes every list. When you drop the last stretch of path with the sun still low and barely a soul on the sand, and wade into water so clear you can see the bottom several metres down, the beach hands back the whole effort. It lasts as long as the calm does: by mid-morning the first arrivals will come down the slope and, if the levante sets in, the sea will change its mood. Go at dawn, respect the water, carry your rubbish out, and keep the spot in your memory — this is not a beach you take at a rush.' },
      ],
      faq: [
        { q: 'Why is it called Playa de los Muertos?', a: 'The name comes from the sea, not from marketing: the currents along this part of the Carboneras coast historically washed ashore the bodies of the drowned and the shipwrecked from vessels lost off the shore. It’s the same deep, strong-current water you have to respect when swimming today.' },
        { q: 'How do you get to Playa de los Muertos, and can you park nearby?', a: 'You can’t drive down to the sand. You park up top, on an open lot beside the Carboneras–Agua Amarga road, and from there it’s a steep 15-20 minute walk down a path of earth and rock, with no shade. The climb back in the heat is demanding. In summer the lot fills early and on peak days access is capped, so arrive early.' },
        { q: 'Is it dangerous to swim at Playa de los Muertos?', a: 'Take it seriously: the bottom drops off within a few metres of the shore, the levante brings an undertow that pulls seaward, and there is no lifeguard or patrol. It’s clean, excellent water for confident swimmers on a calm day, but it isn’t a gentle beach with long shallows; with swell or young children, an alternative such as Agua Amarga is wiser.' },
      ],
    },
  },
  // ───── Diario de playas · Baleares (voz bicéfala) ─────
  {
    slug: 'calo-des-moro-mallorca-40-metros-bajada',
    category: 'guias',
    title: 'Caló des Moro (Mallorca): 40 m de arena y una bajada a gatas que frena a mucha gente',
    excerpt:
      'Una de las calas más fotografiadas del sureste de Mallorca, con una letra pequeña dura: mide unos 40 metros, se llega tras 20-25 minutos a pie y una bajada final tan empinada que hay que usar las manos, no tiene aparcamiento cerca ni sombra ni socorrista, y en agosto el acceso se regula con lanzadera.',
    heroAlt: 'Cala diminuta de arena blanca de Caló des Moro encajada entre acantilados de pino y roca, en el municipio de Santanyí, sureste de Mallorca',
    heroQuery: 'calo des moro,santanyi,mallorca,cove',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-09T13:27:46Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/islas-baleares', label: 'Playas de Baleares' },
      { href: '/calas-con-encanto', label: 'Calas con encanto en España' },
      { href: '/playas-secretas', label: 'Playas y calas poco masificadas' },
    ],
    body: [
      { t: 'p', html: 'Se llega andando y sin verla hasta el último momento. Desde la urbanización de Cala Llombards, en el municipio de <strong>Santanyí</strong>, al sureste de Mallorca, un camino sale entre pinos y paredes de roca caliza y baja en silencio hacia el mar. Primero es asfalto de calles residenciales, después un sendero de tierra pegado al borde del acantilado, y solo al final, cuando ya crees que el mapa te ha engañado, se abre el hueco: una lengua de arena blanca de apenas unos pasos encajada entre dos brazos de roca, con el agua entrando mansa y el pinar cayendo casi hasta la orilla. Es Caló des Moro, y hasta 2016 casi nadie de fuera sabía llegar.' },
      { t: 'p', html: 'Después llegó el teléfono con cámara. La misma foto —arena clara, agua quieta, acantilado de pino— empezó a repetirse por millones en las redes, y la cala diminuta que se compartían los vecinos de Santanyí se convirtió en una de las postales más publicadas de Baleares. El problema es que la foto no cabe la gente que la busca: lo que en la pantalla parece un balcón vacío sobre el mar, a mediodía de agosto es una escalera de bañistas haciendo cola para bajar los últimos metros. La cala no ha cambiado; ha cambiado cuánta gente sabe dónde está.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Empecemos por el tamaño, que lo explica casi todo: Caló des Moro es una cala <strong>minúscula, de unos 40 metros de largo y muy estrecha</strong>, de arena fina y clara, orientada al este dentro de la costa acantilada de Santanyí. Ese es su encanto y su condena a la vez: <strong>cabe poquísima gente</strong>, así que se satura en cuanto llegan las primeras decenas de personas. El segundo dato es el acceso. <strong>No se llega en coche hasta la cala</strong>: se aparca arriba, en una campa no vigilada de menos de cincuenta plazas junto a Cala Llombards, y desde ahí hay <strong>entre 20 y 25 minutos andando</strong> —primero por calles de la urbanización, luego por un sendero de tierra—. Desde 2017 el tráfico por esas calles está restringido a residentes, precisamente para frenar la avalancha.' },
      { t: 'p', html: 'Y el tercer dato es el que más gente descubre por las malas: <strong>el tramo final es una bajada muy empinada</strong>, por rocas y escalones irregulares, donde en más de un punto hay que <strong>ayudarse con las manos</strong> para no resbalar. Con chanclas, con niños pequeños, con un carrito o con problemas de movilidad, ese descenso es exigente, y la subida de vuelta —al sol y cargado— más todavía. Abajo, además, <strong>no hay prácticamente nada</strong>: sin chiringuito fijo, sin sombra natural más allá de la que dé el acantilado a ciertas horas, sin agua potable y <strong>sin socorrista</strong>. Los únicos aseos están arriba, en el aparcamiento, y como mucho aparece en verano un quiosco ambulante. Lo que no bajes contigo por esa cuesta, no lo hay.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La primera decisión es la hora, y aquí no hay margen: o llegas <strong>a primerísima hora de la mañana</strong> —al amanecer, literalmente— o te comes la cola y la campa llena. A media mañana en julio y agosto el aparcamiento ya está completo y la cala, saturada; en <strong>agosto el acceso se regula</strong> y funciona una <strong>lanzadera</strong> para descargar la zona, con lo que el plan de "acerco el coche y bajo un rato" no existe. Si puedes elegir fecha, ve <strong>en mayo, junio o septiembre y entre semana</strong>: misma cala, una cuarta parte de gente. Calza algo con suela para el sendero y la bajada, baja agua y comida, y súbete tu basura: no hay papeleras abajo que aguanten el verano.' },
      { t: 'p', html: 'La segunda es tener un plan B a mano, porque muchos días Caló des Moro estará imposible. Justo al lado tienes <strong>Cala Llombards</strong>, más grande, con arena, algo de sombra y acceso mucho más cómodo desde el mismo aparcamiento: para un día de familia con sombrilla y baño largo es bastante mejor idea. Y a un paso, siguiendo el acantilado, están <strong>Cala s’Almunia</strong> y el arco de roca de <strong>es Pontàs</strong>, más de escalada por las piedras que de toalla, pero con la misma agua y menos aglomeración. Caló des Moro está para verla temprano, bañarte media hora y hacer la foto antes de que baje el gentío; no para plantar la nevera y pasar el día.' },
      { t: 'quote', text: 'No es una cala secreta: es una de las calas más fotografiadas de Mallorca, con cola para bajar en agosto y sitio para muy pocos. Sabiéndolo —y yendo al amanecer— sigue mereciendo la caminata; a mediodía, es una decepción con mucha cuesta.' },
      { t: 'p', html: 'Aun así, a la hora buena compensa. Si bajas los últimos escalones cuando el sol acaba de asomar por el este y todavía no hay nadie, la cala vuelve a ser lo que era antes de las redes: cuarenta metros de arena entre dos paredes de pino, el agua entrando sin ruido y el acantilado recortado contra la luz temprana. Dura poco: en un par de horas empezarán a llegar los primeros, y para el mediodía la escena será otra. Ve al alba, quédate el rato que aguante la calma, sube antes de que se llene el sendero; y si te la encuentras a rebosar, no fuerces la bajada por una foto —súbete a Cala Llombards, que ese día será la cala lista.' },
    ],
    faq: [
      { q: '¿Cómo se llega a Caló des Moro y se puede aparcar cerca?', a: 'Se aparca arriba, en una campa no vigilada de menos de cincuenta plazas junto a la urbanización de Cala Llombards (Santanyí), y desde ahí se camina entre 20 y 25 minutos: primero por calles residenciales y luego por un sendero de tierra. El tráfico por esas calles está restringido a residentes desde 2017, y en agosto el acceso se regula con una lanzadera. No se llega en coche hasta la arena.' },
      { q: '¿Es difícil la bajada a Caló des Moro?', a: 'El tramo final es una bajada muy empinada por rocas y escalones irregulares, y en algún punto hay que ayudarse con las manos. No es cómoda con chanclas, carritos ni niños muy pequeños, y la subida de vuelta es exigente. Conviene calzado con suela y bajar solo lo que puedas cargar.' },
      { q: '¿Cuál es la mejor hora para ir a Caló des Moro?', a: 'A primerísima hora de la mañana, prácticamente al amanecer: es una cala minúscula (unos 40 metros) que se satura enseguida. En julio y agosto el aparcamiento se llena a media mañana y la cala se masifica; si puedes, ve en mayo, junio o septiembre y entre semana. Como alternativa cómoda tienes Cala Llombards, al lado.' },
    ],
    en: {
      title: 'Caló des Moro (Mallorca): 40 m of sand and a scramble down that stops many short',
      excerpt: 'One of the most photographed coves in south-east Mallorca, with hard small print: it is barely 40 metres long, reached after a 20-25 minute walk and a final descent so steep you need your hands, with no parking nearby, no shade and no lifeguard — and in August access is capped with a shuttle bus.',
      related: [
        { href: '/en/magazine', label: 'More from the Magazine' },
        { href: '/en/crystal-clear-water-beaches', label: 'Clear-water beaches in Spain' },
      ],
      body: [
        { t: 'p', html: 'You reach it on foot, and you don’t see it until the last moment. From the Cala Llombards development, in the municipality of <strong>Santanyí</strong>, in south-east Mallorca, a path leaves between the pines and walls of limestone and drops quietly towards the sea. First it is the tarmac of residential streets, then a dirt track pinned to the edge of the cliff, and only at the end, when you are sure the map has misled you, does the gap open up: a tongue of pale sand just a few paces wide, wedged between two arms of rock, the water sliding in gently and the pine wood dropping almost to the shoreline. This is Caló des Moro, and until 2016 almost no outsider knew how to find it.' },
        { t: 'p', html: 'Then came the camera phone. The same photograph — pale sand, still water, pine-topped cliff — began repeating itself by the million on social media, and the tiny cove the people of Santanyí kept to themselves became one of the most posted images in the Balearics. The trouble is that the photograph doesn’t hold the crowd it draws: what looks on the screen like an empty balcony over the sea is, at midday in August, a staircase of bathers queuing to climb down the last few metres. The cove hasn’t changed; what has changed is how many people know where it is.' },
        { t: 'h2', text: 'The facts (and the small print)', id: 'facts' },
        { t: 'p', html: 'Start with the size, which explains almost everything: Caló des Moro is a <strong>tiny cove, some 40 metres long and very narrow</strong>, of fine pale sand, facing east along the cliffed coast of Santanyí. That is its charm and its curse at once: <strong>very few people fit</strong>, so it fills the moment the first few dozen arrive. The second fact is access. <strong>You cannot drive to the cove</strong>: you park up top, in an unguarded clearing of fewer than fifty spaces beside Cala Llombards, and from there it is a <strong>20 to 25 minute walk</strong> — first through the development’s streets, then along a dirt path. Since 2017 traffic on those streets has been restricted to residents, precisely to check the flood.' },
        { t: 'p', html: 'And the third fact is the one most people learn the hard way: <strong>the final stretch is a very steep descent</strong>, over rocks and uneven steps, where in more than one spot you have to <strong>use your hands</strong> to keep from slipping. In flip-flops, with small children, a pushchair or reduced mobility, that descent is demanding, and the climb back — in the sun and loaded up — worse still. There is, moreover, <strong>almost nothing at the bottom</strong>: no fixed beach bar, no natural shade beyond what the cliff throws at certain hours, no drinking water and <strong>no lifeguard</strong>. The only toilets are up at the car park, and at most a mobile kiosk turns up in summer. Whatever you don’t carry down that slope isn’t there.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The first call is the hour, and here there is no margin: either you arrive <strong>at the very first light of morning</strong> — at dawn, literally — or you inherit the queue and a full car park. By mid-morning in July and August the parking is already taken and the cove packed; in <strong>August access is capped</strong> and a <strong>shuttle bus</strong> runs to ease the pressure, so the "pull the car up and pop down for a bit" plan simply doesn’t exist. If you can pick the date, go <strong>in May, June or September and midweek</strong>: same cove, a quarter of the people. Wear something with a sole for the path and the descent, carry water and food down, and carry your rubbish back up: no bin down there survives the summer.' },
        { t: 'p', html: 'The second is to keep a plan B within reach, because on many days Caló des Moro will be impossible. Right next door is <strong>Cala Llombards</strong>, larger, with sand, some shade and far easier access from the same car park: for a family day with a parasol and a long swim it is a considerably better idea. And a step away, following the cliff, are <strong>Cala s’Almunia</strong> and the rock arch of <strong>es Pontàs</strong>, more a matter of scrambling over stone than laying down a towel, but with the same water and fewer people. Caló des Moro is for seeing early, swimming for half an hour and taking the photograph before the crowd descends; not for planting the cool box and staying the day.' },
        { t: 'quote', text: 'It is not a secret cove: it is one of the most photographed coves in Mallorca, with a queue to climb down in August and room for very few. Knowing that — and going at dawn — it still earns the walk; at midday it is a disappointment with a lot of hill.' },
        { t: 'p', html: 'And yet, at the right hour, it pays off. If you come down the last steps when the sun has just cleared the eastern horizon and no one is there yet, the cove becomes what it was before the feeds: forty metres of sand between two walls of pine, the water sliding in without a sound and the cliff cut against the early light. It doesn’t last: within a couple of hours the first arrivals begin, and by midday the scene is another. Go at daybreak, stay for as long as the calm holds, climb out before the path fills; and if you find it overflowing, don’t force the descent for a photograph — walk back up to Cala Llombards, which that day will be the sensible cove.' },
      ],
      faq: [
        { q: 'How do you get to Caló des Moro, and can you park nearby?', a: 'You park up top, in an unguarded clearing of fewer than fifty spaces beside the Cala Llombards development (Santanyí), and from there it is a 20 to 25 minute walk: first through residential streets, then along a dirt path. Traffic on those streets has been restricted to residents since 2017, and in August access is capped with a shuttle bus. You cannot drive down to the sand.' },
        { q: 'Is the descent to Caló des Moro difficult?', a: 'The final stretch is a very steep drop over rocks and uneven steps, and at some points you have to use your hands. It is not comfortable in flip-flops, with pushchairs or very small children, and the climb back is demanding. Wear footwear with a sole and carry down only what you can manage.' },
        { q: 'What is the best time to go to Caló des Moro?', a: 'At the very first light of morning, practically at dawn: it is a tiny cove (about 40 metres) that saturates quickly. In July and August the car park fills by mid-morning and the cove gets packed; if you can, go in May, June or September and midweek. As an easier alternative there is Cala Llombards, right next door.' },
      ],
    },
  },
  // ───── Diario de playas · Asturias (voz bicéfala) ─────
  {
    slug: 'playa-del-silencio-cudillero-escalera-acantilado',
    category: 'guias',
    title: 'Playa del Silencio (Asturias): al mar solo se baja por una escalera tallada en la roca',
    excerpt:
      'Uno de los anfiteatros de roca más fotografiados del Cantábrico, con una letra pequeña dura: no hay carretera hasta la arena, se baja por una larga escalera de piedra pegada al acantilado, es de cantos y no de arena fina, y abajo no hay chiringuito, socorrista ni sombra.',
    heroAlt: 'Anfiteatro de acantilados verdes cerrando la playa del Silencio, con los islotes de los Carreiros emergiendo del mar Cantábrico frente a la orilla de cantos, Cudillero, Asturias',
    heroQuery: 'playa del silencio,cudillero,asturias,cove',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-08T13:26:03Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/asturias', label: 'Playas de Asturias' },
      { href: '/playas-secretas', label: 'Playas y calas poco masificadas' },
      { href: '/calas-con-encanto', label: 'Calas con encanto en España' },
    ],
    body: [
      { t: 'p', html: 'Se llega por arriba y sin verla. Desde la aldea de Castañeras, en el concejo de Cudillero, un aparcamiento de tierra deja el coche en lo alto del acantilado y un sendero corto lleva hasta un mirador donde, de golpe, se abre todo: un anfiteatro de paredes verdes cerrando una media luna de piedra, y frente a la orilla un puñado de islotes negros —<strong>los Carreiros</strong>— clavados en el Cantábrico como los restos de una muralla. La llaman playa del Silencio, y en la costa occidental asturiana, con la mar de fondo rompiendo contra los roques, el nombre tiene su parte de ironía sonora.' },
      { t: 'p', html: 'Pero la foto se paga bajando. Del mirador a la arena no hay carretera ni rampa: hay un camino y, al final, una <strong>escalera de piedra pegada al acantilado</strong> que desciende en tramos hasta el nivel del mar. Se baja mirando dónde pisas y se sube resoplando. Es parte del pacto: esta playa te cobra la entrada en piernas, y por eso, en gran medida, sigue siendo lo que es.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Hablamos de una cala en forma de concha dentro del <strong>Paisaje Protegido de la Costa Occidental de Asturias</strong>, entre Castañeras y Novellana. Su gran seña de identidad —el anfiteatro de acantilados y los islotes de los Carreiros— es también la fuente de todos sus contras. El primero: <strong>no se llega en coche hasta la arena</strong>. Se aparca arriba, en una campa limitada, y el último tramo es esa <strong>escalera tallada en la roca</strong>, empinada y sin ascensor de vuelta. Para personas con movilidad reducida, con carrito o con niños muy pequeños, la bajada es exigente y la subida, más. No es un capricho advertirlo: es lo primero que hay que saber.' },
      { t: 'p', html: 'El segundo dato incómodo es el suelo: <strong>no es arena fina, sino canto rodado y bolos</strong>. Descalzo cuesta caminar y entrar al agua sobre piedra suelta pide cuidado; unos escarpines cambian el día. El tercero es que <strong>abajo no hay nada de infraestructura</strong>: sin chiringuito, sin aseos, sin agua potable, sin sombra natural y, lo más serio, <strong>sin socorrista</strong>. Y el cuarto es el mar en sí: es Cantábrico abierto, con <strong>agua fría incluso en agosto</strong>, expuesto al oleaje del noroeste; con mar de fondo, entre roca y corrientes, el baño deja de ser un chapuzón inocente. Lo que baje contigo por la escalera es lo único que tendrás; lo que no mires del parte de mar, lo pagará tu tarde.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La primera decisión es la hora y la fecha. La campa de arriba es <strong>pequeña y se llena pronto</strong> en julio y agosto: o llegas a primera hora de la mañana o te ahorras la vuelta buscando sitio. Mejor todavía, ve en <strong>primavera u otoño</strong> o entre semana: el sol de tarde enciende los acantilados y los islotes para la foto, y tienes la cala casi para ti. Calza algo con suela para la escalera y los cantos, baja agua y comida, y súbete tu basura: aquí no hay papeleras que valgan.' },
      { t: 'p', html: 'La segunda es para qué vas. El Silencio está para <strong>mirar, caminar la orilla de piedra y fotografiar</strong> uno de los anfiteatros más rotundos del norte; con <strong>marea baja</strong> ganas superficie y una entrada más amable. Lo que no es es una playa de hamaca, sombrilla y baño largo con la familia: para eso, en el mismo tramo de costa tienes alternativas más cómodas y con más arena, como <strong>la playa del Aguilar</strong>, en Muros de Nalón, o <strong>la Ribeirona de Cadavedo</strong>, con acceso menos duro. Y antes de bajar, la regla de oro del Cantábrico occidental: <strong>consulta el estado de la mar y del viento</strong>. Con mar de fondo o galerna anunciada, esta playa se admira desde el mirador y punto; no hay nadie ahí abajo para sacarte.' },
      { t: 'quote', text: 'No es un rincón de calma para tumbarse: es un anfiteatro de roca precioso que te cobra la bajada en escaleras y el baño en frío, y conviene saberlo antes de calzarte las chanclas.' },
      { t: 'p', html: 'Y aun así compensa. Cuando el último escalón te deja sobre los cantos y levantas la vista, el círculo de acantilados verdes se cierra sobre ti, los Carreiros parten el oleaje y el estruendo del mar lo llena todo —el Silencio hace honor a su nombre solo cuando no hay nadie más, y por eso hay que buscarlo fuera de agosto y fuera del mediodía—. Baja a verlo, camina su media luna de piedra, quédate al atardecer cuando la roca se pone de color miel; guarda el baño largo y perezoso para las playas de arena de al lado. Confúndete de expectativa y la escalera te recordará, peldaño a peldaño de vuelta, que aquí la postal se gana.' },
    ],
    faq: [
      { q: '¿Cómo se llega a la playa del Silencio y hay acceso para coches?', a: 'Se llega por la aldea de Castañeras, en el concejo de Cudillero, donde hay una campa de aparcamiento de tierra en lo alto del acantilado. Hasta la arena no hay carretera ni rampa: el último tramo es un sendero y una escalera de piedra empinada tallada en el acantilado. No es accesible para sillas de ruedas ni cómoda con carritos, y la subida de vuelta es exigente.' },
      { q: '¿Es de arena o de piedra la playa del Silencio?', a: 'Es de canto rodado y bolos, no de arena fina. Caminar descalzo es incómodo y la entrada al agua sobre piedra suelta pide cuidado; conviene llevar escarpines o chanclas resistentes. La marea baja deja más superficie y una entrada algo más amable.' },
      { q: '¿Se puede uno bañar bien en la playa del Silencio?', a: 'Es Cantábrico abierto, con agua fría incluso en verano y expuesto al oleaje del noroeste, y no hay socorrista. Con mar en calma y marea baja el baño es posible con cuidado por las piedras; con mar de fondo o corrientes es peligroso y no hay vigilancia. Consulta siempre el estado de la mar antes de bajar.' },
    ],
    en: {
      title: 'Playa del Silencio (Asturias): the only way to the sea is a stairway cut into the cliff',
      excerpt: 'One of the most photographed rock amphitheatres on the Cantabrian coast, with hard small print: no road reaches the sand, you descend a long stone stairway pinned to the cliff, it is shingle rather than fine sand, and there is no beach bar, lifeguard or shade at the bottom.',
      related: [
        { href: '/en/magazine', label: 'More from the Magazine' },
        { href: '/en/crystal-clear-water-beaches', label: 'Clear-water beaches in Spain' },
      ],
      body: [
        { t: 'p', html: 'You arrive from above, and you don’t see it. From the hamlet of Castañeras, in the council of Cudillero, a dirt car park leaves you on top of the cliff, and a short path leads to a viewpoint where everything opens at once: an amphitheatre of green walls closing off a half-moon of stone, and out beyond the shoreline a scatter of black islets — <strong>los Carreiros</strong> — driven into the Cantabrian like the remains of a sea wall. They call it the Beach of Silence, and on this western Asturian coast, with the ground swell breaking against the rocks, the name carries its own quiet irony.' },
        { t: 'p', html: 'But the photograph is paid for on the way down. From the viewpoint to the sand there is no road and no ramp: there is a path and, at the end, a <strong>stone stairway pinned to the cliff</strong> that drops in flights to sea level. You go down watching your feet and come back up out of breath. That is the deal here: this beach charges the entrance fee in legs, which is largely why it is still what it is.' },
        { t: 'h2', text: 'The facts (and the small print)', id: 'facts' },
        { t: 'p', html: 'This is a shell-shaped cove inside the <strong>Protected Landscape of the Western Coast of Asturias</strong>, between Castañeras and Novellana. Its signature — the amphitheatre of cliffs and the Carreiros islets — is also the source of every drawback. First: <strong>you cannot drive to the sand</strong>. You park up top, in a limited clearing, and the final stretch is that <strong>stairway carved into the rock</strong>, steep and with no lift back up. For anyone with reduced mobility, a pushchair or very small children, the descent is demanding and the climb worse. Flagging it is not fussiness: it is the first thing to know.' },
        { t: 'p', html: 'The second awkward fact is the ground: <strong>this is shingle and cobbles, not fine sand</strong>. Walking barefoot is hard and wading in over loose stone needs care; a pair of water shoes changes the day. Third, <strong>there is no infrastructure at all below</strong>: no beach bar, no toilets, no drinking water, no natural shade and — most serious — <strong>no lifeguard</strong>. And fourth, the sea itself: this is the open Cantabrian, <strong>cold even in August</strong> and exposed to north-westerly swell; with any ground sea, between rock and currents, a swim stops being an innocent dip. Whatever you carry down the stairway is all you will have; whatever you skip in the sea forecast, your afternoon will pay for.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The first call is the hour and the season. The clearing up top is <strong>small and fills early</strong> in July and August: either arrive first thing or spend the visit hunting for a space. Better still, come in <strong>spring or autumn</strong> or midweek — the afternoon light sets the cliffs and islets alight for the photograph, and you get the cove almost to yourself. Wear something with a sole for the stairway and the stones, carry water and food down, and carry your rubbish back up: there are no bins worth the name here.' },
        { t: 'p', html: 'The second is what you are coming for. Silencio is for <strong>looking, walking the stone shoreline and photographing</strong> one of the boldest amphitheatres in the north; at <strong>low tide</strong> you gain space and a gentler way in. What it is not is a beach for a lounger, a parasol and a long family swim: for that, the same stretch of coast has easier options with more sand, such as <strong>Playa del Aguilar</strong> at Muros de Nalón, or <strong>La Ribeirona at Cadavedo</strong>, with a less punishing access. And before you go down, the golden rule of the western Cantabrian: <strong>check the state of the sea and the wind</strong>. With ground swell or a galerna forecast, this beach is one to admire from the viewpoint — there is no one down there to pull you out.' },
        { t: 'quote', text: 'It is not a nook of calm to lie down in: it is a beautiful rock amphitheatre that charges the descent in stairs and the swim in cold water, and it is worth knowing before you put your sandals on.' },
        { t: 'p', html: 'And it still pays off. When the last step sets you down on the cobbles and you look up, the ring of green cliffs closes over you, the Carreiros split the swell and the roar of the sea fills everything — Silencio lives up to its name only when no one else is there, which is exactly why you go looking for it outside August and away from midday. Go down to see it, walk its half-moon of stone, stay for the sunset when the rock turns honey-coloured; save the long, lazy swim for the sandy beaches next door. Get the expectation wrong and the stairway will remind you, step by step on the way back up, that here the postcard is earned.' },
      ],
      faq: [
        { q: 'How do you get to Playa del Silencio, and is there car access?', a: 'You reach it via the hamlet of Castañeras, in the council of Cudillero, where there is a dirt clearing to park on top of the cliff. There is no road or ramp down to the sand: the final stretch is a path and a steep stone stairway carved into the cliff. It is not wheelchair-accessible or easy with a pushchair, and the climb back is demanding.' },
        { q: 'Is Playa del Silencio sand or stone?', a: 'It is shingle and cobbles, not fine sand. Walking barefoot is uncomfortable and wading in over loose stone needs care; water shoes or sturdy sandals are worth bringing. Low tide leaves more surface and a slightly gentler way in.' },
        { q: 'Can you swim well at Playa del Silencio?', a: 'This is the open Cantabrian, cold even in summer and exposed to north-westerly swell, with no lifeguard. In calm sea and at low tide a careful swim over the stones is possible; with ground swell or currents it is dangerous and unwatched. Always check the sea state before heading down.' },
      ],
    },
  },
  // ───── Diario de playas · Canarias (voz bicéfala) ─────
  {
    slug: 'playa-cofete-fuerteventura-pista-corrientes',
    category: 'guias',
    title: 'Playa de Cofete (Fuerteventura): 12 km de arena salvaje tras 20 km de pista de tierra',
    excerpt:
      'Una de las playas más grandiosas de Canarias y de las más peligrosas para el baño. Lo que de verdad necesitas saber de Cofete: se llega por una pista de tierra de unos 20 km (vetada a los coches de alquiler), no tiene servicios y tiene corrientes sin socorrista.',
    heroAlt: 'Arco interminable de arena dorada de la playa de Cofete con el macizo de Jandía cayendo sobre la orilla, Fuerteventura',
    heroQuery: 'cofete,fuerteventura,beach,jandia',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T10:26:59Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/canarias', label: 'Playas de Canarias' },
      { href: '/islas', label: 'Playas por isla en España' },
      { href: '/playas-secretas', label: 'Playas y calas poco masificadas' },
    ],
    body: [
      { t: 'p', html: 'A Cofete se sube antes de bajar. Desde Morro Jable, en el extremo sur de Fuerteventura, una pista de tierra trepa en zigzag hasta un collado pelado —la Degollada de Cofete— donde casi todo el mundo detiene el coche por instinto. Al otro lado de la montaña no hay nada construido en kilómetros: solo un arco interminable de arena dorada batido por un Atlántico verde y bravo, con el macizo de Jandía cayendo a plomo sobre la orilla y el Pico de la Zarza, el techo de la isla, vigilando desde arriba. Es una de las panorámicas más rotundas de Canarias, y todavía estás a media hora de pisar la arena.' },
      { t: 'p', html: 'En mitad de esa inmensidad sin casas asoma una excepción: la <strong>Villa Winter</strong>, un caserón con torreón que mandó levantar en los años cuarenta el ingeniero alemán Gustav Winter, y alrededor del cual creció una leyenda de submarinos y refugios nazis que nadie ha probado jamás. Cerca, un pequeño cementerio marinero recuerda a los náufragos que el mar trajo hasta esta costa. Cofete es eso: belleza enorme con un poso inquietante.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La postal es de las mejores de España; la letra pequeña, de las más serias. Empecemos por el acceso. La playa —unos <strong>12 km de arena salvaje y sin urbanizar</strong> entre Cofete y Barlovento, dentro del <strong>Parque Natural de Jandía</strong>— se alcanza por una <strong>pista de tierra de cerca de 20 km</strong> desde Morro Jable: estrecha, con curvas y firme irregular, fácilmente una hora de trayecto lento. El detalle que arruina muchos viajes: <strong>casi todos los contratos de coche de alquiler prohíben circular por ella</strong>. Si pinchas, rompes los bajos o te quedas tirado ahí abajo, el seguro no te cubre.' },
      { t: 'p', html: 'El segundo aviso, y el más importante, es el baño. Cofete es la cara de <strong>barlovento</strong> de la isla, expuesta de lleno al oleaje del Atlántico abierto: <strong>corrientes de retorno fuertes y resaca</strong>, sin socorristas y sin vigilancia. No es una exageración de folleto al revés: aquí se han producido ahogamientos, y muchos días el baño está directamente desaconsejado. No es una playa para meterse sin mirar el mar, y desde luego no es para niños pequeños. Lo tercero: <strong>no hay prácticamente nada</strong> —ni chiringuito fiable, ni sombra natural, ni agua potable, ni apenas cobertura—. Lo que no bajes, no lo hay.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La primera decisión es cómo llegar sin jugártela. Si no conduces un <strong>todoterreno alto y con seguro que lo permita</strong>, olvídate de bajar con tu coche de alquiler: hay <strong>guagua (bus) 4x4 desde Morro Jable</strong> en temporada y excursiones organizadas en vehículos preparados. Es más lento, pero te ahorra el disgusto de una avería en mitad de la nada. Y sal pronto: con luz buena, tiempo para caminar y margen para volver antes de que caiga el sol sobre una pista sin farolas.' },
      { t: 'p', html: 'La segunda es para qué vas. Cofete está para <strong>caminar, mirar y fotografiar</strong>: el arco infinito de arena, el atardecer encendiendo la montaña, y un cielo sin contaminación lumínica que de noche se llena de estrellas. Para eso es de las mejores de España. Lo que no es es una playa de chapuzón tranquilo: <strong>mira el parte de mar y de viento antes de salir</strong> y, con mar gruesa, ni te acerques a la orilla. ¿Quieres bañarte de verdad? La isla tiene la respuesta en su <strong>otra cara, la de sotavento</strong> —Jandía, Sotavento, Costa Calma, el propio Morro Jable—, con agua mansa y turquesa a media hora en coche por carretera asfaltada. Cofete es para asomarse al océano; sotavento, para nadar en él.' },
      { t: 'quote', text: 'No es un paraíso para darse un chapuzón: es una de las playas más grandiosas y más peligrosas de España, y conviene saberlo antes de pisar la arena.' },
      { t: 'p', html: 'Porque Cofete no se mide en lo cómoda que es —no lo es— sino en lo pequeño que te hace sentir. Doce kilómetros de arena sin una sola sombrilla, el viento empujando la espuma, el cementerio y la casa del alemán recortados contra el macizo, y un océano que recuerda, ola tras ola, quién manda aquí. Ve a caminarla, a verla arder al atardecer y a contar estrellas; deja el baño largo para la otra orilla de la isla. Equivócate de expectativa y Cofete te lo hará saber sin pedir permiso: en esta playa el mar no es un decorado.' },
    ],
    faq: [
      { q: '¿Se puede ir a Cofete con un coche de alquiler?', a: 'Por norma, no: la mayoría de las compañías prohíben en el contrato circular por la pista de tierra de unos 20 km que baja desde Morro Jable, y si hay daños o una avería el seguro no cubre. Las alternativas seguras son la guagua (bus) 4x4 desde Morro Jable en temporada o una excursión organizada en todoterreno.' },
      { q: '¿Es peligroso bañarse en la playa de Cofete?', a: 'Puede serlo. Es la cara de barlovento de la isla, con oleaje fuerte, corrientes de retorno y resaca, y no hay socorristas. Se han registrado ahogamientos. Consulta el estado del mar antes de ir y no te metas con mar gruesa; para un baño tranquilo, ve a las playas de sotavento (Jandía, Sotavento, Costa Calma, Morro Jable).' },
      { q: '¿Qué es la Villa Winter de Cofete?', a: 'Un caserón con torreón construido en los años cuarenta por el ingeniero alemán Gustav Winter en mitad de la playa. Está envuelto en leyendas —nunca probadas— sobre submarinos y refugios nazis durante la Segunda Guerra Mundial. Hoy es uno de los elementos más fotografiados de Cofete.' },
    ],
    en: {
      title: 'Playa de Cofete (Fuerteventura): 12 km of wild sand after a 20 km dirt track',
      excerpt: 'One of the grandest beaches in the Canaries and one of the most dangerous to swim in. What you actually need to know about Cofete: it’s reached by a roughly 20 km dirt track (off-limits to hire cars), has no facilities and has currents with no lifeguard.',
      related: [
        { href: '/en/islands', label: 'Beaches by island' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You climb to Cofete before you drop down to it. From Morro Jable, at the southern tip of Fuerteventura, a dirt track zigzags up to a bare pass — the Degollada de Cofete — where nearly everyone stops the car on instinct. On the far side of the mountain there is nothing built for kilometres: just an endless arc of golden sand pounded by a green, surly Atlantic, the Jandía massif dropping sheer to the shore and the Pico de la Zarza, the island’s highest point, keeping watch from above. It’s one of the most commanding views in the Canaries, and you’re still half an hour from the sand.' },
        { t: 'p', html: 'In the middle of all that houseless vastness stands one exception: the <strong>Villa Winter</strong>, a turreted mansion built in the 1940s by the German engineer Gustav Winter, around which grew a legend of submarines and Nazi hideouts that no one has ever proved. Nearby, a small seafarers’ cemetery remembers the shipwrecked the sea washed up on this coast. That’s Cofete: huge beauty with an unsettling undertow.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The postcard is among Spain’s best; the small print is among its most serious. Start with access. The beach — some <strong>12 km of wild, undeveloped sand</strong> between Cofete and Barlovento, inside the <strong>Jandía Natural Park</strong> — is reached by a <strong>dirt track of nearly 20 km</strong> from Morro Jable: narrow, winding, rough underfoot, easily an hour at crawling pace. The detail that ruins many trips: <strong>almost every hire-car contract bans driving it</strong>. Get a puncture, crack the underside or break down down there, and the insurance won’t cover you.' },
        { t: 'p', html: 'The second warning, and the most important, is the swim. Cofete is the island’s <strong>windward (barlovento)</strong> face, fully exposed to open-Atlantic swell: <strong>strong rip currents and undertow</strong>, no lifeguards, no supervision. This isn’t a brochure in reverse: there have been drownings here, and on many days swimming is flatly inadvisable. It’s not a beach to wade into without reading the sea, and certainly not for small children. Third: there is <strong>almost nothing here</strong> — no reliable beach bar, no natural shade, no drinking water, barely any phone signal. Whatever you don’t carry down, you won’t find.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The first call is how to get there without a gamble. Unless you’re driving a <strong>high 4x4 with insurance that allows it</strong>, forget taking your hire car down: there’s a <strong>4x4 bus (guagua) from Morro Jable</strong> in season and organised excursions in proper vehicles. It’s slower, but it spares you a breakdown in the middle of nowhere. And set off early: good light, time to walk, and a margin to get back before the sun drops over an unlit track.' },
        { t: 'p', html: 'The second is what you’re going for. Cofete is for <strong>walking, looking and photographing</strong>: the infinite arc of sand, the sunset setting the mountain alight, and a night sky with no light pollution. For that it’s among the best in Spain. What it isn’t is a beach for a quiet dip: <strong>check the sea and wind forecast before you leave</strong> and, in a heavy sea, don’t go near the water’s edge. Want a proper swim? The island’s answer is on its <strong>other, leeward (sotavento) face</strong> — Jandía, Sotavento, Costa Calma, Morro Jable itself — with calm turquoise water half an hour away on tarmac. Cofete is for facing the ocean; the leeward side is for swimming in it.' },
        { t: 'quote', text: 'It’s no paradise for a dip: it’s one of the grandest and most dangerous beaches in Spain, and you’d do well to know that before you reach the sand.' },
        { t: 'p', html: 'Because Cofete isn’t measured in how comfortable it is — it isn’t — but in how small it makes you feel. Twelve kilometres of sand without a single parasol, the wind driving the spray, the cemetery and the German’s house silhouetted against the massif, and an ocean that reminds you, wave after wave, who’s in charge here. Go to walk it, to watch it burn at sunset and to count stars; leave the long swim for the other side of the island. Get your expectations wrong and Cofete will let you know without asking: on this beach the sea is no backdrop.' },
      ],
      faq: [
        { q: 'Can you drive to Cofete in a hire car?', a: 'As a rule, no: most companies ban driving the roughly 20 km dirt track down from Morro Jable in their contracts, and if there’s damage or a breakdown the insurance won’t cover it. The safe alternatives are the 4x4 bus (guagua) from Morro Jable in season or an organised 4x4 excursion.' },
        { q: 'Is it dangerous to swim at Cofete?', a: 'It can be. It’s the island’s windward side, with strong swell, rip currents and undertow, and there are no lifeguards. Drownings have occurred. Check the sea state before you go and don’t get in when the sea is heavy; for a calm swim, head to the leeward beaches (Jandía, Sotavento, Costa Calma, Morro Jable).' },
        { q: 'What is the Villa Winter at Cofete?', a: 'A turreted mansion built in the 1940s by the German engineer Gustav Winter in the middle of the beach. It’s wrapped in legends — never proven — about submarines and Nazi hideouts during the Second World War. Today it’s one of the most photographed features of Cofete.' },
      ],
    },
  },
  // ───── Diario de playas · Galicia (voz bicéfala) ─────
  {
    slug: 'playa-catedrales-lugo-marea-reserva',
    category: 'guias',
    title: 'Playa de las Catedrales (Lugo): sin marea baja no hay arcos, y en verano necesitas reserva',
    excerpt:
      'Los arcos de roca solo asoman con la marea baja; con la alta, el mar lo tapa todo. Y en Semana Santa y verano hace falta reserva gratuita previa. Cómo visitar bien las Catedrales sin llevarte el chasco de la marea.',
    heroAlt: 'Arcos y contrafuertes de roca de la Playa de las Catedrales en Ribadeo, Lugo, sobre la arena mojada durante la marea baja',
    heroQuery: 'catedrales,ribadeo,beach,arch',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T09:20:00Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/galicia', label: 'Playas de Galicia' },
      { href: '/playas-paradisiacas', label: 'Playas de escándalo' },
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas claras' },
    ],
    body: [
      { t: 'p', html: 'Bajas los escalones desde el acantilado y, al principio, no entiendes el nombre. Delante solo hay una playa larga de arena mojada y un frente de roca oscura. Entonces das los primeros pasos entre los bloques y el sitio se abre: arcos de piedra de varios metros, pasadizos, contrafuertes que parecen tallados por un cantero gigante y bóvedas por las que se cuela la luz. De ahí lo de "catedrales". Caminas bajo la roca con el mar retirado a lo lejos y la sensación es la de estar dentro de un edificio que se derrumba a cámara lenta desde hace millones de años.' },
      { t: 'p', html: 'Es una de las estampas más reconocibles del norte de España y, quizá por eso, una de las que más gente visita con la información justa. Porque la Playa de las Catedrales —oficialmente <strong>Praia de Augas Santas</strong>, en Ribadeo (Lugo)— no está siempre disponible ni siempre abierta. Tiene dos porteros: la marea y el calendario. Ignorar a cualquiera de los dos es jugarse el viaje.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'El primer portero es la <strong>marea</strong>. Los arcos y las cuevas solo son accesibles a pie con la <strong>marea baja</strong>: es entonces cuando el mar se retira y deja al descubierto el arenal y las formaciones. Con la <strong>marea alta, el agua cubre casi todo</strong> y desde arriba solo ves una cala normal batida por las olas —muchos visitantes se van decepcionados por presentarse a la hora equivocada—. Por eso la regla número uno es <strong>consultar la tabla de mareas</strong> (Puertos del Estado o el Instituto Hidrográfico) y planear la visita en torno a la bajamar, idealmente llegando un par de horas antes para tener margen. Y el aviso de seguridad que va con ello: la marea <strong>sube rápido</strong> y puede dejarte aislado entre los arcos; hay que salir del arenal con tiempo y no quedarse embobado con la vista.' },
      { t: 'p', html: 'El segundo portero es el <strong>calendario</strong>. Por su fama, la <strong>Xunta de Galicia regula el acceso</strong> —está declarada <strong>Monumento Natural</strong>— y en los periodos de más afluencia (<strong>Semana Santa y, aproximadamente, de julio a septiembre</strong>) exige una <strong>reserva gratuita previa por internet</strong>, con un cupo diario limitado y franjas horarias. Es gratis, pero si te plantas en verano sin ella, no entras. Fuera de esos periodos se accede libremente. Añade el resto de contras honestos: <strong>agua fría</strong> del Cantábrico, oleaje habitual (no es una playa de baño tranquilo), <strong>rocas resbaladizas</strong> por las algas —calzado con suela, no chanclas lisas—, y un <strong>acceso por escaleras</strong> desde lo alto del acantilado poco apto para movilidad reducida. En temporada, además, hay cola.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Cuándo <strong>sí</strong>: cuadra tu visita con la <strong>bajamar</strong> y, si vas en verano o Semana Santa, saca la <strong>reserva con antelación</strong> en la web oficial (las franjas de media mañana y media tarde se agotan primero). Un truco que cambia la experiencia: ve <strong>a primera hora o al atardecer</strong> con la marea baja; a mediodía en agosto el arenal es un desfile de gente y las fotos sin cabezas ajenas son misión imposible. Cuándo <strong>no</strong>: en pleamar (verás poco y no podrás pisar los arcos), con temporal y bandera roja, o si buscas un día de baño y sombrilla —esto es de caminar y mirar, no de tostarse—.' },
      { t: 'p', html: 'El <strong>truco</strong> local: no te quedes solo en el tramo central de los arcos más famosos; con la marea bien baja se puede recorrer más arenal y las formaciones laterales suelen estar más despejadas de gente. Lleva <strong>chubasquero</strong> —el tiempo en la Mariña lucense cambia rápido— y <strong>calzado agarrado</strong> para la roca húmeda. ¿La alternativa si no consigues reserva o pillas pleamar? La misma costa de Ribadeo y la vecina playa de <strong>Las Illas</strong> ofrecen acantilados y arenales sin cupo, y hacia el este, ya en Asturias, hay más playas de este estilo. Pero si has venido por los arcos, no hay sustituto: es cuestión de acertar con la hora y el día.' },
      { t: 'quote', text: 'A las Catedrales no se viene cuando uno quiere, sino cuando deja el mar. Se visitan con la tabla de mareas en la mano y, en verano, con la reserva hecha: lo demás es arriesgarse a ver una playa cualquiera con la marea llena.' },
      { t: 'p', html: 'Porque lo que hace grande a este sitio es también lo que lo complica: son arcos que el mar esculpe y esconde dos veces al día, y una fama que ha obligado a poner puerta y horario para que no muera de éxito. Mira la marea, saca tu reserva, baja con calzado firme y camina despacio bajo la piedra mientras el Cantábrico se retira. Sal antes de que vuelva. Y entenderás por qué a esta catedral no se entra cuando uno manda, sino cuando lo permite el mar.' },
    ],
    faq: [
      { q: '¿Hace falta reserva para la Playa de las Catedrales?', a: 'Sí en los periodos de más afluencia: Semana Santa y, aproximadamente, de julio a septiembre, la Xunta de Galicia exige una reserva gratuita previa por internet, con cupo diario y franjas horarias. Es gratis pero limitada; sin ella no se accede en esas fechas. Fuera de esos periodos el acceso es libre.' },
      { q: '¿Cuándo se ven los arcos de la Playa de las Catedrales?', a: 'Solo con la marea baja, cuando el mar se retira y deja al descubierto el arenal y las formaciones. Con marea alta el agua cubre casi todo y no se pueden pisar los arcos. Hay que consultar la tabla de mareas (Puertos del Estado) y visitarla en torno a la bajamar, saliendo con tiempo porque la marea sube rápido.' },
      { q: '¿Se puede uno bañar en la Playa de las Catedrales?', a: 'No es una playa pensada para el baño tranquilo: agua fría del Cantábrico, oleaje habitual y rocas resbaladizas por las algas. Es una visita para caminar y ver las formaciones con marea baja, con calzado de suela agarrada y respetando las banderas y la subida de la marea.' },
    ],
    en: {
      title: 'Playa de las Catedrales (Lugo): no low tide, no arches — and in summer you need a booking',
      excerpt: 'The rock arches only show at low tide; at high tide the sea hides everything. And in Easter week and summer you need a free advance booking. How to visit the Catedrales without the tide ruining your trip.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You come down the steps from the cliff and, at first, the name makes no sense. Ahead there’s just a long beach of wet sand and a front of dark rock. Then you take your first steps among the boulders and the place opens up: stone arches several metres high, passageways, buttresses that look chiselled by a giant mason, and vaults letting the light through. Hence "cathedrals". You walk beneath the rock with the sea drawn far back, and it feels like being inside a building that has been collapsing in slow motion for millions of years.' },
        { t: 'p', html: 'It’s one of the most recognisable sights in northern Spain and, perhaps for that reason, one that many people visit with too little information. Because the Playa de las Catedrales — officially <strong>Praia de Augas Santas</strong>, in Ribadeo (Lugo) — isn’t always available or always open. It has two gatekeepers: the tide and the calendar. Ignore either and you gamble with the whole trip.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The first gatekeeper is the <strong>tide</strong>. The arches and caves are only reachable on foot at <strong>low tide</strong>: that’s when the sea pulls back and uncovers the sand and the formations. At <strong>high tide the water covers almost everything</strong> and from above you see only an ordinary cove pounded by waves — many visitors leave disappointed for turning up at the wrong hour. So rule one is to <strong>check the tide table</strong> (Puertos del Estado or the Hydrographic Institute) and plan around low water, ideally arriving a couple of hours before for a margin. And the safety warning that comes with it: the tide <strong>rises fast</strong> and can cut you off among the arches; leave the sand in good time and don’t get lost in the view.' },
        { t: 'p', html: 'The second gatekeeper is the <strong>calendar</strong>. Because of its fame, the <strong>Xunta de Galicia regulates access</strong> — it’s a designated <strong>Natural Monument</strong> — and in the busiest periods (<strong>Easter week and, roughly, July to September</strong>) it requires a <strong>free advance online booking</strong>, with a limited daily quota and time slots. It’s free, but turn up in summer without it and you don’t get in. Outside those periods access is open. Add the rest of the honest catches: <strong>cold Cantabrian water</strong>, regular swell (not a calm bathing beach), <strong>slippery algae-covered rocks</strong> — wear grippy soles, not smooth flip-flops — and <strong>staircase access</strong> from the clifftop, poorly suited to reduced mobility. In season, there’s a queue too.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'When <strong>yes</strong>: line your visit up with <strong>low water</strong> and, if you go in summer or Easter, book <strong>well ahead</strong> on the official site (mid-morning and mid-afternoon slots sell out first). A trick that changes everything: go <strong>first thing or at dusk</strong> with the tide out; at midday in August the sand is a parade of people and a photo without strangers’ heads is impossible. When <strong>no</strong>: at high tide (you’ll see little and can’t walk the arches), in a storm with a red flag, or if you want a day of swimming and parasols — this is for walking and looking, not sunbathing.' },
        { t: 'p', html: 'The local <strong>trick</strong>: don’t stop only at the central stretch of the famous arches; with the tide well out you can range further along the sand, and the side formations tend to be clearer of crowds. Bring a <strong>raincoat</strong> — weather on the Mariña Lucense turns fast — and <strong>grippy footwear</strong> for the wet rock. The alternative if you miss the booking or hit high tide? The same Ribadeo coast and the neighbouring <strong>Las Illas</strong> beach offer cliffs and sand without a quota, and eastwards, into Asturias, there are more beaches in this style. But if you came for the arches, there’s no substitute: it’s a matter of getting the hour and the day right.' },
        { t: 'quote', text: 'You don’t visit the Catedrales when you fancy, but when the sea allows. You come with the tide table in hand and, in summer, with the booking done: anything else risks seeing an ordinary beach at full tide.' },
        { t: 'p', html: 'Because what makes this place great is also what complicates it: arches the sea carves and hides twice a day, and a fame that has forced a door and a timetable so it doesn’t die of success. Check the tide, get your booking, go down in firm footwear and walk slowly beneath the stone as the Cantabrian Sea retreats. Leave before it returns. And you’ll understand why you don’t enter this cathedral when you decide, but when the sea lets you.' },
      ],
      faq: [
        { q: 'Do you need a booking for the Playa de las Catedrales?', a: 'Yes in the busiest periods: at Easter and, roughly, from July to September, the Xunta de Galicia requires a free advance online booking, with a daily quota and time slots. It’s free but limited; without it you can’t access on those dates. Outside those periods access is open.' },
        { q: 'When can you see the arches at the Playa de las Catedrales?', a: 'Only at low tide, when the sea pulls back and uncovers the sand and the formations. At high tide the water covers almost everything and you can’t walk the arches. Check the tide table (Puertos del Estado) and visit around low water, leaving in good time because the tide rises fast.' },
        { q: 'Can you swim at the Playa de las Catedrales?', a: 'It isn’t a beach for calm bathing: cold Cantabrian water, regular swell and slippery algae-covered rocks. It’s a visit for walking and seeing the formations at low tide, with grippy footwear and respecting the flags and the incoming tide.' },
      ],
    },
  },
  // ───── Diario de playas · Murcia (voz bicéfala) ─────
  {
    slug: 'playa-calblanque-murcia-bus-verano',
    category: 'guias',
    title: 'Playa de Calblanque, Murcia: en verano solo entras en bus lanzadera y sin un chiringuito',
    excerpt:
      'Un parque de dunas y calas doradas pegado a los rascacielos de La Manga. La letra pequeña de Calblanque: en verano el coche se queda fuera y entras en bus lanzadera, no hay servicios y pega el viento.',
    heroAlt: 'Playa dorada con dunas y acantilados del Parque Regional de Calblanque, sin edificios en el horizonte',
    heroQuery: 'calblanque,murcia,beach,dunes',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T10:37:07Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/murcia', label: 'Playas de Murcia' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
    ],
    body: [
      { t: 'p', html: 'A un cuarto de hora de las torres de La Manga, donde uno espera más asfalto y más grúas, la carretera se estrecha, cruza unas salinas y muere en una barrera. Al otro lado no hay nada construido: dunas doradas, monte bajo que huele a tomillo y una sucesión de calas de arena fina abiertas a un Mediterráneo sin un solo edificio en el horizonte. Cuesta creer que el rincón más salvaje de la costa de Murcia esté a tiro de piedra de una de las líneas de rascacielos más densas del Mediterráneo.' },
      { t: 'p', html: 'Es el <strong>Parque Regional de Calblanque, Monte de las Cenizas y Peña del Águila</strong>, en el término de Cartagena. Sus dunas fósiles, cementadas hace milenios, forman farallones rojizos que al atardecer parecen arder; en las salinas de la entrada paran flamencos y cigüeñuelas. No es casualidad que aquí se hayan rodado anuncios y películas: es de los pocos tramos del litoral peninsular que siguen pareciendo de otro tiempo.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La postal es real; la logística, menos amable de lo que parece. Para proteger el parque, <strong>en temporada alta —aproximadamente de finales de junio a principios de septiembre— se restringe el acceso en coche</strong>: dejas el vehículo en un aparcamiento a la entrada y subes en un <strong>bus lanzadera de pago</strong> que enlaza las playas. El horario manda: si pierdes el último de vuelta, te toca caminar. Las fechas y las tarifas cambian cada año, así que conviene mirar el calendario oficial del parque antes de ir; no es un trámite opcional, es la puerta de entrada en verano.' },
      { t: 'p', html: 'El segundo aviso: <strong>aquí no hay nada</strong>. Ni chiringuito, ni duchas, ni tiendas, ni sombra natural —el monte bajo no da un metro de sombra—. Lo que no lleves, no lo hay. A eso se suma que es una costa <strong>expuesta al viento</strong>: los días de levante o de lebeche la arena molesta y el mar se pica, aunque en calma el agua está limpia y transparente. Y un matiz que sorprende a algunos: <strong>parte de estas calas son de tradición nudista</strong>, sin que eso quite que sean perfectamente familiares. El agua del Mediterráneo aquí es clara, pero sin socorrista en la mayoría del arenal: ojo con los días de oleaje.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La pregunta que decide tu día es sencilla: <strong>¿a qué vas?</strong>. Si buscas hamaca, sombrilla de alquiler y una cerveza a pie de arena, Calblanque te va a frustrar: para eso tienes <strong>La Manga o Cabo de Palos</strong> al lado, con todos los servicios. A Calblanque se va por lo contrario: caminar de cala en cala, el silencio, las dunas encendidas a última hora y un baño sin una sola sombrilla ajena rozándote la toalla.' },
      { t: 'p', html: 'El truco para clavarlo: si puedes, <strong>ve fuera de temporada</strong> (mayo, junio, septiembre y octubre), cuando aún entras en coche y el agua ya acompaña; y si vas en pleno verano, <strong>madruga, mira el horario del bus y apunta la hora del último de vuelta</strong>. Carga con <strong>todo</strong> —agua de sobra, comida, sombrilla con buen anclaje por el viento y tu basura de vuelta— y calza algo para andar, porque la gracia está en moverse entre la Playa Larga, Cala Magre y las calas del este. ¿Viento fuerte de levante? Cambia el plan y refúgiate en una cala orientada al otro lado, o déjalo para otro día.' },
      { t: 'quote', text: 'No es una playa que se descubra: es una que se elige, con el coche fuera y la nevera dentro de la mochila. A dos kilómetros tienes su reverso de hormigón para comparar.' },
      { t: 'p', html: 'Porque Calblanque no vale por lo que tiene, sino por lo que le falta: ni un edificio, ni un neón, ni un chiringuito que rompa la línea de la duna. Acepta las reglas —el bus, la mochila cargada, la basura de vuelta— y te llevarás una tarde de arena dorada y farallones rojos con La Manga temblando a lo lejos como un espejismo del que has sabido escapar. Ve pensando que es una playa urbana con servicios, y volverás con hambre, sed y una insolación.' },
    ],
    faq: [
      { q: '¿Se puede ir en coche a Calblanque en verano?', a: 'En temporada alta (aproximadamente de finales de junio a principios de septiembre) el acceso en coche está restringido para proteger el parque: se deja el vehículo en un aparcamiento a la entrada y se sube en un bus lanzadera de pago. Fuera de esas fechas normalmente sí se entra en coche. Las fechas y tarifas cambian cada año: consulta el calendario oficial del parque.' },
      { q: '¿Hay chiringuitos o servicios en Calblanque?', a: 'No. No hay chiringuitos, duchas, tiendas ni sombra natural, y la mayor parte del arenal carece de socorrista. Lleva agua, comida, sombrilla con anclaje para el viento y devuelve tu basura. Para servicios, La Manga y Cabo de Palos están al lado.' },
      { q: '¿Cuándo es mejor ir a Calblanque?', a: 'En primavera y otoño (mayo, junio, septiembre, octubre) aún se puede acceder en coche, el agua acompaña y hay menos gente. En verano, madruga, usa el bus lanzadera y controla la hora del último de vuelta. Evita los días de viento fuerte de levante.' },
    ],
    en: {
      title: 'Playa de Calblanque, Murcia: in summer you can only reach it by shuttle bus, with no beach bar in sight',
      excerpt: 'A park of dunes and golden coves right next to the high-rises of La Manga. The small print of Calblanque: in summer the car stays out and you go in by shuttle bus, there are no services and the wind blows.',
      related: [
        { href: '/en/communities/murcia', label: 'Beaches of Murcia' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'A quarter of an hour from the towers of La Manga, where you would expect more tarmac and more cranes, the road narrows, crosses a salt marsh and dies at a barrier. Beyond it nothing is built: golden dunes, low scrub that smells of thyme, and a string of fine-sand coves opening onto a Mediterranean without a single building on the horizon. It is hard to believe that the wildest corner of the Murcia coast sits a stone throw from one of the densest lines of high-rises on the Mediterranean.' },
        { t: 'p', html: 'This is the <strong>Calblanque, Monte de las Cenizas and Peña del Águila Regional Park</strong>, in the municipality of Cartagena. Its fossil dunes, cemented millennia ago, form reddish crags that seem to burn at sunset; flamingos and black-winged stilts stop in the salt pans at the entrance. It is no accident that adverts and films have been shot here: it is one of the few stretches of the mainland coast that still look like another age.' },
        { t: 'h2', text: 'The facts (and what they do not tell you)', id: 'facts' },
        { t: 'p', html: 'The postcard is real; the logistics, less friendly than they look. To protect the park, <strong>in high season — roughly late June to early September — car access is restricted</strong>: you leave the vehicle in a car park at the entrance and take a <strong>paid shuttle bus</strong> that links the beaches. The timetable rules: miss the last one back and you are walking. Dates and fares change every year, so check the park official calendar before you go; it is not optional, it is the summer gateway.' },
        { t: 'p', html: 'The second warning: <strong>there is nothing here</strong>. No beach bar, no showers, no shops, no natural shade — the low scrub gives not a metre of it. Whatever you do not bring, you will not find. On top of that it is an <strong>exposed, windy coast</strong>: on levante or lebeche days the sand stings and the sea chops up, though in calm the water is clean and clear. And a detail that surprises some: <strong>several of these coves are traditionally nudist</strong>, which does not stop them being perfectly family-friendly. The water is clear Mediterranean, but most of the sand has no lifeguard: mind the days with swell.' },
        { t: 'h2', text: 'The local take', id: 'local' },
        { t: 'p', html: 'The question that decides your day is simple: <strong>what are you coming for?</strong>. If you want a sunlounger, a rented parasol and a beer at the water edge, Calblanque will frustrate you: for that you have <strong>La Manga or Cabo de Palos</strong> next door, with every service. You come to Calblanque for the opposite: walking cove to cove, the silence, the dunes ablaze at dusk and a swim with not a single stranger parasol brushing your towel.' },
        { t: 'p', html: 'The trick to nailing it: if you can, <strong>go off-season</strong> (May, June, September and October), when you can still drive in and the water is already warm enough; and if you go in high summer, <strong>arrive early, check the bus timetable and note the time of the last one back</strong>. Carry <strong>everything</strong> — plenty of water, food, a well-anchored parasol for the wind and your rubbish back out — and wear something you can walk in, because the point is moving between Playa Larga, Cala Magre and the eastern coves. Strong levante wind? Change the plan and shelter in a cove facing the other way, or leave it for another day.' },
        { t: 'quote', text: 'It is not a beach you stumble on: it is one you choose, car left behind and cool-box in the rucksack. Two kilometres away sits its concrete opposite, for comparison.' },
        { t: 'p', html: 'Because Calblanque is worth it not for what it has but for what it lacks: not a building, not a neon sign, not a beach bar to break the line of the dune. Accept the rules — the bus, the loaded rucksack, the rubbish carried back — and you will take home an afternoon of golden sand and red crags with La Manga shimmering in the distance like a mirage you have managed to escape. Turn up expecting a serviced town beach, and you will come back hungry, thirsty and sunburnt.' },
      ],
      faq: [
        { q: 'Can you drive to Calblanque in summer?', a: 'In high season (roughly late June to early September) car access is restricted to protect the park: you leave the vehicle in a car park at the entrance and take a paid shuttle bus. Outside those dates you can usually drive in. Dates and fares change each year: check the park official calendar.' },
        { q: 'Are there beach bars or services at Calblanque?', a: 'No. There are no beach bars, showers, shops or natural shade, and most of the sand has no lifeguard. Bring water, food, a well-anchored parasol for the wind and take your rubbish back. For services, La Manga and Cabo de Palos are next door.' },
        { q: 'When is the best time to visit Calblanque?', a: 'In spring and autumn (May, June, September, October) you can still drive in, the water is warm enough and there are fewer people. In summer, arrive early, use the shuttle bus and watch the time of the last one back. Avoid days with strong levante wind.' },
      ],
    },
  },
  // ───── Diario de playas · Cala del Moraig, Alicante (voz bicéfala) ─────
  {
    slug: 'cala-del-moraig-benitatxell-rio-dulce-cantos',
    category: 'curiosidades',
    title: 'Cala del Moraig (Alicante): un río de agua dulce brota del fondo del mar, entre cantos',
    excerpt:
      'Al pie de un acantilado vertical, una cueva submarina —la Cova dels Arcs— por la que aflora un río de agua dulce bajo el mar. Lo que hay que saber del Moraig, en Benitatxell: es de cantos, no de arena, apenas tiene sombra y en verano el acceso está limitado.',
    heroAlt: 'Cala del Moraig en El Poble Nou de Benitatxell, Alicante, con playa de cantos al pie de un acantilado vertical y agua clara sobre fondo rocoso',
    heroQuery: 'moraig,benitatxell,cove,cliff',
    gygQuery: 'Jávea',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T10:31:40Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/comunitat-valenciana', label: 'Playas de la Comunidad Valenciana' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas claras' },
    ],
    body: [
      { t: 'p', html: 'Bajas la última rampa entre pinos y chalés de Benitatxell y, de golpe, el terreno se corta: enfrente se abre una herradura de cantos claros encajada al pie de una pared de roca que cae a plomo sobre el mar. El agua, sobre el fondo de piedra, pasa del turquesa somero al azul profundo en pocos metros. A la izquierda, la caliza se hunde en el mar formando una boca oscura. Esa boca es el motivo por el que mucha gente conduce hasta aquí: la Cova dels Arcs, la cueva por la que el Moraig respira agua dulce.' },
      { t: 'p', html: 'Porque bajo la superficie de esta cala de la Marina Alta pasa algo poco común: un <strong>río subterráneo desemboca directamente en el mar</strong>, brotando desde el fondo de la cueva. No es una playa cualquiera de la Costa Blanca —ni por el paisaje ni por lo que esconde debajo—, y conviene saber a qué se viene antes de cargar con la sombrilla, porque el Moraig no perdona al que lo confunde con un arenal de toalla y chiringuito.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'El gran atractivo del Moraig es submarino y tiene nombre: la <strong>Cova dels Arcs</strong>, una cueva marina en el extremo norte de la cala por la que aflora un <strong>curso de agua dulce subterráneo</strong> (el sistema del Riu Blanc). Ese aporte de agua dulce, más fría y de distinta densidad que la salada, crea <strong>haloclinas</strong> —esas capas que emborronan la visión bajo el agua como si mirases a través de un cristal ondulado— y baja la temperatura del baño en la zona de la cueva; es, además, un punto célebre y serio de <strong>espeleobuceo</strong>, no un juego. Desde la superficie se puede nadar y bucear con tubo hasta los arcos, pero la cueva profunda es solo para buceadores técnicos. El fondo, de roca y con algo de posidonia, hace del Moraig un buen sitio de <strong>snorkel</strong> cuando el mar está en calma.' },
      { t: 'p', html: 'Y aquí la letra pequeña. El Moraig <strong>es de cantos rodados, no de arena</strong>: incómodo para tumbarse y resbaladizo para entrar al agua. La pared que lo hace tan fotogénico también significa <strong>apenas sombra natural</strong> —al mediodía de agosto pega de lleno— y desprendimientos ocasionales que obligan a respetar el balizado al pie del acantilado. El agua es <strong>clara pero profunda y fresca</strong>, sobre todo cerca de la cueva. Y el mayor filtro es llegar: la bajada es <strong>estrecha</strong>, el aparcamiento <strong>escaso</strong> y en verano el ayuntamiento <strong>regula y limita el acceso rodado</strong> en las horas punta; quien improvisa a mediodía en agosto se come la cola o el paseo largo. Servicios, los justos.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla de oro es sencilla: <strong>madruga</strong>. Llega a primera hora —o fuera de julio y agosto— y tendrás sitio para aparcar, sombra todavía en parte de la cala y el agua más plana para asomarte a la cueva; a media mañana en verano el Moraig se llena y el acceso se complica. Consulta antes las <strong>normas de acceso y aparcamiento</strong> del verano en Benitatxell, porque cambian por temporada y no siempre puedes bajar en coche cuando quieras.' },
      { t: 'p', html: 'Lo demás es sentido común de cala rocosa. <strong>Escarpines</strong>, imprescindibles: los cantos y la entrada de roca no son para pies descalzos. Lleva <strong>gafas y tubo</strong> —el fondo lo merece— y <strong>agua, comida y sombra propia</strong>, porque aquí no hay un chiringuito que te salve. Nada hacia la <strong>Cova dels Arcs</strong> solo con el mar en calma y sin corriente, y no te metas en la cueva profunda si no eres buceador. ¿Un plan extra que casi nadie hace? Desde el Moraig, un <strong>túnel excavado en la roca</strong> conecta a pie con la vecina <strong>Cala Llebeig</strong>, aún más solitaria y sin coches. El Moraig para la cueva y el snorkel; Llebeig para escapar del gentío.' },
      { t: 'quote', text: 'Al Moraig no se viene a tumbarse en la arena: se viene a asomarse a una cueva por la que el mar bebe agua dulce. Quien baja esperando un arenal cómodo, se equivoca de cala.' },
      { t: 'p', html: 'Porque el Moraig no se mide en metros de arena fina ni en hamacas, sino en lo que guarda al pie del acantilado: una cala de piedra clara y una cueva por la que un río invisible se cuela en el Mediterráneo. Acierta con la hora, calza escarpines y respeta el mar y la pared, y te llevarás uno de los rincones más singulares de la Costa Blanca. Plántate a mediodía en pleno agosto sin mirar el acceso, y te llevarás una cola, un canto clavado en la planta del pie y la sombrilla al sol.' },
    ],
    faq: [
      { q: '¿Qué tiene de especial la Cala del Moraig?', a: 'Su cueva marina, la Cova dels Arcs, por la que aflora un río de agua dulce subterráneo (el sistema del Riu Blanc) directamente en el mar. Eso crea haloclinas que emborronan la visión bajo el agua y enfría el baño junto a la cueva, y la convierte en un punto célebre de espeleobuceo. Es una cala de cantos al pie de un acantilado vertical, en Benitatxell (Alicante).' },
      { q: '¿La Cala del Moraig es de arena o de cantos?', a: 'De cantos rodados, no de arena: es incómoda para tumbarse y resbaladiza al entrar al agua, por lo que conviene llevar escarpines. El fondo es rocoso y con algo de posidonia, muy bueno para snorkel cuando el mar está en calma.' },
      { q: '¿Se puede aparcar y bajar en coche a la Cala del Moraig en verano?', a: 'No siempre. La bajada es estrecha y el aparcamiento escaso, y en verano el ayuntamiento de Benitatxell regula y limita el acceso rodado en las horas punta. Lo mejor es llegar a primera hora o fuera de julio y agosto y consultar antes las normas de acceso de la temporada.' },
    ],
    en: {
      title: 'Cala del Moraig (Alicante): a freshwater river wells up from the seabed, over pebbles',
      excerpt: 'At the foot of a sheer cliff, an underwater cave — the Cova dels Arcs — where a freshwater river surfaces beneath the sea. What to know about the Moraig, in Benitatxell: it’s pebbles, not sand, has almost no shade, and access is capped in summer.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You come down the last ramp between the pines and villas of Benitatxell and, all at once, the ground drops away: ahead opens a horseshoe of pale pebbles wedged at the foot of a rock wall that falls sheer to the sea. Over the stony bottom the water shifts from shallow turquoise to deep blue within a few metres. To the left, the limestone sinks into the sea to form a dark mouth. That mouth is why so many people drive out here: the Cova dels Arcs, the cave through which the Moraig breathes fresh water.' },
        { t: 'p', html: 'Because something uncommon happens beneath the surface of this Marina Alta cove: an <strong>underground river empties straight into the sea</strong>, welling up from the floor of the cave. This is no ordinary Costa Blanca beach — neither for the scenery nor for what it hides below — and it’s worth knowing what you’re coming for before you lug the parasol down, because the Moraig doesn’t forgive anyone who mistakes it for a towel-and-beach-bar strand.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The Moraig’s great draw is underwater and has a name: the <strong>Cova dels Arcs</strong>, a sea cave at the cove’s northern end where an <strong>underground freshwater course</strong> (the Riu Blanc system) surfaces. That freshwater input, colder and of a different density from the salt water, creates <strong>haloclines</strong> — those layers that blur your vision underwater as if you were looking through rippled glass — and lowers the water temperature by the cave; it’s also a famous and serious <strong>cave-diving</strong> site, not a toy. From the surface you can swim and snorkel to the arches, but the deep cave is for technical divers only. The bottom, rock with some seagrass, makes the Moraig a good <strong>snorkelling</strong> spot when the sea is calm.' },
        { t: 'p', html: 'And here’s the small print. The Moraig is <strong>pebbles, not sand</strong>: uncomfortable to lie on and slippery to get into the water. The wall that makes it so photogenic also means <strong>almost no natural shade</strong> — at midday in August it beats straight down — and the odd rockfall that means respecting the buoyed-off zone at the cliff’s foot. The water is <strong>clear but deep and cool</strong>, especially near the cave. And the biggest filter is getting there: the descent is <strong>narrow</strong>, parking is <strong>scarce</strong>, and in summer the council <strong>regulates and caps vehicle access</strong> at peak hours; turn up on a whim at midday in August and you’ll get the queue or the long walk. Facilities are minimal.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The golden rule is simple: <strong>go early</strong>. Arrive first thing — or outside July and August — and you’ll find a parking spot, some shade still on part of the cove, and flatter water for peering into the cave; by mid-morning in summer the Moraig fills and access gets tricky. Check Benitatxell’s summer <strong>access and parking rules</strong> beforehand, because they change by season and you can’t always drive down when you like.' },
        { t: 'p', html: 'The rest is rocky-cove common sense. <strong>Water shoes</strong>, essential: the pebbles and rocky entry are no place for bare feet. Bring <strong>mask and snorkel</strong> — the bottom deserves it — and <strong>water, food and your own shade</strong>, because there’s no beach bar to save you here. Swim to the <strong>Cova dels Arcs</strong> only with a calm, current-free sea, and don’t enter the deep cave unless you’re a diver. An extra almost nobody does? From the Moraig, a <strong>tunnel cut into the rock</strong> leads on foot to neighbouring <strong>Cala Llebeig</strong>, even quieter and car-free. The Moraig for the cave and the snorkelling; Llebeig to escape the crowd.' },
        { t: 'quote', text: 'You don’t come to the Moraig to lie on the sand: you come to peer into a cave where the sea drinks fresh water. Anyone who arrives expecting a comfortable strand has the wrong cove.' },
        { t: 'p', html: 'Because the Moraig isn’t measured in metres of fine sand or rows of loungers, but in what it keeps at the foot of the cliff: a cove of pale stone and a cave through which an invisible river slips into the Mediterranean. Get the timing right, wear water shoes and respect the sea and the wall, and you’ll take home one of the most singular corners of the Costa Blanca. Turn up at midday in peak August without checking the access, and you’ll take home a queue, a pebble jabbing your sole and a parasol in full sun.' },
      ],
      faq: [
        { q: 'What is special about Cala del Moraig?', a: 'Its sea cave, the Cova dels Arcs, where an underground freshwater river (the Riu Blanc system) surfaces straight into the sea. That creates haloclines that blur underwater vision and chills the water by the cave, and makes it a famous cave-diving spot. It’s a pebble cove at the foot of a sheer cliff, in Benitatxell (Alicante).' },
        { q: 'Is Cala del Moraig sand or pebbles?', a: 'Pebbles, not sand: uncomfortable to lie on and slippery to get into the water, so water shoes are advisable. The bottom is rocky with some seagrass, very good for snorkelling when the sea is calm.' },
        { q: 'Can you park and drive down to Cala del Moraig in summer?', a: 'Not always. The descent is narrow and parking scarce, and in summer Benitatxell council regulates and caps vehicle access at peak hours. It’s best to arrive first thing or outside July and August and to check the season’s access rules beforehand.' },
      ],
    },
  },
  // ───── Diario de playas · País Vasco (voz bicéfala) ─────
  {
    slug: 'playa-itzurun-zumaia-flysch-marea',
    category: 'curiosidades',
    title: 'Playa de Itzurun (Zumaia): 50 millones de años de flysch y una marea que se lleva la arena',
    excerpt:
      'Los acantilados de flysch de Zumaia guardan más de 50 millones de años de historia de la Tierra, incluida la capa de la extinción de los dinosaurios. Lo que no te cuentan de Itzurun: con marea alta casi no hay arena, el suelo es roca y el agua es Cantábrico frío.',
    heroAlt: 'Acantilados de flysch de la playa de Itzurun en Zumaia, con estratos de roca casi verticales sobre la arena oscura y el mar Cantábrico',
    heroQuery: 'itzurun,zumaia,flysch,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T10:29:56Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/pais-vasco', label: 'Playas del País Vasco' },
      { href: '/playas-secretas', label: 'Playas y calas poco masificadas' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas de España' },
    ],
    body: [
      { t: 'p', html: 'Zumaia recibe con una postal que descoloca: la playa no termina en un horizonte de agua, sino en una pared de roca rayada como un código de barras. Decenas de láminas de piedra clavadas casi en vertical, inclinadas hacia el mar, trepando por el acantilado hasta la ermita de San Telmo, que vigila la ensenada desde lo alto. Abajo, una lengua de arena oscura y el Cantábrico rompiendo contra la base. Parece el decorado de una serie. De hecho, lo fue.' },
      { t: 'p', html: 'Estos acantilados, el <strong>flysch de la Costa Vasca</strong>, hicieron de Rocadragón en <em>Juego de Tronos</em>: aquí desembarcaba Daenerys de vuelta a poniente. Pero la ficción se queda corta al lado de lo que de verdad guarda esta roca. Cada una de esas láminas es una página del pasado de la Tierra, y una de ellas, muy fina, marca el día en que se extinguieron los dinosaurios.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'El flysch de Zumaia forma parte del <strong>Geoparque de la Costa Vasca, reconocido por la UNESCO</strong>, y no es una metáfora de folleto: es uno de los archivos geológicos más completos del mundo. Sus estratos registran <strong>más de 50 millones de años de historia</strong> de forma continua, y entre ellos aflora el <strong>límite K-Pg</strong>, la capa que marca la extinción masiva de hace unos 66 millones de años, la de los dinosaurios. Es una sección de referencia mundial para los geólogos; aquí puedes, literalmente, poner el dedo sobre ese instante.' },
      { t: 'p', html: 'Y ahora la letra pequeña, la que casi ningún reel menciona. <strong>Itzurun depende de la marea tanto como del sol</strong>. El Cantábrico tiene mareas grandes, y con la marea alta la arena casi desaparece: te quedas con una franja mínima al pie del acantilado. Con marea baja, en cambio, se destapa una amplia <strong>plataforma de roca —la rasa mareal—</strong> por la que se camina entre los estratos. Es decir: el reloj de mareas decide si vienes a una playa, a un museo de piedra o a casi nada.' },
      { t: 'p', html: 'Lo demás, en su sitio: el suelo es <strong>roca y arena oscura</strong>, no la arena fina de postal mediterránea; el agua es <strong>Atlántico frío</strong>, rara vez por encima de 20-21°C en pleno agosto, con oleaje y corrientes; y con mar de fondo del noroeste entra marejada. A su favor —y aquí se separa de una cala salvaje— sí tiene servicios: está pegada al pueblo, con socorrista en temporada, duchas y todo a un paseo. No es Gulpiyuri: aquí no te quedas tirado, pero tampoco esperes tranquilidad de agosto.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla de oro aquí no es la hora del sol, sino <strong>la tabla de mareas</strong>. Si vienes a bañarte y tumbarte, ve con <strong>marea baja o media</strong>: tendrás arena y, de regalo, podrás caminar por la plataforma de flysch entre las capas de roca. Con marea alta, Itzurun es para las fotos del acantilado y para subir a la ermita, no para plantar la sombrilla. Mirar la marea antes de salir cambia por completo el día, y es gratis.' },
      { t: 'p', html: 'Cuándo sí y cuándo no: <strong>mayo, junio y septiembre</strong> dan el mejor equilibrio de agua templada (dentro de lo que cabe en el Cantábrico), luz y poca cola; agosto y los findes de buen tiempo la llenan, con la fama de <em>Juego de Tronos</em> sumando gente. Con <strong>mar de fondo o temporal del noroeste</strong>, mejor cambia de plan: entra oleaje serio y el baño se complica. ¿El truco del que sabe? Bajar con la marea vaciando y hacer un tramo de la <strong>ruta del flysch</strong>, o cruzar a la otra playa de Zumaia, <strong>Santiago</strong>, en la desembocadura del Urola: más arena, más resguardo y el camping al lado. Itzurun para el asombro geológico; Santiago para el baño largo con niños.' },
      { t: 'quote', text: 'No es una playa que se mida en arena: se mide en tiempo. Aquí la roca importa más que la toalla, y la marea manda más que el sol.' },
      { t: 'p', html: 'Por eso Itzurun no se parece a ninguna otra playa de España. Puedes tumbarte de espaldas a cincuenta millones de años de historia sin enterarte, o mirar el acantilado y entender que ese código de barras de piedra lleva escrito el final de una era y el principio de otra. Acierta con la marea y te llevarás las dos cosas: un baño frío y valiente, y el privilegio raro de tocar el tiempo con la mano. Equivócate de hora y te quedarás mirando la roca desde una esquina de arena, esperando a que el mar te devuelva la playa.' },
    ],
    faq: [
      { q: '¿Por qué son famosos los acantilados de Zumaia?', a: 'Son el flysch de la Costa Vasca, dentro del Geoparque reconocido por la UNESCO: sus estratos registran más de 50 millones de años de historia de la Tierra e incluyen el límite K-Pg, la capa de la extinción de los dinosaurios (hace unos 66 millones de años). Además, la playa de Itzurun y su acantilado sirvieron de Rocadragón en la serie Juego de Tronos.' },
      { q: '¿A qué hora conviene ir a la playa de Itzurun?', a: 'Depende más de la marea que del sol. Con marea baja o media hay arena para bañarse y queda al descubierto la plataforma de roca por la que se camina; con marea alta la arena casi desaparece y queda una franja mínima. Consulta la tabla de mareas de Zumaia antes de salir.' },
      { q: '¿Está fría el agua y tiene servicios?', a: 'El agua es del Cantábrico: fría, rara vez por encima de 20-21°C en agosto, con oleaje y corrientes. A diferencia de una cala salvaje, Itzurun sí tiene servicios: está junto al pueblo, con socorrista en temporada, duchas y accesos cercanos.' },
    ],
    en: {
      title: 'Playa de Itzurun (Zumaia): 50 million years of flysch, and a tide that takes the sand',
      excerpt: 'The flysch cliffs of Zumaia hold more than 50 million years of Earth’s history, including the layer that marks the dinosaurs’ extinction. What they don’t tell you about Itzurun: at high tide there’s barely any sand, the ground is rock, and the water is cold Cantabrian sea.',
      related: [
        { href: '/en/communities/pais-vasco', label: 'Beaches of the Basque Country' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'Zumaia greets you with a postcard that throws you: the beach doesn’t end in a horizon of water but in a wall of rock striped like a barcode. Dozens of stone sheets driven almost vertical, tilted towards the sea, climbing the cliff up to the hermitage of San Telmo, which watches the cove from above. Below, a tongue of dark sand and the Cantabrian breaking against the base. It looks like a set from a series. It was one, in fact.' },
        { t: 'p', html: 'These cliffs, the <strong>flysch of the Basque Coast</strong>, played Dragonstone in <em>Game of Thrones</em>: this is where Daenerys landed on her return to Westeros. But the fiction falls short of what this rock actually holds. Each of those sheets is a page from the Earth’s past, and one of them, very thin, marks the day the dinosaurs died out.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The Zumaia flysch is part of the <strong>Basque Coast UNESCO Global Geopark</strong>, and that’s no tourist metaphor: it’s one of the most complete geological archives on Earth. Its strata record <strong>more than 50 million years of continuous history</strong>, and among them surfaces the <strong>K-Pg boundary</strong>, the layer marking the mass extinction of about 66 million years ago — the dinosaurs’. It’s a world reference section for geologists; here you can literally put a finger on that instant.' },
        { t: 'p', html: 'Now the small print, the part almost no reel mentions. <strong>Itzurun depends on the tide as much as on the sun</strong>. The Cantabrian has a big tidal range, and at high tide the sand nearly vanishes: you’re left with a thin strip at the foot of the cliff. At low tide, by contrast, a broad <strong>rock platform — the tidal shelf —</strong> is uncovered, and you can walk across it between the strata. In other words: the tide clock decides whether you’ve come to a beach, a museum of stone, or almost nothing.' },
        { t: 'p', html: 'The rest, in its place: the ground is <strong>rock and dark sand</strong>, not the fine postcard sand of the Mediterranean; the water is <strong>cold Atlantic</strong>, rarely above 20-21°C even in high August, with swell and currents; and a north-westerly ground swell brings choppy water. In its favour — and here it parts ways with a wild cove — it does have facilities: it’s right by the town, with a lifeguard in season, showers and everything a short walk away. This isn’t Gulpiyuri: you won’t be stranded, but don’t expect August calm either.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The golden rule here isn’t the hour of sunlight but <strong>the tide table</strong>. If you’ve come to swim and lie down, go at <strong>low or mid tide</strong>: you’ll have sand and, as a bonus, you can walk the flysch platform between the layers of rock. At high tide, Itzurun is for cliff photos and for climbing to the hermitage, not for planting a parasol. Checking the tide before you leave changes the whole day, and it’s free.' },
        { t: 'p', html: 'When to go and when not: <strong>May, June and September</strong> give the best balance of mild-ish water (as far as the Cantabrian allows), light and short queues; August and fine-weather weekends fill it up, with the <em>Game of Thrones</em> fame adding to the crowd. With a <strong>ground swell or a north-westerly storm</strong>, change the plan: serious surf rolls in and swimming gets tricky. The insider’s trick? Head down on a falling tide and walk part of the <strong>flysch route</strong>, or cross to Zumaia’s other beach, <strong>Santiago</strong>, at the mouth of the Urola: more sand, more shelter and the campsite next door. Itzurun for the geological wonder; Santiago for the long swim with children.' },
        { t: 'quote', text: 'It’s not a beach measured in sand: it’s measured in time. Here the rock matters more than the towel, and the tide rules more than the sun.' },
        { t: 'p', html: 'That’s why Itzurun is like no other beach in Spain. You can lie with your back to fifty million years of history and never notice, or look at the cliff and grasp that this barcode of stone has written into it the end of one era and the start of another. Get the tide right and you’ll take home both: a cold, brave swim, and the rare privilege of touching time with your hand. Get the hour wrong and you’ll be watching the rock from a corner of sand, waiting for the sea to give the beach back.' },
      ],
      faq: [
        { q: 'Why are the Zumaia cliffs famous?', a: 'They are the flysch of the Basque Coast, within the UNESCO Global Geopark: the strata record more than 50 million years of Earth’s history and include the K-Pg boundary, the layer of the dinosaurs’ extinction (about 66 million years ago). Itzurun beach and its cliff also served as Dragonstone in Game of Thrones.' },
        { q: 'What time should you go to Itzurun beach?', a: 'It depends more on the tide than the sun. At low or mid tide there’s sand to swim from and the rock platform is exposed to walk on; at high tide the sand nearly disappears, leaving a thin strip. Check the Zumaia tide table before you set off.' },
        { q: 'Is the water cold, and are there facilities?', a: 'The water is Cantabrian: cold, rarely above 20-21°C in August, with swell and currents. Unlike a wild cove, Itzurun does have facilities: it’s next to the town, with a lifeguard in season, showers and nearby access.' },
      ],
    },
  },
  // ───── Diario de playas · Canarias (voz bicéfala) ─────
  {
    slug: 'playa-de-las-teresitas-tenerife-arena-sahara',
    category: 'curiosidades',
    title: 'Playa de las Teresitas (Tenerife): 270.000 t de arena del Sáhara y un dique sin olas',
    excerpt:
      'La media luna dorada de Tenerife no es natural: la arena se trajo en barco del Sáhara en 1973 y un dique de casi un kilómetro le corta el oleaje. Calma perfecta para el baño en familia, pero sin olas y con un lleno de santacruceros los fines de semana.',
    heroAlt: 'Playa de las Teresitas en San Andrés, Tenerife: media luna de arena dorada con palmeras y el macizo de Anaga al fondo, agua en calma tras el dique',
    heroQuery: 'las-teresitas,tenerife,beach,palm',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T09:19:29Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/canarias', label: 'Playas de Canarias' },
      { href: '/islas', label: 'Playas por isla en España' },
      { href: '/familias', label: 'Playas para ir con niños' },
    ],
    body: [
      { t: 'p', html: 'Se llega a las Teresitas por la carretera que bordea San Andrés y, de golpe, aparece: una media luna de arena rubia de más de un kilómetro, con hileras de palmeras plantadas en fila y, detrás, las paredes negras y verticales del macizo de Anaga cerrando el horizonte. El agua está quieta como la de una piscina, sin una ola que rompa, y el contraste entre la arena clara y la roca volcánica oscura es lo primero que descoloca. Parece la playa más natural del mundo. Es justo lo contrario.' },
      { t: 'p', html: 'Porque casi nada de lo que se ve aquí estaba hace medio siglo. La arena dorada, el agua sin oleaje, la propia forma de concha: todo se diseñó y se construyó. Las Teresitas es, probablemente, la playa artificial más lograda de España, y su historia explica tanto lo bueno como lo que conviene saber antes de plantar la sombrilla.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La playa original de San Andrés era pequeña y de <strong>arena y cantos negros de origen volcánico</strong>, como buena parte del litoral de Tenerife. A comienzos de los años 70 se decidió transformarla: en <strong>1973 se trajeron en barco unas 270.000 toneladas de arena rubia procedente del Sáhara</strong>, se ganó terreno al mar y se levantó un <strong>dique de casi un kilómetro con espigones laterales</strong> para frenar el oleaje. El resultado —abierto al público en <strong>junio de 1973</strong>— es un arenal de unos <strong>1.300 metros de largo y 80 de ancho</strong> con aguas de baño casi sin olas. Los datos no son marketing: es una obra de ingeniería costera documentada, y la razón de que el mar aquí no se comporte como mar.' },
      { t: 'p', html: 'Ahí está el <strong>contra</strong> que el folleto no subraya. Esa calma que la hace ideal para bañarse con niños es también su límite: <strong>no hay olas ni corriente</strong>, así que quien busque nadar en mar abierto, surfear o sentir el Atlántico de verdad se aburrirá; para eso, Tenerife tiene otras playas. El segundo aviso es la <strong>masificación</strong>: es <strong>la playa de la ciudad de Santa Cruz</strong>, a un cuarto de hora, y los fines de semana y festivos de verano se llena de santacruceros; el <strong>aparcamiento se satura pronto</strong> y encontrar hueco a mediodía en agosto es una lotería. Y aunque hay palmeras, dan <strong>poca sombra real</strong>: sombrilla obligatoria.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: '<strong>Cuándo sí:</strong> las Teresitas es de las mejores playas de la isla para ir <strong>en familia</strong>. Aguas someras y en calma, arena fina, socorristas y servicios a pie de arena, y una estampa difícil de igualar con Anaga de telón. La jugada local es ir <strong>entre semana y a primera hora</strong>: aparcas sin pelear, coges sitio y disfrutas la playa medio vacía antes de que llegue la ciudad. La zona del fondo, hacia San Andrés, suele estar más tranquila que el centro.' },
      { t: 'p', html: '<strong>Cuándo no:</strong> un <strong>domingo o festivo de agosto a mediodía</strong>, salvo que te guste el ambiente de playa urbana llena. Y si lo tuyo es el oleaje, ni te acerques: aquí el dique manda y el mar está domado. La <strong>alternativa</strong> según lo que busques: para arena negra salvaje y olas de verdad, las playas del norte de Anaga como <strong>Benijo o Almáciga</strong> (con cuidado, que esas sí tienen corriente); para viento y deportes, <strong>El Médano</strong> en el sur. Un apunte práctico: si vas sin coche, hay <strong>guaguas</strong> (autobuses) frecuentes desde Santa Cruz, que en día de lleno salen más a cuenta que dar vueltas buscando aparcamiento.' },
      { t: 'quote', text: 'Las Teresitas no es una casualidad de la naturaleza: es una playa de autor, con arena del Sáhara y el oleaje apagado a propósito. Su calma es su gracia y, a la vez, su letra pequeña.' },
      { t: 'p', html: 'Porque hay algo honesto en una playa que no disimula lo que es. Aquí el mar no ruge, la arena vino de otro desierto y las palmeras se plantaron una a una, y aun así la foto al atardecer, con las luces de San Andrés encendiéndose bajo los farallones de Anaga, se sostiene sola. Ve entre semana, madruga, llévate la sombrilla y acepta el trato: cambias el rugido del Atlántico por un baño templado y tranquilo con uno de los mejores fondos de isla de España. Sabiendo lo que es, se disfruta el doble.' },
    ],
    faq: [
      { q: '¿La arena de la playa de las Teresitas es natural?', a: 'No. La playa original de San Andrés era de arena y cantos negros volcánicos. La arena rubia actual se trajo en barco desde el Sáhara en 1973 (unas 270.000 toneladas) y se construyó un dique de casi un kilómetro con espigones para frenar el oleaje. Es una playa artificial de ingeniería costera.' },
      { q: '¿Hay olas o se puede surfear en las Teresitas?', a: 'Casi no hay olas: el dique y los espigones crean una zona de baño en calma, pensada para el baño tranquilo y las familias, no para el surf. Si buscas oleaje, mejor las playas del norte de Anaga (Benijo, Almáciga) o el sur de la isla.' },
      { q: '¿Cuándo ir a las Teresitas para evitar aglomeraciones?', a: 'Entre semana y a primera hora de la mañana. Es la playa de Santa Cruz de Tenerife, a un cuarto de hora, y los fines de semana y festivos de verano se llena; el aparcamiento se satura pronto. Si vas sin coche, hay guaguas frecuentes desde la capital.' },
    ],
    en: {
      title: 'Playa de las Teresitas (Tenerife): 270,000 t of Sahara sand and a breakwater with no waves',
      excerpt: 'Tenerife’s golden crescent isn’t natural: the sand was shipped from the Sahara in 1973 and a near-kilometre breakwater kills the swell. Perfect calm for a family swim, but no waves and packed with locals at weekends.',
      related: [
        { href: '/en/islands', label: 'Beaches by island' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You reach Las Teresitas on the road skirting San Andrés and, all at once, there it is: a blonde-sand crescent over a kilometre long, with rows of planted palms and, behind them, the black vertical walls of the Anaga massif closing the horizon. The water sits still as a pool, not a wave breaking, and the contrast between the pale sand and the dark volcanic rock is the first thing that throws you. It looks like the most natural beach in the world. It’s exactly the opposite.' },
        { t: 'p', html: 'Because almost nothing you see here existed half a century ago. The golden sand, the waveless water, the very shell shape: all of it was designed and built. Las Teresitas is probably the most accomplished artificial beach in Spain, and its story explains both the good and what’s worth knowing before you plant your parasol.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The original San Andrés beach was small, of <strong>black volcanic sand and pebbles</strong>, like much of Tenerife’s coast. In the early 1970s it was decided to transform it: in <strong>1973 some 270,000 tonnes of blonde sand were shipped in from the Sahara</strong>, land was reclaimed from the sea, and a <strong>near-kilometre breakwater with lateral jetties</strong> was built to stop the swell. The result — opened to the public in <strong>June 1973</strong> — is a beach roughly <strong>1,300 metres long and 80 wide</strong> with almost waveless bathing water. The figures aren’t marketing: it’s a documented piece of coastal engineering, and the reason the sea here doesn’t behave like the sea.' },
        { t: 'p', html: 'And there’s the <strong>catch</strong> the brochure doesn’t stress. The calm that makes it ideal for swimming with children is also its limit: <strong>there are no waves and no current</strong>, so anyone after open-sea swimming, surfing or the real Atlantic will be bored; Tenerife has other beaches for that. The second warning is the <strong>crowds</strong>: this is <strong>the beach of the city of Santa Cruz</strong>, a quarter of an hour away, and on summer weekends and holidays it fills with locals; the <strong>car park saturates early</strong> and finding a space at midday in August is a lottery. And though there are palms, they give <strong>little real shade</strong>: bring a parasol.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: '<strong>When yes:</strong> Las Teresitas is among the island’s best beaches for a <strong>family</strong> day. Shallow, calm water, fine sand, lifeguards and services at the sand’s edge, and a backdrop hard to beat with Anaga behind. The local move is to go <strong>on a weekday and first thing</strong>: you park without a fight, claim a spot and enjoy the beach half-empty before the city arrives. The far end, towards San Andrés, is usually quieter than the middle.' },
        { t: 'p', html: '<strong>When no:</strong> a <strong>Sunday or holiday in August at midday</strong>, unless you enjoy the busy urban-beach buzz. And if waves are your thing, don’t bother: here the breakwater rules and the sea is tamed. The <strong>alternative</strong>, depending on what you want: for wild black sand and real waves, the northern Anaga beaches like <strong>Benijo or Almáciga</strong> (carefully — those do have currents); for wind and watersports, <strong>El Médano</strong> in the south. A practical note: without a car, there are frequent <strong>guaguas</strong> (buses) from Santa Cruz, which on a busy day beat circling for a parking space.' },
        { t: 'quote', text: 'Las Teresitas is no accident of nature: it’s an authored beach, with Sahara sand and the swell switched off on purpose. Its calm is its charm and, at the same time, its small print.' },
        { t: 'p', html: 'Because there’s something honest about a beach that doesn’t hide what it is. Here the sea doesn’t roar, the sand came from another desert and the palms were planted one by one, and still the sunset photo — with the lights of San Andrés flickering on beneath the Anaga crags — holds up on its own. Go on a weekday, arrive early, bring the parasol and accept the deal: you swap the roar of the Atlantic for a warm, calm swim against one of the best island backdrops in Spain. Knowing what it is, you enjoy it twice as much.' },
      ],
      faq: [
        { q: 'Is the sand at Playa de las Teresitas natural?', a: 'No. The original San Andrés beach was black volcanic sand and pebbles. The current blonde sand was shipped from the Sahara in 1973 (some 270,000 tonnes) and a near-kilometre breakwater with jetties was built to stop the swell. It’s an artificial beach of coastal engineering.' },
        { q: 'Are there waves or can you surf at Las Teresitas?', a: 'Almost no waves: the breakwater and jetties create a calm bathing zone meant for gentle swimming and families, not surfing. If you want swell, head for the northern Anaga beaches (Benijo, Almáciga) or the south of the island.' },
        { q: 'When should you go to Las Teresitas to avoid crowds?', a: 'On a weekday and first thing in the morning. It’s the beach of Santa Cruz de Tenerife, a quarter of an hour away, and it fills on summer weekends and holidays; the car park saturates early. Without a car, there are frequent guaguas (buses) from the capital.' },
      ],
    },
  },
  // ───── Diario de playas · Cataluña (voz bicéfala) ─────
  {
    slug: 'playa-castell-palamos-salvada-urbanizacion',
    category: 'curiosidades',
    title: 'Playa de Castell, Palamós: la que un pueblo salvó del ladrillo en una votación de 1994',
    excerpt:
      'Casi medio kilómetro de arena sin un solo edificio, en plena Costa Brava. La historia y la letra pequeña de Castell: la salvó una consulta popular en 1994, no tiene apenas servicios y se llega por pista de tierra.',
    heroAlt: 'Arco de arena dorada de la playa de Castell, en Palamós, cerrado por dos promontorios de pinar sin edificios',
    heroQuery: 'castell,palamos,beach,costa-brava',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T09:21:54Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/cataluna', label: 'Playas de Cataluña' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/alquiler-barco/costas/costa-brava', label: 'Alquiler de barco en la Costa Brava' },
    ],
    body: [
      { t: 'p', html: 'Se llega a la playa de Castell por una pista de tierra que se aparta de la carretera y baja entre pinos y campos, sin un solo edificio a la vista. Al final del camino se abre un arco de arena dorada de casi medio kilómetro, cerrado por dos promontorios de pinar que se descuelgan hasta el Mediterráneo. No hay paseo marítimo, ni bloques de apartamentos, ni hileras de tumbonas de alquiler: solo la playa, el bosque y, en lo alto de la punta, las piedras de un poblado que lleva aquí más de 2.500 años.' },
      { t: 'p', html: 'Que siga así no es casualidad, sino una de las historias más singulares del urbanismo español. A comienzos de los noventa, el plan preveía convertir todo esto en una urbanización: cientos de chalets, un campo de golf, un hotel. En 1994, el Ayuntamiento de Palamós hizo algo insólito para la época —<strong>consultar a los vecinos en una votación</strong>, al estilo de los cantones suizos— y el pueblo dijo que no. Aquella papeleta salvó Castell del hormigón y la dejó como una de las pocas playas grandes <strong>sin urbanizar</strong> que quedan en la Costa Brava.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Los números de aquella consulta de 1994 explican la playa que hoy pisas. Votó algo más del 56% del censo y <strong>el 69,8% (4.189 vecinos) rechazó urbanizar</strong> los terrenos, frente a un proyecto que preveía <strong>389 viviendas, un campo de golf y un hotel</strong>. Fue una de las primeras consultas populares municipales de España. Después, el paraje entró en el <strong>Plan de Espacios de Interés Natural (PEIN) de Cataluña</strong>, que blindó lo que el voto había salvado. Y en el promontorio se conservan, además, los restos de un <strong>poblado ibérico del siglo VI a.C.</strong>' },
      { t: 'p', html: 'Ahora la letra pequeña, que es la cara B de esa misma victoria: <strong>sin urbanizar significa sin servicios</strong>. No hay paseo, ni la hilera de chiringuitos de una playa de pueblo; como mucho, un <strong>chiringuito de temporada</strong> y poco más. Se llega por <strong>pista de tierra</strong> hasta un aparcamiento (de pago en verano) que <strong>se llena a media mañana en agosto</strong>; cuando se completa, toca dejar el coche lejos y caminar. Sombra natural, la justa en los bordes de pinar; a pleno sol del mediodía, sombrilla propia o nada. Y es una playa amplia y abierta: un día de viento se nota.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla es sencilla: <strong>madruga o ve fuera de agosto</strong>. En junio, septiembre o cualquier mañana temprano, Castell es de las mejores playas de la Costa Brava, con espacio de sobra; a mediodía en pleno agosto es un aparcamiento lleno y una lección de paciencia. El truco que usan los de la zona: dejar el coche en <strong>La Fosca</strong> —la playa vecina, esa sí con servicios— y llegar andando por el <strong>camino de ronda</strong> en apenas veinte o treinta minutos, un paseo entre calas que ya vale el viaje por sí solo.' },
      { t: 'p', html: 'Aprovecha que aquí hay más que arena. Sube al <strong>poblado ibérico</strong> de la punta (está señalizado y protegido: se mira, no se toca) y encadena el <strong>camí de ronda</strong> hacia <strong>Cala s’Alguer</strong>, un rincón de barracas de pescadores que parece detenido en el tiempo. Lleva agua y comida, porque la oferta es mínima, y vuélvete con tu basura: parte de lo que hace distinta a Castell es, precisamente, que nadie la ha llenado de nada. ¿Quieres comodidad de toalla y chiringuito? La Fosca, al lado, te la da; deja Castell para el paseo largo y el silencio.' },
      { t: 'quote', text: 'No es una playa que nadie conozca ni un capricho de la naturaleza: existe tal cual porque un pueblo votó que así fuera. La rareza no es el paisaje, es la decisión.' },
      { t: 'p', html: 'Porque en Castell no se mira solo el mar; se mira lo que no hay: ni grúas, ni bloques, ni neón. Detrás de esa arena limpia hay 4.189 papeletas y un poblado de hace veintiséis siglos, dos maneras muy distintas de decir lo mismo —que hay sitios que merece la pena dejar en paz—. Llega temprano, sube a las ruinas y camina el sendero, y entenderás por qué, en una costa vendida al metro cuadrado, esta media luna de arena sigue siendo de todos.' },
    ],
    faq: [
      { q: '¿Por qué la playa de Castell no está urbanizada?', a: 'Porque en 1994 los vecinos de Palamós rechazaron en consulta popular (un 69,8% en contra) un plan que preveía 389 viviendas, un campo de golf y un hotel. Después, el paraje se incluyó en el Plan de Espacios de Interés Natural (PEIN) de Cataluña. Es una de las pocas playas grandes sin urbanizar de la Costa Brava.' },
      { q: '¿Cómo se llega y hay aparcamiento?', a: 'Por una pista de tierra desde Palamós hasta un aparcamiento de pago que se llena a media mañana en agosto; también se llega a pie por el camino de ronda desde La Fosca (20-30 minutos). No hay paseo ni apenas servicios más allá de un chiringuito de temporada: lleva agua, comida y sombra.' },
      { q: '¿Qué se puede ver además de la playa?', a: 'Un poblado ibérico del siglo VI a.C. en el promontorio (señalizado y protegido) y el camino de ronda hacia Cala s’Alguer, con sus características barracas de pescadores. Es un buen plan para combinar baño y paseo.' },
    ],
    en: {
      title: 'Playa de Castell, Palamós: the Costa Brava beach a town saved from developers by a 1994 vote',
      excerpt: 'Almost half a kilometre of sand without a single building, in the middle of the Costa Brava. The story and the small print of Castell: a 1994 referendum saved it, it has barely any services and you reach it down a dirt track.',
      related: [
        { href: '/en/communities/cataluna', label: 'Beaches of Catalonia' },
        { href: '/en/boat-rental/coasts/costa-brava', label: 'Boat rental on the Costa Brava' },
      ],
      body: [
        { t: 'p', html: 'You reach Castell beach down a dirt track that peels off the road and drops through pines and fields, without a single building in sight. At the end of the path an arc of golden sand opens up, almost half a kilometre long, closed off by two pine-clad headlands that tumble down to the Mediterranean. There’s no promenade, no blocks of flats, no rows of hired sunloungers: just the beach, the woods and, up on the point, the stones of a settlement that has stood here for more than 2,500 years.' },
        { t: 'p', html: 'That it stays this way is no accident, but one of the strangest stories in Spanish planning. In the early 1990s the plan was to turn all this into a resort: hundreds of villas, a golf course, a hotel. In 1994 Palamós council did something unusual for the time — <strong>put it to a public vote</strong>, Swiss-canton style — and the town said no. That ballot saved Castell from the concrete and left it as one of the few large <strong>undeveloped</strong> beaches remaining on the Costa Brava.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The numbers from that 1994 vote explain the beach you walk today. Turnout was just over 56% and <strong>69.8% (4,189 residents) rejected building</strong> on the land, against a project of <strong>389 homes, a golf course and a hotel</strong>. It was one of Spain’s first municipal popular consultations. Afterwards the site was folded into <strong>Catalonia’s Plan of Natural Areas of Interest (PEIN)</strong>, which locked in what the vote had saved. And on the headland stand the remains of a <strong>6th-century-BC Iberian settlement</strong>.' },
        { t: 'p', html: 'Now the small print, which is the flip side of that same victory: <strong>undeveloped means no services</strong>. No promenade, none of the row of beach bars of a town beach; at most a <strong>seasonal beach bar</strong> and little else. You arrive by <strong>dirt track</strong> to a car park (paid in summer) that <strong>fills by mid-morning in August</strong>; once it’s full, you leave the car far off and walk. Natural shade is scarce, only at the pine-lined edges; under the midday sun it’s your own parasol or nothing. And it’s a wide, open beach: a windy day shows.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The rule is simple: <strong>come early or go outside August</strong>. In June, September or any early morning, Castell is one of the Costa Brava’s finest beaches, with room to spare; at midday in peak August it’s a full car park and a lesson in patience. The trick locals use: leave the car at <strong>La Fosca</strong> — the neighbouring beach, which does have services — and walk in along the <strong>camí de ronda</strong> coastal path in twenty or thirty minutes, a stroll between coves that’s worth the trip on its own.' },
        { t: 'p', html: 'Make the most of the fact there’s more here than sand. Climb to the <strong>Iberian settlement</strong> on the point (signposted and protected: look, don’t touch) and carry on along the <strong>camí de ronda</strong> towards <strong>Cala s’Alguer</strong>, a cluster of fishermen’s huts that seems frozen in time. Bring water and food, as the offering is minimal, and take your rubbish back: part of what makes Castell different is precisely that no one has filled it with anything. Want the comfort of a towel and a beach bar? La Fosca, next door, gives you that; leave Castell for the long walk and the quiet.' },
        { t: 'quote', text: 'It’s not a beach no one knows, nor a quirk of nature: it exists as it is because a town voted for it to. The rarity isn’t the landscape, it’s the decision.' },
        { t: 'p', html: 'Because at Castell you don’t just look at the sea; you look at what isn’t there: no cranes, no blocks, no neon. Behind that clean sand lie 4,189 ballots and a settlement twenty-six centuries old, two very different ways of saying the same thing — that some places are worth leaving alone. Arrive early, climb to the ruins and walk the path, and you’ll understand why, on a coast sold by the square metre, this crescent of sand still belongs to everyone.' },
      ],
      faq: [
        { q: 'Why is Castell beach undeveloped?', a: 'Because in 1994 the residents of Palamós rejected, in a public consultation (69.8% against), a plan for 389 homes, a golf course and a hotel. The site was later included in Catalonia’s Plan of Natural Areas of Interest (PEIN). It’s one of the few large undeveloped beaches on the Costa Brava.' },
        { q: 'How do you get there and is there parking?', a: 'By a dirt track from Palamós to a paid car park that fills by mid-morning in August; you can also walk in along the camí de ronda from La Fosca (20-30 minutes). There’s no promenade and barely any services beyond a seasonal beach bar: bring water, food and shade.' },
        { q: 'What is there to see besides the beach?', a: 'A 6th-century-BC Iberian settlement on the headland (signposted and protected) and the camí de ronda coastal path towards Cala s’Alguer, with its distinctive fishermen’s huts. It’s a good plan for combining a swim with a walk.' },
      ],
    },
  },
  // ───── Diario de playas · Cantabria (voz bicéfala) ─────
  {
    slug: 'playa-liencres-cantabria-dunas-corrientes-pas',
    category: 'guias',
    title: 'Playa de Liencres (Cantabria): dunas vivas, pinar y las corrientes del Pas que mandan',
    excerpt:
      'Un parque natural de dunas móviles y pinar en la desembocadura del Pas, con casi dos kilómetros de arena. La pega: es mar abierto del Cantábrico, frío y ventoso, y las corrientes junto a la ría obligan a nadar donde marca la bandera.',
    heroAlt: 'Playa de Valdearenas en Liencres, Cantabria, con dunas cubiertas de vegetación, pinar al fondo y el mar Cantábrico rompiendo en una jornada de viento',
    heroQuery: 'liencres,cantabria,dunes,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T08:45:27Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/cantabria', label: 'Playas de Cantabria' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
    ],
    body: [
      { t: 'p', html: 'Se llega cruzando un pinar que huele a resina caliente, con la luz cayendo a rayas entre los troncos, hasta que el bosque se abre de golpe sobre un cordón de dunas peinadas por el viento y, más allá, un arenal largo y tostado con el Cantábrico rompiendo en filas. A un lado se adivina la boca del río Pas; enfrente, mar abierto sin más horizonte que el agua. Liencres no recibe con una cala recogida, sino con un paisaje entero en movimiento: arena que camina, hierba que se dobla, olas que llegan de lejos.' },
      { t: 'p', html: 'Esto no es una bañera mediterránea de agua quieta. Es la costa cántabra de cara al norte, un sistema de dunas que el viento y un río construyen a pulso, temporada tras temporada. Conviene saberlo antes de bajar la sombrilla: Liencres es de las playas que regalan una jornada grande de naturaleza y castigan al que la confunde con una piscina.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Liencres forma parte del <strong>Parque Natural de las Dunas de Liencres</strong>, declarado en <strong>1986</strong> y uno de los sistemas dunares más importantes de la costa cantábrica. Lo singular es cómo se hizo: la arena es <strong>fluvial</strong>, la baja el <strong>río Pas</strong> hasta su desembocadura, y desde ahí el viento la empuja tierra adentro y la apila en dunas móviles que un <strong>pinar plantado el siglo pasado</strong> ayuda a fijar. Es un paisaje vivo, poco común en el norte, con dos arenales encadenados —<strong>Valdearenas</strong>, el largo, de cerca de dos kilómetros, y <strong>Canallave</strong>—. Y al lado, la Costa Quebrada: los <strong>Urros de Liencres</strong>, esos farallones de roca clavados en el mar, y la <strong>playa de la Arnía</strong>.' },
      { t: 'p', html: 'La letra pequeña es justo lo que hace bello el sitio: <strong>es mar abierto</strong>. El agua es del <strong>Cantábrico, fría</strong> (rara vez cómoda más allá de julio y agosto, y pocas veces por encima de 20-21°C), y el <strong>viento</strong> que modeló las dunas sopla casi siempre: buen plan para surfistas, incómodo para una tarde de toalla quieta. Sobre todo, <strong>hay corrientes</strong>: la desembocadura del Pas genera resacas que se concentran en ese extremo, y con marea y oleaje pueden ser peligrosas. Valdearenas tiene <strong>socorrista en temporada</strong>, pero no es un chapoteadero uniforme para niños pequeños. Súmale que las dunas están <strong>protegidas</strong> —se cruzan por las pasarelas, no se pisan— y que en agosto el aparcamiento se llena a media mañana.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla que evita sustos es sencilla: <strong>báñate en la zona vigilada y lejos de la boca del río</strong>, que es donde se juntan las corrientes; mira la <strong>bandera</strong> antes de meterte y no la desafíes por buen sol que haga. Con mar de fondo del oeste o noroeste entran buenas olas —de ahí la fama surfera— pero también más resaca en la orilla; si el día viene bravo, ese día es de paseo por el cordón dunar y de mirador, no de nadar mar adentro. Y ve <strong>fuera de agosto o a primera hora</strong>: esquivas el gentío, el problema del coche y el viento térmico que arrecia por la tarde.' },
      { t: 'p', html: 'El plan redondo separa baño y paisaje. Para lo segundo, camina el <strong>pinar y las pasarelas</strong> hasta los miradores sobre los <strong>Urros</strong> y acércate a la <strong>Arnía</strong>, de roca y marea, para ver la Costa Quebrada en estado bruto (eso sí, sin apenas servicios). ¿Buscas un baño más resguardado y tranquilo para la familia? La <strong>ría de Mogro</strong>, al otro lado de la desembocadura, y las playas interiores de bahía dan aguas más mansas que el arenal expuesto. Lleva <strong>agua, comida y calzado</strong> para las pasarelas: aquí el chiringuito no lo resuelve todo y el terreno es de duna, no de paseo marítimo.' },
      { t: 'quote', text: 'Liencres no es una playa de postal quieta: es una duna que el viento rehace cada temporada y un mar que no pide permiso. Se disfruta con la bandera mirada, no a la contra.' },
      { t: 'p', html: 'Porque lo que engancha de Liencres no se mide en grados de agua ni en sombrillas, sino en amplitud: el viento peinando la hierba de las dunas, el río encontrándose con el mar, los surfistas como puntos negros sobre el gris del Cantábrico y el pinar a la espalda dándole sombra a todo. Respeta las corrientes, pisa por donde debes y elige un día sin bravura, y te llevarás una de las estampas más grandes del norte. Confúndela con una piscina en pleno temporal del oeste, y te llevarás frío, arena en los dientes y una resaca que no viste venir.' },
    ],
    faq: [
      { q: '¿Por qué es especial la playa de Liencres?', a: 'Porque forma parte del Parque Natural de las Dunas de Liencres (declarado en 1986), uno de los sistemas dunares más importantes de la costa cantábrica. La arena la baja el río Pas hasta su desembocadura y el viento la apila en dunas móviles, fijadas en parte por un pinar. Al lado están los Urros de Liencres y la Costa Quebrada.' },
      { q: '¿Es peligroso bañarse en Liencres?', a: 'Es mar abierto del Cantábrico, con agua fría, viento y corrientes, sobre todo cerca de la desembocadura del Pas, donde se concentran las resacas. Hay socorrista en temporada en Valdearenas: báñate en la zona vigilada, lejos de la boca del río, y respeta la bandera. No es un chapoteadero uniforme para niños pequeños.' },
      { q: '¿Dónde puedo bañarme más tranquilo cerca de Liencres?', a: 'Si buscas agua más mansa, la ría de Mogro al otro lado de la desembocadura y las playas interiores de bahía son más resguardadas que el arenal expuesto de Valdearenas. Liencres compensa como plan de naturaleza: pinar, dunas y los miradores sobre los Urros y la playa de la Arnía.' },
    ],
    en: {
      title: 'Playa de Liencres (Cantabria): living dunes, pines and the river Pas currents that rule',
      excerpt: 'A natural park of shifting dunes and pine forest at the mouth of the river Pas, with nearly two kilometres of sand. The catch: it’s open Cantabrian sea, cold and windy, and the currents by the estuary mean you swim where the flag says.',
      related: [
        { href: '/en/magazine', label: 'More from the Magazine' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'You arrive through a pine wood that smells of warm resin, the light falling in stripes between the trunks, until the forest suddenly opens onto a belt of wind-combed dunes and, beyond, a long tawny beach with the Cantabrian breaking in rows. To one side you can make out the mouth of the river Pas; ahead, open sea with no horizon but water. Liencres greets you not with a tucked-away cove but with a whole landscape in motion: sand that walks, grass that bends, waves that come from far off.' },
        { t: 'p', html: 'This is no still Mediterranean bathtub. It’s the Cantabrian coast facing north, a dune system built by hand by the wind and a river, season after season. Worth knowing before you put the parasol down: Liencres is one of those beaches that hand you a grand day of nature and punish anyone who mistakes it for a swimming pool.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'Liencres is part of the <strong>Dunas de Liencres Natural Park</strong>, declared in <strong>1986</strong> and one of the most important dune systems on the Cantabrian coast. What makes it singular is how it was made: the sand is <strong>fluvial</strong>, carried down by the <strong>river Pas</strong> to its mouth, and from there the wind pushes it inland and piles it into shifting dunes that a <strong>pine forest planted last century</strong> helps to fix. It’s a living landscape, uncommon in the north, with two linked beaches — <strong>Valdearenas</strong>, the long one at nearly two kilometres, and <strong>Canallave</strong>. And alongside it, the Costa Quebrada: the <strong>Urros de Liencres</strong>, those rock stacks driven into the sea, and <strong>Playa de la Arnía</strong>.' },
        { t: 'p', html: 'The small print is exactly what makes the place beautiful: <strong>it’s open sea</strong>. The water is <strong>cold Cantabrian</strong> (rarely comfortable beyond July and August, and seldom above 20-21°C), and the <strong>wind</strong> that shaped the dunes blows almost always: a fine plan for surfers, uncomfortable for a still afternoon on a towel. Above all, <strong>there are currents</strong>: the mouth of the Pas generates rips that concentrate at that end, and with the tide and swell they can be dangerous. Valdearenas has a <strong>lifeguard in season</strong>, but it’s no uniform paddling pool for small children. Add that the dunes are <strong>protected</strong> — you cross them on the boardwalks, you don’t tread on them — and that in August the car park fills by mid-morning.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The rule that avoids scares is simple: <strong>swim in the guarded area and away from the river mouth</strong>, which is where the currents gather; check the <strong>flag</strong> before going in and don’t defy it however fine the sun. With a west or north-west groundswell good waves roll in — hence the surfing reputation — but so does more undertow at the shore; if the day comes in rough, that’s a day for walking the dune belt and the viewpoints, not for swimming out. And go <strong>outside August or first thing</strong>: you dodge the crowd, the parking problem and the thermal wind that picks up in the afternoon.' },
        { t: 'p', html: 'The perfect plan separates swim from scenery. For the latter, walk the <strong>pine forest and the boardwalks</strong> up to the viewpoints over the <strong>Urros</strong> and drop by <strong>La Arnía</strong>, all rock and tide, to see the Costa Quebrada in the raw (with barely any services, mind). After a calmer, more sheltered swim for the family? The <strong>Mogro estuary</strong> on the far side of the river mouth, and the inner bay beaches, offer gentler water than the exposed strand. Bring <strong>water, food and footwear</strong> for the boardwalks: here the beach bar doesn’t solve everything, and the ground is dune, not promenade.' },
        { t: 'quote', text: 'Liencres isn’t a still postcard beach: it’s a dune the wind remakes each season and a sea that asks no permission. You enjoy it with the flag watched, not against it.' },
        { t: 'p', html: 'Because what grips you about Liencres isn’t measured in degrees of water or in parasols, but in scale: the wind combing the dune grass, the river meeting the sea, the surfers like black dots on the Cantabrian grey and the pine forest at your back shading it all. Respect the currents, walk where you should and pick a day without a temper, and you’ll take home one of the great scenes of the north. Mistake it for a pool in a full westerly storm, and you’ll take home cold, sand in your teeth and an undertow you never saw coming.' },
      ],
      faq: [
        { q: 'Why is Liencres beach special?', a: 'Because it’s part of the Dunas de Liencres Natural Park (declared in 1986), one of the most important dune systems on the Cantabrian coast. The sand is carried down by the river Pas to its mouth, and the wind piles it into shifting dunes, partly fixed by a pine forest. Alongside are the Urros de Liencres and the Costa Quebrada.' },
        { q: 'Is it dangerous to swim at Liencres?', a: 'It’s open Cantabrian sea, with cold water, wind and currents, especially near the mouth of the Pas where the rips concentrate. There’s a lifeguard in season at Valdearenas: swim in the guarded area, away from the river mouth, and respect the flag. It’s not a uniform paddling pool for small children.' },
        { q: 'Where can I swim more calmly near Liencres?', a: 'For gentler water, the Mogro estuary on the far side of the river mouth and the inner bay beaches are more sheltered than the exposed Valdearenas strand. Liencres pays off as a nature day: pine forest, dunes and the viewpoints over the Urros and Playa de la Arnía.' },
      ],
    },
  },
  // ───── Diario de playas · Cantabria (voz bicéfala) ─────
  {
    slug: 'playa-oyambre-cantabria-avion-1929',
    category: 'curiosidades',
    title: 'Playa de Oyambre (Cantabria): aquí aterrizó en 1929 un avión recién llegado del Atlántico',
    excerpt:
      'Aquí tomó tierra el "Pájaro Amarillo" tras cruzar el Atlántico en 1929. Lo que hay que saber de Oyambre hoy: dunas protegidas y arena de sobra, pero costa abierta, agua fría y corrientes en la ría.',
    heroAlt: 'Playa de Oyambre en Cantabria con arena amplia, dunas y colinas verdes al fondo bajo cielo nublado',
    heroQuery: 'oyambre,cantabria,beach,dunes',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T09:20:28Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/cantabria', label: 'Playas de Cantabria' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
    ],
    body: [
      { t: 'p', html: 'La estampa de Oyambre no cambia mucho desde hace un siglo: una lengua larga de arena bajo colinas de un verde casi irlandés, las dunas peinadas por el viento del Cantábrico y, al fondo, la silueta de los Picos de Europa cuando el día lo permite. Pero hay una mañana de junio de 1929 que aquí no se olvida: la de un avión amarillo saliendo de la bruma y posándose sobre la arena mojada, con el motor ya en las últimas y la gente del pueblo corriendo a ver qué caía del cielo.' },
      { t: 'p', html: 'Aquel trasto era el <strong>"Pájaro Amarillo"</strong> (<em>L’Oiseau Canari</em>), y acababa de hacer algo que entonces rozaba lo imposible: <strong>cruzar el Atlántico sin escalas</strong>. Se quedó sin combustible y eligió esta playa para no caer al mar. Casi un siglo después, Oyambre sigue siendo eso: una playa grande y salvaje, de parque natural, con más historia y más viento que sombrillas. Conviene saber a qué se viene.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'El hecho es real y está documentado: el <strong>14 de junio de 1929</strong>, la tripulación francesa del <em>Oiseau Canari</em> —Jean Assollant, René Lefèvre y Armand Lotti, más un polizón norteamericano, Arthur Schreiber— completó una de las primeras travesías aéreas del Atlántico <strong>sin escalas del continente americano a Europa</strong>, despegando de Old Orchard (Maine). Sin gasolina para llegar a París, aterrizaron sobre la arena de Oyambre. Hoy un <strong>monumento junto a la playa</strong> lo recuerda. Y el entorno acompaña: Oyambre está dentro del <strong>Parque Natural de Oyambre</strong>, un cordón de dunas, marismas y rías protegido desde 1988.' },
      { t: 'p', html: 'Ahora la letra pequeña que el folleto se salta: <strong>Oyambre es playa de parque natural, no piscina</strong>. Da al Cantábrico abierto, así que hay <strong>oleaje, corrientes y resacas</strong>, y el agua es <strong>fría</strong> (rara vez cómoda fuera de julio y agosto). Las mareas cantábricas son grandes: con la <strong>marea alta la arena se estrecha</strong> mucho y las bocas de las rías cercanas —la de San Vicente y la de la Rabia— tienen <strong>corrientes peligrosas</strong> que no son para bañarse. Súmale que las <strong>dunas están protegidas</strong> (hay que pisar por las pasarelas, no campo a través), que los <strong>servicios son limitados</strong> y que en agosto el aparcamiento se llena pronto. Es una gran playa; no es una playa fácil.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla de oro aquí es doble: <strong>mira la marea y mira el mar</strong>. Con marea media-baja Oyambre despliega un arenal enorme donde cabe todo el mundo; con marejada de fondo, en cambio, es playa de <strong>surfistas</strong>, no de bañistas tranquilos. Báñate en el <strong>tramo vigilado</strong> y hazle caso a las banderas: la resaca en un día de olas se lleva mar adentro sin avisar, sobre todo cerca de las desembocaduras. Con niños pequeños, ese día, mejor la orilla y el castillo de arena.' },
      { t: 'p', html: 'Lo demás es disfrutar lo que la hace distinta: ve <strong>fuera de agosto o a primera hora</strong> para tenerla medio vacía y con buena luz, acércate al <strong>monumento del Pájaro Amarillo</strong> para ponerle cara a la historia, y respeta las <strong>pasarelas sobre las dunas</strong> —es lo que mantiene el sitio como es—. El plan redondo la encadena con <strong>San Vicente de la Barquera</strong> y <strong>Comillas</strong>, a un paso, para comer y ver pueblo. ¿Buscas un baño más resguardado y templado? Las <strong>playas de dentro de las rías</strong> y las ensenadas protegidas rompen menos que este frente abierto: Oyambre para el paseo largo y el surf; la ría para chapotear sin sobresaltos.' },
      { t: 'quote', text: 'No es una "playa virgen" cualquiera: es la pista de aterrizaje accidental de una hazaña de 1929. Y sigue teniendo el mismo carácter que la eligió: mar abierto, viento y ni una concesión al que busca piscina.' },
      { t: 'p', html: 'Porque a Oyambre no se viene solo a bañarse, sino a pisar un sitio donde el mar, el viento y hasta la historia van a lo suyo. Aquel avión amarillo lo entendió a las malas —se quedó sin cielo y esta arena lo recogió—; tú tienes la ventaja de mirar antes la tabla de mareas y el parte de olas. Acierta con las dos, sube la vista a las colinas verdes y a los Picos al fondo, y entenderás por qué esta playa lleva casi un siglo contando la misma historia. Ven de cualquier manera un día de mar gruesa, y te la contará la resaca.' },
    ],
    faq: [
      { q: '¿Qué avión aterrizó en la playa de Oyambre?', a: 'El "Pájaro Amarillo" (L’Oiseau Canari), que el 14 de junio de 1929 completó una de las primeras travesías aéreas del Atlántico sin escalas del continente americano a Europa. Sin combustible para llegar a París, su tripulación aterrizó sobre la arena de Oyambre. Hoy un monumento junto a la playa lo recuerda.' },
      { q: '¿Es peligrosa la playa de Oyambre para bañarse?', a: 'Es una playa de costa abierta dentro de un parque natural: tiene oleaje, corrientes y resacas, agua fría y grandes mareas, y las bocas de las rías cercanas tienen corrientes peligrosas. No es una piscina: báñate en el tramo vigilado, respeta las banderas y con niños pequeños quédate en la orilla los días de mar gruesa.' },
      { q: '¿Cuándo es mejor ir a la playa de Oyambre?', a: 'Con marea media-baja se despliega un arenal enorme; con marejada de fondo es más playa de surf que de baño tranquilo. Ve fuera de agosto o a primera hora para esquivar el gentío y el aparcamiento lleno, y combínala con San Vicente de la Barquera y Comillas, muy cerca.' },
    ],
    en: {
      title: 'Playa de Oyambre (Cantabria): where a transatlantic plane landed in 1929',
      excerpt: 'This is where the "Yellow Bird" touched down after crossing the Atlantic in 1929. What to know about Oyambre today: protected dunes and sand to spare, but open coast, cold water and estuary currents.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'Oyambre hasn’t changed much in a century: a long tongue of sand under hills of an almost Irish green, dunes combed by the Cantabrian wind and, in the distance, the outline of the Picos de Europa when the day allows. But there’s a June morning in 1929 that isn’t forgotten here: a yellow plane emerging from the mist and settling onto the wet sand, its engine on its last gasp, the villagers running out to see what had fallen from the sky.' },
        { t: 'p', html: 'That contraption was the <strong>"Yellow Bird"</strong> (<em>L’Oiseau Canari</em>), and it had just done something that then bordered on the impossible: <strong>crossed the Atlantic non-stop</strong>. Out of fuel, it chose this beach rather than ditch in the sea. Almost a century on, Oyambre is still that: a big, wild, natural-park beach with more history and more wind than parasols. Worth knowing what you’re coming for.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The event is real and documented: on <strong>14 June 1929</strong>, the French crew of the <em>Oiseau Canari</em> — Jean Assollant, René Lefèvre and Armand Lotti, plus an American stowaway, Arthur Schreiber — completed one of the first non-stop transatlantic flights <strong>from the American continent to Europe</strong>, taking off from Old Orchard, Maine. Without the fuel to reach Paris, they landed on the sand at Oyambre. A <strong>monument beside the beach</strong> commemorates it today. And the setting matches: Oyambre lies within the <strong>Oyambre Natural Park</strong>, a belt of dunes, marshes and estuaries protected since 1988.' },
        { t: 'p', html: 'Now the small print the brochure skips: <strong>Oyambre is a natural-park beach, not a pool</strong>. It faces the open Cantabrian, so there’s <strong>swell, currents and undertow</strong>, and the water is <strong>cold</strong> (rarely comfortable outside July and August). Cantabrian tides are big: at <strong>high tide the sand narrows</strong> sharply, and the mouths of the nearby estuaries — San Vicente and La Rabia — have <strong>dangerous currents</strong> that are not for swimming. Add that the <strong>dunes are protected</strong> (keep to the boardwalks, not across country), that <strong>facilities are limited</strong> and that in August the car park fills early. It’s a great beach; it’s not an easy one.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The golden rule here is twofold: <strong>watch the tide and watch the sea</strong>. At mid-to-low tide Oyambre unrolls a huge stretch of sand with room for everyone; with a groundswell running, though, it’s a beach for <strong>surfers</strong>, not calm bathers. Swim in the <strong>lifeguarded section</strong> and heed the flags: on a wave day the undertow drags you out without warning, especially near the estuary mouths. With small children, on that kind of day, stick to the shoreline and the sandcastle.' },
        { t: 'p', html: 'The rest is enjoying what makes it different: go <strong>outside August or first thing</strong> to have it half-empty and well-lit, walk over to the <strong>Yellow Bird monument</strong> to put a face to the story, and respect the <strong>boardwalks over the dunes</strong> — it’s what keeps the place as it is. The perfect plan pairs it with <strong>San Vicente de la Barquera</strong> and <strong>Comillas</strong>, both a short hop away, for lunch and a village. After a more sheltered, milder swim? The <strong>beaches inside the estuaries</strong> and the protected inlets break far less than this open front: Oyambre for the long walk and the surf; the estuary for a splash without surprises.' },
        { t: 'quote', text: 'It’s not just another "unspoilt beach": it’s the accidental landing strip of a 1929 feat. And it still has the very character that chose it — open sea, wind and not one concession to anyone after a swimming pool.' },
        { t: 'p', html: 'Because you don’t come to Oyambre only to swim, but to stand somewhere the sea, the wind and even history do as they please. That yellow plane learned it the hard way — it ran out of sky and this sand caught it; you have the advantage of checking the tide table and the surf forecast first. Get both right, lift your eyes to the green hills and the Picos beyond, and you’ll see why this beach has been telling the same story for almost a century. Turn up any old way on a heavy-sea day, and the undertow will tell it to you.' },
      ],
      faq: [
        { q: 'What plane landed on Oyambre beach?', a: 'The "Yellow Bird" (L’Oiseau Canari), which on 14 June 1929 completed one of the first non-stop transatlantic flights from the American continent to Europe. Out of fuel to reach Paris, its crew landed on the sand at Oyambre. A monument beside the beach commemorates it today.' },
        { q: 'Is Oyambre beach dangerous for swimming?', a: 'It’s an open-coast beach within a natural park: it has swell, currents and undertow, cold water and big tides, and the nearby estuary mouths carry dangerous currents. It’s not a pool: swim in the lifeguarded section, heed the flags, and with small children stay by the shore on heavy-sea days.' },
        { q: 'When is the best time to visit Oyambre?', a: 'At mid-to-low tide a huge stretch of sand opens up; with a groundswell it’s more a surf beach than one for a calm swim. Go outside August or first thing to dodge the crowds and the full car park, and combine it with San Vicente de la Barquera and Comillas nearby.' },
      ],
    },
  },
  // ───── Snorkel por costas (voz bicéfala · con fuentes) ─────
  {
    slug: 'mejores-playas-snorkel-costa-brava',
    category: 'guias',
    title: 'Snorkel en la Costa Brava: dónde ver mero y coral (y la reserva de solo con guía)',
    excerpt:
      'Fondos de roca, una reserva marina con mero y coral rojo, y calas de agua clara. Dónde hacer snorkel de verdad en la Costa Brava, qué viento lo arruina y las normas de las Illes Medes.',
    heroAlt: 'Buceador haciendo snorkel sobre un fondo rocoso de la Costa Brava con peces y agua clara cerca de las Illes Medes',
    heroQuery: 'snorkel,medes,costa-brava,sea',
    gygQuery: 'snorkel Costa Brava',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-16T13:00:00Z',
    readingMin: 6,
    related: [
      { href: '/alquiler-barco/costas/costa-brava/provincias/girona/estartit', label: 'Alquiler de barco en l’Estartit' },
      { href: '/comunidad/cataluna', label: 'Playas de Cataluña' },
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas claras' },
    ],
    body: [
      { t: 'p', html: 'Metes la cabeza por primera vez frente a un cabo de la Costa Brava y entiendes por qué media Europa viene a bucear aquí: bajo la superficie, las paredes de roca caen en escalones cubiertos de algas, los bancos de castañuelas se abren a tu paso y, si hay suerte, un mero curioso te mira de frente sin inmutarse. La Costa Brava no es de arena interminable; es de roca, posidonia y vida, y por eso es probablemente el mejor litoral peninsular para el snorkel.' },
      { t: 'p', html: 'La joya es submarina y tiene nombre: las <strong>Illes Medes</strong>, frente a l’Estartit, una de las reservas marinas más célebres del Mediterráneo. Pero hay mucha Costa Brava buena para meter el tubo sin barca, de Cap de Creus a Tossa. La cuestión, como siempre, no es solo dónde, sino cuándo y cómo.' },
      { t: 'h2', text: 'Dónde (y los datos que lo respaldan)', id: 'datos' },
      { t: 'p', html: 'El epicentro son las <strong>Illes Medes</strong>: un archipiélago protegido desde los años 80 e integrado en el <strong>Parc Natural del Montgrí, les Illes Medes i el Baix Ter</strong>, con cientos de hectáreas de aguas protegidas. Décadas de protección han devuelto al fondo <strong>mero, corvallo, coral rojo y rayas</strong> —es snorkel de "acuario real"—, pero con una condición: a la reserva se entra <strong>en barca, fondeando en las boyas, y el snorkel se hace acompañado de guía</strong>; no se toca la fauna ni se pesca. Es la salida estrella desde <strong>l’Estartit</strong>. Cerca, frente a Calella de Palafrugell, las <strong>Illes Formigues</strong> son otro pequeño archipiélago protegido con mucha biodiversidad.' },
      { t: 'p', html: 'Para snorkel por libre desde la orilla, las mejores son calas de <strong>fondo rocoso y agua transparente</strong>: <strong>Aiguablava</strong> y <strong>Sa Tuna</strong> (Begur) —la primera, somera y fácil; la segunda, una cala de pescadores con roca a ambos lados—, <strong>Cala Pola</strong> (Tossa de Mar), rodeada de pinos, y en el <strong>Cap de Creus</strong>, <strong>Cala Montjoi</strong> y <strong>Cala Jóncols</strong>, de cantos y fondo rocoso. La calidad del agua acompaña: buena parte de estas calas figuran con calidad <strong>"excelente" en los informes de la Agencia Europea de Medio Ambiente</strong> de los últimos años.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Lo que decide un buen día de snorkel aquí no es la cala, es <strong>el viento</strong>. Con <strong>levante</strong> o <strong>garbí</strong> (vientos del este/sureste) entra marejada y la visibilidad bajo el agua se desploma: el fondo se enturbia y no ves a un palmo. Con la tramontana en calma y mar de fondo bajo, en cambio, el agua se queda quieta y transparente. Mira el parte de mar la noche antes; un día de levante convierte el mejor spot en agua turbia.' },
      { t: 'p', html: 'Lo demás es sentido común: <strong>escarpines</strong> (esto es roca y erizos, no arena), <strong>ve a primera hora</strong> —el agua está más plana y las calas pequeñas se llenan a media mañana en verano— y no toques nada del fondo. Para las <strong>Medes</strong>, no intentes ir por tu cuenta a nadar entre la fauna: contrata la salida guiada en barca desde l’Estartit, que es como se visita la reserva legalmente y, de paso, te lleva a las mejores cuevas y paredes. Si quieres encadenar varias calas del mismo cabo sin pelear con el aparcamiento, <a href="/alquiler-barco/costas/costa-brava/provincias/girona/estartit">alquilar un barco en l’Estartit</a> es la forma local de hacerlo.' },
      { t: 'quote', text: 'En la Costa Brava el snorkel no se mide en kilómetros de arena, sino en metros de visibilidad. Y la visibilidad la decide el viento, no la cala.' },
      { t: 'p', html: 'Porque lo bueno de esta costa está debajo: en la roca, en la posidonia y en una reserva que demostró que el Mediterráneo se recupera cuando se le deja. Elige un día sin levante, ponte los escarpines y baja despacio; verás castañuelas, salpas y, con suerte, ese mero que en las Medes ya no huye. El mejor paisaje de la Costa Brava, casi siempre, está bajo la línea del agua.' },
    ],
    faq: [
      { q: '¿Cuáles son las mejores calas para snorkel en la Costa Brava?', a: 'Para snorkel guiado, las Illes Medes (en barca desde l’Estartit, con guía) son lo mejor por su fauna recuperada. Por libre desde la orilla destacan Aiguablava y Sa Tuna (Begur), Cala Pola (Tossa de Mar) y, en Cap de Creus, Cala Montjoi y Cala Jóncols, todas de fondo rocoso y agua clara.' },
      { q: '¿Se puede hacer snorkel por libre en las Islas Medes?', a: 'La reserva marina se visita en barca, fondeando en las boyas habilitadas, y el snorkel se realiza acompañado de guía; no está permitido tocar la fauna ni pescar. Es la salida típica desde l’Estartit. No es una cala a la que se llegue nadando desde la playa.' },
      { q: '¿Qué viento estropea el snorkel en la Costa Brava?', a: 'El levante y el garbí (vientos del este/sureste) levantan marejada y enturbian el agua, hundiendo la visibilidad. Lo ideal es mar en calma; revisa el parte la noche antes y lleva escarpines, porque el fondo es de roca y erizos.' },
    ],
    en: {
      title: 'Snorkelling the Costa Brava: where to see grouper and coral, and the guide-only reserve',
      excerpt: 'Rocky seabeds, a marine reserve with grouper and red coral, and clear-water coves. Where to really snorkel on the Costa Brava, which wind ruins it, and the Medes Islands rules.',
      related: [
        { href: '/en/boat-rental/coasts/costa-brava/provinces/girona/estartit', label: 'Boat rental in l’Estartit' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'Put your head under for the first time off a Costa Brava headland and you understand why half of Europe comes here to dive: below the surface, rock walls drop in algae-covered steps, shoals of damselfish part as you pass and, with luck, a curious grouper stares you down without flinching. The Costa Brava isn’t about endless sand; it’s rock, seagrass and life, which is why it’s probably the best mainland coast for snorkelling.' },
        { t: 'p', html: 'The jewel is underwater and has a name: the <strong>Medes Islands</strong>, off l’Estartit, one of the most famous marine reserves in the Mediterranean. But there’s plenty of good Costa Brava for snorkelling without a boat, from Cap de Creus to Tossa. The question, as ever, isn’t just where, but when and how.' },
        { t: 'h2', text: 'Where (and the facts behind it)', id: 'facts' },
        { t: 'p', html: 'The epicentre is the <strong>Medes Islands</strong>: an archipelago protected since the 1980s and part of the <strong>Montgrí, Medes Islands and Baix Ter Natural Park</strong>, with hundreds of hectares of protected waters. Decades of protection have brought back <strong>grouper, brown meagre, red coral and rays</strong> — it’s "real aquarium" snorkelling — but with one condition: you enter the reserve <strong>by boat, mooring at the buoys, and snorkel accompanied by a guide</strong>; you don’t touch the wildlife or fish. It’s the flagship trip from <strong>l’Estartit</strong>. Nearby, off Calella de Palafrugell, the <strong>Formigues Islands</strong> are another small protected archipelago rich in biodiversity.' },
        { t: 'p', html: 'For snorkelling from the shore, the best are coves with <strong>rocky bottoms and clear water</strong>: <strong>Aiguablava</strong> and <strong>Sa Tuna</strong> (Begur) — the first shallow and easy, the second a fishing cove with rock on both sides — <strong>Cala Pola</strong> (Tossa de Mar), ringed by pines, and on <strong>Cap de Creus</strong>, <strong>Cala Montjoi</strong> and <strong>Cala Jóncols</strong>, pebbly with rocky beds. Water quality backs it up: many of these coves are rated <strong>"excellent" in recent European Environment Agency reports</strong>.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'What decides a good snorkel day here isn’t the cove, it’s <strong>the wind</strong>. With a <strong>levante</strong> or <strong>garbí</strong> (easterly/south-easterly winds) a swell rolls in and underwater visibility collapses: the bottom clouds over and you can’t see a hand’s width. With calm and low groundswell, by contrast, the water turns still and clear. Check the sea forecast the night before; a levante day turns the best spot into murky water.' },
        { t: 'p', html: 'The rest is common sense: <strong>water shoes</strong> (this is rock and sea urchins, not sand), <strong>go first thing</strong> — the water is flatter and the small coves fill by mid-morning in summer — and touch nothing on the bottom. For the <strong>Medes</strong>, don’t try to go on your own to swim among the wildlife: book the guided boat trip from l’Estartit, which is how you legally visit the reserve and, along the way, reach the best caves and walls. To string together several coves on the same headland without fighting for parking, <a href="/en/boat-rental/coasts/costa-brava/provinces/girona/estartit">renting a boat in l’Estartit</a> is the local way to do it.' },
        { t: 'quote', text: 'On the Costa Brava snorkelling isn’t measured in kilometres of sand, but in metres of visibility. And visibility is decided by the wind, not the cove.' },
        { t: 'p', html: 'Because the good part of this coast is underneath: in the rock, the seagrass and a reserve that proved the Mediterranean recovers when left alone. Pick a day without a levante, put on your water shoes and go down slowly; you’ll see damselfish, salema and, with luck, that grouper which in the Medes no longer flees. The best scenery on the Costa Brava is almost always below the waterline.' },
      ],
      faq: [
        { q: 'Which are the best coves for snorkelling on the Costa Brava?', a: 'For guided snorkelling, the Medes Islands (by boat from l’Estartit, with a guide) are the best for their recovered wildlife. From the shore, the standouts are Aiguablava and Sa Tuna (Begur), Cala Pola (Tossa de Mar) and, on Cap de Creus, Cala Montjoi and Cala Jóncols, all rocky-bottomed with clear water.' },
        { q: 'Can you snorkel independently in the Medes Islands?', a: 'The marine reserve is visited by boat, mooring at the designated buoys, and snorkelling is done accompanied by a guide; touching wildlife or fishing is not allowed. It’s the typical trip from l’Estartit, not a cove you can swim out to from the beach.' },
        { q: 'Which wind ruins snorkelling on the Costa Brava?', a: 'The levante and garbí (easterly/south-easterly winds) raise a swell and cloud the water, sinking visibility. Calm seas are ideal; check the forecast the night before and bring water shoes, as the bottom is rock and sea urchins.' },
      ],
    },
  },
  // ───── Medusas (voz bicéfala) ─────
  {
    slug: 'que-hacer-picadura-medusa-mitos',
    category: 'guias',
    title: 'Picadura de medusa: los pasos que funcionan (y por qué la orina y el vinagre fallan)',
    excerpt:
      'Agua de mar sí, agua dulce no, orina nunca. La guía de primeros auxilios ante una picadura de medusa, con los pasos que de verdad funcionan y los mitos que pueden empeorarla.',
    heroAlt: 'Medusa Pelagia noctiluca translúcida con tonos violáceos flotando en agua de mar iluminada por el sol',
    heroQuery: 'jellyfish,mediterranean,sea',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-16T11:00:00Z',
    readingMin: 4,
    related: [
      { href: '/medusas', label: 'Riesgo de medusas por playa' },
      { href: '/calidad-agua', label: 'Calidad del agua de baño' },
      { href: '/playas-sin-viento', label: 'Playas resguardadas del viento' },
    ],
    body: [
      { t: 'p', html: 'Primero el roce, casi eléctrico; luego el escozor que sube por el brazo como una quemadura fina. Quien ha pisado una medusa en agosto conoce esa secuencia: el pinchazo invisible, la marca rojiza que aparece en minutos y la pregunta que llega justo después, a pie de orilla, entre el corro de bañistas opinando cada uno una cosa distinta. Y ahí está el problema: casi todo lo que se dice en ese corro es mentira.' },
      { t: 'p', html: 'La protagonista habitual en el Mediterráneo es la <em>Pelagia noctiluca</em>, el "clavel de mar", pequeña y violácea. Su picadura duele y arde, pero rara vez es grave en un adulto sano. Lo que decide cómo evoluciona no es la suerte: son los <strong>primeros dos minutos</strong> y hacer lo correcto en vez de lo que dijo el cuñado.' },
      { t: 'h2', text: 'Los pasos correctos (y lo que NO)', id: 'datos' },
      { t: 'p', html: 'Lo que sí funciona, en orden: <strong>1)</strong> sal del agua sin frotarte y avisa al <strong>socorrista</strong> (para eso está el puesto). <strong>2)</strong> Aclara la zona con <strong>agua de mar</strong>, nunca con agua dulce: el agua dulce cambia la presión y hace estallar los nematocistos (las cápsulas urticantes) que aún no han descargado, así que <strong>empeora la picadura</strong>. <strong>3)</strong> Retira los restos de tentáculo <strong>sin tocarlos con los dedos</strong>: con pinzas o el canto de una tarjeta. <strong>4)</strong> Aplica <strong>frío</strong> para el dolor —una bolsa de hielo, nunca el hielo directo (es agua dulce)—. <strong>5)</strong> No frotes con arena ni con la toalla, no apliques orina ni amoniaco ni alcohol: son remedios de patio que solo reparten más veneno.' },
      { t: 'p', html: 'El matiz honesto que casi ninguna lista cuenta: lo del <strong>vinagre y lo del calor depende de la especie</strong>. El vinagre desactiva el veneno de algunas especies tropicales y de la carabela portuguesa, pero con la medusa común mediterránea su efecto es discutido y puede ser contraproducente; y aunque para algunas picaduras se recomienda sumergir en <strong>agua caliente (40-45°C)</strong>, no es universal. Por eso la regla de oro es simple: <strong>haz lo seguro (agua de mar + frío + retirar restos) y, para lo demás, pregunta al socorrista</strong>, que sabe qué medusa hay ese día en esa playa.' },
      { t: 'h2', text: 'Cuándo dejar de improvisar', id: 'local' },
      { t: 'p', html: 'Hay situaciones en las que toca ir más allá del botiquín de playa. Busca <strong>atención médica o llama al 112</strong> si aparece dificultad para respirar, hinchazón que se extiende, mareo o cualquier signo de <strong>reacción alérgica</strong>; si la picadura es extensa, en la cara o los genitales; o si la víctima es un <strong>niño pequeño, una persona mayor o alguien con problemas de salud</strong>. No es alarmismo: una reacción general es poco frecuente pero existe.' },
      { t: 'p', html: 'Y un aviso de identificación que salva sustos: la <strong>carabela portuguesa</strong> (<em>Physalia physalis</em>), ese globo azul con un crestón rosado, <strong>no es una medusa</strong> sino una colonia flotante, y su picadura es bastante más seria. Si ves una en la orilla, no la toques aunque parezca muerta —sus tentáculos pican igual— y avisa al socorrista. Con ella, frío y agua de mar, retirar restos con cuidado y atención médica; el vinagre aquí tampoco es consenso.' },
      { t: 'quote', text: 'La orina no cura una picadura de medusa: solo añade público. Lo que de verdad ayuda cabe en tres palabras: agua de mar, frío y socorrista.' },
      { t: 'p', html: 'Porque una picadura de medusa es, casi siempre, un mal rato y no una urgencia; pero el mal rato se alarga o se acorta según lo que hagas en los primeros minutos. Olvida los remedios de leyenda, ten claros los cuatro pasos seguros y deja el resto en manos de quien lleva la cruz roja en la camiseta. La playa seguirá ahí mañana, y tu brazo, con un poco de cabeza, lo agradecerá esta misma tarde.' },
    ],
    faq: [
      { q: '¿Hay que echar orina o agua dulce en una picadura de medusa?', a: 'No. La orina es un mito y no sirve. El agua dulce está contraindicada: cambia la presión y hace estallar los nematocistos que no han descargado, empeorando la picadura. Hay que aclarar con agua de mar.' },
      { q: '¿Frío o calor para una picadura de medusa?', a: 'El frío (bolsa de hielo, nunca hielo directo) calma el dolor y es lo seguro. Para algunas especies se recomienda agua caliente (40-45°C), pero depende de la medusa; ante la duda, aplica frío y pregunta al socorrista.' },
      { q: '¿Cuándo hay que ir al médico por una picadura de medusa?', a: 'Si aparece dificultad para respirar, hinchazón que se extiende, mareo o signos de alergia; si la picadura es extensa o en cara/genitales; o si afecta a niños pequeños, mayores o personas con problemas de salud. En esos casos, atención médica o 112.' },
    ],
    en: {
      title: 'Jellyfish sting: the steps that actually work (and why urine and vinegar often don’t)',
      excerpt: 'Seawater yes, fresh water no, urine never. The first-aid guide for a jellyfish sting, with the steps that actually work and the myths that can make it worse.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'First the brush, almost electric; then the sting climbing up your arm like a thin burn. Anyone who’s caught a jellyfish in August knows the sequence: the invisible jab, the reddish mark that appears within minutes, and the question that follows right at the shoreline, amid a ring of bathers each offering a different cure. And that’s the problem: almost everything said in that ring is wrong.' },
        { t: 'p', html: 'The usual culprit in the Mediterranean is <em>Pelagia noctiluca</em>, the "mauve stinger", small and violet. Its sting hurts and burns, but is rarely serious in a healthy adult. What decides how it plays out isn’t luck: it’s the <strong>first two minutes</strong> and doing the right thing instead of what someone’s uncle swears by.' },
        { t: 'h2', text: 'The right steps (and what NOT to do)', id: 'facts' },
        { t: 'p', html: 'What works, in order: <strong>1)</strong> get out of the water without rubbing and tell the <strong>lifeguard</strong> (that’s what the post is for). <strong>2)</strong> Rinse the area with <strong>seawater</strong>, never fresh water: fresh water changes the pressure and bursts the nematocysts (the stinging capsules) that haven’t fired yet, so it <strong>makes the sting worse</strong>. <strong>3)</strong> Remove tentacle remains <strong>without touching them with your fingers</strong>: use tweezers or the edge of a card. <strong>4)</strong> Apply <strong>cold</strong> for the pain — an ice pack, never ice directly (it’s fresh water). <strong>5)</strong> Don’t rub with sand or a towel, and don’t apply urine, ammonia or alcohol: backyard remedies that only spread more venom.' },
        { t: 'p', html: 'The honest nuance almost no list mentions: <strong>vinegar and heat depend on the species</strong>. Vinegar deactivates the venom of some tropical species and the Portuguese man o’ war, but with the common Mediterranean jellyfish its effect is disputed and may backfire; and although hot-water immersion (<strong>40-45°C</strong>) is advised for some stings, it isn’t universal. So the golden rule is simple: <strong>do the safe things (seawater + cold + remove remains) and, for the rest, ask the lifeguard</strong>, who knows which jellyfish is around that day.' },
        { t: 'h2', text: 'When to stop improvising', id: 'local' },
        { t: 'p', html: 'There are times to go beyond the beach first-aid kit. Seek <strong>medical attention or call 112</strong> if there’s difficulty breathing, spreading swelling, dizziness or any sign of an <strong>allergic reaction</strong>; if the sting is extensive, on the face or genitals; or if the victim is a <strong>small child, an older person or someone with health problems</strong>. It’s not scaremongering: a general reaction is uncommon but real.' },
        { t: 'p', html: 'And an ID warning that saves scares: the <strong>Portuguese man o’ war</strong> (<em>Physalia physalis</em>), that blue float with a pink crest, <strong>isn’t a jellyfish</strong> but a floating colony, and its sting is considerably more serious. If you see one on the shore, don’t touch it even if it looks dead — its tentacles still sting — and alert the lifeguard. With it: cold and seawater, careful removal of remains and medical attention; vinegar here is no consensus either.' },
        { t: 'quote', text: 'Urine doesn’t cure a jellyfish sting: it only adds an audience. What actually helps fits in three words: seawater, cold, lifeguard.' },
        { t: 'p', html: 'Because a jellyfish sting is, almost always, a bad moment rather than an emergency; but that bad moment stretches or shrinks depending on what you do in the first minutes. Forget the legendary remedies, know the four safe steps, and leave the rest to the person with the red cross on their shirt. The beach will still be there tomorrow, and your arm, with a little sense, will thank you this very afternoon.' },
      ],
      faq: [
        { q: 'Should you put urine or fresh water on a jellyfish sting?', a: 'No. Urine is a myth and doesn’t help. Fresh water is contraindicated: it changes the pressure and bursts the nematocysts that haven’t fired, worsening the sting. Rinse with seawater.' },
        { q: 'Cold or heat for a jellyfish sting?', a: 'Cold (an ice pack, never ice directly) eases the pain and is the safe option. Hot water (40-45°C) is recommended for some species, but it depends on the jellyfish; when in doubt, apply cold and ask the lifeguard.' },
        { q: 'When should you see a doctor for a jellyfish sting?', a: 'If there’s difficulty breathing, spreading swelling, dizziness or signs of allergy; if the sting is extensive or on the face/genitals; or if it affects small children, the elderly or people with health problems. In those cases, medical attention or 112.' },
      ],
    },
  },
  {
    slug: 'por-que-llegan-medusas-playa-viento',
    category: 'curiosidades',
    title: 'Por qué aparecen de golpe las medusas en la playa: el viento que las empuja a la orilla',
    excerpt:
      'Un día el agua está limpia y al siguiente, llena de medusas. No es azar: las traen el viento, las corrientes y la temperatura. Por qué proliferan y cómo anticipar el día malo antes de ir.',
    heroAlt: 'Banco de medusas Pelagia noctiluca cerca de la superficie del mar empujadas hacia la costa',
    heroQuery: 'jellyfish,bloom,sea,mediterranean',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-16T11:30:00Z',
    readingMin: 4,
    related: [
      { href: '/medusas', label: 'Riesgo de medusas por playa' },
      { href: '/playas-sin-viento', label: 'Playas resguardadas del viento' },
      { href: '/calidad-agua', label: 'Calidad del agua de baño' },
    ],
    body: [
      { t: 'p', html: 'Ayer el agua era un cristal y los niños se bañaban hasta la boya; hoy la orilla amanece sembrada de campanas translúcidas y nadie se mete más allá de las rodillas. La estampa desconcierta porque parece caprichosa, casi un castigo del mar. No lo es. Las medusas no "aparecen": llegan, empujadas por fuerzas que se pueden leer en el parte meteorológico de la noche anterior.' },
      { t: 'p', html: 'La clave para entenderlo es que la mayoría de medusas <strong>nadan muy poco</strong>: son plancton grande, a merced de las corrientes y del viento. Pasan el año mar adentro y, cuando el tiempo se alinea, una masa entera puede plantarse en la orilla en cuestión de horas. Saber qué lo provoca es saber cuándo no madrugar para nada.' },
      { t: 'h2', text: 'Por qué hay medusas (y por qué llegan a la playa)', id: 'datos' },
      { t: 'p', html: 'Hay que separar dos cosas. Una es por qué hay <strong>muchas</strong> medusas algunos años: influyen el <strong>aumento de la temperatura del mar</strong> (acelera su ciclo reproductivo), la <strong>sobrepesca de sus depredadores y competidores</strong> (atunes, tortugas, peces que comerían medusas o su mismo alimento) y años de <strong>poca lluvia</strong>, porque el agua dulce de los ríos forma una barrera de baja salinidad que las frena; sin esa barrera, se acercan más. La otra cosa es por qué llegan <strong>hoy a tu playa</strong>: ahí mandan el <strong>viento de mar a tierra (onshore)</strong> y las corrientes, que arrastran los bancos contra la costa. Por eso una playa puede estar limpia por la mañana y llena por la tarde si el viento ha rolado.' },
      { t: 'p', html: 'Ese es justo el factor que más se ignora y el que más se puede anticipar: <strong>el viento</strong>. Un día de viento soplando desde el mar hacia la orilla es el principal sospechoso de una invasión repentina; con viento de tierra hacia el mar (terral), las medusas tienden a alejarse. La temperatura del agua marca la temporada —más probables con el mar caldeado del verano—, pero el día concreto lo decide de dónde sopla.' },
      { t: 'h2', text: 'Cómo anticipar el día malo', id: 'local' },
      { t: 'p', html: 'No hace falta ser oceanógrafo. Antes de salir, <strong>mira el viento</strong>: si sopla con fuerza desde el mar hacia esa costa, sube la probabilidad de medusas en la orilla. Es exactamente el cálculo que hace nuestro <a href="/medusas">estimador de riesgo de medusas por playa</a>, que combina la dirección del viento, la zona y la temperatura del agua para darte un nivel orientativo —bajo, medio o alto— en vez de la lotería de presentarte y ver. No es una certeza (el mar no la da), pero te ahorra más de un viaje en balde.' },
      { t: 'p', html: 'Y un par de trucos de sentido común: las <strong>playas más resguardadas del viento</strong> dominante suelen sufrir menos invasiones repentinas que las expuestas de cara al mar abierto; si un día hay aviso, una <strong>cala protegida</strong> es mejor apuesta que una playa larga batida por el viento. Hazle caso a las <strong>banderas y carteles</strong> del puesto de socorro —muchos ayuntamientos avisan de la presencia de medusas— y, si las ves en el agua, no es cuestión de valentía: pican igual de cerca de la orilla. Mejor ese día, sombrilla y paseo.' },
      { t: 'quote', text: 'Las medusas no eligen tu playa al azar: las trae el viento. Mirar de dónde sopla la noche antes evita el chasco del día siguiente.' },
      { t: 'p', html: 'Porque detrás de esa orilla sembrada de campanas no hay mala suerte, sino física: agua caliente, pocos depredadores y un viento que empuja. Entender eso convierte un fastidio impredecible en algo que casi se puede esquivar mirando el parte. El mar seguirá mandando, pero al menos tú sabrás, antes de cargar el coche, si hoy toca baño o toca paseo.' },
    ],
    faq: [
      { q: '¿Por qué de repente hay muchas medusas en la playa?', a: 'Porque nadan poco y las arrastran el viento y las corrientes: un viento de mar hacia la tierra (onshore) puede empujar un banco entero contra la orilla en pocas horas. Que haya muchas ese año depende además de la temperatura del mar, la sobrepesca de sus depredadores y los años secos (sin la barrera de agua dulce de los ríos).' },
      { q: '¿Se puede saber si habrá medusas antes de ir a la playa?', a: 'No con certeza, pero sí estimarlo. El factor más anticipable es el viento: si sopla con fuerza desde el mar hacia esa costa, sube el riesgo. Nuestro estimador en /medusas combina viento, zona y temperatura del agua para darte un nivel orientativo por playa.' },
      { q: '¿Qué playas tienen menos medusas?', a: 'Las más resguardadas del viento dominante suelen sufrir menos invasiones repentinas que las expuestas al mar abierto. En un día con aviso, una cala protegida es mejor apuesta que una playa larga batida por el viento.' },
    ],
    en: {
      title: 'Why jellyfish suddenly show up at the beach: the wind that pushes them ashore',
      excerpt: 'One day the water’s clear, the next it’s full of jellyfish. It’s not random: wind, currents and temperature bring them. Why they bloom and how to anticipate the bad day before you go.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'Yesterday the water was glass and the kids swam out to the buoy; today the shore wakes up strewn with translucent bells and no one wades past their knees. The scene baffles because it seems capricious, almost a punishment from the sea. It isn’t. Jellyfish don’t "appear": they arrive, pushed by forces you can read in the previous night’s weather forecast.' },
        { t: 'p', html: 'The key is that most jellyfish <strong>barely swim</strong>: they’re large plankton, at the mercy of currents and wind. They spend the year offshore and, when the weather lines up, a whole mass can land on the shore within hours. Knowing what triggers it is knowing when not to bother getting up early.' },
        { t: 'h2', text: 'Why there are jellyfish (and why they reach the beach)', id: 'facts' },
        { t: 'p', html: 'Two things need separating. One is why there are <strong>many</strong> jellyfish some years: a factor is the <strong>rising sea temperature</strong> (it speeds their reproductive cycle), the <strong>overfishing of their predators and competitors</strong> (tuna, turtles, fish that would eat jellyfish or their food), and <strong>dry years</strong>, because river freshwater forms a low-salinity barrier that holds them off; without it, they come closer. The other is why they reach <strong>your beach today</strong>: that’s ruled by <strong>onshore wind</strong> and currents, which drag the swarms against the coast. That’s why a beach can be clear in the morning and full by afternoon if the wind has shifted.' },
        { t: 'p', html: 'That’s precisely the most ignored factor and the most predictable: <strong>the wind</strong>. A day with wind blowing from the sea towards the shore is the prime suspect for a sudden invasion; with offshore wind, jellyfish tend to move away. Water temperature sets the season — more likely with summer’s warm sea — but the specific day is decided by which way the wind blows.' },
        { t: 'h2', text: 'How to anticipate the bad day', id: 'local' },
        { t: 'p', html: 'You don’t need to be an oceanographer. Before setting off, <strong>check the wind</strong>: if it blows strongly from the sea towards that coast, the chance of jellyfish on the shore rises. That’s exactly the calculation our <a href="/medusas">per-beach jellyfish-risk estimator</a> makes, combining wind direction, the area and water temperature to give you an indicative level — low, medium or high — instead of the lottery of turning up to see. It’s not a certainty (the sea doesn’t give those), but it saves more than one wasted trip.' },
        { t: 'p', html: 'And a couple of common-sense tips: beaches <strong>more sheltered from the prevailing wind</strong> usually suffer fewer sudden invasions than exposed ones facing the open sea; on a day with a warning, a <strong>protected cove</strong> is a better bet than a long, wind-battered beach. Heed the <strong>flags and signs</strong> at the lifeguard post — many councils warn of jellyfish presence — and if you see them in the water, it’s not about bravery: they sting just as much near the shore. Better that day to take the parasol and a stroll.' },
        { t: 'quote', text: 'Jellyfish don’t pick your beach at random: the wind brings them. Checking which way it blows the night before saves the next day’s disappointment.' },
        { t: 'p', html: 'Because behind that bell-strewn shore there’s no bad luck, only physics: warm water, few predators and a pushing wind. Understanding that turns an unpredictable nuisance into something you can almost dodge by reading the forecast. The sea will still call the shots, but at least you’ll know, before loading the car, whether today is for swimming or for strolling.' },
      ],
      faq: [
        { q: 'Why are there suddenly lots of jellyfish at the beach?', a: 'Because they barely swim and are carried by wind and currents: an onshore wind can push a whole swarm against the shore within hours. Whether there are many in a given year also depends on sea temperature, overfishing of their predators, and dry years (without the freshwater barrier from rivers).' },
        { q: 'Can you tell if there will be jellyfish before going to the beach?', a: 'Not with certainty, but you can estimate it. The most predictable factor is the wind: if it blows strongly from the sea towards that coast, the risk rises. Our estimator at /medusas combines wind, area and water temperature to give an indicative per-beach level.' },
        { q: 'Which beaches have fewer jellyfish?', a: 'Those more sheltered from the prevailing wind usually suffer fewer sudden invasions than ones exposed to the open sea. On a day with a warning, a protected cove is a better bet than a long, wind-battered beach.' },
      ],
    },
  },
  // ───── Rutas en barco (voz bicéfala · embudo a alquiler) ─────
  {
    slug: 'ruta-barco-calas-menorca-fondear',
    category: 'rutas',
    title: 'Menorca en barco: calas vírgenes sin carretera y dónde fondear sin multa',
    excerpt:
      'Las mejores calas del sur de Menorca solo se ven bien desde el agua. La ruta para hacerlas en barco desde Ciutadella: qué orden seguir, el viento que la arruina y la norma de fondeo sobre posidonia que multa.',
    heroAlt: 'Barco fondeado frente a una cala virgen de Menorca, agua clara sobre fondo de arena y pinos en el acantilado',
    heroQuery: 'menorca,cala,boat,balearic',
    gygQuery: 'boat trip Menorca',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-16T09:00:00Z',
    readingMin: 5,
    related: [
      { href: '/alquiler-barco/costas/islas-baleares/provincias/baleares/menorca', label: 'Alquiler de barco en Menorca' },
      { href: '/comunidad/islas-baleares', label: 'Playas de Baleares' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
    ],
    body: [
      { t: 'p', html: 'Hay una Menorca que desde tierra apenas se intuye: la del sur, una sucesión de calas de arena clara escondidas entre barrancos y pinos a las que se llega tras caminar media hora… o en diez minutos de navegación. Desde el agua, el archipiélago cambia de cara: las paredes calcáreas se abren en herraduras blancas, el fondo se ve a varios metros y cada recodo descubre una ensenada distinta. Por eso media isla, en verano, se mueve en barco.' },
      { t: 'p', html: 'Es la forma en que los menorquines disfrutan su propia costa sin pelear por el aparcamiento ni por el último hueco de toalla. Un día de cabotaje tranquilo, saltando de cala en cala, fondeando para comer y para nadar. Pero el mar de Menorca tiene reglas —de viento y de ley— que conviene conocer antes de soltar amarras.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La ruta lógica sale de <strong>Ciutadella</strong>, al oeste, y baja por el sur: <strong>Cala Macarella y Macarelleta</strong>, <strong>Cala en Turqueta</strong>, <strong>Cala Trebalúger</strong> y <strong>Cala Galdana</strong>, todas con mejor estampa y fondeo desde el agua que desde el sendero. La pega que casi nadie cuenta: <strong>Menorca es Reserva de la Biosfera (UNESCO) y gran parte de sus fondos son praderas de posidonia protegidas</strong> (Red Natura 2000). Echar el ancla sobre la posidonia está <strong>prohibido y se multa</strong> —las sanciones pueden llegar a varios miles de euros—; hay que fondear sobre arena (las manchas claras del fondo) o usar las <strong>boyas de fondeo ecológico</strong> reguladas, que en temporada alta se agotan pronto.' },
      { t: 'p', html: 'El segundo aviso es el viento. La costa sur está resguardada de la <strong>tramontana</strong> del norte, por eso es la buena para este plan; pero con viento de sur (<strong>migjorn</strong>) las calas del sur se pican y se enturbian, y entonces lo sensato es darle la vuelta a la isla y navegar el norte. Mira el parte la noche antes: en Menorca, el día de barco lo decide de qué cuadrante sopla.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Tres reglas hacen el día redondo. Una: <strong>sal temprano</strong>. A media mañana las calas del sur se llenan de barcos y la foto de ensenada solitaria se evapora; antes de las 10h las tienes casi para ti. Dos: <strong>lleva la app de fondeo</strong> y localiza las boyas o las zonas de arena antes de llegar, para no dar vueltas buscando dónde anclar legalmente. Tres: <strong>si no tienes título, alquila con patrón</strong>; la costa es fácil pero los fondeos sobre arena, las corrientes en los cabos y el tráfico de verano se llevan mejor con alguien que conoce la isla.' },
      { t: 'p', html: 'Y un truco de itinerario: encadena la <strong>Turqueta</strong> a primera hora (la más fotogénica con luz de mañana), come fondeado en <strong>Trebalúger</strong> (más recogida y con menos gente) y deja <strong>Macarelleta</strong> para el final de la tarde, cuando el bus de mediodía ya se ha llevado a la multitud que llega por tierra. Si el migjorn aprieta, cambia el plan al norte: <strong>Cala Pregonda</strong> y <strong>Cavalleria</strong>, de arena rojiza, son otra Menorca.' },
      { t: 'quote', text: 'En Menorca el barco no es un lujo: es la única forma de tener una cala para ti un rato. Pero el ancla se echa sobre arena, nunca sobre la posidonia.' },
      { t: 'p', html: 'Porque navegar Menorca no va de velocidad ni de millas, sino de paladear una costa que en coche se ve a medias y a empujones. Respeta el viento, fondea donde debes y madruga un poco, y tendrás el sur de la isla abriéndose cala a cala, con el motor al ralentí y el fondo de arena pasando bajo el casco. Hazlo a lo loco en agosto a mediodía, y entenderás por qué los que saben zarpan al amanecer.' },
    ],
    faq: [
      { q: '¿Se puede fondear en cualquier cala de Menorca?', a: 'No sobre las praderas de posidonia, que están protegidas (Red Natura 2000) y cuyo fondeo está prohibido y multado, con sanciones que pueden alcanzar varios miles de euros. Hay que anclar sobre arena (las manchas claras del fondo) o usar las boyas de fondeo ecológico reguladas, limitadas en temporada alta.' },
      { q: '¿Qué calas de Menorca merecen más ir en barco?', a: 'Las del sur entre Ciutadella y Cala Galdana: Macarella y Macarelleta, Cala en Turqueta y Cala Trebalúger, mejor accesibles y más bonitas desde el agua. Con viento del sur (migjorn) conviene navegar el norte (Pregonda, Cavalleria).' },
      { q: '¿Necesito título para alquilar el barco?', a: 'Depende de la potencia y eslora; muchas embarcaciones pequeñas se pueden llevar sin titulación, pero si no navegas habitualmente lo más cómodo y seguro en Menorca es alquilar con patrón, por los fondeos sobre arena y el tráfico de verano.' },
    ],
    en: {
      title: 'Menorca by boat: wild coves the road can’t reach, and where to anchor without a fine',
      excerpt: 'Menorca’s best southern coves only look their best from the water. The boat route from Ciutadella: the order to follow, the wind that ruins it, and the seagrass anchoring rule that fines you.',
      related: [
        { href: '/en/boat-rental/coasts/islas-baleares/provinces/baleares/menorca', label: 'Boat rental in Menorca' },
        { href: '/en/islands', label: 'Beaches by island' },
      ],
      body: [
        { t: 'p', html: 'There’s a Menorca you barely sense from land: the south, a string of pale-sand coves hidden among ravines and pines, reached after a half-hour walk… or ten minutes of sailing. From the water the island changes face: the limestone walls open into white horseshoes, the bottom is visible several metres down, and every bend reveals a different inlet. Which is why half the island, in summer, moves by boat.' },
        { t: 'p', html: 'It’s how Menorcans enjoy their own coast without fighting for parking or the last patch of towel space. A day of easy coastal hopping, cove to cove, anchoring to eat and swim. But Menorca’s sea has rules — of wind and of law — worth knowing before you cast off.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The logical route leaves <strong>Ciutadella</strong> in the west and runs south: <strong>Cala Macarella and Macarelleta</strong>, <strong>Cala en Turqueta</strong>, <strong>Cala Trebalúger</strong> and <strong>Cala Galdana</strong>, all better seen and anchored from the water than from the path. The catch almost nobody mentions: <strong>Menorca is a UNESCO Biosphere Reserve and much of its seabed is protected Posidonia seagrass</strong> (Natura 2000). Dropping anchor on the seagrass is <strong>banned and fined</strong> — penalties can run to several thousand euros — so you must anchor on sand (the pale patches on the bottom) or use the regulated <strong>eco-mooring buoys</strong>, which sell out early in high season.' },
        { t: 'p', html: 'The second warning is the wind. The south coast is sheltered from the northerly <strong>tramontana</strong>, which is why it’s the one for this plan; but with a southerly (<strong>migjorn</strong>) the southern coves chop up and cloud over, and the sensible move is to round the island and sail the north. Check the forecast the night before: in Menorca, the boat day is decided by which quarter the wind blows from.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'Three rules make the day: One, <strong>leave early</strong> — by mid-morning the southern coves fill with boats and the empty-inlet picture vanishes; before 10am you’ll have them almost to yourself. Two, <strong>carry the mooring app</strong> and locate the buoys or sand zones before you arrive, so you’re not circling looking for a legal spot. Three, <strong>if you’re not qualified, charter with a skipper</strong>; the coast is easy but sand anchoring, headland currents and summer traffic are handled better by someone who knows the island.' },
        { t: 'p', html: 'And an itinerary trick: take <strong>Turqueta</strong> first thing (most photogenic in morning light), lunch at anchor in <strong>Trebalúger</strong> (more tucked away, fewer people) and save <strong>Macarelleta</strong> for late afternoon, once the midday bus has carried off the land crowd. If the migjorn picks up, switch north: <strong>Cala Pregonda</strong> and <strong>Cavalleria</strong>, with reddish sand, are another Menorca.' },
        { t: 'quote', text: 'In Menorca a boat isn’t a luxury: it’s the only way to have a cove to yourself for a while. But you drop anchor on sand, never on the seagrass.' },
        { t: 'p', html: 'Because sailing Menorca isn’t about speed or miles, but about savouring a coast that by car you only half-see, in a crush. Respect the wind, anchor where you should and set off a little early, and the island’s south will open cove by cove, engine idling, the sandy bottom sliding under the hull. Do it on a whim at midday in August, and you’ll understand why those in the know weigh anchor at dawn.' },
      ],
      faq: [
        { q: 'Can you anchor in any cove in Menorca?', a: 'Not over the Posidonia seagrass meadows, which are protected (Natura 2000) and where anchoring is banned and fined — penalties can reach several thousand euros. You must anchor on sand (the pale patches on the bottom) or use the regulated eco-mooring buoys, which are limited in high season.' },
        { q: 'Which Menorca coves are most worth reaching by boat?', a: 'The southern ones between Ciutadella and Cala Galdana: Macarella and Macarelleta, Cala en Turqueta and Cala Trebalúger, more accessible and more beautiful from the water. With a southerly (migjorn) it’s better to sail the north (Pregonda, Cavalleria).' },
        { q: 'Do I need a licence to rent the boat?', a: 'It depends on power and length; many small boats can be operated without a licence, but if you don’t sail regularly the most comfortable and safe option in Menorca is to charter with a skipper, given the sand anchoring and summer traffic.' },
      ],
    },
  },
  {
    slug: 'fondear-formentera-barco-ibiza',
    category: 'rutas',
    title: 'Formentera en barco desde Ibiza: las calas para fondear y la norma de la posidonia que multa',
    excerpt:
      'El plan que hace medio Ibiza en verano: cruzar a Formentera en barco a por sus calas de arena blanca. Cómo es la travesía, dónde fondear y la regulación de la posidonia que puede costarte miles de euros.',
    heroAlt: 'Barcos fondeados sobre agua clara frente a la playa de Ses Illetes en Formentera, con la arena blanca al fondo',
    heroQuery: 'formentera,beach,boat,balearic',
    gygQuery: 'boat trip Formentera',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-16T09:30:00Z',
    readingMin: 5,
    related: [
      { href: '/alquiler-barco/costas/islas-baleares/provincias/baleares/formentera', label: 'Alquiler de barco en Formentera' },
      { href: '/alquiler-barco/costas/islas-baleares/provincias/baleares/ibiza', label: 'Alquiler de barco en Ibiza' },
      { href: '/islas', label: 'Playas por isla en España' },
    ],
    body: [
      { t: 'p', html: 'Desde la cubierta, al salir de Ibiza rumbo al sur, Formentera aparece como una línea baja y luminosa sobre un agua que va aclarándose hasta volverse casi blanca. Una hora escasa de travesía y se entiende el mito: arena finísima, fondos de arena clara que tiñen el mar de un verde imposible y, en medio del canal, el islote de <strong>S’Espalmador</strong> con su laguna. No es casualidad que en verano el canal entre las dos islas se llene de barcos: cruzar a Formentera por mar es, para muchos, el mejor día de las Pitiusas.' },
      { t: 'p', html: 'El plan clásico sale de un puerto de Ibiza —Sant Antoni, Ibiza ciudad o Santa Eulària— y fondea frente a <strong>Ses Illetes</strong> o <strong>Llevant</strong>, las playas del norte de Formentera, dentro del Parque Natural de Ses Salines. Suena idílico, y lo es. Pero ese mismo paraíso tiene una letra pequeña que cada verano cuesta cara a quien no la lee.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La travesía Ibiza–Formentera son unas <strong>10-12 millas</strong> según el puerto de salida: corta, pero a mar abierto, con el canal expuesto al viento; con <strong>levante o poniente fuertes</strong> se forma marejada y la cruzada se hace incómoda. La clave del día es el fondeo, y aquí está el aviso que muchos descubren con la multa en la mano: las aguas de Formentera son <strong>pradera de posidonia, hábitat protegido por la UNESCO y la Red Natura 2000</strong>. Fondear sobre la posidonia está <strong>prohibido y muy vigilado en verano</strong>, con <strong>sanciones que pueden alcanzar varios miles de euros</strong>; hay que anclar sobre las manchas de arena o reservar una de las <strong>boyas de fondeo reguladas</strong> mediante la app oficial, limitadas y muy demandadas en agosto.' },
      { t: 'p', html: 'El segundo factor es la masificación. Ses Illetes es de las playas más bellas del Mediterráneo y en julio y agosto el fondeadero se convierte en un aparcamiento de barcos; el agua sigue siendo espectacular, pero la sensación de calma desaparece. Y en tierra, Formentera <strong>regula el acceso de vehículos en temporada alta</strong> con cupos —razón de más para llegar por mar y no en coche.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla de oro es <strong>reservar la boya o tener clara la zona de arena antes de zarpar</strong>, y salir <strong>pronto</strong>: a media mañana el fondeo de Ses Illetes está lleno y patrullado. Mira el parte —con canal picado, el cruce deja de ser un placer— y, si no tienes título o experiencia en mar abierto, <strong>alquila con patrón</strong>: el canal, las corrientes y la maniobra de fondeo legal sobre arena se llevan mucho mejor con alguien que lo hace cada día.' },
      { t: 'p', html: 'Trucos que cambian el día: madruga y fondea primero en <strong>S’Espalmador</strong>, el islote a medio camino, que a primera hora suele estar tranquilo, y deja Ses Illetes para cuando ya estés aclimatado. Lleva <strong>todo de tierra</strong> —agua, comida, sombra— porque los chiringuitos de Formentera son caros y el plan es de barco, no de restaurante. Y respeta las balizas: las zonas de baño y los canales de entrada están señalizados por seguridad de los nadadores. ¿La alternativa con menos gentío? Las calas del sur y del este de Formentera, menos fotografiadas pero igual de limpias.' },
      { t: 'quote', text: 'A Formentera se va por mar para huir de las colas… y se vuelve con multa si echas el ancla donde no debes. El paraíso también tiene reglas.' },
      { t: 'p', html: 'Porque cruzar a Formentera en barco es uno de esos planes que justifican el viaje a Ibiza entero: el agua aclarándose milla a milla, el ancla mordiendo la arena blanca, el baño en un mar que parece iluminado por debajo. Hazlo con la boya reservada, el parte mirado y madrugando, y tendrás el mejor día de las Pitiusas. Hazlo improvisando en pleno agosto, y lo recordarás por la cola de barcos y por la sanción del patrullero.' },
    ],
    faq: [
      { q: '¿Cuánto se tarda en barco de Ibiza a Formentera?', a: 'Entre 10 y 12 millas náuticas según el puerto de salida (Sant Antoni, Ibiza ciudad o Santa Eulària): aproximadamente una hora en una embarcación de recreo. Es mar abierto: con levante o poniente fuertes el canal se pica y la travesía se hace incómoda.' },
      { q: '¿Dónde se puede fondear en Formentera?', a: 'Solo sobre fondos de arena o en las boyas de fondeo reguladas (reservables por app), nunca sobre la posidonia, que es hábitat protegido (UNESCO / Red Natura 2000). El fondeo sobre posidonia está prohibido y muy vigilado, con multas que pueden alcanzar varios miles de euros.' },
      { q: '¿Mejor ir a Formentera en barco o en ferry?', a: 'En barco propio o de alquiler tienes libertad para fondear frente a Ses Illetes, S’Espalmador y las calas, y evitas el cupo de vehículos que regula la isla en verano. El ferry es más barato y rápido si solo quieres pisar tierra, pero te ata a una playa concreta.' },
    ],
    en: {
      title: 'Formentera by boat from Ibiza: the coves to anchor in and the seagrass rule that fines you',
      excerpt: 'The plan half of Ibiza does in summer: crossing to Formentera by boat for its white-sand coves. What the crossing is like, where to anchor, and the Posidonia rule that can cost you thousands.',
      related: [
        { href: '/en/boat-rental/coasts/islas-baleares/provinces/baleares/formentera', label: 'Boat rental in Formentera' },
        { href: '/en/islands', label: 'Beaches by island' },
      ],
      body: [
        { t: 'p', html: 'From the deck, leaving Ibiza southbound, Formentera appears as a low, luminous line over water that pales mile by mile until it’s almost white. A crossing of barely an hour and you understand the myth: ultra-fine sand, pale sandy bottoms that turn the sea an impossible green and, mid-channel, the islet of <strong>S’Espalmador</strong> with its lagoon. No surprise that in summer the channel between the two islands fills with boats: crossing to Formentera by sea is, for many, the best day in the Pityusic Islands.' },
        { t: 'p', html: 'The classic plan leaves an Ibiza port — Sant Antoni, Ibiza town or Santa Eulària — and anchors off <strong>Ses Illetes</strong> or <strong>Llevant</strong>, the northern beaches of Formentera, inside the Ses Salines Natural Park. It sounds idyllic, and it is. But that same paradise has small print that costs the unwary dearly every summer.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The Ibiza–Formentera crossing is about <strong>10-12 nautical miles</strong> depending on the departure port: short, but open sea, the channel exposed to wind; with a strong easterly or westerly a swell builds and the crossing turns uncomfortable. The key to the day is the anchoring, and here’s the warning many discover with the fine in hand: Formentera’s waters are <strong>Posidonia seagrass meadow, a habitat protected by UNESCO and Natura 2000</strong>. Anchoring on the seagrass is <strong>banned and heavily policed in summer</strong>, with <strong>penalties that can reach several thousand euros</strong>; you must anchor on the sand patches or book one of the <strong>regulated mooring buoys</strong> via the official app, limited and in high demand in August.' },
        { t: 'p', html: 'The second factor is crowding. Ses Illetes is among the most beautiful beaches in the Mediterranean, and in July and August the anchorage becomes a boat car park; the water is still spectacular, but the calm is gone. And on land, Formentera <strong>caps vehicle access in high season</strong> — all the more reason to arrive by sea, not by car.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The golden rule is to <strong>book the buoy or know your sand zone before you cast off</strong>, and leave <strong>early</strong>: by mid-morning the Ses Illetes anchorage is full and patrolled. Check the forecast — with a choppy channel the crossing stops being a pleasure — and if you’re not qualified or experienced in open water, <strong>charter with a skipper</strong>: the channel, the currents and the legal sand-anchoring manoeuvre are far easier with someone who does it daily.' },
        { t: 'p', html: 'Day-changing tricks: rise early and anchor first at <strong>S’Espalmador</strong>, the islet halfway across, usually calm first thing, and save Ses Illetes for once you’re settled in. Bring <strong>everything from the mainland</strong> — water, food, shade — as Formentera’s beach bars are pricey and this is a boat day, not a restaurant one. And respect the buoys: swim zones and entry channels are marked for swimmers’ safety. The less-crowded alternative? Formentera’s south and east coves, less photographed but just as clean.' },
        { t: 'quote', text: 'You go to Formentera by sea to escape the queues… and come back with a fine if you drop anchor where you shouldn’t. Paradise has rules too.' },
        { t: 'p', html: 'Because crossing to Formentera by boat is one of those plans that justify the whole trip to Ibiza: the water paling mile by mile, the anchor biting white sand, the swim in a sea that seems lit from below. Do it with the buoy booked, the forecast checked and an early start, and you’ll have the best day in the Pityusics. Do it on a whim in peak August, and you’ll remember it for the queue of boats and the patrol boat’s fine.' },
      ],
      faq: [
        { q: 'How long is the boat trip from Ibiza to Formentera?', a: 'Between 10 and 12 nautical miles depending on the departure port (Sant Antoni, Ibiza town or Santa Eulària): roughly an hour in a leisure boat. It’s open sea: with a strong easterly or westerly the channel chops up and the crossing gets uncomfortable.' },
        { q: 'Where can you anchor in Formentera?', a: 'Only on sandy bottoms or at the regulated mooring buoys (bookable by app), never on the Posidonia, which is a protected habitat (UNESCO / Natura 2000). Anchoring on the seagrass is banned and heavily policed, with fines that can reach several thousand euros.' },
        { q: 'Is it better to go to Formentera by boat or ferry?', a: 'With your own or a rented boat you’re free to anchor off Ses Illetes, S’Espalmador and the coves, and you avoid the vehicle cap the island enforces in summer. The ferry is cheaper and faster if you just want to set foot on land, but it ties you to one specific beach.' },
      ],
    },
  },
  // ───── Diario de playas (voz bicéfala) ─────
  {
    slug: 'playa-benijo-tenerife-arena-negra-corrientes',
    category: 'curiosidades',
    title: 'Playa de Benijo (Tenerife): arena negra y roques famosos, pero el baño es para valientes',
    excerpt:
      'El final salvaje de Anaga: arena volcánica negra y dos roques en el agua. Lo que necesitas saber antes de ir: corrientes fuertes, sin socorrista y la marea decide cuánta playa hay.',
    heroAlt: 'Playa de Benijo en Tenerife, arena negra volcánica con los roques recortados sobre el Atlántico al atardecer',
    heroQuery: 'benijo,tenerife,beach,volcanic',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-13T08:00:00Z',
    readingMin: 4,
    related: [
      { href: '/comunidad/canarias', label: 'Playas de Canarias' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/atardeceres', label: 'Playas para ver el atardecer' },
    ],
    body: [
      { t: 'p', html: 'La carretera que baja al macizo de Anaga se acaba, literalmente, en Benijo. Después solo hay monte, mar y un puñado de casas con chiringuitos donde se come pescado mirando al Atlántico. Abajo, la playa: arena de un negro mineral, brillante, y dos roques —el Roque de Tierra y el de Fuera— clavados en el agua como el final de una frase. Cuando el sol cae detrás de ellos, se entiende por qué medio Instagram de Tenerife pasa por aquí.' },
      { t: 'p', html: 'Es el extremo más indómito de la isla, dentro del <strong>Parque Rural de Anaga, Reserva de la Biosfera por la UNESCO</strong>. Un laurisilva que sobrevivió a las glaciaciones cae casi hasta la orilla. No es una playa de sombrilla y hamaca: es naturaleza en bruto a la que vienes a mirar tanto como a bañarte.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La postal es cierta; lo que el reel recorta es el mar. Benijo da al <strong>Atlántico norte abierto</strong>: oleaje, resaca y <strong>corrientes fuertes</strong> casi todo el año, <strong>sin servicio de socorrismo</strong>. No es una piscina; es una playa donde el baño hay que ganárselo y donde, con mar de fondo, lo prudente es no entrar. La arena negra, además, <strong>quema mucho más que la clara</strong> bajo el sol canario: chanclas obligatorias.' },
      { t: 'p', html: 'El segundo factor es la <strong>marea</strong>, y cambia el plan entero: con la marea alta la playa se reduce muchísimo y las olas llegan hasta el pie del monte; con la marea baja aparece la arena ancha y se puede caminar hasta los roques. Servicios, los justos: un par de restaurantes buenos arriba, y un <strong>aparcamiento pequeño</strong> al final de una carretera estrecha y revirada que en fin de semana se colapsa. Sombra natural, ninguna.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla de oro es doble: <strong>consulta la tabla de mareas</strong> (Santa Cruz de Tenerife sirve de referencia) y ve con <strong>marea baja o bajando</strong>, y mira el <strong>parte de oleaje</strong> antes de salir; un día de mar de fondo conviértelo en mirador, no en baño. La luz manda: a media tarde, con el sol cayendo sobre los roques, es cuando Benijo da su mejor versión —y cuando más gente hay, así que o llegas pronto o asumes el gentío del atardecer.' },
      { t: 'p', html: 'Lo demás es logística de sitio salvaje: <strong>llega temprano</strong> para aparcar (o sube en guagua y baja a pie), <strong>lleva agua, comida y calzado</strong> que aguante roca y arena caliente, y devuelve tu basura porque es Reserva de la Biosfera. Y reserva una hora para lo que de verdad paga el viaje: subir un tramo del sendero de Anaga y ver la playa entera desde arriba. Si buscas baño tranquilo y largo, la vecina <strong>Almáciga</strong> suele estar algo menos brava.' },
      { t: 'quote', text: 'No vienes a Benijo a bañarte: vienes a ver el Atlántico estrellarse contra dos rocas negras. Si además te puedes meter, es un extra, no el plan.' },
      { t: 'p', html: 'Porque Benijo no se mide en comodidades sino en carácter: el de una playa donde la isla se asoma al océano sin red. Acierta con la marea, respeta el oleaje y llega con tiempo, y te llevarás uno de los atardeceres más rotundos de Canarias. Confúndete y subestima el mar, y entenderás por qué aquí los roques llevan siglos aguantando lo que tú no deberías.' },
    ],
    faq: [
      { q: '¿Se puede uno bañar en la playa de Benijo?', a: 'Con precaución y solo con mar en calma. Es Atlántico norte abierto, con oleaje, resaca y corrientes fuertes gran parte del año, y no tiene socorrista. Con mar de fondo es mejor no entrar: disfrútala como mirador.' },
      { q: '¿Cómo afecta la marea a Benijo?', a: 'Mucho. Con marea alta la playa se reduce al mínimo y las olas llegan hasta el monte; con marea baja aparece la arena ancha y puedes caminar hacia los roques. Mira la tabla de mareas y ve con marea baja o bajando.' },
      { q: '¿Tiene servicios y aparcamiento?', a: 'Pocos: un par de restaurantes arriba y un aparcamiento pequeño al final de una carretera estrecha que se llena en fin de semana. No hay sombra ni socorrismo. Lleva agua, comida, calzado y chanclas (la arena negra quema).' },
    ],
    en: {
      title: 'Playa de Benijo (Tenerife): black sand and famous sea stacks, but the swim is for the brave',
      excerpt: 'The wild end of Anaga: black volcanic sand and two sea stacks. What to know before you go: strong currents, no lifeguard, and the tide decides how much beach there is.',
      related: [
        { href: '/en/islands', label: 'Beaches by island' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'The road down through the Anaga massif ends, quite literally, at Benijo. Beyond it there’s only mountain, sea and a handful of houses with restaurants where you eat fish facing the Atlantic. Below lies the beach: mineral-black sand, glinting, and two stacks — Roque de Tierra and Roque de Fuera — driven into the water like a full stop. When the sun drops behind them you understand why half of Tenerife’s Instagram passes through here.' },
        { t: 'p', html: 'This is the island’s most untamed edge, inside the <strong>Anaga Rural Park, a UNESCO Biosphere Reserve</strong>. A laurel forest that outlived the ice ages tumbles almost to the shore. This is no parasol-and-sunbed beach: it’s raw nature you come to watch as much as to swim in.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The postcard is true; what the reel crops out is the sea. Benijo faces the <strong>open northern Atlantic</strong>: swell, undertow and <strong>strong currents</strong> for much of the year, with <strong>no lifeguard service</strong>. It’s not a pool; it’s a beach where a swim must be earned, and where, with any groundswell, the sensible move is to stay out. The black sand also <strong>gets far hotter than pale sand</strong> under the Canary sun: flip-flops essential.' },
        { t: 'p', html: 'The second factor is the <strong>tide</strong>, and it changes the whole plan: at high tide the beach shrinks dramatically and the waves reach the foot of the mountain; at low tide the wide sand appears and you can walk out towards the stacks. Services are minimal: a couple of good restaurants up top and a <strong>small car park</strong> at the end of a narrow, twisting road that jams at weekends. Natural shade: none.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The golden rule is twofold: <strong>check the tide table</strong> (Santa Cruz de Tenerife is the reference) and go at <strong>low tide or on the ebb</strong>, and check the <strong>swell forecast</strong> before setting off; turn a groundswell day into a viewpoint, not a swim. The light rules: mid-to-late afternoon, with the sun falling over the stacks, is Benijo at its best — and busiest, so either arrive early or accept the sunset crowd.' },
        { t: 'p', html: 'The rest is wild-place logistics: <strong>arrive early</strong> to park (or take the bus and walk down), <strong>bring water, food and footwear</strong> that copes with rock and hot sand, and carry your rubbish out — it’s a Biosphere Reserve. And set aside an hour for what really pays for the trip: climbing a stretch of the Anaga path to see the whole beach from above. If you want a calm, long swim, neighbouring <strong>Almáciga</strong> tends to be a touch less fierce.' },
        { t: 'quote', text: 'You don’t come to Benijo to swim: you come to watch the Atlantic smash into two black rocks. Getting in is a bonus, not the plan.' },
        { t: 'p', html: 'Because Benijo isn’t measured in comforts but in character: a beach where the island leans out over the ocean without a safety net. Get the tide right, respect the swell and arrive in good time, and you’ll take home one of the most emphatic sunsets in the Canaries. Get it wrong and underestimate the sea, and you’ll understand why those stacks have endured for centuries what you shouldn’t.' },
      ],
      faq: [
        { q: 'Can you swim at Playa de Benijo?', a: 'Only with caution and a calm sea. It’s the open northern Atlantic, with swell, undertow and strong currents much of the year, and there’s no lifeguard. With any groundswell it’s better not to enter: enjoy it as a viewpoint.' },
        { q: 'How does the tide affect Benijo?', a: 'A lot. At high tide the beach shrinks to almost nothing and the waves reach the mountain; at low tide the wide sand appears and you can walk towards the stacks. Check the tide table and go at low tide or on the ebb.' },
        { q: 'Are there services and parking?', a: 'Few: a couple of restaurants up top and a small car park at the end of a narrow road that fills at weekends. No shade, no lifeguard. Bring water, food, footwear and flip-flops (the black sand burns).' },
      ],
    },
  },
  {
    slug: 'cala-macarelleta-menorca-acceso-verano',
    category: 'guias',
    title: 'Cala Macarelleta (Menorca): en agosto no puedes llegar en coche a la cala de las fotos',
    excerpt:
      'Arena fina y agua de un verde imposible en el sur de Menorca. La letra pequeña: en verano el coche está prohibido, no hay servicios y a mediodía está a rebosar. Cómo y cuándo ir.',
    heroAlt: 'Cala Macarelleta en Menorca, pequeña ensenada de arena blanca y agua verde turquesa entre pinos y acantilados',
    heroQuery: 'macarelleta,menorca,cove,balearic',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-13T08:30:00Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/islas-baleares', label: 'Playas de Baleares' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
      { href: '/alquiler-barco/costas/islas-baleares/provincias/baleares/menorca', label: 'Alquiler de barco en Menorca' },
    ],
    body: [
      { t: 'p', html: 'Se baja por un sendero entre pinos, con el aroma a resina y el rumor del mar acercándose, hasta que el bosque se abre sobre una concha pequeña y perfecta: arena blanca y finísima, paredes de roca clara y un agua que pasa del transparente al verde según la hondura, como si alguien hubiera regulado el color. Es la hermana pequeña de Cala Macarella, y mucha gente la prefiere: más recogida, más íntima, más de quedarse callado un rato.' },
      { t: 'p', html: 'Forma parte del tramo virgen del sur de Menorca enhebrado por el <strong>Camí de Cavalls</strong>, el sendero histórico que rodea toda la isla. Llegar andando desde Macarella, por el acantilado, es parte del plan: diez minutos que valen por la mejor vista de la cala, desde arriba, antes de pisarla.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Hasta aquí, el folleto acierta. La letra pequeña es el acceso. En <strong>temporada alta (en torno a junio–septiembre) el acceso en coche está restringido</strong>: el aparcamiento cercano se cierra al turismo y hay que llegar en <strong>bus lanzadera</strong> desde Ciutadella o caminando por el Camí de Cavalls. Si subes en coche pensando aparcar al lado, no entras. Súmale que es <strong>diminuta</strong>: se llena tempranísimo y a mediodía en agosto la sensación de cala virgen desaparece bajo las toallas.' },
      { t: 'p', html: 'Y el aviso que más sorprende: <strong>no hay apenas servicios</strong>. A diferencia de Macarella, que tiene chiringuito, en Macarelleta no cuentes con bar ni con sombra más allá de los pinos del borde; <strong>lleva agua y comida</strong>. El agua, eso sí, tiene calidad <strong>clasificada como "excelente" por la Agencia Europea de Medio Ambiente</strong> y suele estar en calma —es la costa sur, resguardada de la <strong>tramontana</strong> del norte—, aunque con viento del sur (migjorn) puede entrar marejada.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La clave es <strong>cuándo</strong>. En <strong>mayo, junio y septiembre</strong> el agua ya acompaña, la luz es mejor y la cala respira; julio y agosto son para madrugar. La regla de oro en verano: <strong>llega a primera hora de la mañana</strong> (antes de las 10h) o a última de la tarde, cuando el bus de mediodía ya se ha llevado a la marea de gente. Y revisa el viento: con migjorn fuerte, el agua se enturbia y pierde ese verde; cámbiala por una cala de la costa norte.' },
      { t: 'p', html: 'Lo demás es planificar el acceso, que es lo que deja a mucha gente fuera: en temporada, <strong>bus lanzadera desde Ciutadella</strong> o caminata por el Camí de Cavalls desde Macarella (donde sí hay aparcamiento de pago y chiringuito). Lleva calzado para el sendero, agua de sobra y tu basura de vuelta. ¿La versión redonda? Llegar <strong>en barco</strong> y fondear frente a la cala: es como muchos menorquines la disfrutan sin pelearse con el aparcamiento, y la estampa desde el agua no tiene precio.' },
      { t: 'quote', text: 'Macarelleta no es una cala a la que se llega: es una a la que se planifica llegar. El que aparece a mediodía de agosto en coche se queda mirándola desde el mapa.' },
      { t: 'p', html: 'Porque esta cala no premia la improvisación, sino la cabeza: el bus correcto, la hora temprana, el viento mirado la noche antes. Hazlo bien y tendrás una de las postales más repetidas del Mediterráneo casi para ti, con el verde encendido y los pinos asomados. Hazlo a lo loco en pleno agosto y entenderás por qué los que la conocen vienen en mayo… o en barco.' },
    ],
    faq: [
      { q: '¿Se puede ir en coche a Cala Macarelleta?', a: 'En temporada alta (aproximadamente junio–septiembre) el acceso en coche está restringido y el aparcamiento se cierra al turismo: hay que llegar en bus lanzadera desde Ciutadella o caminando por el Camí de Cavalls desde Macarella. Fuera de temporada el acceso es más fácil.' },
      { q: '¿Tiene chiringuito o servicios?', a: 'Casi ninguno. A diferencia de Macarella, Macarelleta no tiene chiringuito ni apenas sombra más allá de los pinos. Lleva agua, comida y devuelve tu basura. El agua tiene calidad "excelente" según la EEA.' },
      { q: '¿Cuándo es mejor ir?', a: 'Mayo, junio y septiembre dan el mejor equilibrio de agua cálida y poca gente. En julio y agosto, llega antes de las 10h o a última hora de la tarde. Con viento del sur (migjorn) el agua se enturbia; entonces mejor una cala del norte.' },
    ],
    en: {
      title: 'Cala Macarelleta (Menorca): in August you can’t reach the postcard cove by car',
      excerpt: 'Fine sand and impossibly green water in southern Menorca. The small print: in summer cars are banned, there are no services and by midday it’s packed. How and when to go.',
      related: [
        { href: '/en/islands', label: 'Beaches by island' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'You walk down a path through the pines, the scent of resin and the sound of the sea growing closer, until the wood opens onto a small, perfect shell: white, ultra-fine sand, pale rock walls and water that shifts from clear to green with the depth, as if someone had dialled in the colour. It’s the little sister of Cala Macarella, and many people prefer it: more tucked away, more intimate, more the kind of place where you fall quiet for a while.' },
        { t: 'p', html: 'It’s part of the unspoilt stretch of southern Menorca threaded by the <strong>Camí de Cavalls</strong>, the historic path that rings the whole island. Walking in from Macarella along the cliff is part of the plan: ten minutes that reward you with the best view of the cove, from above, before you set foot on it.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'So far the brochure is right. The small print is access. In <strong>high season (roughly June–September) car access is restricted</strong>: the nearby car park closes to tourists and you arrive by <strong>shuttle bus</strong> from Ciutadella or on foot along the Camí de Cavalls. Drive up expecting to park beside it and you won’t get in. Add that it’s <strong>tiny</strong>: it fills very early, and by midday in August the unspoilt-cove feeling vanishes under the towels.' },
        { t: 'p', html: 'And the warning that most surprises people: <strong>there are barely any services</strong>. Unlike Macarella, which has a beach bar, at Macarelleta don’t count on a bar or any shade beyond the pines at the edge; <strong>bring water and food</strong>. The water, though, is rated <strong>"excellent" by the European Environment Agency</strong> and is usually calm — this is the south coast, sheltered from the northerly <strong>tramontana</strong> — though a southerly wind (migjorn) can bring in a swell.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The key is <strong>when</strong>. In <strong>May, June and September</strong> the water is warm enough, the light is better and the cove can breathe; July and August are for early birds. The golden rule in summer: <strong>arrive first thing</strong> (before 10am) or late afternoon, once the midday bus has carried off the crowd. And check the wind: in a strong migjorn the water clouds and loses that green — swap it for a north-coast cove.' },
        { t: 'p', html: 'The rest is planning the access, which is what leaves many people out: in season, <strong>shuttle bus from Ciutadella</strong> or a walk along the Camí de Cavalls from Macarella (which does have a paid car park and a beach bar). Bring footwear for the path, plenty of water and carry your rubbish out. The ideal version? Arrive <strong>by boat</strong> and anchor off the cove: it’s how many Menorcans enjoy it without fighting for parking, and the view from the water is priceless.' },
        { t: 'quote', text: 'Macarelleta isn’t a cove you reach: it’s one you plan to reach. Turn up by car at midday in August and you’ll be looking at it on the map.' },
        { t: 'p', html: 'Because this cove doesn’t reward improvisation but planning: the right bus, the early hour, the wind checked the night before. Do it well and you’ll have one of the Mediterranean’s most photographed scenes almost to yourself, the green ablaze and the pines leaning in. Do it on a whim in peak August and you’ll understand why those who know it come in May… or by boat.' },
      ],
      faq: [
        { q: 'Can you drive to Cala Macarelleta?', a: 'In high season (roughly June–September) car access is restricted and the car park closes to tourists: you arrive by shuttle bus from Ciutadella or on foot along the Camí de Cavalls from Macarella. Off-season, access is easier.' },
        { q: 'Is there a beach bar or services?', a: 'Almost none. Unlike Macarella, Macarelleta has no beach bar and little shade beyond the pines. Bring water and food and take your rubbish out. The water is rated "excellent" by the EEA.' },
        { q: 'When is the best time to go?', a: 'May, June and September offer the best balance of warm water and few people. In July and August, arrive before 10am or late afternoon. In a southerly (migjorn) the water clouds — then pick a north-coast cove.' },
      ],
    },
  },
  {
    slug: 'playa-gulpiyuri-asturias-marea',
    category: 'curiosidades',
    title: 'Playa de Gulpiyuri, Asturias: la playa sin mar a la que la marea decide si puedes bañarte',
    excerpt:
      'Una concha de arena a 100 metros tierra adentro, sin horizonte y declarada Monumento Natural. Lo que de verdad necesitas saber de Gulpiyuri: depende de la marea, no tiene servicios y cabe muy poca gente.',
    heroAlt: 'Pequeña playa interior de Gulpiyuri rodeada de prados verdes, con agua de mar entrando entre las rocas',
    heroQuery: 'gulpiyuri,asturias,beach,cove',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-07T08:18:37Z',
    readingMin: 4,
    related: [
      { href: '/comunidad/asturias', label: 'Playas de Asturias' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
    ],
    body: [
      { t: 'p', html: 'No se ve desde la carretera, ni desde el aparcamiento, ni siquiera cuando ya estás caminando por el prado. Se anda un sendero entre vacas y maíz, con el rumor del Cantábrico a la espalda, hasta que el suelo se abre de golpe: una media luna de arena fina escondida entre paredes de roca, con olas pequeñas rompiendo en la orilla… y ni rastro de mar al fondo. El horizonte es verde, no azul. Gulpiyuri es eso: una playa que el océano visita por debajo de la tierra.' },
      { t: 'p', html: 'El truco es geología pura. El mar batió durante milenios la roca caliza hasta horadar túneles subterráneos que conectan esta hondonada, situada a unos <strong>cien metros tierra adentro</strong>, con la costa abierta de Ribadesella. El agua entra y sale por esas galerías, y por eso aquí hay olas sin que se vea de dónde vienen. Está declarada <strong>Monumento Natural</strong> desde 2001.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'La postal es real; la letra pequeña, también. Lo primero que casi ningún reel de Instagram dice: <strong>Gulpiyuri depende por completo de la marea</strong>. Con la marea baja se queda en un charco de arena con apenas un palmo de agua —bonito para una foto, inútil para bañarse—; el momento bueno es con la marea alta o subiendo. Si vas sin mirar la tabla de mareas, hay muchas papeletas de encontrarte una poza y no una playa.' },
      { t: 'p', html: 'Lo segundo: es <strong>diminuta</strong>, apenas unos 40 metros de arena. En un día de agosto se llena en cuanto abre, y la sensación de "rincón salvaje" se evapora con cincuenta toallas pegadas. Y lo tercero, lo que más sorprende al que llega: <strong>no hay absolutamente nada</strong>. Ni chiringuito, ni socorrista, ni duchas, ni papeleras, ni baños. Es agua del Cantábrico, fría (rara vez pasa de 18-20°C en verano), sin vigilancia y con corriente en las galerías: no es una piscina para niños pequeños. El aparcamiento queda a un buen paseo a pie por el prado.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla que lo cambia todo es una: <strong>consulta la tabla de mareas antes de salir</strong> y planta tu visita en la pleamar. Con la marea llena, Gulpiyuri es la maravilla geológica que te han vendido; con la marea vacía, un viaje a un charco. Es gratis y se publica para cada día en Ribadesella; no hay excusa para fallarla.' },
      { t: 'p', html: 'Lo demás es sentido común de playa salvaje: ve <strong>fuera de agosto o a primera hora</strong> si quieres el sitio medio vacío (mayo, junio y septiembre son ideales), <strong>llévate todo</strong> —agua, comida y, sobre todo, tu basura de vuelta, porque no hay papeleras y es Monumento Natural—, y calza algo cómodo para el camino desde el aparcamiento. ¿El plan redondo? Encadenarla con las playas grandes de al lado, <strong>San Antolín o Torimbia</strong>, que sí tienen arena de sobra y, Torimbia, ese aire indómito que ya casi no queda. Gulpiyuri para la foto y el asombro; la vecina para el baño largo.' },
      { t: 'quote', text: 'No es una playa escondida que nadie conozca: es una rareza geológica que cabe en una foto y en muy poca gente. Quien la pisa en marea baja entiende por qué la fama engaña.' },
      { t: 'p', html: 'Porque Gulpiyuri no se mide en kilómetros de arena ni en servicios, sino en asombro: el de quedarte quieto escuchando romper unas olas que llegan de un mar que no ves, en mitad de un prado asturiano. Acierta con la marea, llega temprano y vuélvete con tu basura, y te llevarás uno de esos lugares que parecen un error precioso de la naturaleza. Equivócate de hora y te llevarás un charco con cola para la foto.' },
    ],
    faq: [
      { q: '¿Por qué hay olas en Gulpiyuri si no se ve el mar?', a: 'Porque el mar entra por túneles subterráneos excavados en la roca caliza que conectan la playa, situada a unos 100 metros tierra adentro, con la costa abierta. El agua sube y baja por esas galerías, así que las olas llegan sin que se vea su origen.' },
      { q: '¿A qué hora se puede bañar uno en Gulpiyuri?', a: 'Depende de la marea: con marea alta o subiendo hay agua suficiente; con marea baja queda casi seca. Consulta la tabla de mareas de Ribadesella antes de ir y planifica la visita en pleamar.' },
      { q: '¿Tiene servicios la playa de Gulpiyuri?', a: 'No. No hay chiringuito, socorrista, duchas ni baños, y el aparcamiento queda a un paseo a pie por el prado. Es Monumento Natural: lleva agua, comida y devuelve tu basura. El agua es del Cantábrico, fría y sin vigilancia.' },
    ],
    en: {
      title: 'Playa de Gulpiyuri, Asturias: the sea-less beach where the tide decides if you can swim',
      excerpt: 'A shell of sand 100 metres inland, with no horizon, declared a Natural Monument. What you actually need to know about Gulpiyuri: it depends on the tide, has no facilities and fits very few people.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You can’t see it from the road, or the car park, or even once you’re walking across the meadow. You follow a path between cows and maize, the Cantabrian Sea murmuring behind you, until the ground suddenly opens: a crescent of fine sand hidden between walls of rock, small waves breaking on the shore… and no sea in sight beyond. The horizon is green, not blue. That’s Gulpiyuri: a beach the ocean visits from beneath the land.' },
        { t: 'p', html: 'The trick is pure geology. For millennia the sea pounded the limestone until it bored underground tunnels linking this hollow, set about <strong>a hundred metres inland</strong>, to the open coast of Ribadesella. Water flows in and out through those galleries, which is why there are waves here with no visible source. It has been a <strong>Natural Monument</strong> since 2001.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The postcard is real; so is the small print. The first thing almost no Instagram reel mentions: <strong>Gulpiyuri depends entirely on the tide</strong>. At low tide it shrinks to a puddle of sand with barely a hand’s depth of water — pretty for a photo, useless for swimming; the good moment is at high tide or on the rise. Turn up without checking the tide table and there’s a fair chance you’ll find a pool, not a beach.' },
        { t: 'p', html: 'Second: it’s <strong>tiny</strong>, barely 40 metres of sand. On an August day it fills the moment it opens, and the "wild corner" feeling evaporates under fifty towels. And third, the part that most surprises new arrivals: there is <strong>absolutely nothing here</strong>. No beach bar, no lifeguard, no showers, no bins, no toilets. It’s cold Cantabrian water (rarely above 18-20°C in summer), unsupervised, with a current in the galleries: not a paddling pool for small children. The car park is a good walk away across the meadow.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'One rule changes everything: <strong>check the tide table before you leave</strong> and time your visit for high water. At full tide, Gulpiyuri is the geological marvel you were promised; at low tide, a trip to a puddle. The table is free and published daily for Ribadesella — there’s no excuse for getting it wrong.' },
        { t: 'p', html: 'The rest is wild-beach common sense: go <strong>outside August or first thing</strong> if you want the place half-empty (May, June and September are ideal), <strong>bring everything</strong> — water, food and, above all, carry your rubbish back out, because there are no bins and this is a Natural Monument — and wear something comfortable for the walk from the car park. The perfect plan? Pair it with the big beaches next door, <strong>San Antolín or Torimbia</strong>, which have sand to spare and, in Torimbia’s case, that untamed air that’s almost gone elsewhere. Gulpiyuri for the photo and the wonder; its neighbour for the long swim.' },
        { t: 'quote', text: 'It’s not a hidden beach no one knows: it’s a geological oddity that fits in one photo and very few people. Anyone who arrives at low tide understands how the fame misleads.' },
        { t: 'p', html: 'Because Gulpiyuri isn’t measured in kilometres of sand or in services, but in wonder: the wonder of standing still, listening to waves break that come from a sea you can’t see, in the middle of an Asturian meadow. Get the tide right, arrive early and leave with your rubbish, and you’ll take home one of those places that feel like a beautiful mistake of nature. Get the timing wrong and you’ll take home a puddle with a queue for the photo.' },
      ],
      faq: [
        { q: 'Why are there waves at Gulpiyuri if you can’t see the sea?', a: 'Because the sea enters through underground tunnels carved into the limestone that connect the beach, set about 100 metres inland, with the open coast. Water rises and falls through those galleries, so the waves arrive with no visible source.' },
        { q: 'When can you swim at Gulpiyuri?', a: 'It depends on the tide: at high tide or on the rise there’s enough water; at low tide it’s nearly dry. Check the Ribadesella tide table before you go and plan your visit for high water.' },
        { q: 'Does Gulpiyuri have any facilities?', a: 'No. There’s no beach bar, lifeguard, showers or toilets, and the car park is a walk away across the meadow. It’s a Natural Monument: bring water and food and take your rubbish back. The water is cold Cantabrian sea, with no supervision.' },
      ],
    },
  },
  // ───── FICHA voz bicéfala (modelo de la casa: A narra, B informa) ─────
  {
    slug: 'cala-granadella-xabia-guia-honesta',
    category: 'curiosidades',
    title: 'Cala Granadella (Xàbia): la "mejor playa de España" es de cantos, no de arena',
    excerpt:
      'Premiada, fotografiada y masificada. Lo que de verdad necesitas saber de la Granadella: cantos (no arena), aforo en verano y el mejor snorkel de la Costa Blanca.',
    heroAlt: 'Cala Granadella en Xàbia, herradura entre acantilados y pinos sobre agua transparente',
    heroQuery: 'granadella,javea,cove,mediterranean',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-06T00:00:00Z',
    readingMin: 4,
    related: [
      { href: '/alquiler-barco/costas/costa-blanca/provincias/alicante/javea', label: 'Alquiler de barco en Xàbia' },
      { href: '/comunidad/comunitat-valenciana', label: 'Playas de la Comunidad Valenciana' },
      { href: '/playas-aguas-cristalinas', label: 'Playas de aguas cristalinas' },
    ],
    body: [
      { t: 'p', html: 'Quien baja el último tramo de carretera entre pinos, con el mar apareciendo a retazos entre las ramas, entiende los premios antes de pisar la orilla. La Granadella se abre de golpe: una herradura encajada entre dos brazos de acantilado, el agua tan transparente que las barcas fondeadas parecen flotar en el aire, y los pinos carrascos asomándose al Mediterráneo como si quisieran bañarse ellos también.' },
      { t: 'p', html: 'Y guarda un secreto de hormigón. En el flanco norte resiste <strong>un búnker de la Guerra Civil</strong>, uno de los muchos que vigilaban esta costa ante un desembarco que nunca llegó. Donde antes había fusiles, hoy hay snorkel: sus fondos rocosos son de los más ricos de toda la provincia de Alicante.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Hasta aquí, el folleto tiene razón. Ahora la letra pequeña. La Granadella fue elegida <strong>mejor playa de España en 2014</strong> y desde entonces es víctima de su fama. Es una cala de unos 160 metros, con agua clasificada <strong>"excelente" por la Agencia Europea de Medio Ambiente</strong> los últimos años, pero —dato que cambia la maleta— es de <strong>cantos rodados, no de arena</strong>. Sin escarpines y sin colchoneta lo vas a pasar mal: ni se camina cómodo ni se está tumbado a gusto.' },
      { t: 'p', html: 'El segundo aviso es el aparcamiento: pequeño, de pago, y en <strong>julio y agosto el Ayuntamiento de Xàbia regula el acceso en coche con aforo</strong>. Se llena a media mañana y, cuando se completa, activan bus lanzadera desde el pueblo. Si llegas a mediodía en agosto pensando aparcar al lado, no entras. Sombra natural, poca —el pinar queda en los bordes—; a partir de las doce, sombrilla o sufrir. Servicios: un par de restaurantes buenos, con precio de cala famosa.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'Dicho lo malo, merece muchísimo la pena si la sabes pisar. La regla de oro es <strong>ir fuera de temporada o a primera hora</strong>: en mayo, junio y septiembre el agua ya está para bañarse, la luz es mejor y la cala está a un tercio de su capacidad. A las nueve de la mañana en pleno agosto también la tienes casi para ti.' },
      { t: 'p', html: 'El otro factor es el viento, y casi nadie lo cuenta. Con <strong>levante</strong> (viento del este) entra marejada y enturbia el agua justo sobre los fondos rocosos que vienes a ver: si has venido a hacer snorkel, un día de levante te arruina el plan. Mira el parte antes de salir. Y si la encuentras a rebosar, no te resignes: la <strong>Cala del Portitxol</strong>, un poco al norte, aguanta mejor el gentío con un encanto parecido.' },
      { t: 'quote', text: 'No es una joya escondida: la conoce medio mundo. Es una gran cala que premia a quien la pisa con cabeza.' },
      { t: 'p', html: 'Porque la Granadella no es, por mucho que lo repitan, un secreto. Es otra cosa, quizá mejor: una gran cala mediterránea que regala a quien llega temprano, con escarpines y un ojo en el viento, una de las mejores horas de snorkel de la Costa Blanca. El búnker seguirá ahí, vigilando un mar que hoy solo trae aletas y máscaras.' },
    ],
    faq: [
      { q: '¿La Granadella es de arena o de piedra?', a: 'De cantos rodados, no de arena. Conviene llevar escarpines para entrar al agua y una colchoneta o tumbona para estar cómodo.' },
      { q: '¿Hay que pagar o reservar para aparcar en verano?', a: 'En julio y agosto el Ayuntamiento de Xàbia regula el acceso en coche por aforo: el aparcamiento (de pago) se llena a media mañana y se activa un bus lanzadera desde el pueblo. Mejor llegar antes de las 10h o ir fuera de temporada.' },
      { q: '¿Cuándo está mejor el agua para snorkel?', a: 'Con mar en calma. El viento de levante (este) levanta marejada y enturbia los fondos rocosos; revisa el parte. Mayo, junio y septiembre suelen dar el mejor equilibrio de agua clara y poca gente.' },
    ],
    en: {
      title: 'Cala Granadella (Xàbia): the "best beach in Spain" is pebbles, not sand',
      excerpt: 'Award-winning, photographed and overcrowded. What you actually need to know about Granadella: pebbles (not sand), summer capacity limits and the best snorkelling on the Costa Blanca.',
      related: [
        { href: '/en/boat-rental/coasts/costa-blanca/provinces/alicante/javea', label: 'Boat rental in Xàbia' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'Drive down the last stretch of road through the pines, the sea flashing between the branches, and you understand the awards before you even reach the shore. Granadella opens up all at once: a horseshoe wedged between two arms of cliff, water so clear the anchored boats seem to float in mid-air, and Aleppo pines leaning out over the Mediterranean as if they fancied a swim too.' },
        { t: 'p', html: 'And it keeps a concrete secret. On the northern flank stands <strong>a Spanish Civil War bunker</strong>, one of many that watched this coast for a landing that never came. Where there were once rifles, there’s now snorkelling: its rocky seabed is among the richest in the whole province of Alicante.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'So far the brochure is right. Now the small print. Granadella was named <strong>best beach in Spain in 2014</strong> and has been a victim of its fame ever since. It’s a cove of about 160 metres, water rated <strong>"excellent" by the European Environment Agency</strong> in recent years, but — the detail that changes your packing — it’s <strong>pebbles, not sand</strong>. Without water shoes and an air bed you’ll struggle: it’s neither comfy to walk on nor to lie on.' },
        { t: 'p', html: 'The second warning is parking: small, paid, and in <strong>July and August Xàbia council caps car access</strong>. It fills by mid-morning and, once full, a shuttle bus runs from the town. Turn up at midday in August expecting to park beside it and you won’t get in. Natural shade is scarce — the pines stay at the edges — so from noon it’s a parasol or suffer. Services: a couple of good restaurants, at famous-cove prices.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'That said, it’s well worth it if you know how to time it. The golden rule is <strong>go off-season or first thing</strong>: in May, June and September the water’s warm enough, the light is better and the cove is at a third of its capacity. Nine in the morning in peak August also gets you near-empty sand.' },
        { t: 'p', html: 'The other factor is the wind, which almost nobody mentions. With an <strong>easterly (levante)</strong> a swell rolls in and clouds the water right over the rocky seabed you came to see: if you’re here to snorkel, a levante day ruins the plan. Check the forecast. And if you find it packed, don’t give up — <strong>Cala del Portitxol</strong>, just to the north, handles crowds better with a similar charm.' },
        { t: 'quote', text: 'It’s not a hidden gem: half the world knows it. It’s a great cove that rewards those who visit it wisely.' },
        { t: 'p', html: 'Because Granadella, however often they say so, is no secret. It’s something else, perhaps better: a great Mediterranean cove that gives whoever arrives early, with water shoes and an eye on the wind, one of the best snorkelling hours on the Costa Blanca. The bunker will still be there, watching a sea that today brings only fins and masks.' },
      ],
      faq: [
        { q: 'Is Granadella sand or pebbles?', a: 'Pebbles, not sand. Bring water shoes to get into the sea and an air bed or sunlounger to be comfortable.' },
        { q: 'Do I need to pay or book to park in summer?', a: 'In July and August Xàbia council caps car access: the paid car park fills by mid-morning and a shuttle bus runs from the town. Best to arrive before 10am or go off-season.' },
        { q: 'When is the water best for snorkelling?', a: 'In calm conditions. An easterly (levante) wind brings swell and clouds the rocky seabed; check the forecast. May, June and September usually offer the best balance of clear water and few people.' },
      ],
    },
  },

  // ───── Diario de playas (voz bicéfala) ─────
  {
    slug: 'playa-bolonia-tarifa-duna-viento',
    category: 'curiosidades',
    title: 'Playa de Bolonia, Tarifa: la duna de 30 metros y el viento que decide tu día',
    excerpt:
      'Arena blanca, una duna monumental y una ciudad romana al lado. Pero en Bolonia manda el viento: lo que necesitas saber antes de bajar la cuesta, con poniente y con levante.',
    heroAlt: 'Gran duna de arena blanca de la playa de Bolonia con el pinar detrás y el Atlántico a la izquierda',
    heroQuery: 'bolonia,tarifa,dune,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-06T09:00:00Z',
    readingMin: 4,
    related: [
      { href: '/alquiler-barco/costas/costa-de-la-luz/provincias/cadiz/tarifa', label: 'Alquiler de barco en Tarifa' },
      { href: '/comunidad/andalucia', label: 'Playas de Andalucía' },
      { href: '/playas-sin-viento', label: 'Playas resguardadas del viento' },
    ],
    body: [
      { t: 'p', html: 'Se baja desde la N-340 por una carretera estrecha que dibuja curvas entre el monte, y la ensenada aparece entera de golpe: un arco de arena rubia, fina como la harina, y al fondo —imposible no mirarla— una duna blanca de casi treinta metros de alto trepando hacia el pinar. El Atlántico aquí no es el azul plácido del Mediterráneo: es verde, ancho y con fuerza, y al otro lado de la bahía se adivina la costa de África.' },
      { t: 'p', html: 'Y junto a la arena, las piedras de <strong>Baelo Claudia</strong>, una ciudad romana del siglo I que vivía de salar atún y fabricar <em>garum</em>. Quedan el foro, el teatro y las piletas de salazón a pie de playa: pocos sitios en España te dejan tomar el sol con un yacimiento romano de fondo.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'El folleto acierta con la postal. La letra pequeña es el viento. Bolonia está en el corazón del Estrecho de Gibraltar, <strong>uno de los puntos más ventosos de Europa</strong>, y eso explica a la vez su mejor activo —la <strong>duna móvil, declarada Monumento Natural</strong>, que el viento mantiene viva y en movimiento— y su mayor riesgo: un día de <strong>levante</strong> fuerte convierte la arena en perdigones. No es una exageración: con levante de verdad, no se está.' },
      { t: 'p', html: 'El agua tiene calidad <strong>clasificada como "excelente" por la Agencia Europea de Medio Ambiente</strong> en los últimos años, pero es <strong>fría</strong> —Atlántico, no Mediterráneo: rara vez pasa de 20-21°C en pleno verano— y con oleaje y corrientes; no es la piscina de una cala calada. Servicios, los justos: un par de chiringuitos, aparcamiento que en agosto se colapsa a media mañana y <strong>sombra natural casi nula</strong>. Baelo Claudia tiene entrada gratuita para ciudadanos de la UE.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La clave de Bolonia se resume en una palabra: <strong>parte del viento</strong>. Con <strong>poniente</strong> (viento del oeste) o en calma, es una de las grandes playas de España: arena espectacular, agua limpia y espacio de sobra. Con <strong>levante</strong> (del este), cámbiala por un plan de interior o vete a una cala resguardada; mirar el pronóstico la noche antes te ahorra el viaje. Como referencia, los kitesurfistas de Tarifa rezan por el levante; el bañista de Bolonia, por el poniente.' },
      { t: 'p', html: 'Lo demás es logística: llega <strong>antes de las 11h en julio y agosto</strong> para aparcar, lleva sombrilla con anclaje en condiciones (con brisa, las normales salen volando) y reserva una hora para subir descalzo la duna —se hunde el pie, cuesta, y desde arriba se ve toda la bahía hasta África—. Súbela a primera o a última hora: a mediodía la arena quema. Y dedica otra a Baelo Claudia, mejor a media tarde, cuando baja el sol y las piedras se doran.' },
      { t: 'quote', text: 'Bolonia no se descubre: se acierta. La diferencia entre la mejor playa del verano y un día arruinado cabe en una palabra del parte: poniente o levante.' },
      { t: 'p', html: 'Porque Bolonia no es una playa que dependa de tu suerte, sino de tu lectura del cielo. El mismo viento que un día te despelleja es el que esculpe esa duna imposible y empuja las cometas de Tarifa. Entiéndelo, elige el día, y tendrás arena africana, ruinas romanas y un Atlántico que no se parece a nada de la costa este. Equivócate de viento, y entenderás por qué aquí mandan las cometas y no las sombrillas.' },
    ],
    faq: [
      { q: '¿Por qué hay tanto viento en Bolonia?', a: 'Está en el Estrecho de Gibraltar, uno de los puntos más ventosos de Europa. Sopla sobre todo levante (este) y poniente (oeste). Con levante fuerte la arena molesta mucho; con poniente o en calma la playa está perfecta. Conviene mirar el parte la noche antes.' },
      { q: '¿Se puede visitar la ciudad romana de Baelo Claudia?', a: 'Sí, está a pie de playa: foro, teatro y piletas de salazón de garum del siglo I. La entrada es gratuita para ciudadanos de la Unión Europea. Mejor a media tarde, con el sol más bajo.' },
      { q: '¿Está fría el agua en Bolonia?', a: 'Sí, es Atlántico: rara vez supera los 20-21°C en pleno verano, con oleaje y corrientes. La calidad del agua está clasificada como "excelente" por la Agencia Europea de Medio Ambiente, pero no esperes la calma cálida de una cala mediterránea.' },
    ],
    en: {
      title: 'Playa de Bolonia, Tarifa: the 30-metre dune and the wind that decides your day',
      excerpt: 'White sand, a monumental dune and a Roman town next door. But at Bolonia the wind rules: what to know before you drive down, with a westerly and with an easterly.',
      related: [
        { href: '/en/boat-rental/coasts/costa-de-la-luz/provinces/cadiz/tarifa', label: 'Boat rental in Tarifa' },
        { href: '/en/islands', label: 'Beaches by island' },
      ],
      body: [
        { t: 'p', html: 'You drop down from the N-340 along a narrow road that curls through the hills, and the bay appears all at once: an arc of blonde sand, fine as flour, and at the far end — impossible not to look — a white dune nearly thirty metres high climbing towards the pine wood. The Atlantic here isn’t the placid blue of the Mediterranean: it’s green, wide and powerful, and across the bay you can make out the coast of Africa.' },
        { t: 'p', html: 'And beside the sand stand the stones of <strong>Baelo Claudia</strong>, a 1st-century Roman town that lived off salting tuna and making <em>garum</em>. The forum, the theatre and the salting tanks remain right by the beach: few places in Spain let you sunbathe with a Roman site behind you.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The brochure gets the postcard right. The small print is the wind. Bolonia sits in the heart of the Strait of Gibraltar, <strong>one of the windiest spots in Europe</strong>, which explains both its best asset — the <strong>shifting dune, a protected Natural Monument</strong>, kept alive and moving by the wind — and its biggest risk: a strong <strong>levante (easterly)</strong> turns the sand into buckshot. It’s no exaggeration: in a real easterly, you can’t stay.' },
        { t: 'p', html: 'The water is rated <strong>"excellent" by the European Environment Agency</strong> in recent years, but it’s <strong>cold</strong> — Atlantic, not Mediterranean: rarely above 20-21°C even in high summer — with swell and currents; it’s not the bathtub of a sheltered cove. Services are minimal: a couple of beach bars, a car park that jams by mid-morning in August, and <strong>almost no natural shade</strong>. Baelo Claudia is free to enter for EU citizens.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'Bolonia comes down to one thing: <strong>read the wind forecast</strong>. With a <strong>poniente (westerly)</strong> or in calm, it’s one of Spain’s great beaches: spectacular sand, clean water and room to spare. With a <strong>levante (easterly)</strong>, swap it for an inland plan or a sheltered cove; checking the forecast the night before saves you the trip. As a rule of thumb, Tarifa’s kitesurfers pray for the easterly; Bolonia’s bathers pray for the westerly.' },
        { t: 'p', html: 'The rest is logistics: arrive <strong>before 11am in July and August</strong> to park, bring a parasol with a proper anchor (in a breeze the normal ones take off), and set aside an hour to climb the dune barefoot — your feet sink, it’s hard work, and from the top you see the whole bay to Africa. Climb it early or late: at midday the sand burns. Give another hour to Baelo Claudia, ideally late afternoon when the sun drops and the stones turn gold.' },
        { t: 'quote', text: 'You don’t discover Bolonia: you time it right. The gap between the best beach of the summer and a ruined day fits in one word of the forecast — westerly or easterly.' },
        { t: 'p', html: 'Because Bolonia doesn’t depend on your luck but on your reading of the sky. The same wind that skins you one day is the one that sculpts that impossible dune and drives Tarifa’s kites. Get it right, pick your day, and you’ll have African sand, Roman ruins and an Atlantic like nothing on the east coast. Get the wind wrong, and you’ll understand why here it’s the kites that rule, not the parasols.' },
      ],
      faq: [
        { q: 'Why is it so windy at Bolonia?', a: 'It sits in the Strait of Gibraltar, one of the windiest places in Europe. The main winds are the levante (easterly) and poniente (westerly). A strong easterly makes the sand unbearable; with a westerly or in calm the beach is perfect. Check the forecast the night before.' },
        { q: 'Can you visit the Roman town of Baelo Claudia?', a: 'Yes, it’s right by the beach: a 1st-century forum, theatre and garum salting tanks. Entry is free for EU citizens. Late afternoon is best, with the sun lower.' },
        { q: 'Is the water cold at Bolonia?', a: 'Yes, it’s the Atlantic: rarely above 20-21°C even in high summer, with swell and currents. Water quality is rated "excellent" by the European Environment Agency, but don’t expect the warm calm of a Mediterranean cove.' },
      ],
    },
  },
  {
    slug: 'playa-rodas-islas-cies-permiso',
    category: 'guias',
    title: 'Playa de Rodas (Cíes): la "mejor playa del mundo" no se pisa sin permiso previo',
    excerpt:
      'Un arco de arena blanca entre dos islas, agua de color caribeño y agua a 18°C. Cómo se llega de verdad a Cíes: el permiso obligatorio de la Xunta, el aforo y el barco que solo navega con buen tiempo.',
    heroAlt: 'Arco de arena blanca de la playa de Rodas uniendo dos islas de las Cíes sobre agua turquesa',
    heroQuery: 'cies,islands,rodas,beach,galicia',
    author: 'Equipo Playas de España',
    datePublished: '2026-06-06T10:00:00Z',
    readingMin: 5,
    related: [
      { href: '/islas', label: 'Playas por isla en España' },
      { href: '/comunidad/galicia', label: 'Playas de Galicia' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
    ],
    body: [
      { t: 'p', html: 'El barco sale de Vigo y, durante cuarenta minutos, no hay nada que prometa gran cosa: la ría, los astilleros, las bateas de mejillón. Hasta que las Cíes se abren y aparece <em>eso</em>: un arco de arena blanquísima de más de un kilómetro tendido entre dos islas como un puente, cerrando una laguna de agua tan clara y tan verde que parece imposible que aquello sea el Atlántico gallego y no el Caribe.' },
      { t: 'p', html: 'En 2007 el diario británico <strong>The Guardian la llamó "la mejor playa del mundo"</strong>, y desde entonces la frase persigue a Rodas en cada titular. Lo que casi nadie cuenta en esos titulares es que llegar hasta aquí no es subirse a un barco y ya: es un Parque Nacional, y entrar tiene reglas.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Las Cíes forman parte del <strong>Parque Nacional de las Islas Atlánticas</strong>, y eso lo cambia todo. Para visitarlas necesitas <strong>una autorización gratuita de la Xunta de Galicia</strong> que se saca por internet ANTES de comprar el billete del barco: sin ese código, la naviera no te deja embarcar. El parque tiene <strong>aforo diario limitado</strong> (en torno a 1.800 visitantes en temporada alta), así que en julio y agosto los permisos vuelan con días de antelación. No es un trámite opcional: es la puerta.' },
      { t: 'p', html: 'El segundo aviso es el mar. Esto es <strong>Atlántico abierto del noroeste</strong>: el agua rara vez sube de <strong>18-19°C</strong> aun en agosto, y el baño es corto y valiente. El tiempo es una lotería —puede amanecer cerrado en niebla y abrir a mediodía— y los barcos <strong>solo operan en temporada (aproximadamente Semana Santa a octubre)</strong> y se cancelan si el mar viene mal. No hay hoteles ni tiendas más allá de una cafetería y un camping; lo que no lleves, no lo hay.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'El orden correcto, y por el que mucha gente se queda en tierra, es este: <strong>primero el permiso de la Xunta, después el billete del barco</strong>. Nunca al revés. Saca la autorización en cuanto tengas fecha —en alta temporada, con varios días de margen— y elige, si puedes, <strong>un día de buen parte</strong>: con Cíes, ir un martes despejado de septiembre vale por tres sábados grises de agosto.' },
      { t: 'p', html: 'Trucos que cambian el día: mira <strong>la hora del último barco de vuelta</strong> antes de relajarte de más (perderlo es dormir en la isla quieras o no), lleva <strong>comida y agua</strong> porque la oferta es mínima y cara, y calza algo para andar: la recompensa real no es solo tumbarte, es subir al <strong>faro</strong> por el sendero (una hora larga) para ver Rodas entera desde arriba. Y si quieres la isla vacía y el amanecer, reserva plaza en el <strong>camping</strong>: es la única forma de quedarse cuando el último barco se lleva a todo el mundo.' },
      { t: 'quote', text: 'Rodas no premia al que llega: premia al que planifica. El permiso, el parte y el último barco deciden más que la suerte.' },
      { t: 'p', html: 'Así que sí, es una de las playas más bellas que verás, pero no es un capricho de última hora: es un plan que se gana con una semana de antelación y un ojo en el cielo. Hazlo bien y tendrás un arco de arena caribeña flotando sobre el Atlántico gallego, con las gaviotas patiamarillas chillando sobre los pinos. Hazlo a lo loco y te quedarás mirando las Cíes desde el puerto de Vigo, sin permiso y sin barco.' },
    ],
    faq: [
      { q: '¿Necesito permiso para ir a las Islas Cíes?', a: 'Sí. Es obligatorio sacar una autorización gratuita de la Xunta de Galicia por internet ANTES de comprar el billete del barco. Sin ese código la naviera no te deja embarcar. El parque tiene aforo diario limitado, así que en verano conviene tramitarlo con varios días de antelación.' },
      { q: '¿Cómo se llega a la playa de Rodas?', a: 'En barco regular desde Vigo (unos 40 minutos), y también desde Cangas y Baiona en temporada. Los barcos solo operan aproximadamente de Semana Santa a octubre y se cancelan con mal mar. Primero el permiso de la Xunta, después el billete.' },
      { q: '¿Está fría el agua en las Cíes?', a: 'Sí. Es Atlántico abierto: el agua rara vez supera los 18-19°C, incluso en agosto. El entorno es espectacular, pero el baño es frío y el tiempo, cambiante: elige un día de buen pronóstico.' },
    ],
    en: {
      title: 'Playa de Rodas (Cíes): the "best beach in the world" you can’t set foot on without a permit',
      excerpt: 'An arc of white sand linking two islands, Caribbean-coloured water and a sea at 18°C. How you actually get to Cíes: the compulsory Xunta permit, the daily cap and a ferry that only sails in good weather.',
      related: [
        { href: '/en/islands', label: 'Beaches by island' },
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
      ],
      body: [
        { t: 'p', html: 'The boat leaves Vigo and for forty minutes nothing promises much: the ría, the shipyards, the mussel rafts. Until the Cíes open up and <em>that</em> appears: an arc of dazzling white sand over a kilometre long slung between two islands like a bridge, sealing off a lagoon so clear and so green it seems impossible this is the Galician Atlantic and not the Caribbean.' },
        { t: 'p', html: 'In 2007 the British paper <strong>The Guardian called it "the best beach in the world"</strong>, and the phrase has chased Rodas through every headline since. What almost none of those headlines mention is that getting here isn’t just hopping on a boat: it’s a National Park, and entry has rules.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The Cíes are part of the <strong>Atlantic Islands of Galicia National Park</strong>, and that changes everything. To visit you need <strong>a free authorisation from the Xunta de Galicia</strong>, obtained online BEFORE you buy the boat ticket: without that code the ferry company won’t let you board. The park has a <strong>daily visitor cap</strong> (around 1,800 in high season), so in July and August permits go days in advance. It’s not optional paperwork: it’s the gate.' },
        { t: 'p', html: 'The second warning is the sea. This is <strong>open north-western Atlantic</strong>: the water rarely climbs above <strong>18-19°C</strong> even in August, and swims are short and brave. The weather is a lottery — it can dawn shut in fog and clear by midday — and the boats <strong>only run in season (roughly Easter to October)</strong> and are cancelled in rough seas. There are no hotels or shops beyond a café and a campsite; whatever you don’t bring, you won’t find.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The right order — and the one that leaves many people on the mainland — is this: <strong>permit from the Xunta first, boat ticket second</strong>. Never the other way round. Get the authorisation the moment you have a date — in high season, with several days’ margin — and choose, if you can, <strong>a day with a good forecast</strong>: with the Cíes, a clear Tuesday in September beats three grey Saturdays in August.' },
        { t: 'p', html: 'Day-changing tips: check <strong>the time of the last boat back</strong> before you relax too much (miss it and you’re sleeping on the island whether you meant to or not), bring <strong>food and water</strong> as the offering is minimal and pricey, and wear something you can walk in: the real reward isn’t just lying down, it’s the climb to the <strong>lighthouse</strong> (a good hour) for the full view of Rodas from above. And if you want the island empty at dawn, book a pitch at the <strong>campsite</strong>: it’s the only way to stay once the last boat takes everyone else away.' },
        { t: 'quote', text: 'Rodas doesn’t reward those who arrive: it rewards those who plan. The permit, the forecast and the last boat decide more than luck does.' },
        { t: 'p', html: 'So yes, it’s one of the most beautiful beaches you’ll ever see, but it’s no last-minute whim: it’s a plan you earn a week ahead with an eye on the sky. Do it right and you’ll get an arc of Caribbean sand floating over the Galician Atlantic, yellow-legged gulls shrieking above the pines. Do it on a whim and you’ll be staring at the Cíes from Vigo harbour, with no permit and no boat.' },
      ],
      faq: [
        { q: 'Do I need a permit to visit the Cíes Islands?', a: 'Yes. You must obtain a free authorisation from the Xunta de Galicia online BEFORE buying the boat ticket. Without that code the ferry company won’t let you board. The park has a daily visitor cap, so in summer apply several days in advance.' },
        { q: 'How do you get to Playa de Rodas?', a: 'By regular ferry from Vigo (about 40 minutes), and from Cangas and Baiona in season. Boats only run roughly from Easter to October and are cancelled in rough seas. Permit from the Xunta first, ticket second.' },
        { q: 'Is the water cold at the Cíes?', a: 'Yes. It’s the open Atlantic: the water rarely tops 18-19°C, even in August. The setting is spectacular, but the swim is cold and the weather changeable — pick a day with a good forecast.' },
      ],
    },
  },

  // ───────────────────────── RUTAS ─────────────────────────
  {
    slug: 'ruta-calas-costa-brava-barco',
    category: 'rutas',
    title: 'Ruta por las mejores calas de la Costa Brava en barco',
    excerpt:
      'De Lloret a las Islas Medes: un itinerario de un día por las calas más bonitas de la Costa Brava, muchas accesibles solo desde el mar.',
    heroAlt: 'Cala escondida entre pinos y acantilados de la Costa Brava',
    heroQuery: 'costa-brava,cove,mediterranean,boat',
    gygQuery: 'boat trip Costa Brava',
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
    title: 'Las gredas de Bolnuevo (Murcia): esculturas que el viento talló junto a la playa',
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
      title: 'The Bolnuevo mudstone (Murcia): wind-carved rock formations right by the beach',
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
    gygQuery: 'snorkel Cabo de Gata',
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
  // ───── Diario de playas · Galicia (voz bicéfala) ─────
  {
    slug: 'playa-de-las-catedrales-ribadeo-marea-reserva',
    category: 'guias',
    title: 'Playa de las Catedrales, Ribadeo: sin marea baja y sin reserva no vas a ver los arcos',
    excerpt:
      'Los arcos de roca del norte de Lugo solo se pisan con la marea baja, y en verano hace falta un permiso gratuito con aforo. Lo que de verdad necesitas saber antes de ir: tabla de mareas, reserva y agua fría.',
    heroAlt: 'Arcos y contrafuertes de roca de la Playa de las Catedrales en Ribadeo, Lugo, sobre la arena descubierta con la marea baja',
    heroQuery: 'catedrais,ribadeo,galicia,arches',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T09:21:48Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/galicia', label: 'Playas de Galicia' },
      { href: '/playas-paradisiacas', label: 'Playas paradisíacas' },
      { href: '/atardeceres', label: 'Playas para ver el atardecer' },
    ],
    body: [
      { t: 'p', html: 'Bajas las escaleras del acantilado en el momento justo, cuando el Cantábrico se ha retirado, y de pronto entiendes el nombre. Lo que a marea llena era solo mar abierto se ha convertido en una nave de piedra: arcos de decenas de metros, contrafuertes que parecen tallados a mano, pasadizos entre paredes de pizarra por los que se cuela la luz. Caminas sobre la arena mojada mirando hacia arriba, como en una catedral de verdad, mientras el agua espera su turno para volver a taparlo todo.' },
      { t: 'p', html: 'Esta playa del concejo de Ribadeo, en la costa norte de Lugo, se llama en realidad <strong>praia de Augas Santas</strong>, pero nadie la conoce así: son <em>As Catedrais</em>, las Catedrales, y desde 2005 están declaradas <strong>Monumento Natural</strong> por la Xunta de Galicia. La escultura la firma el mar: milenios de oleaje cantábrico horadando la roca hasta dejar estos arcos que no duran para siempre —alguno se ha derrumbado— y que solo se dejan ver a ras de arena unas horas al día.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'Aquí la letra pequeña no es un matiz: es la mitad del plan. Lo primero, y lo que arruina más visitas: <strong>los arcos solo se pisan con la marea baja</strong>. Con la marea alta la playa desaparece bajo el agua y desde el mirador de arriba apenas intuyes nada; si llegas en pleamar, te has quedado sin catedral. Hay que <strong>consultar la tabla de mareas de Ribadeo</strong> y plantarse en la bajamar (o cerca), que es cuando se abre la arena y se puede caminar entre los contrafuertes.' },
      { t: 'p', html: 'Lo segundo, que pilla a mucha gente en la entrada: <strong>en temporada alta hace falta reserva</strong>. Para controlar el aforo, la Xunta exige un <strong>permiso gratuito y previo por internet</strong> para acceder a la playa en <strong>Semana Santa y en verano (aproximadamente de julio a septiembre)</strong>; las plazas por día son limitadas y en agosto vuelan. Sin reserva no bajas, aunque hayas conducido tres horas. Y lo tercero, el aviso que el reel se salta: es el <strong>Cantábrico</strong>, agua fría casi todo el año, con oleaje y corrientes, y la subida de la marea es rápida —hay que salir a tiempo para no quedarte atrapado contra el acantilado—. No es una playa de toalla y chapuzón largo: es una visita, más de zapatilla que de bañador.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'La regla de oro cruza dos cosas que casi nadie mira a la vez: <strong>la reserva y la marea</strong>. De nada sirve tener el permiso para las cinco de la tarde si a esa hora la marea está llena; lo ideal es <strong>coger un tramo horario que coincida con la bajamar</strong>. Mira primero la tabla de mareas del día, elige la franja de marea baja y reserva esa. Con eso resuelto, el resto es sentido común de costa brava del norte: <strong>calzado con suela</strong> para la roca mojada, que resbala; no despistarse con el agua subiendo; y <strong>respetar las zonas señalizadas</strong>, porque hay riesgo de desprendimientos y no todo el acantilado es seguro.' },
      { t: 'p', html: 'Cuándo SÍ y cuándo NO: la joya se disfruta mejor <strong>fuera de agosto</strong> —en mayo, junio, septiembre u octubre— cuando el permiso ni siquiera hace falta o es fácil, la luz rasa del atardecer entra por los arcos y no compartes cada foto con doscientas personas. Cuándo NO: un día de <strong>temporal o marejada fuerte del noroeste</strong>, que además de peligroso lo enturbia todo. ¿Y si te quedas sin reserva o pillas la marea alta? No tires el viaje: desde el <strong>paseo del acantilado</strong>, arriba, se ven los arcos gratis y sin cupo, y para bañarte de verdad tienes cerca playas más amables como <strong>Reinante o Os Castros</strong>, con arena de sobra. Las Catedrales para el asombro; la vecina para el baño.' },
      { t: 'quote', text: 'No es una playa que se visita cuando a uno le viene bien: es una catedral que solo abre cuando el mar se marcha. Quien llega en pleamar se queda mirando el agua donde deberían estar los arcos.' },
      { t: 'p', html: 'Porque las Catedrales no se miden en metros de arena ni en grados de agua, sino en horas: las pocas en las que el Cantábrico se aparta y deja leer su obra. Acierta con la marea, saca la reserva a tiempo y baja con la luz del atardecer, y caminarás bajo unos arcos que llevan siglos levantándose y cayéndose a su ritmo, ajenos a la cola del mirador. Confúndete de hora y de marea, y habrás hecho el viaje para ver, desde arriba, un mar que se ha comido la catedral hasta la próxima bajamar.' },
    ],
    faq: [
      { q: '¿Hace falta reserva para entrar a la Playa de las Catedrales?', a: 'En temporada alta, sí. La Xunta de Galicia exige un permiso gratuito y previo por internet para acceder en Semana Santa y en verano (aproximadamente de julio a septiembre), con aforo limitado por día. Fuera de esas fechas normalmente no es necesario. En agosto las plazas se agotan pronto: resérvala con antelación.' },
      { q: '¿A qué hora se ven los arcos de la Playa de las Catedrales?', a: 'Solo con la marea baja. Con la marea alta la playa queda cubierta por el agua y los arcos apenas se aprecian desde el mirador. Consulta la tabla de mareas de Ribadeo y, si necesitas reserva, elige un tramo horario que coincida con la bajamar.' },
      { q: '¿Se puede uno bañar en la Playa de las Catedrales?', a: 'Es más una playa de visita que de baño: agua fría del Cantábrico, oleaje, corrientes y una marea que sube rápido. Conviene salir a tiempo para no quedar atrapado contra el acantilado y respetar las zonas señalizadas por riesgo de desprendimientos. Para un baño largo, cerca están Reinante u Os Castros.' },
    ],
    en: {
      title: 'Playa de las Catedrales, Ribadeo: without low tide and a booking, you won’t see the arches',
      excerpt: 'The rock arches of northern Lugo can only be walked at low tide, and in summer you need a free timed permit. What you really need to know before going: tide table, booking and cold water.',
      related: [
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You come down the cliff steps at exactly the right moment, when the Cantabrian has drawn back, and suddenly the name makes sense. What at high water was only open sea has become a stone nave: arches tens of metres high, buttresses that look hand-carved, passageways between walls of slate where the light slips through. You walk on the wet sand looking upward, as in a real cathedral, while the water waits its turn to cover it all again.' },
        { t: 'p', html: 'This beach in the municipality of Ribadeo, on the northern coast of Lugo, is actually called <strong>praia de Augas Santas</strong>, but nobody knows it by that name: it’s <em>As Catedrais</em>, the Cathedrals, and since 2005 it has been a <strong>Natural Monument</strong> protected by the Galician government. The sculptor is the sea: millennia of Cantabrian swell boring through the rock to leave these arches — which don’t last forever, one or two have collapsed — and which only reveal themselves at sand level for a few hours a day.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'Here the small print isn’t a footnote: it’s half the plan. First, and what ruins the most visits: <strong>the arches can only be walked at low tide</strong>. At high tide the beach vanishes under the water and from the clifftop viewpoint you can barely make anything out; arrive at high water and you’ve missed the cathedral. You must <strong>check the Ribadeo tide table</strong> and be there at low water (or near it), when the sand opens up and you can walk among the buttresses.' },
        { t: 'p', html: 'Second, which catches many people at the entrance: <strong>in high season you need a booking</strong>. To manage numbers, the Galician government requires a <strong>free advance online permit</strong> to access the beach during <strong>Easter and summer (roughly July to September)</strong>; daily places are limited and in August they go fast. Without a booking you don’t go down, even after a three-hour drive. And third, the warning the reel skips: this is the <strong>Cantabrian Sea</strong>, cold for most of the year, with swell and currents, and the tide rises quickly — you need to leave in good time so you aren’t trapped against the cliff. It’s not a towel-and-long-swim beach: it’s a visit, more trainers than swimsuit.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The golden rule crosses two things almost nobody checks together: <strong>the booking and the tide</strong>. A permit for five in the afternoon is useless if the tide is full at five; ideally <strong>pick a time slot that coincides with low water</strong>. Check the day’s tide table first, choose the low-tide window and book that. With that sorted, the rest is northern-coast common sense: <strong>shoes with grip</strong> for the wet, slippery rock; don’t lose track of the rising water; and <strong>stay in the marked areas</strong>, because there’s a rockfall risk and not all of the cliff is safe.' },
        { t: 'p', html: 'When to go and when not: the jewel is best enjoyed <strong>outside August</strong> — in May, June, September or October — when the permit isn’t even needed or is easy to get, the low evening light pours through the arches and you don’t share every photo with two hundred people. When not: a day of <strong>storm or strong northwesterly swell</strong>, which is both dangerous and murky. And if you miss out on a booking or catch high tide? Don’t waste the trip: from the <strong>clifftop walkway</strong> above you can see the arches for free and with no quota, and for an actual swim there are gentler beaches nearby such as <strong>Reinante or Os Castros</strong>, with sand to spare. The Cathedrals for the wonder; the neighbour for the swim.' },
        { t: 'quote', text: 'It isn’t a beach you visit when it suits you: it’s a cathedral that only opens when the sea leaves. Turn up at high water and you’ll stand looking at the water where the arches should be.' },
        { t: 'p', html: 'Because the Cathedrals aren’t measured in metres of sand or degrees of water, but in hours: the few in which the Cantabrian steps aside and lets you read its work. Get the tide right, book in time and go down in the evening light, and you’ll walk beneath arches that have spent centuries rising and falling at their own pace, indifferent to the queue at the viewpoint. Get the hour and the tide wrong, and you’ll have made the trip to watch, from above, a sea that has swallowed the cathedral until the next low tide.' },
      ],
      faq: [
        { q: 'Do you need a booking to enter Playa de las Catedrales?', a: 'In high season, yes. The Galician government requires a free advance online permit to access during Easter and summer (roughly July to September), with a limited daily quota. Outside those dates it usually isn’t needed. In August places sell out early, so book ahead.' },
        { q: 'What time can you see the arches at Playa de las Catedrales?', a: 'Only at low tide. At high tide the beach is covered by water and the arches are barely visible from the viewpoint. Check the Ribadeo tide table and, if you need a booking, choose a time slot that coincides with low water.' },
        { q: 'Can you swim at Playa de las Catedrales?', a: 'It’s more a beach to visit than to swim at: cold Cantabrian water, swell, currents and a fast-rising tide. Leave in good time so you aren’t trapped against the cliff, and stay in the marked areas due to rockfall risk. For a proper swim, Reinante or Os Castros are close by.' },
      ],
    },
  },
  {
    slug: 'bacteria-carnivora-playa-vibrio-que-hay-de-cierto',
    category: 'curiosidades',
    title: 'La "bacteria carnívora" de las playas: qué hay de cierto detrás del titular del verano',
    excerpt:
      'Cada ola de calor vuelve el mismo titular: una bacteria "carnívora" acecha en el mar. El Vibrio vulnificus existe y conviene conocerlo, pero el riesgo real se parece poco al miedo. Qué es, a quién afecta y las tres reglas que de verdad importan.',
    heroAlt: 'Agua de mar en calma vista de cerca en la orilla de una playa al atardecer',
    heroQuery: 'sea,water,surface,closeup,warm',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-07T10:00:00Z',
    readingMin: 5,
    related: [
      { href: '/calidad-agua', label: 'Calidad del agua de baño, playa a playa' },
      { href: '/banderas-hoy', label: 'Banderas en las playas hoy' },
      { href: '/medusas', label: 'Riesgo de medusas por playa' },
    ],
    body: [
      { t: 'p', html: 'Basta una ola de calor y un par de casos en telediario para que el verano estrene monstruo: la "bacteria carnívora" que vive en el mar. El nombre científico es menos cinematográfico —<strong>Vibrio vulnificus</strong>— y la realidad, bastante más aburrida que el titular: es una bacteria que siempre ha estado ahí, que casi nunca causa problemas y que, cuando los causa, suele ser en personas muy concretas y por vías muy concretas. Conocerla sirve para lo contrario del pánico: para saber qué mirar.' },
      { t: 'p', html: 'El Vibrio vulnificus vive de forma natural en <strong>aguas costeras templadas y poco saladas</strong>: estuarios, desembocaduras, lagunas litorales. No es un vertido ni una plaga nueva; es fauna microscópica del mar. Lo que sí ha cambiado es la temperatura: la bacteria se multiplica cuando el agua supera los <strong>20 °C</strong> y se encuentra especialmente cómoda por encima de 26 °C. Un Mediterráneo cada vez más cálido —y episodios como los del mar Menor o los veranos récord del Báltico— amplían su temporada y su mapa. Por eso el titular vuelve cada julio.' },
      { t: 'h2', text: 'Qué hace exactamente (y a quién)', id: 'datos' },
      { t: 'p', html: 'La palabra "carnívora" viene de su complicación más grave: en casos raros puede causar <strong>fascitis necrotizante</strong>, una infección que destruye tejido y avanza rápido. Pero el matiz importa: la bacteria no ataca a bañistas sanos que nadan. Las dos puertas de entrada documentadas son <strong>heridas abiertas expuestas al agua de mar</strong> —cortes, rozaduras recientes, tatuajes sin cicatrizar— y el <strong>marisco crudo o poco hecho</strong>, sobre todo ostras. Y el perfil de riesgo está muy acotado: personas con <strong>enfermedad hepática</strong>, diabetes, cáncer, inmunosupresión o <strong>edad avanzada</strong>. En una persona sana, con la piel intacta, el problema es rarísimo.' },
      { t: 'p', html: 'Conviene además ponerle números al miedo. En España los casos documentados son <strong>muy escasos</strong> y la infección sigue siendo rara; lo que vigilan los expertos no es la cifra absoluta, sino la <strong>tendencia</strong>: los veranos más calurosos disparan los casos. El dato que se suele citar en Europa: de una media de unos <strong>126 casos anuales</strong> entre 2014 y 2017 se pasó a <strong>445</strong> en 2018, un verano de ola de calor, casi el triple. No es una epidemia; es un termómetro del mar caliente.' },
      { t: 'quote', text: 'No se contagia por nadar con la piel sana. El riesgo real vive en el cruce de tres cosas: agua caliente, una herida abierta y una persona vulnerable.' },
      { t: 'h2', text: 'Las tres reglas que de verdad importan', id: 'local' },
      { t: 'p', html: 'La prevención es casi decepcionante de lo simple. <strong>Una:</strong> si llevas una herida abierta, un corte reciente, un tatuaje o un piercing sin cicatrizar, cúbrelo con un apósito impermeable antes de bañarte —o ese día evita el agua muy cálida y estancada—. <strong>Dos:</strong> si perteneces a un grupo de riesgo, evita el marisco crudo o poco hecho en verano. <strong>Tres:</strong> si tras un baño una herida se enrojece, hincha y duele de forma desproporcionada en pocas horas, no esperes: acude al médico y menciona que has estado en el mar. En el <em>Vibrio</em>, la rapidez lo cambia todo.' },
      { t: 'p', html: 'Y un apunte para no mezclar conceptos: la presencia de <em>Vibrio</em> <strong>no la miden</strong> las banderas del socorrista ni los muestreos habituales de <a href="/calidad-agua">calidad del agua</a>, que vigilan la contaminación fecal. Son cosas distintas. Aun así, elegir bien la playa ayuda: consultar el <a href="/banderas-hoy">estado del mar del día</a> y huir de zonas con vertidos o mala renovación del agua es sentido común que reduce cualquier riesgo microbiológico. Traducido: la próxima vez que leas "bacteria carnívora en las playas", ya sabes que hablan de algo real pero raro, que casi nunca infecta a gente sana y que se esquiva con una tirita y no comiendo ostras crudas. El titular buscaba el susto; la realidad pide sentido común.' },
    ],
    faq: [
      { q: '¿Se puede contagiar el Vibrio solo por bañarse en el mar?', a: 'No con la piel sana. El Vibrio vulnificus necesita una puerta de entrada: una herida abierta, un corte, un tatuaje o piercing reciente en contacto con el agua, o el consumo de marisco crudo o poco cocinado (sobre todo ostras). Nadar con la piel intacta no es la vía de contagio.' },
      { q: '¿Es peligrosa la "bacteria carnívora" para todo el mundo?', a: 'No. En personas sanas la infección es rara y suele ser leve. El riesgo grave se concentra en personas con enfermedad hepática, diabetes, cáncer, inmunosupresión o edad avanzada. Cuando ocurre puede ser serio, por eso conviene proteger las heridas y actuar rápido ante los síntomas.' },
      { q: '¿Cómo evito el Vibrio en la playa?', a: 'Cubre cualquier herida, corte, tatuaje o piercing reciente con un apósito impermeable antes de bañarte, o evita ese día el agua muy cálida y estancada. Evita el marisco crudo o poco hecho si eres grupo de riesgo. Y si una herida se inflama y duele mucho pocas horas después del baño, acude al médico e indica que estuviste en el mar.' },
      { q: '¿Las banderas o la calidad del agua avisan del Vibrio?', a: 'No directamente. Las banderas del socorrista informan del estado del mar y los muestreos oficiales de calidad del agua vigilan la contaminación fecal, no el Vibrio. Son controles distintos, pero elegir playas con buena calidad del agua y buena renovación reduce el riesgo microbiológico en general.' },
    ],
    en: {
      title: 'The "flesh-eating bacteria" on the beaches: what’s true behind the summer headline',
      excerpt: 'Every heatwave brings the same headline: a "flesh-eating" bacteria lurking in the sea. Vibrio vulnificus is real and worth knowing, but the actual risk looks little like the fear. What it is, who it affects and the three rules that really matter.',
      related: [
        { href: '/en/blue-flag', label: 'Blue Flag beaches 2026' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'It only takes a heatwave and a couple of cases on the news for summer to unveil its monster: the "flesh-eating bacteria" that lives in the sea. The scientific name is less cinematic —<strong>Vibrio vulnificus</strong>— and the reality far duller than the headline: a bacterium that has always been there, rarely causes problems, and when it does, usually in very specific people through very specific routes. Knowing it is the opposite of panic: it tells you what to watch.' },
        { t: 'p', html: 'Vibrio vulnificus lives naturally in <strong>warm, low-salinity coastal waters</strong>: estuaries, river mouths, coastal lagoons. It’s not a spill or a new plague; it’s the sea’s microscopic fauna. What has changed is temperature: it multiplies when water tops <strong>20 °C</strong> and is especially at home above 26 °C. An ever-warmer Mediterranean —and episodes like the Mar Menor or record Baltic summers— widen its season and its map. That’s why the headline returns every July.' },
        { t: 'h2', text: 'What it does, exactly (and to whom)', id: 'facts' },
        { t: 'p', html: 'The word "flesh-eating" comes from its most severe complication: in rare cases it can cause <strong>necrotising fasciitis</strong>, an infection that destroys tissue and advances fast. But the nuance matters: it doesn’t attack healthy swimmers. The two documented entry points are <strong>open wounds exposed to seawater</strong> —cuts, fresh grazes, unhealed tattoos— and <strong>raw or undercooked shellfish</strong>, especially oysters. And the risk profile is tightly defined: people with <strong>liver disease</strong>, diabetes, cancer, immunosuppression or <strong>advanced age</strong>. In a healthy person with intact skin, the problem is extremely rare.' },
        { t: 'p', html: 'It’s worth putting numbers to the fear. In Spain documented cases are <strong>very few</strong> and infection remains rare; what experts watch isn’t the absolute figure but the <strong>trend</strong>: hotter summers push cases up. The figure often cited in Europe: from an average of about <strong>126 cases a year</strong> between 2014 and 2017 to <strong>445</strong> in 2018, a heatwave summer, nearly triple. It’s not an epidemic; it’s a thermometer of a warming sea.' },
        { t: 'quote', text: 'It isn’t caught by swimming with healthy skin. The real risk lives at the crossing of three things: warm water, an open wound and a vulnerable person.' },
        { t: 'h2', text: 'The three rules that really matter', id: 'local' },
        { t: 'p', html: 'Prevention is almost disappointingly simple. <strong>One:</strong> if you have an open wound, a recent cut, an unhealed tattoo or piercing, cover it with a waterproof dressing before swimming —or that day skip very warm, stagnant water—. <strong>Two:</strong> if you’re in a risk group, avoid raw or undercooked shellfish in summer. <strong>Three:</strong> if after a swim a wound turns red, swells and hurts out of all proportion within hours, don’t wait: see a doctor and mention you’ve been in the sea. With Vibrio, speed changes everything.' },
        { t: 'p', html: 'And a note so as not to mix concepts: the presence of <em>Vibrio</em> is <strong>not measured</strong> by lifeguard flags or the usual <a href="/en/blue-flag">water-quality</a> sampling, which monitors faecal contamination. They’re different things. Even so, choosing well helps: checking the sea state of the day and steering clear of spots with discharges or poor water renewal is common sense that cuts any microbiological risk. Translated: next time you read "flesh-eating bacteria on the beaches", you’ll know they mean something real but rare, that almost never infects healthy people and is dodged with a plaster and by not eating raw oysters. The headline wanted the scare; reality asks for common sense.' },
      ],
      faq: [
        { q: 'Can you catch Vibrio just by swimming in the sea?', a: 'Not with healthy skin. Vibrio vulnificus needs a way in: an open wound, a cut, a recent tattoo or piercing in contact with the water, or eating raw or undercooked shellfish (especially oysters). Swimming with intact skin is not the route of infection.' },
        { q: 'Is the "flesh-eating bacteria" dangerous for everyone?', a: 'No. In healthy people infection is rare and usually mild. Serious risk concentrates in people with liver disease, diabetes, cancer, immunosuppression or advanced age. When it happens it can be serious, so cover wounds and act quickly if symptoms appear.' },
        { q: 'How do I avoid Vibrio at the beach?', a: 'Cover any wound, cut, recent tattoo or piercing with a waterproof dressing before swimming, or that day avoid very warm, stagnant water. Avoid raw or undercooked shellfish if you are in a risk group. And if a wound becomes inflamed and very painful within hours of a swim, see a doctor and mention you were in the sea.' },
        { q: 'Do flags or water quality warn about Vibrio?', a: 'Not directly. Lifeguard flags report the sea state and official water-quality sampling monitors faecal contamination, not Vibrio. They are different controls, but choosing beaches with good water quality and renewal reduces microbiological risk overall.' },
      ],
    },
  },
]

// Inyecta la foto real (si existe en el sidecar) en cada artículo.
{
  const map = HERO_IMAGES as Record<string, { url: string; thumb?: string; source: string; author?: string }>
  for (const a of ARTICLES) {
    const img = map[a.slug]
    if (img?.url) {
      a.heroImage = img.url
      a.heroThumb = img.thumb ?? img.url
      a.heroCredit = { author: img.author, source: img.source }
    }
  }
}

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
