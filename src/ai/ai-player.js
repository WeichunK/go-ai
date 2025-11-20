// AI 玩家接口
// 管理 AI 決策和難度級別

import { MCTS } from './mcts.js';

export class AIPlayer {
    constructor(color, difficulty = 'medium') {
        this.color = color; // 1 (黑) 或 -1 (白)
        this.difficulty = difficulty;
        this.simulationsMap = {
            easy: 300,      // 初級：300 次模擬
            medium: 2000,   // 中級：2000 次模擬
            hard: 5000      // 高級：5000 次模擬
        };
    }

    // 設置難度
    setDifficulty(difficulty) {
        if (this.simulationsMap[difficulty]) {
            this.difficulty = difficulty;
        }
    }

    // 獲取當前難度的模擬次數
    getSimulations() {
        return this.simulationsMap[this.difficulty] || this.simulationsMap.medium;
    }

    // 使用 MCTS 選擇最佳落子
    async getMove(board) {
        return new Promise((resolve) => {
            // 在下一個事件循環中執行，避免阻塞 UI
            setTimeout(() => {
                const mcts = new MCTS(board, this.color, this.getSimulations());
                const move = mcts.search();
                resolve(move);
            }, 0);
        });
    }

    // 在 Web Worker 中執行 MCTS（更好的性能）
    // 注意：需要額外設置 Worker
    async getMoveWithWorker(board) {
        // TODO: 實現 Web Worker 版本
        // 目前使用普通版本
        return this.getMove(board);
    }

    // 獲取難度顯示名稱
    getDifficultyLabel() {
        const labels = {
            easy: '初級',
            medium: '中級',
            hard: '高級'
        };
        return labels[this.difficulty] || '中級';
    }
}
