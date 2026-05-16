import { useState, useMemo, useEffect } from 'react'
import { ZODIAC_SIGNS, ZODIAC_EXTENDED, getZodiacByDate } from '../data/zodiacData'
import {
  STEMS, BRANCHES, STEM_ELEMENTS, BRANCH_ELEMENTS,
  ELEMENT_COLORS, DAY_MASTER_DESC, getBazi, getElementBalance, getDaYun,
} from '../data/baziData'
import { getUserBirth, saveUserBirth } from '../utils/storage'
import { isPremium } from '../utils/premium'
import { getAIReading, buildAstrologyPrompt } from '../utils/deepseek'
import PremiumGate from '../components/PremiumGate'
import PremiumSheet from '../components/PremiumSheet'
import { tap } from '../utils/haptics'

const SIGN_ORDER = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']
const ELCOL = { '火': '#c44a3e', '土': '#5c7a3e', '风': '#c4924a', '水': '#3e6c8c' }
const SIGNS = ZODIAC_SIGNS.map(s => ({ ...s, ...ZODIAC_EXTENDED[s.id] }))

// ── Utility helpers ──────────────────────────────────────────────────────────

function getMoonSignIdx(year, month, day) {
  const ref = new Date(2000, 0, 6)
  const target = new Date(year, month - 1, day)
  const days = (target - ref) / 86400000
  const moonDay = ((days % 29.53059) + 29.53059) % 29.53059
  return (9 + Math.floor(moonDay / 2.461)) % 12
}

function getRisingSignIdx(sunSignIdx, hour) {
  const offset = Math.round((parseInt(hour) - 6) / 2)
  return ((sunSignIdx + offset) % 12 + 12) % 12
}

function dailyScore(signId, area, date) {
  const ext = ZODIAC_EXTENDED[signId]
  const base = ext.fortuneScores[area] || 75
  const seed = (signId.charCodeAt(0) * 7 + date.getDate() * 13 + date.getMonth() * 17 + ['love','career','wealth','social'].indexOf(area) * 11) % 41
  return Math.min(99, Math.max(55, base + seed - 20))
}

// ── Planet / NatalChart data ─────────────────────────────────────────────────

const PLANETS = ['sun','moon','mercury','venus','mars','jupiter','saturn','uranus','neptune']
const PLANET_CN  = { sun:'日', moon:'月', mercury:'水', venus:'金', mars:'火', jupiter:'木', saturn:'土', uranus:'天', neptune:'海' }
const PLANET_SYM = { sun:'☉', moon:'☽', mercury:'☿', venus:'♀', mars:'♂', jupiter:'♃', saturn:'♄', uranus:'⛢', neptune:'♆' }
const PLANET_COLORS = {
  sun:'#f5c842', moon:'#c8d8e8', mercury:'#b0b0b0',
  venus:'#e8a040', mars:'#e04040', jupiter:'#9060c0',
  saturn:'#6080a0', uranus:'#40b8a0', neptune:'#4060d0',
}
const PLANET_PERIODS = { sun:365.25, moon:29.53, mercury:87.97, venus:224.7, mars:686.97, jupiter:4332.6, saturn:10759.2, uranus:30688.5, neptune:60182.0 }
const PLANET_REF    = { sun:280.46, moon:218.31, mercury:252.25, venus:181.97, mars:355.43, jupiter:34.35, saturn:50.08, uranus:314.05, neptune:304.35 }
const SIGN_SHORT = ['羊','牛','双','蟹','狮','处','秤','蝎','射','摩','瓶','鱼']

const ASPECT_DEFS = [
  { key:'conjunction', label:'合相', exact:0,   orb:8,  color:'#f0d040', op:0.75 },
  { key:'sextile',     label:'六合', exact:60,  orb:6,  color:'#40c060', op:0.65 },
  { key:'square',      label:'刑',   exact:90,  orb:7,  color:'#e04040', op:0.65 },
  { key:'trine',       label:'三合', exact:120, orb:8,  color:'#4080e0', op:0.70 },
  { key:'opposition',  label:'对冲', exact:180, orb:10, color:'#e040a0', op:0.60 },
]

function getPlanetDegrees(year, month, day) {
  const days = (new Date(year, month - 1, day) - new Date(2000, 0, 1)) / 86400000
  return Object.fromEntries(
    PLANETS.map(p => [p, ((PLANET_REF[p] + (days / PLANET_PERIODS[p]) * 360) % 360 + 360) % 360])
  )
}

function getAspects(degs) {
  const aspects = []
  for (let i = 0; i < PLANETS.length; i++) {
    for (let j = i + 1; j < PLANETS.length; j++) {
      let diff = Math.abs(degs[PLANETS[i]] - degs[PLANETS[j]])
      if (diff > 180) diff = 360 - diff
      for (const asp of ASPECT_DEFS) {
        if (Math.abs(diff - asp.exact) <= asp.orb) {
          aspects.push({ p1: PLANETS[i], p2: PLANETS[j], ...asp })
          break
        }
      }
    }
  }
  return aspects
}

// ── 紫微斗数 data ────────────────────────────────────────────────────────────

const PALACE_NAMES = ['命宫','兄弟','夫妻','子女','财帛','疾厄','迁移','交友','官禄','田宅','福德','父母']
const ZW_BRANCHES  = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥']

const ZW_GRID = [
  { r:1, c:1, b:5 }, { r:1, c:2, b:6 }, { r:1, c:3, b:7 }, { r:1, c:4, b:8 },
  { r:2, c:1, b:4 },                                         { r:2, c:4, b:9 },
  { r:3, c:1, b:3 },                                         { r:3, c:4, b:10 },
  { r:4, c:1, b:2 }, { r:4, c:2, b:1 }, { r:4, c:3, b:0 }, { r:4, c:4, b:11 },
]

const MAIN_STARS = ['紫微','天机','太阳','武曲','天同','廉贞','天府','太阴','贪狼','巨门','天相','天梁','七杀','破军']
const STAR_COLORS = {
  '紫微':'#d090e0','天机':'#70c870','太阳':'#f0c040','武曲':'#8080e0','天同':'#60d0a0',
  '廉贞':'#e06060','天府':'#d09040','太阴':'#90c0e0','贪狼':'#e09040','巨门':'#9090c0',
  '天相':'#60c0c0','天梁':'#a0d060','七杀':'#e05050','破军':'#b050b0',
}

function getZiWeiData(year, month, day) {
  const mingGongIdx = (2 + (month - 1)) % 12
  const seed = ((year * 366 + month * 31 + day) >>> 0)
  const starPlacement = {}
  MAIN_STARS.forEach((star, i) => {
    const idx = (seed * (i * 7 + 11) + i * 13) % 12
    if (!starPlacement[idx]) starPlacement[idx] = []
    starPlacement[idx].push(star)
  })
  return { mingGongIdx, starPlacement }
}

// ── NatalChart SVG ────────────────────────────────────────────────────────────

