# Las 1.529 playas sin inventario oficial · qué fuentes hay (octubre 2026)

Después de arreglar que un `false` por defecto se publicara como «No hay
duchas», quedan 1.529 fichas sin ningún dato oficial: ni servicios, ni
longitud, ni anchura. La pregunta era si alguna comunidad publica su propio
inventario para rellenarlas. Esto es lo que hay, comprobado endpoint a
endpoint.

## El tamaño real del hueco

De las 1.529, **829 están en el sitemap**; las otras 700 ya las había dejado
fuera el filtro de calidad. Y 103 son de comunidades de interior (Castilla y
León, Extremadura, Castilla-La Mancha, Navarra, La Rioja, Madrid, Aragón): son
playas fluviales y de embalse, que un inventario de costa no va a cubrir nunca.

Las 829 indexadas: Galicia 173, Andalucía 162, Canarias 158, Baleares 135,
Cataluña 73, Comunitat Valenciana 48, Asturias 36, el resto por debajo de 20.

## Lo que publica cada comunidad

| Fuente | Qué trae | Sirve |
|---|---|---|
| Cataluña · `83qv-sib8` | 597 playas: id, municipio y nombre | Como autoridad de nombres. **Sin servicios** |
| Cataluña · `4baz-cjv2` | Estado y banderas, inmediato | Ya integrado |
| Baleares · `carac_platges` | 462 playas: nombre y un punto. El CSV tiene **una sola columna** | Para cuadrar nombres. Nada más |
| Euskadi · `espacios-naturales.geojson` | 47 registros con accesibilidad desglosada: física, visual, auditiva, intelectual y orgánica | **Sí**, y es mejor que nuestro binario `accesible` |
| Gipuzkoa · `gipuzkoairekia` | Visitantes por playa y **por mes** en 15 playas | No sustituye nada, pero **valida el modelo de afluencia** |
| Galicia · «Rías e praias» | El GeoRSS devuelve una página HTML del portal de turismo | No, hoy está roto |
| Asturias · `control_point_states.json` | 404 | No |
| Andalucía | En el catálogo nacional solo hay banderas azules y una caracterización de la línea de costa de 2011 | No |
| Canarias | Nada de playas en el catálogo nacional | No |

## Conclusión

**Ninguna comunidad publica un inventario de servicios equivalente al del
MITECO.** Lo que hay son nombres, geometrías y banderas, que ya tenemos. El
hueco de las 1.529 no se rellena comprando ni federando datos: ese dato no
existe en abierto.

Tres consecuencias prácticas:

1. **El «no consta» es el estado final**, no un apaño. Bien hecho está, y es
   más honesto que la alternativa.
2. **La pregunta correcta sobre esas 829 no es qué servicios tienen, sino si
   deben estar indexadas.** Una ficha sin un solo dato oficial compite con
   4.329 que sí lo tienen, y arrastra la media del sitio. Revisar el umbral de
   `calidad-indexacion` para ellas es más rentable que buscar más fuentes.
3. **Euskadi sí aporta**: la accesibilidad desglosada en cinco ejes es mejor
   dato que nuestro sí/no, para las 83 playas vascas.

Y un apunte que no buscábamos: Gipuzkoa publica cuánta gente pasa por quince
playas al mes. No sirve para decir cuánta hay ahora, pero sí para comprobar si
la curva estacional de nuestro modelo se parece a la realidad, que es algo que
nunca hemos verificado.

---

*Comprobado el 10 de octubre de 2026 contra datos.gob.es/apidata,
analisi.transparenciacatalunya.cat, intranet.caib.es, opendata.euskadi.eus,
abertos.xunta.gal y playas.asturias.es.*
