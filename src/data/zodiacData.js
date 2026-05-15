export const ZODIAC_SIGNS = [
  {
    id: 'aries', name: '白羊座', en: 'Aries',
    symbol: '♈', dates: '3月21日 - 4月19日',
    element: '火', elementColor: '#ef4444',
    ruler: '火星', quality: '开创',
    lucky: { number: 9, color: '红色', stone: '红宝石', day: '周二' },
    traits: ['勇敢', '热情', '冲动', '领导力', '独立'],
    description: '白羊座是黄道第一星座，代表着新的开始与纯粹的生命力。白羊座的人天生具有领导魅力，充满热情与冲劲，敢于第一个迈出步伐。他们直接、勇敢，有时冲动，但这种原始的力量正是他们的魅力所在。',
    love: '在爱情中，白羊座热情主动，充满激情。他们渴望追求和被追求的刺激感，需要一个能够跟上他们节奏、同样充满活力的伴侣。',
    career: '天生的领导者，适合创业、军事、运动等需要勇气和行动力的领域。在竞争激烈的环境中如鱼得水。',
    compatibility: ['狮子座', '射手座', '双子座'],
    colors: ['#ef4444', '#f97316'],
    gradient: 'from-red-600 to-orange-500',
  },
  {
    id: 'taurus', name: '金牛座', en: 'Taurus',
    symbol: '♉', dates: '4月20日 - 5月20日',
    element: '土', elementColor: '#22c55e',
    ruler: '金星', quality: '固定',
    lucky: { number: 6, color: '绿色', stone: '祖母绿', day: '周五' },
    traits: ['稳定', '忠诚', '耐心', '感官享受', '顽固'],
    description: '金牛座是大地的守护者，代表着稳定、丰盛与感官之美。金牛座的人追求物质与精神的双重安全感，品味极高，对美食、艺术与舒适生活有着本能的鉴赏力。',
    love: '在爱情中，金牛座忠诚且感性，一旦认定就会全心付出。他们用实际行动表达爱意，渴望长久稳定的关系，对背叛零容忍。',
    career: '适合金融、艺术、设计、厨艺等领域。工作踏实认真，有极强的执行力和耐力。',
    compatibility: ['处女座', '摩羯座', '巨蟹座'],
    colors: ['#22c55e', '#86efac'],
    gradient: 'from-green-600 to-emerald-400',
  },
  {
    id: 'gemini', name: '双子座', en: 'Gemini',
    symbol: '♊', dates: '5月21日 - 6月21日',
    element: '风', elementColor: '#eab308',
    ruler: '水星', quality: '变动',
    lucky: { number: 5, color: '黄色', stone: '玛瑙', day: '周三' },
    traits: ['机智', '好奇', '善变', '沟通', '多才多艺'],
    description: '双子座是宇宙中最聪明、最善变的星座。他们思维敏捷，充满好奇心，同时拥有两面性——在不同场合能以不同面貌示人。双子是天生的沟通者和信息传递者。',
    love: '在爱情中，双子座需要精神上的高度共鸣与不断的新鲜感。他们需要一个能够在智识上激发他们的伴侣，无聊是双子最大的天敌。',
    career: '写作、传媒、教育、销售、公关等需要沟通技巧的领域最适合双子。学习能力极强，跨界高手。',
    compatibility: ['天秤座', '水瓶座', '白羊座'],
    colors: ['#eab308', '#fde047'],
    gradient: 'from-yellow-500 to-yellow-300',
  },
  {
    id: 'cancer', name: '巨蟹座', en: 'Cancer',
    symbol: '♋', dates: '6月22日 - 7月22日',
    element: '水', elementColor: '#3b82f6',
    ruler: '月亮', quality: '开创',
    lucky: { number: 2, color: '银白', stone: '月光石', day: '周一' },
    traits: ['感性', '保护', '直觉', '家庭', '情绪化'],
    description: '巨蟹座受月亮支配，如同月亮的盈亏，巨蟹的情绪也随时流动。他们是十二星座中最具母性光辉的，对家庭与亲密之人的守护是他们最深的本能。直觉极强，感受他人情绪如同第六感。',
    love: '在爱情中，巨蟹座全情投入，渴望深度的情感连接与安全感。他们用温柔与关怀滋养伴侣，但也需要被同等温柔地对待。',
    career: '护理、心理咨询、厨艺、房地产、教育等与照顾人或家庭相关的领域。',
    compatibility: ['天蝎座', '双鱼座', '金牛座'],
    colors: ['#3b82f6', '#93c5fd'],
    gradient: 'from-blue-600 to-blue-300',
  },
  {
    id: 'leo', name: '狮子座', en: 'Leo',
    symbol: '♌', dates: '7月23日 - 8月22日',
    element: '火', elementColor: '#ef4444',
    ruler: '太阳', quality: '固定',
    lucky: { number: 1, color: '金色', stone: '橄榄石', day: '周日' },
    traits: ['自信', '慷慨', '戏剧性', '领导力', '荣耀'],
    description: '狮子座是宇宙的国王，太阳赋予了他们无与伦比的魅力与光芒。他们天生为舞台而生，渴望被看见、被认可，同时也是最慷慨、最忠诚的朋友。',
    love: '在爱情中，狮子座是热情的追求者，用盛大的浪漫表达爱意。他们需要一个能欣赏并崇拜他们光芒的伴侣，同时也愿意为爱付出一切。',
    career: '表演、艺术、管理、政治等需要展现个人魅力的舞台。天生的明星与领导者。',
    compatibility: ['白羊座', '射手座', '天秤座'],
    colors: ['#f59e0b', '#ef4444'],
    gradient: 'from-amber-500 to-red-500',
  },
  {
    id: 'virgo', name: '处女座', en: 'Virgo',
    symbol: '♍', dates: '8月23日 - 9月22日',
    element: '土', elementColor: '#22c55e',
    ruler: '水星', quality: '变动',
    lucky: { number: 6, color: '深蓝', stone: '蓝宝石', day: '周三' },
    traits: ['完美主义', '分析力', '勤奋', '谦逊', '细致'],
    description: '处女座是十二星座中最有辨别力和分析能力的。他们追求完美，注重细节，有着近乎本能的秩序感。表面的谦逊下，隐藏着对世界的深刻洞察与极高的自我要求。',
    love: '在爱情中，处女座通过实际行动表达深沉的爱，可能不善言辞，但无微不至的关怀就是他们的情书。',
    career: '医疗、科研、编辑、分析、数据等需要精确与细致的领域。',
    compatibility: ['金牛座', '摩羯座', '天蝎座'],
    colors: ['#6366f1', '#a5b4fc'],
    gradient: 'from-indigo-600 to-indigo-300',
  },
  {
    id: 'libra', name: '天秤座', en: 'Libra',
    symbol: '♎', dates: '9月23日 - 10月23日',
    element: '风', elementColor: '#eab308',
    ruler: '金星', quality: '开创',
    lucky: { number: 7, color: '粉色', stone: '蓝宝石', day: '周五' },
    traits: ['平衡', '优雅', '公正', '外交', '和谐'],
    description: '天秤座是美与和谐的化身，由金星主宰，他们对美的感知是天赋，对公平正义有着近乎执念的追求。天生的外交家，擅长在各方势力之间寻找平衡点。',
    love: '在爱情中，天秤座是最浪漫的伴侣，营造美丽的爱情氛围。但决策困难可能让感情进展缓慢，一旦决定，便是真心。',
    career: '法律、外交、艺术、设计、咨询等需要美感和平衡判断力的领域。',
    compatibility: ['双子座', '水瓶座', '狮子座'],
    colors: ['#ec4899', '#f9a8d4'],
    gradient: 'from-pink-600 to-pink-300',
  },
  {
    id: 'scorpio', name: '天蝎座', en: 'Scorpio',
    symbol: '♏', dates: '10月24日 - 11月21日',
    element: '水', elementColor: '#3b82f6',
    ruler: '冥王星', quality: '固定',
    lucky: { number: 8, color: '深红', stone: '黑曜石', day: '周二' },
    traits: ['深邃', '神秘', '敏锐', '热情', '掌控'],
    description: '天蝎座是最深邃、最复杂的星座，如深海一般神秘莫测。他们对人性有着超乎寻常的洞察力，感情炽热而专一，擅长挖掘事物的本质真相。',
    love: '在爱情中，天蝎座的感情深度如同深渊，一旦爱上便是全身心的投入。他们需要完全的忠诚，对背叛无法原谅。',
    career: '心理学、侦探、金融、研究、外科等需要深度洞察的领域。',
    compatibility: ['巨蟹座', '双鱼座', '处女座'],
    colors: ['#7c3aed', '#1f2937'],
    gradient: 'from-violet-700 to-gray-800',
  },
  {
    id: 'sagittarius', name: '射手座', en: 'Sagittarius',
    symbol: '♐', dates: '11月22日 - 12月21日',
    element: '火', elementColor: '#ef4444',
    ruler: '木星', quality: '变动',
    lucky: { number: 3, color: '紫色', stone: '黄玉', day: '周四' },
    traits: ['自由', '乐观', '哲学', '冒险', '直率'],
    description: '射手座是宇宙的旅行者，由木星主宰，天生渴望自由与更广阔的视野。他们乐观、直率，对生活充满热情，以哲学家的眼光探索世界的真理。',
    love: '在爱情中，射手座需要自由与空间，不喜欢被束缚。他们需要一个能共同探索世界、在精神与智识上并肩同行的伴侣。',
    career: '旅游、教育、出版、哲学、法律等具有广度和自由度的领域。',
    compatibility: ['白羊座', '狮子座', '水瓶座'],
    colors: ['#7c3aed', '#f59e0b'],
    gradient: 'from-purple-600 to-amber-500',
  },
  {
    id: 'capricorn', name: '摩羯座', en: 'Capricorn',
    symbol: '♑', dates: '12月22日 - 1月19日',
    element: '土', elementColor: '#22c55e',
    ruler: '土星', quality: '开创',
    lucky: { number: 4, color: '深棕', stone: '石榴石', day: '周六' },
    traits: ['野心', '纪律', '责任', '耐力', '实际'],
    description: '摩羯座是十二星座中最有野心和毅力的，由土星主宰，他们懂得在时间中积累力量。外表冷静克制，内心深处燃烧着对成功的渴望与对责任的高度认同。',
    love: '在爱情中，摩羯座可能行动缓慢，但一旦投入便是认真负责的伴侣。他们以实际的行动和长期的承诺表达爱意。',
    career: '商业、金融、管理、建筑、政治等需要长期规划和严格纪律的领域。',
    compatibility: ['金牛座', '处女座', '天蝎座'],
    colors: ['#374151', '#6b7280'],
    gradient: 'from-gray-700 to-gray-500',
  },
  {
    id: 'aquarius', name: '水瓶座', en: 'Aquarius',
    symbol: '♒', dates: '1月20日 - 2月18日',
    element: '风', elementColor: '#eab308',
    ruler: '天王星', quality: '固定',
    lucky: { number: 4, color: '蓝色', stone: '紫水晶', day: '周六' },
    traits: ['创新', '人道主义', '独立', '前卫', '理想主义'],
    description: '水瓶座是黄道上最前卫、最具革命精神的星座，他们生活在未来。以人类整体的进步为使命，思想超前、反传统，却又深怀对人类的博爱。',
    love: '在爱情中，水瓶座需要一个能够理解并尊重他们独立性的伴侣。感情中更像挚友，精神连接胜过肉体吸引。',
    career: '科技、研究、社会工作、环保、艺术等与创新和人类未来相关的领域。',
    compatibility: ['双子座', '天秤座', '射手座'],
    colors: ['#0ea5e9', '#38bdf8'],
    gradient: 'from-sky-600 to-sky-300',
  },
  {
    id: 'pisces', name: '双鱼座', en: 'Pisces',
    symbol: '♓', dates: '2月19日 - 3月20日',
    element: '水', elementColor: '#3b82f6',
    ruler: '海王星', quality: '变动',
    lucky: { number: 7, color: '海蓝', stone: '海蓝宝石', day: '周四' },
    traits: ['直觉', '艺术', '同理心', '梦幻', '灵性'],
    description: '双鱼座是黄道的最终章，汇聚了所有星座的智慧与情感。他们具有超凡的直觉与同理心，生活在梦境与现实的边界，是天生的艺术家与灵性探索者。',
    love: '在爱情中，双鱼座是最浪漫、最体贴的伴侣，将爱情视为灵魂的融合。他们渴望深度的精神与情感连接，容易为爱奉献一切。',
    career: '艺术、音乐、灵性治疗、心理咨询、慈善事业等与创意和帮助他人相关的领域。',
    compatibility: ['巨蟹座', '天蝎座', '摩羯座'],
    colors: ['#6366f1', '#818cf8'],
    gradient: 'from-indigo-500 to-violet-400',
  },
]

