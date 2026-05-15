import { useState } from 'react'
import StarBackground from './components/StarBackground'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Tarot from './pages/Tarot'
import Astrology from './pages/Astrology'
import Community from './pages/Community'

const PAGES = { home: Home, tarot: Tarot, astrology: Astrology, community: Community }

export default function App() {
  const [page, setPage] = useState('home')
  const PageComponent = PAGES[page] || Home

  return (
    <div className="nebula-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <StarBackground />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <PageComponent onNavigate={setPage} />
      </div>
      <Navigation current={page} onNavigate={setPage} />
    </div>
  )
}
