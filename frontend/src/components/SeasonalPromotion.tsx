import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Sun, Waves, Sparkles, Leaf, Wind, Snowflake, Flower, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api';
import type { ProductWithPromo } from '../pages/Home';
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
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0, hours: 0, minutes: 0, seconds: 0
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

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

  const getBadgeStyle = () => {
    switch (detectedSeason) {
      case 'spring': return 'bg-gradient-to-r from-pink-400 to-rose-500';
      case 'summer': return 'bg-gradient-to-r from-orange-400 to-amber-500';
      case 'autumn': return 'bg-gradient-to-r from-orange-600 to-amber-700';
      case 'winter': return 'bg-gradient-to-r from-cyan-400 to-blue-500';
      default: return 'bg-gradient-to-r from-[#148F96] to-[#0f6f75]';
    }
  };

  const getBorderColor = () => {
    switch (detectedSeason) {
      case 'spring': return 'border-pink-200/50 hover:shadow-pink-500/20';
      case 'summer': return 'border-orange-200/50 hover:shadow-orange-500/20';
      case 'autumn': return 'border-amber-200/50 hover:shadow-amber-700/20';
      case 'winter': return 'border-cyan-200/50 hover:shadow-cyan-500/20';
      default: return 'border-slate-100 hover:shadow-[#148F96]/20';
    }
  };

  const getIconColor = () => {
    switch (detectedSeason) {
      case 'spring': return 'text-pink-400/20';
      case 'summer': return 'text-orange-400/20';
      case 'autumn': return 'text-amber-600/20';
      case 'winter': return 'text-cyan-400/20';
      default: return 'text-[#148F96]/10';
    }
  };

  if (products.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] shadow-[0_20px_50px_rgba(20,143,150,0.05)] border border-white/80 p-8 md:p-12 my-12 group font-sans bg-white isolate">
      
      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none transition-opacity duration-1000 group-hover:opacity-[0.25] -z-10"
        style={{
          background: theme.gradient,
          backgroundSize: '400% 400%',
          animation: theme.animation || 'gradient 15s ease infinite',
        }}
      />
      <div className="absolute inset-0 bg-white/70 backdrop-blur-3xl pointer-events-none -z-10" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        {[...Array(5)].map((_, i) => {
          const IconComponent = iconMap[theme.iconComponent[1] as keyof typeof iconMap];
          if (!IconComponent) return null;
          return (
            <IconComponent 
              key={i} size={40 + Math.random() * 40} 
              className={`absolute animate-pulse ${getIconColor()}`}
              style={{ 
                top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                animationDelay: `${i * 0.5}s`, animationDuration: '6s',
                transform: `translateY(${Math.random() * 10}px)`
              }} 
            />
          );
        })}
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row justify-between items-center mb-10 gap-8 border-b border-slate-100 pb-8">
        <div className="text-center lg:text-left">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight flex flex-wrap items-center justify-center lg:justify-start gap-3">
            <span className="text-3xl drop-shadow-sm animate-bounce" style={{ animationDuration: '3s' }}>{theme.emoji[0]}</span>
            {title || `แคมเปญ${theme.nameTh}`}
          </h2>
          <p className="text-slate-500 font-medium text-base">
            {theme.description}
          </p>
        </div>
        
        <div className="bg-slate-50/80 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="text-slate-500 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Clock size={16} className="text-[#D65A31]" /> สิ้นสุดใน
          </div>
          <div className="flex gap-2">
            {timeLeft.days > 0 && (
              <div className="bg-white border border-slate-100 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm">
                <div className="text-lg font-black text-slate-700">{timeLeft.days}</div>
                <div className="text-[9px] font-bold text-slate-400 uppercase">Days</div>
              </div>
            )}
            <div className="bg-white border border-slate-100 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm">
              <div className="text-lg font-black text-slate-700">{String(timeLeft.hours).padStart(2, '0')}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Hrs</div>
            </div>
            <div className="bg-white border border-slate-100 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm">
              <div className="text-lg font-black text-slate-700">{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div className="text-[9px] font-bold text-slate-400 uppercase">Mins</div>
            </div>
            <div className="bg-[#D65A31]/5 border border-[#D65A31]/20 px-3 py-2 rounded-xl min-w-[50px] text-center shadow-sm animate-pulse">
              <div className="text-lg font-black text-[#D65A31]">{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div className="text-[9px] font-bold text-[#D65A31] uppercase">Secs</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
        {products.map((product) => {
          if (!product.promo) return null;
          const originalPrice = Number(product.price);
          const discountedPrice = calculateDiscountPrice(product.price, product.promo);

          return (
            <Link to={`/product/${product.id}`} key={product.id} className="group relative block text-left">
                {/* ✅ เพิ่ม isolate และ overflow-hidden ให้ Card หลักเพื่อป้องกันขอบกระพริบ */}
                <div className={`bg-white rounded-[2rem] shadow-md hover:shadow-2xl transition-all duration-500 overflow-hidden border h-full flex flex-col relative transform hover:-translate-y-2 isolate ${getBorderColor()}`}>
                
                <div className={`absolute top-4 left-4 ${getBadgeStyle()} text-white text-[10px] font-bold px-3 py-1.5 rounded-full z-20 shadow-md tracking-wider flex items-center gap-1`}>
                    <Sparkles size={12} /> {product.promo.title.toUpperCase()}
                </div>

                <button 
                    onClick={(e) => toggleBookmark(e, product.id)}
                    className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-md hover:bg-white rounded-full z-20 shadow-sm text-slate-300 hover:text-yellow-400 transition-all hover:scale-110 border border-slate-100"
                >
                    <Star size={18} fill={bookmarks.includes(product.id) ? "currentColor" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-400" : ""} />
                </button>

                {/* ✅ ใส่โค้ดกันมุมภาพเหลี่ยม (translateZ) */}
                <div className="h-60 overflow-hidden bg-slate-50 relative rounded-t-[2rem]" style={{ transform: 'translateZ(0)' }}>
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/5 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                    <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out mix-blend-multiply" />
                </div>

                <div className="p-6 flex flex-col flex-1 bg-white relative z-10">
                    <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase mb-2">
                      {product.category || 'SPECIAL'}
                    </div>
                    <h3 className="font-bold text-slate-800 text-lg mb-2 line-clamp-2 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="mt-auto flex items-end justify-between pt-4 border-t border-slate-50">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-slate-400 line-through text-xs font-medium">฿{originalPrice.toLocaleString()}</span>
                                <span className="text-[10px] text-red-500 bg-red-50 px-2 py-0.5 rounded-md font-bold">
                                    ลด {product.promo.discountType === 'PERCENTAGE' ? `${product.promo.discountValue}%` : `฿${product.promo.discountValue}`}
                                </span>
                            </div>
                            <div className="text-xl font-black text-slate-800">
                                ฿{discountedPrice.toLocaleString()}
                            </div>
                        </div>

                        <button 
                            onClick={(e) => handleAddToCart(e, product)} 
                            className="bg-slate-50 hover:bg-[#148F96] text-slate-600 hover:text-white p-3 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-[#148F96]/30 transform hover:scale-105" 
                        >
                            <ShoppingCart size={18} />
                        </button>
                    </div>
                </div>
                </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default SeasonalPromotion;