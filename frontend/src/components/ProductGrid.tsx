import React, { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, Zap, ChevronLeft, ChevronRight } from 'lucide-react'; 
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api'; 
import type { Product, Promotion } from '../services/api';

export type ProductWithPromo = Product & { promo?: Promotion };

interface ProductGridProps {
  title?: React.ReactNode;
  items: ProductWithPromo[];
  showPagination?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  bookmarks: string[];
  setBookmarks: React.Dispatch<React.SetStateAction<string[]>>;
  theme?: 'default' | 'promo'; 
  horizontal?: boolean; 
  gridCols?: 4 | 5; 
}

const calculateDiscountPrice = (price: string | number, promo: Promotion) => {
  const p = Number(price);
  if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
  return Math.max(0, p - promo.discountValue);
};

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getImageUrl = (product: Product) => {
  try {
      const rawImages = product.image;
      let images: string[] = [];
      if (Array.isArray(rawImages)) images = rawImages;
      else if (typeof rawImages === 'string') images = rawImages.startsWith('[') ? JSON.parse(rawImages) : [rawImages];
      if (images.length > 0) return images[0].startsWith('http') ? images[0] : `${API_BASE_URL}/uploads/${images[0]}`;
  } catch (e) {}
  return "https://placehold.co/400x300?text=No+Image";
};

const ProductGrid: React.FC<ProductGridProps> = ({ 
  title, items, showPagination = false, 
  currentPage = 1, totalPages = 1, onPageChange,
  bookmarks, setBookmarks, theme = 'default', horizontal = false, gridCols = 4 
}) => {
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null); 

  // ✅ เช็ค Token จากทั้ง 2 ที่
  const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    if (Number(product.stock) <= 0) {
      toast.error('ขออภัย สินค้านี้หมดชั่วคราว');
      return;
    }
    if (!getToken()) { 
      toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้า'); 
      navigate('/login'); 
      return; 
    }
    await addToCart(product.id, 1); 
  };

  const toggleBookmark = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation();
    if (!getToken()) { 
      toast.error('กรุณาเข้าสู่ระบบเพื่อบันทึกสินค้าที่สนใจ'); 
      navigate('/login'); 
      return; 
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
    } catch (error) { toast.error('เกิดข้อผิดพลาดในการจัดการสินค้าที่สนใจ'); }
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

  const isPromo = theme === 'promo';
  const cTheme = {
    titleBar: isPromo ? 'bg-red-500' : 'bg-[#148F96]',
    cardHover: isPromo ? 'hover:shadow-[0_10px_40px_rgb(239,68,68,0.15)] hover:border-red-200' : 'hover:shadow-[0_10px_40px_rgb(20,143,150,0.12)]',
    categoryText: isPromo ? 'text-red-500' : 'text-[#148F96]',
    titleHover: isPromo ? 'group-hover:text-red-600' : 'group-hover:text-[#D65A31]',
    btnCart: isPromo ? 'hover:bg-red-600 hover:text-white text-red-500 hover:shadow-red-500/30' : 'hover:bg-[#148F96] hover:text-white text-slate-700 hover:shadow-[#148F96]/30',
    pageActiveBg: isPromo ? 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20' : 'bg-[#148F96] text-white hover:bg-[#0f6f75] shadow-[#148F96]/20',
    pageText: isPromo ? 'text-red-500 hover:bg-red-50' : 'text-[#148F96] hover:bg-[#148F96] hover:text-white'
  };

  const gridClasses = horizontal 
    ? "flex overflow-x-auto gap-6 py-6 px-2 scrollbar-hide relative z-10 items-stretch" 
    : `grid grid-cols-2 md:grid-cols-3 ${gridCols === 5 ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-6 py-6 px-2 relative z-10 items-stretch`;

  return (
    <div className="mb-16">
      {title && (
        <div className="flex items-center gap-4 mb-4">
          {isPromo ? <Zap className="text-orange-500 drop-shadow-md" size={32} /> : <div className={`h-[2px] w-8 ${cTheme.titleBar}`}></div>}
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h2>
        </div>
      )}
      
      {items.length === 0 ? (
        <div className="bg-white p-10 text-center rounded-3xl border border-gray-100 shadow-sm text-slate-500 font-medium">ไม่พบสินค้า</div>
      ) : (
        <div className="relative group/slider">
          
          {horizontal && items.length > 4 && (
            <button 
              onClick={() => scroll('left')} 
              className="absolute top-1/2 -left-5 z-20 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full p-2.5 border border-gray-100 text-slate-600 hover:text-[#148F96] hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/slider:opacity-100 items-center justify-center"
            >
              <ChevronLeft size={28} />
            </button>
          )}

          <div 
            ref={horizontal ? scrollRef : null}
            className={gridClasses} 
            style={horizontal ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : {}}
          >
            {items.map((product) => {
              const isOutOfStock = Number(product.stock) <= 0;

              return (
                <Link 
                  to={`/product/${product.id}`} 
                  key={product.id} 
                  className={`group relative block ${horizontal ? "w-[260px] md:w-[280px] shrink-0 h-auto flex flex-col" : "h-full flex flex-col w-full text-left"} ${isOutOfStock ? 'opacity-80' : ''}`}
                >
                  <div className={`bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-500 overflow-hidden border border-gray-100 h-full flex flex-col relative translate-y-0 hover:-translate-y-2 ${cTheme.cardHover}`}>
                    
                    {product.promo && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg tracking-wider">
                            {product.promo.title.toUpperCase()}
                        </div>
                    )}

                    <button onClick={(e) => toggleBookmark(e, product.id)} className="absolute top-4 right-4 p-2.5 bg-white/80 backdrop-blur-md hover:bg-white rounded-full z-20 shadow-sm text-gray-400 hover:text-yellow-500 transition-all hover:scale-110 border border-gray-100">
                        <Star size={20} fill={bookmarks.includes(product.id) ? "currentColor" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-400" : ""} />
                    </button>

                    <div className="h-60 overflow-hidden bg-slate-50 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                        <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                        
                        {isOutOfStock && (
                          <div className="absolute bottom-4 left-4 bg-red-50 text-red-600 border border-red-200 text-xs font-extrabold px-3 py-1.5 rounded-xl shadow-sm z-20">
                            สินค้าหมด
                          </div>
                        )}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                        <div className={`text-xs font-bold tracking-widest uppercase mb-2 ${cTheme.categoryText}`}>{product.category || (isPromo ? 'PROMOTION' : 'GENERAL')}</div>
                        <h3 className={`font-semibold text-slate-800 text-xl mb-2 line-clamp-2 transition-colors leading-snug min-h-[3rem] ${cTheme.titleHover}`}>{product.name}</h3>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description || "ไม่มีรายละเอียด"}</p>
                        
                        <div className="mt-auto flex items-end justify-between pt-4 border-t border-gray-100">
                            <div>
                                {product.promo ? (
                                    <>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-slate-400 line-through text-sm">฿{Number(product.price).toLocaleString()}</span>
                                            <span className="text-[10px] text-red-600 bg-red-50 px-2 py-0.5 rounded-md font-bold">
                                                ลด {product.promo.discountType === 'PERCENTAGE' ? `${product.promo.discountValue}%` : `฿${product.promo.discountValue}`}
                                            </span>
                                        </div>
                                        <div className="text-2xl font-black text-red-600 drop-shadow-sm">฿{calculateDiscountPrice(product.price, product.promo).toLocaleString()}</div>
                                    </>
                                ) : (
                                    <div className="text-2xl font-black text-slate-800 drop-shadow-sm">฿{Number(product.price).toLocaleString()}</div>
                                )}
                            </div>

                            <button 
                                onClick={(e) => handleAddToCart(e, product)} 
                                disabled={isOutOfStock}
                                className={`p-3 rounded-2xl transition-all border border-gray-100 
                                  ${isOutOfStock 
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                    : `bg-slate-50 hover:scale-105 hover:shadow-lg hover:border-transparent ${cTheme.btnCart}`
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

          {horizontal && items.length > 4 && (
            <button 
              onClick={() => scroll('right')} 
              className="absolute top-1/2 -right-5 z-20 -translate-y-1/2 bg-white/90 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.15)] rounded-full p-2.5 border border-gray-100 text-slate-600 hover:text-[#148F96] hover:scale-110 transition-all hidden md:flex opacity-0 group-hover/slider:opacity-100 items-center justify-center"
            >
              <ChevronRight size={28} />
            </button>
          )}

        </div>
      )}

      {showPagination && totalPages > 1 && onPageChange && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <button 
            onClick={() => { onPageChange(currentPage - 1); window.scrollTo({ top: 500, behavior: 'smooth' }); }}
            disabled={currentPage === 1}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all border border-gray-200 shadow-sm ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : `bg-white ${cTheme.pageText}`}`}
          >
            ก่อนหน้า
          </button>

          <div className="text-slate-600 font-medium bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm">
            หน้า <span className={`font-bold ${cTheme.categoryText}`}>{currentPage}</span> จาก {totalPages}
          </div>

          <button 
            onClick={() => { onPageChange(currentPage + 1); window.scrollTo({ top: 500, behavior: 'smooth' }); }}
            disabled={currentPage === totalPages}
            className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : cTheme.pageActiveBg}`}
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;