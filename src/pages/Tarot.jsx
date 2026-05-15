import { useState } from 'react'
import { MAJOR_ARCANA, SPREADS } from '../data/tarotCards'
import { CardFace, CardBack } from '../components/TarotCardArt'
import { saveReading, getJournal, deleteReading } from '../utils/storage'
import Sheet from '../components/Sheet'
import { impact, tap, success } from '../utils/haptics'

function drawCards(count) {
  const shuffled = [...MAJOR_ARCANA].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count).map(card => ({
    card,
    reversed: Math.random() > 0.65,
  }))
}

function TarotCard({ card, reversed, position, flipped, onClick, narrow }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div
        className={`scene ${flipped ? 'flipped' : ''}`}
        style={{ width: '100%', aspectRatio: '2/3', cursor: 'pointer' }}
        onClick={onClick}
      >
        <div className="card-3d">
          <div className="face"><CardBack /></div>
          <div className="face face-back"><CardFace card={card} reversed={reversed} /></div>
        </div>
      </div>
      {position && (
        <div style={{ textAlign: 'center', marginTop: 8 }}>
          <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {position}
          </p>
          {flipped && (
            <p className="serif" style={{ fontSize: 12, color: '#2d2618', marginTop: 2 }}>
              {card.nameCN} {reversed && <span style={{ fontSize: 9, color: '#8c4a5e' }}>(逆)</span>}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function CardDetailSheet({ card, reversed, onClose }) {
  if (!card) return null
  return (
    <Sheet onClose={onClose}>
      {(dismiss) => (
        <>
          <div className="sheet-handle" />
          <div style={{ display: 'flex', gap: 18, marginBottom: 20 }}>
            <div style={{ width: 90, height: 140, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
              <CardFace card={card} reversed={reversed} />
            </div>
            <div style={{ paddingTop: 6 }}>
              <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.2em', marginBottom: 6 }}>
                {card.number}
              </p>
              <h2 className="serif" style={{ fontSize: 24, color: '#2d2618', marginBottom: 2 }}>
                {card.nameCN}
              </h2>
              <p style={{ fontSize: 12, color: '#8a7a5e', fontStyle: 'italic', marginBottom: 12 }}>
                {card.name}
              </p>
              {reversed && (
                <span className="pill pill-wine">逆位 · Reversed</span>
              )}
              <div style={{ display: 'flex', gap: 8, marginTop: 12, fontSize: 11, color: '#5a4a3a' }}>
                <span>🜂 {card.element}</span>
                <span style={{ color: '#c4924a' }}>·</span>
                <span>🪐 {card.planet}</span>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <p className="section-sub" style={{ marginBottom: 8 }}>关键词</p>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {card.keywords.map(k => (
                <span key={k} className="pill pill-forest">{k}</span>
              ))}
            </div>
          </div>

          <div style={{
            background: reversed ? 'rgba(140,74,94,0.06)' : 'rgba(45,74,62,0.06)',
            borderRadius: 14, padding: 16, marginBottom: 14,
            borderLeft: `3px solid ${reversed ? '#8c4a5e' : '#2d4a3e'}`,
          }}>
            <p style={{
              fontSize: 11, color: reversed ? '#6e3848' : '#2d4a3e',
              letterSpacing: '0.15em', marginBottom: 10, fontWeight: 600,
            }}>
              {reversed ? '▽ 逆位解读' : '△ 正位解读'}
            </p>
            <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.8 }}>
              {reversed ? card.reversedMeaning : card.uprightMeaning}
            </p>
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={dismiss} className="btn-primary" style={{ flex: 1 }}>
              收起解读
            </button>
            <button
              onClick={() => {
                tap()
                const text = `我今日的塔罗牌是《${card.nameCN}》\n${reversed ? card.reversedMeaning : card.uprightMeaning}\n\n#月相塔罗 #Lunaria`
                if (navigator.share) {
                  navigator.share({ title: `塔罗 · ${card.nameCN}`, text }).catch(() => {})
                } else {
                  navigator.clipboard?.writeText(text)
                }
              }}
              style={{
                width: 48, background: 'rgba(196,146,74,0.12)',
                border: '1px solid rgba(196,146,74,0.3)',
                borderRadius: 12, cursor: 'pointer', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              ↑
            </button>
          </div>
        </>
      )}
    </Sheet>
  )
}

function SaveJournalSheet({ spread, cards, onClose, onSaved }) {
  const [note, setNote] = useState('')
  const [question, setQuestion] = useState('')

  return (
    <Sheet onClose={onClose}>
      {(dismiss) => {
        function handleSave() {
          saveReading({
            type: 'spread',
            spreadName: spread.name,
            spreadId: spread.id,
            question,
            note,
            cards: cards.map((c, i) => ({
              cardId: c.card.id,
              cardName: c.card.nameCN,
              reversed: c.reversed,
              position: spread.positions[i],
            })),
          })
          onSaved()
          dismiss()
        }

        return (
          <>
            <div className="sheet-handle" />
            <h3 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 4 }}>记入日志</h3>
            <p style={{ fontSize: 12, color: '#8a7a5e', marginBottom: 18 }}>
              保存这次占卜，方便日后回顾与思考
            </p>

            <label style={{ display: 'block', marginBottom: 14 }}>
              <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>问题（可选）</span>
              <input
                value={question}
                onChange={e => setQuestion(e.target.value)}
                placeholder="此次占卜你想问什么？"
                style={{
                  width: '100%', padding: '12px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 12, color: '#2d2618', fontSize: 14,
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>笔记（可选）</span>
              <textarea
                value={note}
                onChange={e => setNote(e.target.value)}
                placeholder="记录你的感受、想法或解读…"
                rows={4}
                style={{
                  width: '100%', padding: '12px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 12, color: '#2d2618',
                  fontSize: 13, lineHeight: 1.7, resize: 'none',
                }}
              />
            </label>

            <button onClick={handleSave} className="btn-primary" style={{ width: '100%', marginBottom: 8 }}>
              ✦ 保存到日志
            </button>
            <button onClick={dismiss} style={{
              width: '100%', background: 'none', border: 'none',
              padding: 10, color: '#8a7a5e', fontSize: 12, cursor: 'pointer',
            }}>
              取消
            </button>
          </>
        )
      }}
    </Sheet>
  )
}

function HistoryTab() {
  const [journal, setJournal] = useState(getJournal())
  const [selected, setSelected] = useState(null)

  function handleDelete(id) {
    const updated = deleteReading(id)
    setJournal(updated)
    setSelected(null)
    success()
  }

  if (journal.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 24px' }}>
        <p style={{ fontSize: 40, marginBottom: 16 }}>📖</p>
        <p className="serif" style={{ fontSize: 17, color: '#2d2618', marginBottom: 8 }}>还没有记录</p>
        <p style={{ fontSize: 13, color: '#8a7a5e' }}>每次占卜后保存，这里会记录你的成长轨迹</p>
      </div>
    )
  }

  return (
    <div className="animate-fade-up">
      {journal.map((entry, idx) => {
        const firstCard = entry.cards?.[0]
        const cardData = firstCard ? MAJOR_ARCANA.find(c => c.id === firstCard.cardId) : null
        return (
          <button
            key={entry.id}
            onClick={() => { tap(); setSelected(entry) }}
            className="card-soft"
            style={{
              width: '100%', padding: 14, marginBottom: 10,
              display: 'flex', gap: 12, alignItems: 'center',
              cursor: 'pointer', border: 'none', textAlign: 'left',
              animation: `fade-up 0.4s ease-out ${idx * 0.05}s both`,
              transition: 'transform 0.15s ease',
            }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ width: 46, height: 72, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
              {cardData ? (
                <CardFace card={cardData} reversed={firstCard.reversed} />
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c4924a', fontSize: 18,
                }}>✦</div>
              )}
            </div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <p className="serif" style={{ fontSize: 14, color: '#2d2618', marginBottom: 3 }}>
                {entry.spreadName || '占卜记录'}
              </p>
              <p style={{ fontSize: 12, color: '#5a4a3a', marginBottom: 3 }}>
                {entry.cards?.map(c => c.cardName).slice(0, 2).join(' · ')}
                {entry.cards?.length > 2 ? '…' : ''}
              </p>
              <p style={{ fontSize: 10, color: '#8a7a5e' }}>
                {new Date(entry.createdAt).toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
                {entry.question ? ` · ${entry.question.slice(0, 12)}…` : ''}
              </p>
            </div>
            <span style={{ color: '#c4924a', fontSize: 16 }}>›</span>
          </button>
        )
      })}
      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          {(dismiss) => (
            <>
              <div className="sheet-handle" />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <h3 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 4 }}>
                    {selected.spreadName}
                  </h3>
                  <p style={{ fontSize: 11, color: '#8a7a5e' }}>
                    {new Date(selected.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(selected.id)}
                  style={{ background: 'none', border: 'none', color: '#8c4a5e', fontSize: 12, cursor: 'pointer', padding: 4 }}
                >
                  删除
                </button>
              </div>
              {selected.question && (
                <div style={{ background: 'rgba(196,146,74,0.08)', borderRadius: 10, padding: 12, marginBottom: 14 }}>
                  <p style={{ fontSize: 11, color: '#8a7a5e', marginBottom: 4 }}>问题</p>
                  <p style={{ fontSize: 13, color: '#3d3327' }}>{selected.question}</p>
                </div>
              )}
              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4, marginBottom: 14 }}>
                {selected.cards?.map((c, i) => {
                  const cardData = MAJOR_ARCANA.find(cd => cd.id === c.cardId)
                  return (
                    <div key={i} style={{ flexShrink: 0, width: 70, textAlign: 'center' }}>
                      <div style={{ width: 70, height: 110, borderRadius: 8, overflow: 'hidden', marginBottom: 4 }}>
                        {cardData ? <CardFace card={cardData} reversed={c.reversed} /> : null}
                      </div>
                      <p style={{ fontSize: 9, color: '#8a7a5e', marginBottom: 2 }}>{c.position}</p>
                      <p style={{ fontSize: 11, color: '#2d2618' }}>{c.cardName}</p>
                      {c.reversed && <span style={{ fontSize: 9, color: '#8c4a5e' }}>逆</span>}
                    </div>
                  )
                })}
              </div>
              {selected.note && (
                <div style={{ background: '#fff', borderRadius: 10, padding: 14, marginBottom: 16, border: '1px solid rgba(196,146,74,0.15)' }}>
                  <p style={{ fontSize: 11, color: '#8a7a5e', marginBottom: 6 }}>笔记</p>
                  <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.8 }}>{selected.note}</p>
                </div>
              )}
              <button onClick={dismiss} className="btn-primary" style={{ width: '100%' }}>关闭</button>
            </>
          )}
        </Sheet>
      )}
    </div>
  )
}

export default function Tarot() {
  const [phase, setPhase] = useState('select')
  const [activeTab, setActiveTab] = useState('draw')
  const [spread, setSpread] = useState(null)
  const [drawn, setDrawn] = useState([])
  const [flipped, setFlipped] = useState([])
  const [detail, setDetail] = useState(null)
  const [showSave, setShowSave] = useState(false)
  const [savedToast, setSavedToast] = useState(false)

  function startSpread(s) {
    setSpread(s)
    setPhase('shuffle')
    setDrawn([])
    setFlipped([])
  }

  function handleDraw() {
    const cards = drawCards(spread.count)
    setDrawn(cards)
    setPhase('reveal')
    cards.forEach((_, i) => {
      setTimeout(() => {
        setFlipped(prev => [...prev, i])
        impact()
      }, i * 350 + 300)
    })
  }

  function handleReset() {
    setPhase('select')
    setSpread(null)
    setDrawn([])
    setFlipped([])
  }

  function handleSaved() {
    setSavedToast(true)
    setTimeout(() => setSavedToast(false), 2000)
  }

  return (
    <div className="animate-fade-in pb-nav" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ paddingTop: 16, marginBottom: 20, textAlign: 'center' }}>
        <p className="section-sub">DIVINATION</p>
        <h1 className="serif" style={{ fontSize: 26, color: '#2d2618', marginBottom: 16 }}>塔罗占卜</h1>
        <div style={{
          display: 'inline-flex', background: 'rgba(45,38,24,0.06)',
          borderRadius: 12, padding: 3, gap: 2,
        }}>
          {[['draw','占卜'], ['history','历史记录']].map(([id, label]) => (
            <button key={id} onClick={() => { tap(); setActiveTab(id); if (id === 'draw') setPhase('select') }}
              style={{
                padding: '8px 18px', borderRadius: 10, border: 'none',
                background: activeTab === id ? '#fff' : 'transparent',
                color: activeTab === id ? '#2d2618' : '#8a7a5e',
                fontWeight: activeTab === id ? 600 : 400,
                fontSize: 13, cursor: 'pointer',
                boxShadow: activeTab === id ? '0 1px 4px rgba(45,38,24,0.12)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'history' && <HistoryTab />}

      {activeTab === 'draw' && phase === 'select' && (
        <div className="animate-fade-up">
          <p style={{ fontSize: 13, color: '#5a4a3a', lineHeight: 1.7, textAlign: 'center', marginBottom: 24 }}>
            深呼吸，让心静下来。<br />
            带着你的问题，选择适合的牌阵。
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {SPREADS.map(s => (
              <button
                key={s.id}
                onClick={() => startSpread(s)}
                className="card-soft"
                style={{
                  padding: 18, cursor: 'pointer',
                  border: 'none', textAlign: 'left',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#ffffff', transition: 'transform 0.15s ease',
                }}
                onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
                onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                <div>
                  <p className="serif" style={{ fontSize: 17, color: '#2d2618', marginBottom: 4 }}>{s.name}</p>
                  <p style={{ fontSize: 12, color: '#8a7a5e' }}>{s.desc}</p>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    {s.positions.map(p => (
                      <span key={p} className="pill pill-cream" style={{ fontSize: 10 }}>{p}</span>
                    ))}
                  </div>
                </div>
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c4924a', fontSize: 16, flexShrink: 0,
                }}>
                  {s.count}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'draw' && phase === 'shuffle' && (
        <div className="animate-fade-up" style={{ textAlign: 'center', paddingTop: 24 }}>
          <div className="animate-float" style={{ marginBottom: 24 }}>
            <div style={{ width: 120, height: 180, margin: '0 auto', borderRadius: 10, overflow: 'hidden' }}>
              <CardBack />
            </div>
          </div>
          <h2 className="serif" style={{ fontSize: 18, color: '#2d2618', marginBottom: 6 }}>
            {spread.name}
          </h2>
          <p style={{ fontSize: 12, color: '#5a4a3a', lineHeight: 1.8, marginBottom: 28 }}>
            深呼吸，让心静下来<br />
            将你的问题在心中默念三遍<br />
            当你准备好时，点击开始抽牌
          </p>
          <button className="btn-primary" onClick={handleDraw} style={{ marginBottom: 12 }}>
            ✦ 开始抽牌 ✦
          </button>
          <div>
            <button onClick={handleReset} style={{
              background: 'none', border: 'none', color: '#8a7a5e', fontSize: 12, cursor: 'pointer',
            }}>
              ← 重选牌阵
            </button>
          </div>
        </div>
      )}

      {activeTab === 'draw' && phase === 'reveal' && drawn.length > 0 && (
        <div className="animate-fade-up">
          <p style={{ textAlign: 'center', fontSize: 12, color: '#8a7a5e', marginBottom: 18 }}>
            ✦ {spread.name} · 点击牌面查看详细解读 ✦
          </p>

          {spread.count === 1 && (
            <div style={{ width: 180, margin: '0 auto 24px' }}>
              <TarotCard
                card={drawn[0].card} reversed={drawn[0].reversed}
                position={spread.positions[0]}
                flipped={flipped.includes(0)}
                onClick={() => flipped.includes(0) && setDetail(drawn[0])}
              />
            </div>
          )}

          {spread.count === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {drawn.map((d, i) => (
                <TarotCard
                  key={i} card={d.card} reversed={d.reversed}
                  position={spread.positions[i]}
                  flipped={flipped.includes(i)} narrow
                  onClick={() => flipped.includes(i) && setDetail(d)}
                />
              ))}
            </div>
          )}

          {spread.count === 5 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
              {drawn.map((d, i) => (
                <div key={i} style={{ gridColumn: i === 4 ? '2' : 'auto' }}>
                  <TarotCard
                    card={d.card} reversed={d.reversed}
                    position={spread.positions[i]}
                    flipped={flipped.includes(i)} narrow
                    onClick={() => flipped.includes(i) && setDetail(d)}
                  />
                </div>
              ))}
            </div>
          )}

          {flipped.length === drawn.length && (
            <div>
              <div className="divider">✦ 牌阵解读 ✦</div>
              {drawn.map((d, i) => (
                <button
                  key={i}
                  onClick={() => setDetail(d)}
                  className="card-soft"
                  style={{
                    width: '100%', padding: 14, marginBottom: 10,
                    display: 'flex', gap: 12, alignItems: 'center',
                    cursor: 'pointer', border: 'none', textAlign: 'left',
                    animation: `fade-up 0.5s ease-out ${i * 0.1}s both`,
                    transition: 'transform 0.15s ease',
                  }}
                  onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
                  onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <div style={{ width: 50, height: 78, borderRadius: 6, overflow: 'hidden', flexShrink: 0 }}>
                    <CardFace card={d.card} reversed={d.reversed} />
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.1em', marginBottom: 2 }}>
                      {spread.positions[i]}
                    </p>
                    <p className="serif" style={{ fontSize: 15, color: '#2d2618', marginBottom: 3 }}>
                      {d.card.nameCN}
                      {d.reversed && <span style={{ fontSize: 10, color: '#8c4a5e', marginLeft: 6 }}>逆</span>}
                    </p>
                    <p style={{ fontSize: 11, color: '#5a4a3a', lineHeight: 1.5,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {(d.reversed ? d.card.reversedMeaning : d.card.uprightMeaning).slice(0, 50)}…
                    </p>
                  </div>
                  <span style={{ color: '#c4924a', fontSize: 16 }}>›</span>
                </button>
              ))}

              <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowSave(true)}>
                  ✦ 记入日志
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleReset}>
                  重新占卜
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {detail && (
        <CardDetailSheet card={detail.card} reversed={detail.reversed} onClose={() => setDetail(null)} />
      )}
      {showSave && (
        <SaveJournalSheet
          spread={spread} cards={drawn}
          onClose={() => setShowSave(false)}
          onSaved={handleSaved}
        />
      )}
      {savedToast && (
        <div style={{
          position: 'fixed', bottom: 100, left: '50%', transform: 'translateX(-50%)',
          background: '#2d4a3e', color: '#fdf9f0',
          padding: '12px 22px', borderRadius: 999,
          fontSize: 13, boxShadow: '0 8px 24px rgba(45,74,62,0.3)', zIndex: 300,
          animation: 'fade-up 0.3s ease-out',
        }}>
          ✦ 已保存到日志
        </div>
      )}

      <div style={{ height: 100 }} />
    </div>
  )
}
