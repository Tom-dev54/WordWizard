import { useState, useEffect } from 'react'
import { MAJOR_ARCANA } from '../data/tarotCards'
import { CardFace, CardBack } from '../components/TarotCardArt'
import Mascot from '../components/Mascot'
import Sheet from '../components/Sheet'
import CardDetailSheet from '../components/CardDetailSheet'
import MoodJournalSheet from '../components/MoodJournalSheet'
import { getJournal, getUser, saveReading, relTime, getUserBirth, recordVisit, getStreak } from '../utils/storage'
import { ZODIAC_SIGNS, getZodiacByDate } from '../data/zodiacData'

const DAILY_QUOTES = [
  '宇宙正在为你对齐最完美的能量频率',
  '今天是一个播种意图的好日子，想清楚你真正渴望的是什么',
  '内心的声音比任何预言都更准确，请倾听它',
  '你所寻找的，也在寻找你',
  '星辰已经为你铺好了道路，迈步前行',
  '今日的挑战是明日智慧的来源，请勇敢经历',
  '放下控制，宇宙自有安排',
]

const MOON_PHASES = [
  { icon: '🌑', name: '新月',   hint: '播种新的意图与心愿' },
  { icon: '🌒', name: '峨眉月', hint: '酝酿你的计划' },
  { icon: '🌓', name: '上弦月', hint: '采取行动的好时机' },
  { icon: '🌔', name: '盈凸月', hint: '调整方向，持续前行' },
  { icon: '🌕', name: '满月',   hint: '感恩与释放旧有模式' },
  { icon: '🌖', name: '亏凸月', hint: '感激所获，开始放下' },
  { icon: '🌗', name: '下弦月', hint: '清理与释放，留出空间' },
  { icon: '🌘', name: '残月',   hint: '休息、反思与内观' },
]

const DAILY_INTENTIONS = [
  { text: '今天，我选择放下评判，以开放的心接纳一切', element: '风', color: '#c4924a' },
  { text: '今天，我专注于内心的力量，而非外在的噪音', element: '火', color: '#c44a3e' },
  { text: '今天，我允许自己柔软，因为温柔也是一种力量', element: '水', color: '#3e6c8c' },
  { text: '今天，我选择活在当下，感受每一刻的礼物', element: '土', color: '#5c7a3e' },
  { text: '今天，我相信宇宙的安排，即便现在看不明白', element: '风', color: '#c4924a' },
  { text: '今天，我感恩所拥有的，而非专注于缺失', element: '土', color: '#5c7a3e' },
  { text: '今天，我是自己情绪的见证者，而非奴隶', element: '水', color: '#3e6c8c' },
]

const DAILY_ELEMENTS = [
  { zh: '火', en: 'FIRE', color: '#c44a3e', icon: '🔥', hint: '行动力旺盛，勇敢迈步' },
  { zh: '水', en: 'WATER', color: '#3e6c8c', icon: '💧', hint: '情感敏锐，内省良时' },
  { zh: '风', en: 'AIR', color: '#c4924a', icon: '🌬', hint: '思维活跃，沟通畅通' },
  { zh: '土', en: 'EARTH', color: '#5c7a3e', icon: '🌿', hint: '稳健踏实，专注细节' },
]

function useDailySeed() {
  const today = new Date()
  return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate()
}

export function getDailyIntention() {
  const seed = new Date().getFullYear() * 10000 + (new Date().getMonth() + 1) * 100 + new Date().getDate()
  return DAILY_INTENTIONS[seed % DAILY_INTENTIONS.length]
}

function useDailyCard() {
  const seed = useDailySeed()
  const idx = seed % MAJOR_ARCANA.length
  return MAJOR_ARCANA[idx]
}

