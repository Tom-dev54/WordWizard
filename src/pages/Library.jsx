import { useState } from 'react'
import { MAJOR_ARCANA } from '../data/tarotCards'
import { ZODIAC_SIGNS } from '../data/zodiacData'
import { CardFace } from '../components/TarotCardArt'
import Sheet from '../components/Sheet'

const LESSONS = [
  {
    id: 'l1', emoji: '🌱', title: '塔罗入门：什么是塔罗？',
    desc: '了解塔罗的起源、基础概念与正确使用方式',
    level: '入门',
    content: `塔罗牌起源于15世纪的意大利，最初是宫廷游戏，后来逐渐演化为占卜与灵性探索的工具。\n\n一副完整的塔罗牌共78张：22张大阿尔卡纳（主牌），代表人生的重大主题与灵魂的旅程；56张小阿尔卡纳（副牌），分为权杖（火）、圣杯（水）、宝剑（风）、星币（土）四个花色，反映日常生活的各个层面。\n\n使用塔罗的核心不是预测未来，而是反思当下、看清自己。每一张牌都是一面镜子，照见你内心已经知道但尚未承认的真相。`,
  },
  {
    id: 'l2', emoji: '🌙', title: '正位与逆位：能量的两面',
    desc: '理解牌面方向变化背后的能量流动',
    level: '入门',
    content: `每张塔罗牌都有"正位"和"逆位"两种状态。正位通常代表能量自然流动、主题外显；逆位则代表能量受阻、内在化或反向表达。\n\n但逆位并不一定是"坏"的。例如"死神"牌正位代表必要的结束与转化，逆位则可能意味着抗拒改变。同样的能量，只是表达方式不同。\n\n初学者建议先专注正位含义，掌握扎实后再加入逆位解读。`,
  },
  {
    id: 'l3', emoji: '☀', title: '大阿尔卡纳：愚者之旅',
    desc: '22张主牌的灵魂成长叙事',
    level: '进阶',
    content: `从0号愚者到21号世界，22张大阿尔卡纳串联起一个完整的"愚者之旅"——一个灵魂从纯真无知，经历各种考验、智慧与转化，最终达到圆满整合的过程。\n\n每张牌都是这趟旅程中的一个关键节点：魔法师是行动的开始，女祭司是直觉的觉醒，恋人是重要选择，命运之轮是变化的浪潮，塔是必要的崩塌，星星是希望的复苏……\n\n当你抽到大阿尔卡纳，意味着你正面对人生层面的重要课题。`,
  },
  {
    id: 'l4', emoji: '⚖', title: '如何提出好的占卜问题',
    desc: '问题决定答案——提问的艺术',
    level: '进阶',
    content: `塔罗占卜的准确性，70%取决于问题质量。\n\n避免封闭式问题（"他会不会回来？"），改为开放式（"我们这段关系当下的能量是什么？"）。避免预测式（"我什么时候能升职？"），改为自省式（"我现在应该专注于什么来推进事业？"）。\n\n好问题的特征：聚焦自己（不是别人）、开放可探索、不带强烈预设。塔罗是镜子而不是水晶球。`,
  },
  {
    id: 'l5', emoji: '🔮', title: '占星基础：你的星盘',
    desc: '太阳、月亮与上升——三大支柱',
    level: '入门',
    content: `传统星座栏目只讲太阳星座，但真正的占星远不止于此。\n\n太阳星座（Sun Sign）：你的核心自我、人生方向\n月亮星座（Moon Sign）：你的情绪、潜意识、依恋模式\n上升星座（Ascending Sign）：你的外在形象、初见印象、人生面具\n\n这三个共同构成你的"星座三巨头"。通常上升决定别人初见的你，太阳决定本质的你，月亮决定独处时的你。要计算月亮和上升，需要精确的出生时间和地点。`,
  },
  {
    id: 'l6', emoji: '✦', title: '行星与宫位：人生剧场',
    desc: '十大行星 + 十二宫位的组合',
    level: '高阶',
    content: `星盘上有十大行星：太阳（自我）、月亮（情感）、水星（思维）、金星（爱与美）、火星（行动）、木星（扩展）、土星（限制）、天王星（变革）、海王星（梦想）、冥王星（深度转化）。\n\n每颗行星落在不同星座，决定它的"表达方式"；落在不同宫位（共12宫），决定它"在人生哪个领域"产生影响。\n\n例如：火星在白羊座1宫，代表行动力极强、勇敢直接，主要表现在个人外在；火星在巨蟹座4宫，则是为家庭与情感而战斗的能量。`,
  },
]

