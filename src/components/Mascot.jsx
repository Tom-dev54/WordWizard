export default function Mascot({ size = 40, mood = 'happy' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      style={{ display: 'block' }}
    >
      <defs>
        <radialGradient id="mascotBody" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#3d5d54" />
          <stop offset="100%" stopColor="#1f3329" />
        </radialGradient>
        <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8c4a5e" />
          <stop offset="100%" stopColor="#6e3848" />
        </linearGradient>
      </defs>
      {/* Body (ghost/spirit) */}
      <path
        d="M 20 38 Q 20 18, 40 18 Q 60 18, 60 38 L 60 62 Q 56 66, 52 62 Q 48 66, 44 62 Q 40 66, 36 62 Q 32 66, 28 62 Q 24 66, 20 62 Z"
        fill="url(#mascotBody)"
      />
      {/* Hat (wizard) */}
      <path
        d="M 28 22 L 40 4 L 52 22 Z"
        fill="url(#hatGrad)"
      />
      <ellipse cx="40" cy="22" rx="14" ry="3" fill="#6e3848" />
      <circle cx="40" cy="9" r="2" fill="#c4924a" />
      {/* Eyes */}
      {mood === 'happy' ? (
        <>
          <path d="M 31 36 Q 33 33, 35 36" stroke="#fdf9f0" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M 45 36 Q 47 33, 49 36" stroke="#fdf9f0" strokeWidth="2" fill="none" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="33" cy="36" r="2" fill="#fdf9f0" />
          <circle cx="47" cy="36" r="2" fill="#fdf9f0" />
        </>
      )}
      {/* Tiny star */}
      <text x="40" y="48" textAnchor="middle" fontSize="8" fill="#c4924a">✦</text>
      {/* Sparkles */}
      <circle cx="14" cy="30" r="1" fill="#c4924a" opacity="0.7" />
      <circle cx="66" cy="34" r="1.5" fill="#c4924a" opacity="0.7" />
      <circle cx="68" cy="50" r="1" fill="#8c4a5e" opacity="0.6" />
    </svg>
  )
}
