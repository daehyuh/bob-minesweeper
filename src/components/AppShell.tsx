import React from 'react';
import ServiceHeaderBar from './ServiceHeaderBar';
import Footer from './Footer';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from '../supabase';

const AppShell = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  let tab: string = 'home';
  if (location.pathname.startsWith('/game')) tab = 'practice';
  else if (location.pathname.startsWith('/rank')) tab = 'challenge';
  else if (location.pathname.startsWith('/history')) tab = 'history';
  else if (location.pathname.startsWith('/users')) tab = 'users';
  else if (location.pathname.startsWith('/developer')) tab = 'developer';

  const handleTabChange = (nextTab: string) => {
    switch (nextTab) {
      case 'home': navigate('/'); break;
      case 'practice': navigate('/game'); break;
      case 'challenge': navigate('/rank'); break;
      case 'history': navigate('/history'); break;
      case 'users': navigate('/users'); break;
      case 'developer':
        if (tab === 'developer') break; // 이미 개발자 페이지면 아무 동작 안 함
        if (user) navigate('/developer');
        else navigate('/auth');
        break;
      default: navigate('/'); break;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#222', padding: 0, margin: 0 }}>
      <ServiceHeaderBar tab={tab} onTabChange={handleTabChange} user={user} onLoginClick={() => {}} onLogoutClick={() => {}} />
      <div style={{ paddingTop: 72, minHeight: 'calc(100vh - 140px)' }}>
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default AppShell; 