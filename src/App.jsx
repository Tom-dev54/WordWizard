import { useState } from 'react'
import FloatingParticles from './components/FloatingParticles'
import Navigation from './components/Navigation'
import Home from './pages/Home'
import Tarot from './pages/Tarot'
import Astrology from './pages/Astrology'
import Library from './pages/Library'
import Community from './pages/Community'

const PAGES = {
  home: Home,
  tarot: Tarot,
  astrology: Astrology,
  library: Library,
  community: Community,
}

export default function App() {
  const [page, setPage] = useState('home')
  const Page = PAGES[page] || Home

  return (
    <div className="paper-bg" style={{ minHeight: '100vh', position: 'relative' }}>
      <FloatingParticles />
      <div style={{ position: 'relative', zIndex: 1 }} key={page}>
        <Page onNavigate={setPage} />
      </div>
      <Navigation current={page} onNavigate={setPage} />
    </div>
  )
}
