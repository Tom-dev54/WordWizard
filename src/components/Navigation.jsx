const NAV_ITEMS = [
  { id: 'home', label: '首页', icon: '✦' },
  { id: 'tarot', label: '塔罗', icon: '🃏' },
  { id: 'astrology', label: '星盘', icon: '🔮' },
  { id: 'community', label: '社区', icon: '✨' },
]

export default function Navigation({ current, onNavigate }) {
  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: 'rgba(8,8,24,0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-around', padding: '8px 0' }}>
        {NAV_ITEMS.map((item) => {
          const active = current === item.id
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 4,
                padding: '8px 16px',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative',
              }}
            >
              {active && (
                <span
                  style={{
                    position: 'absolute',
                    top: -1,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 32,
                    height: 2,
                    background: 'linear-gradient(90deg, #7c3aed, #f59e0b)',
                    borderRadius: 1,
                  }}
                />
              )}
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span
                style={{
                  fontSize: 10,
                  fontFamily: 'Inter, sans-serif',
                  letterSpacing: '0.05em',
                  color: active ? '#f59e0b' : 'rgba(255,255,255,0.4)',
                  fontWeight: active ? 600 : 400,
                  transition: 'color 0.2s',
                }}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
