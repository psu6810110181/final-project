// frontend/src/pages/Admin/ManageSystem.tsx
import React from "react";
import ManageProductsList from "../../components/Admin/ManageProductsList";
import ManageMasterData from "../../components/Admin/ManageMasterData";

interface ManageSystemProps {
  onEditProduct: (productId: string) => void;
}

const ManageSystem: React.FC<ManageSystemProps> = ({ onEditProduct }) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      {/* ส่วนที่ 1: จัดการรายการสินค้า */}
      <ManageProductsList onEditProduct={onEditProduct} />

      {/* ส่วนที่ 2: จัดการคุณสมบัติระบบ (Master Data) */}
      <ManageMasterData />
    </div>
  );
};

export default ManageSystem;