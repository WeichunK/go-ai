// 圍棋棋盤邏輯
// 處理棋盤狀態、落子、提子、打劫規則等

export class GoBoard {
    constructor(size = 19) {
        this.size = size;
        this.board = this.createEmptyBoard();
        this.koPoint = null; // 打劫點
        this.moveHistory = []; // 歷史記錄
        this.capturedStones = { black: 0, white: 0 }; // 被提的子數
    }

    createEmptyBoard() {
        return Array(this.size).fill(null).map(() => Array(this.size).fill(0));
    }

    // 獲取指定位置的棋子（0=空, 1=黑, -1=白）
    get(x, y) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return undefined;
        return this.board[y][x];
    }

    // 設置指定位置的棋子
    set(x, y, color) {
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) return false;
        this.board[y][x] = color;
        return true;
    }

    // 複製棋盤狀態
    clone() {
        const newBoard = new GoBoard(this.size);
        newBoard.board = this.board.map(row => [...row]);
        newBoard.koPoint = this.koPoint ? { ...this.koPoint } : null;
        newBoard.moveHistory = [...this.moveHistory];
        newBoard.capturedStones = { ...this.capturedStones };
        return newBoard;
    }

    // 獲取相鄰位置
    getNeighbors(x, y) {
        const neighbors = [];
        const directions = [[0, 1], [1, 0], [0, -1], [-1, 0]];

        for (const [dx, dy] of directions) {
            const nx = x + dx;
            const ny = y + dy;
            if (nx >= 0 && nx < this.size && ny >= 0 && ny < this.size) {
                neighbors.push({ x: nx, y: ny });
            }
        }
        return neighbors;
    }

    // 獲取一組棋子的所有連接棋子（使用 flood fill）
    getGroup(x, y) {
        const color = this.get(x, y);
        if (color === 0 || color === undefined) return [];

        const group = [];
        const visited = new Set();
        const stack = [{ x, y }];

        while (stack.length > 0) {
            const pos = stack.pop();
            const key = `${pos.x},${pos.y}`;

            if (visited.has(key)) continue;
            visited.add(key);

            if (this.get(pos.x, pos.y) === color) {
                group.push(pos);
                for (const neighbor of this.getNeighbors(pos.x, pos.y)) {
                    stack.push(neighbor);
                }
            }
        }
        return group;
    }

    // 計算一組棋子的氣數
    countLiberties(group) {
        const liberties = new Set();

        for (const { x, y } of group) {
            for (const neighbor of this.getNeighbors(x, y)) {
                if (this.get(neighbor.x, neighbor.y) === 0) {
                    liberties.add(`${neighbor.x},${neighbor.y}`);
                }
            }
        }
        return liberties.size;
    }

    // 移除被提的棋子組
    removeGroup(group) {
        for (const { x, y } of group) {
            this.set(x, y, 0);
        }
    }

    // 檢查並提取無氣的對方棋子
    captureStones(x, y, color) {
        const opponentColor = -color;
        const captured = [];

        for (const neighbor of this.getNeighbors(x, y)) {
            if (this.get(neighbor.x, neighbor.y) === opponentColor) {
                const group = this.getGroup(neighbor.x, neighbor.y);
                if (this.countLiberties(group) === 0) {
                    this.removeGroup(group);
                    captured.push(...group);
                }
            }
        }

        // 更新被提子數統計
        if (captured.length > 0) {
            if (color === 1) {
                this.capturedStones.black += captured.length;
            } else {
                this.capturedStones.white += captured.length;
            }
        }

        return captured;
    }

    // 檢查落子是否合法
    isValidMove(x, y, color) {
        // 1. 位置必須在棋盤內
        if (x < 0 || x >= this.size || y < 0 || y >= this.size) {
            return { valid: false, reason: '位置超出棋盤範圍' };
        }

        // 2. 位置必須為空（最快的檢查）
        if (this.get(x, y) !== 0) {
            return { valid: false, reason: '此位置已有棋子' };
        }

        // 3. 檢查打劫規則（快速檢查）
        if (this.koPoint && this.koPoint.x === x && this.koPoint.y === y) {
            return { valid: false, reason: '打劫禁止立即提回' };
        }

        // 4. 只有在通過上面所有檢查後，才進行昂貴的棋盤克隆和自殺手檢查
        const testBoard = this.clone();
        testBoard.set(x, y, color);

        // 先檢查是否能提對方的子
        const captured = testBoard.captureStones(x, y, color);

        // 檢查自己的棋子組是否有氣
        const myGroup = testBoard.getGroup(x, y);
        const myLiberties = testBoard.countLiberties(myGroup);

        if (myLiberties === 0 && captured.length === 0) {
            return { valid: false, reason: '自殺手（落子後自己無氣）' };
        }

        return { valid: true };
    }

    // 落子
    makeMove(x, y, color) {
        const validation = this.isValidMove(x, y, color);
        if (!validation.valid) {
            return { success: false, reason: validation.reason };
        }

        // 記錄落子前的狀態
        this.moveHistory.push({
            x, y, color,
            boardState: this.board.map(row => [...row]),
            koPoint: this.koPoint ? { ...this.koPoint } : null,
            capturedStones: { ...this.capturedStones }
        });

        // 落子
        this.set(x, y, color);

        // 提子
        const captured = this.captureStones(x, y, color);

        // 更新打劫點
        // 只有提了一個子，且落子的棋子只有一口氣時，才可能是劫
        if (captured.length === 1) {
            const myGroup = this.getGroup(x, y);
            if (this.countLiberties(myGroup) === 1) {
                this.koPoint = { ...captured[0] };
            } else {
                this.koPoint = null;
            }
        } else {
            this.koPoint = null;
        }

        return {
            success: true,
            captured: captured.length,
            koPoint: this.koPoint
        };
    }

    // 悔棋
    undo() {
        if (this.moveHistory.length === 0) {
            return { success: false, reason: '無法悔棋' };
        }

        const lastMove = this.moveHistory.pop();
        this.board = lastMove.boardState;
        this.koPoint = lastMove.koPoint;
        this.capturedStones = lastMove.capturedStones;

        return { success: true, move: { x: lastMove.x, y: lastMove.y } };
    }

    // 獲取所有合法落子點
    getValidMoves(color) {
        const validMoves = [];
        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                if (this.isValidMove(x, y, color).valid) {
                    validMoves.push({ x, y });
                }
            }
        }
        return validMoves;
    }

    // 計算地盤（簡單版本）
    calculateTerritory() {
        const territory = { black: 0, white: 0, neutral: 0 };
        const visited = new Set();

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const key = `${x},${y}`;
                if (visited.has(key) || this.get(x, y) !== 0) continue;

                // 找到一塊空地區域
                const region = [];
                const stack = [{ x, y }];
                const borderingColors = new Set();

                while (stack.length > 0) {
                    const pos = stack.pop();
                    const posKey = `${pos.x},${pos.y}`;

                    if (visited.has(posKey)) continue;

                    const stone = this.get(pos.x, pos.y);
                    if (stone !== 0) {
                        borderingColors.add(stone);
                        continue;
                    }

                    visited.add(posKey);
                    region.push(pos);

                    for (const neighbor of this.getNeighbors(pos.x, pos.y)) {
                        stack.push(neighbor);
                    }
                }

                // 判斷該區域屬於誰
                if (borderingColors.size === 1) {
                    const owner = borderingColors.values().next().value;
                    if (owner === 1) {
                        territory.black += region.length;
                    } else {
                        territory.white += region.length;
                    }
                } else {
                    territory.neutral += region.length;
                }
            }
        }

        return territory;
    }

    // 計算分數（中國規則）
    calculateScore() {
        const territory = this.calculateTerritory();

        // 計算每方的子數 + 地盤
        let blackScore = territory.black;
        let whiteScore = territory.white;

        for (let y = 0; y < this.size; y++) {
            for (let x = 0; x < this.size; x++) {
                const stone = this.get(x, y);
                if (stone === 1) blackScore++;
                else if (stone === -1) whiteScore++;
            }
        }

        // 白方貼目（通常 7.5 目）
        whiteScore += 7.5;

        return {
            black: blackScore,
            white: whiteScore,
            winner: blackScore > whiteScore ? 'black' : 'white',
            diff: Math.abs(blackScore - whiteScore)
        };
    }

    // 重置棋盤
    reset() {
        this.board = this.createEmptyBoard();
        this.koPoint = null;
        this.moveHistory = [];
        this.capturedStones = { black: 0, white: 0 };
    }
}
