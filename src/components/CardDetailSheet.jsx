import { useState } from 'react'
import { CardFace, CardBack } from './TarotCardArt'
import FullPage from './FullPage'
import PremiumSheet from './PremiumSheet'
import { isPremium } from '../utils/premium'
import { tap } from '../utils/haptics'

const CONTEXT_TABS = [
  { id: 'relationship', icon: '💕', label: '现有关系' },
  { id: 'romance',      icon: '👀', label: '寻找爱情' },
  { id: 'career',       icon: '💼', label: '工作事业' },
  { id: 'finance',      icon: '💰', label: '物质资源' },
  { id: 'family',       icon: '🏠', label: '家庭' },
  { id: 'friends',      icon: '👥', label: '朋友' },
]

function buildContextMeaning(card, ctxId) {
  const k = card.keywords
  const base = card.uprightMeaning
  const map = {
    relationship: {
      preview: `在你们的关系中，${card.nameCN}带来"${k[0]}"的能量共振。${base.slice(0, 38)}……`,
      full: `${base}\n\n在亲密关系的语境下，"${k[0]}"与"${k[1] || k[0]}"是你们之间最需要流动的能量。宇宙提示你：以开放和真实的姿态与伴侣分享内心，而非期待对方猜测。当你展现真正的${k[0]}，关系将迎来新的深度与平衡。`,
    },
    romance: {
      preview: `在寻觅爱情方面，${card.nameCN}的"${k[0]}"正为你引路……`,
      full: `${base}\n\n对于爱情，${card.nameCN}暗示你的磁场正在散发"${k[0]}"的吸引力。不要刻意寻找，保持内心的${k[0]}与${k[2] || k[1] || k[0]}，对的人会在恰当的时机自然出现。此刻最好的准备，是成为你最真实的自己。`,
    },
    career: {
      preview: `在工作事业上，${card.nameCN}呼应着"${k[0]}"的职场能量……`,
      full: `${base}\n\n在职业层面，${card.nameCN}提示你拥有"${k[0]}"的能量优势。无论是项目推进、团队协作还是职业转型，将"${k[1] || k[0]}"的力量带入日常工作，将收获意想不到的突破。你的努力正在被宇宙看见。`,
    },
    finance: {
      preview: `在物质与财务层面，${card.nameCN}揭示"${k[0]}"的金钱流动……`,
      full: `${base}\n\n财务上，${card.nameCN}的能量提示你审视资源的进出方向。做决策前，先问内心：这是否符合你真正的价值观与长远目标？"${k[0]}"的稳健能量能为你带来持久的安全感与丰盛。`,
    },
    family: {
      preview: `在家庭关系中，${card.nameCN}传递"${k[0]}"的家庭能量……`,
      full: `${base}\n\n在家庭能量场中，"${k[0]}"是修复或深化家庭联结的钥匙。试着用理解替代评判，以耐心化解距离感。${card.nameCN}提示你：家人之间的情感连接，在"${k[0]}"的滋养下将悄然改变，绽放新的温柔与亲密。`,
    },
    friends: {
      preview: `在友情与社交层面，${card.nameCN}带来"${k[0]}"的人际频率……`,
      full: `${base}\n\n在朋友关系中，${card.nameCN}的能量提示你，"${k[0]}"正是你吸引并维系真挚友情的核心力量。展现真实的自我，勇敢表达你的想法与情感，志同道合的灵魂自然会走进你的生命，停留在你身旁。`,
    },
  }
  return map[ctxId] || { preview: base.slice(0, 60) + '……', full: base }
}

