import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import Formulas from './pages/Formulas'
import Blindfold from './pages/Blindfold'
import CspTrainer from './pages/CspTrainer'
import History from './pages/History'
import Auth from './pages/Auth'
import MobileNavbar from './components/MobileNavbar'
import { Timer, BookOpen, Brain, Award, BarChart3, User, Moon, Sun } from 'lucide-react'


// PWA service worker registration imports
import { registerSW } from 'virtual:pwa-register'

const App = () => {
  // Register service worker for offline capabilities (Vite PWA)
  useEffect(() => {
    registerSW({
      onNeedRefresh() {
        if (confirm('App 有新版本更新，是否立即重新載入？')) {
          window.location.reload()
        }
      },
      onOfflineReady() {
        console.log('App 已經準備好離線使用！')
      },
    })
  }, [])

  // Sync theme on app load
  useEffect(() => {
    const savedTheme = localStorage.getItem('cube_theme') || 'dark'
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-brand-light dark:bg-brand-dark text-brand-dark dark:text-brand-light pb-16 md:pb-0">
          
          {/* Desktop/Tablet Header Navigation */}
          <header className="hidden md:block sticky top-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-brand-gray-200 dark:border-brand-gray-800">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 font-black text-xl tracking-tighter">
                <div className="w-6 h-6 rounded bg-black dark:bg-white flex items-center justify-center text-white dark:text-black font-extrabold text-sm">Z</div>
                <span>ZENCUBE</span>
              </Link>
              
              {/* Desktop Nav Items */}
              <nav className="flex gap-1.5 text-xs font-bold">
                {[
                  { to: '/', label: '計時器', icon: Timer },
                  { to: '/formulas', label: '記公式', icon: BookOpen },
                  { to: '/csp-trainer', label: 'CSP 練習', icon: Award },
                  { to: '/blindfold', label: '練盲解', icon: Brain },
                  { to: '/history', label: '練習紀錄', icon: BarChart3 },
                  { to: '/auth', label: '個人頁面', icon: User },
                ].map((item) => {
                  const Icon = item.icon
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      className={({ isActive }) =>
                        `flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-black dark:bg-white text-white dark:text-black shadow-sm'
                            : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          </header>

          {/* Main Content Area */}
          <main className="transition-all duration-300">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/formulas" element={<Formulas />} />
              <Route path="/csp-trainer" element={<CspTrainer />} />
              <Route path="/blindfold" element={<Blindfold />} />
              <Route path="/history" element={<History />} />
              <Route path="/auth" element={<Auth />} />
            </Routes>
          </main>

          {/* Mobile Bottom Navigation (Apple Style) */}
          <div className="md:hidden">
            <MobileNavbar />
          </div>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
