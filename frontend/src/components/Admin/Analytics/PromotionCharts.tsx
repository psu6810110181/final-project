import React, { useState } from 'react';
import { TrendingUp, Zap, CalendarDays, Layers, SplitSquareHorizontal } from 'lucide-react';
import * as api from '../../../services/api';

interface PromotionChartsProps {
  flashSales: api.Promotion[];
  seasonSales: api.Promotion[];
  ordersData: any[];
}

const PromotionCharts: React.FC<PromotionChartsProps> = ({ flashSales, seasonSales, ordersData }) => {
  const [promoViewMode, setPromoViewMode] = useState<'separated' | 'combined'>('separated');
  const [selectedFlashSaleId, setSelectedFlashSaleId] = useState<string>('latest');
  const [selectedSeasonSaleId, setSelectedSeasonSaleId] = useState<string>('latest');

  const activeFlashSale = selectedFlashSaleId === 'latest' ? flashSales[0] : flashSales.find(p => p.id === selectedFlashSaleId) || flashSales[0];
  const activeSeasonSale = selectedSeasonSaleId === 'latest' ? seasonSales[0] : seasonSales.find(p => p.id === selectedSeasonSaleId) || seasonSales[0];

  const getPromoColor = (promo: api.Promotion | undefined) => {
    if (!promo) return '#94a3b8'; 
    if (promo.isFlashSale) return '#D65A31'; 
    
    const title = (promo.title || (promo as any).season || '').toLowerCase();
    if (title.includes('spring') || title.includes('ใบไม้ผลิ')) return '#ec4899'; 
    if (title.includes('summer') || title.includes('ฤดูร้อน')) return '#eab308'; 
    if (title.includes('autumn') || title.includes('ใบไม้ร่วง')) return '#f97316'; 
    if (title.includes('winter') || title.includes('ฤดูหนาว')) return '#3b82f6'; 
    return '#148F96'; 
  };

  const generateChartTimeline = (promos: (api.Promotion | undefined)[]) => {
    const validPromos = promos.filter(p => p !== undefined) as api.Promotion[];
    if (validPromos.length === 0) return { labels: [], dataSets: [] };

    const validOrders = ordersData.filter(o => !['cancelled', 'pending'].includes((o.status || '').toLowerCase()));
    
    const startDates = validPromos.map(p => new Date(p.startDate).getTime());
    const endDates = validPromos.map(p => new Date(p.endDate).getTime());
    const minStart = Math.min(...startDates);
    const maxEnd = Math.max(...endDates);

    const points = 7; 
    const step = (maxEnd - minStart) / (points - 1);
    
    const labels: string[] = [];
    const dataSets = validPromos.map(promo => ({
      name: promo.title,
      color: getPromoColor(promo),
      data: [] as number[],
      isFlash: promo.isFlashSale
    }));

    for(let i=0; i<points; i++) {
       const binStart = minStart + (i * step);
       const binEnd = i === points - 1 ? maxEnd : binStart + step;
       labels.push(new Date(binStart).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' }));

       validPromos.forEach((promo, pIndex) => {
         const promoProductIds = promo.products?.map(p => p.id) || [];
         const promoStart = new Date(promo.startDate).getTime();
         const promoEnd = new Date(promo.endDate).getTime();
         let binTotal = 0;

         if (binEnd >= promoStart && binStart <= promoEnd) {
           validOrders.forEach(o => {
               const oDate = new Date(o.orderDate).getTime();
               if (oDate >= binStart && oDate <= binEnd) {
                   o.items?.forEach((item: any) => {
                       if (promoProductIds.includes(item.product?.id)) {
                           binTotal += (Number(item.priceAtPurchase) || 0) * (Number(item.quantity) || 0);
                       }
                   });
               }
           });
         }
         dataSets[pIndex].data.push(binTotal);
       });
    }
    return { labels, dataSets };
  };

  const renderBeautifulBarChart = (title: string, timelineData: { labels: string[], dataSets: {name: string, color: string, data: number[], isFlash: boolean}[] }) => {
    if (timelineData.dataSets.length === 0) return (
      <div className="bg-white/80 backdrop-blur-xl p-5 rounded-3xl border border-slate-200 shadow-sm flex-1 flex flex-col items-center justify-center text-slate-400 min-h-[250px]">
        <p>ไม่มีข้อมูลโปรโมชัน</p>
      </div>
    );

    const allValues = timelineData.dataSets.flatMap(d => d.data);
    const localMax = Math.max(...allValues, 100);
    const labelsCount = timelineData.labels.length;
    const xStep = 100 / labelsCount;
    const numDatasets = timelineData.dataSets.length;
    
    const barWidth = numDatasets === 1 ? xStep * 0.35 : xStep * 0.28;
    const gap = numDatasets === 1 ? 0 : xStep * 0.05;
    const totalGroupWidth = (numDatasets * barWidth) + ((numDatasets - 1) * gap);

    return (
        <div className="bg-white/90 backdrop-blur-2xl p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full flex-1 flex flex-col relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 blur-[80px] opacity-20 pointer-events-none transition-opacity duration-700" style={{ backgroundColor: timelineData.dataSets[0]?.color }}></div>

           <div className="flex justify-between items-start mb-6 relative z-10">
             <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm text-slate-700">
                  {timelineData.dataSets.length > 1 ? <Layers size={20} /> : timelineData.dataSets[0].isFlash ? <Zap size={20} color="#D65A31" /> : <CalendarDays size={20} color={timelineData.dataSets[0].color} />}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-lg tracking-wide">{title}</h3>
                  <div className="flex gap-4 mt-1.5">
                    {timelineData.dataSets.map((ds, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                        <span className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: ds.color }}></span>
                        {ds.name}
                      </div>
                    ))}
                  </div>
                </div>
             </div>
           </div>
           
           <div className="h-56 w-full relative mt-auto px-1 z-10">
              <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                 {[0, 25, 50, 75, 100].map(percent => (
                   <line key={percent} x1="0" x2="100" y1={percent} y2={percent} stroke="#e2e8f0" strokeWidth="0.5" strokeDasharray="1 2" />
                 ))}
                 
                 {timelineData.labels.map((_, i) => {
                   const groupCenterX = (i + 0.5) * xStep;
                   const startX = groupCenterX - (totalGroupWidth / 2);

                   return (
                     <g key={`group-${i}`} className="group/bunch cursor-pointer">
                       <rect x={groupCenterX - xStep/2} y="0" width={xStep} height="100" fill="transparent" />
                       
                       {timelineData.dataSets.map((ds, j) => {
                          const val = ds.data[i] || 0;
                          const h = (val / localMax) * 85; 
                          const y = 100 - h;
                          const x = startX + (j * (barWidth + gap));
                          const r = Math.min(1.5, barWidth / 2, h / 2); 
                          
                          const pathD = h > 0.5 
                            ? `M ${x},100 L ${x},${y + r} Q ${x},${y} ${x + r},${y} L ${x + barWidth - r},${y} Q ${x + barWidth},${y} ${x + barWidth},${y + r} L ${x + barWidth},100 Z` 
                            : `M ${x},100 L ${x},99.5 L ${x + barWidth},99.5 L ${x + barWidth},100 Z`; 

                          return (
                            <g key={`bar-${i}-${j}`}>
                               <path d={pathD} fill={ds.color} className="transition-all duration-700 opacity-90 group-hover/bunch:opacity-100" />
                               {val > 0 && (
                                 <text x={x + barWidth/2} y={y - 3} fill={ds.color} fontSize="4" fontWeight="900" textAnchor="middle" className="opacity-0 group-hover/bunch:opacity-100 transition-opacity drop-shadow-sm">
                                    {val >= 10000 ? `${(val/1000).toFixed(1)}k` : val.toLocaleString()}
                                 </text>
                               )}
                            </g>
                          )
                       })}
                     </g>
                   )
                 })}
              </svg>
           </div>
           
           <div className="flex justify-between mt-2 text-[10px] text-slate-400 font-semibold relative z-10 border-t border-slate-100 pt-3">
              {timelineData.labels.map((label, i) => (
                <span key={i} className="text-center w-full block whitespace-nowrap">
                  {label.split(' ')[0] + ' ' + label.split(' ')[1]}
                </span>
              ))}
           </div>
        </div>
    )
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 relative overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-start mb-8 gap-5 relative z-10">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-wide whitespace-nowrap">
          <TrendingUp className="text-rose-500" size={28} /> สถิติโปรโมชัน
        </h2>
        
        <div className="flex flex-wrap gap-3 items-center">
          <select 
            value={selectedFlashSaleId} 
            onChange={(e) => setSelectedFlashSaleId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-rose-500/50 appearance-none max-w-[200px]"
          >
            <option value="latest">⚡ Flash Sale ล่าสุด</option>
            {flashSales.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
          </select>

          <select 
            value={selectedSeasonSaleId} 
            onChange={(e) => setSelectedSeasonSaleId(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none max-w-[200px]"
          >
            <option value="latest">📅 Season Sale ล่าสุด</option>
            {seasonSales.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 flex-shrink-0">
            <button onClick={() => setPromoViewMode('separated')} className={`p-1.5 rounded-lg transition-all ${promoViewMode === 'separated' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="แยกกราฟ">
              <SplitSquareHorizontal size={18} />
            </button>
            <button onClick={() => setPromoViewMode('combined')} className={`p-1.5 rounded-lg transition-all ${promoViewMode === 'combined' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`} title="รวมกราฟ">
              <Layers size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {promoViewMode === 'separated' ? (
          <>
            {renderBeautifulBarChart("ยอดขาย Flash Sale", generateChartTimeline([activeFlashSale]))}
            {renderBeautifulBarChart("ยอดขาย Seasonal Sale", generateChartTimeline([activeSeasonSale]))}
          </>
        ) : (
          renderBeautifulBarChart("เปรียบเทียบยอดขายโปรโมชัน (รวม)", generateChartTimeline([activeFlashSale, activeSeasonSale]))
        )}
      </div>
    </div>
  );
};

export default PromotionCharts;