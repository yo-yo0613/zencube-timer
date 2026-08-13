// src/utils/bldTracer.js

// Corners mapping:
// Pieces: 0:UBL, 1:UBR, 2:UFR (Buffer), 3:UFL, 4:DBL, 5:DBR, 6:DFR, 7:DFL
export const cornerStickers = [
  ['A', 'E', 'R'], // 0: UBL (U, L, B)
  ['B', 'Q', 'N'], // 1: UBR (U, B, R)
  ['C', 'M', 'J'], // 2: UFR (U, R, F) - Buffer!
  ['D', 'I', 'F'], // 3: UFL (U, F, L)
  ['X', 'H', 'S'], // 4: DBL (D, L, B)
  ['W', 'T', 'O'], // 5: DBR (D, B, R)
  ['V', 'P', 'K'], // 6: DFR (D, R, F)
  ['U', 'L', 'G']  // 7: DFL (D, F, L)
];

// Edges mapping:
// 0: UB, 1: UR, 2: UF (Buffer), 3: UL, 4: BL, 5: BR, 6: FR, 7: FL, 8: DF, 9: DR, 10: DB, 11: DL
export const edgeStickers = [
  ['A', 'Q'], // 0: UB (U, B)
  ['B', 'M'], // 1: UR (U, R)
  ['C', 'I'], // 2: UF (U, F) - Buffer!
  ['D', 'E'], // 3: UL (U, L)
  ['R', 'H'], // 4: BL (B, L)
  ['T', 'N'], // 5: BR (B, R)
  ['J', 'P'], // 6: FR (F, R)
  ['L', 'F'], // 7: FL (F, L)
  ['U', 'K'], // 8: DF (D, F)
  ['V', 'O'], // 9: DR (D, R)
  ['W', 'S'], // 10: DB (D, B)
  ['X', 'G']  // 11: DL (D, L)
];

export class Cube3x3 {
  constructor() {
    this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];
    this.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  cycle(arr, indices) {
    const temp = arr[indices[3]];
    arr[indices[3]] = arr[indices[2]];
    arr[indices[2]] = arr[indices[1]];
    arr[indices[1]] = arr[indices[0]];
    arr[indices[0]] = temp;
  }

  cycleTwist(arr, indices, twist) {
    const temp = arr[indices[3]];
    arr[indices[3]] = (arr[indices[2]] + twist[2]) % 3;
    arr[indices[2]] = (arr[indices[1]] + twist[1]) % 3;
    arr[indices[1]] = (arr[indices[0]] + twist[0]) % 3;
    arr[indices[0]] = (temp + twist[3]) % 3;
  }

  cycleFlip(arr, indices) {
    const temp = arr[indices[3]];
    arr[indices[3]] = 1 - arr[indices[2]];
    arr[indices[2]] = 1 - arr[indices[1]];
    arr[indices[1]] = 1 - arr[indices[0]];
    arr[indices[0]] = 1 - temp;
  }

  U() {
    this.cycle(this.cp, [0, 3, 2, 1]);
    this.cycle(this.co, [0, 3, 2, 1]);
    this.cycle(this.ep, [0, 3, 2, 1]);
    this.cycle(this.eo, [0, 3, 2, 1]);
  }

  D() {
    this.cycle(this.cp, [4, 5, 6, 7]);
    this.cycle(this.co, [4, 5, 6, 7]);
    this.cycle(this.ep, [10, 9, 8, 11]);
    this.cycle(this.eo, [10, 9, 8, 11]);
  }

  R() {
    this.cycle(this.cp, [1, 2, 6, 5]);
    this.cycleTwist(this.co, [1, 2, 6, 5], [1, 2, 1, 2]);
    this.cycle(this.ep, [1, 6, 9, 5]);
    this.cycleFlip(this.eo, [1, 6, 9, 5]);
  }

  L() {
    this.cycle(this.cp, [3, 0, 4, 7]);
    this.cycleTwist(this.co, [3, 0, 4, 7], [1, 2, 1, 2]);
    this.cycle(this.ep, [3, 4, 11, 7]);
    this.cycleFlip(this.eo, [3, 4, 11, 7]);
  }

  F() {
    this.cycle(this.cp, [2, 3, 7, 6]);
    this.cycleTwist(this.co, [2, 3, 7, 6], [1, 2, 1, 2]);
    this.cycle(this.ep, [2, 7, 8, 6]);
    this.cycleFlip(this.eo, [2, 7, 8, 6]);
  }

  B() {
    this.cycle(this.cp, [0, 1, 5, 4]);
    this.cycleTwist(this.co, [0, 1, 5, 4], [1, 2, 1, 2]);
    this.cycle(this.ep, [0, 5, 10, 4]);
    this.cycleFlip(this.eo, [0, 5, 10, 4]);
  }

