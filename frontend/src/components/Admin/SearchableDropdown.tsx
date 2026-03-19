import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder?: string;
}

// 📌 สำหรับเลือกแบบค่าเดียว (สี, วัสดุ, ขนาด, หมวดหมู่, ห้อง, ค้นหาสินค้า)
export const SearchableSelect: React.FC<SearchableSelectProps> = ({ value, onChange, options, placeholder = "เลือก..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

  return (
    <div ref={wrapperRef} className="relative w-full text-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-sm min-h-[44px]"
      >
        <span className={`truncate ${value ? "text-slate-800 font-bold" : "text-slate-400"}`}>{selectedLabel}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search size={16} className="text-slate-400 ml-1" />
            <input 
              autoFocus 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400" 
              placeholder="พิมพ์ค้นหา..." 
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-slate-400 text-center text-xs">ไม่พบข้อมูลที่ค้นหา</div>
            ) : (
              filteredOptions.map(o => (
                <div 
                  key={o.value} 
                  onClick={() => { onChange(o.value); setIsOpen(false); setSearch(''); }} 
                  className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${value === o.value ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                >
                  {o.label}
                  {value === o.value && <Check size={16} />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

interface MultiSearchableSelectProps {
  values: string[];
  onChange: (vals: string[]) => void;
  options: Option[];
  placeholder?: string;
}

// 📌 สำหรับเลือกแบบหลายค่า (Multi-select) เช่น "คุณสมบัติพิเศษ"
export const MultiSearchableSelect: React.FC<MultiSearchableSelectProps> = ({ values, onChange, options, placeholder = "เลือก..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()));
  
  const toggleValue = (val: string) => {
    if (values.includes(val)) onChange(values.filter(v => v !== val));
    else onChange([...values, val]);
  };

  const removeValue = (e: React.MouseEvent, val: string) => {
    e.stopPropagation();
    onChange(values.filter(v => v !== val));
  };

  return (
    <div ref={wrapperRef} className="relative w-full text-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-xl cursor-pointer hover:border-slate-300 transition-colors shadow-sm min-h-[44px]"
      >
        <div className="flex flex-wrap gap-1.5 items-center">
          {values.length === 0 ? (
            <span className="text-slate-400 ml-1">{placeholder}</span>
          ) : (
            values.map(val => {
              const label = options.find(o => o.value === val)?.label || val;
              return (
                <span key={val} className="flex items-center gap-1 bg-[#D65A31]/10 text-[#D65A31] px-2 py-1 rounded-lg text-xs font-bold border border-[#D65A31]/20">
                  {label}
                  <X size={12} className="cursor-pointer hover:text-rose-500" onClick={(e) => removeValue(e, val)} />
                </span>
              )
            })
          )}
        </div>
        <ChevronDown size={16} className={`text-slate-400 transition-transform flex-shrink-0 mr-1 ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1.5 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden">
          <div className="p-2 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
            <Search size={16} className="text-slate-400 ml-1" />
            <input 
              autoFocus 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400" 
              placeholder="พิมพ์ค้นหา..." 
            />
          </div>
          <div className="max-h-56 overflow-y-auto p-1">
            {filteredOptions.length === 0 ? (
              <div className="p-3 text-slate-400 text-center text-xs">ไม่พบข้อมูลที่ค้นหา</div>
            ) : (
              filteredOptions.map(o => {
                const isSelected = values.includes(o.value);
                return (
                  <div 
                    key={o.value} 
                    onClick={() => toggleValue(o.value)} 
                    className={`p-2.5 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${isSelected ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-slate-50 text-slate-700'}`}
                  >
                    {o.label}
                    {isSelected && <Check size={16} />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};