import React, { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { type Promotion, type Product } from "../../services/api";
import { Target, Zap, CalendarDays, ShoppingBag, AlertTriangle, ChevronDown, Check } from "lucide-react"; // ✅ นำเข้า Icons

interface PromotionFormProps {
  formData: any;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
  editingPromotion: Promotion | null;
  products: Product[];
  promotions: Promotion[];
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  formatDateTimeLocal: (dateString: string | undefined) => string;
  getMinDateTimeLocal: (dateString: string) => string;
  colors: any;
  openDiscountDropdown: boolean; // คงไว้เพื่อไม่ให้ Props Error
  setOpenDiscountDropdown: (open: boolean) => void; // คงไว้เพื่อไม่ให้ Props Error
  validateSelectedProducts: (type: string, value: string) => boolean;
  handleProductToggle: (id: string) => void;
}

// ✅ Component สำหรับสร้าง Dropdown สไตล์สวยงาม (ไม่มีช่องค้นหา)
const SimpleDropdown = ({ value, onChange, options, placeholder, colors }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = options.find((o: any) => o.value === value)?.label || placeholder;

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: colors.bgWhite, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none', color: colors.textMain }}
      >
        <span style={{ color: value ? colors.textMain : colors.textMuted }}>{selectedLabel}</span>
        <ChevronDown size={16} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', color: colors.textMuted }} />
      </div>
      {isOpen && (
        <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, marginTop: '6px', backgroundColor: colors.bgWhite, border: `1px solid ${colors.border}`, borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, padding: '8px', maxHeight: '250px', overflowY: 'auto' }}>
          {options.map((opt: any) => {
            const isSelected = value === opt.value;
            return (
              <div
                key={opt.value}
                onClick={() => { onChange(opt.value); setIsOpen(false); }}
                style={{ padding: '10px 12px', cursor: 'pointer', fontSize: '14px', color: isSelected ? colors.primary : colors.textMain, backgroundColor: isSelected ? colors.primaryLight : 'transparent', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px', fontWeight: isSelected ? '600' : '500', transition: 'all 0.1s' }}
                onMouseOver={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = colors.bgLight; }}
                onMouseOut={(e) => { if(!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
              >
                {opt.label}
                {isSelected && <Check size={16} color={colors.primary} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


const PromotionForm: React.FC<PromotionFormProps> = ({
  formData, setFormData, editingPromotion, products, promotions, 
  handleSubmit, resetForm, formatDateTimeLocal, getMinDateTimeLocal, 
  colors, validateSelectedProducts, handleProductToggle
}) => {

  const discountOptions = [
    { value: 'PERCENTAGE', label: 'เปอร์เซ็นต์ (%)' },
    { value: 'FIXED_AMOUNT', label: 'จำนวนเงินคงที่ (บาท)' }
  ];

  const seasonOptions = [
    { value: 'SUMMER', label: 'Summer (ฤดูร้อน)' },
    { value: 'WINTER', label: 'Winter (ฤดูหนาว)' },
    { value: 'SPRING', label: 'Spring (ฤดูใบไม้ผลิ)' },
    { value: 'AUTUMN', label: 'Autumn (ฤดูใบไม้ร่วง)' }
  ];

  return (
    <article style={{ maxWidth: '800px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      <header style={{ 
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
        padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`,
        marginBottom: '28px'
      }}>
        <h2 style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>
          {editingPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
        </h2>
      </header>

      <form onSubmit={handleSubmit} style={{ background: colors.bgWhite, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
        <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          
          {/* ชื่อโปรโมชั่น */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
              ชื่อโปรโมชั่น *
            </label>
            {formData.isFlashSale ? (
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                placeholder="เช่น Flash Sale ลดราคา 20%"
              />
            ) : (
              <div>
                {/* ✅ เรียกใช้ SimpleDropdown สำหรับเลือกฤดูกาล */}
                <SimpleDropdown 
                  value={formData.season}
                  onChange={(val: string) => {
                    const seasonOption = seasonOptions.find(opt => opt.value === val);
                    setFormData({ ...formData, season: val, title: seasonOption ? seasonOption.label : '' });
                  }}
                  options={seasonOptions}
                  placeholder="เลือกฤดูกาล..."
                  colors={colors}
                />
                <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '8px' }}>
                  ชื่อโปรโมชั่นจะถูกกำหนดอัตโนมัติตามฤดูกาลที่เลือก
                </div>
              </div>
            )}
          </div>

          {/* ประเภทส่วนลด */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>ประเภทส่วนลด *</label>
            {/* ✅ เรียกใช้ SimpleDropdown สำหรับเลือกประเภทส่วนลด */}
            <SimpleDropdown 
              value={formData.discountType}
              onChange={(val: string) => {
                if (!validateSelectedProducts(val, formData.discountValue)) return;
                setFormData({...formData, discountType: val});
              }}
              options={discountOptions}
              placeholder="เลือกประเภทส่วนลด..."
              colors={colors}
            />
          </div>

          {/* มูลค่าส่วนลด */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>มูลค่าส่วนลด *</label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => {
                const value = e.target.value;
                if (formData.discountType === 'PERCENTAGE' && Number(value) > 90) {
                  toast.error('ส่วนลดสูงสุดคือ 90%');
                  return;
                }
                if (!validateSelectedProducts(formData.discountType, value)) return;
                setFormData({...formData, discountValue: value});
              }}
              style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
              placeholder={formData.discountType === 'PERCENTAGE' ? 'เช่น 20 (สูงสุด 90%)' : 'เช่น 1000'}
              min="0"
              max={formData.discountType === 'PERCENTAGE' ? 90 : undefined}
              step={formData.discountType === 'PERCENTAGE' ? '0.01' : '1'}
            />
          </div>

          {/* ประเภทโปรโมชั่น */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
              <Target size={18} color={colors.textMain} /> ประเภทโปรโมชั่น
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setFormData({...formData, isFlashSale: true})}
                style={{ flex: 1, padding: '12px 16px', border: `2px solid ${formData.isFlashSale ? colors.secondary : colors.border}`, borderRadius: '8px', background: formData.isFlashSale ? colors.secondaryLight : colors.bgWhite, color: formData.isFlashSale ? colors.secondary : colors.textMuted, cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <Zap size={18} /> Flash Sale
              </button>
              <button
                type="button"
                onClick={() => setFormData({...formData, isFlashSale: false})}
                style={{ flex: 1, padding: '12px 16px', border: `2px solid ${!formData.isFlashSale ? colors.primary : colors.border}`, borderRadius: '8px', background: !formData.isFlashSale ? colors.primaryLight : colors.bgWhite, color: !formData.isFlashSale ? colors.primary : colors.textMuted, cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}
              >
                <CalendarDays size={18} /> Seasonal
              </button>
            </div>
          </div>

          {/* รายการสินค้าที่เลือก */}
          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
              <ShoppingBag size={18} color={colors.textMain} /> เลือกสินค้าที่เข้าร่วมโปรโมชั่น
            </label>
            <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto', backgroundColor: colors.bgWhite }}>
              <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px', fontWeight: '500' }}>เลือกสินค้า (เลือกแล้ว {formData.productIds.length} ชิ้น)</div>
              {products.length === 0 ? (
                <div style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: '14px' }}>ไม่มีสินค้าในระบบ...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {products.map((product) => {
                    const activePromoForThisProduct = promotions.find(promo => promo.isActive && promo.id !== editingPromotion?.id && promo.products?.some(p => p.id === product.id));
                    const isAlreadyInOtherPromo = !!activePromoForThisProduct;

                    return (
                      <label 
                        key={product.id} 
                        style={{ display: 'flex', alignItems: 'flex-start', cursor: isAlreadyInOtherPromo ? 'not-allowed' : 'pointer', padding: '10px', borderRadius: '8px', backgroundColor: isAlreadyInOtherPromo ? colors.dangerLight : (formData.productIds.includes(product.id) ? colors.primaryLight : 'transparent'), border: `1px solid ${isAlreadyInOtherPromo ? '#FECACA' : (formData.productIds.includes(product.id) ? colors.primary : 'transparent')}`, transition: 'all 0.2s' }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={() => !isAlreadyInOtherPromo && handleProductToggle(product.id)}
                          disabled={isAlreadyInOtherPromo}
                          style={{ marginRight: '10px', marginTop: '4px', accentColor: colors.primary, width: '16px', height: '16px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: isAlreadyInOtherPromo ? colors.danger : colors.textMain }}>{product.name}</div>
                          <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>฿{Number(product.price).toLocaleString()}</div>
                          {isAlreadyInOtherPromo && (
                            <div style={{ marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: colors.danger, color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '4px 8px', borderRadius: '6px' }}>
                              <AlertTriangle size={12} /> ติดโปรโมชั่น: {activePromoForThisProduct.title}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* วันเริ่มต้น / สิ้นสุด */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>เริ่มต้น *</label>
            <input type="datetime-local" value={formatDateTimeLocal(formData.startDate)} onChange={(e) => setFormData({...formData, startDate: e.target.value})} min={formData.startDate ? getMinDateTimeLocal(formData.startDate) : formatDateTimeLocal(new Date().toISOString())} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>สิ้นสุด *</label>
            <input type="datetime-local" value={formatDateTimeLocal(formData.endDate)} onChange={(e) => setFormData({...formData, endDate: e.target.value})} min={formatDateTimeLocal(formData.startDate)} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>รายละเอียดโปรโมชั่น</label>
          <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '12px 16px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', minHeight: '100px', outline: 'none', resize: 'vertical' }} placeholder="รายละเอียดเพิ่มเติม..." />
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button type="button" onClick={resetForm} style={{ padding: '12px 24px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: colors.bgWhite, color: colors.textMuted, cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s' }}>ยกเลิก</button>
          <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: colors.primary, color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600', transition: 'all 0.2s', boxShadow: '0 4px 10px rgba(20, 143, 150, 0.3)' }}>{editingPromotion ? 'อัปเดตโปรโมชั่น' : 'สร้างโปรโมชั่น'}</button>
        </div>
      </form>
    </article>
  );
};

export default PromotionForm;