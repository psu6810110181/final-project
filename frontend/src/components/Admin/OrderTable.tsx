// frontend/src/components/Admin/OrderTable.tsx
import React, { useEffect, useRef } from "react";
import OrderStatusSelector from "./OrderStatusSelector";

interface OrderTableProps {
  orders: any[];
  colors: any;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onViewReceipt: (orderId: string) => void;
  onDeleteOrder: (orderId: string) => void;
  getStatusStyle: (status: string) => { bg: string, color: string };
  calculateDeliveryDate: (orderDateStr: string, items?: any[]) => Date | null;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders, colors, openDropdownId, setOpenDropdownId,
  onUpdateStatus, onViewReceipt, onDeleteOrder, getStatusStyle, calculateDeliveryDate
}) => {
  const dropdownRef = useRef<HTMLTableSectionElement>(null);

  // คลิกพื้นที่อื่นเพื่อปิด Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [setOpenDropdownId]);

  const statusOptions = [
    { value: "WAITING_FOR_VERIFICATION", label: "PENDING" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "CANCELLED", label: "CANCELLED" }
  ];

  return (
    <div style={{ overflowX: 'auto', padding: '1px', paddingBottom: '120px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
        <thead style={{ background: colors.bgLight, borderBottom: `2px solid ${colors.border}` }}>
          <tr>
            {['Order ID', 'วันที่สั่งซื้อ', 'วันจัดส่ง', 'ลูกค้า', 'ยอดรวม', 'สลิป', 'สถานะ', 'จัดการ'].map((head, idx) => (
              <th key={idx} scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', textAlign: head === 'จัดการ' ? 'right' : 'left' }}>
                {head}
              </th>
            ))}
          </tr>
        </thead>
        <tbody ref={dropdownRef}>
          {orders.length === 0 ? (
            <tr><td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: colors.textMuted, fontStyle: 'italic' }}>ยังไม่มีคำสั่งซื้อในระบบ</td></tr>
          ) : (
            orders.map((order) => {
              const statusStyle = getStatusStyle(order.status);
              const deliveryDate = calculateDeliveryDate(order.orderDate, order.items);
              const itemCount = order.items?.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0) || 0;
              
              return (
                <tr key={order.id} className="order-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.2s' }}>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontFamily: 'monospace', color: colors.textMain, fontWeight: '500' }}>
                    #{order.id.substring(0, 8)}
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px', fontFamily: 'sans-serif' }}>{itemCount} ชิ้น</div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                    {new Date(order.orderDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })}
                    <div style={{ fontSize: '12px', color: colors.textMuted }}>
                      {new Date(order.orderDate).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', fontWeight: '600' }}>
                    {order.status === 'CANCELLED' ? <span style={{ color: colors.textMuted }}>-</span> : <span style={{ color: colors.primary }}>{deliveryDate ? deliveryDate.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}</span>}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>{order.user?.email || 'N/A'}</td>
                  <td style={{ padding: '16px 20px', fontSize: '15px', color: colors.secondary, fontWeight: '700' }}>฿{Number(order.totalAmount).toLocaleString()}</td>
                  <td style={{ padding: '16px 20px', fontSize: '14px' }}>
                    {order.paymentSlipImage ? (
                      <a href={`http://localhost:3000/uploads/slips/${order.paymentSlipImage}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.primary, textDecoration: 'none', fontWeight: '600', background: colors.primaryLight, padding: '6px 12px', borderRadius: '20px' }}>
                        🧾 ดูสลิป
                      </a>
                    ) : order.stripeReceiptUrl ? (
                      <button onClick={() => onViewReceipt(order.id)} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.info, fontWeight: '600', background: colors.infoLight, padding: '6px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer' }}>
                        💳 ดูใบเสร็จ Stripe
                      </button>
                    ) : <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>ไม่มีสลิป</span>}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}40` }}>
                      {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                    </span>
                  </td>
                  <td style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                    
                    {/* ✅ เรียกใช้ OrderStatusSelector ที่สร้างแยกไว้ */}
                    <OrderStatusSelector 
                      orderId={order.id}
                      currentStatus={order.status}
                      isOpen={openDropdownId === order.id}
                      onToggle={() => setOpenDropdownId(openDropdownId === order.id ? null : order.id)}
                      onUpdateStatus={onUpdateStatus}
                      colors={colors}
                    />

                    <button onClick={() => onDeleteOrder(order.id)} style={{ background: colors.bgWhite, color: colors.danger, border: `1px solid ${colors.border}`, borderRadius: '8px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      ❌
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderTable;