// frontend/src/contexts/CartContext.tsx
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as api from '../services/api'; 
import type { Promotion, Variant } from '../services/api'; // ✅ นำเข้า Variant ด้วย
import toast from 'react-hot-toast';

// ✅ ฟังก์ชันคำนวณราคาส่วนลด (ใช้ร่วมกัน)
export function calculateDiscountPrice(price: string | number, promo?: Promotion) {
  const p = Number(price);
  if (!promo) return p;
  if (promo.discountType === 'PERCENTAGE') return p - (p * (promo.discountValue / 100));
  return Math.max(0, p - promo.discountValue);
}

export interface CartItem {
  id: number; 
  quantity: number;
  installationQty?: number; 
  variant?: Variant; // ✅ เพิ่ม variant มารองรับระบบตัวเลือกสินค้า (ใช้ Type ชัดเจนปลอดภัยกว่า any)
  product: {
    id: string;   
    name: string;
    price: number | string; 
    description?: string;
    images: string[] | string; 
    stock: number;
    promo?: Promotion; 
  };
}

interface CartContextType {
  cartItems: CartItem[];
  // ✅ เพิ่ม variantId เข้าไปที่นี่
  addToCart: (productId: string, quantity: number, installationQty?: number, variantId?: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateCartItem: (id: number, quantity?: number, installationQty?: number) => Promise<void>;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
  resetCart: () => void;
  cartTotal: number;
  cartCount: number;
  isLoading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        setCartItems([]);
        return;
    }

    try {
      setIsLoading(true);
      const [cartRes, promoData] = await Promise.all([
          api.getCart(),
          api.getAllPromotions().catch(() => []) 
      ]);

      let fetchedItems: CartItem[] = [];

      if (cartRes.data && Array.isArray(cartRes.data.items)) {
         fetchedItems = cartRes.data.items;
      } 
      else if (Array.isArray(cartRes.data)) {
         fetchedItems = cartRes.data;
      }

      const now = new Date();
      const promoMap = new Map<string, Promotion>();
      promoData.forEach((promo: Promotion) => {
          const startDate = new Date(promo.startDate);
          const endDate = new Date(promo.endDate);
          const isCurrentlyActive = promo.isActive && now >= startDate && now <= endDate;
          if (isCurrentlyActive) {
              promo.products?.forEach((prod: any) => {
                  if (!promoMap.has(prod.id)) promoMap.set(prod.id, promo);
              });
          }
      });

      const mappedItems = fetchedItems.map(item => {
          if (item.product) {
              item.product.promo = promoMap.get(item.product.id);
          }
          return item;
      });

      const sortedItems = mappedItems.sort((a, b) => {
          const nameA = a.product?.name || '';
          const nameB = b.product?.name || '';
          return nameA.localeCompare(nameB, 'th'); 
      });

      setCartItems(sortedItems); 

    } catch (error) {
      console.error('Error fetching cart:', error);
      setCartItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // ✅ รับ variantId เข้ามาและส่งต่อให้ api.addToCart
  const addToCart = async (productId: string, quantity: number, installationQty: number = 0, variantId?: number) => {
    try {
      await api.addToCart(productId, quantity, installationQty, variantId);
      toast.success('เพิ่มลงตะกร้าแล้ว!'); 
      await fetchCart(); 
    } catch (error: any) {
      console.error('Add to cart failed:', error);
      
      // ✅ ดึงข้อความ Error จริงๆ จาก Backend มาแสดง แทนคำว่า "เกิดข้อผิดพลาด..."
      const backendError = error.response?.data?.message;
      const errorMessage = Array.isArray(backendError) ? backendError[0] : (backendError || 'เกิดข้อผิดพลาดในการเพิ่มสินค้า');
      
      toast.error(`เพิ่มไม่สำเร็จ: ${errorMessage}`); 
      throw error; 
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await api.removeCartItem(id);
      await fetchCart();
    } catch (error) {
      console.error('Remove item failed:', error);
    }
  };

  const updateCartItem = async (id: number, newQuantity?: number, newInstallQty?: number) => {
    try {
      await api.updateCartItem(id, { quantity: newQuantity, installationQty: newInstallQty });
      await fetchCart();
    } catch (error) {
      console.error('Update cart item failed:', error);
    }
  };

  const clearCart = async () => {
    try {
      await api.clearCart();
      setCartItems([]);
    } catch (error) {
      console.error('Clear cart failed:', error);
    }
  };

  const safeCartItems = Array.isArray(cartItems) ? cartItems : [];

  const cartTotal = safeCartItems.reduce((total, item) => {
    if (!item || !item.product) return total; 
    
    // ✅ ดึงราคาจาก Variant ถ้าไม่มีให้ดึงราคาจาก Product หลัก (ครอบ Number เผื่อข้อมูลมาเป็น String)
    const basePrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
    
    // ใช้ฟังก์ชันคำนวณส่วนลด
    const finalPrice = calculateDiscountPrice(basePrice, item.product.promo);
    const quantity = Number(item.quantity) || 0;
    
    return total + (finalPrice * quantity);
  }, 0);
  
  const cartCount = safeCartItems.reduce((count, item) => {
    return count + Number(item?.quantity || 0);
  }, 0);

  const resetCart = () => {
    setCartItems([]); 
  };

  return (
    <CartContext.Provider value={{ 
      cartItems: safeCartItems,
      addToCart, 
      removeFromCart, 
      updateCartItem,
      clearCart, 
      fetchCart,
      resetCart,
      cartTotal, 
      cartCount,
      isLoading 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};