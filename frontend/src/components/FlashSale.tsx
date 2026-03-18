import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Zap, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api';
import { getActiveFlashSales, type Promotion, type Product } from '../services/api';

interface FlashSaleProps {
  products?: Product[];
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getImageUrl = (product: Product) => {
  try {
      const rawImages = product.image;
      let images: string[] = [];
      if (Array.isArray(rawImages)) {
          images = rawImages;
      } else if (typeof rawImages === 'string') {
          images = rawImages.startsWith('[') ? JSON.parse(rawImages) : [rawImages];
      }
      if (images.length > 0) {
          const img = images[0];
          if (img.startsWith('http')) return img;
          return `${API_BASE_URL}/uploads/${img}`;
      }
  } catch (e) {}
  return "https://placehold.co/400x300?text=No+Image";
};

const FlashSale: React.FC<FlashSaleProps> = ({ products: allProducts = [] }) => {
  const [flashSales, setFlashSales] = useState<Promotion[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null); // ✅ เพิ่ม Ref สำหรับจับการเลื่อน

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const sales = await getActiveFlashSales();
        setFlashSales(sales);
      } catch (error) {}
    };

    const fetchBookmarks = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = await api.getBookmarks();
                const bookmarkIds = Array.isArray(data) ? data.map((b: any) => b.productId || b.product?.id || b.id) : (data && Array.isArray(data.data) ? data.data.map((b: any) => b.productId || b.product?.id || b.id) : []);
                setBookmarks(bookmarkIds);
            } catch (error) {}
        }
    };

    fetchFlashSales(); fetchBookmarks();
    const interval = setInterval(fetchFlashSales, 30000); 
    const handleBookmarkUpdate = () => fetchBookmarks();
    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);
    return () => { clearInterval(interval); window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate); };
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (flashSales.length === 0) return;
      const now = new Date();
      let minEndTime = new Date(flashSales[0].endDate);
      flashSales.forEach(sale => {
        const endTime = new Date(sale.endDate);
        if (endTime < minEndTime) minEndTime = endTime;
      });

      const difference = minEndTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [flashSales]);

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (!localStorage.getItem('token')) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      navigate('/login'); return;
    }
    await addToCart(product.id, 1); 
  };

  const toggleBookmark = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!localStorage.getItem('token')) {
        toast.error('กรุณาเข้าสู่ระบบเพื่อบันทึกสินค้าที่สนใจ');
        navigate('/login'); return;
    }
    try {
        if (bookmarks.includes(productId)) {
            await api.removeBookmark(productId);
            setBookmarks(prev => prev.filter(id => id !== productId));
            toast.success('ลบออกจากสินค้าที่สนใจแล้ว');
        } else {
            await api.addBookmark(productId);
            setBookmarks(prev => [...prev, productId]);
            toast.success('เพิ่มลงในสินค้าที่สนใจแล้ว');
        }
        window.dispatchEvent(new Event('bookmarksUpdated'));
    } catch (error) {}
  };

  const calculateDiscountedPrice = (product: Product, promotion: Promotion) => {
    const price = typeof product.price === 'string' ? Number(product.price) : product.price;
    if (promotion.discountType === 'PERCENTAGE') {
      return price * (1 - promotion.discountValue / 100);
    } else {
      return Math.max(0, price - promotion.discountValue);
    }
  };

  // ✅ ฟังก์ชันสำหรับกดเลื่อนซ้าย-ขวา
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.75;
      if (direction === 'left') {
        scrollRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const getFlashSaleProducts = () => {
    const flashSaleProductIds = new Set<string>();
    flashSales.forEach(sale => { sale.products?.forEach(product => { flashSaleProductIds.add(product.id); }); });
    return allProducts.filter(product => flashSaleProductIds.has(product.id));
  };

  const flashSaleProducts = getFlashSaleProducts();
  if (flashSales.length === 0 || flashSaleProducts.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[3rem] shadow-[0_20px_50px_rgba(20,143,150,0.15)] border border-white/50 p-8 md:p-12 mb-16 mt-8 font-sans isolate">
      
      <div className="absolute inset-0 bg-gradient-to-br from-[#148F96]/35 via-white to-[#ff8e53]/35 -z-10 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff8e53]/45 blur-[150px] rounded-full pointer-events-none animate-pulse -z-10" style={{ animationDuration: '6s' }} />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-[#148F96]/45 blur-[150px] rounded-full pointer-events-none animate-pulse -z-10" style={{ animationDuration: '8s' }} />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08] mix-blend-overlay pointer-events-none -z-10"></div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center mb-10 gap-8 border-b border-[#148F96]/10 pb-8">
        <div className="flex items-center gap-4 text-center lg:text-left">
          <div className="p-3 bg-gradient-to-br from-[#ff8e53] to-[#D65A31] rounded-2xl shadow-lg shadow-orange-500/30">
            <Zap size={36} className="text-white" />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#148F96] to-[#0d6065] tracking-tight mb-1">
              FLASH SALE
            </h2>
            <p className="text-slate-600 font-medium text-lg">ลดแรงแซงทุกโปร ด่วน! เวลาจำกัด</p>
          </div>
        </div>
        
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 shadow-lg shadow-slate-200/50 border border-white flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#D65A31] text-sm font-bold uppercase tracking-widest">
            <Clock size={18} /> หมดเวลาใน
          </div>
          <div className="flex gap-2">
            {timeLeft.days > 0 && (
              <div className="bg-gradient-to-br from-[#148F96] to-[#107378] px-3 py-2 rounded-xl min-w-[50px] text-center shadow-md">
                <div className="text-xl font-black text-white">{timeLeft.days}</div>
                <div className="text-[10px] text-teal-100 font-bold uppercase">Days</div>
              </div>
            )}
            <div className="bg-gradient-to-br from-[#148F96] to-[#107378] px-3 py-2 rounded-xl min-w-[50px] text-center shadow-md">
              <div className="text-xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[10px] text-teal-100 font-bold uppercase">Hrs</div>
            </div>
            <div className="bg-gradient-to-br from-[#148F96] to-[#107378] px-3 py-2 rounded-xl min-w-[50px] text-center shadow-md">
              <div className="text-xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[10px] text-teal-100 font-bold uppercase">Mins</div>
            </div>
            <div className="bg-gradient-to-br from-[#ff8e53] to-[#D65A31] px-3 py-2 rounded-xl min-w-[50px] text-center shadow-md animate-pulse">
              <div className="text-xl font-black text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[10px] text-orange-100 font-bold uppercase">Secs</div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ ปรับ Container เป็นแบบเลื่อนได้ */}
      <div className="relative group/slider mt-4">
        
        {/* ✅ แสดงปุ่มซ้ายเมื่อมีสินค้ามากกว่า 4 ชิ้น */}
        {flashSaleProducts.length > 4 && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute top-[45%] -left-5 z-20 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full p-2.5 border border-gray-100 text-slate-600 hover:text-[#ff8e53] hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/slider:opacity-100 items-center justify-center"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 pb-8 scrollbar-hide relative z-10 items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {flashSaleProducts.map((product) => {
            const promotion = flashSales.find(sale => sale.products?.some(p => p.id === product.id));
            if (!promotion) return null;

            const originalPrice = typeof product.price === 'string' ? Number(product.price) : product.price;
            const discountedPrice = calculateDiscountedPrice(product, promotion);

            return (
              /* ✅ เปลี่ยน Link ให้ยืดความสูงเต็ม และมีขนาดกว้าง 280px */
              <Link to={`/product/${product.id}`} key={product.id} className="group relative flex flex-col w-[280px] shrink-0 text-left">
                  
                  {/* 🛑 Card ของเดิม 100% ห้ามแก้ไขเด็ดขาด 🛑 */}
                  <div className="bg-white/90 backdrop-blur-xl border border-white rounded-[2rem] shadow-xl hover:shadow-2xl hover:shadow-[#ff8e53]/20 transition-all duration-500 overflow-hidden h-full flex flex-col relative transform hover:-translate-y-2 isolate">
                  
                  <div className="absolute top-4 left-4 bg-gradient-to-r from-[#ff8e53] to-[#D65A31] text-white text-[11px] font-black px-3.5 py-1.5 rounded-full z-20 shadow-md tracking-widest flex items-center gap-1 border border-white/50">
                      <Zap size={14}/> {promotion.title.toUpperCase()}
                  </div>

                  <button 
                      onClick={(e) => toggleBookmark(e, product.id)}
                      className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md rounded-full z-20 shadow-sm text-slate-300 hover:text-yellow-400 hover:bg-white transition-all hover:scale-110 border border-slate-100"
                  >
                      <Star size={18} fill={bookmarks.includes(product.id) ? "currentColor" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-400" : ""} />
                  </button>

                  <div className="h-60 overflow-hidden bg-slate-50 relative rounded-t-[2rem]" style={{ transform: 'translateZ(0)' }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                      <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out mix-blend-multiply" />
                  </div>

                  <div className="p-6 flex flex-col flex-1 bg-white/90 relative z-10">
                      <div className="text-[10px] text-[#148F96] font-black tracking-widest uppercase mb-2">{product.category || 'LIMITED'}</div>
                      <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 group-hover:text-[#D65A31] transition-colors">{product.name}</h3>
                      
                      <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-slate-400 line-through text-xs font-medium">฿{originalPrice.toLocaleString()}</span>
                                  <span className="text-[10px] text-[#D65A31] bg-orange-50 px-2 py-0.5 rounded-md font-bold border border-orange-100">
                                      ลด {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `฿${promotion.discountValue}`}
                                  </span>
                              </div>
                              <div className="text-2xl font-black text-[#148F96]">
                                  ฿{discountedPrice.toLocaleString()}
                              </div>
                          </div>

                          <button onClick={(e) => handleAddToCart(e, product)} className="bg-slate-50 hover:bg-[#ff8e53] text-slate-600 hover:text-white p-3.5 rounded-2xl transition-all shadow-sm hover:shadow-lg hover:shadow-orange-500/30 transform hover:scale-105 border border-slate-100 hover:border-transparent">
                              <ShoppingCart size={20} />
                          </button>
                      </div>
                  </div>
                  </div>
                  {/* 🛑 จบ Card 🛑 */}

              </Link>
            );
          })}
        </div>

        {/* ✅ แสดงปุ่มขวาเมื่อมีสินค้ามากกว่า 4 ชิ้น */}
        {flashSaleProducts.length > 4 && (
          <button 
            onClick={() => scroll('right')} 
            className="absolute top-[45%] -right-5 z-20 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full p-2.5 border border-gray-100 text-slate-600 hover:text-[#ff8e53] hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/slider:opacity-100 items-center justify-center"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

    </div>
  );
};

export default FlashSale;