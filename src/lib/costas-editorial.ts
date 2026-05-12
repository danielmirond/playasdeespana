// src/lib/costas-editorial.ts
//
// Contenido editorial enriquecido para las pillar pages /top/[slug].
// Cada costa puede tener (todos opcionales):
//   - intro: 2-3 párrafos editoriales (200-400 palabras)
//   - mejorEpoca: cuándo ir + por qué
//   - tiposDestacados: qué tipos de playa abundan en esta costa
//     (link a /playas-aguas-cristalinas, /calas-con-encanto, etc.)
//   - municipios: top 4-6 municipios costeros con el slug si existe
//     página propia
//   - faq: preguntas frecuentes específicas de la costa
//
// Estrategia: empezamos con copy completo solo en las costas top
// (Costa Brava, Costa del Sol, Costa de la Luz, Baleares, Canarias).
// Las demás caen al template básico. Pillar pages son inversión a
// largo plazo: mejor 5 costas con contenido rico que 19 con thin.

export interface CostaEditorial {
  intro?:           string[]
  mejorEpoca?:      { ventana: string; razon: string }[]
  tiposDestacados?: { slug: string; nombre: string; razon: string }[]
  municipios?:      { nombre: string; slug?: string; resumen: string }[]
  faq?:             { q: string; a: string }[]
}

