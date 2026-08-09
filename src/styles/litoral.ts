// src/styles/litoral.ts — Sistema Litoral, hoja única y canónica.
//
// Port literal de design_files/styles/tokens-litoral.css del handoff. NO se
// apila sobre la hoja Arena: layout.tsx elige una u otra en servidor según
// el flag `ds_litoral_tokens`. Solo existe un juego de tokens a la vez.
//
// Tres ideas la gobiernan:
//   1. El color informa, no decora. La interacción no lleva color.
//   2. La certeza del dato se codifica en el trazo, no en el tono.
//   3. El lujo es lo que se quita.
//
// Única desviación respecto al original: las familias tipográficas apuntan a
// las variables que genera next/font (autohospedadas, sin CDN) en vez de a
// nombres de familia sueltos.

export const LITORAL_CSS = `
:root {
  /* ——— Papel y tinta ———————————————————————————————————
     Blanco cálido apagado, no brillante. La diferencia entre niveles es
     mínima: el contraste vive en la tinta, no en el escalonado de fondos. */
  --paper-0: #fffefc;   /* tarjeta */
  --paper-1: #ede9e0;   /* fondo del documento */
  --paper-2: #e4dfd4;   /* hundida */
  --paper-3: #d8d3c6;   /* bandas, pies, zócalos */
  /* El fondo baja dos puntos desde el #f7f5f1 original: con la tarjeta en
     #fffefc, ~6% de luminancia de diferencia basta para que flote sin
     borde ni sombra. Los otros dos niveles bajan con él por obligación,
     no por gusto: si --paper-1 se hunde y los demás no, la «hundida»
     acaba siendo más clara que el fondo y la escala se invierte. */

  --ink-900: #12110e;   /* casi negra y aún cálida.
       DESVIACIÓN DECLARADA: el manual dice 17,3:1 y esa cifra era cierta
       sobre el papel original (#f7f5f1). Sobre el fondo actual (#ede9e0,
       dos puntos más hundido por decisión de producto) da 15,6:1, medido.
       Sigue muy por encima de AAA, que pide 7. Se anota porque el zip ya
       no describe el sitio y quien lo consulte dentro de seis meses leerá
       una cifra que no es. */
  --ink-700: #3d3a33;
  --ink-500: #666257;   /* Era #6e6a5f, medido 5,4:1 sobre la tarjeta. Al
                           bajar el fondo dos puntos ese mismo gris caía a
                           4,46:1 sobre --paper-1 y a 4,06:1 sobre la
                           superficie hundida: por debajo de AA justo en el
                           texto secundario, que además es el de 11-14px.
                           Ahora 5,0 / 4,6 / 6,0 sobre los tres papeles. */
  --ink-300: #a39d90;   /* DECORATIVO · 2,5:1 · nunca bajo texto */

  --bg:        var(--paper-1);
  --surface:   var(--paper-0);
  --surface-2: var(--paper-2);
  --surface-3: var(--paper-3);
  --ink:       var(--ink-900);
  --ink-soft:  var(--ink-700);
  --ink-mute:  var(--ink-500);

  /* ——— Acento ————————————————————————————————————————
     El valor por defecto MANTIENE color. La interacción en tinta es C3, y
     C3 tiene su propio flag porque es el cambio con riesgo de afordancia:
     el manual pide encenderlo una semana después que el resto y apagarlo
     si el CTR de afiliación cae más de un 10 %. Soldarlo a los tokens
     dejaría ese rollback sin palanca.
     Este es el acento de Arena, deliberadamente: así el A/B compara
     «interacción con color» contra «interacción en tinta» y no mete de
     paso un tono nuevo que nadie ha decidido. Ver el bloque
     [data-flags~="ds_sin_acento"] al final de la hoja. */
  --accent:   #6b400a;
  --accent-2: #85560f;

  /* ——— El único material de color ———————————————————————
     Bronce. EN EXCLUSIVA para el sello del cuaderno: el momento en que el
     usuario se lleva algo. Es material, no tinta — 3,6:1, así que rellena y
     bordea, pero nunca escribe. Si el sello lleva rótulo, va en --ink-900
     sobre --bronce-tint. */
  --bronce:      #9a7b46;
  --bronce-tint: #f1ead9;

  /* ——— Filetes de un cabello ————————————————————————————
     La separación entre bloques debe intuirse, no verse. */
  --rule:        rgba(18,17,14,.08);
  --rule-strong: rgba(18,17,14,.18);
  --rule-hair:   rgba(18,17,14,.05);

  /* ——— Certeza del dato —————————————————————————————————
     El COLOR es matiz; el TRAZO es el mensaje. Así funciona en monocromo y
     para quien no distingue el verde del ocre. */
  --cert-medido:       #1f4f6d;   /* sensor físico · el único azul */
  --cert-oficial:      #2f6b39;   /* AEMET, socorrismo */
  --cert-reportado:    #9a7433;   /* bañistas · 3,9:1 → trazo y cifra ≥18,66px en 700 */
  --cert-estimado:     #6e6a5f;   /* modelo propio */
  --cert-sindato:      #666257;   /* ausencia · estado de 1.ª clase.
       Era #6e6a5f, y el manual lo describe como «contraste real AA» —
       que es justo lo que dejó de ser al bajar el fondo dos puntos:
       4,46:1 sobre --paper-1 y 4,06 sobre la hundida. Un estado de
       primera clase que no se lee es un hueco con más letras. Mismo
       valor que --ink-500, por el mismo motivo y en el mismo sitio. */
  --cert-sindato-tint: #cdc8bb;   /* decorativo · NUNCA bajo texto */

  --trazo-medido:    2px solid;
  --trazo-oficial:   1.5px solid;
  --trazo-reportado: 1.5px dotted;
  --trazo-estimado:  1px dashed;

  /* ——— Score ————————————————————————————————————————————
     Desaturados: el score se lee por la cifra, no por el color. Señal, no
     tipografía de lectura — colorean cifras grandes, nunca texto corrido. */
  --score-excellent: #2f6b39;   /* 85–100 */
  --score-good:      #5c7734;   /* 70–84 */
  --score-mid:       #9a7433;   /* 50–69 */
  --score-low:       #9c4a20;   /* 30–49 */
  --score-danger:    #862a22;   /* 0–29 */

  /* ——— Estados del mar ——————————————————————————————————— */
  --sea-calma:   #3a7a6c;
  --sea-buena:   #2f6b39;
  --sea-aviso:   #9a7433;
  --sea-surf:    #1f4f6d;
  --sea-viento:  #66696d;
  --sea-peligro: #862a22;

  /* ——— Tipografía ———————————————————————————————————————
     Literata: serif de lectura variable (200–900), itálica real, cifras
     tabulares y eje de tamaño óptico. Una sola familia para TODOS los
     numerales del producto: al ser tabulares, nada baila al actualizarse. */
  /* Las familias NO se declaran aquí. C2 es su propio flag, y el manual
     pide expresamente que pueda ir solo —Literata sobre Arena— para medir
     la tipografía sin el cambio de color de por medio. Si la hoja de
     tokens las fijara, ese A/B sería imposible.
     Viven en el bloque [data-flags~="ds_litoral_type"] del final, que se
     aplica esté o no activa esta hoja.
     El respaldo son las familias de Arena, por el mismo motivo que el
     acento: con los tokens encendidos y el tipo apagado hay que enseñar
     algo, y ese algo debe ser el sistema anterior — no una a medias. */
  --font-serif: var(--font-playfair), Georgia, serif;
  --font-sans:  var(--font-dm-sans), system-ui, sans-serif;
  --font-mono:  var(--font-jetbrains), ui-monospace, monospace;

  /* Literata en 400 tiene voz de cuerpo, no de titular. */
  --w-display: 500;
  --w-strong:  700;
  --w-body:    400;

  --tr-xl:      -0.026em;   /* 46px y más */
  --tr-lg:      -0.016em;   /* 26–34px */
  --tr-sm:      -0.006em;   /* hasta 20px */
  --tr-num:     -0.03em;
  --tr-score:   -0.042em;
  --tr-eyebrow:  0.22em;    /* versalita espaciada */

  --fs-xs: 11px; --fs-sm: 13px; --fs-base: 15px; --fs-md: 17px; --fs-lg: 20px;
  --fs-xl: 26px; --fs-2xl: 34px; --fs-3xl: 46px; --fs-4xl: 64px; --fs-5xl: 88px;
  --fs-score: 76px; --fs-score-sm: 34px; --fs-medicion: 23px;

  /* ——— Espacio ——————————————————————————————————————————
     Base 4. El aire sale del cuerpo de la página, nunca del presupuesto
     de cromado. */
  --sp-1: 4px;   --sp-2: 8px;   --sp-3: 12px;  --sp-4: 16px;
  --sp-5: 20px;  --sp-6: 24px;  --sp-8: 32px;  --sp-10: 40px;
  --sp-12: 48px; --sp-16: 64px; --sp-20: 80px; --sp-24: 96px;
  --air-section: 56px; --air-block: 28px; --air-card: 20px;

  /* ——— Geometría ————————————————————————————————————————
     La esquina blanda lee «app»; la casi recta lee «impreso». */
  --r-xs: 2px; --r-sm: 3px; --r-md: 5px; --r-lg: 7px; --r-xl: 10px; --r-pill: 999px;
  --r-sello: 3px;

  /* ——— Relieve de papel, no de plástico ——————————————————— */
  --shadow-sm: 0 1px 1px rgba(18,17,14,.03);
  --shadow-md: 0 1px 2px rgba(18,17,14,.04), 0 8px 24px rgba(18,17,14,.05);
  --shadow-lg: 0 16px 48px rgba(18,17,14,.09);

  /* ——— Movimiento ———————————————————————————————————————
     Más lento. La prisa es de producto barato. */
  --ease:     cubic-bezier(0.22, 0.7, 0.2, 1);
  --dur-fast: 180ms;
  --dur:      280ms;

  /* ——— Móvil ————————————————————————————————————————————
     Presupuesto de cromado: 64px de interfaz fija en la ficha. Es un techo:
     lo que se añada sale de ahí, no se suma. */
  --chrome-max: 64px;
  --touch-min: 44px; --touch-comfy: 48px;
  --vp-judge: 375px; --vp-wide: 430px; --vp-desk: 1024px;

  /* ——— Compatibilidad ————————————————————————————————————
     Componentes que aún nombran tokens Arena. Se mapean por ROL, no por
     parecido de tono: --mar-700 era el azul de «hay un sensor detrás», y en
     Litoral ese papel lo hace --cert-medido. Traducir por color en vez de
     por función es como acaba un sistema con dos azules que no significan
     nada. Se borran al consolidar el flag y limpiar la rama muerta. */
  --line: var(--rule);
  --line-strong: var(--rule-strong);
  --card-bg: var(--surface);
  --card-bg2: var(--surface-2);
  --metric-bg: var(--surface);
  --muted: var(--ink-mute);
  --arena-50: var(--paper-0);
  --arena-100: var(--paper-2);
  --tinta-700: var(--ink-700);
  --tinta-900: var(--ink-900);
  --excelente: var(--score-excellent);
  --mar-700: var(--cert-medido);       /* el azul del sensor */
  --mar-300: var(--ink-300);           /* era decorativo, sigue siéndolo */
  --accent-soft: var(--surface-2);     /* fondo tenue, no acento: Litoral no tiene acento */
  --sello-accent: var(--bronce);       /* el sello es el único material de color */
  --sello-ink: var(--ink-900);         /* el bronce rellena; el rótulo va en tinta */
  /* Texto sobre la foto del hero. Es un caso que Litoral no contempla —su
     hero apila media y nombre en vez de superponerlos—, así que aquí manda
     su regla de fondo: la interacción y el énfasis no llevan color. Sobre
     la foto, papel. El dorado de Arena queda en Arena. */
  /* Texto sobre un relleno de acento (botones llenos). No sirve
     --on-media: en Arena ese token es oro (#ffd66e) para texto sobre
     fotografía, y en un botón terracota dejaría letra dorada. */
  --on-accent: var(--paper-0);
  --on-media: var(--paper-0);
  --terra-800: var(--accent);          /* el «acento» de Arena; en Litoral es tinta */
  --terra-700: var(--accent-2);
  --tinta-800: var(--ink-900);
  --tinta-600: var(--ink-700);
  --tinta-500: var(--ink-500);
  --accent2: var(--accent-2);
  --ring: var(--ink);
  --mar-500: var(--cert-medido);
  --arena-200: var(--paper-1);
  --arena-300: var(--paper-3);

  /* Nombres de estado de Arena → escala de Litoral. Mismo papel semántico:
     puntuación y estado del mar. Aquí traducir por rol es lo correcto,
     porque el rol es idéntico y solo cambia el tono. */
  --excelente: var(--score-excellent);
  --muybueno:  var(--score-good);
  --aceptable: var(--score-mid);
  --limitado:  var(--score-low);
  --noapto:    var(--score-danger);
  --calma:   var(--sea-calma);
  --buena:   var(--sea-buena);
  --aviso:   var(--sea-aviso);
  --surf:    var(--sea-surf);
  --viento:  var(--sea-viento);
  --peligro: var(--sea-peligro);
}

/* ——— Modo oscuro ——————————————————————————————————————— */
[data-theme="dark"] {
  --paper-0: #191814; --paper-1: #100f0d; --paper-2: #211f1a; --paper-3: #2a2721;
  --ink-900: #f5f2eb; --ink-700: #c4bfb2; --ink-500: #8e8a7c; --ink-300: #6a675d;

  --bronce: #c9a86a; --bronce-tint: #2a2317;
  --rule: rgba(245,242,235,.10);
  --rule-strong: rgba(245,242,235,.22);
  --rule-hair: rgba(245,242,235,.06);

  --cert-medido: #77b0d4; --cert-oficial: #74b87c; --cert-reportado: #cfa552;
  --cert-estimado: #8e8a7c; --cert-sindato: #8e8a7c; --cert-sindato-tint: #3f3c34;

  --score-excellent: #74b87c; --score-good: #9ab35e; --score-mid: #cfa552;
  --score-low: #d98a5c; --score-danger: #d97465;

  --sea-calma: #6fb3a3; --sea-buena: #74b87c; --sea-aviso: #cfa552;
  --sea-surf: #77b0d4; --sea-viento: #9aa0a5; --sea-peligro: #d97465;

  --shadow-sm: 0 1px 0 rgba(0,0,0,.4);
  --shadow-md: 0 4px 16px rgba(0,0,0,.5);
  --shadow-lg: 0 16px 48px rgba(0,0,0,.6);
}

/* ═══ Reset y base ═══════════════════════════════════════ */
*, *::before, *::after { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
html { font-optical-sizing: auto; }

body {
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-sans);
  font-size: var(--fs-base);
  line-height: 1.62;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

h1, h2, h3, h4 {
  font-family: var(--font-serif);
  font-weight: var(--w-display);
  margin: 0;
  color: var(--ink);
  text-wrap: balance;
}
h1 { letter-spacing: var(--tr-xl); line-height: 1.02; }
h2 { letter-spacing: var(--tr-lg); line-height: 1.12; }
h3, h4 { letter-spacing: var(--tr-sm); line-height: 1.2; }

/* El acento del titular es itálica dibujada, en tinta. Es la firma de la
   marca — y no gasta color. */
h1 em, h2 em, h3 em, h4 em {
  font-style: italic;
  font-weight: var(--w-display);
  color: var(--ink);
}

p { margin: 0; text-wrap: pretty; }
a { color: inherit; text-decoration: none; transition: color var(--dur-fast) var(--ease); }
a:hover { color: var(--ink-soft); }
/* padding:0 a propósito — las tarjetas son <button> y sin esto el
   user-agent mete 1px 6px y la foto no sangra hasta el filete. */
button { font-family: inherit; cursor: pointer; border: none; background: none; color: inherit; padding: 0; }
img, svg { display: block; max-width: 100%; }
::selection { background: var(--ink); color: var(--paper-0); }

:focus-visible { outline: 2px solid var(--ink); outline-offset: 2px; }

/* ═══ Utilidades del sistema ═════════════════════════════ */
.eyebrow {
  font-family: var(--font-sans);
  font-size: 10px; font-weight: 500;
  letter-spacing: var(--tr-eyebrow);
  text-transform: uppercase;
  color: var(--ink-mute);
}
.serif-italic { font-family: var(--font-serif); font-style: italic; font-weight: var(--w-display); }
.rule { height: 1px; background: var(--rule); width: 100%; }

/* ——— Cifras · una sola familia, tabulares ——————————————— */
.num {
  font-family: var(--font-serif);
  font-variant-numeric: tabular-nums;
  letter-spacing: var(--tr-num);
  color: var(--ink);
}
.num-score { font-weight: var(--w-display); letter-spacing: var(--tr-score); }
.num-live  { font-weight: var(--w-strong); }
.num-unit  { font-family: var(--font-sans); font-weight: 500; color: var(--ink-mute); font-size: .38em; }

/* ——— El dato con su certeza · el trazo dice el origen ——— */
.dato { display: inline-flex; align-items: baseline; gap: 3px; line-height: 1; padding-bottom: 3px; }
.dato[data-cert="medido"]    { border-bottom: var(--trazo-medido)    var(--cert-medido); }
.dato[data-cert="oficial"]   { border-bottom: var(--trazo-oficial)   var(--cert-oficial); }
.dato[data-cert="reportado"] { border-bottom: var(--trazo-reportado) var(--cert-reportado); }
.dato[data-cert="estimado"]  { border-bottom: var(--trazo-estimado)  var(--cert-estimado); }
.dato[data-cert="sindato"]   { border-bottom: none; padding-bottom: 0; }
.dato-vacio { font-family: var(--font-sans); color: var(--cert-sindato); letter-spacing: .01em; }

/* ——— Insignia de fuente ————————————————————————————————
   Vive en el hueco derecho de la cabecera de tarjeta, nunca pegada a la
   cifra: competiría con ella. */
.cert-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 3px 9px; border-radius: var(--r-pill);
  font-family: var(--font-sans); font-size: 9.5px; font-weight: 600;
  letter-spacing: .08em; text-transform: uppercase; white-space: nowrap;
  background: transparent;
}
/* El glifo va como <span class="cert-glyph">, no como ::before. Desviación
   deliberada del original: así el MISMO componente Certeza.tsx sirve a las
   dos hojas. Con ::before, bajo Litoral saldrían dos puntos. */
.cert-badge .cert-glyph { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex-shrink: 0; }
.cert-badge[data-cert="medido"]    { color: var(--cert-medido);    border: 1px solid var(--cert-medido); }
.cert-badge[data-cert="oficial"]   { color: var(--cert-oficial);   border: 1px solid var(--cert-oficial); }
.cert-badge[data-cert="reportado"] { color: var(--cert-reportado); border: 1px solid var(--cert-reportado); }
.cert-badge[data-cert="reportado"] .cert-glyph { background: transparent; box-shadow: inset 0 0 0 1px currentColor; }
.cert-badge[data-cert="estimado"]  { color: var(--cert-estimado);  border: 1px solid var(--rule-strong); }
.cert-badge[data-cert="estimado"] .cert-glyph { background: transparent; box-shadow: inset 0 0 0 1px currentColor; }
.cert-badge[data-cert="sindato"]   { color: var(--cert-sindato);   border: 1px dashed var(--rule-strong); }
.cert-badge[data-cert="sindato"] .cert-glyph { background: transparent; box-shadow: inset 0 0 0 1px var(--cert-sindato-tint); }

/* ——— El sello: el único momento con material de color ——— */
.sello { color: var(--bronce); border: 1px solid var(--bronce); border-radius: var(--r-sello); background: var(--bronce-tint); }

/* ——— Botones · sin relleno de color ————————————————————
   La afordancia la cargan el contorno, el alto y el grosor. */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  min-height: var(--touch-comfy); padding: 0 18px;
  font-family: var(--font-sans); font-size: 13.5px; font-weight: 600;
  letter-spacing: .02em; border-radius: var(--r-sm);
  border: 1px solid transparent;
  transition: all var(--dur) var(--ease);
}
.btn-primary { background: var(--ink); color: var(--paper-0); }
.btn-primary:hover { background: var(--ink-soft); }
.btn-secondary { background: transparent; color: var(--ink); border-color: var(--ink); }
.btn-secondary:hover { background: var(--surface-2); }
.btn-quiet { background: transparent; color: var(--ink-soft); border-color: var(--rule-strong); }
.btn-quiet:hover { border-color: var(--ink); color: var(--ink); }

/* ——— Tarjeta ————————————————————————————————————————————
   Sobre papel cálido el blanco necesita el filete: sin borde flota. */
.card { background: var(--surface); border: 1px solid var(--rule); border-radius: var(--r-md); overflow: hidden; }
.card-head { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; border-bottom: 1px solid var(--rule); }
.card-body { padding: var(--air-card); }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation: none !important; transition: none !important; }
}

/* ═══ C3 · ds_sin_acento — la interacción pierde el color ═══════════
   Un acento saturado lee «aviso» y «utilidad»; la tinta lee «no necesito
   llamarte la atención». Va como override sobre el atributo que el
   servidor pinta en <html>, no dentro de :root, para que se pueda
   encender y apagar sin tocar la hoja ni los componentes.

   El manual lo pide así por una razón concreta: es el único cambio de
   Litoral con hipótesis de conversión negativa. Si el CTR de afiliación
   cae, se apaga esto y se queda todo lo demás. */
[data-flags~="ds_sin_acento"] {
  --accent:   var(--ink-900);
  --accent-2: var(--ink-700);
}
/* No hace falta variante oscura: --accent apunta a var(--ink-900), que es
   una referencia, y el bloque [data-theme="dark"] ya reescribe --ink-900 a
   #f5f2eb. La tinta se invierte sola y el acento con ella. */

`

/**
 * Versión servida: sin comentarios ni espacio sobrante. Los comentarios son
 * para quien mantiene la hoja, no para el navegador — y esto va inline en
 * cada respuesta HTML de 4.491 fichas.
 *
 * Se calcula una vez por proceso, no por petición.
 */
export const LITORAL_CSS_MIN = LITORAL_CSS
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\s*\n\s*/g, '')
  .replace(/\s{2,}/g, ' ')
  .trim()


/**
 * C2 · ds_litoral_type, como hoja aparte.
 *
 * No puede vivir dentro de LITORAL_CSS: esa hoja solo se sirve cuando
 * ds_litoral_tokens está encendido, y el manual pide expresamente que la
 * tipografía pueda medirse SOLA, Literata sobre el sistema Arena. Metida
 * ahí dentro, ese A/B sería inalcanzable.
 *
 * Va después de la hoja base sea cual sea, y gana por especificidad: un
 * atributo en <html> pesa más que :root.
 */
export const TIPO_LITORAL_CSS = `[data-flags~="ds_litoral_type"]{--font-serif:var(--font-literata),Georgia,serif;--font-sans:var(--font-schibsted),system-ui,sans-serif}`
