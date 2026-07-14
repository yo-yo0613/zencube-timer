import React, { useState, useEffect } from 'react'
import { Plus, Trash2, Search, BookOpen, Layers, Check, HelpCircle } from 'lucide-react'
import { fetchFormulasFromDb, saveFormulaToDb, deleteFormulaFromDb } from '../utils/db'
import { useAuth } from '../context/AuthContext'
import sq1Data from '../data/SQ1-CSP.json'

const PRELOADED_FORMULAS = [
  { id: 'p1', name: 'T-Perm (T 霸)', type: 'PLL', scramble: "F R U' R' U' R U R' F' R U R' U' R' F R F'", formula: "R U R' U' R' F R2 U' R' U' R U R' F'", memo: "標準 T 步，觀察左右兩側對色與一組 headlight", image_url: "" },
  { id: 'p2', name: 'Y-Perm (Y 霸)', type: 'PLL', scramble: "F R U' R' U' R U R' F' R U R' U' R' F R F'", formula: "F R U' R' U' R U R' F' R U R' U' R' F R F'", memo: "標準 Y 步，對稱角塊交換，兩組一對的 F2L 對色", image_url: "" },
  { id: 'p3', name: 'H-Perm (H 霸)', type: 'PLL', scramble: "M2 U M2 U2 M2 U M2", formula: "M2' U M2' U2 M2' U M2'", memo: "邊塊十字交叉對換", image_url: "" },
  { id: 'p4', name: 'Ua-Perm (Ua 霸)', type: 'PLL', scramble: "R U' R U R U R U' R' U' R2", formula: "M2' U M' U2 M U M2'", memo: "邊塊逆時針三循環", image_url: "" },
  { id: 'o1', name: 'OLL 21 (十字)', type: 'OLL', scramble: "R U2 R' U' R U R' U' R U' R'", formula: "(R U2 R' U' R U R' U') (R U' R')", memo: "頂面十字，四個角塊朝外", image_url: "" },
  { id: 'o2', name: 'OLL 22 (十字)', type: 'OLL', scramble: "R U2 R2 U' R2 U' R2 U2 R", formula: "R U2' R2' U' R2 U' R2' U2' R", memo: "頂面十字，大車頭", image_url: "" },
]

