// src/components/ui/Hueco.tsx — Dónde puede ir un anuncio, y dónde no.
//
// El principio: EL ANUNCIO LO PAGA LA RESPUESTA, ASÍ QUE NUNCA PUEDE
// PONERSE ENTRE EL LECTOR Y LA RESPUESTA.
//
// Este componente existe para que esa regla no dependa de acordarse. En vez
// de esparcir `<AdSlot>` por veinte páginas y confiar en el criterio de
// quien lo pegue —incluido yo dentro de tres meses—, cada hueco declara EN
// QUÉ SITIO DE LA PÁGINA está, y el sitio decide el formato, la altura y si
// se pinta siquiera.
//
// Las cuatro zonas salen de clasificar cada superficie por si RESPONDE o
// deja HOJEAR:
//
//   hojeo        Listados: municipio, provincia, comunidad y los temáticos.
//                El contenido ES la lista; no hay una respuesta única que
//                proteger. Un robapáginas tras la primera pantalla es el
//                patrón que todo el mundo entiende. La única condición es
//                que vaya DESPUÉS de resultados de verdad, nunca el primero.
//
//   profundidad  Ficha y páginas de respuesta, una vez el lector ya tiene su
//                respuesta y su plan. En la ficha eso es la tercera fase de
//                ORDER_V2, no antes: en DECISIÓN el anuncio no molesta,
//                compite con lo único que hace que la página merezca
//                confianza.
//
//   cierre       Al final del todo, después de que se haya dado todo. Es lo
//                único que admite `banderas-hoy`, que es la página donde
//                menos conviene parecer un medio que vive del clic.
//
//   herramienta  Tabla de mareas, comparar, mapa, buscar: después de la
//                herramienta, jamás dentro de ella.
//
// Y DOS COSAS QUE ESTE COMPONENTE NO DEJA HACER, a propósito:
//
//  · No hay zona para la fase de DECISIÓN. Si algún día hace falta un
//    anuncio ahí, que cueste escribirlo.
//  · No hay forma de que un hueco herede la gramática de certeza. Los
//    trazos —2px medido, 1,5 oficial, punteado reportado, discontinuo
//    estimado— significan «cuánto me fío de esto». Prestarle ese vocabulario
//    a un espacio pagado devalúa cada medición real del sitio, y eso no se
//    recupera. Por eso el hueco lleva filete propio y etiqueta, y nunca
//    entra en `RejillaMediciones` ni usa `<Dato>`.
//
// Superficies donde NO se pone ninguno, y no es olvido: metodología, aviso
// legal, privacidad, cookies y /mi-cuaderno. Esa última promete «sin
// registro, sin cuentas y sin darnos tu correo»; poner AdSense ahí sería
// contradecirse en la misma pantalla. Son las páginas que sostienen la
// credibilidad de todas las demás.
import AdSlot from './AdSlot'
import type { Bloque } from '@/lib/adsense'

type Zona = 'hojeo' | 'profundidad' | 'cierre' | 'herramienta'

const MARGEN: Record<Zona, string> = {
  hojeo:       '1.75rem 0',
  profundidad: '2rem 0',
  cierre:      '2.5rem 0 1rem',
  herramienta: '2.25rem 0',
}

interface Props {
  zona: Zona
  /**
   * El bloque entero de `SLOTS`, no su ID suelto: el formato viaja con él.
   * Pasar solo la cadena es cómo se acaba sirviendo un Multiplex con
   * marcado de display — error que ya cometí una vez en este mismo fichero.
   */
  bloque: Bloque
  /**
   * Solo para `hojeo`: cuántos resultados hay por encima. Con menos de
   * cuatro el hueco no se pinta — un anuncio en un listado de dos
   * elementos es el anuncio, no un descanso entre resultados.
   */
  resultadosArriba?: number
  locale?: 'es' | 'en'
}

export default function Hueco({ zona, bloque, resultadosArriba, locale = 'es' }: Props) {
  if (zona === 'hojeo' && (resultadosArriba ?? 0) < 4) return null
  return (
    <AdSlot
      slot={bloque.id}
      format={bloque.formato}
      alto={bloque.alto}
      etiqueta={locale === 'en' ? 'Advertisement' : 'Publicidad'}
      style={{
        margin: MARGEN[zona],
        paddingTop: '.9rem',
        borderTop: '1px solid var(--line)',
      }}
    />
  )
}
