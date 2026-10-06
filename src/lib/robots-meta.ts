// src/lib/robots-meta.ts — las directivas que no se pueden perder.
//
// EL FALLO QUE ARREGLA. En Next, el objeto `robots` de una página no se
// funde con el del layout: lo sustituye entero. Cualquier página que
// escribía `robots: { index: true, follow: true }` para decir algo tan
// inocente como «esta sí se indexa» estaba borrando sin querer las tres
// directivas del layout, y entre ellas max-image-preview:large, que es
// requisito para que Google muestre miniatura grande y para entrar en
// Discover. Se perdían justo en la ficha de playa, que son 3.500 páginas
// y la mayor parte del tráfico.
//
// Google lo dice con estas palabras: «to be as visible as possible in
// Google, use max-image-preview:large, max-snippet:-1».
import type { Metadata } from 'next'

const DIRECTIVAS = {
  'max-image-preview': 'large',
  'max-snippet': -1,
  'max-video-preview': -1,
} as const

/** El `robots` de cualquier página. `indexable` es lo único que cambia. */
export function robotsMeta(indexable = true): Metadata['robots'] {
  return {
    index: indexable, follow: true, ...DIRECTIVAS,
    googleBot: { index: indexable, follow: true, ...DIRECTIVAS },
  }
}
