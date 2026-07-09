// Complete WCA Scramble Generator for All Official Events (Zero-dependency)
import { sq1Scrambler } from './scramble_sq1'


// 2x2x2 Scrambler (11 moves, using U, R, F to avoid axis redundancies)
const generate222Scramble = () => {
  const faces = ['R', 'U', 'F']
  const modifiers = ['', "'", '2']
  const scramble = []
  let lastFace = -1

  for (let i = 0; i < 11; i++) {
    let faceIdx
    do {
      faceIdx = Math.floor(Math.random() * faces.length)
    } while (faceIdx === lastFace)
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    scramble.push(faces[faceIdx] + modifier)
    lastFace = faceIdx
  }
  return scramble.join(' ')
}

// 3x3x3 Scrambler (21 moves)
const generate333Scramble = () => {
  const faces = ['R', 'L', 'U', 'D', 'F', 'B']
  const modifiers = ['', "'", '2']
  const scramble = []
  let prevAxis = -1
  let prevFace = -1

  for (let i = 0; i < 21; i++) {
    let faceIdx, axisIdx
    do {
      faceIdx = Math.floor(Math.random() * faces.length)
      axisIdx = Math.floor(faceIdx / 2) // 0: R/L, 1: U/D, 2: F/B
    } while (
      axisIdx === prevAxis && 
      (faceIdx === prevFace || 
        (scramble.length > 1 && 
         Math.floor(faces.indexOf(scramble[scramble.length - 2].charAt(0)) / 2) === axisIdx)
      )
    )

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    scramble.push(faces[faceIdx] + modifier)
    prevAxis = axisIdx
    prevFace = faceIdx
  }
  return scramble.join(' ')
}

// Big Cubes Scrambler (4x4x4: 40 moves, 5x5x5: 60 moves, 6x6x6: 80 moves, 7x7x7: 100 moves)
const generateBigCubeScramble = (movesCount, includeDoubleLayers) => {
  const baseFaces = ['R', 'L', 'U', 'D', 'F', 'B']
  const modifiers = ['', "'", '2']
  const scramble = []
  let prevAxis = -1
  let prevFace = -1

  for (let i = 0; i < movesCount; i++) {
    let faceIdx, axisIdx
    do {
      faceIdx = Math.floor(Math.random() * baseFaces.length)
      axisIdx = Math.floor(faceIdx / 2)
    } while (
      axisIdx === prevAxis && 
      (faceIdx === prevFace || 
        (scramble.length > 1 && 
         Math.floor(baseFaces.indexOf(scramble[scramble.length - 2].charAt(0)) / 2) === axisIdx)
      )
    )

    // Decide turn layer: Outer (R), Double (Rw), or Triple for 6x6/7x7 (3Rw)
    let layerPrefix = ''
    if (includeDoubleLayers) {
      const rand = Math.random()
      if (rand < 0.35) {
        layerPrefix = 'w' // e.g. Rw
      } else if (movesCount >= 80 && rand < 0.5) {
        layerPrefix = '3' // 3Rw for 6x6 / 7x7
      }
    }

    const faceLetter = baseFaces[faceIdx]
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    
    if (layerPrefix === '3') {
      scramble.push(`3${faceLetter}w${modifier}`)
    } else if (layerPrefix === 'w') {
      scramble.push(`${faceLetter}w${modifier}`)
    } else {
      scramble.push(faceLetter + modifier)
    }

    prevAxis = axisIdx
    prevFace = faceIdx
  }
  return scramble.join(' ')
}

// Pyraminx Scrambler (11 moves + tips)
const generatePyraminxScramble = () => {
  const faces = ['U', 'L', 'R', 'B']
  const modifiers = ['', "'"]
  const scramble = []
  let lastFace = -1

  // 11 core moves
  for (let i = 0; i < 11; i++) {
    let faceIdx
    do {
      faceIdx = Math.floor(Math.random() * faces.length)
    } while (faceIdx === lastFace)
    
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    scramble.push(faces[faceIdx] + modifier)
    lastFace = faceIdx
  }

  // WCA corner tips: u, l, r, b
  const tips = ['u', 'l', 'r', 'b']
  tips.forEach(tip => {
    if (Math.random() < 0.5) {
      const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
      scramble.push(tip + modifier)
    }
  })
  
  return scramble.join(' ')
}

