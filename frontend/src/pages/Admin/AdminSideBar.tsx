import React from "react";

interface AdminSideBarProps {
  // ✅ เพิ่ม 'manageReviews' เข้าไปใน Type เพื่อให้ TypeScript ไม่ฟ้อง Error
  activeView: 'analytics' | 'addProduct' | 'manageSystem' | 'manageOrders' | 'managePromotions' | 'manageReviews';
  editingProductId: string | null;
  // ✅ เพิ่ม 'manageReviews' ในฟังก์ชัน onChangeView ด้วย
  onChangeView: (view: 'analytics' | 'manageSystem' | 'manageOrders' | 'managePromotions' | 'manageReviews') => void;
  onAddProductClick: () => void;
}

const AdminSideBar: React.FC<AdminSideBarProps> = ({ 
  activeView, 
  editingProductId, 
  onChangeView, 
  onAddProductClick 
}) => {
  return (
    <div className="side-navigation">
      <div className="nav-header">จัดการระบบ</div> 
      
      <button 
        className={`nav-item-btn ${activeView === 'analytics' ? 'active' : ''}`}
        onClick={() => onChangeView('analytics')}
      >
        📊 ภาพรวมและสถิติ
      </button>
      
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

      {/* ✅ เพิ่มปุ่มสำหรับเมนูระบบจัดการรีวิว */}
      <button 
        className={`nav-item-btn ${activeView === 'manageReviews' ? 'active' : ''}`}
        onClick={() => onChangeView('manageReviews')}
      >
        ⭐ จัดการรีวิว
      </button>
    </div>
  );
};

export default AdminSideBar;