import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';

interface RevenueChartProps {
  ordersData: any[];
}

const RevenueChart: React.FC<RevenueChartProps> = ({ ordersData }) => {
  const [revenueFilter, setRevenueFilter] = useState<'day' | 'week' | 'month' | 'year'>('month');

  const generateRealChartData = () => {
    const validOrders = ordersData.filter(o => !['cancelled', 'pending'].includes((o.status || '').toLowerCase()));
    const now = new Date();

    if (revenueFilter === 'day') {
      const todayOrders = validOrders.filter(o => new Date(o.orderDate).toDateString() === now.toDateString());
      const bins = [0, 0, 0, 0]; 
      todayOrders.forEach(o => {
         const h = new Date(o.orderDate).getHours();
         if (h < 6) bins[0] += Number(o.totalAmount);
         else if (h < 12) bins[1] += Number(o.totalAmount);
         else if (h < 18) bins[2] += Number(o.totalAmount);
         else bins[3] += Number(o.totalAmount);
      });
      return [ { label: '00:00-06:00', val: bins[0] }, { label: '06:00-12:00', val: bins[1] }, { label: '12:00-18:00', val: bins[2] }, { label: '18:00-24:00', val: bins[3] } ];
    }
    if (revenueFilter === 'week') {
      const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const data = [];
      for(let i=6; i>=0; i--) {
         const targetDate = new Date();
         targetDate.setDate(now.getDate() - i);
         const dayTotal = validOrders.filter(o => new Date(o.orderDate).toDateString() === targetDate.toDateString()).reduce((sum, o) => sum + Number(o.totalAmount), 0);
         data.push({ label: dayLabels[targetDate.getDay()], val: dayTotal });
      }
      return data;
    }
    if (revenueFilter === 'month') {
      const data = [];
      for(let i=3; i>=0; i--) {
          const weekEnd = new Date(); weekEnd.setDate(now.getDate() - (i*7));
          const weekStart = new Date(weekEnd); weekStart.setDate(weekEnd.getDate() - 6);
          const wTotal = validOrders.filter(o => {
             const od = new Date(o.orderDate); return od >= weekStart && od <= weekEnd;
          }).reduce((sum, o) => sum + Number(o.totalAmount), 0);
          data.push({ label: `สัปดาห์ที่ ${4-i}`, val: wTotal });
      }
      return data;
    }
    if (revenueFilter === 'year') {
      const bins = new Array(12).fill(0);
      const monthLabels = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
      validOrders.forEach(o => {
         const d = new Date(o.orderDate);
         if (d.getFullYear() === now.getFullYear()) bins[d.getMonth()] += Number(o.totalAmount);
      });
      return bins.map((v, i) => ({ label: monthLabels[i], val: v }));
    }
    return [];
  };

  const chartData = generateRealChartData();
  const maxVal = Math.max(...chartData.map(d => d.val), 100);

  return (
    <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[80px] pointer-events-none transition-colors duration-700" />
      
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 relative z-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-wide">
            <BarChart3 className="text-blue-500" size={28} /> ภาพรวมรายได้
          </h2>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
          {[ {id:'day', label:'วันนี้'}, {id:'week', label:'สัปดาห์'}, {id:'month', label:'เดือน'}, {id:'year', label:'ปี'} ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setRevenueFilter(filter.id as any)}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${revenueFilter === filter.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'}`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72 flex items-end justify-between gap-3 pt-6 border-b border-slate-200 relative z-10">
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-6 opacity-30">
            <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
            <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
            <div className="border-t border-dashed border-slate-300 w-full h-0"></div>
        </div>
        {chartData.map((d, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-3 relative group/bar cursor-pointer">
            <div className="opacity-0 group-hover/bar:opacity-100 absolute -top-10 bg-slate-800 text-white font-bold text-xs py-1.5 px-3 rounded-lg whitespace-nowrap transition-all duration-300 shadow-lg translate-y-2 group-hover/bar:translate-y-0 z-10">
                ฿{d.val.toLocaleString()}
            </div>
            <div 
              className="w-full max-w-[60px] bg-gradient-to-t from-blue-600 to-blue-300 rounded-t-xl opacity-80 group-hover/bar:opacity-100 transition-all duration-500 group-hover/bar:shadow-md"
              style={{ height: `${(d.val / maxVal) * 100}%`, minHeight: '4px' }}
            ></div>
            <span className="text-xs font-bold text-slate-500 tracking-wide truncate w-full text-center group-hover/bar:text-blue-600 transition-colors">{d.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RevenueChart;