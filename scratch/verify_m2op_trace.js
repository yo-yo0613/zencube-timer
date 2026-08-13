// scratch/verify_m2op_trace.js
import { Cube3x3, traceEdges, traceCorners } from '../src/utils/bldTracer.js';

const scramble = "R U R' U' R' F R2 U' R' U' R U R' F'";
const cube = new Cube3x3();
cube.applyScramble(scramble);

console.log("Scramble:", scramble);

// 3-Style: Edges UF (2), Corners UFR (2)
const edges3Style = traceEdges(cube, 2);
const corners3Style = traceCorners(cube, 2);
console.log("\n=== 3-Style Tracing (UF / UFR) ===");
console.log("Edges Trace:", edges3Style.join(" "));
console.log("Corners Trace:", corners3Style.join(" "));

// M2 / OP: Edges DF (8), Corners UBL (0)
const edgesM2 = traceEdges(cube, 8);
const cornersOP = traceCorners(cube, 0);
console.log("\n=== M2 / OP Tracing (DF / UBL) ===");
console.log("Edges Trace (M2 - Buffer DF):", edgesM2.join(" "));
console.log("Corners Trace (OP - Buffer UBL):", cornersOP.join(" "));
