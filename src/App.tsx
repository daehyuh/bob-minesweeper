import React, { useState, useEffect } from 'react';
import MinesweeperBoard from './components/MinesweeperBoard';
import type { CellData } from './components/Cell';
import ConfirmModal from './components/ConfirmModal';
import { useNavigate } from 'react-router-dom';
import AllHistoryPanel from './components/AllHistoryPanel';
import { supabase } from './supabase';
import Chat from './components/Chat';
import Footer from './components/Footer';
import ServiceHeaderBar from './components/ServiceHeaderBar';

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

// HH:MM:SS 포맷 함수
function formatTime(sec: number) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':');
}

function formatDateYMDHMS(dateString: string) {
  if (!dateString) return '-';
  const d = new Date(dateString);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// 랭킹/채팅 임시 컴포넌트
const RankingPanel = ({ records, difficulty, history, rankings, user, hideTitle }: { records: Record<string, number>, difficulty: string, history: any[], rankings: { [key: string]: any[] }, user: any, hideTitle?: boolean }) => {
  // 유저 닉네임
  const username = user?.user_metadata?.name || (user?.email ? user.email.split('@')[0] : '');
  // 각 난이도별 랭킹 계산
  const getRank = (diff: string) => {
    if (!username || !rankings[diff]) return null;
    const idx = rankings[diff].findIndex((r: any) => r.username === username);
    return idx >= 0 ? idx + 1 : null;
  };
  return (
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
      {!hideTitle && <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#fff' }}>내 기록</div>}
      <ul style={{ paddingLeft: 0, width: '100%', listStyle: 'none' }}>
        {['easy', 'normal', 'hard'].map(diff => {
          const sec = Number(records[diff]);
          return (
            <li key={diff} style={{ marginBottom: 8, color: '#fff', fontWeight: difficulty === diff ? 700 : 400 }}>
              {diff === 'easy' ? '초급' : diff === 'normal' ? '중급' : '고급'}: {sec > 0 ? formatTime(sec) : '-'}
              {sec > 0 && getRank(diff) && (
                <span style={{ color: '#ffd200', marginLeft: 8, fontWeight: 600, fontSize: 15 }}>
                  | 랭킹: {getRank(diff)}위
                </span>
              )}
            </li>
          );
        })}
      </ul>
      <div style={{ width: '100%', marginTop: 24 }}>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: 8, fontSize: 15 }}>히스토리</div>
        <div style={{ width: '100%', fontSize: 13, color: '#e0e0e0', maxHeight: 220, overflowY: 'auto' }}>
          <div style={{ display: 'flex', fontWeight: 700, marginBottom: 4, color: '#b0b0b0', fontSize: 12 }}>
            <div style={{ width: 130 }}>날짜</div>
            <div style={{ width: 70 }}>난이도</div>
            <div style={{ width: 80 }}>시간(초)</div>
            <div style={{ width: 44 }}>결과</div>
          </div>
          {history.length === 0 && <div style={{ color: '#888', padding: '8px 0' }}>기록 없음</div>}
          {history.filter(h => h.difficulty !== '커스텀').slice(0, 10).map((h, i) => (
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
};

// App 컴포넌트에 page prop 추가
function App({ page }: { page: 'practice' | 'challenge' | 'history' | 'event' | 'users' }) {
  const [rows, setRows] = useState(16);
  const [cols, setCols] = useState(16);
  const [mines, setMines] = useState(40);
  const [board, setBoard] = useState<CellData[][]>(() => createBoard(16, 16, 40));
  const [gameState, setGameState] = useState<GameState>('playing');
  const [pressedCells, setPressedCells] = useState<Set<string>>(new Set());
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard' | 'custom'>('normal');
  const [customRows, setCustomRows] = useState(rows);
  const [customCols, setCustomCols] = useState(cols);
  const [customMines, setCustomMines] = useState(mines);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [userList, setUserList] = useState<any[]>([]);

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

  // 랭킹 데이터 상태
  const [rankings, setRankings] = useState<{ [key: string]: any[] }>({});
  const [clearRankings, setClearRankings] = useState<{ [key: string]: any[] }>({});

  // 세션 복원 및 onAuthStateChange 모두 사용
  useEffect(() => {
    // 최초 세션 복원
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    // 세션 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 기록 불러오기 useEffect에서 user.uid → user.id로 변경
  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from('records')
        .select('difficulty, time, result, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) {
        console.error('Error fetching records:', error);
        return;
      }
      const recs: Record<string, number> = {};
      const hist: any[] = [];
      data.forEach((d: any) => {
        if (d.difficulty === 'custom') return; // 커스텀 기록 제외
        const diff = d.difficulty === 'easy' ? 'easy' : d.difficulty === 'normal' ? 'normal' : d.difficulty === 'hard' ? 'hard' : 'custom';
        // 성공 기록만 내 기록에 반영
        if (d.result === '성공') {
          if (recs[diff] === undefined || d.time < recs[diff]) {
            recs[diff] = d.time;
          }
        }
        hist.push({
          date: d.created_at ? formatDateYMDHMS(d.created_at) : '',
          difficulty: d.difficulty === 'easy' ? '초급' : d.difficulty === 'normal' ? '중급' : d.difficulty === 'hard' ? '고급' : '커스텀',
          time: d.time,
          result: d.result || (d.time ? '성공' : '실패'),
        });
      });
      setRecords(recs);
      setHistory(hist); // 모든 기록 표시
    })();
  }, [user]);

  // 랭킹 데이터 불러오기
  useEffect(() => {
    if (page !== 'challenge' && page !== 'practice') return;
    const fetchRankings = async () => {
      const diffs = ['easy', 'normal', 'hard'];
      const newRankings: { [key: string]: any[] } = {};
      const newClearRankings: { [key: string]: any[] } = {};
      for (const diff of diffs) {
        // Supabase에서 모든 성공 기록 불러오기
        const { data } = await supabase
          .from('records')
          .select('*')
          .eq('difficulty', diff)
          .eq('result', '성공')
          .order('time', { ascending: true });
        if (!data) continue;
        // username별로 최소 기록만 추출 (group by)
        const bestByUser: { [username: string]: any } = {};
        data.forEach((d: any) => {
          if (!d.username) return;
          if (!bestByUser[d.username] || d.time < bestByUser[d.username].time) {
            bestByUser[d.username] = d;
          }
        });
        newRankings[diff] = Object.values(bestByUser).sort((a: any, b: any) => a.time - b.time);
        // 클리어 횟수 랭킹 (username별 카운트)
        const counts: { [username: string]: number } = {};
        data.forEach((d: any) => {
          if (!d.username) return;
          counts[d.username] = (counts[d.username] || 0) + 1;
        });
        newClearRankings[diff] = Object.entries(counts)
          .map(([username, count]) => ({ username, count }))
          .sort((a, b) => b.count - a.count);
      }
      setRankings(newRankings);
      setClearRankings(newClearRankings);
    };
    fetchRankings();
  }, [page]);
  
  // 유저 리스트 불러오기 useEffect에서 users 테이블로 변경
  useEffect(() => {
    if (page !== 'users') return;
    (async () => {
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) setUserList(data);
    })();
  }, [page]);

  // 기록 저장 함수 (Supabase)
  const saveRecord = async (difficulty: string, time: number, result: string) => {
    if (user) {
      await supabase.from('records').insert({
        user_id: user.id,
        username: user.user_metadata?.name || 'unknown',
        difficulty: difficulty,
        time: time,
        result: result,
        created_at: new Date(),
      });
      setRecords(prev => {
        const next = { ...prev };
        if (result === '성공' && (next[difficulty] === undefined || time < next[difficulty])) {
          next[difficulty] = time;
        }
        return next;
      });
      setHistory(prev => [
        {
          date: new Date().toLocaleString('ko-KR'),
          difficulty: difficulty === 'easy' ? '초급' : difficulty === 'normal' ? '중급' : difficulty === 'hard' ? '고급' : '커스텀',
          time,
          result,
        },
        ...prev
      ]);
    }
  };

  // 게임 종료 시 안내성 ConfirmModal/다시하기 분기
  useEffect(() => {
    if (gameState === 'won') {
      setInfoMessage(`🎉 성공!\n난이도: ${difficulty === 'easy' ? '초급' : difficulty === 'normal' ? '중급' : difficulty === 'hard' ? '고급' : '커스텀'}\n게임시간: ${formatTime(elapsed)}`);
      setInfoOpen(true);
      saveRecord(difficulty, elapsed, '성공');
    } else if (gameState === 'lost') {
      // 실패 시: 다시하기/취소 ConfirmModal
      openConfirm('💥 실패!\n지뢰를 밟았습니다!\n다시 시작하시겠습니까?', () => {
        setBoard(createBoard(rows, cols, mines));
        setGameState('playing');
      });
      saveRecord(difficulty, elapsed, '실패');
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
        let mineOpened = false;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = row + dr, nc = col + dc;
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
              if (newBoard[nr][nc].state === 'hidden') {
                // 재귀적으로 오픈, 지뢰가 열렸는지 체크
                const openedMine = openCell(newBoard, nr, nc);
                if (openedMine) mineOpened = true;
                changed = true;
              }
            }
          }
        }
        if (mineOpened) {
          setBoard(newBoard);
          setGameState('lost');
          return;
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
    const mineOpened = openCell(newBoard, row, col);
    setBoard(newBoard);
    if (mineOpened) {
      setGameState('lost');
      return;
    }
    // 승리 체크
    const allClear = newBoard.every(row => row.every(cell => cell.state === 'revealed' || cell.content === 'mine'));
    if (allClear) setGameState('won');
  };

  // 셀 오픈(빈칸 BFS 포함) 함수 분리
  // 지뢰를 열면 true 반환, 아니면 false 반환
  function openCell(board: CellData[][], row: number, col: number): boolean {
    if (board[row][col].state !== 'hidden') return false;
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
      return false;
    }
    if (board[row][col].content === 'mine') {
      board[row][col].state = 'revealed';
      return true;
    }
    let mineOpened = false;
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
      } else if (board[r][c].content === 'mine') {
        mineOpened = true;
      }
    }
    return mineOpened;
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

  // 탭 변경 핸들러 (랭킹 탭도 실제로 이동)
  const handleTabChange = (nextTab: string) => {
    if (nextTab === 'home') {
      navigate('/');
      return;
    }
    if (nextTab === 'event') {
      // setInfoMessage('준비중입니다');
      // setInfoOpen(true);
      navigate('/event');
      return;
    }
    if (nextTab === 'practice') navigate('/game');
    else if (nextTab === 'challenge') navigate('/rank');
    else if (nextTab === 'history') navigate('/history');
    else if (nextTab === 'users') navigate('/users');
    else if (nextTab === 'developer') navigate('/developer');
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

  // 로그아웃 핸들러
  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      // 'Auth session missing!' 에러는 무시하고, 세션이 없으면 성공 처리
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || (error && error.message === 'Auth session missing!')) {
        setUser(null);
        navigate('/');
        return;
      }
      if (error) {
        setInfoMessage('로그아웃 실패: ' + error.message);
        setInfoOpen(true);
        return;
      }
      setUser(null);
      navigate('/');
    } catch (e: any) {
      setInfoMessage('로그아웃 중 오류: ' + (e?.message || e));
      setInfoOpen(true);
    }
  };

  // 모바일 감지
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1200);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  // 모바일 내기록/채팅 탭 상태
  const [mobileTab, setMobileTab] = useState<'record' | 'chat'>('record');

  return (
    <div className="app-root" style={{ width: '100vw', minHeight: '100vh', background: '#222', boxSizing: 'border-box', padding: 0, margin: 0 }}>
      {/* 헤더 */}
      <div className="header-bar">
        <ServiceHeaderBar
          tab={page}
          onTabChange={handleTabChange}
          user={user}
          onLoginClick={() => navigate('/auth')}
          onLogoutClick={handleLogout}
        />
      </div>
      {/* 각 페이지별 분기 */}
      {page === 'users' ? (
        <div style={{
          width: isMobile ? '100%' : '100%',
          maxWidth: isMobile ? '100vw' : 1400,
          margin: isMobile ? '80px auto 0' : '80px auto 0',
          padding: isMobile ? 8 : 24,
          background: '#23242a',
          borderRadius: 16,
          color: '#fff',
          overflowX: isMobile ? 'auto' : undefined,
          fontSize: isMobile ? 14 : undefined
        }}>
          <h2 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, marginBottom: 32, textAlign: 'center', letterSpacing: 1 }}>유저 리스트</h2>
          <div style={{ maxHeight: 500, overflowY: 'auto', borderRadius: 12, border: '1px solid #444', background: '#18191c', boxShadow: '0 2px 8px #0003', width: isMobile ? '100%' : undefined, overflowX: isMobile ? 'auto' : undefined }}>
            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: isMobile ? undefined : 400, fontSize: isMobile ? 13 : undefined }}>
              <thead style={{ position: 'sticky', top: 0, background: '#23242a', zIndex: 2 }}>
                <tr style={{ color: '#ffd200', fontWeight: 800, fontSize: isMobile ? 15 : 18, textAlign: 'center' }}>
                  <th style={{ padding: isMobile ? '8px 2px' : '14px 8px', minWidth: 80, borderBottom: '2px solid #ffd200', background: '#23242a', position: 'sticky', top: 0 }}>닉네임</th>
                  <th style={{ padding: isMobile ? '8px 2px' : '14px 8px', minWidth: 80, borderBottom: '2px solid #ffd200', background: '#23242a', position: 'sticky', top: 0 }}>가입일</th>
                </tr>
              </thead>
              <tbody>
                {userList.length === 0 && (
                  <tr><td colSpan={2} style={{ textAlign: 'center', color: '#aaa', padding: 32 }}>유저 없음</td></tr>
                )}
                {userList.map((u, i) => (
                  <tr key={u.id || i} style={{ background: i % 2 === 0 ? '#23242a' : '#18191c', transition: 'background 0.2s', textAlign: 'center', cursor: 'pointer' }}
                    onMouseOver={e => (e.currentTarget.style.background = '#333')}
                    onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? '#23242a' : '#18191c')}
                  >
                    <td style={{ padding: '12px 8px', fontWeight: 600, fontSize: 17 }}>{u.name || '-'}</td>
                    <td style={{ padding: '12px 8px', fontSize: 16 }}>{u.created_at ? new Date(u.created_at).toLocaleString('ko-KR') : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : page === 'history' ? (
        <div style={{ width: isMobile ? '100%' : undefined, maxWidth: isMobile ? '100vw' : undefined, margin: isMobile ? '80px auto 0' : undefined, padding: isMobile ? 8 : 24, background: '#23242a', borderRadius: 16, color: '#fff', overflowX: isMobile ? 'auto' : undefined, fontSize: isMobile ? 14 : undefined }}>
          <AllHistoryPanel />
        </div>
      ) : page === 'challenge' ? (
        // 전체 랭킹 UI 복구
        <div style={{ width: isMobile ? '100%' : '100%', maxWidth: isMobile ? '100vw' : 1400, margin: isMobile ? '80px auto 0' : '80px auto 0', padding: isMobile ? 8 : 24, background: '#23242a', borderRadius: 16, color: '#fff', overflowX: isMobile ? 'auto' : undefined, fontSize: isMobile ? 14 : undefined }}>
          <h2 style={{ fontSize: isMobile ? 20 : 28, fontWeight: 900, marginBottom: 32, textAlign: 'center', letterSpacing: 1 }}>전체 랭킹</h2>
          {/* 최고점 랭킹 섹션 */}
          <h3 style={{ fontSize: isMobile ? 16 : 24, fontWeight: 800, marginBottom: 18, textAlign: 'center', letterSpacing: 1 }}>🏆 최고점 랭킹</h3>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
            {['easy', 'normal', 'hard'].map(diff => (
              <div key={diff} style={{ flex: 1, minWidth: isMobile ? undefined : 320, background: '#18191c', borderRadius: 12, padding: isMobile ? 8 : 20, marginBottom: isMobile ? 12 : 0, overflowX: isMobile ? 'auto' : undefined }}>
                <h4 style={{ fontSize: isMobile ? 14 : 20, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
                  {diff === 'easy' ? '초급' : diff === 'normal' ? '중급' : '고급'} 최고 랭킹
                </h4>
                <div style={{ maxHeight: isMobile ? 220 : 400, overflowY: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', marginBottom: 0, fontSize: isMobile ? 13 : undefined }}>
                    <thead>
                      <tr style={{ color: '#a8c0ff', fontWeight: 700 }}>
                        <th style={{ padding: isMobile ? 4 : 8 }}>순위</th>
                        <th style={{ padding: isMobile ? 4 : 8 }}>닉네임</th>
                        <th style={{ padding: isMobile ? 4 : 8 }}>기록(초)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankings[diff] && rankings[diff].length > 0 ? (() => {
                        let lastTime: number | null = null;
                        let lastRank = 0;
                        let skip = 1;
                        return rankings[diff].map((r, i) => {
                          let rank;
                          if (lastTime === r.time) {
                            rank = lastRank;
                            skip++;
                          } else {
                            rank = i + 1;
                            lastRank = rank;
                            lastTime = r.time;
                            skip = 1;
                          }
                          return (
                            <tr key={i} style={{ background: i % 2 === 0 ? '#23242a' : 'none' }}>
                              <td style={{ padding: 8 }}>{rank}</td>
                              <td style={{ padding: 8 }}>{r.username || '-'}</td>
                              <td style={{ padding: 8 }}>{r.time}</td>
                            </tr>
                          );
                        });
                      })() : (
                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>기록 없음</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          {/* 클리어 횟수 랭킹 섹션 */}
          <h3 style={{ fontSize: isMobile ? 16 : 24, fontWeight: 800, marginBottom: 18, textAlign: 'center', letterSpacing: 1 }}>🔥 클리어 횟수 랭킹</h3>
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, justifyContent: 'center', marginBottom: 32 }}>
            {['easy', 'normal', 'hard'].map(diff => (
              <div key={diff} style={{ flex: 1, minWidth: isMobile ? undefined : 320, background: '#18191c', borderRadius: 12, padding: isMobile ? 8 : 20, marginBottom: isMobile ? 12 : 0, overflowX: isMobile ? 'auto' : undefined }}>
                <h4 style={{ fontSize: isMobile ? 14 : 20, fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
                  {diff === 'easy' ? '초급' : diff === 'normal' ? '중급' : '고급'} 클리어 랭킹
                </h4>
                <div style={{ maxHeight: isMobile ? 220 : 400, overflowY: 'auto', width: '100%' }}>
                  <table style={{ width: '100%', fontSize: isMobile ? 13 : undefined }}>
                    <thead>
                      <tr style={{ color: '#43cea2', fontWeight: 700 }}>
                        <th style={{ padding: isMobile ? 4 : 8 }}>순위</th>
                        <th style={{ padding: isMobile ? 4 : 8 }}>닉네임</th>
                        <th style={{ padding: isMobile ? 4 : 8 }}>클리어 횟수</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clearRankings[diff] && clearRankings[diff].length > 0 ? clearRankings[diff].map((r, i) => (
                        <tr key={i} style={{ background: i % 2 === 0 ? '#23242a' : 'none' }}>
                          <td style={{ padding: 8 }}>{i + 1}</td>
                          <td style={{ padding: 8 }}>{r.username}</td>
                          <td style={{ padding: 8 }}>{r.count}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>기록 없음</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
          {/* 전체 클리어 횟수 랭킹 */}
          <h3 style={{ fontSize: isMobile ? 16 : 24, fontWeight: 800, marginBottom: 18, textAlign: 'center', letterSpacing: 1 }}>🌟 전체 클리어 랭킹</h3>
          <div style={{ maxWidth: isMobile ? '100%' : 700, margin: '0 auto', background: '#18191c', borderRadius: 12, padding: isMobile ? 8 : 20, overflowX: isMobile ? 'auto' : undefined }}>
            <div style={{ maxHeight: isMobile ? 220 : 400, overflowY: 'auto', width: '100%' }}>
              <table style={{ width: '100%', fontSize: isMobile ? 13 : undefined }}>
                <thead>
                  <tr style={{ color: '#ffd200', fontWeight: 700 }}>
                    <th style={{ padding: isMobile ? 4 : 8 }}>순위</th>
                    <th style={{ padding: isMobile ? 4 : 8 }}>닉네임</th>
                    <th style={{ padding: isMobile ? 4 : 8 }}>클리어 횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    // 전체 클리어 횟수 랭킹 계산
                    const allCounts: { [username: string]: number } = {};
                    ['easy', 'normal', 'hard'].forEach(diff => {
                      (clearRankings[diff] || []).forEach((r: { username: string; count: number }) => {
                        allCounts[r.username] = (allCounts[r.username] || 0) + r.count;
                      });
                    });
                    const allRanking = Object.entries(allCounts)
                      .map(([username, count]) => ({ username, count }))
                      .sort((a, b) => Number(b.count) - Number(a.count));
                    return allRanking.length > 0 ? allRanking.map((r, i) => (
                      <tr key={i} style={{ background: i % 2 === 0 ? '#23242a' : 'none' }}>
                        <td style={{ padding: 8 }}>{i + 1}</td>
                        <td style={{ padding: 8 }}>{r.username}</td>
                        <td style={{ padding: 8 }}>{r.count}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan={3} style={{ textAlign: 'center', color: '#888' }}>기록 없음</td></tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : page === 'event' ? (
        <div style={{ marginTop: 120, textAlign: 'center', color: '#fff', fontSize: 28, fontWeight: 700 }}>이벤트 페이지 준비중입니다.</div>
      ) : (
        // 기존 메인 UI (게임하기 등)
        <>
          {/* 기존 내기록/게임판/채팅 등 기존 UI 유지 */}
          <div className="difficulty-bar" style={{
            paddingTop: isMobile ? 64 : 72,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'center',
            width: '100%',
            gap: isMobile ? 8 : 0,
            minHeight: 56,
            minWidth: isMobile ? undefined : 1000,
            boxSizing: 'border-box',
            paddingLeft: isMobile ? 8 : 0,
            paddingRight: isMobile ? 8 : 0,
          }}>
            <div className="difficulty-center" style={{
              flex: isMobile ? undefined : '0 1 880px',
              maxWidth: isMobile ? '100%' : 880,
              minWidth: isMobile ? undefined : 880,
              display: 'flex',
              alignItems: 'center',
              gap: isMobile ? 8 : 14,
              justifyContent: 'center',
              flexWrap: isMobile ? 'wrap' : 'nowrap',
              rowGap: isMobile ? 8 : undefined,
              columnGap: isMobile ? 8 : undefined,
            }}>
              <span style={{ fontWeight: 'bold', color: '#fff', marginRight: 8, whiteSpace: 'nowrap', fontSize: isMobile ? 15 : undefined }}>난이도:</span>
              {isMobile ? (
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    <button
                      onClick={() => handleDifficultyChange('easy')}
                      style={{
                        fontWeight: difficulty === 'easy' ? 'bold' : 'normal',
                        minWidth: 48,
                        padding: '6px 10px',
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        borderRadius: 8,
                        border: difficulty === 'easy' ? '2px solid #43cea2' : '1px solid #444',
                        background: difficulty === 'easy' ? 'linear-gradient(90deg,#43cea2,#185a9d)' : '#18191c',
                        color: difficulty === 'easy' ? '#fff' : '#e0e0e0',
                        boxShadow: difficulty === 'easy' ? '0 2px 8px #43cea233' : undefined,
                        transition: 'all 0.18s',
                        cursor: 'pointer',
                      }}
                    >초급</button>
                    <button
                      onClick={() => handleDifficultyChange('normal')}
                      style={{
                        fontWeight: difficulty === 'normal' ? 'bold' : 'normal',
                        minWidth: 48,
                        padding: '6px 10px',
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        borderRadius: 8,
                        border: difficulty === 'normal' ? '2px solid #ffd200' : '1px solid #444',
                        background: difficulty === 'normal' ? 'linear-gradient(90deg,#ffd200,#f7971e)' : '#18191c',
                        color: difficulty === 'normal' ? '#23242a' : '#e0e0e0',
                        boxShadow: difficulty === 'normal' ? '0 2px 8px #ffd20033' : undefined,
                        transition: 'all 0.18s',
                        cursor: 'pointer',
                      }}
                    >중급</button>
                    <button
                      onClick={() => handleDifficultyChange('hard')}
                      style={{
                        fontWeight: difficulty === 'hard' ? 'bold' : 'normal',
                        minWidth: 48,
                        padding: '6px 10px',
                        fontSize: 15,
                        whiteSpace: 'nowrap',
                        borderRadius: 8,
                        border: difficulty === 'hard' ? '2px solid #a8c0ff' : '1px solid #444',
                        background: difficulty === 'hard' ? 'linear-gradient(90deg,#3f2b96,#a8c0ff)' : '#18191c',
                        color: difficulty === 'hard' ? '#fff' : '#e0e0e0',
                        boxShadow: difficulty === 'hard' ? '0 2px 8px #3f2b9633' : undefined,
                        transition: 'all 0.18s',
                        cursor: 'pointer',
                      }}
                    >고급</button>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ color: '#fff', whiteSpace: 'nowrap', fontSize: 15 }}>커스텀:</span>
                    <input type="number" min={5} max={40} value={customRows} onChange={e => setCustomRows(Number(e.target.value))} style={{ width: 36, minWidth: 32, padding: '4px 2px', fontSize: 15, whiteSpace: 'nowrap' }} />
                    <span style={{ color: '#fff', whiteSpace: 'nowrap', fontSize: 15 }}>x</span>
                    <input type="number" min={5} max={40} value={customCols} onChange={e => setCustomCols(Number(e.target.value))} style={{ width: 36, minWidth: 32, padding: '4px 2px', fontSize: 15, whiteSpace: 'nowrap' }} />
                    <span style={{ color: '#fff', whiteSpace: 'nowrap', fontSize: 15 }}>지뢰</span>
                    <input type="number" min={1} max={customRows * customCols - 1} value={customMines} onChange={e => setCustomMines(Number(e.target.value))} style={{ width: 40, minWidth: 32, padding: '4px 2px', fontSize: 15, whiteSpace: 'nowrap' }} />
                    <button onClick={handleCustomApply} style={{ minWidth: 36, padding: '6px 10px', fontSize: 15, whiteSpace: 'nowrap' }}>적용</button>
                  </div>
                </>
              ) : (
                // 기존 데스크탑 레이아웃
                <>
                  {/* 난이도 버튼들 */}
                  <button
                    onClick={() => handleDifficultyChange('easy')}
                    style={{
                      fontWeight: difficulty === 'easy' ? 'bold' : 'normal',
                      minWidth: 48,
                      padding: '6px 10px',
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                      borderRadius: 8,
                      border: difficulty === 'easy' ? '2px solid #43cea2' : '1px solid #444',
                      background: difficulty === 'easy' ? 'linear-gradient(90deg,#43cea2,#185a9d)' : '#18191c',
                      color: difficulty === 'easy' ? '#fff' : '#e0e0e0',
                      boxShadow: difficulty === 'easy' ? '0 2px 8px #43cea233' : undefined,
                      transition: 'all 0.18s',
                      cursor: 'pointer',
                    }}
                  >초급</button>
                  <button
                    onClick={() => handleDifficultyChange('normal')}
                    style={{
                      fontWeight: difficulty === 'normal' ? 'bold' : 'normal',
                      minWidth: 48,
                      padding: '6px 10px',
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                      borderRadius: 8,
                      border: difficulty === 'normal' ? '2px solid #ffd200' : '1px solid #444',
                      background: difficulty === 'normal' ? 'linear-gradient(90deg,#ffd200,#f7971e)' : '#18191c',
                      color: difficulty === 'normal' ? '#23242a' : '#e0e0e0',
                      boxShadow: difficulty === 'normal' ? '0 2px 8px #ffd20033' : undefined,
                      transition: 'all 0.18s',
                      cursor: 'pointer',
                    }}
                  >중급</button>
                  <button
                    onClick={() => handleDifficultyChange('hard')}
                    style={{
                      fontWeight: difficulty === 'hard' ? 'bold' : 'normal',
                      minWidth: 48,
                      padding: '6px 10px',
                      fontSize: 15,
                      whiteSpace: 'nowrap',
                      borderRadius: 8,
                      border: difficulty === 'hard' ? '2px solid #a8c0ff' : '1px solid #444',
                      background: difficulty === 'hard' ? 'linear-gradient(90deg,#3f2b96,#a8c0ff)' : '#18191c',
                      color: difficulty === 'hard' ? '#fff' : '#e0e0e0',
                      boxShadow: difficulty === 'hard' ? '0 2px 8px #3f2b9633' : undefined,
                      transition: 'all 0.18s',
                      cursor: 'pointer',
                    }}
                  >고급</button>
                  <span style={{ color: '#fff', marginLeft: 16, whiteSpace: 'nowrap', fontSize: isMobile ? 15 : undefined }}>커스텀:</span>
                  <input type="number" min={5} max={40} value={customRows} onChange={e => setCustomRows(Number(e.target.value))} style={{ width: isMobile ? 36 : 56, minWidth: 32, padding: isMobile ? '4px 2px' : '6px 4px', fontSize: isMobile ? 15 : undefined, whiteSpace: 'nowrap' }} />
                  <span style={{ color: '#fff', whiteSpace: 'nowrap', fontSize: isMobile ? 15 : undefined }}>x</span>
                  <input type="number" min={5} max={40} value={customCols} onChange={e => setCustomCols(Number(e.target.value))} style={{ width: isMobile ? 36 : 56, minWidth: 32, padding: isMobile ? '4px 2px' : '6px 4px', fontSize: isMobile ? 15 : undefined, whiteSpace: 'nowrap' }} />
                  <span style={{ color: '#fff', whiteSpace: 'nowrap', fontSize: isMobile ? 15 : undefined }}>지뢰</span>
                  <input type="number" min={1} max={customRows * customCols - 1} value={customMines} onChange={e => setCustomMines(Number(e.target.value))} style={{ width: isMobile ? 40 : 64, minWidth: 32, padding: isMobile ? '4px 2px' : '6px 4px', fontSize: isMobile ? 15 : undefined, whiteSpace: 'nowrap' }} />
                  <button onClick={handleCustomApply} style={{ minWidth: isMobile ? 36 : 48, padding: isMobile ? '6px 10px' : '8px 16px', fontSize: isMobile ? 15 : undefined, whiteSpace: 'nowrap' }}>적용</button>
                </>
              )}
            </div>
            {/* 오른쪽: 게임 상태 */}
            {!isMobile && (
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
            )}
          </div>
          {/* 메인 컨텐츠 */}
          <div className="main-content" style={{
            width: '100%',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'flex-start',
            justifyContent: 'center',
            marginTop: isMobile ? 8 : 12,
            gap: isMobile ? 12 : 0,
            boxSizing: 'border-box',
            paddingLeft: isMobile ? 8 : 0,
            paddingRight: isMobile ? 8 : 0,
          }}>
            {/* 모바일: 내기록/채팅 탭 전환 + 게임판 */}
            {isMobile ? (
              <>
                {/* 게임 상태(난이도/시간/다시하기) - 모바일 */}
                <div style={{
                  width: '100%',
                  maxWidth: 400,
                  margin: '0 auto 8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(35,36,42,0.95)',
                  borderRadius: 10,
                  padding: '8px 14px',
                  fontSize: 15,
                  color: '#fff',
                  fontWeight: 700,
                  boxShadow: '0 2px 8px #0002',
                }}>
                  <span>난이도: {(
                    difficulty === 'easy' ? '초급' :
                    difficulty === 'normal' ? '중급' :
                    difficulty === 'hard' ? '고급' :
                    '커스텀')}</span>
                  <span>시간: {formatTime(elapsed)}</span>
                  <button onClick={() => openConfirm('정말 다시 시작하시겠습니까?', resetGame)}
                    style={{
                      marginLeft: 8,
                      padding: '6px 14px',
                      fontWeight: 600,
                      borderRadius: 8,
                      border: '1px solid #646cff',
                      background: '#646cff',
                      color: '#fff',
                      fontSize: 14,
                      minWidth: 60,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px #3f2b9633',
                      transition: 'all 0.18s',
                    }}
                  >다시하기</button>
                </div>
                {/* 게임판은 항상 위에 고정 */}
                <div className="game-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', marginBottom: 8 }}>
                  <div style={{
                    width: '95vw',
                    maxWidth: 500,
                    aspectRatio: '1/1',
                    background: '#222',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    border: '2px solid #888',
                    margin: '0 auto 16px',
                  }}>
                    <MinesweeperBoard
                      board={board}
                      onCellClick={handleCellClickWithTimer}
                      onCellRightClick={handleCellRightClick}
                      pressedCells={pressedCells}
                      onCellMouseDown={handleCellMouseDown}
                      onCellMouseUp={handleCellMouseUp}
                      onCellMouseLeave={handleCellMouseLeave}
                      cellSize={Math.floor(Math.min(Math.min(window.innerWidth * 0.95, 500) / cols, Math.min(window.innerWidth * 0.95, 500) / rows))}
                    />
                  </div>
                </div>
                {/* 내기록/채팅 토글 버튼 (중간 배치) */}
                <div style={{ width: '100%', maxWidth: 400, margin: '0 auto 8px', display: 'flex' }}>
                  <button onClick={() => setMobileTab('record')} style={{
                    flex: 1,
                    padding: '10px 0',
                    fontWeight: mobileTab === 'record' ? 700 : 400,
                    background: mobileTab === 'record'
                      ? 'linear-gradient(90deg,#43cea2,#185a9d)'
                      : '#23242a',
                    color: mobileTab === 'record' ? '#fff' : '#bbb',
                    border: 'none',
                    borderRadius: '10px 0 0 10px',
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    boxShadow: mobileTab === 'record' ? '0 2px 8px #43cea233' : undefined,
                  }}>내 기록</button>
                  <button onClick={() => setMobileTab('chat')} style={{
                    flex: 1,
                    padding: '10px 0',
                    fontWeight: mobileTab === 'chat' ? 700 : 400,
                    background: mobileTab === 'chat'
                      ? 'linear-gradient(90deg,#ffd200,#f7971e)'
                      : '#23242a',
                    color: mobileTab === 'chat' ? '#fff' : '#bbb',
                    border: 'none',
                    borderRadius: '0 10px 10px 0',
                    fontSize: 16,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                    boxShadow: mobileTab === 'chat' ? '0 2px 8px #ffd20033' : undefined,
                  }}>채팅</button>
                </div>
                {/* 내기록/채팅을 감싸는 공통 div */}
                <div className="panel-container" style={{ width: '100%', maxWidth: 400, margin: '0 auto', marginBottom: 8, background: '#23242a', borderRadius: 12, minHeight: 200, padding: 12 }}>
                  {mobileTab === 'record' ? (
                    <>
                      <div style={{ textAlign: 'left', fontWeight: 700, fontSize: 20, color: '#fff', marginBottom: 8 }}>내 기록</div>
                      <RankingPanel records={records} difficulty={difficulty} history={history} rankings={rankings} user={user} hideTitle />
                    </>
                  ) : (
                    user && <Chat user={user} />
                  )}
                </div>
              </>
            ) : (
              <>
                {/* 데스크탑: 내기록, 게임판, 채팅 가로 배치 */}
                <div className="ranking-panel">
                  <RankingPanel records={records} difficulty={difficulty} history={history} rankings={rankings} user={user} />
                </div>
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
                {user && <Chat user={user} />}
              </>
            )}
          </div>
        </>
      )}

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
      {page !== 'users' && <Footer />}
    </div>
  );
}

export default App;
