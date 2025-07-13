import React from 'react';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  return (
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
      <div style={{ display: 'flex', flexDirection: 'row', gap: 18, justifyContent: 'center', marginBottom: 4 }}>
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#ffd200', textDecoration: 'underline', fontWeight: 700, fontSize: 15 }}
        >
          개인정보처리방침
        </a>
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#ffd200', textDecoration: 'underline', fontWeight: 700, fontSize: 15 }}
        >
          이용약관
        </a>
      </div>
      <div style={{ color: '#bbb', fontSize: 13, fontWeight: 400, textAlign: 'center' }}>
        © {year} BOB MINESWEEPER. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer; 