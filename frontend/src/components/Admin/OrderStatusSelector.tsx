// frontend/src/components/Admin/OrderStatusSelector.tsx
import React from 'react';

interface OrderStatusSelectorProps {
  orderId: string;
  currentStatus: string;
  isOpen: boolean;
  onToggle: () => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  colors: any;
}

const OrderStatusSelector: React.FC<OrderStatusSelectorProps> = ({
  orderId, currentStatus, isOpen, onToggle, onUpdateStatus, colors
}) => {
  const statusOptions = [
    { value: "WAITING_FOR_VERIFICATION", label: "PENDING" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "CANCELLED", label: "CANCELLED" }
  ];

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', borderRadius: '8px',
    border: `1px solid ${colors.border}`, fontSize: '13px', color: colors.textMain,
    backgroundColor: colors.bgLight, outline: 'none', cursor: 'pointer',
    fontWeight: '500', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', userSelect: 'none'
  };

  return (
    <div style={{ position: 'relative', width: '180px' }}>
      <div onClick={onToggle} style={inputStyle}>
        <span>{statusOptions.find(opt => opt.value === currentStatus)?.label || currentStatus}</span>
        <span>▼</span>
      </div>
      {isOpen && (
        <div style={{ 
          position: 'absolute', top: '100%', left: 0, right: 0, 
          backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}`, 
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
          zIndex: 50, padding: '6px 0', marginTop: '4px' 
        }}>
          {statusOptions.map(opt => (
            <div 
              key={opt.value} 
              onClick={() => { 
                onUpdateStatus(orderId, opt.value); 
                onToggle(); // ปิด Dropdown หลังเลือกเสร็จ
              }} 
              style={{ 
                padding: '10px 16px', display: 'flex', alignItems: 'center', 
                gap: '12px', cursor: 'pointer', fontSize: '14px', color: colors.textMain 
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.bgLight}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderStatusSelector;