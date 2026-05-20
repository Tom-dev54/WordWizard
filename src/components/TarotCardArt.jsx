// Decorative SVG card faces — sophisticated geometric/symbolic rather than emoji
const PALETTES = [
  { bg: ['#3d5d54', '#1f3329'], accent: '#c4924a', light: '#fdf9f0' },
  { bg: ['#8c4a5e', '#5d2d3d'], accent: '#d4a574', light: '#fdf9f0' },
  { bg: ['#5d4e7a', '#3a2f52'], accent: '#c4924a', light: '#fdf9f0' },
  { bg: ['#7a5f3a', '#4a3a22'], accent: '#fdf9f0', light: '#fefcf6' },
  { bg: ['#2d4a3e', '#1a2e25'], accent: '#d4a574', light: '#fdf9f0' },
]

function pickPalette(id) {
  return PALETTES[id % PALETTES.length]
}

export function CardBack({ size = 'md' }) {
  const W = 200, H = 320
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="cbBg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3d5d54" />
          <stop offset="100%" stopColor="#1f3329" />
        </linearGradient>
        <pattern id="cbPattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.8" fill="#c4924a" opacity="0.3" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#cbBg)" rx="10" />
      <rect width={W} height={H} fill="url(#cbPattern)" rx="10" />
      {/* Decorative frame */}
      <rect x="10" y="10" width={W - 20} height={H - 20} rx="6" fill="none" stroke="#c4924a" strokeWidth="1" opacity="0.4" />
      <rect x="16" y="16" width={W - 32} height={H - 32} rx="4" fill="none" stroke="#c4924a" strokeWidth="0.5" opacity="0.3" />
      {/* Central crescent moon */}
      <g transform={`translate(${W/2}, ${H/2})`}>
        <circle r="42" fill="none" stroke="#c4924a" strokeWidth="1" opacity="0.4" />
        <circle r="32" fill="none" stroke="#c4924a" strokeWidth="0.5" opacity="0.3" />
        <path d="M -18 0 A 18 18 0 1 0 18 0 A 14 14 0 1 1 -18 0 Z" fill="#c4924a" opacity="0.85" />
        {/* Stars */}
        <text y="-58" textAnchor="middle" fill="#c4924a" fontSize="14" opacity="0.8">✦</text>
        <text y="72" textAnchor="middle" fill="#c4924a" fontSize="14" opacity="0.8">✦</text>
        <text x="-58" y="4" textAnchor="middle" fill="#c4924a" fontSize="10" opacity="0.6">✧</text>
        <text x="58" y="4" textAnchor="middle" fill="#c4924a" fontSize="10" opacity="0.6">✧</text>
      </g>
      {/* Corner ornaments */}
      <text x="22" y="32" fill="#c4924a" fontSize="14" opacity="0.5">✦</text>
      <text x={W-22} y="32" textAnchor="end" fill="#c4924a" fontSize="14" opacity="0.5">✦</text>
      <text x="22" y={H-18} fill="#c4924a" fontSize="14" opacity="0.5">✦</text>
      <text x={W-22} y={H-18} textAnchor="end" fill="#c4924a" fontSize="14" opacity="0.5">✦</text>
    </svg>
  )
}

const CARD_SYMBOLS = {
  0:  { primary: 'M -30 30 Q 0 -40, 30 30 Z', // mountain-like flag
        scene: 'fool' },
  1:  { scene: 'magician' },
  2:  { scene: 'priestess' },
  3:  { scene: 'empress' },
  4:  { scene: 'emperor' },
  5:  { scene: 'hierophant' },
  6:  { scene: 'lovers' },
  7:  { scene: 'chariot' },
  8:  { scene: 'strength' },
  9:  { scene: 'hermit' },
  10: { scene: 'wheel' },
  11: { scene: 'justice' },
  12: { scene: 'hanged' },
  13: { scene: 'death' },
  14: { scene: 'temperance' },
  15: { scene: 'devil' },
  16: { scene: 'tower' },
  17: { scene: 'star' },
  18: { scene: 'moon' },
  19: { scene: 'sun' },
  20: { scene: 'judgement' },
  21: { scene: 'world' },
}

