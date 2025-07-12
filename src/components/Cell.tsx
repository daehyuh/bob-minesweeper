import React from 'react';

import defaultImg from '../assets/default.png';
import emptyImg from '../assets/empty.png';
import flagImg from '../assets/flag.png';
import boomImg from '../assets/boom.png';
import img1 from '../assets/1.png';
import img2 from '../assets/2.png';
import img3 from '../assets/3.png';
import img4 from '../assets/4.png';
import img5 from '../assets/5.png';
import img6 from '../assets/6.png';
import img7 from '../assets/7.png';
import img8 from '../assets/8.png';
// checkedImg는 추후 파일명 알려주면 교체

export type CellState = 'hidden' | 'revealed' | 'flagged' | 'checked';
export type CellContent = 'mine' | 'empty' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type CellData = {
  state: CellState;
  content: CellContent;
};

interface CellProps {
  data: CellData;
  onClick: () => void;
  onRightClick: (e: React.MouseEvent) => void;
  pressed?: boolean;
  onMouseDown?: () => void;
  onMouseUp?: () => void;
  onMouseLeave?: () => void;
  size?: number;
}

const imgMap: Record<string, string> = {
  hidden: defaultImg,         // 안 열린 칸
  flagged: flagImg,
  checked: emptyImg,          // 임시: checked 상태도 empty로 표시
  revealed_mine: boomImg,
  revealed_empty: emptyImg,   // 열린 빈 칸
  revealed_1: img1,
  revealed_2: img2,
  revealed_3: img3,
  revealed_4: img4,
  revealed_5: img5,
  revealed_6: img6,
  revealed_7: img7,
  revealed_8: img8,
};

function getCellImage(data: CellData): string {
  if (data.state === 'hidden') return imgMap.hidden;
  if (data.state === 'flagged') return imgMap.flagged;
  if (data.state === 'checked') return imgMap.checked;
  if (data.state === 'revealed') {
    if (data.content === 'mine') return imgMap.revealed_mine;
    if (data.content === 'empty') return imgMap.revealed_empty;
    return imgMap[`revealed_${data.content}`];
  }
  return imgMap.hidden;
}

const Cell: React.FC<CellProps> = ({ data, onClick, onRightClick, pressed, onMouseDown, onMouseUp, onMouseLeave, size }) => (
  <img
    src={getCellImage(data)}
    alt="cell"
    width={size ?? 32}
    height={size ?? 32}
    style={{
      cursor: 'pointer',
      userSelect: 'none',
      background: pressed ? '#d0d0d0' : '#808080',
      borderRadius: 4,
      boxShadow: pressed ? 'inset 0 2px 8px #888' : undefined,
      filter: pressed ? 'brightness(0.92)' : undefined,
      transform: pressed ? 'translateY(2px)' : undefined,
      transition: 'background 0.1s, filter 0.1s, transform 0.1s',
      display: 'block',
    }}
    onClick={onClick}
    onContextMenu={onRightClick}
    onMouseDown={onMouseDown}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseLeave}
    draggable={false}
  />
);

export default Cell; 