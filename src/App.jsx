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

export default function App() {
  const [page, setPage] = useState('home')
  const [showOnboarding, setShowOnboarding] = useState(!isOnboarded())
  // Always show splash on every launch (unless onboarding is still in progress)
  const [showSplash, setShowSplash] = useState(!showOnboarding)
  const Page = PAGES[page] || Home

  return (
    <div className="paper-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <FloatingParticles />
      <div className="animate-page-enter" style={{ position: 'relative', zIndex: 1 }} key={page}>
        <Page onNavigate={setPage} />
      </div>
      <Navigation current={page} onNavigate={setPage} />
      {showOnboarding && (
        <Onboarding onDone={() => {
          setShowOnboarding(false)
          setShowSplash(true)
        }} />
      )}
      {showSplash && !showOnboarding && (
        <DailySplash onDone={() => setShowSplash(false)} />
      )}
    </div>
  )
}
