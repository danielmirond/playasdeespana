#!/usr/bin/env node
const fs   = require('fs')
const path = require('path')
const OUT_DIR = path.join(__dirname, '..', 'public', 'data')

fs.mkdirSync(OUT_DIR, { recursive: true })

const PLAYAS = [
  { id:'1',  slug:'ses-illetes-formentera',         nombre:'Ses Illetes',          municipio:'Formentera',      provincia:'Islas Baleares', comunidad:'Baleares',       lat:38.7189, lng:1.4028,   bandera:false, socorrismo:false, accesible:false, perros:false, duchas:false, parking:false },
  { id:'2',  slug:'la-concha-san-sebastian',        nombre:'La Concha',            municipio:'San Sebastián',   provincia:'Gipuzkoa',       comunidad:'País Vasco',     lat:43.3183, lng:-1.9812,  bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:false },
  { id:'3',  slug:'la-barceloneta-barcelona',       nombre:'La Barceloneta',       municipio:'Barcelona',       provincia:'Barcelona',      comunidad:'Cataluña',       lat:41.3780, lng:2.1912,   bandera:false, socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:false },
  { id:'4',  slug:'playa-de-tarifa-tarifa',         nombre:'Playa de Tarifa',      municipio:'Tarifa',          provincia:'Cádiz',          comunidad:'Andalucía',      lat:36.0143, lng:-5.6044,  bandera:false, socorrismo:true,  accesible:false, perros:false, duchas:false, parking:true  },
  { id:'5',  slug:'famara-teguise',                 nombre:'Famara',               municipio:'Teguise',         provincia:'Las Palmas',     comunidad:'Canarias',       lat:29.1220, lng:-13.5623, bandera:false, socorrismo:true,  accesible:false, perros:false, duchas:false, parking:true  },
  { id:'6',  slug:'bolonia-tarifa',                 nombre:'Bolonia',              municipio:'Tarifa',          provincia:'Cádiz',          comunidad:'Andalucía',      lat:36.0837, lng:-5.7536,  bandera:false, socorrismo:false, accesible:false, perros:true,  duchas:false, parking:true  },
  { id:'7',  slug:'la-zurriola-san-sebastian',      nombre:'La Zurriola',          municipio:'San Sebastián',   provincia:'Gipuzkoa',       comunidad:'País Vasco',     lat:43.3224, lng:-1.9743,  bandera:false, socorrismo:true,  accesible:false, perros:false, duchas:false, parking:false },
  { id:'8',  slug:'playa-de-muro-alcudia',          nombre:'Playa de Muro',        municipio:'Alcudia',         provincia:'Islas Baleares', comunidad:'Baleares',       lat:39.8693, lng:3.1257,   bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:true  },
  { id:'9',  slug:'playa-de-monsul-nijar',          nombre:'Playa de Mónsul',      municipio:'Níjar',           provincia:'Almería',        comunidad:'Andalucía',      lat:36.7234, lng:-2.0932,  bandera:false, socorrismo:false, accesible:false, perros:false, duchas:false, parking:true  },
  { id:'10', slug:'la-malvarrosa-valencia',         nombre:'La Malvarrosa',        municipio:'Valencia',        provincia:'Valencia',       comunidad:'C. Valenciana',  lat:39.4820, lng:-0.3263,  bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:false },
  { id:'11', slug:'playa-de-los-muertos-carboneras',nombre:'Playa de los Muertos', municipio:'Carboneras',      provincia:'Almería',        comunidad:'Andalucía',      lat:36.9891, lng:-1.8876,  bandera:false, socorrismo:false, accesible:false, perros:false, duchas:false, parking:true  },
  { id:'12', slug:'rodas-vigo',                     nombre:'Playa de Rodas',       municipio:'Vigo',            provincia:'Pontevedra',     comunidad:'Galicia',        lat:42.2344, lng:-8.8987,  bandera:true,  socorrismo:true,  accesible:false, perros:false, duchas:true,  parking:false },
  { id:'13', slug:'maspalomas-san-bartolome',       nombre:'Maspalomas',           municipio:'San Bartolomé',   provincia:'Las Palmas',     comunidad:'Canarias',       lat:27.7366, lng:-15.5862, bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:true  },
  { id:'14', slug:'cala-macarella-ciutadella',      nombre:'Cala Macarella',       municipio:'Ciutadella',      provincia:'Islas Baleares', comunidad:'Baleares',       lat:39.8944, lng:3.8123,   bandera:false, socorrismo:false, accesible:false, perros:false, duchas:false, parking:true  },
  { id:'15', slug:'riazor-a-coruna',                nombre:'Riazor',               municipio:'A Coruña',        provincia:'A Coruña',       comunidad:'Galicia',        lat:43.3712, lng:-8.4214,  bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:false },
  { id:'16', slug:'playa-de-san-juan-alicante',     nombre:'Playa de San Juan',    municipio:'Alicante',        provincia:'Alicante',       comunidad:'C. Valenciana',  lat:38.3712, lng:-0.4187,  bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:true  },
  { id:'17', slug:'burriana-nerja',                 nombre:'Burriana',             municipio:'Nerja',           provincia:'Málaga',         comunidad:'Andalucía',      lat:36.7412, lng:-3.8634,  bandera:true,  socorrismo:true,  accesible:false, perros:false, duchas:true,  parking:true  },
  { id:'18', slug:'laredo-laredo',                  nombre:'Laredo',               municipio:'Laredo',          provincia:'Cantabria',      comunidad:'Cantabria',      lat:43.4086, lng:-3.4098,  bandera:true,  socorrismo:true,  accesible:true,  perros:false, duchas:true,  parking:true  },
  { id:'19', slug:'cala-llonga-santa-eulalia',      nombre:'Cala Llonga',          municipio:'Santa Eulalia',   provincia:'Islas Baleares', comunidad:'Baleares',       lat:38.9123, lng:1.5687,   bandera:false, socorrismo:true,  accesible:false, perros:false, duchas:true,  parking:true  },
  { id:'20', slug:'cofete-pajara',                  nombre:'Cofete',               municipio:'Pájara',          provincia:'Las Palmas',     comunidad:'Canarias',       lat:28.0712, lng:-14.4198, bandera:false, socorrismo:false, accesible:false, perros:false, duchas:false, parking:true  },
]

fs.writeFileSync(path.join(OUT_DIR, 'playas.json'), JSON.stringify(PLAYAS, null, 2))
console.log('✓ playas.json → 20 playas')

const idx = {}
for (const p of PLAYAS) idx[p.slug] = p.id
fs.writeFileSync(path.join(OUT_DIR, 'slug-index.json'), JSON.stringify(idx))
console.log('✓ slug-index.json')

const coms = {}
for (const p of PLAYAS) coms[p.comunidad] = (coms[p.comunidad]||0)+1
fs.writeFileSync(path.join(OUT_DIR, 'comunidades.json'), JSON.stringify(coms, null, 2))
console.log('✓ comunidades.json')
