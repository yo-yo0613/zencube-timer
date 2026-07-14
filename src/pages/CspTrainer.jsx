import React, { useState, useEffect, useRef } from 'react'
import cspData from '../data/SQ1-CSP.json'
import { Award, Layers, HelpCircle, Eye, EyeOff, RotateCw, Play, BarChart2, Trash2, Clock, Check, X, BookOpen } from 'lucide-react'
import { formatTime } from '../components/Timer'

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
    // Bottom face stickers (White base)
    ['#FFFFFF', '#ff1100', '#0044ff'], // Corner bottom (8)
    ['#FFFFFF', '#0044ff'],            // Edge bottom (9)
    ['#FFFFFF', '#0044ff', '#ffaa00'], // Corner bottom (10)
    ['#FFFFFF', '#ffaa00'],            // Edge bottom (11)
    ['#FFFFFF', '#ffaa00', '#00cc44'], // Corner bottom (12)
    ['#FFFFFF', '#00cc44'],            // Edge bottom (13)
    ['#FFFFFF', '#00cc44', '#ff1100'], // Corner bottom (14)
    ['#FFFFFF', '#ff1100'],            // Edge bottom (15)
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

  if (!top) {
    const tmp = corner2
    corner2 = corner3
    corner3 = tmp
  }

  const face = top 
    ? [0, 1, 2, 3, 4, 5, 6, 7] 
    : [8, 9, 10, 11, 12, 13, 14, 15]

  let angle = 0
  const polygons = []
  const labels = []

  for (let i = 0; i < face.length; i++) {
    const piece = pieces[face[i]]
    if (piece.length === 3) {
      polygons.push({ points: rotatePoints2d(corner1, mid, mid, angle), fill: piece[0] })
      polygons.push({ points: rotatePoints2d(corner2, mid, mid, angle), fill: piece[1] })
      polygons.push({ points: rotatePoints2d(corner3, mid, mid, angle), fill: piece[2] })
      
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
        labels.push({ x: gx, y: gy, text: num })
      }
      angle -= 60
    } else if (piece.length === 2) {
      polygons.push({ points: rotatePoints2d(edge1, mid, mid, angle - 30), fill: piece[0] })
      polygons.push({ points: rotatePoints2d(edge2, mid, mid, angle - 30), fill: piece[1] })
      
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
        labels.push({ x: gx, y: gy, text: num })
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

const CspTrainer = () => {
  const [activeView, setActiveView] = useState('trainer') // 'trainer', 'tutorial'
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

                <div className="my-6 z-10 w-full">
                  <p className="text-center text-[10px] text-brand-gray-400 uppercase font-bold tracking-wider mb-2">
                    遇到此形狀時 → 套用下方公式還原
                  </p>
                  {/* Static SVGs scraped from CubingApp — identical to reference */}
                  {(activeCaseData.svgTop || activeCaseData.svgBottom) ? (
                    <div className="flex items-center justify-center gap-4">
                      {activeCaseData.svgTop && (
                        <div
                          className="w-24 h-24 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full [&_polygon]:stroke-[#ddd]"
                          dangerouslySetInnerHTML={{ __html: activeCaseData.svgTop }}
                        />
                      )}
                      {activeCaseData.svgBottom && (
                        <div
                          className="w-24 h-24 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full [&_polygon]:stroke-[#ddd]"
                          dangerouslySetInnerHTML={{ __html: activeCaseData.svgBottom }}
                        />
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-brand-gray-500 text-sm">無圖</div>
                  )}
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
        /* Tutorial Block */
        <div className="bg-white dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 md:p-10 animate-in fade-in duration-250 space-y-10 shadow-sm">
          {/* Section: Intro */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-2 text-black dark:text-white">
              <BookOpen className="w-6 h-6 text-brand-gray-505" />
              什麼是 CSP (Cubeshape Parity)？
            </h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              Cubeshape Parity（簡稱 <strong>CSP</strong>）是 Square-1 中最具決定性的進階復原技術。
              它的核心思想是：<strong>在觀察階段（Inspection）計算出整個方塊的奇偶狀態（Parity）</strong>，並在隨後復原成正方形（Cubeshape）的過程中，直接選擇對應的還原路徑（即 Even 與 Odd 算法），從而<strong>在進入正方形時 100% 修正並消滅 Parity</strong>。
              這樣一來，後續還原步驟（特別是最後的 EP 邊排列）將永遠不會遇到惱人且耗時的單純 Parity 特例公式。
            </p>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section: Math */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black dark:text-white">📐 1. Parity 的置換數學原理</h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              在置換群中，Parity（奇偶性）代表將一個打亂狀態還原到目標狀態所需的「兩兩互換次數（Swaps）」的奇偶性：
            </p>
            <ul className="text-xs text-brand-gray-550 dark:text-brand-gray-400 list-disc pl-5 space-y-2">
              <li><strong>Even Parity (偶數奇偶性)</strong>：需要偶數次交換還原。在正方形下，每次 / (Slice) 轉動會同時交換 2 對角塊與 2 對邊塊（總共 4 次交換，為偶數），因此正方形轉動會維持偶數狀態。</li>
              <li><strong>Odd Parity (奇數奇偶性)</strong>：需要奇數次交換還原。在非正方形下，由於形狀不對稱，一次切片可能會造成「3 次角塊交換 + 0 次邊塊交換」（奇數）等情況，使方塊陷入 Odd 狀態。</li>
            </ul>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section: Reference Schemes */}
          <div className="space-y-6">
            <h2 className="text-xl font-black text-black dark:text-white">🎯 2. 官方基準置換編號 (WCA Reference Schemes)</h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              為了在觀察時「數出交換次數」，我們必須為每一種 Cubeshape 定義一個<strong>「基準狀態（Reference Scheme）」</strong>（通常是完全解開或最直覺的配色對齊狀態），並將每個位置進行編號：
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Corners Scheme Card */}
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-6 flex flex-col items-center shadow-sm">
                <h3 className="text-sm font-black uppercase tracking-widest text-brand-gray-400 mb-4">角塊編號基準 (Corners 1-8)</h3>
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
                  <p>• <strong>頂層 (1-4)</strong>: UFL ➔ <strong className="text-black dark:text-white">1</strong>, UFR ➔ <strong className="text-black dark:text-white">2</strong>, UBR ➔ <strong className="text-black dark:text-white">3</strong>, UBL ➔ <strong className="text-black dark:text-white">4</strong></p>
                  <p>• <strong>底層 (5-8)</strong>: DFL ➔ <strong className="text-black dark:text-white">5</strong>, DFR ➔ <strong className="text-black dark:text-white">6</strong>, DBR ➔ <strong className="text-black dark:text-white">7</strong>, DBL ➔ <strong className="text-black dark:text-white">8</strong></p>
                </div>
              </div>

              {/* Edges Scheme Card */}
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
                  <p>• <strong>頂層 (1-4)</strong>: UL ➔ <strong className="text-black dark:text-white">1</strong>, UF ➔ <strong className="text-black dark:text-white">2</strong>, UR ➔ <strong className="text-black dark:text-white">3</strong>, UB ➔ <strong className="text-black dark:text-white">4</strong></p>
                  <p>• <strong>底層 (5-8)</strong>: DL ➔ <strong className="text-black dark:text-white">5</strong>, DF ➔ <strong className="text-black dark:text-white">6</strong>, DR ➔ <strong className="text-black dark:text-white">7</strong>, DB ➔ <strong className="text-black dark:text-white">8</strong></p>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section: Counting */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black dark:text-white">🔄 3. 循環計數步驟 (How to Trace & Count)</h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              觀察打亂的方塊時，請獨立針對角塊和邊塊寫出置換循環：
            </p>
            <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-6 space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">1. 寫出置換循環 (Cycles)</h4>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1 leading-relaxed">
                  從未追蹤的編號位置出發（例如 1 號角塊），查看此位置上的角塊原本應去哪裡（如 3），再看 3 號位置的角塊應去哪裡（如 5），直到回到起點。這是一個完整循環。如果還有未數完的角塊，開啟下一個循環，直到 8 個角塊都被計算。
                </p>
              </div>
              <div className="border-t border-brand-gray-150 dark:border-brand-gray-900/60 pt-3">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">2. 計算總交換次數 (Swaps)</h4>
                <p className="text-xs text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                  一個長度為 <code className="bg-brand-gray-100 dark:bg-brand-gray-900 px-1.5 py-0.5 rounded font-mono font-bold text-black dark:text-white">L</code> 的循環，需要 <code className="bg-brand-gray-100 dark:bg-brand-gray-900 px-1.5 py-0.5 rounded font-mono font-bold text-black dark:text-white">L - 1</code> 次兩兩交換。
                </p>
                <div className="bg-white dark:bg-black p-4 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-900 text-xs font-mono mt-2 text-center text-black dark:text-white space-y-1">
                  <div>角塊交換數 = Σ (各角塊循環長度 - 1)</div>
                  <div>邊塊交換數 = Σ (各邊塊循環長度 - 1)</div>
                  <div className="font-extrabold border-t border-brand-gray-150 dark:border-brand-gray-900/60 pt-2 mt-2">總交換次數 = 角塊交換數 + 邊塊交換數</div>
                </div>
              </div>
              <div className="border-t border-brand-gray-150 dark:border-brand-gray-900/60 pt-3 flex flex-wrap gap-4 text-xs font-bold justify-around">
                <div className="text-green-500 flex items-center gap-1">✓ 總交換次數為 偶數 ➔ Even Parity</div>
                <div className="text-red-500 flex items-center gap-1">✗ 總交換次數為 奇數 ➔ Odd Parity</div>
              </div>
            </div>
          </div>

          <hr className="border-brand-gray-150 dark:border-brand-gray-900" />

          {/* Section: Brandon Lin's Tips */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black dark:text-white">💡 4. Brandon Lin 觀察實戰竅門 (Toggling Trick)</h2>
            <p className="text-sm text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
              在 15 秒的極限觀察中，我們不可能在腦海中記錄多位數字。Brandon Lin 影片中介紹了以下實用的心算降維技巧：
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">奇偶指針法 (Toggling)</h4>
                <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
                  心裡只維持一個布林值（0 或 1，即 Even 或 Odd）。每數到一個 2-cycle (長度為 2 的循環，即 1 次交換)，就反轉一次指針狀態。遇到 3-cycle (2 次交換) 則狀態保持不變。
                </p>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">先角後邊，分步擊破</h4>
                <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
                  先花 5-7 秒完全數完面積較大、特徵明顯的角塊，得出角塊的指針（例如 Odd）。接著再數邊塊，在此基礎上繼續反轉指針，最後得出的 0 或 1 即為方塊的最終 CSP 答案。
                </p>
              </div>
              <div className="bg-brand-gray-50 dark:bg-brand-gray-950/40 border border-brand-gray-150 dark:border-brand-gray-900 rounded-3xl p-5 shadow-sm space-y-2">
                <h4 className="text-xs font-black uppercase tracking-widest text-brand-gray-450">輔助練習軟體推薦</h4>
                <p className="text-[11px] text-brand-gray-500 dark:text-brand-gray-400 leading-relaxed">
                  建議結合 <strong>SpeedCubeDB (SQ1 Trace)</strong> 網頁，練習用眼睛和點擊確認置換；熟練後再使用 <strong>Squanmate</strong> 來進行特定 Subset 的公式記憶與計時訓練。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CspTrainer
