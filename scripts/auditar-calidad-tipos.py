import re, html, random, collections, urllib.request, time, json, sys
BASE='https://playas-espana.com'
urls=[u.strip().replace(BASE,'') for u in open('/tmp/all-urls.txt') if u.strip()]
def tipo(p):
    seg=[s for s in p.split('/') if s]
    if not seg: return 'home'
    if seg[0]=='en':
        if len(seg)>=3 and seg[1]=='beaches': return 'EN · ficha de playa'
        if len(seg)>=2 and seg[1]=='boat-rental': return 'EN · barcos'
        return 'EN · hub/estática'
    if seg[0]=='playas' and len(seg)==2: return 'ficha de playa'
    if seg[0]=='municipio': return 'municipio · '+(seg[2] if len(seg)>2 else 'raíz')
    if seg[0] in ('provincia','comunidad','magazine'): return seg[0]
    if seg[0]=='alquiler-autocaravana': return 'alquiler autocaravana'
    return 'hub temático'
porTipo=collections.defaultdict(list)
for u in urls: porTipo[tipo(u)].append(u)
def texto(h):
    h=re.sub(r'<(script|style|noscript)\b.*?</\1>',' ',h,flags=re.S|re.I)
    return html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',h))).strip()
def gram(t):
    w=[x for x in re.findall(r"[\wáéíóúüñçÁÉÍÓÚÑ€°%·/,\.-]+", t.lower()) if x]
    return set(tuple(w[i:i+6]) for i in range(0,max(0,len(w)-5))), len(w)
def baja(u):
    r=urllib.request.Request(BASE+u, headers={'User-Agent':'playas-espana-auditoria/1.0'})
    with urllib.request.urlopen(r, timeout=40) as x: return x.read().decode('utf8','ignore')
random.seed(11)
datos={}
for t,v in sorted(porTipo.items(), key=lambda x:-len(x[1])):
    if len(v)<3: continue
    sets=[];pal=[]
    for u in random.sample(v,3):
        try: h=baja(u)
        except Exception as e: print('fallo',u,file=sys.stderr); continue
        s,n=gram(texto(h)); sets.append(s); pal.append(n); time.sleep(.25)
    if len(sets)<3: continue
    datos[t]={'comun':set.intersection(*sets),'media':sum(len(s) for s in sets)/3,'pal':sum(pal)/3,'n':len(v)}
    print('medido',t,flush=True)
# El cromado del sitio: lo que comparten tipos que no tienen nada que ver.
chrome=set.intersection(*[d['comun'] for d in datos.values()])
out=[]
for t,d in datos.items():
    propio_neto = d['media'] - len(d['comun'])
    plantilla_tipo = len(d['comun']) - len(chrome)
    tot = d['media']
    out.append({'tipo':t,'n':d['n'],'palabras':round(d['pal']),
      'cromado_pct':round(len(chrome)/tot*100,1),
      'plantilla_pct':round(plantilla_tipo/tot*100,1),
      'propio_pct':round(propio_neto/tot*100,1),
      'palabras_propias':round(d['pal']*propio_neto/tot)})
out.sort(key=lambda x:x['propio_pct'])
print(f"\ncromado global: {len(chrome)} unidades\n")
print(f"{'tipo':<28}{'págs':>6}{'palabras':>9}{'cromado':>9}{'plantilla':>11}{'propio':>8}{'pal.propias':>12}")
for o in out:
    print(f"{o['tipo']:<28}{o['n']:>6}{o['palabras']:>9}{o['cromado_pct']:>8.1f}%{o['plantilla_pct']:>10.1f}%{o['propio_pct']:>7.1f}%{o['palabras_propias']:>12}")
json.dump(out, open('/tmp/auditoria2.json','w'), ensure_ascii=False, indent=1)
