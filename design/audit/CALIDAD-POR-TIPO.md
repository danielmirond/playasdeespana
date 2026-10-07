# Calidad por tipo de página · octubre 2026

Plan de cinco pasos que Duy Nguyen (Search Quality, Google) dio en el Search
Central Live Deep Dive de Barcelona, aplicado a este sitio: agrupar las URLs por
tipo, medir cada tipo contra los cuatro pilares, identificar lo commodity,
mejorar o retirar lo débil, y contar con 3-6 meses de ventana.

La frase que ordena todo esto es suya: **«las páginas flojas arrastran a las
buenas»**. No se juzga una URL, se juzga el tipo entero, porque los
clasificadores de calidad trabajan también a nivel de sitio.

## 1 · Los tipos que publicamos

13.375 URLs en el sitemap, 19 tipos. La mitad del sitio son fichas de playa, y
la mitad de esas son la traducción al inglés.

## 2 · La medida

Para cada tipo se bajaron tres páginas al azar de producción y se trocearon en
unidades de seis palabras. Lo que aparece en las tres es plantilla; lo que
aparece en los diecinueve tipos a la vez es cromado del sitio (menú, pie,
cookies: 252 unidades). Lo que queda es contenido propio de esa página.

No mide los cuatro pilares: mide **originalidad**, que es uno. El esfuerzo, el
talento y la precisión se juzgan leyendo, y van en la tabla como comentario.

| Tipo | Págs | Palabras | Cromado | Plantilla | Propio | Palabras propias |
|---|---:|---:|---:|---:|---:|---:|
| municipio · raíz | 479 | 584 | 44,5% | 24,4% | **31,2%** | 182 |
| municipio · camping-cerca | 452 | 617 | 42,1% | 24,7% | **33,1%** | 204 |
| EN · hub/estática | 619 | 484 | 52,9% | 8,8% | **38,2%** | 185 |
| municipio · el-tiempo | 742 | 599 | 43,9% | 17,4% | 38,7% | 232 |
| municipio · tabla-de-mareas | 396 | 972 | 26,8% | 33,4% | 39,9% | 387 |
| municipio · autocaravana | 155 | 851 | 30,6% | 28,8% | 40,6% | 345 |
| hub temático | 548 | 490 | 52,9% | 6,3% | 40,8% | 200 |
| municipio · donde-dormir | 353 | 797 | 34,4% | 23,7% | 41,9% | 334 |
| municipio · alquiler-de-barcos | 88 | 1.025 | 26,0% | 31,3% | 42,7% | 438 |
| municipio · chiringuitos | 87 | 755 | 34,7% | 22,0% | 43,3% | 326 |
| EN · barcos | 40 | 575 | 44,6% | 1,8% | 53,6% | 308 |
| municipio · donde-aparcar | 345 | 1.210 | 25,3% | 18,3% | 56,4% | 682 |
| municipio · que-hacer | 268 | 1.277 | 21,0% | 21,9% | 57,0% | 728 |
| alquiler autocaravana | 18 | 764 | 33,6% | 4,7% | 61,7% | 471 |
| ficha de playa | 4.329 | 2.079 | 12,6% | 24,6% | 62,8% | 1.306 |
| EN · ficha de playa | 4.329 | 1.651 | 15,5% | 18,4% | 66,1% | 1.091 |
| magazine | 83 | 1.341 | 19,3% | 3,1% | 77,5% | 1.039 |
| provincia | 28 | 3.007 | 9,0% | 4,8% | 86,3% | 2.594 |
| comunidad | 15 | 3.436 | 8,2% | 4,0% | 87,8% | 3.018 |

Muestra de tres páginas por tipo: sirve para ordenar y para detectar lo
flagrante, no para afinar décimas.

## 3 · Qué es commodity y qué no

La prueba de Google: **si cambias tu marca por la de un competidor y la página
vale lo mismo, es commodity**. Aquí hay que separar dos cosas que es fácil
confundir, porque el sitio falla en una y no en la otra.

