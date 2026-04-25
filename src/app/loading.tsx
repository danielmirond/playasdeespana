// src/app/loading.tsx. Skeleton instant de la homepage

export default function LoadingHome() {
  return (
    <>
      {/* Nav */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, height: 52,
        background: 'rgba(240,230,208,.88)', 
        borderBottom: '1px solid rgba(180,130,60,.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Bone w={60} h={28} r={4} />
          <Bone w={80} h={28} r={4} />
          <Bone w={90} h={28} r={4} />
        </div>
        <Bone w={28} h={28} r={100} />
        <Bone w={60} h={28} r={4} />
      </div>

      {/* Hero */}
      <section style={{
        minHeight: 460, padding: '3rem 1.5rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', background: 'var(--bg, #f0e6d0)',
        position: 'relative', overflow: 'hidden',
      }}>
        <Bone w={280} h={52} r={6} />
        <div style={{ marginTop: 12 }}><Bone w={360} h={18} r={4} /></div>
        <div style={{ marginTop: 6 }}><Bone w={300} h={18} r={4} /></div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '2rem 0' }}>
          <Bone w={220} h={160} r={6} />
        </div>
        <Bone w={140} h={14} r={4} />
      </section>

      {/* Buscador */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 2rem' }}>
        <Bone w={0} h={48} r={6} style={{ width: '100%', maxWidth: 540, margin: '0 auto' }} />
      </div>

      {/* Destacadas */}
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 2rem 2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(180,130,60,.18)' }}>
          <Bone w={160} h={16} r={4} />
          <Bone w={80} h={14} r={4} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
          {[...Array(8)].map((_, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,.5)', border: '1px solid rgba(180,130,60,.18)',
              borderRadius: 6, padding: '1rem',
            }}>
              <Bone w={0} h={18} r={4} style={{ width: '80%' }} />
              <div style={{ marginTop: 6 }}><Bone w={0} h={12} r={3} style={{ width: '60%' }} /></div>
              <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
                <Bone w={50} h={22} r={100} />
                <Bone w={40} h={22} r={100} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0 }
          100% { background-position: 400px 0 }
        }
      `}</style>
    </>
  )
}

function Bone({ w, h, r = 6, style }: { w: number; h: number; r?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w || undefined, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(180,130,60,.08) 0%, rgba(180,130,60,.16) 50%, rgba(180,130,60,.08) 100%)',
      backgroundSize: '800px 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}
