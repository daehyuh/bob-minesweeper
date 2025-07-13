import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';

const Home: React.FC = () => {
  const [user, setUser] = useState<any>(null);
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
  if (user) {
    navigate('/game');
    return null;
  }
  return (
    <div style={{ minHeight: '100vh', background: '#23242a', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <h1 style={{ fontSize: 44, fontWeight: 900, marginBottom: 24, letterSpacing: 2 }}>BOB MINESWEEPER</h1>
      <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 32, color: '#ffd200' }}>지뢰찾기 실력으로 경쟁하고, 기록을 남기세요!</h2>
      <ul style={{ fontSize: 18, marginBottom: 32, lineHeight: 1.7, color: '#e0e0e0', maxWidth: 600 }}>
        <li>실시간 랭킹, 클리어 기록, 유저 히스토리 제공</li>
        <li>로그인 후 게임 기록이 저장되고, 랭킹에 반영됩니다</li>
        <li>채팅으로 다른 유저와 소통 가능</li>
        <li>초/중/고급 및 커스텀 난이도 지원</li>
      </ul>
      <button onClick={() => navigate('/auth')} style={{ fontSize: 22, fontWeight: 700, padding: '16px 48px', borderRadius: 12, background: 'linear-gradient(90deg,#3f2b96,#a8c0ff)', color: '#fff', border: 'none', boxShadow: '0 2px 8px #3f2b9633', cursor: 'pointer', marginBottom: 16 }}>로그인 / 회원가입</button>
    </div>
  );
};

export default Home; 