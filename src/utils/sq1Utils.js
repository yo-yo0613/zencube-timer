/**
 * Utility functions for SQ1 algorithm manipulation
 */

/**
 * Parse a SQ1 algorithm string in bare format: "x,y / x,y / ..." or "/ x,y / x,y"
 * Also handles parenthesized format: "(x,y) / (x,y) / ..."
 * Returns an array of moves: { type: 'slash' } or { type: 'turn', topTurn: number, bottomTurn: number }
 */
export function parseSq1Alg(alg) {
  const moves = []
  const trimmed = alg.trim()
  const parts = trimmed.split('/')
  
  for (let i = 0; i < parts.length; i++) {
    const seg = parts[i].trim()
    if (i === 0 && seg === '') {
      // Leading slash (e.g. "/ x,y / ...")
      moves.push({ type: 'slash' })
    } else if (seg !== '') {
      // Parse turn "x,y" or "(x,y)"
      const cleaned = seg.replace(/[()]/g, '')
      const numParts = cleaned.split(',')
      if (numParts.length === 2) {
        moves.push({
          type: 'turn',
          topTurn: parseInt(numParts[0].trim(), 10),
          bottomTurn: parseInt(numParts[1].trim(), 10)
        })
      }
      // After a turn segment, if not the last, there was a slash
      if (i < parts.length - 1) {
        moves.push({ type: 'slash' })
      }
    }
  }
  
  return moves
}

/**
 * Invert a SQ1 algorithm.
 * Inversion: reverse the order of moves and negate each turn's U and D values.
 * 
 * @param {string} alg - Algorithm in bare format, e.g. "0,-2 / -2,0 / -1,-2 / -3,-3 /"
 * @returns {string} Inverted algorithm
 */
export function invertSq1Alg(alg) {
  if (!alg || !alg.trim()) return ''
  
  const moves = parseSq1Alg(alg)
  
  const inverted = moves.slice().reverse().map(m => {
    if (m.type === 'slash') return m
    return { type: 'turn', topTurn: -m.topTurn, bottomTurn: -m.bottomTurn }
  })
  
  let result = ''
  for (const m of inverted) {
    if (m.type === 'slash') {
      result += result ? ' /' : '/'
    } else {
      result += (result ? ' ' : '') + `${m.topTurn},${m.bottomTurn}`
    }
  }
  return result.trim()
}

/**
 * Get the scramble for a CSP case by inverting its primary algorithm.
 * @param {Object} caseData - Case data object with 'algs' property from SQ1-CSP.json
 * @returns {string} The scramble string for the case
 */
export function getCspScramble(caseData) {
  if (!caseData || !caseData.algs) return ''
  const primaryAlg = Object.keys(caseData.algs)[0] || ''
  return primaryAlg ? invertSq1Alg(primaryAlg) : ''
}
