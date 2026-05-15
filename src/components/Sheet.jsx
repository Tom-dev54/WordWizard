import { useState, useEffect, useRef } from 'react'

export default function Sheet({ onClose, children, contentStyle }) {
  const [closing, setClosing] = useState(false)
  const closingRef = useRef(false)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  function dismiss() {
    if (closingRef.current) return
    closingRef.current = true
    setClosing(true)
    setTimeout(onClose, 380)
  }

  return (
    <div
      className={`sheet${closing ? ' sheet-out' : ''}`}
      onClick={dismiss}
    >
      <div
        className="sheet-content"
        onClick={e => e.stopPropagation()}
        style={closing ? {
          animation: 'slide-down-sheet 0.38s cubic-bezier(0.4,0,1,1) forwards',
          ...contentStyle,
        } : contentStyle}
      >
        {typeof children === 'function' ? children(dismiss) : children}
      </div>
    </div>
  )
}
