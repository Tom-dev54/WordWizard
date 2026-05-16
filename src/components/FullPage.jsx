import { useState, useEffect } from 'react'

export default function FullPage({ onClose, children, title }) {
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function dismiss() {
    if (closing) return
    setClosing(true)
    setTimeout(onClose, 360)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#faf4e8',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
        overscrollBehavior: 'contain',
        animation: closing
          ? 'slide-down-full 0.36s cubic-bezier(0.4,0,1,1) forwards'
          : 'slide-up-full 0.42s cubic-bezier(0.32,0.72,0,1) both',
      }}
    >
      {/* Sticky header with close button */}
      <div style={{
        position: 'sticky', top: 0, left: 0, right: 0,
        height: 52, zIndex: 1,
        display: 'flex', alignItems: 'center',
        justifyContent: title ? 'space-between' : 'flex-end',
        padding: '0 16px',
        background: 'rgba(250,244,232,0.95)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(196,146,74,0.1)',
      }}>
        {title && (
          <p className="serif" style={{ fontSize: 17, color: '#2d2618', fontWeight: 600 }}>
            {title}
          </p>
        )}
        <button
          onClick={dismiss}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'rgba(45,38,24,0.08)',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, color: '#5a4a3a',
            transition: 'background 0.15s ease',
            flexShrink: 0,
          }}
          onTouchStart={e => e.currentTarget.style.background = 'rgba(45,38,24,0.15)'}
          onTouchEnd={e => e.currentTarget.style.background = 'rgba(45,38,24,0.08)'}
        >
          ✕
        </button>
      </div>

      {/* Scrollable content */}
      <div style={{ paddingBottom: 100 }}>
        {typeof children === 'function' ? children(dismiss) : children}
      </div>
    </div>
  )
}
