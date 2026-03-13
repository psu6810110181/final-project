// frontend/src/components/HomeFilterBar.tsx
import React from 'react';
import { Search, ChevronDown, FilterX } from 'lucide-react'; 
import toast from 'react-hot-toast';

interface HomeFilterBarProps {
  categories: any[]; rooms: any[]; features: any[]; colors: any[]; materials: any[]; sizes: any[];
  selectedCategories: string[]; setSelectedCategories: (v: string[]) => void;
  selectedRooms: string[]; setSelectedRooms: (v: string[]) => void;
  selectedFeatures: string[]; setSelectedFeatures: (v: string[]) => void;
  selectedColors: string[]; setSelectedColors: (v: string[]) => void;
  selectedMaterials: string[]; setSelectedMaterials: (v: string[]) => void;
  selectedSizes: string[]; setSelectedSizes: (v: string[]) => void;
  minPrice: string; setMinPrice: (v: string) => void;
  maxPrice: string; setMaxPrice: (v: string) => void;
  searchTerm: string; setSearchTerm: (v: string) => void;
  activeDropdown: string | null; setActiveDropdown: (v: string | null) => void;
  filteredCount: number;
}

const getColorHex = (colorName: string) => {
  const colorMap: Record<string, string> = {
    'แดง': '#EF4444', 'น้ำเงิน': '#3B82F6', 'ดำ': '#000000', 'ขาว': '#FFFFFF',
    'เขียว': '#22C55E', 'เหลือง': '#EAB308', 'เทา': '#6B7280', 'น้ำตาล': '#8B4513'
  };
  return colorMap[colorName] || '#ccc';
};

