# Brief de diseño · playas-espana.com
**Fecha:** julio 2026 · **Para:** estudio de diseño · **De:** Daniel Mirón

---

## 1. Qué es el producto

Consulta de **estado del mar en tiempo real** para las playas de España. 4.575 fichas
servibles sobre el inventario oficial del Ministerio (MITECO). La pregunta que
resuelve, literal, es **"¿me baño hoy?"**.

No es una guía de viajes ni un directorio: es un producto de datos con cara de
medio editorial. Cada ficha responde en menos de un scroll si hoy es buen día para
esa playa concreta, y luego deja profundizar (servicios, cómo llegar, dónde comer,
fotos, opiniones).

**Dato de contexto crítico: el 90% del tráfico es móvil.** El diseño se juzga a
375px de ancho; el escritorio es el caso secundario.

---

## 2. Qué nos hace distintos (y hay que saber comunicar visualmente)

Ningún competidor junta estos datos. La jerarquía visual debe dejar claro **qué es
medición real y qué es estimación** — la honestidad de datos es el activo de marca:

| Capa | Origen | Cómo debería leerse |
|---|---|---|
| Bandera de baño | Cascada de 4 niveles: estimación propia → AEMET → **bandera oficial izada** (Cataluña, la reporta el socorrismo) → avisos de bañistas | La oficial debe pesar más que la estimada |
| Boyas | Sensores físicos de Puertos del Estado (38 boyas) | Es el único dato *medido* de la ficha |
| Medusas | Avistamiento oficial con especie → avisos de bañistas 24h → modelo estacional | Cada nivel con su grado de certeza |
| Servicios y POIs | MITECO + OpenStreetMap (118.543) + Google Places (chiringuitos con nota) | Datos estructurales, no del día |

**Regla editorial innegociable:** cuando un dato no existe, se muestra "—" y se
omite la conclusión. Nunca se inventa ni se rellena. Cualquier propuesta visual
debe contemplar el estado "sin dato" como un estado de primera clase, no como un
error.

---

## 3. Sistema visual actual

- **Tono editorial, no dashboard.** Serif para titulares y cifras destacadas
  (voz de medio), sans para interfaz, monoespaciada para metadatos y horas.
- **Paleta cálida de papel**: crema (`--card-bg`), tinta marrón oscura (`--ink`),
  acento tostado (`--accent`), líneas suaves (`--line`). Los colores saturados se
  reservan **solo para significado**: verde/amarillo/rojo de bandera, azul de agua.
- **Tarjetas** con cabecera (`cardHead`): H2 en serif a la izquierda + fuente del
  dato a la derecha en letra pequeña. Ese par título/fuente es la firma del sitio:
  cada bloque dice de dónde viene su información.
- Los H2 llevan el nombre de la playa por SEO ("Chiringuitos en La Malvarrosa") —
  restricción a respetar: los titulares no pueden acortarse a etiquetas genéricas.

---

## 4. Lo que ya hemos arreglado (contexto, no encargo)

Auditoría propia de julio 2026, ya en producción:

1. **Degradado del hero** — el bloque editorial (H1 + score + datos + botones) va
   sobre foto real; con fotos de alto contraste el score se perdía. Ahora la
   opacidad crece progresivamente.
2. **Barra de secciones** — se cortaba a hueso sin indicar que había más pestañas.
   Añadido desvanecido a la derecha que se apaga al final del scroll.
3. **Bloques colapsables** — cortaban a media tarjeta y parecía un fallo de carga.
   Ahora el corte se ajusta al último elemento completo.
4. **Duplicación en móvil** — la columna lateral cae al flujo principal y repetía
   datos con otra gramática de cabecera.
5. **Momento de pedir valoración** — estaba antes de dar valor; movido tras las
   opiniones.

---

## 5. El encargo

### 5.1 Problema principal: exceso de cromado fijo

En 812px de alto conviven: navegación superior fija (52px), barra de secciones
fija, barra de acciones inferior fija y banner de cookies en la primera visita.
Entre las cuatro se comen en torno al 40% de la pantalla y el contenido asoma por
una rendija.

**Queremos una propuesta de arquitectura de navegación móvil** que resuelva la
tensión entre:
- acceso permanente a las dos acciones críticas ("cómo está hoy" y "cómo llegar"),
- navegación rápida entre ~14 secciones de una ficha larga,
- y ver el contenido, que es la razón de la visita.

