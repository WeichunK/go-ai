// 定式庫管理器
// 負責識別棋盤上的定式並提供應對

import { Corner } from './corner-utils.js';
import { JOSEKI_PATTERNS } from './joseki-patterns.js';

export class JosekiLibrary {
    constructor() {
        this.patterns = JOSEKI_PATTERNS;
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
                    // 找到匹配定式，選擇應對
                    const response = this.selectResponse(pattern.responses);
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
     * 根據權重選擇應對
     */
    selectResponse(responses) {
        if (!responses || responses.length === 0) return null;

        const totalWeight = responses.reduce((sum, r) => sum + r.weight, 0);
        let random = Math.random() * totalWeight;

        for (const response of responses) {
            random -= response.weight;
            if (random <= 0) {
                return response;
            }
        }

        return responses[0];
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
