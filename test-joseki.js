// 測試定式庫功能

import { GoBoard } from './src/board.js';
import { AIPlayer } from './src/ai/ai-player.js';
import { JosekiLibrary } from './src/ai/joseki-library.js';

console.log('=== 測試定式庫功能 ===\n');

async function testJosekiLibrary() {
    const josekiLib = new JosekiLibrary();
    const ai = new AIPlayer(-1); // 白棋

    // 測試 1: 三三侵入應對
    console.log('【測試 1】三三侵入應對');
    const board1 = new GoBoard(19);

    // 設置場景：右上角
    // 黑(3,3)星位
    // 白(2,2)三三侵入
    board1.makeMove(3, 3, 1); // 黑
    board1.makeMove(2, 2, -1); // 白

    console.log('場景：黑星位(3,3)，白侵入(2,2)');
    console.log('預期：黑棋應該擋在 (2,3) 或 (3,2)');

    const move1 = josekiLib.getJosekiMove(board1, 1); // 黑棋應對
    if (move1) {
        console.log(`✅ 匹配定式: ${move1.name}`);
        console.log(`   推薦落子: (${move1.x}, ${move1.y}) - ${move1.description}`);

        if ((move1.x === 2 && move1.y === 3) || (move1.x === 3 && move1.y === 2)) {
            console.log('   結果正確！');
        } else {
            console.log('   ⚠️ 結果位置不符合預期');
        }
    } else {
        console.log('❌ 未匹配到定式');
    }
    console.log('');

    // 測試 2: 三三侵入後續（爬與長）
    console.log('【測試 2】三三侵入後續（爬與長）');
    const board2 = new GoBoard(19);

    // 設置場景：
    board2.makeMove(3, 3, 1); // 黑星位
    board2.makeMove(2, 2, -1); // 白三三
    board2.makeMove(2, 3, 1); // 黑擋
    board2.makeMove(1, 2, -1); // 白爬

    console.log('場景：黑擋(2,3)，白爬(1,2)');
    console.log('預期：黑棋應該長在 (1,3)');

    const move2 = josekiLib.getJosekiMove(board2, 1); // 黑棋應對
    if (move2) {
        console.log(`✅ 匹配定式: ${move2.name}`);
        console.log(`   推薦落子: (${move2.x}, ${move2.y}) - ${move2.description}`);

        if (move2.x === 1 && move2.y === 3) {
            console.log('   結果正確！');
        } else {
            console.log('   ⚠️ 結果位置不符合預期');
        }
    } else {
        console.log('❌ 未匹配到定式');
    }
    console.log('');

    // 測試 3: 點三三（主動）
    console.log('【測試 3】主動點三三');
    const board3 = new GoBoard(19);
    board3.makeMove(3, 3, 1); // 黑星位

    console.log('場景：黑星位(3,3)，周圍空曠');
    console.log('預期：白棋可能點三三 (2,2)');

    // 由於點三三權重較低，可能不一定觸發，我們多試幾次或直接檢查匹配邏輯
    const move3 = josekiLib.getJosekiMove(board3, -1); // 白棋
    if (move3) {
        console.log(`✅ 匹配定式: ${move3.name}`);
        console.log(`   推薦落子: (${move3.x}, ${move3.y}) - ${move3.description}`);
    } else {
        console.log('ℹ️ 未觸發點三三（可能是權重原因或條件未滿足）');
    }

    console.log('\n=== 測試完成 ===');
}

testJosekiLibrary().catch(err => {
    console.error('測試錯誤:', err);
});
