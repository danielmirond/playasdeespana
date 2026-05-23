// src/lib/embarcaciones.ts
//
// Catálogo de destinos premium para alquiler de yate/catamarán.
// Diseñado a partir del análisis SEO mayo 2026: queries donde Samboat
// rankea débil (pos 10-30+) pero con CPC alto (€5-26) → oportunidad
// para crear landings editoriales con tag de afiliado Awin.
//
// Cada destino tiene:
//   - slug, nombre, provincia, comunidad
//   - hero descriptive copy
//   - 3-5 calas / fondeos top accesibles en barco (cross-link fichas)
//   - rango de precios real (yate semana, catamarán día, barco día)
//   - destacados editoriales que Samboat NO menciona

export interface DestinoEmbarcacion {
  slug:        string                       // URL slug
  nombre:      string                       // "Ibiza"
  provincia:   string                       // para schema
  comunidad:   string
  enSamboat:   string                       // path en samboat.es para deep-link
  hero:        string                       // 1-2 frases editoriales únicas
  /** Calas/fondeos solo accesibles en barco — engancha por contenido único */
  fondeos:     Array<{ nombre: string; playaSlug?: string; descripcion: string }>
  /** Precios reales del mercado (rango) */
  precios: {
    yateSemana?:     [number, number]      // EUR
    catamaranDia?:   [number, number]
    barcoSinLicDia?: [number, number]
  }
  /** Mejor temporada — diferenciador editorial */
  temporada:   string
  /** Highlight que ningún competidor menciona — moat */
  insider:     string
}

