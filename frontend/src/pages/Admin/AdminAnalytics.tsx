import React, { useState, useEffect, useMemo } from 'react';
import { Loader, Package, Star, TrendingDown, TrendingUp, AlertTriangle } from 'lucide-react'; // ✅ นำเข้า AlertTriangle
import * as api from '../../services/api';
import toast from 'react-hot-toast';
import { type AnalyzedProduct } from '../../types/analytics'; 

// นำเข้า Components ย่อยที่เราแยกไว้
import LowStockAlert from '../../components/Admin/Analytics/LowStockAlert';
import RevenueChart from '../../components/Admin/Analytics/RevenueChart';
import PromotionCharts from '../../components/Admin/Analytics/PromotionCharts';
import ProductRankings from '../../components/Admin/Analytics/ProductRankings';

const AdminAnalytics: React.FC = () => {
  const [loading, setLoading] = useState(true);
  
  // States สำหรับเก็บข้อมูลดิบจาก API
  const [productsData, setProductsData] = useState<AnalyzedProduct[]>([]);
  const [ordersData, setOrdersData] = useState<any[]>([]);
  const [promotionsData, setPromotionsData] = useState<api.Promotion[]>([]);
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);

  // States สำหรับควบคุม Filter หมวดสินค้าจัดอันดับ
  const [salesFilter, setSalesFilter] = useState<'best' | 'worst'>('best');
  const [reviewFilter, setReviewFilter] = useState<'avg' | '5' | '4' | '3' | '2' | '1'>('avg');

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [productsRes, ordersRes, promosRes] = await Promise.all([
          api.getAllProducts().catch(() => []),
          api.getAllOrders().catch(() => []),
          api.getAllPromotions().catch(() => [])
        ]);

        const rawProducts = Array.isArray(productsRes) ? productsRes : ((productsRes as any)?.data || []);
        const rawOrders = Array.isArray(ordersRes) ? ordersRes : ((ordersRes as any)?.data || []);
        const rawPromos = Array.isArray(promosRes) ? promosRes : ((promosRes as any)?.data || []);
        
        setOrdersData(rawOrders);
        setPromotionsData(rawPromos);

        const validOrders = rawOrders.filter((o: any) => !['cancelled', 'pending'].includes((o.status || '').toLowerCase()));
        const productSalesCount: Record<string, number> = {};
        validOrders.forEach((order: any) => {
           order.items?.forEach((item: any) => {
              if (item.product?.id) {
                 productSalesCount[item.product.id] = (productSalesCount[item.product.id] || 0) + (Number(item.quantity) || 0);
              }
           });
        });

        const productsWithStats: AnalyzedProduct[] = [];
        const lowStockAlerts: any[] = [];

        await Promise.all(rawProducts.map(async (p: any) => {
            const reviews = await api.getReviewsByProduct(p.id).catch(() => []);
            let avgRating = 0;
            if (reviews.length > 0) {
              const sum = reviews.reduce((acc: number, curr: any) => acc + curr.rating, 0);
              avgRating = Number((sum / reviews.length).toFixed(1));
            }

            let totalStock = Number(p.stock || p.mainStock || 0);
            
            if (totalStock > 0 && totalStock <= 5) lowStockAlerts.push({ product: p, lowStockType: 'main', stockLevel: totalStock });
            
            if (p.variants && p.variants.length > 0) {
              p.variants.forEach((v: any) => {
                const vStock = Number(v.stock || 0);
                totalStock += vStock;
                if (vStock > 0 && vStock <= 5) lowStockAlerts.push({ product: p, lowStockType: 'variant', variantInfo: v, stockLevel: vStock });
              });
            }

            if (totalStock === 0) lowStockAlerts.push({ product: p, lowStockType: 'out_of_stock', stockLevel: 0 });

            productsWithStats.push({
              id: p.id,
              name: p.name,
              image: p.image || p.images || null,
              price: Number(p.price || 0),
              sold: productSalesCount[p.id] || 0, 
              avgRating: avgRating,
              reviewCount: reviews.length,
              stock: totalStock
            });
        }));

        setProductsData(productsWithStats);
        setLowStockItems(lowStockAlerts);

        if (lowStockAlerts.length > 0) {
          toast.error(`มีสินค้า ${lowStockAlerts.length} รายการ สต็อกใกล้หมด!`, {
            id: 'low-stock-alert',
            duration: 4000,
            icon: <AlertTriangle color="#ef4444" size={24} />, // ✅ เปลี่ยนจาก Emoji เป็น Icon
            style: { background: '#fff', color: '#1e293b', border: '1px solid #ef4444' }
          });
        }

      } catch (error) {
        toast.error("ไม่สามารถดึงข้อมูลสถิติได้");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getImageUrl = (imageRaw: any) => {
    if (!imageRaw) return "https://placehold.co/200x200/e2e8f0/64748b?text=No+Image";
    let imgName = "";
    if (Array.isArray(imageRaw) && imageRaw.length > 0) imgName = imageRaw[0];
    else if (typeof imageRaw === 'string') {
      try { imgName = JSON.parse(imageRaw)[0]; } catch (e) { imgName = imageRaw; }
    }
    if (!imgName) return "https://placehold.co/200x200/e2e8f0/64748b?text=No+Image";
    return imgName.startsWith('http') ? imgName : `${API_BASE_URL}/uploads/${imgName}`;
  };

  const flashSales = useMemo(() => promotionsData.filter(p => p.isFlashSale).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), [promotionsData]);
  const seasonSales = useMemo(() => promotionsData.filter(p => !p.isFlashSale).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()), [promotionsData]);

  const sortedSalesProducts = useMemo(() => [...productsData].sort((a, b) => salesFilter === 'best' ? b.sold - a.sold : a.sold - b.sold).slice(0, 10), [productsData, salesFilter]);
  const sortedReviewProducts = useMemo(() => [...productsData].filter(p => reviewFilter === 'avg' ? p.reviewCount > 0 : Math.floor(p.avgRating) === Number(reviewFilter)).sort((a, b) => b.avgRating - a.avgRating).slice(0, 10), [productsData, reviewFilter]);

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col items-center justify-center text-slate-800 relative overflow-hidden">
        <div className="absolute w-[40vw] h-[40vw] bg-blue-100/50 blur-[100px] rounded-full animate-pulse" />
        <Loader className="animate-spin mb-4 relative z-10 text-blue-500" size={56} />
        <h2 className="text-xl font-bold tracking-widest relative z-10 text-slate-600">กำลังโหลดข้อมูลระบบ...</h2>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-8 min-h-screen font-sans bg-[#f8fafc] text-slate-800 relative overflow-hidden selection:bg-blue-200 selection:text-blue-900">
      
      {/* Cinematic Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-100/40 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100/40 blur-[120px] rounded-full" />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] bg-pink-100/30 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-10 border-l-4 border-slate-800 pl-5">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight drop-shadow-sm">ระบบวิเคราะห์ข้อมูล</h1>
          <p className="text-slate-500 mt-2 text-sm font-medium tracking-wide">แดชบอร์ดแสดงผลการดำเนินงานแบบเรียลไทม์</p>
        </div>

        {/* Components ที่ประกอบร่างกัน */}
        <LowStockAlert lowStockItems={lowStockItems} />

        <RevenueChart ordersData={ordersData} />

        <PromotionCharts 
          flashSales={flashSales} 
          seasonSales={seasonSales} 
          ordersData={ordersData} 
        />

        <ProductRankings 
          title="ความนิยมสินค้า"
          icon={<Package className="text-emerald-500" size={28} />}
          type="sales"
          data={sortedSalesProducts}
          activeFilter={salesFilter}
          onFilterChange={setSalesFilter}
          filterOptions={[
            { id: 'best', label: <><TrendingUp size={16} /> ยอดขายสูงสุด</> },
            { id: 'worst', label: <><TrendingDown size={16} /> ยอดขายต่ำสุด</> }
          ]}
          getImageUrl={getImageUrl}
        />

        <ProductRankings 
          title="ดัชนีความพึงพอใจ"
          icon={<Star className="text-amber-400 fill-amber-400" size={28} />}
          type="reviews"
          data={sortedReviewProducts}
          activeFilter={reviewFilter}
          onFilterChange={setReviewFilter}
          filterOptions={[
            { id: 'avg', label: 'เรียงตามคะแนนเฉลี่ย' },
            { id: '5', label: '5 ดาว' },
            { id: '4', label: '4 ดาว' },
            { id: '3', label: '3 ดาว' },
            { id: '2', label: '2 ดาว' },
            { id: '1', label: '1 ดาว' }
          ]}
          getImageUrl={getImageUrl}
        />

      </div>
    </div>
  );
};

export default AdminAnalytics;