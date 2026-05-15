import { useState, useEffect } from 'react'
import { MAJOR_ARCANA } from '../data/tarotCards'
import { CardFace, CardBack } from '../components/TarotCardArt'
import Mascot from '../components/Mascot'
import { getJournal, getUser, saveReading, relTime } from '../utils/storage'

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

function useDailyCard() {
  // Stable daily card based on date
  const today = new Date()
  const seed = today.getFullYear() * 1000 + today.getMonth() * 50 + today.getDate()
  const idx = seed % MAJOR_ARCANA.length
  return MAJOR_ARCANA[idx]
}

function DailyCard({ onSave }) {
  const card = useDailyCard()
  const [revealed, setRevealed] = useState(false)
  const today = new Date()
  const dateLabel = today.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })

  return (
    <div className="card-soft" style={{ padding: 24, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div>
          <p className="section-sub">DAILY DRAW</p>
          <p className="section-title" style={{ fontSize: 18 }}>今日塔罗</p>
        </div>
        <p style={{ fontSize: 11, color: '#8a7a5e', textAlign: 'right' }}>{dateLabel}</p>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <div
          className={`scene ${revealed ? 'flipped' : ''}`}
          style={{ width: 96, height: 154, flexShrink: 0, cursor: revealed ? 'default' : 'pointer' }}
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
            <>
              <h3 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 4 }}>
                {card.nameCN}
              </h3>
              <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.15em', marginBottom: 10 }}>
                {card.name.toUpperCase()}
              </p>
              <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                {card.keywords.slice(0, 3).map(k => (
                  <span key={k} className="pill pill-forest">{k}</span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: '#5a4a3a', lineHeight: 1.7 }}>
                {card.uprightMeaning.slice(0, 50)}…
              </p>
            </>
          )}
        </div>
      </div>

      {revealed && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          <button
            className="btn-secondary"
            style={{ flex: 1, fontSize: 12, padding: '10px 14px' }}
            onClick={() => { onSave(card); }}
          >
            ✦ 记入日志
          </button>
        </div>
      )}
    </div>
  )
}

function MoonPhaseCard() {
  const day = new Date().getDate()
  const idx = Math.floor((day % 30) / 4)
  const phase = MOON_PHASES[idx]
  const quote = DAILY_QUOTES[new Date().getDay()]

  return (
    <div className="card-tinted" style={{ padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
        <div style={{
          width: 56, height: 56, borderRadius: '50%',
          background: 'radial-gradient(circle at 30% 30%, #faf4e8, #c4924a)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28, flexShrink: 0,
          boxShadow: '0 4px 16px rgba(196,146,74,0.25)',
        }}>
          {phase.icon}
        </div>
        <div>
          <p className="section-sub">CURRENT MOON</p>
          <p className="serif" style={{ fontSize: 18, color: '#2d2618', marginBottom: 2 }}>
            {phase.name}
          </p>
          <p style={{ fontSize: 11, color: '#8a7a5e' }}>{phase.hint}</p>
        </div>
      </div>
      <div style={{
        background: 'rgba(196,146,74,0.08)',
        borderRadius: 12, padding: 12,
        borderLeft: '3px solid #c4924a',
      }}>
        <p style={{ fontSize: 12, color: '#5a4a3a', lineHeight: 1.7, fontStyle: 'italic' }}>
          "{quote}"
        </p>
      </div>
    </div>
  )
}

function RecentJournal({ entries, onNavigate }) {
  if (entries.length === 0) {
    return (
      <div className="card-tinted" style={{ padding: 20, marginBottom: 20, textAlign: 'center' }}>
        <p style={{ fontSize: 26, marginBottom: 8 }}>📖</p>
        <p className="serif" style={{ fontSize: 15, color: '#2d2618', marginBottom: 6 }}>
          你的塔罗日志还是空的
        </p>
        <p style={{ fontSize: 12, color: '#8a7a5e' }}>
          每次占卜后保存，回看你的成长轨迹
        </p>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10, padding: '0 4px' }}>
        <p className="section-sub">RECENT JOURNAL</p>
        <span style={{ fontSize: 11, color: '#8a7a5e' }}>{entries.length} 条记录</span>
      </div>
      {entries.slice(0, 3).map(entry => (
        <div
          key={entry.id}
          className="card-soft"
          style={{ padding: 14, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center' }}
        >
          <div style={{
            width: 36, height: 50, borderRadius: 4,
            background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#c4924a', fontSize: 18, flexShrink: 0,
          }}>
            ✦
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <p className="serif" style={{ fontSize: 14, color: '#2d2618', marginBottom: 2 }}>
              {entry.cardName || entry.spreadName || '占卜记录'}
            </p>
            <p style={{ fontSize: 11, color: '#8a7a5e' }}>
              {relTime(entry.createdAt)} · {entry.spreadName || '日抽'}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}

function QuickActions({ onNavigate }) {
  const actions = [
    { icon: '🃏', label: '抽塔罗', sub: '获得指引', page: 'tarot' },
    { icon: '🌟', label: '查星盘', sub: '解读星象', page: 'astrology' },
    { icon: '📖', label: '词典', sub: '学习含义', page: 'library' },
    { icon: '💬', label: '社区', sub: '交流分享', page: 'community' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
      {actions.map(a => (
        <button
          key={a.page}
          onClick={() => onNavigate(a.page)}
          style={{
            background: '#fefcf6',
            border: '1px solid rgba(196,146,74,0.18)',
            borderRadius: 14, padding: '14px 6px',
            cursor: 'pointer', textAlign: 'center',
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>{a.icon}</div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#2d2618', marginBottom: 2 }}>{a.label}</div>
          <div style={{ fontSize: 9, color: '#8a7a5e' }}>{a.sub}</div>
        </button>
      ))}
    </div>
  )
}

export default function Home({ onNavigate }) {
  const [user, setUser] = useState(getUser())
  const [journal, setJournal] = useState(getJournal())

  useEffect(() => {
    const refresh = () => setJournal(getJournal())
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [])

  function handleSaveDaily(card) {
    saveReading({
      type: 'daily',
      cardId: card.id,
      cardName: card.nameCN,
      spreadName: '每日塔罗',
      cards: [{ cardId: card.id, reversed: false, position: '今日能量' }],
      note: '',
    })
    setJournal(getJournal())
  }

  const hour = new Date().getHours()
  const greeting = hour < 6 ? '深夜安好' : hour < 12 ? '早上好' : hour < 18 ? '下午好' : '夜晚好'

  return (
    <div className="animate-fade-in" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      {/* Header with mascot */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingTop: 16 }}>
        <div>
          <p style={{ fontSize: 11, color: '#8a7a5e', letterSpacing: '0.15em', marginBottom: 4 }}>
            {greeting.toUpperCase()}
          </p>
          <h1 className="serif" style={{ fontSize: 22, color: '#2d2618' }}>
            {user.name}
          </h1>
        </div>
        <div className="animate-float" style={{
          width: 56, height: 56,
          background: 'rgba(196,146,74,0.1)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Mascot size={42} />
        </div>
      </div>

      <DailyCard onSave={handleSaveDaily} />
      <MoonPhaseCard />
      <QuickActions onNavigate={onNavigate} />
      <RecentJournal entries={journal} onNavigate={onNavigate} />

      {/* Footer brand */}
      <div style={{ textAlign: 'center', padding: '20px 0 100px' }}>
        <p style={{ fontSize: 9, color: '#8a7a5e', letterSpacing: '0.3em' }}>
          ✦ LUNARIA TAROT ✦
        </p>
      </div>
    </div>
  )
}
