import React from "react";
import toast from 'react-hot-toast';
import { SearchableSelect } from './SearchableDropdown';
import { Settings2, ImagePlus, Trash2, Plus } from 'lucide-react'; // ✅ นำเข้า Icons

export interface Variant {
  color: string; material: string; size: string;
  price: string; stock: string; imageUrl?: string;
  imageFile?: File; originalImage?: string;
}

interface ProductVariantsProps {
  variants: Variant[];
  setVariants: React.Dispatch<React.SetStateAction<Variant[]>>;
  colorsList: any[]; materialsList: any[]; sizesList: any[];
}

const ProductVariants: React.FC<ProductVariantsProps> = ({ variants, setVariants, colorsList, materialsList, sizesList }) => {

  const handleVariantChange = (index: number, field: keyof Omit<Variant, 'imageFile'>, value: string) => {
    const newVariants = [...variants];
    
    if (field === 'stock') {
        if (value === '') {
            newVariants[index][field] = '';
        } else {
            const num = parseInt(value, 10);
            if (num < 0) {
                toast.error('จำนวนสินค้าต่ำสุดคือ 0 ชิ้น');
                newVariants[index][field] = '0';
            } else {
                newVariants[index][field] = num.toString();
            }
        }
    } else if (field === 'price') {
         if (value === '') {
            newVariants[index][field] = '';
        } else {
            const num = parseFloat(value);
            if (num < 0) {
                toast.error('ราคาต้องไม่ติดลบ');
                newVariants[index][field] = '0';
            } else {
                newVariants[index][field] = value;
            }
        }
    } else {
        newVariants[index][field] = value;
    }
    
    setVariants(newVariants);
  };

  const handleImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newVariants = [...variants];
      newVariants[index].imageFile = file;
      newVariants[index].imageUrl = URL.createObjectURL(file);
      setVariants(newVariants);
    }
  };

  const addVariant = () => {
    setVariants([...variants, { color: "", material: "", size: "", price: "", stock: "", imageUrl: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const colors = { textMain: '#1F2937', textMuted: '#6B7280', border: '#E5E7EB', bgLight: '#F9FAFB', danger: '#EF4444' };
  const cardStyle: React.CSSProperties = { background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}`, marginBottom: '24px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '15px', outline: 'none' };

  return (
    <section style={cardStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', color: colors.textMain }}>
          <Settings2 size={20} color="#148F96" /> จัดการตัวเลือกสินค้า
        </h3>
        <span style={{ fontSize: '13px', fontWeight: '600', color: colors.textMuted, background: colors.bgLight, padding: '4px 10px', borderRadius: '20px' }}>
          ทั้งหมด {variants.length} รายการ
        </span>
      </header>

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {variants.map((variant, index) => (
          <li key={index} style={{ display: 'flex', gap: '16px', background: '#FFF', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, flexWrap: 'wrap', alignItems: 'center' }}>
            
            {/* รูปตัวเลือก */}
            <div style={{ width: '80px', height: '80px' }}>
              <input type="file" id={`variant-img-${index}`} style={{ display: 'none' }} onChange={e => handleImageUpload(index, e)} />
              <label htmlFor={`variant-img-${index}`} style={{ cursor: 'pointer', display: 'flex', width: '100%', height: '100%', borderRadius: '8px', border: `1px dashed #CBD5E1`, backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', color: '#94A3B8' }}>
                {variant.imageUrl ? (
                  <img src={variant.imageUrl} alt="variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                    <ImagePlus size={20} />
                  </div>
                )}
              </label>
            </div>

            {/* สี / วัสดุ / ขนาด */}
            <div style={{ display: 'flex', flex: 1, gap: '12px', minWidth: '300px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block', fontWeight: '600' }}>สี</label>
                <SearchableSelect 
                  value={variant.color} 
                  onChange={(val) => handleVariantChange(index, 'color', val)} 
                  options={[{ value: "", label: "-- เลิกเลือก --" }, ...colorsList.map(c => ({ value: c.name, label: c.name }))]} 
                  placeholder="เลือกสี..." 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block', fontWeight: '600' }}>วัสดุ</label>
                <SearchableSelect 
                  value={variant.material} 
                  onChange={(val) => handleVariantChange(index, 'material', val)} 
                  options={[{ value: "", label: "-- เลิกเลือก --" }, ...materialsList.map(m => ({ value: m.name, label: m.name }))]} 
                  placeholder="เลือกวัสดุ..." 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block', fontWeight: '600' }}>ขนาด</label>
                <SearchableSelect 
                  value={variant.size} 
                  onChange={(val) => handleVariantChange(index, 'size', val)} 
                  options={[{ value: "", label: "-- เลิกเลือก --" }, ...sizesList.map(s => ({ value: s.name, label: s.name }))]} 
                  placeholder="เลือกขนาด..." 
                />
              </div>
            </div>

            {/* ราคา / สต็อก */}
            <div style={{ display: 'flex', gap: '12px', width: '220px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block', fontWeight: '600' }}>ราคา</label>
                <input type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{...inputStyle, padding: '10px 14px', height: '44px'}} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '4px', display: 'block', fontWeight: '600' }}>คลัง</label>
                <input type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{...inputStyle, padding: '10px 14px', height: '44px'}} />
              </div>
            </div>

            {/* ปุ่มลบ */}
            {variants.length > 1 && (
              <button 
                type="button" 
                onClick={() => removeVariant(index)} 
                title="ลบตัวเลือก"
                style={{ 
                  background: '#FEF2F2', color: colors.danger, border: 'none', borderRadius: '8px', 
                  width: '40px', height: '44px', marginTop: '20px', cursor: 'pointer', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' 
                }}
              >
                <Trash2 size={18} />
              </button>
            )}
          </li>
        ))}
      </ul>

      {/* ปุ่มเพิ่มตัวเลือก */}
      <button 
        type="button" 
        onClick={addVariant} 
        style={{ 
          marginTop: '20px', width: '100%', background: '#F0F9FF', color: '#0284C7', 
          border: '1px dashed #7DD3FC', padding: '14px', borderRadius: '10px', cursor: 'pointer', 
          fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          transition: 'all 0.2s'
        }}
      >
        <Plus size={18} /> เพิ่มตัวเลือกสินค้า
      </button>
    </section>
  );
};

export default ProductVariants;