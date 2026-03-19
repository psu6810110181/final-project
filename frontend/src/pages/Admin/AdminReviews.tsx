import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, Loader, Eye, X, Search, Image as ImageIcon } from 'lucide-react';
import * as api from '../../services/api'; // ปรับ path ไปหา api.ts ตามโครงสร้างโฟลเดอร์ของคุณ
import toast from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State สำหรับ Modal ดูรายละเอียด
  const [selectedReview, setSelectedReview] = useState<any | null>(null);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await api.getAllReviews(); 
      // เนื่องจาก api.ts ทำการ return response.data มาให้แล้ว res จึงเป็น Array ทันที
      setReviews(res || []); 
    } catch (error) {
      console.error("Error fetching reviews:", error);
      toast.error("ไม่สามารถดึงข้อมูลรีวิวได้");
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imageRaw: any) => {
    if (!imageRaw) return null;
    let imgName = "";
    if (Array.isArray(imageRaw) && imageRaw.length > 0) imgName = imageRaw[0];
    else if (typeof imageRaw === 'string') {
      try { imgName = JSON.parse(imageRaw)[0]; } catch (e) { imgName = imageRaw; }
    }
    if (!imgName) return null;
    return imgName.startsWith('http') ? imgName : `${API_BASE_URL}/uploads/${imgName}`;
  };

  // Helper function สำหรับดึงชื่อลูกค้าอย่างปลอดภัย
  const getCustomerName = (user: any) => {
    if (!user) return 'Guest';
    if (user.username) return user.username;
    if (user.firstName || user.lastName) return `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return 'ไม่มีชื่อ';
  };

  // Helper function สำหรับดึง Order ID อย่างปลอดภัย
  const getOrderId = (review: any) => {
    return review.order?.id || review.orderId || review.orderItem?.order?.id || '-';
  };

  const filteredReviews = reviews.filter(r => {
    const custName = getCustomerName(r.user);
    const ordId = getOrderId(r);
    return (
      r.comment?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordId.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map(star => (
          <Star 
            key={star} 
            size={14} 
            className={star <= (rating || 0) ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-200"} 
          />
        ))}
      </div>
    );
  };

  // ฟังก์ชันหาค่าที่จะแสดงใน Modal (สินค้าหลัก vs สินค้ารอง)
  const getProductDetailsForModal = (review: any) => {
    const isVariant = !!review.productVariant;
    const mainProduct = review.product || {};
    const variant = review.productVariant || {};

    // Helper ในการดึงค่าชื่อจาก Object (เช่น category: { name: 'โต๊ะ' }) หรือ String
    const safeExtract = (obj: any) => (obj && typeof obj === 'object' ? obj.name : obj) || '-';

    // ดึง Features
    let featuresText = '-';
    if (Array.isArray(mainProduct.features) && mainProduct.features.length > 0) {
      featuresText = mainProduct.features.map((f: any) => safeExtract(f)).join(', ');
    }

    return {
      name: mainProduct.name || 'ไม่มีชื่อสินค้า',
      image: getImageUrl(variant.image || mainProduct.images || mainProduct.image),
      // ถ้ารอง: ใช้ค่าจากรอง / ถ้าหลัก: ใช้ค่าจากหลัก
      price: isVariant ? variant.price : mainProduct.price,
      color: isVariant ? safeExtract(variant.color) : safeExtract(mainProduct.color || mainProduct.mainColor),
      size: isVariant ? safeExtract(variant.size) : safeExtract(mainProduct.size || mainProduct.mainSize),
      material: isVariant ? safeExtract(variant.material) : safeExtract(mainProduct.material || mainProduct.mainMaterial),
      category: safeExtract(mainProduct.category),
      features: featuresText,
    };
  };

  if (loading) {
    return (
      <div className="bg-[#f8fafc] min-h-[80vh] flex flex-col items-center justify-center text-slate-800 rounded-[2rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <Loader className="animate-spin mb-4 text-blue-500" size={48} />
        <h2 className="text-lg font-bold tracking-wide text-slate-600">กำลังโหลดข้อมูลรีวิว...</h2>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen font-sans text-slate-800 relative overflow-hidden p-2 sm:p-4">
      
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-amber-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-100/40 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div className="border-l-4 border-amber-500 pl-5">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight drop-shadow-sm flex items-center gap-3">
              <MessageSquare className="text-amber-500" size={32} /> ระบบจัดการรีวิว
            </h1>
            <p className="text-slate-500 mt-2 text-sm font-medium tracking-wide">ดูและจัดการความคิดเห็นจากลูกค้า</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ, ลูกค้า, Order ID..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 w-full md:w-80 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="p-5 font-bold">สินค้า</th>
                  <th className="p-5 font-bold">Order ID</th>
                  <th className="p-5 font-bold">ชื่อลูกค้า</th>
                  <th className="p-5 font-bold">คะแนน</th>
                  <th className="p-5 font-bold w-1/3">คำรีวิว</th>
                  <th className="p-5 font-bold text-center">แอคชัน</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/80">
                {filteredReviews.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-slate-400 font-medium">
                      ไม่พบข้อมูลรีวิว
                    </td>
                  </tr>
                ) : (
                  filteredReviews.map((review) => {
                    const pName = review.product?.name || 'Unknown Product';
                    const imgUrl = getImageUrl(review.productVariant?.image || review.product?.images || review.product?.image);
                    const orderId = getOrderId(review);
                    const customerName = getCustomerName(review.user);

                    return (
                      <tr key={review.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="p-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                              {imgUrl ? (
                                <img src={imgUrl} alt={pName} className="w-full h-full object-cover" />
                              ) : (
                                <ImageIcon className="text-slate-300" size={20} />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-800 text-sm line-clamp-1">{pName}</div>
                              {review.productVariant && (
                                <div className="text-xs text-slate-500 mt-0.5">
                                  (Variant: {String(review.productVariant.id).substring(0,6)})
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-5">
                          <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md text-xs font-mono font-medium border border-slate-200/60">
                            {String(orderId).substring(0, 8)}...
                          </span>
                        </td>
                        <td className="p-5 text-sm font-semibold text-slate-700">
                          {customerName}
                        </td>
                        <td className="p-5">
                          {renderStars(review.rating)}
                        </td>
                        <td className="p-5">
                          <p className="text-sm text-slate-600 line-clamp-2">
                            {review.comment || '-'}
                          </p>
                        </td>
                        <td className="p-5 text-center">
                          <button 
                            onClick={() => setSelectedReview(review)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 shadow-sm rounded-xl text-xs font-bold text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:shadow-md transition-all active:scale-95"
                          >
                            <Eye size={14} /> รายละเอียด
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

      </div>

      {/* Modal ดูรายละเอียดเพิ่มเติม */}
      {selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedReview(null)}></div>
          
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <Star className="text-amber-500 fill-amber-500" size={20} /> รายละเอียดรีวิว
              </h3>
              <button onClick={() => setSelectedReview(null)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* ส่วนรีวิวและลูกค้า */}
              <div className="bg-slate-50 rounded-2xl p-5 mb-6 border border-slate-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">ข้อมูลลูกค้า</p>
                    <p className="font-semibold text-slate-800">
                      {getCustomerName(selectedReview.user)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Order ID</p>
                    <p className="font-mono text-sm font-semibold text-slate-600">
                      {getOrderId(selectedReview)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-slate-200/60 pt-4">
                  <div className="mb-2">{renderStars(selectedReview.rating)}</div>
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedReview.comment || 'ไม่มีข้อความรีวิว'}
                  </p>
                </div>
              </div>

              {/* ส่วนรายละเอียดสินค้า */}
              {(() => {
                const details = getProductDetailsForModal(selectedReview);
                return (
                  <div>
                    <h4 className="font-bold text-slate-800 mb-4 pl-1 border-l-4 border-blue-500">ข้อมูลสินค้า</h4>
                    
                    <div className="flex flex-col sm:flex-row gap-6">
                      {/* รูปสินค้า */}
                      <div className="w-full sm:w-40 h-40 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                        {details.image ? (
                          <img src={details.image} alt={details.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-300">
                            <ImageIcon size={32} />
                          </div>
                        )}
                      </div>

                      {/* ข้อมูล */}
                      <div className="flex-1 grid grid-cols-2 gap-y-4 gap-x-6">
                        
                        <div className="col-span-2">
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">ชื่อสินค้า</p>
                          <p className="font-semibold text-slate-800 text-sm">{details.name}</p>
                          {selectedReview.productVariant && (
                            <span className="inline-block mt-1.5 px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded text-[10px] font-bold">
                              สินค้ารอง (Variant)
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">ราคา</p>
                          <p className="font-bold text-emerald-600 text-sm">
                            {details.price ? `฿${Number(details.price).toLocaleString()}` : '-'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">หมวดหมู่</p>
                          <p className="font-semibold text-slate-700 text-sm">{details.category}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">สี</p>
                          <p className="font-semibold text-slate-700 text-sm">{details.color}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">ขนาด</p>
                          <p className="font-semibold text-slate-700 text-sm">{details.size}</p>
                        </div>

                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">วัสดุ</p>
                          <p className="font-semibold text-slate-700 text-sm">{details.material}</p>
                        </div>

                        <div className="col-span-2">
                          <p className="text-xs text-slate-500 font-bold uppercase mb-1">คุณสมบัติพิเศษ</p>
                          <p className="font-semibold text-slate-700 text-sm leading-relaxed">{details.features}</p>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })()}

            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end">
              <button 
                onClick={() => setSelectedReview(null)}
                className="px-6 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:bg-slate-700 transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AdminReviews;