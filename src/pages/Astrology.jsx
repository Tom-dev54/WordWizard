import { useState } from 'react'
import { ZODIAC_SIGNS, getZodiacByDate, getZodiacDegree } from '../data/zodiacData'

function ZodiacWheel({ highlightId }) {
  const size = 280
  const cx = size / 2, cy = size / 2
  const outerR = 125, innerR = 85, labelR = 108

  const elementColors = { '火': '#ef4444', '土': '#22c55e', '风': '#eab308', '水': '#3b82f6' }

  return (
    <svg
      width={size} height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="zodiac-wheel"
      style={{ display: 'block', margin: '0 auto' }}
    >
      <defs>
        <radialGradient id="wheelBg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(124,58,237,0.1)" />
          <stop offset="100%" stopColor="rgba(8,8,24,0.8)" />
        </radialGradient>
        {ZODIAC_SIGNS.map(sign => (
          <radialGradient key={`grad-${sign.id}`} id={`grad-${sign.id}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={sign.colors[0]} stopOpacity="0.9" />
            <stop offset="100%" stopColor={sign.colors[1]} stopOpacity="0.7" />
          </radialGradient>
        ))}
      </defs>

      {/* Background */}
      <circle cx={cx} cy={cy} r={outerR + 5} fill="url(#wheelBg)" />
      <circle cx={cx} cy={cy} r={outerR + 5} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startAngle = (i * 30 - 90) * (Math.PI / 180)
        const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180)
        const isHighlighted = sign.id === highlightId

        const x1 = cx + outerR * Math.cos(startAngle)
        const y1 = cy + outerR * Math.sin(startAngle)
        const x2 = cx + outerR * Math.cos(endAngle)
        const y2 = cy + outerR * Math.sin(endAngle)
        const x3 = cx + innerR * Math.cos(endAngle)
        const y3 = cy + innerR * Math.sin(endAngle)
        const x4 = cx + innerR * Math.cos(startAngle)
        const y4 = cy + innerR * Math.sin(startAngle)

        const midAngle = (startAngle + endAngle) / 2
        const lx = cx + labelR * Math.cos(midAngle)
        const ly = cy + labelR * Math.sin(midAngle)

        const color = elementColors[sign.element] || '#7c3aed'

        return (
          <g key={sign.id}>
            <path
              d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`}
              fill={isHighlighted ? color : `${color}20`}
              stroke={isHighlighted ? color : 'rgba(255,255,255,0.08)'}
              strokeWidth={isHighlighted ? 1.5 : 0.5}
              style={{ transition: 'all 0.5s ease' }}
            />
            <text
              x={lx} y={ly}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isHighlighted ? 14 : 11}
              fill={isHighlighted ? 'white' : 'rgba(255,255,255,0.4)'}
              style={{ transition: 'all 0.5s ease', fontFamily: 'sans-serif' }}
            >
              {sign.symbol}
            </text>
          </g>
        )
      })}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="#0f0f2e" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

      {/* Center text */}
      {highlightId ? (
        <>
          <text x={cx} y={cy - 12} textAnchor="middle" fontSize="22"
            fill="white" fontFamily="sans-serif">
            {ZODIAC_SIGNS.find(s => s.id === highlightId)?.symbol}
          </text>
          <text x={cx} y={cy + 12} textAnchor="middle" fontSize="11"
            fill="rgba(255,255,255,0.6)" fontFamily="Inter, sans-serif" letterSpacing="1">
            {ZODIAC_SIGNS.find(s => s.id === highlightId)?.name}
          </text>
        </>
      ) : (
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="11"
          fill="rgba(255,255,255,0.3)" fontFamily="Cinzel, serif" letterSpacing="2">
          ORACLE
        </text>
      )}

      {/* Dividers */}
      {ZODIAC_SIGNS.map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        return (
          <line key={i}
            x1={cx + innerR * Math.cos(angle)} y1={cy + innerR * Math.sin(angle)}
            x2={cx + outerR * Math.cos(angle)} y2={cy + outerR * Math.sin(angle)}
            stroke="rgba(255,255,255,0.12)" strokeWidth="0.5"
          />
        )
      })}
    </svg>
  )
}

