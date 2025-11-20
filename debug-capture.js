// 詳細調試提子邏輯

import { GoBoard } from './src/board.js';

const board = new GoBoard(19);

// 創建簡單提子場景
// ⚫ ⚪ .     
// ⚫ ⚪ ⚪    
// . ⚫ .     
console.log('=== 設置棋盤 ===');
board.makeMove(0, 0, 1); // 黑 (0,0)
console.log('(0,0) 黑:', board.get(0, 0));

board.makeMove(1, 0, -1); // 白 (1,0)
console.log('(1,0) 白:', board.get(1, 0));

board.makeMove(0, 1, 1); // 黑 (0,1)
console.log('(0,1) 黑:', board.get(0, 1));

board.makeMove(1, 1, -1); // 白 (1,1) - 目標被提子
console.log('(1,1) 白:', board.get(1, 1));

board.makeMove(1, 2, 1); // 黑 (1,2)
console.log('(1,2) 黑:', board.get(1, 2));

board.makeMove(9, 9, -1); // 白隨便下
console.log('\n=== 檢查 (1,1) 白子的氣 ===');
const whiteGroup = board.getGroup(1, 1);
console.log('白子組:', whiteGroup);
const liberties = board.countLiberties(whiteGroup);
console.log('氣數:', liberties);
console.log('鄰居:', board.getNeighbors(1, 1));

console.log('\n=== 黑子在 (2,1) 落子，應該提掉 (1,1) 白子 ===');
const result = board.makeMove(2, 1, 1);
console.log('結果:', result);
console.log('(1,1) 位置:', board.get(1, 1), '(應該是 0)');
console.log('(2,1) 位置:', board.get(2, 1), '(應該是 1)');
