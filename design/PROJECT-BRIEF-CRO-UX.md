# Playas de España — Brief de producto para auditoría CRO / UX

*Documento para agencia de diseño. Actualizado: **agosto 2026**.*

> **Qué ha cambiado desde la versión de junio, y por qué importa para el
> diseño.** El producto tiene ahora un eje que antes no existía: **no solo
> dice el dato, dice cuánto se fía de él**, y esa distinción está codificada
> en el trazo de cada cifra (§5b). Han entrado ocho fuentes oficiales de
> bandera, la predicción de mareas de Puertos del Estado y una capa nueva de
> publicidad con reglas propias. Si algo de esta guía choca con el diseño que
> propongáis, es la §5b lo que no se puede romper.
>
> `UX_AUDIT.md`, de mayo, describe problemas ya resueltos: está superado, no
> lo useis como referencia.
URL: https://playas-espana.com · Idiomas: Español (`/`) e Inglés (`/en`).

---

## 1. Qué es

Plataforma web (no app nativa) que responde a una pregunta: **«¿A qué playa voy hoy?»**.
Combina datos oficiales en tiempo real (estado del mar, meteo, calidad del agua,
medusas) con una base de **5.098 playas** de toda España para recomendar, mediante
un **score 0–100 recalculado cada hora**, la mejor playa según las condiciones
actuales. Es **editorial + utilitario**, no un folleto turístico: el diferencial
es el dato y la honestidad (decimos también cuándo NO ir).

**El eje que define el producto hoy:** cada cifra de la página lleva escrito
de dónde sale y cuánta confianza merece. No es un adorno de transparencia —
es la respuesta a un fallo real: el 15 de agosto de 2026 el Ayuntamiento de
Málaga prohibió el baño en seis playas por *E. coli* y nuestras fichas decían
«BUENA», porque la bandera se estimaba con oleaje y viento y una playa
contaminada está en calma. De ahí salió todo lo que hay en la §5b, y por eso
esa parte no es negociable.

Modelo de negocio: **gratis para el usuario**, monetizado por **afiliación**
(alquiler de barcos y autocaravanas, hoteles, actividades, etc.) y publicidad.

### Cifras clave *(medidas en agosto de 2026)*
- **5.098 playas** en el catálogo · **4.456 indexables** · 20 comunidades · 49 provincias.
- **898 con Bandera Azul** · **4.300 con foto real** (84 %); el resto, imagen
  genérica según el estado del mar.
- **93 rutas distintas en español y 30 en inglés** — el mapa completo, en la §4.
- **1.244 fichas con fuente OFICIAL de bandera; 3.212 sin ninguna.** Esa
  proporción crea dos experiencias distintas dentro del mismo sitio, y
  resolverla visualmente es de las cosas más útiles que podéis proponer (§4b).
- Bilingüe ES/EN.

---

## 2. Usuario y objetivo de negocio

**Audiencia:** turista nacional e internacional + residente que va a la playa.
Tráfico principal **SEO orgánico** (búsquedas tipo "playas para perros Málaga",
"mejor playa hoy Cádiz", "alquiler barco Ibiza", "snorkel Costa Brava").

**Objetivo CRO (lo que queremos optimizar):**
1. **Clics de afiliación** (la conversión principal): alquiler de barco (SamBoat),
   autocaravana (Camperdays), hoteles (Booking), actividades (GetYourGuide).
2. **Profundidad de sesión** (de la ficha de playa a hubs/servicios).
3. **Instalación de la PWA** y retorno.
4. Engagement con el contenido (Magazine).

> El reto CRO central: somos fuertes en tráfico SEO de cola larga (fichas de
> playa), pero la **conversión a afiliación** ocurre en páginas comerciales
> (barco/autocaravana/actividades). El embudo ficha → comercial es lo más
> importante a optimizar.

---

## 3. Stack y restricciones técnicas (importante para el diseño)

