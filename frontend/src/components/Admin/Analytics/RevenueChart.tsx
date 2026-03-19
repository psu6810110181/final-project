import React, { useState } from 'react';
import { BarChart3 } from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from 'recharts';

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
      // ✅ เปลี่ยนจาก val เป็น Total เพื่อให้ตรงกับ nameKey
      return [ 
        { label: '00:00-06:00', Total: bins[0] }, 
        { label: '06:00-12:00', Total: bins[1] }, 
        { label: '12:00-18:00', Total: bins[2] }, 
        { label: '18:00-24:00', Total: bins[3] } 
      ];
    }
    if (revenueFilter === 'week') {
      const dayLabels = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
      const data = [];
      for(let i=6; i>=0; i--) {
         const targetDate = new Date();
         targetDate.setDate(now.getDate() - i);
         const dayTotal = validOrders.filter(o => new Date(o.orderDate).toDateString() === targetDate.toDateString()).reduce((sum, o) => sum + Number(o.totalAmount), 0);
         data.push({ label: dayLabels[targetDate.getDay()], Total: dayTotal });
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
          data.push({ label: `สัปดาห์ที่ ${4-i}`, Total: wTotal });
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
      return bins.map((v, i) => ({ label: monthLabels[i], Total: v }));
    }
    return [];
  };

  const chartData = generateRealChartData();

  // ✅ Custom Tooltip ในสไตล์ของ shadcn/ui (มี Indicator Dot)
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-md border border-slate-200 shadow-[0_4px_20px_rgb(0,0,0,0.08)] rounded-xl p-3.5 min-w-[150px] z-50 relative">
          <div className="text-slate-500 text-[11px] font-bold uppercase mb-2.5 tracking-wider">{label}</div>
          <div className="flex items-center justify-between gap-6 text-sm font-semibold">
            <div className="flex items-center gap-2">
              {/* Indicator Dot (สีของ Recharts ที่พ่นมา หรือกำหนดเอง) */}
              <span 
                className="w-2.5 h-2.5 rounded-[3px] shadow-sm border border-black/5" 
                style={{ backgroundColor: payload[0].color || '#3b82f6' }}
              ></span>
              <span className="text-slate-600">{payload[0].name}</span>
            </div>
            <span className="text-slate-900 font-bold tracking-tight">
              ฿{Number(payload[0].value).toLocaleString()}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-8 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 blur-[80px] pointer-events-none transition-colors duration-700" />
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8 relative z-10 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-wide">
            <BarChart3 className="text-blue-500" size={28} /> ภาพรวมรายได้
          </h2>
        </div>
        <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 shadow-inner">
          {[ 
            { id: 'day', label: 'วันนี้' }, 
            { id: 'week', label: 'สัปดาห์' }, 
            { id: 'month', label: 'เดือน' }, 
            { id: 'year', label: 'ปี' } 
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setRevenueFilter(filter.id as any)}
              className={`px-5 py-2 rounded-lg text-xs font-bold tracking-wide transition-all duration-300 ${
                revenueFilter === filter.id 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Area */}
      <div className="h-72 w-full relative z-10 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            {/* สี Gradient สำหรับแท่งกราฟ */}
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.6}/>
              </linearGradient>
            </defs>

            {/* Grid แนวนอนแบบบางๆ */}
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            
            <XAxis 
              dataKey="label" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
              dy={10} 
            />
            
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }} 
              tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
            />

            {/* ✅ Tooltip Style แบบ Shadcn */}
            <Tooltip 
              content={<CustomTooltip />} 
              cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} // สีพื้นหลังตอน hover แท่งกราฟ
            />

            {/* ✅ แท่งกราฟ Bar (เชื่อมกับชื่อ Key ว่า Total) */}
            <Bar 
              dataKey="Total" 
              name="Total" // เป็นตัวกำหนด nameKey ใน Tooltip
              radius={[6, 6, 0, 0]} 
              maxBarSize={50}
              animationDuration={1500}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill="url(#colorRevenue)" />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueChart;