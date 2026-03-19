import React from "react";
import toast from 'react-hot-toast';
import { SearchableSelect, MultiSearchableSelect } from './SearchableDropdown';
import { Package, Sparkles, FileText, ImagePlus } from 'lucide-react'; // ✅ นำเข้า Icons

interface ProductGeneralInfoProps {
  name: string; setName: (v: string) => void;
  price: string; setPrice: (v: string) => void;
  description: string; setDescription: (v: string) => void;
  imageUrl: string; handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  selectedCategory: string; setSelectedCategory: (v: string) => void;
  selectedRoom: string; setSelectedRoom: (v: string) => void;
  selectedMainColor: string; setSelectedMainColor: (v: string) => void;
  selectedMainMaterial: string; setSelectedMainMaterial: (v: string) => void;
  selectedMainSize: string; setSelectedMainSize: (v: string) => void;
  mainStock: string; setMainStock: (v: string) => void;
  selectedFeatures: string[]; setSelectedFeatures: React.Dispatch<React.SetStateAction<string[]>>;
  categoriesList: any[]; roomsList: any[]; colorsList: any[];
  materialsList: any[]; sizesList: any[]; featuresList: any[];
}

const ProductGeneralInfo: React.FC<ProductGeneralInfoProps> = (props) => {

  const handleMainStockChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '') {
      props.setMainStock('');
      return;
    }
    const num = parseInt(val, 10);
    if (num < 0) {
      toast.error('จำนวนสินค้าต่ำสุดคือ 0 ชิ้น');
      props.setMainStock('0');
    } else {
      props.setMainStock(num.toString());
    }
  };

  const colors = { textMain: '#1F2937', textMuted: '#6B7280', border: '#E5E7EB', bgLight: '#F9FAFB', bgWhite: '#FFFFFF', danger: '#EF4444', primary: '#148F96', primaryLight: '#E6F7F8' };
  const cardStyle: React.CSSProperties = { background: colors.bgWhite, borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: `1px solid ${colors.border}`, marginBottom: '24px' };
  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.border}`, fontSize: '15px', color: colors.textMain, backgroundColor: colors.bgLight, outline: 'none' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '14px', fontWeight: '600', color: colors.textMain, marginBottom: '8px' };

  return (
    <>
      <section style={cardStyle}>
        <header style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={20} color={colors.primary} /> ข้อมูลทั่วไป
          </h3>
        </header>
        
        <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          {/* รูปภาพหลัก */}
          <div style={{ flex: '0 0 200px', maxWidth: '200px' }}>
            <label style={labelStyle}>รูปภาพหลัก <span style={{color: colors.danger}}>*</span></label>
            <input type="file" id="product-image" accept="image/*" style={{ display: 'none' }} onChange={props.handleImageChange} />
            <label htmlFor="product-image" style={{ cursor: 'pointer', display: 'block', width: '200px', height: '200px', borderRadius: '12px', overflow: 'hidden', border: props.imageUrl ? 'none' : `2px dashed #CBD5E1`, backgroundColor: colors.bgLight, position: 'relative' }}>
              {props.imageUrl ? (
                <img src={props.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8', gap: '8px' }}>
                  <ImagePlus size={28} />
                  <span style={{ fontSize: '13px', fontWeight: '500' }}>อัปโหลดรูปภาพ</span>
                </div>
              )}
            </label>
          </div>

          <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* ชื่อและราคา */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>ชื่อสินค้า <span style={{color: colors.danger}}>*</span></label>
                <input placeholder="เช่น โซฟาผ้า" value={props.name} onChange={e => props.setName(e.target.value)} required style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>ราคาเริ่มต้น (฿) <span style={{color: colors.danger}}>*</span></label>
                <input type="number" min="0" value={props.price} onChange={e => props.setPrice(e.target.value)} required style={inputStyle} />
              </div>
            </div>

            {/* หมวดหมู่และห้อง */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>หมวดหมู่สินค้า <span style={{color: colors.danger}}>*</span></label>
                <SearchableSelect 
                  value={props.selectedCategory} 
                  onChange={props.setSelectedCategory} 
                  options={[
                    { value: "", label: "-- เลิกเลือก --" },
                    ...props.categoriesList.map(c => ({ value: c.name, label: c.name }))
                  ]} 
                  placeholder="ค้นหาหมวดหมู่..." 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>ห้อง</label>
                <SearchableSelect 
                  value={props.selectedRoom} 
                  onChange={props.setSelectedRoom} 
                  options={[
                    { value: "", label: "-- เลิกเลือก --" },
                    ...props.roomsList.map(r => ({ value: r.name, label: r.name }))
                  ]} 
                  placeholder="ค้นหาห้อง..." 
                />
              </div>
            </div>

            {/* คุณสมบัติหลัก */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>สีหลัก</label>
                <SearchableSelect 
                  value={props.selectedMainColor} 
                  onChange={props.setSelectedMainColor} 
                  options={[{ value: "", label: "-- เลิกเลือก --" }, ...props.colorsList.map(c => ({ value: c.name, label: c.name }))]} 
                  placeholder="ค้นหาสี..." 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>วัสดุหลัก</label>
                <SearchableSelect 
                  value={props.selectedMainMaterial} 
                  onChange={props.setSelectedMainMaterial} 
                  options={[{ value: "", label: "-- เลิกเลือก --" }, ...props.materialsList.map(m => ({ value: m.name, label: m.name }))]} 
                  placeholder="ค้นหาวัสดุ..." 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>ขนาดหลัก</label>
                <SearchableSelect 
                  value={props.selectedMainSize} 
                  onChange={props.setSelectedMainSize} 
                  options={[{ value: "", label: "-- เลิกเลือก --" }, ...props.sizesList.map(s => ({ value: s.name, label: s.name }))]} 
                  placeholder="ค้นหาขนาด..." 
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>คลังหลัก</label>
                <input type="number" min="0" value={props.mainStock} onChange={handleMainStockChange} style={{...inputStyle, padding: '10px 16px', height: '44px'}} />
              </div>
            </div>

            {/* Features */}
            <div>
              <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Sparkles size={16} color="#F59E0B" /> คุณสมบัติพิเศษ
              </label>
              <MultiSearchableSelect 
                values={props.selectedFeatures} 
                onChange={props.setSelectedFeatures} 
                options={props.featuresList.map(f => ({ value: f.name, label: f.name }))} 
                placeholder="ค้นหาคุณสมบัติพิเศษ (เลือกได้หลายอัน)..." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section style={cardStyle}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: colors.textMain, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={20} color={colors.textMuted} /> รายละเอียดสินค้า
        </h3>
        <textarea placeholder="อธิบายจุดเด่น วัสดุ ขนาด..." value={props.description} onChange={e => props.setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
      </section>
    </>
  );
};

export default ProductGeneralInfo;