function NatalChart({ year, month, day, isToday }) {
  const yr = parseInt(year)  || new Date().getFullYear()
  const mo = parseInt(month) || (new Date().getMonth() + 1)
  const dy = parseInt(day)   || new Date().getDate()

  const S = 320, cx = 160, cy = 160
  const signOuter = 155, signInner = 130, planetR = 104, labelR = 88, coreR = 44

  const degs    = getPlanetDegrees(yr, mo, dy)
  const aspects = getAspects(degs)

  const toXY = (deg, R) => {
    const a = (deg - 90) * Math.PI / 180
    return [cx + R * Math.cos(a), cy + R * Math.sin(a)]
  }

  const SIGN_BG = { '火':'#180a0a', '土':'#0a1508', '风':'#14110a', '水':'#080c18' }

  return (
    <div style={{ margin: '0 auto', maxWidth: 320 }}>
      <svg width="100%" viewBox={`0 0 ${S} ${S}`}
        style={{ display: 'block', filter: 'drop-shadow(0 8px 32px rgba(0,0,0,0.55))' }}>
        <circle cx={cx} cy={cy} r={signOuter + 1} fill="#0a1510" />

        {ZODIAC_SIGNS.map((sign, i) => {
          const [x1, y1] = toXY(i * 30, signOuter)
          const [x2, y2] = toXY((i + 1) * 30, signOuter)
          const [x3, y3] = toXY((i + 1) * 30, signInner)
          const [x4, y4] = toXY(i * 30, signInner)
          const [lx, ly] = toXY(i * 30 + 15, (signOuter + signInner) / 2)
          return (
            <g key={sign.id}>
              <path
                d={`M ${x1} ${y1} A ${signOuter} ${signOuter} 0 0 1 ${x2} ${y2} L ${x3} ${y3} A ${signInner} ${signInner} 0 0 0 ${x4} ${y4} Z`}
                fill={SIGN_BG[sign.element] || '#0d160d'} stroke="#1e3828" strokeWidth="0.6" />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fontSize="9.5" fill="#5a8868" fontFamily="serif">
                {SIGN_SHORT[i]}
              </text>
            </g>
          )
        })}

        <circle cx={cx} cy={cy} r={signInner} fill="#0d1a12" />

        {Array.from({ length: 12 }, (_, i) => {
          const [x1, y1] = toXY(i * 30, coreR)
          const [x2, y2] = toXY(i * 30, signInner)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#152815" strokeWidth="0.5" />
        })}

        {aspects.map((asp, i) => {
          const [x1, y1] = toXY(degs[asp.p1], planetR)
          const [x2, y2] = toXY(degs[asp.p2], planetR)
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={asp.color} strokeWidth="0.75" opacity={asp.op} />
        })}

        {PLANETS.map(p => {
          const [px, py] = toXY(degs[p], planetR)
          const [lx, ly] = toXY(degs[p], labelR)
          const col = PLANET_COLORS[p]
          return (
            <g key={p}>
              <circle cx={px} cy={py} r={4.5} fill={col} opacity={0.9} />
              <text x={lx} y={ly} textAnchor="middle" dominantBaseline="middle"
                fontSize="7.5" fill={col} fontWeight="bold">
                {PLANET_CN[p]}
              </text>
            </g>
          )
        })}

        <circle cx={cx} cy={cy} r={coreR} fill="#08120a" stroke="#1e3828" strokeWidth="1" />
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="8.5" fill="#5a9870"
          fontFamily="Playfair Display, serif">
          {isToday ? '天象' : '本命'}
        </text>
        <text x={cx} y={cy + 7} textAnchor="middle" fontSize="7" fill="#3a5840">
          {yr}.{String(mo).padStart(2, '0')}.{String(dy).padStart(2, '0')}
        </text>
      </svg>

      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 10, flexWrap: 'wrap' }}>
        {ASPECT_DEFS.map(a => (
          <div key={a.key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 14, height: 2, background: a.color, borderRadius: 1, opacity: 0.85 }} />
            <span style={{ fontSize: 9, color: '#8a7a5e' }}>{a.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Planet Table ─────────────────────────────────────────────────────────────

function PlanetTable({ year, month, day }) {
  const yr = parseInt(year)  || new Date().getFullYear()
  const mo = parseInt(month) || 6
  const dy = parseInt(day)   || 15
  const degs = getPlanetDegrees(yr, mo, dy)
  return (
    <div className="card-soft" style={{ padding: 16, marginBottom: 14 }}>
      <p className="section-sub" style={{ marginBottom: 12 }}>行星位置</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        {PLANETS.map(p => {
          const signIdx = Math.floor((degs[p] % 360) / 30)
          const sign = ZODIAC_SIGNS[signIdx]
          const deg = Math.floor(degs[p] % 30)
          return (
            <div key={p} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 10px', background: '#fdf9f0', borderRadius: 8,
            }}>
              <span style={{ fontSize: 14, color: PLANET_COLORS[p], minWidth: 18, textAlign: 'center' }}>
                {PLANET_SYM[p]}
              </span>
              <span style={{ fontSize: 11, color: '#5a4a3a', minWidth: 16 }}>{PLANET_CN[p]}</span>
              <span style={{ fontSize: 11, color: ELCOL[sign?.element], fontWeight: 500 }}>
                {sign?.name}
              </span>
              <span style={{ fontSize: 9, color: '#8a7a5e', marginLeft: 'auto' }}>{deg}°</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Three Pillars Banner ─────────────────────────────────────────────────────

function ThreePillars({ sunSign, moonSign, risingSign }) {
  const pillars = [
    { label: '☉ 太阳', sign: sunSign, tagKey: 'sunTag', planet: '本我·核心自我' },
    { label: '☽ 月亮', sign: moonSign, tagKey: 'moonTag', planet: '情感·潜意识' },
    { label: 'Asc 上升', sign: risingSign, tagKey: 'risingTag', planet: '外表·给人印象' },
  ].filter(p => p.sign)

  return (
    <div className="card-soft" style={{ padding: 20, marginBottom: 14, background: 'linear-gradient(135deg, #ffffff, #fefcf6)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <p className="section-sub">THREE PILLARS · 三巨头</p>
        <button
          onClick={() => {
            tap()
            const text = `我的星盘三巨头\n${pillars.map(p => `${p.label}：${p.sign.name} · ${p.sign[p.tagKey]}`).join('\n')}\n\n#月相塔罗 #Lunaria`
            if (navigator.share) navigator.share({ title: '我的星盘三巨头', text }).catch(() => {})
            else navigator.clipboard?.writeText(text)
          }}
          style={{
            background: 'rgba(196,146,74,0.1)', border: '1px solid rgba(196,146,74,0.25)',
            borderRadius: 8, padding: '4px 10px', cursor: 'pointer', fontSize: 12, color: '#c4924a',
          }}
        >分享↑</button>
      </div>
      <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 10, lineHeight: 1.5 }}>
        {pillars.map(p => `${p.label.split(' ')[0]}${p.sign.name}`).join(' · ')}
      </p>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {pillars.map((p, i) => (
          <span key={i} style={{
            padding: '3px 10px', borderRadius: 999, fontSize: 11,
            background: `${ELCOL[p.sign.element]}15`, color: ELCOL[p.sign.element], fontWeight: 500,
          }}>{p.sign[p.tagKey]}</span>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${pillars.length}, 1fr)`, gap: 8 }}>
        {pillars.map((p, i) => {
          const color = ELCOL[p.sign.element]
          return (
            <div key={i} style={{
              padding: '12px 8px', borderRadius: 14, textAlign: 'center',
              background: `${color}10`, border: `1px solid ${color}25`,
            }}>
              <div style={{ fontSize: 24, marginBottom: 4, color }}>{p.sign.symbol}</div>
              <p style={{ fontSize: 9, color: '#8a7a5e', letterSpacing: '0.1em', marginBottom: 2 }}>{p.label}</p>
              <p style={{ fontSize: 12, color: '#2d2618', fontWeight: 600 }}>{p.sign.name}</p>
              <p style={{ fontSize: 9, color: '#8a7a5e', marginTop: 2 }}>{p.planet}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Fortune Chart ─────────────────────────────────────────────────────────────

function FortuneChart({ sunSign, moonSign, risingSign }) {
  const areas = [
    { key: 'love', label: '爱情运', icon: '♡', color: '#c44a5e' },
    { key: 'career', label: '事业运', icon: '★', color: '#2d4a3e' },
    { key: 'wealth', label: '财富运', icon: '◈', color: '#c4924a' },
    { key: 'social', label: '人际运', icon: '◎', color: '#3e6c8c' },
  ]
  function getScore(key) {
    const signs = [sunSign, moonSign, risingSign].filter(Boolean)
    const weights = [2, 1, 1]
    let total = 0, wSum = 0
    signs.forEach((s, i) => { total += s.fortuneScores[key] * weights[i]; wSum += weights[i] })
    return Math.round(total / wSum)
  }
  return (
    <div className="card-soft" style={{ padding: 18, marginBottom: 14 }}>
      <p className="section-sub" style={{ marginBottom: 14 }}>FORTUNE ANALYSIS · 运势分析</p>
      {areas.map(area => {
        const score = getScore(area.key)
        return (
          <div key={area.key} style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
              <span style={{ fontSize: 12, color: '#5a4a3a' }}>{area.icon} {area.label}</span>
              <span style={{ fontSize: 13, color: area.color, fontWeight: 700 }}>{score}</span>
            </div>
            <div style={{ height: 7, background: '#f0e8d6', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${area.color}80, ${area.color})`, borderRadius: 4 }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Sign Detail ──────────────────────────────────────────────────────────────

function SignDetailPanel({ sign }) {
  const color = ELCOL[sign.element]
  return (
    <div className="animate-fade-up">
      <div className="card-soft" style={{ padding: 18, marginBottom: 12, background: `linear-gradient(135deg, ${color}08, #fefcf6)`, borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', gap: 14, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, color: '#fdf9f0', boxShadow: `0 6px 16px ${color}40`, flexShrink: 0 }}>{sign.symbol}</div>
          <div>
            <h3 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 2 }}>{sign.name}</h3>
            <p style={{ fontSize: 11, color: '#8a7a5e', fontStyle: 'italic' }}>{sign.en}</p>
            <p style={{ fontSize: 11, color: '#5a4a3a', marginTop: 2 }}>{sign.dates}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[{ l: '元素', v: sign.element }, { l: '主星', v: sign.ruler }, { l: '类型', v: sign.quality }].map(item => (
            <div key={item.l} style={{ flex: 1, textAlign: 'center', padding: 8, background: 'rgba(255,255,255,0.7)', borderRadius: 10 }}>
              <p style={{ fontSize: 9, color: '#8a7a5e', marginBottom: 3 }}>{item.l}</p>
              <p style={{ fontSize: 12, color, fontWeight: 600 }}>{item.v}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="card-soft" style={{ padding: 14, marginBottom: 12 }}>
        <p className="section-sub" style={{ marginBottom: 8 }}>性格特质</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {sign.traits.map(t => <span key={t} className="pill" style={{ background: `${color}12`, color }}>{t}</span>)}
        </div>
      </div>
      <div className="card-soft" style={{ padding: 16, marginBottom: 12 }}>
        <p className="section-sub" style={{ marginBottom: 8 }}>星座解析</p>
        <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.9 }}>{sign.description}</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
        <div className="card-soft" style={{ padding: 14 }}>
          <p style={{ fontSize: 12, color: '#c4924a', marginBottom: 5, fontWeight: 600 }}>♡ 爱情运势</p>
          <p style={{ fontSize: 11, color: '#5a4a3a', lineHeight: 1.7 }}>{sign.love}</p>
        </div>
        <div className="card-soft" style={{ padding: 14 }}>
          <p style={{ fontSize: 12, color: '#2d4a3e', marginBottom: 5, fontWeight: 600 }}>★ 事业发展</p>
          <p style={{ fontSize: 11, color: '#5a4a3a', lineHeight: 1.7 }}>{sign.career}</p>
        </div>
      </div>
      <div className="card-soft" style={{ padding: 14, marginBottom: 12 }}>
        <p className="section-sub" style={{ marginBottom: 10 }}>幸运元素</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {[{ l: '数字', v: sign.lucky.number }, { l: '颜色', v: sign.lucky.color }, { l: '宝石', v: sign.lucky.stone }, { l: '幸运日', v: sign.lucky.day }].map(item => (
            <div key={item.l} style={{ textAlign: 'center', background: '#fdf9f0', padding: '10px 4px', borderRadius: 10 }}>
              <p className="serif" style={{ fontSize: 14, color: '#c4924a', marginBottom: 2 }}>{item.v}</p>
              <p style={{ fontSize: 9, color: '#8a7a5e' }}>{item.l}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Today fortune data ────────────────────────────────────────────────────────

const MOON_PHASES = [
  { icon: '🌑', name: '新月', hint: '播种新的意图' },
  { icon: '🌒', name: '峨眉月', hint: '酝酿你的计划' },
  { icon: '🌓', name: '上弦月', hint: '采取行动的时机' },
  { icon: '🌔', name: '盈凸月', hint: '调整方向持续前行' },
  { icon: '🌕', name: '满月', hint: '感恩与释放旧有' },
  { icon: '🌖', name: '亏凸月', hint: '感激所获开始放下' },
  { icon: '🌗', name: '下弦月', hint: '清理释放留出空间' },
  { icon: '🌘', name: '残月', hint: '休息反思与内观' },
]

const SIGN_DAILY_MSGS = {
  aries: ['今日能量充沛，主动出击，把握转瞬即逝的机遇。', '行动是今天的主题，停止犹豫，迈出你早已准备好的那一步。'],
  taurus: ['今日宜稳不宜动，专注在你真正在意的事物上深耕。', '感官享受能为你补充能量，与美好的事物多待一会儿。'],
  gemini: ['今日思维活跃，记录下所有灵感，哪怕看起来不着边际。', '与人交流会打开意想不到的窗口，多听多问。'],
  cancer: ['情感雷达格外灵敏，听从内心，而非他人的期待。', '家与亲密关系是今日的能量来源，好好滋养它。'],
  leo: ['你的光芒需要被看见，不必刻意低调，真诚闪耀即可。', '创造力达到高峰，把心中的想法付诸表达。'],
  virgo: ['细节决定今日成败，你的分析眼光比任何时候都精准。', '整理混乱会让你的内心平静，从一个小角落开始。'],
  libra: ['和谐是今日关键词，修复一段重要的关系，时机正好。', '你的美感与判断力今日特别出色，信任你的品味。'],
  scorpio: ['深层的真相正在浮现，保持敏锐，你会看见别人忽视的。', '今日适合深度工作，设定界限，保护你的专注力。'],
  sagittarius: ['远方在召唤，哪怕只是一次短暂的出走，也能刷新视野。', '说出你内心的真实想法，诚实是今日最大的力量。'],
  capricorn: ['稳步推进一个长期目标，每一小步都在累积深厚的根基。', '你的自律今日会带来实实在在的成果，坚持即奖励。'],
  aquarius: ['跳出固有框架，用不寻常的视角解决熟悉的问题。', '与志同道合的人连接，你的想法值得被更多人听见。'],
  pisces: ['直觉是今日最可靠的指南针，先感受，再思考。', '艺术或自然能帮你恢复能量，给自己留一段独处时光。'],
}

// ── Tab: 天象（FortuneTab）────────────────────────────────────────────────────

function FortuneTab({ sunSign, moonSign, risingSign, premium, onUpgrade }) {
  const [aiGuide, setAiGuide] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  async function handleAIGuide() {
    if (!premium) { onUpgrade?.(); return }
    setAiLoading(true)
    try {
      const today = new Date()
      const scores = { love: dailyScore(sunSign.id,'love',today), career: dailyScore(sunSign.id,'career',today), wealth: dailyScore(sunSign.id,'wealth',today), social: dailyScore(sunSign.id,'social',today) }
      const result = await getAIReading(buildAstrologyPrompt({ sunSign: sunSign.name, moonSign: moonSign?.name, risingSign: risingSign?.name, scores }))
      setAiGuide(result)
    } catch { setAiGuide('✦ 星光稍有遮蔽，请稍后再试') }
    setAiLoading(false)
  }

  if (!sunSign) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>✦</p>
        <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 8 }}>请先输入生日</p>
        <p style={{ fontSize: 12, color: '#8a7a5e' }}>解析你的太阳星座后，即可查看今日运势</p>
      </div>
    )
  }

  const today = new Date()
  const phase = MOON_PHASES[Math.floor((today.getDate() % 30) / 4)]
  const msgs = SIGN_DAILY_MSGS[sunSign.id] || []
  const dailyMsg = msgs[today.getDay() % msgs.length] || ''
  const color = ELCOL[sunSign.element]
  const dateLabel = today.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' })
  const scoreAreas = [
    { key: 'love', label: '爱情', icon: '♡', color: '#c44a5e' },
    { key: 'career', label: '事业', icon: '★', color: '#2d4a3e' },
    { key: 'wealth', label: '财富', icon: '◈', color: '#c4924a' },
    { key: 'social', label: '人际', icon: '◎', color: '#3e6c8c' },
  ]

  return (
    <div>
      <div className="card-soft" style={{ padding: 16, marginBottom: 14, background: `linear-gradient(135deg, ${color}10, #ffffff)`, borderLeft: `4px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: color, color: '#fdf9f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{sunSign.symbol}</div>
          <div>
            <p className="section-sub" style={{ marginBottom: 2 }}>今日天象</p>
            <p className="serif" style={{ fontSize: 15, color: '#2d2618' }}>{sunSign.name} · {dateLabel}</p>
          </div>
        </div>
        {dailyMsg && <p style={{ fontSize: 12, color: '#3d3327', lineHeight: 1.8, marginTop: 12, fontStyle: 'italic' }}>"{dailyMsg}"</p>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        {scoreAreas.map(area => {
          const score = dailyScore(sunSign.id, area.key, today)
          const level = score >= 85 ? '大吉' : score >= 70 ? '吉' : score >= 60 ? '平' : '需注意'
          return (
            <div key={area.key} className="card-soft" style={{ padding: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: '#5a4a3a' }}>{area.icon} {area.label}运</span>
                <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 999, background: `${area.color}15`, color: area.color }}>{level}</span>
              </div>
              <p style={{ fontSize: 30, fontWeight: 700, color: area.color, marginBottom: 4 }}>{score}</p>
              <div style={{ height: 4, background: '#f0e8d6', borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${score}%`, background: area.color, borderRadius: 2 }} />
              </div>
            </div>
          )
        })}
      </div>

      <div className="card-tinted" style={{ padding: 16, marginBottom: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
        <span style={{ fontSize: 36, flexShrink: 0 }}>{phase.icon}</span>
        <div>
          <p className="section-sub" style={{ marginBottom: 2 }}>CURRENT MOON</p>
          <p className="serif" style={{ fontSize: 15, color: '#2d2618', marginBottom: 2 }}>{phase.name}</p>
          <p style={{ fontSize: 11, color: '#8a7a5e' }}>{phase.hint}</p>
        </div>
      </div>

      <div className="card-soft" style={{ padding: 16, marginBottom: 14 }}>
        <p className="section-sub" style={{ marginBottom: 10 }}>本周能量走势</p>
        <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 56 }}>
          {['一','二','三','四','五','六','日'].map((d, i) => {
            const dayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + i + 1)
            const s = dailyScore(sunSign.id, 'career', dayDate)
            const isToday = i === (today.getDay() + 6) % 7
            return (
              <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ width: '100%', height: `${(s - 50) * 1.1}px`, background: isToday ? color : `${color}40`, borderRadius: 3, minHeight: 4 }} />
                <span style={{ fontSize: 9, color: isToday ? color : '#8a7a5e', fontWeight: isToday ? 700 : 400 }}>周{d}</span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card-soft" style={{ padding: 16, background: premium ? 'linear-gradient(135deg, rgba(196,146,74,0.08), #ffffff)' : '#fefcf6', borderLeft: '3px solid #c9973a' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 12, color: '#c4924a', fontWeight: 600 }}>✨ AI 今日星盘指引</p>
          {!aiGuide && (
            <button onClick={handleAIGuide} disabled={aiLoading} style={{ background: premium ? 'linear-gradient(135deg, #c9973a, #e8c06a)' : 'rgba(196,146,74,0.15)', border: 'none', borderRadius: 999, padding: '5px 12px', color: premium ? '#fff' : '#c4924a', fontSize: 11, cursor: 'pointer', opacity: aiLoading ? 0.6 : 1 }}>
              {aiLoading ? '解读中…' : premium ? '生成指引' : '🔒 会员'}
            </button>
          )}
        </div>
        {aiLoading && <p style={{ fontSize: 12, color: '#c4924a', animation: 'pulse-soft 1.5s ease-in-out infinite' }}>✦ 星光汇聚中…</p>}
        {aiGuide
          ? <p className="animate-fade-up" style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.9 }}>{aiGuide}</p>
          : <p style={{ fontSize: 12, color: '#8a7a5e' }}>{premium ? '点击右侧按钮，获取今日个性化星盘指引' : '升级会员，解锁 AI 深度星盘解读'}</p>
        }
      </div>
    </div>
  )
}

// ── Tab: 生辰（BaZi）─────────────────────────────────────────────────────────

function PillarCell({ stemIdx, branchIdx, label, isDay }) {
  const stemEl = STEM_ELEMENTS[stemIdx]
  const branchEl = BRANCH_ELEMENTS[branchIdx]
  const sStemCol = ELEMENT_COLORS[stemEl] || '#5a4a3a'
  const sBranchCol = ELEMENT_COLORS[branchEl] || '#5a4a3a'
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <p style={{ fontSize: 9, color: isDay ? '#c4924a' : '#8a7a5e', marginBottom: 6, fontWeight: isDay ? 700 : 400 }}>{label}</p>
      <div style={{ padding: '10px 4px', background: `${sStemCol}12`, borderRadius: '10px 10px 0 0', borderBottom: '1px solid rgba(196,146,74,0.1)' }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: sStemCol, lineHeight: 1 }}>{STEMS[stemIdx]}</p>
        <p style={{ fontSize: 9, color: sStemCol, marginTop: 2 }}>{stemEl}</p>
      </div>
      <div style={{ padding: '10px 4px', background: `${sBranchCol}08`, borderRadius: '0 0 10px 10px' }}>
        <p style={{ fontSize: 26, fontWeight: 700, color: sBranchCol, lineHeight: 1 }}>{BRANCHES[branchIdx]}</p>
        <p style={{ fontSize: 9, color: sBranchCol, marginTop: 2 }}>{branchEl}</p>
      </div>
    </div>
  )
}

function ElementBalanceBar({ counts }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1
  const elements = ['木', '火', '土', '金', '水']
  return (
    <div className="card-soft" style={{ padding: 16, marginBottom: 14 }}>
      <p className="section-sub" style={{ marginBottom: 12 }}>五行分布</p>
      <div style={{ display: 'flex', gap: 6, height: 50, alignItems: 'flex-end', marginBottom: 8 }}>
        {elements.map(el => (
          <div key={el} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ width: '100%', height: `${Math.max(4, (counts[el] || 0) / total * 100 * 0.9)}px`, background: ELEMENT_COLORS[el], borderRadius: 3 }} />
            <span style={{ fontSize: 10, color: ELEMENT_COLORS[el], fontWeight: 600 }}>{el}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
        {elements.map(el => (
          <span key={el} style={{ padding: '2px 10px', borderRadius: 999, fontSize: 10, background: `${ELEMENT_COLORS[el]}15`, color: ELEMENT_COLORS[el] }}>{el} × {counts[el] || 0}</span>
        ))}
      </div>
    </div>
  )
}

function BaziTab({ year, month, day, hour }) {
  const hasYear = year && parseInt(year) > 1900 && parseInt(year) < 2100
  const hasHour = hour !== '' && hour !== undefined

  if (!month || !day) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>☯</p>
        <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 8 }}>请先输入生日</p>
        <p style={{ fontSize: 12, color: '#8a7a5e' }}>需要完整的出生日期才能排盘</p>
      </div>
    )
  }

  if (!hasYear || !hasHour) {
    return (
      <div>
        <div className="card-tinted" style={{ padding: 20, marginBottom: 16, textAlign: 'center' }}>
          <p style={{ fontSize: 32, marginBottom: 10 }}>☯</p>
          <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 6 }}>八字速览需要完整时间</p>
          <p style={{ fontSize: 12, color: '#8a7a5e', lineHeight: 1.8 }}>
            请在上方输入框补充填写<br />
            {!hasYear && '📅 出生年份  '}{!hasHour && '🕐 出生时辰（0–23时）'}
          </p>
        </div>
        <div className="card-soft" style={{ padding: 16 }}>
          <p className="section-sub" style={{ marginBottom: 8 }}>什么是八字？</p>
          <p style={{ fontSize: 12, color: '#5a4a3a', lineHeight: 1.8 }}>
            八字（四柱）是中国传统命理学的核心，通过出生的年、月、日、时推算出八个天干地支字符，揭示一个人的先天性格、人生走势与运气格局。每个字对应一个五行元素，共同构成你独一无二的命理图谱。
          </p>
        </div>
      </div>
    )
  }

  const yr = parseInt(year), mo = parseInt(month), dy = parseInt(day), hr = parseInt(hour)
  const bazi = getBazi(yr, mo, dy, hr)
  const dayMaster = DAY_MASTER_DESC[bazi.day.stemIdx]
  const balance = getElementBalance([bazi.year, bazi.month, bazi.day, bazi.hour])
  const daYun = getDaYun(bazi.month, true)
  const dmColor = ELEMENT_COLORS[dayMaster.element]

  return (
    <div className="animate-fade-up">
      <div className="card-soft" style={{ padding: 16, marginBottom: 14 }}>
        <p className="section-sub" style={{ marginBottom: 12 }}>四柱八字</p>
        <div style={{ display: 'flex', gap: 6 }}>
          <PillarCell stemIdx={bazi.year.stemIdx}  branchIdx={bazi.year.branchIdx}  label="年柱" />
          <PillarCell stemIdx={bazi.month.stemIdx} branchIdx={bazi.month.branchIdx} label="月柱" />
          <PillarCell stemIdx={bazi.day.stemIdx}   branchIdx={bazi.day.branchIdx}   label="日柱 ★" isDay />
          <PillarCell stemIdx={bazi.hour.stemIdx}  branchIdx={bazi.hour.branchIdx}  label="时柱" />
        </div>
        <p style={{ fontSize: 9, color: '#8a7a5e', marginTop: 10, textAlign: 'center' }}>★ 日柱天干为你的日主命格</p>
      </div>
      <div className="card-soft" style={{ padding: 18, marginBottom: 14, background: `linear-gradient(135deg, ${dmColor}08, #ffffff)`, borderLeft: `4px solid ${dmColor}` }}>
        <p className="section-sub" style={{ marginBottom: 8 }}>日主分析</p>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: 14, background: dmColor, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, color: '#fdf9f0', boxShadow: `0 6px 16px ${dmColor}40` }}>{STEMS[bazi.day.stemIdx]}</div>
          <div>
            <p className="serif" style={{ fontSize: 17, color: '#2d2618', marginBottom: 4 }}>{dayMaster.label}</p>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {dayMaster.traits.map(t => <span key={t} style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10, background: `${dmColor}15`, color: dmColor }}>{t}</span>)}
            </div>
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#3d3327', lineHeight: 1.8 }}>{dayMaster.desc}</p>
      </div>
      <ElementBalanceBar counts={balance} />
      <div className="card-soft" style={{ padding: 16 }}>
        <p className="section-sub" style={{ marginBottom: 12 }}>大限（十年大运）</p>
        <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 4 }}>
          {daYun.map((period, i) => {
            const sCol = ELEMENT_COLORS[STEM_ELEMENTS[period.stemIdx]]
            const bCol = ELEMENT_COLORS[BRANCH_ELEMENTS[period.branchIdx]]
            return (
              <div key={i} style={{ minWidth: 46, textAlign: 'center', padding: '8px 2px', borderRight: i < daYun.length - 1 ? '1px solid rgba(196,146,74,0.1)' : 'none' }}>
                <p style={{ fontSize: 9, color: '#8a7a5e', marginBottom: 4 }}>{period.startAge}岁</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: sCol, lineHeight: 1 }}>{STEMS[period.stemIdx]}</p>
                <p style={{ fontSize: 20, fontWeight: 700, color: bCol, lineHeight: 1 }}>{BRANCHES[period.branchIdx]}</p>
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: 9, color: '#8a7a5e', marginTop: 8, textAlign: 'center' }}>大限为参考示意，精确起限需专业排盘</p>
      </div>
    </div>
  )
}

