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

  var body = document.body;

  /* ── Nada de nodos cacheados ──────────────────────────────────────
   * Este script vive dentro de un árbol que React posee y puede
   * reemplazar entero: le basta con un fallo de hidratación para
   * descartar el DOM del servidor y repintarlo desde cero.
   *
   * Cuando eso pasaba, las referencias que guardábamos aquí arriba
   * (elSec, elCont, secs[i].el) quedaban apuntando a nodos huérfanos.
   * El script seguía funcionando y seguía escribiendo... en elementos
   * que ya no estaban en la página. La píldora se congelaba en el HTML
   * del servidor —«01 / 18 Webcam» para siempre— y no había ningún
   * error en consola que lo delatara: fallaba en silencio.
   *
   * Se arreglaron los dos mismatches que lo provocaban, pero la
   * fragilidad era del diseño, no de aquel bug concreto. Ahora los
   * nodos se resuelven en cada medición: cuesta un querySelector por
   * frame de scroll y a cambio el script sobrevive a que React
   * reconstruya lo que quiera, cuando quiera.
   */
  function vivo() {
    var w = document.getElementById('pildora');
    if (!w) return null;
    return {
      wrap:  w,
      sec:   w.querySelector('[data-pildora-seccion]'),
      cont:  w.querySelector('[data-pildora-contador]'),
      velo:  w.querySelector('[data-pildora-velo]'),
      sig:   w.querySelector('[data-pildora-siguiente]'),
      avance: w.querySelector('[data-pildora-siguiente-href]'),
      prog:  w.querySelector('[data-pildora-progreso]'),
      items: [].slice.call(w.querySelectorAll('[data-pildora-item]')),
    };
  }

  var ini = vivo();
  if (!ini || !ini.items.length) return;

  // Solo las secciones que existen en ESTA ficha (no todas las playas
  // tienen chiringuitos, webcam o campings). Se recalcula en cada
  // medición por lo mismo: el conjunto puede cambiar bajo los pies.
  function seccionesVivas(v) {
    var out = [];
    v.items.forEach(function (a) {
      var id = a.getAttribute('data-pildora-item');
      var el = document.getElementById(id);
      if (el) out.push({ el: el, a: a, id: id, label: a.textContent.replace(/^\s*\d+\s*/, '').trim() });
      else a.style.display = 'none';   // el índice no ofrece lo que no hay
    });
    // Renumerar lo que queda visible: si la playa no tiene chiringuitos,
    // el índice no debe saltar del 07 al 09 ni desmentir al contador.
    out.forEach(function (s, i) {
      var num = s.a.querySelector('span');
      var txt = String(i + 1).padStart(2, '0');
      if (num && num.textContent !== txt) num.textContent = txt;
    });
    return out;
  }

  function pinta(v, secs, i) {
    if (!secs[i]) return;
    var total = String(secs.length).padStart(2, '0');
    var etiqueta = secs[i].label;
    var contador = String(i + 1).padStart(2, '0') + ' / ' + total;
    // Se compara contra lo que hay ESCRITO, no contra un índice que
    // recordemos: si React revirtió el texto, hay que reescribirlo
    // aunque la sección activa no haya cambiado.
    if (v.sec  && v.sec.textContent  !== etiqueta) v.sec.textContent  = etiqueta;
    if (v.cont && v.cont.textContent !== contador) v.cont.textContent = contador;

    // La siguiente sección: el enlace que convierte la píldora en un
    // "sigue leyendo". En la última no hay, y la línea se retira.
    var sig = secs[i + 1];
    if (v.avance) {
      if (sig) {
        v.avance.removeAttribute('data-sin-siguiente');
        var href = '#' + sig.id;
        if (v.avance.getAttribute('href') !== href) v.avance.setAttribute('href', href);
        if (v.sig && v.sig.textContent !== sig.label) v.sig.textContent = sig.label;
      } else {
        v.avance.setAttribute('data-sin-siguiente', '');
      }
    }

    // Cuánto llevas leído, en la barra de dos píxeles.
    if (v.prog) {
      var p = (i + 1) / secs.length;
      v.prog.style.setProperty('--pildora-progreso', p.toFixed(3));
    }
    v.items.forEach(function (a) { a.removeAttribute('aria-current'); });
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
    var v = vivo();
    if (!v) return;               // la píldora ya no está: nada que hacer
    var secs = seccionesVivas(v);
    if (!secs.length) return;

    var vh = window.innerHeight;
    var y  = scrollY();

    // Sección actual: la última cuyo borde superior ya pasó el 35% de la
    // pantalla. Es la que el ojo está leyendo.
    var linea = vh * 0.35;
    var idx = 0;
    for (var i = 0; i < secs.length; i++) {
      if (secs[i].el.getBoundingClientRect().top <= linea) idx = i; else break;
    }
    pinta(v, secs, idx);

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
  //
  // Delegado en document, no atado a cada nodo, por la misma razón que
  // todo lo de arriba: los oyentes puestos sobre elementos concretos se
  // pierden si React los reemplaza, y entonces el panel deja de cerrarse
  // sin que nadie se entere. Un solo oyente en la raíz no se pierde.
  function cerrar() {
    var p = document.getElementById('pildora-panel');
    if (p) p.open = false;
  }
  /* ── Saltar a una sección, a mano ─────────────────────────────
   * Medido en la ficha real (oct-2026): pulsar una sección del índice
   * cambiaba el hash y no movía la página ni un píxel. Queda el enlace
   * nativo para quien no tenga JS, pero cuando hay script el salto lo
   * hacemos aquí, que además nos deja dejar un respiro arriba en vez de
   * pegar el titular al borde.
   */
  var RESPIRO = 12;
  var TOLERANCIA = 24;

  /* Saltar a una sección, a mano.
   *
   * Medido en la ficha real (oct-2026): pulsar una sección del índice
   * cambiaba el hash y no movía la página ni un píxel, así que el índice
   * llevaba desde siempre sin llevar a ninguna parte.
   *
   * Quién scrollea aquí no es evidente —el <body> lleva su propio
   * overflow y según el momento el que se mueve es el documento— y
   * elegirlo a ojo fue justo lo que lo rompió otra vez. Así que no se
   * elige: scrollIntoView ya sabe cuál es el contenedor de cada
   * elemento, y el respiro de arriba lo pone scroll-margin-top en vez de
   * una resta nuestra. Queda el href nativo para quien no tenga JS.
   */
  function saltar(id) {
    var el = document.getElementById(id);
    if (!el) return false;
    var suave = !window.matchMedia || !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.style.scrollMarginTop = RESPIRO + 'px';
    el.scrollIntoView({ behavior: suave ? 'smooth' : 'auto', block: 'start' });
    alScroll();
    // La ficha carga imágenes y mapas por debajo mientras se baja, así
    // que el destino se mueve durante la animación: medido, el salto se
    // pasaba 372 px o se quedaba 339 corto. Se corrige cuando el scroll
    // ya ha parado, y solo si de verdad quedó desviado.
    [420, 900, 1600].forEach(function (ms) {
      setTimeout(function () {
        var e = document.getElementById(id);
        if (!e) return;
        if (Math.abs(e.getBoundingClientRect().top - RESPIRO) > TOLERANCIA) {
          e.scrollIntoView({ behavior: 'auto', block: 'start' });
        }
      }, ms);
    });
    return true;
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    // No se intercepta el enlace: el salto nativo se deja correr y
    // encima se pasan las correcciones. Si el navegador llega bien, las
    // correcciones no hacen nada; si no se mueve —que es lo que pasaba—
    // lo arreglan. Así esto no puede dejarlo peor de lo que estaba.
    var salto = t.closest('[data-pildora-item]') || t.closest('[data-pildora-siguiente-href]');
    if (salto) {
      var href = salto.getAttribute('href') || '';
      if (href.charAt(0) === '#') saltar(href.slice(1));
    }
    if (t.closest('[data-pildora-velo]') || t.closest('[data-pildora-item]')) cerrar();
    // "Cómo está hoy" reutiliza el drawer de reportar que ya existe.
    // (Hay más de un disparador: la píldora, el aviso de presencia…)
    if (t.closest('[data-pildora-estado]')) {
      window.dispatchEvent(new CustomEvent('open-reportar-drawer'));
    }
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') cerrar(); });

  /* ── ¿Está el usuario EN la playa? ────────────────────────────────
   * Si lo está, "cómo llegar" sobra y lo útil es que cuente cómo está:
   * quien pisa la arena es el reportero ideal, y de ahí sale el dato de
   * bandera y medusas.
   *
   * Dos reglas innegociables:
   *  · No se pide permiso nuevo. Solo se mira la posición si el usuario
   *    YA concedió la ubicación antes (permissions.query). Preguntar sin
   *    que lo haya pedido quema el permiso, y en iOS no se recupera.
   *  · La posición NO sale del dispositivo. La distancia se calcula aquí
   *    y lo único que queda es un atributo en el <body>. Al servidor no
   *    viaja ninguna coordenada, como promete la FAQ del sitio.
   */
  var RADIO_M = 300;
  var pLat = parseFloat(wrap.getAttribute('data-lat'));
  var pLng = parseFloat(wrap.getAttribute('data-lng'));

  function distanciaM(la1, lo1, la2, lo2) {
    var R = 6371000, r = function (d) { return d * Math.PI / 180; };
    var dLa = r(la2 - la1), dLo = r(lo2 - lo1);
    var x = Math.sin(dLa / 2) * Math.sin(dLa / 2) +
            Math.cos(r(la1)) * Math.cos(r(la2)) * Math.sin(dLo / 2) * Math.sin(dLo / 2);
    return 2 * R * Math.asin(Math.sqrt(x));
  }

  function comprobarPresencia() {
    if (!isFinite(pLat) || !isFinite(pLng) || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(function (pos) {
      var c = pos.coords;
      // Una lectura imprecisa (torre de móvil, ±2 km) diría "estás en la
      // playa" desde el sofá. Sin GPS decente, no afirmamos nada.
      if (c.accuracy > 200) return;
      var d = distanciaM(c.latitude, c.longitude, pLat, pLng);
      body.setAttribute('data-enplaya', d <= RADIO_M ? 'si' : 'no');
    }, function () { /* denegado o sin señal: se queda como está */ },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 120000 });
  }

  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions.query({ name: 'geolocation' }).then(function (p) {
      if (p.state === 'granted') comprobarPresencia();
      // Si lo concede más tarde (desde "playas cerca de mí"), reaccionamos
      p.onchange = function () { if (p.state === 'granted') comprobarPresencia(); };
    }).catch(function () {});
  }
  // Al volver a la pestaña puede haber cambiado de sitio (o haber llegado).
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && body.getAttribute('data-enplaya') !== 'si') comprobarPresencia();
  });
})();
