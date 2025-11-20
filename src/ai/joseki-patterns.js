// 定式模式數據
// 定義常見定式的觸發條件和應對

export const JOSEKI_PATTERNS = [
    // 1. 三三侵入標準應對 (3-3 Invasion)
    {
        name: '三三侵入標準應對',
        priority: 100,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(2, 2, oppColor) &&
                corner.isEmpty(2, 3) &&
                corner.isEmpty(3, 2);
        },
        responses: [
            // 擋的方向取決於邊上形勢
            // side1: 擋 (2,3) -> 發展 y 軸方向 (side2)
            // side2: 擋 (3,2) -> 發展 x 軸方向 (side1)
            // 注意：擋在 (2,3) 是為了讓白棋往 x 軸爬，黑棋往 y 軸長，所以是發展 y 軸 (side2)
            { x: 2, y: 3, weight: 1.0, description: '擋', direction: 'side2' },
            { x: 3, y: 2, weight: 1.0, description: '擋（另一側）', direction: 'side1' }
        ]
    },

    // 2. 三三侵入後續：爬與長
    {
        name: '三三侵入-長',
        priority: 90,
        match: (corner, myColor) => {
            const oppColor = -myColor;
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
    {
        name: '小飛掛星位-應對',
        priority: 80,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(5, 2, oppColor) &&
                corner.isEmpty(2, 5) &&
                corner.isEmpty(1, 5);
        },
        responses: [
            { x: 1, y: 5, weight: 0.8, description: '小飛應', direction: 'side2' },
            { x: 2, y: 5, weight: 0.6, description: '一間跳', direction: 'side2' },
            { x: 2, y: 7, weight: 0.4, description: '夾擊 (二間高夾)', direction: 'side2' }
        ]
    },

    // 5. 小飛掛星位-應對 (對稱)
    {
        name: '小飛掛星位-應對(對稱)',
        priority: 80,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(2, 5, oppColor) &&
                corner.isEmpty(5, 2) &&
                corner.isEmpty(5, 1);
        },
        responses: [
            { x: 5, y: 1, weight: 0.8, description: '小飛應', direction: 'side1' },
            { x: 5, y: 2, weight: 0.6, description: '一間跳', direction: 'side1' },
            { x: 7, y: 2, weight: 0.4, description: '夾擊 (二間高夾)', direction: 'side1' }
        ]
    },

    // 6. 點三三 (主動進攻)
    {
        name: '點三三侵入',
        priority: 70,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(3, 3, oppColor) &&
                corner.isEmpty(2, 2) &&
                corner.isEmpty(2, 3) &&
                corner.isEmpty(3, 2) &&
                corner.isEmpty(2, 4) &&
                corner.isEmpty(4, 2);
        },
        responses: [
            { x: 2, y: 2, weight: 0.5, description: '點三三' }
        ]
    },

    // 7. 小目小飛掛 - 小飛應
    {
        name: '小目小飛掛-小飛應',
        priority: 80,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(2,3)小目，白(4,2)掛
            return corner.hasStone(2, 3, myColor) &&
                corner.hasStone(4, 2, oppColor) &&
                corner.isEmpty(2, 1);
        },
        responses: [
            { x: 2, y: 1, weight: 1.0, description: '小飛應' }
        ]
    },

    // 8. 小目小飛掛 - 一間跳 (對稱)
    {
        name: '小目小飛掛-一間跳',
        priority: 80,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(3,2)小目，白(2,4)掛
            return corner.hasStone(3, 2, myColor) &&
                corner.hasStone(2, 4, oppColor) &&
                corner.isEmpty(1, 2);
        },
        responses: [
            { x: 1, y: 2, weight: 1.0, description: '小飛應' }
        ]
    },

    // 9. 雙飛燕 (Double Approach)
    {
        name: '雙飛燕-壓長',
        priority: 95,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(3,3)星位，白(5,2)和(2,5)掛
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(5, 2, oppColor) &&
                corner.hasStone(2, 5, oppColor);
        },
        condition: (board, corner, color, Tactics) => {
            // 徵子檢測：如果壓長後斷，徵子是否有利？
            // 這裡簡化：總是允許
            return true;
        },
        responses: [
            // 壓長找對方的弱點
            { x: 5, y: 3, weight: 1.0, description: '壓' },
            { x: 3, y: 5, weight: 1.0, description: '壓' }
        ]
    },

    // === 小目定式 (3-4 Point Josekis) ===

    // 10. 小目小飛掛 - 尖頂 (Kosumi)
    {
        name: '小目小飛掛-尖頂',
        priority: 85,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(2,3)小目，白(4,2)掛
            return corner.hasStone(2, 3, myColor) &&
                corner.hasStone(4, 2, oppColor) &&
                corner.isEmpty(2, 2) &&
                corner.isEmpty(3, 2);
        },
        responses: [
            { x: 2, y: 2, weight: 0.8, description: '尖頂' } // 堅實，AI 喜歡
        ]
    },

    // 11. 小目小飛掛 - 尖頂 (對稱)
    {
        name: '小目小飛掛-尖頂(對稱)',
        priority: 85,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(3,2)小目，白(2,4)掛
            return corner.hasStone(3, 2, myColor) &&
                corner.hasStone(2, 4, oppColor) &&
                corner.isEmpty(2, 2) &&
                corner.isEmpty(2, 3);
        },
        responses: [
            { x: 2, y: 2, weight: 0.8, description: '尖頂' }
        ]
    },

    // 12. 小目一間高掛 - 托退定式 (Attach-Pullback)
    {
        name: '小目一間高掛-托退',
        priority: 90,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(2,3)小目，白(4,3)一間高掛
            return corner.hasStone(2, 3, myColor) &&
                corner.hasStone(4, 3, oppColor) &&
                corner.isEmpty(3, 3);
        },
        responses: [
            { x: 3, y: 3, weight: 1.0, description: '托' }
        ]
    },

    // 13. 小目一間高掛 - 托退後續 (白長)
    {
        name: '小目一間高掛-托退-白長',
        priority: 95,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(2,3), 白(4,3), 黑(3,3)托
            return corner.hasStone(2, 3, myColor) &&
                corner.hasStone(4, 3, oppColor) &&
                corner.hasStone(3, 3, myColor) &&
                corner.isEmpty(3, 2);
        },
        responses: [
            { x: 3, y: 2, weight: 1.0, description: '長 (白棋應對)' }
        ]
    },

    // 14. 小目一間高掛 - 托退後續 (黑退)
    {
        name: '小目一間高掛-托退-黑退',
        priority: 95,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(2,3), 白(4,3), 黑(3,3), 白(3,2)
            return corner.hasStone(2, 3, myColor) &&
                corner.hasStone(4, 3, oppColor) &&
                corner.hasStone(3, 3, myColor) &&
                corner.hasStone(3, 2, oppColor) &&
                corner.isEmpty(2, 2);
        },
        responses: [
            { x: 2, y: 2, weight: 1.0, description: '退' }
        ]
    },

    // 15. 小目一間高掛 - 托退後續 (白粘)
    {
        name: '小目一間高掛-托退-白粘',
        priority: 95,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(2, 3, myColor) &&
                corner.hasStone(4, 3, oppColor) &&
                corner.hasStone(3, 3, myColor) &&
                corner.hasStone(3, 2, oppColor) &&
                corner.hasStone(2, 2, myColor) &&
                corner.isEmpty(4, 2);
        },
        responses: [
            { x: 4, y: 2, weight: 1.0, description: '粘' } // 或虎
        ]
    },

    // === 星位夾擊 (Star Point Pincers) ===

    // 16. 星位被掛 - 一間夾擊
    {
        name: '星位被掛-一間夾擊',
        priority: 75,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            // 黑(3,3), 白(5,2)
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(5, 2, oppColor) &&
                corner.isEmpty(5, 4) &&
                corner.isEmpty(5, 5);
        },
        responses: [
            { x: 5, y: 4, weight: 0.5, description: '一間夾擊', direction: 'side2' }
        ]
    },

    // 17. 星位被掛 - 二間高夾
    {
        name: '星位被掛-二間高夾',
        priority: 75,
        match: (corner, myColor) => {
            const oppColor = -myColor;
            return corner.hasStone(3, 3, myColor) &&
                corner.hasStone(5, 2, oppColor) &&
                corner.isEmpty(5, 5);
        },
        responses: [
            { x: 5, y: 5, weight: 0.5, description: '二間高夾', direction: 'side2' }
        ]
    }
];
