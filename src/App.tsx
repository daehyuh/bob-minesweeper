import React, { useState, useEffect } from 'react';
import MinesweeperBoard from './components/MinesweeperBoard';
import type { CellData } from './components/Cell';
import ConfirmModal from './components/ConfirmModal';

// 보드 생성 함수 (임시, 나중에 API 대체)
function createBoard(rows: number, cols: number, mines: number): CellData[][] {
  // 빈 보드 생성
  const board: CellData[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ state: 'hidden', content: 'empty' }))
  );
  // 지뢰 위치 무작위 배치
  let placed = 0;
  while (placed < mines) {
    const r = Math.floor(Math.random() * rows);
    const c = Math.floor(Math.random() * cols);
    if (board[r][c].content === 'mine') continue;
    board[r][c].content = 'mine';
    placed++;
  }
  // 숫자 채우기
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
}

type GameState = 'playing' | 'won' | 'lost';

// 랭킹/채팅 임시 컴포넌트
const RankingPanel = ({ records, difficulty, history }: { records: Record<string, number>, difficulty: string, history: any[] }) => (
  <div style={{
    width: 340,
    minHeight: 400,
    background: '#23242a',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    padding: 16,
    marginRight: 24,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    fontSize: 16,
    color: '#e0e0e0',
  }}>
    <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#fff' }}>내 기록</div>
    <ul style={{ paddingLeft: 0, width: '100%', listStyle: 'none' }}>
      <li style={{ marginBottom: 8, color: '#fff', fontWeight: difficulty === 'easy' ? 700 : 400 }}>초급: {records.easy ? formatTime(records.easy) : '-'} </li>
      <li style={{ marginBottom: 8, color: '#fff', fontWeight: difficulty === 'normal' ? 700 : 400 }}>중급: {records.normal ? formatTime(records.normal) : '-'} </li>
      <li style={{ marginBottom: 8, color: '#fff', fontWeight: difficulty === 'hard' ? 700 : 400 }}>고급: {records.hard ? formatTime(records.hard) : '-'} </li>
      <li style={{ marginBottom: 8, color: '#fff', fontWeight: difficulty === 'custom' ? 700 : 400 }}>커스텀: {records.custom ? formatTime(records.custom) : '-'} </li>
    </ul>
    <div style={{ width: '100%', marginTop: 24 }}>
      <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 15 }}>히스토리</div>
      <div style={{ width: '100%', fontSize: 13, color: '#e0e0e0', maxHeight: 220, overflowY: 'auto' }}>
        <div style={{ display: 'flex', fontWeight: 700, marginBottom: 4, color: '#b0b0b0', fontSize: 12 }}>
          <div style={{ width: 130 }}>날짜</div>
          <div style={{ width: 70 }}>난이도</div>
          <div style={{ width: 80 }}>시간</div>
          <div style={{ width: 44 }}>결과</div>
        </div>
        {history.length === 0 && <div style={{ color: '#888', padding: '8px 0' }}>기록 없음</div>}
        {history.slice(0, 10).map((h, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: 3, background: i % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'none', borderRadius: 4, padding: '2px 0' }}>
            <div style={{ width: 130, fontVariantNumeric: 'tabular-nums' }}>{h.date}</div>
            <div style={{ width: 70 }}>{h.difficulty}</div>
            <div style={{ width: 80 }}>{h.time}</div>
            <div style={{ width: 44, textAlign: 'center' }}>
              {h.result === '성공' ? <span style={{ color: '#a8ff60' }}>✅</span> : <span style={{ color: '#ff6e6e' }}>❌</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
const ChatPanel = () => (
  <div style={{
    width: 220,
    minHeight: 400,
    background: '#23242a',
    borderRadius: 12,
    boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
    padding: 16,
    marginLeft: 24,
    display: 'flex',
    flexDirection: 'column',
    fontSize: 15,
    color: '#e0e0e0',
  }}>
    <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#fff' }}>채팅</div>
    <div style={{ flex: 1, overflowY: 'auto', marginBottom: 8 }}>
      {/* 채팅 메시지 없음 */}
    </div>
    <input type="text" placeholder="메시지 입력..." style={{ width: '100%', borderRadius: 6, border: '1px solid #444', background: '#18191c', color: '#e0e0e0', padding: 6, fontSize: 15 }} />
  </div>
);

// 서비스 헤더바 컴포넌트
const ServiceHeaderBar = ({ tab, onTabChange }: { tab: string, onTabChange: (tab: 'practice' | 'challenge' | 'event') => void }) => (
  <header style={{
    width: '100%',
    minWidth: 1200,
    height: 64,
    background: 'linear-gradient(90deg,#23242a 0%,#3f2b96 100%)',
    boxShadow: '0 2px 12px #0004',
    display: 'flex',
    alignItems: 'center',
    position: 'fixed',
    top: 0,
    left: 0,
    zIndex: 2000,
  }}>
    {/* 왼쪽: 로고 + 탭버튼 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: 2, marginRight: 32, paddingLeft: 32 }}>BOB MINESWEEPER</span>
      <button
        onClick={() => onTabChange('practice')}
        style={{
          background: tab === 'practice' ? 'linear-gradient(90deg,#a8c0ff,#3f2b96)' : 'transparent',
          color: tab === 'practice' ? '#fff' : '#e0e0e0',
          border: 'none',
          borderRadius: 10,
          fontWeight: tab === 'practice' ? 800 : 500,
          fontSize: 18,
          padding: '10px 28px',
          cursor: 'pointer',
          boxShadow: tab === 'practice' ? '0 2px 8px #3f2b9633' : undefined,
          transition: 'all 0.18s',
        }}
        aria-label="연습게임"
      >연습게임</button>
      <button
        onClick={() => onTabChange('challenge')}
        style={{
          background: tab === 'challenge' ? 'linear-gradient(90deg,#f7971e,#ffd200)' : 'transparent',
          color: tab === 'challenge' ? '#23242a' : '#e0e0e0',
          border: 'none',
          borderRadius: 10,
          fontWeight: tab === 'challenge' ? 800 : 500,
          fontSize: 18,
          padding: '10px 28px',
          cursor: 'pointer',
          boxShadow: tab === 'challenge' ? '0 2px 8px #f7971e33' : undefined,
          transition: 'all 0.18s',
        }}
        aria-label="랭크게임"
      >랭크게임</button>
      <button
        onClick={() => onTabChange('event')}
        style={{
          background: tab === 'event' ? 'linear-gradient(90deg,#43cea2,#185a9d)' : 'transparent',
          color: tab === 'event' ? '#fff' : '#e0e0e0',
          border: 'none',
          borderRadius: 10,
          fontWeight: tab === 'event' ? 800 : 500,
          fontSize: 18,
          padding: '10px 28px',
          cursor: 'pointer',
          boxShadow: tab === 'event' ? '0 2px 8px #185a9d33' : undefined,
          transition: 'all 0.18s',
        }}
        aria-label="이벤트"
      >이벤트</button>
    </div>
    {/* 오른쪽: 로그인/회원가입 */}

    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto', paddingRight: 32 }}>
      <button
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(90deg,#3f2b96,#a8c0ff)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 17,
          padding: '9px 24px',
          minWidth: 110,
          height: 44,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #3f2b9633',
          transition: 'all 0.18s',
          letterSpacing: 1,
          position: 'relative',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg,#a8c0ff,#3f2b96)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#3f2b96,#a8c0ff)'}
        aria-label="로그인"
      >
        <span style={{ fontSize: 20, opacity: 0.85 }}>🔑</span>
        로그인
      </button>
      <button
        style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'linear-gradient(90deg,#43cea2,#185a9d)',
          color: '#fff',
          border: 'none',
          borderRadius: 12,
          fontWeight: 700,
          fontSize: 17,
          padding: '9px 24px',
          minWidth: 110,
          height: 44,
          cursor: 'pointer',
          boxShadow: '0 2px 8px #185a9d33',
          transition: 'all 0.18s',
          letterSpacing: 1,
          position: 'relative',
        }}
        onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg,#185a9d,#43cea2)'}
        onMouseOut={e => e.currentTarget.style.background = 'linear-gradient(90deg,#43cea2,#185a9d)'}
        aria-label="회원가입"
      >
        <span style={{ fontSize: 20, opacity: 0.85 }}>📝</span>
        회원가입
      </button>
    </div>
  </header>
);

// 난이도 변경 핸들러(확인/취소용 ConfirmModal만 사용)
// App 함수 내부에 위치해야 함

// HH:MM:SS 포맷 함수
function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

function App() {
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(16);
  const [mines, setMines] = useState(40);
  const [board, setBoard] = useState<CellData[][]>(() => createBoard(16, 16, 40));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [pressedCells, setPressedCells] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<'practice' | 'challenge' | 'event'>('practice');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'custom'>('normal');
  const [customRows, setCustomRows] = useState(rows);
  const [customCols, setCustomCols] = useState(cols);
  const [customMines, setCustomMines] = useState(mines);

  // 고정형 게임창 크기
  const containerWidth = 700;
  const boardWidth = 600;
  const boardHeight = 600;
  const cellSize = Math.floor(Math.min(boardWidth / cols, boardHeight / rows));

  // 커스텀 모달 상태
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<null | (() => void)>(null);
  // 안내/확인 모달 열기
  const openConfirm = (message: string, action: () => void) => {
    setConfirmMessage(message);
    setOnConfirmAction(() => action);
    setConfirmOpen(true);
  };
  const handleConfirm = () => {
    setConfirmOpen(false);
    if (onConfirmAction) onConfirmAction();
    setOnConfirmAction(null);
  };
  const handleCancel = () => {
    setConfirmOpen(false);
    setOnConfirmAction(null);
  };

  // 안내성 ConfirmModal(성공/실패/입력오류)와 확인/취소 ConfirmModal(난이도/모드/커스텀 변경) 분리
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState('');

  // 내 기록(로컬스토리지) 상태
  const [records, setRecords] = useState<Record<string, number>>({});
  const [history, setHistory] = useState<any[]>([]);

  // 기록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('minesweeper-records');
    if (saved) setRecords(JSON.parse(saved));
    const savedHistory = localStorage.getItem('minesweeper-history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  // 기록 저장 함수
  const saveRecord = (difficulty: string, time: number) => {
    setRecords(prev => {
      const prevTime = prev[difficulty];
      if (!prevTime || time < prevTime) {
        const updated = { ...prev, [difficulty]: time };
        localStorage.setItem('minesweeper-records', JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  };

  // 히스토리 저장 함수
  const saveHistory = (difficulty: string, time: number, result: string) => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    const diffName = difficulty === 'easy' ? '초급' : difficulty === 'normal' ? '중급' : difficulty === 'hard' ? '고급' : '커스텀';
    const entry = { date: dateStr, difficulty: diffName, time: formatTime(time), result };
    setHistory(prev => {
      const updated = [entry, ...prev].slice(0, 30);
      localStorage.setItem('minesweeper-history', JSON.stringify(updated));
      return updated;
    });
  };

  // 게임 종료 시 안내성 ConfirmModal/다시하기 분기
  useEffect(() => {
    if (gameState === 'won') {
      setInfoMessage(`🎉 성공!\n난이도: ${difficulty === 'easy' ? '초급' : difficulty === 'normal' ? '중급' : difficulty === 'hard' ? '고급' : '커스텀'}\n게임시간: ${formatTime(elapsed)}`);
      setInfoOpen(true);
      saveRecord(difficulty, elapsed);
      saveHistory(difficulty, elapsed, '성공');
    } else if (gameState === 'lost') {
      // 실패 시: 다시하기/취소 ConfirmModal
      openConfirm('💥 실패!\n지뢰를 밟았습니다!\n다시 시작하시겠습니까?', () => {
        setBoard(createBoard(rows, cols, mines));
        setGameState('playing');
      });
      saveHistory(difficulty, elapsed, '실패');
    }
  }, [gameState]);

  // 타이머 상태 및 로직
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
  // 게임 시작/종료 타이머 제어
  useEffect(() => {
    if (gameState === 'playing' && firstClick) setTimerActive(true);
    else setTimerActive(false);
    if (gameState !== 'playing') setFirstClick(false);
    if (gameState !== 'playing') setElapsed(0);
  }, [gameState, firstClick]);
  // 첫 클릭 감지
  const handleCellClickWithTimer = (row: number, col: number) => {
    if (!firstClick && gameState === 'playing') setFirstClick(true);
    handleCellClick(row, col);
  };

  // 셀 클릭 핸들러
  const handleCellClick = (row: number, col: number) => {
    if (gameState !== 'playing') return;
    const cell = board[row][col];

    // 이미 열린 숫자 셀 클릭 시: 주변 깃발 개수 체크 후 확장 오픈
    if (cell.state === 'revealed' && typeof cell.content === 'number') {
      let flagCount = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (board[nr][nc].state === 'flagged') flagCount++;
          }
        }
      }
      if (flagCount === cell.content) {
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        let changed = false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (newBoard[nr][nc].state === 'hidden') {
                // 재귀적으로 오픈
                openCell(newBoard, nr, nc);
                changed = true;
              }
            }
          }
        }
        if (changed) {
          setBoard(newBoard);
          // 승리 체크
          const allClear = newBoard.every(row => row.every(cell => cell.state === 'revealed' || cell.content === 'mine'));
          if (allClear) setGameState('won');
        }
        return;
      }
    }

    // 기존 숨겨진 셀 클릭 로직
    if (cell.state !== 'hidden') return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    openCell(newBoard, row, col);
    setBoard(newBoard);
    // 승리 체크
    const allClear = newBoard.every(row => row.every(cell => cell.state === 'revealed' || cell.content === 'mine'));
    if (allClear) setGameState('won');
  };

  // 셀 오픈(빈칸 BFS 포함) 함수 분리
  function openCell(board: CellData[][], row: number, col: number) {
    if (board[row][col].state !== 'hidden') return;
    // 주변이 모두 열린 셀/깃발이면 자동으로 오픈
    let surrounded = true;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
          if (board[nr][nc].state === 'hidden') surrounded = false;
        }
      }
    }
    if (surrounded) {
      board[row][col].state = 'revealed';
      return;
    }
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
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc].state === 'hidden') {
              if (!queue.some(([qr, qc]) => qr === nr && qc === nc)) queue.push([nr, nc]);
            }
          }
        }
      }
    }
  }

  // 셀 우클릭 핸들러
  const handleCellRightClick = (row: number, col: number, e: React.MouseEvent) => {
    e.preventDefault();
    if (gameState !== 'playing') return;
    const cell = board[row][col];
    if (cell.state === 'revealed') return;
    const newBoard = board.map(row => row.map(cell => ({ ...cell })));
    if (cell.state === 'hidden') newBoard[row][col].state = 'flagged';
    else if (cell.state === 'flagged') newBoard[row][col].state = 'hidden';
    setBoard(newBoard);
  };

  // 이미 열린 셀에서 마우스 다운 시 주변 8칸 pressedCells에 추가
  const handleCellMouseDown = (row: number, col: number) => {
    const cell = board[row][col];
    if (cell.state === 'revealed' && typeof cell.content === 'number') {
      const next = new Set<string>();
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          const nr = row + dr, nc = col + dc;
          if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
            if (board[nr][nc].state === 'hidden') {
              next.add(`${nr},${nc}`);
            }
          }
        }
      }
      setPressedCells(next);
    } else if (cell.state === 'hidden') {
      // 안 열린 셀을 누르면 자기 자신만 pressedCells에 추가
      setPressedCells(new Set([`${row},${col}`]));
    }
  };
  // 마우스 업/리브 시 pressedCells 초기화
  const handleCellMouseUp = () => setPressedCells(new Set());
  const handleCellMouseLeave = () => setPressedCells(new Set());

  // 게임 리셋
  const resetGame = () => {
    setBoard(createBoard(rows, cols, mines));
    setGameState('playing');
  };

  // 탭 변경 핸들러 (연습게임에서 나갈 때 확인)
  const handleTabChange = (nextTab: 'practice' | 'challenge' | 'event') => {
    if (nextTab === 'challenge' || nextTab === 'event') {
      setInfoMessage('준비중입니다');
      setInfoOpen(true);
      return;
    }
    setTab(nextTab);
  };

  // 커스텀 난이도 적용
  const handleCustomApply = () => {
    if (
      customRows < 5 || customCols < 5 || customRows > 40 || customCols > 40 ||
      customMines < 1 || customMines >= customRows * customCols
    ) {
      setInfoMessage('유효한 값을 입력하세요. (행/열: 5~40, 지뢰: 1~(행×열-1))');
      setInfoOpen(true);
      return;
    }
    // infoOpen이 아닌 ConfirmModal로 확인
    openConfirm('정말 커스텀 난이도로 변경하시겠습니까?\n*현재 게임 진행 상태는 초기화됩니다', () => {
      setDifficulty('custom');
      setRows(customRows);
      setCols(customCols);
      setMines(customMines);
      setBoard(createBoard(customRows, customCols, customMines));
      setGameState('playing');
    });
  };

  // 난이도 변경 핸들러(확인/취소용 ConfirmModal만 사용)
  const handleDifficultyChange = (level: 'easy' | 'normal' | 'hard') => {
    const levelName = level === 'easy' ? '초급' : level === 'normal' ? '중급' : '고급';
    openConfirm(`정말 ${levelName} 난이도로 변경하시겠습니까?\n*현재 게임 진행 상태는 초기화됩니다`, () => {
      setDifficulty(level);
      if (level === 'easy') {
        setRows(9); setCols(9); setMines(10);
        setBoard(createBoard(9, 9, 10));
      } else if (level === 'normal') {
        setRows(16); setCols(16); setMines(40);
        setBoard(createBoard(16, 16, 40));
      } else if (level === 'hard') {
        setRows(16); setCols(30); setMines(99);
        setBoard(createBoard(16, 30, 99));
      }
      setGameState('playing');
    });
  };

  return (
    <div className="app-root" style={{ width: '100vw', minHeight: '100vh', background: '#222', boxSizing: 'border-box', padding: 0, margin: 0 }}>
      {/* 헤더 */}
      <div className="header-bar">
        <ServiceHeaderBar tab={tab} onTabChange={handleTabChange} />
      </div>

      {/* 게임난이도 */}
      <div className="difficulty-bar" style={{
        paddingTop: 72,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        gap: 0,
        minHeight: 56,
        minWidth: 1000, // 전체 바 최소 가로폭 확보
      }}>
        {/* 가운데: 난이도/커스텀 UI */}
        <div className="difficulty-center" style={{
          flex: '0 1 880px', // 랭킹+게임 영역만큼
          maxWidth: 880,
          minWidth: 880,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          justifyContent: 'center',
          flexWrap: 'nowrap', // 줄바꿈 방지
        }}>
          <span style={{ fontWeight: 'bold', color: '#fff', marginRight: 8, whiteSpace: 'nowrap' }}>난이도:</span>
          <button onClick={() => handleDifficultyChange('easy')} style={{ fontWeight: difficulty === 'easy' ? 'bold' : 'normal', minWidth: 60, padding: '8px 16px', whiteSpace: 'nowrap' }}>초급</button>
          <button onClick={() => handleDifficultyChange('normal')} style={{ fontWeight: difficulty === 'normal' ? 'bold' : 'normal', minWidth: 60, padding: '8px 16px', whiteSpace: 'nowrap' }}>중급</button>
          <button onClick={() => handleDifficultyChange('hard')} style={{ fontWeight: difficulty === 'hard' ? 'bold' : 'normal', minWidth: 60, padding: '8px 16px', whiteSpace: 'nowrap' }}>고급</button>
          <span style={{ color: '#fff', marginLeft: 16, whiteSpace: 'nowrap' }}>커스텀:</span>
          <input type="number" min={5} max={40} value={customRows} onChange={e => setCustomRows(Number(e.target.value))} style={{ width: 56, minWidth: 40, padding: '6px 4px', whiteSpace: 'nowrap' }} />
          <span style={{ color: '#fff', whiteSpace: 'nowrap' }}>x</span>
          <input type="number" min={5} max={40} value={customCols} onChange={e => setCustomCols(Number(e.target.value))} style={{ width: 56, minWidth: 40, padding: '6px 4px', whiteSpace: 'nowrap' }} />
          <span style={{ color: '#fff', whiteSpace: 'nowrap' }}>지뢰</span>
          <input type="number" min={1} max={customRows * customCols - 1} value={customMines} onChange={e => setCustomMines(Number(e.target.value))} style={{ width: 64, minWidth: 48, padding: '6px 4px', whiteSpace: 'nowrap' }} />
          <button onClick={handleCustomApply} style={{ minWidth: 48, padding: '8px 16px', whiteSpace: 'nowrap' }}>적용</button>
        </div>
        {/* 오른쪽: 게임 상태 */}
        <div className="difficulty-right" style={{
          flex: '0 1 340px',
          minWidth: 300,
          maxWidth: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: 12,
        }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, whiteSpace: 'nowrap' }}>
            난이도: {(
              difficulty === 'easy' ? '초급' :
              difficulty === 'normal' ? '중급' :
              difficulty === 'hard' ? '고급' :
              '커스텀'
            )} | 시간: {formatTime(elapsed)}
          </span>
          <button onClick={() => openConfirm('정말 다시 시작하시겠습니까?', resetGame)}
            style={{
              marginLeft: 12,
              padding: '7px 28px',
              fontWeight: 600,
              borderRadius: 8,
              border: '1px solid #646cff',
              background: '#646cff',
              color: '#fff',
              fontSize: 16,
              minWidth: 120,
              cursor: 'pointer',
              boxShadow: '0 2px 8px #3f2b9633',
              transition: 'all 0.18s',
            }}
          >다시하기</button>
        </div>
      </div>

      {/* 메인: 랭킹 | 게임판 | 채팅 */}
      <div className="main-content" style={{ width: '100%', display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'center', marginTop: 12 }}>
        {/* 랭킹 */}
        <div className="ranking-panel">
          <RankingPanel records={records} difficulty={difficulty} history={history} />
        </div>
        {/* 게임판 */}
        <div className="game-container" style={{ width: containerWidth, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' }}>
          <div style={{
            width: boardWidth,
            height: boardHeight,
            background: '#222',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            border: '2px solid #888',
            marginBottom: 16,
          }}>
            <MinesweeperBoard
              board={board}
              onCellClick={handleCellClickWithTimer}
              onCellRightClick={handleCellRightClick}
              pressedCells={pressedCells}
              onCellMouseDown={handleCellMouseDown}
              onCellMouseUp={handleCellMouseUp}
              onCellMouseLeave={handleCellMouseLeave}
              cellSize={cellSize}
            />
          </div>
        </div>
        {/* 채팅 */}
        <div className="chat-panel">
          <ChatPanel />
        </div>
      </div>

      {/* ConfirmModal 실제 렌더링 */}
      <ConfirmModal
        open={confirmOpen}
        message={confirmMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      {/* InfoModal (게임 종료 등 안내) */}
      <ConfirmModal
        open={infoOpen}
        message={infoMessage.replace(/\n/g, '<br/>')}
        onConfirm={() => setInfoOpen(false)}
        onCancel={() => setInfoOpen(false)}
        confirmText="확인"
      />
    </div>
  );
}

export default App;
