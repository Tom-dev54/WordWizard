import { useState } from 'react'
import Mascot from './Mascot'
import { ZODIAC_SIGNS, getZodiacByDate } from '../data/zodiacData'
import { saveUserBirth, setOnboarded, updateUser } from '../utils/storage'

const STEPS = 3

export default function Onboarding({ onDone }) {
  const [step, setStep] = useState(0)
  const [closing, setClosing] = useState(false)
  const [name, setName] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [hour, setHour] = useState('')

  const canAdvanceStep1 = month && day

  const sunSignId = canAdvanceStep1 ? getZodiacByDate(month, day) : null
  const sunSign = sunSignId ? ZODIAC_SIGNS.find(s => s.id === sunSignId) : null

  function handleFinish() {
    if (name.trim()) updateUser({ name: name.trim() })
    saveUserBirth({
      month: parseInt(month),
      day: parseInt(day),
      year: year ? parseInt(year) : null,
      hour: hour !== '' ? parseInt(hour) : null,
    })
    setOnboarded()
    setClosing(true)
    setTimeout(onDone, 420)
  }

  function next() { setStep(s => Math.min(s + 1, STEPS - 1)) }

  const overlayStyle = {
    position: 'fixed', inset: 0, zIndex: 500,
    background: 'linear-gradient(160deg, #1a1508 0%, #2d2618 60%, #0f1a12 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'flex-end',
    animation: closing ? 'ob-out 0.42s ease-in forwards' : 'ob-in 0.4s ease-out both',
    overflow: 'hidden',
  }

  return (
    <div style={overlayStyle}>
      {/* Stars background */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        {[...Array(18)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: i % 3 === 0 ? 3 : 2,
            height: i % 3 === 0 ? 3 : 2,
            borderRadius: '50%',
            background: '#faf4e8',
            opacity: 0.3 + (i % 4) * 0.15,
            top: `${5 + (i * 37) % 70}%`,
            left: `${10 + (i * 53) % 80}%`,
            animation: `pulse-soft ${2 + (i % 3)}s ease-in-out infinite`,
          }} />
        ))}
      </div>

      {/* Step dots */}
      <div style={{
        position: 'absolute', top: 60, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', gap: 8,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: i === step ? 20 : 6, height: 6, borderRadius: 3,
            background: i === step ? '#c9973a' : 'rgba(250,244,232,0.3)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>

      {/* Mascot */}
      <div style={{
        position: 'absolute', top: '12%', left: '50%', transform: 'translateX(-50%)',
        animation: 'float-slow 4s ease-in-out infinite',
      }}>
        <Mascot size={80} mood="happy" />
      </div>

      {/* Sheet */}
      <div style={{
        width: '100%', background: '#faf4e8',
        borderRadius: '28px 28px 0 0',
        padding: '28px 24px 52px',
        animation: 'slide-up-sheet 0.46s cubic-bezier(0.32,0.72,0,1) both',
      }}>
        {step === 0 && <StepWelcome onNext={next} />}
        {step === 1 && (
          <StepBirth
            name={name} setName={setName}
            month={month} setMonth={setMonth}
            day={day} setDay={setDay}
            year={year} setYear={setYear}
            hour={hour} setHour={setHour}
            canAdvance={canAdvanceStep1}
            onNext={next}
          />
        )}
        {step === 2 && (
          <StepReveal sunSign={sunSign} name={name} onFinish={handleFinish} />
        )}
      </div>

      <style>{`
        @keyframes ob-in { from { opacity: 0 } to { opacity: 1 } }
        @keyframes ob-out { from { opacity: 1 } to { opacity: 0 } }
      `}</style>
    </div>
  )
}

