// lib/boat-rental-localities.ts
// Master data for all boat rental localities

export interface BoatRentalLocality {
  coast: string           // "Islas Baleares"
  province: string        // "Baleares"
  locality: string        // "Mallorca"
  slug: string           // "mallorca"
  samboatUrl: string     // "/alquiler-barco/mallorca"
  googleTrendsVolume: number
  description: string    // 1-2 sentence hook

  // Beaches/Calas accessible by boat
  beaches: Array<{
    name: string
    distance: string      // "5 min boat"
    type?: string        // "nudist", "family", "secret"
    description: string
  }>

  // Moorings/Fondeos
  moorings: Array<{
    name: string
    depth: number        // meters
    protection: 'high' | 'medium' | 'low'
    description: string
  }>

  // Pricing
  pricing: {
    small: { min: number; max: number }      // <5.5m
    medium: { min: number; max: number }     // 5.5-8m
    captain: { min: number; max: number }    // with captain
  }

  // Local regulations
  regulations: string[]

  // Best season
  bestSeason: string    // "Junio-Agosto"

  // Insider tip
  insiderTip: string

  // FAQ
  faq: Array<{
    question: string
    answer: string
  }>

  // Hero image from Unsplash
  images: {
    hero: {
      unsplashUrl: string
      alt: string
    }
  }
}

