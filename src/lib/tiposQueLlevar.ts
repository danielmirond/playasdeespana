// src/lib/tiposQueLlevar.ts
// Catálogo de páginas /que-llevar/[tipo] con contenido editorial real.
// 9 tipos cubren ~95% de las intenciones de búsqueda relacionadas con
// 'qué llevar a la playa', sin generar thin content por playa.
//
// Cada tipo incluye:
//   - slug (URL)
//   - nombre y descripción para H1/SEO
//   - 5-8 productos contextuales del catálogo Amazon con justificación
//   - secciones editoriales: intro, cuándo ir, qué hacer, consejos
//   - FAQs específicas
//   - matchPlaya(): predicado para deducir el tipo desde una Playa

import type { Playa } from '@/types'
import type { ProductoAmazon } from './amazon-productos'
import { PRODUCTOS } from './amazon-productos'

export interface TipoQueLlevar {
  slug:        string
  nombre:      string                // "playa rocosa"
  titulo:      string                // "Qué llevar a una playa rocosa"
  descripcion: string                // meta description SEO
  intro:       string[]              // 2-3 párrafos
  productos:   { asin: string; razon: string }[]
  cuandoIr:    string
  qHacer:      string
  consejos:    string[]
  faqs:        { q: string; a: string }[]
  /** Predicado server-side para mapear playa → tipo en redirect / drawer */
  matchPlaya:  (p: Playa) => boolean
  /** Prioridad de match cuando una playa cumple varios tipos (mayor = primero) */
  prioridad:   number
}

// Helpers para construir productos con razón
function asin(c: keyof typeof PRODUCTOS, idx: number): string {
  return PRODUCTOS[c][idx]?.asin ?? ''
}

