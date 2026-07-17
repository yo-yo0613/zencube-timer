// scratch/check_2x2_cases.js
import fs from 'fs';

// We load the 2x2 database we generated
const dataPath = 'C:/Users/14L1/Desktop/qqtimer-version2/src/data/2x2algs.json';
if (!fs.existsSync(dataPath)) {
  console.error("2x2 database does not exist!");
  process.exit(1);
}

const cases = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// 2x2 Simulator
class Cube2x2 {
  constructor() {
    // Corners: 0:UFL, 1:UFR, 2:UBR, 3:UBL, 4:DFL, 5:DFR, 6:DBR, 7:DBL
    this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    // Orientation: 0, 1, 2
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  U() {
    const tempP = this.cp[0];
    this.cp[0] = this.cp[1];
    this.cp[1] = this.cp[2];
    this.cp[2] = this.cp[3];
    this.cp[3] = tempP;

    const tempO = this.co[0];
    this.co[0] = this.co[1];
    this.co[1] = this.co[2];
    this.co[2] = this.co[3];
    this.co[3] = tempO;
  }

  R() {
    const tempP = this.cp[1];
    this.cp[1] = this.cp[5];
    this.cp[5] = this.cp[6];
    this.cp[6] = this.cp[2];
    this.cp[2] = tempP;

    const tempO = this.co[1];
    this.co[1] = (this.co[5] + 2) % 3;
    this.co[5] = (this.co[6] + 1) % 3;
    this.co[6] = (this.co[2] + 2) % 3;
    this.co[2] = (tempO + 1) % 3;
  }

  F() {
    // F rotates UFL(0)->UFR(1)->DFR(5)->DFL(4)->UFL(0)
    const tempP = this.cp[0];
    this.cp[0] = this.cp[4];
    this.cp[4] = this.cp[5];
    this.cp[5] = this.cp[1];
    this.cp[1] = tempP;

    const tempO = this.co[0];
    this.co[0] = (this.co[4] + 2) % 3;
    this.co[4] = (this.co[5] + 1) % 3;
    this.co[5] = (this.co[1] + 2) % 3;
    this.co[1] = (tempO + 1) % 3;
  }

  // We only need U, R, F for CLL/EG1/EG2 since they are normally written with U, R, F (and y/x rotations)
  // Let's support x and y rotations as well
  y() {
    // y rotation rotates U layer (0->3->2->1->0) and D layer (4->7->6->5->4)
    // U layer: UFL(0)->UBL(3)->UBR(2)->UFR(1)->UFL(0) (counter-clockwise looking from top? No, y rotation is clockwise looking from top, which is same as U)
    this.U();
    
    // D layer clockwise: DFL(4)->DBL(7)->DBR(6)->DFR(5)->DFL(4)
    const tempP = this.cp[4];
    this.cp[4] = this.cp[5];
    this.cp[5] = this.cp[6];
    this.cp[6] = this.cp[7];
    this.cp[7] = tempP;

    const tempO = this.co[4];
    this.co[4] = this.co[5];
    this.co[5] = this.co[6];
    this.co[6] = this.co[7];
    this.co[7] = tempO;
  }

  applyMove(move) {
    if (move === "U") this.U();
    else if (move === "U'") { this.U(); this.U(); this.U(); }
    else if (move === "U2") { this.U(); this.U(); }
    else if (move === "R") this.R();
    else if (move === "R'") { this.R(); this.R(); this.R(); }
    else if (move === "R2") { this.R(); this.R(); }
    else if (move === "F") this.F();
    else if (move === "F'") { this.F(); this.F(); this.F(); }
    else if (move === "F2") { this.F(); this.F(); }
    else if (move === "y") this.y();
    else if (move === "y'") { this.y(); this.y(); this.y(); }
    else if (move === "y2") { this.y(); this.y(); }
    else if (move === "x") {
      // x rotation is same as R but for whole cube
      // R slice moves: 1->5->6->2->1
      // L slice moves (opposite of L, same as R direction): 0->4->7->3->0
      this.R();
      // Let's implement L slice rotation for x
      const tempP = this.cp[0];
      this.cp[0] = this.cp[3];
      this.cp[3] = this.cp[7];
      this.cp[7] = this.cp[4];
      this.cp[4] = tempP;

      const tempO = this.co[0];
      this.co[0] = (this.co[3] + 1) % 3;
      this.co[3] = (this.co[7] + 2) % 3;
      this.co[7] = (this.co[4] + 1) % 3;
      this.co[4] = (tempO + 2) % 3;
    }
  }

  applyAlg(alg) {
    const moves = alg.replace(/[()]/g, '').trim().split(/\s+/);
    moves.forEach(m => {
      if (m) this.applyMove(m);
    });
  }
}

console.log(`Checking ${cases.length} cases...`);

let issues = 0;

cases.forEach(c => {
  const cube = new Cube2x2();
  // Apply scramble (inverse of formula)
  cube.applyAlg(c.scramble);
  
  // For CLL, EG1, EG2: check if bottom layer corners (4, 5, 6, 7) are in the bottom layer (indices 4, 5, 6, 7)
  const bottomPieces = cube.cp.slice(4);
  const bottomOrients = cube.co.slice(4);
  
  const bottomHasTopPieces = bottomPieces.some(p => p < 4);
  const bottomNotOriented = bottomOrients.some(o => o !== 0);
  
  if (bottomHasTopPieces || bottomNotOriented) {
    console.log(`Issue in ${c.type} case '${c.name}':`);
    console.log(`  Formula: ${c.formula}`);
    console.log(`  Scramble: ${c.scramble}`);
    console.log(`  Bottom permutation: ${bottomPieces} (expected 4,5,6,7 in some order)`);
    console.log(`  Bottom orientation: ${bottomOrients} (expected all 0)`);
    issues++;
  }
});

console.log(`Total issues found: ${issues}`);
