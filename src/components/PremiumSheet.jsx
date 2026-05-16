import { useState } from 'react'
import Sheet from './Sheet'
import { activatePremium, isPremium } from '../utils/premium'
import { tap, success } from '../utils/haptics'

const FEATURES = [
  '凯尔特十字牌阵（10张）',
  '年运牌阵（12张，逐月指引）',
  '星座配对分析（四维度匹配）',
  'AI 智能解读（个性化星座塔罗深度解析）',
  '无限塔罗日志（无上限记录）',
  '高级八字流年运势表',
  '精美分享图片卡片',
]

const PLANS = [
  { id: 'month', label: '月度会员', price: '¥18', sub: '/月', code: 'MO-' },
  { id: 'year',  label: '年度会员', price: '¥98', sub: '/年', highlight: true, save: '省¥118' },
  { id: 'life',  label: '终身会员', price: '¥198', sub: ' 一次性' },
]

export default function PremiumSheet({ onClose, onActivated }) {
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [activated, setActivated] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('year')

  function handleActivate() {
    tap()
    if (!code.trim()) { setError('请输入激活码'); return }
    if (activatePremium(code)) {
      success()
      setActivated(true)
      setTimeout(() => { onActivated?.(); onClose() }, 1800)
    } else {
      setError('激活码无效或已过期，请检查后重试')
    }
  }

  return (
    <Sheet onClose={onClose} contentStyle={{ maxHeight: '92vh' }}>
      {(dismiss) => (
        <>
          <div className="sheet-handle" />

          {activated ? (
            <div className="animate-fade-up" style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ fontSize: 56, marginBottom: 16, animation: 'pulse-soft 1s ease-in-out 3' }}>✦</div>
              <h2 className="serif" style={{ fontSize: 24, color: '#2d2618', marginBottom: 8 }}>会员已激活！</h2>
              <p style={{ fontSize: 14, color: '#5a4a3a' }}>所有专属功能已为你解锁，开始探索吧</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: '50%', margin: '0 auto 12px',
                  background: 'linear-gradient(135deg, #c9973a, #e8c06a)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, boxShadow: '0 6px 20px rgba(196,146,74,0.35)',
                }}>✦</div>
                <h2 className="serif" style={{ fontSize: 22, color: '#2d2618', marginBottom: 4 }}>月相塔罗 · 会员</h2>
                <p style={{ fontSize: 12, color: '#8a7a5e' }}>解锁全部专属功能，深度探索命运密码</p>
              </div>

              {/* Features */}
              <div style={{ marginBottom: 18 }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '7px 0',
                    borderBottom: i < FEATURES.length - 1 ? '1px solid rgba(196,146,74,0.08)' : 'none',
                  }}>
                    <span style={{ fontSize: 13, color: '#c4924a', flexShrink: 0 }}>✓</span>
                    <span style={{ fontSize: 13, color: '#3d3327' }}>{f}</span>
                  </div>
                ))}
              </div>

              {/* Pricing */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 18 }}>
                {PLANS.map(plan => (
                  <div
                    key={plan.id}
                    onClick={() => { tap(); setSelectedPlan(plan.id) }}
                    style={{
                      padding: '12px 6px', borderRadius: 14, textAlign: 'center', cursor: 'pointer',
                      border: `2px solid ${selectedPlan === plan.id ? '#c9973a' : 'rgba(196,146,74,0.2)'}`,
                      background: selectedPlan === plan.id
                        ? 'linear-gradient(135deg, rgba(196,146,74,0.12), rgba(196,146,74,0.06))'
                        : '#fefcf6',
                      position: 'relative', transition: 'all 0.2s ease',
                    }}
                  >
                    {plan.highlight && (
                      <div style={{
                        position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
                        background: '#c9973a', color: '#fff', fontSize: 9,
                        padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap', fontWeight: 600,
                      }}>推荐</div>
                    )}
                    {plan.save && (
                      <div style={{ fontSize: 9, color: '#c44a3e', marginBottom: 2, fontWeight: 600 }}>{plan.save}</div>
                    )}
                    <div className="serif" style={{ fontSize: 19, color: '#c9973a', fontWeight: 700 }}>{plan.price}</div>
                    <div style={{ fontSize: 9, color: '#8a7a5e' }}>{plan.sub}</div>
                    <div style={{ fontSize: 10, color: '#5a4a3a', marginTop: 3 }}>{plan.label}</div>
                  </div>
                ))}
              </div>

              {/* QR Code / Payment */}
              <div style={{
                background: 'rgba(196,146,74,0.06)', borderRadius: 14,
                padding: 16, marginBottom: 16, textAlign: 'center',
              }}>
                <p style={{ fontSize: 11, color: '#8a7a5e', marginBottom: 10 }}>扫码付款后，微信发送截图获取激活码</p>
                <div style={{
                  width: 140, height: 140, margin: '0 auto 10px',
                  borderRadius: 12, overflow: 'hidden', background: '#f0e8d6',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid rgba(196,146,74,0.2)',
                }}>
                  <img
                    src="/WordWizard/wechat-pay.jpg"
                    alt="微信收款码"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<div style="color:#8a7a5e;font-size:12px;padding:20px">微信收款码<br/>即将上线</div>'
                    }}
                  />
                </div>
                <p style={{ fontSize: 10, color: '#8a7a5e' }}>微信号：（付款后联系）</p>
              </div>

              {/* Code entry */}
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, color: '#5a4a3a', marginBottom: 8 }}>输入激活码</p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={code}
                    onChange={e => { setCode(e.target.value); setError('') }}
                    placeholder="如 LT-XXXX / YR-XXXX / MO-XXXX"
                    style={{
                      flex: 1, padding: '11px 14px',
                      background: '#fff', border: `1px solid ${error ? '#c44a3e' : 'rgba(196,146,74,0.25)'}`,
                      borderRadius: 12, color: '#2d2618', fontSize: 13,
                    }}
                  />
                  <button
                    onClick={handleActivate}
                    className="btn-primary"
                    style={{ padding: '11px 16px', flexShrink: 0, fontSize: 13 }}
                  >
                    激活
                  </button>
                </div>
                {error && (
                  <p style={{ fontSize: 11, color: '#c44a3e', marginTop: 6 }}>{error}</p>
                )}
              </div>

              <button onClick={dismiss} style={{
                width: '100%', background: 'none', border: 'none',
                padding: 10, color: '#8a7a5e', fontSize: 12, cursor: 'pointer',
              }}>
                稍后再说
              </button>
            </>
          )}
        </>
      )}
    </Sheet>
  )
}
