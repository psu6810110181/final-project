import { useState, useEffect } from 'react';
import * as api from '../services/api';
import { Package, Calendar, ChevronRight, Clock, CheckCircle, XCircle, MapPin, X, Truck, CreditCard, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState<api.Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<api.Order | null>(null);

  const fetchOrders = async () => {
    try {
      setError(null);
      const data = await api.getMyOrders(); 
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);
      setError("ไม่สามารถดึงประวัติการสั่งซื้อได้ โปรดลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        fetchOrders();
      }
    };
    window.addEventListener('pageshow', handlePageShow);
    
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, []);

  // ✅ Check for payment success URL parameter and refresh orders
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
      fetchOrders();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    const confirmCancel = window.confirm("คุณแน่ใจหรือไม่ว่าต้องการยกเลิกคำสั่งซื้อนี้?");
    if (!confirmCancel) return;

    try {
      await api.cancelOrder(orderId);
      toast.success("ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว");
      fetchOrders(); 
      if(selectedOrder?.id === orderId) {
        setSelectedOrder(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ");
    }
  };

  const handleRetryPayment = async (orderId: string) => {
    try {
      const res = await api.retryPayment(orderId);
      if (res.url) {
        window.location.href = res.url; 
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "ไม่สามารถเปิดหน้าชำระเงินได้ในขณะนี้");
    }
  };

  const getStatusInfo = (rawStatus: string) => {
    const status = (rawStatus || '').toLowerCase();
    
    switch (status) {
      case 'paid': 
        return { color: 'text-[#148F96]', bg: 'bg-[#F2FAFA]', icon: <CheckCircle size={16} />, label: 'ชำระเงินแล้ว' };
      case 'completed': 
        return { color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle size={16} />, label: 'สำเร็จ' };
      case 'cancelled': 
        return { color: 'text-red-600', bg: 'bg-red-50', icon: <XCircle size={16} />, label: 'ยกเลิก' };
      case 'shipped': 
        return { color: 'text-indigo-600', bg: 'bg-indigo-50', icon: <Package size={16} />, label: 'จัดส่งแล้ว' };
      case 'pending': 
        return { color: 'text-amber-600', bg: 'bg-amber-50', icon: <Clock size={16} />, label: 'รอการชำระเงิน' };
      case 'waiting_for_verification': 
        return { color: 'text-amber-600', bg: 'bg-blue-50', icon: <Clock size={16} />, label: 'รอตรวจสอบยอดเงิน' };
      default: 
        return { color: 'text-gray-600', bg: 'bg-gray-50', icon: <Clock size={16} />, label: status || 'ไม่ระบุ' };
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'ไม่มีข้อมูลวันที่';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? 'รูปแบบวันที่ขัดข้อง' : date.toLocaleDateString('th-TH');
  };

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
    return date.toISOString();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังโหลดประวัติการสั่งซื้อ...</div>;

  return (
    <div className="bg-[#F9FAFB] min-h-screen py-12 relative">
      <div className="container mx-auto px-4 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <Package className="text-[#148F96]" /> ประวัติการสั่งซื้อ
        </h1>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-center border border-red-100">
            {error}
          </div>
        )}

        {!error && orders.length === 0 ? (
          <div className="bg-white p-20 rounded-3xl text-center shadow-sm border border-dashed">
            <p className="text-gray-400">ยังไม่มีประวัติการสั่งซื้อ</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusLower = (order.status || '').toLowerCase();
              const status = getStatusInfo(order.status);
              const itemCount = order.items?.length || 0; 
              
              const isPaidOrBeyond = ['paid', 'shipped', 'completed'].includes(statusLower);
              const estimatedDeliveryDate = calculateDeliveryDate(order.orderDate, order.items);

              return (
                <div key={order.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-[#148F96] transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">#{order.id.slice(-8)}</span>
                      <div className="flex items-center gap-2 text-gray-600 mt-1">
                        <Calendar size={14} />
                        <span className="text-sm">{formatDate(order.orderDate)}</span>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${status.bg} ${status.color}`}>
                      {status.icon} {status.label}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mb-2 text-gray-500">
                     <MapPin size={14} className="flex-shrink-0" />
                     <p className="text-sm truncate">{order.shippingAddress || 'ไม่มีที่อยู่จัดส่ง'}</p>
                  </div>
                  
                  <div className="mb-4 flex flex-col gap-2">
                     <div>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
                           รวม {itemCount} รายการ
                        </span>
                     </div>
                     
                     {statusLower !== 'cancelled' && (
                        isPaidOrBeyond ? (
                          <div className="text-sm font-medium text-[#148F96] flex items-center gap-1.5 bg-teal-50/50 w-fit px-3 py-1.5 rounded-lg">
                             <Truck size={16} />
                             คาดว่าจะได้รับสินค้าภายใน {formatDate(estimatedDeliveryDate || '')}
                          </div>
                        ) : (
                          <div className="text-sm font-medium text-amber-600 flex items-center gap-1.5 bg-amber-50 border border-amber-100 w-fit px-3 py-1.5 rounded-lg">
                             <Banknote size={16} />
                             รอการชำระเงิน
                          </div>
                        )
                     )}
                  </div>

                  <div className="pt-4 border-t border-gray-50 flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-400">ราคาสุทธิ</p>
                      <p className="text-lg font-bold text-[#D65A31]">฿{(Number(order.totalAmount) || 0).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {(statusLower === 'pending') && (
                        <div className="flex gap-2 mr-2">
                          <button 
                            onClick={() => handleCancelOrder(order.id)}
                            className="text-sm font-bold text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                          >
                            ยกเลิก
                          </button>

                          <button 
                            onClick={() => handleRetryPayment(order.id)}
                            className="text-sm font-bold bg-[#148F96] text-white hover:bg-[#0f6f75] px-4 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            ชำระเงินต่อ
                          </button>
                        </div>
                      )}

                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className={`flex items-center gap-1 text-sm font-bold text-[#148F96] group-hover:gap-2 transition-all cursor-pointer ${(statusLower === 'pending') ? 'border-l border-gray-200 pl-3' : ''}`}
                      >
                        รายละเอียด <ChevronRight size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal แสดงรายละเอียดออเดอร์ */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-800">รายละเอียดออเดอร์</h3>
                <p className="text-xs text-gray-500 font-mono mt-1">ID: {selectedOrder.id}</p>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <h4 className="text-sm font-bold text-gray-700 mb-4 border-b pb-2">รายการสินค้า</h4>
              
              {!selectedOrder.items || selectedOrder.items.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">ไม่พบข้อมูลสินค้าในออเดอร์นี้</p>
              ) : (
                <div className="space-y-4">
                  {selectedOrder.items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-gray-800">{item.product?.name || 'สินค้าไม่ทราบชื่อ'}</p>
                        
                        {/* ✅ แสดงคุณสมบัติของ Variant (ถ้ามี) */}
                        {item.variant && (
                          <div className="text-xs text-gray-500 mt-1 flex flex-wrap gap-1">
                            <span className="bg-gray-100 px-1.5 py-0.5 rounded">
                              {[item.variant.color, item.variant.material, item.variant.size].filter(Boolean).join(' | ')}
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-gray-500 mt-1 flex gap-3">
                           <span>จำนวน: {item.quantity} ชิ้น</span>
                           {(item.installationQty ?? 0) > 0 && (
                             <span className="text-[#148F96]">ติดตั้ง: {item.installationQty} ชิ้น</span>
                           )}
                        </div>
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        ฿{(Number(item.priceAtPurchase) * Number(item.quantity) || 0).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 space-y-3 flex-shrink-0">
              
              {selectedOrder.status.toLowerCase() !== 'cancelled' && (
                ['paid', 'shipped', 'completed'].includes(selectedOrder.status.toLowerCase()) ? (
                  <div className="flex justify-between items-center text-sm font-medium text-[#148F96] bg-teal-50/70 p-2 rounded-lg mb-3">
                    <span className="flex items-center gap-2"><Truck size={16}/> คาดว่าจะได้รับสินค้าภายใน</span>
                    <span>{formatDate(calculateDeliveryDate(selectedOrder.orderDate, selectedOrder.items) || '')}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-sm font-medium text-amber-600 bg-amber-50 border border-amber-100 p-2 rounded-lg mb-3">
                    <span className="flex items-center gap-2"><Banknote size={16}/> สถานะการจัดส่ง</span>
                    <span>รอการชำระเงิน</span>
                  </div>
                )
              )}

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>รวมค่าสินค้า</span>
                <span>฿{(Number(selectedOrder.totalAmountProduct) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>ค่าบริการติดตั้ง</span>
                <span>฿{(Number(selectedOrder.totalAmountInstallation) || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>ค่าจัดส่ง</span>
                <span>฿150</span>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                <span className="font-bold text-gray-800">ยอดรวมทั้งสิ้น</span>
                <span className="text-xl font-bold text-[#D65A31]">
                  ฿{(Number(selectedOrder.totalAmount) || 0).toLocaleString()}
                </span>
              </div>

              {(selectedOrder.status === 'PENDING' || selectedOrder.status.toLowerCase() === 'pending') && (
                <div className="pt-4 mt-2 border-t border-gray-200">
                   <button 
                      onClick={() => handleRetryPayment(selectedOrder.id)}
                      className="w-full flex justify-center items-center gap-2 bg-[#D65A31] text-white py-3 rounded-xl font-bold text-base hover:bg-[#bd4e2a] transition-all shadow-md active:scale-95"
                    >
                      <CreditCard size={20} /> ดำเนินการชำระเงิน
                   </button>
                </div>
              )}
              
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;