export const TIPOS: TipoQueLlevar[] = [
  // ────────────────────────────────────────────────────────────────
  {
    slug: 'playa-rocosa',
    nombre: 'playa rocosa',
    titulo: 'Qué llevar a una playa rocosa',
    descripcion: 'Imprescindibles para playas con composición rocosa: escarpines, snorkel, neopreno y precauciones para entrar al agua sin lesiones.',
    intro: [
      'Las playas rocosas tienen su propio universo. La entrada al agua deja de ser un trámite y pasa a ser un cálculo: dónde piso, qué piso, cuánto pesa lo que llevo. A cambio, el agua suele ser más limpia (no hay arena que enturbie), los fondos son ricos en vida y las calas pequeñas mantienen la temperatura del agua varios grados por encima de las playas abiertas.',
      'En España hay rocosas de todo tipo: las del Mediterráneo (Cataluña, Costa Brava, Mallorca, Cabo de Gata) tienden a tener cantos redondeados y aguas transparentes ideales para snorkel; las del Atlántico norte (Asturias, Cantabria, Galicia) son más bravas, con cantos angulosos, mareas marcadas y oleaje que reorganiza la orilla cada día. La lista de imprescindibles cambia poco entre ambas, pero la actitud sí.',
      'Lo más importante: no improvises el calzado. Una herida en la planta del pie a 30 km del coche te arruina el día y a veces más.',
    ],
    productos: [
      { asin: asin('rocosa', 0), razon: 'Indispensable. Los escarpines de neopreno protegen contra cortes en la entrada al agua y permiten caminar entre rocas sin pensar.' },
      { asin: asin('rocosa', 1), razon: 'En aguas tranquilas y fondos rocosos hay vida — peces, pulpos, estrellas. Un set básico cambia la jornada.' },
      { asin: asin('rocosa', 2), razon: 'Aletas cortas para snorkel: maniobras mejor entre rocas y caben en la mochila.' },
      { asin: asin('siempre', 0), razon: 'En rocosas la radiación reflejada por el agua y las piedras claras suma. SPF50 sin discusión.' },
      { asin: asin('siempre', 1), razon: 'La arena fina aquí es escasa, pero el polvo sí entra en todos los puertos USB.' },
      { asin: asin('siempre', 2), razon: 'Los chiringuitos en rocosas son raros. Lleva al menos un litro por persona.' },
    ],
    cuandoIr: 'En el Mediterráneo, las rocosas dan lo mejor de sí entre junio y septiembre, con agua cálida y poco viento. En el Atlántico/Cantábrico, mejor julio-agosto si quieres bañarte con neopreno corto. Las primeras horas del día son las mejores: marea baja deja al descubierto rocas con vida, y la luz lateral hace que el snorkel se vea espectacular.',
    qHacer: 'Snorkel y observación de fauna marina son la actividad estrella. Saltar desde rocas (con cabeza: confirmar profundidad y ausencia de corrientes). Caminar la línea de costa en marea baja para encontrar pozas. Si hay calas conectadas, recorrerlas. Buceo recreativo en zonas señalizadas.',
    consejos: [
      'Mira la marea antes de salir: en algunas calas rocosas la pleamar reduce la playa a cero',
      'No cojas erizos, estrellas ni corales — son ilegales en muchas reservas y son lo que hace especial el sitio',
      'Las gafas de bucear se empañan menos si las frotas con saliva o jabón antes de mojarlas',
      'Lleva un botiquín mínimo: gasas, povidona y vendaje. Los cortes de roca son habituales',
      'Si vas con peques, escoge calas con piscinas naturales en marea baja — más segura que el mar abierto',
      'No te bañes solo si hay oleaje. La rotura contra rocas es traicionera',
    ],
    faqs: [
      { q: '¿Es necesario llevar escarpines en playa rocosa?', a: 'Salvo que la rocosa sea de cantos rodados muy redondeados, sí. Las heridas en la planta del pie por roca o por erizos son la lesión más común y la más fácil de evitar.' },
      { q: '¿Puedo bucear sin titulación en una playa rocosa?', a: 'A pulmón (apnea / snorkel) sí. Con bombona necesitas titulación PADI/CMAS y centro homologado. Hay buenos centros en la mayoría de zonas rocosas turísticas.' },
      { q: '¿Qué hago si me clavo un erizo?', a: 'Las púas son frágiles y rompen al sacarlas. La técnica habitual es ablandar la zona con agua caliente, intentar sacar las accesibles con pinzas y dejar que el cuerpo expulse el resto en días. Si hay infección, médico.' },
      { q: '¿Hay rocosas accesibles para personas con movilidad reducida?', a: 'Pocas. Las rocosas suelen tener accesos por escalera o desnivel. Pregunta en el ayuntamiento por accesos adaptados antes de planificar.' },
    ],
    matchPlaya: (p) => /roca|piedra|grava|canto/i.test(p.composicion ?? ''),
    prioridad: 80,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'playa-arenosa',
    nombre: 'playa de arena',
    titulo: 'Qué llevar a una playa de arena',
    descripcion: 'Imprescindibles para un día en una playa de arena: sombrilla, toalla, protección solar y los esenciales para que no falte nada.',
    intro: [
      'La playa de arena es la playa por defecto en España. Más de 2.500 de las 3.500 catalogadas son arenosas. Pueden ser urbanas (paseo marítimo, chiringuitos, socorrismo) o vírgenes (cero servicios), grandes y abiertas o pequeñas y resguardadas. La lista de cosas que llevar es relativamente estándar, pero los detalles cambian según el contexto.',
      'En arenosas urbanas tipo Barcelona, Valencia, Málaga, San Sebastián o Las Palmas hay servicios cerca, pero los precios suben en agosto y los pequeños descuidos (saturación de aparcamiento, agua a 3€) suman. En arenosas vírgenes tipo el Cabo de Gata, los Caños de Meca o Cies, vienes autosuficiente o pagas el peaje de improvisar.',
      'Lo común a todas: protección solar generosa, sombra propia (pocas playas españolas tienen sombra natural en su mitad central) y agua suficiente. El resto se ajusta.',
    ],
    productos: [
      { asin: asin('arena', 0), razon: 'Sombrilla con anclaje antiviento. Las playas españolas tienen viento térmico fuerte por la tarde — sin anclaje vuela.' },
      { asin: asin('arena', 1), razon: 'Toalla de microfibra XL: ocupa 1/4 que una toalla de baño, seca rápido, ideal si encadenas con visitas.' },
      { asin: asin('arena', 2), razon: 'Calzado para caminar sobre arena caliente — en julio-agosto la arena pasa de 50°C, no es trivial.' },
      { asin: asin('siempre', 0), razon: 'SPF50 mínimo. La arena clara refleja la radiación y multiplica la exposición.' },
      { asin: asin('siempre', 1), razon: 'Funda estanca para móvil. La arena fina entra en cualquier puerto USB y te seca el día.' },
      { asin: asin('siempre', 2), razon: 'Botella térmica 1L. Aguanta el agua fría 8 h sin nevera, salva el día en agosto.' },
      { asin: asin('familia', 1), razon: 'Si vienes con peques: un set básico de pala y cubo es la diferencia entre 1 hora y 4 horas de plan.' },
    ],
    cuandoIr: 'Junio y septiembre son los mejores meses en la mayoría de la costa: agua templada, menos saturación, precios algo más bajos. Las primeras horas (8-11 h) y el final del día (18-20 h) evitan el pico de UV y la masificación. Si vas en julio-agosto, llegar antes de las 10 garantiza sitio bueno; pasada esa hora hay que arreglárselas con lo que quede.',
    qHacer: 'Bañarse, leer, almorzar tranquilo, paseos por la orilla, juegos de pala. Si la playa es ancha y abierta, body, paddle surf o kayak (alquileres en muchas zonas turísticas). Vóley playa en las grandes. Castillos de arena en las que tienen arena fina; las de grano grueso son menos modelables.',
    consejos: [
      'Llega antes de las 10 h en julio-agosto si quieres sitio decente; los locales lo hacen por algo',
      'La arena seca está caliente, la arena mojada está helada — busca el punto medio para tumbarte',
      'No dejes botellas de cristal en la arena: se rompen, no las ves al pisar',
      'Si vas con peques, marca un punto de encuentro visible (un parasol específico, un pino) por si alguien se pierde',
      'Lleva una bolsa para tus residuos. La playa más concurrida queda limpia si cada uno se lleva lo suyo',
      'En playas con mucha pendiente, cuidado con corrientes de retorno — pregunta al socorrista al llegar',
    ],
    faqs: [
      { q: '¿Es legal hacer fuego o barbacoa en una playa de arena?', a: 'En general no, salvo en playas específicas con zonas habilitadas (algunas en Galicia y Asturias). Pregunta en el ayuntamiento. Las multas son altas.' },
      { q: '¿Qué hago si la marea sube y me deja sin sitio?', a: 'Mira el coeficiente de mareas antes de venir. En Atlántico y Cantábrico la diferencia entre baja y alta marea puede ser de 4-5 metros de playa, en mediterráneo es despreciable.' },
      { q: '¿Se puede ir con perros a una playa de arena?', a: 'Solo en playas explícitamente caninas. La mayoría de playas españolas prohíben perros entre mayo y septiembre. Tienes la lista en /playas-perros.' },
      { q: '¿Qué hago si me roban en la playa?', a: 'Denuncia en la Guardia Civil del puerto cercano. Lleva fotocopia del DNI y deja el original en la habitación. Las fundas estancas para móvil + cartera son la mejor prevención.' },
    ],
    matchPlaya: (p) => /arena/i.test(p.composicion ?? '') || !p.composicion,
    prioridad: 10,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'cala',
    nombre: 'cala',
    titulo: 'Qué llevar a una cala',
    descripcion: 'Imprescindibles para una cala mediterránea: snorkel, sombra portátil, calzado para acceder y todo lo que necesitas cuando no hay servicios cerca.',
    intro: [
      'Una cala es una playa pequeña, a menudo encajada entre acantilados, accesible solo a pie por sendero (a veces empinado) o en barco. Suelen ser el sitio más fotogénico de la costa española y el más complicado de mantener virgen — la masificación de las que aparecen en redes ha sido brutal en los últimos diez años.',
      'En el Mediterráneo dominan calas pequeñas (10-50 metros de playa) con aguas transparentes, fondos rocosos y nada de servicios. En Galicia y Asturias hay calas más grandes, con más agua fría y mareas que cambian el paisaje en horas. En Baleares y Canarias hay calas de récord, pero el aparcamiento puede ser pesadilla.',
      'Vienes preparado o vienes mal. No hay chiringuito, ni socorrista, ni casi nunca cobertura.',
    ],
    productos: [
      { asin: asin('rocosa', 0), razon: 'El sendero hasta la cala suele ser irregular. Escarpines o sandalias deportivas evitan torcerse el tobillo.' },
      { asin: asin('rocosa', 1), razon: 'En la mayoría de calas hay snorkel decente — fondos rocosos cerca de la orilla.' },
      { asin: asin('arena', 0), razon: 'Sombra en cala suele ser limitada. Sombrilla pequeña con anclaje resuelve.' },
      { asin: asin('siempre', 0), razon: 'SPF50 obligatorio. Las calas pequeñas y blancas concentran reflexión.' },
      { asin: asin('siempre', 2), razon: 'Sin chiringuito, agua propia. Termo de 1L mínimo por persona.' },
      { asin: asin('familia', 2), razon: 'Si llevas comida, una nevera pequeña 15-20 L cabe en mochila y te ahorra subir y bajar el sendero.' },
    ],
    cuandoIr: 'Calas pequeñas se llenan en agosto a primera hora — llegar antes de las 9 h. Junio y septiembre son la ventana óptima en mediterráneo (agua de 22-23°C, sin masificación). Mediodía evítalo: el sol cae a pico y la sombra desaparece. Atardecer en cala es de las mejores experiencias del verano español.',
    qHacer: 'Snorkel es la actividad por defecto. Saltos desde rocas si la cala lo permite (revisa profundidad). Lectura larga, picnic. En calas grandes, kayak inflable cabe en mochila. La fotografía al amanecer y al atardecer es brutal por la luz lateral.',
    consejos: [
      'Aparcamiento: en muchas calas mediterráneas hay multas durísimas en temporada. Mira siempre dónde dejas el coche',
      'Sendero: lleva agua extra para la subida de vuelta — el cansancio post-baño es real',
      'No dejes nada en la cala: la basura no la recoge nadie en caladas remotas',
      'Cobertura móvil: en muchas calas no hay. Avisa donde vas si te bañas solo',
      'Si la cala está en zona protegida, respeta el aforo (algunas tienen reservas online)',
      'Marea alta puede dejar la cala sin arena. Mira tabla mareas si vas en Atlántico',
    ],
    faqs: [
      { q: '¿Cuál es la diferencia entre una cala y una playa pequeña?', a: 'Cala suele implicar acceso restringido (sendero o barco), encajada entre acantilados. Una playa pequeña en zona urbana no es cala aunque mida poco.' },
      { q: '¿Hay calas accesibles en coche?', a: 'Pocas. La mayoría requieren caminar 5-30 minutos desde un parking superior. Las que tienen acceso directo en coche suelen estar masificadas en julio-agosto.' },
      { q: '¿Es legal acampar en una cala?', a: 'No, en ninguna playa o cala española sin autorización. Las multas en temporada superan los 1000€. La pernocta en autocaravana también está restringida.' },
      { q: '¿Las calas tienen socorrista?', a: 'En su mayoría no. Solo las más turísticas y solo en julio-agosto. Si te bañas en cala, vas por tu cuenta y riesgo.' },
    ],
    matchPlaya: (p) => p.tipo === 'cala' || /cala|caleta|ensenada/i.test(p.nombre),
    prioridad: 70,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'playa-familiar',
    nombre: 'playa familiar',
    titulo: 'Qué llevar a la playa con niños',
    descripcion: 'Lista práctica para un día de playa con peques: juguetes, sombra, comida, seguridad y los imprescindibles que olvida todo el mundo.',
    intro: [
      'La playa con peques es otro deporte. Lo que para un adulto es 4 horas de relax, con niños son 4 horas de logística: pañales, sed, ganas de hacer pis, otra vez sed, picadura, miedo al agua, arena en los ojos. Si vas preparado, funciona. Si improvisas, vuelves antes.',
      'Las mejores playas para familia tienen tres cosas: pendiente suave (el agua sube poco a poco, no te encuentras al peque a metro y medio), arena fina (modelable, sin piedras que cortan) y servicios cerca (baños, ducha, socorrista). Las playas con bandera azul cumplen muchos de esos criterios — busca también las "playas accesibles", que suelen ser anchas y bien señalizadas.',
      'Lo importante no es llevar todo. Es llevar lo necesario y poder cargarlo en una sola ida.',
    ],
    productos: [
      { asin: asin('familia', 0), razon: 'Carpa de playa con UPF50: imprescindible para bebés (la sombrilla normal no protege ojos ni reflexión).' },
      { asin: asin('familia', 1), razon: 'Set de palas y cubos: 4 horas de plan garantizadas. La calidad de la arena marca más que el set en sí.' },
      { asin: asin('familia', 2), razon: 'Nevera 25-28L: agua fría toda la mañana, fruta fresca, evita ir al chiringuito 5 veces.' },
      { asin: asin('siempre', 0), razon: 'SPF50 mineral (zinc), específico para piel infantil. Reaplicar cada 2 h sin excepción.' },
      { asin: asin('arena', 1), razon: 'Toalla XL de microfibra: una para tumbarse, otra para envolver al peque tras el baño.' },
      { asin: asin('siempre', 1), razon: 'Funda estanca móvil: con peques se cae, se moja, se entierra. La funda salva.' },
      { asin: asin('siempre', 2), razon: 'Termo grande con agua. Los peques piden bebida cada 15 minutos en agosto.' },
    ],
    cuandoIr: 'Para bebés y niños pequeños, evita las horas de sol más fuerte (12-16 h). Llega temprano (8-10 h) o ve al final del día (17-20 h). Junio es el mejor mes: agua ya templada, menos masificación, precios más bajos. Si vas en agosto, busca playas con socorrismo y bandera azul, y llega antes de las 9.',
    qHacer: 'Castillos de arena (la actividad eterna). Buscar conchas y caracolas. Bañarse cerca de la orilla con flotadores (arnés tipo brazaletes mejor que el flotador de cintura). Pasear por la orilla en marea baja. Picnic a la sombra. Si la playa tiene zona de juegos cerca, alternar.',
    consejos: [
      'Marca al peque la línea de tu sombrilla con piedras o palos: si se desorienta sabe volver',
      'No le pongas el bañador antes de salir de casa — viene con tela mojada cuando llegáis y se enfría',
      'Lleva una muda completa por si vomita, pis o accidente. Y bolsas de plástico para la ropa mojada',
      'Recordatorio: el sol quema más entre 12 y 16 — esos son los peores momentos para los más pequeños',
      'Para bebés <6 meses: nada de exposición solar directa, ni siquiera con SPF. Sombra constante',
      'Bandera roja = no entrar al agua, ni siquiera para mojarse los pies. Sin negociar con peques',
    ],
    faqs: [
      { q: '¿A qué edad puede un bebé ir a la playa?', a: 'Pediatras suelen recomendar a partir de los 6 meses, siempre a la sombra, en horas suaves y con SPF mineral si la exposición es inevitable. Antes, mejor evitar.' },
      { q: '¿Qué playas tienen socorrista?', a: 'En España, todas las playas con bandera azul deben tener socorrismo en temporada (julio-agosto). Las playas urbanas grandes también. En cala virgen y playa rural, generalmente no.' },
      { q: '¿Qué hago si mi peque toca una medusa?', a: 'No frotar. Lavar con agua de mar (NO dulce), retirar tentáculos con pinzas o tarjeta, aplicar frío. Si pica mucho o el peque vomita, médico.' },
      { q: '¿Es seguro un flotador hinchable?', a: 'Solo bajo supervisión adulta constante. La corriente puede arrastrarlo mar adentro en segundos. Mejor brazaletes o chaleco salvavidas si el peque no nada.' },
    ],
    matchPlaya: (p) => p.bandera || p.accesible || p.socorrismo,
    prioridad: 50,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'surf',
    nombre: 'surf',
    titulo: 'Qué llevar para hacer surf en España',
    descripcion: 'Material y consejos para una jornada de surf en la costa española: tabla, neopreno, leash, parafina y los imprescindibles que faltan en muchas listas.',
    intro: [
      'El surf en España tiene tres mecas claras: Cantábrico (Mundaka, Zarautz, Salinas, Pantín), Atlántico sur (Tarifa, Conil, El Palmar) y Canarias (Lanzarote, Fuerteventura, Tenerife). Cada zona pide cosas distintas — neopreno grueso en el norte, corto en el sur, sol agresivo en Canarias.',
      'No se trata de tener el mejor material, sino del adecuado a tu nivel, a la temperatura del agua y al tipo de ola. Una tabla de iniciación bien ajustada vale más que una shortboard pro si llevas poco tiempo.',
      'Si nunca has surfeado, contrata clase con escuela homologada antes de comprar nada. La mayoría de las grandes zonas tienen escuelas con material incluido por 30-40€.',
    ],
    productos: [
      { asin: asin('surf', 0), razon: 'Mochila estanca 30L. La esencial para llevar el neopreno mojado, la cartera y el móvil sin que se oxide nada.' },
      { asin: asin('surf', 1), razon: 'GoPro: si surfeas con regularidad, grabar las sesiones es la mejor herramienta para mejorar.' },
      { asin: asin('surf', 2), razon: 'Escarpines de neopreno: en cantábrico y galicia, con agua a 14°C, los pies se congelan en 20 minutos sin ellos.' },
      { asin: asin('siempre', 0), razon: 'SPF50 resistente al agua, formato stick para cara. Reaplicar cada 90 min — surfear quema mucho.' },
      { asin: asin('arena', 1), razon: 'Toalla microfibra XL para secar el neo y para cambiarte sobre la arena.' },
      { asin: asin('siempre', 2), razon: 'Termo con agua o té caliente: salir del agua a 14°C con viento es brutal. Te recompondrá.' },
    ],
    cuandoIr: 'Cantábrico: octubre-marzo es la temporada de las mejores olas, pero el agua está a 12-15°C — neopreno 4/3 mínimo. Verano hay menos olas pero el agua está a 18-20°C. Atlántico sur: levante en verano levanta olas en El Palmar, Tarifa. Canarias: temporada todo el año, mejor en invierno por la temperatura del aire. Mañana temprano (antes de 10) es cuando la mar está más limpia.',
    qHacer: 'Sesión de surf, tirando a moderada (45-90 min) si llevas poco tiempo. Picnic en el coche entre sesión de mañana y tarde. Stretching antes y después — los hombros sufren. Si la ola es grande, observa antes de meterte. Si vas a un nuevo spot, infórmate de corrientes y rocas con un local.',
    consejos: [
      'Nunca surfees solo en spots desconocidos. Si no hay nadie en el agua, suele haber motivo',
      'Respeta el line-up: el surfista más cercano al pico tiene preferencia. Quitar olas genera mal rollo rápido',
      'Lleva siempre un litro de agua para enjuagar el neo después — la sal lo destroza si se seca con ella',
      'Tabla con quillas: las quillas FCS-2 son más fáciles de quitar y poner; las antiguas FCS-1 piden tornillo',
      'Si te enganchas el leash en una roca, no tires — bucea, suéltalo y sal',
      'No subas a tabla si hay bandera roja, da igual cómo de buena se vea la ola',
    ],
    faqs: [
      { q: '¿Cuánto tarda alguien en aprender a surfear?', a: 'Levantarse en olas pequeñas: 2-3 clases. Surfear con autonomía en olas medianas: 6-12 meses con frecuencia semanal. Es una progresión larga, lo cual también es parte del atractivo.' },
      { q: '¿Qué neopreno necesito para España?', a: 'Cantábrico verano: 3/2. Cantábrico invierno: 4/3 + escarpines + capucha si baja de 12°C. Atlántico sur: 2/1 verano, 3/2 invierno. Canarias: 2/1 todo el año.' },
      { q: '¿Puedo llevar mi tabla en avión?', a: 'Sí, casi todas las aerolíneas la cobran como deportivo (50-80€). Mejor en bolsa con sleeve protector. Las quillas se pueden quitar para reducir riesgo de daño.' },
      { q: '¿Cuál es la mejor ola de España para principiantes?', a: 'Las playas largas y abiertas con olas de 0.5-1m: Zarautz, Somo, Razo, Conil, El Palmar. Evita rocky points y olas grandes hasta tener nivel.' },
    ],
    matchPlaya: (p) => !!p.actividades?.surf,
    prioridad: 90,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'snorkel',
    nombre: 'snorkel',
    titulo: 'Qué llevar para hacer snorkel',
    descripcion: 'Material para snorkel en aguas españolas: gafas, tubo, aletas, y los consejos que necesitas para ver más fauna sin molestar al ecosistema.',
    intro: [
      'España tiene aguas para snorkel de todos los niveles. Mediterráneo es el clásico — fondos rocosos cerca de orilla, aguas tranquilas en verano, fauna variada (mero, salmonete, sargo, pulpo, estrella, anémona). Atlántico es más bravo y frío pero los fondos en zonas como las Rías Baixas o el Cabo de Gata son espectaculares. Canarias es agua azul oceánica, peces tropicales y visibilidad de récord.',
      'No necesitas mucho material para empezar. Unas gafas que sellen bien, un tubo respiratorio y aletas cortas son suficiente para horas de exploración. La diferencia entre un set de 15€ y uno de 60€ se nota en el sellado y en la durabilidad.',
      'Lo más importante: respeta la fauna. No toques erizos, estrellas ni corales. No saques nada del agua. La snorkelidad responsable es lo que mantiene esos fondos vivos.',
    ],
    productos: [
      { asin: asin('rocosa', 1), razon: 'Set Cressi Palau de iniciación: gafas que sellan bien, tubo cómodo, aletas ajustables. Mejor relación calidad-precio.' },
      { asin: asin('rocosa', 2), razon: 'Aletas cortas: mejores para maniobrar entre rocas, ocupan menos en la mochila, suficientes para snorkel recreativo.' },
      { asin: asin('rocosa', 0), razon: 'Escarpines: la entrada al agua suele ser por roca. Sin ellos, te cortas en el primer paso.' },
      { asin: asin('siempre', 0), razon: 'SPF50 resistente al agua: vas a estar 1-2h flotando boca abajo. La espalda se quema rápido.' },
      { asin: asin('siempre', 1), razon: 'Funda estanca móvil con cordón: para fotos sumergidas básicas (los móviles modernos resisten 1m unos minutos).' },
      { asin: asin('surf', 1), razon: 'GoPro si snorkelizas a menudo: las fotos sumergidas son las que recordarás del verano.' },
    ],
    cuandoIr: 'Verano: agua entre 20-25°C, visibilidad alta tras varios días sin viento. Mediterráneo: junio-septiembre, mejor por la mañana cuando hay menos lanchas. Atlántico: julio-agosto con neopreno fino. Canarias: todo el año, mejor invierno para evitar el oleaje. Días sin viento de poniente o levante son los mejores — el viento revuelve la arena y baja la visibilidad.',
    qHacer: 'Recorrer la línea de rocas siguiendo la costa (la zona de transición arena-roca es donde hay más vida). Identificar peces con app (Marine Species, iNaturalist). Saltos cortos a profundidad media (2-4m) para ver pulpos en grietas. Fotografía sumergida si llevas equipo. Apnea recreativa moderada (sin forzar, sin solo).',
    consejos: [
      'Frota las gafas con saliva o jabón antes de mojarlas: evita el empañado un par de horas',
      'Respira tranquilo y profundo. La principal causa de cansancio en snorkel es respirar superficial por nervios',
      'Si entras agua al tubo, sopla fuerte para expulsarla — tubos modernos tienen válvula',
      'Aletas cortas para snorkel, largas para apnea. No mezcles: las largas son agotadoras en superficie',
      'No toques nada. Las anémonas y medusas pican; los erizos clavan; los corales son frágiles',
      'Vigila las lanchas en zonas no balizadas. Las hélices son letales',
    ],
    faqs: [
      { q: '¿Cuál es la mejor zona de España para snorkel?', a: 'Cabo de Gata (Almería), L\'Estartit (Costa Brava), Cala Cortina (Murcia), Tabarca (Alicante), El Hierro (Canarias). Las Rías Baixas en Galicia son una opción atlántica.' },
      { q: '¿Necesito titulación para snorkel?', a: 'No. Snorkel es libre. Para apnea avanzada o buceo con bombona sí necesitas curso (PADI, FEDAS).' },
      { q: '¿Qué profundidad puedo bajar con tubo?', a: 'En snorkel libre cualquiera, técnicamente. Lo seguro es 2-5 metros con apnea controlada. No fuerces si te falta el aire.' },
      { q: '¿Qué hago si veo un pulpo o un mero?', a: 'Disfrutas y no haces nada más. No los toques ni los persigas. Los pulpos son tímidos pero curiosos — si te quedas quieto puede acercarse.' },
    ],
    matchPlaya: (p) => !!p.actividades?.snorkel || !!p.actividades?.buceo,
    prioridad: 75,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'kitesurf',
    nombre: 'kitesurf',
    titulo: 'Qué llevar para hacer kitesurf',
    descripcion: 'Equipo y consejos para iniciarse o practicar kitesurf en spots españoles como Tarifa, Empuriabrava, Fuerteventura o Cabo de Trafalgar.',
    intro: [
      'España es uno de los mejores destinos del mundo para kitesurf. Tarifa concentra el viento de levante y poniente más constante de Europa; Empuriabrava ofrece tramontana en invierno; Fuerteventura es alisios todo el año, y Pollensa o La Manga del Mar Menor son escuelas perfectas para empezar.',
      'El kitesurf es un deporte de equipo: dependes de viento, de cuerdas, de barra, de tabla, de ti. La progresión inicial es muy alta — 10-15 horas de clase para autonomía básica — pero los primeros vuelos enganchan rápido.',
      'Imprescindible: nunca te lances sin haber pasado por escuela. Las lesiones por kite mal lanzado son habituales y graves. La inversión en clases es la mejor que harás.',
    ],
    productos: [
      { asin: asin('surf', 0), razon: 'Mochila estanca grande para llevar barra, líneas, neopreno y muda al spot.' },
      { asin: asin('surf', 1), razon: 'GoPro montada en casco o boom: las grabaciones son la mejor forma de ver tus errores y progresar.' },
      { asin: asin('rocosa', 0), razon: 'Escarpines: en muchos spots de levante (Tarifa, Trafalgar) la salida es por roca o piedra. Sin escarpines, te cortas.' },
      { asin: asin('siempre', 0), razon: 'SPF50 stick para cara: el viento + sol + sal son trío demoledor. Reaplicar entre sesiones.' },
      { asin: asin('siempre', 2), razon: 'Hidratación abundante: el kite deshidrata más de lo que parece (calor + esfuerzo + viento).' },
      { asin: asin('arena', 1), razon: 'Toalla microfibra XL: para secar neo, para cambiarte, para sentarte tras la sesión sin pillar arena.' },
    ],
    cuandoIr: 'Tarifa: levante (este) entre marzo y noviembre — los meses de junio y julio tienen viento casi diario. Poniente todo el año pero más débil. Empuriabrava: tramontana (norte) en invierno (octubre-marzo) muy fuerte. Fuerteventura: alisios (norte) todo el año, mejor verano. La Manga: térmico en verano, ideal para principiantes. Las primeras horas (8-11 h) suelen ser las más limpias antes de que el viento racheado.',
    qHacer: 'Sesión de kite (dependiendo de viento y nivel: 1-3 horas). Mucho deportistas combinan con stretching y running para aguantar la temporada. En spots como Tarifa, la cultura de "ride day" es fuerte: madrugar, sesión, cerveza, vuelta a meterse. Si el viento muere, paddle surf o snorkel.',
    consejos: [
      'Antes de lanzarte: revisa siempre líneas, barra, kite y arnés. Una línea enrolada cuesta lesiones',
      'Vigila la previsión: 15-25 nudos es la ventana cómoda para nivel medio. >30 nudos es para avanzados',
      'No vueles si no conoces el spot: corrientes, rocas y zonas restringidas matan',
      'Respeta a otros kiters y a los bañistas: precedencia de barlovento y siempre 100m de bañistas',
      'Si caes en zona de lanchas, recoge el kite enseguida. La hélice es letal',
      'Lleva siempre cuchillo de seguridad accesible: para cortar líneas en emergencia',
    ],
    faqs: [
      { q: '¿Cuánto cuesta empezar en kitesurf?', a: 'Curso completo (10-12 h): 350-500€. Equipo nuevo: 1.200-1.800€ (kite + barra + tabla). Equipo segunda mano puede ahorrar 40-50%.' },
      { q: '¿Qué viento mínimo necesito?', a: 'Depende de tu peso y tabla: 10-12 nudos para tabla grande de iniciación, 14-18 nudos para tabla normal, 20+ para riders avanzados.' },
      { q: '¿Es peligroso el kitesurf?', a: 'Sí, especialmente sin formación. Las lesiones más comunes son por mala maniobra del kite (te lanza al aire), líneas enrredadas con personas, o caerse sobre rocas. Con curso y cabeza, el riesgo baja mucho.' },
      { q: '¿Cuál es el mejor spot de España para empezar?', a: 'La Manga del Mar Menor (aguas planas y poco profundas, escuela perfecta). Después Tarifa, pero hay viento más fuerte y rocas. Empuriabrava si vives cerca.' },
    ],
    matchPlaya: (p) => !!p.actividades?.kite || !!p.actividades?.windsurf,
    prioridad: 85,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'playa-perros',
    nombre: 'playa para perros',
    titulo: 'Qué llevar a la playa con perro',
    descripcion: 'Imprescindibles para un día de playa con perro: agua, juguetes, sombra, normas y los consejos que necesitas para que sea seguro para todos.',
    intro: [
      'Solo unas 130 playas en España permiten perros explícitamente todo el año, y unas 200 más en temporada baja. Antes de salir, confirma horarios y normativa local — las multas por llevar perro a playa no autorizada van de 100 a 750€, y las denuncias por bañistas son habituales.',
      'Las playas para perros suelen estar a las afueras de zonas urbanas, son más pequeñas y rara vez tienen socorrismo, ducha de mascotas o sombra natural. Vienes con todo. La compensación es que tu perro va a tener uno de los mejores días de su año.',
      'Recordatorio para todos: la responsabilidad es tuya. Recoger heces, controlar el ladrido, no dejar al perro suelto cerca de niños. La buena conducta es lo que mantiene esas playas abiertas.',
    ],
    productos: [
      { asin: asin('siempre', 2), razon: 'Termo grande con agua dulce: los perros no deben beber agua de mar, da diarrea grave. Calcula 1-1.5L por perro mediano.' },
      { asin: asin('arena', 1), razon: 'Toalla microfibra XL: para secar al perro al final del día (los perros mojados con arena ensucian todo).' },
      { asin: asin('familia', 0), razon: 'Carpa o sombrilla con anclaje: el perro necesita sombra. Los golpes de calor en perros braquicéfalos (bulldog, carlino) son letales en 30 min.' },
      { asin: asin('siempre', 0), razon: 'Protector solar: las orejas y nariz de perros claros se queman. Hay protectores específicos para mascotas.' },
      { asin: asin('familia', 1), razon: 'Juguete flotante (pelota, frisbee acuático): aporta el 80% de la diversión.' },
      { asin: asin('siempre', 1), razon: 'Funda estanca móvil: vas a hacerle muchas fotos y la sal mata el puerto USB rápido.' },
    ],
    cuandoIr: 'Las primeras horas (7-10) son las mejores: arena fresca, menos gente, menos calor. Las playas perreras en julio-agosto se llenan rápido — mejor primera o última hora. En invierno y temporada baja muchas playas levantan la prohibición y se puede pasear con perro casi en cualquier sitio (confirma siempre).',
    qHacer: 'Lanzar la pelota al agua (la actividad estrella). Caminar la orilla. Si tu perro nada bien, juego de buscar palos en aguas tranquilas. Pasear por la línea de arena dura para no cansar al perro de más. Si la playa tiene zona de sombra, descanso a la sombra cada 30-40 minutos.',
    consejos: [
      'Confirma siempre la playa antes de ir — la lista cambia y las multas son altas',
      'Lleva bolsas para heces. Recoger es obligatorio en TODAS las playas, perreras o no',
      'Después del baño, ducha al perro con agua dulce. La sal le pica y le agrava la dermatitis',
      'Vigila el termómetro: con calor extremo (>30°C) el perro puede sufrir golpe de calor en arena. Pasea por la zona mojada',
      'Mantén al perro a la vista. Las corrientes mar adentro arrastran a perros como a personas',
      'Si tu perro no nada bien, no lo metas a la fuerza. Los perros agotados se ahogan rápido',
    ],
    faqs: [
      { q: '¿Cuántas playas para perros hay en España?', a: 'Unas 130 oficialmente caninas todo el año, más unas 200 que lo permiten en temporada baja. Cataluña, Galicia y Asturias tienen más cobertura. Lista completa en /playas-perros.' },
      { q: '¿Mi perro necesita microchip y vacunas para ir a la playa?', a: 'Microchip sí (es obligatorio en todas las CCAA). Vacuna antirrábica al día y cartilla son recomendadas — algunas playas pueden pedirlas.' },
      { q: '¿Qué hago si el perro bebe agua de mar?', a: 'Un sorbo no pasa nada; si bebe varios, prepárate para diarrea/vómitos en horas. Hidrátalo con agua dulce. Si no mejora en 24h, vet.' },
      { q: '¿Qué pasa si llevo perro a una playa no autorizada?', a: 'Multa de 100-750€ según comunidad, más posible denuncia. La Guardia Civil patrulla en julio-agosto. No vale la pena el riesgo.' },
    ],
    matchPlaya: (p) => !!p.perros,
    prioridad: 95,
  },

  // ────────────────────────────────────────────────────────────────
  {
    slug: 'playa-nudista',
    nombre: 'playa nudista',
    titulo: 'Qué llevar a una playa nudista',
    descripcion: 'Imprescindibles para un día en playa nudista: protección solar especial, sombra, y los códigos de conducta que conviene conocer.',
    intro: [
      'España tiene unas 450 playas naturistas reconocidas — la mayor concentración de Europa, junto a Francia. Algunas son oficiales con señalización (Costa Natura en Estepona, El Almarchal en Cádiz, las playas naturistas de Valencia y Castellón); otras son tradicionalmente naturistas aunque no tengan estatus oficial.',
      'El naturismo en España es libre: la Constitución no prohíbe la desnudez en espacios naturales. Pero hay códigos sociales claros — respeto, no cámaras, no acoso. Las playas que mejor funcionan son las que mantienen esa convivencia.',
      'Llevar lo mismo que a una playa convencional, salvo el bañador. Y un par de cosas extra: protección extra (la piel sin estrenar al sol cae mal), y respeto a la cultura del lugar.',
    ],
    productos: [
      { asin: asin('siempre', 0), razon: 'SPF50 mineral generoso, sobre todo en zonas que normalmente no tomas el sol. Se queman muy rápido y el dolor dura días.' },
      { asin: asin('arena', 0), razon: 'Sombra propia es esencial. La carpa pequeña te permite descanso en zonas que el sol golpea más fuerte que en las cubiertas.' },
      { asin: asin('arena', 1), razon: 'Toalla XL para tumbarse — en nudistas se usa "pareo grande" que cubra superficie suficiente.' },
      { asin: asin('siempre', 2), razon: 'Hidratación abundante: el cuerpo entero al sol pide más agua de la que crees.' },
      { asin: asin('siempre', 1), razon: 'Funda estanca móvil: si necesitas tirar fotos, en nudista hay normas estrictas — solo a ti, nunca a otros.' },
      { asin: asin('lectura', 1), razon: 'Manta picnic XL para tumbarse cómodo cuando la arena está caliente.' },
    ],
    cuandoIr: 'Junio y septiembre son los mejores: agua templada, menos masificación. Mediodía es exigente con la piel — para empezar (si es tu primera vez), mejor mañana o tarde. Las playas naturistas españolas funcionan todo el año en clima cálido (Andalucía, Canarias).',
    qHacer: 'Bañarse, leer, conversar, picnic. La cultura naturista valora la tranquilidad — los grupos se moderan solos. Algunas zonas tienen senderismo costero asociado donde se camina también desnudo. Si vas en pareja, normal; si vas solo, también es completamente aceptado.',
    consejos: [
      'Primer día: limita la exposición a 1-2 h en zonas no acostumbradas. Quemarse es real',
      'Lleva una toalla siempre — sentarse o tumbarse directamente en arena/piedra es de mala educación',
      'Cero fotos a otra gente. Móviles guardados o solo selfies. Las cámaras son rojas',
      'Si tienes dudas o eres nuevo, observa antes de actuar. La gente de la playa te orientará si preguntas',
      'No se "obliga" la desnudez. Puedes ir vestido, en bañador o desnudo — la convivencia es clave',
      'Las parejas, familias y grupos son normales. La acepción social del naturismo es amplia',
    ],
    faqs: [
      { q: '¿Es obligatorio estar desnudo en una playa nudista?', a: 'No. Las playas naturistas españolas son "donde se puede estar desnudo", no "donde hay que estarlo". La gente vestida o en bañador es bienvenida también.' },
      { q: '¿Pueden ir niños a una playa nudista?', a: 'Sí. La cultura naturista incluye familias enteras. La desnudez no se sexualiza — es un código social aceptado.' },
      { q: '¿Qué hago si alguien hace fotos no consentidas?', a: 'Avisa al socorrista o al ayuntamiento. Tomar fotos sin consentimiento es ilegal y socialmente reprobable. Las playas con buena cultura naturista expulsan al transgresor.' },
      { q: '¿Hay socorrista en playas naturistas?', a: 'Algunas oficiales sí (en temporada). Las tradicionales o vírgenes no. Pregunta antes si te baña con corriente.' },
    ],
    matchPlaya: (p) => !!p.nudista,
    prioridad: 88,
  },
]

// Lookup helpers
const PORSLUG = new Map(TIPOS.map(t => [t.slug, t]))

export function getTipoBySlug(slug: string): TipoQueLlevar | null {
  return PORSLUG.get(slug) ?? null
}

/**
 * Devuelve los slugs de tipo que matchean una playa concreta, ordenados
 * por prioridad descendente. Una playa puede matchear varios (ej. una
 * playa con perros + arena + actividad surf → ['playa-perros', 'surf',
 * 'playa-arenosa']).
 */
export function getTiposParaPlaya(playa: Playa): string[] {
  return TIPOS
    .filter(t => t.matchPlaya(playa))
    .sort((a, b) => b.prioridad - a.prioridad)
    .map(t => t.slug)
}

/** Slug por defecto para redirect cuando no hay match (no debería pasar) */
export const TIPO_POR_DEFECTO = 'playa-arenosa'
