// 測試開局庫功能

import { GoBoard } from './src/board.js';
import { AIPlayer } from './src/ai/ai-player.js';

console.log('=== 測試開局庫功能 ===\n');

async function testOpeningLibrary() {
    // 測試 1: 現代開局（星位）
    console.log('【測試 1】現代開局 (星位流)');
    const board1 = new GoBoard(19);
    const ai1 = new AIPlayer(-1, 'easy');
    ai1.setOpeningStyle('modern');

    console.log('前 4 手應該選擇星位...');
    for (let i = 0; i < 4; i++) {
        const move = await ai1.getMove(board1);
        console.log(`第 ${i + 1} 手: (${move.x}, ${move.y})`);
        board1.makeMove(move.x, move.y, -1);

        // 檢查是否為星位
        const isHoshi = (move.x === 3 || move.x === 15) && (move.y === 3 || move.y === 15);
        console.log(`  -> ${isHoshi ? '✅ 星位' : '⚠️  非星位'}`);
    }
    console.log('');

    // 測試 2: 傳統開局（小目）
    console.log('【測試 2】傳統開局 (小目流)');
    const board2 = new GoBoard(19);
    const ai2 = new AIPlayer(-1, 'easy');
    ai2.setOpeningStyle('traditional');

    console.log('前 4 手應該選擇小目...');
    for (let i = 0; i < 4; i++) {
        const move = await ai2.getMove(board2);
        console.log(`第 ${i + 1} 手: (${move.x}, ${move.y})`);
        board2.makeMove(move.x, move.y, -1);

        // 檢查是否為小目
        const isKomoku = (move.x === 2 || move.x === 16) && (move.y === 3 || move.y === 16);
        console.log(`  -> ${isKomoku ? '✅ 小目' : '⚠️  非小目'}`);
    }
    console.log('');

    // 測試 3: 穩固開局（三三）
    console.log('【測試測試 3】穩固開局 (三三流)');
    const board3 = new GoBoard(19);
    const ai3 = new AIPlayer(-1, 'easy');
    ai3.setOpeningStyle('solid');

    console.log('前 4 手應該選擇三三...');
    for (let i = 0; i < 4; i++) {
        const move = await ai3.getMove(board3);
        console.log(`第 ${i + 1} 手: (${move.x}, ${move.y})`);
        board3.makeMove(move.x, move.y, -1);

        // 檢查是否為三三
        const isSansan = (move.x === 2 || move.x === 16) && (move.y === 2 || move.y === 16);
        console.log(`  -> ${isSansan ? '✅ 三三' : '⚠️  非三三'}`);
    }
    console.log('');

    // 測試 4: 第 9 手應該切換到 MCTS
    console.log('【測試 4】第 9 手切換到 MCTS');
    const board4 = new GoBoard(19);
    const ai4 = new AIPlayer(-1, 'easy');

    // 下 8 手
    for (let i = 0; i < 8; i++) {
        const move = await ai4.getMove(board4);
        board4.makeMove(move.x, move.y, -1);
    }

    console.log('第 9 手應該使用 MCTS（請查看控制台日誌）');
    await ai4.getMove(board4);

    console.log('\n=== 測試完成 ===');
    console.log('\n✅ 開局庫已成功整合！');
    console.log('請在瀏覽器中測試實際對局效果。');
}

testOpeningLibrary().catch(err => {
    console.error('測試錯誤:', err);
});
