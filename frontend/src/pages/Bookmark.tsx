// frontend/src/pages/Bookmark.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader, Star } from 'lucide-react';
import * as api from '../services/api'; 
import type { Promotion } from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import { type ProductWithPromo } from './Home';

const BookmarkPage = () => {
  const [bookmarkedProducts, setBookmarkedProducts] = useState<ProductWithPromo[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookmarks = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
          setIsLoggedIn(false);
          setLoading(false);
          return;
      }
      setIsLoggedIn(true);

      try {
        setLoading(true);
        
        // ✅ ป้องกัน error .map is not a function
        const bookmarkData = await api.getBookmarks().catch(() => []);
        let bookmarkIds: string[] = [];

        if (Array.isArray(bookmarkData)) {
            bookmarkIds = bookmarkData.map((b: any) => b.productId || b.product?.id || b.id);
        } else if (bookmarkData && Array.isArray(bookmarkData.data)) {
            bookmarkIds = bookmarkData.data.map((b: any) => b.productId || b.product?.id || b.id);
        }
        
        setBookmarks(bookmarkIds);

        if (bookmarkIds.length === 0) {
            setBookmarkedProducts([]);
            return;
        }

        const [productsData, promoData] = await Promise.all([
          api.getAllProducts().catch(() => []),
          api.getAllPromotions().catch(() => [])
        ]);

        let promoMap = new Map<string, Promotion>();
        const now = new Date();
        
        if (Array.isArray(promoData)) {
            promoData.forEach((promo: Promotion) => {
                const startDate = new Date(promo.startDate);
                const endDate = new Date(promo.endDate);
                if (promo.isActive && now >= startDate && now <= endDate) {
                    promo.products?.forEach((prod: any) => {
                        if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo);
                    });
                }
            });
        }

        const validProducts = Array.isArray(productsData) ? productsData : [];
        const productsWithPromo = validProducts
            .filter(p => bookmarkIds.includes(p.id))
            .map(p => ({ ...p, promo: promoMap.get(p.id) }));

        setBookmarkedProducts(productsWithPromo);
      } catch (error) {
        toast.error('ไม่สามารถดึงข้อมูลสินค้าที่สนใจได้');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarks();
  }, []);

  const toggleBookmark = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
        await api.removeBookmark(productId);
        
        setBookmarks(prev => prev.filter(id => id !== productId));
        setBookmarkedProducts(prev => prev.filter(p => p.id !== productId));
        toast.success('ลบออกจากสินค้าที่สนใจแล้ว');
        window.dispatchEvent(new Event('bookmarksUpdated'));
    } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการลบสินค้าที่สนใจ');
    }
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const getImageUrl = (product: any) => {
    try {
        const rawImages = product.image;
        let images: string[] = [];
        if (Array.isArray(rawImages)) images = rawImages;
        else if (typeof rawImages === 'string') images = rawImages.startsWith('[') ? JSON.parse(rawImages) : [rawImages];
        if (images.length > 0) return images[0].startsWith('http') ? images[0] : `${API_BASE_URL}/uploads/${images[0]}`;
    } catch (e) {}
    return "https://placehold.co/400x300?text=No+Image";
  };

  const calculateDiscountPrice = (price: string | number, promo: Promotion) => {
    const p = Number(price);
    if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
    return Math.max(0, p - promo.discountValue);
  };

  const handleAddToCart = async (e: React.MouseEvent, product: any) => {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1);
  };

  if (!isLoggedIn && !loading) {
    return (
      <div className="bg-gray-50 min-h-screen flex flex-col items-center justify-center pb-10">
        <Star size={64} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">กรุณาเข้าสู่ระบบ</h2>
        <p className="text-gray-500 mb-6">เข้าสู่ระบบเพื่อบันทึกและดูสินค้าที่คุณสนใจ</p>
        <Link to="/login" className="px-6 py-2 bg-[#148F96] text-white rounded-full font-medium hover:bg-teal-700 transition-colors">
            ไปหน้าเข้าสู่ระบบ
        </Link>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#148F96]"><Loader size={48} className="animate-spin" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <div className="bg-white pt-4 px-4 border-b shadow-sm mb-8">
        <div className="container mx-auto flex gap-6">
            <Link to="/" className="text-gray-500 font-medium hover:text-[#148F96] pb-2 transition-colors">
                สินค้าทั้งหมด
            </Link>
            <Link to="/promotions" className="text-gray-500 font-medium hover:text-[#148F96] pb-2 transition-colors">
                สินค้าโปรโมชัน
            </Link>
            <div className="text-[#148F96] font-bold border-b-2 border-[#148F96] pb-2 cursor-pointer">
                สินค้าที่สนใจ {bookmarks.length > 0 && `(${bookmarks.length})`}
            </div>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">สินค้าที่สนใจ</h1>
        
        {bookmarkedProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-500">คุณยังไม่มีสินค้าที่สนใจในขณะนี้</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bookmarkedProducts.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group relative block">
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
                            {product.promo && (
                                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-md">
                                    {product.promo.title.toUpperCase()}
                                </div>
                            )}
                            <button 
                                onClick={(e) => toggleBookmark(e, product.id)}
                                className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full z-20 shadow-sm transition-all hover:scale-110"
                            >
                                <Star size={18} fill="currentColor" className="text-yellow-400" />
                            </button>
                            <div className="h-48 overflow-hidden bg-gray-100">
                                <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            </div>
                            <div className="p-4 flex flex-col flex-1">
                                <div className="text-xs text-[#148F96] font-bold mb-1">{product.category || 'ไม่มีหมวดหมู่'}</div>
                                <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
                                
                                <div className="mt-auto flex items-end justify-between">
                                    <div>
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

                                    <button onClick={(e) => handleAddToCart(e, product)} className="bg-gray-100 hover:bg-[#148F96] hover:text-white text-gray-600 p-2.5 rounded-full transition-colors">
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

export default BookmarkPage;