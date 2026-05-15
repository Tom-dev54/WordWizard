import { useMemo } from 'react'

export default function StarBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 120 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      opacity: Math.random() * 0.7 + 0.3,
    }))
  }, [])

  const nebulae = useMemo(() => [
    { x: 15, y: 20, size: 300, color: 'rgba(124,58,237,0.08)' },
    { x: 80, y: 60, size: 250, color: 'rgba(59,130,246,0.06)' },
    { x: 50, y: 85, size: 200, color: 'rgba(245,158,11,0.04)' },
    { x: 30, y: 70, size: 180, color: 'rgba(124,58,237,0.05)' },
  ], [])

  return (
    <div className="stars-container">
      {nebulae.map((n, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: `${n.x}%`,
            top: `${n.y}%`,
            width: n.size,
            height: n.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${n.color} 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            filter: 'blur(40px)',
          }}
        />
      ))}
      {stars.map((star) => (
        <div
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: star.size,
            height: star.size,
            opacity: star.opacity,
            animation: `twinkle ${star.duration}s ease-in-out ${star.delay}s infinite`,
          }}
        />
      ))}
    </div>
  )
}
