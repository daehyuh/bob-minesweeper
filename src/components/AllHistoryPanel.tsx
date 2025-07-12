import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const d = new Date(dateString);
  return d.toLocaleString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

const difficultyMap: Record<string, string> = {
  easy: '초급',
  normal: '중급',
  hard: '고급',
  custom: '커스텀',
};

const AllHistoryPanel: React.FC = () => {
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllRecords = async () => {
      setLoading(true);
      const { data } = await supabase
        .from('records')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      setRecords(data || []);
      setLoading(false);
    };
    fetchAllRecords();
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', background: '#23242a', borderRadius: 16, color: '#fff', padding: 24, boxShadow: '0 2px 16px #0002' }}>
      <h2 style={{ fontSize: 26, fontWeight: 900, marginBottom: 24, textAlign: 'center' }}>모든 유저 전적</h2>
      {loading ? <div style={{ textAlign: 'center', color: '#aaa' }}>로딩중...</div> : (
        <div style={{ maxHeight: 600, overflowY: 'auto', borderRadius: 10, border: '1px solid #333', boxShadow: '0 1px 8px #0002' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 600 }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 1, background: '#18191c' }}>
              <tr style={{ color: '#ffd200', fontWeight: 700, fontSize: 17 }}>
                <th style={{ padding: '12px 8px', textAlign: 'left', borderBottom: '2px solid #444', position: 'sticky', top: 0, background: '#18191c' }}>닉네임</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #444', position: 'sticky', top: 0, background: '#18191c' }}>날짜</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #444', position: 'sticky', top: 0, background: '#18191c' }}>난이도</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #444', position: 'sticky', top: 0, background: '#18191c' }}>시간(초)</th>
                <th style={{ padding: '12px 8px', textAlign: 'center', borderBottom: '2px solid #444', position: 'sticky', top: 0, background: '#18191c' }}>결과</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r, i) => (
                <tr
                  key={r.id || i}
                  style={{
                    background: i % 2 === 0 ? '#23242a' : '#20212a',
                    transition: 'background 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseOver={e => (e.currentTarget.style.background = '#2d2e38')}
                  onMouseOut={e => (e.currentTarget.style.background = i % 2 === 0 ? '#23242a' : '#20212a')}
                >
                  <td style={{ padding: '10px 8px', fontWeight: 600 }}>{r.username || r.nickname || '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center', fontVariantNumeric: 'tabular-nums' }}>{formatDate(r.created_at)}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{difficultyMap[r.difficulty] || r.difficulty || '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>{r.time ?? '-'}</td>
                  <td style={{ padding: '10px 8px', textAlign: 'center' }}>
                    {r.result === '성공' || r.result === 'win' ? (
                      <span style={{ color: '#43cea2', fontWeight: 700 }}>성공</span>
                    ) : (
                      <span style={{ color: '#ff6e6e', fontWeight: 700 }}>실패</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllHistoryPanel; 