function DailyCard({ onViewDetail }) {
  const card = useDailyCard()
  const [revealed, setRevealed] = useState(false)
  const today = new Date()
  const dateLabel = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="card-soft" style={{
      padding: 24, marginBottom: 16,
      background: 'linear-gradient(145deg, #ffffff, #fefcf6)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p className="section-sub">DAILY DRAW</p>
          <p className="section-title" style={{ fontSize: 18 }}>今日塔罗</p>
        </div>
        <p style={{ fontSize: 11, color: '#8a7a5e', textAlign: 'right' }}>{dateLabel}</p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Card flip area */}
        <div
          className={`scene${revealed ? ' flipped' : ''}`}
          style={{
            width: 96, height: 154, flexShrink: 0,
            cursor: revealed ? 'default' : 'pointer',
            filter: revealed ? 'drop-shadow(0 6px 18px rgba(196,146,74,0.35))' : 'none',
            transition: 'filter 0.6s ease',
          }}
          onClick={() => !revealed && setRevealed(true)}
        >
          <div className="card-3d">
            <div className="face"><CardBack /></div>
            <div className="face face-back"><CardFace card={card} /></div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          {!revealed ? (
            <>
              <p style={{ fontSize: 13, color: '#5a4a3a', lineHeight: 1.7, marginBottom: 14 }}>
                静下心来，把今日的疑问放在心中，<br />
                点击牌面翻开宇宙为你准备的指引。
              </p>
              <button
                className="btn-primary"
                style={{ padding: '10px 22px', fontSize: 12 }}
                onClick={() => setRevealed(true)}
              >
                翻开牌面
              </button>
            </>
          ) : (
            <div className="animate-fade-up">
              <h3 className="serif" style={{ fontSize: 21, color: '#2d2618', marginBottom: 3 }}>
                {card.nameCN}
              </h3>
              <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.14em', marginBottom: 10 }}>
                {card.name.toUpperCase()}
              </p>
              <div style={{ display: 'flex', gap: 5, marginBottom: 11, flexWrap: 'wrap' }}>
                {card.keywords.slice(0, 3).map(k => (
                  <span key={k} className="pill pill-forest">{k}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#5a4a3a', lineHeight: 1.7, marginBottom: 14 }}>
                {card.uprightMeaning.slice(0, 50)}…
              </p>
              <button
                onClick={() => onViewDetail(card)}
                className="btn-primary"
                style={{ padding: '10px 20px', fontSize: 12, width: '100%' }}
              >
                完整解读 ✦ →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function DailyIntention() {
  const seed = useDailySeed()
  const intention = DAILY_INTENTIONS[seed % DAILY_INTENTIONS.length]
  const [tapped, setTapped] = useState(false)

  return (
    <div
      className="card-tinted"
      onClick={() => setTapped(!tapped)}
      style={{
        padding: 18, marginBottom: 16,
        cursor: 'pointer',
        borderLeft: `3px solid ${intention.color}`,
        transition: 'all 0.3s ease',
        background: `linear-gradient(135deg, ${intention.color}06, #fefcf6)`,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <p className="section-sub" style={{ marginBottom: 6 }}>TODAY'S INTENTION</p>
          <p className="serif" style={{ fontSize: 14, color: '#2d2618', lineHeight: 1.7 }}>
            {intention.text}
          </p>
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: '50%', marginLeft: 12, flexShrink: 0,
          background: tapped ? intention.color : 'transparent',
          border: `2px solid ${intention.color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.3s ease',
          color: tapped ? '#fff' : intention.color, fontSize: 14,
        }}>
          {tapped ? '✓' : '○'}
        </div>
      </div>
      {tapped && (
        <div style={{
          marginTop: 12, paddingTop: 12,
          borderTop: `1px solid ${intention.color}20`,
          animation: 'fade-up 0.3s ease-out',
        }}>
          <p style={{ fontSize: 11, color: '#8a7a5e' }}>
            {intention.element}元素能量已激活 · 带着这个意图开始你美好的一天 ✦
          </p>
        </div>
      )}
    </div>
  )
}

function CosmicEnergy() {
  const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
  const el = DAILY_ELEMENTS[dayOfYear % 4]
  const phase = MOON_PHASES[Math.floor((new Date().getDate() % 30) / 4)]
  const quote = DAILY_QUOTES[new Date().getDay()]

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        <div className="card-soft" style={{ padding: 16 }}>
          <p className="section-sub" style={{ marginBottom: 6, fontSize: 9 }}>MOON PHASE</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{phase.icon}</span>
            <div>
              <p className="serif" style={{ fontSize: 15, color: '#2d2618' }}>{phase.name}</p>
              <p style={{ fontSize: 10, color: '#8a7a5e', lineHeight: 1.4, marginTop: 2 }}>{phase.hint}</p>
            </div>
          </div>
        </div>
        <div className="card-soft" style={{
          padding: 16,
          background: `linear-gradient(135deg, ${el.color}10, #ffffff)`,
        }}>
          <p className="section-sub" style={{ marginBottom: 6, fontSize: 9 }}>TODAY'S ELEMENT</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: el.color,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0,
              animation: 'pulse-soft 3s ease-in-out infinite',
            }}>
              {el.icon}
            </div>
            <div>
              <p className="serif" style={{ fontSize: 15, color: el.color, fontWeight: 600 }}>
                {el.zh}元素
              </p>
              <p style={{ fontSize: 10, color: '#8a7a5e', lineHeight: 1.4, marginTop: 2 }}>{el.hint}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-tinted" style={{
        padding: 16,
        borderLeft: '3px solid #c4924a',
        background: 'rgba(196,146,74,0.05)',
      }}>
        <p style={{ fontSize: 11, color: '#c4924a', letterSpacing: '0.15em', marginBottom: 8, fontWeight: 600 }}>
          ✦ 宇宙低语
        </p>
        <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.8, fontStyle: 'italic' }}>
          "{quote}"
        </p>
      </div>
    </div>
  )
}

// Journal entry detail sheet
function JournalEntrySheet({ entry, onClose }) {
  const card = MAJOR_ARCANA.find(c => c.id === entry.cardId)
  return (
    <Sheet onClose={onClose} contentStyle={{ maxHeight: '88vh' }}>
      {() => (
        <>
          <div className="sheet-handle" />

          {/* Card + basic info */}
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            {card && (
              <div style={{ width: 52, height: 82, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
                <div className="scene flipped" style={{ width: '100%', height: '100%' }}>
                  <div className="card-3d" style={{ transform: 'rotateY(180deg)', transition: 'none' }}>
                    <div className="face"><CardBack /></div>
                    <div className="face face-back"><CardFace card={card} /></div>
                  </div>
                </div>
              </div>
            )}
            <div>
              <p style={{ fontSize: 10, color: '#c4924a', letterSpacing: '0.2em', marginBottom: 3, fontWeight: 600 }}>
                {entry.spreadName || '每日塔罗'}
              </p>
              <h3 className="serif" style={{ fontSize: 21, color: '#2d2618', marginBottom: 4 }}>
                {entry.cardName || '占卜记录'}
              </h3>
              <p style={{ fontSize: 11, color: '#8a7a5e' }}>{relTime(entry.createdAt)}</p>
            </div>
          </div>

          <div style={{ height: 1, background: 'linear-gradient(90deg, transparent, rgba(196,146,74,0.3), transparent)', marginBottom: 20 }} />

          {/* Mood */}
          {entry.mood ? (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: '#5a4a3a', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15 }}>🌙</span> 当时的心情
              </p>
              <div style={{
                padding: '14px 16px',
                background: 'rgba(140,74,94,0.05)',
                borderRadius: 12,
                borderLeft: '3px solid rgba(140,74,94,0.3)',
              }}>
                <p style={{ fontSize: 14, color: '#3d3327', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                  {entry.mood}
                </p>
              </div>
            </div>
          ) : null}

          {/* Worry */}
          {entry.worry ? (
            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 12, color: '#5a4a3a', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15 }}>💭</span> 担忧或期待
              </p>
              <div style={{
                padding: '14px 16px',
                background: 'rgba(62,108,140,0.05)',
                borderRadius: 12,
                borderLeft: '3px solid rgba(62,108,140,0.3)',
              }}>
                <p style={{ fontSize: 14, color: '#3d3327', lineHeight: 1.85, whiteSpace: 'pre-wrap' }}>
                  {entry.worry}
                </p>
              </div>
            </div>
          ) : null}

          {/* Card meaning */}
          {card && (
            <div style={{ marginBottom: 8 }}>
              <p style={{ fontSize: 12, color: '#5a4a3a', fontWeight: 600, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontSize: 15 }}>✦</span> 牌面解读
              </p>
              <div style={{
                padding: '14px 16px',
                background: 'rgba(196,146,74,0.05)',
                borderRadius: 12,
                borderLeft: '3px solid rgba(196,146,74,0.3)',
              }}>
                <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                  {card.keywords.slice(0, 3).map(k => (
                    <span key={k} className="pill pill-gold">{k}</span>
                  ))}
                </div>
                <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.85 }}>
                  {card.uprightMeaning}
                </p>
              </div>
            </div>
          )}

          {!entry.mood && !entry.worry && !card && (
            <p style={{ textAlign: 'center', color: '#8a7a5e', padding: '20px 0' }}>
              暂无更多内容
            </p>
          )}
        </>
      )}
    </Sheet>
  )
}