export const BOAT_RENTAL_LOCALITIES: Record<string, BoatRentalLocality> = {
  // ===== ISLAS BALEARES =====
  mallorca: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Mallorca',
    slug: 'mallorca',
    samboatUrl: '/alquiler-barco/mallorca',
    googleTrendsVolume: 77,
    description:
      'La mayor isla de Baleares: calas de agua turquesa, fondeos naturales y puertos en toda la costa. Alquila barco desde €120/día y navega de Cala Lliteres a Es Trenc.',

    beaches: [
      {
        name: 'Cala Mayor',
        distance: '10 min desde Palma',
        type: 'family',
        description: 'Playa urbana protegida, aguas calmadas, ideal para principiantes'
      },
      {
        name: 'Cala Millor',
        distance: '30 min desde Palma',
        description: 'Arena blanca, aguas turquesas, fondeo natural seguro'
      },
      {
        name: 'Calo des Moro',
        distance: '45 min desde Palma',
        type: 'secret',
        description: 'Cala secreta de película, acantilados, solo accesible en barco'
      },
      {
        name: 'Es Trenc',
        distance: '60 min desde Palma',
        description: 'Playa virgen del sur, dunas intactas, fondeos en arena'
      },
      {
        name: 'Sa Calobra',
        distance: '90 min desde Port de Sóller',
        description: 'Cañón marino espectacular, solo accesible en barco'
      }
    ],

    moorings: [
      {
        name: 'Cala Mayor',
        depth: 8,
        protection: 'high',
        description: 'Fondeadero principal Palma, arena, protección alta'
      },
      {
        name: 'Es Pontás',
        depth: 12,
        protection: 'medium',
        description: 'Roca característica, fondeo rocoso, vistas espectaculares'
      },
      {
        name: 'Cala Millor',
        depth: 10,
        protection: 'high',
        description: 'Fondeo seguro, arena, aguas calmadas'
      },
      {
        name: 'Calo des Moro',
        depth: 15,
        protection: 'medium',
        description: 'Fondeo en roca, profundidad variable, vistas de acantilado'
      }
    ],

    pricing: {
      small: { min: 120, max: 180 },
      medium: { min: 200, max: 350 },
      captain: { min: 280, max: 420 }
    },

    regulations: [
      'Posidonia: prohibido fondear sobre praderas en Baleares (Decreto 25/2018) — usa boyas o arena',
      'Pesca prohibida en reserva marina',
      'Temporada alta: Julio-Agosto (40% más caro)',
      'Depósito caución: €500-€1000 típico',
      'Equipo obligatorio: chalecos, botiquín, extintores'
    ],

    bestSeason: 'Junio-Septiembre (clima perfecto, aguas 24°C)',

    insiderTip:
      'Ruta secreta: Palma → Cala Mayor → Es Pontás → Calo des Moro → Sa Calobra (salida mañana, retorno atardecer). Evita julio-agosto mediodía (multitudes).',

    faq: [
      {
        question: '¿Edad mínima para alquilar sin licencia?',
        answer: '16 años en barcos <5.5m. Recomendamos 18+ para comodidad y seguridad.'
      },
      {
        question: '¿Qué fondeos son seguros sin licencia?',
        answer:
          'Cala Mayor, Cala Millor, Es Pontás. Evita aguas profundas (>20m) sin experiencia.'
      },
      {
        question: '¿Dormir a bordo está permitido?',
        answer: 'Sí, pero solo en fondeos autorizados. Calo des Moro es popular para dormir.'
      },
      {
        question: '¿Gasolina incluida?',
        answer: 'No. Combustible: ~€1.50/litro. Motor 150cv consume 15-20L/hora a crucero.'
      },
      {
        question: '¿Playas tranquilas en Mallorca?',
        answer: 'Calo des Moro, Sa Calobra, Es Trenc. Evita Magaluf, Palma Nova (turismo masivo).'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,mallorca,mediterranean,turquoise',
        alt: 'Barcos de vela anclados en Mallorca con aguas turquesas'
      }
    }
  },

  ibiza: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Ibiza',
    slug: 'ibiza',
    samboatUrl: '/alquiler-barco/ibiza',
    googleTrendsVolume: 71,
    description:
      'Es Vedrà, calas protegidas y atardeceres míticos. Alquila barco en Ibiza desde €150/día, con o sin licencia, y fondea en Cala Salada o Cala Conta.',

    beaches: [
      {
        name: 'Es Vedrà',
        distance: '20 min desde San Antonio',
        type: 'iconic',
        description: 'Roca icónica del mediterráneo, fondeo cercano, puesta de sol espectacular'
      },
      {
        name: 'Cala Salada',
        distance: '15 min desde San Antonio',
        description: 'Playa salvaje norte, aguas cristalinas, arena blanca'
      },
      {
        name: 'Cala Conta',
        distance: '10 min desde San Antonio',
        description: 'Playas múltiples conectadas, aguas turquesas, fondeos naturales'
      },
      {
        name: 'Cala Bassa',
        distance: '25 min desde Ibiza ciudad',
        type: 'family',
        description: 'Playa de arena, beach clubs, aguas calmadas'
      },
      {
        name: 'Cala Llonga',
        distance: '30 min desde Ibiza ciudad',
        type: 'nudist',
        description: 'Cala nudista, fondeo en arena, ambiente relajado'
      }
    ],

    moorings: [
      {
        name: 'Es Vedrà',
        depth: 20,
        protection: 'medium',
        description: 'Fondeo rocky, profundidad variable, vista de roca icónica'
      },
      {
        name: 'Cala Salada',
        depth: 10,
        protection: 'high',
        description: 'Arena fina, protección norte, ideal familia'
      },
      {
        name: 'Cala Conta',
        depth: 8,
        protection: 'high',
        description: 'Múltiples spots, aguas calmadas, ideal sin experiencia'
      },
      {
        name: 'Cala Bassa',
        depth: 12,
        protection: 'medium',
        description: 'Fondeo arenoso, fácil entrada, cerca de amenidades'
      }
    ],

    pricing: {
      small: { min: 150, max: 250 },
      medium: { min: 250, max: 450 },
      captain: { min: 320, max: 550 }
    },

    regulations: [
      'Posidonia prohibida: No fondear <60m profundidad en lechos de posidonia',
      'Club 54 enforcement: Zona norte protegida, no motos de agua',
      'Temporada: Mayo-octubre (invierno cierra varios fondeos)',
      'Equipo: obligatorio salvavidas, botiquín, señales',
      'Edad mínima: 16 años sin licencia (18+ recomendado)'
    ],

    bestSeason: 'Mayo-Septiembre (agua 22-26°C, viento ligero norte)',

    insiderTip:
      'Sunset route: San Antonio → Cala Conta (4pm) → Es Vedrà (6:30pm puesta) → Cala Salada (noche). Evita sábados noche (superyates de clubes).',

    faq: [
      {
        question: '¿Fondeos nudistas en Ibiza?',
        answer: 'Cala Llonga y Cala Xarraca (este). Ambas son fondeos relajados, aceptados socialmente.'
      },
      {
        question: '¿Es seguro fondear sin licencia en Es Vedrà?',
        answer:
          'Sí, pero solo marineros. Fondeo rocky, profundidad 15-25m, necesitas ancla segura.'
      },
      {
        question: '¿Mejor época para playas tranquilas?',
        answer: 'Mayo, junio, septiembre. Julio-agosto: multitudes en Cala Conta.'
      },
      {
        question: '¿Pesca permitida?',
        answer: 'Limitada. Fondeos protegidos sin pesca comercial. Pesca recreativa con moderación.'
      },
      {
        question: '¿Hay anclas disponibles?',
        answer: 'Lleva 2 anclas (Danforth + rocas). Fondo arenoso-rocoso variable.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?yacht,ibiza,turquoise,beach',
        alt: 'Yate de lujo frente a las playas de Ibiza'
      }
    }
  },

  menorca: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Menorca',
    slug: 'menorca',
    samboatUrl: '/alquiler-barco/menorca',
    googleTrendsVolume: 87,
    description:
      'Reserva de la Biosfera con las calas más vírgenes de Baleares. Alquila barco desde €110/día y fondea en Cala Galdana, Son Bou o Macarella.',

    beaches: [
      {
        name: 'Cala Galdana',
        distance: '30 min desde Mahón',
        type: 'family',
        description: 'Playa de arena blanca, 500m, aguas turquesas, fondeo natural'
      },
      {
        name: 'Son Bou',
        distance: '25 min desde Mahón',
        description: 'Segunda playa más larga, aguas calmadas, fondeo rocoso'
      },
      {
        name: 'Fornells',
        distance: '20 min desde Mahón',
        description: 'Pueblo costero tranquilo, puerto seguro, caldereta de langosta'
      },
      {
        name: 'Cala Mitjana',
        distance: '35 min desde Mahón',
        type: 'secret',
        description: 'Cala salvaje, solo accesible en barco o senderismo, fondeo natural'
      },
      {
        name: 'Cavalleria',
        distance: '40 min norte',
        description: 'Faro rojo-blanco icónico, fondeo expuesto norte'
      }
    ],

    moorings: [
      {
        name: 'Cala Galdana',
        depth: 8,
        protection: 'high',
        description: 'Arena fina, protección sur, ideal familia'
      },
      {
        name: 'Son Bou',
        depth: 12,
        protection: 'medium',
        description: 'Rocas dispersas, fondeo robusto, poco crowded'
      },
      {
        name: 'Fornells',
        depth: 6,
        protection: 'high',
        description: 'Puerto tranquilo, entrada fácil, protección total'
      },
      {
        name: 'Cala Mitjana',
        depth: 15,
        protection: 'medium',
        description: 'Fondeo rocoso, vistas de acantilado, poco turismo'
      }
    ],

    pricing: {
      small: { min: 110, max: 170 },
      medium: { min: 180, max: 320 },
      captain: { min: 250, max: 400 }
    },

    regulations: [
      'UNESCO Biosphere: No motos de agua en fondeos',
      'Pesca: Muy limitada en calas protegidas',
      'Cavalleria: Expuesto a norte, evitar con Tramontana',
      'Fornells: Puerto con amarre, tasas portuarias €10-15/noche',
      'Equipo: Obligatorio en todas las calas'
    ],

    bestSeason: 'Mayo-Octubre (agua 20-25°C, vientos predecibles)',

    insiderTip:
      'Ruta este (evita turismo): Mahón → Fornells (caldereta) → Cavalleria (faro) → Cala Mitjana (secreto) → retorno. Tramontana: evitar norte 24h.',

    faq: [
      {
        question: '¿Menorca es más tranquila que Mallorca?',
        answer: 'Sí. UNESCO protection mantiene desarrollo limitado. Fondeos menos crowded, ideales principiantes.'
      },
      {
        question: '¿Dónde comer bien a bordo?',
        answer:
          'Fornells: caldereta de langosta (especialidad). Restaurantes puerto. Llevar provisiones (compras en Mahón).'
      },
      {
        question: '¿Riesgo de Tramontana?',
        answer:
          'Viento norte fuerte, llega sin aviso. Monitoreá partes. Si viene: busca Sur (Cala Galdana), evita norte 48h.'
      },
      {
        question: '¿Fondeos nudistas?',
        answer: 'Cala Mitjana (de facto). Ambiente respetado, pocos nudistas, libertad de elección.'
      },
      {
        question: '¿Sin licencia es suficiente?',
        answer: 'Sí para barcos <5.5m. Aguas predecibles, fondeos seguros. Recomendamos 18+ experiencia marina.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?boat,menorca,anchorage,mediterranean',
        alt: 'Barco anclado en una cala protegida de Menorca'
      }
    }
  },

  barcelona: {
    coast: 'Costa de Barcelona',
    province: 'Barcelona',
    locality: 'Barcelona',
    slug: 'barcelona',
    samboatUrl: '/alquiler-barco/barcelona',
    googleTrendsVolume: 51,
    description:
      'Alquila barco en Barcelona desde €100/día: salidas del Port Olímpic y el Port Vell, costa del Garraf y escapadas a Sitges y Castelldefels.',

    beaches: [
      {
        name: 'Barceloneta',
        distance: '0 min centro ciudad',
        type: 'urban',
        description: 'Playa urbana, paseo marítimo, salida desde Puerto Vell'
      },
      {
        name: 'Montjuïc',
        distance: '5 min oeste',
        description: 'Vistas de castillo, fondeo urbano, museos visible'
      },
      {
        name: 'Sitges',
        distance: '30 min sur',
        description: 'Pueblo costero pintoresco, arquitectura modernista, playas tranquilas'
      },
      {
        name: 'Castelldefels',
        distance: '25 min sur',
        description: 'Playa larga dorada, castillo en acantilado, fondeo robusto'
      },
      {
        name: 'Garraf',
        distance: '40 min sur',
        type: 'secret',
        description: 'Calas naturales protegidas, acantilados, poco turismo'
      }
    ],

    moorings: [
      {
        name: 'Port Vell',
        depth: 8,
        protection: 'high',
        description: 'Puerto protegido, amarre pagado, fácil logística'
      },
      {
        name: 'Montjuïc',
        depth: 10,
        protection: 'medium',
        description: 'Fondeo rocoso, vistas de ciudad, poco espacio'
      },
      {
        name: 'Sitges',
        depth: 9,
        protection: 'high',
        description: 'Fondeo arenoso, protegido sur, tranquilo'
      },
      {
        name: 'Castelldefels',
        depth: 12,
        protection: 'medium',
        description: 'Fondeo rocoso, protección variable, castillo vistas'
      }
    ],

    pricing: {
      small: { min: 100, max: 180 },
      medium: { min: 180, max: 320 },
      captain: { min: 240, max: 400 }
    },

    regulations: [
      'Port Vell: Zona de tráfico intenso, vigilancia guardacostas',
      'Velocidad: Máx 3 nudos en puerto, 5 en costa urbana',
      'Motos agua: Prohibidas zona urbana (0-100m)',
      'Pesca: Solo recreativa, sin comercial',
      'Temporada: Todo el año, pero mejor mayo-octubre'
    ],

    bestSeason: 'Mayo-Septiembre (agua 19-24°C, vientos ligeros)',

    insiderTip:
      'Urbano + rural: Mañana Puerto Vell → Montjuïc (Museos MNAC visible) → tarde Sitges (arquitectura) → Garraf (calas secretas) → retorno atardecer.',

    faq: [
      {
        question: '¿Tráfico marítimo intenso?',
        answer: 'Sí. Puerto Vell es busy. Mejor mañana temprano o madrugada. Radar/AIS recomendado.'
      },
      {
        question: '¿Dónde comer en barco?',
        answer:
          'Sitges: restaurantes playa excelentes. Provision en Port Vell supermarkets. Chiringuitos Castelldefels.'
      },
      {
        question: '¿Seguro sin licencia?',
        answer: 'Sí si evitas puerto comercial. Fondeos Sitges/Castelldefels son tranquilos, ideales principiantes.'
      },
      {
        question: '¿WiFi/electricidad?',
        answer: 'Port Vell: sí (pagado amarre). Fondeos naturales: no.'
      },
      {
        question: '¿Ver arquitectura Gaudí desde barco?',
        answer: 'No directo. Sagrada Familia/Batllo no visible desde costa. Mejor visita terrestre.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?catamaran,barcelona,mediterranean,sailing',
        alt: 'Catamarán navegando en la costa de Barcelona'
      }
    }
  },

  alicante: {
    coast: 'Costa Blanca',
    province: 'Alicante',
    locality: 'Alicante',
    slug: 'alicante',
    samboatUrl: '/alquiler-barco/alicante',
    googleTrendsVolume: 25,
    description:
      'Puerta sur de la Costa Blanca: la isla de Tabarca, calas de roca y puertos deportivos con recogida fácil. Alquila barco desde €100/día.',

    beaches: [
      {
        name: 'Isla de Tabarca',
        distance: '20 min isla protegida',
        type: 'protected',
        description: 'Isla deshabitada, reserva marina, fondeos múltiples'
      },
      {
        name: 'Playa del Postiguet',
        distance: '0 min ciudad',
        description: 'Playa urbana, castillo de Santa Bárbara vista, logística fácil'
      },
      {
        name: 'Cala de Finestrat',
        distance: '20 min norte',
        description: 'Cala rocosa, Penyal d\'Ifach icónico (Calpe), fondeo natural'
      },
      {
        name: 'Jávea (Xàbia)',
        distance: '30 min norte',
        description: 'Pueblo marinero, 3 playas, calas escondidas, vino local'
      },
      {
        name: 'Denia',
        distance: '40 min norte',
        description: 'Puerto histórico, castillo, salida a Columbretes'
      }
    ],

    moorings: [
      {
        name: 'Tabarca',
        depth: 10,
        protection: 'high',
        description: 'Múltiples spots, arena/roca, reserva protegida'
      },
      {
        name: 'Postiguet',
        depth: 8,
        protection: 'high',
        description: 'Puerto urbano, amarre fácil, casco histórico acceso'
      },
      {
        name: 'Finestrat',
        depth: 12,
        protection: 'medium',
        description: 'Rocas, Penyal vista espectacular, poco crowded'
      },
      {
        name: 'Jávea',
        depth: 9,
        protection: 'high',
        description: 'Puerto tranquilo, 3 playas protegidas, ambiente bohemio'
      }
    ],

    pricing: {
      small: { min: 100, max: 160 },
      medium: { min: 160, max: 280 },
      captain: { min: 220, max: 360 }
    },

    regulations: [
      'Tabarca: Reserva Marina, protección total, no pesca, no motos agua',
      'Penyal Ifach: Parque Natural, no fondeo <100m distancia',
      'Jávea: Puerto pequeño, amarre limitado, reserva con antelación',
      'Denia: Puerto activo, tráfico comercial, evitar horas punta',
      'Equipo obligatorio en todas las calas'
    ],

    bestSeason: 'Mayo-Octubre (agua 20-26°C, Levante vientos ligeros)',

    insiderTip:
      'Costa Blanca secret: Alicante → Tabarca (snorkel/pesca foto) → Finestrat (Penyal foto) → Jávea (comida vino) → Denia opcional. Levante viento: monitorea, cierra rapido.',

    faq: [
      {
        question: '¿Tabarca merece el viaje?',
        answer:
          'Sí. Isla deshabitada, reserva marina intacta, snorkel extraordinario, fondeos seguros.'
      },
      {
        question: '¿Sin licencia es suficiente?',
        answer: 'Sí. Costa Blanca fondeos son calmados, ideales principiantes, protegidos.'
      },
      {
        question: '¿Levante viento es peligroso?',
        answer:
          'Puede ser. Viene del este, rápido, sin aviso. Monitor partes, busca amarre. Pasa usualmente 12-24h.'
      },
      {
        question: '¿Denia vale pena vs Alicante?',
        answer: 'Sí si tienes tiempo. Columbretes (isla remota) salida desde Denia. +2h comparado a Alicante.'
      },
      {
        question: '¿Vino local a bordo?',
        answer: 'Jávea/Denia: vinos DO Alicante. Compra en puerto, disfruta fondeado.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,alicante,mediterranean,coast',
        alt: 'Barco de vela frente a la costa de Alicante'
      }
    }
  },

  // ===== COSTA BLANCA: VALENCIA =====
  valencia: {
    coast: 'Costa de Valencia',
    province: 'Valencia',
    locality: 'Valencia',
    slug: 'valencia',
    samboatUrl: '/alquiler-barco/valencia',
    googleTrendsVolume: 35,
    description:
      'Salida desde la Marina de València: playas urbanas, la costa de la Albufera y jornadas de vela frente a la ciudad. Alquila barco desde €95/día.',

    beaches: [
      {
        name: 'Playa de la Malvarrosa',
        distance: '15 min desde puerto',
        type: 'urban',
        description: 'Playa urbana principal, aguas calmadas, fácil acceso'
      },
      {
        name: 'Isla de Cullera',
        distance: '30 min desde Valencia',
        description: 'Isla rocosa con fondeo natural, vistas panorámicas'
      },
      {
        name: 'Punta del Saler',
        distance: '40 min desde Valencia',
        type: 'natural',
        description: 'Zona de humedales protegida, fauna marina especial'
      },
      {
        name: 'Playa Ampolla',
        distance: '45 min sur',
        description: 'Cala arenosa tranquila, ideal familias'
      },
      {
        name: 'Isla Brava',
        distance: '50 min sur',
        type: 'snorkel',
        description: 'Islote rocoso, excelente snorkel y buceo'
      }
    ],

    moorings: [
      {
        name: 'Puerto de Valencia',
        depth: 6,
        protection: 'high',
        description: 'Fondeadero principal, marina con servicios'
      },
      {
        name: 'Cullera Bay',
        depth: 12,
        protection: 'high',
        description: 'Bahía protegida, fondeo en arena'
      },
      {
        name: 'Saler Lagoon',
        depth: 3,
        protection: 'high',
        description: 'Laguna tranquila, ideal para principiantes'
      },
      {
        name: 'Isla Brava Mooring',
        depth: 14,
        protection: 'medium',
        description: 'Fondeo rocoso, vistas espectaculares'
      }
    ],

    pricing: {
      small: { min: 95, max: 160 },
      medium: { min: 180, max: 320 },
      captain: { min: 240, max: 400 }
    },

    regulations: [
      'Zona húmeda protegida: Respetar distancias a fauna',
      'Fondeo prohibido en lagunas principales (Albufera)',
      'Marina obligatoria en puerto de Valencia',
      'Temporada: Todo el año (clima suave)',
      'Equipo: chaleco salvavidas, botiquín, GPS recomendado'
    ],

    bestSeason: 'Marzo-Junio y Septiembre-Octubre (clima 18-22°C)',

    insiderTip:
      'Combinación perfecta: mañana en Albufera (lagoon tranquila) + tarde en Isla Brava (snorkel). Cena de arròs en puerto.',

    faq: [
      {
        question: '¿Qué diferencia hay entre Valencia y Alicante?',
        answer: 'Valencia: zona húmeda protegida, aguas tranquilas. Alicante: calas rocosas, islas remotas. Valencia = familias, Alicante = aventura.'
      },
      {
        question: '¿Se puede fondear en la Albufera?',
        answer: 'Solo en zonas designadas. Marina recomienda Saler Lagoon o puerto. Albufera es zona natural protegida.'
      },
      {
        question: '¿Mejor que Jávea/Denia?',
        answer: 'Si prefieres playa urbana + servicios: Valencia. Si prefieres calas remotas: Jávea/Denia (30min norte).'
      },
      {
        question: '¿Paella a bordo?',
        answer: 'Sí! Compra ingredientes en puerto, prepara a bordo en lagoon tranquila. Máxima experiencia Valencia.'
      },
      {
        question: '¿Fauna marina?',
        answer: 'Delfines ocasionales en aguas abiertas. Flamencos en lagoon. Erizos y peces en Isla Brava.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?boat,valencia,beach,mediterranean',
        alt: 'Barco en las aguas de Valencia'
      }
    }
  },

  // ===== MALLORCA: SUB-LOCALIDADES =====
  palma: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Palma',
    slug: 'palma',
    samboatUrl: '/alquiler-barco/mallorca/palma',
    googleTrendsVolume: 35,
    description:
      'La bahía de Palma es el gran puerto náutico de Baleares: recogida fácil, calas urbanas y la costa suroeste a un paso. Barcos desde €115/día.',

    beaches: [
      {
        name: 'Playa del Puerto',
        distance: '2 min desde puerto',
        type: 'urban',
        description: 'Playa urbana junto catedral, servicios cercanos'
      },
      {
        name: 'Cala Mayor',
        distance: '5 min desde puerto',
        description: 'Cala protegida, fondeo fácil, servicios'
      },
      {
        name: 'Paseo Marítimo',
        distance: '10 min desde puerto',
        type: 'scenic',
        description: 'Navegación pintoresca, fondeo urbano'
      },
      {
        name: 'Isla Tafona',
        distance: '30 min oeste',
        description: 'Islote rocoso, snorkel de nivel'
      },
      {
        name: 'Cala Estancia',
        distance: '40 min sur',
        description: 'Cala pequeña tranquila, fondeo natural'
      }
    ],

    moorings: [
      {
        name: 'Puerto Palma',
        depth: 8,
        protection: 'high',
        description: 'Marina principal, servicios premium'
      },
      {
        name: 'Cala Mayor',
        depth: 9,
        protection: 'high',
        description: 'Fondeadero seguro, arena'
      },
      {
        name: 'Isla Tafona',
        depth: 14,
        protection: 'medium',
        description: 'Fondeo rocoso, vistas espectaculares'
      },
      {
        name: 'Cala Estancia',
        depth: 11,
        protection: 'high',
        description: 'Arena fina, protección excelente'
      }
    ],

    pricing: {
      small: { min: 115, max: 185 },
      medium: { min: 205, max: 360 },
      captain: { min: 290, max: 440 }
    },

    regulations: [
      'Tráfico portuario alto',
      'Zona histórica: Catedral Mallorca (área protegida)',
      'Marina obligatoria (servicios incluidos)',
      'Temporada: Todo el año',
      'Equipo: GPS, comunicaciones, protocolo puerto'
    ],

    bestSeason: 'Abril-Junio y Septiembre-Octubre',

    insiderTip:
      'Base perfecta: Duerme en puerto Palma, explora calas día. Catedral al atardecer desde barco = mágico.',

    faq: [
      {
        question: '¿Base mejor que otras playas Mallorca?',
        answer: 'Sí si quieres ciudad. Servicios premium, restaurantes. Pero más caro. Otras playas más tranquilas pero menos infraestructura.'
      },
      {
        question: '¿Fondeo en ciudad?',
        answer: 'Marina con servicios. Fondeo libre solo en calas cercanas. Puerto obligatorio = caro pero seguro.'
      },
      {
        question: '¿Catedral desde barco?',
        answer: 'Espectacular vista nocturna. Iluminada al atardecer. Fondo catedral desde Cala Mayor o puerto.'
      },
      {
        question: '¿Alternativa con fondeo libre?',
        answer: 'Cala Mayor o Cala Estancia. Fondeo libre pero lejos servicios. 20min a restaurantes.'
      },
      {
        question: '¿Es muy turístico?',
        answer: 'Sí. Pero mañana temprano = soledad. Tarde = turismo. Navega temprano, regresa 18h.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,palma,harbor,mediterranean',
        alt: 'Barcos de vela en el puerto de Palma'
      }
    }
  },

  alcudia: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Alcúdia',
    slug: 'alcudia',
    samboatUrl: '/alquiler-barco/mallorca/alcudia',
    googleTrendsVolume: 28,
    description:
      'La gran bahía protegida del norte de Mallorca: aguas someras, fondeos seguros y ambiente familiar. Alquila barco desde €110/día.',

    beaches: [
      {
        name: 'Playa de Alcúdia',
        distance: '5 min desde puerto',
        type: 'family',
        description: 'Playa principal de arena, aguas calmadas'
      },
      {
        name: 'Playa Can Picafort',
        distance: '10 min este',
        description: 'Playa ancha de arena, ideal familia'
      },
      {
        name: 'Reserva Marina Peninsular',
        distance: '20 min norte',
        type: 'snorkel',
        description: 'Área protegida, fauna marina especial'
      },
      {
        name: 'Cala Sant Vicenç',
        distance: '25 min norte',
        description: 'Cala de pinares, fondeo natural hermoso'
      },
      {
        name: 'Punta Avellana',
        distance: '30 min este',
        type: 'scenic',
        description: 'Acantilado rocoso, vistas norte'
      }
    ],

    moorings: [
      {
        name: 'Puerto Alcúdia',
        depth: 7,
        protection: 'high',
        description: 'Marina principal, servicios familia'
      },
      {
        name: 'Bahía Alcúdia',
        depth: 6,
        protection: 'high',
        description: 'Fondeo libre en arena, muy protegido'
      },
      {
        name: 'Cala Sant Vicenç',
        depth: 10,
        protection: 'high',
        description: 'Arena fina, pinares protectores'
      },
      {
        name: 'Punta Avellana',
        depth: 12,
        protection: 'medium',
        description: 'Fondeo rocoso, vistas norte Mallorca'
      }
    ],

    pricing: {
      small: { min: 110, max: 170 },
      medium: { min: 190, max: 320 },
      captain: { min: 260, max: 410 }
    },

    regulations: [
      'Reserva Marina Peninsular: Fondeo restringido <30m',
      'Zona familia protegida: No motos agua en bahía',
      'Pesca vedada en reserva',
      'Temporada: Todo el año, mejor mayo-octubre',
      'Equipo: GPS recomendado, chaleco obligatorio'
    ],

    bestSeason: 'Mayo-Octubre (aguas 18-23°C)',

    insiderTip:
      'Paraíso familiar: Bahía Alcúdia súper protegida para niños. Snorkel en Reserva Marina (peces abundantes). Atardecer en pinares.',

    faq: [
      {
        question: '¿Mejor para familia que Palma?',
        answer: 'Sí. Playas más tranquilas, bahía muy protegida, menos tráfico. Perfecto niños 0-12.'
      },
      {
        question: '¿Fondeo libre en bahía?',
        answer: 'Sí, excelente. Arena fina, sin corrientes. Marina también disponible si necesitas servicios.'
      },
      {
        question: '¿Snorkel en Reserva Marina?',
        answer: 'Sí, excelente. Peces abundantes, corales. Respetar zona <30m. Guía local recomendado.'
      },
      {
        question: '¿Clima invierno?',
        answer: 'Diciembre-Febrero: 10-15°C, algunos fondeos cierran. Mejor febrero+. Noviembre-marzo: viento Tramontana.'
      },
      {
        question: '¿Es muy turístico?',
        answer: 'Menor que Palma. Pero junio-agosto lleno. Abril-mayo y septiembre mejores para tranquilidad.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?boat,alcudia,beach,turquoise',
        alt: 'Barco en la playa de Alcudia'
      }
    }
  },

  pollenca: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Pollença',
    slug: 'pollenca',
    samboatUrl: '/alquiler-barco/mallorca/pollenca',
    googleTrendsVolume: 22,
    description:
      'Bahía semicerrada al pie de la Tramuntana: fondeo resguardado, calas de pinar y poco bullicio. Alquila barco desde €105/día.',

    beaches: [
      {
        name: 'Playa de Pollença',
        distance: '3 min desde puerto',
        type: 'quiet',
        description: 'Playa semicerrada, muy tranquila'
      },
      {
        name: 'Cala de Molins',
        distance: '10 min sur',
        description: 'Cala rocosa pequeña, snorkel bueno'
      },
      {
        name: 'Cala Bóquer',
        distance: '15 min norte',
        type: 'scenic',
        description: 'Cala aislada, camino a pie desde tierra'
      },
      {
        name: 'Formentor',
        distance: '20 min norte',
        type: 'iconic',
        description: 'Faro histórico, acantilados espectaculares'
      },
      {
        name: 'Illa de Colomer',
        distance: '25 min norte',
        description: 'Islote rocoso, snorkel experto'
      }
    ],

    moorings: [
      {
        name: 'Puerto Pollença',
        depth: 6,
        protection: 'high',
        description: 'Puerto pequeño tranquilo, servicios básicos'
      },
      {
        name: 'Bahía Pollença',
        depth: 5,
        protection: 'high',
        description: 'Fondeo libre arena, ultra protegido'
      },
      {
        name: 'Cala Molins',
        depth: 9,
        protection: 'high',
        description: 'Fondeo rocoso, peces abundantes'
      },
      {
        name: 'Formentor Bay',
        depth: 15,
        protection: 'medium',
        description: 'Fondeo profundo, corriente norte ocasional'
      }
    ],

    pricing: {
      small: { min: 105, max: 160 },
      medium: { min: 170, max: 300 },
      captain: { min: 240, max: 390 }
    },

    regulations: [
      'Bahía semicerrada: Entrada única permitida',
      'Fondeo solo en zona designada (muy pequeña)',
      'Sin motos agua',
      'Pesca vedada',
      'Temporada: Mayo-octubre ideal, resto limitado'
    ],

    bestSeason: 'Mayo-Octubre (tranquilidad máxima)',

    insiderTip:
      'Secreto Mallorca: Bahía Pollença es la más TRANQUILA de España. Fondea en bahía, camina a Formentor. Silencio total. Meditación en barco.',

    faq: [
      {
        question: '¿Por qué tan poco turismo?',
        answer: 'Bahía pequeña, entrada única, fondeo limitado. Menos barcos = menos gente. Ventaja nuestra!'
      },
      {
        question: '¿Fondeo libre seguro?',
        answer: 'Muy seguro. Bahía semicerrada, protección 360°. Una de las más seguras Baleares.'
      },
      {
        question: '¿Llego a Formentor?',
        answer: 'A pie por sendero 2h ida/vuelta. En barco: navegas alrededor, no desembarco. Faro espectacular desde mar.'
      },
      {
        question: '¿Es muy caro?',
        answer: 'No, más barato que Palma/Alcúdia. Menos infraestructura = menos costo.'
      },
      {
        question: '¿Mejor para retiro/meditación?',
        answer: 'Sí. Silencio total, naturaleza pura. Perfecto desconexión. Lleva provisiones (tiendas lejanas).'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,pollenca,cove,mediterranean',
        alt: 'Barcos en la ensenada de Pollença'
      }
    }
  },

  // ===== COSTA BRAVA: SUB-LOCALIDADES =====
  tossa: {
    coast: 'Costa Brava',
    province: 'Girona',
    locality: 'Tossa de Mar',
    slug: 'tossa-de-mar',
    samboatUrl: '/alquiler-barco/tossa-de-mar',
    googleTrendsVolume: 32,
    description:
      'La única villa amurallada frente al mar de la Costa Brava: calas de pinar y fondeos a pie de castillo. Alquila barco desde €120/día.',

    beaches: [
      {
        name: 'Playa Mayor Tossa',
        distance: '2 min desde puerto',
        type: 'scenic',
        description: 'Playa junto muralla medieval'
      },
      {
        name: 'Cala Fustera',
        distance: '10 min sur',
        description: 'Cala pequeña de arenas, pinares'
      },
      {
        name: 'Platja d\'Or',
        distance: '15 min sur',
        type: 'exclusive',
        description: 'Cala dorada privada, snorkel bueno'
      },
      {
        name: 'Cala Giverola',
        distance: '25 min sur',
        description: 'Cala virgen, fondeo natural'
      },
      {
        name: 'Punta Llevant',
        distance: '30 min norte',
        type: 'scenic',
        description: 'Punta rocosa norte, vistas espectaculares'
      }
    ],

    moorings: [
      {
        name: 'Puerto Tossa',
        depth: 7,
        protection: 'high',
        description: 'Puerto pequeño pintoresco'
      },
      {
        name: 'Cala Fustera',
        depth: 10,
        protection: 'high',
        description: 'Arena fina, fondeo excelente'
      },
      {
        name: 'Platja d\'Or',
        depth: 12,
        protection: 'high',
        description: 'Fondeo arena, muy protegido'
      },
      {
        name: 'Cala Giverola',
        depth: 11,
        protection: 'high',
        description: 'Fondeo virgen, pinares alrededor'
      }
    ],

    pricing: {
      small: { min: 120, max: 190 },
      medium: { min: 200, max: 370 },
      captain: { min: 280, max: 460 }
    },

    regulations: [
      'Zona histórica: Muralla medieval protegida',
      'AMP: Fondeo <40m restringido',
      'Pesca vedada',
      'Temporada: Mayo-octubre ideal',
      'Equipo: GPS, comunicaciones, chaleco obligatorio'
    ],

    bestSeason: 'Junio-Septiembre (clima perfecto)',

    insiderTip:
      'Belleza medieval: Duerme en puerto Tossa, muralla iluminada de noche. Navega mañana a Cala Giverola, snorkel, regresa atardecer. Cena en pueblo amurallado.',

    faq: [
      {
        question: '¿Muralla observable desde barco?',
        answer: 'Espectacular. Iluminada noche. Fondea cerca, nada historias de Tossa (piratas medievales).'
      },
      {
        question: '¿Mejor Tossa vs Lloret?',
        answer: 'Tossa: pueblo histórico, fondeos seguros, menos multitud. Lloret: calas remotas, snorkel mejor.'
      },
      {
        question: '¿Snorkel en calas?',
        answer: 'Bueno en Platja d\'Or y Cala Giverola. No espectacular como Lloret pero muy lindo.'
      },
      {
        question: '¿Turismo en temporada?',
        answer: 'Sí, junio-agosto lleno. Pero pueblo bonito pese a ello. Mayo y septiembre ideales.'
      },
      {
        question: '¿Presupuesto recomendado?',
        answer: 'Pequeño barco <5.5m: €120-190/día. Suficiente para calas. Patrón si no tienes experiencia.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,tossa,cove,mediterranean',
        alt: 'Barco de vela en Tossa de Mar'
      }
    }
  },

  // ===== COSTA BRAVA: HUB =====
  'costa-brava': {
    coast: 'Costa Brava',
    province: 'Girona',
    locality: 'Costa Brava',
    slug: 'costa-brava',
    samboatUrl: '/alquiler-barco/costa-brava',
    googleTrendsVolume: 45,
    description:
      'De Blanes a Cadaqués: acantilados, calas remotas y la mejor agua para snorkel del Mediterráneo catalán. Alquila barco desde €100/día.',

    beaches: [
      {
        name: 'Múltiples calas',
        distance: 'Variable por localidad',
        type: 'scenic',
        description: 'Cientos de playas vírgenes accesibles solo en barco'
      },
      {
        name: 'Punta Brava',
        distance: '20-60 min según base',
        type: 'snorkel',
        description: 'Snorkel clase mundial en toda la costa'
      },
      {
        name: 'Acantilados norte',
        distance: '40-80 min Lloret base',
        type: 'scenic',
        description: 'Formaciones géologicas espectaculares'
      },
      {
        name: 'Islas off-shore',
        distance: '60-120 min',
        type: 'adventure',
        description: 'Islas remotas, snorkel experto'
      },
      {
        name: 'Calas pinares',
        distance: '30-50 min',
        type: 'scenic',
        description: 'Pinares descienden a agua, paraíso'
      }
    ],

    moorings: [
      {
        name: 'Lloret Port',
        depth: 7,
        protection: 'high',
        description: 'Puerto base norte'
      },
      {
        name: 'Tossa Port',
        depth: 7,
        protection: 'high',
        description: 'Puerto base centro'
      },
      {
        name: 'Blanes',
        depth: 8,
        protection: 'high',
        description: 'Puerto sur, acceso fácil'
      },
      {
        name: 'Fondeos remotos',
        depth: 15,
        protection: 'medium',
        description: 'Cientos fondeos vírgenes registrados (profundidad variable 10-20m)'
      }
    ],

    pricing: {
      small: { min: 100, max: 180 },
      medium: { min: 180, max: 350 },
      captain: { min: 250, max: 450 }
    },

    regulations: [
      'AMP Montgrí-Medes: Múltiples zonas protegidas',
      'Fondeo <40m restringido en áreas específicas',
      'Pesca vedada en reservas',
      'Temporada: Mayo-octubre ideal',
      'Equipo: GPS obligatorio, cartas actualizadas, comunicaciones'
    ],

    bestSeason: 'Junio-Septiembre (clima 18-25°C)',

    insiderTip:
      'Ruta legendaria Costa Brava: 5 días Lloret → Tossa → Cala Giverola → Acantilados norte → Snorkel Punta Brava. Retorno atardecer. Experiencia de vida.',

    faq: [
      {
        question: '¿Dónde me quedo: Lloret o Tossa?',
        answer: 'Lloret: calas remotas norte, mejor snorkel. Tossa: pueblo histórico, fondeos seguros. Elige por vibe.'
      },
      {
        question: '¿Experiencia requerida?',
        answer: 'Con patrón: ninguna. Sin patrón: experiencia media+. Acantilados y corrientes requieren cuidado.'
      },
      {
        question: '¿Snorkel nivel?',
        answer: 'Principiante: Cala Giverola. Intermedio: Punta Brava. Experto: Islas remotas, buceo 20m+'
      },
      {
        question: '¿Cuántos días mínimo?',
        answer: '3 días: calas cercanas. 5 días: experiencia completa. 7 días: islas remotas.'
      },
      {
        question: '¿Es muy caro?',
        answer: 'No. Competitivo con Baleares. Barcos pequeños desde €100/día. Mejor relación calidad-precio Europa.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,costa-brava,cliffs,mediterranean',
        alt: 'Velero navegando entre acantilados de la Costa Brava'
      }
    }
  },

  // ===== COSTA BRAVA: LLORET =====
  'lloret-de-mar': {
    coast: 'Costa Brava',
    province: 'Girona',
    locality: 'Lloret de Mar',
    slug: 'lloret-de-mar',
    samboatUrl: '/alquiler-barco/lloret-de-mar',
    googleTrendsVolume: 38,
    description:
      'Costa Brava sur: calas encadenadas como Cala Banys y Canyelles a minutos del puerto. Alquila barco desde €125/día.',

    beaches: [
      {
        name: 'Playa Lloret',
        distance: '0 min desde puerto',
        type: 'urban',
        description: 'Playa urbana, puerto principal, servicios completos'
      },
      {
        name: 'Cala Banys',
        distance: '10 min norte',
        description: 'Cala rocosa pequeña, snorkel bueno, fondeo protegido'
      },
      {
        name: 'Cala Bona',
        distance: '15 min norte',
        type: 'scenic',
        description: 'Cala dorada, acantilados altos, vista espectacular'
      },
      {
        name: 'Cala Morisca',
        distance: '20 min norte',
        type: 'snorkel',
        description: 'Snorkel nivel intermedio, peces abundantes, fondeo natural'
      },
      {
        name: 'Calas del norte',
        distance: '30-50 min',
        type: 'remote',
        description: 'Calas vírgenes accesibles solo en barco, aventura pura'
      }
    ],

    moorings: [
      {
        name: 'Puerto Lloret',
        depth: 6,
        protection: 'high',
        description: 'Puerto principal, servicios premium'
      },
      {
        name: 'Cala Banys',
        depth: 9,
        protection: 'high',
        description: 'Fondeo rocoso, protección excelente'
      },
      {
        name: 'Cala Bona',
        depth: 11,
        protection: 'high',
        description: 'Arena y roca, vistas acantilado'
      },
      {
        name: 'Cala Morisca',
        depth: 10,
        protection: 'high',
        description: 'Fondeo natural, snorkel integrado'
      }
    ],

    pricing: {
      small: { min: 125, max: 200 },
      medium: { min: 210, max: 380 },
      captain: { min: 290, max: 480 }
    },

    regulations: [
      'AMP Montgrí-Medes: Fondeo <40m restringido',
      'Pesca vedada en reservas',
      'Zona histórica: Patrimonio protegido',
      'Temporada: Mayo-octubre ideal',
      'Equipo: GPS obligatorio, cartas actualizadas'
    ],

    bestSeason: 'Junio-Septiembre (clima 20-26°C)',

    insiderTip:
      'Snorkel épico: Puerto → Cala Morisca (snorkel intermedio) → Calas norte (aventura) → Retorno atardecer. 5 días = experiencia Costa Brava completa.',

    faq: [
      {
        question: '¿Mejor Lloret que Tossa?',
        answer: 'Lloret: calas remotas norte, snorkel mejor. Tossa: pueblo medieval, menos aventura. Elige por actividad.'
      },
      {
        question: '¿Snorkel para principiantes?',
        answer: 'Cala Banys sí. Cala Morisca intermedio. Calas norte experto. Opción patrón recomendada.'
      },
      {
        question: '¿Acantilados peligrosos?',
        answer: 'No en fondeos designados. Respeta distancia a rocas. Patrón local conoce spots seguros.'
      },
      {
        question: '¿Cuántos días mínimo?',
        answer: '3 días: calas cercanas. 5+ días: experiencia remota completa. Cada día = nueva cala.'
      },
      {
        question: '¿Es muy caro?',
        answer: 'Competitivo. €125/día barcos pequeños. Similar Costa Blanca, mejor snorkel.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?yacht,lloret,snorkel,turquoise',
        alt: 'Yate anclado en una cala remota de Lloret de Mar'
      }
    }
  },

  // ===== ISLAS CANARIAS: TENERIFE =====
  tenerife: {
    coast: 'Islas Canarias',
    province: 'Tenerife',
    locality: 'Tenerife',
    slug: 'tenerife',
    samboatUrl: '/alquiler-barco/tenerife',
    googleTrendsVolume: 45,
    description:
      'Aguas cálidas todo el año, cetáceos frente a Los Gigantes y calas volcánicas. Alquila barco en Tenerife desde €130/día.',

    beaches: [
      {
        name: 'Playa de Las Américas',
        distance: '10 min sur',
        type: 'resort',
        description: 'Playa turística sur, aguas calmadas, servicios excelentes'
      },
      {
        name: 'Cala del Infierno',
        distance: '15 min norte',
        type: 'volcanic',
        description: 'Cala volcánica negra, geología única, snorkel especial'
      },
      {
        name: 'Bahía de San Juan',
        distance: '20 min norte',
        description: 'Bahía histórica protegida, fondeo natural seguro'
      },
      {
        name: 'Cala Negra Anaga',
        distance: '40 min noreste',
        type: 'remote',
        description: 'Cala remota norte, acantilados espectaculares, poco turismo'
      },
      {
        name: 'Los Silos',
        distance: '50 min noroeste',
        description: 'Pueblo costero tranquilo, fondeo tranquilo, Teide vista'
      }
    ],

    moorings: [
      {
        name: 'Puerto Las Américas',
        depth: 10,
        protection: 'high',
        description: 'Marina moderna, servicios 5 estrellas'
      },
      {
        name: 'Cala del Infierno',
        depth: 12,
        protection: 'medium',
        description: 'Fondeo rocoso, vista Teide espectacular'
      },
      {
        name: 'Bahía San Juan',
        depth: 8,
        protection: 'high',
        description: 'Fondeo protegido, Historia pirata'
      },
      {
        name: 'Anaga Bay',
        depth: 14,
        protection: 'medium',
        description: 'Fondeo remoto, naturaleza pura'
      }
    ],

    pricing: {
      small: { min: 130, max: 210 },
      medium: { min: 220, max: 400 },
      captain: { min: 310, max: 520 }
    },

    regulations: [
      'Zona marina protegida norte',
      'Pesca limitada en fondeos',
      'Puerto Las Américas: Tráfico comercial intenso',
      'Temporada: Todo el año (clima 18-28°C)',
      'Equipo: GPS recomendado, comunicaciones'
    ],

    bestSeason: 'Octubre-Mayo (clima perfecto 20-25°C, viento ligero)',

    insiderTip:
      'Canarias unique: Cala Infierno (volcánica) → Bahía San Juan (piratería histórica) → Teide vista desde mar (único en Europa). Anaga remotos para aventureros.',

    faq: [
      {
        question: '¿Vejo Teide desde el barco?',
        answer: 'Sí. Especialmente norte (Anaga). Foto épica: volcán + barco. Mejor madrugada.'
      },
      {
        question: '¿Mejor Tenerife vs Baleares?',
        answer: 'Tenerife: clima todo año, volcánico único. Baleares: calas más remotas. Elige por clima/aventura.'
      },
      {
        question: '¿Aguas cálidas?',
        answer: 'Sí. 18-28°C según mes. Invierno: 18-20°C (neopreno). Verano: 25-28°C (sin).'
      },
      {
        question: '¿Snorkel en calas volcánicas?',
        answer: 'Bueno en Cala Infierno. Geología única. Peces especiales aguas Canarias.'
      },
      {
        question: '¿Sin licencia es seguro?',
        answer: 'Sí. Fondeos bahías protegidas. Patrón recomendado norte (corrientes, viento).'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?sailboat,tenerife,volcano,ocean',
        alt: 'Velero navegando en Tenerife con vista del Teide'
      }
    }
  },

  // ===== ANDALUSIA: MÁLAGA =====
  malaga: {
    coast: 'Costa del Sol',
    province: 'Málaga',
    locality: 'Málaga',
    slug: 'malaga',
    samboatUrl: '/alquiler-barco/malaga',
    googleTrendsVolume: 42,
    description:
      'Base cómoda de la Costa del Sol: recogida en la ciudad y ruta hacia Nerja o Marbella. Alquila barco desde €110/día.',

    beaches: [
      {
        name: 'Playa de Málaga',
        distance: '0 min puerto',
        type: 'urban',
        description: 'Playa urbana centro ciudad, servicios excelentes'
      },
      {
        name: 'Cala Moral',
        distance: '15 min oeste',
        description: 'Cala pequeña tranquila, montaña vista'
      },
      {
        name: 'Playa El Pino',
        distance: '20 min oeste',
        type: 'family',
        description: 'Playa ancha arenosa, aguas calmadas, familias'
      },
      {
        name: 'Marbella (cercano)',
        distance: '35 min oeste',
        description: 'Resort famoso, playas de lujo, fondeos premium'
      },
      {
        name: 'Calas Mijas',
        distance: '40 min oeste',
        type: 'scenic',
        description: 'Calas rocosas pinares, snorkel bueno'
      }
    ],

    moorings: [
      {
        name: 'Puerto Málaga',
        depth: 8,
        protection: 'high',
        description: 'Marina ciudad, servicios completos'
      },
      {
        name: 'Cala Moral Bay',
        depth: 7,
        protection: 'high',
        description: 'Fondeo protegido, vistas montaña'
      },
      {
        name: 'El Pino Beach',
        depth: 9,
        protection: 'high',
        description: 'Arena, familias, muy seguro'
      },
      {
        name: 'Marbella Marina',
        depth: 10,
        protection: 'high',
        description: 'Lujo marino, servicios premium'
      }
    ],

    pricing: {
      small: { min: 110, max: 180 },
      medium: { min: 190, max: 340 },
      captain: { min: 270, max: 440 }
    },

    regulations: [
      'Puerto Málaga: Tráfico portuario activo',
      'Zonas protegidas parciales costa',
      'Pesca recreativa permitida',
      'Temporada: Todo el año',
      'Equipo: GPS, comunicaciones recomendadas'
    ],

    bestSeason: 'Marzo-Noviembre (clima 16-28°C)',

    insiderTip:
      'Costa del Sol completa: Málaga puerto (base) → Calas oeste mañana → Marbella tarde (lujo) → Fondeos calas retorno. Clima subtropical = navegación todo año.',

    faq: [
      {
        question: '¿Málaga puerto vs Marbella?',
        answer: 'Málaga: ciudad viva, servicios. Marbella: playas lujo, fondeos premium. Ambas vale pena, 35min distancia.'
      },
      {
        question: '¿Snorkel bueno?',
        answer: 'Decente. Calas Mijas mejor. Nada comparado Baleares/Costa Brava, pero agradable.'
      },
      {
        question: '¿Clima en invierno?',
        answer: '16-18°C. Navegable pero frío. Primavera-otoño ideal. Verano: 27-30°C perfecto.'
      },
      {
        question: '¿Fondeos libres o marina?',
        answer: 'Ambas. Marina si quieres servicios. Calas = fondeo libre. Flexible.'
      },
      {
        question: '¿Patrón recomendado?',
        answer: 'Opcional. Puertos bien señalizados. Pero tráfico comercial = patrón seguro.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?catamaran,malaga,mediterranean,beach',
        alt: 'Catamarán navegando en la Costa del Sol near Málaga'
      }
    }
  },

  // ===== ANDALUSIA: MARBELLA =====
  marbella: {
    coast: 'Costa del Sol',
    province: 'Málaga',
    locality: 'Marbella',
    slug: 'marbella',
    samboatUrl: '/alquiler-barco/marbella',
    googleTrendsVolume: 38,
    description:
      'Puerto Banús y las calas de roca de la Costa del Sol más exclusiva. Alquila barco desde €120/día, con patrón o sin licencia.',

    beaches: [
      {
        name: 'Playa Marbella Centro',
        distance: '2 min puerto',
        type: 'luxury',
        description: 'Playa urbana lujo, paseo marítimo famoso'
      },
      {
        name: 'Cala de las Barcas',
        distance: '10 min norte',
        type: 'exclusive',
        description: 'Cala privada rocosa, snorkel nivel'
      },
      {
        name: 'Playa Puerto Banús',
        distance: '15 min norte',
        type: 'resort',
        description: 'Puerto de superyates, ambiente super premium'
      },
      {
        name: 'Cala Verde',
        distance: '25 min norte',
        type: 'scenic',
        description: 'Cala pinares rocosa, privacidad, fondeo natural'
      },
      {
        name: 'Calas Estepona',
        distance: '40 min oeste',
        description: 'Calas remotas oeste, menos lujo, más naturaleza'
      }
    ],

    moorings: [
      {
        name: 'Puerto Marbella',
        depth: 8,
        protection: 'high',
        description: 'Marina lujo, servicios 5 estrellas'
      },
      {
        name: 'Puerto Banús',
        depth: 10,
        protection: 'high',
        description: 'Superyates, prestigio máximo'
      },
      {
        name: 'Cala Verde',
        depth: 12,
        protection: 'high',
        description: 'Fondeo rocoso privado'
      },
      {
        name: 'Estepona Bay',
        depth: 9,
        protection: 'medium',
        description: 'Fondeo natural, menos turismo'
      }
    ],

    pricing: {
      small: { min: 120, max: 200 },
      medium: { min: 210, max: 380 },
      captain: { min: 290, max: 480 }
    },

    regulations: [
      'Puerto Banús: Protocolo lujo, seguridad alta',
      'Zona protegida parcial',
      'Pesca recreativa permitida',
      'Temporada: Todo el año',
      'Equipo: GPS, VHF, protocolo premium'
    ],

    bestSeason: 'Abril-Octubre (clima 18-28°C)',

    insiderTip:
      'Experiencia lujo: Amarre Puerto Banús (superyates) → Navegación Cala Verde (privacidad) → Snorkel calas norte → Cena Puerto Banús atardecer. Glamour Mediterranean.',

    faq: [
      {
        question: '¿Puerto Banús es obligatorio?',
        answer: 'No. Opción. Marino espectacular pero caro. Cala Verde: similar privacidad, 50% menos precio.'
      },
      {
        question: '¿Muy caro?',
        answer: 'Lujo tiene precio. Pero calas naturales = fondeo libre. Mix presupuesto posible.'
      },
      {
        question: '¿Snorkel bueno?',
        answer: 'Aceptable. Calas rocosas. Nada épico, pero bonito.'
      },
      {
        question: '¿Menos turismo que Málaga?',
        answer: 'Puerto: igual lujo. Calas: sí, más privacidad. Estepona oeste: mucho menos turismo.'
      },
      {
        question: '¿Experiencia global?',
        answer: 'Premium. Si buscas lujo + mar bonito + fondeos seguros. Presupuesto alto.'
      }
    ],

    images: {
      hero: {
        unsplashUrl: 'https://source.unsplash.com/1200x600/?yacht,marbella,luxury,mediterranean',
        alt: 'Yate de lujo en Marbella, Costa del Sol'
      }
    }
  },

  // ===== EXPANSIÓN: nuevos destinos (baja competencia editorial) =====
  formentera: {
    coast: 'Islas Baleares',
    province: 'Baleares',
    locality: 'Formentera',
    slug: 'formentera',
    samboatUrl: '/alquiler-barco/formentera',
    googleTrendsVolume: 58,
    description:
      'La isla más virgen de Baleares, accesible desde Ibiza. Alquila barco desde €140/día y fondea en Ses Illetes, aguas tipo Caribe y calas sin urbanizar.',
    beaches: [
      { name: 'Ses Illetes', distance: '20 min desde Ibiza', type: 'iconic', description: 'Arena blanca y agua turquesa, mejor playa de Europa, fondeo en arena' },
      { name: 'Espalmador', distance: '15 min norte', type: 'secret', description: 'Islote privado, laguna de barro natural, fondeo somero protegido' },
      { name: 'Cala Saona', distance: '25 min oeste', description: 'Cala rojiza entre acantilados, atardeceres, fondeo en arena' },
      { name: 'Es Caló', distance: '30 min este', description: 'Antiguo puerto pesquero, aguas calmadas, snorkel' },
      { name: 'Migjorn', distance: '35 min sur', description: 'Playa larga salvaje, varios fondeos, ambiente tranquilo' },
    ],
    moorings: [
      { name: 'Ses Illetes', depth: 4, protection: 'medium', description: 'Campo de boyas obligatorio (posidonia protegida), arena somera' },
      { name: 'Espalmador', depth: 6, protection: 'high', description: 'Fondeo en arena protegido, muy popular, llegar temprano' },
      { name: 'Cala Saona', depth: 8, protection: 'medium', description: 'Arena, expuesto a poniente, vistas de acantilado' },
      { name: 'Es Caló', depth: 5, protection: 'high', description: 'Pequeño y resguardado, ideal con levante' },
    ],
    pricing: { small: { min: 140, max: 230 }, medium: { min: 240, max: 420 }, captain: { min: 320, max: 560 } },
    regulations: [
      'Posidonia protegida: prohibido fondear sobre praderas en Ses Illetes (boyas obligatorias)',
      'Parque Natural de Ses Salines: límites de velocidad y zonas vedadas',
      'Tasa ecológica de fondeo en temporada alta',
      'Equipo de seguridad obligatorio; chalecos para todos',
      'Llega antes de las 11h en julio-agosto (fondeos se llenan)',
    ],
    bestSeason: 'Junio-Septiembre (agua 24-26°C, mejor luz para el turquesa)',
    insiderTip:
      'Sal de Ibiza temprano: Espalmador (baño de barro) → Ses Illetes (almuerzo a bordo) → Cala Saona (atardecer). Reserva boya en Illetes con antelación; el fondeo libre allí es ilegal.',
    faq: [
      { question: '¿Puedo ir a Formentera en barco sin licencia?', answer: 'Sí, con embarcación hasta 5,5 m y motor ≤15CV puedes hacer la travesía corta desde Ibiza en día tranquilo. Con mar de fondo, mejor con patrón.' },
      { question: '¿Dónde fondear en Ses Illetes?', answer: 'Solo en el campo de boyas autorizado: la posidonia está protegida y multan el fondeo sobre pradera. Reserva online en temporada.' },
      { question: '¿Cuánto cuesta el día de barco a Formentera?', answer: 'Lancha pequeña desde €140/día (sin combustible). Con patrón desde €320. Súmale ~€60-100 de gasolina ida y vuelta desde Ibiza.' },
      { question: '¿Mejor época para evitar multitudes?', answer: 'Junio y septiembre. En julio-agosto Ses Illetes se llena de barcos a mediodía; ve a primera hora.' },
      { question: '¿Se puede dormir a bordo fondeado?', answer: 'Solo en fondeos autorizados y fuera de zonas protegidas. Espalmador es popular pero respeta las boyas y la normativa del parque.' },
    ],
    images: { hero: { unsplashUrl: 'https://source.unsplash.com/1200x600/?formentera,turquoise,beach,boat', alt: 'Barco fondeado en aguas turquesas de Formentera' } },
  },

  denia: {
    coast: 'Costa Blanca',
    province: 'Alicante',
    locality: 'Dénia',
    slug: 'denia',
    samboatUrl: '/alquiler-barco/denia',
    googleTrendsVolume: 33,
    description:
      'Puerto principal del norte de la Costa Blanca y puerta a las Baleares. Alquila barco desde €105/día para explorar las calas del Montgó y la Reserva del Cabo de San Antonio.',
    beaches: [
      { name: 'Cova Tallada', distance: '15 min sur', type: 'secret', description: 'Cueva marina histórica excavada en roca, solo accesible por mar o sendero' },
      { name: 'Les Rotes', distance: '10 min sur', description: 'Costa rocosa de aguas cristalinas, reserva marina, snorkel excelente' },
      { name: 'Cabo de San Antonio', distance: '20 min sur', type: 'protected', description: 'Reserva marina entre Dénia y Xàbia, fondos protegidos' },
      { name: 'Marineta Cassiana', distance: '5 min', type: 'family', description: 'Playa urbana de aguas someras y calmadas, ideal familias' },
      { name: 'Les Marines', distance: '10 min norte', description: 'Arenal largo al norte del puerto, fondeo en arena' },
    ],
    moorings: [
      { name: 'Les Rotes', depth: 8, protection: 'medium', description: 'Fondo rocoso-arenoso, reserva marina, agua muy clara' },
      { name: 'Cabo San Antonio', depth: 12, protection: 'medium', description: 'Zona protegida, respeta vedas de fondeo y pesca' },
      { name: 'Puerto de Dénia', depth: 6, protection: 'high', description: 'Marina con todos los servicios, base ideal' },
      { name: 'Marineta Cassiana', depth: 4, protection: 'high', description: 'Somero y protegido, perfecto sin experiencia' },
    ],
    pricing: { small: { min: 105, max: 170 }, medium: { min: 180, max: 320 }, captain: { min: 240, max: 400 } },
    regulations: [
      'Reserva Marina del Cabo de San Antonio: fondeo y pesca restringidos',
      'Cova Tallada: acceso limitado por cupo en verano, respeta el aforo',
      'Tráfico de ferris a Baleares: mantente fuera del canal del puerto',
      'Equipo de seguridad obligatorio',
      'Viento de poniente puede levantarse por la tarde; vigila el parte',
    ],
    bestSeason: 'Mayo-Octubre (agua 19-26°C, mañanas en calma)',
    insiderTip:
      'Madrugón a Cova Tallada antes del cupo, snorkel en Les Rotes y vuelta por el Cabo de San Antonio. Dénia es también la salida más corta a Ibiza/Formentera si tienes barco mayor y buen parte.',
    faq: [
      { question: '¿Qué ver en barco desde Dénia?', answer: 'La joya es la Cova Tallada y la reserva marina del Cabo de San Antonio, con aguas cristalinas y snorkel de primer nivel en Les Rotes.' },
      { question: '¿Se puede ir a Ibiza desde Dénia en barco?', answer: 'Es la travesía más corta a Baleares, pero solo con embarcación adecuada, experiencia y parte favorable. En lancha pequeña no es recomendable.' },
      { question: '¿Precio del alquiler en Dénia?', answer: 'Desde €105/día una lancha sin licencia; con patrón desde €240. Combustible aparte.' },
      { question: '¿Necesito reservar para la Cova Tallada?', answer: 'En verano hay control de aforo en el entorno protegido. Llega temprano para asegurar el fondeo y el acceso.' },
      { question: '¿Es buena zona para principiantes?', answer: 'Sí: Marineta Cassiana y Les Marines son someras y calmadas. La reserva exige más cuidado por las vedas.' },
    ],
    images: { hero: { unsplashUrl: 'https://source.unsplash.com/1200x600/?denia,montgo,mediterranean,boat', alt: 'Costa de Dénia con el macizo del Montgó al fondo' } },
  },

  javea: {
    coast: 'Costa Blanca',
    province: 'Alicante',
    locality: 'Xàbia',
    slug: 'javea',
    samboatUrl: '/alquiler-barco/javea',
    googleTrendsVolume: 36,
    description:
      'Calas de bandera azul entre el Montgó y el Cabo de la Nao. Alquila barco desde €110/día y descubre la Granadella, elegida mejor playa de España.',
    beaches: [
      { name: 'Cala Granadella', distance: '15 min sur', type: 'iconic', description: 'Cala de cantos entre pinares, aguas transparentes, fondeo natural' },
      { name: 'Cala Portitxol', distance: '10 min sur', type: 'scenic', description: 'Frente a la Isla del Portitxol, casas blancas, snorkel' },
      { name: 'Cabo de la Nao', distance: '20 min sur', description: 'Acantilado emblemático, cuevas marinas, aguas profundas' },
      { name: 'Cala Sardinera', distance: '18 min sur', type: 'secret', description: 'Cala virgen sin acceso rodado, solo por mar o sendero' },
      { name: 'El Arenal', distance: '5 min', type: 'family', description: 'Única playa de arena, paseo y restaurantes, fondeo somero' },
    ],
    moorings: [
      { name: 'Granadella', depth: 10, protection: 'medium', description: 'Fondo de cantos y arena, expuesta a levante, agua clarísima' },
      { name: 'Portitxol', depth: 8, protection: 'high', description: 'Resguardada tras la isla, fondeo cómodo, mucho snorkel' },
      { name: 'Cala Sardinera', depth: 9, protection: 'medium', description: 'Tranquila y poco frecuentada, fondo mixto' },
      { name: 'Puerto de Xàbia', depth: 6, protection: 'high', description: 'Marina con servicios, base de salida' },
    ],
    pricing: { small: { min: 110, max: 180 }, medium: { min: 190, max: 340 }, captain: { min: 250, max: 420 } },
    regulations: [
      'Cala Granadella: fondeo regulado en verano, no fondear sobre posidonia',
      'Cabo de la Nao: aguas profundas y tráfico, mantén distancia a la costa',
      'Reserva marina próxima (Cabo San Antonio): consulta vedas',
      'Equipo de seguridad obligatorio',
      'Levante por la tarde: las calas del sur quedan expuestas',
    ],
    bestSeason: 'Junio-Septiembre (agua 22-26°C, calas en su mejor color)',
    insiderTip:
      'Reserva la mañana para la Granadella (se llena y el fondeo se regula) y el mediodía para Portitxol, más resguardado para comer a bordo. Con levante, refúgiate al norte del Cabo de San Antonio.',
    faq: [
      { question: '¿Cuál es la mejor cala de Xàbia en barco?', answer: 'La Granadella, repetidamente elegida mejor playa de España, es imprescindible. Portitxol y Sardinera son alternativas más tranquilas.' },
      { question: '¿Hace falta licencia?', answer: 'No para lancha hasta 5,5 m y 15CV. Para el Cabo de la Nao y aguas profundas conviene experiencia o patrón.' },
      { question: '¿Cuánto cuesta?', answer: 'Desde €110/día sin licencia; con patrón desde €250. Combustible no incluido.' },
      { question: '¿Se puede fondear en la Granadella?', answer: 'Sí pero regulado en temporada y nunca sobre posidonia. Llega temprano: es muy popular.' },
      { question: '¿Y si hay viento?', answer: 'El levante deja expuestas las calas del sur por la tarde. Refúgiate al abrigo del Cabo de San Antonio o vuelve a puerto.' },
    ],
    images: { hero: { unsplashUrl: 'https://source.unsplash.com/1200x600/?javea,granadella,cove,mediterranean', alt: 'Cala Granadella en Xàbia con aguas transparentes' } },
  },

  estartit: {
    coast: 'Costa Brava',
    province: 'Girona',
    locality: "L'Estartit",
    slug: 'estartit',
    samboatUrl: '/alquiler-barco/estartit',
    googleTrendsVolume: 27,
    description:
      'Puerta de las Islas Medes, la mejor reserva marina del Mediterráneo español. Alquila barco desde €120/día para bucear y fondear frente a un parque natural.',
    beaches: [
      { name: 'Islas Medes', distance: '10 min', type: 'protected', description: 'Archipiélago protegido, buceo y snorkel de clase mundial, fondeo en boyas' },
      { name: 'Cala Montgó', distance: '20 min norte', type: 'family', description: 'Bahía resguardada de arena, aguas calmadas' },
      { name: 'Cova del Bisbe', distance: '15 min', type: 'secret', description: 'Cueva marina en las Medes, solo accesible por mar' },
      { name: 'El Montgrí (costa)', distance: '25 min norte', description: 'Acantilados del macizo, calas vírgenes encadenadas' },
      { name: "Platja de l'Estartit", distance: '5 min', type: 'family', description: 'Arenal largo frente al puerto, fondeo somero' },
    ],
    moorings: [
      { name: 'Islas Medes', depth: 12, protection: 'medium', description: 'Boyas obligatorias (reserva integral), no se permite fondear ancla' },
      { name: 'Cala Montgó', depth: 8, protection: 'high', description: 'Arena, muy protegida, ideal familias y principiantes' },
      { name: 'Costa del Montgrí', depth: 15, protection: 'low', description: 'Calas expuestas, fondeo solo con buen tiempo' },
      { name: 'Puerto Estartit', depth: 6, protection: 'high', description: 'Marina con servicios, centros de buceo' },
    ],
    pricing: { small: { min: 120, max: 190 }, medium: { min: 200, max: 360 }, captain: { min: 270, max: 450 } },
    regulations: [
      'Islas Medes: reserva marina integral, boyas obligatorias, prohibido fondear ancla',
      'Buceo regulado por cupo diario y con autorización',
      'Pesca totalmente prohibida en el entorno de las Medes',
      'Equipo de seguridad obligatorio',
      'Tramuntana: viento fuerte del norte, puede cerrar la salida sin aviso',
    ],
    bestSeason: 'Junio-Septiembre (agua 20-25°C, mejor visibilidad para buceo)',
    insiderTip:
      'Las Medes son el motivo del viaje: coge boya, haz snorkel sobre meros enormes y entra a la Cova del Bisbe en barco. Vigila la tramuntana: si sopla del norte, refúgiate en Cala Montgó.',
    faq: [
      { question: '¿Qué son las Islas Medes?', answer: 'Una reserva marina integral frente a L\'Estartit, con la mayor biodiversidad del Mediterráneo español: meros, cuevas y praderas. Buceo y snorkel excepcionales.' },
      { question: '¿Puedo fondear en las Medes?', answer: 'No con ancla: es reserva integral. Hay que coger una de las boyas autorizadas. El acceso y el buceo están regulados por cupo.' },
      { question: '¿Cuánto cuesta el barco?', answer: 'Desde €120/día sin licencia; con patrón desde €270. Combustible aparte.' },
      { question: '¿Hace falta saber bucear?', answer: 'No: el snorkel sobre las boyas ya es espectacular. Para inmersión necesitas titulación y reserva en un centro autorizado.' },
      { question: '¿Cuándo no salir?', answer: 'Con tramuntana (viento fuerte del norte). Llega sin aviso y deja la costa del Montgrí impracticable; consulta el parte antes de zarpar.' },
    ],
    images: { hero: { unsplashUrl: 'https://source.unsplash.com/1200x600/?medes,estartit,diving,mediterranean', alt: 'Islas Medes frente a L\'Estartit, Costa Brava' } },
  },

  salou: {
    coast: 'Costa Daurada',
    province: 'Tarragona',
    locality: 'Salou',
    slug: 'salou',
    samboatUrl: '/alquiler-barco/salou',
    googleTrendsVolume: 29,
    description:
      'Corazón de la Costa Daurada, de arena fina y dorada. Alquila barco desde €100/día para descubrir las calas del Cap Salou, las más bonitas de Tarragona.',
    beaches: [
      { name: 'Cala Crancs', distance: '10 min', type: 'scenic', description: 'Cala recogida del Cap Salou entre pinos, aguas someras y claras' },
      { name: 'Cala Vinya', distance: '12 min', type: 'secret', description: 'Pequeña cala poco accesible por tierra, tranquila' },
      { name: 'Cap Salou', distance: '15 min', description: 'Punta rocosa con faro, encadenado de calas, snorkel' },
      { name: 'Platja Llarga', distance: '8 min', type: 'family', description: 'Arenal abierto, aguas calmadas, fondeo en arena' },
      { name: 'Cala Penya Tallada', distance: '14 min', type: 'scenic', description: 'Cala virgen entre acantilados, agua turquesa' },
    ],
    moorings: [
      { name: 'Cap Salou', depth: 8, protection: 'medium', description: 'Encadenado de calas, fondo de arena y roca, snorkel' },
      { name: 'Platja Llarga', depth: 6, protection: 'high', description: 'Arena, somero y protegido, ideal familias' },
      { name: 'Cala Crancs', depth: 5, protection: 'high', description: 'Pequeña y resguardada, perfecta para principiantes' },
      { name: 'Puerto de Salou', depth: 5, protection: 'high', description: 'Marina con servicios, base de salida' },
    ],
    pricing: { small: { min: 100, max: 160 }, medium: { min: 170, max: 300 }, captain: { min: 220, max: 380 } },
    regulations: [
      'Velocidad limitada cerca de playas balizadas (zona de baño)',
      'Respeta las boyas de canales de entrada y salida de bañistas',
      'Pesca recreativa con licencia autonómica',
      'Equipo de seguridad obligatorio',
      'Garbí (viento de SO) puede levantar marejada por la tarde',
    ],
    bestSeason: 'Junio-Septiembre (agua 21-26°C, costa familiar y tranquila)',
    insiderTip:
      'El Cap Salou esconde las mejores calas de la Costa Daurada, casi todas mejores desde el mar. Combina Cala Crancs y Penya Tallada por la mañana y la Platja Llarga para comer fondeado.',
    faq: [
      { question: '¿Merece la pena alquilar barco en Salou?', answer: 'Sí: las calas del Cap Salou (Crancs, Vinya, Penya Tallada) son lo más bonito de la Costa Daurada y se disfrutan mucho mejor desde el agua.' },
      { question: '¿Necesito licencia?', answer: 'No para lancha hasta 5,5 m y 15CV. La costa es tranquila y apta para principiantes.' },
      { question: '¿Cuánto cuesta?', answer: 'Desde €100/día sin licencia; con patrón desde €220. Es de las zonas más económicas. Combustible aparte.' },
      { question: '¿Es buena zona para familias?', answer: 'Excelente: aguas someras, calas protegidas y la Platja Llarga muy calmada. Ideal con niños.' },
      { question: '¿Cuándo hay peor mar?', answer: 'Con garbí (viento del suroeste) la tarde puede picarse. Las mañanas suelen estar en calma.' },
    ],
    images: { hero: { unsplashUrl: 'https://source.unsplash.com/1200x600/?salou,costa-daurada,cove,mediterranean', alt: 'Calas del Cap Salou en la Costa Daurada' } },
  },

  tarifa: {
    coast: 'Costa de la Luz',
    province: 'Cádiz',
    locality: 'Tarifa',
    slug: 'tarifa',
    samboatUrl: '/alquiler-barco/tarifa',
    googleTrendsVolume: 44,
    description:
      'Donde el Atlántico se encuentra con el Mediterráneo y África está a la vista. Alquila barco desde €130/día para avistar cetáceos en el Estrecho y fondear en playas vírgenes.',
    beaches: [
      { name: 'Isla de las Palomas', distance: '10 min', type: 'scenic', description: 'Punto más al sur de Europa continental, fondos ricos, corrientes' },
      { name: 'Playa de Bolonia', distance: '30 min noroeste', type: 'scenic', description: 'Duna gigante y ruinas romanas, arenal virgen, fondeo en arena' },
      { name: 'Los Lances', distance: '5 min', description: 'Arenal inmenso de viento y kitesurf, fondeo somero abierto' },
      { name: 'Valdevaqueros', distance: '15 min noroeste', type: 'scenic', description: 'Duna y aguas cristalinas, paraíso del viento' },
      { name: 'Estrecho (avistamiento)', distance: '20-40 min', type: 'adventure', description: 'Aguas del Estrecho: delfines, ballenas piloto y orcas en verano' },
    ],
    moorings: [
      { name: 'Bolonia', depth: 6, protection: 'medium', description: 'Arena, abierta al poniente, mejor con levante flojo' },
      { name: 'Isla de las Palomas', depth: 12, protection: 'low', description: 'Corrientes fuertes del Estrecho, solo con buen tiempo y experiencia' },
      { name: 'Puerto de Tarifa', depth: 6, protection: 'high', description: 'Marina protegida, base de salida y avistamientos' },
      { name: 'Los Lances', depth: 5, protection: 'low', description: 'Abierto y ventoso, fondeo solo en días de calma' },
    ],
    pricing: { small: { min: 130, max: 210 }, medium: { min: 220, max: 400 }, captain: { min: 300, max: 520 } },
    regulations: [
      'Estrecho de Gibraltar: tráfico mercante intenso, no cruzar el dispositivo de separación',
      'Avistamiento de cetáceos regulado: distancia mínima y prohibido perseguir',
      'Levante y poniente fuertes muy frecuentes: el viento manda en Tarifa',
      'Corrientes de marea importantes (influencia atlántica)',
      'Equipo de seguridad obligatorio; VHF muy recomendable',
    ],
    bestSeason: 'Mayo-Octubre para cetáceos; días de viento flojo (raros, aprovéchalos)',
    insiderTip:
      'Tarifa es para días sin viento: aprovéchalos para cruzar a avistar cetáceos en el Estrecho (delfines casi garantizados, orcas en julio-agosto) y fondear en Bolonia. Con levante fuerte, ni salgas: es de los lugares más ventosos de Europa.',
    faq: [
      { question: '¿Se pueden ver ballenas y delfines en barco desde Tarifa?', answer: 'Sí: el Estrecho es uno de los mejores lugares de Europa. Delfines todo el año, calderones y cachalotes en temporada, y orcas en julio-agosto. Respeta la distancia legal.' },
      { question: '¿Es difícil navegar en Tarifa?', answer: 'Puede serlo: viento fuerte casi constante, corrientes de marea y tráfico mercante en el Estrecho. Para la mayoría, mejor con patrón.' },
      { question: '¿Cuánto cuesta?', answer: 'Desde €130/día sin licencia (días de calma); con patrón desde €300, muy recomendable aquí. Combustible aparte.' },
      { question: '¿Cuándo se puede salir?', answer: 'Solo con viento flojo, que en Tarifa es lo excepcional. Consulta el parte: levante o poniente fuertes hacen impracticable la navegación de recreo.' },
      { question: '¿Qué fondear si hay algo de viento?', answer: 'Bolonia da cierto abrigo con levante. La Isla de las Palomas y Los Lances quedan expuestos; evítalos salvo calma total.' },
    ],
    images: { hero: { unsplashUrl: 'https://source.unsplash.com/1200x600/?tarifa,strait,whale,atlantic', alt: 'Aguas del Estrecho frente a Tarifa, Costa de la Luz' } },
  }
}

