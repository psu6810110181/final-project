import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import * as api from '../services/api'; 

// 1. แก้ Interface CartItem ให้รองรับ ID แบบ String
export interface CartItem {
  id: number; // CartItem ID (มักจะเป็นตัวเลข 1, 2, 3...)
  quantity: number;
  product: {
    id: string;   // ✅ แก้เป็น string (รองรับ UUID)
    name: string;
    price: number | string; // รองรับทั้งคู่กันเหนียว
    description?: string;
    images: string[] | string; // รองรับทั้ง Array หรือ JSON String
    stock: number;
  };
}

// 2. แก้ Interface Context ให้ Type ตรงกับ Function ที่เราจะเขียน
interface CartContextType {
  cartItems: CartItem[];
  // ✅ addToCart รับ productId เป็น string
  addToCart: (productId: string, quantity: number) => Promise<void>;
  // ✅ removeFromCart รับ id เป็น number (เพราะลบที่ CartItem ID)
  removeFromCart: (id: number) => Promise<void>;
  // ✅ updateQuantity รับ id เป็น number
  updateQuantity: (id: number, quantity: number) => Promise<void>;
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
      const res = await api.getCart();

      let fetchedItems: CartItem[] = [];

      // เช็คโครงสร้างข้อมูลที่ Backend ส่งมา
      if (res.data && Array.isArray(res.data.items)) {
         fetchedItems = res.data.items;
      } 
      else if (Array.isArray(res.data)) {
         fetchedItems = res.data;
      }

      // ✅ เพิ่มส่วนนี้: สั่งเรียงลำดับตามชื่อ Product (ก-ฮ, A-Z) ก่อนเซ็ตค่า
      const sortedItems = fetchedItems.sort((a, b) => {
          const nameA = a.product?.name || '';
          const nameB = b.product?.name || '';
          return nameA.localeCompare(nameB, 'th'); // ใช้ 'th' เพื่อให้เรียงภาษาไทยได้ถูกต้อง
      });

      setCartItems(sortedItems); // เซ็ตข้อมูลที่เรียงลำดับแล้ว

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

  // 3. แก้ Function Implementation ให้รับ Type ตรงกับ Interface ด้านบน

  // ✅ productId: string
  const addToCart = async (productId: string, quantity: number) => {
    try {
      await api.addToCart(productId, quantity);
      alert('เพิ่มลงตะกร้าแล้ว!');
      await fetchCart(); 
    } catch (error) {
      console.error('Add to cart failed:', error);
      alert('เกิดข้อผิดพลาดในการเพิ่มสินค้า');
    }
  };

  // ✅ id: number (CartItem ID)
  const removeFromCart = async (id: number) => {
    try {
      await api.removeCartItem(id);
      await fetchCart();
    } catch (error) {
      console.error('Remove item failed:', error);
    }
  };

  // ✅ id: number (CartItem ID)
  const updateQuantity = async (id: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await api.updateCartItem(id, newQuantity);
      await fetchCart();
    } catch (error) {
      console.error('Update quantity failed:', error);
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
    const price = Number(item?.product?.price || 0);
    const quantity = Number(item?.quantity || 0);
    return total + (price * quantity);
  }, 0);
  
  const cartCount = safeCartItems.reduce((count, item) => {
    return count + Number(item?.quantity || 0);
  }, 0);

  const resetCart = () => {
    setCartItems([]); // ล้างให้ว่างทันที
  };

  return (
    <CartContext.Provider value={{ 
      cartItems: safeCartItems,
      addToCart, 
      removeFromCart, 
      updateQuantity, 
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