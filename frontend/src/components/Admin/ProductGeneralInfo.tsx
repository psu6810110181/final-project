import React, { useState } from "react";
import toast from 'react-hot-toast'; // ✅ นำเข้า toast สำหรับแจ้งเตือน

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
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showMainColorDropdown, setShowMainColorDropdown] = useState(false);
  const [showMainMaterialDropdown, setShowMainMaterialDropdown] = useState(false);
  const [showMainSizeDropdown, setShowMainSizeDropdown] = useState(false);

  const toggleFeature = (featureName: string) => {
    props.setSelectedFeatures(prev => prev.includes(featureName) ? prev.filter(f => f !== featureName) : [...prev, featureName]);
  };

  // ✅ ฟังก์ชันจัดการการเปลี่ยนแปลงคลังหลัก (ป้องกันติดลบ)
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
          <h3 style={{ margin: 0, fontSize: '18px', color: colors.textMain }}>📦 ข้อมูลทั่วไป</h3>
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
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                  <span>+ อัปโหลดรูปภาพ</span>
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
                <div style={{ position: 'relative', ...inputStyle, padding: 0, cursor: 'pointer' }}>
                  <div onClick={() => setShowCategoryDropdown(!showCategoryDropdown)} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{props.selectedCategory || '-- เลือก --'}</span> <span>▼</span>
                  </div>
                  {showCategoryDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: `1px solid ${colors.border}`, zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                      {props.categoriesList.map(cat => (
                        <div key={cat.id} onClick={() => { props.setSelectedCategory(props.selectedCategory === cat.name ? "" : cat.name); setShowCategoryDropdown(false); }} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                          {cat.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>ห้อง</label>
                <div style={{ position: 'relative', ...inputStyle, padding: 0, cursor: 'pointer' }}>
                  <div onClick={() => setShowRoomDropdown(!showRoomDropdown)} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                    <span>{props.selectedRoom || '-- เลือก --'}</span> <span>▼</span>
                  </div>
                  {showRoomDropdown && (
                    <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: `1px solid ${colors.border}`, zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                      {props.roomsList.map(room => (
                        <div key={room.id} onClick={() => { props.setSelectedRoom(props.selectedRoom === room.name ? "" : room.name); setShowRoomDropdown(false); }} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                          {room.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* คุณสมบัติหลัก 4 ช่อง */}
            <div style={{ display: 'flex', gap: '16px' }}>
              {[ 
                { label: 'สีหลัก', val: props.selectedMainColor, set: props.setSelectedMainColor, list: props.colorsList, show: showMainColorDropdown, setShow: setShowMainColorDropdown },
                { label: 'วัสดุหลัก', val: props.selectedMainMaterial, set: props.setSelectedMainMaterial, list: props.materialsList, show: showMainMaterialDropdown, setShow: setShowMainMaterialDropdown },
                { label: 'ขนาดหลัก', val: props.selectedMainSize, set: props.setSelectedMainSize, list: props.sizesList, show: showMainSizeDropdown, setShow: setShowMainSizeDropdown }
              ].map((item, idx) => (
                <div key={idx} style={{ flex: 1 }}>
                  <label style={labelStyle}>{item.label}</label>
                  <div style={{ position: 'relative', ...inputStyle, padding: 0, cursor: 'pointer' }}>
                    <div onClick={() => item.setShow(!item.show)} style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.val || '-'}</span> <span>▼</span>
                    </div>
                    {item.show && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: 'white', border: `1px solid ${colors.border}`, zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                        {item.list.map(opt => (
                          <div key={opt.id} onClick={() => { item.set(item.val === opt.name ? "" : opt.name); item.setShow(false); }} style={{ padding: '8px 16px', cursor: 'pointer' }}>
                            {opt.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>คลังหลัก</label>
                {/* ✅ ผูก Event onChange และใส่ min="0" ป้องกันการติดลบ */}
                <input type="number" min="0" value={props.mainStock} onChange={handleMainStockChange} style={inputStyle} />
              </div>
            </div>

            {/* Features */}
            <div>
              <label style={labelStyle}>✨ คุณสมบัติพิเศษ</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '12px', background: colors.bgLight, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                {props.featuresList.map(feat => {
                  const isSelected = props.selectedFeatures.includes(feat.name);
                  return (
                    <label key={feat.id} style={{ display: 'flex', gap: '6px', cursor: 'pointer', background: isSelected ? colors.primaryLight : 'white', border: `1px solid ${isSelected ? colors.primary : colors.border}`, padding: '6px 14px', borderRadius: '30px', fontSize: '13px' }}>
                      <input type="checkbox" checked={isSelected} onChange={() => toggleFeature(feat.name)} style={{ display: 'none' }} />
                      {feat.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Description */}
      <section style={cardStyle}>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: colors.textMain }}>📝 รายละเอียดสินค้า</h3>
        <textarea placeholder="อธิบายจุดเด่น วัสดุ ขนาด..." value={props.description} onChange={e => props.setDescription(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
      </section>
    </>
  );
};

export default ProductGeneralInfo;