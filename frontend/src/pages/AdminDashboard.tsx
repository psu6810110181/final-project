import React, { useState } from "react";
import "./AdminDashboard.css";
import AdminSideBar from "./Admin/AdminSideBar";
import ProductForm from "./Admin/ProductForm";
import ManageSystem from "./Admin/ManageSystem";
import ManageOrders from "./Admin/ManageOrders";
import PromotionManager from "./Admin/Promotion";

const AdminDashboard: React.FC = () => {
  // State ควบคุมหน้าหลัก และ ID สินค้าที่กำลังแก้ไข
  const [activeView, setActiveView] = useState<'addProduct' | 'manageSystem' | 'manageOrders' | 'managePromotions'>('addProduct');
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // เมื่อกดปุ่มแก้ไขจากหน้า ManageSystem
  const handleEditProduct = (productId: string) => {
    setEditingProductId(productId);
    setActiveView('addProduct');
  };

  // เมื่อกดเมนูเพิ่มสินค้า (ล้างค่า ID ทิ้ง)
  const handleAddProductMenuClick = () => {
    setEditingProductId(null);
    setActiveView('addProduct');
  };

  // เมื่อบันทึกสำเร็จ หรือกดยกเลิก
  const handleFormSuccessOrCancel = () => {
    setEditingProductId(null);
    setActiveView('manageSystem');
  };

  return (
    <main className="admin-container">
      <div className="admin-body">
        
        {/* MAIN SECTION */}
        <div className="main-section">
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
        </div>
        
        {/* RIGHT NAVIGATION SIDEBAR */}
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