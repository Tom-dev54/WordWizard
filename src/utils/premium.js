const KEY = 'lunaria:premium'

function safeGet(key, fallback) {
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback } catch { return fallback }
}
function safeSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)) } catch {}
}

// Valid codes stored as base64 of the code string (case-insensitive, trimmed)
// Format: LT-XXXX (lifetime), YR-XXXX (1 year), MO-XXXX (1 month)
// To add a new code: run btoa('LT-ABCD') in browser console → add result here
const VALID = [
  'TFQtTFVOQQ==',   // LT-LUNA  (lifetime demo)
  'WVItTFVOQQ==',   // YR-LUNA  (year demo)
  'TU8tTFVOQQ==',   // MO-LUNA  (month demo)
]

export function isPremium() {
  const d = safeGet(KEY, null)
  if (!d) return false
  if (d.type === 'lifetime') return true
  return d.expiry > Date.now()
}

export function getPremiumInfo() {
  return safeGet(KEY, null)
}

export function activatePremium(code) {
  const normalized = code.trim().toUpperCase()
  const encoded = btoa(normalized)
  if (!VALID.includes(encoded)) return false
  const type = normalized.startsWith('LT') ? 'lifetime' : normalized.startsWith('YR') ? 'year' : 'month'
  const durations = { lifetime: Infinity, year: 365 * 86400000, month: 30 * 86400000 }
  safeSet(KEY, { type, expiry: Date.now() + (durations[type] || 0), activatedAt: Date.now(), code: normalized })
  return true
}

export function deactivatePremium() {
  localStorage.removeItem(KEY)
}

// Call this to register a new code programmatically (for admin use in console):
// window._addCode = (code) => console.log(btoa(code.trim().toUpperCase()))
