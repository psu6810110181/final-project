import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Confirm from "../../components/Confirm";
import toast from "react-hot-toast";
import OrderTable from "../../components/Admin/OrderTable";
import { Package, AlertTriangle } from 'lucide-react';

const ManageOrders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' } | null>(null);

  const colors = {
    primary: '#148F96', primaryLight: '#E6F7F8', secondary: '#D65A31', secondaryLight: '#FCE8E1',
    textMain: '#1F2937', textMuted: '#6B7280', border: '#E5E7EB', bgLight: '#F9FAFB', bgWhite: '#FFFFFF',
    danger: '#EF4444', dangerLight: '#FEF2F2', success: '#10B981', successLight: '#D1FAE5',
    warning: '#F59E0B', warningLight: '#FEF3C7', info: '#3B82F6', infoLight: '#DBEAFE'
  };

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders', getAuthHeader());
      setAllOrders(response.data);
      setErrorMessage(null);
    } catch (error: any) {
      if (error.response?.status === 401) setErrorMessage("ไม่ได้รับสิทธิ์เข้าถึง (401 Unauthorized) - กรุณาตรวจสอบการ Login ของคุณ");
    }
  };

  useEffect(() => { fetchAllOrders(); }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setConfirm({
      message: `คุณต้องการเปลี่ยนสถานะเป็น ${newStatus} ใช่หรือไม่?`,
      type: 'warning',
      onConfirm: async () => {
        try {
          await api.patch(`/orders/${orderId}/status`, { status: newStatus }, getAuthHeader());
          toast.success("อัปเดตสถานะสำเร็จ!");
          fetchAllOrders(); 
        } catch (error) { toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ"); }
      }
    });
  };

  const handleViewStripeReceipt = async (orderId: string) => {
    try {
      const response = await api.get(`/orders/${orderId}/stripe-receipt`, getAuthHeader());
      if (response.data.receiptUrl) window.open(response.data.receiptUrl, '_blank');
      else toast.error('ไม่พบข้อมูลใบเสร็จ Stripe');
    } catch (error: any) { toast.error("เกิดข้อผิดพลาดในการดึงข้อมูลใบเสร็จ"); }
  };

  const handleDeleteOrder = async (orderId: string) => {
    setConfirm({
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อ ID: ${orderId.substring(0, 8)}?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/orders/${orderId}`, getAuthHeader());
          toast.success("ลบคำสั่งซื้อออกจากระบบเรียบร้อยแล้ว");
          fetchAllOrders(); 
        } catch (error) { toast.error("เกิดข้อผิดพลาดในการลบคำสั่งซื้อ"); }
      }
    });
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'COMPLETED': return { bg: colors.successLight, color: colors.success };
      case 'CANCELLED': return { bg: colors.dangerLight, color: colors.danger };
      case 'WAITING_FOR_VERIFICATION': return { bg: colors.warningLight, color: colors.warning };
      default: return { bg: colors.warningLight, color: colors.warning };
    }
  };

  const calculateDeliveryDate = (orderDateStr: string, items: any[] = []) => {
    if (!orderDateStr) return null;
    const date = new Date(orderDateStr);
    if (isNaN(date.getTime())) return null;
    const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    let deliveryDays = 3 + (totalQty > 3 ? Math.ceil((totalQty - 3) / 3) : 0);
    date.setDate(date.getDate() + Math.min(deliveryDays, 7));
    return date;
  };

return (
    <article style={{ maxWidth: '1300px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      <header style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.04)', border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.warning}`, marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        {/* ✅ เปลี่ยน Emoji 📦 เป็น Icon Package */}
        <div style={{ width: '64px', height: '64px', background: colors.warningLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.warning }}>
          <Package size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>จัดการคำสั่งซื้อ</h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>ตรวจสอบรายการสั่งซื้อ อัปเดตสถานะการชำระเงิน และกำหนดการจัดส่ง</p>
        </div>
      </header>

      {/* ✅ เปลี่ยน Emoji ⚠️ เป็น Icon AlertTriangle และจัดให้อยู่กึ่งกลางระนาบเดียวกับข้อความ */}
      {errorMessage && (
        <div style={{ background: colors.dangerLight, color: colors.danger, padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={20} /> {errorMessage}
        </div>
      )}

      <section style={{ background: colors.bgWhite, borderRadius: '16px', border: `1px solid ${colors.border}`, minHeight: '400px' }}>
        <OrderTable 
          orders={allOrders} colors={colors} openDropdownId={openDropdownId} setOpenDropdownId={setOpenDropdownId}
          onUpdateStatus={handleUpdateOrderStatus} onViewReceipt={handleViewStripeReceipt} onDeleteOrder={handleDeleteOrder}
          getStatusStyle={getStatusStyle} calculateDeliveryDate={calculateDeliveryDate}
        />
      </section>
      
      {confirm && <Confirm message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} type={confirm.type} />}
    </article>
  );
};

export default ManageOrders;