// Extended data: fortune scores + personality archetypes for three-pillar analysis
export const ZODIAC_EXTENDED = {
  aries:       { fortuneScores: { love: 72, career: 88, wealth: 70, social: 82 }, sunTag: '先锋者',     moonTag: '冲动型感性', risingTag: '活力四射' },
  taurus:      { fortuneScores: { love: 88, career: 80, wealth: 92, social: 75 }, sunTag: '享乐主义者', moonTag: '安全感渴望', risingTag: '稳重可靠' },
  gemini:      { fortuneScores: { love: 75, career: 85, wealth: 72, social: 92 }, sunTag: '话题制造机', moonTag: '情绪多变型', risingTag: '八面玲珑' },
  cancer:      { fortuneScores: { love: 92, career: 72, wealth: 68, social: 80 }, sunTag: '温柔守护者', moonTag: '敏感共情者', risingTag: '温暖近人' },
  leo:         { fortuneScores: { love: 85, career: 90, wealth: 80, social: 90 }, sunTag: '舞台中央控', moonTag: '荣耀心强型', risingTag: '自信光芒' },
  virgo:       { fortuneScores: { love: 70, career: 88, wealth: 82, social: 72 }, sunTag: '完美主义者', moonTag: '思虑过多型', risingTag: '低调谨慎' },
  libra:       { fortuneScores: { love: 90, career: 78, wealth: 75, social: 95 }, sunTag: '平衡大师',   moonTag: '选择困难症', risingTag: '优雅迷人' },
  scorpio:     { fortuneScores: { love: 88, career: 85, wealth: 80, social: 70 }, sunTag: '侦探本能',   moonTag: '情绪深水区', risingTag: '神秘磁场' },
  sagittarius: { fortuneScores: { love: 78, career: 82, wealth: 72, social: 90 }, sunTag: '自由灵魂',   moonTag: '无忧乐观派', risingTag: '开朗直率' },
  capricorn:   { fortuneScores: { love: 72, career: 92, wealth: 90, social: 75 }, sunTag: '攀登者',     moonTag: '现实主义者', risingTag: '成熟稳重' },
  aquarius:    { fortuneScores: { love: 72, career: 85, wealth: 70, social: 88 }, sunTag: '独立思想家', moonTag: '理性情感型', risingTag: '特立独行' },
  pisces:      { fortuneScores: { love: 90, career: 70, wealth: 65, social: 85 }, sunTag: '灵性漫游者', moonTag: '共情达人',   risingTag: '温柔梦幻' },
}

