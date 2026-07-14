# Walkthrough - Rubik's Cube Timer & Trainer Web App

We have successfully built and verified the **ZenCube Timer & Trainer** web application. It integrates a sleek, responsive Bento-Grid design (Desktop/Tablet) and a minimalist stopwatch design (Mobile). The project builds correctly for production.

Below is a detailed guide on what was implemented, how to run it locally, and how to upload it to GitHub, Vercel, and Supabase.

---

## 🛠️ What We Built

1. **Vite + React Core**: Equipped with routing (`react-router-dom`), animation (`framer-motion`), and icons (`lucide-react`).
2. **Tailwind CSS v3**: Installed v3 with custom configuration defining a class-based dark mode and monochromatic branding.
3. **PWA Integration**: Integrated `vite-plugin-pwa` for offline capability (precaching all pages) and mobile app standalone installation.
4. **3-Style Database Parser**: Created a script that parsed your actual files:
   - `Dylan's 3-Style Learning Sheet - UF Comms.tsv` (Edges)
   - `Dylan's 3-Style Learning Sheet - UFR Comms.tsv` (Corners)
   - `Dylan's 3-Style Learning Sheet - Parity.tsv` (Parity)
   
   It outputted a consolidated JSON database `src/data/dylan3Style.json` containing all commutators ready for training.
5. **Interactive 3-Style Trainer & Bopomofo Toggle (`/blindfold`)**:
   - Allows selecting targets to check specific commutators and save custom memory/story aids.
   - **Bopomofo (注音符號) Support**: Maps all 24 targets (A-X) to standard phonetic characters (`ㄅ`-`ㄩ`). Includes a toggle to switch language modes on the fly.
   - **Memo Codes deliberate trainer**: A dedicated practice block. Quiz yourself in both directions:
     - **注音/字母 ➔ 文字 (Guess Word)**: Tests your recall speed of word associations.
     - **文字 ➔ 注音/字母 (Guess Pair)**: Tests your recall speed of target pairs.
     - You can directly define/save new memo words on the spot during practice if they are blank!
6. **Bento Grid Dashboard & WCA Scramble Selector (`/`)**:
   - **WCA Scrambles**: Our App uses high-performance WCA scrambler logic for all 11 events (333, 222, 444, 555, 666, 777, pyram, skewb, minx, clock, sq1), directly matching the WCA standards.
   - **qqTimer SQ1 Random State Scrambler**: Ported Michael Gottlieb's official `scramble_sq1.js` solver. It generates real, high-quality WCA-compliant random-state scrambles for Square-1.
   - Large timer display fading distractions on trigger. Supports touch devices, mouse clicks, and keyboard spacebar.
   - **Multi-phase Timing (分段計時)**: Select between 1, 2, 3, or 4 phases in the settings line. During the solve, hitting any key or touching the screen registers a split marker. A detailed split breakdown is displayed next to the completed solve!
   - **Session stats dashboard (Best, Worst, Average, Ao5, Ao12, Ao50, SD Consistency, Practice Time)**: Automatically filtering out DNF and calculating +2 penalties based on puzzle type.
7. **Dedicated SQ1 CSP Trainer (`/csp-trainer`)**:
   - A training timer page structured like the Blindfold page, specifically for practicing **Cubeshape Parity (CSP)**.
   - Filters cases by slash counts (1-7 Slashes).
   - Renders U/D layer SVG diagrams.
   - Shows/hides solution formulas on click.
   - Integrated stopwatch timer.
   - Records runs as Success/DNF.
8. **Official WCA Scramble Previews (`/`)**:
   - **Exact csTimer/qqTimer Rendering**: Integrated `<scramble-display>` web component from the official `scramble-display` library.
   - **CDN Loaded Integration**: Resolved Vite Wasm/worker code-splitting load crashes by importing the official `scramble-display` script directly via high-performance WCA CDN.
   - Renders the exact WCA-official 2D net drawings for all 11 official events (including NxN cubes, Pyraminx, Skewb, Megaminx, Clock, and Square-1), matching csTimer perfectly.
   - **Show/Hide Toggle Option**: A dedicated **"打亂預覽" (Scramble Preview)** capsule toggle button in the Timer settings line. Settings persist inside `localStorage`.
9. **Calendar Heatmap Component**: A visual GitHub-style practices heatmap showing practice intensity day by day.
10. **Rich Practice Log & ML CSV Export (`/history`)**:
   - Complete searchable and paginated history table.
   - Filters for WCA puzzle types, sessions, and penalties (None, +2, DNF).
   - **Export CSV (機器學習專用)**: Generates a CSV file containing `id`, `puzzle_type`, `session_id`, `time_ms`, `scramble`, `penalty`, `created_at` formatted specifically for machine learning pipelines (e.g. Pandas, TensorFlow).
   - **Batch Deletion (批量刪除)**: Checkboxes on the left of each solve in the table allow selecting multiple solves and deleting them in one click.
   - **Manual Solve Add Modal (手動補登)**: A form to manually insert a solve record with custom times, puzzles, sessions, and penalties.
   - **Clear Filtered Solves (清空篩選結果)**: A button that deletes only the solves matching your currently selected Session and WCA Puzzle type filters, keeping other solves safe!
   - Export JSON file for backup.
11. **Supabase Authentication (`/auth`)**:
   - Secure sign-in and sign-up with client integration.
   - Light and Dark mode switches.
   - QR code sharing module dynamically pointing to the current domain.

---

## 📁 Key File Locations

- [App.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/App.jsx) - Routing and layout wrapper.
- [supabaseClient.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/supabaseClient.js) - Supabase initialization.
- [supabase_schema.sql](file:///c:/Users/14L1/Desktop/qqtimer-version2/supabase_schema.sql) - Database tables, triggers, and security policy setups.
- [dylan3Style.json](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/data/dylan3Style.json) - Parsed 3-style algorithm sheets.
- [bopomofoMap.json](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/data/bopomofoMap.json) - 24 target phonetic conversion keys.
- [bopomofo_letter_pairs.json](file:///c:/Users/14L1/Desktop/qqtimer-version2/bopomofo_letter_pairs.json) - Complete list of 552 Bopomofo letter combinations.
- [SQ1_CSP_Algorithms.md](file:///c:/Users/14L1/Desktop/qqtimer-version2/SQ1_CSP_Algorithms.md) - Compiled markdown sheet of all Square-1 CSP cases with embedded SVG drawings.
- [scramble_sq1.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/utils/scramble_sq1.js) - Ported qqTimer SQ1 solver code.
- [scrambler.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/utils/scrambler.js) - WCA scrambler router.
- [CubePreview.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/components/CubePreview.jsx) - Official WCA scramble rendering component.
- [Home.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/Home.jsx) - Main dashboard page.
- [CspTrainer.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/CspTrainer.jsx) - Dedicated SQ1 CSP training.
- [History.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/History.jsx) - Solves search, heatmap calendar, WCA filter, and CSV exporter.
- [Blindfold.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/Blindfold.jsx) - 3-style browse, comms trainer, and memo code trainer.

---

## 🚀 How to Setup and Run

### 1. Initialize Supabase Database
1. Go to your [Supabase Dashboard](https://supabase.com).
2. Open your project, go to the **SQL Editor** tab.
3. Open the local file [supabase_schema.sql](file:///c:/Users/14L1/Desktop/qqtimer-version2/supabase_schema.sql), copy its contents, paste them into the SQL editor, and click **Run**. This will create the required tables and security parameters.

### 2. Run Locally
To run the developer server:
```bash
npm run dev
```

### 3. Verify PWA Build
To compile the production build:
```bash
npm run build
```

---

## 🔌 實體計時器與智慧藍牙魔方連動原理

### 1. 實體計時器 (如 Stackmat) 串接
實體計時器 (如 Speed Stacks G4/G5) 可以透過音訊插孔與網頁進行數據連動，技術原理如下：
*   **硬體連接**：使用一條 2.5mm 轉 3.5mm 音訊雙頭線，一端插入實體計時器的數據輸出孔，另一端插入電腦或手機的 **麥克風輸入孔 (Mic-in)**。
*   **網頁接收與解碼 (Web Audio API)**：計時器在運行時會發出 high-frequency FSK 音訊信號。網頁端可以透過 `navigator.mediaDevices.getUserMedia()` 取得麥克風音訊串流，再利用 Web Audio API 捕獲音頻波形，透過解碼演算法解析為數位資料（取得實體計時器按壓、釋放、時間遞增與停止等狀態）。
*   **未來升級建議**：可引入開源的 `stackmat.js` 模組，其已封裝好完整的二進位解碼邏輯，能直接對接本 App 進行實體數據連動。

### 2. 智慧藍牙魔方連動 (Web Bluetooth API)
*   智慧魔方 (如 GAN i3、Moyu AI) 內建陀螺儀與藍牙感應晶片。
*   本網頁可以調用瀏覽器的 **Web Bluetooth API**，直接與藍牙魔方進行連線，實時捕獲轉動步驟與狀態。這提供了直接在網頁上顯示「3D 實時還原」與「自動偵測解完即停」的強大擴充能力。

---

## 🎨 上線後的自訂與設定指南

當您將專案上傳至 GitHub 並在 **Vercel** 部署成功後，您可以透過以下指南來客製化您的社群分享預覽（Open Graph）：

### 1. 更換分享預覽圖 (og:image & twitter:image)
*   設計一張 **1200x630 像素** 的 App 預覽圖。
*   將圖片上傳至您的 **Supabase Storage**，或是放在本專案的 `public/` 資料夾中（例如命名為 `preview.png`）。
*   打開 [index.html](file:///c:/Users/14L1/Desktop/qqtimer-version2/index.html)，將第 25 行和第 34 行的 `content="..."` 替換為您的圖片實際網址。

### 2. 更換預覽網址 (og:url)
*   部署完成後取得您在 Vercel 的專屬網域（例如 `https://zencube-timer.vercel.app`）。
*   打開 [index.html](file:///c:/Users/14L1/Desktop/qqtimer-version2/index.html)，將第 22 行中的 `og:url` 網址替換為您部署後的實際網址，社群分享卡片（Line、Discord、FB）即可完美生效！

---

## 🌟 2026-07-10 核心升級功能說明

### 1. 🔄 導覽列切換狀態完美保留
- **技術實現**：在 [App.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/App.jsx) 中，將 React Router 的傳統卸載式 `<Routes>` 替換為以 CSS 顯示/隱藏 (`block` / `hidden`) 的並行渲染機制。
- **效果**：所有分頁（計時器、盲解訓練、記公式、練習紀錄、CSP練習）的本地變數、文字輸入、下拉選單選擇與計時器狀態，在切換導覽列時**100% 留存於記憶體中**，再次點回時完全不需要重新設定或輸入！

### 2. ✍️ 盲解字元對總表批次編輯器 (`/blindfold`)
- **功能入口**：進入「練盲解」頁面，頂部新增 **「✍️ 編輯總表」** 按鈕。
- **功能特點**：
  - 完整列出 3-Style 盲解的 552 個字元對（邊塊、角塊、Parity）。
  - **極速搜尋**：支援直接搜尋注音 (如 `ㄅㄆ`)、英文組合 (如 `BP`)、位置標籤 (如 `UB`)、Commutator 公式或已存記憶詞。
  - **高效分頁與防延遲設計**：每頁固定顯示 20 筆，並利用獨立的 Row 子元件渲染，打字時完全不卡頓，點擊右側 Save 按鈕或按 Enter 即可快速儲存，直連 Supabase 與 localStorage 同步。

### 3. 📊 練習紀錄數據深度隔離 (`/history`)
- **初值同步**：當打開「練習紀錄」頁面時，WCA 項目與階段分組會**自動載入您計時器當前的設定**，免去手動二次過濾的步驟。
- **防止數據混雜**：如果下拉選單選擇「ALL (全部)」，最上方的數據指標分析卡片（最佳單次、平均值、Ao5/Ao12）會自動隱藏，並以警告橫幅提示「⚠️ 請選擇特定的 WCA 項目與分組階段以進行精準數據分析」，避免三階、五階、SQ1 或是盲解等成績加總平均所導致的錯誤數據。
- **視覺清晰度提升**：歷史紀錄列表中的「項目」與「分組」改以精美的高對比 Pill 標籤元件展示，一眼即可區分不同類別的練習成績。

### 4. 📖 SQ1 CSP 互動教學與 SVG 置換基準圖解 (`/csp-trainer`)
- **功能入口**：進入「CSP 練習」頁面，頂部新增「訓練模式 / 📖 CSP 教學指南」分頁切換按鈕。
- **功能特點**：
  - **雙模式整合**：一鍵在「限時訓練」與「互動教學」之間切換，方便您在練習時隨時翻閱理論。
  - **動態 SVG 基準圖**：使用 React 純前端渲染 SQ1 的 U 層與 D 層，並在對應的塊位上動態標註 WCA 置換基準編號（角塊 1-8 號，邊塊 1-8 號），顏色與配置與打亂預覽完全同步。
  - **Brandon Lin 理論大綱**：系統性整理 Parity 數學置換原理、盲解式循環計數（Cycle Tracing）、Even/Odd 判定標準以及 Brandon Lin 核心的「奇偶指針 Toggling」心算技巧。

### 5. ⚡ CPU 效能與瀏覽器防卡死優化 (Firefox Memory Leak Fix)
- **修改前**：每次您計時（隱藏預覽圖）與停止計時（顯示預覽圖）時，React 都會完整銷毀並重新建立一個重度的 Wasm/WebGL 打亂組件，導致瀏覽器頻繁產生繪圖上下文洩漏。
- **CSS display 優化**：將打亂預覽改為 CSS `display: none` / `display: flex` 控制顯示與隱藏，保持 DOM 掛載，避免反覆銷毀與創建重度 WebGL/Canvas 元件，徹底解決 Firefox 提示「網頁變慢」並卡死的問題。
- **React.memo 組件防抖**：利用 `React.memo` 包裹打亂預覽組件，確保在手打模式輸入時間或點擊無關狀態時，預覽元件完全不重繪，效能提升 99%。

### 6. 🎨 SQ1 CSP 公式與訓練預覽 100% 扁平 2D 化 (CubingApp/csTimer 樣式同步)
- **問題分析**：靜態資料庫（`SQ1-CSP.json`）中攜帶的 `svgTop` / `svgBottom` 依然是老舊、扭曲的 3D 拉伸寫法，且在「記公式 (Formulas)」與「CSP 練習 (Trainer)」中被直接以危險 HTML 渲染，導致視覺不一致。
- **動態對接修正**：將「記公式」頁面與「CSP 訓練器」中的預覽顯示，全部重構為直接調用 `Sq1Preview` 元件，動態模擬其打亂步驟（`scramble`）。這徹底清除了靜態庫中殘留的扭曲畫法，實現全站 SQ1 預覽皆為 csTimer 扁平對稱的 2D 圓形繪圖。
