// ManageOrders.tsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";
import Confirm from "../../components/Confirm";
import toast from "react-hot-toast";

const ManageOrders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Confirm state
  const [confirm, setConfirm] = useState<{ 
    message: string; 
    onConfirm: () => void; 
    type?: 'danger' | 'warning' | 'info' 
  } | null>(null);

  // --- Design System Colors ---
  const colors = {
    primary: '#148F96', 
    primaryLight: '#E6F7F8',
    secondary: '#D65A31', 
    secondaryLight: '#FCE8E1',
    textMain: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    bgLight: '#F9FAFB',
    bgWhite: '#FFFFFF',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE'
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders', getAuthHeader());
      setAllOrders(response.data);
      setErrorMessage(null);
    } catch (error: any) {
      console.error("Failed to fetch orders", error);
      if (error.response && error.response.status === 401) {
        setErrorMessage("ไม่ได้รับสิทธิ์เข้าถึง (401 Unauthorized) - กรุณาตรวจสอบการ Login ของคุณ");
      }
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
  setConfirm({
    message: `คุณต้องการเปลี่ยนสถานะเป็น ${newStatus} ใช่หรือไม่?`,
    onConfirm: async () => {
      try {
        await api.patch(`/orders/${orderId}/status`, { status: newStatus }, getAuthHeader());
        toast.success("อัปเดตสถานะสำเร็จ!");
        fetchAllOrders(); 
      } catch (error) {
        console.error("Error updating order status:", error);
        toast.error("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
      }
    },
    type: 'warning'
  });
};

  const handleDeleteOrder = async (orderId: string) => {
  setConfirm({
    message: `คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อ ID: ${orderId.substring(0, 8)}?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`,
    onConfirm: async () => {
      try {
        await api.delete(`/orders/${orderId}`, getAuthHeader());
        toast.success("ลบคำสั่งซื้อออกจากระบบเรียบร้อยแล้ว");
        fetchAllOrders(); 
      } catch (error) {
        console.error("Error deleting order:", error);
        toast.error("เกิดข้อผิดพลาดในการลบคำสั่งซื้อ");
      }
    },
    type: 'danger'
  });
};

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'COMPLETED': return { bg: colors.successLight, color: colors.success };
      case 'CANCELLED': return { bg: colors.dangerLight, color: colors.danger };
      case 'WAITING_FOR_VERIFICATION': return { bg: colors.infoLight, color: colors.info };
      case 'PENDING': default: return { bg: colors.warningLight, color: colors.warning };
    }
  };

  // ✅ เพิ่มฟังก์ชันคำนวณวันจัดส่ง (ใช้ Logic เดียวกับฝั่งลูกค้า)
  const calculateDeliveryDate = (orderDateStr: string, items: any[] = []) => {
    if (!orderDateStr) return null;
    const date = new Date(orderDateStr);
    if (isNaN(date.getTime())) return null;

    const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    let deliveryDays = 3;
    
    if (totalQty > 3) {
      deliveryDays += Math.ceil((totalQty - 3) / 3);
    }
    deliveryDays = Math.min(deliveryDays, 7);
    date.setDate(date.getDate() + deliveryDays);
    
    return date;
  };

  return (
    <article style={{ maxWidth: '1300px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      
      <header style={{ 
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
        padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.warning}`,
        marginBottom: '28px', display: 'flex', alignItems: 'center', gap: '24px'
      }}>
        <div style={{
          width: '64px', height: '64px', background: colors.warningLight, borderRadius: '16px', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', 
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', flexShrink: 0
        }} aria-hidden="true">
          📦
        </div>
        <div>
          <h2 id="manage-orders-heading" style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            จัดการคำสั่งซื้อ (Orders)
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>
            ตรวจสอบรายการสั่งซื้อ อัปเดตสถานะการชำระเงิน และกำหนดการจัดส่ง
          </p>
        </div>
      </header>

      {errorMessage && (
        <div style={{ background: colors.dangerLight, color: colors.danger, padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid #FECACA` }} role="alert">
          <span aria-hidden="true">⚠️</span> {errorMessage}
        </div>
      )}

      <section aria-labelledby="manage-orders-heading" style={{ background: colors.bgWhite, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', padding: '1px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            
            <thead style={{ background: colors.bgLight, borderBottom: `2px solid ${colors.border}` }}>
              <tr>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Order ID</th>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>วันที่สั่งซื้อ</th>
                {/* ✅ เพิ่มคอลัมน์วันจัดส่ง */}
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>วันจัดส่ง</th>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ลูกค้า</th>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ยอดรวม</th>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>สลิป</th>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>สถานะ</th>
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            
            <tbody>
              {allOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: colors.textMuted, fontStyle: 'italic' }}>
                    ยังไม่มีคำสั่งซื้อในระบบ
                  </td>
                </tr>
              ) : (
                allOrders.map((order) => {
                  const statusStyle = getStatusStyle(order.status);
                  // คำนวณวันส่งและยอดสินค้ารวม
                  const deliveryDate = calculateDeliveryDate(order.orderDate, order.items);
                  const itemCount = order.items?.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0) || 0;
                  
                  return (
                    <tr key={order.id} className="order-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.2s' }}>
                      <td style={{ padding: '16px 20px', fontSize: '14px', fontFamily: 'monospace', color: colors.textMain, fontWeight: '500' }}>
                        #{order.id.substring(0, 8)}
                        <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px', fontFamily: 'sans-serif' }}>
                          {itemCount} ชิ้น
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                        {new Date(order.orderDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                        <div style={{ fontSize: '12px', color: colors.textMuted }}>
                          {new Date(order.orderDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                        </div>
                      </td>
                      
                      {/* ✅ แสดงวันจัดส่ง */}
                      <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.primary, fontWeight: '600' }}>
                        {order.status === 'CANCELLED' ? (
                          <span style={{ color: colors.textMuted }}>-</span>
                        ) : (
                          order.status === 'PENDING' ? (<span style={{ color: colors.warning }}>รอการชำระเงิน</span>) : (<span style={{ color: colors.primary }}>{deliveryDate ? deliveryDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>)
                        )}
                      </td>

                      <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                        {order.user?.email || 'N/A'}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '15px', color: colors.secondary, fontWeight: '700' }}>
                        ฿{Number(order.totalAmount).toLocaleString()}
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                        {order.paymentSlipImage ? (
                          <a href={`http://localhost:3000/uploads/slips/${order.paymentSlipImage}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.primary, textDecoration: 'none', fontWeight: '600', background: colors.primaryLight, padding: '6px 12px', borderRadius: '20px', transition: 'background 0.2s' }} onMouseOver={(e) => e.currentTarget.style.background = '#CCFBF1'} onMouseOut={(e) => e.currentTarget.style.background = colors.primaryLight}>
                            <span aria-hidden="true">🧾</span> ดูสลิป
                          </a>
                        ) : (
                          <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>ไม่มีสลิป</span>
                        )}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                          background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}40`
                        }}>
                          {order.status === 'WAITING_FOR_VERIFICATION' ? 'WAITING' : order.status}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                        <select 
                          value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                          style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '13px', cursor: 'pointer', outline: 'none', background: colors.bgLight, color: colors.textMain, fontWeight: '500' }}
                          aria-label={`เปลี่ยนสถานะของออเดอร์ ${order.id.substring(0, 8)}`}
                        >
                          <option value="WAITING_FOR_VERIFICATION">WAITING (รอตรวจสอบ)</option>
                          <option value="COMPLETED">COMPLETED (สำเร็จ)</option>
                          <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          style={{ background: colors.bgWhite, color: colors.danger, border: `1px solid ${colors.border}`, borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                          title="ลบคำสั่งซื้อนี้"
                          aria-label={`ลบออเดอร์ ${order.id.substring(0, 8)}`}
                          onMouseOver={(e) => { e.currentTarget.style.background = colors.dangerLight; e.currentTarget.style.borderColor = colors.danger; }}
                          onMouseOut={(e) => { e.currentTarget.style.background = colors.bgWhite; e.currentTarget.style.borderColor = colors.border; }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <style>{`
        .order-row:hover {
          background-color: #F8FAFC !important;
        }
      `}</style>
    {/* Custom Confirm */}
      {confirm && (
        <Confirm
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
          type={confirm.type}
        />
      )}
    </article>
  );
};

export default ManageOrders;