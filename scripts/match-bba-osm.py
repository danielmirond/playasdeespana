#!/usr/bin/env python3
"""Empareja playas BBA stubs (coords centroide) con playas MITECO reales
usando OSM Nominatim para obtener coordenadas exactas, y luego cruza
por proximidad espacial.

Para cada playa con source='datos.gob.es-bba-andalucia':
  1. Pregunta a Nominatim: 'Playa de {nombre}, {municipio}, {provincia}'
  2. Si Nominatim devuelve coordenadas (≤5km del municipio):
     a. Busca playa MITECO existente ≤200m de esas coords
     b. Si hay match: la MITECO se marca bandera=true + alias del nombre
        BBA y se elimina el stub
     c. Si no hay match: actualiza el stub con coords OSM precisas
  3. Si Nominatim no encuentra: stub queda como está (coords centroide)

Resultado: deduplicación + coordenadas mejores.
"""
import json
import math
import re
import time
import unicodedata
import urllib.request
import urllib.parse
from pathlib import Path

PLAYAS_JSON = Path('/tmp/playasdeespana/public/data/playas.json')
RATE_LIMIT  = 0.3  # Photon es más permisivo
DUPE_RADIUS = 250  # metros para considerar misma playa
SEARCH_RADIUS = 6000  # metros desde centroide municipio

UA = 'playas-espana.com/1.0'


def haversine(a_lat, a_lng, b_lat, b_lng):
    """Distancia en metros entre dos puntos lat/lng."""
    R = 6_371_000
    dlat = math.radians(b_lat - a_lat)
    dlng = math.radians(b_lng - a_lng)
    h = (math.sin(dlat/2)**2 +
         math.cos(math.radians(a_lat)) * math.cos(math.radians(b_lat)) *
         math.sin(dlng/2)**2)
    return 2 * R * math.asin(math.sqrt(h))


def slug(s):
    s = unicodedata.normalize('NFD', str(s).lower())
    s = ''.join(c for c in s if unicodedata.category(c) != 'Mn')
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')


def photon_search(query, near_lat, near_lng):
    """Devuelve (lat, lng, name) usando Photon (OSM-based, sin rate limit duro)."""
    params = {
        'q':     query,
        'limit': '8',
        'lat':   str(near_lat),
        'lon':   str(near_lng),
    }
    url = 'https://photon.komoot.io/api/?' + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={'User-Agent': UA, 'Accept': 'application/json'})
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            data = json.loads(r.read().decode('utf-8'))
    except Exception as e:
        print(f'    Photon error: {e}')
        return None

    feats = data.get('features', [])
    best = None; best_dist = float('inf')
    for f in feats:
        coords = f.get('geometry', {}).get('coordinates') or []
        if len(coords) != 2: continue
        lng, lat = coords[0], coords[1]
        # Filtrar a tipo natural=beach o que tenga playa/cala en nombre
        props = f.get('properties', {})
        name = props.get('name', '') or ''
        osm_value = (props.get('osm_value') or '').lower()
        is_beach_like = (osm_value == 'beach' or
                         re.search(r'playa|cala|caleta|seaside|coast', name.lower()))
        d = haversine(near_lat, near_lng, lat, lng)
        if d > SEARCH_RADIUS: continue
        # Boost beaches over towns/streets
        score_dist = d if is_beach_like else d + 1000  # penaliza no-playas
        if score_dist < best_dist:
            best_dist, best = score_dist, (lat, lng, name)
    return best


def main():
    playas = json.loads(PLAYAS_JSON.read_text())

    stubs = [p for p in playas if p.get('source') == 'datos.gob.es-bba-andalucia']
    miteco = [p for p in playas if p.get('source') != 'datos.gob.es-bba-andalucia']

    print(f'Stubs Andalucía a procesar: {len(stubs)}')
    print(f'Catálogo principal (MITECO/OSM): {len(miteco)}')
    print()

    # Index MITECO por municipio para búsqueda rápida
    miteco_by_mun = {}
    for p in miteco:
        miteco_by_mun.setdefault(slug(p['municipio']), []).append(p)

    stats = {
        'osm_found': 0, 'merged_with_miteco': 0, 'updated_coords': 0,
        'no_osm_match': 0, 'errors': 0,
    }
    to_remove = set()  # slugs de stubs a eliminar tras merge
    aliases_added = []

    for i, stub in enumerate(stubs, 1):
        nombre = stub['nombre']
        municipio = stub['municipio']
        provincia = stub.get('provincia', '')
        query = f'Playa de {nombre}, {municipio}, {provincia}, España'
        print(f'[{i}/{len(stubs)}] {nombre} ({municipio}) ', end='', flush=True)

        coords = photon_search(query, stub['lat'], stub['lng'])
        time.sleep(RATE_LIMIT)
        if not coords:
            coords = photon_search(f'Playa {nombre} {municipio}', stub['lat'], stub['lng'])
            time.sleep(RATE_LIMIT)
        if not coords:
            coords = photon_search(f'{nombre} {municipio}', stub['lat'], stub['lng'])
            time.sleep(RATE_LIMIT)

        if not coords:
            print('→ no OSM match')
            stats['no_osm_match'] += 1
            continue

        osm_lat, osm_lng, _ = coords
        stats['osm_found'] += 1

        # Buscar MITECO playa cercana (≤DUPE_RADIUS)
        mun_candidates = miteco_by_mun.get(slug(municipio), []) + miteco_by_mun.get(slug(provincia), [])
        merge_target = None
        merge_dist = float('inf')
        for cand in mun_candidates:
            try:
                d = haversine(osm_lat, osm_lng, float(cand['lat']), float(cand['lng']))
            except (TypeError, ValueError):
                continue
            if d < merge_dist:
                merge_dist, merge_target = d, cand

        if merge_target and merge_dist <= DUPE_RADIUS:
            # Merge: marca MITECO con bandera=true y añade alias
            print(f'→ merge con "{merge_target["nombre"]}" ({merge_dist:.0f}m)')
            merge_target['bandera'] = True
            aliases = merge_target.setdefault('nombres_aka', [])
            if nombre not in aliases:
                aliases.append(nombre)
            to_remove.add(stub['slug'])
            stats['merged_with_miteco'] += 1
            aliases_added.append({
                'miteco_nombre': merge_target['nombre'],
                'miteco_slug':   merge_target['slug'],
                'bba_nombre':    nombre,
                'bba_municipio': municipio,
                'bba_stub_slug': stub['slug'],
                'distancia_m':   round(merge_dist, 0),
            })
        else:
            # Actualizar coords del stub con coords precisas OSM
            print(f'→ coords OSM ({osm_lat:.4f},{osm_lng:.4f})')
            stub['lat'] = round(osm_lat, 6)
            stub['lng'] = round(osm_lng, 6)
            stub['source'] = 'datos.gob.es-bba-andalucia+osm'
            stats['updated_coords'] += 1

    # Eliminar stubs mergeados
    if to_remove:
        playas = [p for p in playas if p['slug'] not in to_remove]

    PLAYAS_JSON.write_text(json.dumps(playas, ensure_ascii=False, indent=2))

    log_path = Path('/tmp/playasdeespana/scripts/data/bba-osm-aliases.json')
    log_path.write_text(json.dumps(aliases_added, ensure_ascii=False, indent=2))

    print()
    print('Resultado:')
    for k, v in stats.items():
        print(f'  {k:25s} {v}')
    print()
    print(f'playas.json: {len(playas)} totales (eliminadas {len(to_remove)} duplicadas)')
    print(f'Aliases añadidos: {log_path}')


if __name__ == '__main__':
    main()
