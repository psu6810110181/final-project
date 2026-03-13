// frontend/src/components/Product/ProductReviews.tsx
import React, { useState } from 'react';
import { Star, Filter, User, Check } from 'lucide-react';

interface ProductReviewsProps {
  reviews: any[];
  API_BASE_URL: string;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews, API_BASE_URL }) => {
  const [filterRating, setFilterRating] = useState<number | null>(null);

  const filteredReviews = filterRating 
    ? reviews.filter(r => Math.round(r.rating) === filterRating)
    : reviews;

  const getReviewCountByRating = (rating: number) => {
    return reviews.filter(r => Math.round(r.rating) === rating).length;
  };

  return (
    <div className="border-t border-gray-100 pt-8">
      <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2 border-l-4 border-[#D65A31] pl-3">
        รีวิวจากลูกค้า 
        <span className="text-sm font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{reviews.length}</span>
      </h2>

      {reviews.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-8 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="flex items-center gap-1 text-sm font-bold text-gray-600 mr-2"><Filter size={16}/> กรองตาม:</span>
          <button 
            onClick={() => setFilterRating(null)}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors border ${filterRating === null ? 'bg-[#148F96] text-white border-[#148F96]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#148F96]'}`}
          >
            ทั้งหมด ({reviews.length})
          </button>
          {[5, 4, 3, 2, 1].map(star => (
            <button 
              key={star}
              onClick={() => setFilterRating(star)}
              className={`flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-full transition-colors border ${filterRating === star ? 'bg-[#148F96] text-white border-[#148F96]' : 'bg-white text-gray-600 border-gray-200 hover:border-[#148F96]'}`}
            >
              {star} ดาว <span className="opacity-70 text-xs">({getReviewCountByRating(star)})</span>
            </button>
          ))}
        </div>
      )}

      {filteredReviews.length > 0 ? (
        <div className="grid gap-6">
          {filteredReviews.map((review) => {
            const userName = review.user?.name || review.user?.username || 'ผู้ใช้งานไม่ระบุตัวตน';
            const userProfileImg = review.user?.profileImage || review.user?.image;

            return (
              <div key={review.id} className="border-b border-gray-50 pb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 overflow-hidden ring-1 ring-gray-200">
                    {userProfileImg ? (
                      <img src={userProfileImg.startsWith('http') ? userProfileImg : `${API_BASE_URL}/uploads/${userProfileImg}`} alt={userName} className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} className="text-gray-400" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-700 text-sm">{userName}</span>
                      <span className="text-[10px] bg-green-50 text-green-600 border border-green-200 px-1.5 py-0.5 rounded flex items-center gap-1"><Check size={10}/> สั่งซื้อแล้ว</span>
                    </div>
                    <div className="flex items-center mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} />
                      ))}
                      <span className="text-[10px] text-gray-400 ml-2">
                        {new Date(review.createdAt).toLocaleDateString('th-TH')}
                      </span>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 text-sm sm:text-base ml-[52px] bg-gray-50 p-3 rounded-r-xl rounded-bl-xl inline-block">{review.comment}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
          <div className="mx-auto w-12 h-12 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm"><Star size={24} className="text-gray-300"/></div>
          {filterRating ? `ไม่มีรีวิวระดับ ${filterRating} ดาว` : "ยังไม่มีรีวิวสำหรับสินค้านี้ มารีวิวเป็นคนแรกสิ!"}
        </div>
      )}
    </div>
  );
};

export default ProductReviews;