// import { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import { getAllProducts,type Product } from '../services/api';

// const Home = () => {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);

//   useEffect(() => {
//     fetchProducts();
//   }, []);

//   const fetchProducts = async () => {
//     try {
//       const data = await getAllProducts();
//       setProducts(data);
//     } catch (error) {
//       console.error('Failed to fetch products:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return <div className="text-center mt-10">Loading products...</div>;
//   }

//   return (
//     <div>
//       <h1 className="text-3xl font-bold mb-6 text-gray-800">สินค้าแนะนำ</h1>
      
//       {products.length === 0 ? (
//         <p className="text-gray-500">ยังไม่มีสินค้าในขณะนี้</p>
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//           {products.map((product) => (
//             <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
//               {/* Product Image */}
//               <div className="h-48 bg-gray-200 w-full object-cover">
//                  {/* ถ้ามีรูปให้แสดงรูป ถ้าไม่มีให้แสดง Placeholder */}
//                 {product.image ? (
//                   <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
//                 ) : (
//                   <div className="w-full h-full flex items-center justify-center text-gray-400">
//                     No Image
//                   </div>
//                 )}
//               </div>

//               {/* Product Info */}
//               <div className="p-4">
//                 <h2 className="text-lg font-semibold text-gray-800 truncate">{product.name}</h2>
//                 <p className="text-sm text-gray-500 mb-2 truncate">{product.description || 'ไม่มีรายละเอียด'}</p>
//                 <div className="flex justify-between items-center mt-4">
//                   <span className="text-xl font-bold text-blue-600">฿{product.price.toLocaleString()}</span>
//                   <Link 
//                     to={`/product/${product.id}`}
//                     className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm transition-colors"
//                   >
//                     ดูรายละเอียด
//                   </Link>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Home;
/*
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, ShoppingCart, Heart } from 'lucide-react';

const Home = () => {
  // --- MOCK DATA: รายการสินค้าหน้าแรก ---
  const products = [
    {
      id: 1,
      name: "โซฟาหนังแท้",
      description: "ดีไซน์โมเดิร์น นั่งสบาย",
      price: 80000,
      rating: 4.8,
      reviews: 124,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80",
      category: "ห้องนั่งเล่น",
      isSale: true
    },
    {
      id: 2,
      name: "ชั้นวางของไม้โอ๊ค",
      description: "แข็งแรง ทนทาน สไตล์มินิมอล",
      price: 36500,
      rating: 4.5,
      reviews: 45,
      image: "https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80",
      category: "ห้องนั่งเล่น",
      isSale: false
    },
    {
      id: 3,
      name: "เก้าอี้อาร์มแชร์",
      description: "ผ้าลินินเกรดพรีเมี่ยม",
      price: 15900,
      rating: 4.2,
      reviews: 28,
      image: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
      category: "ห้องนอน",
      isSale: true
    },
    {
      id: 4,
      name: "เตียงนอน King Size",
      description: "ไม้สักแท้ พร้อมหัวเตียงบุหนัง",
      price: 55000,
      rating: 4.9,
      reviews: 210,
      image: "https://images.unsplash.com/photo-1505693416388-50398096560e?auto=format&fit=crop&w=800&q=80",
      category: "ห้องนอน",
      isSale: false
    },
    {
      id: 5,
      name: "โคมไฟตั้งพื้น",
      description: "แสงนวลตา ปรับระดับได้",
      price: 3500,
      rating: 4.0,
      reviews: 12,
      image: "https://images.unsplash.com/photo-1507473888900-52e1adad54cd?auto=format&fit=crop&w=800&q=80",
      category: "ของตกแต่ง",
      isSale: false
    },
    {
      id: 6,
      name: "โต๊ะทานข้าว",
      description: "ท็อปหินอ่อน ขาเหล็กสีทอง",
      price: 24000,
      rating: 4.7,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?auto=format&fit=crop&w=800&q=80",
      category: "ห้องครัว",
      isSale: true
    }
  ];

  const categories = ["ห้องนั่งเล่น", "ห้องนอน", "ห้องครัว", "ห้องทำงาน", "ของตกแต่ง"];
  const colors = ["#000000", "#FFFFFF", "#808080", "#148F96", "#D65A31", "#1A3C34"];
*/
 // return (
 //   <div className="bg-gray-50 min-h-screen pb-10">
      
      {/* --- HERO BANNER (ส่วนโปรโมชั่นด้านบน) --- */}
