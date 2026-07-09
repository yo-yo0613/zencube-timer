import { supabase } from '../supabaseClient'

// Helpers to get user id safely
const getUserId = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id || null
}

// ==========================================
// SOLVES MANAGEMENT
// ==========================================
export const fetchSolvesFromDb = async () => {
  const userId = await getUserId()
  if (!userId) {
    // Return from localStorage if offline/guest
    const local = localStorage.getItem('cube_solves')
    return local ? JSON.parse(local) : []
  }

  const { data, error } = await supabase
    .from('solves')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching solves:', error)
    // Fallback to local
    const local = localStorage.getItem('cube_solves')
    return local ? JSON.parse(local) : []
  }

  // Cache to localStorage
  localStorage.setItem('cube_solves', JSON.stringify(data))
  return data
}

export const saveSolveToDb = async (solve) => {
  const userId = await getUserId()
  const tempId = solve.id || crypto.randomUUID()
  const localSolve = { 
    ...solve, 
    id: tempId, 
    user_id: userId || 'guest', 
    session_id: solve.session_id || '1',
    notes: solve.notes || '' 
  }

  // Always update localStorage first
  const local = localStorage.getItem('cube_solves')
  const solvesList = local ? JSON.parse(local) : []
  const newSolves = [...solvesList, localSolve]
  localStorage.setItem('cube_solves', JSON.stringify(newSolves))

  if (!userId) return localSolve

  const { data, error } = await supabase
    .from('solves')
    .insert([{
      time_ms: solve.time_ms,
      scramble: solve.scramble,
      penalty: solve.penalty,
      puzzle_type: solve.puzzle_type || '333',
      session_id: solve.session_id || '1',
      notes: solve.notes || '',
      user_id: userId
    }])
    .select()

  if (error) {
    console.error('Error saving solve to Supabase:', error)
    return localSolve
  }

  // Replace temp item in local storage with actual db item
  const updatedSolves = newSolves.map(s => s.id === tempId ? data[0] : s)
  localStorage.setItem('cube_solves', JSON.stringify(updatedSolves))
  return data[0]
}

export const updateSolvePenaltyInDb = async (id, penalty) => {
  const userId = await getUserId()
  
  // Local storage update
  const local = localStorage.getItem('cube_solves')
  if (local) {
    const list = JSON.parse(local)
    const updated = list.map(s => s.id === id ? { ...s, penalty } : s)
    localStorage.setItem('cube_solves', JSON.stringify(updated))
  }

  if (!userId || typeof id === 'number' || String(id).length < 15) {
    // If it's guest or temp ID, we just update local storage
    return
  }

  const { error } = await supabase
    .from('solves')
    .update({ penalty })
    .eq('id', id)

  if (error) {
    console.error('Error updating penalty:', error)
  }
}

export const deleteSolveFromDb = async (id) => {
  const userId = await getUserId()

  // Local storage update
  const local = localStorage.getItem('cube_solves')
  if (local) {
    const list = JSON.parse(local)
    const updated = list.filter(s => s.id !== id)
    localStorage.setItem('cube_solves', JSON.stringify(updated))
  }

  if (!userId || typeof id === 'number' || String(id).length < 15) {
    return
  }

  const { error } = await supabase
    .from('solves')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting solve:', error)
  }
}

// Batch delete solves
export const deleteMultipleSolvesFromDb = async (idsList) => {
  const userId = await getUserId()

  // Local storage update
  const local = localStorage.getItem('cube_solves')
  if (local) {
    const list = JSON.parse(local)
    const updated = list.filter(s => !idsList.includes(s.id))
    localStorage.setItem('cube_solves', JSON.stringify(updated))
  }

  // Filter actual db uuid list
  const dbIds = idsList.filter(id => typeof id === 'string' && id.length > 15)
  if (!userId || dbIds.length === 0) return

  const { error } = await supabase
    .from('solves')
    .delete()
    .in('id', dbIds)

  if (error) {
    console.error('Error batch deleting solves:', error)
  }
}