function RecentJournal({ entries, onEntryClick }) {
  if (entries.length === 0) {
    return (
      <div className="card-tinted" style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
        <p style={{ fontSize: 26, marginBottom: 8 }}>📖</p>
        <p className="serif" style={{ fontSize: 15, color: '#2d2618', marginBottom: 6 }}>
          你的塔罗日志还是空的
        </p>
        <p style={{ fontSize: 12, color: '#8a7a5e' }}>
          每次占卜后记录心情，回看你的成长轨迹
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, padding: '0 4px' }}>
        <p className="section-sub">RECENT JOURNAL</p>
        <span style={{ fontSize: 11, color: '#8a7a5e' }}>{entries.length} 条记录</span>
      </div>
      {entries.slice(0, 4).map(entry => (
        <button
          key={entry.id}
          className="card-soft journal-entry"
          onClick={() => onEntryClick(entry)}
          style={{
            width: '100%', padding: '14px 16px', marginBottom: 8,
            display: 'flex', gap: 12, alignItems: 'flex-start',
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: 'transform 0.15s ease',
          }}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.985)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          {/* Card mini art */}
          <div style={{
            width: 34, height: 48, borderRadius: 6, flexShrink: 0,
            overflow: 'hidden',
          }}>
            {(() => {
              const c = MAJOR_ARCANA.find(mc => mc.id === entry.cardId)
              return c ? (
                <div className="scene flipped" style={{ width: '100%', height: '100%' }}>
                  <div className="card-3d" style={{ transform: 'rotateY(180deg)', transition: 'none' }}>
                    <div className="face"><CardBack /></div>
                    <div className="face face-back"><CardFace card={c} /></div>
                  </div>
                </div>
              ) : (
                <div style={{
                  width: '100%', height: '100%',
                  background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#c4924a', fontSize: 16,
                }}>✦</div>
              )
            })()}
          </div>

          <div style={{ flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <p className="serif" style={{ fontSize: 14, color: '#2d2618' }}>
                {entry.cardName || entry.spreadName || '占卜记录'}
              </p>
              {entry.mood && (
                <span className="mood-tag">🌙 有心情</span>
              )}
            </div>
            <p style={{ fontSize: 11, color: '#8a7a5e', marginBottom: entry.mood ? 5 : 0 }}>
              {relTime(entry.createdAt)} · {entry.spreadName || '日抽'}
            </p>
            {entry.mood && (
              <p style={{
                fontSize: 12, color: '#5a4a3a', lineHeight: 1.6,
                display: '-webkit-box', WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical', overflow: 'hidden',
              }}>
                {entry.mood}
              </p>
            )}
          </div>

          <span style={{ fontSize: 12, color: '#c4924a', flexShrink: 0, marginTop: 2 }}>›</span>
        </button>
      ))}
    </div>
  )
}

