// src/data/banderas-negras-2026.ts
// Las 48 Banderas Negras 2026 de Ecologistas en Acción (Tabla 1 del informe
// oficial, junio 2026). Dos por provincia/ciudad costera: una por
// contaminación y otra por mala gestión ambiental.
// Fuente: https://www.ecologistasenaccion.org/372065/informe-banderas-negras-2026/
//
// `slug` enlaza con nuestra ficha cuando la bandera afecta a una playa
// concreta del dataset (para mostrar la ficha y alternativas limpias cerca).

export type TipologiaBN =
  | 'urbanizacion'
  | 'vertidos'
  | 'biodiversidad'
  | 'basuras'
  | 'portuarias'
  | 'quimica'
  | 'patrimonio'
  | 'turistificacion'

export const TIPOLOGIAS: Record<TipologiaBN, { label: string; emoji: string; color: string }> = {
  vertidos:        { label: 'Vertidos y saneamiento deficiente', emoji: '🚱', color: '#7a2818' },
  biodiversidad:   { label: 'Afecciones a la biodiversidad',     emoji: '🐟', color: '#a04818' },
  urbanizacion:    { label: 'Urbanización e invasión del litoral', emoji: '🏗️', color: '#8a6210' },
  quimica:         { label: 'Contaminación química',             emoji: '☣️', color: '#6b1f1f' },
  turistificacion: { label: 'Turistificación y masificación',    emoji: '🚢', color: '#845c22' },
  portuarias:      { label: 'Obras portuarias mal gestionadas',  emoji: '⚓', color: '#4a5a68' },
  basuras:         { label: 'Basuras y microplásticos',          emoji: '🗑️', color: '#5a5040' },
  patrimonio:      { label: 'Daños al patrimonio en el litoral', emoji: '🏛️', color: '#5c4a6b' },
}

export interface BanderaNegra {
  provincia:  string
  comunidad:  string
  titulo:     string
  tipologia:  TipologiaBN
  /** Slug de nuestra ficha si la bandera afecta a una playa concreta del dataset */
  slug?:      string
}

