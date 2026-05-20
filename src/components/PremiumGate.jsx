import { useState } from 'react'
import { isPremium } from '../utils/premium'
import PremiumSheet from './PremiumSheet'
import { tap } from '../utils/haptics'

export default function PremiumGate({ feature, children, blur = true }) {
  const [showSheet, setShowSheet] = useState(false)
  const [premium, setPremium] = useState(isPremium)

  if (premium) return children

  return (
    <>
      <div style={{ position: 'relative' }}>
        {/* Blurred teaser */}
        {blur && (
          <div style={{ filter: 'blur(6px)', pointerEvents: 'none', userSelect: 'none', opacity: 0.5 }}>
            {children}
          </div>
        )}
        {/* Lock overlay */}
        <div
          onClick={() => { tap(); setShowSheet(true) }}
          style={{
            position: blur ? 'absolute' : 'relative',
            inset: blur ? 0 : 'auto',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            background: blur ? 'rgba(250,244,232,0.75)' : 'transparent',
            borderRadius: 16, cursor: 'pointer',
            padding: blur ? 0 : '40px 24px',
            textAlign: 'center',
            backdropFilter: blur ? 'blur(2px)' : 'none',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, marginBottom: 10,
            boxShadow: '0 6px 20px rgba(196,146,74,0.3)',
          }}>🔒</div>
          <p className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 4 }}>会员专属功能</p>
          <p style={{ fontSize: 12, color: '#5a4a3a', marginBottom: 12 }}>{feature}</p>
          <div style={{
            background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
            borderRadius: 999, padding: '8px 22px',
            color: '#fff', fontSize: 13, fontWeight: 600,
            boxShadow: '0 4px 12px rgba(196,146,74,0.35)',
          }}>
            ✦ 解锁会员
          </div>
        </div>
      </div>

      {showSheet && (
        <PremiumSheet
          onClose={() => setShowSheet(false)}
          onActivated={() => setPremium(true)}
        />
      )}
    </>
  )
}