const HomeFilterBar: React.FC<HomeFilterBarProps> = (props) => {
  
  const isAdvancedFilterAllowed = props.selectedCategories.length > 0 || props.selectedRooms.length > 0 || props.selectedFeatures.length > 0;
  
  const hasAnyFilter = props.selectedCategories.length > 0 || props.selectedRooms.length > 0 || props.selectedFeatures.length > 0 || props.minPrice !== '' || props.maxPrice !== '' || props.searchTerm !== '' || props.selectedColors.length > 0 || props.selectedMaterials.length > 0 || props.selectedSizes.length > 0;

  const handleToggle = (value: string, selectedList: string[], setList: (v: string[]) => void) => {
    if (selectedList.includes(value)) setList(selectedList.filter((item) => item !== value));
    else setList([...selectedList, value]);
  };

  const toggleDropdown = (dropdownName: any) => {
    if (['color', 'material', 'size'].includes(dropdownName) && !isAdvancedFilterAllowed) {
      toast.error('กรุณาเลือก หมวดหมู่, ห้อง หรือ คุณสมบัติ อย่างน้อย 1 อย่างก่อนใช้ตัวกรองนี้');
      return;
    }
    props.setActiveDropdown(props.activeDropdown === dropdownName ? null : dropdownName);
  };

  const clearAllFilters = () => {
    props.setSelectedCategories([]); props.setSelectedRooms([]); props.setSelectedFeatures([]);
    props.setSelectedColors([]); props.setSelectedMaterials([]); props.setSelectedSizes([]);
    props.setMinPrice(''); props.setMaxPrice(''); props.setSearchTerm('');
  };

  // Helper สำหรับปุ่ม Dropdown
  const DropdownButton = ({ type, list, label }: { type: string, list: string[], label: string }) => {
    const isAdvanced = ['color', 'material', 'size'].includes(type);
    const isDisabled = isAdvanced && !isAdvancedFilterAllowed;
    const isSelected = list.length > 0;

    return (
      <div className="relative">
        <button 
          onClick={() => toggleDropdown(type)} 
          className={`px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 transition-all border ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200 text-gray-400' : isSelected ? 'bg-[#148F96] text-white border-[#148F96] shadow-md shadow-[#148F96]/20' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'}`}
        >
          {label} {isSelected && `(${list.length})`}
          <ChevronDown size={16} className={`transition-transform duration-200 ${props.activeDropdown === type ? 'rotate-180' : ''}`} />
        </button>
      </div>
    );
  };

  // Helper สำหรับ Dropdown Content
  const DropdownContent = ({ type, options, selected, setSelected, renderItem }: any) => {
    if (props.activeDropdown !== type || (['color', 'material', 'size'].includes(type) && !isAdvancedFilterAllowed)) return null;
    return (
      <div className="absolute top-full left-0 mt-3 w-64 bg-white border border-gray-100 rounded-2xl shadow-2xl p-5 z-50">
        <ul className="max-h-60 overflow-y-auto space-y-4">
          {options.map((opt: any) => (
            <li key={opt.id} className="flex items-center gap-3 text-slate-600 hover:text-[#148F96] cursor-pointer" onClick={() => handleToggle(opt.name, selected, setSelected)}>
              {renderItem ? renderItem(opt) : (
                <input type="checkbox" className="rounded-md border-slate-300 text-[#148F96] focus:ring-[#148F96] cursor-pointer" checked={selected.includes(opt.name)} readOnly />
              )}
              <span className={selected.includes(opt.name) ? 'font-bold text-[#148F96]' : ''}>{opt.name}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="sticky top-20 z-40 container mx-auto px-4 -mt-10 mb-16 transition-all duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-gray-200 shadow-xl shadow-slate-200/50 rounded-[2rem] p-4 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          
          {/* Category */}
          <div className="relative">
            <DropdownButton type="category" list={props.selectedCategories} label="หมวดหมู่สินค้า" />
            <DropdownContent type="category" options={props.categories} selected={props.selectedCategories} setSelected={props.setSelectedCategories} />
          </div>

          {/* Room */}
          <div className="relative">
            <DropdownButton type="room" list={props.selectedRooms} label="ห้อง" />
            <DropdownContent type="room" options={props.rooms} selected={props.selectedRooms} setSelected={props.setSelectedRooms} />
          </div>

          {/* Feature */}
          <div className="relative">
            <DropdownButton type="feature" list={props.selectedFeatures} label="คุณสมบัติเพิ่มเติม" />
            <DropdownContent type="feature" options={props.features} selected={props.selectedFeatures} setSelected={props.setSelectedFeatures} />
          </div>

          {/* Price */}
          <div className="flex items-center gap-2 bg-white rounded-full px-5 py-2 focus-within:ring-2 ring-[#148F96]/30 transition-all border border-gray-200 shadow-sm">
            <span className="text-sm font-bold text-slate-500">ราคา:</span>
            <input type="number" placeholder="ต่ำสุด" value={props.minPrice} onChange={(e) => props.setMinPrice(e.target.value)} className="w-20 text-sm outline-none bg-transparent text-center font-medium" min="0" />
            <span className="text-slate-300">-</span>
            <input type="number" placeholder="สูงสุด" value={props.maxPrice} onChange={(e) => props.setMaxPrice(e.target.value)} className="w-20 text-sm outline-none bg-transparent text-center font-medium" min="0" />
          </div>

          {/* Color */}
          <div className="relative">
            <DropdownButton type="color" list={props.selectedColors} label="สี" />
            <DropdownContent type="color" options={props.colors} selected={props.selectedColors} setSelected={props.setSelectedColors} renderItem={(opt: any) => (
              <div className="w-4 h-4 rounded-full border border-gray-300 shadow-inner" style={{ backgroundColor: getColorHex(opt.name) }}></div>
            )} />
          </div>

          {/* Material */}
          <div className="relative">
            <DropdownButton type="material" list={props.selectedMaterials} label="วัสดุ" />
            <DropdownContent type="material" options={props.materials} selected={props.selectedMaterials} setSelected={props.setSelectedMaterials} />
          </div>

          {/* Size */}
          <div className="relative">
            <DropdownButton type="size" list={props.selectedSizes} label="ขนาด" />
            <DropdownContent type="size" options={props.sizes} selected={props.selectedSizes} setSelected={props.setSelectedSizes} />
          </div>

          {/* Clear Filters */}
          {hasAnyFilter && (
            <button onClick={clearAllFilters} className="px-4 py-2 text-red-500 text-sm font-bold flex items-center gap-2 hover:bg-red-50 rounded-full transition-colors ml-auto lg:ml-0">
              <FilterX size={16} /> ล้าง
            </button>
          )}
        </div>
        
        {/* Search Bar */}
        <div className="flex flex-col items-end w-full lg:w-80 flex-shrink-0 mt-2 lg:mt-0">
          <div className="relative w-full group">
            <input type="text" placeholder="ค้นหาชื่อ รายละเอียด..." value={props.searchTerm} onChange={(e) => props.setSearchTerm(e.target.value)} className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 shadow-sm rounded-full focus:outline-none focus:ring-2 focus:ring-[#148F96]/50 transition-all text-sm font-medium" />
            <Search className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-[#148F96] transition-colors" size={18} />
          </div>
          {hasAnyFilter && (
            <div className="text-xs text-slate-500 mt-2 pr-2 font-medium">
              ค้นพบ <span className="text-[#148F96] font-bold text-sm">{props.filteredCount}</span> รายการ
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomeFilterBar;