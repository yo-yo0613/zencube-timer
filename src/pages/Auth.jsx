import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'
import { LogIn, UserPlus, LogOut, Sun, Moon, Sparkles, User, Mail, Calendar, Key } from 'lucide-react'

const Auth = () => {
  const { user, signIn, signUp, signOut, loading } = useAuth()
  
  // Theme state
  const [theme, setTheme] = useState('dark') // 'dark' or 'light'
  
  // Auth Form state
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [authError, setAuthError] = useState('')
  const [authSuccess, setAuthSuccess] = useState('')
  const [actionLoading, setActionLoading] = useState(false)

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('cube_theme') || 'dark'
    setTheme(savedTheme)
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }, [])

  const toggleTheme = (selectedTheme) => {
    setTheme(selectedTheme)
    localStorage.setItem('cube_theme', selectedTheme)
    if (selectedTheme === 'dark') {
      document.documentElement.classList.add('dark')
      document.body.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.body.classList.remove('dark')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setAuthError('')
    setAuthSuccess('')
    setActionLoading(true)

    try {
      if (isSignUp) {
        if (!username) {
          throw new Error('請填寫用戶名稱！')
        }
        await signUp(email, password, username)
        setAuthSuccess('註冊成功！請檢查您的電子信箱驗證郵件或直接登入（若免驗證）。')
      } else {
        await signIn(email, password)
        setAuthSuccess('登入成功！')
      }
    } catch (err) {
      setAuthError(err.message || '發生錯誤，請稍後再試。')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-xs font-bold text-brand-gray-400">
        載入中...
      </div>
    )
  }

  return (
    <div className="pb-24 px-4 md:px-8 max-w-xl mx-auto pt-10">
      {user ? (
        /* Logged In State */
        <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-gray-100 dark:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 flex items-center justify-center text-brand-gray-500">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight">{user.user_metadata?.username || '魔術方塊大師'}</h2>
              <span className="text-xs text-brand-gray-400 font-mono">{user.email}</span>
            </div>
          </div>

          <div className="border-t border-b border-brand-gray-150 dark:border-brand-gray-900 py-4 space-y-3 text-xs">
            <div className="flex justify-between items-center text-brand-gray-500">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> 登入方式</span>
              <span className="font-bold text-black dark:text-white">Email 帳號</span>
            </div>
            <div className="flex justify-between items-center text-brand-gray-500">
              <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> 帳戶狀態</span>
              <span className="font-bold text-green-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                已啟用雲端同步
              </span>
            </div>
          </div>

          {/* Theme Selector */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-gray-400">介面主題配色</h3>
            <div className="grid grid-cols-2 gap-2 bg-brand-gray-100 dark:bg-brand-gray-950 p-1.5 rounded-2xl">
              <button
                onClick={() => toggleTheme('light')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-brand-gray-400 hover:text-brand-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                簡約明亮 (Light)
              </button>
              <button
                onClick={() => toggleTheme('dark')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-black text-white shadow-sm border border-brand-gray-800'
                    : 'text-brand-gray-500 hover:text-brand-gray-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                質感深邃 (Dark)
              </button>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full py-3.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 font-bold rounded-2xl flex items-center justify-center gap-2 transition-colors duration-200 btn-active-scale text-xs"
          >
            <LogOut className="w-4 h-4" />
            登出此帳號
          </button>
        </div>
      ) : (
        /* Authentication Forms */
        <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-xl">
          <div className="text-center">
            <h2 className="text-2xl font-black tracking-tight">{isSignUp ? '註冊新帳戶' : '會員登入系統'}</h2>
            <p className="text-xs text-brand-gray-400 mt-1">
              {isSignUp ? '建立帳戶以保存您的魔術方塊與盲解練習紀錄' : '登入後可同步計時成績與盲解公式助記詞'}
            </p>
          </div>

          {authError && (
            <div className="bg-red-50 dark:bg-red-950/20 text-red-500 border border-red-200 dark:border-red-900/50 rounded-2xl p-4 text-xs font-bold">
              {authError}
            </div>
          )}

          {authSuccess && (
            <div className="bg-green-50 dark:bg-green-950/20 text-green-500 border border-green-200 dark:border-green-900/50 rounded-2xl p-4 text-xs font-bold">
              {authSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {isSignUp && (
              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">用戶名稱 (Username)</label>
                <div className="relative">
                  <User className="w-4 h-4 text-brand-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="輸入暱稱"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">電子信箱 (Email)</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-brand-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">帳戶密碼 (Password)</label>
              <div className="relative">
                <Key className="w-4 h-4 text-brand-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength="6"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full py-3.5 bg-black dark:bg-white text-white dark:text-black font-bold rounded-2xl hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 transition-colors duration-200 btn-active-scale flex items-center justify-center gap-2 text-sm disabled:opacity-50"
            >
              {actionLoading ? '請稍後...' : isSignUp ? (
                <>
                  <UserPlus className="w-4 h-4" />
                  確認註冊
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  確認登入
                </>
              )}
            </button>
          </form>

          {/* Toggle form button */}
          <div className="text-center pt-2">
            <button
              onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); setAuthSuccess(''); }}
              className="text-xs text-brand-gray-400 hover:text-black dark:hover:text-white font-bold transition-colors"
            >
              {isSignUp ? '已經有帳戶了？點我登入' : '還沒有帳戶？點我註冊帳戶'}
            </button>
          </div>

          {/* Theme toggle for guests too */}
          <div className="pt-4 border-t border-brand-gray-150 dark:border-brand-gray-900 space-y-3">
            <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-gray-400 text-center">介面主題配色</h3>
            <div className="grid grid-cols-2 gap-2 bg-brand-gray-100 dark:bg-brand-gray-950 p-1.5 rounded-2xl">
              <button
                onClick={() => toggleTheme('light')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === 'light'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-brand-gray-400 hover:text-brand-gray-600'
                }`}
              >
                <Sun className="w-4 h-4" />
                明亮 Light
              </button>
              <button
                onClick={() => toggleTheme('dark')}
                className={`py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === 'dark'
                    ? 'bg-black text-white shadow-sm border border-brand-gray-800'
                    : 'text-brand-gray-500 hover:text-brand-gray-300'
                }`}
              >
                <Moon className="w-4 h-4" />
                深邃 Dark
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Auth
