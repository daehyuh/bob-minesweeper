import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import LoginSignup from './components/LoginSignup';
import Home from './components/Home';
import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { ReactNode } from 'react';
import Terms from './components/Terms';
import Privacy from './components/Privacy';

function RequireAuth({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (user === undefined) return null; // 로딩 중
  if (!user) return <Navigate to="/auth" replace />;
  return children;
}

function AppWithAuthRoutes() {
  const navigate = useNavigate();
  const handleAuthSuccess = () => {
    navigate('/game');
  };
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/game" element={<RequireAuth><App page="practice" /></RequireAuth>} />
      <Route path="/rank" element={<RequireAuth><App page="challenge" /></RequireAuth>} />
      <Route path="/history" element={<RequireAuth><App page="history" /></RequireAuth>} />
      <Route path="/event" element={<RequireAuth><App page="event" /></RequireAuth>} />
      <Route path="/users" element={<RequireAuth><App page="users" /></RequireAuth>} />
      <Route path="/auth" element={<LoginSignup onAuthSuccess={handleAuthSuccess} />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AppWithAuthRoutes />
    </BrowserRouter>
  </StrictMode>,
)
