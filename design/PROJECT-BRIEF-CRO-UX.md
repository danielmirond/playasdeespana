# Playas de España — Brief de producto para auditoría CRO / UX

*Documento para agencia de diseño. Actualizado: junio 2026.*
URL: https://playas-espana.com · Idiomas: Español (`/`) e Inglés (`/en`).

---

## 1. Qué es

Plataforma web (no app nativa) que responde a una pregunta: **«¿A qué playa voy hoy?»**.
Combina datos oficiales en tiempo real (estado del mar, meteo, calidad del agua,
medusas) con una base de **5.098 playas** de toda España para recomendar, mediante
un **score 0–100 recalculado cada hora**, la mejor playa según las condiciones
actuales. Es **editorial + utilitario**, no un folleto turístico: el diferencial
es el dato y la honestidad (decimos también cuándo NO ir).

Modelo de negocio: **gratis para el usuario**, monetizado por **afiliación**
(alquiler de barcos y autocaravanas, hoteles, actividades, etc.) y publicidad.

### Cifras clave
- **5.098 playas** · **898 con Bandera Azul** · 20 comunidades · 49 provincias.
- **4.300 playas con foto real** (84%); resto, imagen genérica por estado del mar.
- **18 artículos** de Magazine (ES+EN) · contenido creciente (3/día automatizado).
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

- **PWA instalable** recién añadida (manifest + iconos + banner "Instalar app").
- Recientes correcciones UX: logo vs hamburguesa en móvil, favicon de marca,
  imágenes de fallback rotas, repetición de playas en Home (ahora el score lo
  decide más el estado del mar).
- **Home**: el "Top playas hoy" tiende a mostrar las mejor equipadas; se ha
  rebalanceado hacia condiciones reales, pero la **selección/orden y la jerarquía
  visual de la Home** son candidatas claras a CRO.
- **Ficha de playa**: es muy densa (muchos módulos). Priorización visual,
  orden de bloques y ubicación de CTAs de afiliación = gran oportunidad.
- **Cobertura de foto**: 84% real; el 16% usa imagen genérica.

---

## 9. Qué necesitamos de la agencia (entregables CRO/UX)

1. **Auditoría heurística + CRO** de: Home, Ficha de playa, y una página comercial
   (alquiler de barco o autocaravana). Foco en el embudo a afiliación.
2. **Jerarquía y ubicación de CTAs** de afiliación/actividades sin dañar la
   credibilidad editorial ni los Core Web Vitals.
3. **Priorización de módulos** en la ficha (qué va above-the-fold en móvil).
4. **Recomendaciones accionables** expresables en nuestro sistema de tokens
   (no rediseño que rompa el stack ni meta dependencias pesadas).
5. (Opcional) Propuesta de **test A/B** priorizados por impacto/esfuerzo.

**Restricciones a respetar:** mobile-first, sin Tailwind, performance/SEO
crítico, estética editorial "arena + tinta", monetización por afiliación
(no intrusiva), cumplimiento RGPD (consentimiento).

---

# Anexos de detalle

## A. Ficha de playa — orden REAL de módulos (clave para CRO)

Orden vertical actual en móvil (lo que el usuario ve al hacer scroll). Es una
página **muy densa**; la pregunta CRO es qué sube, qué baja y dónde van los CTAs.

1. **Hero** — foto (o "mar animado" SVG si no hay foto), nombre, **score 0–100**
   (badge de color), estado del mar, acciones (favorito, compartir).
2. **Nav interno** (jump links a secciones).
3. **Estado de hoy** — recomendación + bandera de baño + riesgo de medusas.
4. **Asistente "¿Qué necesitas hoy?"** — chips de necesidades (sombra, calma…).
5. **Calidad del agua** (EEA): % muestras, temporada, clasificación Directiva 2006/7/CE.
6. **Opiniones destacadas + reseñas** (votos de usuarios).
7. **🟢 Bloque CTA de afiliados** (`AffiliatesCTABlock`) — primer punto comercial fuerte.
8. **Oleaje** (gráfico) + desplegable: sol, mareas, temperatura agua/aire, sensación,
   UV, humedad, viento + brújula.
9. **Surf** (si aplica).
10. **Cómo llegar**: coche / bus / bici / a pie + datos de acceso y parking + **mapa**.
11. **Tráfico en tiempo real**.
12. **Hoteles cercanos** (→ Booking, afiliado) · **AdSlot** (publicidad).
13. **Ferris** (si es isla) · **Restaurantes** (→ TheFork) · **Campings** (→ Pitchup).
14. **Centros de buceo / escuelas**.
15. **Servicios y equipamiento** + ficha técnica (desplegable).
16. **Texto SEO** + **hubs relacionados** + **"Cosas que hacer cerca"** (GetYourGuide).
17. (Desktop) **aside** con acciones y CTA de afiliación.

> Hipótesis CRO a validar: el primer CTA comercial llega **después** de calidad
> del agua y opiniones; ¿debería haber un CTA contextual antes? ¿El score y el
> "estado de hoy" están bien jerarquizados above-the-fold en móvil?

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
| Medusas / bandera baño | Modelo propio (viento + zona + temp.) | Tiempo real |
| Mareas | Cálculo astronómico | Tiempo real |
| Hoteles/restaurantes | Overpass (OSM) + caché | On-demand |
| Fotos | Wikimedia/Wikipedia/Flickr/Openverse/Pexels/Unsplash | Pre-resueltas (offline) |

El mensaje de marca ("datos oficiales, actualizados cada hora") es un **activo
de conversión/confianza**: conviene que el diseño lo haga visible sin saturar.

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
