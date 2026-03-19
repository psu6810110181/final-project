import React from "react";
import { 
  BarChart3, 
  PackagePlus, 
  Settings, 
  ShoppingBag, 
  Tag, 
  Star 
} from "lucide-react";

interface AdminSideBarProps {
  activeView: 'analytics' | 'addProduct' | 'manageSystem' | 'manageOrders' | 'managePromotions' | 'manageReviews';
  editingProductId: string | null;
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
        className={`nav-item-btn ${activeView === 'analytics' ? 'active' : ''} flex items-center gap-2.5`}
        onClick={() => onChangeView('analytics')}
      >
        <BarChart3 size={18} /> ภาพรวมและสถิติ
      </button>
      
      <button 
        className={`nav-item-btn ${activeView === 'addProduct' && !editingProductId ? 'active' : ''} flex items-center gap-2.5`}
        onClick={onAddProductClick}
      >
        <PackagePlus size={18} /> เพิ่มสินค้า
      </button>
      
      <button 
        className={`nav-item-btn ${activeView === 'manageSystem' ? 'active' : ''} flex items-center gap-2.5`}
        onClick={() => onChangeView('manageSystem')}
      >
        <Settings size={18} /> แก้ไข/ลบคุณสมบัติ
      </button>
      
      <button 
        className={`nav-item-btn ${activeView === 'manageOrders' ? 'active' : ''} flex items-center gap-2.5`}
        onClick={() => onChangeView('manageOrders')}
      >
        <ShoppingBag size={18} /> จัดการคำสั่งซื้อ
      </button>
      
      <button 
        className={`nav-item-btn ${activeView === 'managePromotions' ? 'active' : ''} flex items-center gap-2.5`}
        onClick={() => onChangeView('managePromotions')}
      >
        <Tag size={18} /> จัดการโปรโมชั่น
      </button>

      <button 
        className={`nav-item-btn ${activeView === 'manageReviews' ? 'active' : ''} flex items-center gap-2.5`}
        onClick={() => onChangeView('manageReviews')}
      >
        <Star size={18} /> จัดการรีวิว
      </button>
    </div>
  );
};

export default AdminSideBar;