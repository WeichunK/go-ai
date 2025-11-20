// 測試定式庫擴展功能：方向判斷

import { GoBoard } from './src/board.js';
import { JosekiLibrary } from './src/ai/joseki-library.js';

console.log('=== 測試定式庫擴展：方向判斷 ===\n');

function testDirection() {
    const josekiLib = new JosekiLibrary();

    // 測試 1: 邊上有己方子，應該擋在能發展的一側
    console.log('【測試 1】方向判斷：配合己方拆邊');
    const board1 = new GoBoard(19);

    // 右上角星位
    board1.makeMove(15, 3, 1); // 黑星位
    board1.makeMove(16, 2, -1); // 白三三侵入

    // 在右邊星位下方有黑子 (15, 9) -> 應該擋在 (15, 2) 往右邊發展
    // 注意：Corner 0 (右上) 的 side1 是 x 軸 (左邊)，side2 是 y 軸 (下邊)
    // 這裡我們希望擋在 (16, 3) 還是 (15, 2)？
    // 如果擋 (15, 2)，白爬 (16, 3)，黑長 (15, 3) -> 牆朝左
    // 如果擋 (16, 3)，白爬 (15, 2)，黑長 (16, 2) -> 牆朝下

    // 讓我們在下邊放一個黑子 (15, 9)
    board1.makeMove(15, 9, 1);

    console.log('場景：右上角黑星位，白點三三。下邊(15,9)有黑子配合。');
    console.log('預期：黑棋應該擋在 (16, 3)，讓牆朝下發展');

    // 這裡需要確認 Corner 0 的坐標轉換
    // Corner 0: (18,0) -> (0,0)
    // 黑星位 (15,3) -> local (3,3)
    // 白三三 (16,2) -> local (2,2)
    // 下邊黑子 (15,9) -> local (3,9) -> side2 方向

    const move1 = josekiLib.getJosekiMove(board1, 1);
    if (move1) {
        console.log(`推薦落子: (${move1.x}, ${move1.y}) - ${move1.description}`);
        // 擋 (16,3) 是 local (2,3) -> side2
        if (move1.x === 16 && move1.y === 3) {
            console.log('✅ 結果正確！擋在有配合的一側');
        } else {
            console.log('⚠️ 結果可能未優化');
        }
    }
    console.log('');

    // 測試 2: 邊上有對方子，應該避開
    console.log('【測試 2】方向判斷：避開對方厚勢');
    const board2 = new GoBoard(19);

    // 右上角
    board2.makeMove(15, 3, 1); // 黑
    board2.makeMove(16, 2, -1); // 白

    // 左邊有白棋厚勢
    board2.makeMove(9, 3, -1);

    console.log('場景：左邊有白子。');
    console.log('預期：黑棋應該擋在 (15, 2)，讓牆朝下，避開左邊白子');

    const move2 = josekiLib.getJosekiMove(board2, 1);
    if (move2) {
        console.log(`推薦落子: (${move2.x}, ${move2.y}) - ${move2.description}`);
        if (move2.x === 15 && move2.y === 2) {
            console.log('✅ 結果正確！避開對方');
        } else {
            console.log('⚠️ 結果可能未優化');
        }
    }
}

testDirection();
