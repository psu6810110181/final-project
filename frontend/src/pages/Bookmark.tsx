// frontend/src/pages/Bookmark.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader, Star, Heart } from 'lucide-react';
import * as api from '../services/api'; 
import type { Promotion } from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import TabBar from '../components/TabBar'; // ✅ เพิ่ม TabBar
import {type ProductWithPromo } from '../components/ProductGrid';

const BookmarkPage = () => {
  const [bookmarkedProducts, setBookmarkedProducts] = useState<ProductWithPromo[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
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
        
        const validPromos = Array.isArray(promoData) ? promoData : ((promoData as any)?.data || []);
        
        validPromos.forEach((promo: Promotion) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            if (promo.isActive && now >= startDate && now <= endDate) {
                promo.products?.forEach((prod: any) => {
                    if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo);
                });
            }
        });

        // แก้ไขบรรทัดนี้
        const validProducts = Array.isArray(productsData) ? productsData : ((productsData as any)?.data || []);
        const productsWithPromo = validProducts
            .filter((p: any) => bookmarkIds.includes(p.id))
            .map((p: any) => ({ ...p, promo: promoMap.get(p.id) }));

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
        if (images.length > 0) {
            const img = images[0];
            if (img.startsWith('http')) return img;
            return `${API_BASE_URL}/uploads/${img}`;
        }
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

  // --- กรณีไม่ได้ล็อคอิน ---
  if (!isLoggedIn && !loading) {
    return (
      <div className="bg-slate-900 min-h-screen flex flex-col items-center justify-center pb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[#148F96]/10 blur-[150px] rounded-full pointer-events-none" />
        <div className="relative z-10 bg-white/10 backdrop-blur-xl p-12 rounded-[3rem] border border-white/10 shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-700">
            <div className="bg-white/10 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart size={40} className="text-white opacity-80" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-3 tracking-wide">MY FAVORITES</h2>
            <p className="text-slate-300 mb-8 font-light">เข้าสู่ระบบเพื่อจัดการไอเทมในฝันของคุณ</p>
            <Link to="/login" className="block w-full py-4 bg-[#148F96] text-white rounded-2xl font-bold text-lg hover:bg-teal-500 hover:shadow-[0_0_30px_rgba(20,143,150,0.4)] transition-all">
                เข้าสู่ระบบเลย
            </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA]"><Loader size={48} className="animate-spin text-[#148F96]" /></div>;

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative overflow-hidden font-sans">
      
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-yellow-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-[#148F96]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      {/* ✅ ใช้ TabBar คอมโพเนนต์แทนการสร้างเมนูซ้ำ */}
      <div className="relative z-20">
        <TabBar />
      </div>

      {/* Hero Header */}
      <div className="bg-slate-900 py-16 mb-12 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-md">คอลเลกชันส่วนตัว</h1>
            <p className="text-slate-300 text-lg font-light">สินค้าที่คุณบันทึกไว้สำหรับไอเดียแต่งบ้าน ({bookmarks.length} รายการ)</p>
        </div>
      </div>

      <div className={`container mx-auto px-4 relative z-20 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {bookmarkedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Star size={64} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">ยังไม่มีไอเทมโปรด</h3>
                <p className="text-slate-500 mb-8 font-medium">ค้นพบและบันทึกเฟอร์นิเจอร์ที่คุณหลงรักได้เลย</p>
                <Link to="/" className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#148F96] hover:shadow-lg hover:shadow-[#148F96]/30 transition-all active:scale-95">
                    ไปช้อปกันเลย
                </Link>
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {bookmarkedProducts.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group relative block">
                        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#148F96]/20 transition-all duration-500 overflow-hidden border border-white h-full flex flex-col relative hover:-translate-y-2">
                            
                            {product.promo && (
                                <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg tracking-wider">
                                    {product.promo.title.toUpperCase()}
                                </div>
                            )}
                            
                            <button 
                                onClick={(e) => toggleBookmark(e, product.id)}
                                className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md hover:bg-white rounded-full z-20 shadow-md transition-transform hover:scale-110"
                            >
                                <Star size={20} fill="currentColor" className="text-yellow-400" />
                            </button>

                            <div className="h-60 overflow-hidden bg-slate-100 relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                                <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                            </div>

                            <div className="p-6 flex flex-col flex-1">
                                <div className="text-xs text-[#148F96] font-bold tracking-widest uppercase mb-2">{product.category || 'GENERAL'}</div>
                                <h3 className="font-bold text-slate-800 text-xl mb-4 line-clamp-2 group-hover:text-[#148F96] transition-colors">{product.name}</h3>
                                
                                <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
                                    <div>
                                        {product.promo ? (
                                            <>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-slate-400 line-through text-sm">฿{Number(product.price).toLocaleString()}</span>
                                                    <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-bold">
                                                        ลด {product.promo.discountType === 'PERCENTAGE' ? `${product.promo.discountValue}%` : `฿${product.promo.discountValue}`}
                                                    </span>
                                                </div>
                                                <div className="text-2xl font-black text-red-600 drop-shadow-sm">
                                                    ฿{calculateDiscountPrice(product.price, product.promo).toLocaleString()}
                                                </div>
                                            </>
                                        ) : (
                                            <div className="text-2xl font-black text-slate-800 drop-shadow-sm">฿{Number(product.price).toLocaleString()}</div>
                                        )}
                                    </div>

                                    <button onClick={(e) => handleAddToCart(e, product)} className="bg-slate-100 hover:bg-[#148F96] hover:text-white text-slate-700 p-3 rounded-2xl transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#148F96]/30">
                                        <ShoppingCart size={20} />
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