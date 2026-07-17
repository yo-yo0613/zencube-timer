// scratch/test_2x2_sim_correct.js
class Cube2x2 {
  constructor() {
    this.cp = [0, 1, 2, 3, 4, 5, 6, 7];
    this.co = [0, 0, 0, 0, 0, 0, 0, 0];
  }

  // U move (clockwise): UFL(0)->UBL(3)->UBR(2)->UFR(1)->UFL(0)
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

  // R move (clockwise): UFR(1)->UBR(2)->DBR(6)->DFR(5)->UFR(1)
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

  applyMove(move) {
    if (move === "U") this.U();
    else if (move === "U'") { this.U(); this.U(); this.U(); }
    else if (move === "U2") { this.U(); this.U(); }
    else if (move === "R") this.R();
    else if (move === "R'") { this.R(); this.R(); this.R(); }
    else if (move === "R2") { this.R(); this.R(); }
  }

  applyAlg(alg) {
    const moves = alg.replace(/[()]/g, '').trim().split(/\s+/);
    moves.forEach(m => this.applyMove(m));
  }
}

console.log("--- Testing Sune R U R' U R U2 R' ---");
const cube1 = new Cube2x2();
cube1.applyAlg("R U R' U R U2 R'");
console.log("cp:", cube1.cp);
console.log("co:", cube1.co);

console.log("--- Testing Anti-Sune R U2 R' U' R U' R' ---");
const cube2 = new Cube2x2();
cube2.applyAlg("R U2 R' U' R U' R'");
console.log("cp:", cube2.cp);
console.log("co:", cube2.co);
