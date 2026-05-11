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
}

/** Devuelve el editorial de una costa, o un objeto vacío si no hay copy. */
export function getCostaEditorial(slug: string): CostaEditorial {
  return COSTAS_EDITORIAL[slug] ?? {}
}
