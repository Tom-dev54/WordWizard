import { useState } from 'react'
import { ZODIAC_SIGNS, getZodiacByDate } from '../data/zodiacData'

const ELEMENT_COLORS = {
  '火': '#c44a3e', '土': '#5c7a3e', '风': '#c4924a', '水': '#3e6c8c',
}

function ZodiacWheel({ highlightId }) {
  const size = 280
  const cx = size / 2, cy = size / 2
  const outerR = 130, innerR = 88, labelR = 110

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}
      style={{ display: 'block', margin: '0 auto', filter: 'drop-shadow(0 4px 16px rgba(196,146,74,0.2))' }}
    >
      <defs>
        <radialGradient id="wheelCenter" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fdf9f0" />
          <stop offset="100%" stopColor="#f5ecd9" />
        </radialGradient>
      </defs>

      {/* Outer ring */}
      <circle cx={cx} cy={cy} r={outerR + 4} fill="none" stroke="#c4924a" strokeWidth="1" opacity="0.4" />

      {/* Segments */}
      {ZODIAC_SIGNS.map((sign, i) => {
        const startAngle = (i * 30 - 90) * (Math.PI / 180)
        const endAngle = ((i + 1) * 30 - 90) * (Math.PI / 180)
        const isHi = sign.id === highlightId

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

        const color = ELEMENT_COLORS[sign.element]

        return (
          <g key={sign.id}>
            <path
              d={`M ${x1} ${y1} A ${outerR} ${outerR} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 0 0 ${x4} ${y4} Z`}
              fill={isHi ? color : '#faf4e8'}
              stroke={isHi ? color : '#e6d4b0'}
              strokeWidth={isHi ? 1.5 : 0.5}
              style={{ transition: 'all 0.5s ease' }}
              opacity={isHi ? 0.9 : 1}
            />
            <text
              x={lx} y={ly + 2}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={isHi ? 16 : 13}
              fill={isHi ? '#fdf9f0' : color}
              style={{ transition: 'all 0.5s ease' }}
            >
              {sign.symbol}
            </text>
          </g>
        )
      })}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={innerR} fill="url(#wheelCenter)" stroke="#c4924a" strokeWidth="1" opacity="0.9" />
      <circle cx={cx} cy={cy} r={innerR - 6} fill="none" stroke="#c4924a" strokeWidth="0.5" opacity="0.3" strokeDasharray="2 3" />

      {/* Center */}
      {highlightId ? (
        <>
          <text x={cx} y={cy - 14} textAnchor="middle" fontSize="32" fill={ELEMENT_COLORS[ZODIAC_SIGNS.find(s => s.id === highlightId).element]}>
            {ZODIAC_SIGNS.find(s => s.id === highlightId).symbol}
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="13"
            fill="#2d2618" fontFamily="Playfair Display, serif" fontWeight="600">
            {ZODIAC_SIGNS.find(s => s.id === highlightId).name}
          </text>
          <text x={cx} y={cy + 28} textAnchor="middle" fontSize="9" fill="#8a7a5e" letterSpacing="1">
            {ZODIAC_SIGNS.find(s => s.id === highlightId).element}象星座
          </text>
        </>
      ) : (
        <>
          <text x={cx} y={cy - 4} textAnchor="middle" fontSize="11" fill="#8a7a5e" letterSpacing="3" fontFamily="Playfair Display, serif">
            ZODIAC
          </text>
          <text x={cx} y={cy + 14} textAnchor="middle" fontSize="9" fill="#8a7a5e" letterSpacing="2">
            WHEEL
          </text>
        </>
      )}

      {/* Dividers */}
      {ZODIAC_SIGNS.map((_, i) => {
        const angle = (i * 30 - 90) * (Math.PI / 180)
        return (
          <line key={i}
            x1={cx + innerR * Math.cos(angle)} y1={cy + innerR * Math.sin(angle)}
            x2={cx + outerR * Math.cos(angle)} y2={cy + outerR * Math.sin(angle)}
            stroke="#c4924a" strokeWidth="0.4" opacity="0.5"
          />
        )
      })}
    </svg>
  )
}

