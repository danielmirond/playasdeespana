/* ¿Me baño hoy? — floating widget, self-contained & portable.
   Port fiel del diseño de Claude Design (widget-bano-hoy). Trae sus estilos y
   colores de marca inlineados. Muestra un array por defecto al instante y luego
   lo sustituye por datos REALES desde /api/bano-hoy (score/veredicto/foto). */
(function(){
  if (window.__banoHoyLoaded) return; window.__banoHoyLoaded = true;

  var CTA_HREF = (window.BANO_HOY_HREF || '/playas-cerca-de-mi');

  var css = ''
  + '#bh-root{position:fixed;right:22px;bottom:22px;z-index:9000;'
  + "font-family:'DM Sans',-apple-system,BlinkMacSystemFont,sans-serif;}"
  + '#bh-root *{box-sizing:border-box;}'
  + '.bh-btn{display:flex;align-items:center;gap:0;background:none;border:0;cursor:pointer;padding:0;}'
  + ".bh-label{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:600;font-size:15px;"
  + 'color:#2a1a08;background:#faf4e6;border:1px solid rgba(42,26,8,.28);border-right:0;padding:11px 16px 11px 18px;'
  + 'border-radius:999px 0 0 999px;white-space:nowrap;box-shadow:0 8px 24px rgba(42,26,8,.14);transition:transform .2s,opacity .2s;}'
  + '.bh-orb{position:relative;width:60px;height:60px;border-radius:50%;background:#6b400a;display:flex;align-items:center;'
  + 'justify-content:center;box-shadow:0 10px 28px rgba(107,64,10,.4);flex-shrink:0;}'
  + '.bh-orb::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 0 rgba(107,64,10,.45);animation:bh-pulse 2.4s ease-out infinite;}'
  + '.bh-orb svg{width:34px;height:34px;}'
  + '.bh-orb .w1{animation:bh-wave 3s ease-in-out infinite;}'
  + '.bh-orb .w2{animation:bh-wave 3s ease-in-out infinite .4s;}'
  + '.bh-badge{position:absolute;top:-3px;right:-3px;background:#3d6b1f;color:#fff;'
  + "font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:12px;min-width:24px;height:24px;border-radius:999px;"
  + 'display:flex;align-items:center;justify-content:center;border:2px solid #f0e6d0;padding:0 4px;}'
  + '.bh-btn:hover .bh-label{transform:translateX(3px);}'
  + '.bh-btn:hover .bh-orb{transform:scale(1.05);}'
  + '@keyframes bh-pulse{0%{box-shadow:0 0 0 0 rgba(107,64,10,.45)}70%{box-shadow:0 0 0 18px rgba(107,64,10,0)}100%{box-shadow:0 0 0 0 rgba(107,64,10,0)}}'
  + '@keyframes bh-wave{0%,100%{transform:translateX(0)}50%{transform:translateX(-4px)}}'
  + '.bh-card{position:absolute;right:0;bottom:74px;width:284px;background:#faf4e6;border:1px solid rgba(42,26,8,.28);'
  + 'border-radius:18px;box-shadow:0 24px 60px rgba(42,26,8,.26);padding:18px;opacity:0;transform:translateY(12px) scale(.96);'
  + 'transform-origin:bottom right;pointer-events:none;transition:opacity .26s cubic-bezier(.2,.6,.2,1),transform .26s cubic-bezier(.2,.6,.2,1);}'
  + '#bh-root[data-open="true"] .bh-card{opacity:1;transform:translateY(0) scale(1);pointer-events:auto;}'
  + '#bh-root[data-open="true"] .bh-label{opacity:0;transform:translateX(20px);}'
  + '.bh-close{position:absolute;top:12px;right:14px;background:none;border:0;font-size:20px;color:#7a6850;cursor:pointer;line-height:1;}'
  + ".bh-live{display:flex;align-items:center;gap:7px;font-family:'JetBrains Mono',ui-monospace,monospace;font-size:10px;letter-spacing:.1em;color:#7a6850;}"
  + '.bh-dot{width:7px;height:7px;border-radius:50%;background:#3d6b1f;animation:bh-blink 1.6s ease-in-out infinite;}'
  + '@keyframes bh-blink{0%,100%{opacity:1}50%{opacity:.3}}'
  + '.bh-beach{display:flex;align-items:center;gap:11px;margin-top:14px;}'
  + '.bh-thumb{width:46px;height:46px;border-radius:10px;background:linear-gradient(160deg,#9db3b6,#c9b890);background-size:cover;background-position:center;flex-shrink:0;border:1px solid rgba(42,26,8,.14);transition:background .4s;}'
  + ".bh-bname{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:18px;line-height:1;color:#2a1a08;}"
  + '.bh-bregion{font-size:11px;color:#7a6850;margin-top:3px;}'
  + '.bh-scorerow{display:flex;align-items:center;gap:14px;margin-top:14px;padding-top:14px;border-top:1px solid rgba(42,26,8,.14);}'
  + '.bh-score{display:flex;align-items:baseline;line-height:1;}'
  + ".bh-n{font-family:'Playfair Display',Georgia,serif;font-weight:700;font-size:52px;letter-spacing:-.03em;color:#2a1a08;font-variant-numeric:tabular-nums;}"
  + '.bh-d{font-size:15px;color:#7a6850;margin-left:2px;}'
  + ".bh-verdict{font-family:'Playfair Display',Georgia,serif;font-style:italic;font-weight:600;font-size:18px;color:#3d6b1f;line-height:1.1;}"
  + ".bh-verdict span{font-family:'DM Sans',sans-serif;font-style:normal;font-weight:400;font-size:11px;color:#7a6850;}"
  + '.bh-cta{display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;background:#2a1a08;color:#f0e6d0;'
  + 'font-weight:600;font-size:14px;padding:13px;border-radius:10px;text-decoration:none;transition:background .2s;}'
  + '.bh-cta:hover{background:#6b400a;}'
  + '.bh-cta .ar{transition:transform .2s;}'
  + '.bh-cta:hover .ar{transform:translateX(3px);}'
  + '.bh-trust{text-align:center;font-size:10.5px;color:#7a6850;margin-top:10px;}'
  + '@media (prefers-reduced-motion: reduce){.bh-orb::after,.bh-orb .w1,.bh-orb .w2,.bh-dot{animation:none;}}'
  + '@media (max-width:520px){.bh-label{display:none;}}';

  var html = ''
  + '<div class="bh-card" role="dialog" aria-label="Estado del mar en directo">'
  +   '<button class="bh-close" aria-label="Cerrar">&times;</button>'
  +   '<div class="bh-live"><span class="bh-dot"></span><span>EN DIRECTO &middot; ahora mismo</span></div>'
  +   '<div class="bh-beach"><div class="bh-thumb"></div><div><div class="bh-bname">Cala Estreta</div><div class="bh-bregion">Palafrugell &middot; Girona</div></div></div>'
  +   '<div class="bh-scorerow"><div class="bh-score"><span class="bh-n">87</span><span class="bh-d">/100</span></div>'
  +     '<div class="bh-verdict">excelente<br><span>para ba&ntilde;arse hoy</span></div></div>'
  +   '<a class="bh-cta" href="' + CTA_HREF + '">Buscar mi playa <span class="ar">&rarr;</span></a>'
  +   '<div class="bh-trust">Datos oficiales &middot; actualizados cada hora</div>'
  + '</div>'
  + '<button class="bh-btn" aria-label="¿Me baño hoy? Ver estado del mar">'
  +   '<span class="bh-label">&iquest;Me ba&ntilde;o hoy?</span>'
  +   '<span class="bh-orb">'
  +     '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round">'
  +       '<path class="w1" d="M 6 26 Q 12 21 18 26 T 30 26 T 42 26"/>'
  +       '<path class="w2" d="M 6 33 Q 12 28 18 33 T 30 33 T 42 33" opacity="0.7"/>'
  +     '</svg><span class="bh-badge">87</span>'
  +   '</span>'
  + '</button>';

  function init(){
    var style = document.createElement('style'); style.textContent = css; document.head.appendChild(style);
    var root = document.createElement('div'); root.id = 'bh-root'; root.setAttribute('data-open','false');
    root.innerHTML = html; document.body.appendChild(root);

    var btn = root.querySelector('.bh-btn'), close = root.querySelector('.bh-close'), open = false;
    function set(o){ open = o; root.setAttribute('data-open', o ? 'true' : 'false'); }
    btn.addEventListener('click', function(){ set(!open); });
    close.addEventListener('click', function(e){ e.stopPropagation(); set(false); });
    document.addEventListener('keydown', function(e){ if(e.key === 'Escape') set(false); });

    // Array por defecto (se muestra al instante); se sustituye por datos reales.
    var beaches = [
      { n:'Cala Estreta', r:'Palafrugell · Girona', s:87, v:'excelente', vs:'para bañarse hoy', vc:'#3d6b1f', g:'linear-gradient(160deg,#9db3b6,#c9b890)' },
      { n:'Cala Saona', r:'Formentera · Balears', s:94, v:'inmejorable', vs:'mar en calma', vc:'#3d6b1f', g:'linear-gradient(160deg,#8fc7c2,#dcc79a)' },
      { n:'La Concha', r:'Donostia · Gipuzkoa', s:62, v:'aceptable', vs:'algo de viento', vc:'#c48a1e', g:'linear-gradient(160deg,#a7b3b0,#c2b896)' },
      { n:'Bolonia', r:'Tarifa · Cádiz', s:78, v:'muy buena', vs:'ideal para pasear', vc:'#7a8a30', g:'linear-gradient(160deg,#bcc7b8,#d9c79e)' }
    ];
    var i = 0;
    var nameEl = root.querySelector('.bh-bname'), regEl = root.querySelector('.bh-bregion'),
        nEl = root.querySelector('.bh-n'), vEl = root.querySelector('.bh-verdict'),
        thumb = root.querySelector('.bh-thumb'), badge = root.querySelector('.bh-badge');

    function paint(b){
      nameEl.textContent = b.n; regEl.textContent = b.r;
      nEl.textContent = b.s; badge.textContent = b.s;
      thumb.style.background = b.thumb ? ('center/cover url("' + b.thumb + '")') : (b.g || 'linear-gradient(160deg,#9db3b6,#c9b890)');
      vEl.style.color = b.vc; vEl.innerHTML = b.v + '<br><span>' + b.vs + '</span>';
    }

    setInterval(function(){ i = (i + 1) % beaches.length; paint(beaches[i]); }, 3600);

    // Datos reales: sustituyen el array por defecto y repintan la actual.
    fetch('/api/bano-hoy').then(function(r){ return r.ok ? r.json() : null; }).then(function(d){
      if (d && d.beaches && d.beaches.length) { beaches = d.beaches; i = 0; paint(beaches[0]); }
    }).catch(function(){});
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
