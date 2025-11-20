// 棋盤渲染器
// 使用 Canvas 繪製圍棋棋盤和棋子

export class BoardRenderer {
    constructor(canvas, board, onCellClick) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.board = board;
        this.onCellClick = onCellClick;
        this.cellSize = 0;
        this.padding = 0;
        this.lastMove = null;
        this.hoveredCell = null;

        this.setupCanvas();
        this.addEventListeners();
    }

    // 設置 Canvas 大小
    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth, container.clientHeight, 800);

        // 設置 Canvas 實際大小（高 DPI 屏幕支持）
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = size * dpr;
        this.canvas.height = size * dpr;

        // 設置 Canvas 顯示大小
        this.canvas.style.width = size + 'px';
        this.canvas.style.height = size + 'px';

        // 縮放繪圖上下文
        this.ctx.scale(dpr, dpr);

        // 計算格子大小和邊距
        this.padding = size * 0.05;
        this.cellSize = (size - 2 * this.padding) / (this.board.size - 1);
    }

    // 添加事件監聽
    addEventListeners() {
        this.canvas.addEventListener('click', (e) => {
            const cell = this.getCellFromEvent(e);
            if (cell && this.onCellClick) {
                this.onCellClick(cell.x, cell.y);
            }
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const cell = this.getCellFromEvent(e);
            this.hoveredCell = cell;
            this.render();
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.hoveredCell = null;
            this.render();
        });

        // 響應式調整
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.render();
        });
    }

    // 從事件獲取棋盤坐標
    getCellFromEvent(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const cellX = Math.round((x - this.padding) / this.cellSize);
        const cellY = Math.round((y - this.padding) / this.cellSize);

        if (cellX >= 0 && cellX < this.board.size &&
            cellY >= 0 && cellY < this.board.size) {
            return { x: cellX, y: cellY };
        }
        return null;
    }

    // 渲染整個棋盤
    render() {
        const size = this.canvas.style.width.replace('px', '');
        this.ctx.clearRect(0, 0, size, size);

        this.drawBoard();
        this.drawStones();
        this.drawHoverIndicator();
        this.drawLastMoveMarker();
    }

    // 繪製棋盤
    drawBoard() {
        const size = this.canvas.style.width.replace('px', '');

        // 背景
        this.ctx.fillStyle = '#DEB887';
        this.ctx.fillRect(0, 0, size, size);

        // 棋盤線條
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.board.size; i++) {
            // 橫線
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding, this.padding + i * this.cellSize);
            this.ctx.lineTo(
                this.padding + (this.board.size - 1) * this.cellSize,
                this.padding + i * this.cellSize
            );
            this.ctx.stroke();

            // 豎線
            this.ctx.beginPath();
            this.ctx.moveTo(this.padding + i * this.cellSize, this.padding);
            this.ctx.lineTo(
                this.padding + i * this.cellSize,
                this.padding + (this.board.size - 1) * this.cellSize
            );
            this.ctx.stroke();
        }

        // 星位（天元和其他星位）
        this.drawStarPoints();
    }

    // 繪製星位
    drawStarPoints() {
        const starPoints = this.getStarPoints();
        this.ctx.fillStyle = '#000';

        for (const point of starPoints) {
            const x = this.padding + point.x * this.cellSize;
            const y = this.padding + point.y * this.cellSize;

            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    // 獲取星位坐標（根據棋盤大小）
    getStarPoints() {
        if (this.board.size === 19) {
            return [
                { x: 3, y: 3 }, { x: 9, y: 3 }, { x: 15, y: 3 },
                { x: 3, y: 9 }, { x: 9, y: 9 }, { x: 15, y: 9 },
                { x: 3, y: 15 }, { x: 9, y: 15 }, { x: 15, y: 15 }
            ];
        } else if (this.board.size === 13) {
            return [
                { x: 3, y: 3 }, { x: 9, y: 3 },
                { x: 6, y: 6 },
                { x: 3, y: 9 }, { x: 9, y: 9 }
            ];
        } else if (this.board.size === 9) {
            return [
                { x: 2, y: 2 }, { x: 6, y: 2 },
                { x: 4, y: 4 },
                { x: 2, y: 6 }, { x: 6, y: 6 }
            ];
        }
        return [];
    }

    // 繪製棋子
    drawStones() {
        for (let y = 0; y < this.board.size; y++) {
            for (let x = 0; x < this.board.size; x++) {
                const stone = this.board.get(x, y);
                if (stone !== 0) {
                    this.drawStone(x, y, stone);
                }
            }
        }
    }

    // 繪製單個棋子
    drawStone(x, y, color) {
        const cx = this.padding + x * this.cellSize;
        const cy = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.45;

        // 陰影
        this.ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        this.ctx.shadowBlur = 4;
        this.ctx.shadowOffsetX = 2;
        this.ctx.shadowOffsetY = 2;

        // 棋子
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);

        if (color === 1) { // 黑子
            const gradient = this.ctx.createRadialGradient(
                cx - radius * 0.3, cy - radius * 0.3, 0,
                cx, cy, radius
            );
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
            this.ctx.fillStyle = gradient;
        } else { // 白子
            const gradient = this.ctx.createRadialGradient(
                cx - radius * 0.3, cy - radius * 0.3, 0,
                cx, cy, radius
            );
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ddd');
            this.ctx.fillStyle = gradient;
        }

        this.ctx.fill();

        // 重置陰影
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
        this.ctx.shadowOffsetX = 0;
        this.ctx.shadowOffsetY = 0;

        // 棋子邊框
        this.ctx.strokeStyle = color === 1 ? '#000' : '#999';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }

    // 繪製懸停指示器
    drawHoverIndicator() {
        if (!this.hoveredCell) return;

        const { x, y } = this.hoveredCell;
        if (this.board.get(x, y) !== 0) return;

        const cx = this.padding + x * this.cellSize;
        const cy = this.padding + y * this.cellSize;
        const radius = this.cellSize * 0.45;

        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    // 繪製最後一手標記
    drawLastMoveMarker() {
        if (!this.lastMove) return;

        const { x, y } = this.lastMove;
        const cx = this.padding + x * this.cellSize;
        const cy = this.padding + y * this.cellSize;
        const size = this.cellSize * 0.2;

        const stone = this.board.get(x, y);
        this.ctx.strokeStyle = stone === 1 ? '#fff' : '#000';
        this.ctx.lineWidth = 2;

        // 繪製小方框
        this.ctx.strokeRect(cx - size, cy - size, size * 2, size * 2);
    }

    // 設置最後一手
    setLastMove(x, y) {
        this.lastMove = { x, y };
        this.render();
    }

    // 清除最後一手標記
    clearLastMove() {
        this.lastMove = null;
        this.render();
    }

    // 更新棋盤引用
    updateBoard(board) {
        this.board = board;
        this.render();
    }
}
