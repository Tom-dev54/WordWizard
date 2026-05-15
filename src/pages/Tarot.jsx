import { useState } from 'react'
import { MAJOR_ARCANA, SPREADS } from '../data/tarotCards'

function TarotCard({ card, position, isReversed, flipped, onClick }) {
  return (
    <div
      className="card-scene"
      style={{ width: '100%', aspectRatio: '2/3', cursor: flipped ? 'default' : 'pointer' }}
      onClick={!flipped ? onClick : undefined}
    >
      <div className={`card-inner ${flipped ? 'flipped' : ''}`}>
        {/* Front (face down) */}
        <div
          className="card-face"
          style={{
            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid rgba(124,58,237,0.4)',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '2px solid rgba(245,158,11,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 8px',
              }}
            >
              <span style={{ fontSize: 20, color: 'rgba(245,158,11,0.6)' }}>✦</span>
            </div>
            {position && (
              <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{position}</p>
            )}
          </div>
        </div>
        {/* Back (revealed) */}
        <div
          className="card-back"
          style={{
            background: `linear-gradient(135deg, ${card?.colors?.[0] || '#7c3aed'}, ${card?.colors?.[1] || '#4f46e5'})`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 16,
            border: '2px solid rgba(255,255,255,0.15)',
            transform: isReversed ? 'rotateY(180deg) rotate(180deg)' : 'rotateY(180deg)',
          }}
        >
          <p style={{
            fontSize: 8, letterSpacing: '0.12em', color: 'rgba(255,255,255,0.6)',
            textTransform: 'uppercase',
          }}>
            {card?.number}
          </p>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>{card?.symbol}</div>
            <div
              style={{
                width: '100%',
                height: 1,
                background: 'rgba(255,255,255,0.2)',
                marginBottom: 8,
              }}
            />
            <p style={{
              fontSize: 11, fontFamily: 'Cinzel, serif',
              color: 'rgba(255,255,255,0.9)', letterSpacing: '0.05em',
            }}>
              {card?.nameCN}
            </p>
            {isReversed && (
              <span style={{
                fontSize: 8, color: 'rgba(255,255,255,0.5)',
                display: 'block', marginTop: 3,
              }}>逆位</span>
            )}
          </div>
          {position && (
            <p style={{ fontSize: 8, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.08em' }}>{position}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CardDetail({ card, isReversed, onClose }) {
  if (!card) return null
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'flex-end',
        padding: '0',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, #0f0f2e, #080818)',
          borderRadius: '24px 24px 0 0',
          padding: '24px 24px 48px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '80vh',
          overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', gap: 20, marginBottom: 24 }}>
          <div
            style={{
              width: 80, height: 120,
              borderRadius: 12, flexShrink: 0,
              background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})`,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 8px 32px ${card.colors[0]}60`,
            }}
          >
            <span style={{ fontSize: 36 }}>{card.symbol}</span>
            <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)', marginTop: 4 }}>{card.nameCN}</span>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{card.number}</span>
              {isReversed && (
                <span style={{
                  fontSize: 9, padding: '2px 8px',
                  background: 'rgba(220,38,38,0.2)',
                  border: '1px solid rgba(220,38,38,0.3)',
                  borderRadius: 10, color: '#fca5a5',
                }}>逆位</span>
              )}
            </div>
            <h2 style={{
              fontSize: 22, fontFamily: 'Cinzel, serif',
              color: '#f1f5f9', marginBottom: 4,
            }}>{card.nameCN}</h2>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{card.name}</p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 10, color: '#a78bfa' }}>🌀 {card.element}</span>
              <span style={{ fontSize: 10, color: '#60a5fa' }}>🪐 {card.planet}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
          {card.keywords.map(k => (
            <span key={k} style={{
              fontSize: 11, padding: '4px 10px',
              background: `rgba(${card.colors[0] === '#7c3aed' ? '124,58,237' : '79,70,229'},0.15)`,
              borderRadius: 20, color: '#c4b5fd',
              border: '1px solid rgba(124,58,237,0.25)',
            }}>{k}</span>
          ))}
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.04)',
          borderRadius: 16, padding: 16, marginBottom: 12,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <p style={{ fontSize: 11, color: isReversed ? '#fca5a5' : '#86efac', marginBottom: 8, letterSpacing: '0.08em' }}>
            {isReversed ? '▼ 逆位解读' : '▲ 正位解读'}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.8 }}>
            {isReversed ? card.reversedMeaning : card.uprightMeaning}
          </p>
        </div>

        <button
          onClick={onClose}
          style={{
            width: '100%', padding: 14,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', borderRadius: 14,
            color: 'white', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', marginTop: 8,
          }}
        >
          收起解读
        </button>
      </div>
    </div>
  )
}

