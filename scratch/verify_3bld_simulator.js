// scratch/verify_3bld_simulator.js
// 3x3 BLD Tracing Engine

// Corners mapping:
// Pieces: 0:UBL, 1:UBR, 2:UFR (Buffer), 3:UFL, 4:DBL, 5:DBR, 6:DFR, 7:DFL
// Corner sticker indices: 3 per piece.
// 0: U/D sticker, 1: Clockwise from U/D (looking from outside), 2: Counter-clockwise
const cornerStickers = [
  ['A', 'E', 'R'], // 0: UBL
  ['B', 'Q', 'N'], // 1: UBR
  ['C', 'M', 'J'], // 2: UFR (Buffer)
  ['D', 'I', 'F'], // 3: UFL
  ['X', 'H', 'S'], // 4: DBL
  ['X', 'H', 'S'], // Wait! Let's verify DBL slot. 
  // Let's check: DBL has D-sticker (X), L-sticker (H), B-sticker (S).
  // Wait, let's map them carefully.
];

// Let's write the full mappings in a clean class
class Cube3x3 {
  constructor() {
    // Corner Permutation (cp) and Orientation (co)
    this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];
    
    // Edge Permutation (ep) and Orientation (eo)
    // 0: UB, 1: UR, 2: UF (Buffer), 3: UL, 4: BL, 5: BR, 6: FR, 7: FL, 8: DF, 9: DR, 10: DB, 11: DL
    this.ep = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    this.eo = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  // U move (clockwise)
  U() {
    this.cycle(this.cp, [3, 2, 1, 0]);
    this.cycle(this.co, [3, 2, 1, 0]);
    
    this.cycle(this.ep, [3, 0, 1, 2]);
    this.cycle(this.eo, [3, 0, 1, 2]);
  }

  // D move (clockwise)
  D() {
    this.cycle(this.cp, [4, 5, 6, 7]);
    this.cycle(this.co, [4, 5, 6, 7]);
    
    this.cycle(this.ep, [8, 9, 10, 11]);
    this.cycle(this.eo, [8, 9, 10, 11]);
  }

  // R move (clockwise)
  R() {
    this.cycle(this.cp, [2, 1, 5, 6], [1, 2, 1, 2]);
    this.cycle(this.ep, [1, 5, 9, 6]);
    // Edge orientations for R/L moves change in standard orientation scheme if we use a specific EO rule.
    // In WCA standard, EO is defined relative to F/B faces (or L/R).
    // Let's implement standard EO changes for R, L, F, B moves.
    // If we use the standard U/D primary sticker rule (solved orientation has U/D sticker on U/D, and F/B sticker on F/B):
    // For R move:
    // - UR (1) goes to BR (5) (U sticker goes to B, R sticker stays on R). So orientation is flipped!
    // - BR (5) goes to DR (9) (B sticker goes to D, R sticker stays on R). So orientation is flipped!
    // - DR (9) goes to FR (6) (D sticker goes to F, R sticker stays on R). So orientation is flipped!
    // - FR (6) goes to UR (1) (F sticker goes to U, R sticker stays on R). So orientation is flipped!
    // Let's verify if all 4 are flipped: yes, in this scheme, all 4 R edges are flipped on R turn!
    this.cycle(this.eo, [1, 5, 9, 6], null, true);
  }

  // L move (clockwise)
  L() {
    this.cycle(this.cp, [0, 3, 7, 4], [1, 2, 1, 2]);
    this.cycle(this.ep, [3, 7, 11, 4]);
    this.cycle(this.eo, [3, 7, 11, 4], null, true);
  }

  // F move (clockwise)
  F() {
    this.cycle(this.cp, [3, 2, 6, 7], [1, 2, 1, 2]);
    this.cycle(this.ep, [2, 6, 8, 7]);
    // For F move, U/D stickers go to L/R, so they flip!
    this.cycle(this.eo, [2, 6, 8, 7], null, true);
  }

  // B move (clockwise)
  B() {
    this.cycle(this.cp, [1, 0, 4, 5], [1, 2, 1, 2]);
    this.cycle(this.ep, [0, 4, 10, 5]);
    this.cycle(this.eo, [0, 4, 10, 5], null, true);
  }

  // Helper to cycle 4 elements in an array
  cycle(arr, indices, twist = null, flip = false) {
    const tempVal = arr[indices[3]];
    arr[indices[3]] = arr[indices[2]];
    arr[indices[2]] = arr[indices[1]];
    arr[indices[1]] = arr[indices[0]];
    arr[indices[0]] = tempVal;

    if (twist) {
      // Rotate orientations
      const tempO = arr[indices[3]];
      arr[indices[3]] = (arr[indices[2]] + twist[2]) % 3;
      arr[indices[2]] = (arr[indices[1]] + twist[1]) % 3;
      arr[indices[1]] = (arr[indices[0]] + twist[0]) % 3;
      arr[indices[0]] = (tempO + twist[3]) % 3;
    } else if (flip) {
      // Flip edge orientations (0 <-> 1)
      indices.forEach(idx => {
        arr[idx] = 1 - arr[idx];
      });
    }
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
    const tokens = scramble.trim().split(/\s+/);
    tokens.forEach(t => {
      if (t) this.applyMove(t);
    });
  }
}

const cube = new Cube3x3();
cube.applyScramble("R U R' U'");
console.log("Corners Perm:", cube.cp);
console.log("Corners Orient:", cube.co);
console.log("Edges Perm:", cube.ep);
console.log("Edges Orient:", cube.eo);
