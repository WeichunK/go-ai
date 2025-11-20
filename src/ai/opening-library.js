// 圍棋開局庫
// 提供常見開局模式和定式

/**
 * 開局風格
 * - modern: 現代流派（星位為主）
 * - traditional: 傳統流派（小目為主）
 * - solid: 穩固流派（三三為主）
 */

// 19路棋盤的關鍵點位
export const KEY_POINTS = {
    // 星位 (4-4點) - 9個
    hoshi: [
        { x: 3, y: 3, name: '右上星' },
        { x: 9, y: 3, name: '上邊星' },
        { x: 15, y: 3, name: '左上星' },
        { x: 3, y: 9, name: '右邊星' },
        { x: 9, y: 9, name: '天元' },
        { x: 15, y: 9, name: '左邊星' },
        { x: 3, y: 15, name: '右下星' },
        { x: 9, y: 15, name: '下邊星' },
        { x: 15, y: 15, name: '左下星' }
    ],

    // 小目 (3-4點) - 8個（四個角）
    komoku: [
        { x: 2, y: 3, name: '右上小目' },
        { x: 3, y: 2, name: '右上小目變體' },
        { x: 16, y: 3, name: '左上小目' },
        { x: 15, y: 2, name: '左上小目變體' },
        { x: 2, y: 16, name: '右下小目' },
        { x: 3, y: 15, name: '右下小目變體' },
        { x: 16, y: 16, name: '左下小目' },
        { x: 15, y: 15, name: '左下小目變體' }
    ],

    // 三三 (3-3點) - 4個（四個角）
    sansan: [
        { x: 2, y: 2, name: '右上三三' },
        { x: 16, y: 2, name: '左上三三' },
        { x: 2, y: 16, name: '右下三三' },
        { x: 16, y: 16, name: '左下三三' }
    ]
};

// 四個角的星位（最常用的開局點）
const CORNER_HOSHI = [
    { x: 3, y: 3 },    // 右上
    { x: 15, y: 3 },   // 左上
    { x: 3, y: 15 },   // 右下
    { x: 15, y: 15 }   // 左下
];

// 四個角的小目
const CORNER_KOMOKU = [
    { x: 2, y: 3 },    // 右上
    { x: 16, y: 3 },   // 左上
    { x: 2, y: 16 },   // 右下
    { x: 16, y: 16 }   // 左下
];

// 四個角的三三
const CORNER_SANSAN = [
    { x: 2, y: 2 },    // 右上
    { x: 16, y: 2 },   // 左上
    { x: 2, y: 16 },   // 右下
    { x: 16, y: 16 }   // 左下
];

/**
 * 開局庫類
 */
export class OpeningLibrary {
    constructor(style = 'modern') {
        this.style = style;
        this.maxOpeningMoves = 8; // 使用開局庫的最大手數
    }

    /**
     * 設置開局風格
     */
    setStyle(style) {
        if (['modern', 'traditional', 'solid'].includes(style)) {
            this.style = style;
        }
    }

    /**
     * 獲取開局落子
     * @param {GoBoard} board - 棋盤狀態
     * @param {number} color - 顏色 (1=黑, -1=白)
     * @param {number} moveCount - 當前手數
     * @returns {object|null} - 開局落子 {x, y} 或 null
     */
    getOpeningMove(board, color, moveCount) {
        // 超過最大手數，不使用開局庫
        if (moveCount >= this.maxOpeningMoves) {
            return null;
        }

        // 根據風格選擇開局點
        let candidates = [];

        switch (this.style) {
            case 'modern':
                candidates = this.getModernOpening(board, moveCount);
                break;
            case 'traditional':
                candidates = this.getTraditionalOpening(board, moveCount);
                break;
            case 'solid':
                candidates = this.getSolidOpening(board, moveCount);
                break;
        }

        // 過濾掉已被佔據的位置
        const available = candidates.filter(pos =>
            board.get(pos.x, pos.y) === 0
        );

        if (available.length === 0) {
            return null;
        }

        // 隨機選擇一個（增加變化）
        return available[Math.floor(Math.random() * available.length)];
    }

    /**
     * 現代開局（星位流）
     */
    getModernOpening(board, moveCount) {
        // 前4手：優先佔據四個角的星位
        if (moveCount < 4) {
            return CORNER_HOSHI;
        }

        // 第5-8手：拆邊或掛角
        return this.getExtensionMoves(board);
    }

    /**
     * 傳統開局（小目流）
     */
    getTraditionalOpening(board, moveCount) {
        // 前4手：優先小目
        if (moveCount < 4) {
            return CORNER_KOMOKU;
        }

        return this.getExtensionMoves(board);
    }

    /**
     * 穩固開局（三三流）
     */
    getSolidOpening(board, moveCount) {
        // 前4手：三三佔角
        if (moveCount < 4) {
            return CORNER_SANSAN;
        }

        return this.getExtensionMoves(board);
    }

    /**
     * 獲取拆邊落子（第5手之後）
     */
    getExtensionMoves(board) {
        const extensions = [];

        // 上邊拆邊點
        extensions.push({ x: 9, y: 3 });
        extensions.push({ x: 6, y: 3 });
        extensions.push({ x: 12, y: 3 });

        // 下邊拆邊點
        extensions.push({ x: 9, y: 15 });
        extensions.push({ x: 6, y: 15 });
        extensions.push({ x: 12, y: 15 });

        // 左邊拆邊點
        extensions.push({ x: 15, y: 9 });
        extensions.push({ x: 15, y: 6 });
        extensions.push({ x: 15, y: 12 });

        // 右邊拆邊點
        extensions.push({ x: 3, y: 9 });
        extensions.push({ x: 3, y: 6 });
        extensions.push({ x: 3, y: 12 });

        return extensions;
    }

    /**
     * 判斷是否應該使用開局庫
     */
    shouldUseOpening(moveCount) {
        return moveCount < this.maxOpeningMoves;
    }

    /**
     * 獲取對角位置（用於"佔對角"策略）
     */
    getDiagonalCorner(x, y) {
        const size = 19;
        const mid = (size - 1) / 2;

        // 判斷在哪個角
        if (x < mid && y < mid) {
            // 右上 -> 左下
            return { x: 15, y: 15 };
        } else if (x > mid && y < mid) {
            // 左上 -> 右下
            return { x: 3, y: 15 };
        } else if (x < mid && y > mid) {
            // 右下 -> 左上
            return { x: 15, y: 3 };
        } else {
            // 左下 -> 右上
            return { x: 3, y: 3 };
        }
    }
}

// 默認導出現代風格開局庫
export default new OpeningLibrary('modern');
