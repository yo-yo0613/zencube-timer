// scratch/print_all_keys.js
import fs from 'fs';

const path = 'c:/Users/14L1/Desktop/qqtimer-version2/src/data/dylan3Style.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log("Edges keys:", Object.keys(data.ufComms));
console.log("Corners keys:", Object.keys(data.ufrComms));
