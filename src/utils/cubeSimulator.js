// Generic N x N x N Rubik's Cube State Simulator for Scramble Previews
// Supports 2x2x2 up to 7x7x7 WCA puzzles

const WCA_COLORS = {
  U: '#FFFF00', // Yellow
  D: '#FFFFFF', // White
  F: '#00FF00', // Green
  B: '#0000FF', // Blue
  L: '#FF8000', // Orange
  R: '#FF0000'  // Red
}

class CubeNxN {
  constructor(size = 3) {
    this.N = size
    this.reset()
  }

  reset() {
    this.faces = {
      U: Array.from({ length: this.N }, () => Array(this.N).fill('U')),
      D: Array.from({ length: this.N }, () => Array(this.N).fill('D')),
      F: Array.from({ length: this.N }, () => Array(this.N).fill('F')),
      B: Array.from({ length: this.N }, () => Array(this.N).fill('B')),
      L: Array.from({ length: this.N }, () => Array(this.N).fill('L')),
      R: Array.from({ length: this.N }, () => Array(this.N).fill('R'))
    }
  }

  rotateFaceClockwise(face) {
    const f = this.faces[face]
    const next = Array.from({ length: this.N }, () => Array(this.N))
    for (let r = 0; r < this.N; r++) {
      for (let c = 0; c < this.N; c++) {
        next[c][this.N - 1 - r] = f[r][c]
      }
    }
    this.faces[face] = next
  }

  applyMoveClockwise(face, depth) {
    const { U, D, F, B, L, R } = this.faces
    const N = this.N

    if (face === 'U') {
      // Rotate face U if depth reaches the outer layer (r = 0)
      if (depth === N) {
        this.rotateFaceClockwise('U')
      }
      for (let r = 0; r < depth; r++) {
        const temp = [...F[r]]
        for (let c = 0; c < N; c++) {
          F[r][c] = R[r][c]
          R[r][c] = B[r][c]
          B[r][c] = L[r][c]
          L[r][c] = temp[c]
        }
      }
    } 
    else if (face === 'D') {
      if (depth === N) {
        this.rotateFaceClockwise('D')
      }
      for (let d = 0; d < depth; d++) {
        const r = N - 1 - d
        const temp = [...F[r]]
        for (let c = 0; c < N; c++) {
          F[r][c] = L[r][c]
          L[r][c] = B[r][c]
          B[r][c] = R[r][c]
          R[r][c] = temp[c]
        }
      }
    } 
    else if (face === 'R') {
      if (depth === N) {
        this.rotateFaceClockwise('R')
      }
      for (let d = 0; d < depth; d++) {
        const c = N - 1 - d
        const temp = Array.from({ length: N }, (_, r) => U[r][c])
        for (let r = 0; r < N; r++) {
          U[r][c] = F[r][c]
          F[r][c] = D[r][c]
          D[r][c] = B[N - 1 - r][N - 1 - c]
          B[N - 1 - r][N - 1 - c] = temp[r]
        }
      }
    } 
    else if (face === 'L') {
      if (depth === N) {
        this.rotateFaceClockwise('L')
      }
      for (let c = 0; c < depth; c++) {
        const temp = Array.from({ length: N }, (_, r) => U[r][c])
        for (let r = 0; r < N; r++) {
          U[r][c] = B[N - 1 - r][N - 1 - c]
          B[N - 1 - r][N - 1 - c] = D[r][c]
          D[r][c] = F[r][c]
          F[r][c] = temp[r]
        }
      }
    } 
    else if (face === 'F') {
      if (depth === N) {
        this.rotateFaceClockwise('F')
      }
      for (let z = 0; z < depth; z++) {
        const temp = Array.from({ length: N }, (_, col) => U[N - 1 - z][col])
        for (let idx = 0; idx < N; idx++) {
          U[N - 1 - z][idx] = L[N - 1 - idx][N - 1 - z]
          L[N - 1 - idx][N - 1 - z] = D[z][N - 1 - idx]
          D[z][idx] = R[idx][z]
          R[idx][z] = temp[idx]
        }
      }
    } 
    else if (face === 'B') {
      if (depth === N) {
        this.rotateFaceClockwise('B')
      }
      for (let z = 0; z < depth; z++) {
        const temp = Array.from({ length: N }, (_, col) => U[z][col])
        for (let idx = 0; idx < N; idx++) {
          U[z][idx] = R[idx][N - 1 - z]
          R[idx][N - 1 - z] = D[N - 1 - z][N - 1 - idx]
          D[N - 1 - z][idx] = L[idx][z]
          L[idx][z] = temp[N - 1 - idx]
        }
      }
    }
  }

  applyMove(moveStr) {
    const match = moveStr.trim().match(/^(\d*)([UDRLFB])(w?)(['2]?)$/)
    if (!match) return

    const prefix = match[1]
    const face = match[2]
    const wide = match[3]
    const modifier = match[4]

    // Determine turn depth
    let depth = 1
    if (wide) {
      depth = prefix ? parseInt(prefix, 10) : 2
    }

    let count = 1
    if (modifier === "'") count = 3
    if (modifier === '2') count = 2

    for (let i = 0; i < count; i++) {
      this.applyMoveClockwise(face, depth)
    }
  }

  applyScramble(scrambleStr) {
    this.reset()
    if (!scrambleStr) return
    const moves = scrambleStr.split(/\s+/)
    moves.forEach(move => this.applyMove(move))
  }

  getColorsMap() {
    const map = {}
    Object.entries(this.faces).forEach(([face, grid]) => {
      map[face] = grid.flat().map(f => WCA_COLORS[f])
    })
    return map
  }
}

export const getCubeStateAfterScramble = (scrambleStr, size = 3) => {
  const cube = new CubeNxN(size)
  cube.applyScramble(scrambleStr)
  return cube.getColorsMap()
}
