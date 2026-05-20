const NAV_ITEMS = [
  { id: 'home',      label: '每日', icon: HomeIcon },
  { id: 'tarot',     label: '占卜', icon: TarotIcon },
  { id: 'astrology', label: '星盘', icon: AstroIcon },
  { id: 'community', label: '社区', icon: PeopleIcon },
]

function HomeIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="4" fill={active ? '#2d4a3e' : 'none'} stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.5" />
      <circle cx="12" cy="12" r="9" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
    </svg>
  )
}
function TarotIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <rect x="6" y="3" width="10" height="16" rx="1.5" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.5" fill={active ? 'rgba(45,74,62,0.15)' : 'none'} transform="rotate(-8 11 11)" />
      <rect x="9" y="5" width="10" height="16" rx="1.5" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.5" fill={active ? 'rgba(45,74,62,0.25)' : 'none'} transform="rotate(8 14 13)" />
    </svg>
  )
}
function AstroIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.4" />
      <circle cx="12" cy="12" r="3" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.4" fill={active ? '#2d4a3e' : 'none'} />
      <line x1="3" y1="12" x2="21" y2="12" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1" opacity="0.5" />
      <line x1="12" y1="3" x2="12" y2="21" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1" opacity="0.5" />
    </svg>
  )
}
function PeopleIcon({ active }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="9" r="3" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.4" fill={active ? 'rgba(45,74,62,0.2)' : 'none'} />
      <circle cx="16" cy="10" r="2.5" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.4" fill={active ? 'rgba(45,74,62,0.2)' : 'none'} />
      <path d="M 3 19 Q 3 14, 9 14 Q 15 14, 15 19" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.4" fill="none" strokeLinecap="round" />
      <path d="M 14 18 Q 14 15, 16 15 Q 20 15, 20 19" stroke={active ? '#2d4a3e' : '#8a7a5e'} strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  )
}

import { useState } from 'react'
import { isPremium } from '../utils/premium'
import PremiumSheet from './PremiumSheet'

export default function Navigation({ current, onNavigate }) {
  const [showPremium, setShowPremium] = useState(false)
  const premium = isPremium()

  return (
    <>
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(253,249,240,0.92)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(196,146,74,0.18)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {!premium && (
        <button
          onClick={() => setShowPremium(true)}
          style={{
            position: 'absolute', top: -16, right: 12,
            background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
            border: 'none', borderRadius: 999,
            padding: '4px 12px', cursor: 'pointer',
            color: '#fff', fontSize: 11, fontWeight: 600,
            boxShadow: '0 2px 10px rgba(196,146,74,0.4)',
            display: 'flex', alignItems: 'center', gap: 4,
          }}
        >
          ✦ 升级会员
        </button>
      )}
      {premium && (
        <div style={{
          position: 'absolute', top: -14, right: 12,
          background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
          borderRadius: 999, padding: '3px 10px',
          color: '#fff', fontSize: 10, fontWeight: 600,
        }}>✦ 会员</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 4px 4px' }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.id
          const Icon = item.icon
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 0 6px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <Icon active={active} />
              <span
                style={{
                  fontSize: 10,
                  letterSpacing: '0.05em',
                  color: active ? '#2d4a3e' : '#8a7a5e',
                  fontWeight: active ? 600 : 400,
                }}
              >
                {item.label}
              </span>
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 16,
                    height: 2,
                    borderRadius: 1,
                    background: '#c4924a',
                  }}
                />
              )}
            </button>
          )
        })}
      </div>
    </nav>
    {showPremium && <PremiumSheet onClose={() => setShowPremium(false)} />}
    </>
  )
}
