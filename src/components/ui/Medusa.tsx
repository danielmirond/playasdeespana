// src/components/ui/Medusa.tsx — Icono de medusa.
//
// Phosphor, la biblioteca de iconos del sitio, no tiene medusa: tiene pez,
// y es lo que se usaba —un pez para avisar de medusas, en tres sitios—. Un
// aviso de seguridad con el dibujo de otro animal se entiende al revés o
// no se entiende.
//
// Dibujada a mano con la misma lógica que el resto de iconos del sistema:
// viewBox de 256 como Phosphor, trazo redondeado, y dos pesos que siguen la
// gramática de certeza de la ficha —`fill` si el avistamiento es oficial
// (campana rellena), `regular` si lo estima el modelo (solo el contorno)—,
// igual que la bandera del hero. Tentáculos siempre en línea: es lo que la
// hace medusa y no seta.
//
// Acepta las mismas props que un icono de Phosphor para poder sustituirlo
// sin tocar los call sites: size, weight, color, aria-hidden.

interface Props {
  size?: number | string
  weight?: 'regular' | 'bold' | 'fill'
  color?: string
  'aria-hidden'?: boolean | 'true' | 'false'
  className?: string
  style?: React.CSSProperties
}

export default function Medusa({ size = 24, weight = 'regular', color = 'currentColor', className, style, ...rest }: Props) {
  // Trazo: 20/28/— y no 16/22. Visto renderizado, con 16 la forma —que es
  // larga y con tentáculos— se desvanecía a 17 px y regular y bold salían
  // iguales. Phosphor usa 16 en formas compactas; esta necesita más cuerpo.
  const sw = weight === 'bold' ? 28 : 20
  const lleno = weight === 'fill'
  return (
    <svg viewBox="0 0 256 256" width={size} height={size} className={className} style={style} fill="none" {...rest}>
      {/* campana con el borde festoneado INTEGRADO en el mismo trazado: el
          primer dibujo lo llevaba como una línea aparte y, visto, quedaba
          separado como un pelo suelto debajo de la campana */}
      <path
        d="M40 132 C40 82 80 44 128 44 C176 44 216 82 216 132 Q204 118 192 132 Q180 146 168 132 Q156 118 144 132 Q132 146 120 132 Q108 118 96 132 Q84 146 72 132 Q60 118 48 132 Z"
        fill={lleno ? color : 'none'} stroke={color} strokeWidth={sw} strokeLinejoin="round"
      />
      {/* tentáculos: ondulados, de largos distintos, siempre en línea */}
      <path d="M84 150 c-12 18 8 32 -4 52 c-6 10 -4 20 2 28" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M114 152 c10 16 -10 32 2 50 c5 9 3 17 -2 24" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M142 152 c-10 16 10 32 -2 50 c-5 9 -3 17 2 24" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
      <path d="M172 150 c12 18 -8 32 4 52 c6 10 4 20 -2 28" stroke={color} strokeWidth={sw} strokeLinecap="round" fill="none" />
    </svg>
  )
}
