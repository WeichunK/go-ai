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

    // 模擬對局（加權隨機走子）
    simulate() {
        const simulationBoard = this.board.clone();
        let currentColor = this.color;
        let passCount = 0;
        let moveCount = 0;
        const maxMoves = Math.min(50, this.board.size * this.board.size / 2);

        while (passCount < 2 && moveCount < maxMoves) {
            // 快速獲取空位置
            const emptyPositions = [];
            for (let y = 0; y < simulationBoard.size; y++) {
                for (let x = 0; x < simulationBoard.size; x++) {
                    if (simulationBoard.get(x, y) === 0) {
                        emptyPositions.push({ x, y });
                    }
                }
            }

            if (emptyPositions.length === 0) {
                passCount++;
            } else {
                passCount = 0;
                // 使用加權隨機選擇（更智能）
                const move = this.selectWeightedMove(emptyPositions, simulationBoard, currentColor, moveCount);

                const result = simulationBoard.makeMove(move.x, move.y, currentColor);
                if (!result.success) {
                    passCount++;
                }
            }

            currentColor = -currentColor;
            moveCount++;
        }

        const score = simulationBoard.calculateScore();
        return score.winner;
    }

    // 加權隨機選擇落子
    selectWeightedMove(emptyPositions, board, color, moveCount) {
        // 計算每個位置的權重
        const weightedMoves = emptyPositions.map(pos => ({
            pos,
            weight: this.calculateMoveWeight(pos, board, color, moveCount)
        }));

        // 根據權重隨機選擇
        const totalWeight = weightedMoves.reduce((sum, m) => sum + m.weight, 0);
        let random = Math.random() * totalWeight;

        for (const move of weightedMoves) {
            random -= move.weight;
            if (random <= 0) {
                return move.pos;
            }
        }

        // 備用：返回第一個
        return weightedMoves[0].pos;
    }

    // 計算落子位置的權重
    calculateMoveWeight(pos, board, color, moveCount) {
        let weight = 1.0;

        // 1. 星位加權（重要戰略點）
        if (this.isStarPoint(pos.x, pos.y, board.size)) {
            weight *= 2.5;
        }

        // 2. 連接性：靠近己方棋子
        const nearbyAllies = this.countNearbyStones(pos, board, color, 2);
        if (nearbyAllies > 0) {
            weight *= (1 + nearbyAllies * 0.4);
        }

        // 3. 早期避免邊角過度擁擠
        if (moveCount < 15) {
            if (this.isEdgeOrCorner(pos, board.size)) {
                // 除非是星位或小目
                if (!this.isStarPoint(pos.x, pos.y, board.size)) {
                    weight *= 0.6;
                }
            }
        }

        // 4. 中心區域（序盤較重要）
        if (moveCount < 20) {
            const centerBonus = this.getCenterBonus(pos, board.size);
            weight *= (1 + centerBonus);
        }

        return weight;
    }

    // 判斷是否為星位
    isStarPoint(x, y, size) {
        const starPoints = {
            19: [[3, 3], [3, 9], [3, 15], [9, 3], [9, 9], [9, 15], [15, 3], [15, 9], [15, 15]],
            13: [[3, 3], [3, 9], [6, 6], [9, 3], [9, 9]],
            9: [[2, 2], [2, 6], [4, 4], [6, 2], [6, 6]]
        };

        const points = starPoints[size] || [];
        return points.some(([px, py]) => px === x && py === y);
    }

    // 計算附近己方棋子數
    countNearbyStones(pos, board, color, radius) {
        let count = 0;
        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = pos.x + dx;
                const ny = pos.y + dy;
                if (nx >= 0 && nx < board.size && ny >= 0 && ny < board.size) {
                    if (board.get(nx, ny) === color) {
                        count++;
                    }
                }
            }
        }
        return count;
    }

    // 判斷是否在邊角
    isEdgeOrCorner(pos, size) {
        return pos.x <= 2 || pos.x >= size - 3 || pos.y <= 2 || pos.y >= size - 3;
    }

    // 獲取中心獎勵
    getCenterBonus(pos, size) {
        const center = (size - 1) / 2;
        const distToCenter = Math.abs(pos.x - center) + Math.abs(pos.y - center);
        const maxDist = size - 1;
        return (maxDist - distToCenter) / maxDist * 0.3; // 最多 30% 獎勵
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
