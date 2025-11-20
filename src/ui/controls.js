// UI 控制組件
// 管理遊戲控制按鈕、難度選擇、統計顯示等

export class Controls {
    constructor(game, onStateChange) {
        this.game = game;
        this.onStateChange = onStateChange;
        this.elements = {};
        this.statsUpdateInterval = null;

        this.initElements();
        this.attachEventListeners();
    }

    // 初始化 DOM 元素引用
    initElements() {
        this.elements = {
            newGameBtn: document.getElementById('new-game-btn'),
            undoBtn: document.getElementById('undo-btn'),
            resignBtn: document.getElementById('resign-btn'),
            passBtn: document.getElementById('pass-btn'),
            difficultySelect: document.getElementById('difficulty-select'),
            statsBtn: document.getElementById('stats-btn'),
            exportBtn: document.getElementById('export-btn'),
            clearHistoryBtn: document.getElementById('clear-history-btn'),

            // 狀態顯示
            gameStatus: document.getElementById('game-status'),
            currentPlayer: document.getElementById('current-player'),
            capturedBlack: document.getElementById('captured-black'),
            capturedWhite: document.getElementById('captured-white'),
            moveCount: document.getElementById('move-count'),
            gameDuration: document.getElementById('game-duration'),

            // 統計面板
            statsModal: document.getElementById('stats-modal'),
            statsContent: document.getElementById('stats-content'),
            closeStatsBtn: document.getElementById('close-stats-btn')
        };
    }

    // 附加事件監聽器
    attachEventListeners() {
        this.elements.newGameBtn?.addEventListener('click', () => this.onNewGame());
        this.elements.undoBtn?.addEventListener('click', () => this.onUndo());
        this.elements.resignBtn?.addEventListener('click', () => this.onResign());
        this.elements.passBtn?.addEventListener('click', () => this.onPass());
        this.elements.difficultySelect?.addEventListener('change', (e) => {
            this.onDifficultyChange(e.target.value);
        });
        this.elements.statsBtn?.addEventListener('click', () => this.showStats());
        this.elements.exportBtn?.addEventListener('click', () => this.exportData());
        this.elements.clearHistoryBtn?.addEventListener('click', () => this.clearHistory());
        this.elements.closeStatsBtn?.addEventListener('click', () => this.hideStats());

        // 點擊模態框外部關閉
        this.elements.statsModal?.addEventListener('click', (e) => {
            if (e.target === this.elements.statsModal) {
                this.hideStats();
            }
        });
    }

    // 新遊戲
    onNewGame() {
        const difficulty = this.elements.difficultySelect?.value || 'medium';
        this.game.startNewGame(difficulty);
        this.updateDisplay();
        this.startDurationTimer();

        if (this.onStateChange) {
            this.onStateChange('newGame');
        }
    }

    // 悔棋
    onUndo() {
        const result = this.game.undo();
        if (result.success) {
            this.updateDisplay();
            if (this.onStateChange) {
                this.onStateChange('undo');
            }
        } else {
            this.showMessage(result.reason || '無法悔棋');
        }
    }

    // 認輸
    async onResign() {
        if (!confirm('確定要認輸嗎？')) return;

        const result = this.game.resign();
        if (result.success) {
            this.stopDurationTimer();
            this.showGameResult(result);
            this.updateDisplay();
        }
    }

    // Pass
    onPass() {
        const result = this.game.pass();
        if (result.success) {
            this.updateDisplay();
            if (this.onStateChange) {
                this.onStateChange('pass');
            }
        }
    }

    // 難度變更
    onDifficultyChange(difficulty) {
        // 難度變更會在下一局生效
        this.showMessage(`已選擇 ${this.getDifficultyLabel(difficulty)} 難度，將在下一局生效`);
    }

    // 顯示統計
    async showStats() {
        const stats = await this.game.getStatistics();
        this.renderStats(stats);
        this.elements.statsModal.style.display = 'flex';
    }

    // 隱藏統計
    hideStats() {
        this.elements.statsModal.style.display = 'none';
    }

