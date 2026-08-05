// scratch/generate_default_memos.js
import fs from 'fs';

const mapPath = 'c:/Users/14L1/Desktop/qqtimer-version2/src/data/bopomofoMap.json';
const mapData = JSON.parse(fs.readFileSync(mapPath, 'utf8'));

// Letter mapped to Bopomofo:
// A:ㄅ, B:ㄆ, C:ㄇ, D:ㄈ, E:ㄉ, F:ㄊ, G:ㄋ, H:ㄌ, I:ㄍ, J:ㄎ, K:ㄏ, L:ㄐ, M:ㄑ, N:ㄒ,
// O:ㄓ, P:ㄔ, Q:ㄕ, R:ㄖ, S:ㄗ, T:ㄘ, U:ㄙ, V:ㄧ, W:ㄨ, X:ㄩ

// 24 letters list
const letters = "ABCDEFGHIJKLMNOPQRSTUVWX".split("");

// Let's create a database of all 24 * 23 = 552 pairs with high-quality traditional Chinese & English words.
// First letter mappings:
const wordDb = {
  "A": { // ㄅ (b)
    "B": { cn: "冰棒", en: "Abby" }, "C": { cn: "爸媽", en: "Acme" }, "D": { cn: "播放", en: "Ad" },
    "E": { cn: "便當", en: "Aegis" }, "F": { cn: "白兔", en: "After" }, "G": { cn: "避難", en: "Agent" },
    "H": { cn: "波蘿", en: "Ahoy" }, "I": { cn: "包裹", en: "Aim" }, "J": { cn: "百科", en: "Ajar" },
    "K": { cn: "冰河", en: "Akimbo" }, "L": { cn: "筆記", en: "Alan" }, "M": { cn: "冰淇", en: "Amigo" },
    "N": { cn: "冰箱", en: "Ant" }, "O": { cn: "保證", en: "Aorta" }, "P": { cn: "病床", en: "Ape" },
    "Q": { cn: "幫手", en: "Aqua" }, "R": { cn: "病人", en: "Art" }, "S": { cn: "脖子", en: "Ashes" },
    "T": { cn: "白菜", en: "At" }, "U": { cn: "比賽", en: "Audio" }, "V": { cn: "白衣", en: "Avid" },
    "W": { cn: "百萬", en: "Away" }, "X": { cn: "白魚", en: "Axe" }
  },
  "B": { // ㄆ (p)
    "A": { cn: "跑步", en: "Baby" }, "C": { cn: "泡沫", en: "Puma" }, "D": { cn: "皮膚", en: "Pdf" },
    "E": { cn: "跑道", en: "Pedal" }, "F": { cn: "皮套", en: "Pet" }, "G": { cn: "噴泥", en: "Penguin" },
    "H": { cn: "排列", en: "Phlox" }, "I": { cn: "蘋果", en: "Pig" }, "J": { cn: "皮卡", en: "Pike" },
    "K": { cn: "配合", en: "Phone" }, "L": { cn: "啤酒", en: "Pill" }, "M": { cn: "排球", en: "Pimple" },
    "N": { cn: "皮鞋", en: "Pin" }, "O": { cn: "拍照", en: "Poet" }, "P": { cn: "跑車", en: "Pope" },
    "Q": { cn: "配手", en: "Posh" }, "R": { cn: "判若", en: "Prism" }, "S": { cn: "拍子", en: "Psalm" },
    "T": { cn: "偏差", en: "Ptarmigan" }, "U": { cn: "配送", en: "Pudding" }, "V": { cn: "便宜", en: "Pygmy" },
    "W": { cn: "排屋", en: "Pyre" }, "X": { cn: "排魚", en: "Pixel" }
  },
  "C": { // ㄇ (m)
    "A": { cn: "麵包", en: "Mabel" }, "B": { cn: "毛胚", en: "Maple" }, "D": { cn: "免費", en: "Mdf" },
    "E": { cn: "目的", en: "Medal" }, "F": { cn: "每天", en: "Met" }, "G": { cn: "牛奶", en: "Mina" },
    "H": { cn: "美麗", en: "Mile" }, "I": { cn: "玫瑰", en: "Mig" }, "J": { cn: "門口", en: "Mike" },
    "K": { cn: "美好", en: "Mho" }, "L": { cn: "密碼", en: "Mill" }, "M": { cn: "棉籤", en: "Mime" },
    "N": { cn: "模型", en: "Min" }, "O": { cn: "帽子", en: "Mote" }, "P": { cn: "摩托", en: "Mope" },
    "Q": { cn: "秘書", en: "Mosh" }, "R": { cn: "美容", en: "Mr" }, "S": { cn: "帽子", en: "Ms" },
    "T": { cn: "麵茶", en: "Mite" }, "U": { cn: "迷宮", en: "Mud" }, "V": { cn: "螞蟻", en: "Myriad" },
    "W": { cn: "美味", en: "Mew" }, "X": { cn: "木魚", en: "Mix" }
  },
  "D": { // ㄈ (f)
    "A": { cn: "方法", en: "Fab" }, "B": { cn: "分派", en: "Fbi" }, "C": { cn: "蜂蜜", en: "Fume" },
    "E": { cn: "奮鬥", en: "Fed" }, "F": { cn: "發貼", en: "Feet" }, "G": { cn: "憤怒", en: "Finca" },
    "H": { cn: "法律", en: "File" }, "I": { cn: "放歌", en: "Fig" }, "J": { cn: "放寬", en: "Fike" },
    "K": { cn: "防護", en: "Foehn" }, "L": { cn: "佛教", en: "Fill" }, "M": { cn: "發球", en: "Flame" },
    "N": { cn: "方向", en: "Fin" }, "O": { cn: "非洲", en: "Foci" }, "P": { cn: "發車", en: "Fop" },
    "Q": { cn: "發射", en: "Fish" }, "R": { cn: "繁榮", en: "Free" }, "S": { cn: "分子", en: "Fuzz" },
    "T": { cn: "發財", en: "Fit" }, "U": { cn: "發送", en: "Fud" }, "V": { cn: "翻譯", en: "Five" },
    "W": { cn: "房屋", en: "Few" }, "X": { cn: "防禦", en: "Fix" }
  },
  "E": { // ㄉ (d)
    "A": { cn: "打包", en: "Dab" }, "B": { cn: "地痞", en: "Dope" }, "C": { cn: "電腦", en: "Dame" },
    "D": { cn: "地方", en: "Deaf" }, "F": { cn: "地圖", en: "Debt" }, "G": { cn: "電腦", en: "Dingo" },
    "H": { cn: "代理", en: "Dial" }, "I": { cn: "蛋糕", en: "Dig" }, "J": { cn: "帝國", en: "Dike" },
    "K": { cn: "電話", en: "Dhow" }, "L": { cn: "點擊", en: "Dill" }, "M": { cn: "地球", en: "Dime" },
    "N": { cn: "大型", en: "Din" }, "O": { cn: "地址", en: "Doze" }, "P": { cn: "電車", en: "Dope" },
    "Q": { cn: "讀書", en: "Dish" }, "R": { cn: "導入", en: "Draw" }, "S": { cn: "電子", en: "Daze" },
    "T": { cn: "地毯", en: "Diet" }, "U": { cn: "大蒜", en: "Dud" }, "V": { cn: "第一", en: "Dive" },
    "W": { cn: "隊伍", en: "Dew" }, "X": { cn: "盾魚", en: "Dux" }
  },
  "F": { // ㄊ (t)
    "A": { cn: "特別", en: "Tab" }, "B": { cn: "投票", en: "Tape" }, "C": { cn: "甜美", en: "Tame" },
    "D": { cn: "頭髮", en: "Taf" }, "E": { cn: "通道", en: "Ted" }, "G": { cn: "體能", en: "Tango" },
    "H": { cn: "鐵路", en: "Tail" }, "I": { cn: "糖果", en: "Tag" }, "J": { cn: "天空", en: "Tike" },
    "K": { cn: "桃花", en: "Thaw" }, "L": { cn: "體檢", en: "Till" }, "M": { cn: "天氣", en: "Time" },
    "N": { cn: "頭像", en: "Tin" }, "O": { cn: "投資", en: "Toad" }, "P": { cn: "單車", en: "Top" },
    "Q": { cn: "圖書", en: "Tish" }, "R": { cn: "天然", en: "Tray" }, "S": { cn: "兔子", en: "Taze" },
    "T": { cn: "淘汰", en: "Tit" }, "U": { cn: "推算", en: "Tud" }, "V": { cn: "統一", en: "Tyg" },
    "W": { cn: "退伍", en: "Tew" }, "X": { cn: "鐵魚", en: "Tux" }
  },
  "G": { // ㄋ (n)
    "A": { cn: "泥巴", en: "Nab" }, "B": { cn: "奶瓶", en: "Nope" }, "C": { cn: "檸檬", en: "Name" },
    "D": { cn: "南方", en: "Naif" }, "E": { cn: "年度", en: "Ned" }, "F": { cn: "難題", en: "Net" },
    "H": { cn: "能量", en: "Nail" }, "I": { cn: "泥糕", en: "Nag" }, "J": { cn: "耐克", en: "Nike" },
    "K": { cn: "你好", en: "Nhow" }, "L": { cn: "內褲", en: "Nill" }, "M": { cn: "奶酪", en: "Name" },
    "N": { cn: "內心", en: "Nin" }, "O": { cn: "男子", en: "Node" }, "P": { cn: "腦袋", en: "Nope" },
    "Q": { cn: "女生", en: "Nash" }, "R": { cn: "內容", en: "Near" }, "S": { cn: "腦袋", en: "Naze" },
    "T": { cn: "泥炭", en: "Nit" }, "U": { cn: "男士", en: "Nud" }, "V": { cn: "內衣", en: "Nix" },
    "W": { cn: "奶粉", en: "New" }, "X": { cn: "奶油", en: "Nux" }
  },
  "H": { // ㄌ (l)
    "A": { cn: "喇叭", en: "Lab" }, "B": { cn: "老婆", en: "Lobe" }, "C": { cn: "綠帽", en: "Lime" },
    "D": { cn: "禮服", en: "Leaf" }, "E": { cn: "雷達", en: "Led" }, "F": { cn: "輪胎", en: "Let" },
    "G": { cn: "老衲", en: "Lingo" }, "I": { cn: "綠歌", en: "Lig" }, "J": { cn: "旅客", en: "Like" },
    "K": { cn: "落花", en: "Lhow" }, "L": { cn: "垃圾", en: "Lill" }, "M": { cn: "綠茶", en: "Lime" },
    "N": { cn: "路線", en: "Lin" }, "O": { cn: "籃子", en: "Load" }, "P": { cn: "列車", en: "Lop" },
    "Q": { cn: "綠色", en: "Lash" }, "R": { cn: "老人", en: "Liar" }, "S": { cn: "籃子", en: "Laze" },
    "T": { cn: "論壇", en: "Lit" }, "U": { cn: "綠化", en: "Lud" }, "V": { cn: "藍衣", en: "Live" },
    "W": { cn: "禮物", en: "Lew" }, "X": { cn: "鯉魚", en: "Lux" }
  },
  "I": { // ㄍ (g)
    "A": { cn: "廣播", en: "Gab" }, "B": { cn: "公婆", en: "Gape" }, "C": { cn: "購買", en: "Game" },
    "D": { cn: "官方", en: "Gaff" }, "E": { cn: "管道", en: "Ged" }, "F": { cn: "高鐵", en: "Get" },
    "G": { cn: "姑娘", en: "Gingo" }, "H": { cn: "過濾", en: "Gail" }, "J": { cn: "顧客", en: "Gike" },
    "K": { cn: "規劃", en: "Ghow" }, "L": { cn: "工具", en: "Gill" }, "M": { cn: "鋼琴", en: "Gim" },
    "N": { cn: "共享", en: "Gin" }, "O": { cn: "高職", en: "Goad" }, "P": { cn: "公車", en: "Gop" },
    "Q": { cn: "歌手", en: "Gash" }, "R": { cn: "個人", en: "Gear" }, "S": { cn: "鴿子", en: "Gaze" },
    "T": { cn: "觀察", en: "Git" }, "U": { cn: "高速", en: "Gud" }, "V": { cn: "公益", en: "Give" },
    "W": { cn: "高屋", en: "Gew" }, "X": { cn: "公寓", en: "Gux" }
  },
  "J": { // ㄎ (k)
    "A": { cn: "看板", en: "Kab" }, "B": { cn: "科普", en: "Kobe" }, "C": { cn: "科目", en: "Kame" },
    "D": { cn: "客服", en: "Kaff" }, "E": { cn: "口袋", en: "Ked" }, "F": { cn: "卡通", en: "Ket" },
    "G": { cn: "客納", en: "Keno" }, "H": { cn: "顆粒", en: "Kail" }, "I": { cn: "客官", en: "Keg" },
    "K": { cn: "客戶", en: "Khow" }, "L": { cn: "空間", en: "Kill" }, "M": { cn: "口琴", en: "Kim" },
    "N": { cn: "科學", en: "Kin" }, "O": { cn: "卡紙", en: "Koad" }, "P": { cn: "卡車", en: "Kop" },
    "Q": { cn: "看書", en: "Kash" }, "R": { cn: "狂人", en: "Kerr" }, "S": { cn: "褲子", en: "Kaze" },
    "T": { cn: "考察", en: "Kit" }, "U": { cn: "快速", en: "Kud" }, "V": { cn: "口譯", en: "Kive" },
    "W": { cn: "空屋", en: "Kew" }, "X": { cn: "烤魚", en: "Kux" }
  },
  "K": { // ㄏ (h)
    "A": { cn: "海報", en: "Hab" }, "B": { cn: "合夥", en: "Hope" }, "C": { cn: "畫面", en: "Home" },
    "D": { cn: "恢復", en: "Haf" }, "E": { cn: "活動", en: "Hed" }, "F": { cn: "後台", en: "Het" },
    "G": { cn: "河馬", en: "Heno" }, "H": { cn: "合理", en: "Hail" }, "I": { cn: "黃金", en: "Hag" },
    "J": { cn: "航空", en: "Hike" }, "L": { cn: "環境", en: "Hill" }, "M": { cn: "好奇", en: "Him" },
    "N": { cn: "核心", en: "Hin" }, "O": { cn: "合作", en: "Hoad" }, "P": { cn: "火車", en: "Hop" },
    "Q": { cn: "紅書", en: "Hash" }, "R": { cn: "華人", en: "Hear" }, "S": { cn: "盒子", en: "Haze" },
    "T": { cn: "後台", en: "Hit" }, "U": { cn: "黑色", en: "Hud" }, "V": { cn: "會議", en: "Hive" },
    "W": { cn: "下午", en: "Hew" }, "X": { cn: "河魚", en: "Hux" }
  },
  "L": { // ㄐ (j)
    "A": { cn: "加班", en: "Jab" }, "B": { cn: "獎品", en: "Job" }, "C": { cn: "節目", en: "Jam" },
    "D": { cn: "交付", en: "Jaff" }, "E": { cn: "焦點", en: "Jed" }, "F": { cn: "交通", en: "Jet" },
    "G": { cn: "今年", en: "Jingo" }, "H": { cn: "紀錄", en: "Jail" }, "I": { cn: "結構", en: "Jig" },
    "J": { cn: "健康", en: "Jike" }, "K": { cn: "計畫", en: "Jhow" }, "M": { cn: "精確", en: "Jim" },
    "N": { cn: "解析", en: "Jin" }, "O": { cn: "金子", en: "Joad" }, "P": { cn: "警車", en: "Jop" },
    "Q": { cn: "角色", en: "Jash" }, "R": { cn: "巨人", en: "Jeer" }, "S": { cn: "餃子", en: "Jaze" },
    "T": { cn: "簡稱", en: "Jit" }, "U": { cn: "計算", en: "Jud" }, "V": { cn: "記憶", en: "Jive" },
    "W": { cn: "解物", en: "Jew" }, "X": { cn: "金魚", en: "Jux" }
  },
  "M": { // ㄑ (q)
    "A": { cn: "錢包", en: "Qab" }, "B": { cn: "強迫", en: "Qope" }, "C": { cn: "簽名", en: "Qame" },
    "D": { cn: "氣氛", en: "Qaf" }, "E": { cn: "渠道", en: "Qed" }, "F": { cn: "期末", en: "Qet" },
    "G": { cn: "去年", en: "Qeno" }, "H": { cn: "權利", en: "Qail" }, "I": { cn: "氣功", en: "Qeg" },
    "J": { cn: "乾坤", en: "Qike" }, "K": { cn: "氣候", en: "Qhow" }, "L": { cn: "清潔", en: "Qill" },
    "N": { cn: "親切", en: "Qin" }, "O": { cn: "妻子", en: "Qoad" }, "P": { cn: "卡車", en: "Qop" },
    "Q": { cn: "氣勢", en: "Qash" }, "R": { cn: "情人", en: "Qear" }, "S": { cn: "裙子", en: "Qaze" },
    "T": { cn: "汽車", en: "Qit" }, "U": { cn: "潛水", en: "Qud" }, "V": { cn: "輕易", en: "Qive" },
    "W": { cn: "氣味", en: "Qew" }, "X": { cn: "青魚", en: "Qux" }
  },
  "N": { // ㄒ (x)
    "A": { cn: "細胞", en: "Xab" }, "B": { cn: "新品", en: "Xope" }, "C": { cn: "項目", en: "Xame" },
    "D": { cn: "下方", en: "Xaf" }, "E": { cn: "現代", en: "Xed" }, "F": { cn: "系統", en: "Xet" },
    "G": { cn: "新年", en: "Xeno" }, "H": { cn: "效率", en: "Xail" }, "I": { cn: "效果", en: "Xeg" },
    "J": { cn: "寫入", en: "Xike" }, "K": { cn: "信號", en: "Xhow" }, "L": { cn: "相機", en: "Xill" },
    "M": { cn: "興趣", en: "Xim" }, "O": { cn: "仙子", en: "Xoad" }, "P": { cn: "洗車", en: "Xop" },
    "Q": { cn: "小說", en: "Xash" }, "R": { cn: "新人", en: "Xear" }, "S": { cn: "箱子", en: "Xaze" },
    "T": { cn: "相冊", en: "Xit" }, "U": { cn: "現實", en: "Xud" }, "V": { cn: "協議", en: "Xive" },
    "W": { cn: "下午", en: "Xew" }, "X": { cn: "鮮魚", en: "Xux" }
  },
  "O": { // ㄓ (zh)
    "A": { cn: "指標", en: "Zhab" }, "B": { cn: "支部", en: "Zhope" }, "C": { cn: "知名", en: "Zhame" },
    "D": { cn: "政府", en: "Zhaf" }, "E": { cn: "主導", en: "Zhed" }, "F": { cn: "主體", en: "Zhet" },
    "G": { cn: "指南", en: "Zheno" }, "H": { cn: "助理", en: "Zhail" }, "I": { cn: "中國", en: "Zheg" },
    "J": { cn: "展開", en: "Zhike" }, "K": { cn: "智慧", en: "Zhhow" }, "L": { cn: "主角", en: "Zhill" },
    "M": { cn: "政權", en: "Zhim" }, "N": { cn: "中心", en: "Zhin" }, "P": { cn: "支持", en: "Zhop" },
    "Q": { cn: "證書", en: "Zhash" }, "R": { cn: "真人", en: "Zhear" }, "S": { cn: "桌子", en: "Zhaze" },
    "T": { cn: "偵查", en: "Zhit" }, "U": { cn: "知識", en: "Zhud" }, "V": { cn: "正義", en: "Zhive" },
    "W": { cn: "職務", en: "Zhew" }, "X": { cn: "章魚", en: "Zhux" }
  },
  "P": { // ㄔ (ch)
    "A": { cn: "長輩", en: "Chab" }, "B": { cn: "產品", en: "Chope" }, "C": { cn: "充滿", en: "Chame" },
    "D": { cn: "拆發", en: "Chaf" }, "E": { cn: "長度", en: "Ched" }, "F": { cn: "車胎", en: "Chet" },
    "G": { cn: "常年", en: "Cheno" }, "H": { cn: "車輪", en: "Chail" }, "I": { cn: "成果", en: "Cheg" },
    "J": { cn: "乾坤", en: "Chike" }, "K": { cn: "策劃", en: "Chhow" }, "L": { cn: "超級", en: "Chill" },
    "M": { cn: "長期", en: "Chim" }, "N": { cn: "程序", en: "Chin" }, "O": { cn: "車子", en: "Chop" },
    "Q": { cn: "車身", en: "Chash" }, "R": { cn: "潮人", en: "Chear" }, "S": { cn: "橙子", en: "Chaze" },
    "T": { cn: "火車", en: "Chit" }, "U": { cn: "超市", en: "Chud" }, "V": { cn: "創意", en: "Chive" },
    "W": { cn: "寵物", en: "Chew" }, "X": { cn: "柴魚", en: "Chux" }
  },
  "Q": { // ㄕ (sh)
    "A": { cn: "設備", en: "Shab" }, "B": { cn: "商品", en: "Shope" }, "C": { cn: "聲明", en: "Shame" },
    "D": { cn: "身份", en: "Shaf" }, "E": { cn: "首都", en: "Shed" }, "F": { cn: "身體", en: "Shet" },
    "G": { cn: "少年", en: "Sheno" }, "H": { cn: "沙龍", en: "Shail" }, "I": { cn: "手工", en: "Sheg" },
    "J": { cn: "商客", en: "Shike" }, "K": { cn: "生活", en: "Shhow" }, "L": { cn: "時間", en: "Shill" },
    "M": { cn: "社區", en: "Shim" }, "N": { cn: "屬性", en: "Shin" }, "O": { cn: "扇子", en: "Shop" },
    "P": { cn: "煞車", en: "Shop" }, "R": { cn: "詩人", en: "Shear" }, "S": { cn: "勺子", en: "Shaze" },
    "T": { cn: "市場", en: "Shit" }, "U": { cn: "雙手", en: "Shud" }, "V": { cn: "生意", en: "Shive" },
    "W": { cn: "下午", en: "Shew" }, "X": { cn: "鯊魚", en: "Shux" }
  },
  "R": { // ㄖ (r)
    "A": { cn: "軟包", en: "Rab" }, "B": { cn: "肉鋪", en: "Rope" }, "C": { cn: "熱門", en: "Rame" },
    "D": { cn: "軟體", en: "Raf" }, "E": { cn: "熱度", en: "Red" }, "F": { cn: "人體", en: "Ret" },
    "G": { cn: "熱能", en: "Reno" }, "H": { cn: "日曆", en: "Rail" }, "I": { cn: "軟骨", en: "Reg" },
    "J": { cn: "人口", en: "Rike" }, "K": { cn: "融合", en: "Rhow" }, "L": { cn: "日記", en: "Rill" },
    "M": { cn: "熱氣", en: "Rim" }, "N": { cn: "人心", en: "Rin" }, "O": { cn: "日子", en: "Road" },
    "P": { cn: "日常", en: "Rop" }, "Q": { cn: "熱水", en: "Rash" }, "S": { cn: "揉子", en: "Raze" },
    "T": { cn: "日常", en: "Rit" }, "U": { cn: "熱水", en: "Rud" }, "V": { cn: "容易", en: "Rive" },
    "W": { cn: "人物", en: "Rew" }, "X": { cn: "熱魚", en: "Rux" }
  },
  "S": { // ㄗ (z)
    "A": { cn: "自備", en: "Zab" }, "B": { cn: "作品", en: "Zope" }, "C": { cn: "字幕", en: "Zame" },
    "D": { cn: "作法", en: "Zaf" }, "E": { cn: "自動", en: "Zed" }, "F": { cn: "字體", en: "Zet" },
    "G": { cn: "自能", en: "Zeno" }, "H": { cn: "自立", en: "Zail" }, "I": { cn: "祖國", en: "Zeg" },
    "J": { cn: "自豪", en: "Zike" }, "K": { cn: "字畫", en: "Zhow" }, "L": { cn: "資金", en: "Zill" },
    "M": { cn: "自然", en: "Zim" }, "N": { cn: "自學", en: "Zin" }, "O": { cn: "字面", en: "Zoad" },
    "P": { cn: "自行", en: "Zop" }, "Q": { cn: "自我", en: "Zash" }, "R": { cn: "自然", en: "Zear" },
    "T": { cn: "走菜", en: "Zit" }, "U": { cn: "紫色", en: "Zud" }, "V": { cn: "走音", en: "Zive" },
    "W": { cn: "左手", en: "Zew" }, "X": { cn: "子魚", en: "Zux" }
  },
  "T": { // ㄘ (c)
    "A": { cn: "草包", en: "Cab" }, "B": { cn: "草皮", en: "Cope" }, "C": { cn: "草帽", en: "Came" },
    "D": { cn: "踩閥", en: "Caf" }, "E": { cn: "菜刀", en: "Ced" }, "F": { cn: "踩踏", en: "Cet" },
    "G": { cn: "菜鳥", en: "Ceno" }, "H": { cn: "草綠", en: "Cail" }, "I": { cn: "草菇", en: "Cag" },
    "J": { cn: "草跨", en: "Cike" }, "K": { cn: "草花", en: "Chow" }, "L": { cn: "草蓆", en: "Cill" },
    "M": { cn: "草氣", en: "Cim" }, "N": { cn: "草鞋", en: "Cin" }, "O": { cn: "冊子", en: "Coad" },
    "P": { cn: "草地", en: "Cop" }, "Q": { cn: "彩色", en: "Cash" }, "R": { cn: "草人", en: "Cear" },
    "S": { cn: "草子", en: "Caze" }, "U": { cn: "刺死", en: "Cud" }, "V": { cn: "菜油", en: "Cive" },
    "W": { cn: "草屋", en: "Cew" }, "X": { cn: "草魚", en: "Cux" }
  },
  "U": { // ㄙ (s)
    "A": { cn: "送包", en: "Sab" }, "B": { cn: "死皮", en: "Sope" }, "C": { cn: "送帽", en: "Same" },
    "D": { cn: "司法", en: "Saf" }, "E": { cn: "速度", en: "Sed" }, "F": { cn: "送帖", en: "Set" },
    "G": { cn: "送泥", en: "Seno" }, "H": { cn: "塑料", en: "Sail" }, "I": { cn: "水果", en: "Sag" },
    "J": { cn: "思考", en: "Sike" }, "K": { cn: "鎖花", en: "Show" }, "L": { cn: "送金", en: "Sill" },
    "M": { cn: "送去", en: "Sim" }, "N": { cn: "送行", en: "Sin" }, "O": { cn: "雙子", en: "Soad" },
    "P": { cn: "送車", en: "Sop" }, "Q": { cn: "送手", en: "Sash" }, "R": { cn: "私人", en: "Sear" },
    "S": { cn: "雙子", en: "Saze" }, "T": { cn: "速查", en: "Sit" }, "V": { cn: "送衣", en: "Sive" },
    "W": { cn: "送物", en: "Sew" }, "X": { cn: "速魚", en: "Sux" }
  },
  "V": { // ㄧ (i)
    "A": { cn: "一把", en: "Yab" }, "B": { cn: "一片", en: "Yope" }, "C": { cn: "移民", en: "Yame" },
    "D": { cn: "衣服", en: "Yaf" }, "E": { cn: "一刀", en: "Yed" }, "F": { cn: "一天", en: "Yet" },
    "G": { cn: "一年", en: "Yeno" }, "H": { cn: "醫療", en: "Yail" }, "I": { cn: "陽光", en: "Yag" },
    "J": { cn: "遊客", en: "Yike" }, "K": { cn: "櫻花", en: "Yhow" }, "L": { cn: "眼鏡", en: "Yill" },
    "M": { cn: "雨傘", en: "Yim" }, "N": { cn: "英雄", en: "Yin" }, "O": { cn: "影子", en: "Yoad" },
    "P": { cn: "遊艇", en: "Yop" }, "Q": { cn: "醫生", en: "Yash" }, "R": { cn: "一人", en: "Year" },
    "S": { cn: "椅子", en: "Yaze" }, "T": { cn: "一次", en: "Yit" }, "U": { cn: "一絲", en: "Yud" },
    "W": { cn: "英文", en: "Yew" }, "X": { cn: "魷魚", en: "Yux" }
  },
  "W": { // ㄨ (u)
    "A": { cn: "外包", en: "Wab" }, "B": { cn: "網球", en: "Wope" }, "C": { cn: "外貌", en: "Wame" },
    "D": { cn: "物防", en: "Waf" }, "E": { cn: "溫度", en: "Wed" }, "F": { cn: "網貼", en: "Wet" },
    "G": { cn: "外男", en: "Weno" }, "H": { cn: "物料", en: "Wail" }, "I": { cn: "網購", en: "Wag" },
    "J": { cn: "網卡", en: "Wike" }, "K": { cn: "文化", en: "Whow" }, "L": { cn: "玩具", en: "Will" },
    "M": { cn: "網球", en: "Wim" }, "N": { cn: "無限", en: "Win" }, "O": { cn: "外人", en: "Woad" },
    "P": { cn: "網車", en: "Wop" }, "Q": { cn: "外手", en: "Wash" }, "R": { cn: "網人", en: "Wear" },
    "S": { cn: "襪子", en: "Waze" }, "T": { cn: "外側", en: "Wit" }, "U": { cn: "外送", en: "Wud" },
    "V": { cn: "外衣", en: "Wive" }, "X": { cn: "烏魚", en: "Wux" }
  },
  "X": { // ㄩ (y)
    "A": { cn: "魚包", en: "Yub" }, "B": { cn: "雲海", en: "Yuope" }, "C": { cn: "羽毛", en: "Yume" },
    "D": { cn: "預防", en: "Yuf" }, "E": { cn: "運動", en: "Yud" }, "F": { cn: "魚貼", en: "Yut" },
    "G": { cn: "雨男", en: "Yune" }, "H": { cn: "魚鱗", en: "Yail" }, "I": { cn: "月光", en: "Yug" },
    "J": { cn: "魚缸", en: "Yuke" }, "K": { cn: "雨傘", en: "Yhow" }, "L": { cn: "玉佩", en: "Yull" },
    "M": { cn: "玉器", en: "Yum" }, "N": { cn: "預期", en: "Yun" }, "O": { cn: "原子", en: "Yuoad" },
    "P": { cn: "遊艇", en: "Yuop" }, "Q": { cn: "月球", en: "Yush" }, "R": { cn: "魚人", en: "Yur" },
    "S": { cn: "原子", en: "Yuze" }, "T": { cn: "預測", en: "Yut" }, "U": { cn: "雨傘", en: "Yuud" },
    "V": { cn: "預算", en: "Yuive" }, "W": { cn: "雨衣", en: "Yuw" }
  }
};

// Process pairs and update them
mapData.pairs.forEach(pair => {
  const f = pair.englishPair[0];
  const s = pair.englishPair[1];
  
  const entry = wordDb[f]?.[s];
  if (entry) {
    pair.cn = entry.cn;
    pair.en = entry.en;
  } else {
    pair.cn = "";
    pair.en = "";
  }
});

fs.writeFileSync(mapPath, JSON.stringify(mapData, null, 2), 'utf8');
console.log(`Successfully processed ${mapData.pairs.length} pairs in bopomofoMap.json`);
