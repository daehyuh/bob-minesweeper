import React, { useEffect, useState } from 'react';
import MinesweeperBoard from './MinesweeperBoard';
import type { CellData } from './Cell';

const createBoard = (rows: number, cols: number, mines: number): CellData[][] => {
  // 기존 App.tsx의 createBoard 함수 복사
  const board: CellData[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ state: 'hidden', content: 'empty' }))
  );
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].content === 'mine') continue;
    board[r][c].content = 'mine';
    placed++;
  }
  const dr = [-1, -1, -1, 0, 0, 1, 1, 1];
  const dc = [-1, 0, 1, -1, 1, -1, 0, 1];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c].content === 'mine') continue;
      let count = 0;
      for (let d = 0; d < 8; d++) {
        const nr = r + dr[d], nc = c + dc[d];
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].content === 'mine') count++;
      }
      board[r][c].content = count === 0 ? 'empty' : (count as CellData['content']);
    }
  }
  return board;
};

const RankGamePage: React.FC = () => {
  const [board, setBoard] = useState<CellData[][]>(() => createBoard(16, 30, 99));
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [elapsed, setElapsed] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [firstClick, setFirstClick] = useState(false);


  useEffect(() => {
    let interval: any;
    if (timerActive) {
      interval = setInterval(() => setElapsed(e => e + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);
  useEffect(() => {
    if (gameState === 'playing' && firstClick) setTimerActive(true);
    else setTimerActive(false);
    if (gameState !== 'playing') setFirstClick(false);
    if (gameState !== 'playing') setElapsed(0);
  }, [gameState, firstClick]);

  const handleCellClickWithTimer = (row: number, col: number) => {
    if (!firstClick && gameState === 'playing') setFirstClick(true);
    handleCellClick(row, col);
  };

  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    const cell = board[row][col];
    if (cell.state !== 'hidden') return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    openCell(newBoard, row, col);
    setBoard(newBoard);
    const allClear = newBoard.every(row => row.every(cell => cell.state === 'revealed' || cell.content === 'mine'));
    if (allClear) setGameState('won');
  };

  function openCell(board: CellData[][], row: number, col: number) {
    if (board[row][col].state !== 'hidden') return;
    if (board[row][col].content === 'mine') {
      board[row][col].state = 'revealed';
      setGameState('lost');
      return;
    }
    const queue = [[row, col]];
    while (queue.length) {
      const [r, c] = queue.shift()!;
      if (board[r][c].state === 'revealed') continue;
      board[r][c].state = 'revealed';
      if (board[r][c].content === 'empty') {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr, nc = c + dc;
            if (nr >= 0 && nr < 16 && nc >= 0 && nc < 30 && board[nr][nc].state === 'hidden') {
              if (!queue.some(([qr, qc]) => qr === nr && qc === nc)) queue.push([nr, nc]);
            }
          }
        }
      }
    }
  }



  return (
    <div style={{ width: '100vw', minHeight: '100vh', background: '#222', color: '#fff', padding: 0, margin: 0 }}>
      <header style={{ width: '100%', height: 64, background: 'linear-gradient(90deg,#23242a 0%,#3f2b96 100%)', display: 'flex', alignItems: 'center', paddingLeft: 32, fontSize: 24, fontWeight: 900, letterSpacing: 2 }}>랭크게임</header>
      <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', marginTop: 32 }}>
        <div>
          <MinesweeperBoard
            board={board}
            onCellClick={handleCellClickWithTimer}
            onCellRightClick={() => {}}
            pressedCells={new Set()}
            onCellMouseDown={() => {}}
            onCellMouseUp={() => {}}
            onCellMouseLeave={() => {}}
            cellSize={window.innerWidth < 600 ? 14 : 20}
          />
          <div style={{ marginTop: 16, fontSize: 18 }}>경과 시간: {elapsed}초</div>
          {gameState === 'won' && <div style={{ color: '#a8ff60', fontWeight: 700, marginTop: 8 }}>🎉 성공!</div>}
          {gameState === 'lost' && <div style={{ color: '#ff6e6e', fontWeight: 700, marginTop: 8 }}>💥 실패!</div>}
        </div>
      </div>
      <style>{`
        @media (max-width: 600px) {
          header[style*='font-size: 24px'] {
            font-size: 16px !important;
            height: 44px !important;
            padding-left: 10px !important;
          }
          div[style*='margin-top: 32px'] {
            margin-top: 10px !important;
          }
          div[style*='font-size: 18px'] {
            font-size: 13px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default RankGamePage; 