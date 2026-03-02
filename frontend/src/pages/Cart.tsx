import { useState , useEffect} from 'react';
import { Trash2, Minus, Plus, MapPin, X, Upload, QrCode, CheckCircle } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import myQrCodeImg from '../assets/my-qrcode.jpg';

const Cart = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const [address, setAddress] = useState("");
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tempAddress, setTempAddress] = useState("");

  // ✅ เปลี่ยนจาก updateQuantity เป็น updateCartItem
  const { cartItems, removeFromCart, updateCartItem, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();
  
  // -- เพิ่ม Logic การคำนวณจำนวนชิ้นและค่าบริการ --
  // ✅ แบบใหม่: การคำนวณจำนวนชิ้นติดตั้งจาก installationQty
  const totalInstallQty = cartItems.reduce((sum: number, item: any) => sum + (item.installationQty || 0), 0);

  // 2. คำนวณค่าติดตั้ง: 4 ชิ้นขึ้นไป 990 บาท, ต่ำกว่า 4 ชิ้น ชิ้นละ 400 บาท
  let installationFee = 0;
  if (totalInstallQty > 0) {
      installationFee = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
  }

  // 3. รวมค่าใช้จ่ายทั้งหมด
  const shippingFee = cartItems.length > 0 ? 150 : 0; 
  const total = cartTotal + installationFee + shippingFee;


  useEffect(() => {
    // ดึงที่อยู่ที่อาจจะถูกแก้และเซฟไว้ชั่วคราว
    const savedAddress = localStorage.getItem('delivery_address');
    
    if (savedAddress) {
        // 1. ถ้ามีการแก้ที่อยู่เอาไว้ ให้ใช้ที่อยู่ที่แก้ก่อน
        setAddress(savedAddress);
    } 
    else if (user && (user as any).address && (user as any).address.trim() !== "") {
        // 2. ถ้ายังไม่เคยแก้ (localStorage ว่าง) ให้ใช้ที่อยู่จาก Profile เป็นค่าเริ่มต้น
        setAddress((user as any).address);
    } 
    else {
        // 3. ถ้าไม่มีทั้งคู่ ให้เป็นค่าว่าง
        setAddress("");
    }
  }, [user]);

  // ✅ ฟังก์ชันสำหรับบันทึกที่อยู่จาก Modal
  const handleSaveAddress = () => {
    setAddress(tempAddress);
    localStorage.setItem('delivery_address', tempAddress); // จำไว้ในเครื่อง เผื่อเปลี่ยนหน้า
    setShowAddressModal(false);
  };

  // ฟังก์ชันดึงรูปภาพแบบ Safe (แก้ไขใหม่)
  const getImageUrl = (product: any) => {
    if (!product) return "https://via.placeholder.com/150";
    
    // 1. ดึงค่าดิบออกมา
    const raw = product.image || product.images;
    if (!raw) return "https://via.placeholder.com/150";

    let fileName = "";

    // 2. ถ้าเป็น Array อยู่แล้ว
    if (Array.isArray(raw)) {
      fileName = raw[0];
    } 
    // 3. ถ้าเป็น String (ต้องเช็คว่าเป็น JSON string หรือชื่อไฟล์ตรงๆ)
    else if (typeof raw === 'string') {
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
    return fileName.startsWith('http') ? fileName : `http://localhost:3000/uploads/products/${fileName}`;
  };

  const handleCheckout = async () => {
    if (!slipFile) return alert("กรุณาอัปโหลดสลิปการโอนเงิน");
    try {
      setIsProcessing(true);
      const checkoutRes = await api.checkout(address);
      const orderId = checkoutRes.id || checkoutRes.orderId;
      await api.uploadSlip(orderId, slipFile);
      
      alert("สั่งซื้อเรียบร้อย!");
      setShowPaymentModal(false);

      // ✅ เพิ่มบรรทัดนี้: ล้างที่อยู่ที่พิมพ์แก้ออก เพื่อให้ออเดอร์หน้ากลับไปใช้ค่าเริ่มต้นจาก Profile
      localStorage.removeItem('delivery_address');
      
      await fetchCart();
      navigate('/orders');
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
              cartItems.map((item: any) => (
                item?.product && (
                  <div key={item.id} className="bg-white p-5 rounded-2xl shadow-sm flex items-center gap-6 relative animate-in slide-in-from-left duration-300">
                    <div className="w-28 h-28 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100">
                      <img 
                        src={getImageUrl(item.product)} 
                        alt={item.product.name}
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-800 text-lg truncate">{item.product.name}</h3>
                      <p className="text-gray-400 text-sm mb-2">{(item.product as any).category || "ทั่วไป"}</p>
                      <div className="font-bold text-[#D65A31] text-lg mb-2">฿{Number(item.product.price).toLocaleString()}</div>
                      
                      {/* ✅ กล่องปรับจำนวนบริการติดตั้ง */}
                      <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-[#148F96] font-bold">🔧 บริการติดตั้ง:</span>
                          <div className="flex items-center bg-white border border-gray-200 rounded-md">
                             <button onClick={() => updateCartItem(item.id, undefined, Math.max(0, (item.installationQty || 0) - 1))} className="p-1 text-gray-400 hover:text-black transition-colors"><Minus size={12}/></button>
                             <span className="w-6 text-center text-xs font-bold">{item.installationQty || 0}</span>
                             <button onClick={() => updateCartItem(item.id, undefined, Math.min(item.quantity, (item.installationQty || 0) + 1))} className="p-1 text-gray-400 hover:text-black transition-colors"><Plus size={12}/></button>
                          </div>
                      </div>

                    </div>
                    
                    {/* ✅ ส่วนปรับจำนวนสินค้าหลัก (ผูก logic กับจำนวนติดตั้งด้วย) */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
                      <button onClick={() => updateCartItem(item.id, item.quantity - 1, Math.min(item.quantity - 1, item.installationQty || 0))} className="p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30" disabled={item.quantity <= 1}><Minus size={16}/></button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateCartItem(item.id, item.quantity + 1, item.installationQty)} className="p-2 text-gray-400 hover:text-black transition-colors"><Plus size={16}/></button>
                    </div>

                    <button onClick={() => removeFromCart(item.id)} className="p-2 text-gray-300 hover:text-red-500 transition-colors ml-2">
                      <Trash2 size={20} />
                    </button>
                  </div>
                )
              ))
            )}
          </div>

          {/* --- ฝั่งขวา: สรุปราคาและที่อยู่ --- */}
          <div className="w-full lg:w-[380px] space-y-4">
            
            {/* ✅ ส่วนที่ 1: กล่องแสดงที่อยู่และปุ่มกดแก้ไข (อัปเดต UX ใหม่แล้ว) */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-white/60">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">ที่อยู่จัดส่ง</h4>
                {/* ✅ 1. เปลี่ยนคำบนปุ่มอัตโนมัติ ถ้ามีที่อยู่แล้ว = แก้ไข, ถ้าไม่มี = เพิ่ม */}
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
              
              {/* ✅ 2. ทำให้กล่องนี้กดได้ทั้งกล่อง (cursor-pointer) และเพิ่มลูกเล่นเวลาเอาเมาส์ชี้ (hover) */}
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
              <div className="flex justify-between font-bold text-xl mb-8">
                <span className="text-gray-800">ยอดรวมทั้งหมด</span>
                <span className="text-[#D65A31]">฿{total.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={cartItems.length === 0 || !address.trim()} 
                className="w-full bg-[#D65A31] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#D65A31]/20 hover:bg-[#bd4e2a] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
              >
                ดำเนินการชำระเงิน
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Modal ชำระเงิน --- */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#4A6365]/90 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-5xl flex flex-col md:flex-row gap-6 my-auto">
            <button onClick={() => setShowPaymentModal(false)} className="absolute -top-12 right-0 p-2 text-white hover:text-gray-200 transition-colors"><X size={32}/></button>
            
            {/* กล่องซ้าย: QR Code */}
            <div className="bg-white flex-1 rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl">
               <h3 className="text-xl font-bold text-gray-800 mb-8">สแกน QR เพื่อชำระเงิน</h3>
               <div className="w-56 h-56 bg-white rounded-2xl flex items-center justify-center border-4 border-gray-50 mb-8 shadow-inner overflow-hidden p-2">
                 {/* เปลี่ยนจาก Icon QrCode เป็น img tag */}
                 <img src={myQrCodeImg} alt="Payment QR Code" className="w-full h-full object-contain" />
               </div>
               <div className="text-gray-400 text-sm mb-1 uppercase tracking-widest">ยอดชำระสุทธิ</div>
               <div className="text-4xl font-black text-[#D65A31]">฿{total.toLocaleString()}</div>
               <p className="mt-8 text-[11px] text-gray-400 leading-relaxed px-10">สแกนด้วยแอปพลิเคชันธนาคารบนมือถือของคุณ<br/>เพื่อความสะดวกและรวดเร็ว</p>
            </div>

            {/* กล่องขวา: อัปโหลดสลิป */}
            <div className="bg-white flex-1 rounded-3xl p-10 flex flex-col items-center text-center shadow-2xl">
               <h3 className="text-xl font-bold text-gray-800 mb-4">อัพโหลดสลิปการชำระเงิน</h3>
               <p className="text-[11px] text-gray-400 mb-8 px-10 leading-relaxed">หลังจากชำระเงินแล้ว โปรดอัพโหลดรูปภาพหลักฐานการโอนเงินเพื่อยืนยันออเดอร์</p>
               
               <label className="group border-4 border-dashed border-gray-100 rounded-3xl w-full h-64 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-[#148F96]/30 transition-all mb-8 relative overflow-hidden">
                  {slipFile ? (
                    <div className="flex flex-col items-center p-4">
                      <div className="bg-green-100 text-green-600 p-4 rounded-full mb-3">
                         <CheckCircle size={32} />
                      </div>
                      <span className="text-gray-700 font-bold text-sm truncate max-w-[200px]">{slipFile.name}</span>
                      <span className="text-xs text-gray-400 mt-1">คลิกเพื่อเปลี่ยนรูป</span>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-100 p-5 rounded-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Upload size={32} className="text-gray-400" />
                      </div>
                      <span className="text-sm font-bold text-gray-500">อัพโหลดสลิปการชำระเงินที่นี่</span>
                    </>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && setSlipFile(e.target.files[0])} />
               </label>

               <button 
                onClick={handleCheckout} 
                disabled={!slipFile || isProcessing}
                className="w-full bg-[#148F96] text-white py-4 rounded-2xl font-bold text-lg hover:bg-[#0f6f75] hover:shadow-xl shadow-[#148F96]/20 disabled:opacity-50 transition-all active:scale-95"
               >
                  {isProcessing ? "กำลังส่งข้อมูล..." : "ยืนยันการชำระเงิน"}
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ ส่วนที่ 2: Modal แก้ไขที่อยู่ */}
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