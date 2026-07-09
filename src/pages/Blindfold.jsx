import React, { useState, useEffect } from 'react'
import dylanData from '../data/dylan3Style.json'
import bopomofoData from '../data/bopomofoMap.json'
import { Brain, Search, Award, HelpCircle, Eye, RotateCw, Edit3, Save, Languages, ListFilter } from 'lucide-react'
import { fetchBldMemosFromDb, saveBldMemoToDb } from '../utils/db'
import { useAuth } from '../context/AuthContext'

const Blindfold = () => {
  const [bldType, setBldType] = useState('edges') // 'edges' (UF), 'corners' (UFR), 'parity'
  const [rowTarget, setRowTarget] = useState('A')
  const [colTarget, setColTarget] = useState('B')
  const [useBopomofo, setUseBopomofo] = useState(true) // Toggle Bopomofo, default to true
  const [memos, setMemos] = useState([])
  const [editingMemo, setEditingMemo] = useState(false)
  const [memoText, setMemoText] = useState('')

  // Right Side Trainer Tab: 'comms' (Formulas) or 'memos' (Memo Codes)
  const [trainerTab, setTrainerTab] = useState('comms') 
  // Memo trainer direction: 'pairToWord' (ㄅㄆ -> 阿爸) or 'wordToPair' (阿爸 -> ㄅㄆ)
  const [memoDirection, setMemoDirection] = useState('pairToWord')
  const [newMemoInput, setNewMemoInput] = useState('')

  // Trainer state
  const [trainerActive, setTrainerActive] = useState(false)
  const [quizPair, setQuizPair] = useState({ row: '', col: '', formula: '', engPair: '' })
  const [showTrainerFormula, setShowTrainerFormula] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  
  const { user } = useAuth()

  // Extract letter lists from preloaded JSON keys
  const edgeRowKeys = Object.keys(dylanData.ufComms || {})
  const edgeColKeys = edgeRowKeys.length > 0 ? Object.keys(dylanData.ufComms[edgeRowKeys[0]] || {}) : []
  
  const cornerRowKeys = Object.keys(dylanData.ufrComms || {})
  const cornerColKeys = cornerRowKeys.length > 0 ? Object.keys(dylanData.ufrComms[cornerRowKeys[0]] || {}) : []

  // Clean letters (e.g. "A (UB)" -> "A")
  const getLetter = (keyStr) => keyStr ? keyStr.split(' ')[0] : ''

  // Translation helper
  const toBopomofo = (letter) => {
    return bopomofoData.charMap[letter] || letter
  }

  useEffect(() => {
    loadMemos()
  }, [user])

  const loadMemos = async () => {
    const data = await fetchBldMemosFromDb()
    setMemos(data)
  }

  // Get current formula from selectors
  const getFormula = (type, row, col) => {
    if (type === 'edges') {
      const rowKey = edgeRowKeys.find(k => k.startsWith(row))
      const colKey = edgeColKeys.find(k => k.startsWith(col))
      return dylanData.ufComms[rowKey]?.[colKey] || '無對應公式'
    } else if (type === 'corners') {
      const rowKey = cornerRowKeys.find(k => k.startsWith(row))
      const colKey = cornerColKeys.find(k => k.startsWith(col))
      return dylanData.ufrComms[rowKey]?.[colKey] || '無對應公式'
    } else {
      const targetKey = Object.keys(dylanData.parity).find(k => k.startsWith(row))
      return dylanData.parity[targetKey] || '無對應公式'
    }
  }

  // Get current target text (e.g. "A (UB)")
  const getFullTargetLabel = (type, letter, isRow = true) => {
    if (type === 'edges') {
      const keys = isRow ? edgeRowKeys : edgeColKeys
      const matched = keys.find(k => k.startsWith(letter))
      if (!matched) return letter
      return matched.substring(matched.indexOf('('))
    } else if (type === 'corners') {
      const keys = isRow ? cornerRowKeys : cornerColKeys
      const matched = keys.find(k => k.startsWith(letter))
      if (!matched) return letter
      return matched.substring(matched.indexOf('('))
    } else {
      const matched = Object.keys(dylanData.parity).find(k => k.startsWith(letter))
      if (!matched) return letter
      return matched.substring(matched.indexOf('('))
    }
  }

  // Get current memo for the active pair
  const currentMemo = memos.find(
    (m) => m.letter_pair === `${rowTarget}${colTarget}` && m.type === bldType
  )?.memo_text || ''

  useEffect(() => {
    setMemoText(currentMemo)
  }, [rowTarget, colTarget, bldType, memos])

  const handleSaveMemo = async () => {
    const pair = `${rowTarget}${colTarget}`
    const saved = await saveBldMemoToDb(pair, bldType, memoText, '')
    setMemos((prev) => {
      const filtered = prev.filter(m => !(m.letter_pair === pair && m.type === bldType))
      return [...filtered, saved]
    })
    setEditingMemo(false)
  }

  // Trainer logic
  const startTrainer = () => {
    setTrainerActive(true)
    setCorrectCount(0)
    setTotalCount(0)
    generateNextQuiz()
  }

  const generateNextQuiz = () => {
    setShowTrainerFormula(false)
    setNewMemoInput('')
    let selectedRow = ''
    let selectedCol = ''
    let selectedFormula = ''

    if (bldType === 'edges') {
      const randomRow = edgeRowKeys[Math.floor(Math.random() * edgeRowKeys.length)]
      const cols = Object.keys(dylanData.ufComms[randomRow] || {})
      const randomCol = cols[Math.floor(Math.random() * cols.length)]
      
      selectedRow = getLetter(randomRow)
      selectedCol = getLetter(randomCol)
      selectedFormula = dylanData.ufComms[randomRow]?.[randomCol] || ''
    } else if (bldType === 'corners') {
      const randomRow = cornerRowKeys[Math.floor(Math.random() * cornerRowKeys.length)]
      const cols = Object.keys(dylanData.ufrComms[randomRow] || {})
      const randomCol = cols[Math.floor(Math.random() * cols.length)]
      
      selectedRow = getLetter(randomRow)
      selectedCol = getLetter(randomCol)
      selectedFormula = dylanData.ufrComms[randomRow]?.[randomCol] || ''
    } else {
      const parityKeys = Object.keys(dylanData.parity)
      const randomKey = parityKeys[Math.floor(Math.random() * parityKeys.length)]
      
      selectedRow = getLetter(randomKey)
      selectedCol = ''
      selectedFormula = dylanData.parity[randomKey] || ''
    }

    if (!selectedFormula || (bldType !== 'parity' && selectedRow === selectedCol)) {
      generateNextQuiz()
      return
    }

    setQuizPair({ 
      row: selectedRow, 
      col: selectedCol, 
      formula: selectedFormula, 
      engPair: `${selectedRow}${selectedCol}` 
    })
  }

  const handleTrainerResult = (isCorrect) => {
    setTotalCount(prev => prev + 1)
    if (isCorrect) {
      setCorrectCount(prev => prev + 1)
    }
    generateNextQuiz()
  }

  // Quick save memo during trainer session
  const handleTrainerSaveMemo = async () => {
    if (!newMemoInput.trim()) return
    const saved = await saveBldMemoToDb(quizPair.engPair, bldType, newMemoInput, '')
    setMemos((prev) => {
      const filtered = prev.filter(m => !(m.letter_pair === quizPair.engPair && m.type === bldType))
      return [...filtered, saved]
    })
  }

  const quizMemo = memos.find(
    (m) => m.letter_pair === quizPair.engPair && m.type === bldType
  )?.memo_text || ''

  // Letter selector lists
  const currentLetters = bldType === 'edges' 
    ? edgeRowKeys.map(k => getLetter(k)) 
    : (bldType === 'corners' ? cornerRowKeys.map(k => getLetter(k)) : Object.keys(dylanData.parity).map(k => getLetter(k)))

  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">3-Style 盲解訓練庫</h1>
          <p className="text-xs text-brand-gray-400 font-semibold uppercase tracking-wider mt-1">
            Dylan 3-Style 記憶表 - 支援邊塊 (UF)、角塊 (UFR) 與 Parity 奇偶公式練習
          </p>
        </div>
        
        <div className="flex gap-2 self-start md:self-auto">
          {/* Language Toggle */}
          <button
            onClick={() => setUseBopomofo(!useBopomofo)}
            className="py-2 px-3 border border-brand-gray-200 dark:border-brand-gray-800 hover:bg-brand-gray-50 dark:hover:bg-brand-gray-950 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            {useBopomofo ? '切換英文 (A-X)' : '切換注音 (ㄅ-ㄩ)'}
          </button>

          <div className="flex bg-brand-gray-100 dark:bg-brand-gray-950 p-1.5 rounded-2xl gap-1">
            <button
              onClick={() => { setBldType('edges'); setTrainerActive(false); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                bldType === 'edges'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
              }`}
            >
              邊塊 (UF)
            </button>
            <button
              onClick={() => { setBldType('corners'); setTrainerActive(false); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                bldType === 'corners'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
              }`}
            >
              角塊 (UFR)
            </button>
            <button
              onClick={() => { setBldType('parity'); setTrainerActive(false); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all ${
                bldType === 'parity'
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
              }`}
            >
              Parity (奇偶)
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Formula Browser */}
        <div className="lg:col-span-7 bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 md:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black">公式與記憶查找 ({useBopomofo ? '注音符號模式' : '英文字母模式'})</h2>
            <p className="text-xs text-brand-gray-400 mt-1">選取字母組合，快速查找對應的 Commutator 步驟與自訂助記詞</p>
          </div>

          {/* Letter Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1.5">
                {bldType === 'parity' ? '目標角塊' : '第一目標 (Row Target)'}
              </label>
              <select
                value={rowTarget}
                onChange={(e) => setRowTarget(e.target.value)}
                className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono"
              >
                {currentLetters.map(letter => (
                  <option key={letter} value={letter}>
                    {useBopomofo ? `${toBopomofo(letter)} ${getFullTargetLabel(bldType, letter, true)}` : `${letter} ${getFullTargetLabel(bldType, letter, true)}`}
                  </option>
                ))}
              </select>
            </div>

            {bldType !== 'parity' && (
              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1.5">第二目標 (Column Target)</label>
                <select
                  value={colTarget}
                  onChange={(e) => setColTarget(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-2xl p-3 text-sm font-semibold focus:outline-none focus:border-black dark:focus:border-white transition-colors font-mono"
                >
                  {currentLetters.map(letter => (
                    <option key={letter} value={letter} disabled={letter === rowTarget}>
                      {useBopomofo ? `${toBopomofo(letter)} ${getFullTargetLabel(bldType, letter, false)}` : `${letter} ${getFullTargetLabel(bldType, letter, false)}`}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Large display Card */}
          <div className="bg-brand-gray-50 dark:bg-brand-gray-950 rounded-3xl p-6 border border-brand-gray-100 dark:border-brand-gray-900 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-2xl font-black font-mono">
                {bldType === 'parity' 
                  ? `Parity [ ${useBopomofo ? toBopomofo(rowTarget) : rowTarget} ]` 
                  : `[ ${useBopomofo ? `${toBopomofo(rowTarget)}${toBopomofo(colTarget)}` : `${rowTarget}${colTarget}`} ]`}
              </span>
              <span className="text-xs font-bold text-brand-gray-400">
                Buffer: {bldType === 'edges' ? 'UF (C / ㄇ)' : (bldType === 'corners' ? 'UFR (C / ㄇ)' : 'UBL / UBR / UFL')}
              </span>
            </div>

            <div>
              <span className="text-[10px] text-brand-gray-400 uppercase font-bold block mb-1">公式 Commutator</span>
              <code className="text-base font-mono font-extrabold text-black dark:text-white bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-900 p-3 rounded-2xl block break-words min-h-[50px] leading-relaxed shadow-sm">
                {getFormula(bldType, rowTarget, colTarget)}
              </code>
            </div>

            {/* Custom Memory Hint */}
            <div className="pt-2">
              <span className="text-[10px] text-brand-gray-400 uppercase font-bold block mb-1 flex items-center justify-between">
                自訂盲解助記詞 (Letter Pair Memo)
                {!editingMemo && (
                  <button
                    onClick={() => setEditingMemo(true)}
                    className="text-[10px] text-brand-gray-500 hover:text-black dark:hover:text-white font-bold flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" /> 編輯助記詞
                  </button>
                )}
              </span>

              {editingMemo ? (
                <div className="flex gap-2 mt-1">
                  <input
                    type="text"
                    placeholder={useBopomofo ? `例如：${toBopomofo(rowTarget)}${toBopomofo(colTarget)} => ...` : `例如：${rowTarget}${colTarget} => ...`}
                    value={memoText}
                    onChange={(e) => setMemoText(e.target.value)}
                    className="flex-1 bg-white dark:bg-black border border-brand-gray-300 dark:border-brand-gray-800 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                  <button
                    onClick={handleSaveMemo}
                    className="bg-black dark:bg-white text-white dark:text-black px-4 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-colors duration-200 btn-active-scale text-xs"
                  >
                    <Save className="w-3.5 h-3.5" /> 儲存
                  </button>
                </div>
              ) : (
                <p className="text-sm font-medium italic min-h-[30px] flex items-center text-brand-gray-600 dark:text-brand-gray-300 bg-white dark:bg-black border border-brand-gray-150 dark:border-brand-gray-900 p-3 rounded-2xl">
                  {currentMemo || '尚未設定此字母組合的助記聯想詞。點選右上角進行設定！'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 3-Style Practice Trainer */}
        <div className="lg:col-span-5 bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 md:p-8 flex flex-col justify-between min-h-[440px] shadow-sm">
          <div>
            <div className="flex items-center justify-between border-b border-brand-gray-100 dark:border-brand-gray-900 pb-3 mb-4">
              <h2 className="text-lg font-black flex items-center gap-2">
                <Brain className="w-5 h-5 text-brand-gray-500" />
                刻意練習模組
              </h2>
              {/* Tab Selector */}
              <div className="flex bg-brand-gray-100 dark:bg-brand-gray-950 p-1 rounded-xl">
                <button
                  onClick={() => { setTrainerTab('comms'); setTrainerActive(false); }}
                  className={`py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
                    trainerTab === 'comms'
                      ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                      : 'text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
                  }`}
                >
                  公式背誦
                </button>
                <button
                  onClick={() => { setTrainerTab('memos'); setTrainerActive(false); }}
                  className={`py-1 px-3 rounded-lg text-[10px] font-bold transition-all ${
                    trainerTab === 'memos'
                      ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                      : 'text-brand-gray-400 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
                  }`}
                >
                  編碼刻意練習
                </button>
              </div>
            </div>

            {/* Memo practice configuration row */}
            {trainerTab === 'memos' && !trainerActive && (
              <div className="mb-4 space-y-2">
                <span className="text-[10px] uppercase font-bold text-brand-gray-400 block">訓練出題方向:</span>
                <div className="grid grid-cols-2 gap-2 bg-brand-gray-100 dark:bg-brand-gray-950 p-1 rounded-xl">
                  <button
                    onClick={() => setMemoDirection('pairToWord')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      memoDirection === 'pairToWord'
                        ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                        : 'text-brand-gray-400'
                    }`}
                  >
                    注音/字母 ➔ 文字 (Guess Word)
                  </button>
                  <button
                    onClick={() => setMemoDirection('wordToPair')}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      memoDirection === 'wordToPair'
                        ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                        : 'text-brand-gray-400'
                    }`}
                  >
                    文字 ➔ 注音/字母 (Guess Pair)
                  </button>
                </div>
              </div>
            )}
          </div>

          {!trainerActive ? (
            <div className="my-auto text-center py-8 space-y-4">
              <HelpCircle className="w-12 h-12 text-brand-gray-300 mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold">
                  {trainerTab === 'comms' ? '準備好抽測公式了嗎？' : '準備好背記憶編碼了嗎？'}
                </p>
                <p className="text-xs text-brand-gray-400 max-w-xs mx-auto">
                  {trainerTab === 'comms' 
                    ? `系統將會隨機抽測 [ ${bldType === 'edges' ? '邊塊' : (bldType === 'corners' ? '角塊' : '奇偶')} ] 的 Commutator 公式步驟。`
                    : `加倍強化您的編碼記憶速度，考驗注音字母與助記詞的直覺聯想。`
                  }
                </p>
              </div>
              <button
                onClick={startTrainer}
                className="py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-2xl hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 transition-colors btn-active-scale shadow-sm"
              >
                開始刻意練習
              </button>
            </div>
          ) : (
            <div className="my-auto py-4 space-y-6 flex flex-col items-center">
              {/* Question area */}
              <div className="text-center space-y-2 w-full">
                <span className="text-[10px] text-brand-gray-400 uppercase tracking-widest font-extrabold block">
                  {trainerTab === 'comms' 
                    ? '請在腦中回想公式' 
                    : (memoDirection === 'pairToWord' ? '請回想此組合的助記文字' : '請回想對應的字母注音組合')
                  }
                </span>

                {/* Trainer Tab Comms display */}
                {trainerTab === 'comms' && (
                  <div className="space-y-2">
                    <h3 className="text-6xl font-black font-mono tracking-tighter">
                      {bldType === 'parity' 
                        ? `Parity ${useBopomofo ? toBopomofo(quizPair.row) : quizPair.row}` 
                        : `${useBopomofo ? `${toBopomofo(quizPair.row)}${toBopomofo(quizPair.col)}` : `${quizPair.row} ${quizPair.col}`}`}
                    </h3>
                    {quizMemo && (
                      <p className="text-xs italic text-brand-gray-400">
                        記憶聯想: "{quizMemo}"
                      </p>
                    )}
                  </div>
                )}

                {/* Trainer Tab Memos display */}
                {trainerTab === 'memos' && (
                  <div className="space-y-2">
                    {memoDirection === 'pairToWord' ? (
                      <h3 className="text-6xl font-black font-mono tracking-tighter">
                        {bldType === 'parity' 
                          ? `${useBopomofo ? toBopomofo(quizPair.row) : quizPair.row}` 
                          : `${useBopomofo ? `${toBopomofo(quizPair.row)}${toBopomofo(quizPair.col)}` : `${quizPair.row}${quizPair.col}`}`}
                      </h3>
                    ) : (
                      <div className="py-4">
                        {quizMemo ? (
                          <h3 className="text-3xl font-black text-black dark:text-white bg-brand-gray-50 dark:bg-brand-gray-950 px-6 py-4 rounded-3xl border border-brand-gray-150 dark:border-brand-gray-900 inline-block">
                            {quizMemo}
                          </h3>
                        ) : (
                          <div className="text-xs text-brand-gray-400">
                            (此字組尚未設定助記詞，請顯示解答並立即新增)
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Show / Hide answer container */}
              <div className="w-full">
                {showTrainerFormula ? (
                  <div className="space-y-3 text-center animate-in fade-in slide-in-from-bottom-2 duration-200 w-full">
                    <span className="text-[10px] text-brand-gray-400 uppercase font-bold block">解答答案</span>
                    
                    {trainerTab === 'comms' ? (
                      <code className="text-sm font-mono font-extrabold text-black dark:text-white bg-brand-gray-50 dark:bg-brand-gray-950 p-3 rounded-2xl block border border-brand-gray-250 dark:border-brand-gray-900 break-words leading-relaxed select-all">
                        {quizPair.formula}
                      </code>
                    ) : (
                      /* Memos Trainer Answer Display */
                      <div className="space-y-3 bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-3xl p-4 text-xs">
                        <div className="flex justify-between items-center text-brand-gray-400">
                          <span>注音組合: <strong>{useBopomofo ? `${toBopomofo(quizPair.row)}${toBopomofo(quizPair.col)}` : `${quizPair.row}${quizPair.col}`}</strong></span>
                          <span>英文對應: <strong>{quizPair.engPair}</strong></span>
                        </div>
                        <div className="py-2 border-t border-brand-gray-150 dark:border-brand-gray-900">
                          <span className="text-[10px] text-brand-gray-400 uppercase block font-bold mb-1">當前助記詞 / 聯想字組:</span>
                          <span className="text-sm font-extrabold text-black dark:text-white">
                            {quizMemo || '(尚未設定，請於下方欄位快速設定)'}
                          </span>
                        </div>

                        {/* Quick save box within trainer */}
                        <div className="flex gap-2 pt-2 border-t border-brand-gray-150 dark:border-brand-gray-900">
                          <input
                            type="text"
                            placeholder="快速設定此字組的助記詞..."
                            value={newMemoInput}
                            onChange={(e) => setNewMemoInput(e.target.value)}
                            className="flex-1 bg-white dark:bg-black border border-brand-gray-300 dark:border-brand-gray-800 rounded-xl px-2.5 py-1.5 text-xs focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={handleTrainerSaveMemo}
                            className="bg-black dark:bg-white text-white dark:text-black px-3 rounded-xl font-bold hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100"
                          >
                            儲存
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTrainerFormula(true)}
                    className="w-full py-3.5 border border-dashed border-brand-gray-300 dark:border-brand-gray-800 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-brand-gray-50 dark:hover:bg-brand-gray-950 transition-colors"
                  >
                    <Eye className="w-4 h-4" /> 顯示解答
                  </button>
                )}
              </div>

              {/* Success statistics */}
              <div className="text-[10px] font-bold text-brand-gray-400 flex gap-4">
                <span>答對次數: {correctCount} / {totalCount} 次</span>
                <span>成功率: {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%</span>
              </div>

              {/* Score Buttons */}
              <div className="flex gap-2 w-full pt-4">
                {showTrainerFormula ? (
                  <>
                    <button
                      onClick={() => handleTrainerResult(false)}
                      className="flex-1 py-3 px-4 border border-red-200 dark:border-red-950 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl font-bold text-xs transition-colors duration-200 btn-active-scale text-center"
                    >
                      不熟練 (Hard)
                    </button>
                    <button
                      onClick={() => handleTrainerResult(true)}
                      className="flex-1 py-3 px-4 bg-black dark:bg-white text-white dark:text-black hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 rounded-xl font-bold text-xs transition-colors duration-200 btn-active-scale text-center"
                    >
                      已記住 (Easy)
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setTrainerActive(false)}
                    className="w-full py-3 border border-brand-gray-200 dark:border-brand-gray-800 text-brand-gray-500 rounded-xl font-bold text-xs text-center hover:bg-brand-gray-50 dark:hover:bg-brand-gray-950 transition-colors"
                  >
                    結束練習
                  </button>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-4 pt-3 border-t border-brand-gray-100 dark:border-brand-gray-900 text-xs text-brand-gray-400 flex justify-between items-center">
            <span>盲解目標數: {currentLetters.length}個</span>
            {trainerActive && (
              <button 
                onClick={generateNextQuiz}
                className="flex items-center gap-1 hover:text-black dark:hover:text-white font-bold transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                跳過換一題
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Blindfold