function SignDetail({ sign }) {
  return (
    <div style={{ animation: 'slideUp 0.5s ease-out' }}>
      {/* Header */}
      <div
        style={{
          borderRadius: 20,
          padding: 20,
          marginBottom: 16,
          background: `linear-gradient(135deg, ${sign.colors[0]}20, ${sign.colors[1]}10)`,
          border: `1px solid ${sign.colors[0]}40`,
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
          <div style={{
            width: 60, height: 60, borderRadius: '50%',
            background: `linear-gradient(135deg, ${sign.colors[0]}, ${sign.colors[1]})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, boxShadow: `0 8px 24px ${sign.colors[0]}50`,
          }}>
            {sign.symbol}
          </div>
          <div>
            <h2 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#f1f5f9', marginBottom: 4 }}>
              {sign.name}
            </h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{sign.dates}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            { label: '元素', value: sign.element, icon: '🌊' },
            { label: '主星', value: sign.ruler, icon: '🪐' },
            { label: '类型', value: sign.quality, icon: '⚡' },
          ].map(item => (
            <div key={item.label} style={{
              flex: 1, minWidth: 70,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 12, padding: '10px 12px',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, marginBottom: 4 }}>{item.icon}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 12, color: '#f1f5f9', fontWeight: 600 }}>{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Traits */}
      <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '0.1em' }}>性格特质</p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {sign.traits.map(t => (
            <span key={t} style={{
              fontSize: 12, padding: '5px 12px',
              background: `${sign.colors[0]}20`,
              border: `1px solid ${sign.colors[0]}40`,
              borderRadius: 20, color: sign.colors[0],
            }}>{t}</span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 10, letterSpacing: '0.1em' }}>星座解析</p>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>{sign.description}</p>
      </div>

      {/* Love & Career */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
        {[
          { title: '爱情运势', content: sign.love, icon: '♡' },
          { title: '事业发展', content: sign.career, icon: '★' },
        ].map(item => (
          <div key={item.title} className="glass" style={{ borderRadius: 16, padding: 14 }}>
            <p style={{ fontSize: 12, color: '#f59e0b', marginBottom: 8 }}>{item.icon} {item.title}</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>{item.content.slice(0, 60)}…</p>
          </div>
        ))}
      </div>

      {/* Lucky */}
      <div className="glass" style={{ borderRadius: 16, padding: 16, marginBottom: 12 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '0.1em' }}>幸运元素</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: '幸运数字', value: sign.lucky.number },
            { label: '幸运颜色', value: sign.lucky.color },
            { label: '守护宝石', value: sign.lucky.stone },
            { label: '幸运日', value: sign.lucky.day },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 3 }}>{item.value}</p>
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.35)' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Compatibility */}
      <div className="glass" style={{ borderRadius: 16, padding: 16 }}>
        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 12, letterSpacing: '0.1em' }}>最佳配对</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {sign.compatibility.map(comp => {
            const s = ZODIAC_SIGNS.find(z => z.name === comp)
            return (
              <div key={comp} style={{
                flex: 1, textAlign: 'center',
                background: `${sign.colors[0]}10`,
                borderRadius: 12, padding: '10px 8px',
                border: `1px solid ${sign.colors[0]}25`,
              }}>
                <p style={{ fontSize: 18, marginBottom: 4 }}>{s?.symbol || '⭐'}</p>
                <p style={{ fontSize: 11, color: '#f1f5f9' }}>{comp}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default function Astrology() {
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [result, setResult] = useState(null)
  const [browsing, setBrowsing] = useState(null)
  const [visible, setVisible] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!month || !day) return
    const signId = getZodiacByDate(month, day)
    const sign = ZODIAC_SIGNS.find(s => s.id === signId)
    setResult(sign)
    setVisible(true)
  }

  const displaySign = result || browsing

  return (
    <div style={{ padding: '60px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', color: '#60a5fa', marginBottom: 8, textTransform: 'uppercase' }}>
          ✦ Birth Chart ✦
        </p>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: '#f1f5f9' }}>星座星盘</h1>
      </div>

      {/* Wheel */}
      <div style={{ marginBottom: 28 }}>
        <ZodiacWheel highlightId={displaySign?.id} />
      </div>

      {/* Input */}
      <div className="glass" style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginBottom: 14 }}>输入你的生日，解读你的星座</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>月份</label>
            <input
              type="number" min="1" max="12" placeholder="1-12"
              value={month}
              onChange={e => setMonth(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, color: '#f1f5f9',
                fontSize: 15, outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>日期</label>
            <input
              type="number" min="1" max="31" placeholder="1-31"
              value={day}
              onChange={e => setDay(e.target.value)}
              style={{
                width: '100%', padding: '12px 14px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                borderRadius: 12, color: '#f1f5f9',
                fontSize: 15, outline: 'none',
              }}
            />
          </div>
          <button
            type="submit"
            style={{
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #0ea5e9, #3b82f6)',
              border: 'none', borderRadius: 12,
              color: 'white', fontSize: 14, cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(14,165,233,0.35)',
              flexShrink: 0,
            }}
          >
            解析
          </button>
        </form>
      </div>

      {/* Result */}
      {displaySign && <SignDetail sign={displaySign} />}

      {/* Browse all signs */}
      {!displaySign && (
        <>
          <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginBottom: 14, letterSpacing: '0.08em', textAlign: 'center' }}>
            — 或直接浏览十二星座 —
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {ZODIAC_SIGNS.map(sign => (
              <button
                key={sign.id}
                onClick={() => setBrowsing(sign)}
                style={{
                  background: `${sign.colors[0]}15`,
                  border: `1px solid ${sign.colors[0]}30`,
                  borderRadius: 14, padding: '12px 8px',
                  cursor: 'pointer', textAlign: 'center',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
              >
                <p style={{ fontSize: 22, marginBottom: 4 }}>{sign.symbol}</p>
                <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{sign.name}</p>
              </button>
            ))}
          </div>
        </>
      )}

      {displaySign && (
        <button
          onClick={() => { setResult(null); setBrowsing(null) }}
          style={{
            width: '100%', marginTop: 16, padding: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, color: 'rgba(255,255,255,0.5)',
            fontSize: 13, cursor: 'pointer',
          }}
        >
          浏览其他星座
        </button>
      )}
    </div>
  )
}
