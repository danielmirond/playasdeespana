export default function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg, #f5ede0)' }}>
      <div style={{ padding: '2.5rem 1.5rem 2rem', borderBottom: '1.5px solid var(--line, #e8dcc8)' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div className="skel" style={{ width: 180, height: 12, borderRadius: 6, marginBottom: 16 }}/>
          <div className="skel" style={{ width: 300, height: 32, borderRadius: 8, marginBottom: 8 }}/>
          <div className="skel" style={{ width: 160, height: 14, borderRadius: 6 }}/>
        </div>
      </div>
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1.5rem' }}>
        <div className="skel" style={{ width: '100%', height: 300, borderRadius: 20, marginBottom: 24 }}/>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="skel" style={{ width: '100%', height: 56, borderRadius: 14 }}/>
          ))}
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
      `}</style>
    </div>
  )
}
