class SQ1 {
  constructor() {
    this.top = [0, 1, 2, 3, 4, 5, 6, 7];
    this.bottom = [8, 9, 10, 11, 12, 13, 14, 15];
  }

  performAlg(alg) {
    const clean = alg.replace(/\(/g, '').replace(/\)/g, '');
    const moves = clean.split(' ').filter(x => x.trim());
    for (const move of moves) {
      if (move === '/') {
        this.slash();
      } else if (move.includes(',')) {
        const [top, bottom] = move.split(',');
        this.turnU(parseInt(top));
        this.turnD(parseInt(bottom));
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

    const top = this.top.slice(topIndex);
    const bottom = this.bottom.slice(bottomIndex);
    this.top = this.top.slice(0, topIndex).concat(bottom.reverse());
    this.bottom = this.bottom.slice(0, bottomIndex).concat(top.reverse());
  }

  turnU(n) {
    this.top = this.turnFace(-n, this.top);
  }

  turnD(n) {
    this.bottom = this.turnFace(n, this.bottom);
  }

  getTotal(face) {
    let total = 0;
    for (const value of face) {
      total += value % 2 === 0 ? 2 : 1;
    }
    return total;
  }

  turnFace(n, face) {
    let count = 0;
    let index = 0;
    const total = this.getTotal(face);

    let normN = n;
    if (normN < 0) normN = total + (normN % total);
    else normN = normN % total;

    if (normN === 0 || total === 0) return face;

    for (const value of face) {
      count += value % 2 === 0 ? 2 : 1;
      index += 1;
      if (count === normN) break;
    }

    const beginning = face.slice(0, index);
    const end = face.slice(index);
    return end.concat(beginning);
  }
}

function invertAlg(alg) {
  const moves = alg.replace(/\(/g, '').replace(/\)/g, '').split(' ').filter(x => x.trim());
  const inverted = moves.map(move => {
    if (move === '/') return '/';
    if (move.includes(',')) {
      const [top, bottom] = move.split(',').map(Number);
      return `${-top},${-bottom}`;
    }
    return move;
  });
  return inverted.reverse().join(' ');
}

// Check Odd
const sq1_odd = new SQ1();
sq1_odd.performAlg(invertAlg("0,-2 / -2,0 / -1,-2 / -3,-3 /"));

// Check Even
const sq1_even = new SQ1();
sq1_even.performAlg(invertAlg("-2,-4 / 2,-2 / 0,-1 / 3,3 /"));

console.log("Odd Top:", sq1_odd.top);
console.log("Even Top:", sq1_even.top);
console.log("Odd Bottom:", sq1_odd.bottom);
console.log("Even Bottom:", sq1_even.bottom);
