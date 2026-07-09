import React, { useState, useEffect, useRef } from 'react'
import cspData from '../data/SQ1-CSP.json'
import { Award, Layers, HelpCircle, Eye, EyeOff, RotateCw, Play, BarChart2, Trash2, Clock, Check, X } from 'lucide-react'
import { formatTime } from '../components/Timer'

const CspTrainer = () => {
  // Subsets filtering
  const [selectedSubsets, setSelectedSubsets] = useState(cspData.subsets || [])
  const [activeCaseName, setActiveCaseName] = useState('')
  const [showSolution, setShowSolution] = useState(false)

  // Timer states
  const [time, setTime] = useState(0)
  const [timerState, setTimerState] = useState('idle') // 'idle', 'holding', 'ready', 'running', 'stopped'
  const stateRef = useRef('idle')

  // History & stats
  const [practiceSolves, setPracticeSolves] = useState(() => {
    const local = localStorage.getItem('cube_csp_solves')
    return local ? JSON.parse(local) : []
  })

  const holdTimerRef = useRef(null)
  const timerRef = useRef(null)
  const startTimeRef = useRef(0)

  // Save history to localStorage
  useEffect(() => {
    localStorage.setItem('cube_csp_solves', JSON.stringify(practiceSolves))
  }, [practiceSolves])

  // Get all cases matching selected subsets
  const getFilteredCases = () => {
    const cases = {}
    if (!cspData.cases) return cases
    Object.entries(cspData.cases).forEach(([name, data]) => {
      if (selectedSubsets.includes(data.subset)) {
        cases[name] = data
      }
    })
    return cases
  }

  const filteredCases = getFilteredCases()
  const caseNames = Object.keys(filteredCases)

  // Load a random case
  const loadRandomCase = () => {
    if (caseNames.length === 0) {
      setActiveCaseName('')
      return
    }
    // Avoid repeating the same case in a row if there are multiple choices
    let nextCase = activeCaseName
    while (nextCase === activeCaseName && caseNames.length > 1) {
      nextCase = caseNames[Math.floor(Math.random() * caseNames.length)]
    }
    if (caseNames.length === 1) {
      nextCase = caseNames[0]
    }
    setActiveCaseName(nextCase)
    setShowSolution(false)
    setTime(0)
    setTimerState('idle')
    stateRef.current = 'idle'
  }

  // Load first random case on mount or filter change
  useEffect(() => {
    if (!activeCaseName || !filteredCases[activeCaseName]) {
      loadRandomCase()
    }
  }, [selectedSubsets])

  const toggleSubset = (subset) => {
    setSelectedSubsets(prev => 
      prev.includes(subset)
        ? prev.filter(s => s !== subset)
        : [...prev, subset]
    )
  }

  const activeCaseData = activeCaseName ? filteredCases[activeCaseName] : null

  // Timer Core logic using synchronized Ref to prevent race conditions
  const handleStartTrigger = () => {
    if (stateRef.current === 'running') {
      stopTimer()
      return
    }

    if (stateRef.current === 'idle') {
      stateRef.current = 'holding'
      setTimerState('holding')
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      holdTimerRef.current = setTimeout(() => {
        stateRef.current = 'ready'
        setTimerState('ready')
      }, 450)
    }
  }

  const handleReleaseTrigger = () => {
    if (stateRef.current === 'ready') {
      startTimer()
    } else if (stateRef.current === 'holding') {
      stateRef.current = 'idle'
      setTimerState('idle')
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }

  const startTimer = () => {
    startTimeRef.current = performance.now()
    stateRef.current = 'running'
    setTimerState('running')

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTime(performance.now() - startTimeRef.current)
    }, 10)
  }

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    stateRef.current = 'stopped'
    setTimerState('stopped')
    setTime(Math.round(performance.now() - startTimeRef.current))
  }

  // Keyboard hooks
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return
      if (e.code === 'Space') {
        e.preventDefault()
        handleStartTrigger()
      }
    }

    const handleKeyUp = (e) => {
      if (e.code === 'Space') {
        e.preventDefault()
        handleReleaseTrigger()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [activeCaseName])

  // Mouse / Touch triggers
  const handleMouseDown = (e) => {
    if (e.button !== 0 || timerState === 'stopped') return
    handleStartTrigger()
  }

  const handleMouseUp = (e) => {
    if (e.button !== 0 || timerState === 'stopped') return
    handleReleaseTrigger()
  }

  const handleTouchStart = (e) => {
    if (timerState === 'stopped') return
    e.preventDefault()
    handleStartTrigger()
  }

  const handleTouchEnd = (e) => {
    if (timerState === 'stopped') return
    e.preventDefault()
    handleReleaseTrigger()
  }

  // Record practice results
  const recordResult = (status) => {
    const newSolve = {
      id: Date.now().toString(),
      caseName: activeCaseName,
      subset: activeCaseData?.subset,
      time_ms: time,
      status: status, // 'success' or 'dnf'
      created_at: new Date().toISOString()
    }
    setPracticeSolves(prev => [newSolve, ...prev])
    loadRandomCase()
  }

  const handleDeleteSolve = (id) => {
    setPracticeSolves(prev => prev.filter(s => s.id !== id))
  }

  const handleClearHistory = () => {
    if (confirm('確定要清空本次 CSP 訓練的所有成績紀錄嗎？')) {
      setPracticeSolves([])
    }
  }

  // Calculate stats based on current filters
  const currentCaseSolves = practiceSolves.filter(s => selectedSubsets.includes(s.subset))
  const successSolves = currentCaseSolves.filter(s => s.status === 'success')
  
  const successRate = currentCaseSolves.length > 0 
    ? Math.round((successSolves.length / currentCaseSolves.length) * 100) 
    : 0

  const bestTime = successSolves.length > 0 
    ? Math.min(...successSolves.map(s => s.time_ms)) 
    : null

  const averageTime = successSolves.length > 0
    ? Math.round(successSolves.reduce((acc, s) => acc + s.time_ms, 0) / successSolves.length)
    : null

  const getTimerColorClass = () => {
    if (timerState === 'holding') return 'text-red-500 animate-pulse'
    if (timerState === 'ready') return 'text-green-500'
    return 'text-black dark:text-white'
  }

  // Get algorithm string
  const getAlgString = () => {
    if (!activeCaseData?.algs) return ''
    return Object.keys(activeCaseData.algs)[0] || ''
  }

  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-6 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">SQ1 CSP 專門訓練區</h1>
          <p className="text-xs text-brand-gray-400 font-semibold uppercase tracking-wider mt-1">
            Square-1 Cubeshape Parity 觀察與還原速度計時訓練
          </p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Filter and Case selector */}
        <div className="lg:col-span-4 bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 space-y-6">
          <div>
            <h2 className="text-sm font-extrabold uppercase tracking-widest text-brand-gray-400 mb-3 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-brand-gray-500" />
              篩選斜切次數 (Subsets)
            </h2>
            <div className="flex flex-wrap gap-2">
              {cspData.subsets?.map(subset => {
                const isActive = selectedSubsets.includes(subset)
                return (
                  <button
                    key={subset}
                    onClick={() => toggleSubset(subset)}
                    className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all border ${
                      isActive
                        ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                        : 'bg-brand-gray-50 border-brand-gray-200 dark:bg-brand-gray-950 dark:border-brand-gray-900 text-brand-gray-500'
                    }`}
                  >
                    {subset}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="border-t border-brand-gray-150 dark:border-brand-gray-900 pt-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-sm font-extrabold uppercase tracking-widest text-brand-gray-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-brand-gray-500" />
                篩選列表 ({caseNames.length} 個 Cases)
              </h2>
            </div>
            
            <div className="max-h-72 overflow-y-auto pr-1 space-y-1 text-xs">
              {caseNames.length === 0 ? (
                <div className="text-center py-8 text-brand-gray-400">請至少勾選一個 Subset！</div>
              ) : (
                caseNames.map(name => {
                  const isActive = name === activeCaseName
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        setActiveCaseName(name)
                        setShowSolution(false)
                        setTime(0)
                        setTimerState('idle')
                        stateRef.current = 'idle'
                      }}
                      className={`w-full text-left py-2.5 px-4 rounded-xl font-bold transition-colors truncate ${
                        isActive
                          ? 'bg-brand-gray-50 dark:bg-brand-gray-950 text-black dark:text-white border-l-4 border-black dark:border-white'
                          : 'text-brand-gray-500 hover:bg-brand-gray-50/50 dark:hover:bg-brand-gray-950/20'
                      }`}
                    >
                      {name}
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Timer & Quiz View */}
        <div className="lg:col-span-8 space-y-6">
          {activeCaseData ? (
            <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
              
              {/* Case information */}
              <div className="text-center space-y-1 z-10">
                <span className="px-3 py-1 bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-full text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">
                  {activeCaseData.subset}
                </span>
                <h2 className="text-2xl font-black text-black dark:text-white mt-2">{activeCaseName}</h2>
              </div>

              {/* SVG Diagrams */}
              <div className="flex gap-8 justify-center my-6 z-10">
                <div className="flex flex-col items-center bg-brand-gray-50 dark:bg-brand-gray-950/40 p-4 rounded-3xl border border-brand-gray-100 dark:border-brand-gray-900">
                  <span className="text-[9px] text-brand-gray-400 uppercase tracking-widest font-black mb-2">U 層 (Top)</span>
                  <div dangerouslySetInnerHTML={{ __html: activeCaseData.svgTop }} className="w-16 h-16 dark:invert-colors" />
                </div>
                
                <div className="flex flex-col items-center bg-brand-gray-50 dark:bg-brand-gray-950/40 p-4 rounded-3xl border border-brand-gray-100 dark:border-brand-gray-900">
                  <span className="text-[9px] text-brand-gray-400 uppercase tracking-widest font-black mb-2">D 層 (Bottom)</span>
                  <div dangerouslySetInnerHTML={{ __html: activeCaseData.svgBottom }} className="w-16 h-16 dark:invert-colors" />
                </div>
              </div>

              {/* Large Timer Display */}
              <div 
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="w-full flex flex-col items-center justify-center min-h-[160px] cursor-pointer select-none"
              >
                {timerState === 'stopped' ? (
                  <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-200 z-10">
                    <span className="text-6xl md:text-7xl font-black font-mono text-black dark:text-white">
                      {formatTime(time)}
                    </span>
                    <div className="flex gap-3 justify-center">
                      <button
                        onClick={() => recordResult('success')}
                        className="py-2.5 px-5 bg-green-500 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 btn-active-scale"
                      >
                        <Check className="w-4 h-4" />
                        還原成功 (Space)
                      </button>
                      <button
                        onClick={() => recordResult('dnf')}
                        className="py-2.5 px-5 bg-red-500 text-white rounded-full font-bold text-xs flex items-center gap-1.5 shadow-sm hover:opacity-90 btn-active-scale"
                      >
                        <X className="w-4 h-4" />
                        失敗 (DNF)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center space-y-2 z-10">
                    <span className={`text-6xl md:text-8xl font-black font-mono tracking-tighter ${getTimerColorClass()}`}>
                      {formatTime(time)}
                    </span>
                    <p className="text-[10px] text-brand-gray-400 uppercase tracking-widest font-bold">
                      {timerState === 'ready' ? '放開以啟動計時！' : '按住 [空白鍵] 或 [點擊卡片] 開始'}
                    </p>
                  </div>
                )}
              </div>

              {/* Solution display / action buttons */}
              <div className="w-full flex flex-col items-center mt-4 border-t border-brand-gray-100 dark:border-brand-gray-900 pt-4 z-10">
                {showSolution ? (
                  <div className="text-center space-y-1.5 animate-in fade-in slide-in-from-bottom-2 duration-200">
                    <span className="text-[9px] text-brand-gray-400 uppercase tracking-widest font-black block">CSP 解法公式 (Cubeshape Alg)</span>
                    <strong className="text-sm font-mono font-bold text-black dark:text-white px-4 py-2 bg-brand-gray-50 dark:bg-brand-gray-950 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 block break-all select-all">
                      {getAlgString()}
                    </strong>
                    <button
                      onClick={() => setShowSolution(false)}
                      className="text-[10px] font-bold text-brand-gray-400 hover:text-black dark:hover:text-white underline mt-1.5 block mx-auto"
                    >
                      隱藏公式
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowSolution(true)}
                      className="py-2 px-3.5 bg-brand-gray-50 hover:bg-brand-gray-100 dark:bg-brand-gray-950 dark:hover:bg-brand-gray-900 border border-brand-gray-250 dark:border-brand-gray-800 rounded-full font-bold text-xs text-brand-gray-500 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      顯示 CSP 公式
                    </button>
                    <button
                      onClick={loadRandomCase}
                      className="py-2 px-3.5 bg-brand-gray-50 hover:bg-brand-gray-100 dark:bg-brand-gray-950 dark:hover:bg-brand-gray-900 border border-brand-gray-250 dark:border-brand-gray-800 rounded-full font-bold text-xs text-brand-gray-500 flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      跳過 / 換一題
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-8 flex items-center justify-center min-h-[460px] text-brand-gray-400">
              請在左側選取至少一個 Subset 以開始 CSP 訓練！
            </div>
          )}

          {/* Practice stats and Logs */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Quick Session Stats */}
            <div className="md:col-span-5 bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 flex flex-col justify-between">
              <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-gray-400 flex items-center gap-1.5 border-b border-brand-gray-100 dark:border-brand-gray-900 pb-3">
                <BarChart2 className="w-4 h-4 text-brand-gray-500" />
                本次練習統計
              </h3>
              
              <div className="space-y-3.5 my-4 text-xs">
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3.5 py-2.5 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-semibold">練習總量</span>
                  <strong className="text-black dark:text-white font-mono">{currentCaseSolves.length} 次</strong>
                </div>
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3.5 py-2.5 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-semibold">成功率</span>
                  <strong className="text-green-500 font-mono">{successRate}%</strong>
                </div>
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3.5 py-2.5 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-semibold">最佳成績</span>
                  <strong className="text-black dark:text-white font-mono">{bestTime ? formatTime(bestTime) : '--'}</strong>
                </div>
                <div className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-3.5 py-2.5 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900">
                  <span className="text-brand-gray-500 font-semibold">成功平均</span>
                  <strong className="text-black dark:text-white font-mono">{averageTime ? formatTime(averageTime) : '--'}</strong>
                </div>
              </div>

              <div className="text-[10px] text-brand-gray-400">
                * 基於左側所選取的 Subsets 成績。
              </div>
            </div>

            {/* Practice Runs Log */}
            <div className="md:col-span-7 bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 flex flex-col justify-between min-h-[280px]">
              <div>
                <div className="flex justify-between items-center border-b border-brand-gray-100 dark:border-brand-gray-900 pb-3 mb-4">
                  <h3 className="text-xs uppercase font-extrabold tracking-widest text-brand-gray-400 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-brand-gray-500" />
                    練習歷史紀錄
                  </h3>
                  {currentCaseSolves.length > 0 && (
                    <button
                      onClick={handleClearHistory}
                      className="text-[10px] font-bold text-red-500 hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      清空紀錄
                    </button>
                  )}
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1 text-xs">
                  {currentCaseSolves.length === 0 ? (
                    <div className="text-center py-10 text-brand-gray-400">
                      尚未進行任何 CSP 還原練習。
                    </div>
                  ) : (
                    currentCaseSolves.slice(0, 10).map((solve) => (
                      <div
                        key={solve.id}
                        className="flex justify-between items-center bg-brand-gray-50 dark:bg-brand-gray-950 px-4 py-2.5 rounded-2xl border border-brand-gray-100 dark:border-brand-gray-900"
                      >
                        <div className="font-mono">
                          <span className="font-bold block text-sm">
                            {solve.status === 'success' ? formatTime(solve.time_ms) : 'DNF'}
                          </span>
                          <span className="text-[9px] text-brand-gray-400 block truncate max-w-[200px]">
                            {solve.caseName} ({solve.subset})
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                            solve.status === 'success' 
                              ? 'bg-green-100 dark:bg-green-950/40 text-green-500' 
                              : 'bg-red-100 dark:bg-red-950/40 text-red-500'
                          }`}>
                            {solve.status === 'success' ? 'Success' : 'DNF'}
                          </span>
                          <button
                            onClick={() => handleDeleteSolve(solve.id)}
                            className="text-brand-gray-400 hover:text-red-500 p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {currentCaseSolves.length > 10 && (
                <div className="text-[10px] text-brand-gray-400 text-right mt-2">
                  僅顯示最近 10 筆練習紀錄。
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default CspTrainer
