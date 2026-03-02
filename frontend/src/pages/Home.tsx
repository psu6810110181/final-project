// frontend/src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader, Search, ChevronDown, FilterX } from 'lucide-react';
import * as api from '../services/api'; 
import type { Product, Category, Room, Feature } from '../services/api';
import toast from 'react-hot-toast';
import { useCart } from '../contexts/CartContext';
import FlashSale from '../components/FlashSale';

const Home = () => {
  // --- STATE ข้อมูลตั้งต้น ---
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // --- STATE สำหรับการ Filter ---
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  
  // STATE สำหรับราคา (Price Range)
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // STATE สำหรับการค้นหา (Search)
  const [searchTerm, setSearchTerm] = useState<string>('');

  // STATE สำหรับควบคุม Dropdown Menu
  const [activeDropdown, setActiveDropdown] = useState<'category' | 'room' | 'feature' | null>(null);

  // --- HOOKS สำหรับระบบตะกร้าและ Routing ---
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // --- FETCH DATA ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productsData, categoriesData, roomsData, featuresData] = await Promise.all([
          api.getAllProducts(),
          api.getAllCategories(),
          api.getAllRooms(),
          api.getAllFeatures(),
        ]);
        setProducts(productsData);
        setCategories(categoriesData);
        setRooms(roomsData);
        setFeatures(featuresData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        toast.error('ไม่สามารถดึงข้อมูลสินค้าได้ กรุณาลองใหม่อีกครั้ง');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTER & SEARCH LOGIC ---
  const filteredProducts = products.filter((product) => {
    const matchCategory =
      selectedCategories.length === 0 || 
      (product.category && selectedCategories.includes(product.category));

    const matchRoom =
      selectedRooms.length === 0 || 
      (product.room && selectedRooms.includes(product.room));

    const matchFeature =
      selectedFeatures.length === 0 ||
      (product.features && product.features.some((f) => selectedFeatures.includes(f)));

    // กรองคำค้นหา (ค้นจากชื่อ, รายละเอียด, หมวดหมู่, ห้อง, และคุณสมบัติ)
    const searchLower = searchTerm.toLowerCase();
    const matchSearch = 
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchLower) ||
      (product.description && product.description.toLowerCase().includes(searchLower)) ||
      (product.category && product.category.toLowerCase().includes(searchLower)) ||
      (product.room && product.room.toLowerCase().includes(searchLower)) ||
      (product.features && product.features.some((f) => f.toLowerCase().includes(searchLower)));

    // กรองช่วงราคา
    const productPrice = Number(product.price);
    const matchMinPrice = minPrice === '' || productPrice >= Number(minPrice);
    const matchMaxPrice = maxPrice === '' || productPrice <= Number(maxPrice);

    return matchCategory && matchRoom && matchFeature && matchSearch && matchMinPrice && matchMaxPrice;
  });

  // --- TOGGLE HANDLERS ---
  const handleToggle = (value: string, selectedList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedList.includes(value)) {
      setList(selectedList.filter((item) => item !== value));
    } else {
      setList([...selectedList, value]);
    }
  };

  const toggleDropdown = (dropdownName: 'category' | 'room' | 'feature') => {
    setActiveDropdown(activeDropdown === dropdownName ? null : dropdownName);
  };

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedRooms([]);
    setSelectedFeatures([]);
    setMinPrice('');
    setMaxPrice('');
    setSearchTerm(''); // ล้างคำค้นหาด้วย
  };

  const hasAnyFilter = selectedCategories.length > 0 || selectedRooms.length > 0 || selectedFeatures.length > 0 || minPrice !== '' || maxPrice !== '' || searchTerm !== '';

  // --- HELPER FUNCTIONS ---
  const getImageUrl = (product: Product) => {
    let images: string[] = [];
    try {
        const rawImages = product.image;
        if (Array.isArray(rawImages)) {
            images = rawImages;
        } else if (typeof rawImages === 'string') {
             if (rawImages.startsWith('[')) {
                 images = JSON.parse(rawImages);
             } else {
                 images = [rawImages];
             }
        }
        
        if (images.length > 0) {
            const img = images[0];
            if (img.startsWith('http')) return img;
            
            // ✅ แก้ไขตรงนี้: ดึงค่า baseUrl จาก .env
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            return `${baseUrl}/uploads/products/${img}`;
        }
    } catch (e) {
        console.error(e);
    }
    return "https://placehold.co/400x300?text=No+Image";
  };

  // --- HANDLE ADD TO CART ---
  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault(); // ป้องกันไม่ให้คลิกปุ่มแล้วเด้งไปหน้า Detail ทันที
    
    // ตรวจสอบว่ามี Token ล็อกอินหรือไม่ (เช็คแบบง่ายๆ)
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อนเพิ่มสินค้าลงตะกร้า');
      navigate('/login'); // เด้งไปหน้าล็อกอิน
      return;
    }

    try {
      // เรียกใช้ฟังก์ชัน addToCart โดยส่ง ID และจำนวนเริ่มต้นคือ 1
      await addToCart(product.id, 1); 
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  };

  // --- RENDER LOADING ---
  if (loading) {
     return (
        <div className="min-h-screen flex flex-col items-center justify-center text-[#148F96]">
            <Loader size={48} className="animate-spin mb-4" />
            <p>กำลังโหลดข้อมูล...</p>
        </div>
     );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      
      {/* --- FILTER TAB BAR --- */}
      <div className="bg-white border-b shadow-sm relative z-30">
        <div className="container mx-auto px-4 py-3 flex flex-col lg:flex-row gap-4 justify-between items-center">
          
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Category Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('category')}
                className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedCategories.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                หมวดหมู่สินค้า {selectedCategories.length > 0 && `(${selectedCategories.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'category' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'category' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {categories.map((cat) => (
                      <li key={cat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer"
                          checked={selectedCategories.includes(cat.name)}
                          onChange={() => handleToggle(cat.name, selectedCategories, setSelectedCategories)}
                        />
                        <span onClick={() => handleToggle(cat.name, selectedCategories, setSelectedCategories)}>{cat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Room Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('room')}
                className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedRooms.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                ห้อง {selectedRooms.length > 0 && `(${selectedRooms.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'room' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'room' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {rooms.map((room) => (
                      <li key={room.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer"
                          checked={selectedRooms.includes(room.name)}
                          onChange={() => handleToggle(room.name, selectedRooms, setSelectedRooms)}
                        />
                        <span onClick={() => handleToggle(room.name, selectedRooms, setSelectedRooms)}>{room.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Feature Dropdown */}
            <div className="relative">
              <button 
                onClick={() => toggleDropdown('feature')}
                className={`px-4 py-2 border rounded-full text-sm font-medium flex items-center gap-2 transition-colors ${selectedFeatures.length > 0 ? 'border-[#148F96] text-[#148F96] bg-teal-50' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                คุณสมบัติเพิ่มเติม {selectedFeatures.length > 0 && `(${selectedFeatures.length})`}
                <ChevronDown size={16} className={`transition-transform duration-200 ${activeDropdown === 'feature' ? 'rotate-180' : ''}`} />
              </button>
              {activeDropdown === 'feature' && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-white border border-gray-100 rounded-xl shadow-lg p-4 z-50">
                  <ul className="max-h-60 overflow-y-auto space-y-3">
                    {features.map((feat) => (
                      <li key={feat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer"
                          checked={selectedFeatures.includes(feat.name)}
                          onChange={() => handleToggle(feat.name, selectedFeatures, setSelectedFeatures)}
                        />
                        <span onClick={() => handleToggle(feat.name, selectedFeatures, setSelectedFeatures)}>{feat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Price Filter (Direct Inputs) */}
            <div className="flex items-center gap-2 border border-gray-300 rounded-full px-8 py-1.5 bg-white focus-within:border-[#148F96] transition-colors">
              <span className="text-sm font-medium text-gray-700">ราคา:</span>
              <input 
                type="number" 
                placeholder="ต่ำสุด" 
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24 text-sm outline-none bg-transparent text-center text-gray-700"
                min="0"
              />
              <span className="text-gray-400">-</span>
              <input 
                type="number" 
                placeholder="สูงสุด" 
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24 text-sm outline-none bg-transparent text-center text-gray-700"
                min="0"
              />
            </div>

            {/* Clear Filters Button */}
            {hasAnyFilter && (
              <button 
                onClick={clearAllFilters}
                className="px-4 py-2 text-red-500 text-sm font-medium flex items-center gap-2 hover:bg-red-50 rounded-full transition-colors ml-auto lg:ml-0"
              >
                <FilterX size={16} /> ล้างตัวกรอง
              </button>
            )}
          </div>

          {/* แถบค้นหา (Search Bar) */}
          <div className="relative w-full lg:w-80 flex-shrink-0 mt-2 lg:mt-0">
            <input 
              type="text" 
              placeholder="ค้นหาชื่อ รายละเอียด" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#04A5E3] transition text-sm bg-gray-50"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
      </div>

      {/* --- HERO BANNER --- */}
      <div className="relative bg-gray-900 h-[400px] mb-8 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center text-white">
          <span className="text-[#148F96] bg-white px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">NEW COLLECTION</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">แต่งบ้านในฝัน <br/>ให้เป็นจริง</h1>
          <p className="text-gray-200 mb-8 max-w-lg">พบกับเฟอร์นิเจอร์ดีไซน์สวย คุณภาพเยี่ยม ที่คัดสรรมาเพื่อคุณโดยเฉพาะ</p>
          <button className="bg-[#D65A31] hover:bg-[#b54622] text-white px-8 py-3 rounded-full font-bold w-fit transition-transform hover:scale-105">
            ช้อปเลย
          </button>
        </div>
      </div>

      {/* --- FLASH SALE SECTION --- */}
      <FlashSale products={products} />

      {/* --- MAIN CONTENT (Product Grid) --- */}
      <div className="container mx-auto px-4">
        <main>
          
          <div className="mb-6 text-gray-500 text-sm">
            ค้นพบ <span className="text-gray-800 font-bold text-lg">{filteredProducts.length}</span> รายการ
          </div>

          {filteredProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
                ไม่พบสินค้าที่ตรงกับเงื่อนไข
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                {filteredProducts.map((product) => (
                <Link to={`/product/${product.id}`} key={product.id} className="group">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
                    
                    {/* Image */}
                    <div className="h-48 overflow-hidden bg-gray-100">
                        <img 
                            src={getImageUrl(product)} 
                            alt={product.name} 
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                    </div>

                    {/* Content */}
                    <div className="p-4 flex flex-col flex-1">
                        <div className="text-xs text-[#148F96] font-bold mb-1">
                           {product.category || 'ไม่มีหมวดหมู่'}
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-[#D65A31] transition-colors">{product.name}</h3>
                        <p className="text-gray-500 text-xs mb-3 line-clamp-1">{product.description || "ไม่มีรายละเอียด"}</p>
                        
                        <div className="mt-auto flex items-center justify-between">
                            <div className="text-xl font-bold text-[#D65A31]">฿{Number(product.price).toLocaleString()}</div>
                            {/* ✅ ปุ่มหยิบใส่ตะกร้า ที่ผูกฟังก์ชัน handleAddToCart แล้ว */}
                            <button 
                                onClick={(e) => handleAddToCart(e, product)}
                                className="bg-gray-100 hover:bg-[#148F96] hover:text-white text-gray-600 p-2 rounded-full transition-colors"
                                title="เพิ่มลงตะกร้า"
                            >
                                <ShoppingCart size={18} />
                            </button>
                        </div>
                    </div>
                    </div>
                </Link>
                ))}
            </div>
          )}

        </main>
      </div>
    </div>
  );
};

export default Home;