    // 渲染統計數據
    renderStats(stats) {
        const html = `
      <h3>📊 遊戲統計</h3>
      
      <div class="stats-section">
        <h4>總體戰績</h4>
        <p>總對局數：<strong>${stats.totalGames}</strong></p>
        <p>勝場：<strong>${stats.wins}</strong> | 敗場：<strong>${stats.losses}</strong></p>
        <p>勝率：<strong>${stats.winRate}%</strong></p>
        <p>平均對局時長：<strong>${this.formatDuration(stats.averageDuration)}</strong></p>
        <p>平均手數：<strong>${stats.averageMoves}</strong></p>
      </div>

      <div class="stats-section">
        <h4>各難度戰績</h4>
        
        <div class="difficulty-stats">
          <h5>初級</h5>
          <p>對局：${stats.byDifficulty.easy.total}</p>
          <p>勝率：${stats.byDifficulty.easy.winRate}%</p>
        </div>

        <div class="difficulty-stats">
          <h5>中級</h5>
          <p>對局：${stats.byDifficulty.medium.total}</p>
          <p>勝率：${stats.byDifficulty.medium.winRate}%</p>
        </div>

        <div class="difficulty-stats">
          <h5>高級</h5>
          <p>對局：${stats.byDifficulty.hard.total}</p>
          <p>勝率：${stats.byDifficulty.hard.winRate}%</p>
        </div>
      </div>
    `;

        this.elements.statsContent.innerHTML = html;
    }

    // 導出數據
    async exportData() {
        const data = await this.game.exportData();
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `go-game-history-${new Date().toISOString().split('T')[0]}.json`;
        a.click();

        URL.revokeObjectURL(url);
        this.showMessage('歷史記錄已導出');
    }

    // 清除歷史
    async clearHistory() {
        if (!confirm('確定要清除所有歷史記錄嗎？此操作無法撤銷！')) return;

        await this.game.clearHistory();
        this.showMessage('歷史記錄已清除');
    }

    // 更新顯示
    updateDisplay() {
        // 遊戲狀態
        if (this.elements.gameStatus) {
            const statusMap = {
                ready: '準備開始',
                playing: '對局中',
                finished: '已結束'
            };
            this.elements.gameStatus.textContent = statusMap[this.game.gameState] || '準備開始';
        }

        // 當前玩家
        if (this.elements.currentPlayer) {
            if (this.game.gameState === 'playing') {
                this.elements.currentPlayer.textContent = this.game.getCurrentPlayerName();
                this.elements.currentPlayer.className = this.game.currentPlayer === 1 ? 'black-turn' : 'white-turn';
            } else {
                this.elements.currentPlayer.textContent = '-';
                this.elements.currentPlayer.className = '';
            }
        }

        // 被提子數
        if (this.elements.capturedBlack) {
            this.elements.capturedBlack.textContent = this.game.board.capturedStones.black;
        }
        if (this.elements.capturedWhite) {
            this.elements.capturedWhite.textContent = this.game.board.capturedStones.white;
        }

        // 手數
        if (this.elements.moveCount) {
            this.elements.moveCount.textContent = this.game.moveCount;
        }

        // 按鈕狀態
        const isPlaying = this.game.gameState === 'playing';
        if (this.elements.undoBtn) {
            this.elements.undoBtn.disabled = !isPlaying || this.game.moveCount < 2;
        }
        if (this.elements.resignBtn) {
            this.elements.resignBtn.disabled = !isPlaying;
        }
        if (this.elements.passBtn) {
            this.elements.passBtn.disabled = !isPlaying;
        }
    }

    // 開始時長計時器
    startDurationTimer() {
        this.stopDurationTimer();
        this.statsUpdateInterval = setInterval(() => {
            if (this.game.gameState === 'playing' && this.elements.gameDuration) {
                this.elements.gameDuration.textContent = this.formatDuration(this.game.getGameDuration());
            }
        }, 1000);
    }

    // 停止時長計時器
    stopDurationTimer() {
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
            this.statsUpdateInterval = null;
        }
    }

    // 顯示遊戲結果
    showGameResult(result) {
        const winnerName = result.winner === 'black' ? '黑棋（玩家）' : '白棋（AI）';
        let message = `遊戲結束！\n`;

        if (result.result === 'resignation') {
            message += `${winnerName} 認輸`;
        } else if (result.score) {
            message += `${winnerName} 獲勝\n`;
            message += `黑：${result.score.black.toFixed(1)} 白：${result.score.white.toFixed(1)}`;
        }

        alert(message);
    }

    // 顯示消息
    showMessage(message) {
        // 簡單的 alert，可以改用更美觀的通知組件
        alert(message);
    }

    // 格式化時長
    formatDuration(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }

    // 獲取難度標籤
    getDifficultyLabel(difficulty) {
        const labels = {
            easy: '初級',
            medium: '中級',
            hard: '高級'
        };
        return labels[difficulty] || '中級';
    }

    // 清理
    destroy() {
        this.stopDurationTimer();
    }
}
