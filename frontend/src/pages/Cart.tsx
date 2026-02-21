// import { useState } from 'react';
// import { Trash2, Minus, Plus, MapPin, X, ScanLine, Upload, Loader } from 'lucide-react'; 
// import { useNavigate } from 'react-router-dom';
// import { useCart } from '../contexts/CartContext';
// import * as api from '../services/api';


// const Cart = () => {
//   const navigate = useNavigate();
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [slipFile, setSlipFile] = useState<File | null>(null);

//   // ดึงข้อมูลจาก Context
//   const { cartItems, removeFromCart, updateQuantity, cartTotal, fetchCart } = useCart();
  
//   // ค่าส่ง (Mock หรือดึงจาก Backend ถ้า Context เก็บไว้)
//   const installationFee = 0; // *ถ้า Context มี summary ให้ดึงมาใช้ได้
//   const shippingFee = cartItems.length > 0 ? 150 : 0; 
//   const total = cartTotal + installationFee + shippingFee;

//   const handleCheckout = async () => {
//     if (!slipFile) {
//       alert("กรุณาอัปโหลดสลิปการโอนเงิน");
//       return;
//     }

//     try {
//       setIsProcessing(true);
//       const address = "ที่อยู่จัดส่ง (Default)"; 
//       const checkoutRes = await api.checkout(address);
//       await api.uploadSlip(checkoutRes.orderId, slipFile);

//       alert("สั่งซื้อเรียบร้อย!");
//       setShowPaymentModal(false);
//       setSlipFile(null);
//       await fetchCart();
//       navigate('/order-history'); // หรือ /profile
//     } catch (error: any) {
//       console.error(error);
//       alert(error.response?.data?.message || "เกิดข้อผิดพลาดในการสั่งซื้อ");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   // Helper ดึงรูปภาพ
//   const getImageUrl = (product: any) => {
//       try {
//           // เช็คว่า product มีอยู่จริงไหมเพื่อกัน Error
//           if (!product) return "https://via.placeholder.com/150";

//           let images = product.images;
//           if (typeof images === 'string') {
//               if (images.startsWith('[')) images = JSON.parse(images);
//               else images = [images];
//           }
//           if (Array.isArray(images) && images.length > 0) {
//              const img = images[0];
//              return img.startsWith('http') ? img : `http://localhost:3000/uploads/products/${img}`;
//           }
//       } catch (e) { console.error(e); }
//       return "https://via.placeholder.com/150";
//   };

//   return (
//     <div className="bg-gray-50 min-h-screen py-10 font-sans">
//       <div className="container mx-auto px-4">
        
//         <div className="flex items-center gap-4 mb-6">
//            <div className="bg-white px-6 py-2 rounded-lg shadow-sm font-bold text-lg text-gray-800">
//              ตะกร้าสินค้า ({cartItems.length})
//            </div>
//         </div>

//         <div className="flex flex-col lg:flex-row gap-8">
          
//           {/* --- Items --- */}
//           <div className="flex-1 space-y-4">
//             {cartItems.length === 0 ? (
//                <div className="bg-white p-10 rounded-xl text-center text-gray-500">
//                  ไม่มีสินค้าในตะกร้า <br/>
//                  <button onClick={() => navigate('/')} className="mt-4 text-[#D65A31] underline">กลับไปเลือกซื้อสินค้า</button>
//                </div>
//             ) : (
//               cartItems.map((item) => (
//                 // ✅ ตรวจสอบ item และ item.product ก่อนแสดงผล
//                 item && item.product ? (
//                 <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-center gap-4 relative">
                  
//                   <button 
//                     onClick={() => removeFromCart(item.id)}
//                     className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
//                   >
//                     <Trash2 size={18} />
//                   </button>

//                   {/* Image */}
//                   <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
//                     <img src={getImageUrl(item.product)} alt={item.product.name} className="w-full h-full object-cover" />
//                   </div>

//                   {/* Info */}
//                   <div className="flex-1 text-center sm:text-left">
//                     {/* ✅ ใช้ item.product.name */}
//                     <h3 className="font-bold text-gray-800">{item.product.name}</h3>
//                     <div className="text-gray-500 text-sm">{item.product.description}</div>
//                     {/* ✅ ใช้ item.product.price */}
//                     <div className="font-bold text-[#D65A31] mt-2">฿{Number(item.product.price).toLocaleString()}</div>
//                   </div>

