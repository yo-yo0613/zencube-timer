import React from 'react'
import { NavLink } from 'react-router-dom'
import { Timer, BookOpen, Brain, Award, BarChart3, User } from 'lucide-react'

const MobileNavbar = () => {
  const navItems = [
    { to: '/', label: '計時器', icon: Timer },
    { to: '/formulas', label: '記公式', icon: BookOpen },
    { to: '/csp-trainer', label: 'CSP 練習', icon: Award },
    { to: '/blindfold', label: '練盲解', icon: Brain },
    { to: '/history', label: '練習紀錄', icon: BarChart3 },
    { to: '/auth', label: '個人頁面', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-brand-gray-200 dark:border-brand-gray-800 safe-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 transition-colors duration-200 ${
                  isActive
                    ? 'text-black dark:text-white font-medium scale-105'
                    : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-1 transition-transform" />
              <span className="text-[10px] tracking-wide">{item.label}</span>
            </NavLink>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNavbar
