import React, { useState, useEffect, useRef } from 'react'
import cspData from '../data/SQ1-CSP.json'
import { Award, Layers, HelpCircle, Eye, EyeOff, RotateCw, Play, BarChart2, Trash2, Clock, Check, X, BookOpen } from 'lucide-react'
import { formatTime } from '../components/Timer'
import CspTracePanel from '../components/CspTracePanel'
import Sq1Preview from '../components/Sq1Preview'
import { generateRandomCspScramble } from '../lib/sq1ScrambleGenerator'

function rotatePoint2d(x, y, cx, cy, angle) {
  const radians = (angle * Math.PI) / 180
  const cos = Math.cos(radians)
  const sin = Math.sin(radians)
  const nx = cos * (x - cx) + sin * (y - cy) + cx
  const ny = cos * (y - cy) - sin * (x - cx) + cy
  return [nx, ny]
}

function rotatePoints2d(points, cx, cy, angle) {
  return points
    .split(' ')
    .map((point) => {
      const [x, y] = point.split(',')
      const [nx, ny] = rotatePoint2d(parseFloat(x), parseFloat(y), cx, cy, angle)
      return `${nx.toFixed(1)},${ny.toFixed(1)}`
    })
    .join(' ')
}

const ColorPatternBar = ({ colors }) => {
  const colorMap = {
    'B': '#3b82f6',
    'G': '#10b981',
    'R': '#ef4444',
    'O': '#f97316',
  }
  return (
    <div className="flex gap-1.5 items-center">
      {colors.map((c, idx) => (
        <div
          key={idx}
          className="w-3.5 h-3.5 rounded-sm border border-black/10 shadow-sm"
          style={{ backgroundColor: colorMap[c] || '#ccc' }}
          title={c}
        />
      ))}
    </div>
  )
}