function QuickActions({ onNavigate }) {
  const actions = [
    { icon: '🃏', label: '抽塔罗', sub: '获得指引', page: 'tarot' },
    { icon: '🌟', label: '查星盘', sub: '解读星象', page: 'astrology' },
    { icon: '🔮', label: '配对', sub: '星座缘分', page: 'astrology' },
    { icon: '💬', label: '社区', sub: '交流分享', page: 'community' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 16 }}>
      {actions.map(a => (
        <button
          key={a.page + a.label}
          onClick={() => onNavigate(a.page)}
          style={{
            background: '#fefcf6',
            border: '1px solid rgba(196,146,74,0.18)',
            borderRadius: 14, padding: '14px 6px',
            cursor: 'pointer', textAlign: 'center',
            transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          }}
          onTouchStart={e => { e.currentTarget.style.transform = 'scale(0.94)'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(45,38,24,0.08)' }}
          onTouchEnd={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '' }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2d2618', marginBottom: 2 }}>{a.label}</div>
          <div style={{ fontSize: 9, color: '#8a7a5e' }}>{a.sub}</div>
        </button>
      ))}
    </div>
  )
}

function getMoonSignIdx(year, month, day) {
  const ref = new Date(2000, 0, 6)
  const target = new Date(year, month - 1, day)
  const days = (target - ref) / 86400000
  const moonDays = ((days % 29.53059) + 29.53059) % 29.53059
  const signIndex = Math.floor(moonDays / 2.461)
  return (9 + signIndex) % 12
}

const SIGN_ORDER = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']

export default function Home({ onNavigate }) {
  const [user] = useState(getUser())
  const [journal, setJournal] = useState(getJournal())
  const [streak, setStreak] = useState(0)
  const [detailCard, setDetailCard] = useState(null)
  const [journalCard, setJournalCard] = useState(null)
  const [openEntry, setOpenEntry] = useState(null)

  useEffect(() => {
    recordVisit()
    setStreak(getStreak())
    const refresh = () => setJournal(getJournal())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  const birth = getUserBirth()
  const sunSignId = birth ? getZodiacByDate(birth.month, birth.day) : null
  const sunSign = sunSignId ? ZODIAC_SIGNS.find(s => s.id === sunSignId) : null
  const moonSignId = (birth && birth.year) ? SIGN_ORDER[getMoonSignIdx(birth.year, birth.month, birth.day)] : null
  const moonSign = moonSignId ? ZODIAC_SIGNS.find(s => s.id === moonSignId) : null

  const hour = new Date().getHours()
  const greeting = hour < 6 ? '深夜安好' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '夜晚好'

  return (
    <div className="animate-fade-in" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, paddingTop: 16 }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 11, color: '#8a7a5e', letterSpacing: '0.15em', marginBottom: 4 }}>
            {greeting.toUpperCase()}
          </p>
          <h1 className="serif" style={{ fontSize: 22, color: '#2d2618', marginBottom: 6 }}>
            {user.name}
          </h1>
          {sunSign && (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{
                fontSize: 11, color: sunSign.elementColor, background: `${sunSign.elementColor}15`,
                padding: '3px 10px', borderRadius: 99, fontWeight: 500,
              }}>
                ☀ {sunSign.name}
              </span>
              {moonSign && (
                <span style={{
                  fontSize: 11, color: '#3e6c8c', background: 'rgba(62,108,140,0.1)',
                  padding: '3px 10px', borderRadius: 99, fontWeight: 500,
                }}>
                  ☽ {moonSign.name}
                </span>
              )}
            </div>
          )}
          {streak > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              marginTop: 8, background: 'rgba(196,146,74,0.12)',
              padding: '4px 10px', borderRadius: 99,
            }}>
              <span style={{ fontSize: 12 }}>🔥</span>
              <span style={{ fontSize: 11, color: '#c4924a', fontWeight: 600 }}>
                连续第{streak}天
              </span>
            </div>
          )}
        </div>
        <div className="animate-float" style={{
          width: 56, height: 56,
          background: 'rgba(196,146,74,0.1)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <Mascot size={42} />
        </div>
      </div>

      <DailyCard onViewDetail={setDetailCard} />
      <DailyIntention />
      <QuickActions onNavigate={onNavigate} />
      <CosmicEnergy />
      <RecentJournal entries={journal} onEntryClick={setOpenEntry} />

      <div style={{ textAlign: 'center', padding: '20px 0 100px' }}>
        <p style={{ fontSize: 9, color: '#8a7a5e', letterSpacing: '0.3em' }}>
          ✦ LUNARIA TAROT ✦
        </p>
      </div>

      {/* Sheets */}
      {detailCard && (
        <CardDetailSheet
          card={detailCard}
          onClose={() => setDetailCard(null)}
          onJournal={(card) => {
            setDetailCard(null)
            setJournalCard(card)
          }}
        />
      )}
      {journalCard && (
        <MoodJournalSheet
          card={journalCard}
          onClose={() => setJournalCard(null)}
          onSaved={() => {
            setJournal(getJournal())
            setJournalCard(null)
          }}
        />
      )}
      {openEntry && (
        <JournalEntrySheet
          entry={openEntry}
          onClose={() => setOpenEntry(null)}
        />
      )}
    </div>
  )
}
