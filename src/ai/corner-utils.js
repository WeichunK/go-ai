// 角落工具類
// 用於處理棋盤四個角落的坐標轉換和模式匹配

export class Corner {
    constructor(board, cornerIndex) {
        this.board = board;
        this.size = board.size;
        this.cornerIndex = cornerIndex; // 0:右上, 1:左上, 2:右下, 3:左下
    }

    /**
     * 將棋盤全局坐標轉換為角落相對坐標
     * 相對坐標 (x, y) 以角點為 (0, 0)，向內延伸
     * @param {number} gx - 全局 x
     * @param {number} gy - 全局 y
     * @returns {object} {x, y} 相對坐標
     */
    toLocal(gx, gy) {
        const s = this.size - 1;
        switch (this.cornerIndex) {
            case 0: // 右上 (x=s, y=0) -> (0,0)
                return { x: s - gx, y: gy };
            case 1: // 左上 (x=0, y=0) -> (0,0)
                return { x: gx, y: gy };
            case 2: // 右下 (x=s, y=s) -> (0,0)
                return { x: s - gx, y: s - gy };
            case 3: // 左下 (x=0, y=s) -> (0,0)
                return { x: gx, y: s - gy };
            default:
                return { x: gx, y: gy };
        }
    }

    /**
     * 將角落相對坐標轉換為棋盤全局坐標
     * @param {number} lx - 相對 x
     * @param {number} ly - 相對 y
     * @returns {object} {x, y} 全局坐標
     */
    toGlobal(lx, ly) {
        const s = this.size - 1;
        switch (this.cornerIndex) {
            case 0: // 右上
                return { x: s - lx, y: ly };
            case 1: // 左上
                return { x: lx, y: ly };
            case 2: // 右下
                return { x: s - lx, y: s - ly };
            case 3: // 左下
                return { x: lx, y: s - ly };
            default:
                return { x: lx, y: ly };
        }
    }

    /**
     * 獲取相對位置的棋子顏色
     * @param {number} lx - 相對 x
     * @param {number} ly - 相對 y
     * @returns {number} 棋子顏色 (1, -1, 0) 或 null (超出範圍)
     */
    get(lx, ly) {
        const global = this.toGlobal(lx, ly);
        if (global.x < 0 || global.x >= this.size || global.y < 0 || global.y >= this.size) {
            return null;
        }
        return this.board.get(global.x, global.y);
    }

    /**
     * 檢查相對位置是否有特定顏色的棋子
     * @param {number} lx - 相對 x
     * @param {number} ly - 相對 y
     * @param {number} color - 期望顏色
     * @returns {boolean}
     */
    hasStone(lx, ly, color) {
        return this.get(lx, ly) === color;
    }

    /**
     * 檢查相對位置是否為空
     */
    isEmpty(lx, ly) {
        return this.get(lx, ly) === 0;
    }
}
