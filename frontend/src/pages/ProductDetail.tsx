import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom'; 
import { Star, Minus, Plus, ChevronRight, Loader } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import * as api from '../services/api'; 
import type { Product } from '../services/api'; 

const ProductDetail = () => {
  const { id } = useParams(); 
  const { addToCart } = useCart();

  // --- STATE ---
  const [product, setProduct] = useState<Product | null>(null); 
  const [loading, setLoading] = useState(true); 
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [installationQty, setInstallationQty] = useState(0); // ✅ เปลี่ยนเป็นตัวเลข
  const [isAdding, setIsAdding] = useState(false); 

  // --- Fetch Data ---
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await api.getProductById(id);
        setProduct(data as any); 
      } catch (error) {
        console.error("Failed to load product", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // --- Loading State ---
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">กำลังโหลดข้อมูลสินค้า...</div>;
  }

  // --- Not Found State ---
  if (!product) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">ไม่พบสินค้า</div>;
  }

  // --- แปลงรูปภาพ ---
  let images: string[] = [];
  try {
    if (Array.isArray(product.image)) {
        images = product.image;
    } else if (typeof product.image === 'string') {
        images = JSON.parse(product.image);
    }
    if (images.length === 0) images = ["https://via.placeholder.com/600x400?text=No+Image"];
  } catch (e) {
    images = ["https://via.placeholder.com/600x400?text=Error+Image"];
  }

  const getImageUrl = (img: string) => {
    if (img.startsWith('http')) return img;
    return `http://localhost:3000/uploads/products/${img}`;
  };

  // --- ฟังก์ชันกดเพิ่มลงตะกร้า ---
  const handleAddToCart = async () => {
    if (!id) return; 

    try {
        setIsAdding(true);
        // ✅ ส่งตัวเลขจำนวนที่ติดตั้งไปด้วย
        await addToCart(id, quantity, installationQty); 
    } catch (error) {
        console.error(error);
    } finally {
        setIsAdding(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10 font-sans">
      
      <div className="container mx-auto px-4 py-6">
        
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-4 flex items-center gap-2">
           <Link to="/" className="hover:text-[#D65A31]">หน้าแรก</Link> 
           <ChevronRight size={14}/> 
           <span>สินค้า</span> 
           <ChevronRight size={14}/> 
           <span className="text-[#148F96] font-bold line-clamp-1">{product.name}</span>
        </div>

        {/* --- ส่วนบน: รูปภาพ และ ข้อมูลสินค้า --- */}
        <div className="bg-white rounded-xl shadow-sm p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
          
          {/* LEFT: Image Gallery */}
          <div className="flex gap-4 h-[400px] md:h-[450px]">
            {/* Thumbnails */}
            <div className="flex flex-col gap-3 w-20 overflow-y-auto no-scrollbar">
              {images.map((img, index) => (
                <button 
                  key={index}
                  onMouseEnter={() => setSelectedImageIndex(index)}
                  className={`w-full aspect-square rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${selectedImageIndex === index ? 'border-[#D65A31]' : 'border-transparent'}`}
                >
                  <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            
            {/* Main Image */}
            <div className="flex-1 bg-gray-100 rounded-lg overflow-hidden relative">
               <img src={getImageUrl(images[selectedImageIndex])} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
            </div>
          </div>

          {/* RIGHT: Product Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h1>
            <div className="text-[#D65A31] text-3xl font-bold mb-1">
              ฿ {Number(product.price).toLocaleString()} <span className="text-sm text-gray-500 font-normal">/ ชิ้น</span>
            </div>
            <p className="text-gray-400 text-xs mb-4">Stock: {product.stock} ชิ้น</p>
            
            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                 <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
              ))}
              <span className="text-gray-500 text-sm ml-2">5.0 (Review Mock)</span>
            </div>

            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                {product.description || "ไม่มีรายละเอียดสินค้า"}
            </p>

            {/* Options */}
            <div className="space-y-5 border-t border-gray-100 pt-5">
              
               {/* ✅ Installation Option แบบตัวเลข */}
               <div>
                  <span className="font-bold text-gray-800 block mb-2">บริการเสริม</span>
                  <div className="flex items-center justify-between border border-gray-200 p-3 rounded-lg w-full sm:w-80">
                     <span className="text-gray-600 text-sm">รับบริการติดตั้ง (+฿400/ชิ้น)</span>
                     <div className="flex items-center bg-gray-50 border border-gray-300 rounded overflow-hidden">
                        <button 
                          onClick={() => setInstallationQty(Math.max(0, installationQty - 1))} 
                          className="p-1.5 hover:bg-white text-gray-500 transition-colors"
                        ><Minus size={14}/></button>
                        <span className="w-8 text-center text-sm font-bold py-1">{installationQty}</span>
                        <button 
                          onClick={() => setInstallationQty(Math.min(quantity, installationQty + 1))} 
                          className="p-1.5 hover:bg-white text-gray-500 transition-colors"
                        ><Plus size={14}/></button>
                     </div>
                  </div>
                  <span className="text-xs text-red-400 mt-1 block">*เลือกติดตั้งได้สูงสุดตามจำนวนสินค้าที่ซื้อ (4 ชิ้นขึ้นไปเหมาจ่าย 990 บาท)</span>
               </div>

              {/* Quantity & Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 pt-4">
                <div>
                    <span className="font-bold text-gray-800 block mb-2">จำนวน</span>
                    <div className="flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                      <button 
                        onClick={() => {
                          const newQty = Math.max(1, quantity - 1);
                          setQuantity(newQty);
                          // ✅ ถ้าลดจำนวนสินค้าจนน้อยกว่าจำนวนติดตั้ง ให้ลดจำนวนติดตั้งลงมาให้เท่ากัน
                          if (installationQty > newQty) setInstallationQty(newQty);
                        }} 
                        className="p-3 hover:bg-gray-100 transition-colors"
                      >
                        <Minus size={16}/>
                      </button>
                      <input 
                        type="text" 
                        value={quantity} 
                        readOnly 
                        className="w-12 text-center text-sm font-bold border-x border-gray-300 py-2"
                      />
                      <button 
                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} 
                        className="p-3 hover:bg-gray-100 transition-colors"
                        disabled={quantity >= product.stock}
                      >
                        <Plus size={16}/>
                      </button>
                    </div>
                </div>

                <button 
                    onClick={handleAddToCart}
                    disabled={isAdding || product.stock === 0}
                    className="flex-1 bg-[#D65A31] hover:bg-[#b54622] text-white py-3 px-8 rounded-lg font-bold text-lg shadow-lg shadow-orange-100 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                >
                  {isAdding ? (
                    <><Loader className="animate-spin" size={20}/> กำลังเพิ่ม...</>
                  ) : product.stock === 0 ? (
                    "สินค้าหมด"
                  ) : (
                    "เพิ่มลงตะกร้า"
                  )}
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* --- ส่วนล่าง: รีวิว (Mock) --- */}
        <div className="bg-white rounded-xl shadow-sm p-6">
             <h2 className="text-xl font-bold text-gray-800 mb-6">รายละเอียดเพิ่มเติม</h2>
             <p className="text-gray-600">
                Category: {product.category} <br/>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
             </p>
        </div>

      </div>
    </div>
  );
};

export default ProductDetail;