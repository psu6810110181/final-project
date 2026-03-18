import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Sun, Waves, Sparkles, Leaf, Wind, Snowflake, Flower, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api';
import type { ProductWithPromo } from '../components/ProductGrid';
import { seasonalThemes, getSeasonFromPromoTitle } from '../constants/seasonalThemes';

interface SeasonalPromotionProps {
  products: ProductWithPromo[];
  title?: string;
  season?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getImageUrl = (product: ProductWithPromo) => {
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

const SeasonalPromotion: React.FC<SeasonalPromotionProps> = ({ products, title, season }) => {
  const detectedSeason = season || (title ? getSeasonFromPromoTitle(title) : 'summer');
  const theme = seasonalThemes[detectedSeason] || seasonalThemes.summer;
  
  const iconMap = { Sun, Waves, Sparkles, Leaf, Wind, Snowflake, Flower };
  const iconName = theme.themeIcon || theme.iconComponent[0]; 
  const HeaderIcon = iconMap[iconName as keyof typeof iconMap] || Sparkles;
  
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null); 

  useEffect(() => {
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
    fetchBookmarks();
    const handleBookmarkUpdate = () => fetchBookmarks();
    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);
    return () => window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (products.length === 0) return;
      const firstProductWithPromo = products.find(p => p.promo);
      if (!firstProductWithPromo || !firstProductWithPromo.promo) return;

      const endTime = new Date(firstProductWithPromo.promo.endDate);
      const now = new Date();
      const difference = endTime.getTime() - now.getTime();

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
  }, [products]);

