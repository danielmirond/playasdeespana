/* public/destacado.js — clics de los espacios patrocinados.
 *
 * Sin esto no hay nada que enseñarle al anunciante al mes siguiente, y un
 * espacio que no se puede medir no se puede renovar ni subir de precio.
 *
 * Se engancha a gtag, que ya respeta el Consent Mode: sin consentimiento
 * el evento se descarta y aquí no hay ninguna otra vía de salida. No se
 * guarda nada en el dispositivo ni se identifica a nadie.
 *
 * Delegado en document y sin nodos cacheados, por lo mismo que pildora.js:
 * los oyentes puestos sobre elementos concretos se pierden si React
 * reconstruye el árbol.
 */
(function () {
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest
      ? e.target.closest('[data-destacado], [data-destacado-tel]')
      : null
    if (!a) return
    var tel = a.hasAttribute('data-destacado-tel')
    var nombre = a.getAttribute(tel ? 'data-destacado-tel' : 'data-destacado')
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'destacado_clic', {
        negocio: nombre,
        accion: tel ? 'telefono' : 'web',
        // La playa desde la que se hizo clic: es el dato que decide si el
        // patrocinio se vende por playa o por municipio.
        playa: location.pathname.split('/').filter(Boolean).pop() || '',
      })
    }
  }, { passive: true })
})()
