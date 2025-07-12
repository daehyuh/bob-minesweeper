import React from 'react';
import Cell from './Cell';
import type { CellData } from './Cell';

interface MinesweeperBoardProps {
  board: CellData[][];
  onCellClick: (row: number, col: number) => void;
  onCellRightClick: (row: number, col: number, e: React.MouseEvent) => void;
  pressedCells: Set<string>;
  onCellMouseDown: (row: number, col: number) => void;
  onCellMouseUp: () => void;
  onCellMouseLeave: () => void;
  cellSize: number;
}

const MinesweeperBoard: React.FC<MinesweeperBoardProps> = ({ board, onCellClick, onCellRightClick, pressedCells, onCellMouseDown, onCellMouseUp, onCellMouseLeave, cellSize }) => (
  <div style={{ display: 'inline-block', border: '2px solid #888', background: '#808080' }}>
    {board.map((row, rIdx) => (
      <div key={rIdx} style={{ display: 'flex' }}>
        {row.map((cell, cIdx) => (
          <Cell
            key={cIdx}
            data={cell}
            onClick={() => onCellClick(rIdx, cIdx)}
            onRightClick={e => onCellRightClick(rIdx, cIdx, e)}
            pressed={pressedCells.has(`${rIdx},${cIdx}`)}
            onMouseDown={() => onCellMouseDown(rIdx, cIdx)}
            onMouseUp={onCellMouseUp}
            onMouseLeave={onCellMouseLeave}
            size={cellSize}
          />
        ))}
      </div>
    ))}
  </div>
);

export default MinesweeperBoard; 