function SceneIllustration({ id, palette }) {
  const c = palette.accent
  const l = palette.light
  // Stylized symbolic scenes — minimal SVG
  switch (id) {
    case 0: // Fool
      return (
        <g>
          <circle cx="100" cy="120" r="30" fill={c} opacity="0.6" />
          <path d="M 70 160 L 100 100 L 130 160 Z" fill={c} opacity="0.4" />
          <circle cx="100" cy="120" r="10" fill={l} />
          <path d="M 100 130 L 100 180" stroke={l} strokeWidth="2" />
          <text x="100" y="220" textAnchor="middle" fontSize="40" fill={l} opacity="0.85">✦</text>
        </g>
      )
    case 1: // Magician
      return (
        <g>
          <path d="M 100 70 L 105 110 L 145 115 L 110 130 L 120 170 L 100 145 L 80 170 L 90 130 L 55 115 L 95 110 Z" fill={c} />
          <line x1="100" y1="170" x2="100" y2="220" stroke={l} strokeWidth="3" strokeLinecap="round" />
          <circle cx="100" cy="70" r="6" fill={l} />
        </g>
      )
    case 2: // High Priestess
      return (
        <g>
          {/* Moon */}
          <circle cx="100" cy="110" r="35" fill={l} opacity="0.9" />
          <circle cx="115" cy="105" r="32" fill={palette.bg[1]} />
          {/* Pillars */}
          <rect x="55" y="80" width="6" height="120" fill={c} opacity="0.7" />
          <rect x="139" y="80" width="6" height="120" fill={c} opacity="0.7" />
          <circle cx="58" cy="80" r="5" fill={c} />
          <circle cx="142" cy="80" r="5" fill={c} />
        </g>
      )
    case 3: // Empress
      return (
        <g>
          <circle cx="100" cy="115" r="38" fill={c} opacity="0.85" />
          {/* Crown */}
          <path d="M 75 85 L 80 70 L 88 78 L 95 65 L 102 78 L 110 65 L 118 78 L 125 70 L 130 85 Z" fill={l} />
          {/* Flower */}
          <circle cx="100" cy="180" r="8" fill={l} />
          <circle cx="92" cy="190" r="6" fill={l} opacity="0.7" />
          <circle cx="108" cy="190" r="6" fill={l} opacity="0.7" />
        </g>
      )
    case 4: // Emperor
      return (
        <g>
          {/* Throne */}
          <rect x="65" y="95" width="70" height="105" fill={c} opacity="0.85" />
          <rect x="60" y="85" width="80" height="20" fill={c} />
          {/* Symbols */}
          <text x="100" y="135" textAnchor="middle" fontSize="32" fill={l}>♛</text>
          <rect x="80" y="155" width="40" height="3" fill={l} opacity="0.6" />
        </g>
      )
    case 5: // Hierophant
      return (
        <g>
          <path d="M 100 70 L 75 200 L 125 200 Z" fill={c} opacity="0.7" />
          <circle cx="100" cy="90" r="14" fill={l} />
          <line x1="100" y1="110" x2="100" y2="200" stroke={l} strokeWidth="2" />
          <line x1="85" y1="135" x2="115" y2="135" stroke={l} strokeWidth="2" />
        </g>
      )
    case 6: // Lovers
      return (
        <g>
          <circle cx="78" cy="120" r="20" fill={l} opacity="0.85" />
          <circle cx="122" cy="120" r="20" fill={l} opacity="0.85" />
          <text x="100" y="195" textAnchor="middle" fontSize="36" fill={c}>♡</text>
          <text x="100" y="80" textAnchor="middle" fontSize="20" fill={c}>✦</text>
        </g>
      )
    case 7: // Chariot
      return (
        <g>
          <rect x="60" y="100" width="80" height="60" fill={c} opacity="0.8" rx="4" />
          <circle cx="75" cy="175" r="14" fill={l} opacity="0.7" />
          <circle cx="125" cy="175" r="14" fill={l} opacity="0.7" />
          <circle cx="75" cy="175" r="6" fill={c} />
          <circle cx="125" cy="175" r="6" fill={c} />
          <text x="100" y="135" textAnchor="middle" fontSize="20" fill={l}>★</text>
        </g>
      )
    case 8: // Strength
      return (
        <g>
          <circle cx="100" cy="135" r="42" fill={c} opacity="0.8" />
          <text x="100" y="148" textAnchor="middle" fontSize="40" fill={l}>∞</text>
          <text x="100" y="85" textAnchor="middle" fontSize="14" fill={c}>✦</text>
        </g>
      )
    case 9: // Hermit
      return (
        <g>
          <path d="M 75 80 Q 100 60, 125 80 L 125 200 L 75 200 Z" fill={c} opacity="0.85" />
          <circle cx="100" cy="120" r="14" fill={l} />
          <line x1="100" y1="135" x2="100" y2="180" stroke={l} strokeWidth="2" />
          {/* Lantern */}
          <rect x="135" y="125" width="14" height="18" fill={l} opacity="0.9" />
          <text x="142" y="139" textAnchor="middle" fontSize="10" fill={c}>✦</text>
        </g>
      )
    case 10: // Wheel
      return (
        <g>
          <circle cx="100" cy="130" r="50" fill="none" stroke={c} strokeWidth="2.5" />
          <circle cx="100" cy="130" r="38" fill="none" stroke={l} strokeWidth="1" opacity="0.5" />
          <line x1="100" y1="80" x2="100" y2="180" stroke={c} strokeWidth="2" />
          <line x1="50" y1="130" x2="150" y2="130" stroke={c} strokeWidth="2" />
          <line x1="65" y1="95" x2="135" y2="165" stroke={c} strokeWidth="1.5" opacity="0.7" />
          <line x1="135" y1="95" x2="65" y2="165" stroke={c} strokeWidth="1.5" opacity="0.7" />
          <circle cx="100" cy="130" r="6" fill={l} />
        </g>
      )
    case 11: // Justice
      return (
        <g>
          <line x1="100" y1="90" x2="100" y2="200" stroke={c} strokeWidth="3" />
          <line x1="55" y1="120" x2="145" y2="120" stroke={c} strokeWidth="2.5" />
          <path d="M 55 120 L 45 145 L 65 145 Z" fill={l} opacity="0.85" />
          <path d="M 145 120 L 135 145 L 155 145 Z" fill={l} opacity="0.85" />
          <circle cx="100" cy="90" r="8" fill={l} />
        </g>
      )
    case 12: // Hanged Man
      return (
        <g>
          <line x1="60" y1="80" x2="140" y2="80" stroke={c} strokeWidth="3" />
          <line x1="100" y1="80" x2="100" y2="130" stroke={l} strokeWidth="2" />
          <circle cx="100" cy="145" r="14" fill={c} opacity="0.85" />
          <path d="M 90 160 L 100 200 L 110 160" stroke={c} strokeWidth="2" fill="none" />
          <circle cx="100" cy="200" r="3" fill={l} />
        </g>
      )
    case 13: // Death
      return (
        <g>
          <path d="M 100 90 Q 80 95, 80 120 Q 80 145, 100 150 Q 120 145, 120 120 Q 120 95, 100 90 Z" fill={l} opacity="0.9" />
          <circle cx="92" cy="118" r="3" fill={palette.bg[1]} />
          <circle cx="108" cy="118" r="3" fill={palette.bg[1]} />
          <path d="M 92 135 L 96 132 L 100 135 L 104 132 L 108 135" stroke={palette.bg[1]} strokeWidth="1.5" fill="none" />
          <path d="M 60 180 L 140 180" stroke={c} strokeWidth="3" />
          <path d="M 60 180 L 50 165" stroke={c} strokeWidth="2" />
          <path d="M 140 180 L 150 165" stroke={c} strokeWidth="2" />
        </g>
      )
    case 14: // Temperance
      return (
        <g>
          <circle cx="80" cy="110" r="20" fill={l} opacity="0.85" />
          <circle cx="120" cy="160" r="20" fill={c} opacity="0.85" />
          <path d="M 80 120 Q 100 140, 120 150" stroke={l} strokeWidth="2" fill="none" strokeDasharray="3 3" />
          <text x="100" y="220" textAnchor="middle" fontSize="14" fill={c}>∞</text>
        </g>
      )
    case 15: // Devil
      return (
        <g>
          <circle cx="100" cy="120" r="35" fill={c} opacity="0.85" />
          <path d="M 85 95 L 90 80 M 115 95 L 110 80" stroke={c} strokeWidth="3" strokeLinecap="round" />
          <circle cx="90" cy="115" r="3" fill={l} />
          <circle cx="110" cy="115" r="3" fill={l} />
          <path d="M 85 135 Q 100 145, 115 135" stroke={l} strokeWidth="2" fill="none" />
          {/* chains */}
          <circle cx="75" cy="190" r="4" fill="none" stroke={c} strokeWidth="1.5" />
          <circle cx="125" cy="190" r="4" fill="none" stroke={c} strokeWidth="1.5" />
        </g>
      )
    case 16: // Tower
      return (
        <g>
          <rect x="80" y="100" width="40" height="100" fill={c} opacity="0.85" />
          <path d="M 75 95 L 100 70 L 125 95 Z" fill={c} />
          <path d="M 100 60 L 90 80 L 110 90 L 95 105" stroke={l} strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <rect x="92" y="130" width="8" height="14" fill={l} />
          <rect x="92" y="160" width="8" height="14" fill={l} />
        </g>
      )
    case 17: // Star
      return (
        <g>
          <text x="100" y="115" textAnchor="middle" fontSize="60" fill={l}>✦</text>
          <text x="60" y="95" textAnchor="middle" fontSize="18" fill={c}>✧</text>
          <text x="140" y="100" textAnchor="middle" fontSize="22" fill={c}>✧</text>
          <text x="65" y="170" textAnchor="middle" fontSize="14" fill={c}>·</text>
          <text x="135" y="165" textAnchor="middle" fontSize="14" fill={c}>·</text>
          {/* Water */}
          <path d="M 50 200 Q 75 195, 100 200 T 150 200" stroke={c} strokeWidth="2" fill="none" />
          <path d="M 50 212 Q 75 207, 100 212 T 150 212" stroke={c} strokeWidth="1.5" fill="none" opacity="0.6" />
        </g>
      )
    case 18: // Moon
      return (
        <g>
          <circle cx="100" cy="115" r="42" fill={l} opacity="0.95" />
          <circle cx="115" cy="108" r="38" fill={palette.bg[1]} />
          {/* Face */}
          <circle cx="93" cy="105" r="2.5" fill={palette.bg[1]} />
          <path d="M 88 120 Q 95 124, 100 120" stroke={palette.bg[1]} strokeWidth="1.5" fill="none" />
          {/* Drops */}
          <text x="70" y="175" textAnchor="middle" fontSize="14" fill={c} opacity="0.6">·</text>
          <text x="100" y="190" textAnchor="middle" fontSize="14" fill={c} opacity="0.6">·</text>
          <text x="130" y="175" textAnchor="middle" fontSize="14" fill={c} opacity="0.6">·</text>
        </g>
      )
    case 19: // Sun
      return (
        <g>
          <circle cx="100" cy="125" r="32" fill={l} />
          {/* Rays */}
          {Array.from({ length: 12 }).map((_, i) => {
            const a = (i * 30) * Math.PI / 180
            return (
              <line key={i}
                x1={100 + 40 * Math.cos(a)} y1={125 + 40 * Math.sin(a)}
                x2={100 + 56 * Math.cos(a)} y2={125 + 56 * Math.sin(a)}
                stroke={l} strokeWidth="2.5" strokeLinecap="round"
              />
            )
          })}
          <circle cx="100" cy="125" r="22" fill={c} opacity="0.4" />
        </g>
      )
    case 20: // Judgement
      return (
        <g>
          <path d="M 100 75 L 88 105 L 112 105 Z" fill={l} />
          <line x1="88" y1="105" x2="112" y2="105" stroke={c} strokeWidth="2" />
          <line x1="100" y1="105" x2="100" y2="160" stroke={l} strokeWidth="2" />
          <path d="M 75 195 L 125 195" stroke={c} strokeWidth="3" />
          <text x="100" y="185" textAnchor="middle" fontSize="20" fill={l}>♪</text>
        </g>
      )
    case 21: // World
      return (
        <g>
          <ellipse cx="100" cy="135" rx="42" ry="55" fill="none" stroke={c} strokeWidth="2.5" />
          <circle cx="100" cy="135" r="20" fill={c} opacity="0.4" />
          {/* Corner symbols */}
          <text x="55" y="85" textAnchor="middle" fontSize="14" fill={c}>♌</text>
          <text x="145" y="85" textAnchor="middle" fontSize="14" fill={c}>♉</text>
          <text x="55" y="205" textAnchor="middle" fontSize="14" fill={c}>♏</text>
          <text x="145" y="205" textAnchor="middle" fontSize="14" fill={c}>♒</text>
        </g>
      )
    default:
      return <text x="100" y="140" textAnchor="middle" fontSize="60" fill={l}>✦</text>
  }
}

