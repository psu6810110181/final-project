import { useState, useEffect } from 'react';
import { Loader } from 'lucide-react'; 
import * as api from '../services/api'; 
import type { Product, Category, Room, Feature, Color, Material, Size, Promotion } from '../services/api';
import toast from 'react-hot-toast';

import TabBar from '../components/TabBar';
import ProductGrid, { type ProductWithPromo } from '../components/ProductGrid';
import HomeFilterBar from '../components/HomeFilterBar';
import heroBackground from '../assets/background.jpg';

const ITEMS_PER_PAGE_GRID = 20; // โหมด Filter โชว์หน้าละ 20

function calculateDiscountPrice(price: string | number, promo: Promotion) {
  const p = Number(price);
  if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
  return Math.max(0, p - promo.discountValue);
}

const HomepagePromotion = () => {
  const [products, setProducts] = useState<ProductWithPromo[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [colors, setColors] = useState<Color[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);

  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isVisible, setIsVisible] = useState(false);

  // Filters State
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
  
  // ✅ แยก State สำหรับจัดการ Limit และ Page ของ "แต่ละโปรโมชัน"
  const [promoLimits, setPromoLimits] = useState<Record<string, number>>({});
  const [promoPages, setPromoPages] = useState<Record<string, number>>({});

  // รีเซ็ตหน้าและลิมิตกลับไปค่าเริ่มต้นเมื่อเปลี่ยน Filter หรือคำค้นหา
  useEffect(() => { 
    setCurrentPage(1); 
    setPromoLimits({});
    setPromoPages({});
  }, [selectedPromotions, selectedCategories, selectedRooms, selectedFeatures, selectedColors, selectedMaterials, selectedSizes, minPrice, maxPrice, searchTerm]);

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
        const activePromos: Promotion[] = []; 

        const validPromos = Array.isArray(promoData) ? promoData : ((promoData as any)?.data || []);
        
        validPromos.forEach((promo: Promotion) => {
            const isCurrentlyActive = promo.isActive && now >= new Date(promo.startDate) && now <= new Date(promo.endDate);
            if (isCurrentlyActive) {
                activePromos.push(promo);
                promo.products?.forEach((prod: Product) => { if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo); });
            }
        });

        const validProducts = Array.isArray(productsData) ? productsData : ((productsData as any)?.data || []);
        const productsWithPromo: ProductWithPromo[] = validProducts
            .filter((p: any) => promoMap.has(p.id))
            .map((p: any) => ({ ...p, promo: promoMap.get(p.id) }));

        setProducts(productsWithPromo);
        setPromotions(activePromos);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
        setRooms(Array.isArray(roomsData) ? roomsData : []);
        setFeatures(Array.isArray(featuresData) ? featuresData : []);
        setColors(Array.isArray(colorsData) ? colorsData : []);
        setMaterials(Array.isArray(materialsData) ? materialsData : []);
        setSizes(Array.isArray(sizesData) ? sizesData : []);

        const token = localStorage.getItem('token');
        if (token) {
          try {
            const bookmarkData = await api.getBookmarks();
            const bookmarkIds = (Array.isArray(bookmarkData) ? bookmarkData : (bookmarkData?.data || [])).map((b: any) => b.productId || b.product?.id || b.id);
            setBookmarks(bookmarkIds);
          } catch (err) { setBookmarks([]); }
        }

      } catch (error) { toast.error('ไม่สามารถดึงข้อมูลโปรโมชันได้'); } finally { setLoading(false); }
    };
    fetchData();

    const handleBookmarkUpdate = () => {
      const token = localStorage.getItem('token');
      if (token) {
          api.getBookmarks().then(data => setBookmarks((Array.isArray(data) ? data : (data?.data || [])).map((b: any) => b.productId || b.product?.id || b.id))).catch(() => {});
      } else setBookmarks([]);
    };
    window.addEventListener('bookmarksUpdated', handleBookmarkUpdate);
    return () => window.removeEventListener('bookmarksUpdated', handleBookmarkUpdate);
  }, []);

  const filteredProducts = products.filter((product) => {
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

  const hasAnyFilter = selectedPromotions.length > 0 || selectedCategories.length > 0 || selectedRooms.length > 0 || selectedFeatures.length > 0 || minPrice !== '' || maxPrice !== '' || searchTerm !== '' || selectedColors.length > 0 || selectedMaterials.length > 0 || selectedSizes.length > 0;

  // สำหรับโหมดค้นหา (มี Filter)
  const totalPagesFiltered = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE_GRID);
  const paginatedFiltered = filteredProducts.slice((currentPage - 1) * ITEMS_PER_PAGE_GRID, currentPage * ITEMS_PER_PAGE_GRID);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F8FAFA]"><Loader size={48} className="animate-spin text-red-500" /></div>;

  return (
    <div className="bg-[#F8FAFA] min-h-screen pb-20 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-red-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-orange-500/10 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10"><TabBar /></div>

      {/* --- 🎬 HERO SECTION --- */}
      <div className="relative h-[60vh] min-h-[450px] flex flex-col justify-center items-center text-center overflow-hidden z-10">
        <div className="absolute inset-0 bg-red-950/70 z-10 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8FAFA] via-transparent to-transparent z-10" />
        <img src={heroBackground} alt="Banner" className="absolute inset-0 w-full h-full object-cover scale-105" />
        
        <div className={`relative z-20 container mx-auto px-4 transition-all duration-1000 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <span className="inline-block text-white bg-red-600/80 backdrop-blur-md px-5 py-2 rounded-full text-sm font-black tracking-widest mb-6 shadow-[0_0_20px_rgba(220,38,38,0.5)]">
            HOT PROMOTION
          </span>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 tracking-tight drop-shadow-2xl leading-tight">
            ดีลสุดคุ้ม <br className="hidden md:block"/>แห่งปี
          </h1>
          <p className="text-lg md:text-xl text-red-100 mb-8 max-w-2xl mx-auto font-light drop-shadow-md">
            แต่งบ้านในฝันด้วยงบสบายกระเป๋า กับโปรโมชันเฟอร์นิเจอร์ลดแรงที่คุณไม่ควรพลาด
          </p>
        </div>
      </div>

      {/* --- 🎬 FILTER BAR --- */}
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

      {/* --- MAIN CONTENT --- */}
      <div className="container mx-auto px-4 relative z-20">
        <main className="flex flex-col gap-4">
          {hasAnyFilter ? (
             <ProductGrid 
                title="ผลการค้นหาและตัวกรอง" 
                items={paginatedFiltered} 
                gridCols={5} // โหมด Filter โชว์ 5 แถว
                showPagination={true} currentPage={currentPage} totalPages={totalPagesFiltered} onPageChange={setCurrentPage}
                bookmarks={bookmarks} setBookmarks={setBookmarks}
                theme="promo" 
             />
          ) : (
             <>
               {promotions.map((promo) => {
                 const allPromoItems = products.filter(p => p.promo?.id === promo.id);
                 if (allPromoItems.length === 0) return null;

                 // ✅ ดึงลิมิตและหน้าที่กำลังดูอยู่ของ "โปรโมชันนี้" (ค่าเริ่มต้นคือ ลิมิต 10, หน้า 1)
                 const currentLimit = promoLimits[promo.id] || 10;
                 const currentPromoPage = promoPages[promo.id] || 1;

                 // ✅ โลจิกตัดแบ่งสินค้า
                 let displayItems: ProductWithPromo[] = [];
                 if (currentLimit < 20) {
                     // ถ้ายังไม่ถูกกด "แสดงสินค้าเพิ่มเติม" ให้โชว์แค่ 10 ชิ้น
                     displayItems = allPromoItems.slice(0, currentLimit);
                 } else {
                     // ถ้ากด "แสดงสินค้าเพิ่มเติม" แล้ว (ลิมิตเป็น 20) จะใช้ Pagination มาช่วย
                     const startIndex = (currentPromoPage - 1) * 20;
                     displayItems = allPromoItems.slice(startIndex, startIndex + 20);
                 }

                 const totalPagesForThisPromo = Math.ceil(allPromoItems.length / 20);

                 return (
                   <div key={promo.id} className="relative mb-6 flex flex-col">
                     <ProductGrid 
                        title={`🔥 ${promo.title}`} 
                        items={displayItems} 
                        gridCols={5} // แถวละ 5
                        horizontal={false} // ห้ามเลื่อนซ้ายขวา
                        bookmarks={bookmarks} 
                        setBookmarks={setBookmarks} 
                        theme="promo" 
                        // 💡 โชว์ Pagination เฉพาะตอนที่ลิมิตเป็น 20 และหน้าทั้งหมด > 1
                        showPagination={currentLimit >= 20 && totalPagesForThisPromo > 1}
                        currentPage={currentPromoPage}
                        totalPages={totalPagesForThisPromo}
                        onPageChange={(page) => setPromoPages(prev => ({ ...prev, [promo.id]: page }))}
                     />

                     {/* ✅ ปุ่ม "แสดงสินค้าเพิ่มเติม" แสดงใต้เฉพาะโปรที่สินค้า > 10 ชิ้น */}
                     {currentLimit < 20 && allPromoItems.length > 10 && (
                       <div className="flex justify-center -mt-8 mb-12 relative z-20">
                          <button 
                            onClick={() => setPromoLimits(prev => ({ ...prev, [promo.id]: 20 }))}
                            className="bg-white hover:bg-red-50 text-red-500 font-bold border border-red-200 px-10 py-3.5 rounded-full shadow-[0_8px_30px_rgb(239,68,68,0.15)] hover:shadow-[0_8px_30px_rgb(239,68,68,0.25)] hover:-translate-y-1 transition-all duration-300"
                          >
                            แสดงสินค้าเพิ่มเติม
                          </button>
                       </div>
                     )}
                   </div>
                 );
               })}

               {promotions.length === 0 && (
                   <div className="bg-white/50 backdrop-blur-md p-16 text-center rounded-3xl border border-white shadow-xl">
                      <p className="text-slate-500 font-medium text-lg">ไม่มีโปรโมชันในขณะนี้</p>
                   </div>
               )}
             </>
          )}
        </main>
      </div>
    </div>
  );
};

export default HomepagePromotion;