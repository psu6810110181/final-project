// frontend/src/pages/HomepagePromotion.tsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Loader } from 'lucide-react';
import * as api from '../services/api'; 
import type { Product, Promotion } from '../services/api';
import { useCart } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import TabBar from '../components/TabBar'; // ✅ Import TabBar

const HomepagePromotion = () => {
  const [promoProducts, setPromoProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoading(true);
        const promotions: Promotion[] = await api.getActiveFlashSales(); 
        let productsOnSale: Product[] = [];
        promotions.forEach(promo => {
          if (promo.products) {
            productsOnSale = [...productsOnSale, ...promo.products];
          }
        });

        const uniqueProducts = Array.from(new Set(productsOnSale.map(p => p.id)))
          .map(id => productsOnSale.find(p => p.id === id)!)
          .slice(0, 30); 

        setPromoProducts(uniqueProducts);
      } catch (error) {
        console.error('Failed to fetch promotions:', error);
        toast.error('ไม่สามารถดึงข้อมูลโปรโมชันได้');
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  const getImageUrl = (product: Product) => {
    try {
        const rawImages = product.image;
        let images: string[] = [];
        if (Array.isArray(rawImages)) images = rawImages;
        else if (typeof rawImages === 'string') {
             images = rawImages.startsWith('[') ? JSON.parse(rawImages) : [rawImages];
        }
        if (images.length > 0) {
            const img = images[0];
            return img.startsWith('http') ? img : `http://localhost:3000/uploads/${img}`;
        }
    } catch (e) {}
    return "https://placehold.co/400x300?text=No+Image";
  };

  const handleAddToCart = async (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('กรุณาเข้าสู่ระบบก่อน');
      navigate('/login');
      return;
    }
    await addToCart(product.id, 1);
  };

  if (loading) return <div className="min-h-screen flex justify-center items-center"><Loader className="animate-spin text-[#148F96]" size={48} /></div>;

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      
      {/* ✅ เรียกใช้ TabBar */}
      <TabBar />

      <div className="container mx-auto px-4 mt-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">สินค้าโปรโมชัน (สูงสุด 30 รายการ)</h1>
        
        {promoProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm text-gray-500">ไม่มีสินค้าโปรโมชันในขณะนี้</div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {promoProducts.map((product) => (
                    <Link to={`/product/${product.id}`} key={product.id} className="group">
                    <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100 h-full flex flex-col relative">
                        <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded z-10">Sale</div>
                        <div className="h-48 overflow-hidden bg-gray-100">
                            <img src={getImageUrl(product)} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                        <div className="p-4 flex flex-col flex-1">
                            <h3 className="font-bold text-gray-800 text-lg mb-1 truncate">{product.name}</h3>
                            <div className="mt-auto flex items-center justify-between">
                                <div className="text-xl font-bold text-[#D65A31]">฿{Number(product.price).toLocaleString()}</div>
                                <button onClick={(e) => handleAddToCart(e, product)} className="bg-gray-100 hover:bg-[#148F96] hover:text-white p-2 rounded-full">
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
    </div>
  );
};

export default HomepagePromotion;