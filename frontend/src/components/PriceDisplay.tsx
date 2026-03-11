import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { type Promotion } from '../services/api';

interface PriceDisplayProps {
  productId: string;
  originalPrice: number;
  style?: React.CSSProperties;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ productId, originalPrice, style = {} }) => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [discountedPrice, setDiscountedPrice] = useState<number>(originalPrice);
  const [discountPercentage, setDiscountPercentage] = useState<number>(0);

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch both flash sales and seasonal promotions
        const [flashSalesResponse, allPromotionsResponse] = await Promise.all([
          api.get('/promotions/flash-sales', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }),
          api.get('/promotions', {
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          })
        ]);
        
        // Check flash sales first
        let productPromotion = flashSalesResponse.data.find((sale: any) => 
          sale.products?.some((product: any) => product.id === productId)
        );
        
        // If not found in flash sales, check all promotions (including seasonal)
        if (!productPromotion && allPromotionsResponse.data) {
          productPromotion = allPromotionsResponse.data.find((promo: any) => 
            promo.isActive && 
            new Date(promo.startDate) <= new Date() && 
            new Date(promo.endDate) >= new Date() &&
            promo.products?.some((product: any) => product.id === productId)
          );
        }
        
        if (productPromotion) {
          setPromotion(productPromotion);
          
          // คำนวณราคาที่ลดแล้ว
          let newPrice = originalPrice;
          
          if (productPromotion.discountType === 'PERCENTAGE') {
            newPrice = originalPrice * (1 - productPromotion.discountValue / 100);
            setDiscountPercentage(productPromotion.discountValue);
          } else {
            newPrice = Math.max(0, originalPrice - productPromotion.discountValue);
            setDiscountPercentage(Math.round(((originalPrice - newPrice) / originalPrice) * 100));
          }
          
          setDiscountedPrice(newPrice);
        } else {
          setPromotion(null);
          setDiscountedPrice(originalPrice);
          setDiscountPercentage(0);
        }
      } catch (error) {
        console.error('Failed to fetch promotion:', error);
      }
    };

    fetchPromotion();
    const interval = setInterval(fetchPromotion, 30000); // รีเฟรชทุก 30 วินาที

    return () => clearInterval(interval);
  }, [productId, originalPrice]);

  if (!promotion) {
    return (
      <span style={{ fontSize: '18px', fontWeight: '700', color: '#D65A31', ...style }}>
        ฿{originalPrice.toLocaleString()}
      </span>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', ...style }}>
      {/* ราคาเดิม */}
      <span style={{ 
        fontSize: '14px', 
        fontWeight: '500', 
        color: '#999', 
        textDecoration: 'line-through' 
      }}>
        ฿{originalPrice.toLocaleString()}
      </span>
      
      {/* ราคาที่ลดแล้ว */}
      <span style={{ 
        fontSize: '20px', 
        fontWeight: '700', 
        color: promotion.isFlashSale ? '#ff6b6b' : '#D65A31' 
      }}>
        ฿{discountedPrice.toLocaleString()}
      </span>
      
      {/* เปอร์เซ็นต์ส่วนลด */}
      <span style={{
        background: promotion.isFlashSale ? '#ff6b6b' : '#D65A31',
        color: 'white',
        padding: '2px 6px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: '700'
      }}>
        -{discountPercentage}%
      </span>
    </div>
  );
};

export default PriceDisplay;