Ideas a explorar (no cerradas): ocultar/mostrar según dirección de scroll, fusionar
la barra de secciones con la inferior, o un único elemento contextual que cambie de
función según la posición.

### 5.2 Jerarquía del hero

El score 0-100 es la promesa del producto y hoy compite con el nombre de la playa
en vez de apoyarlo. Buscamos una composición donde de un vistazo se entienda:
**qué playa es, qué nota tiene hoy y por qué**, sin que la fotografía estorbe ni
desaparezca (la foto es el gancho emocional).

Elementos del hero: migas de navegación, nombre, score + etiqueta ("Muy buena"),
frase del día, cinco metadatos (municipio, provincia, temperatura del agua, olas,
enlace a meteo), tres acciones (Guardar, Estuve aquí, Compartir) y crédito de la
foto. Es mucho: parte del encargo es decidir qué baja de nivel.

### 5.3 Sistema de tarjetas de listado

Restaurantes, chiringuitos, hoteles, campings y centros de buceo comparten
estructura (nombre, distancia, nota, metadatos) pero cada uno se pinta distinto:
unos con foto, otros con icono, otros con estrellas. **Queremos un componente
unificado con variantes**, no cinco maquetaciones parecidas.

### 5.4 Lenguaje visual de la certeza

Reto de fondo y lo más valioso que puede aportar el estudio: **cómo se ve la
diferencia** entre "medido por una boya a 5 km", "reportado hoy por el socorrismo",
"lo dicen bañistas hace 2 horas" y "lo estima nuestro modelo". Hoy se resuelve con
una línea de texto pequeña. Merece un sistema (jerarquía, color, iconografía,
insignias) que se entienda sin leer la letra pequeña y sin que parezca una
advertencia legal.

### 5.5 Capa de pertenencia

Acabamos de lanzar "Mi cuaderno de playas": marcar "estuve aquí" e ir ganando
insignias, sin registro. Hoy es funcional pero visualmente pobre (emojis y
tarjetas). Necesita identidad propia — de sello de pasaporte más que de logro de
videojuego — incluyendo **una imagen compartible** del cuaderno para redes.

---

## 6. Restricciones técnicas

- Next.js con renderizado en servidor; los componentes de cliente son la excepción,
  no la norma (**la hidratación es frágil**: preferimos server components y scripts
  vanilla). Cualquier propuesta muy dependiente de JavaScript en cliente tiene coste
  alto y riesgo.
- Sin librería de componentes: estilos en CSS Modules y estilos en línea, con
  variables CSS para el tema.
- **Rendimiento y SEO son requisitos, no adornos**: el negocio vive de búsquedas
  orgánicas. Fuentes ya cargadas, imágenes optimizadas; no se aceptan soluciones que
  penalicen Core Web Vitals ni que rompan la estructura de encabezados.
- Accesibilidad: contraste AA como mínimo, objetivos táctiles de 44px, navegación
  por teclado.

---

## 7. Entregables que esperamos

1. **Arquitectura de navegación móvil** (5.1) — el más urgente.
2. **Rediseño del hero de ficha** (5.2), con los estados: con foto, sin foto, sin
   datos del mar.
3. **Sistema de tarjetas de listado** con variantes (5.3).
4. **Lenguaje de certeza de datos** (5.4): jerarquía, color e iconografía.
5. **Identidad de "Mi cuaderno"** + plantilla compartible (5.5).
6. Documentación de decisiones en variables CSS, para poder implementarlo sin
   depender del estudio.

**Fuera de alcance por ahora:** identidad de marca, logotipo, versión inglesa y
páginas de listado por provincia (llegarán después, cuando el sistema esté cerrado).

---

## 8. Cómo evaluaremos las propuestas

1. ¿Un usuario en el autobús, a 375px y con una mano, sabe en 3 segundos si hoy se
   baña en esa playa?
2. ¿Se distingue sin esfuerzo el dato medido del estimado?
3. ¿Sobrevive al estado "sin dato" sin parecer roto?
4. ¿Se puede implementar sin llenar la página de JavaScript de cliente?
5. ¿Sigue pareciendo un medio editorial de confianza y no un panel de control?
