# Auditoría de producto · v2
**Fecha:** julio 2026 · **Sustituye a:** Auditoría CRO/UX v1 (junio 2026)

---

## 0. Por qué una v2 y no una relectura

La auditoría de junio sigue siendo buena, pero audita un producto que ya
no existe. Tres de sus cinco apuestas están implementadas, dos de sus
cuatro métricas de portada son falsas hoy, y el producto ha ganado una
dimensión —la retención— que aquel documento no contemplaba porque no
existía.

Esta v2 hace tres cosas: **cierra** lo que ya se hizo, **corrige** los
números que envejecieron y **audita lo nuevo**.

---

## 1. Estado de las cinco apuestas de junio

| # | Apuesta | Estado | Nota |
|---|---|---|---|
| 1 | CTA contextual tras "Estado de hoy" | ✅ Hecho | `ContextualCTA` vive en la capa de decisión, no en 7ª posición |
| 2 | Acceso comercial en el héroe de la Home | ✅ Hecho | Chips de barco, autocaravana y actividades bajo el buscador |
| 3 | 1–2 CTAs por página, no nueve | ⚠️ Parcial | La jerarquía existe, pero siguen 9 partners en el sistema |
| 4 | Sello "datos oficiales · cada hora" junto al score | ✅ Hecho | Bloque `trust` en la capa de decisión |
| 5 | Reordenar la ficha móvil por intención | ✅ Hecho | `ORDER_V2` con tres capas: decisión, plan, profundidad |

**Cuatro de cinco cerradas.** El backlog ICE de aquel documento queda
obsoleto: sus tres tests Tier 1 están en producción sin haberse medido
como test. Eso es deuda de medición, no de producto — ver §5.

---

## 2. Los números de portada, corregidos

| Métrica de junio | Realidad de julio | Comentario |
|---|---|---|
| 16% de fichas sin foto real | **99,5% tienen foto — pero ~67% venían de Flickr sin verificar** | El problema no era la ausencia sino la falsedad: servíamos playas de Sudáfrica en Galicia. Corregida la cascada; falta re-cosechar |
| 7º scroll hasta el primer CTA | **Resuelto** | El CTA contextual está en la capa de decisión |
| 9 partners compitiendo | **Sigue igual** | Único hallazgo de junio que continúa abierto |
| ~70% del tráfico es móvil | **90%** (GSC abr-jul) | Móvil: 506 de 562 clics. El escritorio es residual |

Y dos cifras nuevas que cambian el marco:

- **El tráfico se multiplicó por seis en julio** (76 → 459 clics) sin
  gastar un euro. La estacionalidad domina cualquier optimización.
- **"Bandera playa X hoy" es la franquicia**: 210 clics, CTR 3,9%, y 154
  fichas distintas reciben esa intención. No es una playa concreta: es un
  patrón de producto.

---

## 3. El cambio de tesis

La v1 tenía una tesis única: *convertir el interés de la ficha en un clic
de afiliación*. Sigue siendo válida, pero incompleta por dos motivos.

**Primero, la economía es más fina de lo que parecía.** Una visita
monetizada con AdSense y afiliación vale céntimos. Eso no invalida
optimizar la conversión —es gratis hacerlo bien— pero sí invalida
cualquier plan que dependa de *comprar* ese tráfico.

**Segundo, ahora hay un producto de retención.** "Mi cuaderno de playas"
—sellar las playas que pisas, coleccionar insignias, sin registro— no
convierte a afiliación, pero hace que el usuario vuelva solo. En un
producto estacional con un pico brutal de tres meses, **la retención vale
más que el clic**: un usuario que sella su primera playa en julio vuelve
en agosto sin que paguemos nada.

> **Tesis v2:** el embudo tiene dos salidas legítimas, no una. El clic de
> afiliación paga el mes; el sello del cuaderno paga el verano siguiente.
> Optimizar solo la primera deja la mitad del valor sobre la mesa.

---

## 4. Hallazgos nuevos

### 4.1 · El cuaderno no tiene métrica ni sitio en el embudo
**Severidad: alta**

