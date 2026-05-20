// LocalStorage-backed persistence for journal, community, profile

const KEYS = {
  JOURNAL: 'lunaria:journal',
  POSTS: 'lunaria:posts',
  USER: 'lunaria:user',
  LIKES: 'lunaria:likes',
  COMMENTS: 'lunaria:comments',
  BIRTH: 'lunaria:birth',
  SAVED_POSTS: 'lunaria:saved',
  VISITS: 'lunaria:visits',
  ONBOARDED: 'lunaria:onboarded',
}

function safeGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function safeSet(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

// ── User profile ──────────────────────────────────
const AVATARS = ['🌙', '✦', '☽', '✧', '★', '🔮', '🌸', '🦋', '🌿', '🕯', '☀', '🌊']
const DEFAULT_NAMES = ['星空旅人', '月光寻者', '塔罗学徒', '占星新人', '宇宙之子', '梦境捕手']

export function getUser() {
  let u = safeGet(KEYS.USER, null)
  if (!u) {
    u = {
      id: 'u_' + Math.random().toString(36).slice(2, 9),
      name: DEFAULT_NAMES[Math.floor(Math.random() * DEFAULT_NAMES.length)],
      avatar: AVATARS[Math.floor(Math.random() * AVATARS.length)],
      level: '新人',
      joined: Date.now(),
    }
    safeSet(KEYS.USER, u)
  }
  return u
}

export function updateUser(patch) {
  const u = { ...getUser(), ...patch }
  safeSet(KEYS.USER, u)
  return u
}

export { AVATARS }

// ── Journal ───────────────────────────────────────
export function getJournal() {
  return safeGet(KEYS.JOURNAL, [])
}

export function saveReading(entry) {
  const list = getJournal()
  const item = {
    id: 'r_' + Date.now(),
    createdAt: Date.now(),
    ...entry,
  }
  list.unshift(item)
  safeSet(KEYS.JOURNAL, list.slice(0, 100))
  return item
}

export function deleteReading(id) {
  const list = getJournal().filter(r => r.id !== id)
  safeSet(KEYS.JOURNAL, list)
  return list
}

// ── Community Posts ───────────────────────────────
import { POSTS as SEED_POSTS } from '../data/communityPosts'

export function getPosts() {
  let posts = safeGet(KEYS.POSTS, null)
  if (!posts) {
    posts = SEED_POSTS.map(p => ({ ...p, createdAt: Date.now() - p.id * 3600000 * 6 }))
    safeSet(KEYS.POSTS, posts)
  }
  return posts
}

export function addPost(post) {
  const user = getUser()
  const posts = getPosts()
  const newPost = {
    id: Date.now(),
    avatar: user.avatar,
    username: user.name,
    level: user.level,
    time: '刚刚',
    likes: 0,
    comments: 0,
    saves: 0,
    liked: false,
    createdAt: Date.now(),
    authorId: user.id,
    ...post,
  }
  posts.unshift(newPost)
  safeSet(KEYS.POSTS, posts)
  return newPost
}

export function deletePost(id) {
  const user = getUser()
  const posts = getPosts().filter(p => !(p.id === id && p.authorId === user.id))
  safeSet(KEYS.POSTS, posts)
  return posts
}

export function toggleLike(postId) {
  const posts = getPosts().map(p => {
    if (p.id !== postId) return p
    const liked = !p.liked
    return { ...p, liked, likes: liked ? p.likes + 1 : Math.max(0, p.likes - 1) }
  })
  safeSet(KEYS.POSTS, posts)
  return posts
}

// ── Comments ──────────────────────────────────────
export function getComments(postId) {
  const all = safeGet(KEYS.COMMENTS, {})
  return all[postId] || []
}

export function addComment(postId, text) {
  const user = getUser()
  const all = safeGet(KEYS.COMMENTS, {})
  const list = all[postId] || []
  const comment = {
    id: 'c_' + Date.now(),
    avatar: user.avatar,
    username: user.name,
    text,
    createdAt: Date.now(),
    authorId: user.id,
  }
  list.push(comment)
  all[postId] = list
  safeSet(KEYS.COMMENTS, all)

  // Bump comment count on post
  const posts = getPosts().map(p =>
    p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
  )
  safeSet(KEYS.POSTS, posts)
  return comment
}

// ── Birth data ────────────────────────────────────
export function getUserBirth() { return safeGet(KEYS.BIRTH, null) }
export function saveUserBirth(data) { safeSet(KEYS.BIRTH, data) }
export function isOnboarded() { return !!localStorage.getItem(KEYS.ONBOARDED) }
export function setOnboarded() { localStorage.setItem(KEYS.ONBOARDED, '1') }

// ── Saved posts (bookmarks) ───────────────────────
export function getSavedPosts() { return safeGet(KEYS.SAVED_POSTS, []) }
export function toggleSavePost(postId) {
  const saved = safeGet(KEYS.SAVED_POSTS, [])
  const idx = saved.indexOf(postId)
  if (idx >= 0) saved.splice(idx, 1)
  else saved.push(postId)
  safeSet(KEYS.SAVED_POSTS, saved)
  return [...saved]
}

// ── Visit streak ──────────────────────────────────
export function recordVisit() {
  const today = new Date().toISOString().slice(0, 10)
  const visits = safeGet(KEYS.VISITS, [])
  if (!visits.includes(today)) { visits.push(today); safeSet(KEYS.VISITS, visits) }
}

export function getStreak() {
  const visits = safeGet(KEYS.VISITS, [])
  if (!visits.length) return 0
  const today = new Date()
  let streak = 0
  for (let i = 0; i < 365; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const s = d.toISOString().slice(0, 10)
    if (visits.includes(s)) streak++
    else break
  }
  return streak
}

// ── Time helpers ──────────────────────────────────
export function relTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 1) return '刚刚'
  if (m < 60) return `${m}分钟前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}小时前`
  const d = Math.floor(h / 24)
  if (d < 7) return `${d}天前`
  return new Date(ts).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}
