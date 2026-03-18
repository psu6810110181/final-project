import React, { useState, useEffect } from 'react';
import { Star, Send, Loader, Package, ChevronLeft, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import toast from 'react-hot-toast'; 

interface ReviewItem {
  id: string; 
  quantity: number;
  product: {
    id: string;
    name: string;
    image: string;
  };
  orderDate: string;
  orderId: string;
}

const ReviewPage = () => {
  const [purchasedItems, setPurchasedItems] = useState<ReviewItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ReviewItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  // ✅ สร้างฟังก์ชันช่วยดึง Token
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');
  const isLoggedIn = !!getToken();

  const fetchHistory = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    try {
      setLoading(true);
      const data = await (api as any).getMyOrders();
      if (data && Array.isArray(data)) {
        const availableOrders = data.filter((order: any) => order.status?.toLowerCase() !== 'cancelled');
        const itemsToReview: ReviewItem[] = availableOrders.flatMap((order: any) => {
          const reviewedProductIds = (order.reviews || []).map((r: any) => r.product?.id);
          return (order.items || [])
            .filter((item: any) => !reviewedProductIds.includes(item.product?.id))
            .map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              product: {
                id: item.product?.id,
                name: item.product?.name || 'สินค้าไม่ทราบชื่อ',
                image: item.product?.image
              },
              orderDate: order.orderDate || order.createdAt,
              orderId: order.id
            }));
        });
        setPurchasedItems(itemsToReview);
      }
    } catch (error) {
      console.error("Failed to fetch history:", error);
    } finally {
      setLoading(false);
      setIsVisible(true);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || rating === 0) {
      toast.error("กรุณาให้คะแนนดาวด้วยครับ"); 
      return;
    }
    try {
      setIsSubmitting(true);
      await (api as any).createReview({
        productId: selectedProduct.product.id,
        orderId: selectedProduct.orderId, 
        rating,
        comment
      });
      toast.success("บันทึกรีวิวสำเร็จ ขอบคุณครับ!"); 
      setSelectedProduct(null); 
      setRating(0);
      setComment("");
      fetchHistory();
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งรีวิว";
      toast.error(errorMsg); 
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (img: string) => {
    if (!img) return "https://via.placeholder.com/150";
    if (img.startsWith('http')) return img;
    return `${API_URL}/uploads/${img}`;
  };

  if (!isLoggedIn) return null;

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-[#148F96] gap-4 bg-[#F8FAFA]">
      <Loader className="animate-spin" size={48} />
      <p className="text-slate-500 font-medium tracking-wide">กำลังเตรียมข้อมูล...</p>
    </div>
  );

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative overflow-hidden font-sans">
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#148F96]/10 blur-[150px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className={`relative z-10 container mx-auto px-4 py-12 max-w-4xl transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {!selectedProduct ? (
          <>
            <div className="flex items-center gap-4 mb-10 border-b border-slate-200/50 pb-6">
              <div className="p-3 bg-white/60 backdrop-blur-md rounded-2xl shadow-sm border border-white">
                <MessageSquare className="text-[#148F96]" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">สินค้ารอการรีวิว</h1>
                <p className="text-slate-500 mt-1">แบ่งปันประสบการณ์ของคุณเพื่อเป็นประโยชน์กับผู้อื่น</p>
              </div>
              <span className="ml-auto bg-[#148F96] text-white text-sm font-bold px-4 py-1.5 rounded-full shadow-lg shadow-[#148F96]/30">
                {purchasedItems.length} รายการ
              </span>
            </div>

            <div className="grid gap-6">
              {purchasedItems.length > 0 ? purchasedItems.map((item, idx) => (
                <div key={`${item.orderId}-${idx}`} className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-lg shadow-slate-200/50 border border-white hover:border-[#148F96]/30 flex flex-col sm:flex-row items-center justify-between gap-6 transition-all duration-300 hover:-translate-y-1">
                  <div className="flex items-center gap-6 w-full">
                    <div className="w-24 h-24 bg-slate-50 rounded-2xl overflow-hidden border border-white shadow-sm flex-shrink-0">
                       <img 
                        src={getImageUrl(item.product.image)} 
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-500" 
                        alt={item.product.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
                       />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800 line-clamp-1 mb-1">{item.product.name}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="bg-slate-100 px-2.5 py-1 rounded-md font-medium">ออเดอร์ #{item.orderId.slice(-8)}</span>
                        <span>ซื้อเมื่อ: {new Date(item.orderDate).toLocaleDateString('th-TH')}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(item)}
                    className="w-full sm:w-auto bg-[#0caab3] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#148F96] hover:shadow-lg hover:shadow-[#148F96]/30 transition-all active:scale-95 whitespace-nowrap"
                  >
                    เขียนรีวิว
                  </button>
                </div>
              )) : (
                <div className="text-center py-24 bg-white/50 backdrop-blur-md rounded-[3rem] border border-white shadow-xl">
                  <Package className="mx-auto mb-6 text-slate-300" size={80} />
                  <h3 className="text-2xl font-bold text-slate-700 mb-2">ไม่มีสินค้าที่รอการรีวิว</h3>
                  <p className="text-slate-500">เมื่อคุณสั่งซื้อและได้รับสินค้าแล้ว สามารถมารีวิวได้ที่นี่</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="max-w-2xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="flex items-center gap-2 text-slate-500 hover:text-[#148F96] font-bold mb-8 transition-colors bg-white/50 px-4 py-2 rounded-full w-fit border border-white backdrop-blur-sm"
            >
              <ChevronLeft size={20} /> กลับไปหน้ารายการ
            </button>

            <div className="bg-white/90 backdrop-blur-2xl rounded-[3rem] shadow-2xl shadow-slate-200/50 p-8 md:p-12 border border-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-400/10 blur-[50px] rounded-full pointer-events-none" />

              <div className="text-center mb-10 relative z-10">
                <div className="w-28 h-28 bg-white rounded-3xl overflow-hidden mx-auto mb-5 shadow-lg border-4 border-white">
                  <img src={getImageUrl(selectedProduct.product.image)} className="w-full h-full object-cover" alt="" />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-800 mb-2">{selectedProduct.product.name}</h2>
                <p className="text-sm text-[#148F96] font-medium bg-teal-50 px-3 py-1 rounded-full inline-block">ออเดอร์ #{selectedProduct.orderId.slice(-8)}</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-3xl border border-slate-100">
                  <span className="text-sm text-slate-500 font-bold mb-4 tracking-widest uppercase">ให้คะแนนความพึงพอใจ</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform active:scale-90 p-1 hover:scale-110"
                      >
                        <Star
                          size={48}
                          className={`transition-all duration-300 ${
                            star <= (hover || rating) 
                              ? "fill-yellow-400 text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.6)]" 
                              : "text-slate-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 h-6">
                    {rating > 0 && (
                      <span className="font-bold text-lg text-[#D65A31] animate-in zoom-in fade-in">
                        {rating === 5 ? '🌟 ยอดเยี่ยมที่สุด' : rating === 4 ? '😊 ดีมาก' : rating === 3 ? '😐 พอใช้' : rating === 2 ? '😞 ควรปรับปรุง' : '👎 แย่มาก'}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-3 ml-2">แชร์ประสบการณ์การใช้งาน</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="สินค้านี้เป็นอย่างไรบ้าง? บอกให้เพื่อนๆ รู้หน่อย..."
                    className="w-full h-40 p-5 bg-slate-50 border border-slate-200 rounded-3xl focus:bg-white focus:ring-4 focus:ring-[#148F96]/20 focus:border-[#148F96] outline-none transition-all resize-none text-slate-700 placeholder:text-slate-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-gradient-to-r from-[#D65A31] to-[#e66c45] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-xl shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-orange-500/40"
                >
                  {isSubmitting ? <Loader className="animate-spin" /> : <Send size={22} />}
                  ส่งรีวิวเลย
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewPage;