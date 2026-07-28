/* public/pildora.js — gobierno de la píldora contextual (propuesta 2026 §5.1).
 *
 * Todo el comportamiento se reduce a escribir atributos data- en el <body>
 * y a reescribir dos textos; el CSS del módulo hace el resto. Sin React,
 * sin hidratación: la ficha funciona igual si este script no llega a
 * ejecutarse (la píldora no aparece y las secciones siguen siendo enlaces
 * internos que navegan solos).
 *
 *   body[data-pildora='on']  → la píldora es visible
 *   body[data-ctx='llegar']  → la acción derecha pasa a "Cómo llegar"
 *
 * NOTA (jul-2026): la primera versión resolvía la sección actual con un
 * IntersectionObserver y escuchaba `scroll` solo en `window`. En la ficha
 * real el <body> lleva su propio overflow, así que el observador dejaba de
 * disparar tras la carga y la etiqueta se quedaba clavada en la primera
 * sección. Ahora la posición se calcula con getBoundingClientRect en el
 * propio manejador de scroll (14 medidas, limitadas por rAF): es inmune a
 * qué elemento scrollea y siempre pinta un estado inicial correcto.
 */
(function () {
  var wrap = document.getElementById('pildora');
  if (!wrap) return;

  var panel  = document.getElementById('pildora-panel');
  var elSec  = wrap.querySelector('[data-pildora-seccion]');
  var elCont = wrap.querySelector('[data-pildora-contador]');
  var velo   = wrap.querySelector('[data-pildora-velo]');
  var btnEst = wrap.querySelector('[data-pildora-estado]');
  var items  = [].slice.call(wrap.querySelectorAll('[data-pildora-item]'));
  var body   = document.body;

  // Solo las secciones que existen en ESTA ficha (no todas las playas
  // tienen chiringuitos, webcam o campings).
  var secs = [];
  items.forEach(function (a) {
    var el = document.getElementById(a.getAttribute('data-pildora-item'));
    if (el) secs.push({ el: el, a: a, label: a.textContent.replace(/^\s*\d+\s*/, '').trim() });
    else a.style.display = 'none';   // el índice no ofrece lo que no hay
  });
  if (!secs.length) return;

  // Renumerar lo que queda visible: si la playa no tiene chiringuitos, el
  // índice no debe saltar del 07 al 09 ni desmentir al contador.
  secs.forEach(function (s, i) {
    var num = s.a.querySelector('span');
    if (num) num.textContent = String(i + 1).padStart(2, '0');
  });

  var total = String(secs.length).padStart(2, '0');
  var actual = -1;

  function pinta(i) {
    if (i === actual || !secs[i]) return;
    actual = i;
    if (elSec)  elSec.textContent  = secs[i].label;
    if (elCont) elCont.textContent = String(i + 1).padStart(2, '0') + ' / ' + total;
    items.forEach(function (a) { a.removeAttribute('aria-current'); });
    secs[i].a.setAttribute('aria-current', 'location');
  }

  // Posición de scroll independiente de quién sea el scroller.
  function scrollY() {
    return window.scrollY || document.documentElement.scrollTop || body.scrollTop || 0;
  }
  function alturaDoc() {
    return Math.max(document.documentElement.scrollHeight, body.scrollHeight);
  }

  var hero = document.querySelector('[data-hero]') || document.querySelector('main > :first-child');
  var pendiente = false;

  function medir() {
    pendiente = false;
    var vh = window.innerHeight;
    var y  = scrollY();

    // Sección actual: la última cuyo borde superior ya pasó el 35% de la
    // pantalla. Es la que el ojo está leyendo.
    var linea = vh * 0.35;
    var idx = 0;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].el.getBoundingClientRect().top <= linea) idx = i; else break;
    }
    pinta(idx);

    // La píldora entra cuando el hero deja de mandar: al aterrizar, la
    // respuesta a "¿me baño hoy?" no compite con nada.
    var umbral = hero ? Math.max(240, hero.offsetHeight - 140) : 320;
    body.setAttribute('data-pildora', y > umbral ? 'on' : 'off');

    // Pasada la mitad de la ficha, lo que hace falta es llegar.
    var recorrido = alturaDoc() - vh;
    body.setAttribute('data-ctx', recorrido > 0 && y / recorrido > 0.45 ? 'llegar' : 'estado');
  }

  function alScroll() {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(medir);
  }

  medir();
  // Escuchamos en window y en document (fase de captura): así da igual que
  // el scroller acabe siendo el documento, el <body> o un contenedor.
  window.addEventListener('scroll', alScroll, { passive: true });
  document.addEventListener('scroll', alScroll, { passive: true, capture: true });
  window.addEventListener('resize', alScroll);
  window.addEventListener('load', medir);

  // Cerrar el panel: al tocar el velo, al elegir sección o con Escape.
  function cerrar() { if (panel) panel.open = false; }
  if (velo) velo.addEventListener('click', cerrar);
  items.forEach(function (a) { a.addEventListener('click', cerrar); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });

  // "Cómo está hoy" reutiliza el drawer de reportar que ya existe.
  if (btnEst) btnEst.addEventListener('click', function () {
    window.dispatchEvent(new CustomEvent('open-reportar-drawer'));
  });
})();
