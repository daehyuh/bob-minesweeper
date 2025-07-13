import React from 'react';

const Footer: React.FC = () => (
  <footer
    style={{
      width: '100vw',
      position: 'relative',
      minHeight: 70,
      background: 'linear-gradient(90deg,#2d2e38 0%,#444950 100%)',
      color: '#f5f5f5',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: 17,
      boxShadow: '0 -2px 12px #0003',
      borderTopLeftRadius: 18,
      borderTopRightRadius: 18,
      marginTop: 32,
      padding: '14px 8px',
      letterSpacing: 0.5,
      gap: 6,
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}
  >
    <div style={{ fontWeight: 800, fontSize: 18, color: '#ffd200', marginBottom: 2 }}>
      만든사람 : Best of the Best 14기 보안제품개발 트랙 강대현
    </div>
    <div style={{ color: '#e0e0e0', fontWeight: 600, fontSize: 16, marginBottom: 2 }}>
      BOB 친구 구해요..! 개발 좋아하는 ENFJ 04년생입니당
    </div>
    <div style={{ display: 'flex', flexDirection: 'row', gap: 18, marginTop: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
      <a
        href="https://discord.com/users/612570016109559808"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#7289da', textDecoration: 'underline', fontWeight: 700, fontSize: 16 }}
      >
        디스코드: @daehyuh
      </a>
      <a
        href="https://www.instagram.com/daehyuh_"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#e1306c', textDecoration: 'underline', fontWeight: 700, fontSize: 16 }}
      >
        인스타그램: @daehyuh_
      </a>
      <a
        href="https://github.com/daehyuh"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#a8c0ff', textDecoration: 'underline', fontWeight: 700, fontSize: 16 }}
      >
        깃허브: daehyuh
      </a>
      <a
        href="https://www.linkedin.com/in/daehyuh/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: '#43cea2', textDecoration: 'underline', fontWeight: 700, fontSize: 16 }}
      >
        링크드인: daehyuh
      </a>
    </div>
  </footer>
);

export default Footer; 