// Skewb Scrambler (11 moves)
const generateSkewbScramble = () => {
  const faces = ['U', 'L', 'R', 'B']
  const modifiers = ['', "'"]
  const scramble = []
  let lastFace = -1

  for (let i = 0; i < 11; i++) {
    let faceIdx
    do {
      faceIdx = Math.floor(Math.random() * faces.length)
    } while (faceIdx === lastFace)

    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]
    scramble.push(faces[faceIdx] + modifier)
    lastFace = faceIdx
  }
  return scramble.join(' ')
}

// Megaminx Scrambler (70 moves: WCA standard layout)
const generateMegaminxScramble = () => {
  const scramble = []
  const ROptions = ['R++', 'R--']
  const DOptions = ['D++', 'D--']
  const UOptions = ['U', "U'"]

  // 7 lines of 10 moves each
  for (let line = 0; line < 7; line++) {
    const lineMoves = []
    for (let pair = 0; pair < 5; pair++) {
      const RMove = ROptions[Math.floor(Math.random() * ROptions.length)]
      const DMove = DOptions[Math.floor(Math.random() * DOptions.length)]
      lineMoves.push(RMove, DMove)
    }
    const UMove = UOptions[Math.floor(Math.random() * UOptions.length)]
    lineMoves.push(UMove)
    scramble.push(lineMoves.join(' '))
  }
  return scramble.join('\n')
}

// Clock Scrambler (WCA Clock Pin / Dial turns)
const generateClockScramble = () => {
  const pins = ['UR', 'DR', 'DL', 'UL']
  const turns = []
  
  pins.forEach(pin => {
    const amount = Math.floor(Math.random() * 12) - 5 // -5 to 6
    if (amount !== 0) {
      turns.push(`${pin}${amount >= 0 ? '+' : ''}${amount}`)
    }
  })

  // Pin state turns
  const extraPins = ['U', 'R', 'D', 'L', 'ALL']
  extraPins.forEach(pin => {
    const amount = Math.floor(Math.random() * 12) - 5
    if (amount !== 0) {
      turns.push(`${pin}${amount >= 0 ? '+' : ''}${amount}`)
    }
  })

  // Y2 flip indicator
  turns.push('y2')

  // Back pin states turns
  const backPins = ['U', 'R', 'D', 'L', 'ALL']
  backPins.forEach(pin => {
    const amount = Math.floor(Math.random() * 12) - 5
    if (amount !== 0) {
      turns.push(`${pin}${amount >= 0 ? '+' : ''}${amount}`)
    }
  })

  // Pin states up/down at the end
  const pinStates = []
  pins.forEach(pin => {
    if (Math.random() < 0.5) {
      pinStates.push(pin)
    }
  })
  
  if (pinStates.length > 0) {
    turns.push(pinStates.join(' '))
  }

  return turns.join(' ')
}

// Stateful WCA Random State Square-1 Scrambler from qqTimer
const generateSq1Scramble = () => {
  try {
    return sq1Scrambler.getRandomScramble().scramble;
  } catch (e) {
    console.error('Error generating qqTimer SQ1 scramble, falling back:', e);
    return "(0,0) /";
  }
}

// Global router matching WCA event codes
export const generateScramble = (type = '333') => {
  switch (type) {
    case '222':
      return generate222Scramble()
    case '333':
      return generate333Scramble()
    case '444':
      return generateBigCubeScramble(40, true)
    case '555':
      return generateBigCubeScramble(60, true)
    case '666':
      return generateBigCubeScramble(80, true)
    case '777':
      return generateBigCubeScramble(100, true)
    case 'pyram':
      return generatePyraminxScramble()
    case 'skewb':
      return generateSkewbScramble()
    case 'minx':
      return generateMegaminxScramble()
    case 'clock':
      return generateClockScramble()
    case 'sq1':
      return generateSq1Scramble()
    default:
      return generate333Scramble()
  }
}

// Puzzle display names mapping
export const WCA_PUZZLES = [
  { code: '333', name: '3x3x3 Rubik Cube' },
  { code: '222', name: '2x2x2 Pocket Cube' },
  { code: '444', name: '4x4x4 Rubik Revenge' },
  { code: '555', name: '5x5x5 Professor Cube' },
  { code: '666', name: '6x6x6 V-Cube 6' },
  { code: '777', name: '7x7x7 V-Cube 7' },
  { code: 'pyram', name: 'Pyraminx' },
  { code: 'skewb', name: 'Skewb' },
  { code: 'minx', name: 'Megaminx' },
  { code: 'clock', name: 'Rubik Clock' },
  { code: 'sq1', name: 'Square-1' }
]
