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

const STARS = Array.from({ length: 36 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 2.8 + 0.8,
  opacity: Math.random() * 0.55 + 0.15,
  delay: Math.random() * 5,
}))

const METEORS = [
  { id: 0, x: 8,  y: 4,  delay: 0.8, duration: 2.2, len: 110 },
  { id: 1, x: 38, y: 2,  delay: 3.5, duration: 1.8, len: 80  },
  { id: 2, x: 62, y: 7,  delay: 6.0, duration: 2.5, len: 130 },
  { id: 3, x: 82, y: 1,  delay: 1.8, duration: 2.0, len: 95  },
  { id: 4, x: 25, y: 12, delay: 9.0, duration: 2.8, len: 100 },
  { id: 5, x: 72, y: 20, delay: 4.5, duration: 1.6, len: 70  },
]

export default function DailySplash({ onDone }) {
  const [phase, setPhase] = useState(0)
  const [leaving, setLeaving] = useState(false)

  const intention = getDailyIntention()
  const today = new Date()
  const dateLabel = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  const phaseIdx = Math.floor((today.getDate() % 30) / 4)
  const moonPhase = MOON_PHASES[phaseIdx]

  function handleDone() {
    if (leaving) return
    setLeaving(true)
    setTimeout(onDone, 600)
  }

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 400)
    const t2 = setTimeout(() => setPhase(2), 900)
    const t3 = setTimeout(() => setPhase(3), 1500)
    const t4 = setTimeout(handleDone, 7000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4) }
  }, [])

  return (
    <div
      onClick={handleDone}
      style={{
        position: 'fixed', inset: 0, zIndex: 250,
        background: 'linear-gradient(165deg, #060e0a 0%, #0e1c16 30%, #152d22 60%, #0a1510 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', userSelect: 'none', overflow: 'hidden',
        opacity: leaving ? 0 : 1,
        transform: leaving ? 'scale(1.04)' : 'scale(1)',
        transition: 'opacity 0.6s ease, transform 0.6s ease',
      }}
    >
      {/* Nebula glows */}
      <div style={{
        position: 'absolute', width: 320, height: 320, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(45,74,62,0.35) 0%, transparent 70%)',
        top: '15%', left: '30%', transform: 'translate(-50%, -50%)',
        animation: 'nebula 8s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', width: 240, height: 240, borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(196,146,74,0.12) 0%, transparent 70%)',
        bottom: '20%', right: '20%',
        animation: 'nebula 10s ease-in-out 2s infinite',
        pointerEvents: 'none',
      }} />

      {/* Stars */}
      {STARS.map(s => (
        <span key={s.id} style={{
          position: 'absolute',
          left: `${s.x}%`, top: `${s.y}%`,
          fontSize: s.size * 5,
          color: '#c4924a', opacity: s.opacity,
          animation: `pulse-soft ${2.5 + s.delay * 0.4}s ease-in-out ${s.delay * 0.3}s infinite`,
          pointerEvents: 'none',
        }}>✦</span>
      ))}

      {/* Meteors */}
      {METEORS.map(m => (
        <div key={m.id} style={{
          position: 'absolute',
          left: `${m.x}%`,
          top: `${m.y}%`,
          width: m.len,
          height: 1.5,
          background: 'linear-gradient(90deg, rgba(220,200,150,0.9), rgba(196,146,74,0.6), transparent)',
          borderRadius: 4,
          transform: 'rotate(35deg)',
          transformOrigin: 'left center',
          animation: `meteor ${m.duration}s ease-in ${m.delay}s infinite`,
          pointerEvents: 'none',
        }} />
      ))}

      {/* Main content */}
      <div style={{
        textAlign: 'center', padding: '0 44px', position: 'relative', zIndex: 1,
        opacity: phase >= 1 ? 1 : 0,
        transform: phase >= 1 ? 'translateY(0)' : 'translateY(20px)',
        transition: 'opacity 0.7s ease, transform 0.7s ease',
      }}>
        {/* Moon */}
        <div style={{
          fontSize: 64, marginBottom: 10,
          animation: 'float-slow 5s ease-in-out infinite',
          filter: 'drop-shadow(0 0 18px rgba(196,146,74,0.4))',
        }}>
          {moonPhase.icon}
        </div>

        <p style={{
          fontSize: 11, color: 'rgba(196,146,74,0.75)',
          letterSpacing: '0.28em', marginBottom: 4,
          fontWeight: 600,
        }}>
          {moonPhase.name} · {dateLabel}
        </p>

        {/* Ornament */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, margin: '16px auto',
          opacity: phase >= 2 ? 1 : 0,
          transition: 'opacity 0.6s ease 0.2s',
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,146,74,0.5))' }} />
          <span style={{ color: 'rgba(196,146,74,0.6)', fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(196,146,74,0.5), transparent)' }} />
        </div>

        <p style={{
          fontSize: 10, color: 'rgba(196,146,74,0.6)',
          letterSpacing: '0.22em', marginBottom: 14, fontWeight: 600,
          opacity: phase >= 2 ? 1 : 0, transition: 'opacity 0.5s ease 0.3s',
        }}>
          今日意图
        </p>

        <p className="serif" style={{
          fontSize: 21, color: '#fdf9f0', lineHeight: 1.9,
          fontWeight: 400, maxWidth: 290,
          opacity: phase >= 2 ? 1 : 0,
          transform: phase >= 2 ? 'translateY(0)' : 'translateY(10px)',
          transition: 'opacity 0.7s ease 0.4s, transform 0.7s ease 0.4s',
        }}>
          {intention.text}
        </p>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, margin: '18px auto',
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 0.5s ease 0.1s',
        }}>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,146,74,0.4))' }} />
          <span style={{ color: 'rgba(196,146,74,0.5)', fontSize: 10 }}>✦</span>
          <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(196,146,74,0.4), transparent)' }} />
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 10,
          background: 'rgba(196,146,74,0.13)',
          border: '1px solid rgba(196,146,74,0.3)',
          borderRadius: 999, padding: '11px 26px',
          color: '#e8c06a', fontSize: 13,
          opacity: phase >= 3 ? 1 : 0,
          transform: phase >= 3 ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s',
          boxShadow: '0 0 24px rgba(196,146,74,0.15)',
        }}>
          开始今日旅程 ✦
        </div>

        <p style={{
          fontSize: 10, color: 'rgba(196,146,74,0.28)',
          marginTop: 32, letterSpacing: '0.12em',
          opacity: phase >= 3 ? 1 : 0, transition: 'opacity 0.5s ease 0.5s',
        }}>
          轻触任意处继续
        </p>
      </div>
    </div>
  )
}
