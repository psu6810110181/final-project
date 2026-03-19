// frontend/src/components/Admin/OrderTable.tsx
import React, { useEffect, useRef, useState, useMemo } from "react";
import OrderStatusSelector from "./OrderStatusSelector";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface OrderTableProps {
  orders: any[];
  colors: any;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  onUpdateStatus: (orderId: string, newStatus: string) => void;
  onViewReceipt: (orderId: string) => void; // ถ้าไม่ได้ใช้ในไฟล์นี้ สามารถละเว้นได้
  onDeleteOrder: (orderId: string) => void;
  getStatusStyle: (status: string) => { bg: string, color: string };
  calculateDeliveryDate: (orderDateStr: string, items?: any[]) => Date | null;
}

const OrderTable: React.FC<OrderTableProps> = ({
  orders, colors, openDropdownId, setOpenDropdownId,
  onUpdateStatus, onDeleteOrder, getStatusStyle, calculateDeliveryDate
}) => {
  const dropdownRef = useRef<HTMLTableSectionElement>(null);

  // --- Filter States ---
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [filterOrderDate, setFilterOrderDate] = useState<string>("");
  const [filterDeliveryDate, setFilterDeliveryDate] = useState<string>("");

  // คลิกพื้นที่อื่นเพื่อปิด Dropdown การเปลี่ยนสถานะ
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
    { value: "PAID", label: "PAID" },
    { value: "WAITING_FOR_VERIFICATION", label: "PENDING" },
    { value: "COMPLETED", label: "COMPLETED" },
    { value: "CANCELLED", label: "CANCELLED" }
  ];

  // Helper สำหรับแปลง Date เป็น YYYY-MM-DD เพื่อเทียบกับ input type="date"
  const formatDateToYMD = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // --- Logic สำหรับการ Filter และ Sort ---
  const processedOrders = useMemo(() => {
    let filtered = [...orders];

    // 1. Filter: สถานะ
    if (filterStatus !== "ALL") {
      filtered = filtered.filter(o => o.status === filterStatus);
    }

    // 2. Filter: วันที่สั่งซื้อ
    if (filterOrderDate) {
      filtered = filtered.filter(o => {
        const orderDate = new Date(o.orderDate);
        return formatDateToYMD(orderDate) === filterOrderDate;
      });
    }

    // 3. Filter: วันที่คาดว่าจะได้รับ
    if (filterDeliveryDate) {
      filtered = filtered.filter(o => {
        const deliveryDate = calculateDeliveryDate(o.orderDate, o.items);
        if (!deliveryDate) return false;
        return formatDateToYMD(deliveryDate) === filterDeliveryDate;
      });
    }

    // 4. Sort: เรียงลำดับ PAID -> PENDING -> COMPLETED -> CANCELLED
    const statusRank: Record<string, number> = {
      'PAID': 1,
      'WAITING_FOR_VERIFICATION': 2, // เทียบเท่า PENDING ในระบบ
      'PENDING': 2,
      'COMPLETED': 3,
      'CANCELLED': 4
    };

    return filtered.sort((a, b) => {
      const rankA = statusRank[a.status] || 99; // ถ้ามีสถานะแปลกปลอมให้ไปอยู่ล่างสุด
      const rankB = statusRank[b.status] || 99;
      
      // ถ้า Rank ไม่เท่ากัน ให้เรียงตามลำดับ Rank (น้อยไปมาก)
      if (rankA !== rankB) {
        return rankA - rankB;
      }
      
      // ถ้า Rank เท่ากัน ให้เรียงตามวันที่ (ใหม่สุดอยู่บน)
      return new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime();
    });

  }, [orders, filterStatus, filterOrderDate, filterDeliveryDate, calculateDeliveryDate]);

  const clearFilters = () => {
    setFilterStatus("ALL");
    setFilterOrderDate("");
    setFilterDeliveryDate("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* 🎛️ Filter Bar */}
      <div style={{ 
        display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-end', 
        padding: '16px 20px', background: colors.bgWhite, borderRadius: '12px', border: `1px solid ${colors.border}` 
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase' }}>สถานะคำสั่งซื้อ</label>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)} 
            style={{ padding: '10px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none', backgroundColor: '#fff', fontSize: '14px', minWidth: '160px', cursor: 'pointer' }}
          >
            <option value="ALL">ทั้งหมด</option>
            {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase' }}>วันที่สั่งซื้อ</label>
          <input 
            type="date" 
            value={filterOrderDate} 
            onChange={(e) => setFilterOrderDate(e.target.value)} 
            style={{ padding: '9px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', cursor: 'pointer', backgroundColor: '#fff' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '12px', fontWeight: 'bold', color: colors.textMuted, textTransform: 'uppercase' }}>วันที่คาดว่าจะได้รับ</label>
          <input 
            type="date" 
            value={filterDeliveryDate} 
            onChange={(e) => setFilterDeliveryDate(e.target.value)} 
            style={{ padding: '9px 14px', borderRadius: '8px', border: `1px solid ${colors.border}`, outline: 'none', fontSize: '14px', cursor: 'pointer', backgroundColor: '#fff' }}
          />
        </div>

        {(filterStatus !== "ALL" || filterOrderDate || filterDeliveryDate) && (
          <button 
            onClick={clearFilters} 
            style={{ padding: '10px 16px', borderRadius: '8px', border: 'none', backgroundColor: colors.dangerLight, color: colors.danger, fontWeight: 'bold', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            ล้างตัวกรอง
          </button>
        )}
      </div>

      {/* 📦 Table */}
      <div style={{ overflowX: 'auto', padding: '1px', paddingBottom: '120px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
          <thead style={{ background: colors.bgLight, borderBottom: `2px solid ${colors.border}` }}>
            <tr>
              {['Order ID', 'วันที่สั่งซื้อ', 'วันที่คาดว่าจะได้รับ', 'ลูกค้า', 'ยอดรวม', 'สลิป', 'สถานะ', 'จัดการ'].map((head, idx) => (
                <th key={idx} scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', textAlign: head === 'จัดการ' ? 'right' : 'left' }}>
                  {head}
                </th>
              ))}
            </tr>
          </thead>
          <tbody ref={dropdownRef}>
            {processedOrders.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '60px', color: colors.textMuted, fontStyle: 'italic', fontSize: '15px' }}>
                  ไม่พบคำสั่งซื้อที่ตรงกับเงื่อนไข
                </td>
              </tr>
            ) : (
              processedOrders.map((order) => {
                const statusStyle = getStatusStyle(order.status);
                const deliveryDate = calculateDeliveryDate(order.orderDate, order.items);
                const itemCount = order.items?.reduce((sum: number, item: any) => sum + (Number(item.quantity) || 0), 0) || 0;
                
                return (
                  <tr key={order.id} className="order-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.2s', background: colors.bgWhite }}>
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
                        <a href={`${API_URL}/uploads/slips/${order.paymentSlipImage}`} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.primary, textDecoration: 'none', fontWeight: '600', background: colors.primaryLight, padding: '6px 12px', borderRadius: '20px' }}>
                          🧾 ดูสลิป
                        </a>
                      ) : order.stripeReceiptUrl ? (
                        <a href={order.stripeReceiptUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: colors.info, fontWeight: '600', background: colors.infoLight, padding: '6px 12px', borderRadius: '20px', textDecoration: 'none' }}>
                          💳 ดูใบเสร็จ Stripe
                        </a>
                      ) : <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>ไม่มีสลิป</span>}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}40` }}>
                        {statusOptions.find(opt => opt.value === order.status)?.label || order.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                      
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
    </div>
  );
};

export default OrderTable;