import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import Footer from './Footer';
import { Link } from 'react-router-dom';

// 미니 헤더: 게임창과 동일한 스타일, 메인 탭만
const HomeHeader: React.FC = () => (
  <header style={{
    width: '100vw',
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
    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
      <span style={{ fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: 2, marginRight: 32, paddingLeft: 32 }}>BOB MINESWEEPER</span>
      <Link to="/game" style={{ textDecoration: 'none' }}>
        <button
          style={{
            background: 'linear-gradient(90deg,#a8c0ff,#3f2b96)',
            color: '#fff',
            border: 'none',
            borderRadius: 10,
            fontWeight: 800,
            fontSize: 18,
            padding: '10px 28px',
            cursor: 'pointer',
            boxShadow: '0 2px 8px #3f2b9633',
            transition: 'all 0.18s',
          }}
          aria-label="게임하기"
        >게임하기</button>
      </Link>
    </div>
  </header>
);

const ServiceHeaderBar = ({ tab, onTabChange, user, onLoginClick, onLogoutClick }: { tab: string, onTabChange: (tab: string) => void, user: any, onLoginClick: () => void, onLogoutClick: () => void }) => (
  <header style={{
    width: '100vw',
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
        onClick={() => onTabChange('home')}
        style={{
          background: tab === 'home' ? 'linear-gradient(90deg,#ffd200,#43cea2)' : 'transparent',
          color: tab === 'home' ? '#23242a' : '#e0e0e0',
          border: 'none',
          borderRadius: 10,
          fontWeight: tab === 'home' ? 800 : 500,
          fontSize: 18,
          padding: '10px 28px',
          cursor: 'pointer',
          boxShadow: tab === 'home' ? '0 2px 8px #ffd20033' : undefined,
          transition: 'all 0.18s',
        }}
        aria-label="홈"
      >홈</button>
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
        aria-label="게임하기"
      >게임하기</button>
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
        aria-label="랭킹"
      >랭킹</button>
      <button
        onClick={() => onTabChange('history')}
        style={{
          background: tab === 'history' ? 'linear-gradient(90deg,#ffd200,#ff6e6e)' : 'transparent',
          color: tab === 'history' ? '#23242a' : '#e0e0e0',
          border: 'none',
          borderRadius: 10,
          fontWeight: tab === 'history' ? 800 : 500,
          fontSize: 18,
          padding: '10px 28px',
          cursor: 'pointer',
          boxShadow: tab === 'history' ? '0 2px 8px #ffd20033' : undefined,
          transition: 'all 0.18s',
        }}
        aria-label="히스토리"
      >히스토리</button>
      <button
        onClick={() => onTabChange('users')}
        style={{
          background: tab === 'users' ? 'linear-gradient(90deg,#00c3ff,#ffff1c)' : 'transparent',
          color: tab === 'users' ? '#23242a' : '#e0e0e0',
          border: 'none',
          borderRadius: 10,
          fontWeight: tab === 'users' ? 800 : 500,
          fontSize: 18,
          padding: '10px 28px',
          cursor: 'pointer',
          boxShadow: tab === 'users' ? '0 2px 8px #00c3ff33' : undefined,
          transition: 'all 0.18s',
        }}
        aria-label="유저"
      >유저</button>
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
    {/* 오른쪽: 로그인/회원가입/로그아웃 */}
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginLeft: 'auto', paddingRight: 32 }}>
      {user && (
        <span style={{ color: '#ffd200', fontWeight: 700, fontSize: 17, marginRight: 8 }}>
          사용자 : {user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '익명')}
        </span>
      )}
      {user ? (
        <button
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'linear-gradient(90deg,#ff6e6e,#ffb199)',
            color: '#fff',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 17,
            padding: '9px 24px',
            minWidth: 110,
            height: 44,
            cursor: 'pointer',
            boxShadow: '0 2px 8px #ff6e6e33',
            transition: 'all 0.18s',
            letterSpacing: 1,
            position: 'relative',
          }}
          onClick={onLogoutClick}
          aria-label="로그아웃"
        >
          <span style={{ fontSize: 20, opacity: 0.85 }}>🚪</span>
          로그아웃
        </button>
      ) : (
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
          onClick={onLoginClick}
          aria-label="로그인/회원가입"
        >
          <span style={{ fontSize: 20, opacity: 0.85 }}>🔑</span>
          로그인/회원가입
        </button>
      )}
    </div>
  </header>
);

const Home: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [userCount, setUserCount] = useState<number | null>(null);
  const [tab, setTab] = useState<string>('home');
  const navigate = useNavigate();
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  useEffect(() => {
    // 유저 수 조회
    (async () => {
      const { count } = await supabase.from('users').select('id', { count: 'exact', head: true });
      if (typeof count === 'number') setUserCount(count);
    })();
  }, []);

  const handleTabChange = (nextTab: string) => {
    setTab(nextTab);
    switch (nextTab) {
      case 'home':
        navigate('/');
        break;
      case 'practice':
        navigate('/game');
        break;
      case 'challenge':
        navigate('/game');
        break;
      case 'history':
        navigate('/history');
        break;
      case 'users':
        navigate('/users');
        break;
      case 'event':
        navigate('/event');
        break;
      default:
        break;
    }
  };
  const handleLoginClick = () => navigate('/auth');
  const handleLogoutClick = async () => {
    await supabase.auth.signOut();
    setUser(null);
    navigate('/');
  };

  if (user) {
    navigate('/game');
    return null;
  }
  return (
    <>
      <ServiceHeaderBar
        tab={tab}
        onTabChange={handleTabChange}
        user={user}
        onLoginClick={handleLoginClick}
        onLogoutClick={handleLogoutClick}
      />
      {/* 비디오 백그라운드 + 오버레이 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
      }}>
        <video
          src="/video.mov"
          autoPlay
          loop
          muted
          playsInline
          style={{
            width: '100vw',
            height: '100vh',
            objectFit: 'cover',
            filter: 'blur(16px) brightness(0.5)',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
        {/* 어두운 오버레이 */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(20,20,30,0.55)',
        }} />
      </div>
      {/* 메인 컨텐츠 */}
      <div style={{ minHeight: '100vh', background: 'transparent', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative', zIndex: 1 }}>
        <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 24, letterSpacing: 2 }}>BOB MINESWEEPER</h1>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 18, color: '#ffd200' }}>지뢰찾기 실력으로 경쟁하고, 기록을 남기세요!</h2>
        {userCount !== null && (
          <div style={{ fontSize: 20, fontWeight: 700, color: '#43cea2', marginBottom: 14 }}>
            벌써 {userCount}명이 함께 즐기고 있어요!
          </div>
        )}
        <ul style={{ fontSize: 18, marginBottom: 32, lineHeight: 1.7, color: '#e0e0e0', maxWidth: 600 }}>
          <li>실시간 랭킹, 클리어 기록, 유저 히스토리 제공</li>
          <li>로그인 후 게임 기록이 저장되고, 랭킹에 반영됩니다</li>
          <li>채팅으로 다른 유저와 소통 가능</li>
          <li>초/중/고급 및 커스텀 난이도 지원</li>
        </ul>
        <button onClick={() => navigate('/auth')} style={{ fontSize: 22, fontWeight: 700, padding: '16px 48px', borderRadius: 12, background: 'linear-gradient(90deg,#3f2b96,#a8c0ff)', color: '#fff', border: 'none', boxShadow: '0 2px 8px #3f2b9633', cursor: 'pointer', marginBottom: 16 }}>로그인 / 회원가입</button>
      </div>
      <Footer />
    </>
  );
};

export default Home; 