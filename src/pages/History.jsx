import React, { useState, useEffect } from 'react'
import { BentoGrid, BentoCard } from '../components/BentoGrid'
import CalendarHeatmap from '../components/CalendarHeatmap'
import { fetchSolvesFromDb, deleteSolveFromDb, updateSolvePenaltyInDb, deleteMultipleSolvesFromDb, saveSolveToDb } from '../utils/db'
import { formatTime } from '../components/Timer'
import { WCA_PUZZLES } from '../utils/scrambler'
import { Search, Trash2, BarChart3, Download, Layers, Plus, X, CheckSquare, Square } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const parseManualTime = (input) => {
  const clean = input.trim()
  if (!clean) return null

  // Format: MM:SS.hh
  if (clean.includes(':')) {
    const parts = clean.split(':')
    const minutes = parseInt(parts[0], 10) || 0
    const secParts = parts[1].split('.')
    const seconds = parseInt(secParts[0], 10) || 0
    let centiseconds = 0
    if (secParts[1]) {
      const msStr = secParts[1].padEnd(2, '0').slice(0, 2)
      centiseconds = parseInt(msStr, 10) || 0
    }
    return (minutes * 60 + seconds) * 1000 + centiseconds * 10
  }

  // Format: SS.hh
  if (clean.includes('.')) {
    const parts = clean.split('.')
    const seconds = parseInt(parts[0], 10) || 0
    let centiseconds = 0
    if (parts[1]) {
      const msStr = parts[1].padEnd(2, '0').slice(0, 2)
      centiseconds = parseInt(msStr, 10) || 0
    }
    return seconds * 1000 + centiseconds * 10
  }

  // Format: Raw numbers (e.g. 1234 -> 12.34s)
  const rawNum = parseInt(clean, 10)
  if (!isNaN(rawNum)) {
    if (clean.length <= 2) {
      return rawNum * 1000
    } else {
      const seconds = parseInt(clean.slice(0, -2), 10) || 0
      const centiseconds = parseInt(clean.slice(-2), 10) || 0
      return seconds * 1000 + centiseconds * 10
    }
  }

  return null;
}