- **Next.js 16 (App Router) + React + TypeScript**, desplegado en **Vercel**.
- **Renderizado:** SSR + ISR (revalidación) + pre-render parcial. Muchas páginas
  se generan bajo demanda (5.000+ fichas).
- **Estilos:** **sistema de diseño propio con CSS variables + estilos inline**.
  **NO usa Tailwind** (clases Tailwind no funcionan). Cualquier propuesta visual
  debe expresarse en tokens CSS / estilos, no en utilidades.
- **Mobile-first**: la mayoría del tráfico es móvil.
- **Rendimiento (Core Web Vitals) es prioritario** por SEO: cuidado con scripts
  de terceros, imágenes pesadas y CLS. Hoy los embeds de terceros (widgets,
  analytics) se cargan diferidos (`lazyOnload`).
- **Sin diseño en Figma actualmente** — el sistema vive en el código (ver §5).
  Si la agencia entrega Figma, debe mapear a estos tokens.

---

## 4. Mapa de páginas (qué auditar)

**Núcleo de producto**
- `/` Home: hero "¿a qué playa voy hoy?", buscador, Top playas hoy, Evita hoy,
  cercanas, parking, actividades, carrusel de Magazine, hubs por tema.
- `/playas/[slug]` **Ficha de playa** (página estrella, 5.000+): score 0–100,
  temperatura del agua, oleaje, viento, mareas, sol/mejor hora, calidad del agua
  (EEA), riesgo de medusas, bandera de baño, servicios, fotos, opiniones/votos,
  hoteles/restaurantes/campings/buceo cercanos, CTA alquiler de barco, actividades
  (GetYourGuide), mapa.
- `/comparar` comparador de playas · `/mapa` mapa interactivo · `/playas-cerca-de-mi` GPS.

**Listados temáticos (nichos SEO):** perros, nudistas, accesibles, aguas
cristalinas, calas con encanto, secretas, paradisíacas, sin viento, atardeceres,
Bandera Azul, autocaravana, islas.

**Comercial / afiliación (foco CRO):**
- `/alquiler-barco` + jerarquía costas → provincias → localidades (SamBoat).
- `/alquiler-autocaravana` + ciudades, precios, tipos (Camperdays).
- `/buceo`, `/surf`, `/windsurf`, `/kitesurf`, `/clases-surf`, `/hoteles-playa`,
  `/campings` (+ widgets de actividades GetYourGuide).

**Contenido:** `/magazine` (+ artículo, + categoría).
**Taxonomía:** `/comunidad/[slug]`, `/provincia/[slug]`, `/municipio/[slug]`.
**Utilidad/legal:** `/metodologia`, `/calidad-agua`, `/medusas`, `/rutas`,
`/aviso-legal`, `/privacidad`, `/cookies`.
**Inglés:** equivalentes bajo `/en/**`.

---

## 4b. Dos Españas: dónde hay dato oficial y dónde no

Ocho fuentes oficiales de bandera, todas descubiertas en visores municipales o
autonómicos —ninguna publicada como dato abierto—: Cataluña, Canarias, Junta de
Andalucía, Bizkaia, Gipuzkoa, SafeBeach (Levante/Baleares/Murcia), Ferrol y
Gijón. Más la predicción de mareas de **Puertos del Estado**.

Cobertura real, en fichas con fuente oficial sobre el total de la comunidad:

| Comunidad | Con fuente | Total | |
|---|---|---|---|
| Canarias | 412 | 580 | 71 % |
| Andalucía | 325 | 550 | 59 % |
| Cataluña | 268 | 576 | 47 % |
| País Vasco | 34 | 83 | 41 % |
| Baleares | 131 | 421 | 31 % |
| C. Valenciana | 29 | 225 | 13 % |
| Asturias | 11 | 238 | 5 % |
| Murcia | 8 | 200 | 4 % |
| **Galicia** | **9** | **1.298** | **1 %** |
| Cantabria | 0 | 113 | 0 % |
| Ceuta / Melilla | 0 | 19 | 0 % |

