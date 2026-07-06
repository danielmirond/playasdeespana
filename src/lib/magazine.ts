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
  // ───── Diario de playas · Canarias (voz bicéfala) ─────
  {
    slug: 'playa-de-las-teresitas-tenerife-arena-sahara',
    category: 'curiosidades',
    title: 'Playa de las Teresitas, Tenerife: 270.000 toneladas de arena del Sáhara y un dique que le quitó las olas',
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
      title: 'Playa de las Teresitas, Tenerife: 270,000 tonnes of Sahara sand and a breakwater that took its waves away',
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
    title: 'Playa de Liencres, Cantabria: dunas vivas, pinar y las corrientes del río Pas que mandan en el baño',
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
      title: 'Playa de Liencres, Cantabria: living dunes, a pine forest and the river Pas currents that rule the swim',
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
  // ───── Diario de playas · País Vasco (voz bicéfala) ─────
  {
    slug: 'playa-itzurun-zumaia-flysch-marea',
    category: 'curiosidades',
    title: 'Playa de Itzurun, Zumaia: los acantilados que registran 50 millones de años (y la marea que la deja sin arena)',
    excerpt:
      'Flysch, Geoparque de la UNESCO y la línea de la extinción de los dinosaurios en la roca. Lo que de verdad es Itzurun, en Zumaia: no es una playa para tumbarse —pequeña, fría y casi sin arena con la marea alta.',
    heroAlt: 'Acantilado de flysch con láminas de roca verticales sobre la playa de Itzurun en Zumaia, Gipuzkoa, con la ermita de San Telmo arriba',
    heroQuery: 'itzurun,zumaia,flysch,beach',
    author: 'Equipo Playas de España',
    datePublished: '2026-07-06T07:47:22Z',
    readingMin: 5,
    related: [
      { href: '/comunidad/pais-vasco', label: 'Playas del País Vasco' },
      { href: '/playas-secretas', label: 'Playas y calas poco conocidas' },
      { href: '/calas-con-encanto', label: 'Calas con encanto' },
    ],
    body: [
      { t: 'p', html: 'Bajas por las escaleras desde el casco de Zumaia y, antes de pisar la arena, lo que te frena en seco es la pared: cientos de láminas de roca apiladas en vertical, como las hojas de un libro de piedra puesto de canto, subiendo por el acantilado hasta la ermita de San Telmo, que vigila el mar desde lo alto. No es un decorado, aunque lo parezca: aquí rodaron Rocadragón en <em>Juego de Tronos</em>, y se entiende por qué buscaron este sitio y no otro. Itzurun no recibe con una lámina de arena dorada, sino con una lección de geología a tamaño catedral.' },
      { t: 'p', html: 'Porque esta playa de Zumaia, en la costa de Gipuzkoa, no va de tumbarse al sol: va de mirar hacia arriba. Esas franjas grises y ocres del <strong>flysch</strong> son el mayor atractivo, y el mar —frío, batido, cántabro— es aquí casi un actor secundario. Conviene saberlo antes de cargar la sombrilla: Itzurun premia al curioso y descoloca al que solo busca playa.' },
      { t: 'h2', text: 'Los datos (y lo que no te cuentan)', id: 'datos' },
      { t: 'p', html: 'El flysch de Zumaia forma parte del <strong>Geoparque de la Costa Vasca</strong>, reconocido por la UNESCO (UNESCO Global Geopark). Sus acantilados guardan una secuencia de estratos casi continua que abarca <strong>más de 50 millones de años</strong> de historia de la Tierra, leídos capa a capa como los anillos de un árbol gigante. Y entre esas capas hay una línea fina y oscura que atrae a geólogos de medio mundo: el <strong>límite Cretácico-Paleógeno</strong>, la huella del impacto que acabó con los dinosaurios hace unos <strong>66 millones de años</strong>, uno de los registros mejor conservados del planeta. Zumaia es, además, referencia mundial de estratigrafía: aquí se fijaron "clavos de oro" (GSSP) que definen etapas del Paleoceno. La fama saltó al gran público en 2017, cuando esta costa fue Rocadragón en <em>Juego de Tronos</em>.' },
      { t: 'p', html: 'Y aquí la letra pequeña que ningún reel enseña: <strong>Itzurun no es una playa para un día de playa</strong>. Es pequeña, de arena oscura y grava, y <strong>con la marea alta se queda casi sin arena</strong>: el agua sube hasta el pie del acantilado y solo asoma la plataforma de roca. El mar es <strong>cántabro, frío</strong> (rara vez cómodo más allá de julio y agosto) y con <strong>oleaje y corrientes</strong> propios de una costa abierta; hay bandera y socorrista en temporada, pero no es un chapoteadero para niños pequeños. Súmale que en verano <strong>aparcar en Zumaia es un suplicio</strong> y que la fama televisiva y geológica llena el mirador y las escaleras. La postal del acantilado sale gratis; el baño cómodo, no siempre.' },
      { t: 'h2', text: 'El criterio del local', id: 'local' },
      { t: 'p', html: 'El truco que casi nadie te cuenta invierte la lógica de la playa: aquí la marea buena para lo que merece la pena <strong>es la baja</strong>. Con marea baja se descubre la <strong>rasa mareal</strong>, la plataforma de flysch que se adentra en el mar como un suelo rayado interminable; es el momento de caminar sobre las capas, ver de cerca el límite de los dinosaurios y hacer la foto que atrae a todo el mundo. Con marea alta, todo eso desaparece bajo el agua y te quedas sin arena y sin plataforma. Consulta la tabla de mareas de Zumaia antes de salir y decide a qué vienes: <strong>geología con marea baja, el poco baño que hay con la media</strong>.' },
      { t: 'p', html: 'Lo demás es sentido común de costa abierta: respeta las <strong>banderas</strong> y no te confíes con el oleaje ni las corrientes; ve <strong>fuera de agosto o a primera hora</strong> para esquivar el gentío y el problema del coche; y calza algo con suela para pisar la roca húmeda, que resbala. El plan redondo es hacer un tramo de la <strong>Ruta del Flysch</strong> —a pie hacia Deba o en las salidas en barco del geoparque— para ver el acantilado desde el mar. ¿Quieres además arena de verdad para el baño largo? La tienes al otro lado de la ría, en la <strong>playa de Santiago</strong> (la misma Zumaia), más amplia y resguardada, o un poco más allá en <strong>Deba</strong>. Itzurun para el asombro geológico; la vecina para tumbarte.' },
      { t: 'quote', text: 'No es una "playa secreta": es un libro de 50 millones de años abierto en un acantilado. Y lo mejor no pasa con la marea alta, sino cuando el mar se retira y deja leer las páginas.' },
      { t: 'p', html: 'Porque a Itzurun no se baja a por una toalla y un chapuzón, sino a mirar el tiempo profundo puesto de pie: la línea que separa el mundo de los dinosaurios del nuestro, a la altura de tus ojos, con las gaviotas gritando arriba y el Cantábrico royendo la roca abajo. Acierta con la marea baja, sube a la ermita de San Telmo al atardecer y entenderás por qué medio Zumaia mira este acantilado como quien mira un reloj. Equivócate de hora y de mes, y te llevarás una cala pequeña, fría y con cola para la foto.' },
    ],
    faq: [
      { q: '¿Por qué es tan famosa la playa de Itzurun, en Zumaia?', a: 'Por su flysch: acantilados de estratos que registran más de 50 millones de años de historia de la Tierra, dentro del Geoparque de la Costa Vasca (UNESCO). En ellos se lee el límite Cretácico-Paleógeno, la marca de la extinción de los dinosaurios hace unos 66 millones de años. Su fama creció en 2017 al servir de Rocadragón en Juego de Tronos.' },
      { q: '¿Cuál es la mejor marea para visitar Itzurun?', a: 'La marea baja: descubre la rasa mareal, la plataforma de flysch donde se caminan las capas de roca y se ven de cerca los estratos. Con la marea alta el agua sube hasta el acantilado y la playa se queda casi sin arena. Consulta la tabla de mareas de Zumaia antes de ir.' },
      { q: '¿Se puede uno bañar en la playa de Itzurun?', a: 'Sí, en temporada tiene bandera y socorrista, pero es un baño de costa abierta: agua cántabra fría, oleaje y corrientes, y poca arena en pleamar. No es para niños pequeños ni para un día largo de playa. Para eso conviene la playa de Santiago, al otro lado de la ría en la propia Zumaia, o la vecina Deba.' },
    ],
    en: {
      title: 'Playa de Itzurun, Zumaia: cliffs that record 50 million years — and a tide that strips the sand away',
      excerpt: 'Basque Coast flysch, a UNESCO geopark and the dinosaurs’ extinction line in the rock. What Itzurun in Zumaia really is: not a sunbathing beach — small, cold, and mostly gone at high tide.',
      related: [
        { href: '/en/crystal-clear-water-beaches', label: 'Crystal-clear water beaches' },
        { href: '/en/magazine', label: 'More from the Magazine' },
      ],
      body: [
        { t: 'p', html: 'You come down the steps from the old town of Zumaia and, before you set foot on the sand, what stops you dead is the wall: hundreds of rock sheets stacked vertically, like the pages of a stone book stood on its edge, climbing the cliff to the San Telmo hermitage that watches the sea from above. It isn’t a film set, though it looks like one: Dragonstone in <em>Game of Thrones</em> was shot here, and you understand why they chose this spot and no other. Itzurun greets you not with a sheet of golden sand but with a geology lesson the size of a cathedral.' },
        { t: 'p', html: 'Because this beach in Zumaia, on the Gipuzkoa coast, isn’t about lying in the sun: it’s about looking up. Those grey and ochre bands of <strong>flysch</strong> are the real draw, and the sea — cold, rough, Cantabrian — is almost a supporting actor here. Worth knowing before you load the parasol: Itzurun rewards the curious and wrong-foots anyone who just wants a beach.' },
        { t: 'h2', text: 'The facts (and what they don’t tell you)', id: 'facts' },
        { t: 'p', html: 'The Zumaia flysch is part of the <strong>Basque Coast Geopark</strong>, recognised by UNESCO (UNESCO Global Geopark). Its cliffs hold an almost continuous sequence of strata spanning <strong>more than 50 million years</strong> of Earth’s history, read layer by layer like the rings of a giant tree. And among those layers runs a thin dark line that draws geologists from across the world: the <strong>Cretaceous–Palaeogene boundary</strong>, the mark of the impact that wiped out the dinosaurs some <strong>66 million years ago</strong>, one of the best-preserved records on the planet. Zumaia is also a global reference in stratigraphy: "golden spikes" (GSSPs) defining stages of the Palaeocene were fixed here. Its fame reached the wider public in 2017, when this coast became Dragonstone in <em>Game of Thrones</em>.' },
        { t: 'p', html: 'And here’s the small print no reel shows: <strong>Itzurun is not a beach for a beach day</strong>. It’s small, dark sand and gravel, and <strong>at high tide it’s left almost without sand</strong>: the water rises to the foot of the cliff and only the rock platform shows. The sea is <strong>Cantabrian and cold</strong> (rarely comfortable beyond July and August), with <strong>swell and currents</strong> typical of an open coast; there’s a flag and lifeguard in season, but it’s no paddling pool for small children. Add that in summer <strong>parking in Zumaia is a nightmare</strong> and that the TV and geological fame fills the viewpoint and the steps. The cliff postcard is free; the comfortable swim, not always.' },
        { t: 'h2', text: 'The local’s take', id: 'local' },
        { t: 'p', html: 'The trick almost nobody tells you flips beach logic: here the good tide for what’s worth seeing <strong>is the low one</strong>. At low tide the <strong>tidal platform</strong> is uncovered — the flysch shelf running out to sea like an endless striped floor; that’s the moment to walk on the layers, see the dinosaurs’ boundary up close and take the photo that draws everyone. At high tide all of it vanishes under water and you’re left with no sand and no platform. Check the Zumaia tide table before you leave and decide what you’ve come for: <strong>geology at low tide, the little swimming there is at half tide</strong>.' },
        { t: 'p', html: 'The rest is open-coast common sense: respect the <strong>flags</strong> and don’t take the swell or the currents lightly; go <strong>outside August or first thing</strong> to dodge the crowds and the parking problem; and wear something with grip for the wet rock, which is slippery. The perfect plan is to walk a stretch of the <strong>Flysch Route</strong> — on foot towards Deba or on the geopark boat trips — to see the cliff from the sea. Want actual sand for a long swim too? It’s on the other side of the estuary, at <strong>Santiago beach</strong> (also in Zumaia), wider and more sheltered, or a little further on in <strong>Deba</strong>. Itzurun for the geological wonder; its neighbour for lying down.' },
        { t: 'quote', text: 'It isn’t a "secret beach": it’s a 50-million-year book open on a cliff face. And the best of it happens not at high tide, but when the sea pulls back and lets you read the pages.' },
        { t: 'p', html: 'Because you don’t come down to Itzurun for a towel and a dip, but to look at deep time standing upright: the line that separates the dinosaurs’ world from ours, level with your eyes, gulls screaming above and the Cantabrian gnawing the rock below. Get the low tide right, climb up to the San Telmo hermitage at dusk, and you’ll understand why half of Zumaia watches this cliff the way you’d watch a clock. Get the hour and the month wrong, and you’ll take home a small, cold cove with a queue for the photo.' },
      ],
      faq: [
        { q: 'Why is Itzurun beach in Zumaia so famous?', a: 'For its flysch: cliffs of strata recording more than 50 million years of Earth’s history, within the Basque Coast Geopark (UNESCO). The Cretaceous–Palaeogene boundary — the mark of the dinosaurs’ extinction some 66 million years ago — can be read in them. Its fame grew in 2017 when it served as Dragonstone in Game of Thrones.' },
        { q: 'Which tide is best for visiting Itzurun?', a: 'Low tide: it uncovers the tidal platform, the flysch shelf where you can walk on the rock layers and see the strata up close. At high tide the water rises to the cliff and the beach is left almost without sand. Check the Zumaia tide table before going.' },
        { q: 'Can you swim at Itzurun beach?', a: 'Yes — in season it has a flag and lifeguard — but it’s an open-coast swim: cold Cantabrian water, swell and currents, and little sand at high tide. It’s not for small children or a long beach day. For that, Santiago beach on the other side of the estuary in Zumaia itself, or neighbouring Deba, is better.' },
      ],
    },
  },
  // ───── Diario de playas · Cantabria (voz bicéfala) ─────
  {
    slug: 'playa-oyambre-cantabria-avion-1929',
    category: 'curiosidades',
    title: 'Playa de Oyambre, Cantabria: la playa donde aterrizó en 1929 un avión que cruzó el Atlántico sin escalas',
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
      title: 'Playa de Oyambre, Cantabria: the beach where a plane that had just crossed the Atlantic non-stop landed in 1929',
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
    title: 'Las mejores playas para snorkel en la Costa Brava: dónde ver mero y coral (y la reserva a la que solo entras con guía)',
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
      title: 'The best snorkelling beaches on the Costa Brava: where to see grouper and coral (and the reserve you only enter with a guide)',
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
    title: 'Qué hacer si te pica una medusa: los pasos correctos (y por qué la orina y el vinagre no siempre valen)',
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
      title: 'What to do if a jellyfish stings you: the steps that work (and why urine and vinegar don’t always)',
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
    title: 'Menorca en barco: la ruta de calas vírgenes a las que no llega la carretera (y dónde fondear sin multa)',
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
      title: 'Menorca by boat: the route to wild coves the road can’t reach (and where to anchor without a fine)',
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
    title: 'Playa de Benijo, Tenerife: arena negra y los roques de postal, pero el baño es para valientes',
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
      title: 'Playa de Benijo, Tenerife: black sand and postcard sea stacks — but swimming is for the brave',
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
    title: 'Cala Macarelleta, Menorca: la cala de las fotos a la que en agosto no puedes llegar en coche',
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
      title: 'Cala Macarelleta, Menorca: the postcard cove you can’t reach by car in August',
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
    title: 'Cala Granadella, Xàbia: la "mejor playa de España" que conviene saber pisar',
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
      title: 'Cala Granadella, Xàbia: the "best beach in Spain" you need to know how to visit',
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
    title: 'Playa de Rodas, Islas Cíes: la "mejor playa del mundo" a la que no puedes llegar sin permiso',
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
      title: 'Playa de Rodas, Cíes Islands: the "best beach in the world" you can’t reach without a permit',
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