function StepWelcome({ onNext }) {
  return (
    <div className="animate-fade-up">
      <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.25em', marginBottom: 8 }}>WELCOME TO</p>
      <h1 className="serif" style={{ fontSize: 30, color: '#2d2618', marginBottom: 6, lineHeight: 1.2 }}>
        月相塔罗
      </h1>
      <p style={{ fontSize: 13, color: '#5a4a3a', lineHeight: 1.8, marginBottom: 8 }}>
        Lunaria Tarot
      </p>
      <p style={{ fontSize: 14, color: '#5a4a3a', lineHeight: 1.8, marginBottom: 28 }}>
        探索塔罗的神秘智慧，解读星盘的宇宙密码。在这里，每一张牌都是一面镜子，映照内心最真实的自己。
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
        {[
          { icon: '🃏', text: '22张大阿卡那塔罗牌阵' },
          { icon: '⭐', text: '三巨头星座分析 · 八字速览' },
          { icon: '💬', text: '与同好交流分享' },
        ].map(item => (
          <div key={item.text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <p style={{ fontSize: 13, color: '#3d3327' }}>{item.text}</p>
          </div>
        ))}
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={onNext}>
        开始探索 →
      </button>
    </div>
  )
}

function StepBirth({ name, setName, month, setMonth, day, setDay, year, setYear, hour, setHour, canAdvance, onNext }) {
  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#fff', border: '1px solid rgba(196,146,74,0.25)',
    borderRadius: 12, color: '#2d2618', fontSize: 15,
    boxSizing: 'border-box',
  }
  return (
    <div className="animate-fade-up">
      <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.2em', marginBottom: 8 }}>YOUR CHART</p>
      <h2 className="serif" style={{ fontSize: 24, color: '#2d2618', marginBottom: 6 }}>告诉我关于你</h2>
      <p style={{ fontSize: 13, color: '#5a4a3a', lineHeight: 1.7, marginBottom: 22 }}>
        填入你的生辰信息，解锁个人星盘与八字分析。
      </p>

      <label style={{ display: 'block', marginBottom: 14 }}>
        <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>你的名字（可选）</span>
        <input value={name} onChange={e => setName(e.target.value)}
          placeholder="随缘取个名字…" style={inputStyle} />
      </label>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <label>
          <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>出生月份 *</span>
          <input type="number" min="1" max="12" value={month} onChange={e => setMonth(e.target.value)}
            placeholder="1–12" style={inputStyle} />
        </label>
        <label>
          <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>出生日期 *</span>
          <input type="number" min="1" max="31" value={day} onChange={e => setDay(e.target.value)}
            placeholder="1–31" style={inputStyle} />
        </label>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 24 }}>
        <label>
          <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>出生年份（可选）</span>
          <input type="number" min="1900" max="2025" value={year} onChange={e => setYear(e.target.value)}
            placeholder="如 1995" style={inputStyle} />
        </label>
        <label>
          <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>出生时辰（可选）</span>
          <input type="number" min="0" max="23" value={hour} onChange={e => setHour(e.target.value)}
            placeholder="0–23时" style={inputStyle} />
        </label>
      </div>

      <button
        className="btn-primary"
        style={{ width: '100%', opacity: canAdvance ? 1 : 0.45, cursor: canAdvance ? 'pointer' : 'not-allowed' }}
        onClick={() => canAdvance && onNext()}
        disabled={!canAdvance}
      >
        查看我的星盘 ✦
      </button>
    </div>
  )
}

function StepReveal({ sunSign, name, onFinish }) {
  if (!sunSign) return null
  return (
    <div className="animate-fade-up" style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.2em', marginBottom: 16 }}>YOUR SUN SIGN</p>
      <div style={{
        width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px',
        background: `linear-gradient(135deg, ${sunSign.colors[0]}, ${sunSign.colors[1]})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 36, boxShadow: `0 8px 32px ${sunSign.colors[0]}40`,
        animation: 'pulse-soft 3s ease-in-out infinite',
      }}>
        {sunSign.symbol}
      </div>
      <h2 className="serif" style={{ fontSize: 28, color: '#2d2618', marginBottom: 4 }}>
        {sunSign.name}
      </h2>
      <p style={{ fontSize: 13, color: '#8a7a5e', marginBottom: 16 }}>
        {sunSign.en} · {sunSign.dates}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20 }}>
        {sunSign.traits.slice(0, 4).map(t => (
          <span key={t} className="pill pill-forest">{t}</span>
        ))}
      </div>
      <div style={{
        background: 'rgba(196,146,74,0.08)', borderRadius: 14,
        padding: '14px 16px', marginBottom: 24, textAlign: 'left',
        borderLeft: '3px solid #c9973a',
      }}>
        <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.8 }}>
          {sunSign.description.slice(0, 90)}…
        </p>
      </div>
      <p style={{ fontSize: 13, color: '#5a4a3a', marginBottom: 20 }}>
        {name ? `欢迎，${name}！` : '欢迎！'} 你的星盘已就绪，开始探索吧 ✦
      </p>
      <button className="btn-primary" style={{ width: '100%' }} onClick={onFinish}>
        进入 Lunaria →
      </button>
    </div>
  )
}
