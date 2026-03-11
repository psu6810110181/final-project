import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
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
  } catch (e) {
      console.error("Error parsing image:", e);
  }
  return "https://placehold.co/400x300?text=No+Image";
};

const FlashSale: React.FC<FlashSaleProps> = ({ products: allProducts = [] }) => {
  const [flashSales, setFlashSales] = useState<Promotion[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  const { addToCart } = useCart();
  const navigate = useNavigate();

  // ดึงข้อมูล Flash Sale และ Bookmark
  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const sales = await getActiveFlashSales();
        setFlashSales(sales);
      } catch (error) {
        console.error('Failed to fetch flash sales:', error);
      }
    };

    const fetchBookmarks = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const data = await api.getBookmarks();
                const bookmarkIds = Array.isArray(data) ? data.map((b: any) => b.productId || b.product?.id || b.id) : (data && Array.isArray(data.data) ? data.data.map((b: any) => b.productId || b.product?.id || b.id) : []);
                setBookmarks(bookmarkIds);
            } catch (error) {
                console.error('Failed to load bookmarks', error);
            }
        }
    };

    fetchFlashSales();
    fetchBookmarks();

    const interval = setInterval(fetchFlashSales, 30000); // รีเฟรชทุก 30 วินาที

    // ฟัง Event กรณีมีการกด Bookmark จากหน้าอื่น
    const handleBookmarkUpdate = () => fetchBookmarks();
    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);

    return () => {
        clearInterval(interval);
        window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
    };
  }, []);

  // นับเวลาถอยหลัง
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (flashSales.length === 0) return;

      const now = new Date();
      let minEndTime = new Date(flashSales[0].endDate);

      flashSales.forEach(sale => {
        const endTime = new Date(sale.endDate);
        if (endTime < minEndTime) {
          minEndTime = endTime;
        }
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

  // จัดการการเพิ่มตะกร้า
  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1); 
  };

  // จัดการปุ่มถูกใจ (Bookmark)
  const toggleBookmark = async (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    
    const token = localStorage.getItem('token');
    if (!token) {
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
    } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการจัดการสินค้าที่สนใจ');
    }
  };

  const calculateDiscountedPrice = (product: Product, promotion: Promotion) => {
    const price = typeof product.price === 'string' ? Number(product.price) : product.price;
    
    if (promotion.discountType === 'PERCENTAGE') {
      return price * (1 - promotion.discountValue / 100);
    } else {
      return Math.max(0, price - promotion.discountValue);
    }
  };

  const getFlashSaleProducts = () => {
    const flashSaleProductIds = new Set<string>();
    
    flashSales.forEach(sale => {
      sale.products?.forEach(product => {
        flashSaleProductIds.add(product.id);
      });
    });

    return allProducts.filter(product => flashSaleProductIds.has(product.id));
  };

  const flashSaleProducts = getFlashSaleProducts();

  if (flashSales.length === 0 || flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff8e53 0%, #148f96 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '20px 0 40px 0',
      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.2)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
            ⚡ FLASH SALE
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            ลดแรงแซงทุกโปร ด่วน! เวลาจำกัด
          </p>
        </div>
        
        {/* Countdown Timer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>เหลือเวลาอีก</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {timeLeft.days > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{timeLeft.days}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>วัน</div>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>ชม</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>นาที</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>วินาที</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {flashSaleProducts.map((product) => {
          const promotion = flashSales.find(sale => 
            sale.products?.some(p => p.id === product.id)
          );
          
          if (!promotion) return null;

          const originalPrice = typeof product.price === 'string' ? Number(product.price) : product.price;
          const discountedPrice = calculateDiscountedPrice(product, promotion);

          return (
            <Link to={`/product/${product.id}`} key={product.id} className="group relative block text-left">
                {/* เปลี่ยนเป็น bg-white/20 และเพิ่ม backdrop-blur-md */}
                <div className="bg-white/20 backdrop-blur-md rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-white/30 h-full flex flex-col relative">
                
                {/* Promo Badge */}
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-md tracking-wider">
                    {promotion.title.toUpperCase()}
                </div>

                {/* Bookmark Button */}
                <button 
                    onClick={(e) => toggleBookmark(e, product.id)}
                    className="absolute top-3 right-3 p-2 bg-white/30 hover:bg-white/80 backdrop-blur-sm rounded-full z-20 shadow-sm text-white hover:text-yellow-400 transition-all hover:scale-110"
                    title="เพิ่มในสินค้าที่สนใจ"
                >
                    <Star size={18} fill={bookmarks.includes(product.id) ? "#FACC15" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-400" : ""} />
                </button>

                {/* Product Image */}
                <div className="h-48 overflow-hidden bg-white/10">
                    <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                </div>

                {/* Product Details - ปรับสีตัวอักษรให้อ่านง่ายบนพื้นหลัง Glassmorphism */}
                <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs text-teal-100 font-bold mb-1">{product.category || 'ไม่มีหมวดหมู่'}</div>
                    <h3 className="font-bold text-white text-lg mb-1 truncate group-hover:text-teal-200 transition-colors">{product.name}</h3>
                    <p className="text-white/70 text-xs mb-3 line-clamp-1">{product.description || "ไม่มีรายละเอียด"}</p>
                    
                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-0.5">
                                <span className="text-white/60 line-through text-xs">฿{originalPrice.toLocaleString()}</span>
                                <span className="text-[10px] text-red-600 bg-white/90 px-1.5 py-0.5 rounded font-bold shadow-sm">
                                    ลด {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `฿${promotion.discountValue}`}
                                </span>
                            </div>
                            <div className="text-xl font-bold text-red-600">
                                ฿{discountedPrice.toLocaleString()}
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button onClick={(e) => handleAddToCart(e, product)} className="bg-white/20 hover:bg-white text-white hover:text-[#148F96] p-2.5 rounded-full transition-colors backdrop-blur-sm" title="เพิ่มลงตะกร้า">
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

export default FlashSale;