const Sq1ReferenceDiagram = ({ top, type }) => {
  const pieces = [
    ['#FFCC00', '#0044ff', '#ff1100'], // Corner top (0)
    ['#FFCC00', '#0044ff'],            // Edge top (1)
    ['#FFCC00', '#ffaa00', '#0044ff'], // Corner top (2)
    ['#FFCC00', '#ffaa00'],            // Edge top (3)
    ['#FFCC00', '#00cc44', '#ffaa00'], // Corner top (4)
    ['#FFCC00', '#00cc44'],            // Edge top (5)
    ['#FFCC00', '#ff1100', '#00cc44'], // Corner top (6)
    ['#FFCC00', '#ff1100'],            // Edge top (7)
    // Bottom face stickers (White base) - corrected physical clockwise color mappings
    ['#FFFFFF', '#00cc44', '#ff1100'], // Corner bottom (8) - DFL (Green/Red)
    ['#FFFFFF', '#ff1100'],            // Edge bottom (9) - DF (Red)
    ['#FFFFFF', '#0044ff', '#ff1100'], // Corner bottom (10) - DFR (Blue/Red)
    ['#FFFFFF', '#0044ff'],            // Edge bottom (11) - DR (Blue)
    ['#FFFFFF', '#0044ff', '#ffaa00'], // Corner bottom (12) - DBR (Blue/Orange)
    ['#FFFFFF', '#ffaa00'],            // Edge bottom (13) - DB (Orange)
    ['#FFFFFF', '#00cc44', '#ffaa00'], // Corner bottom (14) - DBL (Green/Orange)
    ['#FFFFFF', '#00cc44'],            // Edge bottom (15) - DL (Green)
  ]

  const size = 100
  const mid = 50
  const pad = 12
  const width = 10
  const inner = (width + pad - mid) / Math.tan((75 * Math.PI) / 180) + mid
  const outer = (pad - mid) / Math.tan((75 * Math.PI) / 180) + mid

  let corner1 = `${mid},${mid} ${inner},${size - width - pad} ${width + pad},${size - width - pad} ${width + pad},${size - inner}`
  let corner2 = `${pad},${size - pad} ${width + pad},${size - width - pad} ${width + pad},${size - inner} ${pad},${size - outer}`
  let corner3 = `${pad},${size - pad} ${width + pad},${size - width - pad} ${inner},${size - width - pad} ${outer},${size - pad}`
  const edge1 = `${mid},${mid} ${size - inner},${size - width - pad} ${inner},${size - width - pad}`
  const edge2 = `${outer},${size - pad} ${inner},${size - width - pad} ${size - inner},${size - width - pad} ${size - outer},${size - pad}`

  const face = top 
    ? [0, 1, 2, 3, 4, 5, 6, 7] 
    : [8, 9, 10, 11, 12, 13, 14, 15]

  // Mirror D layer polygons horizontally to match bottom view
  const maybeMirror = (pointsStr) => {
    if (top) return pointsStr
    return pointsStr
      .split(' ')
      .map((p) => {
        const [x, y] = p.split(',')
        const nx = 100 - parseFloat(x)
        return `${nx.toFixed(1)},${y}`
      })
      .join(' ')
  }

  let angle = 0
  const polygons = []
  const labels = []

  for (let i = 0; i < face.length; i++) {
    const piece = pieces[face[i]]
    if (piece.length === 3) {
      polygons.push({ points: maybeMirror(rotatePoints2d(corner1, mid, mid, angle)), fill: piece[0] })
      polygons.push({ points: maybeMirror(rotatePoints2d(corner2, mid, mid, angle)), fill: piece[1] })
      polygons.push({ points: maybeMirror(rotatePoints2d(corner3, mid, mid, angle)), fill: piece[2] })
      
      // Calculate label position for Corner
      if (type === 'corners') {
        const labelAngle = angle - 30
        const gx = mid + Math.cos((labelAngle * Math.PI) / 180) * 20
        const gy = mid - Math.sin((labelAngle * Math.PI) / 180) * 20
        
        let num = ''
        if (top) {
          if (i === 6) num = '1' // UFL
          if (i === 0) num = '2' // UFR
          if (i === 2) num = '3' // UBR
          if (i === 4) num = '4' // UBL
        } else {
          if (i === 0) num = '5' // DFL
          if (i === 2) num = '6' // DFR
          if (i === 4) num = '7' // DBR
          if (i === 6) num = '8' // DBL
        }
        labels.push({ x: top ? gx : 100 - gx, y: gy, text: num })
      }
      angle -= 60
    } else if (piece.length === 2) {
      polygons.push({ points: maybeMirror(rotatePoints2d(edge1, mid, mid, angle - 30)), fill: piece[0] })
      polygons.push({ points: maybeMirror(rotatePoints2d(edge2, mid, mid, angle - 30)), fill: piece[1] })
      
      // Calculate label position for Edge
      if (type === 'edges') {
        const labelAngle = angle - 15
        const gx = mid + Math.cos((labelAngle * Math.PI) / 180) * 22
        const gy = mid - Math.sin((labelAngle * Math.PI) / 180) * 22
        
        let num = ''
        if (top) {
          if (i === 5) num = '1' // UL
          if (i === 7) num = '2' // UF
          if (i === 1) num = '3' // UR
          if (i === 3) num = '4' // UB
        } else {
          if (i === 5) num = '5' // DL
          if (i === 7) num = '6' // DF
          if (i === 1) num = '7' // DR
          if (i === 3) num = '8' // DB
        }
        labels.push({ x: top ? gx : 100 - gx, y: gy, text: num })
      }
      angle -= 30
    }
  }

  return (
    <svg viewBox="0 0 100 100" strokeLinejoin="round" className="w-16 h-16 md:w-20 md:h-20">
      {polygons.map((p, idx) => (
        <polygon key={idx} points={p.points} fill={p.fill} stroke="#111" strokeWidth="1.2" />
      ))}
      {labels.map((l, idx) => (
        <g key={idx}>
          <circle cx={l.x} cy={l.y} r="5" fill="#111" />
          <text 
            x={l.x} 
            y={l.y + 1.5} 
            fill="#FFF" 
            fontSize="5.5" 
            fontWeight="bold" 
            textAnchor="middle"
          >
            {l.text}
          </text>
        </g>
      ))}
    </svg>
  )
}

