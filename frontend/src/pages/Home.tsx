import { useState, useEffect } from 'react';
import { Loader, Sparkles, Armchair } from 'lucide-react';
import * as api from '../services/api'; 
import type { Product, Category, Room, Feature, Color, Material, Size, Promotion } from '../services/api';
import toast from 'react-hot-toast';

import FlashSale from '../components/FlashSale';
import SeasonalPromotion from '../components/SeasonalPromotion';
import TabBar from '../components/TabBar';
import ProductGrid, {type ProductWithPromo } from '../components/ProductGrid';
import HomeFilterBar from '../components/HomeFilterBar';
import { getSeasonFromPromoTitle } from '../constants/seasonalThemes';
import heroBackground from '../assets/background.jpg';

const ITEMS_PER_PAGE_GRID = 20;

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
  const [seasonalProducts, setSeasonalProducts] = useState<ProductWithPromo[]>([]);
  const [allGeneralProducts, setAllGeneralProducts] = useState<ProductWithPromo[]>([]); 

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);

  // Filters State
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

  useEffect(() => { setCurrentPage(1); }, [selectedCategories, selectedRooms, selectedFeatures, selectedColors, selectedMaterials, selectedSizes, minPrice, maxPrice, searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim()) {
        const searches = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const currentTerm = searchTerm.trim();
        if (!searches.includes(currentTerm)) {
          searches.unshift(currentTerm);
          if (searches.length > 5) searches.pop(); 
          localStorage.setItem('recentSearches', JSON.stringify(searches));
        }
      }
    }, 1000); 
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setIsVisible(true);
    const fetchData = async () => {
      try {
        setLoading(true);
        const [ productsData, categoriesData, roomsData, featuresData, colorsData, materialsData, sizesData, promoData ] = await Promise.all([
          api.getAllProducts().catch(() => []), api.getAllCategories().catch(() => []), api.getAllRooms().catch(() => []),
          api.getAllFeatures().catch(() => []), api.getAllColors().catch(() => []), api.getAllMaterials().catch(() => []),
          api.getAllSizes().catch(() => []), api.getAllPromotions().catch(() => []) 
        ]);
        
        let promoMap = new Map<string, Promotion>();
        const now = new Date();

        if (Array.isArray(promoData)) {
            promoData.forEach((promo: Promotion) => {
                const isCurrentlyActive = promo.isActive && now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
                if (isCurrentlyActive) promo.products?.forEach((prod: Product) => { if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo); });
            });
        }

        const validProducts = Array.isArray(productsData) ? productsData : ((productsData as any)?.data || []);
        const productsWithPromo: ProductWithPromo[] = validProducts.map((p: Product) => ({ ...p, promo: promoMap.get(p.id) }));

        setProducts(productsWithPromo);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
        setSizes(Array.isArray(sizesData) ? sizesData : []);

        // ✅ แก้ไข: เช็คโทเคนทั้งจาก localStorage และ sessionStorage สำหรับประวัติการซื้อ
        let purchasedIds: string[] = [];
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (token) {
          try {
            const myOrdersData = await api.getMyOrders();
            if (Array.isArray(myOrdersData)) purchasedIds = myOrdersData.flatMap(order => order.items.map((item: any) => item.product?.id || item.productId));
          } catch (e) {}
        }

        const viewedIds: string[] = JSON.parse(localStorage.getItem('viewedProducts') || '[]');
        const recentSearches: string[] = JSON.parse(localStorage.getItem('recentSearches') || '[]');
        const hasHistory = purchasedIds.length > 0 || viewedIds.length > 0 || recentSearches.length > 0;

        if (hasHistory) {
          const personalizedProducts = productsWithPromo.filter(p => purchasedIds.includes(p.id) || viewedIds.includes(p.id) || recentSearches.some(search => p.name.toLowerCase().includes(search.toLowerCase()) || (p.category && p.category.toLowerCase().includes(search.toLowerCase())) || (p.description && p.description.toLowerCase().includes(search.toLowerCase()))));
          if (personalizedProducts.length > 0) setRecommendedProducts([...personalizedProducts].sort(() => 0.5 - Math.random()).slice(0, 10));
          else setRecommendedProducts([...productsWithPromo].sort((a, b) => Number(a.stock) - Number(b.stock)).slice(0, 10));
        } else {
          setRecommendedProducts([...productsWithPromo].sort((a, b) => Number(a.stock) - Number(b.stock)).slice(0, 10));
        }

        setSeasonalProducts(productsWithPromo.filter(p => p.promo && !p.promo.isFlashSale).slice(0, 10)); 
        setAllGeneralProducts(productsWithPromo.filter(p => !p.promo));

        // ✅ แก้ไข: เช็คโทเคนทั้งจาก localStorage และ sessionStorage สำหรับดึง Bookmark ตอนเริ่มโหลด
        if (token) {
          try {
            const bookmarkData = await api.getBookmarks();
            const bookmarkIds = (Array.isArray(bookmarkData) ? bookmarkData : (bookmarkData?.data || [])).map((b: any) => b.productId || b.product?.id || b.id);
            setBookmarks(bookmarkIds);
          } catch (err) { setBookmarks([]); }
        }

      } catch (error) { toast.error('ไม่สามารถดึงข้อมูลสินค้าได้'); } finally { setLoading(false); }
    };
    fetchData();

    const handleBookmarkUpdate = () => {
      // ✅ แก้ไข: เช็คโทเคนทั้งจาก localStorage และ sessionStorage ตอนดึง Real-time
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      if (token) {
          api.getBookmarks().then(data => setBookmarks((Array.isArray(data) ? data : (data?.data || [])).map((b: any) => b.productId || b.product?.id || b.id))).catch(() => {});
      } else setBookmarks([]);
    };
    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);
    return () => window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
  }, []);

  const filteredProducts = products.filter((product) => {
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

    return matchCategory && matchRoom && matchFeature && matchColor && matchMaterial && matchSize && matchSearch && matchMinPrice && matchMaxPrice; 
  });

  const hasAnyFilter = selectedCategories.length > 0 || selectedRooms.length > 0 || selectedFeatures.length > 0 || minPrice !== '' || maxPrice !== '' || searchTerm !== '' || selectedColors.length > 0 || selectedMaterials.length > 0 || selectedSizes.length > 0;

  const totalPagesFiltered = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE_GRID);
  const paginatedFiltered = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE_GRID, currentPage * ITEMS_PER_PAGE_GRID);

  const totalPagesDefault = allGeneralProducts.length > 10 ? 1 + Math.ceil((allGeneralProducts.length - 10) / ITEMS_PER_PAGE_GRID) : 1;
  let paginatedDefaultGeneral: ProductWithPromo[] = [];
  if (currentPage === 1) {
      paginatedDefaultGeneral = allGeneralProducts.slice(0, 10);
  } else {
      const startIndex = 10 + (currentPage - 2) * ITEMS_PER_PAGE_GRID;
      paginatedDefaultGeneral = allGeneralProducts.slice(startIndex, startIndex + ITEMS_PER_PAGE_GRID);
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F9F9F9]"><Loader size={48} className="animate-spin text-[#148F96]" /></div>;

  return (
    <div className="bg-[#F9F9F9] min-h-screen pb-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#148F96]/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-orange-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10"><TabBar /></div>

      <div className="relative h-[60vh] min-h-[450px] flex flex-col justify-center items-center text-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-slate-900/60 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F9F9F9] via-transparent to-transparent z-10" />
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

      <HomeFilterBar 
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

      <div className="container mx-auto px-4 relative z-20">
        <main>
          {hasAnyFilter ? (
             <ProductGrid 
                title="ผลการค้นหา" 
                items={paginatedFiltered} 
                gridCols={5}
                showPagination={true} currentPage={currentPage} totalPages={totalPagesFiltered} onPageChange={setCurrentPage}
                bookmarks={bookmarks} setBookmarks={setBookmarks}
             />
          ) : (
             <>
                {currentPage === 1 && (
                  <>
                    <SeasonalPromotion products={seasonalProducts} title={seasonalProducts[0]?.promo?.title} season={seasonalProducts[0]?.promo?.title ? getSeasonFromPromoTitle(seasonalProducts[0].promo.title) : undefined} />
                    <FlashSale products={products} />
                    <ProductGrid 
                      title={<span className="flex items-center gap-2"><Sparkles className="text-amber-500" size={24} /> แนะนำสำหรับคุณ</span>} 
                      items={recommendedProducts} 
                      bookmarks={bookmarks} 
                      setBookmarks={setBookmarks} 
                      horizontal={true} 
                    />
                  </>
                )}
                
                <ProductGrid 
                  title={<span className="flex items-center gap-2"><Armchair className="text-slate-700" size={24} /> {currentPage === 1 ? "สินค้าทั่วไป" : `สินค้าทั่วไป (หน้า ${currentPage})`}</span>} 
                  items={paginatedDefaultGeneral} 
                  bookmarks={bookmarks} 
                  setBookmarks={setBookmarks} 
                  horizontal={currentPage === 1}
                  gridCols={currentPage === 1 ? 4 : 5}
                  showPagination={true} 
                  currentPage={currentPage} 
                  totalPages={totalPagesDefault} 
                  onPageChange={setCurrentPage} 
                />
             </>
          )}
        </main>
      </div>
    </div>
  );
};
export default Home;