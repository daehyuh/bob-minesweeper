import React, { useState } from 'react';
import { supabase } from '../supabase';

const LoginSignup: React.FC<{ onAuthSuccess?: () => void }> = ({ onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [agree, setAgree] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'login') {
        // 로그인: 이메일+비밀번호
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        setSuccessMessage('로그인 성공!');
        if (onAuthSuccess) onAuthSuccess();
      } else {
        // 회원가입: 이메일+이름+비밀번호
        // 닉네임 중복 체크
        const { data: existingUsers, error: nicknameError } = await supabase
          .from('users')
          .select('id')
          .eq('name', name);
        if (nicknameError) throw nicknameError;
        if (existingUsers && existingUsers.length > 0) {
          setError('이미 사용 중인 닉네임입니다.');
          setLoading(false);
          return;
        }
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name },
          },
        });
        if (signUpError) throw signUpError;
        // 회원가입 성공 시 users 테이블에도 저장 (nickname만 저장)
        if (data.user) {
          await supabase.from('users').insert({
            id: data.user.id,
            name: name,
            created_at: new Date(),
          });
        }
        // 회원가입 후 바로 로그인 시도
        const { error: loginError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (loginError) throw loginError;
        setSuccessMessage('회원가입 및 로그인 성공!');
        if (onAuthSuccess) onAuthSuccess();
      }
      setLoading(false);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (err: any) {
      setError(err.message || '오류가 발생했습니다.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(20, 20, 30, 0.75)',
      zIndex: 3000,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      pointerEvents: 'auto',
    }}>
      {successMessage && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 0,
          width: '100%',
          textAlign: 'center',
          zIndex: 4000,
        }}>
          <div style={{
            display: 'inline-block',
            background: '#43cea2',
            color: '#222',
            padding: '10px 24px',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 18,
            boxShadow: '0 2px 8px #0003',
          }}>
            {successMessage}
          </div>
        </div>
      )}
      <div style={{ maxWidth: 340, background: '#23242a', borderRadius: 12, boxShadow: '0 2px 8px #0004', padding: 32, color: '#fff', width: '100%', margin: '0 auto' }}>
        <div style={{
          background: '#ffd200',
          color: '#222',
          borderRadius: 8,
          padding: '10px 16px',
          fontWeight: 700,
          fontSize: 15,
          marginBottom: 18,
          textAlign: 'center',
        }}>
          PC 전체화면에서 즐겨주세요.<br />이메일은 막써도 됩니다
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>{mode === 'login' ? '로그인' : '회원가입'}</h2>
        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: '#ffd200', marginTop: 4, marginLeft: 2 }}>
                *슈파베이스 표준때문에 어쩔수없이 이메일 요구
              </div>
              <input
                type="text"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #444', background: '#18191c', color: '#e0e0e0', fontSize: 16 }}
              />
            </div>
          )}
          {mode === 'signup' && (
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="닉네임"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #444', background: '#18191c', color: '#e0e0e0', fontSize: 16 }}
              />
            </div>
          )}
          {mode === 'login' && (
            <div style={{ marginBottom: 16 }}>
              <input
                type="text"
                placeholder="이메일"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #444', background: '#18191c', color: '#e0e0e0', fontSize: 16 }}
              />
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 10, borderRadius: 6, border: '1px solid #444', background: '#18191c', color: '#e0e0e0', fontSize: 16 }}
            />
          </div>
          {mode === 'signup' && (
            <label style={{ display: 'block', margin: '12px 0' }}>
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                required
              />
              <span style={{ marginLeft: 8 }}>
                <a href="/terms" target="_blank" rel="noopener noreferrer">이용약관</a> 및
                <a href="/privacy" target="_blank" rel="noopener noreferrer"> 개인정보처리방침</a>에 동의합니다.
              </span>
            </label>
          )}
          {error && <div style={{ color: '#ff6e6e', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
          <button type="submit" disabled={loading || (mode === 'signup' && !agree)} style={{ width: '100%', padding: 12, borderRadius: 8, background: '#646cff', color: '#fff', fontWeight: 700, fontSize: 17, border: 'none', cursor: 'pointer', marginBottom: 10 }}>
            {loading ? '처리중...' : mode === 'login' ? '로그인' : '회원가입'}
          </button>
        </form>
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          {mode === 'login' ? (
            <span>계정이 없으신가요?{' '}
              <button onClick={() => { setMode('signup'); setError(null); setSuccessMessage(null); }} style={{ color: '#43cea2', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>회원가입</button>
            </span>
          ) : (
            <span>이미 계정이 있으신가요?{' '}
              <button onClick={() => { setMode('login'); setError(null); setSuccessMessage(null); }} style={{ color: '#a8c0ff', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700 }}>로그인</button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginSignup; 