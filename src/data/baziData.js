// 天干 Heavenly Stems
export const STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸']

// 地支 Earthly Branches
export const BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥']

// 五行 element for each stem
export const STEM_ELEMENTS = ['木', '木', '火', '火', '土', '土', '金', '金', '水', '水']

// 五行 element for each branch
export const BRANCH_ELEMENTS = ['水', '土', '木', '木', '土', '火', '火', '土', '金', '金', '土', '水']

export const ELEMENT_COLORS = {
  木: '#5c7a3e', 火: '#c44a3e', 土: '#c4924a', 金: '#8a6a4a', 水: '#3e6c8c',
}

export const ELEMENT_BG = {
  木: '#f0f7ec', 火: '#fdf0ef', 土: '#fdf6ee', 金: '#f5f0e8', 水: '#edf3f8',
}

// 纳音 (30 pairs)
export const NAYIN = [
  '海中金', '炉中火', '大林木', '路旁土', '剑锋金',
  '山头火', '涧下水', '城头土', '白蜡金', '杨柳木',
  '泉中水', '屋上土', '霹雳火', '松柏木', '长流水',
  '沙中金', '山下火', '平地木', '壁上土', '金箔金',
  '覆灯火', '天河水', '大驿土', '钗钏金', '桑柘木',
  '大溪水', '沙中土', '天上火', '石榴木', '大海水',
]

// 藏干 (hidden stems) for each branch, by branch index
export const HIDDEN_STEMS = [
  [9],        // 子: 癸
  [5, 9, 7],  // 丑: 己癸辛
  [0, 2, 4],  // 寅: 甲丙戊
  [1],        // 卯: 乙
  [4, 1, 9],  // 辰: 戊乙癸
  [2, 6, 4],  // 巳: 丙庚戊
  [3, 5],     // 午: 丁己
  [5, 3, 1],  // 未: 己丁乙
  [6, 8, 4],  // 申: 庚壬戊
  [7],        // 酉: 辛
  [4, 7, 3],  // 戌: 戊辛丁
  [8, 0],     // 亥: 壬甲
]

// Approximate month branch (Gregorian month 1-12 → branch index)
// Jan=丑(1), Feb=寅(2), ..., Nov=亥(11), Dec=子(0)
export const MONTH_BRANCH = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 0]

// Month stem start for 寅月(Feb), indexed by year stem % 5
// yearStem 0,5→丙(2); 1,6→戊(4); 2,7→庚(6); 3,8→壬(8); 4,9→甲(0)
const MONTH_STEM_START = [2, 4, 6, 8, 0]

// Day master descriptions (by stem index)
export const DAY_MASTER_DESC = [
  { label: '甲木·参天大树', element: '木', traits: ['进取', '正直', '仁慈'], desc: '甲木如参天大树，天生具有领导才能，品格正直，充满上进心，追求自我完善与独立。' },
  { label: '乙木·柔韧青藤', element: '木', traits: ['柔韧', '适应', '亲和'], desc: '乙木如随风而动的青藤，柔中带韧，善于借力，人际关系极佳，适应环境能力强。' },
  { label: '丙火·骄阳烈日', element: '火', traits: ['热情', '率直', '乐观'], desc: '丙火如万丈烈阳，热情开朗，感染力强，行事光明磊落，是天生的激励者与领导者。' },
  { label: '丁火·温暖烛光', element: '火', traits: ['细腻', '执着', '温暖'], desc: '丁火如温暖烛光，性格细腻，情感丰富，做事专注执着，善于在细节中发现美。' },
  { label: '戊土·厚重山岳', element: '土', traits: ['稳重', '诚信', '包容'], desc: '戊土如岿然山岳，性格稳重敦厚，承载力与包容心极强，是人们可以信赖的依靠。' },
  { label: '己土·肥沃田地', element: '土', traits: ['谨慎', '勤劳', '细心'], desc: '己土如肥沃田地，勤劳踏实，处事谨慎细心，善于积累，耐心十足。' },
  { label: '庚金·锐利刀剑', element: '金', traits: ['果断', '正义', '坚韧'], desc: '庚金如锋利刀剑，性格刚毅果断，正义感强，行事雷厉风行，有不服输的韧劲。' },
  { label: '辛金·璀璨珠宝', element: '金', traits: ['精致', '敏感', '完美'], desc: '辛金如璀璨珠宝，注重外在，追求精致，感受敏锐，对美有独到鉴赏力。' },
  { label: '壬水·奔涌江河', element: '水', traits: ['智慧', '灵活', '深谋'], desc: '壬水如奔腾大江，思维灵活，洞察力与智慧兼备，善于运筹帷幄，适应力极强。' },
  { label: '癸水·滋润细雨', element: '水', traits: ['温柔', '直觉', '共情'], desc: '癸水如滋润细雨，性格温柔内敛，直觉敏锐，共情能力强，善解人意，充满灵性。' },
]