Se lanzó esta semana y ya tiene puerta de entrada, sellos e insignias.
Pero no hay ningún indicador que diga si funciona: cuántos usuarios
sellan su primera playa, cuántos vuelven a sellar, cuántos llegan a la
segunda. Sin eso, en septiembre no sabremos si mantenerlo o retirarlo.

**Recomendación:** definir el sello como conversión primaria en analítica,
junto al clic de afiliación. Y medir la métrica que de verdad importa:
**% de usuarios con ≥2 sellos** — el primero es curiosidad, el segundo es
hábito.

### 4.2 · Las fotos prometen más de lo que la ficha cumple
**Severidad: alta**

La cascada está arreglada, pero el catálogo cosechado sigue teniendo las
imágenes incorrectas. Cualquier campaña, nota de prensa o compartición
que lleve a una ficha con foto ajena rompe la promesa de la marca justo
en el punto de entrada.

**Recomendación:** re-cosechar antes de cualquier acción de marketing.
Asumir que saldrán bastantes menos fotos propias y más genéricas — pero
ninguna mintiendo.

### 4.3 · El cromado móvil ya no es el problema; la densidad sí
**Severidad: media**

La píldora contextual bajó el cromado fijo de 316px a 64px (del 39% al 8%
del viewport). Pero la ficha sigue teniendo 18 secciones. Resolvimos el
marco, no el contenido.

**Recomendación:** medir con datos reales qué secciones se ven de verdad
(el observador del índice ya sabe en cuál está el usuario). Las que no
alcance nadie deberían plegarse o desaparecer.

### 4.4 · Nueve partners siguen compitiendo
**Severidad: media** · *heredado de v1, sin resolver*

Es el único hallazgo de junio que sigue abierto, y ahora tiene un
agravante: hemos añadido superficie de producto (cuaderno, ranking,
reportes) que también pide atención. La ficha compite consigo misma.

**Recomendación:** auditar los 9 y retirar los que no generen ingreso
medible. Un partner que no paga cuesta atención, que sí es escasa.

### 4.5 · Tres tests Tier 1 en producción, ninguno medido
**Severidad: media**

Las apuestas de junio se implementaron directamente. No sabemos si el CTA
contextual mejoró la conversión o si el sello de confianza hizo algo.

**Recomendación:** no re-testear lo que ya está —cuesta más que su
valor—, pero instrumentar de aquí en adelante. La regla: nada que se
implemente para convertir sale sin su evento.

---

## 5. Backlog re-priorizado (ICE)

| Test / acción | Impacto | Confianza | Facilidad | ICE |
|---|---|---|---|---|
| Re-cosecha de fotos verificadas | 9 | 9 | 5 | **7,7** |
| Sello del cuaderno como conversión en analítica | 8 | 9 | 8 | **8,3** |
| Métrica "% con ≥2 sellos" y panel de retención | 8 | 8 | 7 | **7,7** |
| Auditar y podar los 9 partners | 7 | 7 | 6 | **6,7** |
| Instrumentar los CTAs ya implementados | 6 | 9 | 8 | **7,7** |
| Medir secciones vistas y plegar las muertas | 6 | 7 | 6 | **6,3** |
| Campaña de prensa del ranking top 100 | 9 | 6 | 5 | **6,7** |
| Módulo de alojamiento con afiliado Booking | 7 | 7 | 7 | **7,0** |

**Los tres primeros por ICE** son de medición y de datos, no de interfaz.
Es la señal de que el producto ha madurado: en junio el problema era el
diseño; hoy es saber qué está pasando.

---

## 6. Lo que no hay que tocar

Tres cosas funcionan y conviene protegerlas de la próxima ronda de
optimización:

1. **La gramática de certeza.** El trazo que distingue lo medido de lo
   estimado es el foso competitivo. Cualquier simplificación que lo diluya
   destruye más valor del que ahorra.
2. **La regla del dato ausente.** Mostrar "—" y omitir la conclusión es
   incómodo y es correcto. Es lo que hace creíble todo lo demás.
3. **El "sin registro".** El cuaderno sin cuentas es una ventaja
   competitiva y un argumento de conversión. La tentación de pedir correo
   para "medir mejor" llegará: hay que resistirla.
