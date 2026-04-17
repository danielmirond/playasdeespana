// src/components/playa/IluEstado.tsx
// Ilustraciones SVG por estado — reutilizadas en hero y aside

interface Props { estado: string; size?: 'sm' | 'lg' }

export default function IluEstado({ estado, size = 'lg' }: Props) {
  const w = size === 'lg' ? 220 : 110
  const h = size === 'lg' ? 180 : 88

  const vb = size === 'lg' ? '0 0 220 180' : '0 0 110 88'

  if (estado === 'CALMA') return (
    <svg viewBox={vb} fill="none" width={w} height={h} role="img" aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}>
      <rect x={size==='lg'?20:5}  y={size==='lg'?128:64} width={size==='lg'?180:100} height={size==='lg'?14:8}  rx="3" fill="#c4884a" opacity=".45"/>
      <rect x={size==='lg'?8:0}   y={size==='lg'?136:70} width={size==='lg'?204:110} height={size==='lg'?16:10} rx="3" fill="#c4884a" opacity=".6"/>
      <rect x="0" y={size==='lg'?146:76} width={size==='lg'?220:110} height={size==='lg'?34:12} fill="#c4884a" opacity=".8"/>
      {size==='lg' ? <>
        <path d="M8,130 C28,122 50,132 74,126 C98,120 118,132 142,126 C162,121 185,130 212,125" fill="none" stroke="#a8cce0" strokeWidth="2" strokeLinecap="round" opacity=".55"/>
        <path d="M74,128 A36,36 0 0,1 146,128" fill="#e8a030" opacity=".9"/>
        <circle cx="110" cy="128" r="26" fill="#e8a030"/>
        <circle cx="110" cy="128" r="20" fill="#f5be40"/>
        <line x1="110" y1="82"  x2="110" y2="93"  stroke="#e8a030" strokeWidth="2.5" strokeLinecap="round"/>
        <line x1="80"  y1="90"  x2="86"  y2="99"  stroke="#e8a030" strokeWidth="2"   strokeLinecap="round" opacity=".8"/>
        <line x1="140" y1="90"  x2="134" y2="99"  stroke="#e8a030" strokeWidth="2"   strokeLinecap="round" opacity=".8"/>
        <line x1="66"  y1="110" x2="76"  y2="113" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
        <line x1="154" y1="110" x2="144" y2="113" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
        <path d="M58,133 A52,58 0 0,1 162,133" fill="none" stroke="#c4884a" strokeWidth="1" opacity=".2"/>
      </> : <>
        <path d="M5,66 C15,61 28,67 42,63 C56,59 70,66 84,62 C96,59 104,64 110,61" fill="none" stroke="#a8cce0" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
        <path d="M42,64 A23,23 0 0,1 68,64" fill="#e8a030" opacity=".9"/>
        <circle cx="55" cy="64" r="16" fill="#e8a030"/>
        <circle cx="55" cy="64" r="12" fill="#f5be40"/>
        <line x1="55" y1="38" x2="55" y2="45" stroke="#e8a030" strokeWidth="2" strokeLinecap="round"/>
        <line x1="35" y1="44" x2="39" y2="50" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
        <line x1="75" y1="44" x2="71" y2="50" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      </>}
    </svg>
  )

  if (estado === 'PELIGRO') return (
    <svg viewBox={vb} fill="none" width={w} height={h} role="img" aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}>
      <rect x="0" y={size==='lg'?150:76} width={size==='lg'?220:110} height={size==='lg'?30:12} fill="#c4884a" opacity=".5"/>
      <path d={size==='lg'
        ? "M0,140 C18,128 36,142 54,132 C72,122 90,138 110,128 C130,118 150,134 170,124 C186,116 204,128 220,122 L220,160 L0,160Z"
        : "M0,70 C10,63 22,71 34,65 C46,59 58,68 70,62 C82,56 96,65 110,60 L110,82 L0,82Z"}
        fill="#7a9ab0" opacity=".35"/>
      <path d={size==='lg'
        ? "M0,152 C20,144 40,154 62,147 C84,140 106,152 130,145 C152,139 180,150 220,144 L220,160 L0,160Z"
        : "M0,78 C14,73 28,79 44,75 C60,71 80,78 110,74 L110,88 L0,88Z"}
        fill="#7a9ab0" opacity=".5"/>
      <line x1={size==='lg'?90:40} y1={size==='lg'?25:12} x2={size==='lg'?130:70} y2={size==='lg'?65:40} stroke="#8a2020" strokeWidth={size==='lg'?3:2} strokeLinecap="round" opacity=".55"/>
      <line x1={size==='lg'?130:70} y1={size==='lg'?25:12} x2={size==='lg'?90:40} y2={size==='lg'?65:40} stroke="#8a2020" strokeWidth={size==='lg'?3:2} strokeLinecap="round" opacity=".55"/>
      <circle cx={size==='lg'?110:55} cy={size==='lg'?45:26} r={size==='lg'?22:11} fill="none" stroke="#8a2020" strokeWidth={size==='lg'?2:1.5} opacity=".3"/>
    </svg>
  )

  if (estado === 'SURF') return (
    <svg viewBox={vb} fill="none" width={w} height={h} role="img" aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}>
      <rect x="0" y={size==='lg'?155:78} width={size==='lg'?220:110} height={size==='lg'?25:10} fill="#c4884a" opacity=".4"/>
      <path d={size==='lg'
        ? "M0,80 C16,56 32,84 56,64 C80,44 100,76 128,52 C152,32 180,72 220,48 L220,160 L0,160Z"
        : "M0,40 C8,28 18,42 28,32 C38,22 50,38 64,26 C76,16 90,36 110,24 L110,88 L0,88Z"}
        fill="#2e7bb4" opacity=".2"/>
      <path d={size==='lg'
        ? "M0,112 C28,92 56,116 88,96 C120,76 156,108 220,88 L220,160 L0,160Z"
        : "M0,56 C14,46 28,58 44,48 C60,38 78,54 110,44 L110,88 L0,88Z"}
        fill="#2e7bb4" opacity=".4"/>
      <path d={size==='lg'?"M8,84 Q22,60 36,80":"M4,42 Q12,30 20,40"} fill="none" stroke="white" strokeWidth={size==='lg'?2.5:2} strokeLinecap="round" opacity=".5"/>
      <path d={size==='lg'?"M80,64 Q92,46 104,62":"M40,30 Q48,22 56,30"} fill="none" stroke="white" strokeWidth={size==='lg'?2:1.5} strokeLinecap="round" opacity=".45"/>
      <path d={size==='lg'?"M124,72 L114,36 L126,27 L138,60Z":"M62,54 L56,34 L64,28 L72,48Z"} fill="#f5be40" opacity=".7"/>
    </svg>
  )

  if (estado === 'AVISO') return (
    <svg viewBox={vb} fill="none" width={w} height={h} role="img" aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}>
      <rect x="0" y={size==='lg'?150:76} width={size==='lg'?220:110} height={size==='lg'?30:12} fill="#c4884a" opacity=".4"/>
      <path d={size==='lg'
        ? "M0,100 C20,80 44,104 68,84 C92,64 116,96 140,76 C164,56 192,88 220,72 L220,160 L0,160Z"
        : "M0,50 C10,40 22,52 34,42 C46,32 58,48 70,38 C82,28 96,44 110,36 L110,88 L0,88Z"}
        fill="#6a9ab8" opacity=".25"/>
      <path d={size==='lg'
        ? "M0,124 C30,108 60,128 92,112 C124,96 156,120 188,106 L220,100 L220,160 L0,160Z"
        : "M0,62 C15,54 30,64 46,56 C62,48 78,60 94,53 L110,50 L110,88 L0,88Z"}
        fill="#6a9ab8" opacity=".45"/>
      <polygon points={size==='lg'?"110,16 122,44 98,44":"55,8 64,24 46,24"} fill="#e8a030" opacity=".7"/>
      <line x1={size==='lg'?110:55} y1={size==='lg'?45:25} x2={size==='lg'?110:55} y2={size==='lg'?58:32} stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".5"/>
    </svg>
  )

  // BUENA / VIENTO
  return (
    <svg viewBox={vb} fill="none" width={w} height={h} role="img" aria-label={`Ilustración: estado del mar ${estado.toLowerCase()}`}>
      <rect x="0" y={size==='lg'?150:76} width={size==='lg'?220:110} height={size==='lg'?30:12} fill="#c4884a" opacity=".4"/>
      <path d={size==='lg'
        ? "M0,104 C28,80 56,104 84,88 C112,72 140,100 168,84 C192,70 208,88 220,80 L220,160 L0,160Z"
        : "M0,52 C14,40 28,52 42,44 C56,36 70,50 86,42 C96,37 104,44 110,40 L110,88 L0,88Z"}
        fill="#6a9ab8" opacity=".3"/>
      <path d={size==='lg'
        ? "M0,128 C32,112 64,128 100,116 C136,104 172,124 220,112 L220,160 L0,160Z"
        : "M0,64 C16,56 32,66 50,58 C68,50 86,62 110,55 L110,88 L0,88Z"}
        fill="#6a9ab8" opacity=".45"/>
      <circle cx={size==='lg'?110:55} cy={size==='lg'?54:27} r={size==='lg'?28:14} fill="#f5be40" opacity=".85"/>
      <circle cx={size==='lg'?110:55} cy={size==='lg'?54:27} r={size==='lg'?20:10} fill="#fac840"/>
      <line x1={size==='lg'?110:55} y1={size==='lg'?16:8}  x2={size==='lg'?110:55} y2={size==='lg'?24:13} stroke="#f5be40" strokeWidth="2" strokeLinecap="round"/>
      <line x1={size==='lg'?78:39}  y1={size==='lg'?24:12} x2={size==='lg'?84:42}  y2={size==='lg'?30:15} stroke="#f5be40" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
      <line x1={size==='lg'?142:71} y1={size==='lg'?24:12} x2={size==='lg'?136:68} y2={size==='lg'?30:15} stroke="#f5be40" strokeWidth="1.5" strokeLinecap="round" opacity=".7"/>
    </svg>
  )
}
