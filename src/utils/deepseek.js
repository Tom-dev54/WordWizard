const API_KEY = import.meta.env.VITE_DEEPSEEK_KEY

export async function getAIReading(prompt) {
  if (!API_KEY) throw new Error('DeepSeek API key not configured')
  const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 400,
      temperature: 0.85,
    }),
  })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  const data = await res.json()
  return data.choices?.[0]?.message?.content || ''
}

export function buildTarotPrompt({ spreadName, cards, question }) {
  const cardList = cards.map(c => `${c.cardName}（${c.reversed ? '逆位' : '正位'}，位置：${c.position}）`).join('、')
  return `你是一位温柔睿智的塔罗占卜师，语言富有诗意而接地气。用户抽到的牌阵是「${spreadName}」，牌面为：${cardList}。${question ? `用户的问题是：${question}。` : ''}请用中文，200字以内，给出一段温暖有洞见的综合解读，不需要分牌解释，要给出整体感悟与建议。`
}

export function buildAstrologyPrompt({ sunSign, moonSign, risingSign, scores }) {
  const signs = [sunSign && `太阳${sunSign}`, moonSign && `月亮${moonSign}`, risingSign && `上升${risingSign}`].filter(Boolean).join('、')
  const scoreText = scores ? `今日运势：爱情${scores.love}分、事业${scores.career}分、财富${scores.wealth}分、人际${scores.social}分。` : ''
  return `你是一位温柔的星座占星师。用户的星盘是：${signs}。${scoreText}请用中文，150字以内，给出一段今日个性化星座指引，语气温暖鼓励，结合星座特质，给出今天最重要的一个行动建议。`
}