export function CardFace({ card, reversed = false }) {
  if (!card) return null
  const palette = pickPalette(card.id)
  const W = 200, H = 320

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`bg-${card.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={palette.bg[0]} />
          <stop offset="100%" stopColor={palette.bg[1]} />
        </linearGradient>
        <linearGradient id={`accent-${card.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={palette.accent} stopOpacity="0.1" />
          <stop offset="100%" stopColor={palette.accent} stopOpacity="0.3" />
        </linearGradient>
      </defs>

      <g transform={reversed ? `rotate(180 ${W/2} ${H/2})` : ''}>
        <rect width={W} height={H} fill={`url(#bg-${card.id})`} rx="10" />
        {/* Decorative frame */}
        <rect x="8" y="8" width={W-16} height={H-16} rx="6" fill="none" stroke={palette.accent} strokeWidth="1" opacity="0.5" />
        <rect x="14" y="14" width={W-28} height={H-28} rx="4" fill="none" stroke={palette.accent} strokeWidth="0.5" opacity="0.3" />

        {/* Top number plate */}
        <text x={W/2} y="35" textAnchor="middle" fontSize="11"
          fill={palette.accent} fontFamily="Playfair Display, serif"
          letterSpacing="2">
          {card.number}
        </text>
        <line x1="60" y1="42" x2={W-60} y2="42" stroke={palette.accent} strokeWidth="0.5" opacity="0.5" />

        {/* Illustration */}
        <SceneIllustration id={card.id} palette={palette} />

        {/* Bottom name plate */}
        <line x1="60" y1={H-50} x2={W-60} y2={H-50} stroke={palette.accent} strokeWidth="0.5" opacity="0.5" />
        <text x={W/2} y={H-30} textAnchor="middle" fontSize="14"
          fill={palette.light} fontFamily="Playfair Display, serif"
          letterSpacing="3" fontWeight="600">
          {card.nameCN}
        </text>
      </g>
    </svg>
  )
}

export function MiniCard({ card, size = 60 }) {
  const palette = pickPalette(card.id)
  return (
    <div style={{
      width: size, height: size * 1.5, borderRadius: 6, overflow: 'hidden',
      background: `linear-gradient(135deg, ${palette.bg[0]}, ${palette.bg[1]})`,
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      flexShrink: 0,
      boxShadow: '0 2px 6px rgba(45,38,24,0.15)',
    }}>
      <div style={{ fontSize: size * 0.35, color: palette.accent }}>
        {['✦','◊','☽','✧','♛','✟','♡','★','∞','✦','☸','⚖','✦','✦','∞','✦','✦','✦','☽','☼','♪','◯'][card.id] || '✦'}
      </div>
      <div style={{ fontSize: 7, color: palette.light, marginTop: 4, letterSpacing: '0.1em', fontFamily: 'Playfair Display, serif' }}>
        {card.nameCN}
      </div>
    </div>
  )
}
