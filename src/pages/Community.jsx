import { useState } from 'react'
import { POSTS, CATEGORIES } from '../data/communityPosts'

function PostCard({ post, onLike }) {
  const levelColors = { '大师': '#f59e0b', '资深': '#a78bfa', '活跃': '#34d399', '新人': '#60a5fa' }
  return (
    <div
      className="glass card-hover"
      style={{
        borderRadius: 20, padding: 20, marginBottom: 14,
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
    >
      {/* Author */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, flexShrink: 0,
        }}>
          {post.avatar}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}>{post.username}</span>
            <span style={{
              fontSize: 9, padding: '2px 7px',
              background: `${levelColors[post.level] || '#7c3aed'}20`,
              border: `1px solid ${levelColors[post.level] || '#7c3aed'}40`,
              borderRadius: 10, color: levelColors[post.level] || '#a78bfa',
              fontWeight: 600,
            }}>{post.level}</span>
          </div>
          <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{post.time}</span>
        </div>
      </div>

      {/* Content */}
      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#f1f5f9', marginBottom: 8, lineHeight: 1.4 }}>
        {post.title}
      </h3>
      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 12 }}>
        {post.content.slice(0, 80)}…
      </p>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
        {post.tags.map(tag => (
          <span key={tag} style={{
            fontSize: 10, padding: '3px 8px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 10, color: 'rgba(255,255,255,0.45)',
          }}>#{tag}</span>
        ))}
      </div>

      {/* Interactions */}
      <div style={{
        display: 'flex', gap: 20,
        paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}>
        <button
          onClick={(e) => { e.stopPropagation(); onLike(post.id) }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 5,
            color: post.liked ? '#f43f5e' : 'rgba(255,255,255,0.35)',
            fontSize: 12, transition: 'color 0.2s',
          }}
        >
          {post.liked ? '❤️' : '🤍'} {post.likes + (post.liked ? 1 : 0)}
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          💬 {post.comments}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>
          🔖 {post.saves}
        </span>
      </div>
    </div>
  )
}

function NewPostModal({ onClose }) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState('tarot')

  function handleSubmit() {
    if (!title.trim()) return
    alert('发布成功！你的帖子已提交审核 ✨')
    onClose()
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.8)',
        backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          background: 'linear-gradient(180deg, #0f0f2e, #080818)',
          borderRadius: '24px 24px 0 0',
          padding: '24px 20px 48px',
          border: '1px solid rgba(255,255,255,0.08)',
          maxHeight: '85vh', overflowY: 'auto',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h3 style={{ fontFamily: 'Cinzel, serif', fontSize: 18, color: '#f1f5f9' }}>发布新帖</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', fontSize: 20, cursor: 'pointer' }}>×</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>分类</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {CATEGORIES.filter(c => c.id !== 'all').map(cat => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12,
                  background: category === cat.id ? 'rgba(124,58,237,0.3)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${category === cat.id ? 'rgba(124,58,237,0.5)' : 'rgba(255,255,255,0.1)'}`,
                  color: category === cat.id ? '#c4b5fd' : 'rgba(255,255,255,0.45)',
                  cursor: 'pointer',
                }}
              >{cat.label}</button>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>标题</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="为你的帖子起一个吸引人的标题…"
            style={{
              width: '100%', padding: '12px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#f1f5f9',
              fontSize: 14, outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', display: 'block', marginBottom: 6 }}>内容</label>
          <textarea
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder="分享你的灵性经验、问题或见解…"
            rows={6}
            style={{
              width: '100%', padding: '12px 14px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, color: '#f1f5f9',
              fontSize: 13, outline: 'none', resize: 'none',
              lineHeight: 1.7,
            }}
          />
        </div>

        <button
          onClick={handleSubmit}
          style={{
            width: '100%', padding: 14,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', borderRadius: 14,
            color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(124,58,237,0.35)',
          }}
        >
          ✦ 发布
        </button>
      </div>
    </div>
  )
}

export default function Community() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [posts, setPosts] = useState(POSTS)
  const [showNewPost, setShowNewPost] = useState(false)
  const [searchText, setSearchText] = useState('')

  function handleLike(id) {
    setPosts(prev => prev.map(p =>
      p.id === id ? { ...p, liked: !p.liked } : p
    ))
  }

  const filtered = posts.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory
    const matchSearch = !searchText || p.title.includes(searchText) || p.content.includes(searchText)
    return matchCat && matchSearch
  })

  return (
    <div style={{ padding: '60px 20px 100px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <p style={{ fontSize: 11, letterSpacing: '0.15em', color: '#f59e0b', marginBottom: 4, textTransform: 'uppercase' }}>
            ✦ Community ✦
          </p>
          <h1 style={{ fontFamily: 'Cinzel, serif', fontSize: 22, color: '#f1f5f9' }}>灵性社区</h1>
        </div>
        <button
          onClick={() => setShowNewPost(true)}
          style={{
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: 'none', borderRadius: 12,
            padding: '10px 16px', color: 'white',
            fontSize: 13, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
          }}
        >
          + 发帖
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 16 }}>
        <input
          value={searchText}
          onChange={e => setSearchText(e.target.value)}
          placeholder="搜索帖子…"
          style={{
            width: '100%', padding: '12px 40px 12px 16px',
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 14, color: '#f1f5f9',
            fontSize: 13, outline: 'none',
          }}
        />
        <span style={{
          position: 'absolute', right: 14, top: '50%',
          transform: 'translateY(-50%)',
          color: 'rgba(255,255,255,0.3)', fontSize: 16,
        }}>🔍</span>
      </div>

      {/* Categories */}
      <div style={{
        display: 'flex', gap: 8, overflowX: 'auto',
        paddingBottom: 4, marginBottom: 20,
        scrollbarWidth: 'none',
        msOverflowStyle: 'none',
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            style={{
              padding: '7px 16px', borderRadius: 20, fontSize: 12,
              whiteSpace: 'nowrap', cursor: 'pointer',
              background: activeCategory === cat.id ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${activeCategory === cat.id ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}`,
              color: activeCategory === cat.id ? '#f59e0b' : 'rgba(255,255,255,0.45)',
              fontWeight: activeCategory === cat.id ? 600 : 400,
              transition: 'all 0.2s ease',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="glass-gold" style={{ borderRadius: 16, padding: 14, marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {[
            { label: '社区成员', value: '12,480' },
            { label: '今日帖子', value: '236' },
            { label: '在线用户', value: '1,024' },
          ].map(item => (
            <div key={item.label} style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 16, fontWeight: 700, color: '#f59e0b', fontFamily: 'Cinzel, serif' }}>{item.value}</p>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)' }}>{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Posts */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'rgba(255,255,255,0.3)' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🌙</p>
          <p>暂无相关帖子</p>
        </div>
      ) : (
        filtered.map(post => (
          <PostCard key={post.id} post={post} onLike={handleLike} />
        ))
      )}

      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}
    </div>
  )
}
