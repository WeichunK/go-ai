// Monte Carlo Tree Search (MCTS) 算法實現
// 用於圍棋 AI 決策

import { GoBoard } from '../board.js';

class MCTSNode {
    constructor(board, color, move = null, parent = null) {
        this.board = board; // 棋盤狀態
        this.color = color; // 當前要下的顏色
        this.move = move; // 導致這個狀態的落子 {x, y}
        this.parent = parent;
        this.children = [];
        this.wins = 0;
        this.visits = 0;
        this.untriedMoves = board.getValidMoves(color);
    }

    // UCT (Upper Confidence Bound for Trees) 公式
    // 平衡探索和利用
    getUCTValue(explorationParam = 1.41) {
        if (this.visits === 0) return Infinity;

        const exploitation = this.wins / this.visits;
        const exploration = explorationParam * Math.sqrt(Math.log(this.parent.visits) / this.visits);

        return exploitation + exploration;
    }

    // 選擇最佳子節點（基於 UCT）
    selectChild() {
        return this.children.reduce((best, child) => {
            return child.getUCTValue() > best.getUCTValue() ? child : best;
        });
    }

    // 擴展節點：添加一個新的子節點
    expand() {
        if (this.untriedMoves.length === 0) return null;

        // 隨機選擇一個未嘗試的落子
        const moveIndex = Math.floor(Math.random() * this.untriedMoves.length);
        const move = this.untriedMoves.splice(moveIndex, 1)[0];

        // 創建新的棋盤狀態
        const newBoard = this.board.clone();
        newBoard.makeMove(move.x, move.y, this.color);

        // 創建子節點
        const childNode = new MCTSNode(
            newBoard,
            -this.color, // 換對手
            move,
            this
        );

        this.children.push(childNode);
        return childNode;
    }

    // 模擬對局（隨機走子直到結束）
    simulate() {
        const simulationBoard = this.board.clone();
        let currentColor = this.color;
        let passCount = 0;
        let moveCount = 0;
        const maxMoves = this.board.size * this.board.size * 2; // 防止無限循環

        while (passCount < 2 && moveCount < maxMoves) {
            const validMoves = simulationBoard.getValidMoves(currentColor);

            if (validMoves.length === 0) {
                passCount++;
            } else {
                passCount = 0;
                // 隨機選擇一個合法落子
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                simulationBoard.makeMove(move.x, move.y, currentColor);
            }

            currentColor = -currentColor;
            moveCount++;
        }

        // 計算最終分數
        const score = simulationBoard.calculateScore();
        return score.winner;
    }

    // 回傳結果到祖先節點
    backpropagate(result, aiColor) {
        this.visits++;

        // 更新勝場數
        if (result === 'black' && aiColor === 1) {
            this.wins++;
        } else if (result === 'white' && aiColor === -1) {
            this.wins++;
        }

        if (this.parent) {
            this.parent.backpropagate(result, aiColor);
        }
    }

    // 是否完全擴展
    isFullyExpanded() {
        return this.untriedMoves.length === 0;
    }

    // 是否為葉子節點
    isLeaf() {
        return this.children.length === 0;
    }
}

export class MCTS {
    constructor(board, aiColor, simulations = 1000) {
        this.board = board;
        this.aiColor = aiColor;
        this.simulations = simulations;
    }

    // 執行 MCTS 搜索，返回最佳落子
    async search() {
        console.log(`[MCTS] 開始搜索，總模擬次數: ${this.simulations}`);
        const startTime = Date.now();
        const root = new MCTSNode(this.board, this.aiColor);
        const batchSize = 100; // 每批次執行的模擬次數
        const batches = Math.ceil(this.simulations / batchSize);
        console.log(`[MCTS] 初始合法落子數: ${root.untriedMoves.length}`);

        for (let batch = 0; batch < batches; batch++) {
            const currentBatchSize = Math.min(batchSize, this.simulations - batch * batchSize);

            for (let i = 0; i < currentBatchSize; i++) {
                let node = root;

                // 1. Selection: 選擇最有前景的節點
                while (!node.isLeaf() && node.isFullyExpanded()) {
                    node = node.selectChild();
                }

                // 2. Expansion: 擴展一個新節點
                if (!node.isFullyExpanded()) {
                    const expandedNode = node.expand();
                    if (expandedNode) {
                        node = expandedNode;
                    }
                }

                // 3. Simulation: 模擬對局
                const result = node.simulate();

                // 4. Backpropagation: 回傳結果
                node.backpropagate(result, this.aiColor);
            }

            // 每批次後給 UI 一個更新機會
            if (batch < batches - 1) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        }

        // 選擇訪問次數最多的子節點（最可靠的選擇）
        if (root.children.length === 0) {
            console.log('[MCTS] 沒有合法落子');
            return null;
        }

        const bestChild = root.children.reduce((best, child) => {
            return child.visits > best.visits ? child : best;
        });

        const elapsed = Date.now() - startTime;
        console.log(`[MCTS] 搜索完成，耗時: ${elapsed}ms，最佳落子: (${bestChild.move.x}, ${bestChild.move.y})`);
        return bestChild.move;
    }

    // 設置模擬次數（用於調整難度）
    setSimulations(count) {
        this.simulations = count;
    }
}
```