// ── Calculation Functions ──────────────────────────────────────────────

export function getYearPillar(year) {
  // Reference: 1984 = 甲子年 (stem 0, branch 0)
  const stemIdx = ((year - 4) % 10 + 10) % 10
  const branchIdx = ((year - 4) % 12 + 12) % 12
  return { stemIdx, branchIdx }
}

export function getMonthPillar(year, month) {
  const yearStem = ((year - 4) % 10 + 10) % 10
  const startStem = MONTH_STEM_START[yearStem % 5]
  // Feb=寅 is offset 0 from start; month offset: Feb→0, Mar→1, ..., Jan→11
  const monthOffset = month >= 2 ? month - 2 : month + 10
  const stemIdx = (startStem + monthOffset) % 10
  const branchIdx = MONTH_BRANCH[month - 1]
  return { stemIdx, branchIdx }
}

export function getDayPillar(year, month, day) {
  // Jan 1, 1900 = index 10 in 60-cycle (甲戌)
  const ref = new Date(1900, 0, 1)
  const target = new Date(year, month - 1, day)
  const days = Math.floor((target - ref) / 86400000)
  const sexIdx = ((days + 10) % 60 + 60) % 60
  return { stemIdx: sexIdx % 10, branchIdx: sexIdx % 12, sexIdx }
}

export function getHourPillar(dayStemIdx, hour) {
  // Hour branch: 子(0)=23-1, 丑(1)=1-3, ..., 亥(11)=21-23
  let branchIdx
  if (hour >= 23 || hour < 1) branchIdx = 0
  else branchIdx = Math.floor((hour + 1) / 2) % 12
  // Hour stem start by day stem
  const hourStemStarts = [0, 2, 4, 6, 8, 0, 2, 4, 6, 8]
  const stemIdx = (hourStemStarts[dayStemIdx] + branchIdx) % 10
  return { stemIdx, branchIdx }
}

export function getBazi(year, month, day, hour) {
  const yearP = getYearPillar(year)
  const monthP = getMonthPillar(year, month)
  const dayP = getDayPillar(year, month, day)
  const hourP = getHourPillar(dayP.stemIdx, hour)
  return { year: yearP, month: monthP, day: dayP, hour: hourP }
}

export function getNayin(stemIdx, branchIdx) {
  const sexIdx = stemIdx * 6 + Math.floor(branchIdx / 2)
  const nayinIdx = Math.floor(((stemIdx + branchIdx) % 60) / 2)
  return NAYIN[((stemIdx * 6 + branchIdx) % 30 + 30) % 30]
}

export function getElementBalance(pillars) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 }
  pillars.forEach(p => {
    counts[STEM_ELEMENTS[p.stemIdx]]++
    counts[BRANCH_ELEMENTS[p.branchIdx]]++
  })
  return counts
}

export function getDaYun(monthPillar, forward = true) {
  const periods = []
  for (let i = 1; i <= 8; i++) {
    const offset = forward ? i : -i
    const stemIdx = ((monthPillar.stemIdx + offset) % 10 + 10) % 10
    const branchIdx = ((monthPillar.branchIdx + offset) % 12 + 12) % 12
    periods.push({ stemIdx, branchIdx, startAge: (i - 1) * 10 + 5 })
  }
  return periods
}
