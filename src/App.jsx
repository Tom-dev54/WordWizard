import { useState } from 'react'
import FloatingParticles from './components/FloatingParticles'
import Navigation from './components/Navigation'
import Onboarding from './components/Onboarding'
import DailySplash from './components/DailySplash'
import Home from './pages/Home'
import Tarot from './pages/Tarot'
import Astrology from './pages/Astrology'
import Community from './pages/Community'
import { isOnboarded } from './utils/storage'

const PAGES = {
  home: Home,
  tarot: Tarot,
  astrology: Astrology,
  community: Community,
}

function shouldShowSplash() {
  const today = new Date().toISOString().slice(0, 10)
  return localStorage.getItem('lunaria:splash_' + today) !== '1'
}

export default function App() {
  const [page, setPage] = useState('home')
  const [showOnboarding, setShowOnboarding] = useState(!isOnboarded())
  const [showSplash, setShowSplash] = useState(() => !showOnboarding && shouldShowSplash())
  const Page = PAGES[page] || Home

  function handleSplashDone() {
    const today = new Date().toISOString().slice(0, 10)
    localStorage.setItem('lunaria:splash_' + today, '1')
    setShowSplash(false)
  }

  return (
    <div className="paper-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <FloatingParticles />
      <div className="animate-page-enter" style={{ position: 'relative', zIndex: 1 }} key={page}>
        <Page onNavigate={setPage} />
      </div>
      <Navigation current={page} onNavigate={setPage} />
      {showOnboarding && <Onboarding onDone={() => { setShowOnboarding(false); setShowSplash(false) }} />}
      {showSplash && !showOnboarding && <DailySplash onDone={handleSplashDone} />}
    </div>
  )
}
