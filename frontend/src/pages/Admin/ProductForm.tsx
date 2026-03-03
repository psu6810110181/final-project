// frontend/src/pages/Admin/ProductForm.tsx
import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
import { 
  createProduct, 
  updateProduct, 
  getAllCategories, type Category,
  getAllRooms, type Room,
  getAllFeatures, type Feature,
  getAllColors, type Color,
  getAllMaterials, type Material,
  getAllSizes, type Size
} from "../../services/api"; 

interface Variant {
  color: string;
  material: string;
  size: string;
  price: string;
  stock: string;
  imageUrl?: string;
  imageFile?: File; 
}

interface ProductFormProps {
  editingProductId: string | null;
  onCancel: () => void;
  onSuccess: () => void;
}

const ProductForm: React.FC<ProductFormProps> = ({ editingProductId, onCancel, onSuccess }) => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(""); 
  const [roomId, setRoomId] = useState(""); 
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]); 
  const [description, setDescription] = useState("");
  
  // State สำหรับเก็บไฟล์ของจริง
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // ใช้สำหรับ Preview รูป
  
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", material: "", size: "", price: "", stock: "" }
  ]);

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);       
  const [featuresList, setFeaturesList] = useState<Feature[]>([]);
  const [colorsList, setColorsList] = useState<Color[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [sizesList, setSizesList] = useState<Size[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [cats, rms, fts, cols, mats, szs] = await Promise.all([
          getAllCategories(), getAllRooms(), getAllFeatures(),
          getAllColors(), getAllMaterials(), getAllSizes()
        ]);
        setCategoriesList(cats); setRoomsList(rms); setFeaturesList(fts);
        setColorsList(cols); setMaterialsList(mats); setSizesList(szs);
      } catch (error) {
        console.error("Failed to fetch dropdown data", error);
      }
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (editingProductId) {
      fetchProductDetails(editingProductId);
    } else {
      resetForm();
    }
  }, [editingProductId]);

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const fetchProductDetails = async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`); 
      const productDetails = response.data;
      
      setName(productDetails.name || "");
      setPrice(String(productDetails.price || ""));
      setDescription(productDetails.description || "");
      
      // จัดการ URL รูปภาพเก่าที่ดึงมาจาก Backend
      let fetchedImageUrl = "";
      if (productDetails.image) {
         if (productDetails.image.startsWith('http')) {
             fetchedImageUrl = productDetails.image;
         } else if (!productDetails.image.startsWith('blob:')) {
             fetchedImageUrl = `${API_BASE_URL}/uploads/${productDetails.image}`;
         }
      }
      setImageUrl(fetchedImageUrl);
      
      setCategoryId(productDetails.category || "");
      setRoomId(productDetails.room || "");
      setSelectedFeatures(productDetails.features || []);

      if (productDetails.variants && productDetails.variants.length > 0) {
        setVariants(productDetails.variants.map((v: any) => ({
          color: v.color || "", material: v.material || "", size: v.size || "",
          price: String(v.price || ""), stock: String(v.stock || ""), imageUrl: v.image || "" 
        })));
      } else {
        setVariants([{ color: "", material: "", size: "", price: "", stock: "" }]);
      }
    } catch (error) {
      console.error("Error fetching product details:", error);
      alert("ไม่สามารถโหลดข้อมูลสินค้าเพื่อแก้ไขได้");
    }
  };

  const resetForm = () => {
    setName(""); setPrice(""); setDescription(""); 
    setImageUrl(""); setImageFile(null); 
    setCategoryId(""); setRoomId(""); setSelectedFeatures([]);
    setVariants([{ color: "", material: "", size: "", price: "", stock: "" }]);
  };

  const toggleFeature = (featureName: string) => {
    setSelectedFeatures(prev => prev.includes(featureName) ? prev.filter(f => f !== featureName) : [...prev, featureName]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        setImageFile(file); 
        setImageUrl(URL.createObjectURL(file)); 
    }
  };

  const handleVariantChange = (index: number, field: keyof Omit<Variant, 'imageFile'>, value: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleVariantImageUpload = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newVariants = [...variants];
      newVariants[index].imageFile = file;
      newVariants[index].imageUrl = URL.createObjectURL(file);
      setVariants(newVariants);
    }
  };

  const addVariant = () => setVariants([...variants, { color: "", material: "", size: "", price: "", stock: "", imageUrl: "" }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault(); 
    try {
      if (!name || !price || !categoryId) {
        alert("กรุณากรอกชื่อสินค้า, ราคา และเลือกหมวดหมู่");
        return;
      }
      
      const totalStock = variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
      
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', categoryId);
      formData.append('stock', String(totalStock));
      
      if (roomId) formData.append('room', roomId);
      if (description) formData.append('description', description);

      // แนบไฟล์รูปหลัก
      if (imageFile) {
         formData.append('image', imageFile);
      }

      // ✅ [เพิ่มใหม่] นำไฟล์ภาพของแต่ละ Variant ใส่เข้าไปใน FormData โดยใช้ key แบบมี index ต่อท้าย
      variants.forEach((variant, index) => {
          if (variant.imageFile) {
              formData.append(`variantImage_${index}`, variant.imageFile);
          }
      });

      // สำหรับ Array/Object หากส่งผ่าน FormData ต้องแปลงเป็น JSON String
      if (selectedFeatures.length > 0) {
          formData.append('features', JSON.stringify(selectedFeatures)); 
      }

      const formattedVariants = variants.map(v => ({ ...v, price: parseFloat(v.price), stock: parseInt(v.stock) }));
      formData.append('variants', JSON.stringify(formattedVariants));

      if (editingProductId) {
        await updateProduct(editingProductId, formData); 
        alert("แก้ไขสินค้าเรียบร้อยแล้ว");
      } else {
        await createProduct(formData); 
        alert("บันทึกสินค้าเรียบร้อยแล้ว");
      }
      onSuccess(); 
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // --- Design System Styles ---
  const colors = {
    primary: '#148F96', 
    primaryLight: '#E6F7F8',
    secondary: '#D65A31', 
    secondaryLight: '#FCE8E1',
    textMain: '#1F2937',
    textMuted: '#6B7280',
    border: '#E5E7EB',
    bgLight: '#F9FAFB',
    bgWhite: '#FFFFFF',
    danger: '#EF4444',
    dangerLight: '#FEF2F2',
  };

  const cardStyle: React.CSSProperties = {
    background: colors.bgWhite,
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
    border: `1px solid ${colors.border}`,
    marginBottom: '24px'
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '10px',
    border: `1px solid ${colors.border}`,
    fontSize: '15px',
    color: colors.textMain,
    backgroundColor: colors.bgLight,
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: colors.textMain,
    marginBottom: '8px'
  };

  return (
    <article style={{ maxWidth: '1000px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* 🚀 Semantic Header */}
      <header style={{ 
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
        padding: '24px 32px',
        borderRadius: '16px',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.border}`,
        borderLeft: `8px solid ${editingProductId ? colors.primary : colors.secondary}`,
        marginBottom: '28px',
        display: 'flex',
        alignItems: 'center',
        gap: '24px'
      }}>
        <div style={{
          width: '64px', height: '64px',
          background: editingProductId ? colors.primaryLight : colors.secondaryLight,
          borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '32px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', flexShrink: 0
        }} aria-hidden="true">
          {editingProductId ? '📝' : '✨'}
        </div>
        
        <div>
          <h2 id="form-main-heading" style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
            {editingProductId ? 'แก้ไขข้อมูลสินค้า' : 'เพิ่มสินค้าใหม่ลงในระบบ'}
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>
            {editingProductId
              ? 'อัปเดตรายละเอียด ราคา และตัวเลือกของสินค้านี้ให้เป็นปัจจุบัน'
              : 'กรอกข้อมูลรายละเอียดสินค้า รูปภาพ และตัวเลือกสินค้าให้ครบถ้วนเพื่อนำไปแสดงบนหน้าร้าน'}
          </p>
        </div>
      </header>

      {/* 🚀 Semantic Form */}
      <form onSubmit={handleConfirm} aria-labelledby="form-main-heading">
        
        {/* Section 1: ข้อมูลทั่วไป & รูปภาพ */}
        <section style={cardStyle} aria-labelledby="general-info-heading">
          <header style={{ borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 id="general-info-heading" style={{ margin: 0, fontSize: '18px', color: colors.textMain }}>📦 ข้อมูลทั่วไป</h3>
          </header>
          
          <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
            {/* อัปโหลดรูปภาพหลัก */}
            <div style={{ flex: '1 1 300px', maxWidth: '350px' }}>
              <label htmlFor="product-image" style={labelStyle}>รูปภาพหลักของสินค้า <span style={{color: colors.danger}} aria-label="จำเป็น">*</span></label>
              <input type="file" id="product-image" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
              <label htmlFor="product-image" style={{ cursor: 'pointer', display: 'block', width: '100%', aspectRatio: '1/1', borderRadius: '12px', overflow: 'hidden', border: imageUrl ? 'none' : `2px dashed #CBD5E1`, backgroundColor: colors.bgLight, transition: 'all 0.2s', position: 'relative' }}>
                {imageUrl ? (
                  <>
                    <img src={imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '500' }}>เปลี่ยนรูปภาพ</div>
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                    <p style={{ marginTop: '12px', fontSize: '15px', fontWeight: '500', color: colors.textMuted }}>อัปโหลดรูปภาพ</p>
                  </div>
                )}
              </label>
            </div>

            {/* ฟิลด์ข้อมูล */}
            <div style={{ flex: '2 1 400px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 2 }}>
                  <label htmlFor="product-name" style={labelStyle}>ชื่อสินค้า <span style={{color: colors.danger}} aria-label="จำเป็น">*</span></label>
                  <input id="product-name" placeholder="เช่น โซฟาผ้า รุ่น Cozy" value={name} onChange={e => setName(e.target.value)} required style={inputStyle} />
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="product-price" style={labelStyle}>ราคาเริ่มต้น (฿) <span style={{color: colors.danger}} aria-label="จำเป็น">*</span></label>
                  <input id="product-price" placeholder="0.00" type="number" value={price} onChange={e => setPrice(e.target.value)} required style={inputStyle} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor="product-category" style={labelStyle}>หมวดหมู่สินค้า <span style={{color: colors.danger}} aria-label="จำเป็น">*</span></label>
                  <select id="product-category" value={categoryId} onChange={e => setCategoryId(e.target.value)} required style={{...inputStyle, cursor: 'pointer'}}>
                    <option value="" disabled>-- เลือกหมวดหมู่ --</option>
                    {categoriesList.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                  </select>
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor="product-room" style={labelStyle}>หมวดหมู่ห้อง</label>
                  <select id="product-room" value={roomId} onChange={e => setRoomId(e.target.value)} style={{...inputStyle, cursor: 'pointer'}}>
                    <option value="">-- เลือกห้อง --</option>
                    {roomsList.map(room => <option key={room.id} value={room.name}>{room.name}</option>)}
                  </select>
                </div>
              </div>
              
              {/* 🚀 Semantic Fieldset สำหรับ Checkbox Group */}
              <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
                <legend style={labelStyle}>✨ คุณสมบัติพิเศษ</legend>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', padding: '12px', background: colors.bgLight, borderRadius: '10px', border: `1px solid ${colors.border}` }}>
                  {featuresList.map(feat => {
                    const isSelected = selectedFeatures.includes(feat.name);
                    return (
                      <label key={feat.id} style={{ 
                        display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', 
                        background: isSelected ? colors.primaryLight : colors.bgWhite, 
                        color: isSelected ? colors.primary : colors.textMuted,
                        border: `1px solid ${isSelected ? colors.primary : colors.border}`,
                        padding: '6px 14px', borderRadius: '30px', fontSize: '13px', fontWeight: isSelected ? '600' : '400',
                        transition: 'all 0.2s', userSelect: 'none'
                      }}>
                        <input type="checkbox" checked={isSelected} onChange={() => toggleFeature(feat.name)} style={{ display: 'none' }} />
                        {isSelected && <span style={{ fontSize: '14px' }} aria-hidden="true">✓</span>}
                        {feat.name}
                      </label>
                    );
                  })}
                  {featuresList.length === 0 && <span style={{color: '#999', fontSize: '13px'}}>ไม่มีข้อมูลคุณสมบัติในระบบ</span>}
                </div>
              </fieldset>
            </div>
          </div>
        </section>

        {/* Section 2: รายละเอียด */}
        <section style={cardStyle} aria-labelledby="details-heading">
          <header style={{ marginBottom: '16px' }}>
            <h3 id="details-heading" style={{ margin: 0, fontSize: '18px', color: colors.textMain }}>📝 รายละเอียดสินค้า</h3>
          </header>
          <label htmlFor="product-description" className="sr-only" style={{ display: 'none' }}>รายละเอียดสินค้า</label>
          <textarea 
            id="product-description"
            placeholder="อธิบายจุดเด่น วัสดุ ขนาด หรือวิธีการดูแลรักษา..." 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} 
          />
        </section>

        {/* Section 3: ตัวเลือกสินค้า (Variants) */}
        <section style={cardStyle} aria-labelledby="variants-heading">
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${colors.border}`, paddingBottom: '12px', marginBottom: '20px' }}>
            <h3 id="variants-heading" style={{ margin: 0, fontSize: '18px', color: colors.textMain }}>⚙️ จัดการตัวเลือกสินค้า (Variants)</h3>
            <span style={{ fontSize: '13px', color: colors.textMuted, background: colors.bgLight, padding: '4px 10px', borderRadius: '20px' }}>
              ทั้งหมด {variants.length} รายการ
            </span>
          </header>
          
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {variants.map((variant, index) => (
              <li key={index} style={{ display: 'flex', gap: '16px', alignItems: 'center', background: colors.bgWhite, padding: '16px', borderRadius: '12px', border: `1px solid ${colors.border}`, position: 'relative', flexWrap: 'wrap' }}>
                
                <div style={{ position: 'absolute', top: '-10px', left: '16px', background: colors.textMain, color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }} aria-hidden="true">
                  ตัวเลือกที่ {index + 1}
                </div>

                <div style={{ width: '80px', height: '80px', flexShrink: 0 }}>
                  <input type="file" id={`variant-image-${index}`} accept="image/*" style={{ display: 'none' }} onChange={e => handleVariantImageUpload(index, e)} />
                  <label htmlFor={`variant-image-${index}`} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', borderRadius: '8px', border: variant.imageUrl ? 'none' : `1px dashed #CBD5E1`, backgroundColor: colors.bgLight, overflow: 'hidden' }}>
                    {variant.imageUrl ? (
                      <img src={variant.imageUrl} alt={`รูปตัวเลือกที่ ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                        <span style={{ fontSize: '10px', color: '#94A3B8', marginTop: '4px' }}>เพิ่มรูป</span>
                      </>
                    )}
                  </label>
                </div>
                
                <div style={{ display: 'flex', flex: 1, gap: '12px', minWidth: '300px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`variant-color-${index}`} style={{...labelStyle, fontSize: '12px', color: colors.textMuted}}>สี</label>
                    <select id={`variant-color-${index}`} value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} style={{...inputStyle, padding: '10px'}}>
                      <option value="">-- สี --</option>
                      {colorsList.map(color => <option key={color.id} value={color.name}>{color.name}</option>)}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label htmlFor={`variant-material-${index}`} style={{...labelStyle, fontSize: '12px', color: colors.textMuted}}>วัสดุ</label>
                    <select id={`variant-material-${index}`} value={variant.material} onChange={e => handleVariantChange(index, 'material', e.target.value)} style={{...inputStyle, padding: '10px'}}>
                      <option value="">-- วัสดุ --</option>
                      {materialsList.map(material => <option key={material.id} value={material.name}>{material.name}</option>)}
                    </select>
                  </div>

                  <div style={{ flex: 1 }}>
                    <label htmlFor={`variant-size-${index}`} style={{...labelStyle, fontSize: '12px', color: colors.textMuted}}>ขนาด</label>
                    <select id={`variant-size-${index}`} value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} style={{...inputStyle, padding: '10px'}}>
                      <option value="">-- ขนาด --</option>
                      {sizesList.map(size => <option key={size.id} value={size.name}>{size.name}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px', width: '220px' }}>
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`variant-price-${index}`} style={{...labelStyle, fontSize: '12px', color: colors.textMuted}}>ราคา (฿)</label>
                    <input id={`variant-price-${index}`} placeholder="0" type="number" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{...inputStyle, padding: '10px'}} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label htmlFor={`variant-stock-${index}`} style={{...labelStyle, fontSize: '12px', color: colors.textMuted}}>คลัง (ชิ้น)</label>
                    <input id={`variant-stock-${index}`} placeholder="0" type="number" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{...inputStyle, padding: '10px'}} />
                  </div>
                </div>

                {variants.length > 1 ? (
                  <button type="button" onClick={() => removeVariant(index)} style={{ background: colors.dangerLight, color: colors.danger, border: 'none', cursor: 'pointer', borderRadius: '8px', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '22px' }} aria-label={`ลบตัวเลือกที่ ${index + 1}`} title="ลบตัวเลือกนี้">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                  </button>
                ) : (
                  <div style={{ width: '40px', marginTop: '22px' }} aria-hidden="true"></div>
                )}
              </li>
            ))}
          </ul>

          <button type="button" onClick={addVariant} style={{ marginTop: '20px', width: '100%', background: '#F0F9FF', color: '#0284C7', border: '1px dashed #7DD3FC', padding: '14px', cursor: 'pointer', borderRadius: '10px', fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            เพิ่มตัวเลือกสินค้า
          </button>
        </section>

        {/* 🚀 Semantic Footer (Action Buttons) */}
        <footer style={{ display: "flex", justifyContent: "flex-end", gap: "16px", padding: '10px 0 40px 0' }}>
          {editingProductId && (
            <button type="button" onClick={onCancel} style={{ padding: "14px 28px", background: colors.bgWhite, color: colors.textMain, border: `1px solid ${colors.border}`, borderRadius: "10px", cursor: "pointer", fontSize: "15px", fontWeight: "600" }}>
              ยกเลิก
            </button>
          )}
          <button type="submit" style={{ padding: "14px 32px", background: editingProductId ? colors.primary : colors.secondary, color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: "16px", fontWeight: "600", boxShadow: '0 4px 12px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            {editingProductId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มสินค้า'}
          </button>
        </footer>

      </form>
    </article>
  );
};

export default ProductForm;