// 定式庫管理器
// 負責識別棋盤上的定式並提供應對

import { Corner } from './corner-utils.js';
import { JOSEKI_PATTERNS } from './joseki-patterns.js';
import { Tactics } from './tactics.js';

export class JosekiLibrary {
    constructor() {
        // 按優先級降序排序模式，確保高優先級（更具體）的定式先被匹配
        this.patterns = JOSEKI_PATTERNS.sort((a, b) => b.priority - a.priority);
    }

    /**
     * 獲取定式應對
     * @param {GoBoard} board - 棋盤
     * @param {number} color - 我方顏色
     * @returns {object|null} 推薦落子 {x, y, description}
     */
    getJosekiMove(board, color) {
        // 檢查所有四個角落
        // 0:右上, 1:左上, 2:右下, 3:左下
        const corners = [0, 1, 2, 3];

        // 隨機打亂角落順序，避免總是從右上角開始
        this.shuffleArray(corners);

        for (const cornerIndex of corners) {
            const corner = new Corner(board, cornerIndex);

            // 嘗試匹配所有定式
            for (const pattern of this.patterns) {
                if (pattern.match(corner, color)) {
                    // 檢查額外條件（如徵子）
                    if (pattern.condition) {
                        if (!pattern.condition(board, corner, color, Tactics)) {
                            continue;
                        }
                    }

                    // 找到匹配定式，選擇應對
                    const response = this.selectResponse(board, corner, pattern.responses, color);
                    if (response) {
                        // 將相對坐標轉換為全局坐標
                        const globalPos = corner.toGlobal(response.x, response.y);

                        // 確保位置是空的且合法
                        if (board.isValidMove(globalPos.x, globalPos.y, color).valid) {
                            return {
                                x: globalPos.x,
                                y: globalPos.y,
                                name: pattern.name,
                                description: response.description
                            };
                        }
                    }
                }
            }
        }

        return null;
    }

    /**
     * 根據權重和方向判斷選擇應對
     */
    selectResponse(board, corner, responses, color) {
        if (!responses || responses.length === 0) return null;

        // 計算每個選項的動態分數
        const candidates = responses.map(r => {
            let score = r.weight;

            // 如果有方向屬性，進行方向評估
            if (r.direction) {
                const dirScore = this.calculateDirectionScore(board, corner, r.direction, color);
                score *= dirScore;
            }

            return { ...r, finalScore: score };
        });

        // 根據分數加權隨機選擇
        const totalScore = candidates.reduce((sum, r) => sum + r.finalScore, 0);
        if (totalScore === 0) return candidates[0];

        let random = Math.random() * totalScore;
        for (const candidate of candidates) {
            random -= candidate.finalScore;
            if (random <= 0) {
                return candidate;
            }
        }

        return candidates[0];
    }

    /**
     * 計算方向分數
     * @param {string} direction - 'side1' (x方向) 或 'side2' (y方向)
     */
    calculateDirectionScore(board, corner, direction, color) {
        // 獲取該方向邊線上的情況
        // 簡化：檢查邊線上最近的一顆子
        // 如果是己方子 -> 加分 (配合)
        // 如果是對方子 -> 減分 (撞牆)
        // 如果空曠 -> 中性

        let score = 1.0;
        const size = board.size;
        const scanDist = Math.floor(size / 2); // 掃描半個邊

        // 將方向轉換為全局掃描向量
        // corner.toGlobal(10, 0) - corner.toGlobal(0, 0) 可以得到 x 方向向量
        const origin = corner.toGlobal(0, 0);
        const vecX = corner.toGlobal(1, 0);
        const vecY = corner.toGlobal(0, 1);

        let dx = 0, dy = 0;

        // 注意：這裡的 direction 是相對於角落的
        // side1 通常指 x 軸方向 (在標準角落視圖中)
        // side2 通常指 y 軸方向
        if (direction === 'side1') {
            dx = vecX.x - origin.x;
            dy = vecX.y - origin.y;
        } else {
            dx = vecY.x - origin.x;
            dy = vecY.y - origin.y;
        }

        // 沿著邊線掃描
        // 起點通常是角部星位附近，例如 (3,0) 或 (0,3)
        // 這裡簡化：從角點沿著邊線掃描第三線和第四線

        let foundStone = null;

        for (let i = 4; i < scanDist; i++) {
            // 檢查第三線和第四線
            const checkX = origin.x + dx * i;
            const checkY = origin.y + dy * i;

            // 確保在棋盤內
            if (checkX < 0 || checkX >= size || checkY < 0 || checkY >= size) continue;

            // 這裡需要更精確的坐標計算，因為 dx/dy 只是方向
            // 實際上我們需要掃描邊。
            // 讓我們用更簡單的方法：直接用 Corner 的相對坐標
            // side1: 掃描 (i, 2) 和 (i, 3)
            // side2: 掃描 (2, i) 和 (3, i)
        }

        // 重新實現：使用相對坐標掃描
        for (let i = 5; i < 10; i++) { // 掃描距離角部 5-10 格的範圍
            let s3, s4;
            if (direction === 'side1') {
                s3 = corner.get(i, 2); // 第三線
                s4 = corner.get(i, 3); // 第四線
            } else {
                s3 = corner.get(2, i);
                s4 = corner.get(3, i);
            }

            if (s3 === color || s4 === color) {
                score += 0.5; // 有己方子，加分（拆邊配合）
                break; // 找到最近的即可
            } else if (s3 === -color || s4 === -color) {
                score -= 0.4; // 有對方子，減分（避免逼近厚勢）
                break;
            }
        }

        return Math.max(0.1, score);
    }

    /**
     * 隨機打亂數組
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
