// 戰術分析工具
// 提供徵子檢測等戰術判斷

export class Tactics {
    /**
     * 檢查指定位置的棋子是否會被徵吃 (Ladder)
     * @param {GoBoard} board - 當前棋盤狀態
     * @param {number} targetX - 目標棋子 X
     * @param {number} targetY - 目標棋子 Y
     * @param {number} attackerColor - 攻擊方顏色
     * @returns {boolean} true 表示會被徵吃（徵子成立），false 表示能逃脫
     */
    static checkLadder(board, targetX, targetY, attackerColor) {
        // 1. 獲取目標棋子組
        const targetColor = -attackerColor;
        if (board.get(targetX, targetY) !== targetColor) {
            return false; // 目標位置不是對方的子
        }

        // 為了不影響原棋盤，使用克隆進行模擬
        // 注意：徵子搜索可能很深，但分支因子很小（通常只有 1-2 種逃跑/叫吃方式）
        const simBoard = board.clone();

        return this.simulateLadder(simBoard, targetX, targetY, attackerColor, 0);
    }

    /**
     * 遞歸模擬徵子過程
     * @param {GoBoard} board - 模擬棋盤
     * @param {number} tx - 目標組任意一子 X
     * @param {number} ty - 目標組任意一子 Y
     * @param {number} attackerColor - 攻擊方顏色
     * @param {number} depth - 搜索深度（防止無限循環）
     */
    static simulateLadder(board, tx, ty, attackerColor, depth) {
        if (depth > 60) return false; // 超過 60 手視為逃脫（或無法判斷）

        const targetGroup = board.getGroup(tx, ty);
        const liberties = board.getLiberties(targetGroup);

        // 1. 如果氣數 >= 2，檢查是否已經逃脫
        if (liberties.length >= 2) {
            // 獲取所有能叫吃的點
            const atariMoves = this.findAllAtariMoves(board, liberties, attackerColor);

            if (atariMoves.length === 0) {
                return false; // 無法叫吃，徵子失敗
            }

            // 嘗試每一個叫吃點，只要有一個能吃掉就算成功
            for (const move of atariMoves) {
                const nextBoard = board.clone();
                nextBoard.makeMove(move.x, move.y, attackerColor);

                // 檢查叫吃後，目標是否被提（氣=0）
                if (nextBoard.get(tx, ty) === 0) {
                    return true; // 成功提子
                }

                // 遞歸檢查
                if (this.simulateLadder(nextBoard, tx, ty, attackerColor, depth + 1)) {
                    return true; // 這條路徑能吃掉
                }
            }

            return false; // 所有叫吃路徑都失敗
        }

        // 2. 如果氣數 = 1，防守方必須逃跑（長氣）
        if (liberties.length === 1) {
            const escapeMove = liberties[0];

            // 防守方嘗試逃跑
            const result = board.makeMove(escapeMove.x, escapeMove.y, -attackerColor);

            if (!result.success) {
                return true; // 無法落子，被吃
            }

            // 逃跑後，檢查氣數
            const newGroup = board.getGroup(escapeMove.x, escapeMove.y);
            const newLiberties = board.getLiberties(newGroup);

            // 如果逃跑後氣數 >= 3，通常視為逃脫成功
            if (newLiberties.length >= 3) {
                return false;
            }

            // 繼續追殺
            return this.simulateLadder(board, escapeMove.x, escapeMove.y, attackerColor, depth + 1);
        }

        // 3. 氣數 = 0，已被吃
        return true;
    }

    /**
     * 尋找所有能將氣數減為 1 的叫吃點
     */
    static findAllAtariMoves(board, liberties, attackerColor) {
        const moves = [];
        const targetColor = -attackerColor;

        for (const lib of liberties) {
            // 模擬落子
            const testBoard = board.clone();
            testBoard.makeMove(lib.x, lib.y, attackerColor);

            const neighbors = testBoard.getNeighbors(lib.x, lib.y);

            for (const n of neighbors) {
                if (testBoard.get(n.x, n.y) === targetColor) {
                    const group = testBoard.getGroup(n.x, n.y);
                    if (testBoard.countLiberties(group) === 1) {
                        moves.push(lib);
                        break; // 這個點有效，不用再檢查其他鄰居
                    }
                }
            }
        }
        return moves;
    }
}
