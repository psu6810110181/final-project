import React, { useState } from "react";
import "./AdminDashboard.css";
import AdminSideBar from "./Admin/AdminSideBar";
import ProductForm from "./Admin/ProductForm";
import ManageSystem from "./Admin/ManageSystem";
import ManageOrders from "./Admin/ManageOrders";
import PromotionManager from "./Admin/Promotion";
import AdminAnalytics from "./Admin/AdminAnalytics";
import AdminReviews from "./Admin/AdminReviews"; // ✅ นำเข้าหน้าใหม่

const AdminDashboard: React.FC = () => {
  // ✅ เพิ่ม 'manageReviews' เข้าไปใน type ของ activeView
  const [activeView, setActiveView] = useState<'analytics' | 'addProduct' | 'manageSystem' | 'manageOrders' | 'managePromotions' | 'manageReviews'>('analytics');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveView('addProduct');
  };

  const handleAddProductMenuClick = () => {
    setEditingProductId(null);
    setActiveView('addProduct');
  };

  const handleFormSuccessOrCancel = () => {
    setEditingProductId(null);
    setActiveView('manageSystem');
  };

  return (
    <main className="admin-container">
      <div className="admin-body">
        
        {/* MAIN SECTION */}
        <div className="main-section">
          
          {activeView === 'analytics' && (
            <AdminAnalytics />
          )}

          {activeView === 'addProduct' && (
            <ProductForm 
              editingProductId={editingProductId} 
              onCancel={handleFormSuccessOrCancel}
              onSuccess={handleFormSuccessOrCancel}
            />
          )}

          {activeView === 'manageSystem' && (
            <ManageSystem onEditProduct={handleEditProduct} />
          )}

          {activeView === 'manageOrders' && (
            <ManageOrders />
          )}

          {activeView === 'managePromotions' && (
            <PromotionManager />
          )}

          {/* ✅ เพิ่มการแสดงผลหน้าระบบจัดการรีวิว */}
          {activeView === 'manageReviews' && (
            <AdminReviews />
          )}
        </div>
        
        {/* RIGHT NAVIGATION SIDEBAR */}
        {/* อย่าลืมไปเพิ่มปุ่ม "จัดการรีวิว" ใน AdminSideBar.tsx ให้เปลี่ยนสถานะมาเป็น 'manageReviews' ด้วยนะครับ */}
        <AdminSideBar 
          activeView={activeView} 
          editingProductId={editingProductId}
          onChangeView={setActiveView}
          onAddProductClick={handleAddProductMenuClick}
        />

      </div>
    </main>
  );
};

export default AdminDashboard;