import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getActiveFlashSales, type Promotion, type Product } from '../services/api';

interface FlashSaleProps {
  products?: Product[];
}

const FlashSale: React.FC<FlashSaleProps> = ({ products: allProducts = [] }) => {
  const [flashSales, setFlashSales] = useState<Promotion[]>([]);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const sales = await getActiveFlashSales();
        setFlashSales(sales);
      } catch (error) {
        console.error('Failed to fetch flash sales:', error);
      }
    };

    fetchFlashSales();
    const interval = setInterval(fetchFlashSales, 30000); // รีเฟรชทุก 30 วินาที

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = () => {
      if (flashSales.length === 0) return;

      // หาเวลาที่เหลือน้อยที่สุดจากทุก flash sale
      const now = new Date();
      let minEndTime = new Date(flashSales[0].endDate);

      flashSales.forEach(sale => {
        const endTime = new Date(sale.endDate);
        if (endTime < minEndTime) {
          minEndTime = endTime;
        }
      });

      const difference = minEndTime.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [flashSales]);

  const calculateDiscountedPrice = (product: Product, promotion: Promotion) => {
    const price = typeof product.price === 'string' ? Number(product.price) : product.price;
    
    if (promotion.discountType === 'PERCENTAGE') {
      return price * (1 - promotion.discountValue / 100);
    } else {
      return Math.max(0, price - promotion.discountValue);
    }
  };

  const getFlashSaleProducts = () => {
    const flashSaleProductIds = new Set<string>();
    
    flashSales.forEach(sale => {
      sale.products?.forEach(product => {
        flashSaleProductIds.add(product.id);
      });
    });

    return allProducts.filter(product => flashSaleProductIds.has(product.id));
  };

  const flashSaleProducts = getFlashSaleProducts();

  if (flashSales.length === 0 || flashSaleProducts.length === 0) {
    return null;
  }

  return (
    <div style={{
      background: 'linear-gradient(135deg, #ff8e53 0%, #148f96 100%)',
      borderRadius: '16px',
      padding: '24px',
      margin: '20px 0',
      boxShadow: '0 8px 32px rgba(255, 107, 107, 0.2)',
      color: 'white'
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '28px', fontWeight: '700', display: 'flex', alignItems: 'center' }}>
            🔥 FLASH SALE
          </h2>
          <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
            โปรโมชั่นระเบิดตอนนี้เท่านั้น!
          </p>
        </div>
        
        {/* Countdown Timer */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '12px', opacity: 0.9, marginBottom: '4px' }}>เหลือเวลา</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {timeLeft.days > 0 && (
              <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '18px', fontWeight: '700' }}>{timeLeft.days}</div>
                <div style={{ fontSize: '10px', opacity: 0.8 }}>วัน</div>
              </div>
            )}
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{String(timeLeft.hours).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>ชม</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{String(timeLeft.minutes).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>นาที</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.2)', padding: '8px 12px', borderRadius: '8px', minWidth: '40px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: '700' }}>{String(timeLeft.seconds).padStart(2, '0')}</div>
              <div style={{ fontSize: '10px', opacity: 0.8 }}>วินาที</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flash Sale Products */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
        {flashSaleProducts.map((product) => {
          const promotion = flashSales.find(sale => 
            sale.products?.some(p => p.id === product.id)
          );
          
          if (!promotion) return null;

          const originalPrice = typeof product.price === 'string' ? Number(product.price) : product.price;
          const discountedPrice = calculateDiscountedPrice(product, promotion);
          const discountPercentage = Math.round(((originalPrice - discountedPrice) / originalPrice) * 100);

          return (
            <Link 
              to={`/product/${product.id}`} 
              key={product.id} 
              style={{ 
                textDecoration: 'none',
                color: 'inherit',
                display: 'block'
              }}
            >
              <div style={{
                background: 'rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '16px',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
              >
              {/* Product Image */}
              <div style={{ 
                width: '100%', 
                height: '150px', 
                borderRadius: '8px', 
                marginBottom: '12px',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {product.image ? (
                  <img 
                    src={product.image.startsWith('http') 
                      ? product.image 
                      : `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/uploads/${product.image}`
                    } 
                    alt={product.name}
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover' 
                    }}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.png';
                    }}
                  />
                ) : (
                  <div style={{ 
                    color: 'rgba(255,255,255,0.6)', 
                    fontSize: '48px',
                    textAlign: 'center'
                  }}>
                    📦
                  </div>
                )}
              </div>
              
              {/* Product Info */}
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600' }}>
                {product.name}
              </h3>
              
              {/* Price */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ 
                  fontSize: '20px', 
                  fontWeight: '700',
                  textDecoration: 'line-through',
                  opacity: 0.7
                }}>
                  ฿{originalPrice.toLocaleString()}
                </span>
                <span style={{ 
                  fontSize: '24px', 
                  fontWeight: '700',
                  color: '#d32f2f'
                }}>
                  ฿{discountedPrice.toLocaleString()}
                </span>
              </div>
              
              {/* Discount Badge */}
              <div style={{
                background: '#ffffff',
                color: '#d32f2f',
                padding: '4px 8px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700',
                display: 'inline-block',
                marginBottom: '8px'
              }}>
                ลด {discountPercentage}%
              </div>
              
              {/* Promotion Info */}
              <div style={{ fontSize: '12px', opacity: 0.8 }}>
                {promotion.discountType === 'PERCENTAGE' 
                  ? `ลด ${promotion.discountValue}%`
                  : `ลด ฿${promotion.discountValue.toLocaleString()}`
                }
              </div>
            </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default FlashSale;
