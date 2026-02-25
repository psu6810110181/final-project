import { useState, useEffect } from 'react';
// import api from '../services/api'; // หากคุณมี axios instance ที่ตั้งค่าไว้แล้ว

interface ReviewData {
  id: number;
  productId: number;
  rating: number;
  comment: string;
  createdAt: string;
}

const Review = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // ดึงข้อมูลรีวิวทั้งหมดเมื่อเปิดหน้านี้
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // ตัวอย่างการเรียก API ไปที่ GET /reviews
      // const response = await api.get('/reviews');
      // setReviews(response.data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    setLoading(true);
    try {
      const newReview = {
        productId: 1, // กำหนด ID สินค้าที่ต้องการรีวิว
        rating,
        comment,
      };

      // ส่งข้อมูลไปยัง API POST /reviews
      // await api.post('/reviews', newReview);
      
      alert('บันทึกรีวิวสำเร็จ!');
      setComment('');
      setRating(5);
      fetchReviews(); // โหลดข้อมูลใหม่หลังจากรีวิวเสร็จ
    } catch (error) {
      console.error('Error creating review:', error);
      alert('เกิดข้อผิดพลาดในการส่งรีวิว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-800 border-b pb-4">รีวิวสินค้า</h1>

      {/* Review Form */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
        <h2 className="text-xl font-semibold mb-4">เขียนรีวิวของคุณ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              คะแนน (1-5)
            </label>
            <select 
              value={rating} 
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full md:w-32 border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5].map((num) => (
                <option key={num} value={num}>{num} ดาว</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความคิดเห็น
            </label>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
              rows={4}
              placeholder="บอกความรู้สึกของคุณเกี่ยวกับสินค้านี้..."
              className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`px-6 py-2 rounded-md text-white font-medium ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 transition'}`}
          >
            {loading ? 'กำลังส่ง...' : 'ส่งรีวิว'}
          </button>
        </form>
      </div>

      {/* Reviews List */}
      <div>
        <h3 className="text-xl font-semibold mb-4">รีวิวจากผู้ใช้งาน (ตัวอย่าง)</h3>
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <p className="text-gray-500">ยังไม่มีรีวิวสำหรับสินค้านี้</p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="bg-gray-50 p-4 rounded-md border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-blue-600">{rev.rating} / 5 ดาว</span>
                  <span className="text-sm text-gray-400">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Review;