function SignDetail({ sign }) {
  const color = ELEMENT_COLORS[sign.element]

  return (
    <div className="animate-fade-up">
      <div
        className="card-soft"
        style={{
          padding: 20, marginBottom: 14,
          background: `linear-gradient(135deg, ${color}10, #fefcf6)`,
          borderLeft: `4px solid ${color}`,
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 14 }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 32, color: '#fdf9f0',
            boxShadow: `0 6px 16px ${color}40`,
          }}>
            {sign.symbol}
          </div>
          <div>
            <h2 className="serif" style={{ fontSize: 24, color: '#2d2618', marginBottom: 2 }}>
              {sign.name}
            </h2>
            <p style={{ fontSize: 11, color: '#8a7a5e', fontStyle: 'italic' }}>{sign.en}</p>
            <p style={{ fontSize: 11, color: '#5a4a3a', marginTop: 4 }}>{sign.dates}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 10 }}>
            <p style={{ fontSize: 9, color: '#8a7a5e', letterSpacing: '0.1em', marginBottom: 4 }}>元素</p>
            <p style={{ fontSize: 13, color, fontWeight: 600 }}>{sign.element}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 10 }}>
            <p style={{ fontSize: 9, color: '#8a7a5e', letterSpacing: '0.1em', marginBottom: 4 }}>主星</p>
            <p style={{ fontSize: 13, color: '#2d2618', fontWeight: 600 }}>{sign.ruler}</p>
          </div>
          <div style={{ flex: 1, textAlign: 'center', padding: 10, background: 'rgba(255,255,255,0.7)', borderRadius: 10 }}>
            <p style={{ fontSize: 9, color: '#8a7a5e', letterSpacing: '0.1em', marginBottom: 4 }}>类型</p>
            <p style={{ fontSize: 13, color: '#2d2618', fontWeight: 600 }}>{sign.quality}</p>
          </div>
        </div>
      </div>

      <div className="card-soft" style={{ padding: 16, marginBottom: 14 }}>
        <p className="section-sub" style={{ marginBottom: 10 }}>性格特质</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sign.traits.map(t => (
            <span key={t} className="pill" style={{ background: `${color}15`, color }}>{t}</span>
          ))}
        </div>
      </div>

      <div className="card-soft" style={{ padding: 18, marginBottom: 14 }}>
        <p className="section-sub" style={{ marginBottom: 10 }}>星座解析</p>
        <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.9 }}>{sign.description}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div className="card-soft" style={{ padding: 16 }}>
          <p style={{ fontSize: 13, color: '#c4924a', marginBottom: 6, fontWeight: 600 }}>♡ 爱情运势</p>
          <p style={{ fontSize: 11, color: '#5a4a3a', lineHeight: 1.7 }}>{sign.love}</p>
        </div>
        <div className="card-soft" style={{ padding: 16 }}>
          <p style={{ fontSize: 13, color: '#2d4a3e', marginBottom: 6, fontWeight: 600 }}>★ 事业发展</p>
          <p style={{ fontSize: 11, color: '#5a4a3a', lineHeight: 1.7 }}>{sign.career}</p>
        </div>
      </div>

      <div className="card-soft" style={{ padding: 16, marginBottom: 14 }}>
        <p className="section-sub" style={{ marginBottom: 12 }}>幸运元素</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { label: '数字', value: sign.lucky.number },
            { label: '颜色', value: sign.lucky.color },
            { label: '宝石', value: sign.lucky.stone },
            { label: '幸运日', value: sign.lucky.day },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center', background: '#fdf9f0', padding: '10px 4px', borderRadius: 10 }}>
              <p className="serif" style={{ fontSize: 14, color: '#c4924a', marginBottom: 3 }}>{item.value}</p>
              <p style={{ fontSize: 9, color: '#8a7a5e' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card-soft" style={{ padding: 16 }}>
        <p className="section-sub" style={{ marginBottom: 12 }}>最佳配对</p>
        <div style={{ display: 'flex', gap: 10 }}>
          {sign.compatibility.map(comp => {
            const s = ZODIAC_SIGNS.find(z => z.name === comp)
            const c = ELEMENT_COLORS[s?.element]
            return (
              <div key={comp} style={{
                flex: 1, textAlign: 'center', padding: '12px 6px',
                background: `${c}10`, borderRadius: 12,
                border: `1px solid ${c}30`,
              }}>
                <p style={{ fontSize: 26, marginBottom: 4, color: c }}>{s?.symbol}</p>
                <p style={{ fontSize: 11, color: '#2d2618', fontWeight: 500 }}>{comp}</p>
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

  function handleSubmit(e) {
    e?.preventDefault()
    if (!month || !day) return
    const id = getZodiacByDate(month, day)
    setResult(ZODIAC_SIGNS.find(s => s.id === id))
    setBrowsing(null)
  }

  const display = result || browsing

  return (
    <div className="animate-fade-in pb-nav" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ paddingTop: 16, marginBottom: 24, textAlign: 'center' }}>
        <p className="section-sub">ASTROLOGY</p>
        <h1 className="serif" style={{ fontSize: 26, color: '#2d2618' }}>星座星盘</h1>
      </div>

      <div style={{ marginBottom: 24 }}>
        <ZodiacWheel highlightId={display?.id} />
      </div>

      <div className="card-soft" style={{ padding: 18, marginBottom: 20 }}>
        <p style={{ fontSize: 12, color: '#5a4a3a', marginBottom: 14 }}>输入你的生日，解读你的太阳星座</p>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 10, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: '#8a7a5e', display: 'block', marginBottom: 6 }}>月份</label>
            <input
              type="number" min="1" max="12" inputMode="numeric"
              value={month}
              onChange={e => setMonth(e.target.value)}
              placeholder="1-12"
              style={{
                width: '100%', padding: '11px 14px',
                background: '#fdf9f0',
                border: '1px solid rgba(196,146,74,0.25)',
                borderRadius: 10, color: '#2d2618',
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 10, color: '#8a7a5e', display: 'block', marginBottom: 6 }}>日期</label>
            <input
              type="number" min="1" max="31" inputMode="numeric"
              value={day}
              onChange={e => setDay(e.target.value)}
              placeholder="1-31"
              style={{
                width: '100%', padding: '11px 14px',
                background: '#fdf9f0',
                border: '1px solid rgba(196,146,74,0.25)',
                borderRadius: 10, color: '#2d2618',
              }}
            />
          </div>
          <button type="submit" className="btn-primary" style={{ padding: '11px 20px', whiteSpace: 'nowrap' }}>
            解析
          </button>
        </form>
      </div>

      {display ? (
        <>
          <SignDetail sign={display} />
          <button
            onClick={() => { setResult(null); setBrowsing(null); setMonth(''); setDay('') }}
            className="btn-secondary"
            style={{ width: '100%', marginTop: 16 }}
          >
            浏览其他星座
          </button>
        </>
      ) : (
        <>
          <div className="divider">— 或浏览十二星座 —</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
            {ZODIAC_SIGNS.map(sign => {
              const color = ELEMENT_COLORS[sign.element]
              return (
                <button
                  key={sign.id}
                  onClick={() => setBrowsing(sign)}
                  className="card-soft"
                  style={{
                    padding: '14px 6px',
                    cursor: 'pointer', textAlign: 'center',
                    border: 'none', background: '#ffffff',
                  }}
                >
                  <p style={{ fontSize: 24, marginBottom: 4, color }}>{sign.symbol}</p>
                  <p style={{ fontSize: 11, color: '#2d2618', fontWeight: 500 }}>{sign.name}</p>
                </button>
              )
            })}
          </div>
        </>
      )}

      <div style={{ height: 60 }} />
    </div>
  )
}