  const handleAddToCart = async (e: React.MouseEvent, product: ProductWithPromo) => {
    e.preventDefault();
    if (Number(product.stock) <= 0) {
      toast.error('ขออภัย สินค้านี้หมดชั่วคราว');
      return;
    }
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

  const calculateDiscountPrice = (price: string | number, promo: any) => {
    const p = Number(price);
    if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
    return Math.max(0, p - promo.discountValue);
  };

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

  const getBadgeStyle = () => {
    switch (detectedSeason) {
      case 'spring': return 'from-pink-500 to-rose-600';
      case 'summer': return 'from-[#ff8f53] to-[#D65A31]';
      case 'autumn': return 'from-orange-600 to-amber-800';
      case 'winter': return 'from-cyan-500 to-blue-600';
      default: return 'from-[#148F96] to-[#0a4d52]';
    }
  };

  const getBorderColor = () => {
    switch (detectedSeason) {
      case 'spring': return 'border-pink-300 hover:shadow-pink-500/30';
      case 'summer': return 'border-orange-300 hover:shadow-orange-500/30';
      case 'autumn': return 'border-amber-300 hover:shadow-amber-700/30';
      case 'winter': return 'border-cyan-300 hover:shadow-cyan-500/30';
      default: return 'border-[#148F96]/30 hover:shadow-[#148F96]/30';
    }
  };

  const getIconColor = () => {
    switch (detectedSeason) {
      case 'spring': return 'text-pink-500/30';
      case 'summer': return 'text-orange-500/30';
      case 'autumn': return 'text-amber-700/30';
      case 'winter': return 'text-cyan-500/30';
      default: return 'text-[#148F96]/20';
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(20,143,150,0.15)] border border-white p-8 md:p-12 my-12 group font-sans bg-white isolate">
      
      <div 
        className="absolute inset-0 opacity-[0.25] pointer-events-none transition-opacity duration-1000 group-hover:opacity-[0.35] -z-10"
        style={{
          background: theme.gradient,
          backgroundSize: '400% 400%',
          animation: theme.animation || 'gradient 15s ease infinite',
        }}
      />
      <div className="absolute inset-0 bg-white/60 backdrop-blur-3xl pointer-events-none -z-10" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(5)].map((_, i) => {
          const IconComponent = iconMap[theme.iconComponent[1] as keyof typeof iconMap];
          if (!IconComponent) return null;
          return (
            <IconComponent 
              key={i} size={40 + Math.random() * 50} 
              className={`absolute animate-pulse ${getIconColor()}`}
              style={{ 
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`, animationDuration: '4s',
                transform: `translateY(${Math.random() * 10}px)`
              }} 
            />
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center mb-10 gap-8 border-b border-[#148F96]/20 pb-8">
        <div className="text-center lg:text-left">
          
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 mb-3">
            <div className="p-4 rounded-[1.5rem] bg-white shadow-xl flex items-center justify-center animate-bounce text-[#ff8f53]" style={{ animationDuration: '3s' }}>
                <HeaderIcon size={40} strokeWidth={2.5} />
            </div>
            <h2 className={`text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${getBadgeStyle()} tracking-tight leading-tight py-4 overflow-visible drop-shadow-sm`}>
                {title || `แคมเปญ${theme.nameTh}`}
            </h2>
          </div>

          <p className="text-slate-600 font-bold text-lg py-1">
            {theme.description}
          </p>
        </div>
        
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-4 shadow-xl shadow-[#148F96]/10 border-2 border-white flex items-center gap-4">
          <div className="text-[#D65A31] text-sm font-black uppercase tracking-widest flex items-center gap-2">
            <Clock size={20} /> สิ้นสุดใน
          </div>
          <div className="flex gap-2">
            {timeLeft.days > 0 && (
              <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm">
                <div className="text-lg font-black text-slate-800">{timeLeft.days}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase">Days</div>
              </div>
            )}
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm">
              <div className="text-lg font-black text-slate-800">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Hrs</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm">
              <div className="text-lg font-black text-slate-800">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">Mins</div>
            </div>
            <div className="bg-[#D65A31] border border-[#b54622] px-3 py-2 rounded-xl min-w-[50px] text-center shadow-md animate-pulse">
              <div className="text-lg font-black text-white">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[10px] font-bold text-orange-100 uppercase">Secs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative group/slider mt-4">
        
        {products.length > 4 && (
          <button 
            onClick={() => scroll('left')} 
            className="absolute top-[45%] -left-5 z-20 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full p-2.5 border border-gray-100 text-slate-600 hover:text-[#148F96] hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/slider:opacity-100 items-center justify-center"
          >
            <ChevronLeft size={28} />
          </button>
        )}

        <div 
          ref={scrollRef}
          className="flex overflow-x-auto gap-8 py-6 px-1 scrollbar-hide relative z-10 items-stretch"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => {
            if (!product.promo) return null;

            const isOutOfStock = Number(product.stock) <= 0;
            const originalPrice = Number(product.price);
            const discountedPrice = calculateDiscountPrice(product.price, product.promo);

            return (
              <Link to={`/product/${product.id}`} key={product.id} className={`group relative flex flex-col w-[280px] shrink-0 text-left ${isOutOfStock ? 'opacity-80' : ''}`}>
                  <div className={`bg-white rounded-[2rem] shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden border-2 h-full flex flex-col relative transform hover:-translate-y-2 isolate ${getBorderColor()}`}>
                  
                  <div className={`absolute top-4 left-4 bg-gradient-to-r ${getBadgeStyle()} text-white text-[11px] font-black px-3.5 py-1.5 rounded-full z-20 shadow-lg tracking-widest flex items-center gap-1 border border-white/30`}>
                      <Sparkles size={14} /> {product.promo.title.toUpperCase()}
                  </div>

                  <button 
                      onClick={(e) => toggleBookmark(e, product.id)}
                      className="absolute top-4 right-4 p-2.5 bg-white/95 backdrop-blur-md hover:bg-white rounded-full z-20 shadow-md text-slate-400 hover:text-yellow-500 transition-all hover:scale-110 border border-slate-200"
                  >
                      <Star size={20} fill={bookmarks.includes(product.id) ? "currentColor" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-500" : ""} />
                  </button>

                  <div className="h-60 overflow-hidden bg-slate-100 relative rounded-t-[2rem]" style={{ transform: 'translateZ(0)' }}>
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                      <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply" />
                      
                      {/* ✅ ป้ายสินค้าหมด (ซ้ายล่าง) */}
                      {isOutOfStock && (
                          <div className="absolute bottom-4 left-4 bg-red-50 text-red-600 border border-red-200 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-sm z-20">
                            สินค้าหมด
                          </div>
                      )}
                  </div>

                  <div className="p-6 flex flex-col flex-1 bg-white relative z-10">
                      <div className="text-[11px] text-[#148F96] font-black tracking-widest uppercase mb-2">
                        {product.category || 'SPECIAL'}
                      </div>
                      <h3 className="font-bold text-slate-900 text-xl mb-2 line-clamp-2 transition-colors">
                        {product.name}
                      </h3>
                      
                      <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-100">
                          <div>
                              <div className="flex items-center gap-2 mb-1">
                                  <span className="text-slate-400 line-through text-xs font-bold">฿{originalPrice.toLocaleString()}</span>
                                  <span className="text-[11px] text-white bg-red-500 px-2 py-0.5 rounded-md font-bold shadow-sm">
                                      ลด {product.promo.discountType === 'PERCENTAGE' ? `${product.promo.discountValue}%` : `฿${product.promo.discountValue}`}
                                  </span>
                              </div>
                              <div className="text-2xl font-black text-red-600">
                                  ฿{discountedPrice.toLocaleString()}
                              </div>
                          </div>

                          <button 
                              onClick={(e) => handleAddToCart(e, product)} 
                              disabled={isOutOfStock}
                              className={`p-3.5 rounded-2xl transition-all duration-300 border border-slate-100
                                ${isOutOfStock
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                  : 'bg-[#148F96]/10 hover:bg-[#148F96] text-[#148F96] hover:text-white shadow-sm hover:shadow-xl hover:shadow-[#148F96]/40 transform hover:scale-105 hover:border-transparent'
                                }`} 
                          >
                              <ShoppingCart size={20} />
                          </button>
                      </div>
                  </div>
                  </div>
              </Link>
            );
          })}
        </div>

        {products.length > 4 && (
          <button 
            onClick={() => scroll('right')} 
            className="absolute top-[45%] -right-5 z-20 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full p-2.5 border border-gray-100 text-slate-600 hover:text-[#148F96] hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/slider:opacity-100 items-center justify-center"
          >
            <ChevronRight size={28} />
          </button>
        )}
      </div>

    </div>
  );
};

export default SeasonalPromotion;