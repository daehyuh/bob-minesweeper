import React from 'react';

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ open, message, onConfirm, onCancel, confirmText = '확인' }) => {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '32px 24px',
        minWidth: 320,
        boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <div style={{ marginBottom: 24, fontSize: 18, color: '#222', textAlign: 'center' }}
          dangerouslySetInnerHTML={{ __html: message }}
        />
        <div style={{ display: 'flex', gap: 16 }}>
          <button onClick={onCancel} style={{ padding: '8px 24px', borderRadius: 8, border: '1px solid #bbb', background: '#eee', color: '#333', fontWeight: 500, cursor: 'pointer' }}>취소</button>
          <button onClick={onConfirm} style={{ padding: '8px 24px', borderRadius: 8, border: '1px solid #646cff', background: '#646cff', color: '#fff', fontWeight: 700, cursor: 'pointer' }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal; 