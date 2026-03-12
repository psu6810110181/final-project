// frontend/src/pages/ProductDetail.tsx
import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom'; 
import { Star, Minus, Plus, ChevronRight, Loader, User, Filter, Check } from 'lucide-react'; 
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; 
import toast from 'react-hot-toast'; 
import * as api from '../services/api'; 
import type { Product } from '../services/api'; 
import PromotionBadge from '../components/PromotionBadge';
import PriceDisplay from '../components/PriceDisplay'; 

const getColorHex = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'แดง': '#EF4444', 'น้ำเงิน': '#3B82F6', 'ดำ': '#000000', 'ขาว': '#FFFFFF',
    'เขียว': '#22C55E', 'เหลือง': '#EAB308', 'เทา': '#6B7280', 'น้ำตาล': '#8B4513'
  };
  return colorMap[colorName] || '#E5E7EB';
};

const ProductDetail = () => {
  const { id } = useParams(); 
  const { addToCart } = useCart();
  const { user } = useAuth(); 
  const navigate = useNavigate(); 

  const [product, setProduct] = useState<Product | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installationQty, setInstallationQty] = useState(0); 
  const [isAdding, setIsAdding] = useState(false); 
  
  const [reviews, setReviews] = useState<any[]>([]); 
  const [filterRating, setFilterRating] = useState<number | null>(null); 

  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');

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

        // ✅ ตั้งค่าเริ่มต้นให้ Select ข้อมูลของสินค้าหลักทันทีที่โหลดหน้าจอ
        const p = productData as any;
        setSelectedColor(p.color || p.mainColor || '');
        setSelectedMaterial(p.material || p.mainMaterial || '');
        setSelectedSize(p.size || p.mainSize || '');

      } catch (error) {
        console.error("Failed to load data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndReviews();
  }, [id]);

  // --- 🚀 เพิ่ม useEffect เพื่อเก็บประวัติการเข้าชมสินค้าลง LocalStorage ---
  useEffect(() => {
    if (product && product.id) {
      const viewedProducts = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
      
      // ถ้าไม่มี ID นี้ในประวัติ ให้ดันเข้าเป็นตัวแรก
      if (!viewedProducts.includes(product.id)) {
        viewedProducts.unshift(product.id);
        // เก็บประวัติการดูสูงสุดแค่ 15 ชิ้นล่าสุด
        if (viewedProducts.length > 15) viewedProducts.pop();
        localStorage.setItem('viewedProducts', JSON.stringify(viewedProducts));
      }
    }
  }, [product]);
  // -----------------------------------------------------------------

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const getImageUrl = (img: string) => {
     if (!img) return "https://via.placeholder.com/600x400?text=No+Path";
     if (img.startsWith('http')) return img;
     return `${API_BASE_URL}/uploads/${img}`;
  };

  const currentVariant = useMemo(() => {
    if (!product || !product.variants) return null;
    return product.variants.find(v => 
        v.color === selectedColor && 
        v.material === selectedMaterial && 
        v.size === selectedSize
    );
  }, [product, selectedColor, selectedMaterial, selectedSize]);

  const images: string[] = useMemo(() => {
    if (!product) return [];
    
    let allImages: string[] = [];

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

    if (product.variants && Array.isArray(product.variants)) {
        product.variants.forEach((v: any) => {
            if (v.image && !allImages.includes(v.image)) {
                allImages.push(v.image);
            }
        });
    }

    if (allImages.length === 0) return ["https://via.placeholder.com/600x400?text=No+Image"];
    return allImages;
  }, [product]);

  const mainColor = (product as any)?.color || (product as any)?.mainColor || '';
  const mainMaterial = (product as any)?.material || (product as any)?.mainMaterial || '';
  const mainSize = (product as any)?.size || (product as any)?.mainSize || '';

  const handleImageInteract = (index: number) => {
      setSelectedImageIndex(index);
      const selectedImg = images[index];
      
      const matchedVariant = product?.variants?.find((v: any) => v.image === selectedImg);
      
      if (matchedVariant) {
          setSelectedColor(matchedVariant.color || '');
          setSelectedMaterial(matchedVariant.material || '');
          setSelectedSize(matchedVariant.size || '');
      } else {
          setSelectedColor(mainColor);
          setSelectedMaterial(mainMaterial);
          setSelectedSize(mainSize);
      }
  };

  useEffect(() => {
      if (currentVariant && currentVariant.image) {
          const index = images.findIndex(img => img === currentVariant.image);
          if (index !== -1) {
              setSelectedImageIndex(index);
          }
      }
  }, [currentVariant, images]);

  const isMainProductSelected = 
      selectedColor === mainColor && 
      selectedMaterial === mainMaterial && 
      selectedSize === mainSize;

  const handleAddToCart = async () => {
    if (!product || !id) return;
    
    if (!user) {
       toast.error("กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า");
       navigate('/login');
       return;
    }

    if (product.variants && product.variants.length > 0 && !currentVariant && !isMainProductSelected) {
        toast.error("กรุณาเลือกรูปแบบสินค้าให้ครบถ้วน หรือ สินค้ารูปแบบนี้ไม่มีในระบบ");
        return;
    }

    try {
        setIsAdding(true);
        // ✅ เพิ่ม currentVariant?.id เข้าไปเพื่อให้รู้ว่าซื้อตัวเลือกไหน
        await addToCart(id, quantity, installationQty, currentVariant?.id); 
    } catch (error) {
        console.error(error);
    } finally {
        setIsAdding(false);
    }
  }; 

  const availableColors = Array.from(new Set([mainColor, ...(product?.variants?.map(v => v.color) || [])])).filter(Boolean) as string[];
  const availableMaterials = Array.from(new Set([mainMaterial, ...(product?.variants?.map(v => v.material) || [])])).filter(Boolean) as string[];
  const availableSizes = Array.from(new Set([mainSize, ...(product?.variants?.map(v => v.size) || [])])).filter(Boolean) as string[];

  const displayPrice = currentVariant ? currentVariant.price : product?.price;
  const displayStock = currentVariant ? currentVariant.stock : ((product as any)?.mainStock ?? product?.stock);
  const displaySold = currentVariant ? ((currentVariant as any).sold || 0) : ((product as any)?.sold || 0);
  
  const displayColorAttr = currentVariant ? currentVariant.color : mainColor;
  const displayMaterialAttr = currentVariant ? currentVariant.material : mainMaterial;
  const displaySizeAttr = currentVariant ? currentVariant.size : mainSize;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  const filteredReviews = filterRating 
    ? reviews.filter(r => Math.round(r.rating) === filterRating)
    : reviews;

  const getReviewCountByRating = (rating: number) => {
      return reviews.filter(r => Math.round(r.rating) === rating).length;
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#148F96]"><Loader className="animate-spin" size={48}/></div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center text-red-500">ไม่พบสินค้า</div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-10 font-sans">
      <div className="container mx-auto px-4 py-6">
        
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
           <Link to="/" className="hover:text-[#D65A31] transition-colors">หน้าแรก</Link> 
           <ChevronRight size={14}/> 
           <span className="cursor-default">สินค้า</span> 
           <ChevronRight size={14}/> 
           <span className="text-[#148F96] font-bold line-clamp-1">{product.name}</span>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          
          <div className="flex gap-4 h-[400px] md:h-[450px]">
            <div className="flex flex-col gap-3 w-20 overflow-y-auto no-scrollbar">
              {images.map((img, index) => (
                <button 
                  key={index}
                  onClick={() => handleImageInteract(index)}
                  onMouseEnter={() => handleImageInteract(index)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 
                   ${selectedImageIndex === index ? 'border-[#D65A31] shadow-md' : 'border-gray-200 hover:border-gray-300'}`}
                >
                  <img src={getImageUrl(img)} alt={`preview-${index}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
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

          <div className="flex flex-col">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} className={i < Math.round(Number(averageRating)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} />
              ))}
              <span className="text-gray-500 text-sm ml-2">{averageRating} ({reviews.length} รีวิว)</span>
              <span className="text-gray-300 mx-2">|</span>
              <span className="text-sm text-gray-500">ขายแล้ว {displaySold} ชิ้น</span>
            </div>

            <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
               <div className="mb-2"><PromotionBadge productId={product.id} /></div>
               <PriceDisplay productId={product.id} originalPrice={Number(displayPrice)} />
               
               <div className="mt-3 pt-3 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-700">
                   <div className="flex items-center gap-1.5">
                       <span className="font-bold text-gray-500">สี:</span> 
                       {displayColorAttr ? (
                           <span className="flex items-center gap-1">
                               <div className="w-3 h-3 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: getColorHex(displayColorAttr) }}></div>
                               {displayColorAttr}
                           </span>
                       ) : (
                           <span className="text-gray-400">-</span>
                       )}
                   </div>
                   <div>
                       <span className="font-bold text-gray-500">วัสดุ:</span> <span className={!displayMaterialAttr ? "text-gray-400" : ""}>{displayMaterialAttr || '-'}</span>
                     </div>
                   <div>
                       <span className="font-bold text-gray-500">ขนาด:</span> <span className={!displaySizeAttr ? "text-gray-400" : ""}>{displaySizeAttr || '-'}</span>
                   </div>
               </div>
            </div>

            {product.variants && product.variants.length > 0 && (
                <div className="space-y-4 mb-6">
                    {availableColors.length > 0 && (
                        <div>
                            <span className="text-sm font-bold text-gray-700 block mb-2">ตัวเลือกสี (Color)</span>
                            <div className="flex flex-wrap gap-2">
                                {availableColors.map(color => (
                                    <button 
                                        key={color} 
                                        onClick={() => setSelectedColor(color)}
                                        className={`px-3 py-1.5 rounded-full text-sm border flex items-center gap-2 transition-all ${selectedColor === color ? 'border-[#148F96] bg-teal-50 text-[#148F96] font-bold ring-1 ring-[#148F96]' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        <div className="w-3 h-3 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: getColorHex(color) }}></div>
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {availableMaterials.length > 0 && (
                        <div>
                            <span className="text-sm font-bold text-gray-700 block mb-2">ตัวเลือกวัสดุ (Material)</span>
                            <div className="flex flex-wrap gap-2">
                                {availableMaterials.map(mat => (
                                    <button 
                                        key={mat} 
                                        onClick={() => setSelectedMaterial(mat)}
                                        className={`px-4 py-1.5 rounded-md text-sm border transition-all ${selectedMaterial === mat ? 'border-[#148F96] bg-teal-50 text-[#148F96] font-bold' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {mat}
                                        {selectedMaterial === mat && <Check size={14} className="inline ml-1" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {availableSizes.length > 0 && (
                        <div>
                            <span className="text-sm font-bold text-gray-700 block mb-2">ตัวเลือกขนาด (Size)</span>
                            <div className="flex flex-wrap gap-2">
                                {availableSizes.map(size => (
                                    <button 
                                        key={size} 
                                        onClick={() => setSelectedSize(size)}
                                        className={`px-4 py-1.5 rounded-md text-sm border transition-all ${selectedSize === size ? 'border-[#148F96] bg-teal-50 text-[#148F96] font-bold' : 'border-gray-300 text-gray-600 hover:border-gray-400'}`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="mb-4">
                {Number(displayStock) <= 0 ? (
                    <span className="text-red-500 font-bold bg-red-50 px-3 py-1 rounded-full text-sm">สินค้าหมด</span>
                ) : (
                    <span className="text-gray-500 text-sm">มีสินค้าทั้งหมด: <span className="font-bold text-gray-800">{displayStock}</span> ชิ้น</span>
                )}
                
                {product.variants && product.variants.length > 0 && !currentVariant && !isMainProductSelected && (
                    <span className="text-red-500 text-sm ml-3 block mt-1">*ไม่มีสินค้ารูปแบบนี้ กรุณาเลือกตัวเลือกใหม่</span>
                )}
            </div>

            <div className="space-y-5 border-t border-gray-100 pt-5 mt-auto">
               <div>
                  <span className="font-bold text-gray-800 block mb-2">บริการเสริม</span>
                  <div className="flex items-center justify-between border border-gray-200 p-3 rounded-lg w-full xl:w-80">
                     <span className="text-gray-600 text-sm">รับบริการติดตั้ง (+฿400/ชิ้น)</span>
                     <div className="flex items-center bg-gray-50 border border-gray-300 rounded overflow-hidden">
                        <button onClick={() => setInstallationQty(Math.max(0, installationQty - 1))} className="p-1.5 hover:bg-white text-gray-500 transition-colors"><Minus size={14}/></button>
                        <span className="w-8 text-center text-sm font-bold py-1">{installationQty}</span>
                        <button onClick={() => setInstallationQty(Math.min(quantity, installationQty + 1))} className="p-1.5 hover:bg-white text-gray-500 transition-colors"><Plus size={14}/></button>
                     </div>
                  </div>
                  <span className="text-xs text-red-400 mt-1 block">*เลือกติดตั้งได้สูงสุดตามจำนวนสินค้าที่ซื้อ (4 ชิ้นขึ้นไปเหมาจ่าย 990 บาท)</span>
               </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 pt-4">
                <div>
                    <span className="font-bold text-gray-800 block mb-2">จำนวน</span>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                      <button onClick={() => { const newQty = Math.max(1, quantity - 1); setQuantity(newQty); if (installationQty > newQty) setInstallationQty(newQty); }} className="p-3 hover:bg-gray-100 transition-colors"><Minus size={16}/></button>
                      <input type="text" value={quantity} readOnly className="w-12 text-center text-sm font-bold border-x border-gray-300 py-2 outline-none"/>
                      <button onClick={() => setQuantity(Math.min(Number(displayStock), quantity + 1))} className="p-3 hover:bg-gray-100 transition-colors" disabled={quantity >= Number(displayStock)}><Plus size={16}/></button>
                    </div>
                </div>

                <button 
                    onClick={handleAddToCart}
                    disabled={isAdding || Number(displayStock) <= 0 || ((product.variants?.length ?? 0) > 0 && !currentVariant && !isMainProductSelected)}
                    className="flex-1 bg-[#D65A31] hover:bg-[#b54622] text-white py-3 px-8 rounded-lg font-bold text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isAdding ? <><Loader className="animate-spin" size={20}/> กำลังเพิ่ม...</> : Number(displayStock) <= 0 ? "สินค้าหมด" : "เพิ่มลงตะกร้า"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ส่วนรายละเอียดสินค้าและรีวิว */}
        <div className="bg-white rounded-xl shadow-sm p-6 space-y-8">
             <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-[#148F96] pl-3">รายละเอียดสินค้า</h2>
                
                <div className="bg-gray-50 p-4 rounded-lg text-sm text-gray-700 grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div><span className="font-bold text-gray-500 w-24 inline-block">หมวดหมู่:</span> {product.category || '-'}</div>
                    <div><span className="font-bold text-gray-500 w-24 inline-block">ห้อง:</span> {product.room || '-'}</div>
                    {product.features && product.features.length > 0 && (
                        <div className="md:col-span-2">
                            <span className="font-bold text-gray-500 w-24 inline-block align-top">คุณสมบัติ:</span> 
                            <div className="inline-flex flex-wrap gap-2">
                                {product.features.map((f, i) => <span key={i} className="bg-white border border-gray-200 px-2 py-0.5 rounded text-xs">{f}</span>)}
                            </div>
                        </div>
                    )}
                </div>

                <div className="prose max-w-none text-gray-600 whitespace-pre-line">
                    {product.description || "ไม่มีรายละเอียดสินค้า"}
                </div>
             </div>

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
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;