export const COSTAS_EDITORIAL: Record<string, CostaEditorial> = {
  'costa-brava': {
    intro: [
      'La Costa Brava se extiende a lo largo de 220 kilómetros desde Blanes hasta la frontera francesa, en la provincia de Girona. Es probablemente la costa con mayor concentración de calas escondidas de la península: rincones que se alcanzan por sendero costero (camí de ronda) entre acantilados de pinos y aguas turquesa.',
      'A diferencia de otras zonas mediterráneas, la Costa Brava conserva un equilibrio entre desarrollo turístico (Lloret, Tossa, Platja d\'Aro) y costa virgen (Cap de Creus, Aiguablava, Begur). Los pueblos medievales del interior — Pals, Peratallada, Begur — se conectan con sus calas en menos de 10 minutos.',
      'La gastronomía local ronda el mar y montaña catalán: erizos, gambas de Palamós, suquet de peix. Salvador Dalí dejó su huella en Cadaqués, Port Lligat y Figueres, todo a una hora del litoral.',
    ],
    mejorEpoca: [
      { ventana: 'Junio', razon: 'Agua a 22 °C, sin masificación, sendero costero practicable.' },
      { ventana: 'Septiembre',     razon: 'Mar más cálido del año (24 °C), turismo bajando, mejor relación calidad-precio.' },
      { ventana: 'Mayo / Octubre', razon: 'Para senderismo costero (camí de ronda) sin calor extremo.' },
    ],
    tiposDestacados: [
      { slug: '/calas-con-encanto',          nombre: 'Calas con encanto',         razon: 'La Costa Brava es la costa con más calas vírgenes accesibles a pie de la península.' },
      { slug: '/playas-aguas-cristalinas',   nombre: 'Aguas cristalinas',         razon: 'Sin desembocaduras de ríos importantes y con fondos rocosos, la transparencia es excepcional.' },
      { slug: '/buceo',                       nombre: 'Buceo y snorkel',           razon: 'Reservas marinas como Illes Medes (1 700 especies catalogadas) y Cap de Creus.' },
      { slug: '/alquiler-barco-playa',       nombre: 'Alquiler de barco',         razon: 'Muchas calas solo se llegan por mar. Puertos pesqueros con flota de alquiler.' },
    ],
    municipios: [
      { nombre: 'Cadaqués',           slug: 'cadaques',         resumen: 'Pueblo blanco al pie del Cap de Creus. Casa-museo de Dalí.' },
      { nombre: 'Tossa de Mar',       slug: 'tossa-de-mar',     resumen: 'Castillo medieval frente al mar y cala principal de aguas claras.' },
      { nombre: 'Begur',              slug: 'begur',            resumen: 'Sa Riera, Sa Tuna, Aiguablava. Las calas más bonitas de la costa.' },
      { nombre: 'Calella de Palafrugell', slug: 'palafrugell',  resumen: 'Casas blancas a pie de mar, sin alta densidad. Habanera viva.' },
      { nombre: 'L\'Escala',         slug: 'l-escala',         resumen: 'Anchoas históricas y ruinas griegas y romanas de Empúries en la propia playa.' },
    ],
    faq: [
      { q: '¿Cuánto cuesta aparcar en las calas de la Costa Brava?',
        a: 'En verano (junio-septiembre) la mayoría de calas tiene parking de pago entre 5 y 15 € al día. Calas remotas como Sa Tuna o Aiguablava limitan el acceso por aforo: conviene llegar antes de las 10:00 o coger el bus desde el pueblo. Algunas (Aiguafreda, Aiguablava) tienen prohibido el acceso en coche en julio-agosto.' },
      { q: '¿Es seguro el sendero costero (camí de ronda)?',
        a: 'Sí. Está señalizado en su mayor parte y no requiere experiencia. Tramos como Begur–Aiguafreda o Llafranc–Tamariu son aptos para familias. Los más expuestos están en la zona de Cap de Creus. Llevar agua, calzado deportivo y protección solar.' },
      { q: '¿Qué cala de la Costa Brava es la más cristalina?',
        a: 'Aiguablava (Begur), Cala Pola (Tossa), Cala Sa Tuna y la Platja del Castell (Palamós) destacan por la transparencia del agua, gracias a fondos rocosos y ausencia de ríos cercanos. En verano la visibilidad supera fácilmente los 15 metros.' },
    ],
  },

  'costa-del-sol': {
    intro: [
      'La Costa del Sol es el motor turístico del litoral mediterráneo español: 160 kilómetros de costa malagueña, 320 días de sol al año y una infraestructura hotelera consolidada desde los años 60. Marbella, Estepona, Fuengirola, Torremolinos, Nerja: nombres que aparecen en las guías desde hace décadas.',
      'A pesar de la masificación, conserva sus tesoros: la cala del Cañuelo (Maro-Cerro Gordo) está protegida como paraje natural, las playas de Maro tienen aguas turquesa por las cuevas submarinas, y la zona oriental (Nerja, Torrox) mantiene un ritmo más pausado.',
      'El paseo marítimo unificado (Senda Litoral) conecta más de 50 km de playas continuas, único en Europa. Chiringuitos con espetos de sardinas, vida nocturna, golf y el aeropuerto internacional de Málaga a 20 minutos de cualquier punto.',
    ],
    mejorEpoca: [
      { ventana: 'Mayo',          razon: 'Agua a 19 °C, ya cálida pero sin avalancha turística. Precios bajos.' },
      { ventana: 'Septiembre',    razon: 'Pico de temperatura del agua (23 °C). Los hoteles bajan precio.' },
      { ventana: 'Diciembre',     razon: 'Único lugar de Europa continental con 18-20 °C ambiente. Bañistas en Navidad.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Senda Litoral, accesibilidad PMR, socorrismo y servicios completos en casi todas.' },
      { slug: '/banderas-azules',           nombre: 'Bandera Azul',             razon: 'Málaga lidera España en banderas azules: 30+ playas certificadas en 2026.' },
      { slug: '/playas-accesibles',         nombre: 'Playas accesibles',        razon: 'Pioneros en accesibilidad PMR: pasarelas, sillas anfibias, aseos adaptados.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'La orientación SO de la costa malagueña ofrece puestas de sol espectaculares.' },
    ],
    municipios: [
      { nombre: 'Marbella',     slug: 'marbella',     resumen: 'Lujo y golf, pero también playas accesibles y largos paseos marítimos.' },
      { nombre: 'Nerja',        slug: 'nerja',        resumen: 'Balcón de Europa y la cala más turquesa de la costa: Maro-Cerro Gordo.' },
      { nombre: 'Estepona',     slug: 'estepona',     resumen: 'La nueva Marbella sin el ruido. Playas largas y casco antiguo florido.' },
      { nombre: 'Fuengirola',   slug: 'fuengirola',   resumen: 'Familiar por antonomasia, paseo marítimo de 8 km y castillo Sohail.' },
    ],
    faq: [
      { q: '¿Cuál es la playa más bonita de la Costa del Sol?',
        a: 'Maro (Nerja) y Cala del Cañuelo (Maro-Cerro Gordo) son las dos más espectaculares de la costa: aguas turquesa por las cuevas submarinas, acantilados rojizos y entorno protegido. Para playa larga y accesible, Burriana (Nerja) o Cabopino (Marbella).' },
      { q: '¿Cuándo es la mejor época para la Costa del Sol?',
        a: 'Septiembre es el mes ideal: agua a 23 °C (su pico anual), sol garantizado, hoteles bajan precio tras el verano y el ambiente es más relajado que en agosto. Mayo es la otra ventana óptima si prefieres temperatura moderada y descuentos pre-temporada.' },
      { q: '¿Hay playas vírgenes en la Costa del Sol?',
        a: 'Sí, sobre todo en el extremo oriental. Maro-Cerro Gordo (entre Nerja y Almuñécar) tiene calas accesibles solo a pie. La Cala del Cañuelo, Las Alberquillas y Molino de Papel mantienen la sensación de costa salvaje a pesar de estar en zona protegida.' },
    ],
  },

  'costa-de-la-luz': {
    intro: [
      'La Costa de la Luz se extiende de norte a sur por las provincias de Huelva y Cádiz, mirando al Atlántico. Su nombre lo dice todo: la luz aquí tiene una calidad distinta — el viento del Levante limpia la atmósfera y devuelve cielos como en pocos sitios de la península.',
      'Mientras la Costa del Sol se llena, la Costa de la Luz mantiene playas de varios kilómetros casi vacías incluso en agosto. Bolonia, Zahara de los Atunes, El Palmar, Caños de Meca: nombres que evocan dunas, pinares cerca del mar y ese viento de Poniente o Levante que define el día.',
      'Es la costa del kitesurf y el windsurf por excelencia. Tarifa concentra la mayor flota mundial de kite. La gastronomía gira alrededor del atún rojo de almadraba (Zahara, Conil, Barbate) y los chiringuitos suelen ser de tablones y atún braseado.',
    ],
    mejorEpoca: [
      { ventana: 'Junio',                 razon: 'Levante moderado, agua a 21 °C, playas semi-vacías.' },
      { ventana: 'Mediados de septiembre', razon: 'Caída brusca de turistas, agua aún a 22 °C, mejores días sin viento.' },
      { ventana: 'Abril–Mayo',            razon: 'Para kitesurf y windsurf: viento constante y temperatura amable.' },
    ],
    tiposDestacados: [
      { slug: '/kitesurf',                  nombre: 'Kitesurf',                 razon: 'Tarifa es la capital mundial. Vientos de Levante y Poniente todo el año.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Las dunas de Doñana ocultan playas de 30 km totalmente vírgenes.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'Orientación oeste y atmósfera limpia: las puestas de sol son legendarias.' },
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Bolonia y sus dunas, Caños de Meca, El Palmar: playas sin urbanizar.' },
    ],
    municipios: [
      { nombre: 'Tarifa',           slug: 'tarifa',           resumen: 'Capital mundial del kite, dos mares (Mediterráneo y Atlántico) en 10 km.' },
      { nombre: 'Conil de la Frontera', slug: 'conil-de-la-frontera', resumen: 'Calas pequeñas (Roche), playas largas (Conil) y atún de almadraba.' },
      { nombre: 'Zahara de los Atunes', slug: 'zahara-de-los-atunes', resumen: 'Pueblo blanco frente a una playa de 8 km. Atún rojo y atardeceres.' },
      { nombre: 'Barbate',          slug: 'barbate',          resumen: 'Acantilados de Caños de Meca, faro de Trafalgar y pinares hasta el mar.' },
      { nombre: 'Matalascañas',     slug: 'matalascanas',     resumen: 'Frontera con Doñana. Tras las dunas, parque nacional con flamencos.' },
    ],
    faq: [
      { q: '¿Hay tiburones en la Costa de la Luz?',
        a: 'No de forma habitual. La caballa, el atún y los pequeños tintoreros viven mar adentro. En 2010 hubo un avistamiento puntual cerca de Tarifa que cerró playas pero no se ha repetido. La fauna habitual son delfines (común y mular) y orcas en mayo-junio en el Estrecho.' },
      { q: '¿Cuándo no hay viento en Tarifa y la Costa de la Luz?',
        a: 'Ningún mes está exento, pero septiembre y octubre tienen los días más calmados. La mayoría de días tiene viento de Levante (sopla del este) o Poniente (del oeste). Los días "sin viento" suelen ser dos o tres por semana en plena temporada y son una bendición para nadar.' },
      { q: '¿Cuál es la playa más virgen de la Costa de la Luz?',
        a: 'Las dunas de Castilla y la playa de Mazagón en Huelva, que se extienden 28 km dentro del Parque Natural de Doñana sin urbanización. Para acceso fácil, Bolonia, El Palmar y Caños de Meca conservan ese carácter virgen aunque tengan chiringuitos.' },
    ],
  },

  'islas-baleares': {
    intro: [
      'Las Islas Baleares — Mallorca, Menorca, Ibiza y Formentera — son el archipiélago mediterráneo con más diversidad de playas de Europa. Cada isla tiene su personalidad: Mallorca combina calas turquesa (Cala Mondragó, S\'Amarador) con playas extensas (Playa de Muro, Es Trenc); Menorca es la isla de las calas vírgenes (Macarella, Cala Mitjana); Ibiza junta playas familiares (Cala Bassa) con caletas remotas (Cala d\'Hort, Aigües Blanques); y Formentera tiene la mejor relación arena-agua del país (Ses Illetes, Llevant).',
      'La posidonia oceánica — patrimonio UNESCO en Formentera — explica esa transparencia única: filtra el agua y le da el característico azul-turquesa. En septiembre y octubre las masas turistas se van pero el agua sigue a 24 °C.',
      'Llegar a las calas más pequeñas requiere a menudo barco o sendero costero. Muchos puertos tienen alquiler de embarcaciones sin titulación (hasta 6m) que abren los rincones imposibles por carretera.',
    ],
    mejorEpoca: [
      { ventana: 'Junio',                  razon: 'Agua aún fresca (21 °C) pero playas semi-vacías y precios pre-temporada.' },
      { ventana: 'Mediados de septiembre', razon: 'Pico térmico del agua (25 °C), turismo bajando, alojamientos a la mitad de precio.' },
      { ventana: 'Abril–Mayo',             razon: 'Senderismo costero con flores y temperaturas de 22 °C ambiente. Calas vacías.' },
    ],
    tiposDestacados: [
      { slug: '/calas-con-encanto',          nombre: 'Calas con encanto',        razon: 'Menorca tiene 75 calas catalogadas; Mallorca y Formentera, decenas más.' },
      { slug: '/playas-aguas-cristalinas',   nombre: 'Aguas cristalinas',        razon: 'Las Baleares son el referente mediterráneo de transparencia (gracias a la posidonia).' },
      { slug: '/alquiler-barco-playa',       nombre: 'Alquiler de barco',        razon: 'Muchas calas solo se llegan por mar. Es la forma más eficaz de aprovechar la isla.' },
      { slug: '/buceo',                       nombre: 'Buceo',                    razon: 'Reservas marinas (Migjorn, Cabrera, S\'Albufera des Grau) con vida abundante.' },
    ],
    municipios: [
      { nombre: 'Santanyí (Mallorca)',     slug: 'santanyi',         resumen: 'Cala Mondragó, S\'Amarador, Cala Llombards. Calas turquesa entre pinos.' },
      { nombre: 'Ciutadella (Menorca)',    slug: 'ciutadella',       resumen: 'Macarella, Cala Mitjana, Turqueta. Las calas top del Mediterráneo.' },
      { nombre: 'Sant Josep (Ibiza)',      slug: 'sant-josep',       resumen: 'Cala d\'Hort (vista a Es Vedrà), Cala Salada, Cala Bassa.' },
      { nombre: 'Formentera',              slug: 'formentera',       resumen: 'Toda la isla. Ses Illetes, Llevant, Migjorn — playas de 5 km de arena fina.' },
    ],
    faq: [
      { q: '¿Cuál es la cala más bonita de Baleares?',
        a: 'Es subjetivo, pero el podio típico incluye: Cala Macarelleta (Menorca) por sus aguas turquesa y la subida al mirador, Ses Illetes (Formentera) por su arena casi blanca y posidonia bajo el agua, y Cala Mondragó (Mallorca) por su entorno protegido sin construcciones. Las tres tienen aforo limitado en julio-agosto.' },
      { q: '¿Hace falta alquilar coche o barco en Baleares?',
        a: 'Coche, sí, casi obligatorio en Mallorca y Menorca para llegar a las calas. Barco no es imprescindible pero abre el 30% de las mejores calas que están sin carretera (Cala Varques, Es Caló des Moro de noche). Hay alquileres sin titulación desde 100 €/día para 4-6 personas.' },
      { q: '¿Cuándo es la mejor época para ir a Baleares sin masificación?',
        a: 'Última semana de septiembre y primera de octubre: el agua está a 24-25 °C (su pico), el turismo nacional ya volvió y las calas vuelven a estar accesibles sin colas. Junio es la otra ventana, agua a 21 °C pero playas vacías.' },
    ],
  },

  'islas-canarias': {
    intro: [
      'Las Islas Canarias son el único destino de España (y prácticamente Europa continental) donde se puede hacer playa los 365 días del año. La temperatura ambiente nunca baja de 18 °C en invierno ni sube de 28 °C en verano, gracias a los vientos alisios y la corriente fría de Canarias.',
      'Cada isla tiene su carácter playero: Fuerteventura concentra las playas más largas y vírgenes (Cofete, Sotavento, El Cotillo); Gran Canaria mezcla dunas de Maspalomas, calas en Mogán y arena negra en el norte; Tenerife alterna arena negra volcánica (Playa Jardín) con arena rubia traída de Sahara (Las Teresitas); Lanzarote ofrece calas entre lava (Papagayo, Famara); La Graciosa es virgen total (sin asfaltar). La Palma, La Gomera y El Hierro reservan playas de piedras y arena negra para senderistas.',
      'El kitesurf en Sotavento (Fuerteventura) y el surf en El Quemao (Lanzarote) o La Caleta (Tenerife) son referentes mundiales. Los amantes del buceo encuentran La Restinga (El Hierro), Las Galletas (Tenerife) y la reserva marina de El Cabrón (Gran Canaria).',
    ],
    mejorEpoca: [
      { ventana: 'Todo el año',         razon: 'Agua entre 19 °C (febrero) y 23 °C (octubre). Sin estacionalidad real.' },
      { ventana: 'Octubre',             razon: 'Pico térmico del agua (23 °C), turismo de invierno aún no llegó. Semivacías.' },
      { ventana: 'Mayo–Junio',          razon: 'Calima rara, vientos alisios moderados, playas tranquilas.' },
    ],
    tiposDestacados: [
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Cofete (Fuerteventura) y Maspalomas son referentes mundiales.' },
      { slug: '/playas-aguas-cristalinas',  nombre: 'Aguas cristalinas',        razon: 'Aguas atlánticas templadas y sin sedimentos: visibilidad excepcional.' },
      { slug: '/buceo',                      nombre: 'Buceo',                    razon: 'La Restinga, Las Galletas, El Cabrón: aguas claras y vida abundante.' },
      { slug: '/surf',                       nombre: 'Surf',                     razon: 'El Quemao (Lanzarote), La Santa, La Caleta. Olas mundiales todo el año.' },
    ],
    municipios: [
      { nombre: 'La Oliva (Fuerteventura)',       slug: 'la-oliva',         resumen: 'El Cotillo y sus lagunas turquesa. Surf, kite y silencio.' },
      { nombre: 'Pájara (Fuerteventura)',         slug: 'pajara',           resumen: 'Cofete (la playa más espectacular de Canarias) y Sotavento.' },
      { nombre: 'San Bartolomé (Gran Canaria)',   slug: 'san-bartolome',    resumen: 'Maspalomas, sus dunas y los kilómetros de playa al sur.' },
      { nombre: 'Adeje (Tenerife)',               slug: 'adeje',            resumen: 'Costa Adeje y sus playas de arena negra y rubia.' },
      { nombre: 'Yaiza (Lanzarote)',              slug: 'yaiza',            resumen: 'Playas de Papagayo: cuatro calas turquesa entre lava.' },
    ],
    faq: [
      { q: '¿Hace frío en el agua de Canarias en invierno?',
        a: 'No. La corriente fría de Canarias mantiene el agua entre 19 y 21 °C en enero-febrero, no muy diferente del Mediterráneo en mayo. Los nadadores experimentados se bañan sin neopreno; los que vienen de centroeuropa, encantados.' },
      { q: '¿Qué isla canaria tiene las mejores playas?',
        a: 'Para playas LARGAS y vírgenes: Fuerteventura sin discusión (Cofete, Sotavento, El Cotillo). Para variedad (arena negra, rubia, dunas): Gran Canaria. Para calas turquesa accesibles: Lanzarote (Papagayo). Para surf y kite: Fuerteventura y Lanzarote. Para buceo: El Hierro y La Palma.' },
      { q: '¿Qué es la calima y cuándo afecta a las playas?',
        a: 'La calima es viento del Sahara cargado de polvo en suspensión. Aparece de forma puntual (5-10 días al año) sobre todo en febrero-marzo y octubre. Cuando hay calima fuerte el sol se vela, sube la temperatura ambiente y baja la visibilidad. No hace daño bañarse pero conviene proteger los ojos y la electrónica.' },
    ],
  },

  // ── Costa Cantábrica ──────────────────────────────────────────────
  'costa-vasca': {
    intro: [
      'La Costa Vasca recorre 150 kilómetros desde la desembocadura del Bidasoa (Hondarribia) hasta Muskiz, en las provincias de Gipuzkoa y Bizkaia. Es la costa más urbana del Cantábrico: las ciudades de Donostia y Bilbao tienen sus propias playas (La Concha, Zurriola, Ondarreta, Las Arenas), y entre medias se suceden pueblos pesqueros vivos — Getaria, Zumaia, Lekeitio, Bermeo — y la mejor ola de Europa, Mundaka.',
      'La temperatura del agua oscila entre 14 °C en febrero y 22 °C en agosto. El swell atlántico que entra por Vizcaya hace que el surf sea consistente todo el año. La luz es la del norte: nubes bajas que se abren al mediodía, atardeceres largos en verano y el verde de los montes hasta la línea del mar.',
      'La gastronomía es razón suficiente para venir: pintxos en San Sebastián, anchoas de Getaria, txuleta, sidra natural en Astigarraga. Y el flysch de Zumaia, la formación geológica más fotogénica de la península, asoma a pie de playa.',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',  razon: 'Agua a 21-22 °C, pico de la temporada. Las playas urbanas se llenan pero las calas (Saturraran, Itzurun, Karraspio) siguen accesibles.' },
      { ventana: 'Septiembre',    razon: 'Mejor mes para sol seguro y agua aún cálida. Surf consistente vuelve. Hoteles más baratos.' },
      { ventana: 'Octubre–marzo', razon: 'Para surf serio: el swell del Atlántico Norte produce las olas más grandes del año en Mundaka, Sopelana y Punta Galea.' },
    ],
    tiposDestacados: [
      { slug: '/surf',                       nombre: 'Surf',                     razon: 'Mundaka, Bakio, Sopelana, Zarautz. La costa de surf más histórica de España.' },
      { slug: '/atardeceres',                nombre: 'Atardeceres',              razon: 'Itzurun (Zumaia), Sakoneta, Saturraran. Acantilados orientados oeste-noroeste.' },
      { slug: '/playas-secretas',            nombre: 'Playas secretas',          razon: 'Pueblos pesqueros entre Lekeitio y Ondarroa esconden calas con acceso a pie.' },
      { slug: '/familias',                   nombre: 'Playas para familias',     razon: 'La Concha, Ondarreta, Las Arenas: socorrismo, paseo marítimo, accesibilidad PMR.' },
    ],
    municipios: [
      { nombre: 'Donostia-San Sebastián', slug: 'donostia',     resumen: 'La Concha y Zurriola en pleno centro. Una de las bahías más bonitas de Europa.' },
      { nombre: 'Mundaka',                slug: 'mundaka',      resumen: 'La ola izquierda más famosa del Atlántico. Pueblo pesquero y reserva de la biosfera.' },
      { nombre: 'Zarautz',                slug: 'zarautz',      resumen: 'La playa de surf por excelencia: 2.500 m de arena, eventos WSL.' },
      { nombre: 'Zumaia',                 slug: 'zumaia',       resumen: 'Itzurun y el flysch de Algorri. Geología espectacular a pie de playa.' },
      { nombre: 'Lekeitio',               slug: 'lekeitio',     resumen: 'Karraspio e Isuntza. Puerto pesquero y bajamar que conecta con Isla de San Nicolás.' },
    ],
    faq: [
      { q: '¿Cuándo es la mejor época para bañarse en el País Vasco?',
        a: 'De finales de julio a mediados de septiembre, cuando la temperatura del agua sube a 20-22 °C y la del aire ronda los 22-26 °C. Antes (junio) y después (octubre) el agua está fría para baño largo pero perfecta para surf. En invierno, el agua baja a 14 °C; solo surfistas con neopreno 4/3.' },
      { q: '¿Es Mundaka la mejor ola de España?',
        a: 'Mundaka tiene la mejor "ola izquierda" del Atlántico cuando rompe con fondo y dirección perfectos (oeste-noroeste, marea baja). Pero la mejor ola depende del nivel: para principiantes Zarautz o Bakio; para intermedios Sopelana o Hendaya; para expertos Mundaka, Roka Putre o Punta Galea.' },
      { q: '¿Cuáles son las playas más bonitas del País Vasco?',
        a: 'La Concha (San Sebastián) por su bahía, Itzurun (Zumaia) por el flysch, Saturraran por las islas-roca, Laga por las dunas, Plentzia por el ambiente urbano-natural. Cada una con su carácter.' },
    ],
  },

  'costa-de-cantabria': {
    intro: [
      'La Costa de Cantabria son 220 km que van desde Castro Urdiales en la frontera con Vizcaya hasta San Vicente de la Barquera, junto a Asturias. Una sucesión de playas largas de arena fina (Sardinero, Liencres, Oyambre), dunas que entran en pinares (Liencres, Berria), pueblos pesqueros con vista al mar (Comillas, San Vicente, Castro Urdiales) y la silueta de los Picos de Europa al fondo.',
      'A diferencia del País Vasco, Cantabria es más rural: la costa alterna playas urbanas con kilómetros de costa virgen. Liencres, las dunas de Berria, Oyambre y la playa de la Concha en Suances son referentes. El agua en agosto llega a 21 °C, suficiente para baño cómodo.',
      'Su gastronomía: anchoas de Santoña, sobaos pasiegos, cocido montañés, y los pescados de las lonjas de Laredo y Santander. La Cueva de Altamira (Santillana del Mar) y los Picos de Europa están a menos de una hora de cualquier playa.',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',     razon: 'Pico de turistas pero playas largas absorben el aforo. Agua a 20-21 °C.' },
      { ventana: 'Mediados septiembre', razon: 'Cantabria queda casi vacía cuando empieza el cole. Hoteles a la mitad.' },
      { ventana: 'Abril–junio',      razon: 'Para senderismo costero y bicicleta: tiempo amable, costa de verde profundo.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'El Sardinero, Comillas, Laredo: anchas, suaves, accesibles, con paseo marítimo.' },
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Liencres y sus dunas, Oyambre, La Concha de Suances. Naturaleza cantábrica intacta.' },
      { slug: '/surf',                       nombre: 'Surf',                     razon: 'Somo, Liencres, Loredo. Olas suaves perfectas para aprender.' },
      { slug: '/playas-autocaravana',       nombre: 'Playas para autocaravana', razon: 'Áreas señalizadas en Noja, Berria, Laredo. Cantabria es muy permisiva con caravanistas.' },
    ],
    municipios: [
      { nombre: 'Santander',               slug: 'santander',               resumen: 'El Sardinero, Magdalena, Camello, Bikinis. Capital con playa urbana variada.' },
      { nombre: 'Comillas',                slug: 'comillas',                resumen: 'Pueblo monumental (Gaudí, Capricho) y playa con paseo de palmeras.' },
      { nombre: 'San Vicente de la Barquera', slug: 'san-vicente-de-la-barquera', resumen: 'Pueblo medieval entre estuario y Picos de Europa. Playas de Merón y Gerra.' },
      { nombre: 'Laredo',                  slug: 'laredo',                  resumen: 'Salvé: 5 km de arena fina al pie del casco antiguo de pescadores.' },
      { nombre: 'Suances',                 slug: 'suances',                 resumen: 'La Concha (la cántabra, no la vasca): playa concéntrica con surf consistente.' },
    ],
    faq: [
      { q: '¿Cuándo se puede bañar uno en Cantabria?',
        a: 'De junio a septiembre con comodidad. El agua llega a 18 °C en junio, pico de 21 °C en agosto-septiembre y vuelve a 17 °C en octubre. Algunos cántabros se bañan los 12 meses, pero requiere costumbre.' },
      { q: '¿Cuál es la playa más bonita de Cantabria?',
        a: 'Liencres por las dunas (sistema dunar mejor conservado del norte), Oyambre por la combinación playa-marisma-pinares, y el Sardinero por la elegancia urbana. Para calas más pequeñas: Cobreces, La Maza, Tagle, Berellín.' },
      { q: '¿Hay playas nudistas en Cantabria?',
        a: 'Sí. La más conocida es Valdearenas-Liencres (zona oeste, cerca de las dunas grandes), pero también Cuberris, La Arena (Castro), El Madero (Suances) y rincones de Berria toleran tradicionalmente el nudismo. Convive con el textil sin problema.' },
    ],
  },

  'costa-verde': {
    intro: [
      'La Costa Verde son 350 km de Asturias, desde la ría del Eo (frontera con Galicia) hasta la del Tinamayor (frontera con Cantabria). Acantilados altos, calas escondidas entre montañas, playas que se forman dentro de meandros, ríos que llegan al mar en estuarios, y un verde intenso que es marca de la casa.',
      'La temperatura del agua oscila entre 15 °C en febrero y 21 °C en septiembre. Las playas son más salvajes que en Cantabria: muchas requieren bajar acantilado o atravesar pinares, y la marea sube y baja hasta 4 metros (mareas vivas), descubriendo calas que desaparecen con pleamar.',
      'Las joyas: Gulpiyuri (la playa interior más famosa de España, sin acceso directo al mar), Cuevas del Mar, Torimbia, Mexota, Playa del Silencio. Tres villas marineras vivas: Cudillero, Lastres, Ribadesella. La gastronomía: fabada, cabrales, sidra natural, lubina al horno. Y los Picos de Europa están aquí también, asomando al mar.',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',     razon: 'Pico de temperatura: 21 °C agua, 25 °C aire. Las playas se llenan pero hay 100+ entre las que elegir.' },
      { ventana: 'Mediados septiembre', razon: 'Asturias vacía. Agua aún cálida. Hoteles libres en Llanes, Ribadesella, Cudillero.' },
      { ventana: 'Mayo–junio',       razon: 'Para senderismo y rutas en bici. Costa virgen sin gente.' },
    ],
    tiposDestacados: [
      { slug: '/calas-con-encanto',         nombre: 'Calas con encanto',        razon: 'Llanes concentra 30 calas en 30 km. Cuevas, Torimbia, Toró, Borizu, Antilles.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Mexota, Cadavedo, Frejulfe, Aramar. Acceso a pie o bajamar.' },
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Playa del Silencio, Gulpiyuri, Torimbia. Geografía de cuento.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'Verdicio, Aguilar, Sablón. Orientación oeste para puestas sobre acantilado.' },
    ],
    municipios: [
      { nombre: 'Llanes',                  slug: 'llanes',                  resumen: '30 playas en su término municipal. Capital playera del oriente asturiano.' },
      { nombre: 'Ribadesella',             slug: 'ribadesella',             resumen: 'Playa de Santa Marina dentro del pueblo, descenso del Sella anual.' },
      { nombre: 'Cudillero',               slug: 'cudillero',               resumen: 'Pueblo pesquero de postal. Acceso a Playa del Silencio (Castañeras).' },
      { nombre: 'Tapia de Casariego',      slug: 'tapia-de-casariego',      resumen: 'Surf consistente, pueblo bonito y campeonato anual.' },
      { nombre: 'Gozón',                   slug: 'gozon',                   resumen: 'Verdicio, Bañugues, Xagó. Cabo Peñas en el medio.' },
    ],
    faq: [
      { q: '¿Cuál es la playa más bonita de Asturias?',
        a: 'Para muchos, Playa del Silencio (Castañeras): acantilado de pizarra, islotes, agua transparente, acceso solo a pie. Otras candidatas: Gulpiyuri (la única playa interior de España), Torimbia (forma de concha perfecta), Cuevas del Mar (arcos y túneles de roca).' },
      { q: '¿Hay buena temperatura del agua en Asturias?',
        a: 'En agosto-septiembre el agua llega a 20-21 °C, cómoda. Junio y octubre rondan 17-18 °C, ya posibles. Resto del año por debajo de 16 °C. Las playas del oriente (Llanes) son ligeramente más cálidas que las del occidente (Tapia, Luarca).' },
      { q: '¿Qué es Gulpiyuri y por qué es famosa?',
        a: 'Es la única playa "interior" de España: un agujero kárstico a 100 m del mar conectado por un túnel submarino. La marea entra y sale, formando una playa de 50 m completa dentro de un prado. Patrimonio natural. Solo accesible a pie desde Naves (Llanes).' },
    ],
  },

  'costa-de-almeria': {
    intro: [
      'La Costa de Almería son 220 kilómetros de litoral desde Mojácar hasta Adra. Es la costa más seca de Europa (200 mm de precipitación al año, similar al norte de África) y la más virgen del Mediterráneo español: el Parque Natural Cabo de Gata-Níjar protege 50 km de costa con calas vírgenes, dunas fósiles y acantilados de origen volcánico.',
      'Las playas emblemáticas — Mónsul, Los Genoveses, Los Muertos, La Cala del Plomo, El Playazo de Rodalquilar — no tienen apenas urbanización, llegan tras 1-2 km de pista de tierra y conservan el aspecto de la película "Indiana Jones y la Última Cruzada" (rodada aquí). El mar Mediterráneo en estado puro.',
      'A esto suma Cabo de Gata el clima más estable de España (320 días de sol), aguas claras (en verano la visibilidad supera los 10 m sin esfuerzo), y una gastronomía donde el pescado azul (caballa, melva, atún de almadraba) compite con las verduras del invernadero y el ajoblanco.',
    ],
    mejorEpoca: [
      { ventana: 'Mayo–junio',      razon: 'Calor sin extremo (25-28 °C), agua a 19-21 °C, playas semi-vacías.' },
      { ventana: 'Mediados septiembre', razon: 'Pico de agua (22-23 °C), poniente moderado, turistas se van.' },
      { ventana: 'Marzo–abril',     razon: 'Para senderismo costero en Cabo de Gata sin sol abrasador. Floración del cardo marítimo.' },
    ],
    tiposDestacados: [
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Mónsul, Los Genoveses, Cala de Enmedio. Aspecto de costa salvaje protegida.' },
      { slug: '/playas-aguas-cristalinas',  nombre: 'Playas con aguas cristalinas', razon: 'Cabo de Gata combina fondos rocosos y vientos suaves: visibilidad excepcional.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Cala San Pedro (solo a pie o en barco), Cala del Plomo, Cala del Carbón.' },
      { slug: '/buceo',                      nombre: 'Buceo y snorkel',          razon: 'Reserva marina de Cabo de Gata: meros, barracudas, pulpos. Cala Carbón, Punta de la Polacra.' },
    ],
    municipios: [
      { nombre: 'Níjar',                   slug: 'nijar',                   resumen: 'Corazón del parque natural. Mónsul, Genoveses, Rodalquilar, San Pedro.' },
      { nombre: 'Carboneras',              slug: 'carboneras',              resumen: 'Playas Los Muertos y El Algarrobico. Pueblo pesquero.' },
      { nombre: 'Mojácar',                 slug: 'mojacar',                 resumen: 'Playas largas para turismo familiar, pueblo blanco moruno encima.' },
      { nombre: 'Almería',                 slug: 'almeria',                 resumen: 'Capital con varias playas urbanas y acceso fácil a Cabo de Gata.' },
      { nombre: 'Roquetas de Mar',         slug: 'roquetas-de-mar',         resumen: 'Las Salinas, Aguadulce. Playas largas, paseo marítimo, vela.' },
    ],
    faq: [
      { q: '¿Por qué Almería tiene aguas tan cristalinas?',
        a: 'Tres razones: poca lluvia (sin escorrentías que enturbien), poca urbanización en Cabo de Gata (sin desagües), y fondos rocosos en vez de arena (no se levanta sedimento con el oleaje). En verano la visibilidad supera fácilmente los 10 m, y en zonas como Cala del Carbón llega a 20 m.' },
      { q: '¿Cómo se llega a Mónsul y Genoveses?',
        a: 'Por carretera AL-3115 desde San José hacia Cabo de Gata. En julio y agosto el acceso en coche está limitado: hay que aparcar en San José y coger bus lanzadera (5 €/día), o ir antes de las 9 AM o después de las 18 PM. Por bici o a pie desde San José: 30-45 minutos.' },
      { q: '¿Hay playas en Almería fuera de Cabo de Gata?',
        a: 'Sí. Carboneras, Mojácar y Vera tienen playas largas urbanas con todos los servicios. La playa nudista oficial más grande de España está en Vera (El Playazo, 1.500 m de arena con dos zonas nudistas claras).' },
    ],
  },

  // ── Atlántica gallega ─────────────────────────────────────────────
  'rias-baixas': {
    intro: [
      'Las Rías Baixas son cuatro grandes entradas de mar en la provincia de Pontevedra: Vigo, Pontevedra, Arousa y Muros-Noia (esta última en A Coruña). Suman más de 200 km de costa con playas resguardadas del Atlántico, arena fina blanca, agua sorprendentemente cálida para el norte (21 °C en agosto) y un horizonte de islas — Cíes, Ons, Sálvora, Cortegada — que forman el Parque Nacional de las Islas Atlánticas.',
      'Playa de Rodas (Cíes) figura en muchas listas como la mejor playa del mundo: 1.300 m de arena de cristal, aguas turquesa por su orientación protegida y solo accesible en barco con permiso del parque (junio-septiembre, aforo limitado). Otras joyas: A Lanzada (más de 2 km de surf y dunas), Areas Gordas (Bayona), Montalvo, Praia das Catedrais — espera, esa está en Lugo.',
      'Las Rías Baixas se viven con marisco: vieiras, mejillón de batea, percebes, navajas, almejas. Cambados es la capital del albariño. Y los pueblos costeros — Combarro, Sanxenxo, Baiona, Cangas — combinan tradición pesquera con turismo cuidado.',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',     razon: 'Pico de temperatura: 21 °C agua, 25 °C aire. Acceso a Cíes activo.' },
      { ventana: 'Mediados septiembre', razon: 'Gallegos vuelven al trabajo. Cíes aún abierto. Mariscadas más baratas.' },
      { ventana: 'Mayo–junio',       razon: 'Para senderos costeros sin calor. Las playas de Cangas o Bueu casi vacías.' },
    ],
    tiposDestacados: [
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Rodas (Cíes), Areas Gordas, A Lanzada, Montalvo. La gallega más vendible.' },
      { slug: '/playas-aguas-cristalinas',  nombre: 'Playas con aguas cristalinas', razon: 'Las rías filtran el oleaje atlántico: aguas más claras del noroeste.' },
      { slug: '/alquiler-barco-playa',       nombre: 'Alquilar barco',           razon: 'Acceso a Cíes (con permiso), Ons y Sálvora. Puerto de Vigo y Sanxenxo.' },
      { slug: '/buceo',                       nombre: 'Buceo',                    razon: 'Reserva del Parque Nacional. Centros en Cangas, Bueu y Vigo.' },
    ],
    municipios: [
      { nombre: 'Sanxenxo',                slug: 'sanxenxo',                resumen: 'Capital turística. Silgar, Areas y A Lanzada en su entorno.' },
      { nombre: 'Vigo (Islas Cíes)',       slug: 'vigo',                    resumen: 'Acceso a Rodas y Figueiras. Reserva del Parque Nacional.' },
      { nombre: 'Cangas',                  slug: 'cangas',                  resumen: 'Frente a Cíes, pueblo pesquero. Playas Melide, Areacova.' },
      { nombre: 'Baiona',                  slug: 'baiona',                  resumen: 'Pueblo histórico (Colón) frente a las islas. Areas Gordas, Ladeira.' },
      { nombre: 'O Grove',                 slug: 'o-grove',                 resumen: 'Conectado por istmo. A Lanzada, San Vicente do Mar.' },
    ],
    faq: [
      { q: '¿Cómo se llega a las Cíes y cuánto cuesta?',
        a: 'Solo en barco regular desde Vigo, Cangas o Baiona (junio-septiembre, 18-22 € ida y vuelta). Se necesita autorización online previa de la Xunta (xunta.gal/cies-illasatlanticas): gratuita pero con aforo diario limitado. Hay que reservarla DÍAS antes en agosto. Sin autorización el barco no permite embarcar.' },
      { q: '¿Cuál es la mejor playa de las Rías Baixas?',
        a: 'Rodas (Cíes) según la mayoría de listas, pero requiere planificación. Si vienes sin reserva: A Lanzada (2.4 km de arena, dunas y surf), Areas Gordas (Bayona, vista a Cíes), Montalvo (Sanxenxo, calmada), Coiro (Cangas, calita escondida).' },
      { q: '¿El agua está fría en las Rías Baixas?',
        a: 'No tanto como parece. Las rías retienen el calor del verano y el agua llega a 21 °C en agosto-septiembre, similar a la Costa Brava. Mayo y octubre rondan los 17 °C, todavía bañable. El truco son las rías profundas vs costa abierta: Vigo y Pontevedra más cálidas, Cangas y O Grove un poco más frescas.' },
    ],
  },

  // ── Mediterránea (Costa Blanca, Cálida, Dorada) ─────────────────
  'costa-blanca': {
    intro: [
      'La Costa Blanca son 220 km del litoral de Alicante, desde Dénia (frontera con Valencia) hasta Pilar de la Horadada (frontera con Murcia). Su nombre lo dio el viaje de placer británico de los años 60 por la luz blanca y la arena casi cegadora. Hoy combina turismo masivo (Benidorm), pueblos blancos con calas pequeñas (Calpe, Jávea, Moraira) y zonas naturales protegidas (Cabo de las Huertas, Cabo de Sant Antoni).',
      'Las playas se dividen en dos tipos muy distintos: las largas y urbanas (Levante de Benidorm, Postiguet de Alicante, Playa de Saladar) y las calas rocosas con aguas turquesa (Cala Granadella, Moraig, Cala del Portichol, Cala Llebeig). Las primeras tienen todos los servicios; las segundas requieren a veces andar 10 minutos por sendero costero.',
      'Clima: 320 días de sol al año, agua entre 16 °C en invierno y 27 °C en agosto. Gastronomía mediterránea con identidad — arroz a banda, arroz del senyoret, fideuá, esgarraet — y vino de Jumilla y Yecla cerca. Aeropuerto de Alicante y AVE conectan en 3h con Madrid.',
    ],
    mejorEpoca: [
      { ventana: 'Mayo–junio',       razon: 'Calor amable (25 °C), agua a 20-22 °C, sin masificación de julio-agosto.' },
      { ventana: 'Septiembre',       razon: 'Agua a 25 °C (pico del año), turistas familia se van, Benidorm respira.' },
      { ventana: 'Octubre–noviembre', razon: 'Único lugar del Mediterráneo español con 22 °C ambiente en noviembre. Baño aún posible los primeros días.' },
    ],
    tiposDestacados: [
      { slug: '/calas-con-encanto',         nombre: 'Calas con encanto',        razon: 'Granadella, Moraig, Portichol, Llebeig: top calas mediterráneas.' },
      { slug: '/playas-aguas-cristalinas',  nombre: 'Playas con aguas cristalinas', razon: 'Costa rocosa y fondos sin sedimento: visibilidad >10m en agosto.' },
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Benidorm (Levante, Poniente), Postiguet, San Juan: paseo, accesibilidad, ocio.' },
      { slug: '/buceo',                      nombre: 'Buceo',                    razon: 'Reserva marina del Cabo de San Antonio (Jávea) y Cabo de las Huertas (Alicante).' },
    ],
    municipios: [
      { nombre: 'Jávea (Xàbia)',           slug: 'javea',                   resumen: 'Granadella, Portichol, Arenal. Mezcla de playas urbanas y calas vírgenes.' },
      { nombre: 'Calpe',                   slug: 'calpe',                   resumen: 'Peñón de Ifach + 2 playas largas y calas pequeñas alrededor.' },
      { nombre: 'Benidorm',                slug: 'benidorm',                resumen: 'Levante y Poniente: dos playas de 2km. Skyline icónico.' },
      { nombre: 'Moraira',                 slug: 'moraira',                 resumen: 'Pueblo bonito con calas exclusivas: l\'Ampolla, El Portet, Llebeig.' },
      { nombre: 'Alicante',                slug: 'alicante',                resumen: 'Postiguet, San Juan, Albufereta. Capital con playas urbanas.' },
    ],
    faq: [
      { q: '¿Cuál es la diferencia entre Costa Blanca norte y sur?',
        a: 'La Costa Blanca norte (Dénia a Altea) es rocosa, con calas pequeñas, agua muy clara y precios más altos. Pueblos como Jávea, Moraira, Calpe. La Costa Blanca sur (Benidorm a Pilar de la Horadada) es de playas largas de arena fina, más turística, accesible y económica. La frontera natural es Sierra Helada (cerca de Benidorm).' },
      { q: '¿Cuáles son las mejores calas de Costa Blanca?',
        a: 'Cala Granadella (Jávea), Cala Moraig (Benitatxell), Cala del Portichol (Jávea), Cala Llebeig (Benitatxell-Moraira), Cala Blanca (Benissa). Aguas turquesa por fondos rocosos, acceso a pie por sendero. En verano hay regulación de aforo en Granadella.' },
      { q: '¿Cuándo es la mejor época para ir a Costa Blanca sin masificación?',
        a: 'Mayo es ideal: agua a 20 °C, todos los chiringuitos abren, sol seguro y las playas grandes (Benidorm) están al 30% de aforo veraniego. Septiembre es la otra ventana, mejor temperatura pero más gente que en mayo. Octubre regala buen tiempo pero el agua empieza a bajar de 21 °C.' },
    ],
  },

  'costa-calida': {
    intro: [
      'La Costa Cálida son 250 km de Murcia, desde San Pedro del Pinatar hasta Águilas. Se llama así por la temperatura del agua: la del Mar Menor (la laguna salada más grande de Europa, 170 km²) alcanza los 30 °C en agosto, y la del Mediterráneo abierto va de los 15 °C en febrero a los 27 °C en agosto.',
      'Tres geografías muy distintas. El Mar Menor: aguas someras (1-7 m de profundidad), tranquilas, ideales para niños, paddle, vela ligera. La Manga, La Ribera, Los Urrutias, Los Nietos. Cabo de Palos y Calblanque: zona protegida de costa rocosa con calas vírgenes (Calblanque, Negrete, Las Salinas). El Mediterráneo de Águilas y Mazarrón: playas más largas, dunas (Playa Amarilla), Cabo Tiñoso al fondo.',
      'Es la costa más infravalorada del Mediterráneo español: precios un 30% por debajo de Alicante o Málaga, accesibilidad fácil (autovía A-7), gastronomía local fuerte (caldero, paparajotes, tarta de Murcia). El Mar Menor ha tenido años duros (eutrofización 2019-2022) pero las playas exteriores (Calblanque, Águilas) están en perfecto estado y son el verdadero tesoro.',
    ],
    mejorEpoca: [
      { ventana: 'Junio',          razon: 'Mar Menor a 24 °C, abierto a 22 °C, sin overcrowding.' },
      { ventana: 'Septiembre',     razon: 'Agua aún a 25-27 °C, turismo bajando. Las salinas con flamencos.' },
      { ventana: 'Mayo / octubre', razon: 'Para senderismo en Calblanque y Parque de Cabo Cope sin calor extremo.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Mar Menor: agua a la altura del tobillo decenas de metros. Sin oleaje.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Calblanque (parque regional), Negrete, La Galera. Pista de tierra para llegar.' },
      { slug: '/buceo',                      nombre: 'Buceo',                    razon: 'Cabo de Palos: reserva marina con barcos hundidos y meros gigantes.' },
      { slug: '/playas-autocaravana',       nombre: 'Playas para autocaravana', razon: 'Áreas en Mazarrón, Águilas y zonas de pernocta legal junto al mar.' },
    ],
    municipios: [
      { nombre: 'Cartagena',               slug: 'cartagena',               resumen: 'Calblanque y Cala Cortina. Capital histórica con costa rocosa virgen.' },
      { nombre: 'Águilas',                 slug: 'aguilas',                 resumen: 'Playas de Calabardina, Calarreona, La Cola. Cabo Cope al fondo.' },
      { nombre: 'Mazarrón',                slug: 'mazarron',                resumen: 'Bahía y costa de Cabo Tiñoso. Playas largas y calas pequeñas.' },
      { nombre: 'San Pedro del Pinatar',   slug: 'san-pedro-del-pinatar',   resumen: 'Las Salinas con flamencos, baños de lodos, playa de Villananitos.' },
      { nombre: 'La Manga del Mar Menor',  slug: 'la-manga-del-mar-menor',  resumen: 'Lengua de arena de 21km entre Mar Menor y Mediterráneo abierto.' },
    ],
    faq: [
      { q: '¿Cómo está el Mar Menor ahora? ¿Se puede bañar?',
        a: 'Tras los episodios de eutrofización de 2019-2022, el Mar Menor está en lenta recuperación. La calidad del agua es legalmente apta para baño (controlada por la CARM) pero la transparencia y vida marina aún no han vuelto a niveles previos. Las playas exteriores de la Manga (lado del Mediterráneo) están perfectas. Las del Mar Menor son aptas pero con menos atractivo visual.' },
      { q: '¿Qué hay en Calblanque?',
        a: 'Calblanque es un parque regional protegido entre Cabo de Palos y Portmán. 9 km de costa con 4 playas principales (Calblanque, Las Cañas, Negrete, El Lastre) accesibles por pista de tierra. Aguas turquesa, fondos de roca, sin construcciones, sin chiringuito. En verano hay aforo limitado: a partir del 15 de junio se llega solo en bus lanzadera desde el parking exterior.' },
      { q: '¿Cuál es la mejor playa para niños en la Costa Cálida?',
        a: 'Las del Mar Menor (Los Nietos, Los Urrutias, Veneziola): aguas someras de 1-2 m, sin oleaje, temperatura cálida desde junio. Para playa con olas suaves: Bahía de Mazarrón. Para combinar calas y servicios: La Manga (Levante).' },
    ],
  },

  'costa-dorada': {
    intro: [
      'La Costa Dorada son 92 km del litoral de Tarragona, desde Cubelles (frontera Barcelona) hasta Alcanar (frontera Castellón). Su nombre lo da la arena: grano fino y dorado, casi naranja en algunas playas, distinto de las arenas blancas de Cataluña norte. Las playas son largas, poco profundas (puedes andar 30 m mar adentro sin pasar de la cintura), perfectas para familias y niños.',
      'La oferta es muy variada. Cambrils y Salou son las capitales turísticas (PortAventura, gastronomía marinera, parque de atracciones), pero al norte (Vendrell, Calafell, Cunit) hay playas amplias menos masificadas, y al sur (Cala Romana, L\'Ametlla de Mar, Hospitalet del Infante) aparecen calas rocosas y costa más virgen. La desembocadura del Ebro (Delta) cierra la costa con 320 km² de marismas, arrozales y playas vírgenes (Trabucador, Eucaliptus, La Marquesa).',
      'A esto suma el patrimonio romano de Tarragona (anfiteatro, acueducto, Tarraco), pueblos pesqueros vivos (L\'Ametlla, Cambrils), gastronomía catalana con identidad (calçots, romescu, suquet) y un clima Mediterráneo amable: 300 días de sol, agua a 25 °C en agosto.',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',     razon: 'Pico turístico pero la oferta absorbe: 60+ playas en 92 km.' },
      { ventana: 'Mediados septiembre', razon: 'Agua aún a 24 °C, los catalanes vuelven a trabajar. Calles tranquilas en Salou.' },
      { ventana: 'Mayo–junio',       razon: 'Para Delta del Ebro y Tarragona romana. Tiempo de 23-25 °C ideal.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Aguas someras 30m mar adentro: Salou, Cambrils, Vendrell, Calafell.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Delta del Ebro: 30km de costa virgen, dunas, arrozales hasta el mar.' },
      { slug: '/banderas-azules',           nombre: 'Playas con Bandera Azul',  razon: 'Costa Dorada lidera Cataluña en banderas azules certificadas.' },
      { slug: '/playas-autocaravana',       nombre: 'Playas para autocaravana', razon: 'Áreas en Cambrils, Vendrell, Hospitalet del Infante. Buenas instalaciones.' },
    ],
    municipios: [
      { nombre: 'Tarragona',               slug: 'tarragona',               resumen: 'Capital. Playa Larga, Arrabassada, Savinosa, Miracle. Ruinas romanas.' },
      { nombre: 'Cambrils',                slug: 'cambrils',                resumen: 'Pueblo pesquero (mejor gastronomía de la costa) con 9 km de playa.' },
      { nombre: 'Salou',                   slug: 'salou',                   resumen: 'PortAventura + Playa Llarga + Cala Crancs. Capital del turismo familiar.' },
      { nombre: 'L\'Ametlla de Mar',       slug: 'l-ametlla-de-mar',        resumen: 'Costa rocosa virgen, calas pequeñas, tonyina (atún) de almadraba.' },
      { nombre: 'Deltebre',                slug: 'deltebre',                resumen: 'Acceso al Parque Natural del Delta. Playas Trabucador, Eucaliptus.' },
    ],
    faq: [
      { q: '¿Qué hace especial a la arena de la Costa Dorada?',
        a: 'Es de grano más fino y color más dorado/naranja que la arena del resto de Cataluña, gracias a los sedimentos del Ebro y la geología de la zona. Las playas son largas (1-3 km) y poco profundas: el lecho marino baja muy gradualmente. Esto hace que el agua se caliente más rápido (25 °C en agosto frente a 22-23 °C en Costa Brava) y que sean ideales para niños.' },
      { q: '¿Vale la pena visitar el Delta del Ebro?',
        a: 'Sí, sobre todo en mayo (floración del arroz) y septiembre (siega + flamencos). El parque natural tiene 320 km² de marismas, arrozales, playas vírgenes (Trabucador es una lengua de arena de 5 km), y observatorios de aves. Se puede recorrer en bici, en barco por el río o en coche con paradas.' },
      { q: '¿Es PortAventura un buen plan complementario a la playa?',
        a: 'Sí, especialmente para familias con niños 6-14 años. Está en Salou, a 10 minutos de las principales playas. Ofrece 6 áreas temáticas, montañas rusas (Shambhala es de las mejores de Europa), parque acuático (Caribe Aquatic Park) y Ferrari Land. Las entradas combinadas con hotel suelen salir más baratas.' },
    ],
  },

  // ── Mediterránea (Tropical, Azahar, Valencia, Garraf) ───────────
  'costa-tropical': {
    intro: [
      'La Costa Tropical son 80 km de la provincia de Granada, desde La Herradura hasta Adra (frontera con Almería). Es la costa con clima subtropical de la península: rodeada por Sierra Nevada al norte (que actúa de barrera contra el frío) y el mar de Alborán al sur, las temperaturas mínimas no bajan de 14 °C en invierno y permiten cultivar mango, aguacate, chirimoyo y caña de azúcar — fruta tropical real, no metáfora.',
      'Las playas son una mezcla de acantilados, calas entre rocas (La Herradura, Marina del Este, Cantarriján) y arenales largos (Almuñécar Playa San Cristóbal, Salobreña). El agua es transparente por los fondos rocosos y el escaso aporte de ríos. La temperatura del agua alcanza los 24 °C en agosto y baja a 16 °C en febrero — la más templada del Mediterráneo español tras Almería.',
      'Tras la playa, Granada está a 75 km (Alhambra, Sierra Nevada). En primavera puedes esquiar por la mañana y bañarte por la tarde. Salobreña conserva castillo árabe sobre el mar, Almuñécar tiene parque ornitológico y acuario, y la subida a la Alpujarra granadina es a 30 minutos. Gastronomía mediterránea con toque andaluz: pescaíto frito, gambones de Motril, vinos de la contraviesa.',
    ],
    mejorEpoca: [
      { ventana: 'Mayo–junio',     razon: 'Calor sin extremo, agua a 19-21 °C, playas tranquilas.' },
      { ventana: 'Septiembre',     razon: 'Agua a 24 °C, su pico, sin masificación tras el verano fuerte.' },
      { ventana: 'Diciembre–enero', razon: 'Microclima subtropical: 18-19 °C ambiente. Único lugar donde se cultiva mango en Europa.' },
    ],
    tiposDestacados: [
      { slug: '/playas-aguas-cristalinas',  nombre: 'Playas con aguas cristalinas', razon: 'La Herradura, Marina del Este, Cantarriján. Fondos rocosos sin sedimento.' },
      { slug: '/buceo',                      nombre: 'Buceo',                    razon: 'Marina del Este es el centro de buceo más activo del litoral granadino.' },
      { slug: '/calas-con-encanto',         nombre: 'Calas con encanto',        razon: 'Cantarriján (nudista), Cala del Ruso, El Cañuelo, La Riviera.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'Salobreña, Almuñécar y el faro de Sacratif: vistas con Sierra Nevada al fondo.' },
    ],
    municipios: [
      { nombre: 'Almuñécar',               slug: 'almunecar',               resumen: 'Capital. San Cristóbal, Velilla, Cabria. Acuario y parque ornitológico.' },
      { nombre: 'Salobreña',               slug: 'salobrena',               resumen: 'Castillo árabe sobre la playa. La Charca, La Guardia, La Caleta.' },
      { nombre: 'La Herradura',            slug: 'la-herradura',            resumen: 'Bahía protegida con buceo, vela y deportes acuáticos. Cantarriján al lado.' },
      { nombre: 'Motril',                  slug: 'motril',                  resumen: 'Playa larga de Poniente y Granada. Puerto pesquero importante.' },
      { nombre: 'Castell de Ferro',        slug: 'castell-de-ferro',        resumen: 'Pueblo pesquero con calas en torno a Punta del Llano. Menos turístico.' },
    ],
    faq: [
      { q: '¿Por qué se llama Costa Tropical?',
        a: 'Por su microclima subtropical real (no marketing): mínimas anuales sobre 14 °C, máximas en verano 28 °C, agua del mar entre 16 y 24 °C. Esto permite cultivar mango, aguacate, chirimoyo, papaya, caña de azúcar y plátano enano — la única zona de Europa continental donde estas frutas dan cosecha comercial. Sierra Nevada actúa de escudo contra el frío norte.' },
      { q: '¿Se puede ir de la nieve a la playa el mismo día?',
        a: 'Sí, es la promesa turística de la zona. Sierra Nevada (Pradollano, 2.100 m) está a 90 minutos en coche de Almuñécar. En marzo-abril es perfectamente realista esquiar por la mañana (estación abre 9 AM) y bañarse en La Herradura a las 16 PM. En enero el agua está fría (16 °C) pero se puede.' },
      { q: '¿Cuál es la mejor playa de la Costa Tropical?',
        a: 'La Herradura por su bahía protegida y agua clara. Cantarriján por su carácter virgen y nudista oficial. Marina del Este (un puerto deportivo con cala) por la facilidad de aparcar. Cala del Ruso (Albuñol) por el aislamiento. Salobreña por la postal del castillo.' },
    ],
  },

  'costa-del-azahar': {
    intro: [
      'La Costa del Azahar son 120 km del litoral de Castellón, desde Vinaròs (frontera con Cataluña) hasta Almenara (frontera con Valencia). El nombre lo dieron los azahares de los naranjos que llegan literalmente hasta el mar: campos de cítricos que perfuman la primavera y dan a la costa su seña de identidad. Es una de las costas más turísticas y a la vez más infravalorada del Mediterráneo español.',
      'Peñíscola domina con su silueta de castillo templario sobre el peñón rocoso (el Papa Luna vivió aquí) y sus playas Norte y Sur. Benicàssim mantiene su mística desde los años 50 (festival FIB) con villas modernistas frente al paseo marítimo. Oropesa tiene la Marina d\'Or de eslogan vacacional. Y en medio, kilómetros de playas amplias de arena fina, fáciles de aparcar, sin masificación extrema.',
      'Castellón conecta bien por AVE (Madrid 2h, Valencia 30 min) y autovía A-7. La gastronomía mezcla mar y huerta: arroz a banda, fideuá negra, all i pebre de anguila, naranjas Valencia. Las Islas Columbretes (reserva marina volcánica a 50 km de la costa) son un secreto bien guardado.',
    ],
    mejorEpoca: [
      { ventana: 'Mayo–junio',     razon: 'Aire a 22-26 °C, agua subiendo a 20 °C, naranjos en flor. Sin gente.' },
      { ventana: 'Septiembre',     razon: 'Agua a 25 °C (pico anual), turismo se va, semana de Benicàssim antes del FIB.' },
      { ventana: 'Marzo–abril',    razon: 'Para senderismo a Sierra de Irta (parque natural) y costa virgen al norte de Peñíscola.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Peñíscola Norte, Benicàssim, Oropesa: playas amplias con servicios, accesibilidad.' },
      { slug: '/banderas-azules',           nombre: 'Playas con Bandera Azul',  razon: 'Castellón concentra una de las mayores densidades de bandera azul por km de costa.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Sierra de Irta entre Peñíscola y Alcossebre: 15 km de costa virgen sin urbanizar.' },
      { slug: '/buceo',                      nombre: 'Buceo',                    razon: 'Islas Columbretes: reserva marina volcánica a 50 km, accesible en barco desde Castellón.' },
    ],
    municipios: [
      { nombre: 'Peñíscola',               slug: 'peniscola',               resumen: 'Castillo templario sobre el mar. Playas Norte y Sur, casco antiguo amurallado.' },
      { nombre: 'Benicàssim',              slug: 'benicassim',              resumen: 'Villas modernistas, FIB en julio. Playas Almadrava, Voramar, Heliópolis.' },
      { nombre: 'Oropesa del Mar',         slug: 'oropesa-del-mar',         resumen: 'Marina d\'Or, La Concha, Playa Morro de Gos. Familiar y accesible.' },
      { nombre: 'Vinaròs',                 slug: 'vinaros',                 resumen: 'Frontera con Cataluña. Calas norte de la Sierra de Irta. Langostino de Vinaròs.' },
      { nombre: 'Alcossebre',              slug: 'alcossebre',              resumen: 'Playas Cargador, Carregador, Romana. Calas naturales en Sierra de Irta.' },
    ],
    faq: [
      { q: '¿Cómo se llega a las Islas Columbretes?',
        a: 'Solo en barco organizado desde el puerto de Castellón (50 km mar adentro, viaje 2h en cada sentido). Hay dos empresas con permiso del parque natural que operan abril-octubre con grupos limitados. Solo se puede pisar Columbrete Gran (la isla principal). El resto solo se puede ver desde el barco o haciendo snorkel/buceo desde fondeo.' },
      { q: '¿Vale la pena Peñíscola si no me interesa la playa?',
        a: 'Sí. El casco antiguo amurallado sobre el peñón es uno de los pueblos más fotogénicos del Mediterráneo (Juego de Tronos, El Cid, Calabuch). El Castillo del Papa Luna se visita en 1.5 h. Plaza Constitución, Bufador, Plaza del Caracol. Y los chiringuitos de Playa Sur al atardecer con el castillo iluminado al fondo.' },
      { q: '¿Cuándo hay azahar en la Costa del Azahar?',
        a: 'La floración del naranjo (azahar) ocurre dos veces al año: principal entre marzo y mayo, y secundaria en septiembre-octubre. El perfume es más intenso al atardecer en zonas como Burriana, Nules, Almenara. Algunas fincas ofrecen visitas con cata de naranjas y aceite de azahar destilado.' },
    ],
  },

  'costa-de-valencia': {
    intro: [
      'La Costa de Valencia son 110 km del litoral de Valencia (provincia), desde Pucol al norte hasta Oliva al sur. Combina las playas urbanas más grandes de España (la Malvarrosa de Valencia es la playa de Espacio Schengen más grande de una capital europea, 1.300 m por 130 m de ancho) con la Albufera al sur (parque natural con arrozales y barracas) y kilómetros de playas familiares (El Saler, La Devesa, Gandía).',
      'La Malvarrosa fue pintada por Sorolla y mantiene el aire mediterráneo de paseo marítimo con casas bajas, paellas en chiringuito (Levante o Casa Carmela) y agua de calidad europea ya en pleno casco urbano. El Saler y La Devesa, dentro del parque natural de la Albufera, son largas, arenosas, con pinares hasta el mar. Gandía concentra el turismo familiar masivo: paseo, restaurantes, calidad de servicios.',
      'Tras la playa, Valencia ciudad ofrece la Ciudad de las Artes, el Mercado Central, Bioparc, casco histórico (catedral, Lonja, Mercat). Gastronómicamente es el centro de la paella (no confundir con el "arroz con cosas"). Y la huerta proporciona naranjas, alcachofas, chufa (horchata).',
    ],
    mejorEpoca: [
      { ventana: 'Mayo–junio',     razon: 'Agua a 19-21 °C, paellas en chiringuito sin colas, valencianos aún no van masivos a la playa.' },
      { ventana: 'Septiembre',     razon: 'Agua a 25 °C pico, turismo se va, Las Fallas no condicionan. Mejor mes objetivo.' },
      { ventana: 'Diciembre–febrero', razon: 'Solo para visitar Valencia ciudad con clima amable (18 °C). El baño no es opción.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Malvarrosa, El Saler, Gandía: arena amplia, paseo, accesibilidad, paellas.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Albufera (El Saler, La Devesa, El Perellonet): pinares hasta el mar.' },
      { slug: '/playas-autocaravana',       nombre: 'Playas para autocaravana', razon: 'Áreas señalizadas en Sueca, Tavernes de la Valldigna, Daimús, Oliva.' },
      { slug: '/banderas-azules',           nombre: 'Playas con Bandera Azul',  razon: 'Comunidad Valenciana lidera el ranking nacional con 151 banderas.' },
    ],
    municipios: [
      { nombre: 'Valencia',                slug: 'valencia',                resumen: 'Malvarrosa, Las Arenas, El Saler dentro del término. Capital con playa urbana.' },
      { nombre: 'Gandía',                  slug: 'gandia',                  resumen: 'Playa Norte (4 km) y Playa de Veneziola. Familiar por excelencia.' },
      { nombre: 'Cullera',                 slug: 'cullera',                 resumen: 'Faro, dos playas largas y calas pequeñas. Castillo árabe sobre el mar.' },
      { nombre: 'Oliva',                   slug: 'oliva',                   resumen: 'Frontera con Alicante. Playa de Pau Pi, Terranova. Surf y kite suaves.' },
      { nombre: 'Sueca',                   slug: 'sueca',                   resumen: 'Mareny de Barraquetes, El Perelló. Costa del arroz, escenarios sin urbanizar.' },
    ],
    faq: [
      { q: '¿Cuál es la mejor playa para comer paella en chiringuito?',
        a: 'En Valencia capital: La Pepica (Malvarrosa, desde 1898), Casa Carmela (Malvarrosa, paella sobre fuego de leña), Levante (Malvarrosa). En la Albufera: Bon Aire (El Saler). En Gandía: Aquí t\'espere. Recordatorio: la paella tradicional valenciana lleva pollo, conejo, judía verde y garrofó. No lleva chorizo NUNCA. No la pidas "mixta": es valenciana o "arroz" (con marisco, banda, negra, etc).' },
      { q: '¿La Albufera es solo arroz o también playa?',
        a: 'Ambos. El parque natural protege 21.000 ha entre laguna, marjal y dunas. La parte costera (Devesa de l\'Albufera, El Saler) son playas de arena fina con pinares atrás. Acceso libre, parking gratuito, sin construcciones a pie de mar. Imprescindible la visita en barca por la laguna al atardecer y comida en barraca de El Palmar.' },
      { q: '¿Cuándo es la mejor época para Valencia ciudad + playa?',
        a: 'Mayo y septiembre. Mayo: clima amable, Las Fallas ya pasadas, agua subiendo a 21 °C, todos los chiringuitos abren. Septiembre: agua en pico (25 °C), turismo se va, fiestas de la Vendimia. Agosto evitar: calor extremo (35 °C), Malvarrosa al máximo aforo, ciudad medio cerrada por vacaciones.' },
    ],
  },

  'costa-del-garraf': {
    intro: [
      'La Costa del Garraf son 45 km del litoral de Barcelona, desde el Llobregat hasta Sitges. Es la costa más urbana de Cataluña (3 millones de habitantes en su entorno), con tres ciudades de playa muy distintas: Barcelona (Barceloneta, Bogatell, Mar Bella, Nova Icaria), Castelldefels (3 km de arena con paseo marítimo) y Sitges (capital LGTBI y modernista, 17 calas).',
      'Barceloneta es la playa urbana más fotografiada de Europa: arena traída expresamente para las Olimpiadas del 92, escultura "Estel Ferit" (Rebecca Horn) y vistas al W Hotel. Bogatell y Mar Bella son las playas más relajadas dentro del término municipal. Castelldefels combina paseo, deportes acuáticos (kitesurf, paddle), y aeropuerto al lado. Sitges es escena, restaurantes top y patrimonio modernista (Cau Ferrat).',
      'A 30 minutos de Barcelona en cualquier dirección: el Garraf (sierra costera con calas vírgenes como Cala Morisca, Cala Ginesta), Vilanova y Cunit. Gastronomía mediterránea con identidad fuerte: pescado azul de Vilanova, calçotada del Penedès, cava de Sant Sadurní.',
    ],
    mejorEpoca: [
      { ventana: 'Mayo–junio',     razon: 'Barcelona sin masas turísticas de julio, playa templada (20 °C agua), terrazas en su mejor momento.' },
      { ventana: 'Septiembre',     razon: 'Agua a 24 °C, BCN se vacía tras Sant Joan + agosto. Mejor mes objetivo.' },
      { ventana: 'Diciembre',      razon: 'Sitges Christmas y Mar Bella al sol invernal. No para baño pero sí paseo.' },
    ],
    tiposDestacados: [
      { slug: '/familias',                  nombre: 'Playas para familias',     razon: 'Castelldefels y Bogatell: paseo marítimo, accesibilidad, socorrismo, calidad europea.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Macizo del Garraf: Cala Morisca, Cala Ginesta, Garraf-Vallcarca. Acceso a pie.' },
      { slug: '/playas-nudistas',           nombre: 'Playas nudistas',          razon: 'Mar Bella (BCN), Sitges (Aiguadolç), Vilanova. Tradición LGTBI fuerte.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'Sitges Plaza Bahía, Macizo del Garraf desde mirador. Vistas a Montjuïc.' },
    ],
    municipios: [
      { nombre: 'Barcelona',               slug: 'barcelona',               resumen: 'Barceloneta, Bogatell, Mar Bella, Nova Icaria. Playa urbana europea por excelencia.' },
      { nombre: 'Sitges',                  slug: 'sitges',                  resumen: 'Capital LGTBI con 17 calas. Cau Ferrat, modernismo, festivales.' },
      { nombre: 'Castelldefels',           slug: 'castelldefels',           resumen: '3 km de paseo marítimo, kite, paddle. Familiar y deportiva.' },
      { nombre: 'Vilanova i la Geltrú',    slug: 'vilanova-i-la-geltru',    resumen: 'Puerto pesquero, pescado azul fresco, playas amplias menos masificadas.' },
      { nombre: 'Garraf',                  slug: 'garraf',                  resumen: 'Pueblo de pescadores con casas blancas. Parque natural detrás.' },
    ],
    faq: [
      { q: '¿Qué playa de Barcelona elegir según mi perfil?',
        a: 'Barceloneta: si vienes pocos días y quieres LA playa icónica con todos los servicios (esperar masas en julio-agosto). Bogatell: si buscas más espacio y menos turistas pero similar oferta. Mar Bella: zona nudista oficial + skate park + ambiente LGTBI. Nova Mar Bella: la más tranquila, familiar local. Llevant: la más reciente, menos masificada.' },
      { q: '¿Cómo llegar a las calas del Garraf desde Barcelona?',
        a: 'En tren cercanías R2 Sur hasta Garraf (35 min desde BCN Sants). Desde la estación, las calas más accesibles son Garraf-Vallcarca a pie por la C-31 (precaución, no apta para niños). Para Cala Morisca y Cala Ginesta, mejor coche a Sitges y caminar 30-45 min por sendero. En verano hay aforo limitado y bus lanzadera desde Sitges.' },
      { q: '¿Es Sitges buen plan para ir con niños?',
        a: 'Sí. La playa principal (Sant Sebastià, Estanyol) es familiar, con socorrismo y servicios. La de la Bassa Rodona y Aiguadolç son nudistas (no para niños). Sitges en sí ofrece paseos por casco antiguo, museos pequeños (Cau Ferrat, Maricel), el faro y las terrazas. Para un mix playa-cultura sin desplazarse, es perfecto.' },
    ],
  },

  // ── Atlántica gallega norte ────────────────────────────────────
  'rias-altas': {
    intro: [
      'Las Rías Altas son las cuatro grandes entradas de mar al norte de Galicia: Betanzos, Ferrol, Cedeira y Ortigueira (en A Coruña) más la ría de Ribadeo y Foz (en Lugo). Son más bravas que las Rías Baixas: el Atlántico Norte entra con fuerza, los acantilados son altos (los de Loiba, los de O Vicedo, los de Estaca de Bares), y las playas alternan arenales grandes (Doniños, Pantín, Lariño) con calas escondidas accesibles solo a pie.',
      'El agua es más fría que en Rías Baixas (19-20 °C en agosto), pero las playas son menos masificadas y la costa virgen es real: la zona entre Cariño y Estaca de Bares (el cabo más al norte de la península) tiene apenas urbanización y kilómetros de acantilados con calas en cada arruga. Famosos los acantilados de Loiba ("el mejor banco del mundo" según una placa).',
      'Pueblos: Ferrol (ciudad ilustrada, modernismo, gastronomía de mar), Pontedeume, Betanzos (vinos, casco histórico medieval), Viveiro (Semana Santa) y Ribadeo. Las Catedrales (Ribadeo) son la playa estrella, accesibles solo en bajamar con reserva previa. Surf en Pantín (campeonato WSL anual) y Doniños.',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',     razon: 'Pico térmico: 20 °C agua, 23 °C aire. Tiempo más seguro de Galicia.' },
      { ventana: 'Septiembre',       razon: 'Las Rías Altas se vacían pronto: gallegos vuelven al cole y a Coruña.' },
      { ventana: 'Octubre–noviembre', razon: 'Para surf en Pantín, senderismo costero (los acantilados están en su mejor punto) y vino del Ribeiro Sacro.' },
    ],
    tiposDestacados: [
      { slug: '/surf',                       nombre: 'Surf',                     razon: 'Pantín (WSL), Doniños, Esmelle, San Xurxo. Tradición fuerte y olas consistentes.' },
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Costa entre Cariño y Estaca de Bares: 50 km con apenas urbanización.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'Acantilados de Loiba, San Andrés de Teixido, Bares: los más altos de la España continental.' },
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'As Catedrais (Ribadeo), Esteiro, Lariño. Geografía espectacular.' },
    ],
    municipios: [
      { nombre: 'Ferrol',                  slug: 'ferrol',                  resumen: 'Doniños, San Xurxo. Ciudad ilustrada con casco histórico ordenado.' },
      { nombre: 'Valdoviño',               slug: 'valdovino',               resumen: 'A Frouxeira, Pantín, Vilarrube. Surf-spot reconocido WSL.' },
      { nombre: 'Cedeira',                 slug: 'cedeira',                 resumen: 'Ría protegida con playas urbanas tranquilas. Magoito, Vilarrube cerca.' },
      { nombre: 'Ribadeo',                 slug: 'ribadeo',                 resumen: 'Playa de las Catedrales (As Catedrais). Pueblo indiano elegante.' },
      { nombre: 'Ortigueira',              slug: 'ortigueira',              resumen: 'Acceso a Cariño, Estaca de Bares y costa virgen del norte.' },
    ],
    faq: [
      { q: '¿Hace falta reservar para ir a las Catedrales?',
        a: 'Sí, durante Semana Santa y de julio a septiembre. Reserva gratuita online (areadasvelas.com) con aforo limitado. Sin reserva no se accede. Para el resto del año el acceso es libre pero hay que ir con bajamar coeficiente >50 (la playa desaparece con marea alta). Consulta las tablas antes de ir.' },
      { q: '¿Cuál es la mejor playa de surf de Galicia?',
        a: 'Pantín (Valdoviño) por su consistencia: olas todo el año, fondo de arena, viento offshore frecuente. Cada septiembre acoge el Pantín Classic, prueba del WSL World Qualifying Series. Otras top: Doniños (Ferrol), Esteiro (Muxía), Razo (Carballo), San Xurxo (Ferrol). Todas con escuelas y nivel intermedio-avanzado.' },
      { q: '¿Se puede llegar en transporte público a las Rías Altas?',
        a: 'A las playas grandes sí: Ferrol tiene tren desde A Coruña, y Doniños/San Xurxo se alcanzan en bus urbano. A Pantín y Frouxeira, en bus desde Ferrol o Cedeira (poca frecuencia). Para As Catedrais hay parada de bus desde Ribadeo en verano. Para la costa norte (Cariño, Estaca de Bares) coche es necesario.' },
    ],
  },

  'costa-da-morte': {
    intro: [
      'La Costa da Morte son 200 km de litoral de A Coruña, desde Caión (al norte) hasta Cabo Fisterra (al sur), pasando por Malpica, Camariñas, Muxía y Carnota. Su nombre se lo dieron los más de 1.000 naufragios catalogados desde el siglo XVI: el Atlántico Norte entra aquí con sus tormentas más bravas, las nieblas son frecuentes, y los acantilados (Cabo Vilán, Cabo Roncudo, Punta da Barca) cobran tributo. Es la costa más salvaje de la península ibérica.',
      'Pero detrás del nombre temible está una belleza brutal: arenales de cinco kilómetros sin nadie (Lariño, Carnota, Ézaro), faros sobre acantilados (Vilán, Roncudo, Touriñán), cabos terminales (Fisterra fue durante siglos "el fin del mundo" para el Camino de Santiago) y playas de geografía dramática (Mar de Fora en Fisterra, Praia da Lago, Praia das Furnas). El agua está fresca (18-19 °C en agosto) pero el sol del norte de Galicia es generoso en julio-septiembre.',
      'Gastronomía de percebes (Roncudo es la capital mundial), pescados de la lonja de Fisterra y Camariñas, y el famoso bordado de Camariñas. Carnota tiene además el hórreo más largo de Galicia (35 m) y unas vistas espectaculares al monte Pindo, "el Olimpo Celta".',
    ],
    mejorEpoca: [
      { ventana: 'Julio–agosto',     razon: 'Único momento con sol seguro y agua a 19-20 °C. Playas semivacías comparado con sur.' },
      { ventana: 'Septiembre',       razon: 'Gallegos vuelven al cole, costa queda casi vacía. Tiempo aún bueno.' },
      { ventana: 'Mayo–junio',       razon: 'Para senderismo costero (camino dos Faros conecta toda la costa en 200 km) y observación de percebes.' },
    ],
    tiposDestacados: [
      { slug: '/playas-secretas',           nombre: 'Playas secretas',          razon: 'Carnota (4 km sin urbanizar), Mar de Fora, As Furnas. La costa más virgen de la península.' },
      { slug: '/atardeceres',               nombre: 'Atardeceres',              razon: 'Cabo Fisterra (el fin del mundo histórico), Cabo Touriñán, Faro Vilán. Atlánticos puros.' },
      { slug: '/surf',                       nombre: 'Surf',                     razon: 'Razo (Carballo), Caión, A Lapa. Olas grandes consistentes pero solo nivel medio-avanzado.' },
      { slug: '/playas-paradisiacas',       nombre: 'Playas paradisíacas',      razon: 'Lariño, Ézaro (única cascada que cae al mar de Europa continental), Carnota.' },
    ],
    municipios: [
      { nombre: 'Fisterra',                slug: 'fisterra',                resumen: 'Faro Cabo Fisterra, fin del Camino. Playa Mar de Fora y Langosteira.' },
      { nombre: 'Carnota',                 slug: 'carnota',                 resumen: 'Playa más larga de Galicia (5 km) bajo el monte Pindo. Hórreo de Carnota.' },
      { nombre: 'Muxía',                   slug: 'muxia',                   resumen: 'Santuario da Barca, As Furnas, Praia da Lago. Final del Camino alternativo.' },
      { nombre: 'Camariñas',               slug: 'camarinas',               resumen: 'Encajes de bolillos, Faro Vilán. Playas Camelle, Trece, Reira.' },
      { nombre: 'Malpica',                 slug: 'malpica',                 resumen: 'Capital del percebe (Cabo Roncudo). Playa Malpica, Sieira, Beo.' },
    ],
    faq: [
      { q: '¿Por qué se llama Costa da Morte?',
        a: 'Por la cantidad de naufragios históricos (más de 1.000 catalogados): tormentas atlánticas, niebla densa frecuente, corrientes traicioneras y costa rocosa sin puertos refugio entre Malpica y Fisterra. El nombre se popularizó en el siglo XIX con la prensa cubriendo el hundimiento de varios barcos en la zona. El más famoso: el HMS Serpent en 1890 (172 muertos en Boi).' },
      { q: '¿Cuándo es la mejor época para ver percebes en Roncudo?',
        a: 'Octubre-mayo es la temporada (los percebes se cogen en marejada). En verano están vedados. Para verlos en la roca y ver cómo se cogen (deporte de riesgo extremo), Roncudo y Punta dos Aguillóns son los puntos. Hay rutas guiadas con percebeiros profesionales en Corme y Malpica que combinan caminata costera + cata. Reserva con antelación.' },
      { q: '¿Es realmente Cabo Fisterra el "fin del mundo"?',
        a: 'Históricamente sí: los romanos llamaron al cabo "Finis Terrae" y durante toda la Edad Media se consideró el punto más al oeste de Europa conocido. El cabo de Roca (Portugal) está 16 km más al oeste, pero Fisterra mantiene el mito por el Camino de Santiago (muchos peregrinos extienden el camino hasta aquí). El faro, la ermita de San Guillermo y la roca del Buey son las paradas obligadas.' },
    ],
  },
}

/** Devuelve el editorial de una costa, o un objeto vacío si no hay copy. */
export function getCostaEditorial(slug: string): CostaEditorial {
  return COSTAS_EDITORIAL[slug] ?? {}
}