export default function CardDetailSheet({ card, onClose, onJournal }) {
  const [activeCtx, setActiveCtx] = useState('relationship')
  const [showPremium, setShowPremium] = useState(false)
  const premium = isPremium()
  const ctx = buildContextMeaning(card, activeCtx)

  return (
    <FullPage onClose={onClose}>
      {/* Card hero */}
      <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', padding: '16px 20px 22px' }}>
        <div
          className="animate-card-glow"
          style={{ width: 86, height: 138, flexShrink: 0, borderRadius: 12 }}
        >
          <div className="scene flipped" style={{ width: '100%', height: '100%' }}>
            <div className="card-3d" style={{ transform: 'rotateY(180deg)', transition: 'none' }}>
              <div className="face"><CardBack /></div>
              <div className="face face-back"><CardFace card={card} /></div>
            </div>
          </div>
        </div>

        <div style={{ flex: 1, paddingTop: 6 }}>
          <p style={{ fontSize: 10, color: '#c4924a', letterSpacing: '0.22em', marginBottom: 6, fontWeight: 600 }}>
            今日之牌 · {card.number}
          </p>
          <h2 className="serif" style={{ fontSize: 27, color: '#2d2618', lineHeight: 1.2, marginBottom: 5 }}>
            {card.nameCN}
          </h2>
          <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.14em', marginBottom: 10 }}>
            {card.name.toUpperCase()}
          </p>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
            {card.keywords.slice(0, 3).map(k => (
              <span key={k} className="pill pill-gold">{k}</span>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 10, color: '#8a7a5e' }}>✦ {card.element}元素</span>
            {card.planet && <span style={{ fontSize: 10, color: '#8a7a5e' }}>· {card.planet}</span>}
          </div>
        </div>
      </div>

      {/* Today's reading */}
      <div style={{ padding: '0 20px', marginBottom: 22 }}>
        <p style={{ fontSize: 10, color: '#c4924a', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 10 }}>
          ✦ 今日解读
        </p>
        <div style={{
          padding: '16px 18px',
          background: 'rgba(196,146,74,0.05)',
          borderRadius: 16,
          borderLeft: '3px solid rgba(196,146,74,0.45)',
        }}>
          <p style={{ fontSize: 14, color: '#3d3327', lineHeight: 2 }}>
            {card.uprightMeaning}
          </p>
        </div>
      </div>

      {/* Context section */}
      <div style={{ marginBottom: 22 }}>
        <p style={{ fontSize: 10, color: '#c4924a', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 12, padding: '0 20px' }}>
          ✦ 语境中的含义
        </p>

        {/* Tab strip */}
        <div style={{
          display: 'flex', overflowX: 'auto', overflowY: 'hidden',
          padding: '0 12px',
          borderBottom: '1px solid rgba(196,146,74,0.14)',
          marginBottom: 16,
        }}>
          {CONTEXT_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => { tap(); setActiveCtx(tab.id) }}
              className={`ctx-tab${activeCtx === tab.id ? ' active' : ''}`}
            >
              <span style={{ fontSize: 17 }}>{tab.icon}</span>
              <span className="ctx-lbl">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Context content */}
        <div style={{ padding: '0 20px' }}>
          <div style={{
            background: '#fff',
            borderRadius: 16,
            padding: '18px 18px',
            border: '1px solid rgba(196,146,74,0.15)',
            position: 'relative', overflow: 'hidden',
          }}>
            {premium ? (
              <p style={{ fontSize: 13.5, color: '#3d3327', lineHeight: 2, whiteSpace: 'pre-line' }}>
                {ctx.full}
              </p>
            ) : (
              <>
                <p style={{ fontSize: 13.5, color: '#3d3327', lineHeight: 2 }}>
                  {ctx.preview}
                </p>
                <div style={{ position: 'relative', marginTop: 6 }}>
                  <p style={{
                    fontSize: 13.5, color: '#3d3327', lineHeight: 2,
                    filter: 'blur(5px)', userSelect: 'none',
                    WebkitUserSelect: 'none', pointerEvents: 'none',
                  }}>
                    {ctx.full}
                  </p>
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,0.97) 38%)',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'flex-end',
                    paddingBottom: 10,
                  }}>
                    <p style={{ fontSize: 11, color: '#8a7a5e', marginBottom: 10 }}>需要高级权限</p>
                    <button
                      onClick={() => setShowPremium(true)}
                      style={{
                        background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
                        color: '#fdf9f0', border: 'none', borderRadius: 999,
                        padding: '11px 28px', fontSize: 13, fontWeight: 600,
                        cursor: 'pointer', letterSpacing: '0.05em',
                        boxShadow: '0 4px 16px rgba(45,74,62,0.3)',
                      }}
                    >
                      解锁全部含义 ✦
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Bottom action buttons */}
      <div style={{ display: 'flex', gap: 10, padding: '0 20px' }}>
        <button
          onClick={() => { onClose(); setTimeout(() => onJournal && onJournal(card), 400) }}
          style={{
            flex: 1, padding: '14px', fontSize: 13, fontWeight: 500,
            background: '#fdf9f0',
            border: '1px solid rgba(196,146,74,0.3)',
            borderRadius: 14, cursor: 'pointer', color: '#5a4a3a',
            transition: 'all 0.2s ease',
          }}
          onTouchStart={e => e.currentTarget.style.background = '#f5e8cc'}
          onTouchEnd={e => e.currentTarget.style.background = '#fdf9f0'}
        >
          📖 记录心情
        </button>
        <button
          onClick={() => setShowPremium(true)}
          style={{
            flex: 1.3, padding: '14px',
            background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
            color: '#2d1800', border: 'none', borderRadius: 14,
            fontSize: 13, fontWeight: 700, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(196,146,74,0.4)',
            letterSpacing: '0.03em',
          }}
        >
          深度占卜 ✦ →
        </button>
      </div>

      {showPremium && (
        <PremiumSheet onClose={() => setShowPremium(false)} />
      )}
    </FullPage>
  )
}
