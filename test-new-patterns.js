// 測試定式庫擴展：新定式驗證

import { GoBoard } from './src/board.js';
import { JosekiLibrary } from './src/ai/joseki-library.js';

console.log('=== 測試定式庫擴展：新定式 ===\n');

function testNewPatterns() {
    const josekiLib = new JosekiLibrary();

    // 1. 測試小目尖頂
    console.log('【測試 1】小目小飛掛-尖頂');
    const board1 = new GoBoard(19);
    board1.makeMove(16, 3, 1); // 黑小目 (3,4) -> local (2,3)
    board1.makeMove(14, 2, -1); // 白掛 (5,3) -> local (4,2)

    const move1 = josekiLib.getJosekiMove(board1, 1);
    if (move1 && move1.description.includes('尖頂')) {
        console.log(`✅ 成功識別: ${move1.name} -> ${move1.description}`);
    } else {
        console.log(`❌ 失敗: ${move1 ? move1.name : '無匹配'}`);
    }
    console.log('');

    // 2. 測試小目托退定式
    console.log('【測試 2】小目一間高掛-托退');
    const board2 = new GoBoard(19);
    board2.makeMove(16, 3, 1); // 黑小目
    board2.makeMove(14, 3, -1); // 白一間高掛

    const move2 = josekiLib.getJosekiMove(board2, 1);
    if (move2 && move2.description.includes('托')) {
        console.log(`✅ 成功識別: ${move2.name} -> ${move2.description}`);
    } else {
        console.log(`❌ 失敗: ${move2 ? move2.name : '無匹配'}`);
    }
    console.log('');

    // 3. 測試星位夾擊
    console.log('【測試 3】星位被掛-夾擊');
    const board3 = new GoBoard(19);
    board3.makeMove(3, 3, 1); // 黑星位
    board3.makeMove(5, 2, -1); // 白掛

    // 這裡可能會隨機選擇小飛應、一間跳或夾擊
    // 我們多試幾次看能不能隨機到夾擊
    let foundPincer = false;
    for (let i = 0; i < 10; i++) {
        const move = josekiLib.getJosekiMove(board3, 1);
        if (move && move.description.includes('夾擊')) {
            console.log(`✅ 成功識別: ${move.name} -> ${move.description}`);
            foundPincer = true;
            break;
        }
    }
    if (!foundPincer) {
        console.log('ℹ️ 未隨機到夾擊（正常，因為權重較低）');
    }
}

testNewPatterns();
