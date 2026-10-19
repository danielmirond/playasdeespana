/* public/lectura.js — cuánto se lee de verdad.
 *
 * PARA QUÉ. Hasta ahora lo único que sabíamos de una pieza era que alguien
 * la había abierto. «Abierta» y «leída» no son lo mismo, y en un sitio que
 * publica para decidir —si me baño, si voy— la diferencia es justo la
 * medida que falta: una ficha que se abre y se cierra a los dos segundos
 * está fallando aunque sume página vista.
 *
 * QUÉ MIDE, Y POR QUÉ ASÍ:
 *
 * · El CUERPO del artículo, no la página. Si se midiera el scroll de la
 *   página entera, el pie, los enlaces relacionados y los anuncios contarían
 *   como lectura, y el porcentaje subiría al añadir cosas debajo. Se mide
 *   [data-lectura], que envuelve solo el texto.
 *
 * · El punto MÁS HONDO alcanzado, no el actual: quien baja y vuelve arriba a
 *   releer ha leído igual.
 *
 * · Con un control de velocidad. Bajar de un tirón al final no es leer. Se
 *   exige un tiempo mínimo proporcional al texto (300 palabras por minuto,
 *   que es rápido para alguien que lee y lentísimo para quien arrastra la
 *   barra). Si no se cumple, el porcentaje se reporta igual pero marcado
 *   como `ojeada`, y así en el informe se pueden separar.
 *
 * · El tiempo solo corre con la pestaña visible.
 *
 * LO QUE NO HACE. No identifica a nadie, no guarda nada en el dispositivo y
 * no manda un solo byte si el visitante no ha aceptado analítica: se engancha
 * a gtag, que ya respeta el Consent Mode. Si no hay consentimiento, gtag
 * descarta el evento y aquí no hay ninguna otra vía de salida.
 */