//                   {/* Quantity */}
//                   <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-2">
//                      <button 
//                        onClick={() => updateQuantity(item.id, item.quantity - 1)} 
//                        className="p-2 hover:bg-white rounded shadow-sm disabled:opacity-50"
//                        disabled={item.quantity <= 1}
//                      >
//                        <Minus size={14}/>
//                      </button>
//                      <span className="mx-2 text-sm font-bold w-4 text-center">{item.quantity}</span>
//                      <button 
//                        onClick={() => updateQuantity(item.id, item.quantity + 1)} 
//                        className="p-2 hover:bg-white rounded shadow-sm"
//                      >
//                        <Plus size={14}/>
//                      </button>
//                   </div>
//                 </div>
//                 ) : null
//               ))
//             )}
//           </div>

//           {/* --- Summary --- */}
//           <div className="w-full lg:w-96 space-y-6">
//             <div className="bg-white p-6 rounded-xl shadow-sm sticky top-4">
//               <h3 className="font-bold text-lg mb-4">สรุปคำสั่งซื้อ</h3>
//               <div className="space-y-3 mb-6 pb-6 border-b border-gray-100 text-sm">
//                 <div className="flex justify-between text-gray-600">
//                   <span>ยอดรวมสินค้า</span>
//                   <span>฿{cartTotal.toLocaleString()}</span>
//                 </div>
//                 <div className="flex justify-between text-gray-600">
//                   <span>ค่าจัดส่ง</span>
//                   <span>฿{shippingFee}</span>
//                 </div>
//               </div>
//               <div className="flex justify-between font-bold text-lg mb-6 text-gray-800">
//                 <span>ยอดรวมทั้งหมด</span>
//                 <span className="text-[#D65A31]">฿{total.toLocaleString()}</span>
//               </div>
//               <button 
//                 onClick={() => setShowPaymentModal(true)}
//                 disabled={cartItems.length === 0}
//                 className="w-full bg-[#D65A31] text-white py-3 rounded-lg font-bold hover:bg-[#b54622] disabled:opacity-50"
//               >
//                 ดำเนินการชำระเงิน
//               </button>
//             </div>
//           </div>

//         </div>

//         {/* Modal Payment (เหมือนเดิม) */}
//         {showPaymentModal && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
//              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-8 relative flex flex-col items-center">
//                 <button onClick={() => setShowPaymentModal(false)} className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200"><X size={20}/></button>
//                 <h2 className="text-xl font-bold mb-4">ชำระเงิน</h2>
//                 <div className="font-bold text-3xl text-[#D65A31] mb-6">฿{total.toLocaleString()}</div>
                
//                 {/* Upload Section */}
//                 <label className="border-2 border-dashed border-gray-300 p-8 rounded-xl cursor-pointer hover:bg-gray-50 flex flex-col items-center mb-6 w-full max-w-sm">
//                    {slipFile ? (
//                       <div className="text-green-600 font-bold">{slipFile.name}</div>
//                    ) : (
//                       <>
//                         <Upload size={40} className="text-gray-400 mb-2"/>
//                         <span className="text-gray-500">อัปโหลดสลิป</span>
//                       </>
//                    )}
//                    <input type="file" className="hidden" onChange={(e) => e.target.files && setSlipFile(e.target.files[0])} />
//                 </label>

//                 <button onClick={handleCheckout} disabled={!slipFile || isProcessing} className="bg-[#D65A31] text-white px-8 py-3 rounded-lg font-bold disabled:opacity-50">
//                    {isProcessing ? "กำลังดำเนินการ..." : "ยืนยัน"}
//                 </button>
//              </div>
//           </div>
//         )}

//       </div>
//     </div>
//   );
// };