// ── Tab: 紫微 ────────────────────────────────────────────────────────────────

function ZiWeiTab({ year, month, day }) {
  const hasData = month && day && year && parseInt(year) > 1900

  if (!hasData) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>✦</p>
        <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 8 }}>需要完整出生日期</p>
        <p style={{ fontSize: 12, color: '#8a7a5e', lineHeight: 1.8 }}>请填写出生年月日，即可生成紫微命盘</p>
      </div>
    )
  }

  const yr = parseInt(year), mo = parseInt(month), dy = parseInt(day)
  const { mingGongIdx, starPlacement } = getZiWeiData(yr, mo, dy)

  function getPalaceName(branchIdx) {
    return PALACE_NAMES[(branchIdx - mingGongIdx + 12) % 12]
  }

  function PalaceCell({ b, gridRow, gridColumn, ageStart }) {
    const isMinGong = b === mingGongIdx
    const palaceName = getPalaceName(b)
    const stars = starPlacement[b] || []
    return (
      <div style={{
        gridRow, gridColumn,
        background: isMinGong ? '#1a1808' : '#0e1420',
        border: `1px solid ${isMinGong ? '#3a3010' : '#1a2830'}`,
        padding: '6px 5px',
        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
      }}>
        <div>
          {stars.slice(0, 3).map(s => (
            <div key={s} style={{ fontSize: 8, color: STAR_COLORS[s], lineHeight: 1.5, fontWeight: 500 }}>{s}</div>
          ))}
        </div>
        <div>
          <div style={{ fontSize: 7, color: '#3a5040', marginBottom: 1 }}>{ageStart}–{ageStart + 9}岁</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <span style={{ fontSize: 8.5, color: '#4a7060' }}>{ZW_BRANCHES[b]}</span>
            <span style={{ fontSize: 8.5, color: isMinGong ? '#e8c060' : '#8aaa80', fontWeight: isMinGong ? 700 : 400 }}>
              {palaceName}
            </span>
          </div>
        </div>
      </div>
    )
  }

  const ageMap = [5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115]

  return (
    <div className="animate-fade-up">
      <p style={{ fontSize: 10, color: '#c4924a', letterSpacing: '0.2em', fontWeight: 600, marginBottom: 8 }}>
        ✦ 紫微斗数 · 本命盘
      </p>
      <p style={{ fontSize: 11, color: '#8a7a5e', lineHeight: 1.7, marginBottom: 14 }}>
        十二宫位 · 主星分布 · 简化示意
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'repeat(4, 72px)',
        gap: 2,
        background: '#060c0a',
        borderRadius: 10,
        overflow: 'hidden',
        border: '1px solid #182820',
        marginBottom: 16,
      }}>
        {ZW_GRID.map((pos, i) => (
          <PalaceCell key={pos.b} b={pos.b} gridRow={pos.r} gridColumn={pos.c} ageStart={ageMap[i] || 5} />
        ))}
        <div style={{
          gridRow: '2 / span 2', gridColumn: '2 / span 2',
          background: '#080e18',
          border: '1px solid #182830',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          gap: 6, padding: 10,
        }}>
          <p style={{ fontSize: 9.5, color: '#6a9878', fontWeight: 600 }}>本命盘</p>
          <p style={{ fontSize: 8, color: '#4a7060' }}>{yr}年{mo}月{dy}日</p>
          <p style={{ fontSize: 8, color: '#3a5840' }}>命宫 · {ZW_BRANCHES[mingGongIdx]}</p>
          <p style={{ fontSize: 7.5, color: '#2a4030', textAlign: 'center', lineHeight: 1.6 }}>
            {PALACE_NAMES[0]}在{ZW_BRANCHES[mingGongIdx]}
          </p>
        </div>
      </div>

      <div className="card-soft" style={{ padding: 14 }}>
        <p className="section-sub" style={{ marginBottom: 8 }}>紫微主星</p>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MAIN_STARS.map(s => (
            <span key={s} style={{
              fontSize: 10, color: STAR_COLORS[s], padding: '2px 8px', borderRadius: 999,
              background: 'rgba(255,255,255,0.04)', border: `1px solid ${STAR_COLORS[s]}30`,
            }}>{s}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Tab: 配对（Compat）───────────────────────────────────────────────────────

const COMPAT_SCORES = {
  aries:       { taurus:60, gemini:85, cancer:55, leo:92, virgo:62, libra:78, scorpio:70, sagittarius:90, capricorn:58, aquarius:80, pisces:65, aries:75 },
  taurus:      { aries:60, gemini:65, cancer:90, leo:72, virgo:95, libra:68, scorpio:75, sagittarius:58, capricorn:92, aquarius:62, pisces:82, taurus:70 },
  gemini:      { aries:85, taurus:65, cancer:68, leo:80, virgo:70, libra:92, scorpio:60, sagittarius:85, capricorn:65, aquarius:90, pisces:72, gemini:75 },
  cancer:      { aries:55, taurus:90, gemini:68, leo:72, virgo:78, libra:65, scorpio:90, sagittarius:62, capricorn:75, aquarius:60, pisces:92, cancer:70 },
  leo:         { aries:92, taurus:72, gemini:80, cancer:72, virgo:68, libra:85, scorpio:75, sagittarius:90, capricorn:65, aquarius:72, pisces:68, leo:75 },
  virgo:       { aries:62, taurus:95, gemini:70, cancer:78, leo:68, libra:75, scorpio:82, sagittarius:60, capricorn:90, aquarius:68, pisces:70, virgo:72 },
  libra:       { aries:78, taurus:68, gemini:92, cancer:65, leo:85, virgo:75, scorpio:72, sagittarius:82, capricorn:70, aquarius:88, pisces:75, libra:78 },
  scorpio:     { aries:70, taurus:75, gemini:60, cancer:90, leo:75, virgo:82, libra:72, sagittarius:65, capricorn:80, aquarius:65, pisces:92, scorpio:75 },
  sagittarius: { aries:90, taurus:58, gemini:85, cancer:62, leo:90, virgo:60, libra:82, scorpio:65, capricorn:72, aquarius:85, pisces:70, sagittarius:75 },
  capricorn:   { aries:58, taurus:92, gemini:65, cancer:75, leo:65, virgo:90, libra:70, scorpio:80, sagittarius:72, aquarius:70, pisces:78, capricorn:72 },
  aquarius:    { aries:80, taurus:62, gemini:90, cancer:60, leo:72, virgo:68, libra:88, scorpio:65, sagittarius:85, capricorn:70, pisces:72, aquarius:75 },
  pisces:      { aries:65, taurus:82, gemini:72, cancer:92, leo:68, virgo:70, libra:75, scorpio:92, sagittarius:70, capricorn:78, aquarius:72, pisces:78 },
}
const COMPAT_DIMS = ['love','comm','values','passion']
const COMPAT_DIM_LABELS = { love:'爱情', comm:'沟通', values:'价值观', passion:'激情' }
const COMPAT_DIM_COLORS = { love:'#c44a5e', comm:'#2d4a3e', values:'#c4924a', passion:'#7a3e6c' }
function getCompatDimScores(base) {
  return { love: Math.min(99, base + (base % 7) - 3), comm: Math.min(99, base - (base % 5) + 2), values: Math.min(99, base + (base % 11) - 5), passion: Math.min(99, base - (base % 13) + 4) }
}

function CompatTab({ sunSignId }) {
  const [partnerMonth, setPartnerMonth] = useState('')
  const [partnerDay, setPartnerDay] = useState('')
  const [result, setResult] = useState(null)
  const inputStyle = { width: '100%', padding: '12px 12px', background: '#fff', border: '1px solid rgba(196,146,74,0.25)', borderRadius: 12, color: '#2d2618', fontSize: 15 }

  function handleCheck() {
    tap()
    if (!partnerMonth || !partnerDay) return
    const partnerId = getZodiacByDate(partnerMonth, partnerDay)
    const mySign = SIGNS.find(s => s.id === sunSignId)
    const partnerSign = SIGNS.find(s => s.id === partnerId)
    const base = COMPAT_SCORES[sunSignId]?.[partnerId] || 72
    setResult({ mySign, partnerSign, base, dims: getCompatDimScores(base) })
  }

  if (!sunSignId) {
    return (
      <div style={{ textAlign: 'center', padding: '40px 20px' }}>
        <p style={{ fontSize: 36, marginBottom: 12 }}>💫</p>
        <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 8 }}>请先输入你的生日</p>
        <p style={{ fontSize: 12, color: '#8a7a5e' }}>在上方表单填写月份和日期，解析你的太阳星座</p>
      </div>
    )
  }

  const mySelf = SIGNS.find(s => s.id === sunSignId)
  return (
    <div className="animate-fade-up">
      <div className="card-soft" style={{ padding: 18, marginBottom: 14 }}>
        <p className="section-sub" style={{ marginBottom: 14 }}>COMPATIBILITY · 星座配对</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: `${ELCOL[mySelf?.element]}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>{mySelf?.symbol}</div>
          <div style={{ flex: 1, textAlign: 'center', fontSize: 20, color: '#c4924a' }}>♡</div>
          <div style={{ width: 52, height: 52, borderRadius: '50%', flexShrink: 0, background: '#f0e8d6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
            {result ? result.partnerSign?.symbol : '?'}
          </div>
        </div>
        <p style={{ fontSize: 12, color: '#5a4a3a', marginBottom: 12 }}>输入TA的生日</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
          <label><span style={{ fontSize: 10, color: '#8a7a5e', display: 'block', marginBottom: 5 }}>月份</span><input type="number" min="1" max="12" value={partnerMonth} onChange={e => setPartnerMonth(e.target.value)} placeholder="1–12" style={inputStyle} /></label>
          <label><span style={{ fontSize: 10, color: '#8a7a5e', display: 'block', marginBottom: 5 }}>日期</span><input type="number" min="1" max="31" value={partnerDay} onChange={e => setPartnerDay(e.target.value)} placeholder="1–31" style={inputStyle} /></label>
        </div>
        <button onClick={handleCheck} className="btn-primary" style={{ width: '100%', opacity: (partnerMonth && partnerDay) ? 1 : 0.45 }} disabled={!partnerMonth || !partnerDay}>♡ 测试缘分</button>
      </div>
      {result && (
        <div className="animate-fade-up">
          <div className="card-soft" style={{ padding: 20, marginBottom: 14, background: `linear-gradient(135deg, ${ELCOL[result.mySign?.element]}08, ${ELCOL[result.partnerSign?.element]}08)` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 32 }}>{result.mySign?.symbol}</div><p style={{ fontSize: 12, color: '#2d2618', fontWeight: 500 }}>{result.mySign?.name}</p></div>
              <div style={{ textAlign: 'center' }}>
                <div className="serif" style={{ fontSize: 36, color: '#c4924a', lineHeight: 1, marginBottom: 4 }}>{result.base}</div>
                <div style={{ fontSize: 9, background: result.base >= 85 ? '#c4924a' : result.base >= 70 ? '#2d4a3e' : '#8a7a5e', color: '#fff', padding: '2px 8px', borderRadius: 999 }}>
                  {result.base >= 85 ? '天作之合' : result.base >= 70 ? '相当契合' : result.base >= 55 ? '潜力匹配' : '需要磨合'}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}><div style={{ fontSize: 32 }}>{result.partnerSign?.symbol}</div><p style={{ fontSize: 12, color: '#2d2618', fontWeight: 500 }}>{result.partnerSign?.name}</p></div>
            </div>
            {COMPAT_DIMS.map(dim => {
              const score = result.dims[dim]
              const color = COMPAT_DIM_COLORS[dim]
              return (
                <div key={dim} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: '#5a4a3a' }}>{COMPAT_DIM_LABELS[dim]}</span>
                    <span style={{ fontSize: 12, color, fontWeight: 600 }}>{score}</span>
                  </div>
                  <div style={{ height: 6, background: '#f0e8d6', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${score}%`, background: `linear-gradient(90deg, ${color}80, ${color})`, borderRadius: 3, transition: 'width 0.8s ease-out' }} />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="card-soft" style={{ padding: 16, borderLeft: '3px solid #c4924a' }}>
            <p style={{ fontSize: 11, color: '#c4924a', marginBottom: 6, fontWeight: 600 }}>✦ 缘分解读</p>
            <p style={{ fontSize: 13, color: '#3d3327', lineHeight: 1.9 }}>
              {result.mySign?.name}与{result.partnerSign?.name}的组合综合匹配度{result.base}分。
              {result.base >= 85 ? `这对组合在能量频率上高度共鸣，${result.mySign?.element}与${result.partnerSign?.element}相互滋养，感情基础稳固。` :
               result.base >= 70 ? '两人性格互补，在沟通和价值观上有较多共鸣，需要彼此多一些理解和包容。' :
               '两人性格差异明显，但差异也是成长的机会。只要双方愿意努力，感情可以磨出独特的火花。'}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function Astrology() {
  const [tab, setTab] = useState('natal')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [year, setYear] = useState('')
  const [hour, setHour] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showPremium, setShowPremium] = useState(false)
  const [premium] = useState(isPremium)

  useEffect(() => {
    const birth = getUserBirth()
    if (birth) {
      if (birth.month) setMonth(String(birth.month))
      if (birth.day)   setDay(String(birth.day))
      if (birth.year)  setYear(String(birth.year))
      if (birth.hour !== null && birth.hour !== undefined) setHour(String(birth.hour))
      setSubmitted(true)
    }
  }, [])

  const sunSignId = submitted && month && day ? getZodiacByDate(month, day) : null
  const sunSign   = sunSignId ? SIGNS.find(s => s.id === sunSignId) : null

  const moonSignIdx = useMemo(() => {
    if (!submitted || !year || !month || !day) return null
    return getMoonSignIdx(parseInt(year), parseInt(month), parseInt(day))
  }, [submitted, year, month, day])
  const moonSign = moonSignIdx !== null ? SIGNS[moonSignIdx] : null

  const risingSignIdx = useMemo(() => {
    if (!submitted || !sunSignId || hour === '') return null
    return getRisingSignIdx(SIGN_ORDER.indexOf(sunSignId), hour)
  }, [submitted, sunSignId, hour])
  const risingSign = risingSignIdx !== null ? SIGNS[risingSignIdx] : null

  function handleSubmit(e) {
    e?.preventDefault()
    if (!month || !day) return
    setSubmitting(true)
    saveUserBirth({ month: parseInt(month), day: parseInt(day), year: year ? parseInt(year) : null, hour: hour !== '' ? parseInt(hour) : null })
    setTimeout(() => { setSubmitted(true); setSubmitting(false) }, 500)
  }

  const TABS = [
    { id: 'natal',   label: '本命盘' },
    { id: 'sky',     label: '天象' },
    { id: 'shichen', label: '生辰' },
    { id: 'ziwei',   label: '紫微' },
    { id: 'compat',  label: '配对' },
  ]

  const inputStyle = { width: '100%', padding: '10px 10px', background: '#fdf9f0', border: '1px solid rgba(196,146,74,0.25)', borderRadius: 10, color: '#2d2618', fontSize: 14 }

  return (
    <div className="animate-fade-in pb-nav" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{ paddingTop: 16, marginBottom: 20, textAlign: 'center' }}>
        <p className="section-sub">ASTROLOGY</p>
        <h1 className="serif" style={{ fontSize: 26, color: '#2d2618' }}>星座星盘</h1>
      </div>

      <div className="card-soft" style={{ padding: 18, marginBottom: 16 }}>
        <p style={{ fontSize: 12, color: '#5a4a3a', marginBottom: 12 }}>输入出生信息，解读你的星座命盘</p>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 12 }}>
            {[
              { key: 'month', label: '月份 *', val: month, setter: setMonth, min: 1,    max: 12,   ph: '月' },
              { key: 'day',   label: '日期 *', val: day,   setter: setDay,   min: 1,    max: 31,   ph: '日' },
              { key: 'year',  label: '年份',   val: year,  setter: setYear,  min: 1900, max: 2099, ph: '年' },
              { key: 'hour',  label: '时辰(时)',val: hour,  setter: setHour,  min: 0,    max: 23,   ph: '时' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 9, color: '#8a7a5e', display: 'block', marginBottom: 4 }}>{f.label}</label>
                <input type="number" min={f.min} max={f.max} inputMode="numeric"
                  value={f.val} onChange={e => f.setter(e.target.value)} placeholder={f.ph}
                  style={inputStyle} />
              </div>
            ))}
          </div>
          <button type="submit" className="btn-primary" disabled={submitting}
            style={{ width: '100%', padding: '11px 0', opacity: submitting ? 0.8 : 1, transition: 'opacity 0.2s ease' }}>
            {submitting
              ? <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>✦</span>解析中…
                </span>
              : '✦ 解析命盘'}
          </button>
        </form>
        {submitted && sunSign && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#8a7a5e' }}>☉ {sunSign.name}</span>
            {moonSign && <><span style={{ color: '#c4924a', fontSize: 10 }}>·</span><span style={{ fontSize: 11, color: '#8a7a5e' }}>☽ {moonSign.name}</span></>}
            {risingSign && <><span style={{ color: '#c4924a', fontSize: 10 }}>·</span><span style={{ fontSize: 11, color: '#8a7a5e' }}>Asc {risingSign.name}</span></>}
          </div>
        )}
      </div>

      <div style={{ background: '#fdf9f0', borderRadius: 999, padding: 4, display: 'flex', gap: 3, marginBottom: 20 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { tap(); setTab(t.id) }} style={{
            flex: 1, padding: '9px 2px', borderRadius: 999, border: 'none', cursor: 'pointer',
            background: tab === t.id ? '#2d4a3e' : 'transparent',
            color: tab === t.id ? '#fdf9f0' : '#5a4a3a',
            fontSize: 11, fontWeight: tab === t.id ? 600 : 400,
            transition: 'all 0.25s ease',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'natal' && (
        sunSign ? (
          <div className="animate-fade-up">
            <div style={{ marginBottom: 20 }}><NatalChart year={year} month={month} day={day} /></div>
            <ThreePillars sunSign={sunSign} moonSign={moonSign} risingSign={risingSign} />
            <PlanetTable year={year} month={month} day={day} />
            <FortuneChart sunSign={sunSign} moonSign={moonSign} risingSign={risingSign} />
            {sunSign && <SignDetailPanel sign={sunSign} />}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ marginBottom: 20 }}><NatalChart year={new Date().getFullYear()} month={new Date().getMonth()+1} day={new Date().getDate()} /></div>
            <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 8 }}>请先输入出生月日</p>
            <p style={{ fontSize: 12, color: '#8a7a5e' }}>填写上方月份和日期，解析你的本命盘</p>
          </div>
        )
      )}

      {tab === 'sky' && (
        <div className="animate-fade-up">
          <div style={{ marginBottom: 20 }}>
            <NatalChart year={new Date().getFullYear()} month={new Date().getMonth()+1} day={new Date().getDate()} isToday />
          </div>
          <FortuneTab sunSign={sunSign} moonSign={moonSign} risingSign={risingSign} premium={premium} onUpgrade={() => setShowPremium(true)} />
        </div>
      )}

      {tab === 'shichen' && <BaziTab year={year} month={month} day={day} hour={hour} />}
      {tab === 'ziwei'   && <ZiWeiTab year={year} month={month} day={day} />}
      {tab === 'compat'  && (
        <PremiumGate feature="星座配对分析 · 四维度匹配">
          <CompatTab sunSignId={sunSignId} />
        </PremiumGate>
      )}

      <div style={{ height: 60 }} />

      {showPremium && <PremiumSheet onClose={() => setShowPremium(false)} />}
    </div>
  )
}
