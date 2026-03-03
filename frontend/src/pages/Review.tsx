import React, { useState, useEffect } from 'react';
import { Star, Send, Loader, Package, ChevronLeft, MessageSquare } from 'lucide-react';
import * as api from '../services/api';

// --- กำหนด Interface เพื่อแก้ปัญหาขีดแดง TypeScript ---
interface ReviewItem {
  id: string; // id ของ OrderItem
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
  // --- STATE ---
  const [purchasedItems, setPurchasedItems] = useState<ReviewItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<ReviewItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FETCH DATA ---
  // แยกฟังก์ชันออกมาเพื่อให้เรียกซ้ำได้หลังจากรีวิวสำเร็จ
  const fetchHistory = async () => {
    try {
      setLoading(true);
      // ดึงข้อมูลออเดอร์ทั้งหมดของ User (รวมข้อมูลรีวิวที่ Backend ส่งมาด้วย)
      const data = await (api as any).getMyOrders();
      
      if (data && Array.isArray(data)) {
        // เอาออเดอร์ที่ไม่ถูก cancelled
        const availableOrders = data.filter(
          (order: any) => order.status?.toLowerCase() !== 'cancelled'
        );

        // แตกรายการ items ออกมาเป็นชิ้นๆ และกรองตัวที่รีวิวแล้วออก
        const itemsToReview: ReviewItem[] = availableOrders.flatMap((order: any) => {
          // ดึงไอดีของสินค้าในออเดอร์นี้ที่ถูกรีวิวไปแล้ว
          const reviewedProductIds = (order.reviews || []).map((r: any) => r.product?.id);

          return (order.items || [])
            // กรองเอาเฉพาะสินค้าที่ไอดียังไม่อยู่ใน reviewedProductIds
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
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // --- ฟังก์ชันส่งรีวิว ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || rating === 0) {
      alert("กรุณาให้คะแนนดาวด้วยครับ");
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
      
      alert("บันทึกรีวิวสำเร็จ ขอบคุณครับ!");
      setSelectedProduct(null); // กลับหน้าเลือกสินค้า
      setRating(0);
      setComment("");
      
      // โหลดข้อมูลประวัติการสั่งซื้อใหม่ เพื่อให้สินค้าที่เพิ่งรีวิวหายไปจากรายการ
      fetchHistory();
      
    } catch (error: any) {
      console.error("Submit review failed", error);
      const errorMsg = error.response?.data?.message || "เกิดข้อผิดพลาดในการส่งรีวิว";
      alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Helper: จัดการ Path รูปภาพ ---
  const getImageUrl = (img: string) => {
    if (!img) return "https://via.placeholder.com/150";
    if (img.startsWith('http')) return img;
    return `http://localhost:3000/uploads/${img}`;
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center text-gray-500 gap-4">
      <Loader className="animate-spin text-[#148F96]" size={40} />
      <p>กำลังโหลดข้อมูลสินค้าที่คุณซื้อ...</p>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen py-10 font-sans">
      <div className="container mx-auto px-4 max-w-4xl">
        
        {!selectedProduct ? (
          /* --- MODE 1: รายการสินค้ารอรีวิว --- */
          <>
            <div className="flex items-center gap-3 mb-8">
              <MessageSquare className="text-[#148F96]" size={28} />
              <h1 className="text-2xl font-bold text-gray-800">สินค้ารอการรีวิว</h1>
              <span className="bg-[#148F96] text-white text-xs px-2 py-1 rounded-full">
                {purchasedItems.length} รายการ
              </span>
            </div>

            <div className="grid gap-4">
              {purchasedItems.length > 0 ? purchasedItems.map((item, idx) => (
                <div key={`${item.orderId}-${idx}`} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4 hover:border-[#148F96] transition-all">
                  <div className="flex items-center gap-4 w-full">
                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 flex-shrink-0">
                       <img 
                        src={getImageUrl(item.product.image)} 
                        className="w-full h-full object-cover" 
                        alt={item.product.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
                       />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800 line-clamp-1">{item.product.name}</h3>
                      <p className="text-xs text-gray-400 mt-1">ออเดอร์: #{item.orderId.slice(-8)}</p>
                      <p className="text-xs text-gray-500">ซื้อเมื่อ: {new Date(item.orderDate).toLocaleDateString('th-TH')}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedProduct(item)}
                    className="w-full sm:w-auto bg-[#148F96] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#0f6f75] transition-all active:scale-95 whitespace-nowrap"
                  >
                    เขียนรีวิว
                  </button>
                </div>
              )) : (
                <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                  <Package className="mx-auto mb-4 text-gray-300" size={64} />
                  <p className="text-gray-400 text-lg">ไม่มีสินค้ารอการรีวิวในขณะนี้</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* --- MODE 2: ฟอร์มเขียนรีวิว --- */
          <div className="max-w-2xl mx-auto">
            <button 
              onClick={() => setSelectedProduct(null)} 
              className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
              <ChevronLeft size={20} /> กลับไปหน้าเลือกสินค้า
            </button>

            <div className="bg-white rounded-3xl shadow-sm p-8 border border-gray-100">
              <div className="text-center mb-8">
                <div className="w-24 h-24 bg-gray-50 rounded-2xl overflow-hidden mx-auto mb-4 border border-gray-100">
                  <img src={getImageUrl(selectedProduct.product.image)} className="w-full h-full object-cover" alt="" />
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">{selectedProduct.product.name}</h2>
                <p className="text-sm text-gray-400 italic">"ความพึงพอใจของคุณคือความภูมิใจของเรา"</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Star Rating */}
                <div className="flex flex-col items-center justify-center py-6 bg-orange-50/50 rounded-2xl border border-orange-100">
                  <span className="text-sm text-orange-600 font-bold mb-4">ให้คะแนนสินค้า</span>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                        className="transition-transform active:scale-90 p-1"
                      >
                        <Star
                          size={42}
                          className={`${
                            star <= (hover || rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <span className="mt-4 font-bold text-[#148F96] animate-in fade-in slide-in-from-top-1">
                      {rating === 5 ? '🌟 ยอดเยี่ยมที่สุด' : rating === 4 ? '😊 ดีมาก' : rating === 3 ? '😐 พอใช้' : rating === 2 ? '😞 ควรปรับปรุง' : '👎 แย่มาก'}
                    </span>
                  )}
                </div>

                {/* Comment Area */}
                <div>
                  <label className="block text-gray-700 font-bold mb-3">แชร์ประสบการณ์การใช้งาน</label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="สินค้านี้เป็นอย่างไรบ้าง? บอกให้เพื่อนๆ รู้หน่อย..."
                    className="w-full h-40 p-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#148F96] focus:border-transparent outline-none transition-all resize-none bg-gray-50/30"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || rating === 0}
                  className="w-full bg-[#D65A31] hover:bg-[#b54622] text-white py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-orange-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? <Loader className="animate-spin" /> : <Send size={20} />}
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