export function getZodiacByDate(month, day) {
  const m = parseInt(month), d = parseInt(day)
  if ((m === 3 && d >= 21) || (m === 4 && d <= 19)) return 'aries'
  if ((m === 4 && d >= 20) || (m === 5 && d <= 20)) return 'taurus'
  if ((m === 5 && d >= 21) || (m === 6 && d <= 21)) return 'gemini'
  if ((m === 6 && d >= 22) || (m === 7 && d <= 22)) return 'cancer'
  if ((m === 7 && d >= 23) || (m === 8 && d <= 22)) return 'leo'
  if ((m === 8 && d >= 23) || (m === 9 && d <= 22)) return 'virgo'
  if ((m === 9 && d >= 23) || (m === 10 && d <= 23)) return 'libra'
  if ((m === 10 && d >= 24) || (m === 11 && d <= 21)) return 'scorpio'
  if ((m === 11 && d >= 22) || (m === 12 && d <= 21)) return 'sagittarius'
  if ((m === 12 && d >= 22) || (m === 1 && d <= 19)) return 'capricorn'
  if ((m === 1 && d >= 20) || (m === 2 && d <= 18)) return 'aquarius'
  return 'pisces'
}

export function getZodiacDegree(month, day) {
  const signOrder = ['aries','taurus','gemini','cancer','leo','virgo','libra','scorpio','sagittarius','capricorn','aquarius','pisces']
  const sign = getZodiacByDate(month, day)
  const idx = signOrder.indexOf(sign)
  return idx * 30 + 15
}
