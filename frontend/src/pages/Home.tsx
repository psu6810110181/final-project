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

        // ✅ ดึง Bookmark จาก Backend (เพิ่มการเช็ค Array)
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const bookmarkData = await api.getBookmarks();
            // ป้องกัน error .map is not a function
            if (Array.isArray(bookmarkData)) {
                const bookmarkIds = bookmarkData.map((b: any) => b.productId || b.product?.id || b.id);
                setBookmarks(bookmarkIds);
            } else if (bookmarkData && Array.isArray(bookmarkData.data)) { // เผื่อ Backend ซ้อนมาใน obj.data
                const bookmarkIds = bookmarkData.data.map((b: any) => b.productId || b.product?.id || b.id);
                setBookmarks(bookmarkIds);
            } else {
                setBookmarks([]);
            }
          } catch (err) {
            console.error('Failed to load bookmarks', err);
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

    // ฟัง Event กรณีมีการกด Bookmark จากหน้าอื่น
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
    <div className="mb-12">
        {title && <h2 className="text-2xl font-bold mb-4 text-gray-800 border-l-4 border-[#148F96] pl-3">{title}</h2>}
        {items.length === 0 ? <p className="text-gray-500 bg-white p-8 text-center rounded-xl shadow-sm">ไม่พบสินค้า</p> : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {items.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group relative block">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
                    
                    {product.promo && (
                        <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full z-20 shadow-md tracking-wider">
                            {product.promo.title.toUpperCase()}
                        </div>
                    )}

                    <button 
                        onClick={(e) => toggleBookmark(e, product.id)}
                        className="absolute top-3 right-3 p-2 bg-white/90 hover:bg-white backdrop-blur-sm rounded-full z-20 shadow-sm text-gray-400 hover:text-yellow-400 transition-all hover:scale-110"
                        title="เพิ่มในสินค้าที่สนใจ"
                    >
                        <Star size={18} fill={bookmarks.includes(product.id) ? "currentColor" : "none"} className={bookmarks.includes(product.id) ? "text-yellow-400" : ""} />
                    </button>

                    <div className="h-48 overflow-hidden bg-gray-100">
                        <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                        <div className="text-xs text-[#148F96] font-bold mb-1">{product.category || 'ไม่มีหมวดหมู่'}</div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-[#D65A31] transition-colors">{product.name}</h3>
                        <p className="text-gray-500 text-xs mb-3 line-clamp-1">{product.description || "ไม่มีรายละเอียด"}</p>
                        
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

                            <button onClick={(e) => handleAddToCart(e, product)} className="bg-gray-100 hover:bg-[#148F96] hover:text-white text-gray-600 p-2.5 rounded-full transition-colors" title="เพิ่มลงตะกร้า">
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
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#148F96]"><Loader size={48} className="animate-spin mb-4" /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      <TabBar />
      <div className="bg-white border-b shadow-sm relative z-30">
        <div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row gap-4 justify-between items-center">
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Dropdown */}
            <div className="relative">
              <button onClick={() => toggleDropdown('category')} className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedCategories.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                หมวดหมู่สินค้า {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'category' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {categories.map((cat) => (
                      <li key={cat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(cat.name, selectedCategories, setSelectedCategories)}>
                        <input type="checkbox" className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedCategories.includes(cat.name)} readOnly />
                        <span className={selectedCategories.includes(cat.name) ? 'font-bold text-[#148F96]' : ''}>{cat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Room Dropdown */}
            <div className="relative">
              <button onClick={() => toggleDropdown('room')} className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedRooms.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                ห้อง {selectedRooms.length > 0 && `(${selectedRooms.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'room' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'room' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {rooms.map((room) => (
                      <li key={room.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(room.name, selectedRooms, setSelectedRooms)}>
                        <input type="checkbox" className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedRooms.includes(room.name)} readOnly />
                        <span className={selectedRooms.includes(room.name) ? 'font-bold text-[#148F96]' : ''}>{room.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Feature Dropdown */}
            <div className="relative">
              <button onClick={() => toggleDropdown('feature')} className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedFeatures.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}>
                คุณสมบัติเพิ่มเติม {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'feature' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'feature' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {features.map((feat) => (
                      <li key={feat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(feat.name, selectedFeatures, setSelectedFeatures)}>
                        <input type="checkbox" className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedFeatures.includes(feat.name)} readOnly />
                        <span className={selectedFeatures.includes(feat.name) ? 'font-bold text-[#148F96]' : ''}>{feat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Price Filter */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-8 py-1.5 bg-white focus-within:border-[#148F96] transition-colors">
              <span className="text-sm font-medium text-gray-700">ราคา:</span>
              <input type="number" placeholder="ต่ำสุด" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="w-24 text-sm outline-none bg-transparent text-center text-gray-700" min="0" />
              <span className="text-gray-400">-</span>
              <input type="number" placeholder="สูงสุด" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="w-24 text-sm outline-none bg-transparent text-center text-gray-700" min="0" />
            </div>
            {/* Color Filter */}
            <div className="relative">
              <button onClick={() => toggleDropdown('color')} className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedFilterAllowed ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' : selectedColors.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                สี {selectedColors.length > 0 && `(${selectedColors.length})`}
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'color' && isAdvancedFilterAllowed && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {colors.map((color) => (
                      <li key={color.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(color.name, selectedColors, setSelectedColors)}>
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
              <button onClick={() => toggleDropdown('material')} className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedFilterAllowed ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' : selectedMaterials.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                วัสดุ {selectedMaterials.length > 0 && `(${selectedMaterials.length})`}
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'material' && isAdvancedFilterAllowed && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {materials.map((mat) => (
                      <li key={mat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(mat.name, selectedMaterials, setSelectedMaterials)}>
                        <input type="checkbox" className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedMaterials.includes(mat.name)} readOnly />
                        <span className={selectedMaterials.includes(mat.name) ? 'font-bold text-[#148F96]' : ''}>{mat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Size Filter */}
            <div className="relative">
              <button onClick={() => toggleDropdown('size')} className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${!isAdvancedFilterAllowed ? 'opacity-50 cursor-not-allowed bg-gray-100 border-gray-200' : selectedSizes.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                ขนาด {selectedSizes.length > 0 && `(${selectedSizes.length})`}
                <ChevronDown size={16} />
              </button>
              {activeDropdown === 'size' && isAdvancedFilterAllowed && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {sizes.map((size) => (
                      <li key={size.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(size.name, selectedSizes, setSelectedSizes)}>
                        <input type="checkbox" className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selectedSizes.includes(size.name)} readOnly />
                        <span className={selectedSizes.includes(size.name) ? 'font-bold text-[#148F96]' : ''}>{size.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Clear Filters Button */}
            {hasAnyFilter && (
              <button onClick={clearAllFilters} className="px-4 py-2 text-red-500 text-sm font-medium flex items-center gap-2 hover:bg-red-50 rounded-full transition-colors ml-auto lg:ml-0">
                <FilterX size={16} /> ล้างตัวกรอง
              </button>
            )}
          </div>
          {/* แถบค้นหา และแสดงจำนวนผลลัพธ์ */}
          <div className="flex flex-col items-end w-full lg:w-80 flex-shrink-0 mt-2 lg:mt-0">
            <div className="relative w-full">
              <input type="text" placeholder="ค้นหาชื่อ รายละเอียด" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#04A5E3] transition text-sm bg-gray-50" />
              <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
            </div>
            {hasAnyFilter && (
              <div className="text-xs text-gray-500 mt-2 pr-2">
                ค้นพบ <span className="text-[#148F96] font-bold text-sm">{filteredProducts.length}</span> รายการ
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="relative bg-gray-900 h-[400px] mb-8 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80" alt="Banner" className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center text-white">
          <span className="text-[#148F96] bg-white px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">NEW COLLECTION</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">แต่งบ้านในฝัน <br/>ให้เป็นจริง</h1>
          <p className="text-gray-200 mb-8 max-w-lg">พบกับเฟอร์นิเจอร์ดีไซน์สวย คุณภาพเยี่ยม ที่คัดสรรมาเพื่อคุณโดยเฉพาะ</p>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <main>
          {hasAnyFilter ? (
             <ProductGrid title="ผลการค้นหาและตัวกรอง" items={filteredProducts} />
          ) : (
             <>
                <FlashSale products={products} />
                <ProductGrid title="✨ สินค้าแนะนำสำหรับคุณ" items={recommendedProducts} />
                <ProductGrid title="🔥 โปรโมชันพิเศษ" items={promoProducts} />
                <ProductGrid title="🛋️ สินค้าทั่วไป" items={generalProducts} />
             </>
          )}
        </main>
      </div>
    </div>
  );
};

export default Home;