const History = () => {
  const [solves, setSolves] = useState([])
  const [loading, setLoading] = useState(true)
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPenalty, setFilterPenalty] = useState('ALL') // 'ALL', 'NONE', '+2', 'DNF'
  const [filterPuzzle, setFilterPuzzle] = useState('ALL') // 'ALL' or specific WCA code
  const [filterSession, setFilterSession] = useState('ALL') // 'ALL' or specific session ID
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  // Batch selection states
  const [selectedIds, setSelectedIds] = useState([])

  // Manual record add states
  const [showAddModal, setShowAddModal] = useState(false)
  const [manualTime, setManualTime] = useState('')
  const [manualScramble, setManualScramble] = useState('')
  const [manualPuzzle, setManualPuzzle] = useState('333')
  const [manualSession, setManualSession] = useState('1')
  const [manualPenalty, setManualPenalty] = useState('none')

  // Load session names
  const [sessions, setSessions] = useState(() => {
    const local = localStorage.getItem('cube_sessions')
    return local ? JSON.parse(local) : [
      { id: '1', name: '階段 1' },
      { id: '2', name: '階段 2' }
    ]
  })

  const { user } = useAuth()

  useEffect(() => {
    loadSolves()
    // Refresh sessions from storage
    const local = localStorage.getItem('cube_sessions')
    if (local) setSessions(JSON.parse(local))
  }, [user])

  const loadSolves = async () => {
    setLoading(true)
    const data = await fetchSolvesFromDb()
    setSolves(data)
    setLoading(false)
  }

  const handleDeleteSolve = async (id) => {
    if (confirm('確認要刪除這筆計時紀錄嗎？此動作無法復原。')) {
      await deleteSolveFromDb(id)
      setSolves((prev) => prev.filter((s) => s.id !== id))
      setSelectedIds((prev) => prev.filter(x => x !== id))
    }
  }

  const handlePenaltyChange = async (id, penalty) => {
    await updateSolvePenaltyInDb(id, penalty)
    setSolves((prev) => prev.map((s) => (s.id === id ? { ...s, penalty } : s)))
  }

  const handleClearAll = async () => {
    if (confirm('⚠️ 警告：確定要清空所有練習紀錄嗎？此動作將會刪除您本專案下的所有計時歷史。')) {
      if (confirm('再次確認：您真的要刪除全部數據嗎？')) {
        localStorage.removeItem('cube_solves')
        setSolves([])
        setSelectedIds([])
        alert('已清空所有本地練習紀錄！')
      }
    }
  }

  // Clear only currently filtered solves
  const handleClearFiltered = async () => {
    if (filteredSolves.length === 0) {
      alert('當前篩選條件下沒有任何成績紀錄可供清空！')
      return
    }

    const sessionName = filterSession === 'ALL' ? '全部分組' : getSessionName(filterSession)
    const puzzleName = filterPuzzle === 'ALL' ? '全部項目' : filterPuzzle.toUpperCase()

    if (confirm(`⚠️ 確定要清空當前篩選條件下的所有紀錄嗎？\n這將會刪除「${sessionName}」中「${puzzleName}」項目共 ${filteredSolves.length} 筆成績，此動作無法復原！`)) {
      const idsToClear = filteredSolves.map(s => s.id)
      await deleteMultipleSolvesFromDb(idsToClear)
      setSolves((prev) => prev.filter(s => !idsToClear.includes(s.id)))
      setSelectedIds((prev) => prev.filter(id => !idsToClear.includes(id)))
      alert('已成功清空符合篩選條件的紀錄！')
    }
  }

  // Batch delete logic
  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return
    if (confirm(`確定要刪除選取的 ${selectedIds.length} 筆練習成績嗎？此操作不可逆。`)) {
      await deleteMultipleSolvesFromDb(selectedIds)
      setSolves((prev) => prev.filter(s => !selectedIds.includes(s.id)))
      setSelectedIds([])
    }
  }

  // Checkbox toggle helpers
  const handleToggleSelectRow = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const handleToggleSelectAll = (visibleSolves) => {
    const visibleIds = visibleSolves.map(s => s.id)
    const allSelected = visibleIds.every(id => selectedIds.includes(id))
    
    if (allSelected) {
      // Unselect all visible
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)))
    } else {
      // Select all visible
      setSelectedIds(prev => {
        const union = new Set([...prev, ...visibleIds])
        return Array.from(union)
      })
    }
  }

  // Manual record submit
  const handleManualAddSubmit = async (e) => {
    e.preventDefault()
    const parsed = parseManualTime(manualTime)
    if (parsed === null) {
      alert('請輸入有效的時間格式，例如 12.34 或 1234')
      return
    }

    const newSolve = {
      time_ms: parsed,
      scramble: manualScramble.trim() || '手動輸入 (No Scramble)',
      penalty: manualPenalty,
      puzzle_type: manualPuzzle,
      session_id: manualSession,
      created_at: new Date().toISOString()
    }

    const saved = await saveSolveToDb(newSolve)
    setSolves(prev => [...prev, saved])
    setShowAddModal(false)
    
    // Clear inputs
    setManualTime('')
    setManualScramble('')
    setManualPenalty('none')
  }

  // Export data as JSON
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(solves, null, 2))
    const downloadAnchor = document.createElement('a')
    downloadAnchor.setAttribute("href", dataStr)
    downloadAnchor.setAttribute("download", `zencube_solves_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(downloadAnchor)
    downloadAnchor.click()
    downloadAnchor.remove()
  }

  // Export data as CSV
  const handleExportCSV = () => {
    const headers = ['id', 'puzzle_type', 'session_id', 'time_ms', 'scramble', 'penalty', 'created_at']
    const rows = solves.map(s => [
      s.id,
      s.puzzle_type,
      s.session_id || '1',
      s.time_ms,
      `"${s.scramble.replace(/"/g, '""')}"`,
      s.penalty,
      s.created_at
    ])
    
    const csvContent = [
      headers.join(','), 
      ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `zencube_solves_ml_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
  }

  // Filter and Search logic
  const filteredSolves = [...solves].reverse().filter((s) => {
    const matchesSearch = s.scramble.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesPenalty = 
      filterPenalty === 'ALL' ? true :
      filterPenalty === 'NONE' ? s.penalty === 'none' :
      filterPenalty === '+2' ? s.penalty === '+2' :
      s.penalty === 'DNF'
    
    const matchesPuzzle = filterPuzzle === 'ALL' ? true : s.puzzle_type === filterPuzzle
    const matchesSession = filterSession === 'ALL' ? true : (s.session_id || '1') === filterSession
      
    return matchesSearch && matchesPenalty && matchesPuzzle && matchesSession
  })

  // Pagination
  const totalPages = Math.ceil(filteredSolves.length / itemsPerPage)
  const paginatedSolves = filteredSolves.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Statistics calculation (based on active puzzle/session filter to make it meaningful!)
  const activePuzzleSolves = solves.filter(s => {
    const matchesPuzzle = filterPuzzle === 'ALL' ? true : s.puzzle_type === filterPuzzle
    const matchesSession = filterSession === 'ALL' ? true : (s.session_id || '1') === filterSession
    return matchesPuzzle && matchesSession
  })
  
  const validSolvesList = activePuzzleSolves.filter(s => s.penalty !== 'DNF')
  const totalCount = activePuzzleSolves.length
  const dnfCount = activePuzzleSolves.filter(s => s.penalty === 'DNF').length
  const dnfRate = totalCount > 0 ? Math.round((dnfCount / totalCount) * 100) : 0

  const solveTimes = validSolvesList.map(s => s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms)
  const bestTime = solveTimes.length > 0 ? Math.min(...solveTimes) : null
  const worstTime = solveTimes.length > 0 ? Math.max(...solveTimes) : null
  const sessionMean = solveTimes.length > 0 ? Math.round(solveTimes.reduce((a, b) => a + b, 0) / solveTimes.length) : null

  // Get active session display name
  const getSessionName = (id) => {
    return sessions.find(s => s.id === id)?.name || `分組 ${id}`
  }

  const allVisibleSelected = paginatedSolves.length > 0 && paginatedSolves.every(s => selectedIds.includes(s.id))

  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 font-sans">
        <div>
          <h1 className="text-3xl font-black tracking-tight">練習紀錄看板</h1>
          <p className="text-xs text-brand-gray-400 font-semibold uppercase tracking-wider mt-1">
            資料儲存在瀏覽器快取與 Supabase，支援 CSV 機器學習格式匯出與批量刪除
          </p>
        </div>
        <div className="flex flex-wrap gap-2 self-start md:self-auto select-none">
          <button
            onClick={() => setShowAddModal(true)}
            className="py-2.5 px-4 bg-black text-white dark:bg-white dark:text-black hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm btn-active-scale"
          >
            <Plus className="w-4 h-4" />
            手動新增紀錄
          </button>
          
          <button
            onClick={handleExportCSV}
            className="py-2.5 px-4 bg-brand-gray-50 hover:bg-brand-gray-100 dark:bg-brand-gray-950 dark:hover:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors btn-active-scale"
          >
            <Download className="w-3.5 h-3.5" />
            匯出 CSV (機器學習)
          </button>
          
          <button
            onClick={handleExportJSON}
            className="py-2.5 px-4 bg-brand-gray-50 hover:bg-brand-gray-100 dark:bg-brand-gray-950 dark:hover:bg-brand-gray-900 border border-brand-gray-200 dark:border-brand-gray-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors btn-active-scale"
          >
            JSON 備份
          </button>
          
          <button
            onClick={handleClearAll}
            className="py-2.5 px-4 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 rounded-xl font-bold text-xs transition-colors btn-active-scale"
          >
            清空全部
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <BentoGrid>
        {/* Heatmap Widget */}
        <BentoCard colSpan="md:col-span-6 lg:col-span-8">
          <CalendarHeatmap solves={solves} />
        </BentoCard>

        {/* Detailed Stats Panel */}
        <BentoCard colSpan="md:col-span-6 lg:col-span-4" className="flex flex-col justify-between font-sans">
          <div>
            <h3 className="text-sm text-brand-gray-500 font-extrabold uppercase tracking-wider mb-3 flex items-center gap-1">
              <BarChart3 className="w-4 h-4 text-brand-gray-400" />
              指標分析 ({filterPuzzle === 'ALL' ? '全部項目' : filterPuzzle.toUpperCase()})
            </h3>
            <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray-400 block font-bold">總次數</span>
                <span className="text-lg font-black font-mono">{totalCount} 次</span>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray-400 block font-bold">最佳單次</span>
                <span className="text-lg font-black font-mono text-green-500">{bestTime ? formatTime(bestTime) : '--'}</span>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray-400 block font-bold">平均值 (Mean)</span>
                <span className="text-lg font-black font-mono">{sessionMean ? formatTime(sessionMean) : '--'}</span>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray-400 block font-bold">最慢單次</span>
                <span className="text-lg font-black font-mono">{worstTime ? formatTime(worstTime) : '--'}</span>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray-400 block font-bold">DNF 總數</span>
                <span className="text-lg font-black font-mono text-red-500">{dnfCount} 次</span>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                <span className="text-[10px] text-brand-gray-400 block font-bold">DNF 佔比率</span>
                <span className="text-lg font-black font-mono">{dnfRate}%</span>
              </div>
            </div>
          </div>
          <div className="text-[10px] text-brand-gray-400 pt-3 border-t border-brand-gray-100 dark:border-brand-gray-900 mt-4">
            * 篩選特定的項目或分組以查閱統計資訊。
          </div>
        </BentoCard>

        {/* Detailed Search and Table */}
        <BentoCard colSpan="md:col-span-6 lg:col-span-12">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-center mb-6 font-sans">
            <div className="w-full lg:w-72 relative">
              <Search className="w-4 h-4 text-brand-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="搜尋打亂步驟 (Scramble)..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none"
              />
            </div>
            
            <div className="flex flex-wrap gap-2 w-full lg:w-auto items-center">
              {/* Batch Action Button */}
              {selectedIds.length > 0 && (
                <button
                  onClick={handleBatchDelete}
                  className="py-2 px-3.5 bg-red-50 dark:bg-red-950/20 text-red-500 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors border border-red-200 dark:border-red-900 shadow-sm animate-in fade-in slide-in-from-left-2 duration-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  刪除選取 ({selectedIds.length})
                </button>
              )}

              {/* Clear Filtered Solves Button */}
              {filteredSolves.length > 0 && (
                <button
                  onClick={handleClearFiltered}
                  className="py-2 px-3.5 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 text-red-500 rounded-full font-bold text-xs flex items-center gap-1.5 transition-colors border border-red-200 dark:border-red-900 shadow-sm"
                >
                  清空篩選結果 ({filteredSolves.length})
                </button>
              )}

              {/* Session Filter */}
              <div className="flex items-center gap-1.5 bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-2 rounded-2xl border border-brand-gray-250 dark:border-brand-gray-900 text-xs">
                <span className="text-brand-gray-400 font-bold">分組:</span>
                <select
                  value={filterSession}
                  onChange={(e) => { setFilterSession(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none font-bold focus:outline-none text-black dark:text-white"
                >
                  <option value="ALL">全部階段</option>
                  {sessions.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Puzzle Filter */}
              <div className="flex items-center gap-1.5 bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-2 rounded-2xl border border-brand-gray-250 dark:border-brand-gray-900 text-xs">
                <Layers className="w-3.5 h-3.5 text-brand-gray-500" />
                <select
                  value={filterPuzzle}
                  onChange={(e) => { setFilterPuzzle(e.target.value); setCurrentPage(1); }}
                  className="bg-transparent border-none font-bold focus:outline-none text-black dark:text-white"
                >
                  <option value="ALL">全部項目</option>
                  {WCA_PUZZLES.map(p => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Penalty Filter */}
              <div className="flex gap-1 bg-brand-gray-50 dark:bg-brand-gray-950 p-1.5 rounded-2xl border border-brand-gray-250 dark:border-brand-gray-900 overflow-x-auto">
                {['ALL', 'NONE', '+2', 'DNF'].map((p) => (
                  <button
                    key={p}
                    onClick={() => { setFilterPenalty(p); setCurrentPage(1); }}
                    className={`py-1 px-3.5 rounded-xl text-xs font-bold transition-all ${
                      filterPenalty === p
                        ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                        : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
                    }`}
                  >
                    {p === 'ALL' ? '全部' : p === 'NONE' ? '正常' : p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto select-none">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-brand-gray-200 dark:border-brand-gray-800 text-[10px] text-brand-gray-400 uppercase font-bold tracking-wider">
                  <th className="py-3 px-4 w-12 text-center">
                    <button 
                      onClick={() => handleToggleSelectAll(paginatedSolves)}
                      className="text-brand-gray-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      {allVisibleSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="py-3 px-4 w-14">#</th>
                  <th className="py-3 px-4 w-20">項目</th>
                  <th className="py-3 px-4 w-24">階段分組</th>
                  <th className="py-3 px-4 w-28">計時成績</th>
                  <th className="py-3 px-4">打亂步驟 (Scramble)</th>
                  <th className="py-3 px-4 w-36">練習日期</th>
                  <th className="py-3 px-4 w-28">懲罰設置</th>
                  <th className="py-3 px-4 w-12 text-center">刪除</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-gray-150 dark:divide-brand-gray-900 font-sans">
                {paginatedSolves.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-brand-gray-400">
                      沒有符合篩選條件的練習紀錄。
                    </td>
                  </tr>
                ) : (
                  paginatedSolves.map((solve, i) => {
                    const indexNum = filteredSolves.length - ((currentPage - 1) * itemsPerPage + i)
                    let timeDisplay = formatTime(solve.time_ms)
                    if (solve.penalty === '+2') timeDisplay += ' (+2)'
                    if (solve.penalty === 'DNF') timeDisplay = 'DNF'
                    
                    const isSelected = selectedIds.includes(solve.id)

                    return (
                      <tr key={solve.id} className={`hover:bg-brand-gray-50/50 dark:hover:bg-brand-gray-950/20 transition-colors ${isSelected ? 'bg-brand-gray-50/50 dark:bg-brand-gray-950/30' : ''}`}>
                        <td className="py-3.5 px-4 text-center">
                          <button 
                            onClick={() => handleToggleSelectRow(solve.id)}
                            className={`${isSelected ? 'text-black dark:text-white' : 'text-brand-gray-300 hover:text-brand-gray-400 dark:text-brand-gray-700'}`}
                          >
                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-brand-gray-400">{indexNum}</td>
                        <td className="py-3.5 px-4 font-bold uppercase">{solve.puzzle_type}</td>
                        <td className="py-3.5 px-4 text-brand-gray-500 font-semibold">{getSessionName(solve.session_id || '1')}</td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-sm">{timeDisplay}</td>
                        <td className="py-3.5 px-4 font-mono text-brand-gray-500 dark:text-brand-gray-400 break-all select-all">{solve.scramble}</td>
                        <td className="py-3.5 px-4 text-brand-gray-400">
                          {new Date(solve.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex gap-1">
                            <button
                              onClick={() => handlePenaltyChange(solve.id, solve.penalty === '+2' ? 'none' : '+2')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                solve.penalty === '+2'
                                  ? 'bg-black text-white dark:bg-white dark:text-black'
                                  : 'bg-white dark:bg-black border-brand-gray-250 dark:border-brand-gray-800 text-black dark:text-white'
                              }`}
                            >
                              +2
                            </button>
                            <button
                              onClick={() => handlePenaltyChange(solve.id, solve.penalty === 'DNF' ? 'none' : 'DNF')}
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                solve.penalty === 'DNF'
                                  ? 'bg-red-500 text-white border-red-500'
                                  : 'bg-white dark:bg-black border-brand-gray-250 dark:border-brand-gray-800 text-black dark:text-white'
                              }`}
                            >
                              DNF
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <button
                            onClick={() => handleDeleteSolve(solve.id)}
                            className="p-1 text-brand-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6 pt-4 border-t border-brand-gray-150 dark:border-brand-gray-900 text-xs font-sans">
              <span className="text-brand-gray-400">第 {currentPage} 頁，共 {totalPages} 頁</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-brand-gray-200 dark:border-brand-gray-800 rounded-lg hover:bg-brand-gray-50 dark:hover:bg-brand-gray-950 disabled:opacity-50"
                >
                  上一頁
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1.5 border border-brand-gray-200 dark:border-brand-gray-800 rounded-lg hover:bg-brand-gray-50 dark:hover:bg-brand-gray-950 disabled:opacity-50"
                >
                  下一頁
                </button>
              </div>
            </div>
          )}
        </BentoCard>
      </BentoGrid>

      {/* Manual Solve Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200 text-xs font-sans">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-black text-black dark:text-white">手動新增練習紀錄</h2>
              <button onClick={() => setShowAddModal(false)} className="text-brand-gray-400 hover:text-black dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualAddSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">還原時間 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：12.58 或 1258 (代 12.58s) 或 1:02.50"
                  value={manualTime}
                  onChange={(e) => setManualTime(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">打亂步驟 (Scramble)</label>
                <input
                  type="text"
                  placeholder="例如：R U R' U'... (非必填)"
                  value={manualScramble}
                  onChange={(e) => setManualScramble(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">項目 *</label>
                  <select
                    value={manualPuzzle}
                    onChange={(e) => setManualPuzzle(e.target.value)}
                    className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none text-black dark:text-white"
                  >
                    {WCA_PUZZLES.map(p => (
                      <option key={p.code} value={p.code}>{p.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">歸屬分組 *</label>
                  <select
                    value={manualSession}
                    onChange={(e) => setManualSession(e.target.value)}
                    className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none text-black dark:text-white"
                  >
                    {sessions.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">懲罰狀態 *</label>
                <select
                  value={manualPenalty}
                  onChange={(e) => setManualPenalty(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none text-black dark:text-white"
                >
                  <option value="none">無懲罰 (None)</option>
                  <option value="+2">+2 秒懲罰</option>
                  <option value="DNF">DNF (未完成)</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 px-4 border border-brand-gray-200 dark:border-brand-gray-800 rounded-xl font-bold text-center hover:bg-brand-gray-50 dark:hover:bg-brand-gray-950 transition-colors"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl text-center hover:opacity-90 transition-opacity"
                >
                  確認新增
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default History