**Galicia tiene más fichas que ninguna otra comunidad —1.298— y un 1 % de
cobertura oficial.** Ahí la bandera que ve el usuario es siempre una estimación
nuestra.

Esto es un problema de diseño antes que de datos: **la misma plantilla tiene que
servir a una ficha con parte oficial y a otra donde solo hay modelo, sin que la
segunda parezca rota ni la primera parezca igual que la segunda.** Es la pregunta
número uno que os hacemos.

---

## 5. Sistema de diseño actual (tokens reales en código)

Estética **editorial, cálida, "arena + tinta"** (no el típico azul turístico).

- **Tipografías:** Playfair Display (serif, titulares), DM Sans (sans, cuerpo),
  JetBrains Mono (datos/cifras).
- **Paleta (CSS vars):**
  - Superficies "arena": `#faf4e6 / #f5ecd5 / #f0e6d0` …
  - Texto "tinta": `#2a1a08` (principal), `#6a5840` (muted).
  - Acento "terracota/ocre": `#6b400a`, `#d48a1a / #e8a030`.
  - "Mar" (solo contexto marino): `#2d5266 / #4a7a90`.
  - Semáforo de score: excelente `#3d6b1f` · aceptable `#c48a1e` · no apto `#7a2818`.
- **Radios:** 2 / 4 / 6 / 10 / 16 px · **sombras** muy sutiles.
- Componentes clave: tarjetas de playa con score-pill, "estado del mar" animado
  (SVG cuando no hay foto), badges de bandera/medusas, CTAs de afiliación.

> Nota: la marca usa una **"P" serif** como icono (favicon/PWA). El logo es un
> wordmark "playas de España".

---

## 5b. La gramática de certeza — **lo que no se puede romper**

Es lo más importante de este documento. Si una propuesta de diseño choca aquí,
gana esto.

**La regla:** toda cifra de la página declara de dónde sale, y lo declara en el
**trazo**, no en el color. El color ya está ocupado por el significado (verde =
buena calidad, rojo = peligro); si además codificara la confianza, las dos
lecturas se pisarían.

| Certeza | Qué significa | Trazo |
|---|---|---|
| `medido` | Un sensor físico lo midió | `2px solid` |
| `oficial` | Lo publica una administración | `1.5px solid` |
| `reportado` | Lo ha dicho un bañista | `1.5px dotted` |
| `estimado` | Lo deduce nuestro modelo | `1px dashed` + texto atenuado |
| `sindato` | No lo sabemos | sin trazo, en gris |

Tokens: `--cert-medido #2d5266` · `--cert-oficial #3d6b1f` · `--cert-reportado
#8a5f0a` · `--cert-estimado #7a6850` · `--cert-sindato #7a6b55`.
Se aplica con `data-cert` sobre `.dato` (componente de servidor, cero JS).

Dos corolarios que también rigen:

- **«Glifo relleno = sensor, hueco = modelo».** El icono de bandera del hero va
  relleno si la izó alguien y hueco si la deduce el modelo. Igual el de medusas.
- **La estimación describe, no autoriza.** Los estados estimados se rotulan «Mar
  en calma / con precaución / peligroso», nunca «BUENA»: una etiqueta de
  aprobación sobre una estimación es exactamente el fallo de Málaga.

**Qué NO puede hacer un diseño nuevo:**

1. Codificar la certeza en color en vez de en trazo.
2. Dar a un espacio pagado el vocabulario de la certeza — nada de anuncios con
   forma de `<Dato>`, ni dentro de la rejilla de mediciones. Los trazos
   significan «cuánto me fío»; prestárselos a un anuncio devalúa cada medición
   real del sitio.
3. Homogeneizar las cifras «para que se vean todas igual». Que no se vean igual
   es el producto.

---

