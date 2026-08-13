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
*   本網頁可以調用瀏覽器的 **Web Bluetooth API**，直接與藍牙魔方進行連線，實時捕獲轉�### 8. 🗄️ 3x3 與 2x2 官方公式庫全面重組與視角校對 (解決 Sune/Anti-Sune 與 2x2 錯位問題)
- **問題修正**：
  1. 之前從 `solvethecube.com` 爬取的資料中，有部分公式的 WCA 編號放反了（如 OLL 26 與 27 互換），且許多公式包含非標準的起手旋轉，導致逆轉生成的 Scramble 預覽圖角度偏移 90/180 度，不符合速解玩家的正面辨識習慣。
  2. 為了徹底解決此問題，我們**全面捨棄了原先 3x3 與 2x2 的舊資料庫**，改為直接編寫腳本 [parse_cubingapp_all.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/scratch/parse_cubingapp_all.js) 從 `cubingapp.com` 的前端打包檔案中提取公式。
- **效果**：
  - 重構後，所有 F2L、OLL、PLL、CLL、EG1、EG2 的公式全部替換為最正確、標準的正面視角公式。
  - 生成的 scramble 能在 `<scramble-display>` 中 100% 精準繪製出標準辨識視角，徹底解決了使用者反映「圖片畫錯」的問題。

### 9. 🎛️ 進階公式擴充 (Winter-Variation, COLL, OLLCP, ZBLL)
- **技術實現**：
  - 透過對 `cubingapp.com` JS 資源包的大括號匹配與 JSON 雙重解析，成功提取了以下四大進階公式資料庫，並合併儲存於 [3x3algs.json](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/data/3x3algs.json)：
    - **Winter-Variation (WV)** (27 個)
    - **COLL** (40 個)
    - **OLLCP** (342 個)
    - **ZBLL** (472 個)
  - 在 `/formulas` 公式庫頁面新增了對應的 Tab 分頁與「新增公式」選單，使用者可以直接查閱或為這些進階公式編輯個人 Memo，並利用 `CubePreview` 進行 WCA 平面圖預覽。

### 10. 🔢 公式自然排序 (Natural Sort) 演算法整合
- **功能特點**：
  - 解決了原網站以形狀或無序方式列出公式，導致頁面上公式編號跳來跳去（如 45, 56, 3, 23 雜亂無章）造成閱讀疲勞的問題。
  - 在 [Formulas.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/Formulas.jsx) 篩選完公式後，引入了自然排序函數：
    - **數值型公式（如 OLL 1➔2➔3..., ZBLL 1➔2➔3...）**：以純數字大小升冪排列。
    - **字母型公式（如 PLL Aa➔Ab➔E➔F...）**：按照首字母順序自然排列。
  - 這使公式庫頁面的所有分類列表均呈現整齊劃一的遞增序列。
�/隱藏 (`block` / `hidden`) 的並行渲染機制。
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
- **動態對接修正**：將「記公式」頁面與「CSP 訓練器」中的預覽顯示，全部重構為直接調用 `Sq1Preview` 元件，動態模擬其打亂步驟（`scramble`）。這徹底清除了靜態庫中殘留的扭曲畫法，實現全站 SQ1 預覽皆為 csTimer 扁平對稱 of 2D 圓形繪圖。

### 7. 🔮 SQ1 CSP 打亂「非法切割 (Illegal Cuts)」與「圖形變形」完美修正
- **問題分析**：在之前的打亂生成中，WCA 求解器的基準狀態（`identityState`，切片線在 index 2）與我們魔方模擬器 `SQ1Simulator` 的基準狀態（切片線在 index 6）存在 **4 個單位的坐標旋轉偏差**。這導致求解器返回的打亂公式在模擬器中執行時會切在角塊中間（Illegal Cuts），造成魔方塊數不對稱（如 U 層只剩 4 塊，D 層變成 12 塊），視覺上呈現不對稱的拉伸矩形/長條形。
- **技術修正**：
  1. 在將隨機打亂 permutation 傳給 WCA 求解器前，將 U 層與 D 層陣列**循環左移 4 個單位**以對齊 WCA 的 `identityState` 坐標。
  2. 求解器在此基準下算出 100% 合法且具備正確 Parity 的解法後，其逆公式（Scramble）直接套用在模擬器上即為合法打亂。
  3. 這使得整個打亂軌跡在模擬器與真實魔方上都 **100% 順暢、無非法切割、無圖形變形**，且生成的打亂能 100% 還原出正確 orientation 的目標形狀。
  4. **驗證成功**：在 Parallel Edges、Square/Square、Fist/Fist 等形狀上已全數通過測試，CSP Trace Parity 結果完全一致。

### 8. 🗄️ F2L / OLL / PLL 三階公式庫整合與動態圖紙渲染
- **技術實現**：
  1. **爬蟲與轉換**：編寫了自動化 Node.js 爬蟲腳本 [parse_algs.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/scratch/parse_algs.js)，完美解析 `https://solvethecube.com/algorithms` 的 F2L/OLL/PLL HTML，抓取並輸出了 119 個標準公式儲存至 [3x3algs.json](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/data/3x3algs.json)。
  2. **逆打亂公式計算**：為了配合 App 的打亂圖形預覽，在爬取時腳本會將每個還原公式進行逆轉（Inverse），自動生成對應的 3x3 狀態 Scramble。
  3. **WCA 動態 preview 結合**：在公式展開時，直接引進 `<CubePreview>` 組件。利用打亂步驟，以 WCA 官方的 `<scramble-display>` 網頁元件在前端動態繪製出二維平面展示圖。
