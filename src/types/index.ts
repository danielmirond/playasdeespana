export type EstadoBano = 'CALMA' | 'BUENA' | 'AVISO' | 'PELIGRO' | 'SURF' | 'VIENTO'

export interface Playa {
  id:           string
  slug:         string
  nombre:       string
  municipio:    string
  provincia:    string
  comunidad:    string
  lat:          number
  lng:          number
  longitud?:    number
  anchura?:     number
  composicion?: string
  tipo?:        string
  bandera?:     boolean
  socorrismo?:  boolean
  accesible?:   boolean
  perros?:      boolean
  duchas?:      boolean
  parking?:     boolean
  nudista?:     boolean
  aemetId?:     string
  aemetDist?:   number
  actividades?: {
    surf?:     boolean
    windsurf?: boolean
    kite?:     boolean
    snorkel?:  boolean
    buceo?:    boolean
    kayak?:    boolean
    paddle?:   boolean
  }
  spots_surf?:  string[]
  spots_buceo?: string[]
}

export interface DatosMeteo {
  tempAire:        number
  tempAgua:        number
  olas:            number
  viento:          number
  vientoRacha:     number
  vientoDireccion: string
  uv:              number
  estado:          EstadoBano
  amanecer?:       string
  atardecer?:      string
  actualizadoEn:   string
}

export interface DatosCalidad {
  nivel:      'Excelente' | 'Buena' | 'Suficiente' | 'Deficiente' | 'Sin datos'
  porcentaje: number
  temporada:  number
}

export interface OleajeHora {
  hora:   string
  metros: number
}

export interface Restaurante {
  id?:         string
  nombre:      string
  tipo:        string
  distancia_m: number
  distancia?:  number   // retrocompatibilidad
  precio:      string
  rating:      number
  reseñas?:    number
  horario?:    string
  foto?:       string | null
  resena?:     string | null
  website?:    string | null
  telefono?:   string | null
  lat?:        number
  lon?:        number
  googleId?:   string
  source?:     'google' | 'osm'
}

export interface Hotel {
  nombre:      string
  estrellas:   number
  distancia:   number
  rating:      number
  precioDesde: number
  bookingId?:  string
}

export interface Spot {
  id:       string
  nombre:   string
  tipo:     'surf' | 'windsurf' | 'kite' | 'snorkel' | 'buceo'
  lat:      number
  lng:      number
  nivel?:   string
  escuela?: boolean
  centro?:  boolean
  max_depth?: number
  info?:    string
}

export interface Comunidad {
  slug:   string
  nombre: string
  playas: number
  color:  string
}

export interface ApiMeteoResponse        { playa: string; meteo: DatosMeteo; oleaje: OleajeHora[] }
export interface ApiCalidadResponse      { playa: string; calidad: DatosCalidad }
export interface ApiRestaurantesResponse { playa: string; restaurantes: Restaurante[]; fuente: 'google' | 'osm' }
export interface ApiHotelesResponse      { playa: string; hoteles: Hotel[]; fuente: 'booking' | 'osm' }
