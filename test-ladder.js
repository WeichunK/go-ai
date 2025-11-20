// 測試徵子檢測功能

import { GoBoard } from './src/board.js';
import { Tactics } from './src/ai/tactics.js';

console.log('=== 測試徵子檢測功能 ===\n');

function testLadder() {
    // 測試 1: 簡單徵子成立
    console.log('【測試 1】簡單徵子成立');
    const board1 = new GoBoard(9);

    // 設置徵子場景
    // . . . . .
    // . O X . .
    // . X . . .
    // . . . . .

    board1.makeMove(2, 2, 1); // 黑
    board1.makeMove(2, 1, -1); // 白
    board1.makeMove(1, 2, -1); // 白
    board1.makeMove(3, 3, -1); // 白 (增加這子，形成扭羊頭)

    // 現在輪到白棋下，檢查黑棋(2,2)是否會被徵吃
    console.log('場景：黑棋(2,2)只有兩口氣，白棋包圍');
    const isLadder1 = Tactics.checkLadder(board1, 2, 2, -1);
    console.log(`徵子檢測結果: ${isLadder1 ? '✅ 成立 (會被吃)' : '❌ 不成立 (能逃脫)'}`);

    if (isLadder1) console.log('  -> 預期結果：成立');
    else console.log('  -> 預期結果：成立 (測試失敗)');
    console.log('');

    // 測試 2: 徵子不成立（有引徵）
    console.log('【測試 2】徵子不成立（有引徵）');
    const board2 = new GoBoard(9);

    // 設置同樣的徵子場景
    board2.makeMove(2, 2, 1); // 黑
    board2.makeMove(2, 1, -1); // 白
    board2.makeMove(1, 2, -1); // 白

    // 在徵子路徑上放一個黑子（引徵）
    board2.makeMove(6, 6, 1); // 黑引徵

    console.log('場景：同上，但在 (6,6) 有黑子引徵');
    const isLadder2 = Tactics.checkLadder(board2, 2, 2, -1);
    console.log(`徵子檢測結果: ${isLadder2 ? '❌ 成立 (會被吃)' : '✅ 不成立 (能逃脫)'}`);

    if (!isLadder2) console.log('  -> 預期結果：不成立');
    else console.log('  -> 預期結果：不成立 (測試失敗)');
    console.log('');

    // 測試 3: 邊界徵子
    console.log('【測試 3】邊界徵子');
    const board3 = new GoBoard(9);
    // . X . .
    // X O . .
    board3.makeMove(1, 1, -1); // 白
    board3.makeMove(1, 0, 1); // 黑
    board3.makeMove(0, 1, 1); // 黑

    console.log('場景：白棋(1,1)在角部被叫吃');
    const isLadder3 = Tactics.checkLadder(board3, 1, 1, 1); // 黑攻白
    console.log(`徵子檢測結果: ${isLadder3 ? '✅ 成立 (會被吃)' : '❌ 不成立 (能逃脫)'}`);
}

testLadder();
