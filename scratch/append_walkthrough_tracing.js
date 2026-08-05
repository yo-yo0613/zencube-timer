// scratch/append_walkthrough_tracing.js
import fs from 'fs';

const path = 'c:/Users/14L1/Desktop/qqtimer-version2/walkthrough.md';
let content = fs.readFileSync(path, 'utf8').trim();

const sectionToAppend = `

### 12. 🧭 3x3 盲解 Tracing (追蹤路徑) 練習器全新上線
- **功能簡介**：
  1. 為解決魔方盲解新手「找塊慢」、「記錯順序」的痛點，特別開發了**純 Tracing 模擬路徑訓練模式**。
  2. 使用者在「盲解訓練庫 ➔ 刻意練習模組」中切換至 **「追蹤步驟練習」**，系統即會隨機產生 3x3 打亂。
  3. **動態 2D 魔方視覺對照**：介面利用 \`<CubePreview>\` 組件即時渲染打亂狀態，方便使用者看著螢幕直接進行邊角 Tracing。
  4. **全方位解答剖析**：點選「顯示解答」後，將展示：
     - **邊塊 Tracing 路徑**（注音/英文對稱，以 Buffer: UF 為基準）。
     - **角塊 Tracing 路徑**（注音/英文對稱，以 Buffer: UFR 為基準）。
     - **記憶助記詞序列**：自動將追蹤出的字母對，比對資料庫（與預載 552 組編碼）的中文或英文記憶詞（如 \`"冰棒" ➔ "地圖"\`），幫助選手無縫將路徑轉換成故事。
- **底層演算法 ([bldTracer.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/utils/bldTracer.js))**：
  - 獨立封裝了 3x3 狀態機與 permutations/orientations 轉移。
  - 設計了無錯位、支援循環切換與翻轉偵測的邊角 Tracing 尋路演算法。
`;

fs.writeFileSync(path, content + sectionToAppend, 'utf8');
console.log("Successfully appended Tracing Section to walkthrough.md");