// Helper: Get locality by slug
export const getLocalityBySlug = (slug: string): BoatRentalLocality | undefined => {
  return BOAT_RENTAL_LOCALITIES[slug]
}

// Helper: Get all localities
export const getAllLocalities = (): BoatRentalLocality[] => {
  return Object.values(BOAT_RENTAL_LOCALITIES)
}

// Normaliza a slug para que el matching funcione tanto con el nombre
// ("Costa Brava") como con el slug de la URL ("costa-brava"). Antes se
// comparaba `loc.coast === coast` y, como las páginas pasan el slug, las
// páginas de costa/provincia salían VACÍAS.
const slugifyLoc = (s: string): string =>
  (s ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')

// Helper: Get all localities by coast (tolerante a nombre o slug)
export const getLocalitiesByCoast = (coast: string): BoatRentalLocality[] => {
  const key = slugifyLoc(coast)
  return Object.values(BOAT_RENTAL_LOCALITIES).filter(loc => slugifyLoc(loc.coast) === key)
}

// Helper: Get all localities by province (tolerante a nombre o slug)
export const getLocalitiesByProvince = (province: string): BoatRentalLocality[] => {
  const key = slugifyLoc(province)
  return Object.values(BOAT_RENTAL_LOCALITIES).filter(loc => slugifyLoc(loc.province) === key)
}

// Helper: Get coast from locality slug
export const getCoastFromLocality = (slug: string): string | undefined => {
  const locality = getLocalityBySlug(slug)
  return locality?.coast
}

// Helper: SamBoat Awin URL generator
export const samboatAwinUrl = (
  affId: string,
  samboatPath: string,
  clickref?: string
): string => {
  const params = new URLSearchParams({
    awinmid: '32683',
    awinaffid: affId,
    clickref: clickref || 'playasdeespana',
    ued: `https://www.samboat.es${samboatPath}`
  })
  return `https://www.awin1.com/cread.php?${params.toString()}`
}
