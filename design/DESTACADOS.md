# Espacios patrocinados en la ficha

Un negocio paga por aparecer destacado en una sección de la ficha de una
playa, o de todas las de un municipio.

## Cómo se da de alta

Una fila en `src/data/destacados.json`. No hay panel ni base de datos: a
este volumen, un JSON en el repo deja el histórico en git y evita montar
infraestructura para vender diez espacios.

```json
[
  {
    "slug": "playa-de-bolonia",
    "seccion": "comer",
    "nombre": "Chiringuito Las Dunas",
    "texto": "Pescado del día a pie de arena, con mesas a la sombra hasta las 18:00.",
    "href": "https://…",
    "telefono": "956 00 00 00",
    "foto": "https://…",
    "desde": "2026-06-01",
    "hasta": "2026-09-30"
  }
]
```

- `slug` para una playa concreta; `municipio` en su lugar para cubrir
  todas las de ese municipio. El de la playa gana al del municipio.
- `seccion`: `comer` (implementada), y `dormir`, `campings`, `buceo`,
  `actividades` cuando se cableen.
- `desde`/`hasta`: **la vigencia se comprueba al renderizar**. Un
  contrato que vence deja de pintarse solo; nadie tiene que acordarse.

## Las tres reglas que no se tocan

1. **Se dice que es publicidad.** La tarjeta lleva «Patrocinado» visible
   y arriba, en la misma tipografía con la que cada dato de la ficha dice
   de dónde sale. Un anuncio que no se identifica se apoya en la
   credibilidad de las mediciones que tiene al lado, y esa no está en
   venta.
2. **No se inventa nota.** El destacado no lleva estrellas ni reseñas: no
   las hemos medido. Es la misma línea que llevó a quitar el «Excelente ·
   99 %» de la calidad del agua.
3. **El enlace va `rel="sponsored nofollow"`.** Es lo que Google exige
   para un enlace pagado. Sin eso arriesgas una acción manual sobre el
   dominio entero, y el anunciante tampoco está comprando un enlace:
   compra visitas.

## Qué le enseñas al anunciante

`public/destacado.js` manda a GA un evento `destacado_clic` con el
negocio, si el clic fue a la web o al teléfono, y desde qué playa. Eso es
lo que permite renovar, subir el precio o decidir si el espacio se vende
por playa o por municipio. Pasa por Consent Mode: sin consentimiento no
sale un byte.

## Lo que falta antes de cobrar

- Cablear las otras cuatro secciones (hoy solo `comer`).
- Decidir el precio con un dato delante: cuántas visitas tiene al mes la
  ficha que vendes. Está en GSC por URL.
- Un aviso en la página de metodología diciendo que existen espacios
  pagados y que no alteran ni los datos ni el orden de los listados.
