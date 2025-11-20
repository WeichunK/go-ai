# 圍棋 AI 對弈

一個功能完整的網頁圍棋應用程式，支持與 AI 對弈並提供多個難度級別。

## 功能特性

- 🎮 **完整圍棋規則**: 支持提子、打劫檢測、終局計算
- 🤖 **AI 對弈**: 基於 Monte Carlo Tree Search (MCTS) 的 AI 引擎
- 📊 **三個難度級別**: 初級、中級、高級
- 📱 **移動端優化**: 響應式設計，支持手機、平板、桌面設備
- 📈 **歷程記錄**: 使用 IndexedDB 記錄對局歷史和統計數據
- 🎨 **現代 UI**: 美觀的界面設計，流暢的動畫效果

## 技術棧

- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **遊戲邏輯**: 自定義圍棋規則引擎
- **AI**: Monte Carlo Tree Search 算法
- **數據存儲**: IndexedDB
- **版本控制**: Git

## 快速開始

1. 克隆專案：
```bash
git clone <repository-url>
cd go-ai
```

2. 直接在瀏覽器中打開 `index.html` 文件即可開始遊戲

## 使用說明

1. 打開應用後，選擇 AI 難度級別
2. 點擊「開始新遊戲」按鈕
3. 點擊棋盤上的交叉點落子
4. 黑白輪流下棋，與 AI 對弈
5. 可以使用「悔棋」功能撤銷上一步
6. 查看「歷程記錄」了解您的對局統計

## 專案結構

```
go-ai/
├── index.html          # 主頁面
├── styles.css          # 樣式文件
├── src/
│   ├── board.js        # 棋盤邏輯
│   ├── game.js         # 遊戲控制器
│   ├── storage.js      # IndexedDB 數據管理
│   ├── ai/
│   │   ├── mcts.js     # MCTS 算法實現
│   │   └── ai-player.js # AI 玩家接口
│   └── ui/
│       ├── board-renderer.js # 棋盤渲染
│       └── controls.js       # UI 控制組件
└── README.md           # 本文件
```

## 瀏覽器支持

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

需要支持 ES6+ 和 IndexedDB。

## 開發

本專案使用純 JavaScript，不需要構建步驟。直接編輯文件後刷新瀏覽器即可看到變化。

## 授權

MIT License

## 貢獻

歡迎提交 Issue 和 Pull Request！
