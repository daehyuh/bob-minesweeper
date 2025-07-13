import React, { useState, useEffect } from 'react';

// DrawerMenu: 모바일에서만 보이는 사이드 메뉴
const DrawerMenu = ({ open, onClose, tab, onTabChange, user, onLoginClick, onLogoutClick }: {
  open: boolean,
  onClose: () => void,
  tab: string,
  onTabChange: (tab: string) => void,
  user: any,
  onLoginClick: () => void,
  onLogoutClick: () => void,
}) => (
  <>
    {/* 오버레이 */}
    <div
      onClick={onClose}
      style={{
        display: open ? 'block' : 'none',
        position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
        background: 'rgba(0,0,0,0.35)', zIndex: 3000,
        transition: 'opacity 0.2s',
      }}
    />
    {/* 드로어 */}
    <nav
      style={{
        position: 'fixed', top: 0, left: 0, height: '100vh', width: 260,
        background: 'linear-gradient(180deg,#23242a 0%,#3f2b96 100%)',
        boxShadow: '2px 0 12px #0004',
        zIndex: 4000,
        transform: open ? 'translateX(0)' : 'translateX(-110%)',
        transition: 'transform 0.22s cubic-bezier(.4,1.2,.4,1)',
        display: 'flex', flexDirection: 'column',
        padding: '32px 0 0 0',
      }}
      aria-label="모바일 메뉴"
    >
      <button onClick={() => {onTabChange(''); onClose();}} style={{ alignSelf: 'flex-end', marginRight: 18, marginBottom: 18, background: 'none', border: 'none', color: '#fff', fontSize: 28, cursor: 'pointer' }} aria-label="닫기">×</button>
      <button onClick={() => { onTabChange('home'); onClose(); }} style={{ background: tab === 'home' ? '#ffd200' : 'transparent', color: tab === 'home' ? '#23242a' : '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 24px', margin: '4px 16px', textAlign: 'left', cursor: 'pointer' }}>홈</button>
      <button onClick={() => { onTabChange('practice'); onClose(); }} style={{ background: tab === 'practice' ? '#a8c0ff' : 'transparent', color: tab === 'practice' ? '#23242a' : '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 24px', margin: '4px 16px', textAlign: 'left', cursor: 'pointer' }}>게임하기</button>
      <button onClick={() => { onTabChange('challenge'); onClose(); }} style={{ background: tab === 'challenge' ? '#ffd200' : 'transparent', color: tab === 'challenge' ? '#23242a' : '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 24px', margin: '4px 16px', textAlign: 'left', cursor: 'pointer' }}>랭킹</button>
      <button onClick={() => { onTabChange('history'); onClose(); }} style={{ background: tab === 'history' ? '#ff6e6e' : 'transparent', color: tab === 'history' ? '#23242a' : '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 24px', margin: '4px 16px', textAlign: 'left', cursor: 'pointer' }}>히스토리</button>
      <button onClick={() => { onTabChange('users'); onClose(); }} style={{ background: tab === 'users' ? '#ffff1c' : 'transparent', color: tab === 'users' ? '#23242a' : '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 24px', margin: '4px 16px', textAlign: 'left', cursor: 'pointer' }}>유저</button>
      <button onClick={() => { onTabChange('event'); onClose(); }} style={{ background: tab === 'event' ? '#43cea2' : 'transparent', color: tab === 'event' ? '#23242a' : '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 8, padding: '12px 24px', margin: '4px 16px', textAlign: 'left', cursor: 'pointer' }}>이벤트</button>
      <div style={{ flex: 1 }} />
      {user ? (
        <button onClick={() => { onLogoutClick(); onClose(); }} style={{ background: 'linear-gradient(90deg,#ff6e6e,#ffb199)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 18, padding: '12px 24px', margin: '16px', cursor: 'pointer' }}>로그아웃</button>
      ) : (
        <button onClick={() => { onLoginClick(); onClose(); }} style={{ background: 'linear-gradient(90deg,#3f2b96,#a8c0ff)', color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, fontSize: 18, padding: '12px 24px', margin: '16px', cursor: 'pointer' }}>로그인/회원가입</button>
      )}
    </nav>
  </>
);

const ServiceHeaderBar = ({ tab, onTabChange, user, onLoginClick, onLogoutClick }: { tab: string, onTabChange: (tab: string) => void, user: any, onLoginClick: () => void, onLogoutClick: () => void }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  // 모바일 여부 감지 (width 1200px 이하)
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 1200);
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return (
    <header style={{
      width: '100vw',
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
      {/* 모바일: 햄버거 버튼 */}
      {isMobile && (
        <button onClick={() => setDrawerOpen(true)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 32, marginLeft: 18, marginRight: 10, cursor: 'pointer' }} aria-label="메뉴 열기">☰</button>
      )}
      {/* 로고 */}
      <span style={{ fontWeight: 900, fontSize: 26, color: '#fff', letterSpacing: 2, marginRight: 32, paddingLeft: isMobile ? 0 : 32 }}>BOB MINESWEEPER</span>
      {/* 데스크탑: 탭 버튼 */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
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
      )}
      {/* 오른쪽: 로그인/로그아웃 */}
      {!isMobile && (
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
      )}
      {/* 모바일: 드로어 메뉴 */}
      {isMobile && (
        <DrawerMenu
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          tab={tab}
          onTabChange={onTabChange}
          user={user}
          onLoginClick={onLoginClick}
          onLogoutClick={onLogoutClick}
        />
      )}
    </header>
  );
};

export default ServiceHeaderBar; 