// src/lib/sq1Trace.js

export function invertSq1Alg(alg) {
  if (!alg) return ''
  const tokens = []
  let current = ''
  for (let i = 0; i < alg.length; i++) {
    const char = alg[i]
    if (char === '/') {
      if (current.trim()) tokens.push(current.trim())
      tokens.push('/')
      current = ''
    } else {
      current += char
    }
  }
  if (current.trim()) tokens.push(current.trim())
  const invertedTokens = tokens.map(token => {
    if (token === '/') return '/'
    const match = token.match(/\(?(-?\d+),\s*(-?\d+)\)?/)
    if (match) {
      const x = -parseInt(match[1], 10)
      const y = -parseInt(match[2], 10)
      return `(${x}, ${y})`
    }
    return token
  })
  return invertedTokens.reverse().join(' ')
}

export function rotate(str, offset) {
  const len = str.length;
  if (len === 0) return str;
  let shift = offset % len;
  if (shift < 0) shift += len;
  let targetIndex = shift > 0 ? len - shift : -shift;
  return str.substring(targetIndex) + str.substring(0, targetIndex);
}

export class SQ1State {
  constructor(state = null) {
    if (state) {
      this.top = state.top;
      this.bot = state.bot;
      this.toprow = state.toprow;
      this.botrow = state.botrow;
      this.leftbarflip = state.leftbarflip;
      this.rightbarflip = state.rightbarflip;
      this.y2 = state.y2;
    } else {
      this.top = "CECECECE";
      this.bot = "ecececec";
      this.toprow = "OGGGRRRBBBOO";
      this.botrow = "rrgggooobbbr";
      this.leftbarflip = false;
      this.rightbarflip = false;
      this.y2 = false;
    }
  }

  getTopSlicablePosition(offset) {
    let charIdx = 0;
    let count = 0;
    while (count < offset && charIdx < this.top.length) {
      if (this.top[charIdx].toLowerCase() === 'e' || this.top[charIdx].toLowerCase() === 'a') {
        charIdx++;
        count++;
      } else {
        charIdx++;
        count += 2;
      }
    }
    return charIdx;
  }

  getBotSlicablePosition(offset) {
    let charIdx = 0;
    let count = 0;
    while (count < offset && charIdx < this.bot.length) {
      if (this.bot[charIdx].toLowerCase() === 'e' || this.bot[charIdx].toLowerCase() === 'a') {
        charIdx++;
        count++;
      } else {
        charIdx++;
        count += 2;
      }
    }
    return charIdx;
  }

  GetECLoc(layer, offset) {
    let count = 0;
    let charIndex = 0;
    if (offset === 0) return 0;
    if (offset > 0) {
      for (charIndex = layer.length - 1; count < offset && charIndex >= 0; charIndex--) {
        count++;
        if (layer[charIndex] === 'c' || layer[charIndex] === 'C') count++;
      }
      return charIndex + 1;
    }
    for (charIndex = 0; count < -offset && charIndex < layer.length; charIndex++) {
      count++;
      if (layer[charIndex] === 'c' || layer[charIndex] === 'C') count++;
    }
    return charIndex;
  }

  AssertMove(topOffset, botOffset) {
    let tOffset = parseInt(topOffset) >= 0 ? 12 - parseInt(topOffset) : -parseInt(topOffset);
    let bOffset = parseInt(botOffset) >= 0 ? 12 - parseInt(botOffset) : -parseInt(botOffset);
    let topRotated = rotate(this.top.toLowerCase().replaceAll('e','1').replaceAll('c','10'), -tOffset);
    let botRotated = rotate(this.bot.toLowerCase().replaceAll('e','1').replaceAll('c','10'), -bOffset);
    return topRotated[0] === '1' && topRotated[6] === '1' && botRotated[0] === '1' && botRotated[6] === '1';
  }

  DoSlice() {
    let topCut = this.GetECLoc(this.top, 6);
    let botCut = this.GetECLoc(this.bot, 6);
    let topL = this.top.substring(0, topCut);
    let topR = this.top.substring(topCut);
    let botL = this.bot.substring(0, botCut);
    let botR = this.bot.substring(botCut);
    
    this.top = botL + topR;
    this.bot = topL + botR;
    
    let toprowL = this.toprow.substring(0, 6);
    let toprowR = this.toprow.substring(6);
    let botrowL = this.botrow.substring(0, 6);
    let botrowR = this.botrow.substring(6);
    
    this.toprow = botrowL + toprowR;
    this.botrow = toprowL + botrowR;
    
    if (this.y2) this.rightbarflip = !this.rightbarflip;
    else this.leftbarflip = !this.leftbarflip;
  }

