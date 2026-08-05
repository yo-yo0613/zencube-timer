// scratch/append_walkthrough.js
import fs from 'fs';

const path = 'c:/Users/14L1/Desktop/qqtimer-version2/walkthrough.md';
let content = fs.readFileSync(path, 'utf8');

// Let's strip any trailing whitespace/newlines
content = content.trim();

// Now let's define the new sections to append
const sectionsToAppend = `

### 10. 🗄️ 3x3 與 2x2 官方公式庫全面重組與視角校對 (解決 OLL 26/27 與 2x2 錯位問題)
- **問題修正與優化**：
  1. 之前自 \`solvethecube.com\` 抓取的公式有部分 WCA 編號寫反，且包含非標準起手旋轉，造成打亂狀態在 \`<scramble-display>\` 渲染後頂面角向與底層 Bar 位置有 90/180 度偏差，不符合選手直覺。
  2. 我們**全面重構了 3x3 與 2x2 的預載公式庫**，改自 \`cubingapp.com\` 提取標準正面視角公式。
  3. 引入了**自然排序 (Natural Sort) 演算法**，使數值型公式 (如 OLL, F2L, ZBLL) 以 \`1 ➔ 2 ➔ 3 ➔ 4...\` 升冪排好，字母型 (如 PLL) 則按字母排序，徹底改善原本跳號雜亂的查閱困境。

### 11. 📝 盲解記憶編碼 (Letter Pairs) 全套預載生成與無縫整合
- **功能特點**：
  1. **552 組中英文編碼預載**：編寫並執行了腳本 [generate_default_memos.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/scratch/generate_default_memos.js)，為 A-X (ㄅ-ㄩ) 兩兩排列組合共 552 個 Letter Pairs，各自生成並寫入了**高度直覺、常見的中文字組**（如 \`ㄅㄆ\` ➔ \`冰棒\`、\`ㄅㄇ\` ➔ \`爸媽\`）以及**英文字組**（如 \`AB\` ➔ \`Abby\`、\`AC\` ➔ \`Acme\`）。
  2. **自動退守機制 (Fallback)**：修改了 [Blindfold.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/Blindfold.jsx)，當使用者在資料庫中還沒有設定任何「自訂編碼」時，系統會自動在列表、快速設定欄、刻意練習模式中**展示並套用預載的編碼**。
  3. **智慧搜尋強化**：在編碼搜尋欄中，除了支援字母、注音、位置和公式搜尋外，現在連**預載助記字詞**也可以直接被搜尋到。
`;

fs.writeFileSync(path, content + sectionsToAppend, 'utf8');
console.log("Successfully appended new sections to walkthrough.md");
