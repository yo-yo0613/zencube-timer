import React, { useState, useEffect, useRef } from 'react'
import { RotateCw, Trash2, Keyboard, Layers3, Eye, EyeOff } from 'lucide-react'
import { generateScramble } from '../utils/scrambler'
import CubePreview from './CubePreview'

const formatTime = (ms) => {
  if (ms === Infinity || ms === null) return '--:--'
  const seconds = Math.floor(ms / 1000)
  const remainingMs = Math.floor((ms % 1000) / 10) // 2 decimal places
  
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${String(remainingSeconds).padStart(2, '0')}.${String(remainingMs).padStart(2, '0')}`
  }
  return `${seconds}.${String(remainingMs).padStart(2, '0')}`
}

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

  return null
}

const Timer = ({ onSolveComplete, lastSolve, onDeleteLastSolve, onPenaltyChange, solves = [], puzzleType = '333', activeSession = '1' }) => {
  const [scramble, setScramble] = useState('')
  const [time, setTime] = useState(0)
  
  // displayState: 'idle', 'holding', 'ready', 'running', 'inspection'
  const [displayState, setDisplayState] = useState('idle')
  const [useInspection, setUseInspection] = useState(false)
  const [inspectionCountdown, setInspectionCountdown] = useState(15)

  // Manual Time Entry Mode States
  const [isManualMode, setIsManualMode] = useState(false)
  const [manualTimeInput, setManualTimeInput] = useState('')

  // Multi-phase timing states (分段計時)
  const [totalPhases, setTotalPhases] = useState(1) // 1 = Off, 2, 3, 4 phases
  const [currentPhase, setCurrentPhase] = useState(0)
  const [phaseTimes, setPhaseTimes] = useState([]) // Stores timestamps of split markers in ms

  // Scramble Preview Toggle State
  const [showScramblePreview, setShowScramblePreview] = useState(() => {
    const local = localStorage.getItem('cube_show_scramble_preview')
    return local !== 'false'
  })

  useEffect(() => {
    localStorage.setItem('cube_show_scramble_preview', showScramblePreview)
  }, [showScramblePreview])

  // Refs to avoid race conditions and closure bugs with key/touch listeners
  const stateRef = useRef('idle') // 'idle', 'holding', 'ready', 'running', 'inspection'
  const useInspectionRef = useRef(false)
  const totalPhasesRef = useRef(1)
  const currentPhaseRef = useRef(0)
  const phaseTimesRef = useRef([])

  const timerRef = useRef(null)
  const holdTimerRef = useRef(null)
  const startTimeRef = useRef(0)
  const lastSplitTimeRef = useRef(0)
  const inspectionIntervalRef = useRef(null)

  // Keep refs synchronized with state
  useEffect(() => {
    useInspectionRef.current = useInspection
  }, [useInspection])

  useEffect(() => {
    totalPhasesRef.current = totalPhases
  }, [totalPhases])

  // Regenerate scramble when puzzle type changes
  useEffect(() => {
    setScramble(generateScramble(puzzleType))
  }, [puzzleType])

  // Filter solves by current puzzle type AND active session for statistics
  const currentPuzzleSolves = solves.filter(s => s.puzzle_type === puzzleType && (s.session_id || '1') === activeSession)
  const validSolves = currentPuzzleSolves.filter(s => s.penalty !== 'DNF')
  
  const bestTime = validSolves.length > 0 
    ? Math.min(...validSolves.map(s => s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms)) 
    : null
  
  const getAoN = (n) => {
    if (currentPuzzleSolves.length < n) return null
    const recent = currentPuzzleSolves.slice(-n)
    const dnfCount = recent.filter(s => s.penalty === 'DNF').length
    if (dnfCount >= 2) return 'DNF'

    const times = recent.map(s => s.penalty === 'DNF' ? Infinity : (s.penalty === '+2' ? s.time_ms + 2000 : s.time_ms))
    times.sort((a, b) => a - b)
    
    const trimmed = times.slice(1, -1)
    if (trimmed.includes(Infinity)) return 'DNF'
    
    const sum = trimmed.reduce((acc, t) => acc + t, 0)
    return Math.round(sum / trimmed.length)
  }

  const ao5 = getAoN(5)
  const ao12 = getAoN(12)

  // Core trigger functions using refs to read/write real-time states
  const handleStartTrigger = () => {
    if (isManualMode) return

    if (stateRef.current === 'running') {
      handlePhaseSplit()
      return
    }

    if (stateRef.current === 'idle') {
      if (useInspectionRef.current && inspectionIntervalRef.current === null) {
        startInspection()
      } else {
        stateRef.current = 'holding'
        setDisplayState('holding')
        if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
        holdTimerRef.current = setTimeout(() => {
          stateRef.current = 'ready'
          setDisplayState('ready')
        }, 450)
      }
    } else if (stateRef.current === 'inspection') {
      stateRef.current = 'holding'
      setDisplayState('holding')
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      holdTimerRef.current = setTimeout(() => {
        stateRef.current = 'ready'
        setDisplayState('ready')
      }, 450)
    }
  }

  const handleReleaseTrigger = () => {
    if (isManualMode) return

    if (stateRef.current === 'ready') {
      startTimer()
    } else if (stateRef.current === 'holding') {
      if (inspectionIntervalRef.current !== null) {
        stateRef.current = 'inspection'
        setDisplayState('inspection')
      } else {
        stateRef.current = 'idle'
        setDisplayState('idle')
      }
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
    }
  }

  const startInspection = () => {
    stateRef.current = 'inspection'
    setDisplayState('inspection')
    setInspectionCountdown(15)
    
    if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current)
    inspectionIntervalRef.current = setInterval(() => {
      setInspectionCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(inspectionIntervalRef.current)
          inspectionIntervalRef.current = null
          stateRef.current = 'idle'
          setDisplayState('idle')
          saveSolve(0, 'DNF', [])
          return 15
        }
        return prev - 1
      })
    }, 1000)
  }

  const startTimer = () => {
    if (inspectionIntervalRef.current) {
      clearInterval(inspectionIntervalRef.current)
      inspectionIntervalRef.current = null
    }
    startTimeRef.current = performance.now()
    lastSplitTimeRef.current = performance.now()
    stateRef.current = 'running'
    setDisplayState('running')
    
    currentPhaseRef.current = 0
    setCurrentPhase(0)
    phaseTimesRef.current = []
    setPhaseTimes([])
    
    document.body.classList.add('timer-running')

    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setTime(performance.now() - startTimeRef.current)
    }, 10)
  }

  const handlePhaseSplit = () => {
    const now = performance.now()
    if (now - lastSplitTimeRef.current < 150) return
    lastSplitTimeRef.current = now

    const currentDuration = Math.round(now - startTimeRef.current)
    const phasesCount = totalPhasesRef.current

    if (phasesCount > 1 && currentPhaseRef.current < phasesCount - 1) {
      // Record split marker
      phaseTimesRef.current.push(currentDuration)
      setPhaseTimes([...phaseTimesRef.current])
      currentPhaseRef.current += 1
      setCurrentPhase(currentPhaseRef.current)
    } else {
      // Final phase -> Stop
      stopTimer(currentDuration)
    }
  }

  const stopTimer = (finalDuration) => {
    if (timerRef.current) clearInterval(timerRef.current)
    stateRef.current = 'idle'
    setDisplayState('idle')
    document.body.classList.remove('timer-running')
    
    const endTime = finalDuration || Math.round(performance.now() - startTimeRef.current)
    setTime(endTime)

    const completedPhases = [...phaseTimesRef.current, endTime]
    saveSolve(endTime, 'none', completedPhases)
  }

  const saveSolve = (finalTime, penalty, completedPhases = []) => {
    if (onSolveComplete) {
      onSolveComplete({
        time_ms: finalTime,
        scramble: scramble,
        penalty: penalty,
        puzzle_type: puzzleType,
        session_id: activeSession,
        created_at: new Date().toISOString(),
        notes: completedPhases.length > 1 ? JSON.stringify(completedPhases) : ''
      })
    }
    setScramble(generateScramble(puzzleType))
  }

  // Keyboard Event Listeners
  useEffect(() => {
    if (isManualMode) return

    const handleKeyDown = (e) => {
      // Ignore keypresses if the user is typing in forms/modals
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return

      if (e.code !== 'Space') {
        if (stateRef.current === 'running') {
          e.preventDefault()
          handlePhaseSplit()
        }
        return
      }
      e.preventDefault()
      handleStartTrigger()
    }

    const handleKeyUp = (e) => {
      if (e.code !== 'Space') return
      e.preventDefault()
      handleReleaseTrigger()
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      if (holdTimerRef.current) clearTimeout(holdTimerRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
      if (inspectionIntervalRef.current) clearInterval(inspectionIntervalRef.current)
    }
  }, [puzzleType, isManualMode, activeSession])

  // Mouse / Touch Event Triggers
  const handleMouseDown = (e) => {
    if (isManualMode || e.button !== 0) return // Left click only
    handleStartTrigger()
  }

  const handleMouseUp = (e) => {
    if (isManualMode || e.button !== 0) return
    handleReleaseTrigger()
  }

  const handleTouchStart = (e) => {
    if (isManualMode) return
    e.preventDefault() // Prevents mouse emulation triggers
    handleStartTrigger()
  }

  const handleTouchEnd = (e) => {
    if (isManualMode) return
    e.preventDefault()
    handleReleaseTrigger()
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    const parsed = parseManualTime(manualTimeInput)
    if (parsed === null) {
      alert('請輸入有效的時間格式，例如 "12.58" 或 "1258"')
      return
    }
    saveSolve(parsed, 'none', [])
    setTime(parsed)
    setManualTimeInput('')
  }

  const getTimerColorClass = () => {
    if (displayState === 'holding') return 'text-red-500 animate-pulse'
    if (displayState === 'ready') return 'text-green-500'
    return 'text-black dark:text-white'
  }

  const getPrevSplits = () => {
    if (!lastSolve?.notes) return null
    try {
      const parsed = JSON.parse(lastSolve.notes)
      if (Array.isArray(parsed)) return parsed
    } catch (e) {}
    return null
  }

  return (
    <div className="flex flex-col items-center justify-between h-full py-2 relative w-full">
      {/* Scramble Display */}
      <div className={`text-center w-full px-4 transition-all duration-300 ${displayState === 'running' ? 'opacity-0 scale-95' : 'opacity-100'}`}>
        <span className="text-xs uppercase tracking-widest font-extrabold text-brand-gray-400 dark:text-brand-gray-500">當前 WCA 打亂步驟 ({puzzleType.toUpperCase()})</span>
        <p className="text-sm md:text-base font-mono font-bold mt-1 max-w-2xl mx-auto break-words leading-relaxed select-all">
          {scramble}
        </p>
      </div>

      {/* Main Timer display or Manual input */}
      <div 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="flex flex-col items-center justify-center my-6 py-6 cursor-pointer select-none w-full min-h-[180px]"
      >
        {isManualMode ? (
          /* Manual time entry form */
          <form onSubmit={handleManualSubmit} className="w-full max-w-xs flex flex-col items-center gap-3 animate-in fade-in duration-200" onMouseDown={(e) => e.stopPropagation()}>
            <span className="text-xs text-brand-gray-400 uppercase tracking-widest font-bold flex items-center gap-1.5"><Keyboard className="w-4 h-4" /> 實體計時器手打模式</span>
            <input
              type="text"
              autoFocus
              placeholder="輸入時間 (如 12.58 或 1258)"
              value={manualTimeInput}
              onChange={(e) => setManualTimeInput(e.target.value)}
              className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-250 dark:border-brand-gray-900 rounded-2xl py-4 px-6 text-2xl font-mono font-black text-center focus:outline-none focus:border-black dark:focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="px-6 py-2.5 bg-black dark:bg-white text-white dark:text-black font-extrabold text-xs rounded-xl shadow-sm hover:opacity-90 transition-opacity btn-active-scale"
            >
              確認記錄時間 (Enter)
            </button>
          </form>
        ) : (
          /* Keyboard/Touch/Mouse Timer display */
          displayState === 'inspection' ? (
            <div className="text-center">
              <span className="text-7xl md:text-8xl font-black font-mono text-brand-gray-500 dark:text-brand-gray-400">
                {inspectionCountdown}
              </span>
              <p className="text-xs text-brand-gray-400 uppercase tracking-widest mt-2 font-bold animate-pulse">觀察時間中</p>
            </div>
          ) : (
            <div className="text-center w-full font-sans">
              <span className={`text-7xl md:text-9xl font-black font-mono tracking-tighter ${getTimerColorClass()}`}>
                {formatTime(time)}
              </span>

              {/* Running Multi-phase splits UI overlay */}
              {displayState === 'running' && totalPhases > 1 && (
                <div className="flex flex-wrap justify-center gap-2 mt-4 text-[10px] md:text-xs font-mono font-bold text-brand-gray-400">
                  {Array.from({ length: totalPhases }).map((_, idx) => {
                    const isCompleted = idx < phaseTimes.length
                    const isCurrent = idx === phaseTimes.length
                    
                    let displayTime = '--'
                    if (isCompleted) {
                      const prevSplit = idx === 0 ? 0 : phaseTimes[idx - 1]
                      displayTime = formatTime(phaseTimes[idx] - prevSplit)
                    } else if (isCurrent) {
                      const prevSplit = idx === 0 ? 0 : phaseTimes[idx - 1]
                      displayTime = formatTime(time - prevSplit)
                    }

                    return (
                      <div key={idx} className={`px-2.5 py-1.5 rounded-full border ${
                        isCurrent 
                          ? 'border-black dark:border-white text-black dark:text-white bg-brand-gray-50 dark:bg-brand-gray-950 scale-105 shadow-sm' 
                          : 'border-brand-gray-200 dark:border-brand-gray-800'
                      }`}>
                        P{idx + 1}: {displayTime}
                      </div>
                    )
                  })}
                </div>
              )}

              {displayState !== 'running' && (
                <p className={`text-xs uppercase tracking-widest mt-2 font-bold transition-opacity ${displayState === 'running' ? 'opacity-0' : 'opacity-40'}`}>
                  {totalPhases > 1 
                    ? `[分段計時中 - 共 ${totalPhases} 階段]` 
                    : (displayState === 'ready' ? '放開以啟動計時！' : '按住 [空白鍵] 或 [點擊/觸碰螢幕] 開始')
                  }
                </p>
              )}
            </div>
          )
        )}
      </div>



      {/* Control panel and stats */}
      <div className={`w-full max-w-md transition-all duration-300 ${displayState === 'running' ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        {/* Last solve penalty options & Split Times breakdown */}
        {lastSolve && (lastSolve.session_id || '1') === activeSession && lastSolve.puzzle_type === puzzleType && (
          <div className="space-y-2 mb-4" onMouseDown={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-100 dark:border-brand-gray-900 rounded-2xl p-3 text-xs">
              <span className="font-semibold text-brand-gray-500">上次紀錄 ({formatTime(lastSolve.time_ms)}):</span>
              <div className="flex gap-1">
                <button
                  onClick={() => onPenaltyChange(lastSolve.id, lastSolve.penalty === '+2' ? 'none' : '+2')}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    lastSolve.penalty === '+2'
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white'
                      : 'bg-white text-black border-brand-gray-200 dark:bg-brand-gray-900 dark:text-white dark:border-brand-gray-800'
                  }`}
                >
                  +2
                </button>
                <button
                  onClick={() => onPenaltyChange(lastSolve.id, lastSolve.penalty === 'DNF' ? 'none' : 'DNF')}
                  className={`px-2.5 py-1 rounded-lg font-bold border transition-colors ${
                    lastSolve.penalty === 'DNF'
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-white text-black border-brand-gray-200 dark:bg-brand-gray-900 dark:text-white dark:border-brand-gray-800'
                  }`}
                >
                  DNF
                </button>
                <button
                  onClick={() => onDeleteLastSolve(lastSolve.id)}
                  className="p-1 text-brand-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="刪除本次成績"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Split times rendering */}
            {getPrevSplits() && (
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 rounded-2xl p-3 text-[10px] font-mono text-brand-gray-500 flex justify-around">
                {getPrevSplits().map((marker, idx, arr) => {
                  const prev = idx === 0 ? 0 : arr[idx - 1]
                  const delta = marker - prev
                  return (
                    <div key={idx} className="text-center">
                      <span className="block text-[8px] uppercase tracking-wider text-brand-gray-400 font-bold">階段 {idx + 1}</span>
                      <strong className="text-xs text-black dark:text-white mt-0.5 block">{formatTime(delta)}</strong>
                      <span className="text-[9px] text-brand-gray-400 font-medium">({formatTime(marker)})</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Cube Scramble Preview - inline for all screen sizes */}
        {['222', '333', '444', '555', '666', '777', 'pyram', 'skewb', 'minx', 'clock', 'sq1'].includes(puzzleType) && (
          <div 
            className="flex justify-center mb-3"
            style={{
              display: (showScramblePreview && displayState !== 'running') ? 'flex' : 'none'
            }}
          >
            <CubePreview scramble={scramble} puzzleType={puzzleType} />
          </div>
        )}

        {/* Quick statistics footer */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs">
          <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-100 dark:border-brand-gray-900">
            <span className="text-[10px] text-brand-gray-400 block font-semibold uppercase">最佳成績</span>
            <span className="font-mono font-bold text-sm">{bestTime ? formatTime(bestTime) : '--'}</span>
          </div>
          <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-100 dark:border-brand-gray-900">
            <span className="text-[10px] text-brand-gray-400 block font-semibold uppercase">Ao5 平均</span>
            <span className="font-mono font-bold text-sm">
              {ao5 === 'DNF' ? 'DNF' : (ao5 ? formatTime(ao5) : '--')}
            </span>
          </div>
          <div className="bg-brand-gray-50 dark:bg-brand-gray-950 p-2.5 rounded-xl border border-brand-gray-100 dark:border-brand-gray-900">
            <span className="text-[10px] text-brand-gray-400 block font-semibold uppercase">Ao12 平均</span>
            <span className="font-mono font-bold text-sm">
              {ao12 === 'DNF' ? 'DNF' : (ao12 ? formatTime(ao12) : '--')}
            </span>
          </div>
        </div>

        {/* Settings line - Redesigned to be highly touch-friendly (Pill buttons style) */}
        <div className="flex flex-col gap-3 mt-4 text-[10px] text-brand-gray-400 pt-3 border-t border-brand-gray-100 dark:border-brand-gray-900 w-full font-sans" onMouseDown={(e) => e.stopPropagation()}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            {/* Custom capsule toggles */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setUseInspection(!useInspection)}
                disabled={isManualMode || totalPhases > 1}
                className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border select-none ${
                  useInspection
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                    : 'bg-brand-gray-50 border-brand-gray-200 dark:bg-brand-gray-950 dark:border-brand-gray-900 text-brand-gray-500'
                } disabled:opacity-30`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${useInspection ? 'bg-green-400 animate-pulse' : 'bg-brand-gray-400'}`} />
                WCA 觀察
              </button>

              <button
                type="button"
                onClick={() => setIsManualMode(!isManualMode)}
                className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border select-none ${
                  isManualMode
                    ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                    : 'bg-brand-gray-50 border-brand-gray-200 dark:bg-brand-gray-950 dark:border-brand-gray-900 text-brand-gray-500'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isManualMode ? 'bg-blue-400' : 'bg-brand-gray-400'}`} />
                實體手打
              </button>

              {['222', '333', '444', '555', '666', '777', 'pyram', 'skewb', 'minx', 'clock', 'sq1'].includes(puzzleType) && (
                <button
                  type="button"
                  onClick={() => setShowScramblePreview(!showScramblePreview)}
                  className={`py-2 px-3.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 border select-none ${
                    showScramblePreview
                      ? 'bg-black text-white border-black dark:bg-white dark:text-black dark:border-white shadow-sm'
                      : 'bg-brand-gray-50 border-brand-gray-200 dark:bg-brand-gray-950 dark:border-brand-gray-900 text-brand-gray-500'
                  }`}
                >
                  {showScramblePreview ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  打亂預覽
                </button>
              )}
            </div>

            <button 
              type="button"
              onClick={() => setScramble(generateScramble(puzzleType))}
              className="flex items-center gap-1 hover:text-black dark:hover:text-white font-bold transition-colors py-2 px-3.5 rounded-full bg-brand-gray-50 border border-brand-gray-200 dark:bg-brand-gray-950 dark:border-brand-gray-900 text-xs text-brand-gray-500 select-none"
            >
              <RotateCw className="w-3.5 h-3.5 animate-spin-hover" />
              重新打亂
            </button>
          </div>

          {/* Phase Selector Pill */}
          <div className="flex items-center gap-2 bg-brand-gray-50 border border-brand-gray-200 dark:bg-brand-gray-950 dark:border-brand-gray-900 py-2 px-3.5 rounded-full text-xs font-bold text-brand-gray-500 self-start select-none">
            <Layers3 className="w-4 h-4 text-brand-gray-400" />
            <span>分段計時 (Phases):</span>
            <select
              value={totalPhases}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10)
                setTotalPhases(val)
                if (val > 1) setUseInspection(false)
              }}
              className="bg-transparent border-none font-extrabold text-black dark:text-white focus:outline-none cursor-pointer"
            >
              <option value="1" className="bg-white dark:bg-black">關閉 (1)</option>
              <option value="2" className="bg-white dark:bg-black">2分段 (記憶/還原)</option>
              <option value="3" className="bg-white dark:bg-black">3分段</option>
              <option value="4" className="bg-white dark:bg-black">4分段 (CFOP)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timer
export { formatTime }
