// src/data/ciudades-interior.ts — Ciudades de interior con demanda real de
// "playas cerca de X". Coordenadas del centro urbano + texto editorial ÚNICO
// por ciudad (corredores reales, tiempos honestos, matices locales). Las
// playas se calculan en runtime con getPlayasCercaDe (haversine + parking).
//
// El tiempo en coche que muestra la página es una ESTIMACIÓN por distancia
// y factor de carretera — la página lo dice tal cual.

export interface CiudadInterior {
  slug: string
  ciudad: string
  lat: number
  lng: number
  /** 2 párrafos editoriales propios: qué costa toca, corredor, consejo. */
  guia: string[]
}

export const CIUDADES_INTERIOR: CiudadInterior[] = [
  {
    slug: 'madrid', ciudad: 'Madrid', lat: 40.4168, lng: -3.7038,
    guia: [
      'La playa "de Madrid" es, con permiso de los pantanos, la de Valencia: la A-3 planta a un madrileño en la arena de El Saler o la Malvarrosa en unas tres horas y media sin peajes. El segundo corredor clásico es la A-42/A-4 hacia el sur, pero ahí el mar queda a más de cinco horas — por eso el fin de semana playero exprés de la capital es levantino casi siempre.',
      'El truco que separa a los veteranos de los novatos es la hora de salida: viernes antes de las 15h o sábado antes de las 8h. La vuelta del domingo, mejor después de cenar en la playa que a las 18h con toda la operación retorno. Y si el Levante sopla fuerte en Valencia, gira el plan hacia Castellón: misma autovía, playas más abiertas y casi siempre más sitio.',
    ],
  },
  {
    slug: 'zaragoza', ciudad: 'Zaragoza', lat: 41.6488, lng: -0.8891,
    guia: [
      'Zaragoza es la gran ciudad española con más playas "a tiro" de las que parece: Salou y la Costa Daurada por la AP-2 en menos de dos horas y media, y el Delta del Ebro — el secreto mejor guardado del Mediterráneo — a la misma distancia por la A-68/N-340. Al norte, San Sebastián queda a dos horas y media por la A-15: pocos zaragozanos se dan cuenta de que tienen dos mares en empate técnico.',
      'La decisión inteligente es por viento y temporada: con cierzo fuerte, el Delta y la Costa Daurada se disfrutan poco — es el día de tirar al Cantábrico. En agosto, al revés: Salou y Cambrils absorben multitudes mientras las playas del Delta (la Marquesa, el Trabucador) siguen medio vacías con agua a 26 grados.',
    ],
  },
  {
    slug: 'sevilla', ciudad: 'Sevilla', lat: 37.3891, lng: -5.9845,
    guia: [
      'Sevilla juega con ventaja: la Costa de la Luz entera a entre una hora (Matalascañas, por la A-49) y hora y media (Conil, Roche, por la AP-4/A-48). La pregunta sevillana no es "¿hay playa cerca?" sino "¿Huelva o Cádiz?" — arena infinita y tranquila hacia el oeste, o pueblos con más ambiente y más viento hacia el sur.',
      'El dato que decide el día: el viento de Cádiz. Con levante fuerte, Conil, El Palmar o Bolonia se vuelven una lijadora — ese día se va a Huelva (Punta Umbría, La Antilla), que queda resguardada. Con poniente, al revés: Cádiz está en su mejor versión. Míralo antes de arrancar; son 40 km de diferencia y un día de playa completamente distinto.',
    ],
  },
  {
    slug: 'cordoba', ciudad: 'Córdoba', lat: 37.8882, lng: -4.7794,
    guia: [
      'Desde Córdoba, la playa más rápida es la de Málaga capital: la A-45 baja en poco más de hora y media, y eso convierte a la Costa del Sol en la piscina de agosto de media ciudad. La alternativa con más encanto es seguir un poco más hacia el este (Rincón de la Victoria, Torre del Mar) o el oeste (Fuengirola), donde el mismo viaje rinde playas menos saturadas.',
      'Consejo cordobés de pura supervivencia: en julio y agosto el termómetro local hace que TODOS bajen el mismo sábado. Sal antes de las 8h o pasa el pico de calor en la playa y vuelve de noche — la A-45 a las 20h del domingo es el peor tramo del sur de España.',
    ],
  },
  {
    slug: 'granada', ciudad: 'Granada', lat: 37.1773, lng: -3.5986,
    guia: [
      'Granada tiene la playa más cerca de lo que el tópico de la nieve sugiere: la Costa Tropical (Salobreña, Almuñécar, La Herradura) queda a una hora por la A-44, autovía completa y sin peajes. Es una costa de calas de canto y agua limpia que no se parece en nada a la Costa del Sol: menos masa, más buceo y el microclima subtropical que le da nombre.',
      'La jugada granadina perfecta es la doble sesión de primavera y otoño: esquí o senderismo en Sierra Nevada por la mañana y baño en La Herradura por la tarde — hay pocas capitales de Europa donde ese plan quepa en un solo día. En verano, madruga: el aparcamiento de las calas buenas (Cantarriján, Calahonda) se acaba a media mañana.',
    ],
  },
  {
    slug: 'toledo', ciudad: 'Toledo', lat: 39.8628, lng: -4.0273,
    guia: [
      'Toledo comparte destino playero con Madrid pero con media hora de ventaja hacia el sur: la ruta natural es la CM-42/A-43 hacia el Levante, con las playas de Alicante y Murcia a unas tres horas y media, o la clásica A-3 vía Madrid hacia Valencia. Para escapadas de un día, el Mar Menor es la opción más rentable: agua caliente garantizada y aparcamiento más fácil que en la costa alicantina.',
      'Si el plan es de fin de semana completo, considera el desvío a las calas del Cabo de Palos o La Manga: el mismo tiempo de coche que Valencia, pero con snorkel de reserva marina. Y en pleno agosto, la salida del viernes por la CM-42 ahorra el embudo madrileño de la A-3, que es donde los planes de playa toledanos van a morir.',
    ],
  },
  {
    slug: 'valladolid', ciudad: 'Valladolid', lat: 41.6523, lng: -4.7245,
    guia: [
      'Para Valladolid, el mar es el Cantábrico: Santander y las playas de Cantabria (El Sardinero, Somo, Langre) a unas dos horas y media por la A-67. La alternativa asturiana (Gijón, por la A-66 y el Huerna) tarda algo más pero regala la mejor sidra del viaje. La costa vallisoletana de facto es la cántabra: arena fina, mareas de verdad y 10 grados menos que la meseta en agosto.',
      'El matiz que cambia el día: las mareas. En el Cantábrico una playa enorme a mediodía puede quedarse en una franja mínima con la pleamar — mira la tabla de mareas antes de elegir hora, no después de extender la toalla. Y lleva capa: el norte te puede recibir con sol radiante o con sirimiri en el mismo fin de semana.',
    ],
  },
  {
    slug: 'salamanca', ciudad: 'Salamanca', lat: 40.9701, lng: -5.6635,
    guia: [
      'Salamanca es de las capitales peninsulares más lejos del mar, y aun así tiene dos rutas dignas: el Cantábrico por la A-66 (Gijón, unas tres horas y media) y — la que casi nadie baraja — las Rías Baixas gallegas por la A-52 vía Zamora, a unas cuatro horas de Sanxenxo. Para un fin de semana largo, la opción gallega rinde más: más playas por kilómetro de costa que en ningún otro sitio de España.',
      'La decisión honesta para una escapada de un solo día es que no compensa: casi ocho horas de coche para cuatro de playa. El formato salmantino que funciona es el de dos noches — salir viernes por la tarde, dormir en destino y exprimir el sábado entero. Con ese esquema, Gijón y su playa de San Lorenzo son imbatibles en relación kilómetros/plan.',
    ],
  },
  {
    slug: 'burgos', ciudad: 'Burgos', lat: 42.3439, lng: -3.6969,
    guia: [
      'Burgos tiene el Cantábrico a hora y media: la A-1/AP-1 y el túnel de la N-623 dejan Santander y su bahía a menos de 160 km, y las playas surferas de Cantabria oriental (Somo, Loredo, Langre) apenas un poco más allá. Es, con diferencia, la capital de la meseta con mejor acceso al mar — los burgaleses tienen playa de tarde si madrugan un poco.',
      'El plan fino es elegir playa según el viento sur: cuando en Burgos hace bochorno con viento sur, en la costa cántabra suele haber niebla o mar revuelto — ese día compensa tirar un poco más al este (Laredo, Berria) donde el efecto se nota menos. Y septiembre es el secreto: agua en su punto más cálido del año y las playas ya vacías.',
    ],
  },
  {
    slug: 'leon', ciudad: 'León', lat: 42.5987, lng: -5.5671,
    guia: [
      'León baja al mar por el Huerna: la A-66 planta a un leonés en Gijón en poco más de hora y media, peaje mediante, con la playa de San Lorenzo como puerta de entrada a toda la costa asturiana. Hacia el occidente quedan las joyas (Cuevas del Mar, Gulpiyuri hacia el oriente; Penarronda hacia el oeste) a distancias que caben perfectamente en un día.',
      'La regla leonesa: no te cases con una playa, cásate con un tramo. La costa asturiana cambia de carácter cada 20 km y las nacionales son lentas — elige comarca (Llanes, Gijón-Villaviciosa o el occidente de Luarca) y explora a fondo esa, en lugar de cruzar Asturias entera persiguiendo la foto de Instagram de Gulpiyuri, que además tiene el aforo de un autobús.',
    ],
  },
  {
    slug: 'pamplona', ciudad: 'Pamplona', lat: 42.8125, lng: -1.6458,
    guia: [
      'Pamplona tiene una de las mejores relaciones ciudad-playa de España: San Sebastián y La Concha a una hora justa por la A-15. Eso convierte la tarde de playa donostiarra en plan de diario para los pamploneses — y explica por qué en Gros o la Zurriola se oye tanto acento navarro los sábados. Hacia el oeste, la costa de Bizkaia (Lekeitio, Laga) queda a poco más de hora y media.',
      'El movimiento inteligente es esquivar La Concha en agosto (llena desde las 11h) y repartir juego: Zarautz para paseo y olas, Getaria para comer y bañarse en una playa de puerto sin oleaje, o Hondarribia para un plan familiar con Francia enfrente. Todas a la misma hora de coche, todas con parking complicado — el tren o el bus desde Donosti son el truco local.',
    ],
  },
  {
    slug: 'vitoria-gasteiz', ciudad: 'Vitoria-Gasteiz', lat: 42.8467, lng: -2.6716,
    guia: [
      'Vitoria juega a dos costas: la vizcaína por la A-625/BI-30 (una hora larga hasta las playas de Getxo o Plentzia) y la guipuzcoana por la A-1 (Zarautz y San Sebastián en torno a la hora y cuarto). La primera es más rápida; la segunda, para muchos, más playa: arenales más largos y más ambiente.',
      'El dato alavés que pocos foráneos manejan: cuando la niebla (el típico "sirimiri costero") tapa Bizkaia, Gipuzkoa puede estar despejada, y viceversa — el efecto pantalla de las montañas parte la costa vasca en dos climas. Consulta las webcams antes de elegir carretera; media hora de coche separa un día gris de uno de manga corta.',
    ],
  },
  {
    slug: 'logrono', ciudad: 'Logroño', lat: 42.4627, lng: -2.4449,
    guia: [
      'Desde Logroño, el mar más cercano es el Cantábrico oriental: la AP-68 y luego la A-8 dejan las playas de Laredo, Berria y Noja a alrededor de hora y media, y la costa vizcaína a apenas algo más. Laredo, con sus cinco kilómetros de arenal, es la playa "de La Rioja" de toda la vida — en agosto se nota en las matrículas.',
      'El plan redondo riojano es el combinado: mañana de playa en Laredo o Santoña, y anchoas y parada en un asador de Santoña antes de volver — el mejor bocado marinero a hora y media de los viñedos. Si el nordeste sopla fuerte (habitual en verano por la tarde), Berria se pica pronto; Laredo, más cerrada, aguanta mejor.',
    ],
  },
  {
    slug: 'lleida', ciudad: 'Lleida', lat: 41.6176, lng: 0.6200,
    guia: [
      'Lleida es la capital catalana de interior con la Costa Daurada en el bolsillo: la AP-2 deja Salou, Cambrils y La Pineda a una hora y media escasa. Y hacia el sur, a la misma distancia, el Delta del Ebro ofrece exactamente lo contrario: kilómetros de arena sin edificios, flamencos y agua somera que es una bendición con niños.',
      'La elección leridana es de carácter: ¿día de toboganes, paseo marítimo y paella en Cambrils, o día de playa infinita y arrozales en el Trabucador? En temporada alta la respuesta práctica la da el aparcamiento — en Salou es deporte de riesgo a partir de las 11h; en el Delta sobra sitio hasta en agosto.',
    ],
  },
  {
    slug: 'albacete', ciudad: 'Albacete', lat: 38.9943, lng: -1.8585,
    guia: [
      'El chiste manda ("Albacete, playa y chalet") pero la realidad es seria: la A-31 deja Alicante y sus playas urbanas en poco más de hora y media, y la A-30 pone el Mar Menor y La Manga a la misma distancia. Pocas capitales de interior tienen dos costas distintas tan cerca — la albaceteña es una de las escapadas de playa más eficientes de España.',
      'El reparto que funciona: Mar Menor para familias (agua caliente, sin olas, fondo que cubre tarde) y la Costa Blanca para el resto de planes — el Postiguet si quieres ciudad, San Juan si quieres arenal, las calas de Santa Pola si quieres snorkel. En julio-agosto, la salida del viernes por la A-31 se atasca en Almansa: sal antes de las 17h o después de las 21h.',
    ],
  },
  {
    slug: 'badajoz', ciudad: 'Badajoz', lat: 38.8794, lng: -6.9707,
    guia: [
      'Badajoz mira al Atlántico por dos puertas: la portuguesa — las playas del Alentejo y el Algarve oriental (Isla Cristina queda "detrás" de Ayamonte) — y la onubense por la A-49, con Punta Umbría, La Antilla e Islantilla a unas dos horas y media. La opción española gana en servicios; la portuguesa (Monte Gordo, Altura) en tranquilidad y precio del pescado.',
      'El matiz pacense: en pleno verano, la diferencia térmica con la costa ronda los diez grados — el viaje compensa hasta entre semana. Y si vas por Portugal, recuerda el cambio horario a favor a la ida (ganas una hora de playa) y en contra a la vuelta; más de un pacense ha llegado tarde a cenar por olvidarlo.',
    ],
  },
]

export function getCiudadInterior(slug: string): CiudadInterior | undefined {
  return CIUDADES_INTERIOR.find(c => c.slug === slug)
}
