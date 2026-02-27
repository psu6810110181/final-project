import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { createReview } from '../services/api';

const Review = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // ดึงค่าจาก URL เช่น /review?productId=123&orderId=456
  const productId = searchParams.get('productId');
  const orderId = searchParams.get('orderId');

  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ถ้าเข้ามาโดยไม่มี Parameter ให้แสดงหน้า Error (ป้องกันการเข้า URL ตรงๆ)
  if (!productId || !orderId) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center mt-10">
        <h2 className="text-2xl font-bold text-red-500 mb-4">ข้อมูลไม่ครบถ้วน</h2>
        <p className="text-gray-600">กรุณาทำการรีวิวผ่านหน้าประวัติคำสั่งซื้อของคุณ</p>
        <button 
          onClick={() => navigate('/orders')}
          className="mt-6 px-4 py-2 bg-[#148F96] text-white rounded-md hover:bg-[#107076] transition"
        >
          กลับไปหน้าคำสั่งซื้อ
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) {
      alert('กรุณากรอกความคิดเห็นของคุณ');
      return;
    }

    setLoading(true);
    try {
      await createReview({
        productId,
        orderId,
        rating,
        comment,
      });
      
      alert('ขอบคุณสำหรับรีวิวของคุณ!');
      // รีวิวเสร็จ เด้งกลับไปหน้าสินค้านั้นเพื่อดูรีวิวตัวเอง
      navigate(`/product/${productId}`); 
    } catch (error: any) {
      console.error('Error creating review:', error);
      // ตรวจสอบ Error จาก Backend (เช่น กรณีที่เคยรีวิวไปแล้ว)
      const errorMsg = error.response?.data?.message || 'เกิดข้อผิดพลาดในการส่งรีวิว กรุณาลองใหม่อีกครั้ง';
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 font-sans">
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-gray-800 border-b pb-4 mb-8">เขียนรีวิวสินค้า</h1>

        <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* ส่วนให้คะแนน */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ให้คะแนนสินค้า (1-5 ดาว)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setRating(num)}
                    className={`text-4xl transition-transform hover:scale-110 focus:outline-none ${
                      rating >= num ? 'text-yellow-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            {/* ส่วนความคิดเห็น */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ความคิดเห็นของคุณ
              </label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={5}
                placeholder="บอกความรู้สึกของคุณเกี่ยวกับสินค้านี้ ทั้งคุณภาพ การใช้งาน และบริการ..."
                className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-[#D65A31] focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* ปุ่ม Submit */}
            <div className="flex gap-4 pt-4 border-t border-gray-100">
              <button 
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-lg text-gray-600 font-medium bg-gray-100 hover:bg-gray-200 transition w-full sm:w-auto"
              >
                ยกเลิก
              </button>
              <button 
                type="submit" 
                disabled={loading}
                className={`flex-1 sm:flex-none px-8 py-3 rounded-lg text-white font-bold shadow-md transition ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#D65A31] hover:bg-[#b54622] active:scale-95'
                }`}
              >
                {loading ? 'กำลังบันทึก...' : 'ส่งรีวิว'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Review;