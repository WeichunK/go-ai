// IndexedDB 數據存儲管理
// 處理遊戲歷程記錄的持久化

const DB_NAME = 'GoGameDB';
const DB_VERSION = 1;
const STORE_NAME = 'gameHistory';

export class GameStorage {
    constructor() {
        this.db = null;
    }

    // 初始化數據庫
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // 創建對象存儲（如果不存在）
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });

                    // 創建索引以便快速查詢
                    store.createIndex('date', 'date', { unique: false });
                    store.createIndex('difficulty', 'difficulty', { unique: false });
                    store.createIndex('result', 'result', { unique: false });
                }
            };
        });
    }

    // 保存一場對局記錄
    async saveGame(gameData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);

            const record = {
                date: new Date().toISOString(),
                difficulty: gameData.difficulty,
                result: gameData.result, // 'win', 'loss', 'unfinished'
                moves: gameData.moves,
                duration: gameData.duration, // 遊戲時長（秒）
                boardSize: gameData.boardSize || 19,
                finalScore: gameData.finalScore
            };

            const request = store.add(record);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 獲取所有對局記錄
    async getAllGames() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // 獲取統計數據
    async getStatistics() {
        const games = await this.getAllGames();

        const stats = {
            totalGames: games.length,
            wins: 0,
            losses: 0,
            unfinished: 0,
            winRate: 0,
            byDifficulty: {
                easy: { total: 0, wins: 0, losses: 0, winRate: 0 },
                medium: { total: 0, wins: 0, losses: 0, winRate: 0 },
                hard: { total: 0, wins: 0, losses: 0, winRate: 0 }
            },
            totalDuration: 0,
            averageDuration: 0,
            averageMoves: 0
        };

        let totalMoves = 0;

        for (const game of games) {
            // 總體統計
            if (game.result === 'win') stats.wins++;
            else if (game.result === 'loss') stats.losses++;
            else stats.unfinished++;

            stats.totalDuration += game.duration || 0;
            totalMoves += game.moves || 0;

            // 按難度統計
            const difficulty = game.difficulty || 'medium';
            if (stats.byDifficulty[difficulty]) {
                stats.byDifficulty[difficulty].total++;
                if (game.result === 'win') stats.byDifficulty[difficulty].wins++;
                else if (game.result === 'loss') stats.byDifficulty[difficulty].losses++;
            }
        }

        // 計算勝率
        const finishedGames = stats.wins + stats.losses;
        if (finishedGames > 0) {
            stats.winRate = (stats.wins / finishedGames * 100).toFixed(1);
        }

        // 計算各難度勝率
        for (const difficulty in stats.byDifficulty) {
            const diffStats = stats.byDifficulty[difficulty];
            const diffFinished = diffStats.wins + diffStats.losses;
            if (diffFinished > 0) {
                diffStats.winRate = (diffStats.wins / diffFinished * 100).toFixed(1);
            }
        }

        // 平均值
        if (games.length > 0) {
            stats.averageDuration = Math.round(stats.totalDuration / games.length);
            stats.averageMoves = Math.round(totalMoves / games.length);
        }

        return stats;
    }

    // 刪除一場對局記錄
    async deleteGame(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 清除所有記錄
    async clearAll() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    // 導出數據為 JSON
    async exportData() {
        const games = await this.getAllGames();
        const stats = await this.getStatistics();

        return {
            exportDate: new Date().toISOString(),
            statistics: stats,
            games: games
        };
    }

    // 導入數據
    async importData(data) {
        // 清除現有數據
        await this.clearAll();

        // 導入遊戲記錄
        if (data.games && Array.isArray(data.games)) {
            for (const game of data.games) {
                // 移除 id 以便自動生成新的
                const { id, ...gameData } = game;
                await this.saveGame(gameData);
            }
        }
    }
}
