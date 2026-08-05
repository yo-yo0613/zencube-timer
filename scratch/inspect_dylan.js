// scratch/inspect_dylan.js
import fs from 'fs';

const path = 'c:/Users/14L1/Desktop/qqtimer-version2/src/data/dylan3Style.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

console.log("ufComms keys (Edge targets):", Object.keys(data.ufComms || {}).slice(0, 10));
console.log("ufrComms keys (Corner targets):", Object.keys(data.ufrComms || {}).slice(0, 10));
console.log("parity keys:", Object.keys(data.parity || {}).slice(0, 10));