  DoTurn(topOffset, botOffset) {
    let topCharIdx = this.GetECLoc(this.top, topOffset);
    let botCharIdx = this.GetECLoc(this.bot, botOffset);
    this.top = rotate(this.top, -topCharIdx);
    this.bot = rotate(this.bot, -botCharIdx);
    this.toprow = rotate(this.toprow, topOffset);
    this.botrow = rotate(this.botrow, botOffset);
  }

  PerformFormalMove(moveStr) {
    if (moveStr === '/' || moveStr === '\\') {
      this.DoSlice();
      return;
    }
    if (moveStr === 'y2') {
      this.y2 = !this.y2;
      this.DoTurn(-6, 6);
      return;
    }
    if (moveStr === 'z2') {
      [this.top, this.bot] = [this.bot, this.top];
      [this.toprow, this.botrow] = [this.botrow, this.toprow];
      this.DoTurn(6, 6);
      this.y2 = !this.y2;
      this.leftbarflip = !this.leftbarflip;
      this.rightbarflip = !this.rightbarflip;
      return;
    }
    const match = moveStr.match(/\((-?\d+),(-?\d+)\)/);
    if (match) {
      const topOffset = parseInt(match[1], 10);
      const botOffset = parseInt(match[2], 10);
      if (!this.AssertMove(topOffset, botOffset)) return;
      this.DoTurn(topOffset, botOffset);
    }
  }

  ProcessMoves(scramble) {
    const regex = /\/|z2|y2|\(-?\d+,-?\d+\)/g;
    const moves = scramble.match(regex) || [];
    for (const move of moves) {
      this.PerformFormalMove(move);
    }
  }
}

const ABC_MAP = {
  'B R O ': 'Even', 'B R G ': 'Odd', 'B O R ': 'Odd', 'B O G ': 'Even',
  'B G O ': 'Odd', 'B G R ': 'Even', 'G R O ': 'Odd', 'G R B ': 'Even',
  'G O R ': 'Even', 'G O B ': 'Odd', 'G B O ': 'Even', 'G B R ': 'Odd',
  'R G B ': 'Odd', 'R G O ': 'Even', 'R O B ': 'Even', 'R O G ': 'Odd',
  'R B O ': 'Odd', 'R B G ': 'Even', 'O G B ': 'Even', 'O G R ': 'Odd',
  'O R G ': 'Even', 'O R B ': 'Odd', 'O B R ': 'Even', 'O B G ': 'Odd'
};

function getThreePieceParity(colors) {
  if (!colors || colors.length < 3) return 'N/A';
  const [c1, c2, c3] = colors;
  if (c1 === c3) return 'Even';
  const key = `${c1} ${c2} ${c3} `;
  return ABC_MAP[key] || 'Even';
}