## 6. Flujos de usuario principales (para el análisis de embudo)

1. **"Playa para hoy"**: Home/SEO → ficha de playa → (mira score/condiciones) →
   ¿CTA a hotel/barco/actividad? **← punto de conversión a optimizar.**
2. **Nicho**: búsqueda ("playas para perros X") → listado temático → ficha.
3. **Comercial barco**: SEO → `/alquiler-barco/costas/...` → CTA SamBoat (afiliado).
4. **Comercial autocaravana**: → `/alquiler-autocaravana/[ciudad]` → CTA Camperdays.
5. **Actividades**: ficha/hub → widget GetYourGuide ("Cosas que hacer cerca").

---

## 7. Analítica y medición (ya instalada)

- **GA4** con eventos personalizados: `beach_click`, `hotel_click`,
  `activity_click`, `restaurant_click`, `parking_click`, `route_open`,
  `filter_click` (gated por consentimiento de cookies).
- **GetYourGuide Partner Analytics** + parámetro `data-gyg-cmp` por tipo de
  página (ficha, municipio, comunidad, magazine, hubs) → atribución de
  conversiones por origen.
- **UTMs** en CTAs; la PWA instalada abre con `?utm_source=pwa`.
- Afiliación: SamBoat/Camperdays vía **Awin**; Booking, GetYourGuide, etc.
- **Consentimiento de cookies** granular (técnicas / analíticas / marketing).

---

## 8. Estado actual y temas abiertos (contexto para la auditoría)

*Reescrito en agosto de 2026. Lo que decía esta sección en junio —PWA recién
añadida, logo vs hamburguesa, imágenes rotas— está resuelto.*

**Superficies nuevas desde la última versión**, todas candidatas a auditoría:

- **Tabla de mareas por municipio** (`/municipio/[slug]/tabla-de-mareas`), con
  predicción oficial de Puertos del Estado a tres días, tabla solunar y equipo
  de pesca afiliado. Enlazada en 163 municipios del Atlántico, Cantábrico y
  Canarias; en el Mediterráneo existe pero abre diciendo que ahí la marea son
  25 cm.
- **Vientos con nombre** en la ficha: levante, tramontana, alisio, terral,
  nordés… El nombre depende de la costa y solo aparece cuando el viento sopla
  lo bastante para merecerlo.
- **Índice completo por municipio** en la página de provincia, subido del 92 %
  al 20 % de la página.
- **`/banderas-hoy`**, la superficie de autoridad: la que destapó lo de Málaga.
- **Publicidad**, encendida en agosto. Va con una regla explícita, resumida en
  el anexo H.

**Temas abiertos donde más valor tendría vuestra opinión:**

1. **La ficha sigue siendo muy densa** — **37 módulos** en tres fases narrativas
   (anexo A). Sigue siendo la mayor oportunidad.
2. **La certeza no se explica en ninguna parte.** Los trazos están, pero nadie
   le dice al usuario qué significan. ¿Se explica? ¿Dónde? ¿O tiene que
   entenderse sin leer?
3. **La foto de portada compite con las cifras.** Sobre foto clara, la rejilla
   necesita un velo del 38 % para que los números se lean, y aun así es el punto
   más frágil del hero.
4. **El 16 % de fichas sin foto real** usa una ilustración por estado del mar.

---

## 9. Qué necesitamos de la agencia (entregables CRO/UX)

1. **Auditoría heurística + CRO** de: Home, ficha de playa y una página comercial
   (alquiler de barco o autocaravana). Foco en el embudo a afiliación.
2. **Jerarquía y ubicación de CTAs** de afiliación y actividades sin dañar la
   credibilidad editorial ni los Core Web Vitals.
3. **Priorización de módulos** en la ficha: qué va above-the-fold en móvil.
4. **Recomendaciones accionables** expresables en nuestros tokens — no un
   rediseño que rompa el stack ni meta dependencias pesadas.
