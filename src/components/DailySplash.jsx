import { useState, useEffect } from 'react'
import { getDailyIntention } from '../pages/Home'

const MOON_PHASES = [
  { icon: '🌑', name: '新月' },
  { icon: '🌒', name: '峨眉月' },
  { icon: '🌓', name: '上弦月' },
  { icon: '🌔', name: '盈凸月' },
  { icon: '🌕', name: '满月' },
  { icon: '🌖', name: '亏凸月' },
  { icon: '🌗', name: '下弦月' },
  { icon: '🌘', name: '残月' },
]

export default function DailySplash({ onDone }) {
  const [leaving, setLeaving] = useState(false)
  const [stars] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 1,
      opacity: Math.random() * 0.6 + 0.2,
      delay: Math.random() * 4,
    }))
  )

  const intention = getDailyIntention()
  const today = new Date()
  const dateLabel = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  const phaseIdx = Math.floor((today.getDate() % 30) / 4)
  const phase = MOON_PHASES[phaseIdx]

  function handleDone() {
    setLeaving(true)
    setTimeout(onDone, 500)
  }

  useEffect(() => {
    const t = setTimeout(handleDone, 6000)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      onClick={handleDone}
      style={{
        position: 'fixed', inset: 0, zIndex: 250,
        background: 'linear-gradient(160deg, #0e1c16 0%, #1a2e25 50%, #111e18 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.03)' : 'scale(1)',
        transition: 'opacity 0.5s ease, transform 0.5s ease',
      }}
    >
      {stars.map(s => (
        <span key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          fontSize: s.size * 4,
          color: '#c4924a', opacity: s.opacity,
          animation: `pulse-soft ${2 + s.delay}s ease-in-out ${s.delay}s infinite`,
        }}>✦</span>
      ))}

      <div style={{ textAlign: 'center', padding: '0 40px', position: 'relative', zIndex: 1 }}>
        <div style={{
          fontSize: 56, marginBottom: 8,
          animation: 'float-slow 4s ease-in-out infinite',
        }}>
          {phase.icon}
        </div>
        <p style={{
          fontSize: 11, color: 'rgba(196,146,74,0.7)',
          letterSpacing: '0.25em', marginBottom: 6,
          fontWeight: 500,
        }}>
          {phase.name} · {dateLabel}
        </p>

        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, #c4924a, transparent)',
          margin: '14px auto',
        }} />

        <p style={{
          fontSize: 11, color: 'rgba(196,146,74,0.55)',
          letterSpacing: '0.2em', marginBottom: 16, fontWeight: 600,
        }}>TODAY'S INTENTION</p>

        <p className="serif" style={{
          fontSize: 20, color: '#fdf9f0', lineHeight: 1.8,
          fontWeight: 400, maxWidth: 280,
          animation: 'fade-up 0.8s ease-out 0.3s both',
        }}>
          {intention.text}
        </p>

        <div style={{
          width: 40, height: 1,
          background: 'linear-gradient(90deg, transparent, #c4924a, transparent)',
          margin: '20px auto',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(196,146,74,0.15)',
          border: '1px solid rgba(196,146,74,0.3)',
          borderRadius: 999, padding: '10px 22px',
          color: '#e8c06a', fontSize: 13,
          animation: 'fade-up 0.8s ease-out 0.6s both',
        }}>
          开始今日旅程 ✦
        </div>

        <p style={{
          fontSize: 10, color: 'rgba(196,146,74,0.3)',
          marginTop: 28, letterSpacing: '0.1em',
        }}>
          轻触任意处继续
        </p>
      </div>
    </div>
  )
}
