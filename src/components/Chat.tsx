import React, { useEffect, useRef, useState } from 'react';
import { supabase } from '../supabase';

interface ChatMessage {
  id: string;
  user_id: string;
  username: string;
  message: string;
  created_at: string;
}

interface User {
  id: string;
  user_metadata?: { name?: string };
  email?: string;
}

const Chat: React.FC<{ user: User | null }> = ({ user }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 메시지 불러오기 (폴링 방식)
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);
      if (!error && data) {
        setMessages(data.reverse());
      }
    };
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000); // 2초마다 새로고침
    return () => clearInterval(interval);
  }, []);

  // 스크롤 하단 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !input.trim()) return;
    setSending(true);
    const username = user.user_metadata?.name || (user.email ? user.email.split('@')[0] : '익명');
    await supabase.from('messages').insert({
      user_id: user.id,
      username,
      message: input.trim(),
      created_at: new Date().toISOString(),
    });
    setInput('');
    setSending(false);
    inputRef.current?.focus();
  };

  return (
    <div style={{
      width: 260,
      height: 400,
      background: '#23242a',
      borderRadius: 12,
      boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
      padding: 16,
      marginLeft: 24,
      display: 'flex',
      flexDirection: 'column',
      fontSize: 15,
      color: '#e0e0e0'
    }}>
      <div style={{ fontWeight: 700, fontSize: 20, marginBottom: 12, color: '#fff' }}>채팅</div>
      <div style={{
        flex: 1,
        minHeight: 0,
        overflowY: 'auto',
        marginBottom: 8
      }}>
        {messages.length === 0 && <div style={{ color: '#888', padding: '8px 0' }}>채팅 메시지 없음</div>}
        {messages.map((msg) => (
          <div key={msg.id} style={{ marginBottom: 6, wordBreak: 'break-all', color: msg.user_id === user?.id ? '#a8ff60' : '#e0e0e0' }}>
            <span style={{ fontWeight: 700 }}>{msg.user_id === user?.id ? '나' : msg.username || msg.user_id.slice(0, 6)}</span>: {msg.message}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} style={{ display: 'flex', gap: 4, height: 36 }}>
        <input
          type="text"
          placeholder="메시지 입력..."
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, borderRadius: 6, border: '1px solid #444', background: '#18191c', color: '#e0e0e0', padding: 6, fontSize: 15 }}
          disabled={sending || !user}
          ref={inputRef}
        />
        <button type="submit" disabled={sending || !input.trim() || !user} style={{ borderRadius: 6, background: '#646cff', color: '#fff', border: 'none', padding: '6px 12px', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>전송</button>
      </form>
    </div>
  );
};

export default Chat; 