  applyMove(move) {
    const times = move.endsWith("'") ? 3 : (move.endsWith("2") ? 2 : 1);
    const base = move.replace(/['2]/g, "");
    for (let i = 0; i < times; i++) {
      if (base === "U") this.U();
      else if (base === "D") this.D();
      else if (base === "R") this.R();
      else if (base === "L") this.L();
      else if (base === "F") this.F();
      else if (base === "B") this.B();
    }
  }

  applyScramble(scramble) {
    if (!scramble) return;
    scramble.trim().split(/\s+/).forEach(t => {
      if (t) this.applyMove(t);
    });
  }

  getCornerSticker(pos, orient) {
    const piece = this.cp[pos];
    const twist = this.co[pos];
    const solvedOrient = (orient - twist + 3) % 3;
    return cornerStickers[piece][solvedOrient];
  }

  getEdgeSticker(pos, orient) {
    const piece = this.ep[pos];
    const flip = this.eo[pos];
    const solvedOrient = (orient - flip + 2) % 2;
    return edgeStickers[piece][solvedOrient];
  }
}

export const edgeBufferOptions = [
  { index: 2, code: 'UF', name: 'UF (C/I - 3-Style)' },
  { index: 8, code: 'DF', name: 'DF (U/K - M2)' },
  { index: 0, code: 'UB', name: 'UB (A/Q)' },
  { index: 3, code: 'UL', name: 'UL (D/E)' },
  { index: 1, code: 'UR', name: 'UR (B/M)' }
];

export const cornerBufferOptions = [
  { index: 2, code: 'UFR', name: 'UFR (C/M/J - 3-Style)' },
  { index: 0, code: 'UBL', name: 'UBL (A/E/R - OP)' },
  { index: 3, code: 'UFL', name: 'UFL (D/I/F)' },
  { index: 1, code: 'UBR', name: 'UBR (B/Q/N)' }
];

export function traceCorners(cube, bufferIndex = 2) {
  const visited = new Set();
  const targets = [];
  visited.add(bufferIndex);
  
  let currentPos = bufferIndex;
  let currentOrient = 0;
  
  while (true) {
    const label = cube.getCornerSticker(currentPos, currentOrient);
    let targetPiece = -1;
    let targetOrient = -1;
    for (let p = 0; p < 8; p++) {
      const idx = cornerStickers[p].indexOf(label);
      if (idx !== -1) {
        targetPiece = p;
        targetOrient = idx;
        break;
      }
    }
    
    if (targetPiece === bufferIndex) break;
    
    targets.push(label);
    visited.add(targetPiece);
    currentPos = targetPiece;
    currentOrient = targetOrient;
  }
  
  for (let p = 0; p < 8; p++) {
    if (visited.has(p)) continue;
    if (cube.cp[p] === p && cube.co[p] === 0) {
      visited.add(p);
      continue;
    }
    
    let startLabel = cornerStickers[p][0];
    targets.push(startLabel);
    visited.add(p);
    currentPos = p;
    currentOrient = 0;
    
    while (true) {
      const label = cube.getCornerSticker(currentPos, currentOrient);
      let targetPiece = -1;
      let targetOrient = -1;
      for (let p2 = 0; p2 < 8; p2++) {
        const idx = cornerStickers[p2].indexOf(label);
        if (idx !== -1) {
          targetPiece = p2;
          targetOrient = idx;
          break;
        }
      }
      if (targetPiece === p) break;
      targets.push(label);
      visited.add(targetPiece);
      currentPos = targetPiece;
      currentOrient = targetOrient;
    }
  }
  return targets;
}

export function traceEdges(cube, bufferIndex = 2) {
  const visited = new Set();
  const targets = [];
  visited.add(bufferIndex);
  
  let currentPos = bufferIndex;
  let currentOrient = 0;
  
  while (true) {
    const label = cube.getEdgeSticker(currentPos, currentOrient);
    let targetPiece = -1;
    let targetOrient = -1;
    for (let p = 0; p < 12; p++) {
      const idx = edgeStickers[p].indexOf(label);
      if (idx !== -1) {
        targetPiece = p;
        targetOrient = idx;
        break;
      }
    }
    
    if (targetPiece === bufferIndex) break;
    
    targets.push(label);
    visited.add(targetPiece);
    currentPos = targetPiece;
    currentOrient = targetOrient;
  }
  
  for (let p = 0; p < 12; p++) {
    if (visited.has(p)) continue;
    if (cube.ep[p] === p && cube.eo[p] === 0) {
      visited.add(p);
      continue;
    }
    
    let startLabel = edgeStickers[p][0];
    targets.push(startLabel);
    visited.add(p);
    currentPos = p;
    currentOrient = 0;
    
    while (true) {
      const label = cube.getEdgeSticker(currentPos, currentOrient);
      let targetPiece = -1;
      let targetOrient = -1;
      for (let p2 = 0; p2 < 12; p2++) {
        const idx = edgeStickers[p2].indexOf(label);
        if (idx !== -1) {
          targetPiece = p2;
          targetOrient = idx;
          break;
        }
      }
      if (targetPiece === p) break;
      targets.push(label);
      visited.add(targetPiece);
      currentPos = targetPiece;
      currentOrient = targetOrient;
    }
  }
  return targets;
}

export function generateRandomScramble() {
  const faces = ["U", "D", "R", "L", "F", "B"];
  const modifiers = ["", "'", "2"];
  const scramble = [];
  let lastFace = "";
  
  for (let i = 0; i < 20; i++) {
    let face;
    do {
      face = faces[Math.floor(Math.random() * faces.length)];
    } while (face === lastFace);
    
    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(`${face}${mod}`);
    lastFace = face;
  }
  
  return scramble.join(" ");
}
