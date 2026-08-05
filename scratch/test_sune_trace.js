// scratch/test_sune_trace.js
import { Cube3x3, traceCorners, traceEdges } from './test_trace_execution.js';

// Wait, test_trace_execution.js has classes defined. Since it doesn't export them, let's just write a test runner that appends the test to test_trace_execution.js
const fs = require('fs');
let code = fs.readFileSync('C:/Users/14L1/Desktop/qqtimer-version2/scratch/test_trace_execution.js', 'utf8');

// Replace the last test run with Sune:
code = code.replace('c1.applyScramble("R U R\' U\'");', 'c1.applyScramble("R U R\' U R U2 R\'");');
code = code.replace('console.log("Scramble: R U R\' U\'");', 'console.log("Scramble: Sune R U R\' U R U2 R\'");');

fs.writeFileSync('C:/Users/14L1/Desktop/qqtimer-version2/scratch/test_trace_execution_sune.js', code, 'utf8');
