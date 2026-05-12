// src/lib/nombres-populares.ts
//
// Aliases de nombre popular (castellano) cuando el nombre oficial del
// dataset MITECO está en idioma cooficial y difiere SUSTANCIALMENTE de
// como se conoce comercialmente la playa. Casos:
//
//   - Kontxa Hondartza (eu) → La Concha (es). Famosa mundialmente como
//     "La Concha de San Sebastián".
//
// REGLA DE ORO: solo añadir aliases cuando el nombre castellano NO es
// una traducción literal del oficial sino un nombre histórico distinto.
// Praia/Platja se mantienen tal cual (son el nombre real, no requieren
// traducción para reconocimiento).

export interface NombrePopular {
  /** Nombre principal a mostrar en H1, metadata, OG, breadcrumb */
  popular:  string
  /** Nombre oficial del dataset (recordado para mostrar como aside). */
  oficial?: string
  /** Forma corta para listings/tarjetas si distinta del 'popular'. */
  corto?:   string
}

/** slug → alias */
export const NOMBRES_POPULARES: Record<string, NombrePopular> = {
  // ── Cantábrica / euskera ────────────────────────────────────────────
  'kontxa-hondartza': {
    popular: 'La Concha de San Sebastián',  // forma completa para H1/SEO
    oficial: 'Kontxa Hondartza',
    corto:   'La Concha',                    // forma corta para breadcrumb/cards
  },

  // ── Galicia / gallego ───────────────────────────────────────────────
  // Patrimonio natural mundialmente conocido por su nombre castellano.
  'as-catedrais-ribadeo': {
    popular: 'Playa de las Catedrales',
    oficial: 'As Catedrais',
    corto:   'Las Catedrales',
  },
  // Praia de Pantín → "Playa de Pantín". Una de las playas de surf
  // más famosas de Galicia (campeonato WSL anual).
  'praia-de-pantin': {
    popular: 'Playa de Pantín',
    oficial: 'Praia de Pantín',
    corto:   'Pantín',
  },
  // Playa de Doniños (Ferrol). Nombre oficial en gallego en el dataset.
  'doninos-ferrol': {
    popular: 'Playa de Doniños',
    oficial: 'Doniños',
    corto:   'Doniños',
  },

  // ── Islas Baleares / catalán ───────────────────────────────────────
  // Ses Illetes (Calvià, Mallorca). Conocida también como "Las Illetas"
  // en castellano, pero el catalán es la forma estándar en turismo.
  // Mantenemos el oficial como popular pero añadimos aside.
  'platja-dilletes': {
    popular: 'Ses Illetes',
    oficial: 'Platja d\'Illetes',
    corto:   'Ses Illetes',
  },

  // NOTA: NO se añade "Playa del Silencio" (Asturias) porque ya está en
  // castellano en el dataset ('Playa del Silencio'/'Playa el Silencio').
  // NO se añade "Mundaka" porque el nombre es igual en ambos idiomas.
  // NO se añade "Cofete", "Maspalomas", "El Palmar" porque ya están en
  // castellano.
}

/** Devuelve nombre a mostrar. Cae al nombre del dataset si no hay alias. */
export function nombreMostrado(slug: string, nombreDataset: string): string {
  return NOMBRES_POPULARES[slug]?.popular ?? nombreDataset
}

/** Devuelve nombre oficial del dataset (para aside/subtitle). null si
 *  no es un caso especial con dos nombres. */
export function nombreOficialAside(slug: string, nombreDataset: string): string | null {
  const alias = NOMBRES_POPULARES[slug]
  if (!alias) return null
  // El oficial es el que viene del dataset si no se especifica explicito.
  return alias.oficial ?? nombreDataset
}
