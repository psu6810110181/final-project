import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { type Promotion } from '../services/api';

interface PromotionBadgeProps {
  productId: string;
  style?: React.CSSProperties;
}

const PromotionBadge: React.FC<PromotionBadgeProps> = ({ productId, style = {} }) => {
  const [promotion, setPromotion] = useState<Promotion | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const fetchPromotion = async () => {
      try {
        const token = localStorage.getItem('token');
        const flashSales = await api.get('/promotions/flash-sales', {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const productPromotion = flashSales.data.find((sale: any) => 
          sale.products?.some((product: any) => product.id === productId)
        );
        
        if (productPromotion) {
          setPromotion(productPromotion);
        }
      } catch (error) {
        console.error('Failed to fetch promotion:', error);
      }
    };

    fetchPromotion();
    const interval = setInterval(fetchPromotion, 30000); // รีเฟรชทุก 30 วินาที

    return () => clearInterval(interval);
  }, [productId]);

  useEffect(() => {
    if (!promotion) return;

    const calculateTimeLeft = () => {
      const now = new Date();
      const endTime = new Date(promotion.endDate);
      const difference = endTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

        if (days > 0) {
          setTimeLeft(`เหลือ ${days} วัน ${hours} ชม`);
        } else if (hours > 0) {
          setTimeLeft(`เหลือ ${hours} ชม ${minutes} นาที`);
        } else {
          setTimeLeft(`เหลือ ${minutes} นาที`);
        }
      } else {
        setTimeLeft('หมดเวลาแล้ว');
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // อัปเดตทุก 1 นาที

    return () => clearInterval(interval);
  }, [promotion]);

  if (!promotion) {
    return null;
  }

  return (
    <div style={{
      background: promotion.isFlashSale 
        ? 'linear-gradient(135deg, #ff6b6b 0%, #ff8e53 100%)'
        : 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      ...style
    }}>
      <span>{promotion.isFlashSale ? '🔥' : '📅'}</span>
      <span>{promotion.isFlashSale ? 'Flash Sale' : 'Promotion'}</span>
      {timeLeft && (
        <>
          <span>•</span>
          <span>{timeLeft}</span>
        </>
      )}
    </div>
  );
};

export default PromotionBadge;
