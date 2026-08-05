// scratch/test_scrambles.js
const generateBigCubeScramble = (size) => {
  const movesCountMap = { 4: 40, 5: 60, 6: 80, 7: 100 }
  const movesCount = movesCountMap[size] || 40
  const maxDepthMap = { 4: 2, 5: 2, 6: 3, 7: 3 }
  const maxDepth = maxDepthMap[size] || 2

  const baseFaces = ['U', 'D', 'L', 'R', 'F', 'B']
  const modifiers = ['', "'", '2']
  const scramble = []
  
  let prevFace = -1
  let prevAxis = -1
  let axisCount = 0

  for (let i = 0; i < movesCount; i++) {
    let faceIdx, axisIdx
    do {
      faceIdx = Math.floor(Math.random() * baseFaces.length)
      axisIdx = Math.floor(faceIdx / 2)
    } while (
      faceIdx === prevFace ||
      (axisIdx === prevAxis && axisCount >= 2)
    )

    if (axisIdx === prevAxis) {
      axisCount++
    } else {
      prevAxis = axisIdx
      axisCount = 1
    }
    prevFace = faceIdx

    const depth = Math.floor(Math.random() * maxDepth) + 1
    const faceLetter = baseFaces[faceIdx]
    const modifier = modifiers[Math.floor(Math.random() * modifiers.length)]

    let moveStr = ''
    if (depth === 1) {
      moveStr = `${faceLetter}${modifier}`
    } else if (depth === 2) {
      moveStr = `${faceLetter}w${modifier}`
    } else {
      moveStr = `3${faceLetter}w${modifier}`
    }

    scramble.push(moveStr)
  }
  return scramble.join(' ')
}

console.log("=== 4x4 Scramble (40 moves) ===");
console.log(generateBigCubeScramble(4));
console.log("\n=== 5x5 Scramble (60 moves) ===");
console.log(generateBigCubeScramble(5));
console.log("\n=== 6x6 Scramble (80 moves) ===");
console.log(generateBigCubeScramble(6));
console.log("\n=== 7x7 Scramble (100 moves) ===");
console.log(generateBigCubeScramble(7));
