// ManageOrders.tsx
import React, { useState, useEffect } from "react";
import api from "../../services/api";

const ManageOrders: React.FC = () => {
  const [allOrders, setAllOrders] = useState<any[]>([]);

  const fetchAllOrders = async () => {
    try {
      const response = await api.get('/orders');
      setAllOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    if (!window.confirm(`คุณต้องการเปลี่ยนสถานะเป็น ${newStatus} ใช่หรือไม่?`)) return;
    try {
      await api.patch(`/orders/${orderId}/status`, { status: newStatus });
      alert("อัปเดตสถานะสำเร็จ!");
      fetchAllOrders(); 
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบคำสั่งซื้อ ID: ${orderId.substring(0, 8)}?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`)) return;
    try {
      await api.delete(`/orders/${orderId}`);
      alert("ลบคำสั่งซื้อออกจากระบบเรียบร้อยแล้ว");
      fetchAllOrders(); 
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("เกิดข้อผิดพลาดในการลบคำสั่งซื้อ");
    }
  };

  return (
    // ✨ เปลี่ยนจาก <div> เป็น <section> เพื่อบ่งบอกว่าเป็นส่วนหนึ่งของเนื้อหา
    <section className="manage-orders-view" style={{ padding: '10px' }} aria-labelledby="manage-orders-heading">
      
      {/* ✨ ครอบหัวข้อด้วย <header> */}
      <header>
        <h2 id="manage-orders-heading" style={{ marginBottom: '20px', color: '#333' }}>📦 จัดการคำสั่งซื้อ</h2>
      </header>
      
      {/* <div> ตรงนี้เก็บไว้ได้ครับ เพราะเอาไว้จัดขอบโค้ง (border-radius) และเงา (box-shadow) ให้กับตาราง */}
      <div style={{ background: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)', overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #eee' }}>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>Order ID</th>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>วันที่สั่งซื้อ</th>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>ลูกค้า (Email)</th>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>ยอดรวม</th>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>สลิปโอนเงิน</th>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>สถานะ</th>
              <th scope="col" style={{ padding: '12px', color: '#555' }}>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {allOrders.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: '30px', color: '#888' }}>
                  ยังไม่มีคำสั่งซื้อในระบบ
                </td>
              </tr>
            ) : (
              allOrders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #eee', transition: '0.3s' }}>
                  <td style={{ padding: '12px', fontSize: '14px', fontFamily: 'monospace' }}>#{order.id.substring(0, 8)}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{new Date(order.orderDate).toLocaleDateString('th-TH')}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>{order.user?.email || 'N/A'}</td>
                  <td style={{ padding: '12px', fontSize: '14px', color: '#D65A31', fontWeight: 'bold' }}>฿{Number(order.totalAmount).toLocaleString()}</td>
                  <td style={{ padding: '12px', fontSize: '14px' }}>
                    {order.paymentSlipImage ? (
                      <a href={`http://localhost:3000/uploads/slips/${order.paymentSlipImage}`} target="_blank" rel="noreferrer" style={{ color: '#148F96', textDecoration: 'underline', fontWeight: 'bold' }}>🧾 ดูสลิป</a>
                    ) : (
                      <span style={{ color: '#aaa' }}>-</span>
                    )}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span style={{ 
                      padding: '6px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold',
                      background: order.status === 'COMPLETED' ? '#e6f4ea' : order.status === 'CANCELLED' ? '#fce8e6' : order.status === 'WAITING_FOR_VERIFICATION' ? '#e8f0fe' : '#fff3e0',
                      color: order.status === 'COMPLETED' ? '#1e8e3e' : order.status === 'CANCELLED' ? '#d93025' : order.status === 'WAITING_FOR_VERIFICATION' ? '#1a73e8' : '#f57c00'
                    }}>
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select 
                      value={order.status} onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                      style={{ padding: '6px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '13px', cursor: 'pointer', outline: 'none' }}
                      aria-label={`เปลี่ยนสถานะของออเดอร์ ${order.id.substring(0, 8)}`}
                    >
                      <option value="PENDING">PENDING (รอชำระเงิน)</option>
                      <option value="WAITING_FOR_VERIFICATION">WAITING (รอตรวจสอบสลิป)</option>
                      <option value="COMPLETED">COMPLETED (สำเร็จ)</option>
                      <option value="CANCELLED">CANCELLED (ยกเลิก)</option>
                    </select>
                    <button
                      onClick={() => handleDeleteOrder(order.id)}
                      style={{ background: 'none', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
                      title="ลบคำสั่งซื้อนี้"
                      aria-label={`ลบออเดอร์ ${order.id.substring(0, 8)}`}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default ManageOrders;