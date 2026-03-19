import React from 'react';
import { Star } from 'lucide-react';
import { type AnalyzedProduct } from '../../../types/analytics';

interface ProductRankingsProps {
  title: string;
  icon: React.ReactNode;
  type: 'sales' | 'reviews';
  data: AnalyzedProduct[];
  activeFilter: string;
  onFilterChange: (filterId: any) => void;
  filterOptions: { id: string; label: string | React.ReactNode }[];
  getImageUrl: (imageRaw: any) => string;
}

const ProductRankings: React.FC<ProductRankingsProps> = ({ title, icon, type, data, activeFilter, onFilterChange, filterOptions, getImageUrl }) => {
  return (
    <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] mb-10 relative overflow-hidden">
      <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center mb-8 gap-5 relative z-10">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3 tracking-wide">
            {icon} {title}
          </h2>
        </div>
        <div className="flex flex-wrap bg-slate-100 p-1.5 rounded-xl border border-slate-200 w-fit gap-1">
          {filterOptions.map((btn) => (
            <button 
              key={btn.id} 
              onClick={() => onFilterChange(btn.id)} 
              className={`flex items-center gap-2 px-5 py-2 rounded-lg text-xs font-bold transition-all ${activeFilter === btn.id ? (type === 'sales' ? (btn.id === 'best' ? 'bg-white text-emerald-600 shadow-sm' : 'bg-white text-rose-600 shadow-sm') : 'bg-white text-amber-600 shadow-sm') : 'text-slate-500 hover:text-slate-800'}`}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="w-full py-16 text-center text-slate-400 bg-white/50 rounded-3xl border border-dashed border-slate-200">
          ไม่มีข้อมูลในหมวดหมู่นี้...
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-5 pb-6 pt-2 scrollbar-hide px-2">
          {data.map((p, i) => (
            <div key={p.id} className="min-w-[220px] w-[220px] bg-white border border-slate-100 rounded-3xl p-4 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:border-slate-200 transition-all duration-500 flex-shrink-0 relative overflow-hidden group">
              <div className={`absolute top-0 left-0 text-white text-xs font-black px-4 py-1.5 rounded-br-2xl z-10 shadow-sm ${type === 'sales' && activeFilter === 'worst' ? 'bg-rose-500' : 'bg-slate-800'}`}>
                อันดับ {i + 1}
              </div>

              <div className="w-full h-36 bg-slate-50 rounded-2xl mb-4 overflow-hidden relative border border-slate-100">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/10 to-transparent z-10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <img src={getImageUrl(p.image)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
              </div>
              
              <h3 className="font-bold text-sm text-slate-800 truncate mb-1 tracking-wide">{p.name}</h3>
              
              {type === 'sales' ? (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">ขายแล้ว</span>
                  <span className={`text-sm font-black ${activeFilter === 'best' ? 'text-emerald-600' : 'text-rose-500'}`}>
                    {p.sold} ชิ้น
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                    <Star size={12} className="fill-amber-400 text-amber-400"/> ({p.reviewCount})
                  </span>
                  <span className="text-sm font-black text-amber-500">{p.avgRating} / 5</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductRankings;