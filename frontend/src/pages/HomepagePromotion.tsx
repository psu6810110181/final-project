// frontend/src/pages/HomepagePromotion.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader } from 'lucide-react';
import * as api from '../services/api'; 
import type { Product, Promotion } from '../services/api';
// ✅ นำเข้า calculateDiscountPrice และ useCart มาใช้งาน
import { useCart, calculateDiscountPrice } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import TabBar from '../components/TabBar'; 

// สร้าง Type มารองรับ promo แบบเดียวกับหน้า Home
export type ProductWithPromo = Product & { promo?: Promotion };

const HomepagePromotion = () => {
  const [promoProducts, setPromoProducts] = useState<ProductWithPromo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        // ✅ ดึงข้อมูล Products และ Promotions ทั้งหมด (เพื่อความชัวร์ว่าข้อมูลสินค้ามาครบถ้วน)
        const [productsData, promoData] = await Promise.all([
          api.getAllProducts(),
          api.getAllPromotions()
        ]);

        const now = new Date();
        const promoMap = new Map<string, Promotion>();

        // คัดเฉพาะโปรโมชันที่กำลัง Active
        promoData.forEach((promo: Promotion) => {
          const startDate = new Date(promo.startDate);
          const endDate = new Date(promo.endDate);
          const isCurrentlyActive = promo.isActive && now >= startDate && now <= endDate;

          if (isCurrentlyActive) {
            promo.products?.forEach((prod: Product) => {
              if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo);
            });
          }
        });

        // จับคู่ Product กับ Promotion แล้วกรองเอาเฉพาะสินค้าที่มีโปรโมชัน
        const productsWithPromo: ProductWithPromo[] = productsData
          .filter(p => promoMap.has(p.id))
          .map(p => ({
            ...p,
            promo: promoMap.get(p.id)
          }))
          .slice(0, 30); // จำกัดแค่ 30 รายการตามความต้องการเดิม

        setPromoProducts(productsWithPromo);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
        toast.error('ไม่สามารถดึงข้อมูลโปรโมชันได้');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  // ✅ แก้ไข Base URL ของรูปภาพให้ดึงตาม Environment ป้องกันรูปไม่ขึ้น
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getImageUrl = (product: Product) => {
    try {
        const rawImages = product.image;
        let images: string[] = [];
        if (Array.isArray(rawImages)) images = rawImages;
        else if (typeof rawImages === 'string') {
             images = rawImages.startsWith('[') ? JSON.parse(rawImages) : [rawImages];
        }
        if (images.length > 0) {
            const img = images[0];
            return img.startsWith('http') ? img : `${API_BASE_URL}/uploads/${img}`;
        }
    } catch (e) {}
    return "https://placehold.co/400x300?text=No+Image";
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // ป้องกันการเปลี่ยนหน้าตอนกดปุ่มใน Link
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า');
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader className="animate-spin text-[#148F96]" size={48} /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      
      <TabBar />

      <div className="container mx-auto px-4 mt-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 border-l-4 border-[#148F96] pl-3">🔥 สินค้าโปรโมชันสุดคุ้ม</h1>
        
        {promoProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-500">ไม่มีสินค้าโปรโมชันในขณะนี้</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {promoProducts.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group block">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
                        
                        {/* ✅ ป้าย Sale อิงจากชื่อโปรโมชัน */}
                        {product.promo && (
                            <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-md tracking-wider">
                                {product.promo.title.toUpperCase()}
                            </div>
                        )}

                        <div className="h-48 overflow-hidden bg-gray-100 relative">
                            <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>

                        <div className="p-4 flex flex-col flex-1">
                            <div className="text-xs text-[#148F96] font-bold mb-1">{product.category || 'ทั่วไป'}</div>
                            <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-[#D65A31] transition-colors">{product.name}</h3>
                            
                            <div className="mt-auto flex items-end justify-between pt-3 border-t border-gray-50">
                                <div>
                                    {/* ✅ แสดงราคาลดและราคาขีดทับแบบอัตโนมัติ */}
                                    {product.promo ? (
                                        <>
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-gray-400 line-through text-xs">฿{Number(product.price).toLocaleString()}</span>
                                                <span className="text-[10px] text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded font-bold">
                                                    ลด {product.promo.discountType === 'PERCENTAGE' ? `${product.promo.discountValue}%` : `฿${product.promo.discountValue}`}
                                                </span>
                                            </div>
                                            <div className="text-xl font-bold text-red-600">
                                                ฿{calculateDiscountPrice(product.price, product.promo).toLocaleString()}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-xl font-bold text-[#D65A31]">฿{Number(product.price).toLocaleString()}</div>
                                    )}
                                </div>

                                <button onClick={(e) => handleAddToCart(e, product)} className="bg-gray-100 hover:bg-[#148F96] hover:text-white text-gray-600 p-2.5 rounded-full transition-colors shadow-sm">
                                    <ShoppingCart size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                    </Link>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default HomepagePromotion;