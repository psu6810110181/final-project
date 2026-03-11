// frontend/src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader, Search, ChevronDown, FilterX, Star } from 'lucide-react'; 
import * as api from '../services/api'; 
import type { Product, Category, Room, Feature, Color, Material, Size, Promotion } from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import FlashSale from '../components/FlashSale';
import TabBar from '../components/TabBar';

import heroBackground from '../assets/background.jpg';

export type ProductWithPromo = Product & { promo?: Promotion };

const getColorHex = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'แดง': '#EF4444', 'น้ำเงิน': '#3B82F6', 'ดำ': '#000000', 'ขาว': '#FFFFFF',
    'เขียว': '#22C55E', 'เหลือง': '#EAB308', 'เทา': '#6B7280', 'น้ำตาล': '#8B4513'
  };
  return colorMap[colorName] || '#ccc';
};

function calculateDiscountPrice(price: string | number, promo: Promotion) {
  const p = Number(price);
  if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
  return Math.max(0, p - promo.discountValue);
}

const Home = () => {
  const [products, setProducts] = useState<ProductWithPromo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [recommendedProducts, setRecommendedProducts] = useState<ProductWithPromo[]>([]);
  const [promoProducts, setPromoProducts] = useState<ProductWithPromo[]>([]);
  const [generalProducts, setGeneralProducts] = useState<ProductWithPromo[]>([]);

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'room' | 'feature' | 'color' | 'material' | 'size' | null>(null);

  const { addToCart } = useCart();
  const navigate = useNavigate();

  const isAdvancedFilterAllowed = selectedCategories.length > 0 || selectedRooms.length > 0 || selectedFeatures.length > 0;

  useEffect(() => {
    setIsVisible(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        const [
          productsData, categoriesData, roomsData, featuresData,
          colorsData, materialsData, sizesData, promoData
        ] = await Promise.all([
          api.getAllProducts().catch(() => []),
          api.getAllCategories().catch(() => []),
          api.getAllRooms().catch(() => []),
          api.getAllFeatures().catch(() => []),
          api.getAllColors().catch(() => []),
          api.getAllMaterials().catch(() => []),
          api.getAllSizes().catch(() => []),
          api.getAllPromotions().catch(() => []) 
        ]);
        
        let promoMap = new Map<string, Promotion>();
        const now = new Date();

        if (Array.isArray(promoData)) {
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
        }

        const validProducts = Array.isArray(productsData) ? productsData : [];
        const productsWithPromo: ProductWithPromo[] = validProducts.map(p => ({
            ...p,
            promo: promoMap.get(p.id)
        }));

        setProducts(productsWithPromo);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
        setSizes(Array.isArray(sizesData) ? sizesData : []);

        const shuffled = [...productsWithPromo].sort(() => 0.5 - Math.random());
        setRecommendedProducts(shuffled.slice(0, 10));

        const onSaleProducts = productsWithPromo.filter(p => p.promo);
        setPromoProducts(onSaleProducts.slice(0, 10));

        const normalProducts = productsWithPromo.filter(p => !p.promo);
        setGeneralProducts(normalProducts.slice(0, 10));

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const bookmarkData = await api.getBookmarks();
            if (Array.isArray(bookmarkData)) {
                const bookmarkIds = bookmarkData.map((b: any) => b.productId || b.product?.id || b.id);
                setBookmarks(bookmarkIds);
            } else if (bookmarkData && Array.isArray(bookmarkData.data)) {
                const bookmarkIds = bookmarkData.data.map((b: any) => b.productId || b.product?.id || b.id);
                setBookmarks(bookmarkIds);
            } else {
                setBookmarks([]);
            }
          } catch (err) {
            setBookmarks([]);
          }
        }

      } catch (error) {
        toast.error('ไม่สามารถดึงข้อมูลสินค้าได้');
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const handleBookmarkUpdate = () => {
      const token = localStorage.getItem('token');
      if (token) {
          api.getBookmarks().then(data => {
              if (Array.isArray(data)) {
                  const bookmarkIds = data.map((b: any) => b.productId || b.product?.id || b.id);
                  setBookmarks(bookmarkIds);
              } else if (data && Array.isArray(data.data)) {
                  const bookmarkIds = data.data.map((b: any) => b.productId || b.product?.id || b.id);
                  setBookmarks(bookmarkIds);
              }
          }).catch(() => {});
      } else {
          setBookmarks([]);
      }
    };
    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);
    return () => window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);

  }, []);

  const filteredProducts = products.filter((product) => {
    const matchCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category));
    const matchRoom = selectedRooms.length === 0 || (product.room && selectedRooms.includes(product.room));
    const matchFeature = selectedFeatures.length === 0 || (product.features && product.features.some((f) => selectedFeatures.includes(f)));
    
    const variants = (product as any).variants || [];

    const matchColor = selectedColors.length === 0 || 
      variants.some((v: any) => selectedColors.includes(v.color?.name || v.color)) ||
      ((product as any).colors || []).some((c: any) => selectedColors.includes(c?.name || c)); 

    const matchMaterial = selectedMaterials.length === 0 || 
      variants.some((v: any) => selectedMaterials.includes(v.material?.name || v.material)) ||
      ((product as any).materials || []).some((m: any) => selectedMaterials.includes(m?.name || m));

    const matchSize = selectedSizes.length === 0 || 
      variants.some((v: any) => selectedSizes.includes(v.size?.name || v.size)) ||
      ((product as any).sizes || []).some((s: any) => selectedSizes.includes(s?.name || s));

    const searchLower = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' || 
      product.name.toLowerCase().includes(searchLower) || 
      (product.category && product.category.toLowerCase().includes(searchLower)) || 
      (product.description && product.description.toLowerCase().includes(searchLower));
    
    const productPrice = product.promo ? calculateDiscountPrice(product.price, product.promo) : Number(product.price);
    const matchMinPrice = minPrice === '' || productPrice >= Number(minPrice);
    const matchMaxPrice = maxPrice === '' || productPrice <= Number(maxPrice);

    return matchCategory && matchRoom && matchFeature && matchColor && matchMaterial && matchSize && matchSearch && matchMinPrice && matchMaxPrice; 
  });

  const handleToggle = (value: string, selectedList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedList.includes(value)) setList(selectedList.filter((item) => item !== value));
    else setList([...selectedList, value]);
  };

  const toggleDropdown = (dropdownName: any) => {
    if (['color', 'material', 'size'].includes(dropdownName) && !isAdvancedFilterAllowed) {
      toast.error('กรุณาเลือก หมวดหมู่, ห้อง หรือ คุณสมบัติ อย่างน้อย 1 อย่างก่อนใช้ตัวกรองนี้');
      return;
    }
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]); setSelectedRooms([]); setSelectedFeatures([]);
    setSelectedColors([]); setSelectedMaterials([]); setSelectedSizes([]);
    setMinPrice(''); setMaxPrice(''); setSearchTerm('');
  };

  const hasAnyFilter = selectedCategories.length > 0 || selectedRooms.length > 0 || selectedFeatures.length > 0 || minPrice !== '' || maxPrice !== '' || searchTerm !== '' || selectedColors.length > 0 || selectedMaterials.length > 0 || selectedSizes.length > 0;

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

  const ProductGrid = ({ title, items }: { title?: string, items: ProductWithPromo[] }) => (
    <div className="mb-16">
        {title && (
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[2px] w-8 bg-[#148F96]"></div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>
        )}
        {items.length === 0 ? (
          <div className="bg-white/50 backdrop-blur-md p-10 text-center rounded-3xl border border-white shadow-xl">
            <p className="text-slate-500 font-medium">ไม่พบสินค้า</p>
          </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative z-10">
                {items.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group relative block">
                    <div className="bg-white/70 backdrop-blur-xl rounded-[2rem] shadow-lg shadow-slate-200/50 hover:shadow-2xl hover:shadow-[#148F96]/20 transition-all duration-500 overflow-hidden border border-white/80 h-full flex flex-col relative translate-y-0 hover:-translate-y-2">
                    
                    {product.promo && (
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-red-500 to-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full z-20 shadow-lg tracking-wider">
                            {product.promo.title.toUpperCase()}
                        </div>
                    )}

                    <button 
                        onClick={(e) => toggleBookmark(e, product.id)}
                        className="absolute top-4 right-4 p-2.5 bg-white/50 backdrop-blur-md hover:bg-white rounded-full z-20 shadow-md text-gray-400 hover:text-yellow-500 transition-all hover:scale-110"
                    >
                        <Star size={20} fill={bookmarks.includes(product.id) ? "currentColor" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-400" : ""} />
                    </button>

                    <div className="h-60 overflow-hidden bg-slate-100 relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"/>
                        <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                        <div className="text-xs text-[#148F96] font-bold tracking-widest uppercase mb-2">{product.category || 'GENERAL'}</div>
                        <h3 className="font-bold text-slate-800 text-xl mb-2 line-clamp-2 group-hover:text-[#D65A31] transition-colors">{product.name}</h3>
                        <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed">{product.description || "ไม่มีรายละเอียด"}</p>
                        
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
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA]"><Loader size={48} className="animate-spin text-[#148F96]" /></div>;

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#148F96]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10">
        <TabBar />
      </div>

      {/* --- 🎬 HERO SECTION CINEMATIC --- */}
      <div className="relative h-[60vh] min-h-[450px] flex flex-col justify-center items-center text-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-slate-900/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFA] via-transparent to-transparent z-10" />
        <img src={heroBackground} alt="Banner" className="absolute inset-0 w-full h-full object-cover scale-105" />
        
        <div className={`relative z-20 container mx-auto px-4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <span className="inline-block text-[#148F96] bg-white/10 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-sm font-bold tracking-widest mb-6 shadow-2xl">
            PREMIUM COLLECTION
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl leading-tight">
            แต่งบ้านในฝัน <br className="hidden md:block"/>ให้เป็นจริง
          </h1>
          <p className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl mx-auto font-light drop-shadow-md">
            สัมผัสประสบการณ์เฟอร์นิเจอร์ดีไซน์สวย คุณภาพเยี่ยม ที่คัดสรรมาเพื่อยกระดับการใช้ชีวิตของคุณ
          </p>
        </div>
      </div>

      {/* --- 🎬 FLOATING FILTER BAR (Sticky) --- */}
      {/* ✅ เปลี่ยน top-4 z-50 เป็น top-24 z-40 เพื่อให้เลื่อนแล้วไปอยู่ใต้ Navbar */}
      <div className="sticky top-20 z-40 container mx-auto px-4 -mt-10 mb-16 transition-all duration-300">
        <div className="bg-white/95 backdrop-blur-2xl border border-white/80 shadow-2xl shadow-slate-200/50 rounded-[2rem] p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Dropdown */}
            <div className="relative">
              <button onClick={() => toggleDropdown('category')} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${selectedCategories.length > 0 ? 'bg-[#148F96] text-white shadow-lg shadow-[#148F96]/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                หมวดหมู่สินค้า {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'category' && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-4">
                    {categories.map((cat) => (
                      <li key={cat.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(cat.name, selectedCategories, setSelectedCategories)}>
                        <input type="checkbox" className="rounded-md border-slate-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedCategories.includes(cat.name)} readOnly />
                        <span className={selectedCategories.includes(cat.name) ? 'font-bold text-[#148F96]' : ''}>{cat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Room Dropdown */}
            <div className="relative">
              <button onClick={() => toggleDropdown('room')} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${selectedRooms.length > 0 ? 'bg-[#148F96] text-white shadow-lg shadow-[#148F96]/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                ห้อง {selectedRooms.length > 0 && `(${selectedRooms.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'room' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'room' && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-4">
                    {rooms.map((room) => (
                      <li key={room.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(room.name, selectedRooms, setSelectedRooms)}>
                        <input type="checkbox" className="rounded-md border-slate-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedRooms.includes(room.name)} readOnly />
                        <span className={selectedRooms.includes(room.name) ? 'font-bold text-[#148F96]' : ''}>{room.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Feature Dropdown */}
            <div className="relative">
              <button onClick={() => toggleDropdown('feature')} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${selectedFeatures.length > 0 ? 'bg-[#148F96] text-white shadow-lg shadow-[#148F96]/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                คุณสมบัติเพิ่มเติม {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'feature' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'feature' && (
                <div className="absolute top-full left-0 mt-3 w-64 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-4">
                    {features.map((feat) => (
                      <li key={feat.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(feat.name, selectedFeatures, setSelectedFeatures)}>
                        <input type="checkbox" className="rounded-md border-slate-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedFeatures.includes(feat.name)} readOnly />
                        <span className={selectedFeatures.includes(feat.name) ? 'font-bold text-[#148F96]' : ''}>{feat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Price Filter */}
            <div className="flex items-center gap-2 bg-slate-50 rounded-full px-5 py-2 focus-within:ring-2 ring-[#148F96]/30 transition-all border border-slate-200/50">
              <span className="text-sm font-bold text-slate-500">ราคา:</span>
              <input type="number" placeholder="ต่ำสุด" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-20 text-sm outline-none bg-transparent text-center font-medium" min="0" />
              <span className="text-slate-300">-</span>
              <input type="number" placeholder="สูงสุด" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-20 text-sm outline-none bg-transparent text-center font-medium" min="0" />
            </div>
            {/* Color Filter */}
            <div className="relative">
              <button onClick={() => toggleDropdown('color')} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${!isAdvancedFilterAllowed ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : selectedColors.length > 0 ? 'bg-[#148F96] text-white shadow-lg shadow-[#148F96]/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                สี {selectedColors.length > 0 && `(${selectedColors.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'color' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'color' && isAdvancedFilterAllowed && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-4">
                    {colors.map((color) => (
                      <li key={color.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(color.name, selectedColors, setSelectedColors)}>
                        <div className="w-4 h-4 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: getColorHex(color.name) }}></div>
                        <span className={selectedColors.includes(color.name) ? 'font-bold text-[#148F96]' : ''}>{color.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Material Filter */}
            <div className="relative">
              <button onClick={() => toggleDropdown('material')} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${!isAdvancedFilterAllowed ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : selectedMaterials.length > 0 ? 'bg-[#148F96] text-white shadow-lg shadow-[#148F96]/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                วัสดุ {selectedMaterials.length > 0 && `(${selectedMaterials.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'material' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'material' && isAdvancedFilterAllowed && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-4">
                    {materials.map((mat) => (
                      <li key={mat.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(mat.name, selectedMaterials, setSelectedMaterials)}>
                        <input type="checkbox" className="rounded-md border-slate-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedMaterials.includes(mat.name)} readOnly />
                        <span className={selectedMaterials.includes(mat.name) ? 'font-bold text-[#148F96]' : ''}>{mat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Size Filter */}
            <div className="relative">
              <button onClick={() => toggleDropdown('size')} className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all ${!isAdvancedFilterAllowed ? 'opacity-50 cursor-not-allowed bg-gray-100 text-gray-400' : selectedSizes.length > 0 ? 'bg-[#148F96] text-white shadow-lg shadow-[#148F96]/30' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
                ขนาด {selectedSizes.length > 0 && `(${selectedSizes.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'size' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'size' && isAdvancedFilterAllowed && (
                <div className="absolute top-full left-0 mt-3 w-48 bg-white/95 backdrop-blur-2xl border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-4">
                    {sizes.map((size) => (
                      <li key={size.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(size.name, selectedSizes, setSelectedSizes)}>
                        <input type="checkbox" className="rounded-md border-slate-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedSizes.includes(size.name)} readOnly />
                        <span className={selectedSizes.includes(size.name) ? 'font-bold text-[#148F96]' : ''}>{size.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Clear Filters Button */}
            {hasAnyFilter && (
              <button onClick={clearAllFilters} className="px-4 py-2 text-red-500 text-sm font-bold flex items-center gap-2 hover:bg-red-50 rounded-full transition-colors ml-auto lg:ml-0">
                <FilterX size={16} /> ล้าง
              </button>
            )}
          </div>
          {/* Search Bar */}
          <div className="flex flex-col items-end w-full lg:w-80 flex-shrink-0 mt-2 lg:mt-0">
            <div className="relative w-full group">
              <input type="text" placeholder="ค้นหาชื่อ รายละเอียด..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200/50 rounded-full focus:outline-none focus:ring-2 focus:ring-[#148F96]/50 transition-all text-sm font-medium" />
              <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#148F96] transition-colors" size={18} />
            </div>
            {hasAnyFilter && (
              <div className="text-xs text-slate-500 mt-2 pr-2 font-medium">
                ค้นพบ <span className="text-[#148F96] font-bold text-sm">{filteredProducts.length}</span> รายการ
              </div>
            )}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 relative z-20">
        <main>
          {hasAnyFilter ? (
             <ProductGrid title="ผลการค้นหา" items={filteredProducts} />
          ) : (
             <>
                <FlashSale products={products} />
                <ProductGrid title="✨ แนะนำสำหรับคุณ" items={recommendedProducts} />
                <ProductGrid title="🔥 โปรโมชันพิเศษ" items={promoProducts} />
                <ProductGrid title="🛋️ สินค้ามาใหม่" items={generalProducts} />
             </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;