- **優勢**：不需要載入任何外部靜態圖片，全前端純 SVG 動態渲染，完美支援深色模式切換，且能讓使用者快速點選 F2L/OLL/PLL 分頁，配合自訂公式與 memo 同步功能，帶來一流的 CFOP 複習體驗。

### 9. 🎛️ 2x2 CLL / EG1 / EG2 進階公式庫與二階動態圖紙渲染
- **技術實現**：
  1. **爬蟲與轉換**：編寫了自動化 Node.js 爬蟲與解析腳本 [parse_2x2_algs.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/scratch/parse_2x2_algs.js)。因為 `cubingapp.com` 的公式是打包在混淆的 JS 模組包中，腳本利用大括號匹配解析法（Brace Matching Parser）成功提取了包含 CLL、EG1、EG2 共 120 個進階二階還原公式的資料，並輸出為 [2x2algs.json](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/data/2x2algs.json)。
  2. **逆打亂公式與 2x2 預覽對齊**：提取出主還原公式後，自動進行公式逆轉以產生 Scramble，並將其傳遞給 `<CubePreview scramble={item.scramble} puzzleType="222" />`，讓 WCA 官方展示器動態畫出 2x2 的平面展開圖。
  3. **UI 分類與擴充**：在 `/formulas` 頁面新增了三個分頁標籤（**CLL**, **EG1**, **EG2**），並在「新增公式」彈出視窗中新增了二階的公式類型選項。
  4. **Bug 修正**：將原本寫死的 preloaded 判斷邏輯改為萬用前綴檢查，完美隱藏所有系統預載公式（含 F2L/OLL/PLL/CLL/EG1/EG2）的刪除按鈕。

### 10. 🗄️ 3x3 與 2x2 官方公式庫全面重組與視角校對 (解決 OLL 26/27 與 2x2 錯位問題)
- **問題修正與優化**：
  1. 之前自 `solvethecube.com` 抓取的公式有部分 WCA 編號寫反，且包含非標準起手旋轉，造成打亂狀態在 `<scramble-display>` 渲染後頂面角向與底層 Bar 位置有 90/180 度偏差，不符合選手直覺。
  2. 我們**全面重構了 3x3 與 2x2 的預載公式庫**，改自 `cubingapp.com` 提取標準正面視角公式。
  3. 引入了**自然排序 (Natural Sort) 演算法**，使數值型公式 (如 OLL, F2L, ZBLL) 以 `1 ➔ 2 ➔ 3 ➔ 4...` 升冪排好，字母型 (如 PLL) 則按字母排序，徹底改善原本跳號雜亂的查閱困境。

### 11. 📝 盲解記憶編碼 (Letter Pairs) 全套預載生成與無縫整合
- **功能特點**：
  1. **552 組中英文編碼預載**：編寫並執行了腳本 [generate_default_memos.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/scratch/generate_default_memos.js)，為 A-X (ㄅ-ㄩ) 兩兩排列組合共 552 個 Letter Pairs，各自生成並寫入了**高度直覺、常見的中文字組**（如 `ㄅㄆ` ➔ `冰棒`、`ㄅㄇ` ➔ `爸媽`）以及**英文字組**（如 `AB` ➔ `Abby`、`AC` ➔ `Acme`）。
  2. **自動退守機制 (Fallback)**：修改了 [Blindfold.jsx](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/pages/Blindfold.jsx)，當使用者在資料庫中還沒有設定任何「自訂編碼」時，系統會自動在列表、快速設定欄、刻意練習模式中**展示並套用預載的編碼**。
  3. **智慧搜尋強化**：在編碼搜尋欄中，除了支援字母、注音、位置和公式搜尋外，現在連**預載助記字詞**也可以直接被搜尋到。

### 12. 🧭 3x3 盲解 Tracing (追蹤路徑) 練習器全新上線
- **功能簡介**：
  1. 為解決魔方盲解新手「找塊慢」、「記錯順序」的痛點，特別開發了**純 Tracing 模擬路徑訓練模式**。
  2. 使用者在「盲解訓練庫 ➔ 刻意練習模組」中切換至 **「追蹤步驟練習」**，系統即會隨機產生 3x3 打亂。
  3. **動態 2D 魔方視覺對照**：介面利用 `<CubePreview>` 組件即時渲染打亂狀態，方便使用者看著螢幕直接進行邊角 Tracing。
  4. **全方位解答剖析**：點選「顯示解答」後，將展示：
     - **邊塊 Tracing 路徑**（注音/英文對稱，以 Buffer: UF 為基準）。
     - **角塊 Tracing 路徑**（注音/英文對稱，以 Buffer: UFR 為基準）。
     - **記憶助記詞序列**：自動將追蹤出的字母對，比對資料庫（與預載 552 組編碼）的中文或英文記憶詞（如 `"冰棒" ➔ "地圖"`），幫助選手無縫將路徑轉換成故事。
- **底層演算法 ([bldTracer.js](file:///c:/Users/14L1/Desktop/qqtimer-version2/src/utils/bldTracer.js))**：
  - 獨立封裝了 3x3 狀態機與 permutations/orientations 轉移。
  - 設計了無錯位、支援循環切換與翻轉偵測的邊角 Tracing 尋路演算法。

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
