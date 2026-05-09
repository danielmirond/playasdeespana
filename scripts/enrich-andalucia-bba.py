#!/usr/bin/env python3
"""Enriquece playas.json con las playas Bandera Azul Andalucía oficiales
del dataset de datos.gob.es (Junta de Andalucía).

Cubre las playas que ADEAC reconoce pero que no están en playas.json
(ej. en Adra: Censo, El Carboncillo, San Nicolás).

Para cada playa oficial:
- Si existe en playas.json (match por nombre+municipio) → bandera=true
- Si no existe → crea stub con coordenadas centroide del municipio
  (fallback razonable cuando no tenemos OSM exacto).
"""
import json
import re
import unicodedata
from pathlib import Path

PLAYAS_JSON = Path('/tmp/playasdeespana/public/data/playas.json')
ANDA_JSON   = Path('/tmp/and.json')


def slug(s):
    s = unicodedata.normalize('NFD', str(s).lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    s = re.sub(r'[^a-z0-9]+', '-', s)
    return s.strip('-')


def levenshtein(a, b):
    if a == b: return 0
    if not a: return len(b)
    if not b: return len(a)
    m = [[0] * (len(a)+1) for _ in range(len(b)+1)]
    for i in range(len(b)+1): m[i][0] = i
    for j in range(len(a)+1): m[0][j] = j
    for i in range(1, len(b)+1):
        for j in range(1, len(a)+1):
            m[i][j] = m[i-1][j-1] if a[j-1]==b[i-1] else 1 + min(m[i-1][j], m[i][j-1], m[i-1][j-1])
    return m[-1][-1]


def similarity(a, b):
    if a == b: return 1
    d = levenshtein(a, b)
    return 1 - d / max(len(a), len(b), 1)


playas = json.loads(PLAYAS_JSON.read_text())
anda   = json.loads(ANDA_JSON.read_text())

# Quedarse con la entrada más reciente por (Provincia, Municipio, Bandera azul)
latest = {}
for r in anda:
    if r.get('Categoría') != 'Playa': continue
    key = (r['Provincia'], r['Municipio'], r['Bandera azul'])
    year = str(r.get('Año') or '')
    if key not in latest or year > latest[key]:
        latest[key] = year
# Sólo nos interesan las que tengan año >= 2024 (vigentes)
vigentes = [{'provincia': k[0], 'municipio': k[1], 'playa': k[2], 'year': latest[k]}
            for k in latest if latest[k] >= '2024']

print(f'Playas Andalucía vigentes (≥2024): {len(vigentes)}')

# Index playas.json por (municipio_slug, playa_slug)
by_key = {}
by_municipio = {}
for p in playas:
    mun = p.get('municipio') or ''
    name = p.get('nombre') or ''
    by_key[(slug(mun), slug(name))] = p
    by_municipio.setdefault(slug(mun), []).append(p)

stats = {'matched': 0, 'added': 0, 'no_municipio': 0, 'updated_bandera': 0}

for v in vigentes:
    mun_slug = slug(v['municipio'])
    pla_slug = slug(v['playa'])

    # Match exacto por slug
    p = by_key.get((mun_slug, pla_slug))
    if not p:
        # Match aproximado por similitud dentro del municipio
        candidates = by_municipio.get(mun_slug, [])
        best, best_score = None, 0
        for c in candidates:
            s = similarity(slug(c['nombre']), pla_slug)
            if s > best_score: best_score, best = s, c
        if best and best_score >= 0.78:
            p = best
    if p:
        stats['matched'] += 1
        if p.get('bandera') is not True:
            p['bandera'] = True
            stats['updated_bandera'] += 1
        continue

    # Buscar centroide del municipio
    candidates = by_municipio.get(mun_slug, [])
    if not candidates:
        stats['no_municipio'] += 1
        continue

    avg_lat = sum(c['lat'] for c in candidates) / len(candidates)
    avg_lng = sum(c['lng'] for c in candidates) / len(candidates)
    sample = candidates[0]

    new_slug = f'{pla_slug}-{mun_slug}'
    # Asegurar slug único
    existing_slugs = {p['slug'] for p in playas}
    while new_slug in existing_slugs:
        new_slug = new_slug + '-2'

    new_playa = {
        'slug':        new_slug,
        'nombre':      v['playa'],
        'municipio':   v['municipio'],
        'provincia':   v['provincia'],
        'comunidad':   sample.get('comunidad', 'Andalucía'),
        'lat':         round(avg_lat, 6),
        'lng':         round(avg_lng, 6),
        'tipo':        'arena',
        'composicion': 'Arena',
        'socorrismo':  False,
        'duchas':      False,
        'accesible':   False,
        'parking':     False,
        'bandera':     True,
        'perros':      False,
        'nudista':     False,
        'osm_id':      None,
        'source':      'datos.gob.es-bba-andalucia',
        'actividades': {
            'surf': False, 'windsurf': False, 'kite': False,
            'snorkel': False, 'buceo': False, 'kayak': False, 'paddle': False,
        },
    }
    playas.append(new_playa)
    by_key[(mun_slug, pla_slug)] = new_playa
    by_municipio.setdefault(mun_slug, []).append(new_playa)
    stats['added'] += 1

# Save
PLAYAS_JSON.write_text(json.dumps(playas, ensure_ascii=False, indent=2))
print(f'\nResultado:')
for k, v in stats.items():
    print(f'  {k}: {v}')
print(f'\nplayas.json updated: {len(playas)} playas totales')
