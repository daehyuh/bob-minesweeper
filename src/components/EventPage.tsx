import React from 'react';

const EventPage: React.FC = () => (
  <div
    style={{
      marginTop: 120,
      textAlign: 'center',
      color: '#fff',
      fontSize: 28,
      fontWeight: 700,
      padding: '0 16px',
      wordBreak: 'keep-all',
      lineHeight: 1.4,
      boxSizing: 'border-box',
    }}
  >
    <span
      style={{
        display: 'inline-block',
        maxWidth: 480,
        width: '100%',
      }}
    >
      이벤트 페이지 준비중입니다.
    </span>
    <style>{`
      @media (max-width: 600px) {
        div[style*='margin-top: 120px'] {
          margin-top: 60px !important;
          font-size: 19px !important;
          padding: 0 6px !important;
        }
      }
    `}</style>
  </div>
);

export default EventPage; 