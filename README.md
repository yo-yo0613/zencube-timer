# 🧩 ZenCube Timer & Trainer

**ZenCube** 是一個採用 **Bento Grid** 風格設計的現代化魔術方塊計時器與盲解/CSP 訓練網頁 App。專為專業 Speedcuber 打造，擁有極致簡約的黑白配色，電腦/平板端為 Bento Grid 排版，手機端則為 Apple Style 簡約 stopwatch 排版。

支援離線使用（PWA）、Supabase 雲端同步、11項 WCA 項目打亂、3-Style 注音符號盲解訓練，以及 Square-1 CSP 刻意練習，並提供專為**機器學習 (Machine Learning)** 訓練設計的 CSV 資料匯出功能。

---

## ✨ 核心功能特色

*   **⏱️ 多功能計時器與 WCA 打亂**：
    *   內建獨立、零依賴的 WCA 規範打亂生成器，支援 **2x2x2 - 7x7x7、Pyraminx、Skewb、Megaminx、Clock 以及 Square-1** 等 11 項官方項目。
    *   支援 WCA 15 秒觀察期、空白鍵/觸控螢幕按住觸發、自動統計（最佳、最慢、Ao5、Ao12），防干擾淡化動畫。
    *   **實體計時器手打模式 (Manual Input)**：支援手打錄入時間。輸入 `1258` 自動解析為 `12.58` 秒（WCA 最速輸入規格），亦支援 `1:05.12` 分秒格式。
*   **🧠 3-Style 盲解訓練庫 (注音/英文雙支援)**：
    *   **Bopomofo (注音符號) 系統**：專為中文使用者設計，將 24 個 Speedsolving 字母標籤映射至 `ㄅ` 到 `ㄩ`。
    *   **刻意練習模組**：支援「公式背誦」與「編碼練習」雙模式。在編碼練習中，可進行 `注音/字母 ➔ 文字` 或 `文字 ➔ 注音/字母` 的雙向閃卡測試，並支援在測試中直接編輯/儲存助記詞。
    *   預載 Dylan 3-Style 邊塊 (UF)、角塊 (UFR) 與 Parity 奇偶完整公式庫。
*   **🧩 Square-1 CSP 公式對照庫**：
    *   整合 CubingApp 開源之 SQ1 CSP (Cubeshape Parity) 完整公式庫。
    *   支援按 **1 Slash 至 7 Slashes** 的過濾篩選與關鍵字搜尋。
    *   根目錄獨立匯出 [SQ1_CSP_Algorithms.md](./SQ1_CSP_Algorithms.md) 乾淨表格，方便手機閱讀與列印。
*   **📊 數據中心與 ML CSV 匯出**：
    *   **練習熱力圖**：GitHub 風格日曆看板，以深淺顏色記錄您每一天的練習量。
    *   **豐富的統計面板**：搜尋、篩選（正常、+2、DNF、項目過濾）、分頁表格管理。
    *   **ML CSV 匯出**：一鍵匯出符合機器學習標準的 CSV 數據格式（包含 `id`, `puzzle_type`, `time_ms`, `scramble`, `penalty`, `created_at`），方便匯入 Pandas/TensorFlow 進行個人成績預測。
*   **☁️ 帳號登入與 Supabase 同步**：
    *   整合 Supabase Auth，註冊登入後自動同步計時成績、自訂公式與盲解助記詞。
    *   未登入狀態下，自動啟用 `localStorage` 本地離線備份，登入後自動上傳雲端，兩者無縫切換。
*   **📱 PWA 離線支援與社群分享**：
    *   支援 PWA (Progressive Web App)，可離線計時，並提供 iOS/Android 「加入主畫面」詳細圖文指引。
    *   整合 QR Code 生成，方便手機掃描。
    *   內建 Discord, Line, Twitter/X 的 **Open Graph (OG) 卡片預覽標籤**，分享連結時呈現大圖預覽。

---

## 🛠️ 技術棧 (Tech Stack)