5. (Opcional) **Tests A/B** priorizados por impacto y esfuerzo.

### Las cuatro preguntas que de verdad queremos que contestéis

Más útiles que un informe genérico:

1. **¿Qué hace la ficha donde no hay dato oficial?** Son 3.212 de 4.456, y en
   Galicia el 99 %. Hoy se muestra la estimación con su trazo discontinuo y ya
   está. ¿Es suficiente? ¿Se explica, se compensa con otra cosa, se cambia la
   jerarquía entera de esas fichas?
2. **¿Se puede leer la certeza sin que nadie la explique?** Los cinco trazos
   están implementados y son coherentes. Nunca se ha probado con usuarios.
3. **¿Estorba la monetización a la credibilidad?** Somos un sitio que vive de
   decir la verdad sobre el mar y que cobra comisión por hoteles y excursiones
   en la misma página. Queremos saber dónde se nota.
4. **¿Cuál es el coste real de la densidad?** La ficha lo tiene todo. La
   hipótesis interna es que eso es una virtud para el SEO y un problema para la
   persona. No lo hemos medido.

**Restricciones a respetar:** mobile-first, sin Tailwind, rendimiento y SEO
críticos, estética editorial «arena + tinta», monetización no intrusiva,
cumplimiento del RGPD, y **la gramática de certeza de la §5b**.

---

# Anexos de detalle

## A. Ficha de playa — orden REAL de módulos (clave para CRO)

*Generado desde `ORDER_V2` en `src/components/playa/FichaBody.tsx`, agosto de
2026. La versión de junio de este anexo describía un orden anterior.*

La columna principal se ordena en **tres fases mentales**, y esa estructura es
la decisión de producto más importante de la ficha:

**1 · DECISIÓN — «¿puedo ir hoy y estaré bien?»** (8 módulos)
`intro` · `trust` · `estado` · `webcam` · `seguridad` · `calidad` ·
`opiniones-dest` · `cta-ctx`

**2 · PLAN — «cómo organizo la visita»** (15 módulos)
`asistente` · `como-llegar` · `trafico` · `actividades-gyg` · `mejor-hora` ·
`afiliados` · `comer` · `chiringuitos` · `dormir` · `campings` · `ferries` ·
`surf` · `buceo` · `cta-barco` · `ad`

**3 · PROFUNDIDAD — datos y exploración para quien quiera más** (14 módulos)
`meteo` · `datos` · `ad-profundidad` · `fotos` · `video` · `opiniones` ·
`votacion` · `asistente-generico` · `cuaderno-cta` · `cercanas` · `texto-seo` ·
`hubs` · `faqs` · `crosslinks`

**Lo comercial vive casi entero en la fase 2**, y no por casualidad: en DECISIÓN
un CTA compite con lo único que hace que la página merezca confianza. La única
excepción es `cta-ctx`, que cierra la fase 1.

**Con bandera roja el orden cambia**: los bloques duros se descartan del DOM y
los blandos —incluida la publicidad— se empujan detrás del texto largo. La
lógica está en `src/lib/bandera-roja.ts` y es deliberada, no un efecto
secundario.

El reordenado es determinista en servidor y cliente (mismo resultado, sin CLS).
Si proponéis mover módulos, basta con reordenar esa lista.

---

## B. Inventario de componentes (los relevantes para diseño)

- **Home:** `Hero`, `Buscador`, `Destacadas` (Top/Evita hoy), `TopCercanas`,
  `ParkingHoy`, `ActividadesHoy`, `MonetizacionBlock`, `BoatRentalCTA`,
  `MagazineCarrusel`, `Comunidades`.
- **Ficha:** `FichaHero`, `FichaNav`, `FichaBody`, `EstadoHoy`, `AsistentePlaya`,
  `PhotoCarousel`, `Opiniones`/`OpinionesDestacadas`, `VotacionPlaya`,
  `ReportarEstado`, `SurfSection`, `EscuelasSection`, `HotelesCard`,
  `TraficoSection`, `BeachVideo`, `MapaLeaflet`, `AnimatedSea` (SVG estado del mar).
