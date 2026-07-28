/* public/pildora.js — gobierno de la píldora contextual (propuesta 2026 §5.1).
 *
 * Todo el comportamiento se reduce a escribir atributos data- en el <body>;
 * el CSS del módulo hace el resto. Sin React, sin hidratación: la ficha
 * funciona igual si este script no llega a ejecutarse (la píldora
 * simplemente no aparece y las secciones siguen siendo enlaces internos).
 *
 *   body[data-pildora='on']    → la píldora es visible
 *   body[data-ctx='llegar']    → la acción derecha pasa a "Cómo llegar"
 */
(function () {
  var wrap = document.getElementById('pildora');
  if (!wrap) return;

  var panel   = document.getElementById('pildora-panel');
  var elSec   = wrap.querySelector('[data-pildora-seccion]');
  var elCont  = wrap.querySelector('[data-pildora-contador]');
  var velo    = wrap.querySelector('[data-pildora-velo]');
  var btnEst  = wrap.querySelector('[data-pildora-estado]');
  var items   = [].slice.call(wrap.querySelectorAll('[data-pildora-item]'));
  var body    = document.body;

  // Secciones presentes en ESTA ficha (no todas existen en todas)
  var secs = items.map(function (a) {
    return { id: a.getAttribute('data-pildora-item'), el: document.getElementById(a.getAttribute('data-pildora-item')), a: a };
  }).filter(function (s) { return s.el; });
  if (!secs.length) return;

  var total = String(secs.length);
  var actual = -1;

  function pinta(i) {
    if (i === actual || !secs[i]) return;
    actual = i;
    if (elSec)  elSec.textContent  = secs[i].a.textContent.replace(/^\s*\d+\s*/, '').trim();
    if (elCont) elCont.textContent = String(i + 1).padStart(2, '0') + ' / ' + total;
    items.forEach(function (a) { a.removeAttribute('aria-current'); });
    secs[i].a.setAttribute('aria-current', 'location');
  }

  // Sección actual: IntersectionObserver sobre los <section> que ya
  // existen por SEO. Nada nuevo en el DOM.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entradas) {
      var mejor = null;
      entradas.forEach(function (e) {
        if (e.isIntersecting && (!mejor || e.intersectionRatio > mejor.intersectionRatio)) mejor = e;
      });
      if (!mejor) return;
      for (var i = 0; i < secs.length; i++) if (secs[i].el === mejor.target) { pinta(i); break; }
    }, { rootMargin: '-15% 0px -65% 0px', threshold: [0, 0.25, 1] });
    secs.forEach(function (s) { io.observe(s.el); });
  }

  // Visibilidad de la píldora + acción contextual. Umbral: el alto del
  // hero (la píldora no compite con la respuesta a "¿me baño hoy?").
  var hero = document.querySelector('[data-hero], header + section, main > :first-child');
  function onScroll() {
    var y = window.scrollY || 0;
    var umbral = hero ? Math.max(240, hero.offsetHeight - 120) : 320;
    body.setAttribute('data-pildora', y > umbral ? 'on' : 'off');
    // Pasada la mitad de la ficha, lo que hace falta es llegar
    var alto = document.documentElement.scrollHeight - window.innerHeight;
    body.setAttribute('data-ctx', alto > 0 && y / alto > 0.45 ? 'llegar' : 'estado');
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

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
