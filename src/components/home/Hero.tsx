// src/components/home/Hero.tsx — Product-focused hero.
// "¿A qué playa voy hoy?" + CTAs accionables
import Link from 'next/link'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.rings} aria-hidden="true">
        <svg viewBox="0 0 800 600" fill="none">
          <ellipse cx="400" cy="340" rx="740" ry="520" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="580" ry="400" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="420" ry="285" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="270" ry="180" stroke="currentColor" strokeWidth="1"/>
          <ellipse cx="400" cy="340" rx="140" ry="95"  stroke="currentColor" strokeWidth="1"/>
        </svg>
      </div>

      <p className={styles.kicker}>
        <span className={styles.kickerDot}/>
        Datos actualizados cada hora · gratis
      </p>

      <h1 className={styles.title}>
        Hoy el mar está<br/>
        <em>para bañarse</em>
      </h1>
      <p className={styles.sub}>
        Puntuamos cada playa de 0 a 100 según el estado actual del mar,
        el viento, los servicios y el acceso. Elige la mejor para ti.
      </p>

      {/* CTAs accionables — la geolocalización se pide automáticamente
          vía TopCercanas al cargar la home, no necesita botón aquí */}
      <div className={styles.ctas}>
        <Link href="/buscar?orden=score" className={styles.ctaPrimary}>
          Mejores playas ahora
        </Link>
        <Link href="/buscar?filtro=sinviento" className={styles.ctaSecondary}>
          Sin viento
        </Link>
        <Link href="/buscar?filtro=familiar" className={styles.ctaSecondary}>
          Familiares
        </Link>
        <Link href="/buscar?filtro=tranquila" className={styles.ctaSecondary}>
          Tranquilas
        </Link>
      </div>

      {/* Stats bar */}
      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statV}>5.054</span>
          <span className={styles.statL}>Playas</span>
        </div>
        <div className={styles.statDiv}/>
        <div className={styles.stat}>
          <span className={styles.statV}>Score 0-100</span>
          <span className={styles.statL}>En tiempo real</span>
        </div>
        <div className={styles.statDiv}/>
        <div className={styles.stat}>
          <span className={styles.statV}>1 h</span>
          <span className={styles.statL}>Actualización</span>
        </div>
      </div>
    </section>
  )
}