function drawCards(count) {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(card => ({
    card,
    isReversed: Math.random() > 0.6,
  }))
}

export default function Tarot() {
  const [selectedSpread, setSelectedSpread] = useState(null)
  const [drawnCards, setDrawnCards] = useState([])
  const [flippedCards, setFlippedCards] = useState([])
  const [detailCard, setDetailCard] = useState(null)
  const [phase, setPhase] = useState('select') // select | shuffle | reveal | detail

  function handleSpreadSelect(spread) {
    setSelectedSpread(spread)
    setPhase('shuffle')
    setDrawnCards([])
    setFlippedCards([])
  }

  function handleDraw() {
    const cards = drawCards(selectedSpread.count)
    setDrawnCards(cards)
    setPhase('reveal')
    cards.forEach((_, i) => {
      setTimeout(() => {
        setFlippedCards(prev => [...prev, i])
      }, i * 400 + 300)
    })
  }

  function handleCardClick(index) {
    if (!flippedCards.includes(index)) return
    const { card, isReversed } = drawnCards[index]
    setDetailCard({ card, isReversed })
  }

  function handleReset() {
    setPhase('select')
    setSelectedSpread(null)
    setDrawnCards([])
    setFlippedCards([])
  }

  const gridCols = selectedSpread?.count === 1 ? 1 : selectedSpread?.count === 3 ? 3 : selectedSpread?.count === 5 ? 3 : 1

  return (
    <div style={{ padding: '60px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 28 }}>
        <p style={{ fontSize: 11, letterSpacing: '0.15em', color: '#a78bfa', marginBottom: 8, textTransform: 'uppercase' }}>
          ✦ Tarot Reading ✦
        </p>
        <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 24, color: '#f1f5f9' }}>塔罗占卜</h1>
      </div>

      {phase === 'select' && (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ textAlign: 'center', fontSize: 13, color: 'rgba(255,255,255,0.45)', marginBottom: 24 }}>
            静下心来，带着你的问题，选择一种牌阵
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SPREADS.map((spread) => (
              <button
                key={spread.id}
                onClick={() => handleSpreadSelect(spread)}
                style={{
                  background: 'rgba(124,58,237,0.08)',
                  border: '1px solid rgba(124,58,237,0.2)',
                  borderRadius: 16, padding: '18px 20px',
                  cursor: 'pointer', textAlign: 'left',
                  transition: 'all 0.25s ease',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.08)'
                  e.currentTarget.style.borderColor = 'rgba(124,58,237,0.2)'
                }}
              >
                <div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 4 }}>{spread.name}</p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{spread.desc}</p>
                </div>
                <div style={{
                  width: 36, height: 36,
                  background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                  borderRadius: 10, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, color: 'white',
                }}>
                  {spread.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {phase === 'shuffle' && (
        <div style={{ textAlign: 'center', animation: 'slideUp 0.5s ease-out' }}>
          <div style={{ fontSize: 80, marginBottom: 24, animation: 'float 3s ease-in-out infinite' }}>🃏</div>
          <p style={{ fontSize: 15, color: '#f1f5f9', marginBottom: 8 }}>已选择：{selectedSpread.name}</p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, marginBottom: 32 }}>
            深呼吸，让心静下来<br />
            将你的问题放在心中<br />
            当你准备好时，点击抽牌
          </p>
          <button
            onClick={handleDraw}
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
              border: 'none', borderRadius: 16,
              padding: '16px 40px', color: 'white',
              fontSize: 15, fontWeight: 600, cursor: 'pointer',
              boxShadow: '0 8px 32px rgba(124,58,237,0.4)',
              fontFamily: 'Cinzel, serif', letterSpacing: '0.05em',
            }}
          >
            ✦ 抽牌 ✦
          </button>
          <button
            onClick={handleReset}
            style={{
              display: 'block', margin: '16px auto 0',
              background: 'none', border: 'none',
              color: 'rgba(255,255,255,0.35)', fontSize: 12, cursor: 'pointer',
            }}
          >
            ← 重新选择牌阵
          </button>
        </div>
      )}

      {phase === 'reveal' && drawnCards.length > 0 && (
        <div style={{ animation: 'slideUp 0.5s ease-out' }}>
          <p style={{ textAlign: 'center', fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>
            点击牌面查看详细解读
          </p>

          {selectedSpread.count === 1 && (
            <div style={{ width: '50%', margin: '0 auto 24px' }}>
              <TarotCard
                card={drawnCards[0]?.card}
                position={selectedSpread.positions[0]}
                isReversed={drawnCards[0]?.isReversed}
                flipped={flippedCards.includes(0)}
                onClick={() => handleCardClick(0)}
              />
            </div>
          )}

          {selectedSpread.count === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
              {drawnCards.map(({ card, isReversed }, i) => (
                <TarotCard
                  key={i} card={card} position={selectedSpread.positions[i]}
                  isReversed={isReversed} flipped={flippedCards.includes(i)}
                  onClick={() => handleCardClick(i)}
                />
              ))}
            </div>
          )}

          {selectedSpread.count === 5 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {drawnCards.map(({ card, isReversed }, i) => (
                <div key={i} style={{ gridColumn: i === 4 ? '2' : 'auto' }}>
                  <TarotCard
                    card={card} position={selectedSpread.positions[i]}
                    isReversed={isReversed} flipped={flippedCards.includes(i)}
                    onClick={() => handleCardClick(i)}
                  />
                </div>
              ))}
            </div>
          )}

          {flippedCards.length === drawnCards.length && (
            <div style={{ marginTop: 16 }}>
              {drawnCards.map(({ card, isReversed }, i) => (
                <div
                  key={i}
                  className="glass"
                  style={{
                    borderRadius: 16, padding: 16, marginBottom: 12,
                    cursor: 'pointer', transition: 'all 0.25s ease',
                    animation: `slideUp 0.5s ease-out ${i * 0.1}s both`,
                  }}
                  onClick={() => setDetailCard({ card, isReversed })}
                >
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div
                      style={{
                        width: 40, height: 56,
                        borderRadius: 8, flexShrink: 0,
                        background: `linear-gradient(135deg, ${card.colors[0]}, ${card.colors[1]})`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 20,
                      }}
                    >
                      {card.symbol}
                    </div>
                    <div>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{selectedSpread.positions[i]}</span>
                        {isReversed && (
                          <span style={{ fontSize: 9, color: '#fca5a5', background: 'rgba(220,38,38,0.15)', padding: '1px 6px', borderRadius: 8 }}>逆位</span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', fontFamily: 'Cinzel, serif' }}>
                        {card.nameCN}
                      </p>
                      <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 3 }}>
                        {(isReversed ? card.reversedMeaning : card.uprightMeaning).slice(0, 45)}…
                      </p>
                    </div>
                    <span style={{ marginLeft: 'auto', color: 'rgba(255,255,255,0.25)', fontSize: 16 }}>›</span>
                  </div>
                </div>
              ))}

              <button
                onClick={handleReset}
                style={{
                  width: '100%', padding: 14,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, color: 'rgba(255,255,255,0.6)',
                  fontSize: 14, cursor: 'pointer', marginTop: 8,
                }}
              >
                重新占卜
              </button>
            </div>
          )}
        </div>
      )}

      <CardDetail
        card={detailCard?.card}
        isReversed={detailCard?.isReversed}
        onClose={() => setDetailCard(null)}
      />
    </div>
  )
}
