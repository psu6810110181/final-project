// frontend/src/pages/ProductDetail.tsx
import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Star, Minus, Plus, ChevronRight, Loader, User, Filter } from 'lucide-react'; // ✅ เพิ่ม User, Filter
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; 
import toast from 'react-hot-toast'; 
import * as api from '../services/api'; 
import type { Product } from '../services/api'; 
import PromotionBadge from '../components/PromotionBadge';
import PriceDisplay from '../components/PriceDisplay'; 

const ProductDetail = () => {
  const { id } = useParams(); 
  const { addToCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate(); 

  // --- STATE ---
  const [product, setProduct] = useState<Product | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installationQty, setInstallationQty] = useState(0); 
  const [isAdding, setIsAdding] = useState(false); 
  
  // ✅ เพิ่ม State สำหรับจัดการ Review
  const [reviews, setReviews] = useState<any[]>([]); 
  const [filterRating, setFilterRating] = useState<number | null>(null); // null = แสดงทั้งหมด

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const [productData, reviewsData] = await Promise.all([
          api.getProductById(id),
          api.getReviewsByProduct(id) 
        ]);
        setProduct(productData as any); 
        setReviews(reviewsData); 
      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500">ไม่พบสินค้า</div>;

  // --- ✅ จัดการรูปภาพ (รวมภาพหลักและภาพจาก Variant) ---
  const images: string[] = (() => {
    if (!product) return [];
    
    let allImages: string[] = [];

    // 1. ดึงภาพหลัก
    const rawMain = (product as any).image || (product as any).images;
    if (rawMain) {
        if (Array.isArray(rawMain)) {
            allImages = [...allImages, ...rawMain];
        } else if (typeof rawMain === 'string') {
            if (rawMain.startsWith('[') && rawMain.endsWith(']')) {
                try { allImages = [...allImages, ...JSON.parse(rawMain)]; } catch (e) { allImages.push(rawMain); }
            } else {
                allImages.push(rawMain);
            }
        }
    }

    // 2. ดึงภาพจาก Variants (ถ้ามี) มารวมด้วย เพื่อให้มีภาพที่ 2 โผล่มา
    if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((v: any) => {
            if (v.image && !allImages.includes(v.image)) {
                allImages.push(v.image);
            }
        });
    }

    if (allImages.length === 0) return ["https://via.placeholder.com/600x400?text=No+Image"];
    return allImages;
  })();

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const getImageUrl = (img: string) => {
     if (!img) return "https://via.placeholder.com/600x400?text=No+Path";
     if (img.startsWith('http')) return img;
     // ใช้ Path ตรงกับหน้า Home
     return `${API_BASE_URL}/uploads/${img}`;
   };

  const handleAddToCart = async () => {
    if (!user) {
       toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
       navigate('/login');
       return;
    }
    if (!id) return; 
    try {
        setIsAdding(true);
        await addToCart(id, quantity, installationQty); 
    } catch (error) {
        console.error(error);
    } finally {
        setIsAdding(false);
    }
  }; 

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  // ✅ ฟังก์ชันกรองรีวิว
  const filteredReviews = filterRating 
    ? reviews.filter(r => Math.round(r.rating) === filterRating)
    : reviews;

  // ✅ ฟังก์ชันนับจำนวนดาว
  const getReviewCountByRating = (rating: number) => {
      return reviews.filter(r => Math.round(r.rating) === rating).length;
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10 font-sans">
      <div className="container mx-auto px-4 py-6">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
           <Link to="/" className="hover:text-[#D65A31]">หน้าแรก</Link> 
           <ChevronRight size={14}/> 
           <span>สินค้า</span> 
           <ChevronRight size={14}/> 
           <span className="text-[#148F96] font-bold line-clamp-1">{product.name}</span>
        </div>

        {/* --- ส่วนบน: รูปภาพ และ ข้อมูลสินค้า --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          
          {/* LEFT: Image Gallery (✅ ซูมภาพ) */}
          <div className="flex gap-4 h-[400px] md:h-[450px]">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-20 overflow-y-auto no-scrollbar">
              {images.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 
                   ${selectedImageIndex === index ? 'border-[#D65A31] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={getImageUrl(img)} alt={`preview-${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image with Hover Zoom */}
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative cursor-zoom-in group">
               <img 
                 src={getImageUrl(images[selectedImageIndex])} 
                 alt={product.name} 
                 className="w-full h-full object-contain mix-blend-multiply transition-transform duration-200 group-hover:scale-[2]" 
                 onMouseMove={(e) => {
                    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
                    const x = ((e.clientX - left) / width) * 100;
                    const y = ((e.clientY - top) / height) * 100;
                    e.currentTarget.style.transformOrigin = `${x}% ${y}%`;
                 }}
               />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <div className="mb-3"><PromotionBadge productId={product.id} /></div>
            <div className="mb-1"><PriceDisplay productId={product.id} originalPrice={Number(product.price)} /></div>
            <p className="text-gray-400 text-xs mb-4">Stock: {product.stock} ชิ้น</p>
            
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              ))}
              <span className="text-gray-500 text-sm ml-2">{averageRating} ({reviews.length} รีวิว)</span>
            </div>

            {/* Options */}
            <div className="space-y-5 border-t border-gray-100 pt-5">
               <div>
                  <span className="font-bold text-gray-800 block mb-2">บริการเสริม</span>
                  <div className="flex items-center justify-between border border-gray-200 p-3 rounded-lg w-full sm:w-80">
                     <span className="text-gray-600 text-sm">รับบริการติดตั้ง (+฿400/ชิ้น)</span>
                     <div className="flex items-center bg-gray-50 border border-gray-300 rounded overflow-hidden">
                        <button onClick={() => setInstallationQty(Math.max(0, installationQty - 1))} className="p-1.5 hover:bg-white text-gray-500 transition-colors"><Minus size={14}/></button>
                        <span className="w-8 text-center text-sm font-bold py-1">{installationQty}</span>
                        <button onClick={() => setInstallationQty(Math.min(quantity, installationQty + 1))} className="p-1.5 hover:bg-white text-gray-500 transition-colors"><Plus size={14}/></button>
                     </div>
                  </div>
                  <span className="text-xs text-red-400 mt-1 block">*เลือกติดตั้งได้สูงสุดตามจำนวนสินค้าที่ซื้อ (4 ชิ้นขึ้นไปเหมาจ่าย 990 บาท)</span>
               </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pt-4">
                <div>
                    <span className="font-bold text-gray-800 block mb-2">จำนวน</span>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                      <button onClick={() => { const newQty = Math.max(1, quantity - 1); setQuantity(newQty); if (installationQty > newQty) setInstallationQty(newQty); }} className="p-3 hover:bg-gray-100 transition-colors"><Minus size={16}/></button>
                      <input type="text" value={quantity} readOnly className="w-12 text-center text-sm font-bold border-x border-gray-300 py-2"/>
                      <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="p-3 hover:bg-gray-100 transition-colors" disabled={quantity >= product.stock}><Plus size={16}/></button>
                    </div>
                </div>

                <button 
                    onClick={handleAddToCart}
                    disabled={isAdding || product.stock === 0}
                    className="flex-1 bg-[#D65A31] hover:bg-[#b54622] text-white py-3 px-8 rounded-lg font-bold text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isAdding ? <><Loader className="animate-spin" size={20}/> กำลังเพิ่ม...</> : product.stock === 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- ส่วนล่าง: รายละเอียดและรีวิว --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
             <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">รายละเอียดเพิ่มเติม</h2>
                <p className="text-gray-600">Category: {product.category} <br/>{product.description}</p>
             </div>

             <div className="border-t border-gray-100 pt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    รีวิวจากลูกค้า 
                    <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
                </h2>

                {/* ✅ Filter Reviews */}
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

                {/* ✅ แสดงรีวิว (ใช้ Username จริง) */}
                {filteredReviews.length > 0 ? (
                    <div className="grid gap-6">
                        {filteredReviews.map((review) => {
                            // ดึง Username จริงจาก Backend (ถ้าไม่มีให้ fallback)
                            const userName = review.user?.name || review.user?.username || 'ผู้ใช้งานไม่ระบุตัวตน';
                            const userProfileImg = review.user?.profileImage || review.user?.image;

                            return (
                                <div key={review.id} className="border-b border-gray-50 pb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        
                                        {/* Avatar ผู้ใช้ */}
                                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 overflow-hidden ring-1 ring-gray-200">
                                            {userProfileImg ? (
                                                <img src={userProfileImg.startsWith('http') ? userProfileImg : `${API_BASE_URL}/uploads/${userProfileImg}`} alt={userName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={20} className="text-gray-400" />
                                            )}
                                        </div>

                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-bold text-gray-700">{userName}</span>
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
                                    <p className="text-gray-600 text-sm ml-[52px]">{review.comment}</p>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                        {filterRating ? `ไม่มีรีวิวระดับ ${filterRating} ดาว` : "ยังไม่มีรีวิวสำหรับสินค้านี้"}
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;