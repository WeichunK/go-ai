// 測試加權隨機策略的效果

import { GoBoard } from './src/board.js';
import { MCTS } from './src/ai/mcts.js';

console.log('=== 測試 AI 加權隨機策略 ===\n');

// 測試 1: 檢查星位識別
console.log('【測試 1】星位識別');
const board1 = new GoBoard(19);
const mcts1 = new MCTS(board1, -1, 10); // 白棋，10次模擬

const root = new mcts1.constructor.prototype;
console.log('星位 (3,3):', mcts1.isStarPoint(3, 3, 19));  // true
console.log('星位 (9,9):', mcts1.isStarPoint(9, 9, 19));  // true (天元)
console.log('非星位 (5,5):', mcts1.isStarPoint(5, 5, 19)); // false
console.log('✅ 星位識別正常\n');

// 測試 2: 空棋盤上的第一手
console.log('【測試 2】空棋盤 AI 第一手傾向');
const board2 = new GoBoard(19);
const mcts2 = new MCTS(board2, 1, 100); // 黑棋，100次模擬

console.log('運行 100 次模擬，觀察 AI 第一手...');
mcts2.search().then(move => {
    console.log(`AI 選擇: (${move.x}, ${move.y})`);

    // 檢查是否為星位或附近
    const isNearStar = mcts2.isStarPoint(move.x, move.y, 19);
    console.log(`是否為星位: ${isNearStar}`);

    if (isNearStar) {
        console.log('✅ AI 正確選擇了星位（符合圍棋開局原則）\n');
    } else {
        const dist3_3 = Math.abs(move.x - 3) + Math.abs(move.y - 3);
        const dist15_15 = Math.abs(move.x - 15) + Math.abs(move.y - 15);
        const minDist = Math.min(dist3_3, dist15_15);
        console.log(`距離最近星位: ${minDist} 步`);
        console.log(`⚠️ AI 沒有選擇星位，但距離較近\n`);
    }

    // 測試 3: 連接性測試
    console.log('【測試 3】連接性評估');
    const board3 = new GoBoard(19);
    board3.makeMove(3, 3, 1); // 黑子在星位
    board3.makeMove(15, 15, -1); // 白子隨便下

    const mcts3 = new MCTS(board3, 1, 100);
    console.log('已有黑子在 (3,3)，AI 應傾向在附近落子...');

    return mcts3.search();
}).then(move2 => {
    console.log(`AI 第二手: (${move2.x}, ${move2.y})`);

    const dist = Math.abs(move2.x - 3) + Math.abs(move2.y - 3);
    console.log(`距離第一手: ${dist} 步`);

    if (dist <= 4) {
        console.log('✅ AI 傾向在附近落子（符合連接性原則）\n');
    } else {
        console.log('⚠️ AI 選擇了較遠的位置\n');
    }

    console.log('=== 測試完成 ===');
    console.log('\n建議：在瀏覽器中實際對弈測試 AI 強度！');
    console.log('預期：AI 會更多選擇星位、保持棋子連接、序盤佔據中心');
}).catch(err => {
    console.error('測試錯誤:', err);
});