export function traceCsp(scramble, topStart = 0, botStart = 0) {
  const state = new SQ1State();
  state.ProcessMoves(scramble);

  // 1. BW Corners
  let bwCornersParity = true; // true = Even
  let bwCornersSequence = [];
  let topOffsetIdx = state.getTopSlicablePosition(topStart);
  let topRot = rotate(state.top, -topOffsetIdx);
  let toggle = true;
  for (let i = 0; i < state.top.length; i++) {
    if (topRot[i].toLowerCase() !== 'e') {
      if (toggle) {
        bwCornersSequence.push(topRot[i] === 'c' ? 'W' : 'B');
        if (topRot[i] === 'c') bwCornersParity = !bwCornersParity;
      }
      toggle = !toggle;
    }
  }
  let botOffsetIdx = state.getBotSlicablePosition(botStart);
  let botRot = rotate(state.bot, -botOffsetIdx);
  for (let i = 0; i < state.bot.length; i++) {
    if (botRot[i].toLowerCase() !== 'e') {
      if (toggle) {
        bwCornersSequence.push(botRot[i] === 'c' ? 'W' : 'B');
        if (botRot[i] === 'c') bwCornersParity = !bwCornersParity;
      }
      toggle = !toggle;
    }
  }

  // 2. BW Edges
  let bwEdgesParity = true;
  let bwEdgesSequence = [];
  toggle = true;
  for (let i = 0; i < state.top.length; i++) {
    if (topRot[i].toLowerCase() !== 'c') {
      if (toggle) {
        bwEdgesSequence.push(topRot[i] === 'e' ? 'W' : 'B');
        if (topRot[i] === 'e') bwEdgesParity = !bwEdgesParity;
      }
      toggle = !toggle;
    }
  }
  for (let i = 0; i < state.bot.length; i++) {
    if (botRot[i].toLowerCase() !== 'c') {
      if (toggle) {
        bwEdgesSequence.push(botRot[i] === 'e' ? 'W' : 'B');
        if (botRot[i] === 'e') bwEdgesParity = !bwEdgesParity;
      }
      toggle = !toggle;
    }
  }

  // 3. W Corners ('c')
  let wCornersColors = [];
  let found = 0;
  let uRowRotated = rotate(state.toprow, topStart);
  let dRowRotated = rotate(state.botrow, botStart);

  let sideIdx = 0;
  for (let i = 0; i < state.top.length; i++) {
    if (topRot[i].toLowerCase() === 'e') {
      sideIdx++;
    } else {
      if (topRot[i] === 'c' && found < 3) {
        wCornersColors.push(uRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx += 2;
    }
  }
  sideIdx = 0;
  for (let i = 0; i < state.bot.length; i++) {
    if (botRot[i].toLowerCase() === 'e') {
      sideIdx++;
    } else {
      if (botRot[i] === 'c' && found < 3) {
        wCornersColors.push(dRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx += 2;
    }
  }

  // 4. B Corners ('C')
  let bCornersColors = [];
  found = 0;
  sideIdx = 0;
  for (let i = 0; i < state.top.length; i++) {
    if (topRot[i].toLowerCase() === 'e') {
      sideIdx++;
    } else {
      if (topRot[i] === 'C' && found < 3) {
        bCornersColors.push(uRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx += 2;
    }
  }
  sideIdx = 0;
  for (let i = 0; i < state.bot.length; i++) {
    if (botRot[i].toLowerCase() === 'e') {
      sideIdx++;
    } else {
      if (botRot[i] === 'C' && found < 3) {
        bCornersColors.push(dRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx += 2;
    }
  }

  // 5. W Edges ('e')
  let wEdgesColors = [];
  found = 0;
  sideIdx = 0;
  for (let i = 0; i < state.top.length; i++) {
    if (topRot[i].toLowerCase() === 'c') {
      sideIdx += 2;
    } else {
      if (topRot[i] === 'e' && found < 3) {
        wEdgesColors.push(uRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx++;
    }
  }
  sideIdx = 0;
  for (let i = 0; i < state.bot.length; i++) {
    if (botRot[i].toLowerCase() === 'c') {
      sideIdx += 2;
    } else {
      if (botRot[i] === 'e' && found < 3) {
        wEdgesColors.push(dRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx++;
    }
  }

  // 6. B Edges ('E')
  let bEdgesColors = [];
  found = 0;
  sideIdx = 0;
  for (let i = 0; i < state.top.length; i++) {
    if (topRot[i].toLowerCase() === 'c') {
      sideIdx += 2;
    } else {
      if (topRot[i] === 'E' && found < 3) {
        bEdgesColors.push(uRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx++;
    }
  }
  sideIdx = 0;
  for (let i = 0; i < state.bot.length; i++) {
    if (botRot[i].toLowerCase() === 'c') {
      sideIdx += 2;
    } else {
      if (botRot[i] === 'E' && found < 3) {
        bEdgesColors.push(dRowRotated[sideIdx].toUpperCase());
        found++;
      }
      sideIdx++;
    }
  }

  const results = [
    { name: 'BW Corners', sequence: bwCornersSequence, parity: bwCornersParity ? 'Even' : 'Odd' },
    { name: 'BW Edges',   sequence: bwEdgesSequence,   parity: bwEdgesParity ? 'Even' : 'Odd' },
    { name: 'W Corners',  colors: wCornersColors,      parity: getThreePieceParity(wCornersColors) },
    { name: 'B Corners',  colors: bCornersColors,      parity: getThreePieceParity(bCornersColors) },
    { name: 'W Edges',    colors: wEdgesColors,        parity: getThreePieceParity(wEdgesColors) },
    { name: 'B Edges',    colors: bEdgesColors,        parity: getThreePieceParity(bEdgesColors) },
  ];

  let oddCount = 0;
  for (const r of results) {
    if (r.parity === 'Odd') oddCount++;
  }

  return {
    state,
    components: results,
    oddCount,
    result: oddCount % 2 === 0 ? 'Even' : 'Odd'
  };
}

export function getNextValidTop(state, current) {
  let val = current;
  for (let i = 0; i < 12; i++) {
    val = (val + 1) % 12;
    if (state.AssertMove(-val, 0)) return val;
  }
  return current;
}

export function getPrevValidTop(state, current) {
  let val = current;
  for (let i = 0; i < 12; i++) {
    val = (val - 1 + 12) % 12;
    if (state.AssertMove(-val, 0)) return val;
  }
  return current;
}

export function getNextValidBot(state, current) {
  let val = current;
  for (let i = 0; i < 12; i++) {
    val = (val + 1) % 12;
    if (state.AssertMove(0, -val)) return val;
  }
  return current;
}

export function getPrevValidBot(state, current) {
  let val = current;
  for (let i = 0; i < 12; i++) {
    val = (val - 1 + 12) % 12;
    if (state.AssertMove(0, -val)) return val;
  }
  return current;
}
