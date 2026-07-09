import React, { useState, useEffect } from 'react'
import { BentoGrid, BentoCard } from '../components/BentoGrid'
import Timer, { formatTime } from '../components/Timer'
import CalendarHeatmap from '../components/CalendarHeatmap'
import QRShare from '../components/QRShare'
import { fetchSolvesFromDb, saveSolveToDb, deleteSolveFromDb, updateSolvePenaltyInDb, clearSessionSolvesFromDb } from '../utils/db'
import { WCA_PUZZLES } from '../utils/scrambler'
import { Award, Zap, History, BarChart2, ShieldAlert, Layers, Clock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Helper to calculate rolling average of N (AoN)
const getAoN = (solvesList, n) => {
  if (solvesList.length < n) return null
  const recent = solvesList.slice(-n)
  const dnfCount = recent.filter(s => s.penalty === 'DNF').length
  if (dnfCount >= 2) return 'DNF'

  const times = recent.map(s => s.penalty === 'DNF' ? Infinity : (s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms))
  times.sort((a, b) => a - b)
  
  const trimmed = times.slice(1, -1)
  if (trimmed.includes(Infinity)) return 'DNF'
  
  const sum = trimmed.reduce((acc, t) => acc + t, 0)
  return Math.round(sum / trimmed.length)
}

// Helper to calculate Best Average of N (Best AoN) in the current session
const getBestAoN = (solvesList, n) => {
  if (solvesList.length < n) return null
  let best = Infinity
  for (let i = 0; i <= solvesList.length - n; i++) {
    const windowSolves = solvesList.slice(i, i + n)
    const dnfCount = windowSolves.filter(s => s.penalty === 'DNF').length
    if (dnfCount >= 2) continue

    const times = windowSolves.map(s => s.penalty === 'DNF' ? Infinity : (s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms))
    times.sort((a, b) => a - b)
    
    const trimmed = times.slice(1, -1)
    if (trimmed.includes(Infinity)) continue
    
    const sum = trimmed.reduce((acc, t) => acc + t, 0)
    const avg = Math.round(sum / trimmed.length)
    if (avg < best) best = avg
  }
  return best === Infinity ? null : best
}

// Helper to calculate standard deviation
const getStandardDeviation = (timesList) => {
  if (timesList.length < 2) return null
  const mean = timesList.reduce((acc, t) => acc + t, 0) / timesList.length
  const variance = timesList.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / (timesList.length - 1)
  return Math.sqrt(variance)
}

// Helper to format total practice session time
const formatTotalTime = (ms) => {
  const sec = Math.floor(ms / 1000)
  if (sec < 60) return `${sec}秒`
  const min = Math.floor(sec / 60)
  const remSec = sec % 60
  if (min < 60) return `${min}分${remSec}秒`
  const hr = Math.floor(min / 60)
  const remMin = min % 60
  return `${hr}時${remMin}分`
}

const Home = () => {
  const [solves, setSolves] = useState([])
  const [loading, setLoading] = useState(true)
  const [puzzleType, setPuzzleType] = useState('333') // Default to 3x3x3
  const { user } = useAuth()

  // Session states
  const [sessions, setSessions] = useState(() => {
    const local = localStorage.getItem('cube_sessions')
    return local ? JSON.parse(local) : [
      { id: '1', name: '階段 1' },
      { id: '2', name: '階段 2' }
    ]
  })
  const [activeSession, setActiveSession] = useState(() => {
    return localStorage.getItem('cube_active_session') || '1'
  })

  useEffect(() => {
    localStorage.setItem('cube_sessions', JSON.stringify(sessions))
  }, [sessions])

  useEffect(() => {
    localStorage.setItem('cube_active_session', activeSession)
  }, [activeSession])

  useEffect(() => {
    loadSolves()
  }, [user])

  const loadSolves = async () => {
    setLoading(true)
    const data = await fetchSolvesFromDb()
    setSolves(data)
    setLoading(false)
  }

  // Session operations
  const handleAddSession = () => {
    const name = prompt('請輸入新階段分組的名稱：', `階段 ${sessions.length + 1}`)
    if (!name || !name.trim()) return
    const newSession = { id: Date.now().toString(), name: name.trim() }
    setSessions(prev => [...prev, newSession])
    setActiveSession(newSession.id)
  }

  const handleRenameSession = () => {
    const current = sessions.find(s => s.id === activeSession)
    if (!current) return
    const name = prompt('請輸入新的階段名稱：', current.name)
    if (!name || !name.trim()) return
    setSessions(prev => prev.map(s => s.id === activeSession ? { ...s, name: name.trim() } : s))
  }

  const handleClearSession = async () => {
    const currentName = sessions.find(s => s.id === activeSession)?.name || '當前階段'
    if (confirm(`⚠️ 確定要清空「${currentName}」中的所有練習紀錄嗎？\n這只會清空當前分組的紀錄，其他階段的紀錄會被保留！`)) {
      await clearSessionSolvesFromDb(activeSession, puzzleType)
      loadSolves()
    }
  }

  const handleDeleteSession = async () => {
    if (sessions.length <= 1) {
      alert('至少必須保留一個階段分組！')
      return
    }
    const currentName = sessions.find(s => s.id === activeSession)?.name || '當前階段'
    if (confirm(`⚠️ 確定要刪除整個「${currentName}」分組嗎？\n這將會同時刪除該分組下的所有計時成績，此動作無法復原！`)) {
      await clearSessionSolvesFromDb(activeSession, puzzleType)
      const remaining = sessions.filter(s => s.id !== activeSession)
      setSessions(remaining)
      setActiveSession(remaining[0].id)
      loadSolves()
    }
  }

  const handleSolveComplete = async (newSolve) => {
    const saved = await saveSolveToDb(newSolve)
    setSolves((prev) => [...prev, saved])
  }

  const handleDeleteLastSolve = async (id) => {
    if (confirm('確定要刪除這筆紀錄嗎？')) {
      await deleteSolveFromDb(id)
      setSolves((prev) => prev.filter((s) => s.id !== id))
    }
  }

  const handlePenaltyChange = async (id, penalty) => {
    await updateSolvePenaltyInDb(id, penalty)
    setSolves((prev) => prev.map((s) => (s.id === id ? { ...s, penalty } : s)))
  }

  // Filter solves for current active WCA puzzle type AND session
  const currentPuzzleSolves = solves.filter(s => s.puzzle_type === puzzleType && (s.session_id || '1') === activeSession)
  const validSolves = currentPuzzleSolves.filter(s => s.penalty !== 'DNF')
  const lastSolve = currentPuzzleSolves.length > 0 ? currentPuzzleSolves[currentPuzzleSolves.length - 1] : null

  // 1. Overview Stats
  const solveCount = currentPuzzleSolves.length
  const dnfCount = currentPuzzleSolves.filter(s => s.penalty === 'DNF').length
  const successRate = solveCount > 0 ? Math.round(((solveCount - dnfCount) / solveCount) * 100) : 0
  
  const totalTimeMs = validSolves.reduce((acc, s) => acc + (s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms), 0)

  const bestTime = validSolves.length > 0 
    ? Math.min(...validSolves.map(s => s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms)) 
    : null
  
  const worstTime = validSolves.length > 0 
    ? Math.max(...validSolves.map(s => s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms)) 
    : null

  const sessionMean = validSolves.length > 0
    ? Math.round(validSolves.reduce((acc, s) => acc + (s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms), 0) / validSolves.length)
    : null

  // 2. Rolling Averages (Current vs Best)
  const curAo5 = getAoN(currentPuzzleSolves, 5)
  const bestAo5 = getBestAoN(currentPuzzleSolves, 5)
  
  const curAo12 = getAoN(currentPuzzleSolves, 12)
  const bestAo12 = getBestAoN(currentPuzzleSolves, 12)
  
  const curAo50 = getAoN(currentPuzzleSolves, 50)
  const bestAo50 = getBestAoN(currentPuzzleSolves, 50)

  // 3. Consistency
  const solveTimes = validSolves.map(s => s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms)
  const sd = getStandardDeviation(solveTimes)
  const rangeTime = bestTime && worstTime ? worstTime - bestTime : null

  const getRecentSolves = () => {
    return [...currentPuzzleSolves].reverse().slice(0, 5)
  }

  const activeSessionName = sessions.find(s => s.id === activeSession)?.name || '階段 1'

  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-6">
      {/* Bento Grid Header */}
      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4 transition-all duration-300 header-area font-sans">
        <div>
          <h1 className="text-3xl font-black tracking-tight">ZENCUBE TIMER</h1>
          <p className="text-xs text-brand-gray-400 font-semibold tracking-wider uppercase mt-1">
            {user ? `歡迎回來，${user.user_metadata?.username || user.email}` : '單機訪客模式 (登入後可雲端備份)'}
          </p>
        </div>

        {/* Puzzle and Session Selectors */}
        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          {/* Active Session Manager Capsule */}
          <div className="flex items-center gap-2 bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-2 rounded-2xl border border-brand-gray-200 dark:border-brand-gray-800 shadow-sm text-xs">
            <span className="text-brand-gray-400 font-bold uppercase tracking-wider">分組:</span>
            <select
              value={activeSession}
              onChange={(e) => setActiveSession(e.target.value)}
              className="bg-transparent border-none font-black focus:outline-none text-black dark:text-white cursor-pointer"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id} className="bg-white dark:bg-black text-black dark:text-white">
                  {s.name}
                </option>
              ))}
            </select>
            
            {/* Quick Session Actions */}
            <div className="flex items-center gap-2 ml-2 pl-2 border-l border-brand-gray-200 dark:border-brand-gray-800 text-[10px] font-bold text-brand-gray-400 select-none">
              <button onClick={handleAddSession} className="hover:text-black dark:hover:text-white" title="新增分組">＋新增</button>
              <button onClick={handleRenameSession} className="hover:text-black dark:hover:text-white" title="修改名稱">✎改名</button>
              <button onClick={handleClearSession} className="hover:text-red-500" title="清空本組紀錄">⟲清空</button>
              <button onClick={handleDeleteSession} className="hover:text-red-500" title="刪除分組">✕刪除</button>
            </div>
          </div>

          {/* WCA Puzzle Selector */}
          <div className="flex items-center gap-2 bg-brand-gray-50 dark:bg-brand-gray-950 px-4 py-2 rounded-2xl border border-brand-gray-200 dark:border-brand-gray-800 shadow-sm">
            <Layers className="w-4 h-4 text-brand-gray-500" />
            <select
              value={puzzleType}
              onChange={(e) => setPuzzleType(e.target.value)}
              className="bg-transparent border-none text-xs font-black focus:outline-none text-black dark:text-white cursor-pointer"
            >
              {WCA_PUZZLES.map(p => (
                <option key={p.code} value={p.code} className="bg-white dark:bg-black text-black dark:text-white">
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Bento Layout */}
      <BentoGrid>
        {/* Large Timer Block */}
        <BentoCard colSpan="md:col-span-4 lg:col-span-8" className="flex flex-col justify-between min-h-[400px] timer-card">
          <Timer
            onSolveComplete={handleSolveComplete}
            lastSolve={lastSolve}
            onDeleteLastSolve={handleDeleteLastSolve}
            onPenaltyChange={handlePenaltyChange}
            solves={solves}
            puzzleType={puzzleType}
            activeSession={activeSession}
          />
        </BentoCard>

        {/* Advanced Stats Block */}
        <BentoCard colSpan="md:col-span-2 lg:col-span-4" className="flex flex-col justify-between min-h-[440px] stats-card transition-all duration-300">
          <div className="border-b border-brand-gray-100 dark:border-brand-gray-900 pb-3">
            <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gray-400 dark:text-brand-gray-500">分組數據 ({activeSessionName})</span>
            <h2 className="text-xl font-black mt-0.5 truncate max-w-[280px]">{puzzleType.toUpperCase()} FULL STATS</h2>
          </div>

          <div className="space-y-4 my-4 flex-1 overflow-y-auto pr-1">
            {/* Subsection 1: Overview */}
            <div>
              <span className="text-[10px] font-black text-brand-gray-400 uppercase tracking-wider block mb-2">📊 概覽與總結</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 flex justify-between items-center">
                  <span className="text-brand-gray-500 font-medium">總練習量</span>
                  <span className="font-mono font-bold">{solveCount} 次</span>
                </div>
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 flex justify-between items-center">
                  <span className="text-brand-gray-500 font-medium">成功率</span>
                  <span className="font-mono font-bold text-green-500">{successRate}%</span>
                </div>
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 flex justify-between items-center col-span-2">
                  <span className="text-brand-gray-500 font-medium">累計練習時間</span>
                  <span className="font-mono font-bold text-black dark:text-white">{formatTotalTime(totalTimeMs)}</span>
                </div>
              </div>
            </div>

            {/* Subsection 2: Single & Mean */}
            <div>
              <span className="text-[10px] font-black text-brand-gray-400 uppercase tracking-wider block mb-2">⏱️ 單次與平均值</span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-400 text-[9px] font-bold block">最佳單次 (Single)</span>
                  <span className="font-mono font-bold text-sm text-green-500 block mt-0.5">{bestTime ? formatTime(bestTime) : '--'}</span>
                </div>
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-400 text-[9px] font-bold block">最慢單次 (Worst)</span>
                  <span className="font-mono font-bold text-sm block mt-0.5">{worstTime ? formatTime(worstTime) : '--'}</span>
                </div>
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 col-span-2">
                  <span className="text-brand-gray-400 text-[9px] font-bold block">對數平均值 (Session Mean)</span>
                  <span className="font-mono font-bold text-sm text-black dark:text-white block mt-0.5">{sessionMean ? formatTime(sessionMean) : '--'}</span>
                </div>
              </div>
            </div>

            {/* Subsection 3: Rolling Averages (Current vs Best) */}
            <div>
              <span className="text-[10px] font-black text-brand-gray-400 uppercase tracking-wider block mb-2">📈 滾動平均 (當前 / 最佳)</span>
              <div className="space-y-1.5 text-xs font-sans">
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-2 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-bold">Ao5 (平均五次)</span>
                  <span className="font-mono">
                    <strong className="text-black dark:text-white">{curAo5 === 'DNF' ? 'DNF' : (curAo5 ? formatTime(curAo5) : '--')}</strong>
                    <span className="text-brand-gray-400 mx-1">/</span>
                    <span className="text-brand-gray-400">{bestAo5 ? formatTime(bestAo5) : '--'}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-2 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-bold">Ao12 (平均十二次)</span>
                  <span className="font-mono">
                    <strong className="text-black dark:text-white">{curAo12 === 'DNF' ? 'DNF' : (curAo12 ? formatTime(curAo12) : '--')}</strong>
                    <span className="text-brand-gray-400 mx-1">/</span>
                    <span className="text-brand-gray-400">{bestAo12 ? formatTime(bestAo12) : '--'}</span>
                  </span>
                </div>
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-2 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-bold">Ao50 (平均五十次)</span>
                  <span className="font-mono">
                    <strong className="text-black dark:text-white">{curAo50 === 'DNF' ? 'DNF' : (curAo50 ? formatTime(curAo50) : '--')}</strong>
                    <span className="text-brand-gray-400 mx-1">/</span>
                    <span className="text-brand-gray-400">{bestAo50 ? formatTime(bestAo50) : '--'}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Subsection 4: Consistency */}
            <div>
              <span className="text-[10px] font-black text-brand-gray-400 uppercase tracking-wider block mb-2">🎯 穩定性與散佈</span>
              <div className="grid grid-cols-2 gap-2 text-xs font-sans">
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 flex justify-between items-center">
                  <span className="text-brand-gray-500">標準差 (SD)</span>
                  <span className="font-mono font-bold text-black dark:text-white">{sd ? `${(sd / 1000).toFixed(2)}s` : '--'}</span>
                </div>
                <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 flex justify-between items-center">
                  <span className="text-brand-gray-500">分佈極差</span>
                  <span className="font-mono font-bold text-black dark:text-white">{rangeTime ? `${(rangeTime / 1000).toFixed(2)}s` : '--'}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2.5 border-t border-brand-gray-100 dark:border-brand-gray-900 text-[9px] text-brand-gray-400">
            * 當前滾動平均 (左) / 當前分組最佳平均 (右)
          </div>
        </BentoCard>

        {/* Calendar Heatmap Block */}
        <BentoCard colSpan="md:col-span-3 lg:col-span-6" className="calendar-card transition-all duration-300">
          <CalendarHeatmap solves={solves} />
        </BentoCard>

        {/* Recent Solves Block */}
        <BentoCard colSpan="md:col-span-3 lg:col-span-6" className="flex flex-col justify-between history-card transition-all duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gray-400 dark:text-brand-gray-500">最近練習 ({puzzleType.toUpperCase()})</span>
                <h2 className="text-xl font-black mt-1">RECENT SOLVES</h2>
              </div>
              <History className="w-5 h-5 text-brand-gray-400" />
            </div>

            <div className="space-y-2">
              {getRecentSolves().length === 0 ? (
                <div className="text-center py-8 text-xs text-brand-gray-400">
                  本分組尚無練習紀錄，開始轉動吧！
                </div>
              ) : (
                getRecentSolves().map((solve, i) => {
                  let timeDisplay = formatTime(solve.time_ms)
                  if (solve.penalty === '+2') timeDisplay += ' (+2)'
                  if (solve.penalty === 'DNF') timeDisplay = 'DNF'
                  
                  return (
                    <div
                      key={solve.id || i}
                      className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-4 py-3 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-900 text-xs"
                    >
                      <div className="font-mono">
                        <span className="font-bold text-sm block">
                          {timeDisplay}
                        </span>
                        <span className="text-[10px] text-brand-gray-400 block truncate max-w-[200px] md:max-w-xs">
                          {solve.scramble}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-gray-400">
                        {new Date(solve.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )
                })
              )}
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-brand-gray-100 dark:border-brand-gray-900 text-right">
            <span className="text-xs font-bold text-brand-gray-400 hover:text-black dark:hover:text-white cursor-pointer transition-colors">
              前往詳細紀錄頁面 &rarr;
            </span>
          </div>
        </BentoCard>

        {/* QR Share & Installation Block */}
        <BentoCard colSpan="md:col-span-6 lg:col-span-12" className="share-card transition-all duration-300">
          <QRShare />
        </BentoCard>
      </BentoGrid>
    </div>
  )
}

export default Home
