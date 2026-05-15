import { useMemo } from 'react'

export default function FloatingParticles() {
  const particles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 2,
      delay: Math.random() * 8,
      duration: Math.random() * 25 + 30,
      opacity: Math.random() * 0.25 + 0.1,
      type: Math.random() > 0.6 ? '✦' : Math.random() > 0.5 ? '✧' : '·',
    }))
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 0,
        overflow: 'hidden',
      }}
    >
      {particles.map(p => (
        <span
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size * 4,
            color: '#c4924a',
            opacity: p.opacity,
            animation: `float-slow ${p.duration / 5}s ease-in-out ${p.delay}s infinite`,
            userSelect: 'none',
          }}
        >
          {p.type}
        </span>
      ))}
    </div>
  )
}