- **Afiliación/CTA:** `AffiliatesCTABlock`, `AlquilerBarcoCTA`,
  `AsideAfiliacionCTA`, `AfiliacionDrawer`, `FerriesCTA`, `GygActivities`, `AdSlot`.
- **Navegación:** `Nav` (desktop), `MobileNav` (hamburguesa), `Footer`,
  `CookieBanner`, `InstallPrompt` (PWA).

## C. Monetización — partners y dónde aparecen los CTAs

| Producto | Partner | Red | Dónde aparece |
|---|---|---|---|
| Alquiler de barco | SamBoat | Awin | Hub `/alquiler-barco` + costas/localidades, CTA en ficha de playa (calas) |
| Alquiler autocaravana | Camperdays | Awin | Hub `/alquiler-autocaravana` + ciudades |
| Hoteles | Booking.com | — | Módulo "hoteles cercanos" en ficha |
| Actividades/tours | GetYourGuide | partner-id BMIKRAB | Widget "Cosas que hacer cerca" (ficha, municipio, comunidad, provincia, magazine, hubs buceo/surf) |
| Restaurantes | TheFork | — | Módulo restaurantes en ficha |
| Campings | Pitchup | — | Módulo campings en ficha |
| Coche / seguros / Amazon | Rentalcars, Heymondo/IATI, Amazon | — | Páginas de utilidad |
| Publicidad | Google AdSense | — | AdSlots (con consentimiento) |

> CRO: hay **muchos** partners. Riesgo de dispersión y de "banner blindness".
> Una recomendación valiosa sería **priorizar 1–2 CTAs por página** según intención.

## D. Fuentes de datos y frecuencia (E-E-A-T, base de la credibilidad)

| Dato | Fuente | Actualización |
|---|---|---|
| Inventario playas | MITECO + OpenStreetMap | Manual (script) |
| Meteo (aire, viento, UV) | Open-Meteo (+ AEMET ref.) | ~cada hora (caché 30 min) |
| Oleaje y temp. agua | Open-Meteo Marine | ~3–6 h |
| Sol (amanecer/atardecer) | Sunrise-Sunset.org | 24 h |
| Calidad del agua | EEA (Agencia Europea Medio Ambiente) | Anual |
| Bandera Azul | ADEAC | Anual |
| **Bandera OFICIAL izada** | **8 fuentes: Cataluña, Canarias, Junta de Andalucía, Bizkaia, Gipuzkoa, SafeBeach, Ferrol y Gijón** | 15 min |
| Bandera estimada | Modelo propio (oleaje + viento, corregido por el abrigo de la costa) | Tiempo real |
| Medusas | Modelo propio (viento + zona + temperatura) | Tiempo real |
| **Mareas** | **Puertos del Estado (predicción con corrección meteorológica)** | 30 min · 3 días vista |
| Oleaje medido | Boyas de Puertos del Estado (≤ 60 km) | Horaria |
| Fase lunar y solunar | Cálculo astronómico (Meeus) | Tiempo real |
| Hoteles/restaurantes | Overpass (OSM) + caché | On-demand |
| Fotos | Wikimedia/Wikipedia/Flickr/Openverse/Pexels/Unsplash | Pre-resueltas (offline) |

Notas que condicionan el diseño, no solo la ingeniería:

- **Ninguna de las ocho fuentes de bandera está publicada como dato abierto.**
  Salen de visores municipales y autonómicos. Van con atribución visible, y esa
  atribución es parte de la credibilidad: no se puede esconder por limpieza
  visual.
- **Solo Canarias dice POR QUÉ está izada la bandera** (corrientes,
  desprendimientos, oleaje). Las demás dan el color y nada más, así que la ficha
  a veces tiene un motivo que contar y a veces no.
