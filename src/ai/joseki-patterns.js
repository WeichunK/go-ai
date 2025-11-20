// 定式模式數據
// 定義常見定式的觸發條件和應對

export const JOSEKI_PATTERNS = [
    // 1. 三三侵入標準應對 (3-3 Invasion)
    // 場景：我方有星位(3,3)，對方下了三三(2,2)
    {
        name: '三三侵入標準應對',
        priority: 100,
        // 檢測模式
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 星位有我方棋子 (3,3)
            // 三三有對方棋子 (2,2)
            // 且 (2,3) 和 (3,2) 是空的（還沒擋）
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(2, 2, oppColor) &&
                corner.isEmpty(2, 3) &&
                corner.isEmpty(3, 2);
        },
        // 推薦應對
        responses: [
            // 擋（長邊方向優先，這裡簡化為隨機或固定）
            { x: 2, y: 3, weight: 1.0, description: '擋' },
            { x: 3, y: 2, weight: 1.0, description: '擋（另一側）' }
        ]
    },

    // 2. 三三侵入後續：爬與長
    // 場景：我方擋了(2,3)，對方爬(1,2)，我方應該長(1,3)
    {
        name: '三三侵入-長',
        priority: 90,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 星位(3,3)我方
            // 三三(2,2)對方
            // 我方擋在(2,3)
            // 對方爬在(1,2)
            // (1,3)是空的
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(2, 2, oppColor) &&
                corner.hasStone(2, 3, myColor) &&
                corner.hasStone(1, 2, oppColor) &&
                corner.isEmpty(1, 3);
        },
        responses: [
            { x: 1, y: 3, weight: 1.0, description: '長' }
        ]
    },

    // 3. 三三侵入後續：對稱形
    {
        name: '三三侵入-長(對稱)',
        priority: 90,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(2, 2, oppColor) &&
                corner.hasStone(3, 2, myColor) &&
                corner.hasStone(2, 1, oppColor) &&
                corner.isEmpty(3, 1);
        },
        responses: [
            { x: 3, y: 1, weight: 1.0, description: '長' }
        ]
    },

    // 4. 小飛掛星位應對 (Knight's Move Approach to Star Point)
    // 場景：我方星位(3,3)，對方小飛掛(5,2)或(2,5)
    {
        name: '小飛掛星位-小飛應',
        priority: 80,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 星位(3,3)我方
            // 對方掛在(5,2)
            // (2,5)空
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(5, 2, oppColor) &&
                corner.isEmpty(2, 5) &&
                corner.isEmpty(1, 5); // 確保沒有被夾擊
        },
        responses: [
            { x: 1, y: 5, weight: 0.8, description: '小飛應' }, // 穩健
            { x: 2, y: 5, weight: 0.6, description: '一間跳' }  // 積極
        ]
    },

    // 5. 點三三 (主動進攻)
    // 場景：對方有星位(3,3)，周圍空曠，我方可以點三三
    {
        name: '點三三侵入',
        priority: 70,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 星位(3,3)對方
            // 三三(2,2)空
            // 周圍相對空曠
            return corner.hasStone(3, 3, oppColor) &&
                corner.isEmpty(2, 2) &&
                corner.isEmpty(2, 3) &&
                corner.isEmpty(3, 2) &&
                corner.isEmpty(2, 4) &&
                corner.isEmpty(4, 2);
        },
        responses: [
            { x: 2, y: 2, weight: 0.5, description: '點三三' } // 權重較低，避免總是點三三
        ]
    }
];