/*      <div className="relative bg-gray-900 h-[400px] mb-8 overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1600&q=80" 
          alt="Banner" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 container mx-auto px-4 flex flex-col justify-center text-white">
          <span className="text-[#148F96] bg-white px-3 py-1 rounded-full text-xs font-bold w-fit mb-4">NEW COLLECTION</span>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">แต่งบ้านในฝัน <br/>ให้เป็นจริง</h1>
          <p className="text-gray-200 mb-8 max-w-lg">พบกับเฟอร์นิเจอร์ดีไซน์สวย คุณภาพเยี่ยม ที่คัดสรรมาเพื่อคุณโดยเฉพาะ พร้อมโปรโมชั่นพิเศษลดสูงสุด 50%</p>
          <button className="bg-[#D65A31] hover:bg-[#b54622] text-white px-8 py-3 rounded-full font-bold w-fit transition-transform hover:scale-105">
            ช้อปเลย
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
 */       
//        {/* --- SIDEBAR (ตัวกรองด้านซ้าย) --- */}
//       <aside className="w-full lg:w-64 flex-shrink-0 space-y-8">
          
 //         {/* Categories */}
  /*        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">หมวดหมู่สินค้า</h3>
            <ul className="space-y-3">
              {categories.map((cat, i) => (
                <li key={i} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer transition-colors">
                  <input type="checkbox" className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96]" />
                  <span>{cat}</span>
                </li>
              ))}
            </ul>
          </div>*/

 //         {/* Price Range */}
  /*        <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">ช่วงราคา</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <input type="number" placeholder="Min" className="w-full p-2 border rounded-lg outline-none focus:border-[#148F96]" />
              <span>-</span>
              <input type="number" placeholder="Max" className="w-full p-2 border rounded-lg outline-none focus:border-[#148F96]" />
            </div>
            <button className="w-full bg-[#148F96] text-white py-2 rounded-lg text-sm hover:bg-[#0e6f75]">กรองราคา</button>
          </div>*/

  //        {/* Colors */}
 /*         <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">โทนสี</h3>
            <div className="flex flex-wrap gap-3">
              {colors.map((color, i) => (
                <button 
                  key={i}
                  className="w-8 h-8 rounded-full border border-gray-200 shadow-sm hover:scale-110 transition-transform focus:ring-2 ring-offset-2 ring-[#148F96]"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </aside>
*/
 //       {/* --- MAIN CONTENT (รายการสินค้า) --- */}
  //      <main className="flex-1">
          
   //       {/* Header Filter Bar */}
   /*       <div className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
             <div className="text-gray-500 text-sm">ค้นพบ <span className="text-gray-800 font-bold">{products.length}</span> รายการ</div>
             <div className="flex items-center gap-2">
               <span className="text-gray-500 text-sm hidden sm:inline">เรียงตาม:</span>
               <select className="border-none text-gray-800 font-bold text-sm outline-none cursor-pointer bg-transparent">
                 <option>ยอดนิยม</option>
                 <option>มาใหม่ล่าสุด</option>
                 <option>ราคา ต่ำ-สูง</option>
                 <option>ราคา สูง-ต่ำ</option>
               </select>
             </div>
          </div>*/

     //     {/* Product Grid */}
          /*<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              // ลิงก์ไปหน้า Product Detail โดยส่ง ID ไปด้วย
              <Link to={`/product/${product.id}`} key={product.id} className="group">
                <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
                  */
          //        {/* Sale Badge */}
               /*   {product.isSale && (
                    <div className="absolute top-3 left-3 bg-[#D65A31] text-white text-[10px] font-bold px-2 py-1 rounded shadow-md z-10">
                      FLASH SALE
                    </div>
                  )}
*/
                  {/* Wishlist Button */}
               /*   <button className="absolute top-3 right-3 bg-white p-2 rounded-full shadow-md text-gray-400 hover:text-red-500 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Heart size={16} />
                  </button>
*/
                  {/* Image */}
            /*      <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  </div>
*/
                  {/* Content */}
      /*            <div className="p-4 flex flex-col flex-1">
                    <div className="text-xs text-[#148F96] font-bold mb-1">{product.category}</div>
                    <h3 className="font-bold text-gray-800 text-lg mb-1 truncate group-hover:text-[#D65A31] transition-colors">{product.name}</h3>
                    <p className="text-gray-500 text-xs mb-3 line-clamp-1">{product.description}</p>
                    */
                //  {/* Rating */}
                  /*  <div className="flex items-center gap-1 mb-3">
                      <Star size={14} className="fill-yellow-400 text-yellow-400" />
                      <span className="text-xs text-gray-500 font-medium">{product.rating} ({product.reviews})</span>
                    </div>

                    <div className="mt-auto flex items-center justify-between">
                      <div className="text-xl font-bold text-[#D65A31]">฿{product.price.toLocaleString()}</div>
                      <button className="bg-gray-100 hover:bg-[#148F96] hover:text-white text-gray-600 p-2 rounded-full transition-colors">
                        <ShoppingCart size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
*/
     //     {/* Load More */}
          /*<div className="mt-12 text-center">
            <button className="border-2 border-gray-200 text-gray-500 px-8 py-3 rounded-full hover:border-[#148F96] hover:text-[#148F96] font-bold transition-colors">
              โหลดเพิ่มเติม
            </button>
          </div>

        </main>
      </div>
    </div>
  );
};

export default Home;*/
// frontend/src/pages/Home.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
//  นำเข้าไอคอน Search เพิ่มเติม
import { ShoppingCart, Loader, Search } from 'lucide-react';
import * as api from '../services/api'; 
import type { Product, Category, Room, Feature } from '../services/api';

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
  
  //  STATE สำหรับการค้นหา (Search)
  const [searchTerm, setSearchTerm] = useState<string>('');

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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- FILTER & SEARCH LOGIC ---
  const filteredProducts = products.filter((product) => {
    // กรองหมวดหมู่
    const matchCategory =
      selectedCategories.length === 0 || 
      (product.category && selectedCategories.includes(product.category));

    // กรองห้อง
    const matchRoom =
      selectedRooms.length === 0 || 
      (product.room && selectedRooms.includes(product.room));

    // กรองคุณสมบัติ
    const matchFeature =
      selectedFeatures.length === 0 ||
      (product.features && product.features.some((f) => selectedFeatures.includes(f)));

    // กรองคำค้นหา (ค้นจากชื่อ และ รายละเอียด)
    const matchSearch = 
      searchTerm === '' ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchCategory && matchRoom && matchFeature && matchSearch;
  });

  // --- TOGGLE HANDLERS ---
  const handleToggle = (value: string, selectedList: string[], setList: React.Dispatch<React.SetStateAction<string[]>>) => {
    if (selectedList.includes(value)) {
      setList(selectedList.filter((item) => item !== value));
    } else {
      setList([...selectedList, value]);
    }
  };

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
            return `http://localhost:3000/uploads/products/${img}`;
        }
    } catch (e) {
        console.error(e);
    }
    return "https://placehold.co/400x300?text=No+Image";
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

      <div className="container mx-auto px-4 flex flex-col lg:flex-row gap-8">
        
        {/* --- SIDEBAR (Filters) --- */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          
          {/* Filter หมวดหมู่ */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">หมวดหมู่สินค้า</h3>
            <ul className="space-y-3">
              {categories.map((cat) => (
                <li key={cat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96]"
                    checked={selectedCategories.includes(cat.name)}
                    onChange={() => handleToggle(cat.name, selectedCategories, setSelectedCategories)}
                  />
                  <span>{cat.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Filter ห้อง */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">ห้อง</h3>
            <ul className="space-y-3">
              {rooms.map((room) => (
                <li key={room.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96]"
                    checked={selectedRooms.includes(room.name)}
                    onChange={() => handleToggle(room.name, selectedRooms, setSelectedRooms)}
                  />
                  <span>{room.name}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Filter คุณสมบัติ */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 text-lg">คุณสมบัติเพิ่มเติม</h3>
            <ul className="space-y-3">
              {features.map((feat) => (
                <li key={feat.id} className="flex items-center gap-3 text-gray-600 hover:text-[#148F96] cursor-pointer transition-colors">
                  <input 
                    type="checkbox" 
                    className="rounded border-gray-300 text-[#148F96] focus:ring-[#148F96]"
                    checked={selectedFeatures.includes(feat.name)}
                    onChange={() => handleToggle(feat.name, selectedFeatures, setSelectedFeatures)}
                  />
                  <span>{feat.name}</span>
                </li>
              ))}
            </ul>
          </div>

        </aside>

        {/* --- MAIN CONTENT --- */}
        <main className="flex-1">
          
          {/*  แถบด้านบน: จำนวนรายการ & แถบค้นหา */}
          <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm gap-4">
              <div className="text-gray-500 text-sm w-full sm:w-auto text-left">
                ค้นพบ <span className="text-gray-800 font-bold">{filteredProducts.length}</span> รายการ
              </div>
              
              {/* แถบค้นหา (Search Bar) */}
              <div className="relative w-full sm:w-72">
                <input 
                  type="text" 
                  placeholder="ค้นหาชื่อ หรือ รายละเอียด..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-[#04A5E3] transition text-sm bg-gray-50"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
              </div>
          </div>

          {filteredProducts.length === 0 ? (
             <div className="text-center py-20 text-gray-500 bg-white rounded-xl shadow-sm">
                ไม่พบสินค้าที่ตรงกับเงื่อนไข
             </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                            <button className="bg-gray-100 hover:bg-[#148F96] hover:text-white text-gray-600 p-2 rounded-full transition-colors">
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