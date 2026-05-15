import { useState, useEffect } from 'react'

const DAILY_MESSAGES = [
  '宇宙正在为你对齐最完美的能量频率',
  '今天是一个播种意图的好日子，想清楚你真正渴望的是什么',
  '内心的声音比任何预言都更准确，请倾听它',
  '你所寻找的，也在寻找你',
  '星辰已经为你铺好了道路，相信自己，迈步前行',
  '今日的挑战是明日智慧的来源，请勇敢经历',
  '放下控制，宇宙自有安排',
]

const DAILY_CARDS = ['愚者', '魔法师', '女祭司', '女皇', '力量', '星星', '太阳']
const CARD_SYMBOLS = ['🌟', '⚡', '🌙', '🌸', '🦁', '✨', '☀']

function DailyCard({ onNavigate }) {
  const dayIndex = new Date().getDay()
  return (
    <div
      className="glass"
      style={{
        borderRadius: 20,
        padding: 24,
        marginBottom: 20,
        background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))',
        border: '1px solid rgba(124,58,237,0.25)',
        cursor: 'pointer',
      }}
      onClick={() => onNavigate('tarot')}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, letterSpacing: '0.12em', color: '#a78bfa', fontWeight: 600, textTransform: 'uppercase' }}>
          每日塔罗
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>
          {new Date().toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
        <div
          style={{
            width: 72,
            height: 100,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 24px rgba(124,58,237,0.4)',
            flexShrink: 0,
            border: '1px solid rgba(255,255,255,0.15)',
          }}
        >
          <span style={{ fontSize: 28 }}>{CARD_SYMBOLS[dayIndex]}</span>
          <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.6)', marginTop: 4, letterSpacing: '0.1em' }}>
            {DAILY_CARDS[dayIndex]}
          </span>
        </div>
        <div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 8, fontFamily: 'Cinzel, serif' }}>
            {DAILY_CARDS[dayIndex]}
          </p>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6 }}>
            {DAILY_MESSAGES[dayIndex]}
          </p>
          <div style={{ marginTop: 12, display: 'flex', gap: 6 }}>
            {['新开始', '冒险', '直觉'].map(t => (
              <span key={t} style={{
                fontSize: 10, padding: '3px 8px',
                background: 'rgba(124,58,237,0.2)',
                borderRadius: 20, color: '#a78bfa',
                border: '1px solid rgba(124,58,237,0.3)',
              }}>{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function QuickActions({ onNavigate }) {
  const actions = [
    { icon: '🃏', label: '抽牌占卜', sub: '探索宇宙信息', page: 'tarot', color: '#7c3aed' },
    { icon: '🔮', label: '星盘分析', sub: '解读天赋使命', page: 'astrology', color: '#0ea5e9' },
    { icon: '✨', label: '灵性社区', sub: '与同行者连接', page: 'community', color: '#f59e0b' },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
      {actions.map(a => (
        <button
          key={a.page}
          onClick={() => onNavigate(a.page)}
          style={{
            background: `rgba(${a.color === '#7c3aed' ? '124,58,237' : a.color === '#0ea5e9' ? '14,165,233' : '245,158,11'},0.08)`,
            border: `1px solid rgba(${a.color === '#7c3aed' ? '124,58,237' : a.color === '#0ea5e9' ? '14,165,233' : '245,158,11'},0.2)`,
            borderRadius: 16,
            padding: '16px 8px',
            cursor: 'pointer',
            textAlign: 'center',
            transition: 'all 0.25s ease',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ fontSize: 28, marginBottom: 8 }}>{a.icon}</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9', marginBottom: 3 }}>{a.label}</div>
          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{a.sub}</div>
        </button>
      ))}
    </div>
  )
}

function MoonPhase() {
  const day = new Date().getDate()
  const phases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
  const phase = phases[Math.floor((day % 30) / 4)]
  const phaseNames = ['新月', '峨眉月', '上弦月', '盈凸月', '满月', '亏凸月', '下弦月', '残月']
  const phaseName = phaseNames[Math.floor((day % 30) / 4)]

  return (
    <div className="glass" style={{ borderRadius: 20, padding: 20, marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase' }}>
            当前月相
          </p>
          <p style={{ fontSize: 20, fontWeight: 700, color: '#f1f5f9', fontFamily: 'Cinzel, serif' }}>
            {phaseName}
          </p>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>
            {phaseName === '满月' || phaseName === '盈凸月' ? '适合感恩与释放旧有模式' :
             phaseName === '新月' || phaseName === '峨眉月' ? '适合播种新的意图与心愿' :
             '宇宙能量持续汇聚中'}
          </p>
        </div>
        <div style={{ fontSize: 56, filter: 'drop-shadow(0 0 12px rgba(245,158,11,0.5))' }}>
          {phase}
        </div>
      </div>
    </div>
  )
}

export default function Home({ onNavigate }) {
  const [visible, setVisible] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])

  return (
    <div
      style={{
        padding: '60px 20px 100px',
        maxWidth: 480,
        margin: '0 auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.6s ease',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: 'rgba(245,158,11,0.1)',
            border: '1px solid rgba(245,158,11,0.25)',
            borderRadius: 20,
            padding: '6px 16px',
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 10, color: '#f59e0b', letterSpacing: '0.15em', fontWeight: 600 }}>
            ✦ MYSTIC ORACLE ✦
          </span>
        </div>
        <h1
          style={{
            fontFamily: 'Cinzel, serif',
            fontSize: 30,
            fontWeight: 700,
            background: 'linear-gradient(135deg, #f59e0b, #fcd34d, #f59e0b)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '0.05em',
            marginBottom: 10,
          }}
        >
          神谕
        </h1>
        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', letterSpacing: '0.08em' }}>
          塔罗 · 星盘 · 灵性社区
        </p>
      </div>

      <DailyCard onNavigate={onNavigate} />
      <QuickActions onNavigate={onNavigate} />
      <MoonPhase />

      {/* Hot community post */}
      <div
        className="glass"
        style={{ borderRadius: 20, padding: 20, cursor: 'pointer' }}
        onClick={() => onNavigate('community')}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontSize: 11, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>
            社区热帖
          </span>
          <span style={{ fontSize: 11, color: '#f59e0b' }}>查看全部 →</span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 32 }}>🔮</span>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: '#f1f5f9', marginBottom: 6 }}>
              土星回归——一场灵魂的必修课
            </p>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>
              28-30岁的土星回归如何成为人生最重要的蜕变期……
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>❤ 1204</span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>💬 256</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
