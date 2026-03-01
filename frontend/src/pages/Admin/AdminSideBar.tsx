import React from "react";

interface AdminSideBarProps {
  activeView: 'addProduct' | 'manageSystem' | 'manageOrders' | 'managePromotions';
  editingProductId: string | null;
  onChangeView: (view: 'manageSystem' | 'manageOrders' | 'managePromotions') => void;
  onAddProductClick: () => void;
}

const AdminSideBar: React.FC<AdminSideBarProps> = ({ activeView, editingProductId, onChangeView, onAddProductClick }) => {
  return (
    <div className="side-navigation">
      <div className="nav-header">จัดการระบบ</div> 
      <button 
        className={`nav-item-btn ${activeView === 'addProduct' && !editingProductId ? 'active' : ''}`}
        onClick={onAddProductClick}
      >
        ➕ เพิ่มสินค้า
      </button>
      <button 
        className={`nav-item-btn ${activeView === 'manageSystem' ? 'active' : ''}`}
        onClick={() => onChangeView('manageSystem')}
      >
        ⚙️ แก้ไข/ลบคุณสมบัติ
      </button>
      <button 
        className={`nav-item-btn ${activeView === 'manageOrders' ? 'active' : ''}`}
        onClick={() => onChangeView('manageOrders')}
      >
        📦 จัดการคำสั่งซื้อ
      </button>
      <button 
        className={`nav-item-btn ${activeView === 'managePromotions' ? 'active' : ''}`}
        onClick={() => onChangeView('managePromotions')}
      >
        🎯 จัดการโปรโมชั่น
      </button>
    </div>
  );
};

export default AdminSideBar;