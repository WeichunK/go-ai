// 遊戲控制器
// 管理遊戲流程、玩家輪流、AI 對弈等

import { GoBoard } from './board.js';
import { AIPlayer } from './ai/ai-player.js';
import { GameStorage } from './storage.js';

export class Game {
    constructor() {
        this.board = new GoBoard(19);
        this.currentPlayer = 1; // 1 = 黑棋（玩家）, -1 = 白棋（AI）
        this.aiPlayer = new AIPlayer(-1, 'medium'); // AI 下白棋
        this.storage = new GameStorage();
        this.gameState = 'ready'; // ready, playing, finished
        this.passCount = 0; // 連續 pass 次數
        this.gameStartTime = null;
        this.moveCount = 0;
        this.isAIThinking = false;
    }

    // 初始化
    async init() {
        await this.storage.init();
    }

    // 開始新遊戲
    startNewGame(difficulty = 'medium') {
        this.board.reset();
        this.currentPlayer = 1; // 黑棋先手
        this.aiPlayer.setDifficulty(difficulty);
        this.aiPlayer.resetMoveCount(); // 重置 AI 手數計數
        this.gameState = 'playing';
        this.passCount = 0;
        this.gameStartTime = Date.now();
        this.moveCount = 0;
        this.isAIThinking = false;
    }

    // 玩家落子
    async playerMove(x, y) {
        if (this.gameState !== 'playing') {
            return { success: false, reason: '遊戲未開始或已結束' };
        }

        if (this.currentPlayer !== 1) {
            return { success: false, reason: '現在是 AI 的回合' };
        }

        if (this.isAIThinking) {
            return { success: false, reason: 'AI 正在思考中' };
        }

        const result = this.board.makeMove(x, y, this.currentPlayer);

        if (result.success) {
            this.moveCount++;
            this.passCount = 0;
            this.currentPlayer = -this.currentPlayer;

            // AI 回應
            await this.aiMove();
        }

        return result;
    }

    // AI 落子
    async aiMove() {
        if (this.gameState !== 'playing' || this.currentPlayer !== -1) {
            return;
        }

        this.isAIThinking = true;

        try {
            const move = await this.aiPlayer.getMove(this.board);

            if (move) {
                const result = this.board.makeMove(move.x, move.y, this.currentPlayer);
                if (result.success) {
                    this.moveCount++;
                    this.passCount = 0;
                    this.currentPlayer = -this.currentPlayer;
                    return { success: true, move };
                }
            } else {
                // AI 沒有合法落子，pass
                return this.pass();
            }
        } finally {
            this.isAIThinking = false;
        }
    }

    // Pass（跳過）
    pass() {
        this.passCount++;
        this.currentPlayer = -this.currentPlayer;

        if (this.passCount >= 2) {
            // 雙方都 pass，遊戲結束
            this.endGame();
        }

        return { success: true, action: 'pass' };
    }

    // 悔棋
    undo() {
        if (this.gameState !== 'playing') {
            return { success: false, reason: '遊戲未開始或已結束' };
        }

        // 悔棋兩步（玩家的一步 + AI 的一步）
        let result1 = this.board.undo(); // 撤銷 AI 的落子
        let result2 = this.board.undo(); // 撤銷玩家的落子

        if (result1.success && result2.success) {
            this.moveCount = Math.max(0, this.moveCount - 2);
            this.currentPlayer = 1; // 回到玩家回合
            this.passCount = 0;
            return { success: true };
        }

        return { success: false, reason: '無法悔棋' };
    }

    // 認輸
    resign() {
        if (this.gameState !== 'playing') {
            return { success: false };
        }

        this.gameState = 'finished';
        const duration = Math.floor((Date.now() - this.gameStartTime) / 1000);

        // 保存對局記錄
        this.storage.saveGame({
            difficulty: this.aiPlayer.difficulty,
            result: 'loss',
            moves: this.moveCount,
            duration: duration,
            boardSize: this.board.size,
            finalScore: null
        });

        return {
            success: true,
            winner: 'AI',
            result: 'resignation'
        };
    }

    // 結束遊戲
    endGame() {
        if (this.gameState !== 'playing') return;

        this.gameState = 'finished';
        const score = this.board.calculateScore();
        const duration = Math.floor((Date.now() - this.gameStartTime) / 1000);

        // 判斷玩家勝負（玩家是黑棋）
        const playerResult = score.winner === 'black' ? 'win' : 'loss';

        // 保存對局記錄
        this.storage.saveGame({
            difficulty: this.aiPlayer.difficulty,
            result: playerResult,
            moves: this.moveCount,
            duration: duration,
            boardSize: this.board.size,
            finalScore: score
        });

        return {
            winner: score.winner,
            score: score,
            playerResult: playerResult
        };
    }

    // 獲取統計數據
    async getStatistics() {
        return await this.storage.getStatistics();
    }

    // 導出數據
    async exportData() {
        return await this.storage.exportData();
    }

    // 導入數據
    async importData(data) {
        return await this.storage.importData(data);
    }

    // 清除所有歷史記錄
    async clearHistory() {
        return await this.storage.clearAll();
    }

    // 獲取當前玩家名稱
    getCurrentPlayerName() {
        return this.currentPlayer === 1 ? '黑棋（玩家）' : '白棋（AI）';
    }

    // 獲取遊戲時長（秒）
    getGameDuration() {
        if (!this.gameStartTime) return 0;
        return Math.floor((Date.now() - this.gameStartTime) / 1000);
    }
}
