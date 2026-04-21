// src/app/playas/[slug]/loading.tsx
// Skeleton que se pinta instantáneamente mientras la página carga datos

export default function LoadingPlaya() {
  return (
    <>
      {/* Nav skeleton */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, height: 52,
        background: 'rgba(240,230,208,.88)', backdropFilter: 'blur(18px)',
        borderBottom: '1px solid rgba(180,130,60,.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 2rem',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          <Bone w={60} h={28} r={8} />
          <Bone w={80} h={28} r={8} />
          <Bone w={90} h={28} r={8} />
        </div>
        <Bone w={28} h={28} r={14} />
        <Bone w={60} h={28} r={8} />
      </div>

      {/* Hero skeleton */}
      <section style={{
        minHeight: 520, padding: '1.5rem 1.5rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center', background: 'var(--bg, #f0e6d0)',
      }}>
        {/* Breadcrumb */}
        <div style={{ alignSelf: 'flex-start', marginBottom: '1.25rem' }}>
          <Bone w={200} h={14} r={4} />
        </div>
        {/* Nombre */}
        <Bone w={320} h={48} r={6} />
        <div style={{ marginTop: 8 }}><Bone w={220} h={14} r={4} /></div>
        {/* Badges */}
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <Bone w={80} h={24} r={100} />
          <Bone w={70} h={24} r={100} />
        </div>
        {/* Illustration */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 0' }}>
          <Bone w={140} h={140} r={70} />
        </div>
        {/* Estado */}
        <Bone w={120} h={40} r={6} />
        <div style={{ marginTop: 8 }}><Bone w={180} h={16} r={4} /></div>
        {/* Metrics */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)',
          width: '100%', maxWidth: 500, marginTop: 24,
          background: 'rgba(255,255,255,.55)', border: '1px solid rgba(180,130,60,.18)',
          borderRadius: 6, overflow: 'hidden',
        }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ padding: '0.75rem 0.5rem', textAlign: 'center' }}>
              <Bone w={20} h={20} r={4} style={{ margin: '0 auto 4px' }} />
              <Bone w={36} h={18} r={4} style={{ margin: '0 auto 4px' }} />
              <Bone w={28} h={8} r={3} style={{ margin: '0 auto' }} />
            </div>
          ))}
        </div>
      </section>

      {/* FichaNav skeleton */}
      <div style={{
        position: 'sticky', top: 52, zIndex: 50,
        background: 'rgba(240,230,208,.92)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(180,130,60,.18)',
        padding: '0 1rem', display: 'flex', gap: 4, overflowX: 'auto',
        height: 44, alignItems: 'center',
      }}>
        {['80px','60px','70px','90px','60px','80px'].map((w, i) => (
          <Bone key={i} w={parseInt(w)} h={28} r={8} />
        ))}
      </div>

      {/* Body skeleton */}
      <div style={{
        maxWidth: 960, margin: '0 auto',
        padding: '1.5rem 1rem 5rem',
        display: 'grid', gridTemplateColumns: '1fr 280px',
        gap: '1.5rem', alignItems: 'start',
      }}>
        {/* Main */}
        <div>
          {/* Card fotos */}
          <SkeletonCard h={260} />
          {/* Card oleaje */}
          <SkeletonCard h={160} />
          {/* Card temperatura */}
          <SkeletonCard h={120} />
          {/* Card seguridad */}
          <SkeletonCard h={100} />
        </div>
        {/* Aside */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.65rem' }}>
          <div style={{
            background: 'rgba(255,255,255,.5)', border: '1px solid rgba(180,130,60,.18)',
            borderRadius: 6, padding: '1rem', textAlign: 'center',
          }}>
            <Bone w={60} h={60} r={30} style={{ margin: '0 auto 8px' }} />
            <Bone w={100} h={24} r={6} style={{ margin: '0 auto 6px' }} />
            <Bone w={140} h={12} r={4} style={{ margin: '0 auto 12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, background: 'rgba(180,130,60,.18)' }}>
              {[...Array(4)].map((_, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,.55)', padding: '0.55rem 0.35rem', textAlign: 'center' }}>
                  <Bone w={40} h={16} r={4} style={{ margin: '0 auto 4px' }} />
                  <Bone w={28} h={8} r={3} style={{ margin: '0 auto' }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes shimmer {
          0% { background-position: -400px 0 }
          100% { background-position: 400px 0 }
        }
        @media (max-width: 800px) {
          [data-skel-grid] { grid-template-columns: 1fr !important; }
          [data-skel-aside] { display: none !important; }
        }
      `}</style>
    </>
  )
}

function Bone({ w, h, r = 6, style }: { w: number; h: number; r?: number; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg, rgba(180,130,60,.08) 0%, rgba(180,130,60,.16) 50%, rgba(180,130,60,.08) 100%)',
      backgroundSize: '800px 100%',
      animation: 'shimmer 1.5s ease-in-out infinite',
      ...style,
    }} />
  )
}

function SkeletonCard({ h }: { h: number }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,.5)',
      border: '1px solid rgba(180,130,60,.18)',
      borderRadius: 6, marginBottom: '.85rem',
      overflow: 'hidden',
    }}>
      <div style={{ padding: '.85rem 1rem .45rem', display: 'flex', alignItems: 'center', gap: 8 }}>
        <Bone w={16} h={16} r={4} />
        <Bone w={120} h={16} r={4} />
      </div>
      <div style={{ padding: '.2rem 1rem 1rem' }}>
        <Bone w={0} h={h - 60} r={10} style={{ width: '100%' }} />
      </div>
    </div>
  )
}
