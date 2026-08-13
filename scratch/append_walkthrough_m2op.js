// scratch/append_walkthrough_m2op.js
import fs from 'fs';

const path = 'c:/Users/14L1/Desktop/qqtimer-version2/walkthrough.md';
let content = fs.readFileSync(path, 'utf8').trim();

const sectionToAppend = `

### 13. 🟢 3x3 盲解 Tracing 新增 M2/OP 與自訂 Buffer 支援
- **功能亮點**：
  1. **一鍵解法模式切換 (Method Presets)**：
     - **🔵 3-Style 模式**：預設邊塊 Buffer UF (C/I)，角塊 Buffer UFR (C/M/J)。
     - **🟢 M2 / OP 模式**：預設邊塊 Buffer **DF** (U/K - M2)，角塊 Buffer **UBL** (A/E/R - OP)。
     - **⚙️ 自訂 Buffer 模式**：開放選取邊塊 (UF, DF, UB, UL, UR) 與角塊 (UFR, UBL, UFL, UBR) 的自由組合。
  2. **動態解答標題與記憶詞轉換**：解答展開區域會根據當前設定顯示如 "邊塊 Tracing 路徑 (Buffer: DF - M2)"，並自動將 M2/OP 的追蹤路徑比對中文記憶詞。
  3. **狀態持久化**：選擇的解法模式與自訂 Buffer 自動留存在 localStorage 中。
- **演算法核心 ([bldTracer.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/utils/bldTracer.js))**：
  - traceEdges(cube, bufferIndex) 與 traceCorners(cube, bufferIndex) 已全面升級支援動態指定 Buffer 起始位置。
`;

fs.writeFileSync(path, content + sectionToAppend, 'utf8');
console.log("Successfully appended M2/OP section to walkthrough.md");