*   **前端框架**：Vite + React (JS)
*   **CSS 樣式**：Tailwind CSS v3 (客製化 class-based 黑色/白色主題切換)
*   **動畫庫**：Framer Motion (頁面切換與淡入淡出動畫)
*   **資料庫與驗證**：Supabase SDK (PostgreSQL + RLS 安全原則)
*   **離線快取**：vite-plugin-pwa (Workbox SW 離線預載入)
*   **圖示庫**：Lucide React
*   **QR 碼生成**：qrcode.react

---

## 🚀 快速開始

### 1. 複製專案並安裝依賴
```bash
git clone <your-repo-url>
cd qqtimer-version2
npm install
```

### 2. 初始化 Supabase 資料庫
1. 前往您的 [Supabase 控制台](https://supabase.com) 建立一個新專案。
2. 點選 **SQL Editor** 頁籤，將本專案根目錄下的 [supabase_schema.sql](./supabase_schema.sql) 內容複製進去並執行。此動作會建立：
    *   `profiles` (使用者帳號表 + 註冊自動觸發器)
    *   `solves` (計時成績表)
    *   `formulas` (CFOP/自訂公式表)
    *   `bld_memo` (盲解助記詞表)
    並自動配置 RLS 行級安全政策，保障個人隱私。

### 3. 設定環境變數
修改 [src/supabaseClient.js](./src/supabaseClient.js) 中的 `supabaseUrl` 與 `supabaseAnonKey`，替換成您自己的 Supabase API 連線憑證。

### 4. 運行開發環境
```bash
npm run dev
```
瀏覽器打開 `http://localhost:5173` 即可開始使用。

### 5. 產線打包編譯
```bash
npm run build
```
打包後的檔案會存放在 `dist/` 中，可直接拖曳上傳至 Vercel 進行託管！

---

## 📁 專案主要結構說明

```
├── public/
│   ├── robots.txt             # 搜尋引擎引導檔
│   ├── sitemap.xml            # Google Search 網站地圖
│   ├── favicon.svg            # ZenCube 專屬魔方標誌 (Favicon)
│   └── mask-icon.svg          # PWA 遮罩圖示
├── src/
│   ├── components/
│   │   ├── BentoGrid.jsx      # Bento Grid 版面與卡片組件
│   │   ├── CalendarHeatmap.jsx# Github 風格練習日曆熱力圖
│   │   ├── Timer.jsx          # 計時器核心與數據計算
│   │   ├── MobileNavbar.jsx   # 手機端 Apple Style 導覽列
│   │   └── QRShare.jsx        # PWA 安裝指引與 QR Code 生成
│   ├── pages/
│   │   ├── Home.jsx           # 計時首頁 (Bento Grid)
│   │   ├── Formulas.jsx       # 公式管理庫 (CFOP Preset + SQ1 CSP 庫)
│   │   ├── Blindfold.jsx      # 3-Style 盲解查找與編碼刻意練習
│   │   ├── History.jsx        # 數據詳細列表與 CSV 匯出
│   │   └── Auth.jsx           # 會員系統與黑白主題切換
│   ├── data/
│   │   ├── dylan3Style.json   # 編譯後 Dylan 3-Style 完整公式
│   │   ├── SQ1-CSP.json       # 編譯後 SQ1 CSP 完整公式
│   │   └── bopomofoMap.json   # 24 鍵字母與注音符號對應關係
│   ├── utils/
│   │   ├── db.js              # Supabase / LocalStorage 離線同步邏輯
│   │   └── scrambler.js       # 11 項 WCA 官方打亂演算法
│   ├── App.jsx                # 路由與主題控制
│   ├── index.css              # 全域樣式與 Tailwind 載入
│   └── main.jsx               # 入口節點
├── supabase_schema.sql        # Supabase SQL 資料表結構指令
├── SQ1_CSP_Algorithms.md      # 匯出的 Square-1 CSP 完整公式表 (適合列印)
├── bopomofo_letter_pairs.json # 匯出的 552 組注音盲解配對組合
└── vite.config.js             # Vite 與 PWA 生成設定
```

---

## 📄 開源授權

本專案採用 MIT 授權條款開源。
公式數據來源於 CubingApp 與 Dylan 3-Style 記憶公開表。
