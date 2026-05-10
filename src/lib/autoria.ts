// src/lib/autoria.ts
//
// Autor / publisher canónico de Playas de España.
//
// Por qué importa (Content Warehouse leak):
//   - authorEntities: Google mapea el campo `author` a una entidad del
//     Knowledge Graph cuando puede. Tener un `Person` u `Organization` con
//     `sameAs` apuntando a cuentas verificadas alimenta E-E-A-T,
//     especialmente en YMYL/guías (medusas, calidad del agua, protección
//     solar, seguros).
//   - trustedSource: `Article.author` con sameAs es señal positiva.
//   - panda / babyPandaV2: contenido sin firma se interpreta como
//     menos confiable.
//
// Decisión de marca: firmamos como Organization 'Playas de España'
// (proyecto editorial), no como Person individual. Esto evita el
// problema de tener que mantener bylines reales y mantiene foco
// en la marca.

export interface AutorPlayasEspana {
  '@type':       'Organization'
  '@id':         string
  name:          string
  url:           string
  logo:          string
  description:   string
  sameAs:        string[]
  foundingDate?: string
  knowsAbout?:   string[]
}

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://playas-espana.com'

/**
 * Autor canónico — usar en `Article.author`, `WebPage.author`, etc.
 * El @id es estable (fragment #organization) para que Google enlace
 * todas las menciones a la misma entidad del KG.
 */
export const AUTOR_PLAYAS_ESPANA: AutorPlayasEspana = {
  '@type':     'Organization',
  '@id':       `${BASE}/#organization`,
  name:        'Playas de España',
  url:         BASE,
  logo:        `${BASE}/logo.png`,
  description:
    'Proyecto editorial independiente que reúne datos oficiales de las 5.000+ playas de España (MITECO, EEA, AEMET) en fichas accionables con estado del mar, oleaje y servicios en tiempo real.',
  sameAs: [
    // Añadir aquí los perfiles oficiales según se vayan creando.
    // 'https://twitter.com/playasespana',
    // 'https://www.linkedin.com/company/playasespana',
    // 'https://www.instagram.com/playasespana',
  ],
  foundingDate: '2025',
  knowsAbout: [
    'Playas de España',
    'Calidad del agua de baño',
    'Bandera Azul',
    'Estado del mar',
    'Mareas y oleaje',
    'Medusas en el Mediterráneo',
    'Turismo costero en España',
  ],
}

/** Versión humana corta para el byline visible en el hero. */
export const BYLINE_LABEL = 'Equipo editorial Playas de España'
export const BYLINE_HREF  = '/metodologia'  // página que detalla autoría
