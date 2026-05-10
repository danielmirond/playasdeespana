// src/lib/enlazado.ts — Grafo de enlazado interno entre topic pages.
//
// Cada topic conoce sus relaciones: similar (mismo intent), complementary
// (intent adyacente), services (POI nearby), practical (qué llevar, FAQs),
// geographic (CCAAs/provincias relevantes).
//
// El componente <EnlacesRelacionados topic="aguas-cristalinas" /> usa
// este grafo para renderizar 4-8 enlaces categorizados al final de cada
// topic page. Mantener este archivo es la única fuente de verdad.

export interface EnlaceConfig {
  href:    string
  label:   string
  /** Intent o relación: mismo público, complementario, servicio, etc. */
  kind:    'similar' | 'complementary' | 'service' | 'practical' | 'geographic'
  /** Frase corta opcional para card-format */
  desc?:   string
}

/** Slug → enlaces relacionados ordenados por relevancia */
export const RELACIONES: Record<string, EnlaceConfig[]> = {
  // ───────────────────────────────────────────── TYPE 1: filtros de playa
  'aguas-cristalinas': [
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar',    desc: 'Rincones escondidos con aguas turquesa' },
    { href: '/playas-paradisiacas',   label: 'Playas paradisíacas en España', kind: 'similar',  desc: 'Las más bonitas del litoral' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'complementary', desc: 'Calidad certificada del agua' },
    { href: '/calidad-agua',          label: 'Calidad del agua de baño', kind: 'complementary', desc: 'Cómo se mide la transparencia (datos EEA)' },
    { href: '/buceo',                 label: 'Buceo en España',          kind: 'service',       desc: 'Aguas claras, fondos vivos' },
    { href: '/que-llevar/snorkel',    label: 'Qué llevar para snorkel',  kind: 'practical' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
  ],

  'paradisiacas': [
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/playas-secretas',       label: 'Playas secretas en España', kind: 'similar' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'complementary' },
    { href: '/alquiler-barco-playa',  label: 'Alquilar barco con patrón',kind: 'service' },
    { href: '/que-llevar/playa-arenosa', label: 'Qué llevar a la playa', kind: 'practical' },
    { href: '/islas',                 label: 'Playas por isla',          kind: 'geographic' },
  ],

  'calas': [
    { href: '/playas-paradisiacas',   label: 'Playas paradisíacas en España', kind: 'similar' },
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'similar' },
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/alquiler-barco-playa',  label: 'Alquilar barco con patrón',kind: 'service',       desc: 'Llegar a las que no tienen carretera' },
    { href: '/que-llevar/cala',       label: 'Qué llevar a una cala',    kind: 'practical' },
    { href: '/comunidad/cataluna',    label: 'Playas de Cataluña',       kind: 'geographic' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
  ],

  'secretas': [
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/playas-paradisiacas',   label: 'Playas paradisíacas en España', kind: 'similar' },
    { href: '/playas-autocaravana',   label: 'Playas para autocaravana', kind: 'similar' },
    { href: '/rutas',                 label: 'Rutas costeras por España',kind: 'complementary' },
    { href: '/playas-cerca-de-mi',    label: 'Playas cerca de mí',       kind: 'practical' },
    { href: '/que-llevar/cala',       label: 'Qué llevar a una cala',    kind: 'practical' },
  ],

  'familias': [
    { href: '/playas-accesibles',     label: 'Playas accesibles en España', kind: 'similar',    desc: 'Acceso adaptado y servicios PMR' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'complementary', desc: 'Socorrismo y calidad certificada' },
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'complementary', desc: 'Sin algas, sin oleaje fuerte' },
    { href: '/medusas',               label: 'Temporada de medusas',     kind: 'complementary' },
    { href: '/campings',              label: 'Campings cerca de la playa', kind: 'service' },
    { href: '/hoteles-playa',         label: 'Hoteles en la playa',      kind: 'service' },
    { href: '/protectores-solares',   label: 'Protectores solares',      kind: 'service' },
    { href: '/que-llevar/playa-familiar', label: 'Qué llevar con niños', kind: 'practical' },
  ],

  'atardeceres': [
    { href: '/playas-paradisiacas',   label: 'Playas paradisíacas en España', kind: 'similar' },
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/comunidad/galicia',     label: 'Playas de Galicia',        kind: 'geographic' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
    { href: '/provincia/cadiz',       label: 'Playas de Cádiz',          kind: 'geographic' },
  ],

  'perros': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'similar' },
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'complementary',desc: 'Calas con menos restricciones' },
    { href: '/playas-autocaravana',   label: 'Playas para autocaravana', kind: 'complementary' },
    { href: '/campings',              label: 'Campings cerca de la playa', kind: 'service' },
    { href: '/que-llevar/playa-perros', label: 'Qué llevar con perro',   kind: 'practical' },
    { href: '/medusas',               label: 'Temporada de medusas',     kind: 'complementary' },
  ],

  'nudistas': [
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'similar' },
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/que-llevar/playa-nudista', label: 'Qué llevar a una playa nudista', kind: 'practical' },
    { href: '/protectores-solares',   label: 'Protectores solares',      kind: 'service' },
    { href: '/comunidad/cataluna',    label: 'Playas de Cataluña',       kind: 'geographic' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
  ],

  'accesibles': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'similar',       desc: 'Servicios y socorrismo' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'complementary' },
    { href: '/hoteles-playa',         label: 'Hoteles en la playa',      kind: 'service' },
    { href: '/playas-cerca-de-mi',    label: 'Playas cerca de mí',       kind: 'practical' },
    { href: '/metodologia',           label: 'Metodología',              kind: 'practical' },
  ],

  'banderas-azules': [
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/familias',              label: 'Playas para familias',     kind: 'similar' },
    { href: '/playas-accesibles',     label: 'Playas accesibles en España', kind: 'similar' },
    { href: '/calidad-agua',          label: 'Calidad del agua de baño', kind: 'complementary' },
    { href: '/medusas',               label: 'Temporada de medusas',     kind: 'complementary' },
    { href: '/comparar',              label: 'Comparar playas',          kind: 'practical' },
  ],

  'sin-viento': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'similar',       desc: 'Aguas tranquilas, ocupación baja' },
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/buceo',                 label: 'Buceo en España',          kind: 'service' },
    { href: '/que-llevar/snorkel',    label: 'Qué llevar para snorkel',  kind: 'practical' },
  ],

  'autocaravana': [
    { href: '/campings',              label: 'Campings cerca de la playa', kind: 'service',     desc: 'Áreas con servicios para autocaravanas' },
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'similar' },
    { href: '/rutas',                 label: 'Rutas costeras por España',kind: 'practical' },
    { href: '/que-llevar/playa-arenosa', label: 'Qué llevar a la playa', kind: 'practical' },
    { href: '/playas-perros',         label: 'Playas para perros',       kind: 'complementary' },
  ],

  'islas': [
    { href: '/playas-paradisiacas',   label: 'Playas paradisíacas en España', kind: 'similar' },
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/alquiler-barco-playa',  label: 'Alquilar barco con patrón',kind: 'service' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
  ],

  // ───────────────────────────────────────────── TYPE 2: servicios
  'campings': [
    { href: '/playas-autocaravana',   label: 'Playas para autocaravana', kind: 'similar' },
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'similar' },
    { href: '/familias',              label: 'Playas para familias',     kind: 'complementary' },
    { href: '/playas-perros',         label: 'Playas para perros',       kind: 'complementary' },
    { href: '/rutas',                 label: 'Rutas costeras por España',kind: 'practical' },
    { href: '/alquiler-barco-playa',  label: 'Alquilar barco con patrón',kind: 'service' },
  ],

  'buceo': [
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar' },
    { href: '/que-llevar/snorkel',    label: 'Qué llevar para snorkel',  kind: 'practical' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
    { href: '/provincia/almeria',     label: 'Playas de Almería',        kind: 'geographic' },
  ],

  'surf': [
    { href: '/que-llevar/surf',       label: 'Qué llevar para surf',     kind: 'practical' },
    { href: '/que-llevar/kitesurf',   label: 'Qué llevar para kitesurf', kind: 'similar' },
    { href: '/comunidad/pais-vasco',  label: 'Playas de País Vasco',     kind: 'geographic' },
    { href: '/comunidad/cantabria',   label: 'Playas de Cantabria',      kind: 'geographic' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
    { href: '/provincia/cadiz',       label: 'Playas de Cádiz',          kind: 'geographic' },
  ],

  'kitesurf': [
    { href: '/surf',                  label: 'Surf en España',           kind: 'similar' },
    { href: '/que-llevar/kitesurf',   label: 'Qué llevar para kitesurf', kind: 'practical' },
    { href: '/provincia/cadiz',       label: 'Playas de Cádiz',          kind: 'geographic' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
  ],

  'hoteles-playa': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'similar' },
    { href: '/playas-accesibles',     label: 'Playas accesibles en España', kind: 'similar' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'complementary' },
    { href: '/campings',              label: 'Campings cerca de la playa', kind: 'similar' },
    { href: '/comparar',              label: 'Comparar playas',          kind: 'practical' },
  ],

  'alquiler-barco': [
    { href: '/calas-con-encanto',     label: 'Calas con encanto en España', kind: 'similar',    desc: 'Las que solo se llegan en barco' },
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'similar' },
    { href: '/playas-paradisiacas',   label: 'Playas paradisíacas en España', kind: 'similar' },
    { href: '/comunidad/islas-baleares', label: 'Playas de Baleares',    kind: 'geographic' },
    { href: '/comunidad/canarias',    label: 'Playas de Canarias',       kind: 'geographic' },
    { href: '/comunidad/cataluna',    label: 'Playas de Cataluña',       kind: 'geographic' },
  ],

  // ───────────────────────────────────────────── TYPE 3: editorial
  'medusas': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'practical' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'practical' },
    { href: '/playas-perros',         label: 'Playas para perros',       kind: 'practical' },
    { href: '/calidad-agua',          label: 'Calidad del agua de baño', kind: 'complementary' },
    { href: '/que-llevar/playa-arenosa', label: 'Qué llevar a la playa', kind: 'practical' },
  ],

  'calidad-agua': [
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'similar' },
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/medusas',               label: 'Temporada de medusas',     kind: 'complementary' },
    { href: '/metodologia',           label: 'Metodología',              kind: 'practical' },
  ],

  'protectores-solares': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'service' },
    { href: '/que-llevar/playa-arenosa', label: 'Qué llevar a la playa', kind: 'practical' },
    { href: '/que-llevar/snorkel',    label: 'Qué llevar para snorkel',  kind: 'practical' },
  ],

  'seguros-viaje': [
    { href: '/familias',              label: 'Playas para familias',     kind: 'service' },
    { href: '/medusas',               label: 'Temporada de medusas',     kind: 'complementary' },
    { href: '/que-llevar/playa-arenosa', label: 'Qué llevar a la playa', kind: 'practical' },
  ],

  'metodologia': [
    { href: '/calidad-agua',          label: 'Calidad del agua de baño', kind: 'practical' },
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'practical' },
    { href: '/comparar',              label: 'Comparar playas',          kind: 'practical' },
  ],

  'comparar': [
    { href: '/banderas-azules',       label: 'Playas con Bandera Azul',  kind: 'similar' },
    { href: '/playas-aguas-cristalinas', label: 'Playas con aguas cristalinas', kind: 'similar' },
    { href: '/familias',              label: 'Playas para familias',     kind: 'similar' },
    { href: '/playas-cerca-de-mi',    label: 'Playas cerca de mí',       kind: 'practical' },
  ],

  'rutas': [
    { href: '/playas-secretas',       label: 'Playas secretas en España',kind: 'similar' },
    { href: '/playas-autocaravana',   label: 'Playas para autocaravana', kind: 'similar' },
    { href: '/campings',              label: 'Campings cerca de la playa', kind: 'service' },
    { href: '/comparar',              label: 'Comparar playas',          kind: 'practical' },
  ],
}


/** Etiqueta humana para cada categoría de relación */
export const KIND_LABELS: Record<EnlaceConfig['kind'], string> = {
  similar:       'Similares',
  complementary: 'Te puede interesar',
  service:       'Servicios cerca',
  practical:     'Guías prácticas',
  geographic:    'Por destino',
}
