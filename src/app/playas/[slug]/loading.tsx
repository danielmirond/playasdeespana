// src/app/playas/[slug]/loading.tsx
export default function PlayaLoading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f5ede0)' }}>
      {/* Hero skeleton */}
      <div style={{
        padding: '2rem 1.5rem 2.5rem',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        minHeight: 420, background: 'linear-gradient(160deg, var(--bg, #f5ede0), color-mix(in srgb, var(--accent, #b06820) 4%, var(--bg, #f5ede0)))',
      }}>
        <div className="skel" style={{ width: 160, height: 12, borderRadius: 6, marginBottom: 24 }}/>
        <div className="skel" style={{ width: 280, height: 36, borderRadius: 8, marginBottom: 12 }}/>
        <div className="skel" style={{ width: 200, height: 14, borderRadius: 6, marginBottom: 32 }}/>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          {[1,2,3,4,5].map(i => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div className="skel" style={{ width: 48, height: 48, borderRadius: 12 }}/>
              <div className="skel" style={{ width: 36, height: 10, borderRadius: 4 }}/>
            </div>
          ))}
        </div>
      </div>

      {/* Content skeleton */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem', display: 'flex', gap: '1.5rem' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Card skeletons */}
          {[200, 280, 160, 240].map((h, i) => (
            <div key={i} style={{
              background: 'var(--card-bg, #fff)', border: '1.5px solid var(--line, #e8dcc8)',
              borderRadius: 20, padding: '1.25rem', height: h,
            }}>
              <div className="skel" style={{ width: 140, height: 14, borderRadius: 6, marginBottom: 16 }}/>
              <div className="skel" style={{ width: '100%', height: h - 80, borderRadius: 12 }}/>
            </div>
          ))}
        </div>
        {/* Aside skeleton */}
        <div style={{ width: 220, flexShrink: 0 }}>
          <div style={{
            background: 'var(--card-bg, #fff)', border: '1.5px solid var(--line, #e8dcc8)',
            borderRadius: 20, padding: '1.25rem', height: 300,
          }}>
            <div className="skel" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px' }}/>
            <div className="skel" style={{ width: 100, height: 14, borderRadius: 6, margin: '0 auto 8px' }}/>
            <div className="skel" style={{ width: 140, height: 10, borderRadius: 4, margin: '0 auto 20px' }}/>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {[1,2,3,4].map(i => (
                <div key={i} className="skel" style={{ width: 60, height: 36, borderRadius: 8 }}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .skel {
          background: linear-gradient(90deg, var(--line, #e8dcc8) 25%, color-mix(in srgb, var(--line, #e8dcc8) 60%, var(--bg, #f5ede0)) 50%, var(--line, #e8dcc8) 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @media (max-width: 768px) {
          .skel-aside { display: none; }
        }
      `}</style>
    </div>
  )
}
