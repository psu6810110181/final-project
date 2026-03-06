import React, { useEffect, useState } from 'react';

interface ConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

const Confirm: React.FC<ConfirmProps> = ({ 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = 'ตกลง',
  cancelText = 'ยกเลิก',
  type = 'danger'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const colors = {
    danger: {
      bg: '#FEF2F2',
      border: '#EF4444',
      text: '#991B1B',
      icon: '⚠️',
      bgLight: '#FEF2F2',
      confirmBg: '#EF4444',
      confirmHover: '#DC2626'
    },
    warning: {
      bg: '#FFFBEB',
      border: '#F59E0B',
      text: '#92400E',
      icon: '⚠️',
      bgLight: '#FFFBEB',
      confirmBg: '#F59E0B',
      confirmHover: '#D97706'
    },
    info: {
      bg: '#EFF6FF',
      border: '#3B82F6',
      text: '#1E40AF',
      icon: 'ℹ️',
      bgLight: '#EFF6FF',
      confirmBg: '#3B82F6',
      confirmHover: '#2563EB'
    }
  };

  const currentColors = colors[type];

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);
  }, []);

  const handleConfirm = () => {
    setIsExiting(true);
    setTimeout(() => {
      onConfirm();
    }, 200);
  };

  const handleCancel = () => {
    setIsExiting(true);
    setTimeout(() => {
      onCancel();
    }, 200);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  if (!isVisible && !isExiting) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'opacity 0.2s ease-in-out',
        fontFamily: "'Prompt', sans-serif"
      }}
      onClick={handleBackdropClick}
    >
      <div
        style={{
          background: currentColors.bg,
          border: `1px solid ${currentColors.border}`,
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          minWidth: '320px',
          maxWidth: '450px',
          transform: isVisible && !isExiting 
            ? 'scale(1) translateY(0)' 
            : isExiting 
            ? 'scale(0.95) translateY(10px)'
            : 'scale(0.95) translateY(-10px)',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          position: 'relative',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent border on the left */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '4px',
            background: currentColors.border,
            borderRadius: '16px 0 0 16px'
          }}
        />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              fontSize: '24px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              background: currentColors.bgLight,
              borderRadius: '10px',
              border: `1px solid ${currentColors.border}20`
            }}
          >
            {currentColors.icon}
          </div>
          <div>
            <h3 style={{ 
              margin: 0, 
              color: currentColors.text, 
              fontSize: '16px', 
              fontWeight: '600' 
            }}>
              ยืนยันการดำเนินการ
            </h3>
          </div>
        </div>

        {/* Message */}
        <div
          style={{
            color: currentColors.text,
            fontSize: '14px',
            lineHeight: '1.5',
            paddingLeft: '52px'
          }}
        >
          {message}
        </div>

        {/* Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: '12px', 
          justifyContent: 'flex-end',
          paddingLeft: '52px'
        }}>
          <button
            onClick={handleCancel}
            style={{
              padding: '10px 20px',
              background: '#F3F4F6',
              color: '#6B7280',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#E5E7EB';
              e.currentTarget.style.color = '#4B5563';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#F3F4F6';
              e.currentTarget.style.color = '#6B7280';
            }}
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            style={{
              padding: '10px 20px',
              background: currentColors.confirmBg,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentColors.confirmHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentColors.confirmBg;
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Confirm;