const Formulas = () => {
  const [formulas, setFormulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('ALL') // 'ALL', 'F2L', 'OLL', 'PLL', 'SQ1-CSP', 'CUSTOM'
  const [sq1FilterSubset, setSq1FilterSubset] = useState('ALL')
  const [showAddModal, setShowAddModal] = useState(false)
  
  // Form state
  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('PLL')
  const [newScramble, setNewScramble] = useState('')
  const [newFormula, setNewFormula] = useState('')
  const [newMemo, setNewMemo] = useState('')
  
  const { user } = useAuth()

  useEffect(() => {
    loadFormulas()
  }, [user])

  const loadFormulas = async () => {
    setLoading(true)
    const dbFormulas = await fetchFormulasFromDb()
    
    // Merge preloaded and database formulas
    const combined = [...dbFormulas]
    PRELOADED_FORMULAS.forEach(pre => {
      if (!combined.some(f => f.name === pre.name)) {
        combined.push(pre)
      }
    })
    
    setFormulas(combined)
    setLoading(false)
  }

  const handleAddFormula = async (e) => {
    e.preventDefault()
    if (!newName || !newFormula) {
      alert('請填寫公式名稱與公式步驟！')
      return
    }

    const formulaData = {
      name: newName,
      type: newType,
      scramble: newScramble,
      formula: newFormula,
      memo: newMemo,
      image_url: ''
    }

    const saved = await saveFormulaToDb(formulaData)
    setFormulas((prev) => [saved, ...prev])
    
    // Reset form
    setNewName('')
    setNewScramble('')
    setNewFormula('')
    setNewMemo('')
    setShowAddModal(false)
  }

  const handleDeleteFormula = async (id) => {
    if (confirm('確定要刪除此公式嗎？')) {
      await deleteFormulaFromDb(id)
      setFormulas((prev) => prev.filter((f) => f.id !== id))
    }
  }


  // Get all SQ1 CSP items formatted for display
  const getSq1Formulas = () => {
    const cases = []
    for (const [caseName, caseData] of Object.entries(sq1Data.cases)) {
      cases.push({
        id: `sq1-${caseName}`,
        name: caseName,
        type: 'SQ1-CSP',
        formula: Object.keys(caseData.algs).join(' 或 '),
        subset: caseData.subset,
        svgTop: caseData.svgTop || '',
        svgBottom: caseData.svgBottom || '',
        memo: `Square-1 CSP ${caseData.subset} 情況`
      })
    }
    return cases
  }


  // Combine formulas list dynamically based on active tab
  const getDisplayFormulas = () => {
    if (activeTab === 'SQ1-CSP') {
      const sq1List = getSq1Formulas()
      return sq1List.filter(f => 
        sq1FilterSubset === 'ALL' ? true : f.subset === sq1FilterSubset
      )
    }
    
    return formulas.filter(f => {
      if (activeTab === 'ALL') return f.type !== 'SQ1-CSP' // Exclude SQ1 from general ALL list
      return f.type.toUpperCase() === activeTab
    })
  }

  const filteredFormulas = getDisplayFormulas().filter((f) => {
    return f.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           f.formula.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (f.memo && f.memo.toLowerCase().includes(searchQuery.toLowerCase()))
  })

  const tabs = ['ALL', 'F2L', 'OLL', 'PLL', 'SQ1-CSP', 'CUSTOM']
  const sq1Subsets = ['ALL', '1 Slash', '2 Slashes', '3 Slashes', '4 Slashes', '5 Slashes', '6 Slashes', '7 Slashes']

  return (
    <div className="pb-24 px-4 md:px-8 max-w-7xl mx-auto pt-6">
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight">公式管理庫</h1>
          <p className="text-xs text-brand-gray-400 font-semibold uppercase tracking-wider mt-1">
            記錄、歸納並複習您的魔術方塊公式集 (已整合 SQ1-CSP 完整版)
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="py-3 px-6 bg-black dark:bg-white text-white dark:text-black font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 transition-colors duration-200 btn-active-scale shadow-sm self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          新增公式
        </button>
      </header>

      {/* Search and Tabs row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-brand-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder={activeTab === 'SQ1-CSP' ? "搜尋 SQ1 情況名稱 (如 Scallop)..." : "搜尋公式名稱、步驟或備忘錄..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-2xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
          />
        </div>
        
        {/* Subset Filters for SQ1 */}
        {activeTab === 'SQ1-CSP' && (
          <div className="flex items-center gap-2 bg-brand-gray-50 dark:bg-brand-gray-950 px-3 py-1.5 rounded-2xl border border-brand-gray-200 dark:border-brand-gray-800 overflow-x-auto">
            <span className="text-[10px] uppercase font-bold text-brand-gray-400 tracking-wider whitespace-nowrap">過濾 Slash 數:</span>
            <select
              value={sq1FilterSubset}
              onChange={(e) => setSq1FilterSubset(e.target.value)}
              className="bg-transparent border-none text-xs font-bold focus:outline-none text-black dark:text-white"
            >
              {sq1Subsets.map(subset => (
                <option key={subset} value={subset} className="bg-white dark:bg-black text-black dark:text-white">
                  {subset === 'ALL' ? '全部' : subset}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex bg-brand-gray-100 dark:bg-brand-gray-950 p-1.5 rounded-2xl overflow-x-auto gap-1 self-start lg:self-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(''); }}
              className={`py-2 px-4 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? 'bg-white dark:bg-black text-black dark:text-white shadow-sm'
                  : 'text-brand-gray-400 dark:text-brand-gray-500 hover:text-brand-gray-600 dark:hover:text-brand-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Formulas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFormulas.length === 0 ? (
          <div className="col-span-full text-center py-16 bg-brand-gray-50 dark:bg-brand-gray-950 rounded-3xl border border-brand-gray-100 dark:border-brand-gray-900">
            <BookOpen className="w-8 h-8 mx-auto text-brand-gray-400 mb-3" />
            <p className="text-sm font-semibold text-brand-gray-500">找不到相符的公式</p>
            <p className="text-xs text-brand-gray-400 mt-1">您可以點擊右上角「新增公式」按鈕來建立自己的公式！</p>
          </div>
        ) : (
          filteredFormulas.map((item) => (
            <div
              key={item.id}
              className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2rem] p-6 hover:border-black dark:hover:border-white transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <span className="px-2.5 py-1 bg-brand-gray-100 dark:bg-brand-gray-900 text-brand-gray-500 dark:text-brand-gray-400 font-bold rounded-lg text-[10px] tracking-wider uppercase">
                    {item.subset || item.type}
                  </span>
                  {/* Delete button (only show for non-preloaded or customized ones) */}
                  {(!item.id.startsWith('p') && !item.id.startsWith('o') && !item.id.startsWith('sq1')) && (
                    <button
                      onClick={() => handleDeleteFormula(item.id)}
                      className="p-1 text-brand-gray-400 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="text-lg font-black tracking-tight mb-2">{item.name}</h3>


                {/* SQ1 CSP: show recognition shape with clear flow label */}
                {item.type === 'SQ1-CSP' ? (
                  <div className="mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-[10px] text-brand-gray-400 uppercase font-semibold">遇到此形狀時</span>
                      <span className="text-[10px] text-brand-gray-300 dark:text-brand-gray-600">（辨識圖）</span>
                    </div>
                    {/* Static SVGs scraped from CubingApp — identical to reference */}
                    {(item.svgTop || item.svgBottom) ? (
                      <div className="flex items-center justify-center gap-3 bg-brand-gray-50 dark:bg-[#111] p-3 rounded-2xl border border-brand-gray-150 dark:border-brand-gray-800">
                        {item.svgTop && (
                          <div
                            className="w-20 h-20 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full [&_polygon]:stroke-[#111] dark:[&_polygon]:stroke-[#ddd]"
                            dangerouslySetInnerHTML={{ __html: item.svgTop }}
                          />
                        )}
                        {item.svgBottom && (
                          <div
                            className="w-20 h-20 flex-shrink-0 [&_svg]:w-full [&_svg]:h-full [&_polygon]:stroke-[#111] dark:[&_polygon]:stroke-[#ddd]"
                            dangerouslySetInnerHTML={{ __html: item.svgBottom }}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-brand-gray-400 text-center py-4">無圖</div>
                    )}
                    <div className="flex items-center gap-2 my-2 px-1">
                      <div className="flex-1 h-px bg-brand-gray-200 dark:bg-brand-gray-800" />
                      <span className="text-xs text-brand-gray-400 font-bold flex items-center gap-1">
                        ↓ 套用此公式
                      </span>
                      <div className="flex-1 h-px bg-brand-gray-200 dark:bg-brand-gray-800" />
                    </div>
                    <div>
                      <code className="text-sm font-mono font-extrabold text-black dark:text-white bg-brand-gray-100 dark:bg-brand-gray-900 p-2 rounded-xl block break-words border border-brand-gray-200 dark:border-brand-gray-800">
                        {item.formula}
                      </code>
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1">
                      <div className="flex-1 h-px bg-brand-gray-200 dark:bg-brand-gray-800" />
                      <span className="text-xs text-green-500 font-bold">✓ 還原方塊形狀</span>
                      <div className="flex-1 h-px bg-brand-gray-200 dark:bg-brand-gray-800" />
                    </div>
                  </div>
                ) : (
                  <>
                    {item.scramble && (
                      <div className="mb-3">
                        <span className="text-[10px] text-brand-gray-400 uppercase font-semibold block">打亂步驟:</span>
                        <code className="text-xs font-mono bg-brand-gray-50 dark:bg-brand-gray-950 p-1.5 rounded block break-all text-brand-gray-500 dark:text-brand-gray-400 mt-1">
                          {item.scramble}
                        </code>
                      </div>
                    )}

                    <div className="mb-4">
                      <span className="text-[10px] text-brand-gray-400 uppercase font-semibold block">公式解法:</span>
                      <code className="text-sm font-mono font-extrabold text-black dark:text-white bg-brand-gray-100 dark:bg-brand-gray-900 p-2 rounded-xl block break-words mt-1 border border-brand-gray-200 dark:border-brand-gray-800">
                        {item.formula}
                      </code>
                    </div>
                  </>
                )}

              </div>

              {item.memo && (
                <div className="mt-2 pt-3 border-t border-brand-gray-100 dark:border-brand-gray-900 text-xs text-brand-gray-400">
                  <span className="font-bold text-brand-gray-500 block mb-0.5">記憶備忘:</span>
                  {item.memo}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add Formula Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black border border-brand-gray-200 dark:border-brand-gray-800 rounded-[2.5rem] p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black">新增公式</h2>
            <form onSubmit={handleAddFormula} className="space-y-4 text-xs">
              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">公式名稱 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：PLL T-Perm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">分類 *</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value)}
                    className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  >
                    <option value="PLL">PLL</option>
                    <option value="OLL">OLL</option>
                    <option value="F2L">F2L</option>
                    <option value="SQ1-CSP">SQ1-CSP</option>
                    <option value="CUSTOM">自訂 (CUSTOM)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">打亂步驟 (非必填)</label>
                  <input
                    type="text"
                    placeholder="用於生成該情況"
                    value={newScramble}
                    onChange={(e) => setNewScramble(e.target.value)}
                    className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">公式步驟 *</label>
                <input
                  type="text"
                  required
                  placeholder="例如：(R U R' U') R' F R2 U' R' U'..."
                  value={newFormula}
                  onChange={(e) => setNewFormula(e.target.value)}
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-brand-gray-400 uppercase font-bold mb-1">記憶聯想 / 備忘錄 (非必填)</label>
                <textarea
                  placeholder="寫下如何觀察、手指如何擺放或口訣..."
                  value={newMemo}
                  onChange={(e) => setNewMemo(e.target.value)}
                  rows="3"
                  className="w-full bg-brand-gray-50 dark:bg-brand-gray-950 border border-brand-gray-200 dark:border-brand-gray-900 rounded-xl p-3 text-sm focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                />
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
                  className="flex-1 py-3 px-4 bg-black dark:bg-white text-white dark:text-black font-bold rounded-xl text-center hover:bg-brand-gray-800 dark:hover:bg-brand-gray-100 transition-colors"
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

export default Formulas