- **El oleaje de la boya es del mar abierto, no de la orilla** — mediana de
  38 km, la mitad en aguas profundas. Se muestra como «Mar abierto, a N km», y
  esa distinción tiene que sobrevivir a cualquier rediseño.
- **44 fichas canarias son de uso prohibido** y llevan un aviso permanente.

El mensaje de marca («datos oficiales, actualizados cada hora») es un **activo
de conversión y de confianza**: conviene que el diseño lo haga visible sin
saturar.

## E. Accesibilidad y rendimiento (restricciones de la auditoría)

- **A11y existente:** skip-link, roles/aria en nav y controles, foco visible,
  `aria-label` en CTAs e iconos. Pendiente de auditoría formal WCAG AA.
- **Rendimiento:** terceros diferidos (`lazyOnload`), imágenes con `next/image`
  donde aplica, `content-visibility:auto` en bloques pesados. **CLS y LCP** son
  sensibles: cualquier carrusel/hero nuevo debe medirse.
- **Móvil:** header compacto (logo + buscador + idioma + hamburguesa); la ficha
  usa **desplegables** (`Collapsible`) para no abrumar.

## F. Voz y contenido (para coherencia editorial)

Voz propia **"rigor de datos contado como un local con buena pluma"**: titulares
con dato (no clickbait), estructura "bicéfala" (apertura narrativa + cuerpo de
datos con el *contra* honesto), sin clichés de folleto. Titulares optimizados
para **Google Discover**. Cualquier microcopy/CTA que proponga la agencia debe
encajar con este tono (cómplice, honesto, basado en dato).

## G. Hipótesis CRO iniciales (para arrancar el trabajo)

1. La **Home** prioriza descubrimiento por tema, pero el CTA comercial es débil
   above-the-fold. ¿Un acceso directo a "alquila barco / actividades" desde héroe?
2. La **ficha** es muy larga; el usuario que busca "ir hoy" quizá no llega al CTA.
   Probar CTA contextual tras el "estado de hoy".
3. **Widgets de actividades** (GYG) van below-the-fold; medir si suben con mejor
   posición/encabezado.
4. **PWA**: el banner de instalación es nuevo; optimizar momento y copy.
5. **Confianza**: hacer más visible "datos oficiales / metodología" cerca del score.

---

*Contacto técnico / accesos de staging y analítica: a coordinar.*

---

## H. Publicidad — dónde puede ir y dónde no

Encendida en agosto de 2026 (AdSense). El principio: **el anuncio lo paga la
respuesta, así que nunca puede ponerse entre el lector y la respuesta.**

Cada hueco declara en qué **zona** de la página está, y la zona decide formato,
altura reservada y si se pinta:

| Zona | Dónde | Qué admite |
|---|---|---|
| `hojeo` | listados | intercalado tras el 8.º resultado, nunca antes |
| `profundidad` | ficha, ya con respuesta y plan resueltos | display |
| `cierre` | al final del todo | multiplex; es lo único que admite `banderas-hoy` |
| `herramienta` | tras la tabla de mareas, comparar, mapa | display, jamás dentro de la herramienta |

**No existe zona para la fase de DECISIÓN de la ficha.** Si algún día hace falta
un anuncio ahí, que cueste escribirlo.

**Superficies sin publicidad, y no es olvido:** metodología, aviso legal,
privacidad, cookies y `/mi-cuaderno`, que promete al usuario «sin registro, sin
cuentas y sin darnos tu correo». Son las páginas que sostienen la credibilidad
de todas las demás.

Con bandera roja, los bloques comerciales duros desaparecen del DOM —no se
ocultan con `display:none`, que seguiría contando impresiones— y los blandos,
AdSense incluido, se van detrás del texto largo.

Todo hueco lleva la etiqueta «Publicidad» encima. Es la misma regla que el resto
del sitio —cada dato dice de dónde sale— aplicada a lo que no es un dato.