export const BANDERAS_NEGRAS_2026: BanderaNegra[] = [
  // ── Urbanización de la costa e invasión del DPMT (8)
  { provincia: 'Huelva',    comunidad: 'Andalucía',        tipologia: 'urbanizacion', titulo: 'Gestión nefasta de la Playa Central de Isla Cristina', slug: 'playa-central' },
  { provincia: 'Cádiz',     comunidad: 'Andalucía',        tipologia: 'urbanizacion', titulo: 'Tropelías urbanísticas en Vejer, Barbate y Tarifa' },
  { provincia: 'Málaga',    comunidad: 'Andalucía',        tipologia: 'urbanizacion', titulo: 'Licitación de la parcela dunar de la Residencia de Tiempo Libre de Marbella' },
  { provincia: 'Granada',   comunidad: 'Andalucía',        tipologia: 'urbanizacion', titulo: 'Nueva urbanización en la Playa de Los Berengueles (Almuñécar)', slug: 'playa-de-los-berengueles' },
  { provincia: 'Bizkaia',   comunidad: 'País Vasco',       tipologia: 'urbanizacion', titulo: 'Proyecto de construcción de edificios en la Marisma de Lamiako' },
  { provincia: 'Pontevedra', comunidad: 'Galicia',         tipologia: 'urbanizacion', titulo: 'Agresiones urbanísticas en la costa de Cabo Estai' },
  { provincia: 'Girona',    comunidad: 'Cataluña',         tipologia: 'urbanizacion', titulo: 'Plan de Espacios de Interés Natural (PEIN) Muntanyes de Begur' },
  { provincia: 'Bizkaia',   comunidad: 'País Vasco',       tipologia: 'urbanizacion', titulo: 'Factoría de producción de pescado en la cala de Basordas (Lemoniz)' },

  // ── Vertidos, saneamiento y depuración (14)
  { provincia: 'Melilla',   comunidad: 'Melilla',          tipologia: 'vertidos', titulo: 'Alcantarilla en el río de Oro que impide la llegada del agua al mar' },
  { provincia: 'Las Palmas', comunidad: 'Canarias',        tipologia: 'vertidos', titulo: 'Vertidos crónicos por acuicultura industrial en la costa de Telde (Gran Canaria)' },
  { provincia: 'Santa Cruz de Tenerife', comunidad: 'Canarias', tipologia: 'vertidos', titulo: 'Playa de Las Teresitas', slug: 'playa-de-las-teresitas' },
  { provincia: 'Cádiz',     comunidad: 'Andalucía',        tipologia: 'vertidos', titulo: 'Arco de la Bahía de Algeciras' },
  { provincia: 'Málaga',    comunidad: 'Andalucía',        tipologia: 'vertidos', titulo: 'Vertido de aguas residuales en la playa de Maro (Nerja)', slug: 'playa-de-maro' },
  { provincia: 'Granada',   comunidad: 'Andalucía',        tipologia: 'vertidos', titulo: 'Vertidos en la Playa de la Charca (Salobreña)', slug: 'playa-de-la-charca' },
  { provincia: 'Valencia',  comunidad: 'Comunitat Valenciana', tipologia: 'vertidos', titulo: 'Contaminación por aguas fecales y deficiencias en el saneamiento litoral' },
  { provincia: 'Alicante',  comunidad: 'Comunitat Valenciana', tipologia: 'vertidos', titulo: "L'Albufereta i Cap de l'Horta (Alacant)", slug: 'la-albufereta-alacantalicante' },
  { provincia: 'A Coruña',  comunidad: 'Galicia',          tipologia: 'vertidos', titulo: 'Vertidos contaminantes en la costa de Ferrolterra' },
  { provincia: 'Baleares',  comunidad: 'Islas Baleares',   tipologia: 'vertidos', titulo: 'Cala Galdana (Menorca)', slug: 'cala-galdana-ferreries' },
  { provincia: 'Barcelona', comunidad: 'Cataluña',         tipologia: 'vertidos', titulo: 'Sant Adrià del Besòs: parque del litoral y playa contaminada' },
  { provincia: 'Asturias',  comunidad: 'Asturias',         tipologia: 'vertidos', titulo: 'Deficiencias de saneamiento en la costa asturiana: playa de Bañugues (Gozón)', slug: 'playa-de-banugues' },
  { provincia: 'Ceuta',     comunidad: 'Ceuta',            tipologia: 'vertidos', titulo: 'Vertidos en el LIC del Monte Hacho (proyecto INTEMARES)' },
  { provincia: 'Tarragona', comunidad: 'Cataluña',         tipologia: 'vertidos', titulo: 'Extracciones de arena y vertidos en la playa de la Paella (Torredembarra)', slug: 'la-paella-torredembarra' },

  // ── Afecciones a la biodiversidad (9)
  { provincia: 'Castellón', comunidad: 'Comunitat Valenciana', tipologia: 'biodiversidad', titulo: 'Playa La Ribera de Cabanes', slug: 'platja-de-torre-de-la-sal' },
  { provincia: 'Lugo',      comunidad: 'Galicia',          tipologia: 'biodiversidad', titulo: 'Degradación de As Catedrais – Augas Santas por falta de Plan de Conservación', slug: 'as-catedrais-ribadeo' },
  { provincia: 'Lugo',      comunidad: 'Galicia',          tipologia: 'biodiversidad', titulo: 'Degradación ambiental de la isla Pancha (Ribadeo)' },
  { provincia: 'Barcelona', comunidad: 'Cataluña',         tipologia: 'biodiversidad', titulo: 'Ampliación del Aeropuerto del Prat' },
  { provincia: 'Girona',    comunidad: 'Cataluña',         tipologia: 'biodiversidad', titulo: 'El Golfet de Palafrugell' },
  { provincia: 'Ceuta',     comunidad: 'Ceuta',            tipologia: 'biodiversidad', titulo: 'Frente sumergido de Punta Almina' },
  { provincia: 'Gipuzkoa',  comunidad: 'País Vasco',       tipologia: 'biodiversidad', titulo: 'No restauración del humedal de Motondo (Orio)' },
  { provincia: 'Gipuzkoa',  comunidad: 'País Vasco',       tipologia: 'biodiversidad', titulo: 'Piscifactoría abandonada de la cala Agiti sin restauración ambiental' },
  { provincia: 'Asturias',  comunidad: 'Asturias',         tipologia: 'biodiversidad', titulo: 'Renaturalización pendiente de las marismas de Maqua (Avilés)' },

  // ── Basuras, plásticos y microplásticos (2)
  { provincia: 'Melilla',   comunidad: 'Melilla',          tipologia: 'basuras', titulo: 'Basuras en Aguadú' },
  { provincia: 'Castellón', comunidad: 'Comunitat Valenciana', tipologia: 'basuras', titulo: 'Playa del Surrach (Benicarló)', slug: 'platja-de-surrac' },

  // ── Obras portuarias o de defensa costera (3)
  { provincia: 'Almería',   comunidad: 'Andalucía',        tipologia: 'portuarias', titulo: 'Playas del Levante de la Reserva Natural de Punta Entinas-Sabinar (Almerimar–El Ejido)' },
  { provincia: 'Valencia',  comunidad: 'Comunitat Valenciana', tipologia: 'portuarias', titulo: 'Afecciones a las playas del entorno del Puerto de València y Sagunto por las obras de ampliación' },
  { provincia: 'Pontevedra', comunidad: 'Galicia',         tipologia: 'portuarias', titulo: 'Impacto ambiental de la ampliación del Puerto Deportivo de Baiona' },

  // ── Contaminación química (7)
  { provincia: 'Huelva',    comunidad: 'Andalucía',        tipologia: 'quimica', titulo: 'Contaminación histórica en la Ría de Huelva' },
  { provincia: 'Almería',   comunidad: 'Andalucía',        tipologia: 'quimica', titulo: 'Contaminación radiactiva en la playa de Quitapellejos (Palomares)', slug: 'playa-de-quitapellejos' },
  { provincia: 'A Coruña',  comunidad: 'Galicia',          tipologia: 'quimica', titulo: 'Mina de Monte Neme (Carballo–Malpica)' },
  { provincia: 'Cantabria', comunidad: 'Cantabria',        tipologia: 'quimica', titulo: 'Vertido industrial en la playa de Usgo (Miengo)', slug: 'playa-de-usgo' },
  { provincia: 'Tarragona', comunidad: 'Cataluña',         tipologia: 'quimica', titulo: "Contaminación química en el litoral de l'Ametlla de Mar" },
  { provincia: 'Murcia',    comunidad: 'Murcia',           tipologia: 'quimica', titulo: 'Bahía de Portmán y Sierra Minera' },
  { provincia: 'Murcia',    comunidad: 'Murcia',           tipologia: 'quimica', titulo: 'Mar Menor y su cuenca vertiente' },

  // ── Daños al patrimonio histórico y cultural (1)
  { provincia: 'Cantabria', comunidad: 'Cantabria',        tipologia: 'patrimonio', titulo: 'Senda costera de Santander' },

  // ── Turistificación y masificación (4)
  { provincia: 'Las Palmas', comunidad: 'Canarias',        tipologia: 'turistificacion', titulo: 'Cruceros en Lanzarote: masificación turística y contaminación' },
  { provincia: 'Santa Cruz de Tenerife', comunidad: 'Canarias', tipologia: 'turistificacion', titulo: 'Macrourbanización turística Cuna del Alma (El Puertito de Adeje)' },
  { provincia: 'Baleares',  comunidad: 'Islas Baleares',   tipologia: 'turistificacion', titulo: 'Fondeos ilegales y vertidos en la bahía de Pollença (Mallorca)' },
  { provincia: 'Alicante',  comunidad: 'Comunitat Valenciana', tipologia: 'turistificacion', titulo: "Playa de l'Almadrava", slug: 'platja-de-lalmadrava' },
]