(function () {
  // Mismo arranque reintentable que pildora.js, y por el mismo motivo:
  // si el script corre antes de que [data-lectura] esté en el DOM, se
  // iba para siempre y el lector se quedaba sin barra de progreso.
  if (document.querySelector('[data-lectura]')) {
    arranca()
  } else if (window.MutationObserver) {
    var espera = new MutationObserver(function () {
      if (!document.querySelector('[data-lectura]')) return
      espera.disconnect()
      arranca()
    })
    espera.observe(document.documentElement, { childList: true, subtree: true })
    document.addEventListener('DOMContentLoaded', function () {
      if (document.querySelector('[data-lectura]')) { espera.disconnect(); arranca() }
    }, { once: true })
  }

  function arranca() {
  var cuerpo = document.querySelector('[data-lectura]')
  if (!cuerpo) return

  /* gtag NO se comprueba aquí.
   *
   * Este fichero va con defer y GA entra después, cuando el visitante
   * acepta analítica. Comprobar `typeof gtag === 'function'` al arrancar
   * era una carrera perdida: el script se iba sin hacer nada y con él se
   * iba la barra de progreso, que es lo único que ve el lector y que no
   * tiene por qué depender de la analítica.
   *
   * Se mira al enviar. Si no hay gtag —sin consentimiento, con bloqueador,
   * o simplemente aún no ha cargado— el evento se descarta y la barra
   * sigue funcionando igual. */
  function manda(nombre, datos) {
    if (typeof window.gtag === 'function') window.gtag('event', nombre, datos)
  }

  var PALABRAS_POR_MINUTO = 300
  var HITOS = [25, 50, 75, 100]

  var palabras = (cuerpo.textContent || '').trim().split(/\s+/).length
  var segundosMinimos = Math.max(5, (palabras / PALABRAS_POR_MINUTO) * 60 * 0.25)

  /* LA LÍNEA DE ARRIBA.
   *
   * La misma cuenta que se mide, pintada: una barra de tres píxeles que
   * avanza con la lectura. La crea el propio script, así que no existe en
   * las páginas sin artículo y no hay que tocar ningún componente.
   *
   * Va fija y sin ocupar sitio en el flujo: cero CLS, que en estas fichas
   * es 0 y así se queda. Y marca el avance REAL, no el máximo: si subes a
   * releer, la línea retrocede contigo. */
  /* En la ficha de playa ya hay una barra de progreso dentro de la píldora
   * inferior, y dos indicadores de lo mismo son ruido. Si la píldora está
   * visible, aquí no se pinta nada y solo se mide. Se comprueba el display
   * calculado, no el ancho de pantalla, para que se ajuste solo. */
  var pildora = document.getElementById('pildora')
  var conPildora = !!(pildora && getComputedStyle(pildora).display !== 'none')
  // Con píldora la línea SÍ se crea, pero empieza oculta: desde que la
  // píldora se aparta al bajar (pildora.js escribe data-pildora en el
  // body), el progreso tiene que seguir viéndose en alguna parte. Se
  // turnan, nunca se solapan, que era el motivo original de no pintarla.
  var pintaLinea = true

  var linea = document.createElement('div')
  linea.setAttribute('role', 'progressbar')
  linea.setAttribute('aria-label', document.documentElement.lang === 'en' ? 'Reading progress' : 'Progreso de lectura')
  linea.setAttribute('aria-valuemin', '0')
  linea.setAttribute('aria-valuemax', '100')
  linea.style.cssText = [
    'position:fixed', 'top:0', 'left:0', 'height:3px', 'width:100%',
    'transform:scaleX(0)', 'transform-origin:left center',
    'background:var(--accent, #1f6f8b)', 'z-index:120', 'pointer-events:none',
    'transition:transform 120ms linear',
  ].join(';')
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    linea.style.transition = 'none'
  }
  if (pintaLinea) document.body.appendChild(linea)

  if (conPildora) {
    linea.style.transition += ',opacity 160ms linear'
    var sincroniza = function () {
      linea.style.opacity = document.body.getAttribute('data-pildora') === 'on' ? '0' : '1'
    }
    sincroniza()
    // El atributo lo escribe otro script en cada scroll, así que se
    // observa en vez de recalcularlo aquí: una sola fuente de verdad.
    new MutationObserver(sincroniza).observe(document.body, {
      attributes: true, attributeFilter: ['data-pildora'],
    })
  }

  var maximo = 0
  var visibleDesde = document.hidden ? 0 : Date.now()
  var segundos = 0
  var enviados = {}
  var ultimoEnviado = -1

  function acumula() {
    if (visibleDesde) { segundos += (Date.now() - visibleDesde) / 1000; visibleDesde = 0 }
  }

  /* Porcentaje leído del cuerpo.
   *
   * Se calcula con getBoundingClientRect en vez de con scrollY a propósito:
   * en la ficha de playa el elemento que scrollea no siempre es el mismo
   * —el <body> lleva su propio overflow— y cualquier cuenta basada en
   * scrollY da cero en la mitad de las páginas. El rectángulo del propio
   * elemento es cierto gobierne quien gobierne el scroll. */
  function porcentaje() {
    var r = cuerpo.getBoundingClientRect()
    var alto = r.height
    if (alto <= 0) return 0
    // Cuánto del cuerpo ha pasado ya por encima del borde inferior de la
    // pantalla. Si el cuerpo cabe entero, con verlo basta.
    var leido = Math.min(alto, Math.max(0, window.innerHeight - r.top))
    return Math.min(100, Math.round((leido / alto) * 100))
  }

  function mide() {
    var p = porcentaje()
    if (pintaLinea) {
      linea.style.transform = 'scaleX(' + (p / 100).toFixed(3) + ')'
      linea.setAttribute('aria-valuenow', String(p))
    }
    if (p > maximo) maximo = p
    for (var i = 0; i < HITOS.length; i++) {
      var h = HITOS[i]
      if (maximo >= h && !enviados[h]) {
        enviados[h] = true
        manda('lectura_hito', {
          porcentaje: h,
          palabras: palabras,
          // Un hito alcanzado antes de que diera tiempo a leer hasta ahí.
          ojeada: tiempoAcumulado() < segundosMinimos * (h / 100),
        })
      }
    }
  }

  function tiempoAcumulado() {
    return segundos + (visibleDesde ? (Date.now() - visibleDesde) / 1000 : 0)
  }

  /* Se cierra en el primer `hidden`, no en el `unload`: en móvil la pestaña
   * se suele abandonar sin que llegue a descargarse nunca. Y se puede cerrar
   * más de una vez —quien se va y vuelve lee más— pero solo se manda si de
   * verdad ha avanzado desde la última vez. Sin esa condición, cada cambio
   * de pestaña sumaba un evento, y abrir y cerrar sin leer mandaba un 0 %. */
  function cierra() {
    acumula()
    if (maximo === 0 || maximo <= ultimoEnviado) return
    ultimoEnviado = maximo
    manda('lectura', {
      porcentaje: maximo,
      segundos: Math.round(segundos),
      palabras: palabras,
      ojeada: segundos < segundosMinimos,
      // Leída de verdad: llegó al final Y le dedicó el tiempo que pide el
      // texto. Es la métrica que interesa mirar en el informe.
      completa: maximo >= 90 && segundos >= segundosMinimos,
    })
  }

  var pendiente = false
  function alScroll() {
    if (pendiente) return
    pendiente = true
    requestAnimationFrame(function () { pendiente = false; mide() })
  }

  mide()
  window.addEventListener('scroll', alScroll, { passive: true })
  document.addEventListener('scroll', alScroll, { passive: true, capture: true })
  window.addEventListener('resize', alScroll)

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cierra()
    else visibleDesde = Date.now()
  })
  // pagehide cubre el cierre de pestaña y el bfcache de Safari, donde
  // beforeunload no se dispara.
  window.addEventListener('pagehide', cierra)
  }
})()