function invertSq1Alg(alg) {
  if (!alg) return ''
  const tokens = []
  let current = ''
  for (let i = 0; i < alg.length; i++) {
    const char = alg[i]
    if (char === '/') {
      if (current.trim()) tokens.push(current.trim())
      tokens.push('/')
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) tokens.push(current.trim())
  const invertedTokens = tokens.map(token => {
    if (token === '/') return '/'
    const match = token.match(/\(?(-?\d+),\s*(-?\d+)\)?/)
    if (match) {
      const x = -parseInt(match[1], 10)
      const y = -parseInt(match[2], 10)
      return `(${x}, ${y})`
    }
    return token
  })
  return invertedTokens.reverse().join(' ')
}

const CspTrainer = () => {
  const [activeView, setActiveView] = useState('trainer') // 'trainer', 'tutorial'
  // Subsets filtering
  const [selectedSubsets, setSelectedSubsets] = useState(cspData.subsets || [])
  const [activeCaseName, setActiveCaseName] = useState('')
  const [showSolution, setShowSolution] = useState(false)
  const [scrambleMode, setScrambleMode] = useState('random') // 'random' or 'reference'
  const [currentScramble, setCurrentScramble] = useState('')

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

  const getAlgString = (caseName = activeCaseName) => {
    if (!caseName || !filteredCases[caseName]) return ''
    const algs = filteredCases[caseName].algs || {}
    return Object.keys(algs)[0] || ''
  }

  const refreshScramble = (caseName, mode) => {
    const refAlg = getAlgString(caseName)
    if (!refAlg) {
      setCurrentScramble('')
      return
    }
    if (mode === 'random') {
      try {
        const rand = generateRandomCspScramble(refAlg)
        setCurrentScramble(rand)
      } catch (err) {
        console.error("Failed to generate random scramble:", err)
        setCurrentScramble(invertSq1Alg(refAlg))
      }
    } else {
      setCurrentScramble(invertSq1Alg(refAlg))
    }
  }

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
    refreshScramble(nextCase, scrambleMode)
    setShowSolution(false)
    setTime(0)
    setTimerState('idle')
    stateRef.current = 'idle'
  }

  // Load first random case on mount or filter change
  useEffect(() => {
    if (!activeCaseName || !filteredCases[activeCaseName]) {
      loadRandomCase()
    } else {
      refreshScramble(activeCaseName, scrambleMode)
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



  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-6 font-sans">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">SQ1 CSP 專門訓練區</h1>
          <p className="text-xs text-brand-gray-400 font-semibold uppercase tracking-wider mt-1">
            Square-1 Cubeshape Parity 觀察與還原速度計時訓練
          </p>
        </div>
        <div className="flex bg-brand-gray-100 dark:bg-brand-gray-900 p-1 rounded-2xl border border-brand-gray-200 dark:border-brand-gray-800">
          <button
            onClick={() => setActiveView('trainer')}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeView === 'trainer'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                : 'text-brand-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" /> 訓練模式 (Trainer)
          </button>
          <button
            onClick={() => setActiveView('tutorial')}
            className={`py-2 px-4 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              activeView === 'tutorial'
                ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                : 'text-brand-gray-500 hover:text-black dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" /> 📖 CSP 教學指南 (Tutorial)
          </button>
        </div>
      </header>

      {activeView === 'trainer' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-200">
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

          <div className="lg:col-span-8 space-y-6">
            {activeCaseData ? (
              <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-between min-h-[460px] relative overflow-hidden">
                <div className="text-center space-y-1 z-10">
                  <span className="px-3 py-1 bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-full text-[10px] font-black text-brand-gray-400 uppercase tracking-widest">
                    {activeCaseData.subset}
                  </span>
                  <h2 className="text-2xl font-black text-black dark:text-white mt-2">{activeCaseName}</h2>
                </div>

                <div className="my-6 z-10 w-full space-y-4">
                  {/* Physical Scramble Card */}
                  <div className="bg-brand-gray-50 dark:bg-brand-gray-950/60 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2rem] p-4 text-center space-y-3 max-w-md mx-auto shadow-sm">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] text-brand-gray-450 uppercase tracking-widest font-black block text-left">
                        🧩 實體方塊打亂 Scramble (從正方形復原狀態開始)
                      </span>
                      <button
                        onClick={() => refreshScramble(activeCaseName, scrambleMode)}
                        className="p-1 rounded-lg text-brand-gray-450 hover:text-black dark:hover:text-white hover:bg-brand-gray-150 dark:hover:bg-brand-gray-900 transition btn-active-scale"
                        title="重新生成打亂 (Regenerate)"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <code className="block bg-white dark:bg-black px-3 py-2 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 font-mono text-[11px] text-brand-gray-700 dark:text-brand-gray-300 break-all select-all">
                      {currentScramble}
                    </code>

                    {/* Mode Toggle Selector */}
                    <div className="flex justify-center gap-1.5 text-[9px] font-black uppercase tracking-wider">
                      <button
                        onClick={() => {
                          setScrambleMode('random')
                          refreshScramble(activeCaseName, 'random')
                        }}
                        className={`px-3 py-1 rounded-full border transition ${
                          scrambleMode === 'random'
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                            : 'bg-transparent text-brand-gray-450 border-brand-gray-200 dark:border-brand-gray-800 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        🎲 隨機打亂 (Random)
                      </button>
                      <button
                        onClick={() => {
                          setScrambleMode('reference')
                          refreshScramble(activeCaseName, 'reference')
                        }}
                        className={`px-3 py-1 rounded-full border transition ${
                          scrambleMode === 'reference'
                            ? 'bg-black text-white dark:bg-white dark:text-black border-transparent'
                            : 'bg-transparent text-brand-gray-450 border-brand-gray-200 dark:border-brand-gray-800 hover:text-black dark:hover:text-white'
                        }`}
                      >
                        固定打亂 (Reference)
                      </button>
                    </div>
                  </div>

                  <p className="text-center text-[10px] text-brand-gray-400 uppercase font-bold tracking-wider mb-2">
                    遇到此形狀時 (黃色朝下，白色朝上，紅色朝前)
                  </p>

                  {/* Side-by-side Shape and Color Preview */}
                  <div className="flex items-center justify-center gap-8 py-2">
                    {/* Left: Reference Shape */}
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-[9px] text-brand-gray-450 uppercase font-black tracking-widest">基準形狀</span>
                      {(activeCaseData.svgTop || activeCaseData.svgBottom) ? (
                        <div className="flex items-center justify-center gap-2 bg-brand-gray-50/50 dark:bg-brand-gray-900/10 p-2 rounded-2xl border border-brand-gray-150/40 dark:border-brand-gray-900/30">
                          {activeCaseData.svgTop && (
                            <div
                              className="w-16 h-16 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full [&_polygon]:stroke-[#ddd]"
                              dangerouslySetInnerHTML={{ __html: activeCaseData.svgTop }}
                            />
                          )}
                          {activeCaseData.svgBottom && (
                            <div
                              className="w-16 h-16 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full [&_polygon]:stroke-[#ddd]"
                              dangerouslySetInnerHTML={{ __html: activeCaseData.svgBottom }}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="text-center text-brand-gray-500 text-sm">無圖</div>
                      )}
                    </div>

                    <div className="w-px h-16 bg-brand-gray-200 dark:bg-brand-gray-800" />

                    {/* Right: Scrambled Color State */}
                    <div className="flex flex-col items-center space-y-2">
                      <span className="text-[9px] text-brand-gray-450 uppercase font-black tracking-widest">打亂配色對照</span>
                      <Sq1Preview scramble={currentScramble} />
                    </div>
                  </div>

                  {/* CSP Live Trace Panel */}
                  <CspTracePanel scramble={currentScramble} />
                </div>

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

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
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
      ) : (
        <div className="bg-white dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 md:p-10 animate-in fade-in duration-250 space-y-10 shadow-sm">

          {/* Intro */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-black dark:text-white">
              <BookOpen className="w-6 h-6 text-brand-gray-550" />
              什麼是 CSP (Cubeshape Parity)？
            </h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              Cubeshape Parity（簡稱 <strong>CSP</strong>）是 Square-1 中最具決定性的進階復原技術。
              它的核心思想是：在觀察階段計算出整個方塊的奇偶狀態（Parity），並在隨後復原成正方形的過程中，
              直接選擇對應的還原路徑，從而<strong>在進入正方形時 100% 修正並消滅 Parity</strong>。
            </p>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section 1: Math */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black dark:text-white">📐 1. Parity 的置換數學原理</h2>
            <ul className="text-xs text-brand-gray-550 dark:text-brand-gray-400 list-disc pl-5 space-y-2">
              <li><strong>Even Parity</strong>：需要偶數次交換還原。</li>
              <li><strong>Odd Parity</strong>：需要奇數次交換還原。</li>
            </ul>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section 2: Reference Schemes */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black dark:text-white">🎯 2. 官方基準置換編號 (WCA Reference Schemes)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-6 flex flex-col items-center shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-gray-450 mb-4">角塊編號基準 (Corners 1-8)</h3>
                <div className="flex gap-8 items-center justify-center">
                  <div className="text-center">
                    <Sq1ReferenceDiagram top={true} type="corners" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-gray-450 mt-2 block">頂層 (U-Face)</span>
                  </div>
                  <div className="text-center">
                    <Sq1ReferenceDiagram top={false} type="corners" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-gray-450 mt-2 block">底層 (D-Face)</span>
                  </div>
                </div>
                <div className="mt-6 text-xs text-brand-gray-500 dark:text-brand-gray-400 space-y-1.5 w-full border-t border-brand-gray-150 dark:border-brand-gray-900/60 pt-4">
                  <p>• <strong>頂層 (1-4)</strong>: UFL➔1, UFR➔2, UBR➔3, UBL➔4</p>
                  <p>• <strong>底層 (5-8)</strong>: DFL➔5, DFR➔6, DBR➔7, DBL➔8</p>
                </div>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-6 flex flex-col items-center shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-gray-450 mb-4">邊塊編號基準 (Edges 1-8)</h3>
                <div className="flex gap-8 items-center justify-center">
                  <div className="text-center">
                    <Sq1ReferenceDiagram top={true} type="edges" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-gray-450 mt-2 block">頂層 (U-Face)</span>
                  </div>
                  <div className="text-center">
                    <Sq1ReferenceDiagram top={false} type="edges" />
                    <span className="text-[10px] font-black uppercase tracking-wider text-brand-gray-450 mt-2 block">底層 (D-Face)</span>
                  </div>
                </div>
                <div className="mt-6 text-xs text-brand-gray-500 dark:text-brand-gray-400 space-y-1.5 w-full border-t border-brand-gray-150 dark:border-brand-gray-900/60 pt-4">
                  <p>• <strong>頂層 (1-4)</strong>: UL➔1, UF➔2, UR➔3, UB➔4</p>
                  <p>• <strong>底層 (5-8)</strong>: DL➔5, DF➔6, DR➔7, DB➔8</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section 3: Counting + Videos */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black dark:text-white">🔄 3. 循環計數步驟 (How to Trace & Count)</h2>

            {/* YouTube embeds */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2.5rem] p-5 space-y-3 shadow-sm">
                <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>Tucker Chamberlain CSP 實戰教學
                </h4>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">主打全局 Solved 狀態對比，Star-shift 及 Slice-shift 奇偶性反轉邏輯。</p>
                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-brand-gray-200 dark:border-brand-gray-800 bg-black">
                  <iframe className="w-full h-full" src="https://www.youtube.com/embed/BLVZlRQMbSU" title="Tucker Chamberlain CSP" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2.5rem] p-5 space-y-3 shadow-sm">
                <h4 className="text-sm font-black text-black dark:text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>Eva Kato SQ1 CSP Visual Recognition
                </h4>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">主打側面三色排列（ABA / ABC）快速判定角塊奇偶性。</p>
                <div className="w-full aspect-video rounded-2xl overflow-hidden border border-brand-gray-200 dark:border-brand-gray-800 bg-black">
                  <iframe className="w-full h-full" src="https://www.youtube.com/embed/pXXr87kwZuI" title="Eva Kato CSP" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                </div>
              </div>
            </div>

            {/* Cycle explanation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2rem] p-6 space-y-3 shadow-sm">
                <h3 className="text-sm font-black text-black dark:text-white">1. 寫出置換循環 (Cycles)</h3>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
                  從未數過的位置（如位置 1）出發，查看其碎片應去哪裡（如 3），再看 3 的碎片應去哪裡（如 5），直到回到起點。所有碎片都追蹤完才算結束。
                </p>
              </div>
              <div className="bg-white dark:bg-brand-gray-950 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2rem] p-6 space-y-3 shadow-sm">
                <h3 className="text-sm font-black text-black dark:text-white">2. 計算交換數 (Swaps)</h3>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">長度 L 的循環需要 L-1 次交換。</p>
                <div className="bg-brand-gray-50 dark:bg-black p-3 rounded-xl border border-brand-gray-150 dark:border-brand-gray-900 font-mono text-xs text-center space-y-1">
                  <div>邊塊交換數 = Σ (邊塊循環長度 - 1)</div>
                  <div>角塊交換數 = Σ (角塊循環長度 - 1)</div>
                  <div className="font-extrabold pt-2 border-t border-brand-gray-200 dark:border-brand-gray-900 text-black dark:text-white">總交換數 = 邊 + 角</div>
                </div>
                <div className="flex gap-4 text-xs font-bold">
                  <span className="text-green-500">偶數 ➔ Even</span>
                  <span className="text-red-500">奇數 ➔ Odd</span>
                </div>
              </div>
            </div>

            {/* Examples */}
            <h3 className="text-base font-black text-black dark:text-white">💡 Brandon Lin 經典實例</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2rem] p-5 space-y-2 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-gray-450">實例一：80 / Star</h4>
                <div className="text-xs text-brand-gray-500 dark:text-brand-gray-400 space-y-1.5 leading-relaxed">
                  <p>邊塊: 4次交換 | 角塊: 5次交換</p>
                  <p>總計 <strong>9次 (奇數 ➔ Odd)</strong></p>
                  <p className="text-red-500 font-bold">➔ 第一步需 star-shift (0,2) 抵消奇偶性</p>
                </div>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2rem] p-5 space-y-2 shadow-sm">
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-gray-450">實例二：Scallop / Scallop</h4>
                <div className="text-xs text-brand-gray-500 dark:text-brand-gray-400 space-y-1.5 leading-relaxed">
                  <p>邊塊: 7次交換 | 角塊: 9次交換</p>
                  <p>總計 <strong>16次 (偶數 ➔ Even)</strong></p>
                  <p className="text-green-500 font-bold">➔ 選擇 Even 復形路徑</p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section 4: Toggling Trick */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black dark:text-white">💡 4. Brandon Lin 觀察實戰竅門 (Toggling Trick)</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">奇偶指針法 (Toggling)</h4>
                <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">心裡只維持 0 或 1（Even/Odd）。每遇到 2-cycle 就反轉；3-cycle 則保持不變。</p>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">先角後邊，分步擊破</h4>
                <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">先 5-7 秒數完角塊，得出角塊指針。再數邊塊繼續反轉，最後的值即為 CSP 答案。</p>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">輔助練習工具</h4>
                <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">結合 <strong>SpeedCubeDB (SQ1 Trace)</strong> 練習置換確認；熟練後用 <strong>Squanmate</strong> 計時訓練。</p>
              </div>
            </div>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section 5: SpeedCubeDB Walkthrough */}
          <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-[2.5rem] p-6 md:p-8 space-y-4 shadow-sm">
            <h2 className="text-xl font-black text-black dark:text-white">🔎 5. SpeedCubeDB Trace 實戰拆解 (Walkthrough)</h2>
            <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">SpeedCubeDB 從每個角塊讀取側面三格顏色，判斷是 ABA (固定 Even) 還是 ABC (查 24 格表)，各角塊奇偶性相加取模即最終結果。</p>
            <code className="block bg-white dark:bg-black p-3 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900 font-mono text-[11px] text-brand-gray-600 dark:text-brand-gray-300">
              範例打亂: (1,0)/ (3,3)/ (-1,5)/ (0,-3)/ (-3,0)/ (-5,-5)/ (0,-1)/ (3,0)/ (-4,-3)/ (0,-4)/ (-5,-2)/ (3,0)
            </code>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-brand-gray-500 dark:text-brand-gray-400">
              <div><strong className="text-black dark:text-white block mb-1">1. 形狀識別</strong>打亂後形狀為 3-1-2 / Paired Edges。</div>
              <div className="md:border-l border-brand-gray-150 dark:border-brand-gray-900 md:pl-4"><strong className="text-black dark:text-white block mb-1">2. 追蹤邊塊</strong>從 UL 開始追蹤：DB➔UF➔DL➔DR➔UL（長度5，4次交換）。繼續追蹤其餘碎片。</div>
              <div className="md:border-l border-brand-gray-150 dark:border-brand-gray-900 md:pl-4"><strong className="text-black dark:text-white block mb-1">3. 選擇路徑</strong>累加邊塊+角塊交換數：奇數選 Odd 路徑，偶數選 Even 路徑。</div>
            </div>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section 6: Eva Kato Corner Recognition */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black dark:text-white">🌟 6. 實戰快速判定法 (Eva Kato - Parity vs Not Parity Visual Recognition)</h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              查看相鄰三個角塊的側面顏色排列（順時針，B=藍, G=綠, R=紅, O=橘）快速判定：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* ABA — always Even */}
              <div className="bg-green-50/40 dark:bg-green-950/10 border border-green-200/60 dark:border-green-900/30 rounded-[2.5rem] p-6 space-y-4">
                <h3 className="text-sm font-black text-green-600 dark:text-green-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500 flex-shrink-0"></span>
                  ABA 模式 ➔ 無 Parity (偶數 / Even)
                </h3>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">首尾顏色相同，中間不同 — 共 12 種，必定 Even：</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white dark:bg-black/30 p-3 rounded-2xl border border-green-100/40 dark:border-green-900/20 space-y-2.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-gray-450 block">對色 (首尾相反)</span>
                    {[['B','G','B'],['G','B','G'],['R','O','R'],['O','R','O']].map(c => (
                      <div key={c.join('')} className="flex items-center justify-between">
                        <ColorPatternBar colors={c} />
                        <span className="text-[10px] font-mono text-brand-gray-500">{c.join(' ')}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white dark:bg-black/30 p-3 rounded-2xl border border-green-100/40 dark:border-green-900/20 space-y-2.5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-brand-gray-450 block">相鄰色 (首尾相鄰)</span>
                    {[['B','R','B'],['R','B','R'],['G','R','G'],['R','G','R'],['O','G','O'],['G','O','G'],['O','B','O'],['B','O','B']].map(c => (
                      <div key={c.join('')} className="flex items-center justify-between">
                        <ColorPatternBar colors={c} />
                        <span className="text-[10px] font-mono text-brand-gray-500">{c.join(' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ABC — lookup table */}
              <div className="bg-red-50/50 dark:bg-red-950/10 border border-red-200/60 dark:border-red-900/40 rounded-[2.5rem] p-6 space-y-4">
                <h3 className="text-sm font-black text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0"></span>
                  ABC 模式 ➔ 需查表判定 (12 Even / 12 Odd)
                </h3>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400">三色各不同 — 共 24 種，需查下表：</p>
                <div className="bg-white dark:bg-black/30 p-4 rounded-2xl border border-red-100/40 dark:border-red-900/20">
                  <div className="grid grid-cols-2 gap-x-4 gap-y-2 max-h-72 overflow-y-auto pr-1 text-[11px]">
                    {[
                      [['B','G','O'],'Odd'],[['B','G','R'],'Even'],
                      [['B','R','O'],'Even'],[['B','R','G'],'Odd'],
                      [['B','O','R'],'Odd'],[['B','O','G'],'Even'],
                      [['G','R','O'],'Odd'],[['G','R','B'],'Even'],
                      [['G','O','R'],'Even'],[['G','O','B'],'Odd'],
                      [['G','B','O'],'Even'],[['G','B','R'],'Odd'],
                      [['R','G','B'],'Odd'],[['R','G','O'],'Even'],
                      [['R','O','B'],'Even'],[['R','O','G'],'Odd'],
                      [['R','B','O'],'Odd'],[['R','B','G'],'Even'],
                      [['O','G','B'],'Even'],[['O','G','R'],'Odd'],
                      [['O','R','G'],'Even'],[['O','R','B'],'Odd'],
                      [['O','B','R'],'Even'],[['O','B','G'],'Odd'],
                    ].map(([c, p]) => (
                      <div key={c.join('')} className="flex items-center justify-between border-b border-brand-gray-100 dark:border-brand-gray-900 pb-1">
                        <div className="flex items-center gap-1.5">
                          <ColorPatternBar colors={c} />
                          <span className="font-mono font-bold text-brand-gray-600 dark:text-brand-gray-400">{c.join(' ')}</span>
                        </div>
                        <span className={`font-bold ${p === 'Odd' ? 'text-red-500' : 'text-green-500'}`}>{p === 'Odd' ? 'Odd (有)' : 'Even (無)'}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  )
}

export default CspTrainer
