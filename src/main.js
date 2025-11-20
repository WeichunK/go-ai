// 主應用程序入口
// 整合所有組件，初始化應用

import { Game } from './game.js';
import { BoardRenderer } from './ui/board-renderer.js';
import { Controls } from './ui/controls.js';

class GoApp {
    constructor() {
        this.game = null;
        this.renderer = null;
        this.controls = null;
    }

    async init() {
        try {
            // 初始化遊戲
            this.game = new Game();
            await this.game.init();

            // 初始化棋盤渲染器
            const canvas = document.getElementById('game-board');
            this.renderer = new BoardRenderer(
                canvas,
                this.game.board,
                (x, y) => this.handleCellClick(x, y)
            );

            // 初始化控制面板
            this.controls = new Controls(
                this.game,
                (action) => this.handleStateChange(action)
            );

            // 初始渲染
            this.renderer.render();

            console.log('圍棋應用初始化成功');
        } catch (error) {
            console.error('初始化失敗:', error);
            alert('應用初始化失敗，請檢查瀏覽器控制台');
        }
    }

    // 處理棋盤點擊
    async handleCellClick(x, y) {
        if (this.game.gameState !== 'playing') {
            return;
        }

        if (this.game.currentPlayer !== 1) {
            return; // 不是玩家回合
        }

        if (this.game.isAIThinking) {
            return; // AI 正在思考
        }

        const result = await this.game.playerMove(x, y);

        if (result.success) {
            // 更新渲染
            this.renderer.setLastMove(x, y);
            this.controls.updateDisplay();

            // 顯示 AI 思考指示器
            this.showAIThinking();

            // 等待 AI 回應（已在 playerMove 中處理）
            // 等待一小段時間讓 AI 回應完成
            setTimeout(() => {
                this.hideAIThinking();

                // 獲取 AI 的最後一手
                const lastMoveIdx = this.game.board.moveHistory.length - 1;
                if (lastMoveIdx >= 0) {
                    const lastMove = this.game.board.moveHistory[lastMoveIdx];
                    this.renderer.setLastMove(lastMove.x, lastMove.y);
                }

                this.controls.updateDisplay();

                // 檢查遊戲是否結束
                if (this.game.gameState === 'finished') {
                    const result = this.game.endGame();
                    if (result) {
                        this.controls.showGameResult(result);
                    }
                }
            }, 100);
        } else {
            // 顯示錯誤信息
            if (result.reason) {
                this.showMessage(result.reason);
            }
        }
    }

    // 處理狀態變更
    handleStateChange(action) {
        switch (action) {
            case 'newGame':
                this.renderer.clearLastMove();
                this.renderer.updateBoard(this.game.board);
                break;

            case 'undo':
                this.renderer.clearLastMove();
                this.renderer.render();
                break;

            case 'pass':
                // Pass 後可能輪到 AI
                if (this.game.currentPlayer === -1 && this.game.gameState === 'playing') {
                    this.showAIThinking();

                    setTimeout(async () => {
                        await this.game.aiMove();
                        this.hideAIThinking();
                        this.controls.updateDisplay();
                        this.renderer.render();

                        // 檢查遊戲是否結束
                        if (this.game.gameState === 'finished') {
                            const result = this.game.endGame();
                            if (result) {
                                this.controls.showGameResult(result);
                            }
                        }
                    }, 100);
                }
                break;
        }
    }

    // 顯示 AI 思考指示器
    showAIThinking() {
        const indicator = document.getElementById('ai-thinking');
        if (indicator) {
            indicator.style.display = 'flex';
        }
    }

    // 隱藏 AI 思考指示器
    hideAIThinking() {
        const indicator = document.getElementById('ai-thinking');
        if (indicator) {
            indicator.style.display = 'none';
        }
    }

    // 顯示消息
    showMessage(message) {
        // 可以實現更美觀的通知系統
        console.log(message);
    }
}

// 當 DOM 加載完成後初始化應用
document.addEventListener('DOMContentLoaded', async () => {
    const app = new GoApp();
    await app.init();

    // 將 app 實例暴露到全局（方便調試）
    window.goApp = app;
});
