// scratch/parse_2x2_algs.js
import fs from 'fs';

const jsPath = 'C:/Users/14L1/.gemini/antigravity/brain/b640306e-8dec-4c64-9679-0bc16ed9bc94/scratch/_algSet-0Sc494ku.js';
const jsContent = fs.readFileSync(jsPath, 'utf8');

// Helper to invert 2x2/3x3 algorithm moves
function invertAlg(alg) {
  if (!alg) return '';
  // Remove brackets and parentheses, split by whitespace
  const tokens = alg.replace(/[()\[\]]/g, '').trim().split(/\s+/);
  const inverted = tokens.map(token => {
    if (!token) return '';
    // Match base move + suffix (e.g. R, R', R2, x, x', y, y', etc.)
    const match = token.match(/^([a-zA-Z]+)(2'?|'?)$/);
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

// Brace Matching Parser to extract a JS object assigned to a variable
function parseObject(varName) {
  const startStr = `${varName}=`;
  const startIdx = jsContent.indexOf(startStr);
  if (startIdx === -1) {
    console.error(`Could not find ${varName}= in JS bundle.`);
    return null;
  }
  
  let idx = startIdx + startStr.length;
  let braceCount = 0;
  let inString = false;
  let quoteChar = null;
  let escape = false;
  const startPos = idx;
  
  while (idx < jsContent.length) {
    const char = jsContent[idx];
    
    if (escape) {
      escape = false;
      idx++;
      continue;
    }
    
    if (char === '\\') {
      escape = true;
      idx++;
      continue;
    }
    
    if (inString) {
      if (char === quoteChar) {
        inString = false;
        quoteChar = null;
      }
      idx++;
      continue;
    }
    
    if (char === '"' || char === "'" || char === '`') {
      inString = true;
      quoteChar = char;
      idx++;
      continue;
    }
    
    if (char === '{') {
      braceCount++;
    } else if (char === '}') {
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
  return null;
}

// Extract CLL (nR), EG1 (OR), EG2 (mR)
const cllRaw = parseObject('nR');
const eg1Raw = parseObject('OR');
const eg2Raw = parseObject('mR');

if (!cllRaw || !eg1Raw || !eg2Raw) {
  console.error("Failed to parse raw algorithm variables.");
  process.exit(1);
}

const allAlgs = [];

// Helper to convert raw object to standard list
function processAlgSet(rawSet, typeName) {
  let count = 0;
  for (const [key, data] of Object.entries(rawSet)) {
    // Candidates are the keys of data.algs
    const candidateAlgs = Object.keys(data.algs || {});
    if (candidateAlgs.length === 0) continue;
    
    // Choose the first formula as primary
    const formula = candidateAlgs[0];
    const scramble = invertAlg(formula);
    
    // Clean up subset name if needed (e.g. AS -> Antisune for consistency)
    let subset = data.subset || '';
    if (subset === 'AS') subset = 'Antisune';
    
    const id = `${typeName.toLowerCase()}-${key.toLowerCase().replace(/\s+/g, '-')}`;
    
    allAlgs.push({
      id: id,
      name: key, // e.g. "CLL AS 1"
      type: typeName, // "CLL", "EG1", "EG2"
      subset: subset,
      formula: formula,
      scramble: scramble,
      memo: ''
    });
    count++;
  }
  console.log(`Processed ${count} cases for ${typeName}.`);
}

processAlgSet(cllRaw, 'CLL');
processAlgSet(eg1Raw, 'EG1');
processAlgSet(eg2Raw, 'EG2');

// Save the parsed output to src/data/2x2algs.json
const destPath = 'c:/Users/14L1/Desktop/qqtimer-version2/src/data/2x2algs.json';
fs.writeFileSync(destPath, JSON.stringify(allAlgs, null, 2), 'utf8');
console.log(`Successfully generated and saved ${allAlgs.length} cases to ${destPath}`);