// export default Cart;
import { useState , useEffect} from 'react';
import { Trash2, Minus, Plus, MapPin, X, Upload, QrCode, CheckCircle } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [slipFile, setSlipFile] = useState<File | null>(null);
  const defaultAddress = "มหาวิทยาลัยสงขลานครินทร์ 15 ถนน กาญจนวณิชย์ คอหงส์ อำเภอหาดใหญ่ สงขลา 90110";
  const [address, setAddress] = useState(defaultAddress);

  const { cartItems, removeFromCart, updateQuantity, cartTotal, fetchCart } = useCart();
  const { user } = useAuth();

  useEffect(() => {
    // ถ้ามีข้อมูล user ล็อกอินอยู่ และ user คนนั้นมี address บันทึกไว้
    if (user && (user as any).address && (user as any).address.trim() !== "") {
        setAddress((user as any).address); // ให้ใช้ที่อยู่ของ user
    } else {
        setAddress(defaultAddress); // ถ้าไม่มี ให้ใช้ที่อยู่ ม.อ. แทน
    }
  }, [user]);
  
  const shippingFee = cartItems.length > 0 ? 150 : 0; 
  const total = cartTotal + shippingFee;

  // ฟังก์ชันดึงรูปภาพแบบ Safe (แก้ขีดแดงเรื่อง .image vs .images)
  const getImageUrl = (product: any) => {
    if (!product) return "https://via.placeholder.com/150";
    const img = product.image || (Array.isArray(product.images) ? product.images[0] : product.images);
    if (!img) return "https://via.placeholder.com/150";
    return img.startsWith('http') ? img : `http://localhost:3000/uploads/products/${img}`;
  };

  const handleCheckout = async () => {
    if (!slipFile) return alert("กรุณาอัปโหลดสลิปการโอนเงิน");
    try {
      setIsProcessing(true);
      const checkoutRes = await api.checkout(address);
      // ใช้ ID จากผลลัพธ์การ Checkout
      const orderId = checkoutRes.id || checkoutRes.orderId;
      await api.uploadSlip(orderId, slipFile);
      
      alert("สั่งซื้อเรียบร้อย!");
      setShowPaymentModal(false);
      await fetchCart();
      navigate('/order-history');
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
                // เช็คว่ามี item.product ไหมเพื่อกันแดง
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
                      {/* แก้ขีดแดง category ด้วยการใช้ any หรือเช็คค่า */}
                      <p className="text-gray-400 text-sm mb-2">{(item.product as any).category || "ทั่วไป"}</p>
                      <div className="font-bold text-[#D65A31] text-lg">฿{Number(item.product.price).toLocaleString()}</div>
                    </div>
                    
                    {/* ส่วนปรับจำนวน */}
                    <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1 shadow-inner">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-2 text-gray-400 hover:text-black transition-colors disabled:opacity-30" disabled={item.quantity <= 1}><Minus size={16}/></button>
                      <span className="w-8 text-center font-bold text-sm">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-2 text-gray-400 hover:text-black transition-colors"><Plus size={16}/></button>
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
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-white/60">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-gray-800">ที่อยู่จัดส่ง</h4>
                <button className="text-xs text-[#148F96] font-bold hover:underline">คลิกเพื่อเปลี่ยน</button>
              </div>
              <div className="flex gap-3 text-sm text-gray-600 bg-[#F9FBFC] p-4 rounded-xl border border-dashed border-gray-200">
                <MapPin className="text-[#148F96] flex-shrink-0" size={18} />
                <p className="leading-relaxed">{address}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-white/60">
              <h4 className="font-bold text-gray-800 mb-4">สรุปคำสั่งซื้อ</h4>
              <div className="space-y-3 text-sm mb-6 border-b border-gray-50 pb-6">
                <div className="flex justify-between text-gray-500">
                  <span>ยอดรวมย่อย</span>
                  <span className="font-medium text-gray-800">฿{cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ค่าบริการติดตั้ง</span>
                  <span className="text-green-600 font-medium">฿0</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-medium text-gray-800">฿{shippingFee}</span>
                </div>
              </div>
              <div className="flex justify-between font-bold text-xl mb-8">
                <span className="text-gray-800">ยอดรวมทั้งหมด</span>
                <span className="text-[#D65A31]">฿{total.toLocaleString()}</span>
              </div>
              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={cartItems.length === 0}
                className="w-full bg-[#D65A31] text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-[#D65A31]/20 hover:bg-[#bd4e2a] transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100"
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
               <div className="w-56 h-56 bg-white rounded-2xl flex items-center justify-center border-4 border-gray-50 mb-8 shadow-inner overflow-hidden">
                  <QrCode size={180} className="text-gray-800" />
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
                      <span className="text-sm font-bold text-gray-500">ลากไฟล์สลิปมาวางที่นี่</span>
                      <span className="text-xs text-gray-400 mt-2 bg-gray-100 px-4 py-1 rounded-full">หรือ เลือกจากเครื่อง</span>
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
    </div>
  );
};

export default Cart;