export const DESTINOS_PREMIUM: DestinoEmbarcacion[] = [
  {
    slug:      'ibiza',
    nombre:    'Ibiza',
    provincia: 'Islas Baleares',
    comunidad: 'Baleares',
    enSamboat: 'ibiza-islas-baleares-espana',
    hero:      'Ibiza es el destino #1 de yate y catamarán en España. La isla concentra el 35% de las búsquedas premium del Mediterráneo español y conecta en una jornada con Formentera, Es Vedrà y las calas al norte.',
    fondeos: [
      { nombre: 'Cala Salada',     playaSlug: 'cala-salada',     descripcion: 'Aguas turquesa, mejor desde el mar al mediodía. Anclar a 50 m de la orilla.' },
      { nombre: 'Es Vedrà',                                       descripcion: 'Roca mítica al suroeste. Imprescindible al atardecer. Fondeo de día solamente.' },
      { nombre: 'Cala Llonga',                                    descripcion: 'Bahía protegida ideal para amarrar con familia. Servicios en tierra.' },
      { nombre: 'Cala Bassa',                                     descripcion: 'Aguas cristalinas + chiringuito conocido. Reserva mesa con antelación.' },
      { nombre: 'Cala Conta',                                     descripcion: 'Atardecer top de las Baleares. Anclar al sur de la cala.' },
    ],
    precios: { yateSemana: [12000, 35000], catamaranDia: [800, 2500], barcoSinLicDia: [180, 350] },
    temporada: 'Mayo–octubre. Pico julio-agosto, mejor relación calidad/precio junio y septiembre.',
    insider:   'Los locales recomiendan navegar desde San Antonio hacia el norte (Cala Salada → Punta Galera) en lugar del circuito clásico Formentera/Es Vedrà saturado los meses pico.',
  },
  {
    slug:      'mallorca',
    nombre:    'Mallorca',
    provincia: 'Islas Baleares',
    comunidad: 'Baleares',
    enSamboat: 'palma-de-mallorca-islas-baleares-espana',
    hero:      'Mallorca tiene 550 km de costa con tres caras distintas: la salvaje Serra de Tramuntana, las calas del sureste y la sofisticación de Palma. Yates parten desde Puerto Portals, Andratx o Palma.',
    fondeos: [
      { nombre: 'Cala Varques',                                   descripcion: 'Solo accesible a pie largo o por mar. Aguas vírgenes en pleno verano.' },
      { nombre: 'Cala Mondragó',                                  descripcion: 'Parque natural protegido. Fondeo permitido en boya designada.' },
      { nombre: 'Sa Calobra',                                     descripcion: 'Torrent de Pareis desde el mar. Una de las vistas más fotografiadas de España.' },
      { nombre: 'Cala Pi',                                        descripcion: 'Cala estrecha entre acantilados. Llegar antes del mediodía para amarrar bien.' },
      { nombre: 'Cabrera',                                        descripcion: 'Parque Nacional. Requiere permiso previo de fondeo. Joya marítima.' },
    ],
    precios: { yateSemana: [10000, 28000], catamaranDia: [700, 2000], barcoSinLicDia: [160, 320] },
    temporada: 'Abril–noviembre. Octubre es underrated: 22°C agua, sin gentío, precios -30%.',
    insider:   'Si quieres ver Cabrera, reserva el permiso de fondeo con 6 meses de antelación. Solo se conceden 50 boyas al día en pico verano.',
  },
  {
    slug:      'menorca',
    nombre:    'Menorca',
    provincia: 'Islas Baleares',
    comunidad: 'Baleares',
    enSamboat: 'mahon-islas-baleares-espana',
    hero:      'Menorca es Reserva de la Biosfera UNESCO. Sus calas vírgenes del sur (Macarella, Mitjana, Turqueta) solo se ven plenamente desde el mar.',
    fondeos: [
      { nombre: 'Cala Macarella',                                 descripcion: 'La cala más fotografiada de Baleares. Fondeo gratis al alba o tras 18 h.' },
      { nombre: 'Cala Mitjana',                                   descripcion: 'Aguas turquesa, pinar alrededor. 200 m de fondeo permitido.' },
      { nombre: 'Cala Turqueta',                                  descripcion: 'Acceso por mar muy superior al de tierra (escalera empinada).' },
      { nombre: 'Cala en Porter',                                 descripcion: 'Más urbanizada pero buen amarre y chiringuitos. Buena para grupos.' },
      { nombre: 'Illa de l\'Aire',                                descripcion: 'Pequeña isla al sur con lagartos endémicos. Fondeo de día.' },
    ],
    precios: { yateSemana: [9000, 22000], catamaranDia: [600, 1700], barcoSinLicDia: [140, 280] },
    temporada: 'Mayo–octubre. Junio es perfecto: agua a 22°C, calas vacías.',
    insider:   'Para evitar las multitudes de Macarella, llegar antes de las 10 h o probar Cala Trebalúger (1 cala al sur). Solo accesible por mar y casi siempre vacía.',
  },
  {
    slug:      'formentera',
    nombre:    'Formentera',
    provincia: 'Islas Baleares',
    comunidad: 'Baleares',
    enSamboat: 'formentera-islas-baleares-espana',
    hero:      'Formentera no tiene aeropuerto. La forma natural de descubrirla es por mar — y ahí el catamarán de día desde Ibiza gana. Ses Illetes top mundial.',
    fondeos: [
      { nombre: 'Ses Illetes',     playaSlug: 'platja-dilletes', descripcion: 'TripAdvisor #1 playas de Europa varios años. Arena blanca como Caribe.' },
      { nombre: 'Cala Saona',                                     descripcion: 'Atardecer de cuento. Fondeo protegido del Levante.' },
      { nombre: 'S\'Espalmador',                                  descripcion: 'Islote entre Ibiza y Formentera. Aguas turquesa de postal.' },
      { nombre: 'Es Caló des Mort',                               descripcion: 'Cala microscópica con vistas a Mitjorn. Acceso casi exclusivo por mar.' },
    ],
    precios: { catamaranDia: [800, 2200], barcoSinLicDia: [180, 360] },
    temporada: 'Mayo–octubre. Ses Illetes saturada de junio-agosto, mejor mayo o septiembre.',
    insider:   'El "Ferry-rápido" desde Ibiza tarda 30 min pero te deja en el muelle. Un catamarán privado tarda 1h pero anclas directo en Ses Illetes sin caminar.',
  },
  {
    slug:      'tenerife',
    nombre:    'Tenerife',
    provincia: 'Santa Cruz de Tenerife',
    comunidad: 'Canarias',
    enSamboat: 'tenerife-canarias-espana',
    hero:      'Tenerife es el destino premium atlántico. CPC más alto que Baleares (22€). Avistamiento de cetáceos en Los Cristianos durante todo el año.',
    fondeos: [
      { nombre: 'Los Gigantes',                                   descripcion: 'Acantilados de 600 m. Navegar al pie es experiencia única.' },
      { nombre: 'Masca',                                          descripcion: 'Cala accesible solo por mar (sendero cerrado tras desprendimientos).' },
      { nombre: 'Playa Diego Hernández',                          descripcion: 'Cala nudista poco conocida. Solo se llega navegando.' },
      { nombre: 'Costa Adeje',                                    descripcion: 'Marina de salida principal. Avistamiento de delfines a 15 min.' },
    ],
    precios: { yateSemana: [11000, 30000], catamaranDia: [700, 2100] },
    temporada: 'Todo el año. Pico avistamiento ballenas pilotos en marzo-mayo.',
    insider:   'Las ballenas pilotos viven aquí permanentemente (no migran). Probabilidad de avistamiento >90% en cualquier salida — único en España.',
  },
  {
    slug:      'costa-brava',
    nombre:    'Costa Brava',
    provincia: 'Girona',
    comunidad: 'Cataluña',
    enSamboat: 'girona-cataluna-espana',
    hero:      'La Costa Brava es la opción de proximidad para Barcelona y Madrid. Calas escondidas en el Parc Natural de Cap de Creus accesibles principalmente por mar.',
    fondeos: [
      { nombre: 'Cala Tavallera',                                 descripcion: 'En el Cap de Creus. Sin acceso terrestre. Solo por barco.' },
      { nombre: 'Cala Jugadora',                                  descripcion: 'Pinares dalinianos al borde del agua. Anclar protegido.' },
      { nombre: 'Cadaqués (bahía)',                               descripcion: 'Pueblo blanco, fondeo en la bahía con vistas a la iglesia.' },
      { nombre: 'Cala Aiguafreda',                                descripcion: 'Begur, una de las más famosas. Llegar pronto, llena pasada la 11h.' },
      { nombre: 'Illes Medes',                                    descripcion: 'Reserva marina. Snorkel top peninsular. Fondeo regulado.' },
    ],
    precios: { yateSemana: [8000, 20000], catamaranDia: [600, 1800], barcoSinLicDia: [140, 300] },
    temporada: 'Junio–septiembre. Tramontana puede ser fuerte en mayo y octubre.',
    insider:   'Las Illes Medes tienen el snorkel mejor protegido del Mediterráneo peninsular. Hay zonas donde solo se entra con guía oficial — pregunta al alquilar si tienen permiso.',
  },
  {
    slug:      'barcelona',
    nombre:    'Barcelona',
    provincia: 'Barcelona',
    comunidad: 'Cataluña',
    enSamboat: 'barcelona-cataluna-espana',
    hero:      'Barcelona ofrece catamarán urbano: salidas desde Port Vell o Port Olímpic para ver la ciudad desde el mar al atardecer. CPCs 0.74€ pero volumen 1000 SV/mes.',
    fondeos: [
      { nombre: 'Vista skyline al atardecer',                     descripcion: 'Ruta 2 h saliendo de Port Vell hacia Sitges. Sagrada Familia visible.' },
      { nombre: 'Garraf',                                         descripcion: 'Pequeño puerto a 20 millas. Calas naturales y restaurantes.' },
      { nombre: 'Sitges (bahía)',                                 descripcion: 'Anclar frente al casco antiguo. Cócteles en el barco.' },
    ],
    precios: { catamaranDia: [500, 1500], barcoSinLicDia: [120, 260] },
    temporada: 'Mayo–octubre. Atardeceres top en agosto-septiembre.',
    insider:   'Las "boat parties" de Barcelona suelen ser turistas saturados. Para una experiencia local, alquila catamarán privado con skipper local que conozca calas de Garraf.',
  },
  {
    slug:      'marbella',
    nombre:    'Marbella',
    provincia: 'Málaga',
    comunidad: 'Andalucía',
    enSamboat: 'marbella-andalucia-espana',
    hero:      'Marbella es el destino premium del sur. Puerto Banús concentra el lujo y la salida hacia Estepona, Sotogrande y Gibraltar. CPC del cluster competitivo.',
    fondeos: [
      { nombre: 'Puerto Banús',                                   descripcion: 'Marina icónica. Salidas con yate dan circuito completo a la milla de oro.' },
      { nombre: 'Cala de Mijas',                                  descripcion: 'Costa al este. Aguas más tranquilas que Marbella centro.' },
      { nombre: 'Estepona',                                       descripcion: 'Marina más relajada. 30 min desde Banús.' },
      { nombre: 'Gibraltar (excursión)',                          descripcion: 'Día completo: ver simios, La Línea, y cruzar al peñón.' },
    ],
    precios: { yateSemana: [9000, 28000], catamaranDia: [700, 2000], barcoSinLicDia: [150, 320] },
    temporada: 'Marzo–noviembre (clima suave casi todo el año).',
    insider:   'La hora del avistamiento de delfines en el Estrecho es 11h-15h. Las salidas hacia Tarifa pueden ver ballenas pilotos en julio-agosto.',
  },
]

/** Construye URL Awin para Samboat con destino concreto del catálogo. */
export function urlSamboatPremium(
  destino: DestinoEmbarcacion,
  affid: string,
  clickref: string = 'unuus-21',
): string {
  const samboatUrl = `https://www.samboat.es/alquiler-barco/${destino.enSamboat}`
  const params = new URLSearchParams({
    awinmid:   '32683',
    awinaffid: affid,
    clickref,
    ued:       samboatUrl,
  })
  return `https://www.awin1.com/cread.php?${params}`
}

/** Encuentra destino por slug o devuelve null. */
export function getDestinoBySlug(slug: string): DestinoEmbarcacion | null {
  return DESTINOS_PREMIUM.find(d => d.slug === slug) ?? null
}
