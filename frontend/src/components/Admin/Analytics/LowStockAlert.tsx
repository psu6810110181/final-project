import React from 'react';

interface LowStockAlertProps {
  lowStockItems: any[];
}

const LowStockAlert: React.FC<LowStockAlertProps> = ({ lowStockItems }) => {
  if (lowStockItems.length === 0) return null;

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-rose-100 rounded-3xl p-5 mb-10 flex items-center gap-5 shadow-[0_8px_30px_rgb(225,29,72,0.06)]">
      <div className="text-3xl animate-pulse text-rose-500 drop-shadow-sm">⚠️</div>
      <div className="flex-1">
        <div className="font-bold text-rose-600 text-lg mb-1 tracking-wide">
          การแจ้งเตือน: สินค้าใกล้หมดสต็อก ({lowStockItems.length} รายการ)
        </div>
        <div className="text-sm text-slate-600 leading-relaxed font-medium">
          {lowStockItems.slice(0, 3).map((item, index) => (
            <span key={index}>
              <span className="text-slate-800 font-bold">{item.product.name}</span>
              {item.lowStockType === 'variant' && item.variantInfo && (
                <span className="text-xs text-slate-500"> ({item.variantInfo.color}/{item.variantInfo.size})</span>
              )}
              <span className="text-rose-500"> [เหลือ {item.stockLevel} ชิ้น]</span>
              {index < Math.min(lowStockItems.length - 1, 2) && ' • '}
            </span>
          ))}
          {lowStockItems.length > 3 && <span className="italic text-slate-400"> และอีก {lowStockItems.length - 3} รายการ...</span>}
        </div>
      </div>
    </div>
  );
};

export default LowStockAlert;