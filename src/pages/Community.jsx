import { useState, useEffect } from 'react'
import { CATEGORIES } from '../data/communityPosts'
import {
  getPosts, addPost, toggleLike, deletePost,
  getComments, addComment,
  getUser, updateUser, AVATARS, relTime,
  getSavedPosts, toggleSavePost, getUserBirth, getStreak,
} from '../utils/storage'
import { isPremium } from '../utils/premium'
import Sheet from '../components/Sheet'
import { tap } from '../utils/haptics'

function PostCard({ post, onOpen, onLike, onSave, saved }) {
  const user = getUser()
  const isMine = post.authorId === user.id
  return (
    <button
      onClick={onOpen}
      className="card-soft"
      style={{
        width: '100%', padding: 18, marginBottom: 12,
        border: 'none', cursor: 'pointer', textAlign: 'left',
        background: '#ffffff', display: 'block',
        transition: 'transform 0.15s ease',
      }}
      onTouchStart={e => e.currentTarget.style.transform = 'scale(0.99)'}
      onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
        <div style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #fdf9f0, #ecdfbf)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
          border: '1px solid rgba(196,146,74,0.3)',
        }}>{post.avatar}</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#2d2618' }}>{post.username}</span>
            {isMine && <span className="pill pill-gold" style={{ fontSize: 9 }}>我</span>}
            <span className="pill pill-cream" style={{ fontSize: 9 }}>{post.level}</span>
          </div>
          <span style={{ fontSize: 11, color: '#8a7a5e' }}>{relTime(post.createdAt) || post.time}</span>
        </div>
      </div>

      <h3 className="serif" style={{ fontSize: 16, color: '#2d2618', marginBottom: 6, lineHeight: 1.4 }}>
        {post.title}
      </h3>
      <p style={{
        fontSize: 12, color: '#5a4a3a', lineHeight: 1.7, marginBottom: 12,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {post.content}
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
        {post.tags.map(tag => (
          <span key={tag} className="pill pill-cream">#{tag}</span>
        ))}
      </div>

      <div style={{
        display: 'flex', gap: 18, paddingTop: 10,
        borderTop: '1px solid rgba(196,146,74,0.12)',
      }}>
        <span
          onClick={(e) => { e.stopPropagation(); onLike(post.id) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
            color: post.liked ? '#8c4a5e' : '#8a7a5e', cursor: 'pointer',
          }}
        >
          {post.liked ? '♥' : '♡'} {post.likes}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#8a7a5e', fontSize: 12 }}>
          ☉ {post.comments}
        </span>
        <span
          onClick={(e) => { e.stopPropagation(); tap(); onSave(post.id) }}
          style={{
            display: 'flex', alignItems: 'center', gap: 5, fontSize: 12,
            color: saved ? '#c4924a' : '#8a7a5e', cursor: 'pointer',
            marginLeft: 'auto',
          }}
        >
          {saved ? '★' : '☆'} 收藏
        </span>
      </div>
    </button>
  )
}

function PostDetail({ post, onClose, onUpdate }) {
  const [comments, setComments] = useState(getComments(post.id))
  const [text, setText] = useState('')
  const user = getUser()
  const isMine = post.authorId === user.id

  function handleSend() {
    if (!text.trim()) return
    addComment(post.id, text.trim())
    setComments(getComments(post.id))
    setText('')
    onUpdate()
  }

  return (
    <Sheet onClose={onClose} contentStyle={{ maxHeight: '92vh' }}>
      {(dismiss) => {
        function handleDelete() {
          if (!confirm('确定删除这篇帖子吗？')) return
          deletePost(post.id)
          onUpdate()
          dismiss()
        }

        return (
          <>
            <div className="sheet-handle" />

            <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
              <div style={{
                width: 42, height: 42, borderRadius: '50%',
                background: 'linear-gradient(135deg, #fdf9f0, #ecdfbf)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, border: '1px solid rgba(196,146,74,0.3)',
              }}>{post.avatar}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: '#2d2618' }}>{post.username}</p>
                <p style={{ fontSize: 11, color: '#8a7a5e' }}>{relTime(post.createdAt) || post.time}</p>
              </div>
              {isMine && (
                <button onClick={handleDelete} style={{
                  background: 'none', border: 'none', color: '#8c4a5e',
                  fontSize: 12, cursor: 'pointer',
                }}>删除</button>
              )}
            </div>

            <h2 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 10, lineHeight: 1.4 }}>
              {post.title}
            </h2>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
              {post.tags.map(t => <span key={t} className="pill pill-cream">#{t}</span>)}
            </div>
            <p style={{ fontSize: 14, color: '#3d3327', lineHeight: 1.9, marginBottom: 24, whiteSpace: 'pre-line' }}>
              {post.content}
            </p>

            <div className="divider">评论 · {comments.length}</div>

            {comments.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#8a7a5e', fontSize: 12, padding: '20px 0' }}>
                暂无评论，做第一个分享想法的人 ✦
              </p>
            ) : (
              <div style={{ marginBottom: 16 }}>
                {comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: '#fdf9f0', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      fontSize: 14, flexShrink: 0,
                      border: '1px solid rgba(196,146,74,0.25)',
                    }}>{c.avatar}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#2d2618' }}>{c.username}</span>
                        <span style={{ fontSize: 10, color: '#8a7a5e' }}>{relTime(c.createdAt)}</span>
                      </div>
                      <p style={{ fontSize: 12, color: '#3d3327', lineHeight: 1.7, marginTop: 3 }}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div style={{
              display: 'flex', gap: 8, position: 'sticky', bottom: 0,
              background: '#faf4e8', padding: '12px 0', marginTop: 8,
            }}>
              <input
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="写下你的想法…"
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                style={{
                  flex: 1, padding: '10px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 999, fontSize: 13,
                }}
              />
              <button onClick={handleSend} className="btn-primary" style={{ padding: '10px 18px' }}>
                发送
              </button>
            </div>
          </>
        )
      }}
    </Sheet>
  )
}

function NewPostSheet({ onClose }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [category, setCategory] = useState('tarot')

  return (
    <Sheet onClose={onClose}>
      {(dismiss) => {
        function handlePublish() {
          if (!title.trim() || !content.trim()) {
            alert('标题和内容都不能为空 ✦')
            return
          }
          addPost({
            title: title.trim(),
            content: content.trim(),
            tags: tags.split(/[,，\s]+/).filter(Boolean).slice(0, 5),
            category,
          })
          dismiss()
        }

        return (
          <>
            <div className="sheet-handle" />
            <h3 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 4 }}>发布新帖</h3>
            <p style={{ fontSize: 12, color: '#8a7a5e', marginBottom: 18 }}>
              分享你的塔罗经验、星盘心得或灵性见解
            </p>

            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 8 }}>分类</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    style={{
                      padding: '6px 14px', borderRadius: 999, fontSize: 11,
                      border: 'none', cursor: 'pointer',
                      background: category === cat.id ? '#2d4a3e' : '#fdf9f0',
                      color: category === cat.id ? '#fdf9f0' : '#5a4a3a',
                      transition: 'all 0.2s ease',
                    }}
                  >{cat.label}</button>
                ))}
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>标题</span>
              <input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="起一个吸引人的标题…"
                maxLength={50}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 10, color: '#2d2618',
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 12 }}>
              <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>内容</span>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                placeholder="分享你的想法、经验或问题…"
                rows={6}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 10, color: '#2d2618',
                  lineHeight: 1.7, resize: 'none',
                }}
              />
            </label>

            <label style={{ display: 'block', marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>
                标签 <span style={{ color: '#8a7a5e' }}>（用空格分隔，最多5个）</span>
              </span>
              <input
                value={tags}
                onChange={e => setTags(e.target.value)}
                placeholder="例如：塔罗 大牌解读 新手"
                style={{
                  width: '100%', padding: '11px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 10, color: '#2d2618',
                }}
              />
            </label>

            <button onClick={handlePublish} className="btn-primary" style={{ width: '100%', marginBottom: 8 }}>
              ✦ 发布
            </button>
            <button onClick={dismiss} style={{
              width: '100%', background: 'none', border: 'none',
              padding: 10, color: '#8a7a5e', fontSize: 12, cursor: 'pointer',
            }}>
              取消
            </button>
          </>
        )
      }}
    </Sheet>
  )
}

function SettingsSheet({ onClose }) {
  const [user] = useState(getUser())
  const [name, setName] = useState(user.name)
  const [avatar, setAvatar] = useState(user.avatar)
  const birth = getUserBirth()
  const streak = getStreak()
  const premium = isPremium()

  return (
    <Sheet onClose={onClose}>
      {(dismiss) => {
        function handleSave() {
          updateUser({ name: name.trim() || user.name, avatar })
          dismiss()
        }

        return (
          <>
            <div className="sheet-handle" />
            <h3 className="serif" style={{ fontSize: 20, color: '#2d2618', marginBottom: 18, textAlign: 'center' }}>
              个人设置
            </h3>

            <div style={{ marginBottom: 18 }}>
              <p style={{ fontSize: 11, color: '#5a4a3a', marginBottom: 10 }}>选择头像</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {AVATARS.map(a => (
                  <button
                    key={a}
                    onClick={() => { tap(); setAvatar(a) }}
                    style={{
                      aspectRatio: '1',
                      background: avatar === a ? '#2d4a3e' : '#fdf9f0',
                      border: avatar === a ? 'none' : '1px solid rgba(196,146,74,0.2)',
                      borderRadius: 12, fontSize: 22, cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >{a}</button>
                ))}
              </div>
            </div>

            <label style={{ display: 'block', marginBottom: 18 }}>
              <span style={{ fontSize: 11, color: '#5a4a3a', display: 'block', marginBottom: 6 }}>昵称</span>
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                maxLength={20}
                style={{
                  width: '100%', padding: '11px 14px',
                  background: '#fff',
                  border: '1px solid rgba(196,146,74,0.25)',
                  borderRadius: 10, color: '#2d2618',
                }}
              />
            </label>

            <div style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 11, color: '#5a4a3a', marginBottom: 10 }}>个人信息</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {birth ? (
                  <div style={{
                    background: 'rgba(196,146,74,0.08)', borderRadius: 10,
                    padding: '10px 14px', fontSize: 12, color: '#5a4a3a',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    🎂 {birth.month}月{birth.day}日{birth.year ? ` ${birth.year}年` : ''}
                  </div>
                ) : (
                  <div style={{ fontSize: 12, color: '#8a7a5e' }}>前往「星盘」页面输入出生信息</div>
                )}
                {streak > 0 && (
                  <div style={{
                    background: 'rgba(196,146,74,0.08)', borderRadius: 10,
                    padding: '10px 14px', fontSize: 12, color: '#c4924a',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    🔥 连续签到 {streak} 天
                  </div>
                )}
              </div>
            </div>

            <div style={{
              marginBottom: 18, background: premium
                ? 'linear-gradient(135deg, rgba(196,146,74,0.12), rgba(196,146,74,0.05))'
                : '#fdf9f0',
              borderRadius: 12, padding: '14px 16px',
              border: `1px solid ${premium ? 'rgba(196,146,74,0.35)' : 'rgba(196,146,74,0.15)'}`,
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{ fontSize: 22 }}>{premium ? '✦' : '🔒'}</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 13, color: '#2d2618', fontWeight: 600, marginBottom: 2 }}>
                  {premium ? '月相塔罗会员' : '免费版'}
                </p>
                <p style={{ fontSize: 11, color: '#8a7a5e' }}>
                  {premium ? '全部专属功能已解锁' : '升级会员，解锁AI解读、高级牌阵等'}
                </p>
              </div>
              {!premium && (
                <div style={{
                  padding: '5px 12px', borderRadius: 999, fontSize: 11,
                  background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
                  color: '#fff', fontWeight: 600, whiteSpace: 'nowrap',
                }}>升级</div>
              )}
            </div>

            <button onClick={handleSave} className="btn-primary" style={{ width: '100%' }}>
              ✦ 保存
            </button>
          </>
        )
      }}
    </Sheet>
  )
}

export default function Community() {
  const [posts, setPosts] = useState(getPosts())
  const [activeCategory, setActiveCategory] = useState('tarot')
  const [activeTag, setActiveTag] = useState(null)
  const [searchText, setSearchText] = useState('')
  const [savedIds, setSavedIds] = useState(getSavedPosts())
  const [openPost, setOpenPost] = useState(null)
  const [showNew, setShowNew] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [user, setUser] = useState(getUser())

  function refresh() {
    setPosts(getPosts())
    setUser(getUser())
    setSavedIds(getSavedPosts())
  }

  function handleLike(id) {
    toggleLike(id)
    refresh()
  }

  function handleSave(postId) {
    const updated = toggleSavePost(postId)
    setSavedIds(updated)
  }

  // Collect all unique tags from posts
  const allTags = [...new Set(posts.flatMap(p => p.tags || []))].slice(0, 12)

  const filtered = posts.filter(p => {
    if (activeCategory === 'saved') return savedIds.includes(p.id)
    const catOk = p.category === activeCategory
    const tagOk = !activeTag || (p.tags || []).includes(activeTag)
    const txtOk = !searchText || p.title.includes(searchText) || p.content.includes(searchText)
    return catOk && tagOk && txtOk
  })

  return (
    <div className="animate-fade-in pb-nav" style={{ padding: '40px 18px 0', maxWidth: 520, margin: '0 auto' }}>
      <div style={{
        paddingTop: 16, marginBottom: 18,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div>
          <p className="section-sub">COMMUNITY</p>
          <h1 className="serif" style={{ fontSize: 26, color: '#2d2618' }}>灵性社区</h1>
        </div>
        <button
          onClick={() => setShowProfile(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#fdf9f0',
            border: '1px solid rgba(196,146,74,0.2)',
            borderRadius: 999, padding: '6px 6px 6px 12px',
            cursor: 'pointer', transition: 'transform 0.15s ease',
          }}
          onTouchStart={e => e.currentTarget.style.transform = 'scale(0.95)'}
          onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{ fontSize: 12, color: '#5a4a3a' }}>{user.name}</span>
          <span style={{
            width: 28, height: 28, borderRadius: '50%',
            background: '#fff', display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: 14,
          }}>{user.avatar}</span>
        </button>
      </div>

      <input
        value={searchText}
        onChange={e => setSearchText(e.target.value)}
        placeholder="搜索帖子…"
        style={{
          width: '100%', padding: '11px 16px',
          background: '#fff',
          border: '1px solid rgba(196,146,74,0.2)',
          borderRadius: 999, color: '#2d2618',
          marginBottom: 14,
        }}
      />

      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', overflowY: 'hidden', marginBottom: 10, paddingBottom: 2 }}>
        {[...CATEGORIES.filter(c => c.id !== 'all'), { id: 'saved', label: '★ 已保存' }].map(cat => (
          <button
            key={cat.id}
            onClick={() => { tap(); setActiveCategory(cat.id); setActiveTag(null) }}
            style={{
              padding: '7px 14px', borderRadius: 999, whiteSpace: 'nowrap',
              border: 'none', cursor: 'pointer', fontSize: 12,
              background: activeCategory === cat.id ? '#2d4a3e' : '#fdf9f0',
              color: activeCategory === cat.id ? '#fdf9f0' : '#5a4a3a',
              fontWeight: activeCategory === cat.id ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tag chips */}
      {allTags.length > 0 && (
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 14, paddingBottom: 2 }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => { tap(); setActiveTag(activeTag === tag ? null : tag) }} style={{
              padding: '4px 10px', borderRadius: 999, whiteSpace: 'nowrap', border: 'none', cursor: 'pointer',
              fontSize: 11, background: activeTag === tag ? 'rgba(196,146,74,0.25)' : 'rgba(196,146,74,0.08)',
              color: activeTag === tag ? '#c4924a' : '#8a7a5e', fontWeight: activeTag === tag ? 600 : 400,
              transition: 'all 0.2s ease',
            }}>#{tag}</button>
          ))}
        </div>
      )}

      <button
        onClick={() => setShowNew(true)}
        className="card-soft"
        style={{
          width: '100%', padding: 14, marginBottom: 14,
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'linear-gradient(135deg, #2d4a3e, #1f3329)',
          color: '#fdf9f0', transition: 'transform 0.15s ease',
        }}
        onTouchStart={e => e.currentTarget.style.transform = 'scale(0.98)'}
        onTouchEnd={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <span style={{ fontSize: 18 }}>✦</span>
        <span style={{ fontSize: 13, fontWeight: 500 }}>分享你的塔罗或星盘见解…</span>
      </button>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <p style={{ fontSize: 32, marginBottom: 12 }}>🌙</p>
          <p style={{ color: '#8a7a5e' }}>暂无相关帖子</p>
        </div>
      ) : (
        filtered.map(post => (
          <PostCard
            key={post.id} post={post}
            onOpen={() => setOpenPost(post)}
            onLike={handleLike}
            onSave={handleSave}
            saved={savedIds.includes(post.id)}
          />
        ))
      )}

      <div style={{ height: 80 }} />

      {openPost && (
        <PostDetail post={openPost} onClose={() => setOpenPost(null)} onUpdate={refresh} />
      )}
      {showNew && (
        <NewPostSheet onClose={() => { setShowNew(false); refresh() }} />
      )}
      {showProfile && (
        <SettingsSheet onClose={() => { setShowProfile(false); refresh() }} />
      )}
    </div>
  )
}
