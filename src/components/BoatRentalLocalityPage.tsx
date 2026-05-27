'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Nav from '@/components/ui/Nav'

export interface LocalityPageProps {
  coast: string
  province: string
  locality: string
  slug: string
  description: string
  beaches: Array<{
    name: string
    distance: string
    type?: string
    description: string
  }>
  moorings: Array<{
    name: string
    depth: string | number
    protection: string
    description: string
  }>
  pricing: {
    small: { min: number; max: number }
    medium: { min: number; max: number }
    captain: { min: number; max: number }
  }
  regulations: string[]
  bestSeason: string
  insiderTip: string
  faq: Array<{
    question: string
    answer: string
  }>
  googleTrendsVolume: number
  samboatAwinUrl: string
  samboatDeeplink: string
  images: {
    hero: {
      unsplashUrl: string
      alt: string
    }
  }
}

export default function BoatRentalLocalityPage(props: LocalityPageProps) {
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null)

  const toggleFaq = (id: number) => {
    setExpandedFaqId(expandedFaqId === id ? null : id)
  }

  return (
    <>
      <Nav />
      <main>
        {/* HERO SECTION */}
        <section
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(99, 179, 237, 0.9) 0%, rgba(99, 179, 237, 0.8) 100%), url('${props.images.hero.unsplashUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            color: 'white',
            padding: '4rem 1.5rem',
            marginBottom: '3rem',
          }}
        >
          <div style={{ maxWidth: 1000, margin: '0 auto' }}>
            <nav style={{ fontSize: '.9rem', marginBottom: '1.5rem', opacity: 0.9 }}>
              <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>Inicio</Link>
              <span style={{ margin: '0 .5rem' }}>›</span>
              <Link href="/alquiler-barco" style={{ color: 'inherit', textDecoration: 'none' }}>Alquiler de Barcos</Link>
              <span style={{ margin: '0 .5rem' }}>›</span>
              <span>{props.locality}</span>
            </nav>

            <h1 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              fontWeight: 700,
              lineHeight: 1.1,
              marginBottom: '1rem',
              letterSpacing: '-.02em',
            }}>
              Alquila Barcos en <em style={{ fontWeight: 500 }}>{props.locality}</em>
            </h1>

            <p style={{
              fontSize: '1.05rem',
              lineHeight: 1.6,
              maxWidth: 700,
              marginBottom: '2rem',
              opacity: 0.95,
            }}>
              {props.description}
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <a
                href={props.samboatAwinUrl}
                target="_blank"
                rel="noopener noreferrer sponsored"
                style={{
                  display: 'inline-block',
                  padding: '0.9rem 1.8rem',
                  background: 'white',
                  color: '#0369a1',
                  fontWeight: 700,
                  borderRadius: 6,
                  textDecoration: 'none',
                  transition: 'all .2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'}
                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
              >
                Explorar Ofertas en SamBoat →
              </a>
            </div>
          </div>
        </section>

        {/* CONTENT */}
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 1.5rem 5rem' }}>
          {/* BEACHES */}
          <section style={{ marginBottom: '3.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '1.5rem',
              letterSpacing: '-.015em',
            }}>
              Playas Accesibles en Barco
            </h2>
            <p style={{
              fontSize: '.95rem',
              color: 'var(--muted)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              Descubre las calas y playas más hermosas de {props.locality}, accesibles únicamente por mar.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {props.beaches.map((beach, idx) => (
                <div
                  key={idx}
                  style={{
                    border: '1px solid var(--line)',
                    borderRadius: 6,
                    padding: '1.5rem',
                    transition: 'all .2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                  onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                >
                  <h3 style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: 'var(--ink)',
                    marginBottom: '.5rem',
                  }}>
                    {beach.name}
                  </h3>
                  <p style={{
                    fontSize: '.8rem',
                    color: 'var(--muted)',
                    marginBottom: '.75rem',
                  }}>
                    {beach.distance}
                  </p>
                  <p style={{
                    fontSize: '.9rem',
                    color: 'var(--muted)',
                    lineHeight: 1.5,
                  }}>
                    {beach.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* MOORINGS */}
          <section style={{ marginBottom: '3.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '1.5rem',
              letterSpacing: '-.015em',
            }}>
              Fondeos Recomendados
            </h2>
            <p style={{
              fontSize: '.95rem',
              color: 'var(--muted)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              Lugares seguros y protegidos para fondear tu barco en {props.locality}.
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1rem',
            }}>
              {props.moorings.map((mooring, idx) => (
                <div key={idx} style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--line)',
                  borderRadius: 6,
                  padding: '1.5rem',
                }}>
                  <h3 style={{
                    fontWeight: 700,
                    fontSize: '1.05rem',
                    color: 'var(--ink)',
                    marginBottom: '1rem',
                  }}>
                    {mooring.name}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', fontSize: '.9rem', color: 'var(--muted)' }}>
                    <div><strong>Profundidad:</strong> {mooring.depth}m</div>
                    <div><strong>Protección:</strong> {mooring.protection}</div>
                    <p style={{ marginTop: '.5rem', lineHeight: 1.5 }}>{mooring.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* PRICING */}
          <section style={{ marginBottom: '3.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '1.5rem',
              letterSpacing: '-.015em',
            }}>
              Precios en {props.locality}
            </h2>
            <p style={{
              fontSize: '.95rem',
              color: 'var(--muted)',
              marginBottom: '2rem',
              lineHeight: 1.6,
            }}>
              Rango de precios aproximados por tipo de embarcación (varían según temporada y proveedor).
            </p>
            <div style={{ overflowX: 'auto' }}>
              <table style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: '.9rem',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                borderRadius: 6,
              }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--line)', background: 'rgba(0,0,0,.02)' }}>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Tipo de Barco</th>
                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 700 }}>Rango de Precios</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>Barco &lt;5.5m (sin patrón)</td>
                    <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 700 }}>€{props.pricing.small.min} - €{props.pricing.small.max}/día</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--line)' }}>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>Barco mediano 6-10m</td>
                    <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 700 }}>€{props.pricing.medium.min} - €{props.pricing.medium.max}/día</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>Con Patrón Profesional</td>
                    <td style={{ padding: '1rem', color: '#16a34a', fontWeight: 700 }}>€{props.pricing.captain.min} - €{props.pricing.captain.max}/día</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* INFO */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '1.5rem',
            marginBottom: '3.5rem',
          }}>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--ink)',
                marginBottom: '.75rem',
              }}>
                Mejor Temporada
              </h3>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                {props.bestSeason}
              </p>
            </div>
            <div style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--line)',
              borderRadius: 6,
              padding: '1.5rem',
            }}>
              <h3 style={{
                fontWeight: 700,
                fontSize: '1rem',
                color: 'var(--ink)',
                marginBottom: '.75rem',
              }}>
                Consejo Local
              </h3>
              <p style={{ fontSize: '.9rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                {props.insiderTip}
              </p>
            </div>
          </section>

          {/* FAQ */}
          {props.faq && props.faq.length > 0 && (
            <section id="s-barcos-faq" style={{ marginBottom: '3.5rem' }}>
              <h2 style={{
                fontFamily: 'var(--font-serif)',
                fontSize: '1.75rem',
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: '1.5rem',
                letterSpacing: '-.015em',
              }}>
                Preguntas Frecuentes
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
                {props.faq.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      border: '1px solid var(--line)',
                      borderRadius: 6,
                      overflow: 'hidden',
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      style={{
                        width: '100%',
                        padding: '1.25rem',
                        background: expandedFaqId === idx ? 'rgba(0,0,0,.02)' : 'var(--card-bg)',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontSize: '.95rem',
                        fontWeight: 700,
                        color: 'var(--ink)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        transition: 'all .2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(0,0,0,.04)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = expandedFaqId === idx ? 'rgba(0,0,0,.02)' : 'var(--card-bg)'}
                    >
                      {item.question}
                      <span style={{
                        display: 'inline-block',
                        transition: 'transform .2s',
                        transform: expandedFaqId === idx ? 'rotate(180deg)' : 'rotate(0)',
                      }}>
                        ▼
                      </span>
                    </button>
                    {expandedFaqId === idx && (
                      <div style={{
                        padding: '1.25rem',
                        background: 'var(--card-bg)',
                        borderTop: '1px solid var(--line)',
                        fontSize: '.9rem',
                        color: 'var(--muted)',
                        lineHeight: 1.7,
                      }}>
                        {item.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section style={{
            background: 'linear-gradient(135deg, rgba(3, 105, 161, 0.1) 0%, rgba(3, 105, 161, 0.05) 100%)',
            border: '1px solid rgba(3, 105, 161, 0.2)',
            borderRadius: 6,
            padding: '2.5rem',
            textAlign: 'center',
          }}>
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: 'var(--ink)',
              marginBottom: '1rem',
            }}>
              Comienza tu Aventura en Barco
            </h2>
            <p style={{
              fontSize: '.95rem',
              color: 'var(--muted)',
              marginBottom: '1.5rem',
              maxWidth: 500,
              margin: '0 auto 1.5rem',
            }}>
              Explora las playas más hermosas de {props.locality} desde el mar. Disponible en SamBoat.
            </p>
            <a
              href={props.samboatAwinUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              style={{
                display: 'inline-block',
                padding: '1rem 2rem',
                background: '#0369a1',
                color: 'white',
                fontWeight: 700,
                borderRadius: 6,
                textDecoration: 'none',
                transition: 'all .2s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#025b7a'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#0369a1'}
            >
              Ver Barcos Disponibles →
            </a>
          </section>
        </div>
      </main>
    </>
  )
}
