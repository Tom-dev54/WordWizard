import { useState } from 'react'
import { CardFace, CardBack } from './TarotCardArt'
import Sheet from './Sheet'
import PremiumSheet from './PremiumSheet'
import { saveReading } from '../utils/storage'
import { tap, success } from '../utils/haptics'

export default function MoodJournalSheet({ card, onClose, onSaved }) {
  const [mood, setMood] = useState('')
  const [worry, setWorry] = useState('')
  const [saved, setSaved] = useState(false)
  const [showPremium, setShowPremium] = useState(false)

  function handleSave() {
    tap()
    saveReading({
      type: 'daily',
      cardId: card.id,
      cardName: card.nameCN,
      spreadName: '每日塔罗',
      cards: [{ cardId: card.id, reversed: false, position: '今日能量' }],
      mood: mood.trim(),
      worry: worry.trim(),
      note: mood.trim(),
    })
    success()
    setSaved(true)
    setTimeout(() => onSaved && onSaved(), 1400)
  }

  return (
    <Sheet onClose={onClose} contentStyle={{ maxHeight: '92vh' }}>
      {(dismiss) => (
        <>
          <div className="sheet-handle" />

          {saved ? (
            <div className="animate-fade-up" style={{ textAlign: 'center', padding: '40px 0 20px' }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px',
                background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 28, boxShadow: '0 8px 24px rgba(45,74,62,0.3)',
              }}>✦</div>
              <h3 className="serif" style={{ fontSize: 22, color: '#2d2618', marginBottom: 8 }}>
                已记录到日志
              </h3>
              <p style={{ fontSize: 13, color: '#8a7a5e', lineHeight: 1.7 }}>
                宇宙见证了你今天的心情
              </p>
            </div>
          ) : (
            <>
              {/* Card + title */}
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22 }}>
                <div style={{ width: 58, height: 92, flexShrink: 0, borderRadius: 10, overflow: 'hidden' }}>
                  <div className="scene flipped" style={{ width: '100%', height: '100%' }}>
                    <div className="card-3d" style={{ transform: 'rotateY(180deg)', transition: 'none' }}>
                      <div className="face"><CardBack /></div>
                      <div className="face face-back"><CardFace card={card} /></div>
                    </div>
                  </div>
                </div>
                <div>
                  <p style={{ fontSize: 10, color: '#c4924a', letterSpacing: '0.2em', marginBottom: 4, fontWeight: 600 }}>
                    TODAY'S CARD
                  </p>
                  <h3 className="serif" style={{ fontSize: 23, color: '#2d2618', marginBottom: 6 }}>
                    {card.nameCN}
                  </h3>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {card.keywords.slice(0, 2).map(k => (
                      <span key={k} className="pill pill-gold">{k}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div style={{
                height: 1, marginBottom: 20,
                background: 'linear-gradient(90deg, transparent, rgba(196,146,74,0.3), transparent)',
              }} />

              {/* Mood input */}
              <div style={{ marginBottom: 16 }}>
                <p style={{
                  fontSize: 12, color: '#5a4a3a', marginBottom: 9,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <span style={{ fontSize: 16 }}>🌙</span> 此刻的心情
                </p>
                <textarea
                  value={mood}
                  onChange={e => setMood(e.target.value)}
                  placeholder="今天感觉怎么样？写下此刻内心流动的感受……"
                  rows={3}
                  style={{
                    width: '100%', padding: '13px 15px',
                    background: '#fff',
                    border: '1px solid rgba(196,146,74,0.25)',
                    borderRadius: 14, color: '#2d2618',
                    lineHeight: 1.75, resize: 'none',
                    transition: 'border-color 0.2s ease',
                  }}
                />
              </div>

              {/* Worry / expectation input */}
              <div style={{ marginBottom: 24 }}>
                <p style={{
                  fontSize: 12, color: '#5a4a3a', marginBottom: 9,
                  fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7,
                }}>
                  <span style={{ fontSize: 16 }}>💭</span> 我的担忧或期待
                </p>
                <textarea
                  value={worry}
                  onChange={e => setWorry(e.target.value)}
                  placeholder="有什么让你不安，或者正在悄悄期待的事情……"
                  rows={3}
                  style={{
                    width: '100%', padding: '13px 15px',
                    background: '#fff',
                    border: '1px solid rgba(196,146,74,0.25)',
                    borderRadius: 14, color: '#2d2618',
                    lineHeight: 1.75, resize: 'none',
                  }}
                />
              </div>

              {/* Action buttons */}
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ width: '100%', marginBottom: 10, fontSize: 14 }}
              >
                ✦ 保存日志
              </button>
              <button
                onClick={() => setShowPremium(true)}
                style={{
                  width: '100%', padding: '13px',
                  background: 'linear-gradient(135deg, rgba(196,146,74,0.1), rgba(196,146,74,0.05))',
                  border: '1px solid rgba(196,146,74,0.3)',
                  borderRadius: 999, color: '#c4924a', fontSize: 13,
                  fontWeight: 600, cursor: 'pointer', letterSpacing: '0.04em',
                }}
                onTouchStart={e => e.currentTarget.style.background = 'rgba(196,146,74,0.18)'}
                onTouchEnd={e => e.currentTarget.style.background = 'linear-gradient(135deg, rgba(196,146,74,0.1), rgba(196,146,74,0.05))'}
              >
                继续深度占卜 ✦ →
              </button>
            </>
          )}

          {showPremium && (
            <PremiumSheet onClose={() => setShowPremium(false)} />
          )}
        </>
      )}
    </Sheet>
  )
}
