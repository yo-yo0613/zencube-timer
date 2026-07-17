// src/lib/sq1ScrambleGenerator.js
import { sq1Scrambler } from '../utils/scramble_sq1.js';
import { invertSq1Alg } from './sq1Trace.js';

class SQ1Simulator {
  constructor() {
    // Solved state representation matching scrambler piece structure
    this.top = [0, 1, 2, 3, 4, 5, 6, 7];
    this.bottom = [8, 9, 10, 11, 12, 13, 14, 15];
  }

  performAlg(alg) {
    if (!alg) return;
    const trimmed = alg.trim();
    
    // Detect format: if contains bare "x,y" pattern (no parens around first occurrence)
    const hasBareFormat = /^-?\d+,-?\d+/.test(trimmed) || /^\s*\//.test(trimmed);
    
    if (hasBareFormat) {
      const parts = trimmed.split('/');
      for (let i = 0; i < parts.length; i++) {
        const seg = parts[i].trim();
        if (i === 0 && seg === '') {
          this.slash();
        } else if (seg !== '') {
          const numParts = seg.replace(/[()]/g, '').split(',');
          if (numParts.length === 2) {
            const topTurn = parseInt(numParts[0].trim(), 10);
            const bottomTurn = parseInt(numParts[1].trim(), 10);
            this.turnU(topTurn);
            this.turnD(bottomTurn);
          }
          if (i < parts.length - 1) {
            this.slash();
          }
        }
      }
    } else {
      const regex = /\/|\(-?\d+,\s*-?\d+\)/g;
      const matches = trimmed.match(regex) || [];
      for (const token of matches) {
        if (token === '/') {
          this.slash();
        } else {
          const mparts = token.replace(/\(|\)/g, '').split(',');
          const topTurn = parseInt(mparts[0], 10);
          const bottomTurn = parseInt(mparts[1], 10);
          this.turnU(topTurn);
          this.turnD(bottomTurn);
        }
      }
    }
  }

  slash() {
    let topCount = 0;
    let bottomCount = 0;
    let topIndex = 0;
    let bottomIndex = 0;

    for (const value of this.top) {
      topCount += value % 2 === 0 ? 2 : 1;
      topIndex += 1;
      if (topCount === 6) break;
    }
    for (const value of this.bottom) {
      bottomCount += value % 2 === 0 ? 2 : 1;
      bottomIndex += 1;
      if (bottomCount === 6) break;
    }

    const topPart = this.top.slice(topIndex);
    const bottomPart = this.bottom.slice(bottomIndex);
    this.top = this.top.slice(0, topIndex).concat(bottomPart.reverse());
    this.bottom = this.bottom.slice(0, bottomIndex).concat(topPart.reverse());
  }

  turnU(n) {
    this.top = this.turnFace(-n, this.top);
  }

  turnD(n) {
    this.bottom = this.turnFace(n, this.bottom);
  }

  turnFace(n, face) {
    let shift = n % 12;
    if (shift < 0) shift += 12;
    if (shift === 0) return face;
    let count = 0;
    let index = 0;
    for (const value of face) {
      if (count === shift) break;
      count += value % 2 === 0 ? 2 : 1;
      index += 1;
    }
    return face.slice(index).concat(face.slice(0, index));
  }
}

function isEvenPermutation(permutation) {
  let nInversions = 0;
  for (let i = 0; i < permutation.length; i++) {
    for (let j = i + 1; j < permutation.length; j++) {
      if (permutation[i] > permutation[j]) {
        nInversions++;
      }
    }
  }
  return nInversions % 2 === 0;
}

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Maps simulated piece value to WCA piece index (corners 0-7, edges 8-15)
const getPieceId = (val) => {
  if (val % 2 === 0) {
    // corner
    return val / 2;
  } else {
    // edge
    return 8 + (val - 1) / 2;
  }
};

export function generateRandomCspScramble(referenceAlg) {
  if (!referenceAlg) return '';

  // 1. Get shape slots by simulating reference scramble (which is inverted referenceAlg)
  const refScramble = invertSq1Alg(referenceAlg);
  const sim = new SQ1Simulator();
  sim.performAlg(refScramble);

  const topSlots = sim.top.map(v => v % 2 === 0 ? 'C' : 'E');
  const botSlots = sim.bottom.map(v => v % 2 === 0 ? 'C' : 'E');

  // 2. Get target parity of the reference scramble state
  const refPieces = [];
  for (const val of sim.top) {
    refPieces.push(getPieceId(val));
  }
  for (const val of sim.bottom) {
    refPieces.push(getPieceId(val));
  }

  const targetParity = isEvenPermutation(refPieces);

  // 3. Generate random state with matching parity
  let randCorners = shuffle([0, 1, 2, 3, 4, 5, 6, 7]);
  let randEdges = shuffle([8, 9, 10, 11, 12, 13, 14, 15]);

  const assemblePieces = () => {
    let cIdx = 0;
    let eIdx = 0;
    const pieces = [];
    for (const slot of topSlots) {
      if (slot === 'C') pieces.push(randCorners[cIdx++]);
      else pieces.push(randEdges[eIdx++]);
    }
    for (const slot of botSlots) {
      if (slot === 'C') pieces.push(randCorners[cIdx++]);
      else pieces.push(randEdges[eIdx++]);
    }
    return pieces;
  };

  let pieces = assemblePieces();
  if (isEvenPermutation(pieces) !== targetParity) {
    // Swap first two corners to flip parity
    [randCorners[0], randCorners[1]] = [randCorners[1], randCorners[0]];
    pieces = assemblePieces();
  }

  // 4. Build 24-element permutation array for solver
  const permutation = new Array(24);
  let pIdx = 0;
  let cIdx = 0;
  let eIdx = 0;

  for (const slot of topSlots) {
    if (slot === 'C') {
      const val = randCorners[cIdx++];
      permutation[pIdx++] = val;
      permutation[pIdx++] = val;
    } else {
      const val = randEdges[eIdx++];
      permutation[pIdx++] = val;
    }
  }

  pIdx = 12;
  for (const slot of botSlots) {
    if (slot === 'C') {
      const val = randCorners[cIdx++];
      permutation[pIdx++] = val;
      permutation[pIdx++] = val;
    } else {
      const val = randEdges[eIdx++];
      permutation[pIdx++] = val;
    }
  }

  // Shift left by 4 to align scrambled state slice line to index 2 (WCA solver format)
  const U_12 = permutation.slice(0, 12);
  const D_12 = permutation.slice(12, 24);
  const U_12_aligned = U_12.slice(4).concat(U_12.slice(0, 4));
  const D_12_aligned = D_12.slice(4).concat(D_12.slice(0, 4));
  const alignedPermutation = U_12_aligned.concat(D_12_aligned);

  // 5. Solve using WCA solver
  const middleIsSolved = Math.random() < 0.5;
  let solutionStr = '';
  try {
    solutionStr = sq1Scrambler.solve({ permutation: alignedPermutation, middleIsSolved }).join('');
  } catch (err) {
    console.error("SQ1 solver error:", err);
    return refScramble; // fallback to reference scramble
  }

  // 6. Scramble is the inverse of the solution
  return invertSq1Alg(solutionStr);
}
