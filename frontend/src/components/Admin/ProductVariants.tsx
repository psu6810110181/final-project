import React, { useState } from "react";
import toast from 'react-hot-toast'; // ✅ นำเข้า toast สำหรับแจ้งเตือน

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
  const [colorDropdowns, setColorDropdowns] = useState<boolean[]>([]);
  const [materialDropdowns, setMaterialDropdowns] = useState<boolean[]>([]);
  const [sizeDropdowns, setSizeDropdowns] = useState<boolean[]>([]);

  // ✅ ปรับปรุง handleVariantChange เพื่อดักจับสต็อกติดลบ
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
                newVariants[index][field] = value; // ให้พิมพ์ทศนิยมได้
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
    setColorDropdowns([...colorDropdowns, false]);
    setMaterialDropdowns([...materialDropdowns, false]);
    setSizeDropdowns([...sizeDropdowns, false]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
    setColorDropdowns(colorDropdowns.filter((_, i) => i !== index));
    setMaterialDropdowns(materialDropdowns.filter((_, i) => i !== index));
    setSizeDropdowns(sizeDropdowns.filter((_, i) => i !== index));
  };

  const colors = { textMain: '#1F2937', textMuted: '#6B7280', border: '#E5E7EB', bgLight: '#F9FAFB', danger: '#EF4444' };
  const cardStyle: React.CSSProperties = { background: '#FFF', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}`, marginBottom: '24px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '15px', outline: 'none' };

  return (
    <section style={cardStyle}>
      <header style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
        <h3 style={{ margin: 0, fontSize: '18px' }}>⚙️ จัดการตัวเลือกสินค้า</h3>
        <span>ทั้งหมด {variants.length} รายการ</span>
      </header>

      <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {variants.map((variant, index) => (
          <li key={index} style={{ display: 'flex', gap: '16px', background: '#FFF', padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, flexWrap: 'wrap' }}>
            
            {/* รูปตัวเลือก */}
            <div style={{ width: '80px', height: '80px' }}>
              <input type="file" id={`variant-img-${index}`} style={{ display: 'none' }} onChange={e => handleImageUpload(index, e)} />
              <label htmlFor={`variant-img-${index}`} style={{ cursor: 'pointer', display: 'flex', width: '100%', height: '100%', borderRadius: '8px', border: `1px dashed #CBD5E1`, backgroundColor: colors.bgLight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                {variant.imageUrl ? <img src={variant.imageUrl} alt="variant" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{fontSize:'10px'}}>เพิ่มรูป</span>}
              </label>
            </div>

            {/* สี / วัสดุ / ขนาด */}
            <div style={{ display: 'flex', flex: 1, gap: '12px' }}>
              {[
                { label: 'สี', val: variant.color, field: 'color', list: colorsList, show: colorDropdowns[index], setShow: (v: boolean) => { const n = [...colorDropdowns]; n[index] = v; setColorDropdowns(n); } },
                { label: 'วัสดุ', val: variant.material, field: 'material', list: materialsList, show: materialDropdowns[index], setShow: (v: boolean) => { const n = [...materialDropdowns]; n[index] = v; setMaterialDropdowns(n); } },
                { label: 'ขนาด', val: variant.size, field: 'size', list: sizesList, show: sizeDropdowns[index], setShow: (v: boolean) => { const n = [...sizeDropdowns]; n[index] = v; setSizeDropdowns(n); } }
              ].map((item, idx) => (
                <div key={idx} style={{ flex: 1 }}>
                  <label style={{ fontSize: '12px', color: colors.textMuted }}>{item.label}</label>
                  <div style={{ position: 'relative', ...inputStyle, padding: 0, cursor: 'pointer' }}>
                    <div onClick={() => item.setShow(!item.show)} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.val || '-'}</span> <span>▼</span>
                    </div>
                    {item.show && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: `1px solid ${colors.border}`, zIndex: 10, maxHeight: '150px', overflowY: 'auto' }}>
                        {item.list.map(opt => (
                          <div key={opt.id} onClick={() => { handleVariantChange(index, item.field as any, item.val === opt.name ? "" : opt.name); item.setShow(false); }} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                            {opt.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* ราคา / สต็อก */}
            <div style={{ display: 'flex', gap: '12px', width: '220px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>ราคา</label>
                {/* ✅ เพิ่ม min="0" สำหรับราคา */}
                <input type="number" min="0" step="0.01" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{...inputStyle, padding: '10px'}} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontSize: '12px' }}>คลัง</label>
                {/* ✅ เพิ่ม min="0" สำหรับคลังสต็อก */}
                <input type="number" min="0" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{...inputStyle, padding: '10px'}} />
              </div>
            </div>

            {/* ปุ่มลบ */}
            {variants.length > 1 && (
              <button type="button" onClick={() => removeVariant(index)} style={{ background: '#FEF2F2', color: colors.danger, border: 'none', borderRadius: '8px', width: '40px', height: '40px', marginTop: '22px', cursor: 'pointer' }}>
                ❌
              </button>
            )}
          </li>
        ))}
      </ul>

      <button type="button" onClick={addVariant} style={{ marginTop: '20px', width: '100%', background: '#F0F9FF', color: '#0284C7', border: '1px dashed #7DD3FC', padding: '14px', borderRadius: '10px', cursor: 'pointer' }}>
        + เพิ่มตัวเลือกสินค้า
      </button>
    </section>
  );
};

export default ProductVariants;