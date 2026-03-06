import React, { useEffect, useState } from 'react';

interface AlertProps {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

const Alert: React.FC<AlertProps> = ({ 
  message, 
  type, 
  onClose, 
  autoClose = true, 
  duration = 4000 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  const colors = {
    success: {
      bg: '#ECFDF5',
      border: '#10B981',
      text: '#065F46',
      icon: '✅',
      bgLight: '#F0FDF4'
    },
    error: {
      bg: '#FEF2F2',
      border: '#EF4444',
      text: '#991B1B',
      icon: '❌',
      bgLight: '#FEF2F2'
    },
    warning: {
      bg: '#FFFBEB',
      border: '#F59E0B',
      text: '#92400E',
      icon: '⚠️',
      bgLight: '#FFFBEB'
    },
    info: {
      bg: '#EFF6FF',
      border: '#3B82F6',
      text: '#1E40AF',
      icon: 'ℹ️',
      bgLight: '#EFF6FF'
    }
  };

  const currentColors = colors[type];

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    if (autoClose) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible && !isExiting) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        left: '50%',
        transform: isVisible && !isExiting 
          ? 'translateX(-50%) translateY(0)' 
          : isExiting 
          ? 'translateX(-50%) translateY(-20px)'
          : 'translateX(-50%) translateY(-20px)',
        opacity: isVisible && !isExiting ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        fontFamily: "'Prompt', sans-serif",
        zIndex: 9999,
        minWidth: '320px',
        maxWidth: '500px'
      }}
    >
      <div
        style={{
          background: currentColors.bg,
          border: `1px solid ${currentColors.border}`,
          borderRadius: '12px',
          padding: '16px 20px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          position: 'relative',
          overflow: 'hidden'
        }}
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
            borderRadius: '12px 0 0 12px'
          }}
        />

        {/* Icon */}
        <div
          style={{
            fontSize: '20px',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            background: currentColors.bgLight,
            borderRadius: '8px',
            border: `1px solid ${currentColors.border}20`
          }}
        >
          {currentColors.icon}
        </div>

        {/* Message */}
        <div
          style={{
            flex: 1,
            color: currentColors.text,
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '1.5'
          }}
        >
          {message}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            background: 'none',
            border: 'none',
            color: currentColors.text,
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            opacity: 0.7,
            transition: 'all 0.2s',
            flexShrink: 0
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.opacity = '1';
            e.currentTarget.style.background = `${currentColors.border}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.opacity = '0.7';
            e.currentTarget.style.background = 'none';
          }}
          aria-label="ปิดแจ้งเตือน"
        >
          ×
        </button>
      </div>

      {/* Progress bar for auto-close */}
      {autoClose && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            background: currentColors.border,
            borderRadius: '0 0 0 12px',
            animation: `progressBar ${duration}ms linear forwards`
          }}
        />
      )}
    </div>
  );
};

// Add progressBar animation to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes progressBar {
      from {
        width: 100%;
      }
      to {
        width: 0%;
      }
    }
  `;
  document.head.appendChild(style);
}

export default Alert;
