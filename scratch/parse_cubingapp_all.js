// scratch/parse_cubingapp_all.js
import fs from 'fs';

const jsPath = 'C:/Users/14L1/.gemini/antigravity/brain/b640306e-8dec-4c64-9679-0bc16ed9bc94/scratch/_algSet-0Sc494ku.js';
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Helper to invert 3x3/2x2 algorithm moves
function invertAlg(alg) {
  if (!alg) return '';
  // Remove brackets and parentheses, split by whitespace
  const tokens = alg.replace(/[()\[\]]/g, '').trim().split(/\s+/);
  const inverted = tokens.map(token => {
    if (!token) return '';
    // Match base move + suffix (e.g. R, R', R2, x, x', y, y', etc.)
    const match = token.match(/^([a-zA-Z0-9_/]+)(2'?|'?)$/);
    if (match) {
      const base = match[1];
      const suffix = match[2];
      if (suffix.startsWith('2')) {
        return `${base}2`; // R2' invert is R2
      } else if (suffix === "'") {
        return base;      // R' invert is R
      } else {
        return `${base}'`; // R invert is R'
      }
    }
    return token;
  });
  return inverted.reverse().join(' ');
}

// Extraction strategy: JSON.parse or Brace matching
function extractVariable(varName) {
  const startStr = `${varName}=`;
  const startIdx = jsContent.indexOf(startStr);
  if (startIdx === -1) {
    console.error(`Could not find ${varName}= in JS bundle.`);
    return null;
  }
  
  const searchSnippet = jsContent.substring(startIdx + startStr.length, startIdx + startStr.length + 50);
  
  if (searchSnippet.startsWith('JSON.parse(`')) {
    const valStart = startIdx + startStr.length + 'JSON.parse(`'.length;
    const valEnd = jsContent.indexOf('`)', valStart);
    if (valEnd === -1) {
      console.error(`Could not find closing backtick for ${varName}`);
      return null;
    }
    const jsonStr = jsContent.substring(valStart, valEnd);
    try {
      return JSON.parse(jsonStr);
    } catch (e) {
      console.error(`Failed to parse JSON for ${varName}:`, e.message);
      return null;
    }
  } else {
    let idx = startIdx + startStr.length;
    let braceCount = 0;
    let inString = false;
    let quoteChar = null;
    let escape = false;
    const startPos = idx;
    
    while (idx < jsContent.length) {
      const char = jsContent[idx];
      if (escape) { escape = false; idx++; continue; }
      if (char === '\\') { escape = true; idx++; continue; }
      if (inString) {
        if (char === quoteChar) { inString = false; quoteChar = null; }
        idx++;
        continue;
      }
      if (char === '"' || char === "'" || char === '`') {
        inString = true;
        quoteChar = char;
        idx++;
        continue;
      }
      if (char === '{') { braceCount++; }
      else if (char === '}') {
        braceCount--;
        if (braceCount === 0) {
          const objStr = jsContent.substring(startPos, idx + 1);
          try {
            return eval(`(${objStr})`);
          } catch (e) {
            console.error(`Failed to eval parsed ${varName}:`, e.message);
            return null;
          }
        }
      }
      idx++;
    }
  }
  return null;
}

// 1. Extract raw sets
const f2lRaw = extractVariable('rU');
const ollRaw = extractVariable('jU');
const pllRaw = extractVariable('ss');
const wvRaw = extractVariable('ie');
const collRaw = extractVariable('UU');
const ollcpRaw = extractVariable('VU');
const zbllRaw = extractVariable('ce');
const cllRaw = extractVariable('nR');
const eg1Raw = extractVariable('OR');
const eg2Raw = extractVariable('mR');

const threeDAlgs = [];
const twoDAlgs = [];

// 2. Helper to process and format each case
function processCases(rawSet, typeName, listDest) {
  if (!rawSet) {
    console.error(`Set for ${typeName} is empty!`);
    return;
  }
  
  let count = 0;
  for (const [key, data] of Object.entries(rawSet)) {
    const candidateAlgs = Object.keys(data.algs || {});
    if (candidateAlgs.length === 0) continue;
    
    const formula = candidateAlgs[0];
    const scramble = invertAlg(formula);
    
    // Formatting Name and ID for consistency
    let name = key;
    let id = `${typeName.toLowerCase()}-${key.toLowerCase().replace(/\s+/g, '-')}`;
    
    if (typeName === 'F2L') {
      name = key.replace('F2L ', 'F2L Case ');
    } else if (typeName === 'PLL') {
      name = key.replace(' perm', '-Perm');
    } else if (typeName === 'COLL') {
      name = `COLL ${key}`;
    }
    
    let subset = data.subset || '';
    if (subset === 'AS') subset = 'Antisune';
    
    listDest.push({
      id: id,
      name: name,
      type: typeName,
      subset: subset,
      formula: formula,
      scramble: scramble,
      memo: ''
    });
    count++;
  }
  console.log(`Processed ${count} cases for ${typeName}`);
}

// Process all 3x3 algorithms
processCases(f2lRaw, 'F2L', threeDAlgs);
processCases(ollRaw, 'OLL', threeDAlgs);
processCases(pllRaw, 'PLL', threeDAlgs);
processCases(wvRaw, 'WV', threeDAlgs);
processCases(collRaw, 'COLL', threeDAlgs);
processCases(ollcpRaw, 'OLLCP', threeDAlgs);
processCases(zbllRaw, 'ZBLL', threeDAlgs);

// Process all 2x2 algorithms
processCases(cllRaw, 'CLL', twoDAlgs);
processCases(eg1Raw, 'EG1', twoDAlgs);
processCases(eg2Raw, 'EG2', twoDAlgs);

// 3. Write output files
const path3x3 = 'c:/Users/14L1/Desktop/qqtimer-version2/src/data/3x3algs.json';
const path2x2 = 'c:/Users/14L1/Desktop/qqtimer-version2/src/data/2x2algs.json';

fs.writeFileSync(path3x3, JSON.stringify(threeDAlgs, null, 2), 'utf8');
fs.writeFileSync(path2x2, JSON.stringify(twoDAlgs, null, 2), 'utf8');

console.log(`\nSuccessfully wrote ${threeDAlgs.length} cases to ${path3x3}`);
console.log(`Successfully wrote ${twoDAlgs.length} cases to ${path2x2}`);
