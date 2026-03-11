import { useState, useEffect } from 'react';
import { Trash2, Minus, Plus, MapPin, X } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
// ✅ Import calculateDiscountPrice ยังอยู่ครบ
import { useCart, calculateDiscountPrice } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const [address, setAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState("");

  const { cartItems, removeFromCart, updateCartItem, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  
  // -- การคำนวณจำนวนชิ้นและค่าบริการ --
  const totalInstallQty = cartItems.reduce((sum: number, item: any) => sum + (item.installationQty || 0), 0);
  
  // คำนวณจำนวนชิ้นสินค้าทั้งหมด เพื่อเช็คระยะเวลาจัดส่ง
  const totalProductQty = cartItems.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const deliveryEstimationText = totalProductQty >= 4 ? "5-7 วัน" : "3 วัน";

  let installationFee = 0;
  if (totalInstallQty > 0) {
      installationFee = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
  }

  const shippingFee = cartItems.length > 0 ? 150 : 0; 
  const total = cartTotal + installationFee + shippingFee;

  useEffect(() => {
    const savedAddress = localStorage.getItem('delivery_address');
    if (savedAddress) {
        setAddress(savedAddress);
    } else if (user && (user as any).address && (user as any).address.trim() !== "") {
        setAddress((user as any).address);
    } else {
        setAddress("");
    }
  }, [user]);

  const handleSaveAddress = () => {
    setAddress(tempAddress);
    localStorage.setItem('delivery_address', tempAddress);
    setShowAddressModal(false);
  };

  const getImageUrl = (source: any) => {
    if (!source) return "https://via.placeholder.com/150";
    const raw = source.image || source.images || source.imageUrl;
    if (!raw) return "https://via.placeholder.com/150";

    let fileName = "";
    if (Array.isArray(raw)) {
      fileName = raw[0];
    } else if (typeof raw === 'string') {
      if (raw.startsWith('[') && raw.endsWith(']')) {
        try {
          const parsed = JSON.parse(raw);
          fileName = parsed[0];
        } catch (e) {
          fileName = raw;
        }
      } else {
        fileName = raw;
      }
    }

    if (!fileName) return "https://via.placeholder.com/150";
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    return fileName.startsWith('http') ? fileName : `${baseUrl}/uploads/${fileName}`; // อิง path ภาพสินค้า
  };

  // ✅ เปลี่ยนมาใช้ handleCheckout เพื่อเด้งไป Stripe โดยตรง
  const handleCheckout = async () => {
    try {
      setIsProcessing(true);
      const checkoutRes = await api.checkout(address);
      
      // ล้างที่อยู่และตะกร้า
      localStorage.removeItem('delivery_address');
      await fetchCart();

      if (checkoutRes.url) {
        // ทริคสวมรอยหน้าเว็บ เพื่อให้กดย้อนกลับแล้วมาเจอหน้า Order History
        navigate('/orders', { replace: true });
        setTimeout(() => {
          window.location.href = checkoutRes.url;
        }, 100);
      } else {
        alert("ไม่พบ URL ชำระเงิน กรุณาลองใหม่อีกครั้ง");
        navigate('/orders');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-[#9AB6B8] min-h-screen py-12 font-sans text-gray-800">
      <div className="container mx-auto px-4 max-w-6xl">
        
        <div className="mb-6">
          <h2 className="bg-white inline-block px-8 py-2 rounded-t-xl font-bold text-[#148F96] shadow-sm">
            ตะกร้าสินค้า ({cartItems.length})
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* --- ฝั่งซ้าย: รายการสินค้า --- */}
          <div className="flex-1 space-y-4">
            {cartItems.length === 0 ? (
              <div className="bg-white/80 p-20 rounded-2xl text-center shadow-inner border border-white/50">
                <p className="text-gray-500 font-medium">ไม่มีสินค้าในตะกร้า</p>
                <button onClick={() => navigate('/')} className="mt-4 text-[#D65A31] font-bold underline">กลับไปเลือกซื้อสินค้า</button>
              </div>
            ) : (
              cartItems.map((item: any) => {
                if (!item?.product) return null;

                // ✅ ดึงราคาจาก Variant (ถ้ามี) หรือ Product หลัก
                const basePrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
                const discountedPrice = calculateDiscountPrice(basePrice, item.product.promo);
                
                // ✅ เลือกว่าจะโชว์รูปของ Variant หรือรูปของ Product หลัก
                const imageSource = (item.variant && item.variant.image) ? item.variant : item.product;

                return (
                  <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm flex items-start sm:items-center gap-4 sm:gap-6 relative animate-in slide-in-from-left duration-300 flex-col sm:flex-row">
                    <div className="w-full sm:w-28 h-40 sm:h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img 
                        src={getImageUrl(imageSource)} 
                        alt={item.product.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0 w-full">
                      <h3 className="font-bold text-gray-800 text-lg truncate">{item.product.name}</h3>
                      <p className="text-gray-400 text-sm mb-1">{(item.product as any).category || "ทั่วไป"}</p>
                      
                      {/* ✅ แสดงคุณสมบัติของสินค้า (รองรับทั้งแบบมี Variant และสินค้าหลัก) */}
                      {(() => {
                        const displayColor = item.variant?.color || item.product?.color || item.product?.mainColor;
                        const displayMaterial = item.variant?.material || item.product?.material || item.product?.mainMaterial;
                        const displaySize = item.variant?.size || item.product?.size || item.product?.mainSize;
                        
                        if (!displayColor && !displayMaterial && !displaySize) return null;

                        return (
                          <div className="flex flex-wrap items-center gap-2 mb-2 text-xs text-gray-600 bg-gray-50 p-1.5 rounded-md inline-flex border border-gray-100">
                            {displayColor && <span className="flex items-center gap-1">🎨 {displayColor}</span>}
                            {displayColor && (displayMaterial || displaySize) && <span className="text-gray-300">|</span>}
                            {displayMaterial && <span>🛠️ {displayMaterial}</span>}
                            {displayMaterial && displaySize && <span className="text-gray-300">|</span>}
                            {displaySize && <span>📏 {displaySize}</span>}
                          </div>
                        );
                      })()}

                      {/* ✅ แสดงราคาลดและป้ายโปรโมชัน */}
                      {item.product.promo ? (
                        <div className="mb-2 flex items-center flex-wrap gap-2">
                           <span className="text-gray-400 line-through text-sm">฿{basePrice.toLocaleString()}</span>
                           <span className="font-bold text-[#D65A31] text-lg">
                               ฿{discountedPrice.toLocaleString()}
                           </span>
                           <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-bold">
                               ลด {item.product.promo.discountType === 'PERCENTAGE' ? `${item.product.promo.discountValue}%` : `฿${item.product.promo.discountValue}`}
                           </span>
                        </div>
                      ) : (
                        <div className="font-bold text-[#D65A31] text-lg mb-2">฿{basePrice.toLocaleString()}</div>
                      )}
                      
                      <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[#148F96] font-bold">🔧 บริการติดตั้ง:</span>
                          <div className="flex items-center bg-white border border-gray-200 rounded-md">
                             <button onClick={() => updateCartItem(item.id, undefined, Math.max(0, (item.installationQty || 0) - 1))} className="p-1 text-gray-400 hover:text-black transition-colors"><Minus size={12}/></button>
                             <span className="w-6 text-center text-xs font-bold">{item.installationQty || 0}</span>
                             <button onClick={() => updateCartItem(item.id, undefined, Math.min(item.quantity, (item.installationQty || 0) + 1))} className="p-1 text-gray-400 hover:text-black transition-colors"><Plus size={12}/></button>
                          </div>
                      </div>

                    </div>
                    
                    <div className="flex sm:flex-col items-center justify-between sm:justify-center w-full sm:w-auto gap-4 sm:gap-0 mt-4 sm:mt-0">
                      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
                        <button onClick={() => updateCartItem(item.id, item.quantity - 1, Math.min(item.quantity - 1, item.installationQty || 0))} className="p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30" disabled={item.quantity <= 1}><Minus size={16}/></button>
                        <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => updateCartItem(item.id, item.quantity + 1, item.installationQty)} className="p-2 text-gray-400 hover:text-black transition-colors"><Plus size={16}/></button>
                      </div>

                      <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors sm:mt-2 bg-white rounded-full sm:bg-transparent shadow-sm sm:shadow-none border border-gray-100 sm:border-none">
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* --- ฝั่งขวา: สรุปราคาและที่อยู่ --- */}
          <div className="w-full lg:w-[380px] space-y-4">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-white/60">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">ที่อยู่จัดส่ง</h4>
                <button 
                  onClick={() => {
                    setTempAddress(address); 
                    setShowAddressModal(true);
                  }} 
                  className="text-xs text-[#148F96] font-bold hover:underline"
                >
                  {address.trim() !== "" ? "แก้ไขที่อยู่" : "เพิ่มที่อยู่จัดส่ง"}
                </button>
              </div>
              
              <div 
                onClick={() => {
                  setTempAddress(address); 
                  setShowAddressModal(true);
                }}
                className="flex gap-3 text-sm bg-[#F9FBFC] p-4 rounded-xl border border-dashed border-gray-300 cursor-pointer hover:border-[#148F96] hover:bg-[#F2FAFA] transition-all group"
              >
                <MapPin className="text-[#148F96] flex-shrink-0 mt-0.5 group-hover:scale-110 transition-transform" size={18} />
                <div className="flex-1 w-full">
                  {address.trim() !== "" ? (
                    <p className="leading-relaxed text-gray-800">{address}</p>
                  ) : (
                    <p className="leading-relaxed text-gray-400 group-hover:text-[#148F96] transition-colors">
                      คลิกเพื่อเพิ่มที่อยู่จัดส่ง...
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ส่วนสรุปคำสั่งซื้อ */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-white/60">
              <h4 className="font-bold text-gray-800 mb-4">สรุปคำสั่งซื้อ</h4>
              <div className="space-y-3 text-sm mb-6 border-b border-gray-50 pb-6">
                <div className="flex justify-between text-gray-500">
                  <span>ยอดรวมย่อย</span>
                  <span className="font-medium text-gray-800">฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ค่าบริการติดตั้ง</span>
                  <span className="text-[#D65A31] font-medium">฿{installationFee.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-medium text-gray-800">฿{shippingFee.toLocaleString()}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl mb-4">
                <span className="text-gray-800">ยอดรวมทั้งหมด</span>
                <span className="text-[#D65A31]">฿{total.toLocaleString()}</span>
              </div>

              {/* แจ้งเตือนระยะเวลาการจัดส่ง */}
              {cartItems.length > 0 && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-100 rounded-xl text-xs text-[#D65A31] leading-relaxed">
                  <span className="font-bold text-sm block mb-1">🚚 ระยะเวลาจัดส่งโดยประมาณ:</span>
                  จัดส่งภายใน <b>{deliveryEstimationText}</b> (นับตั้งแต่วันที่ได้รับ complete order จากฝั่งแอดมิน)
                </div>
              )}

              {/* ✅ ปุ่มจ่ายเงินวิ่งไปหา Stripe */}
              <button 
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || !address.trim() || isProcessing} 
                className="w-full bg-[#D65A31] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#D65A31]/20 hover:bg-[#bd4e2a] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 flex justify-center items-center"
              >
                {isProcessing ? "กำลังไปยังหน้าชำระเงิน..." : "ดำเนินการชำระเงิน"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal แก้ไขที่อยู่ */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A6365]/90 backdrop-blur-md">
          <div className="bg-white w-full max-w-lg rounded-3xl p-8 relative shadow-2xl animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowAddressModal(false)} 
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={24}/>
            </button>
            <h3 className="text-xl font-bold text-gray-800 mb-6">ที่อยู่จัดส่ง</h3>
            <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-800 outline-none focus:border-[#148F96] focus:ring-2 focus:ring-[#148F96]/20 transition-all resize-none"
              rows={4}
              value={tempAddress}
              onChange={(e) => setTempAddress(e.target.value)}
              placeholder="บ้านเลขที่, ถนน, ตำบล, อำเภอ, จังหวัด, รหัสไปรษณีย์..."
            ></textarea>
            <div className="flex gap-4 mt-6">
              <button 
                onClick={() => setShowAddressModal(false)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button 
                onClick={handleSaveAddress}
                disabled={!tempAddress.trim()}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-[#148F96] hover:bg-[#0f6f75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ยืนยันที่อยู่
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Cart;