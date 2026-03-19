import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader, Star } from 'lucide-react';
import * as api from '../services/api'; 
import type { Promotion, Category, Room, Feature, Color, Material, Size } from '../services/api';
import toast from 'react-hot-toast';
import TabBar from '../components/TabBar'; 
import ProductGrid, { type ProductWithPromo } from '../components/ProductGrid';
import HomeFilterBar from '../components/HomeFilterBar'; 

const ITEMS_PER_PAGE = 40; 

const BookmarkPage = () => {
  const [bookmarkedProducts, setBookmarkedProducts] = useState<ProductWithPromo[]>([]);
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const [promotions, setPromotions] = useState<Promotion[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [selectedPromotions, setSelectedPromotions] = useState<string[]>([]); 
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState<number>(1);

  useEffect(() => { setCurrentPage(1); }, [selectedPromotions, selectedCategories, selectedRooms, selectedFeatures, selectedColors, selectedMaterials, selectedSizes, minPrice, maxPrice, searchTerm]);

  useEffect(() => {
    setIsVisible(true);
    const fetchBookmarksAndData = async () => {
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

        const [
            productsData, promoData, categoriesData, roomsData, 
            featuresData, colorsData, materialsData, sizesData 
        ] = await Promise.all([
          api.getAllProducts().catch(() => []),
          api.getAllPromotions().catch(() => []),
          api.getAllCategories().catch(() => []),
          api.getAllRooms().catch(() => []),
          api.getAllFeatures().catch(() => []),
          api.getAllColors().catch(() => []),
          api.getAllMaterials().catch(() => []),
          api.getAllSizes().catch(() => [])
        ]);

        let promoMap = new Map<string, Promotion>();
        const now = new Date();
        const activePromos: Promotion[] = [];
        
        const validPromos = Array.isArray(promoData) ? promoData : ((promoData as any)?.data || []);
        
        validPromos.forEach((promo: Promotion) => {
            const startDate = new Date(promo.startDate);
            const endDate = new Date(promo.endDate);
            if (promo.isActive && now >= startDate && now <= endDate) {
                activePromos.push(promo);
                promo.products?.forEach((prod: any) => {
                    if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo);
                });
            }
        });

        const validProducts = Array.isArray(productsData) ? productsData : ((productsData as any)?.data || []);
        
        const productsWithPromo = validProducts
            .filter((p: any) => bookmarkIds.includes(p.id))
            .map((p: any) => ({ ...p, promo: promoMap.get(p.id) }))
            .sort((a: ProductWithPromo, b: ProductWithPromo) => {
                const rankA = a.promo ? (a.promo.isFlashSale ? 1 : 2) : 3;
                const rankB = b.promo ? (b.promo.isFlashSale ? 1 : 2) : 3;
                return rankA - rankB; 
            });

        setBookmarkedProducts(productsWithPromo);
        setPromotions(activePromos);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
        setSizes(Array.isArray(sizesData) ? sizesData : []);

      } catch (error) {
        toast.error('ไม่สามารถดึงข้อมูลสินค้าที่สนใจได้');
      } finally {
        setLoading(false);
      }
    };
    fetchBookmarksAndData();
  }, []);

  const calculateDiscountPrice = (price: string | number, promo: Promotion) => {
    const p = Number(price);
    if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
    return Math.max(0, p - promo.discountValue);
  };

  const filteredProducts = bookmarkedProducts.filter((product) => {
    const matchPromotion = selectedPromotions.length === 0 || (product.promo && selectedPromotions.includes(product.promo.title));
    const matchCategory = selectedCategories.length === 0 || (product.category && selectedCategories.includes(product.category));
    const matchRoom = selectedRooms.length === 0 || (product.room && selectedRooms.includes(product.room));
    const matchFeature = selectedFeatures.length === 0 || (product.features && product.features.some((f) => selectedFeatures.includes(f)));
    
    const variants = (product as any).variants || [];
    const matchColor = selectedColors.length === 0 || variants.some((v: any) => selectedColors.includes(v.color?.name || v.color)) || ((product as any).colors || []).some((c: any) => selectedColors.includes(c?.name || c)); 
    const matchMaterial = selectedMaterials.length === 0 || variants.some((v: any) => selectedMaterials.includes(v.material?.name || v.material)) || ((product as any).materials || []).some((m: any) => selectedMaterials.includes(m?.name || m));
    const matchSize = selectedSizes.length === 0 || variants.some((v: any) => selectedSizes.includes(v.size?.name || v.size)) || ((product as any).sizes || []).some((s: any) => selectedSizes.includes(s?.name || s));

    const searchLower = searchTerm.toLowerCase();
    const matchSearch = searchTerm === '' || product.name.toLowerCase().includes(searchLower) || (product.category && product.category.toLowerCase().includes(searchLower)) || (product.description && product.description.toLowerCase().includes(searchLower));
    
    const productPrice = product.promo ? calculateDiscountPrice(product.price, product.promo) : Number(product.price);
    const matchMinPrice = minPrice === '' || productPrice >= Number(minPrice);
    const matchMaxPrice = maxPrice === '' || productPrice <= Number(maxPrice);

    return matchPromotion && matchCategory && matchRoom && matchFeature && matchColor && matchMaterial && matchSize && matchSearch && matchMinPrice && matchMaxPrice; 
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

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
      
      <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-yellow-400/10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="absolute bottom-1/4 left-10 w-[500px] h-[500px] bg-[#148F96]/10 blur-[150px] rounded-full pointer-events-none z-0" />

      <div className="relative z-20">
        <TabBar />
      </div>

      <div className="bg-slate-900 py-16 mb-8 relative overflow-hidden z-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-3 drop-shadow-md">คอลเลกชันส่วนตัว</h1>
            <p className="text-slate-300 text-lg font-light">สินค้าที่คุณบันทึกไว้สำหรับไอเดียแต่งบ้าน ({bookmarks.length} รายการ)</p>
        </div>
      </div>

      {bookmarkedProducts.length > 0 && (
        <HomeFilterBar 
          promotions={promotions}
          selectedPromotions={selectedPromotions}
          setSelectedPromotions={setSelectedPromotions}
          categories={categories} rooms={rooms} features={features} colors={colors} materials={materials} sizes={sizes}
          selectedCategories={selectedCategories} setSelectedCategories={setSelectedCategories}
          selectedRooms={selectedRooms} setSelectedRooms={setSelectedRooms}
          selectedFeatures={selectedFeatures} setSelectedFeatures={setSelectedFeatures}
          selectedColors={selectedColors} setSelectedColors={setSelectedColors}
          selectedMaterials={selectedMaterials} setSelectedMaterials={setSelectedMaterials}
          selectedSizes={selectedSizes} setSelectedSizes={setSelectedSizes}
          minPrice={minPrice} setMinPrice={setMinPrice} maxPrice={maxPrice} setMaxPrice={setMaxPrice}
          searchTerm={searchTerm} setSearchTerm={setSearchTerm}
          activeDropdown={activeDropdown} setActiveDropdown={setActiveDropdown}
          filteredCount={filteredProducts.length}
        />
      )}

      <div className={`container mx-auto px-4 relative z-20 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {bookmarkedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl mt-8">
                <div className="p-6 bg-slate-50 rounded-full mb-6">
                    <Star size={64} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-800 mb-2">ยังไม่มีไอเทมโปรด</h3>
                <p className="text-slate-500 mb-8 font-medium">ค้นพบและบันทึกเฟอร์นิเจอร์ที่คุณหลงรักได้เลย</p>
                <Link to="/" className="px-8 py-3.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-[#148F96] hover:shadow-lg hover:shadow-[#148F96]/30 transition-all active:scale-95">
                    ไปช้อปกันเลย
                </Link>
            </div>
        ) : filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-xl mt-8">
                <h3 className="text-xl font-bold text-slate-700">ไม่พบสินค้าที่ตรงกับตัวกรอง</h3>
                <p className="text-slate-500 mt-2">ลองล้างตัวกรองเพื่อดูสินค้าทั้งหมดของคุณ</p>
            </div>
        ) : (
            <div className="mt-8">
               <ProductGrid 
                  items={paginatedProducts} 
                  gridCols={5} // ✅ เปลี่ยนให้โชว์เป็นแถวละ 5 การ์ด
                  showPagination={true} 
                  currentPage={currentPage} 
                  totalPages={totalPages} 
                  onPageChange={setCurrentPage}
                  bookmarks={bookmarks} 
                  setBookmarks={setBookmarks}
               />
            </div>
        )}
      </div>
    </div>
  );
};

export default BookmarkPage;