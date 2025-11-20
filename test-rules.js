// 正確的提子測試

import { GoBoard } from './src/board.js';

console.log('=== 圍棋規則驗證測試 ===\n');

// 測試 1: 提單個子
console.log('【測試 1】提單個子');
const board1 = new GoBoard(19);

// 創建提子場景：
//   0 1 2
// 0 . ⚫ .
// 1 ⚫ ⚪ ⚫  <- (1,1) 的白子會被提掉
//  2 . ⚫ .
board1.makeMove(1, 0, 1); // 黑 上
board1.makeMove(1, 1, -1); // 白 中間 <- 會被提
board1.makeMove(0, 1, 1); // 黑 左
board1.makeMove(9, 9, -1); // 白 隨便
board1.makeMove(2, 1, 1); // 黑 右
board1.makeMove(9, 8, -1); // 白 隨便

console.log('提子前 (1,1):', board1.get(1, 1)); // -1 (白)

// 黑子下方包圍，提掉白子
const result1 = board1.makeMove(1, 2, 1); // 黑 下
console.log('提子結果:', result1);
console.log('提子後 (1,1):', board1.get(1, 1)); // 0 (空)

if (result1.captured === 1 && board1.get(1, 1) === 0) {
    console.log('✅ 測試通過：單子被正確提掉\n');
} else {
    console.log('❌ 測試失敗\n');
}

// 測試 2: 被提位置可重新下棋
console.log('【測試 2】被提位置可重新下棋');
const canPlace = board1.isValidMove(1, 1, -1);
console.log('被提位置是否可下:', canPlace);

if (canPlace.valid) {
    const result2 = board1.makeMove(1, 1, -1);
    console.log('重新下棋結果:', result2);
    console.log('✅ 測試通過：被提位置可以重新下棋\n');
} else {
    console.log('❌ 測試失敗\n');
}

// 測試 3: 打劫規則
console.log('【測試 3】打劫規則');
const board3 = new GoBoard(19);

// 簡化的劫形：
//   0 1 2 3
// 0 . ⚫ ⚪ .
// 1 ⚫ ⚪ X ⚪  <- X 提掉會形成劫
// 2 . ⚫ ⚪ .
board3.makeMove(1, 0, 1);
board3.makeMove(2, 0, -1);
board3.makeMove(0, 1, 1);
board3.makeMove(1, 1, -1);
board3.makeMove(2, 1, -1);
board3.makeMove(3, 1, -1);
board3.makeMove(1, 2, 1);
board3.makeMove(2, 2, -1);

// 黑子提白子
const koMove = board3.makeMove(2, 1, 1);
console.log('提劫結果:', koMove);

// 嘗試立即提回
if (koMove.koPoint) {
    const koTest = board3.isValidMove(koMove.koPoint.x, koMove.koPoint.y, -1);
    console.log('立即提回是否合法:', koTest);

    if (!koTest.valid && koTest.reason.includes('打劫')) {
        console.log('✅ 測試通過：打劫規則正確\n');
    } else {
        console.log('❌ 測試失敗\n');
    }
}

// 測試 4: 自殺手
console.log('【測試 4】自殺手檢測');
const board4 = new GoBoard(19);

//   0 1 2
// 0 ⚪ ⚪ ⚪
// 1 ⚪ X ⚪  <- X 下黑子是自殺
// 2 ⚪ ⚪ ⚪
for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
        if (i !== 1 || j !== 1) {
            board4.makeMove(i, j, -1);
        }
    }
}

const suicideTest = board4.isValidMove(1, 1, 1);
console.log('自殺手是否合法:', suicideTest);

if (!suicideTest.valid && suicideTest.reason.includes('自殺')) {
    console.log('✅ 測試通過：自殺手被正確禁止\n');
} else {
    console.log('❌ 測試失敗\n');
}

console.log('=== 所有圍棋規則測試完成 ===');
