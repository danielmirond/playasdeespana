// src/app/api/widget/embed/route.ts
// Widget JS embebible. El blogger pega:
//   <div data-playa="playa-los-cuartos"></div>
//   <script src="https://playas-espana.com/api/widget/embed"></script>
// y se renderiza un badge con score + meteo + link.
import { NextResponse } from 'next/server'

export const revalidate = 86400

const JS = `
(function(){
  var BASE='https://playas-espana.com';
  var els=document.querySelectorAll('[data-playa]');
  if(!els.length)return;

  var style=document.createElement('style');
  style.textContent=\`
    .pe-widget{
      display:inline-flex;align-items:center;gap:10px;
      padding:10px 14px;
      background:#faf4e6;border:1px solid #e5d6b4;border-radius:6px;
      font-family:Georgia,serif;text-decoration:none;color:#2a1a08;
      transition:border-color .15s;max-width:360px;
    }
    .pe-widget:hover{border-color:#6b400a;text-decoration:none}
    .pe-score{
      width:40px;height:40px;border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      color:#fff;font-weight:700;font-size:15px;
      flex-shrink:0;
    }
    .pe-info{flex:1;min-width:0}
    .pe-name{font-weight:700;font-size:14px;line-height:1.2}
    .pe-meta{font-size:11px;color:#7a6858;margin-top:2px}
    .pe-data{font-size:11px;color:#7a6858;margin-top:3px;font-family:ui-monospace,monospace}
    .pe-by{font-size:9px;color:#a89880;margin-top:4px;letter-spacing:.08em;text-transform:uppercase}
  \`;
  document.head.appendChild(style);

  els.forEach(function(el){
    var slug=el.getAttribute('data-playa');
    if(!slug)return;
    fetch(BASE+'/api/widget?slug='+encodeURIComponent(slug))
      .then(function(r){return r.json()})
      .then(function(d){
        if(d.error){el.textContent='Playa no encontrada';return}
        var a=document.createElement('a');
        a.href=d.url;
        a.target='_blank';
        a.rel='noopener';
        a.className='pe-widget';
        a.innerHTML=
          '<div class="pe-score" style="background:'+d.color+'">'+d.score+'</div>'+
          '<div class="pe-info">'+
            '<div class="pe-name">'+d.nombre+'</div>'+
            '<div class="pe-meta">'+d.municipio+' \\u00b7 '+d.provincia+'</div>'+
            '<div class="pe-data">'+d.agua+'\\u00b0C \\u00b7 '+d.olas+'m olas \\u00b7 '+d.viento+'km/h</div>'+
            '<div class="pe-by">playas-espana.com</div>'+
          '</div>';
        el.replaceWith(a);
      })
      .catch(function(){el.textContent='Error cargando datos'});
  });
})();
`;

export async function GET() {
  return new NextResponse(JS, {
    headers: {
      'Content-Type': 'application/javascript; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600',
    },
  })
}