// Clear active session solves
export const clearSessionSolvesFromDb = async (sessionId, puzzleType) => {
  const userId = await getUserId()

  // Local storage update
  const local = localStorage.getItem('cube_solves')
  if (local) {
    const list = JSON.parse(local)
    const updated = list.filter(s => !(s.session_id === sessionId && s.puzzle_type === puzzleType))
    localStorage.setItem('cube_solves', JSON.stringify(updated))
  }

  if (!userId) return

  const { error } = await supabase
    .from('solves')
    .delete()
    .eq('session_id', sessionId)
    .eq('puzzle_type', puzzleType)

  if (error) {
    console.error('Error clearing session solves:', error)
  }
}

// ==========================================
// FORMULAS MANAGEMENT (CFOP / Custom)
// ==========================================
export const fetchFormulasFromDb = async () => {
  const userId = await getUserId()
  if (!userId) {
    const local = localStorage.getItem('cube_formulas')
    return local ? JSON.parse(local) : []
  }

  const { data, error } = await supabase
    .from('formulas')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching formulas:', error)
    const local = localStorage.getItem('cube_formulas')
    return local ? JSON.parse(local) : []
  }

  localStorage.setItem('cube_formulas', JSON.stringify(data))
  return data
}

export const saveFormulaToDb = async (formula) => {
  const userId = await getUserId()
  const tempId = crypto.randomUUID()
  const localFormula = { ...formula, id: tempId, user_id: userId || 'guest', created_at: new Date().toISOString() }

  const local = localStorage.getItem('cube_formulas')
  const list = local ? JSON.parse(local) : []
  const newList = [localFormula, ...list]
  localStorage.setItem('cube_formulas', JSON.stringify(newList))

  if (!userId) return localFormula

  const { data, error } = await supabase
    .from('formulas')
    .insert([{
      name: formula.name,
      type: formula.type,
      scramble: formula.scramble || '',
      formula: formula.formula,
      memo: formula.memo || '',
      image_url: formula.image_url || '',
      user_id: userId
    }])
    .select()

  if (error) {
    console.error('Error saving formula:', error)
    return localFormula
  }

  const updatedList = newList.map(f => f.id === tempId ? data[0] : f)
  localStorage.setItem('cube_formulas', JSON.stringify(updatedList))
  return data[0]
}

export const deleteFormulaFromDb = async (id) => {
  const userId = await getUserId()
  
  const local = localStorage.getItem('cube_formulas')
  if (local) {
    const list = JSON.parse(local)
    const updated = list.filter(f => f.id !== id)
    localStorage.setItem('cube_formulas', JSON.stringify(updated))
  }

  if (!userId || String(id).length < 15) return

  const { error } = await supabase
    .from('formulas')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting formula:', error)
  }
}

// ==========================================
// BLIND MEMO PAIRS MANAGEMENT (3-Style / M2 / OP)
// ==========================================
export const fetchBldMemosFromDb = async () => {
  const userId = await getUserId()
  if (!userId) {
    const local = localStorage.getItem('cube_bld_memos')
    return local ? JSON.parse(local) : []
  }

  const { data, error } = await supabase
    .from('bld_memo')
    .select('*')

  if (error) {
    console.error('Error fetching BLD memos:', error)
    const local = localStorage.getItem('cube_bld_memos')
    return local ? JSON.parse(local) : []
  }

  localStorage.setItem('cube_bld_memos', JSON.stringify(data))
  return data
}

export const saveBldMemoToDb = async (letterPair, type, memoText, imageUrl) => {
  const userId = await getUserId()
  const localMemo = { letter_pair: letterPair, type, memo_text: memoText, image_url: imageUrl, user_id: userId || 'guest' }

  const local = localStorage.getItem('cube_bld_memos')
  const list = local ? JSON.parse(local) : []
  const filtered = list.filter(m => !(m.letter_pair === letterPair && m.type === type))
  const newList = [...filtered, localMemo]
  localStorage.setItem('cube_bld_memos', JSON.stringify(newList))

  if (!userId) return localMemo

  const { data, error } = await supabase
    .from('bld_memo')
    .upsert({
      user_id: userId,
      letter_pair: letterPair,
      type: type,
      memo_text: memoText,
      image_url: imageUrl
    }, { onConflict: 'user_id,letter_pair,type' })
    .select()

  if (error) {
    console.error('Error saving BLD memo:', error)
    return localMemo
  }

  const updatedList = newList.map(m => (m.letter_pair === letterPair && m.type === type) ? data[0] : m)
  localStorage.setItem('cube_bld_memos', JSON.stringify(updatedList))
  return data[0]
}