**El cruce es nuestro en casi todo.** Campings ordenados por distancia a una
playa concreta con nombre, aparcamientos con su tamaño oficial y los de OSM
encima, hoteles con a qué playa le quedan más cerca: eso no lo publica nadie
más, y no deja de ser nuestro porque la fuente sea pública. Ahí la originalidad
está sana aunque la plantilla sea alta: la plantilla es la tabla, y una tabla
que compara bien no es relleno.

**Lo que falla es el esfuerzo y el talento**, que son los otros dos pilares.
En los tipos de arriba de la tabla, lo propio son 180-230 palabras que casi
todas son nombres y cifras enganchados por frases hechas. Un listado ordenado
no es una respuesta; es materia prima bien colocada.

Por pilares, tipo a tipo:

- **Esfuerzo**: alto en magazine, provincia, comunidad y ficha. Bajo en las
  subpáginas de municipio, donde la prosa propia cabe en un párrafo.
- **Originalidad**: alta en todo lo que cruza dos fuentes. Baja en los hubs EN,
  que son traducción de hubs ES sin dato propio.
- **Talento**: desigual. La ficha y el magazine tienen voz; las subpáginas de
  municipio tienen frases de relleno repetidas entre tipos.
- **Precisión**: es el pilar más sano. Todo sale de inventario oficial, AEMET,
  Puertos del Estado, OSM o Google Places, y las páginas dicen de dónde y qué
  no saben. La auditoría de resúmenes de septiembre retiró lo que no se pudo
  verificar.

## 4 · Qué hacer con cada uno

**Retirar o fusionar**

- **EN · hub/estática (619 págs, 185 palabras propias).** Es el caso que el
  deck nombra con todas las letras: traducción masiva sin supervisión no cuenta
  como esfuerzo. Son el 4,6% de las URLs y no aportan dato que no esté en el
  hub español. Propuesta: quedarse con los que tengan demanda real medida en
  Search Console y retirar el resto con 410, no con noindex, para que salgan
  del índice de verdad.
- **municipio · raíz (479).** No se retira: es el índice del municipio y el
  destino natural de la búsqueda «playas de X». Pero 182 palabras propias para
  esa consulta es poco. Propuesta: subirlo con lo que ya tenemos y no sale
  —cuántas con bandera azul, cuántas con socorrista, cuál es la más grande, a
  cuál llega el autobús— y un párrafo que compare las playas entre sí.

**Mejorar antes de seguir creciendo**

- **camping-cerca (452) y el-tiempo (742).** Los dos tipos más numerosos
  después de las fichas y los dos más flojos en palabras propias. El dato está;
  falta la lectura del dato: qué camping conviene a quién, qué significa esa
  previsión para un sábado.
- **tabla-de-mareas (396) y autocaravana (155).** Plantilla por encima del 28%
  después de descontar el cromado: hay párrafos fijos que se repiten pieza a
  pieza. Reescribirlos para que dependan del dato del municipio.

**Dejar como están**

- Ficha de playa, magazine, provincia y comunidad. Son los cuatro tipos que
  sostienen la calidad media del sitio.
- donde-aparcar y que-hacer, que son los dos mejores de la familia municipio.

**No crear más tipos de municipio hasta que los flojos suban.** Es la lección
literal de «las páginas flojas arrastran a las buenas»: cada tipo nuevo con 200
palabras propias baja la media de un sitio cuyo activo son 4.329 fichas buenas.

## 5 · Plazos

Google dio sus propios relojes en la misma charla: recuperar de un core update
son **3-6 meses**; un cambio de title, 1-2 días; una eliminación, 1-3 semanas.
O sea que el orden sensato es retirar primero (efecto en semanas) y reescribir
después (efecto en meses), y no esperar señal antes de febrero de 2027.

---

*Medición: `/tmp/auditar2.py` sobre el sitemap de producción, 7 de octubre de
2026. Fuente del método: Search Central Live Deep Dive Europe, Barcelona,
30 sep - 2 oct 2026, charla de Duy Nguyen sobre calidad en sitios grandes.*
