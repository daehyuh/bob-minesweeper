import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import ServiceHeaderBar from './ServiceHeaderBar';
import Footer from './Footer';

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
        if (window.location.pathname === '/') {
          window.location.reload();
        } else {
          navigate('/');
        }
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
    // navigate('/game');
    // return null;
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
            filter: 'blur(1px) brightness(0.5)',
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
      <div
        style={{
          minHeight: 'calc(100vh - 120px)', // 푸터 높이 고려
          background: 'transparent',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 32,
          position: 'relative',
          zIndex: 1,
          boxSizing: 'border-box',
        }}
      >
        <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 24, letterSpacing: 2, textAlign: 'center' }}>BOB MINESWEEPER</h1>
        <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 18, color: '#ffd200', textAlign: 'center' }}>지뢰찾기 실력으로 경쟁하고, 기록을 남기세요!</h2>
        {userCount !== null && (
          <div style={{ fontSize: 20, fontWeight: 700, color: '#43cea2', marginBottom: 14, textAlign: 'center' }}>
            벌써 {userCount}명이 함께 즐기고 있어요!
          </div>
        )}
        <ul style={{ fontSize: 18, marginBottom: 32, lineHeight: 1.7, color: '#e0e0e0', maxWidth: 600, textAlign: 'left' }}>
          <li>실시간 랭킹, 클리어 기록, 유저 히스토리 제공</li>
          <li>로그인 후 게임 기록이 저장되고, 랭킹에 반영됩니다</li>
          <li>채팅으로 다른 유저와 소통 가능</li>
          <li>초/중/고급 및 커스텀 난이도 지원</li>
        </ul>
        {user ? (
          <button onClick={() => navigate('/game')} style={{ fontSize: 22, fontWeight: 700, padding: '16px 48px', borderRadius: 12, background: 'linear-gradient(90deg,#3f2b96,#a8c0ff)', color: '#fff', border: 'none', boxShadow: '0 2px 8px #3f2b9633', cursor: 'pointer', marginBottom: 16 }}>게임하기</button>
        ) : (
          <button onClick={() => navigate('/auth')} style={{ fontSize: 22, fontWeight: 700, padding: '16px 48px', borderRadius: 12, background: 'linear-gradient(90deg,#3f2b96,#a8c0ff)', color: '#fff', border: 'none', boxShadow: '0 2px 8px #3f2b9633', cursor: 'pointer', marginBottom: 16 }}>로그인 / 회원가입</button>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Home; 