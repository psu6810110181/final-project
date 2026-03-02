import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Star, Minus, Plus, ChevronRight, Loader } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // ✅ Import useAuth
import toast from 'react-hot-toast'; // ✅ Import toast สำหรับแจ้งเตือน
import * as api from '../services/api'; 
import type { Product } from '../services/api'; 
import PromotionBadge from '../components/PromotionBadge';
import PriceDisplay from '../components/PriceDisplay'; 

const ProductDetail = () => {
  const { id } = useParams(); 
  const { addToCart } = useCart();
  const { user } = useAuth(); // ✅ ดึงข้อมูล user
  const navigate = useNavigate(); // ✅ ดึงฟังก์ชันนำทาง

  // --- STATE ---
  const [product, setProduct] = useState<Product | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installationQty, setInstallationQty] = useState(0); 
  const [isAdding, setIsAdding] = useState(false); 
  const [reviews, setReviews] = useState<any[]>([]); 

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      if (!id) return;
      try {
        setLoading(true);
        
        // ดึงทั้งข้อมูลสินค้าและรีวิวขนานกัน
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

  // --- Loading State ---
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>;
  }

  // --- Not Found State ---
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">ไม่พบสินค้า</div>;
  }

  // --- แปลงรูปภาพ (รองรับหลายรูป) ---
  const images: string[] = (() => {
    if (!product) return [];
    
    const raw = (product as any).image || (product as any).images;
    if (!raw) return ["https://via.placeholder.com/600x400?text=No+Image"];

    if (Array.isArray(raw)) return raw;

    if (typeof raw === 'string') {
      if (raw.startsWith('[') && raw.endsWith(']')) {
        try { return JSON.parse(raw); } catch (e) { return [raw]; }
      }
      return [raw]; 
    }
    return ["https://via.placeholder.com/600x400?text=Format+Error"];
  })();

  // ✅ ปรับเปลี่ยนให้ดึง Base URL จาก Environment Variable แทนการ Hardcode (หากไม่มีให้ใช้ localhost)
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const getImageUrl = (img: string) => {
     if (!img) return "https://via.placeholder.com/600x400?text=No+Path";
     if (img.startsWith('http')) return img;
     return `${API_BASE_URL}/uploads/${img}`;
   };

  // --- ฟังก์ชันกดเพิ่มลงตะกร้า ---
  const handleAddToCart = async () => {
    // ✅ เช็คว่าล็อกอินหรือยัง
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

  // คำนวณคะแนนเฉลี่ย
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

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
          
          {/* LEFT: Image Gallery */}
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
                  <img 
                    src={getImageUrl(img)} 
                    alt={`preview-${index}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/150"; }}
                  />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
               <img src={getImageUrl(images[selectedImageIndex])} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            {/* Promotion Badge */}
            <div className="mb-3">
              <PromotionBadge productId={product.id} />
            </div>
            
            {/* Price Display */}
            <div className="mb-1">
              <PriceDisplay 
                productId={product.id} 
                originalPrice={Number(product.price)} 
              />
            </div>
            
            <p className="text-gray-400 text-xs mb-4">Stock: {product.stock} ชิ้น</p>
            
            {/* Rating จริงจาก Backend */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  size={16} 
                  className={i < Math.round(Number(averageRating)) 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-gray-300"} 
                />
              ))}
              <span className="text-gray-500 text-sm ml-2">
                {averageRating} ({reviews.length} รีวิว)
              </span>
            </div>

            {/* Options */}
            <div className="space-y-5 border-t border-gray-100 pt-5">
              
               {/* Installation Option แบบตัวเลข */}
               <div>
                  <span className="font-bold text-gray-800 block mb-2">บริการเสริม</span>
                  <div className="flex items-center justify-between border border-gray-200 p-3 rounded-lg w-full sm:w-80">
                     <span className="text-gray-600 text-sm">รับบริการติดตั้ง (+฿400/ชิ้น)</span>
                     <div className="flex items-center bg-gray-50 border border-gray-300 rounded overflow-hidden">
                        <button 
                          onClick={() => setInstallationQty(Math.max(0, installationQty - 1))} 
                          className="p-1.5 hover:bg-white text-gray-500 transition-colors"
                        ><Minus size={14}/></button>
                        <span className="w-8 text-center text-sm font-bold py-1">{installationQty}</span>
                        <button 
                          onClick={() => setInstallationQty(Math.min(quantity, installationQty + 1))} 
                          className="p-1.5 hover:bg-white text-gray-500 transition-colors"
                        ><Plus size={14}/></button>
                     </div>
                  </div>
                  <span className="text-xs text-red-400 mt-1 block">*เลือกติดตั้งได้สูงสุดตามจำนวนสินค้าที่ซื้อ (4 ชิ้นขึ้นไปเหมาจ่าย 990 บาท)</span>
               </div>

              {/* Quantity & Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pt-4">
                <div>
                    <span className="font-bold text-gray-800 block mb-2">จำนวน</span>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                      <button 
                        onClick={() => {
                          const newQty = Math.max(1, quantity - 1);
                          setQuantity(newQty);
                          if (installationQty > newQty) setInstallationQty(newQty);
                        }} 
                        className="p-3 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16}/>
                      </button>
                      <input 
                        type="text" 
                        value={quantity} 
                        readOnly 
                        className="w-12 text-center text-sm font-bold border-x border-gray-300 py-2"
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
                        className="p-3 hover:bg-gray-100 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus size={16}/>
                      </button>
                    </div>
                </div>

                <button 
                    onClick={handleAddToCart}
                    disabled={isAdding || product.stock === 0}
                    className="flex-1 bg-[#D65A31] hover:bg-[#b54622] text-white py-3 px-8 rounded-lg font-bold text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isAdding ? (
                    <><Loader className="animate-spin" size={20}/> กำลังเพิ่ม...</>
                  ) : product.stock === 0 ? (
                    "สินค้าหมด"
                  ) : (
                    "เพิ่มลงตะกร้า"
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* --- ส่วนล่าง: รายละเอียดและรีวิวจริง --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
             <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">รายละเอียดเพิ่มเติม</h2>
                <p className="text-gray-600">
                    Category: {product.category} <br/>
                    {product.description}
                </p>
             </div>

             <div className="border-t border-gray-100 pt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    รีวิวจากลูกค้า 
                    <span className="text-sm font-normal text-gray-400">({reviews.length})</span>
                </h2>

                {reviews.length > 0 ? (
                    <div className="grid gap-6">
                        {reviews.map((review) => (
                            <div key={review.id} className="border-b border-gray-50 pb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                        {review.user?.name?.charAt(0) || 'U'}
                                    </div>
                                    <span className="font-bold text-gray-700">{review.user?.name || 'ลูกค้าทั่วไป'}</span>
                                    <div className="flex ml-auto">
                                        {[...Array(5)].map((_, i) => (
                                            <Star 
                                                key={i} 
                                                size={14} 
                                                className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"} 
                                            />
                                        ))}
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm ml-10">{review.comment}</p>
                                <span className="text-[10px] text-gray-400 ml-10">
                                    {new Date(review.createdAt).toLocaleDateString('th-TH')}
                                </span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-lg">
                        ยังไม่มีรีวิวสำหรับสินค้านี้
                    </div>
                )}
             </div>
        </div>
      </div>
    </div>

  );
};

export default ProductDetail;