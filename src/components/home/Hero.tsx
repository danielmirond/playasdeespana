// src/components/home/Hero.tsx
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.rings} aria-hidden>
        <svg viewBox="0 0 800 600" fill="none">
          <ellipse cx="400" cy="340" rx="740" ry="520" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="580" ry="400" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="420" ry="285" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="270" ry="180" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="140" ry="95"  stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      <div className={styles.ilu} aria-hidden>
        <svg viewBox="0 0 220 160" fill="none" width="220" height="160">
          <rect x="15" y="120" width="190" height="12" rx="3" fill="#c4884a" opacity=".4"/>
          <rect x="5"  y="128" width="210" height="14" rx="3" fill="#c4884a" opacity=".55"/>
          <rect x="0"  y="138" width="220" height="22" rx="0" fill="#c4884a" opacity=".7"/>
          <path d="M5,122 C25,114 48,124 72,118 C96,112 118,124 144,118 C166,113 190,121 215,117" fill="none" stroke="#a8cce0" strokeWidth="2" strokeLinecap="round" opacity=".5"/>
          <path d="M0,132 C28,124 58,134 90,127 C122,120 155,132 190,126 L220,125 L220,142 L0,142Z" fill="#a8cce0" opacity=".12"/>
          <path d="M76,120 A34,34 0 0,1 144,120" fill="#e8a030" opacity=".9"/>
          <circle cx="110" cy="120" r="24" fill="#e8a030"/>
          <circle cx="110" cy="120" r="18" fill="#f5be40"/>
          <line x1="110" y1="78"  x2="110" y2="88"  stroke="#e8a030" strokeWidth="2.5" strokeLinecap="round"/>
          <line x1="82"  y1="86"  x2="87"  y2="94"  stroke="#e8a030" strokeWidth="2"   strokeLinecap="round" opacity=".8"/>
          <line x1="138" y1="86"  x2="133" y2="94"  stroke="#e8a030" strokeWidth="2"   strokeLinecap="round" opacity=".8"/>
          <line x1="68"  y1="105" x2="77"  y2="108" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
          <line x1="152" y1="105" x2="143" y2="108" stroke="#e8a030" strokeWidth="1.5" strokeLinecap="round" opacity=".55"/>
        </svg>
      </div>

      <p className={styles.kicker}>
        <span className={styles.kickerDot}/>
        5.611 playas · datos en tiempo real
      </p>

      <h1 className={styles.title}>
        El estado del mar,<br/>
        <em>antes de salir de casa</em>
      </h1>
      <p className={styles.sub}>
        Temperatura del agua, oleaje y calidad en todas las playas de España.
      </p>

      {/* Stats bar */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statV}>5.611</span>
          <span className={styles.statL}>Playas</span>
        </div>
        <div className={styles.statDiv}/>
        <div className={styles.stat}>
          <span className={styles.statV}>17</span>
          <span className={styles.statL}>Comunidades</span>
        </div>
        <div className={styles.statDiv}/>
        <div className={styles.stat}>
          <span className={styles.statV}>1h</span>
          <span className={styles.statL}>Actualización</span>
        </div>
        <div className={styles.statDiv}/>
        <div className={styles.stat}>
          <span className={styles.statV}>∞</span>
          <span className={styles.statL}>Gratis</span>
        </div>
      </div>
    </section>
  )
}