function CardLibrary() {
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const ELEMENTS = ['all', '火', '风', '水', '土']
  const filtered = filter === 'all' ? MAJOR_ARCANA : MAJOR_ARCANA.filter(c => c.element === filter)

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, overflowX: 'auto' }}>
        {ELEMENTS.map(el => (
          <button
            key={el}
            onClick={() => setFilter(el)}
            style={{
              padding: '7px 16px', borderRadius: 999, whiteSpace: 'nowrap',
              border: 'none', cursor: 'pointer', fontSize: 12,
              background: filter === el ? '#2d4a3e' : '#fdf9f0',
              color: filter === el ? '#fdf9f0' : '#5a4a3a',
              fontWeight: filter === el ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {el === 'all' ? '全部' : `${el}元素`}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {filtered.map(card => (
          <button
            key={card.id}
            onClick={() => setSelected(card)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{ width: '100%', aspectRatio: '2/3', borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 8px rgba(45,38,24,0.1)', transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
              onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
              onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
            >
              <CardFace card={card} />
            </div>
            <p style={{ fontSize: 10, color: '#5a4a3a', marginTop: 6, textAlign: 'center', fontWeight: 500 }}>
              {card.nameCN}
            </p>
          </button>
        ))}
      </div>

      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          {(dismiss) => (
            <>
              <div className="sheet-handle" />
              <div style={{ display: 'flex', gap: 18, marginBottom: 20 }}>
                <div style={{ width: 100, height: 156, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
                  <CardFace card={selected} />
                </div>
                <div style={{ paddingTop: 4 }}>
                  <p style={{ fontSize: 10, color: '#8a7a5e', letterSpacing: '0.2em', marginBottom: 4 }}>{selected.number}</p>
                  <h2 className="serif" style={{ fontSize: 24, color: '#2d2618', marginBottom: 2 }}>{selected.nameCN}</h2>
                  <p style={{ fontSize: 12, color: '#8a7a5e', fontStyle: 'italic', marginBottom: 12 }}>{selected.name}</p>
                  <div style={{ fontSize: 11, color: '#5a4a3a' }}>
                    🜂 {selected.element} · 🪐 {selected.planet}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
                {selected.keywords.map(k => <span key={k} className="pill pill-forest">{k}</span>)}
              </div>
              <div style={{ background: 'rgba(45,74,62,0.06)', borderRadius: 12, padding: 14, marginBottom: 10, borderLeft: '3px solid #2d4a3e' }}>
                <p style={{ fontSize: 11, color: '#2d4a3e', marginBottom: 6, fontWeight: 600 }}>△ 正位</p>
                <p style={{ fontSize: 12, color: '#3d3327', lineHeight: 1.7 }}>{selected.uprightMeaning}</p>
              </div>
              <div style={{ background: 'rgba(140,74,94,0.06)', borderRadius: 12, padding: 14, marginBottom: 16, borderLeft: '3px solid #8c4a5e' }}>
                <p style={{ fontSize: 11, color: '#6e3848', marginBottom: 6, fontWeight: 600 }}>▽ 逆位</p>
                <p style={{ fontSize: 12, color: '#3d3327', lineHeight: 1.7 }}>{selected.reversedMeaning}</p>
              </div>
              <button onClick={dismiss} className="btn-primary" style={{ width: '100%' }}>关闭</button>
            </>
          )}
        </Sheet>
      )}
    </div>
  )
}

function ZodiacLibrary() {
  const [selected, setSelected] = useState(null)
  const ELEMENT_COLORS = { '火': '#c44a3e', '土': '#5c7a3e', '风': '#c4924a', '水': '#3e6c8c' }
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
      {ZODIAC_SIGNS.map(sign => {
        const color = ELEMENT_COLORS[sign.element]
        return (
          <button
            key={sign.id}
            onClick={() => setSelected(sign)}
            className="card-soft"
            style={{ padding: 14, border: 'none', cursor: 'pointer', textAlign: 'left', transition: 'transform 0.15s ease' }}
            onTouchStart={e => e.currentTarget.style.transform = 'scale(0.97)'}
            onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: color, color: '#fdf9f0', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>{sign.symbol}</div>
              <div>
                <p className="serif" style={{ fontSize: 14, color: '#2d2618' }}>{sign.name}</p>
                <p style={{ fontSize: 10, color: '#8a7a5e' }}>{sign.dates}</p>
              </div>
            </div>
          </button>
        )
      })}
      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          {(dismiss) => (
            <>
              <div className="sheet-handle" />
              <div style={{ display: 'flex', gap: 14, marginBottom: 18 }}>
                <div style={{
                  width: 64, height: 64, borderRadius: '50%',
                  background: ELEMENT_COLORS[selected.element], color: '#fdf9f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 32, flexShrink: 0,
                }}>{selected.symbol}</div>
                <div>
                  <h2 className="serif" style={{ fontSize: 22, color: '#2d2618' }}>{selected.name}</h2>
                  <p style={{ fontSize: 11, color: '#8a7a5e', fontStyle: 'italic' }}>{selected.en}</p>
                  <p style={{ fontSize: 11, color: '#5a4a3a', marginTop: 4 }}>{selected.dates}</p>
                </div>
              </div>
              <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.9, marginBottom: 16 }}>
                {selected.description}
              </p>
              <button onClick={dismiss} className="btn-primary" style={{ width: '100%' }}>关闭</button>
            </>
          )}
        </Sheet>
      )}
    </div>
  )
}

function LessonLibrary() {
  const [selected, setSelected] = useState(null)
  return (
    <div>
      {LESSONS.map(lesson => (
        <button
          key={lesson.id}
          onClick={() => setSelected(lesson)}
          className="card-soft"
          style={{
            width: '100%', padding: 16, marginBottom: 10,
            display: 'flex', alignItems: 'center', gap: 14,
            border: 'none', cursor: 'pointer', textAlign: 'left',
            transition: 'transform 0.15s ease',
          }}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: 'linear-gradient(135deg, #c4924a, #a87838)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, flexShrink: 0,
          }}>{lesson.emoji}</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              <span className="pill pill-cream" style={{ fontSize: 9 }}>{lesson.level}</span>
            </div>
            <p className="serif" style={{ fontSize: 15, color: '#2d2618', marginBottom: 3 }}>{lesson.title}</p>
            <p style={{ fontSize: 11, color: '#8a7a5e' }}>{lesson.desc}</p>
          </div>
          <span style={{ color: '#c4924a', fontSize: 18 }}>›</span>
        </button>
      ))}
      {selected && (
        <Sheet onClose={() => setSelected(null)}>
          {(dismiss) => (
            <>
              <div className="sheet-handle" />
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: 36 }}>{selected.emoji}</span>
                <div>
                  <span className="pill pill-gold" style={{ fontSize: 9 }}>{selected.level}</span>
                  <h2 className="serif" style={{ fontSize: 19, color: '#2d2618', marginTop: 4 }}>{selected.title}</h2>
                </div>
              </div>
              <div style={{ fontSize: 13, color: '#3d3327', lineHeight: 2, whiteSpace: 'pre-line', marginBottom: 18 }}>
                {selected.content}
              </div>
              <button onClick={dismiss} className="btn-primary" style={{ width: '100%' }}>读完了</button>
            </>
          )}
        </Sheet>
      )}
    </div>
  )
}

export default function Library() {
  const [tab, setTab] = useState('cards')
  const TABS = [
    { id: 'cards', label: '塔罗牌典', count: MAJOR_ARCANA.length },
    { id: 'zodiac', label: '星座大全', count: 12 },
    { id: 'lessons', label: '学习课程', count: LESSONS.length },
  ]
  return (
    <div className="animate-fade-in pb-nav" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ paddingTop: 16, marginBottom: 20, textAlign: 'center' }}>
        <p className="section-sub">LIBRARY</p>
        <h1 className="serif" style={{ fontSize: 26, color: '#2d2618' }}>词典 · 学习</h1>
      </div>

      <div style={{
        background: '#fdf9f0',
        borderRadius: 999, padding: 4,
        display: 'flex', gap: 4, marginBottom: 20,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1, padding: '9px 4px',
              borderRadius: 999, border: 'none', cursor: 'pointer',
              background: tab === t.id ? '#2d4a3e' : 'transparent',
              color: tab === t.id ? '#fdf9f0' : '#5a4a3a',
              fontSize: 12, fontWeight: tab === t.id ? 600 : 400,
              transition: 'all 0.25s ease',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'cards' && <CardLibrary />}
      {tab === 'zodiac' && <ZodiacLibrary />}
      {tab === 'lessons' && <LessonLibrary />}

      <div style={{ height: 80 }} />
    </div>
  )
}
