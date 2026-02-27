// ProductForm.tsx
import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
import { 
  createProduct, 
  getAllCategories, type Category,
  getAllRooms, type Room,
  getAllFeatures, type Feature
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
  const [imageUrl, setImageUrl] = useState("");
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", material: "", size: "", price: "", stock: "" }
  ]);

  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);       
  const [featuresList, setFeaturesList] = useState<Feature[]>([]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const [cats, rms, fts] = await Promise.all([
          getAllCategories(), getAllRooms(), getAllFeatures()
        ]);
        setCategoriesList(cats); setRoomsList(rms); setFeaturesList(fts);
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

  const fetchProductDetails = async (id: string) => {
    try {
      const response = await api.get(`/products/${id}`); 
      const productDetails = response.data;
      
      setName(productDetails.name || "");
      setPrice(String(productDetails.price || ""));
      setDescription(productDetails.description || "");
      setImageUrl(productDetails.image || "");
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
    setName(""); setPrice(""); setDescription(""); setImageUrl("");
    setCategoryId(""); setRoomId(""); setSelectedFeatures([]);
    setVariants([{ color: "", material: "", size: "", price: "", stock: "" }]);
  };

  const toggleFeature = (featureName: string) => {
    setSelectedFeatures(prev => prev.includes(featureName) ? prev.filter(f => f !== featureName) : [...prev, featureName]);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageUrl(URL.createObjectURL(file));
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
      const payload = {
        name, stock: totalStock, price: parseFloat(price),
        category: categoryId, room: roomId, features: selectedFeatures,   
        description, image: imageUrl,
        variants: variants.map(v => ({ ...v, price: parseFloat(v.price), stock: parseInt(v.stock) }))
      };

      if (editingProductId) {
        await api.patch(`/products/${editingProductId}`, payload);
        alert("แก้ไขสินค้าเรียบร้อยแล้ว");
      } else {
        await createProduct(payload);
        alert("บันทึกสินค้าเรียบร้อยแล้ว");
      }
      onSuccess(); 
    } catch (error) {
      console.error("Error saving product:", error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  return (
    <>
      <header>
        <h2 style={{ marginBottom: '20px', color: editingProductId ? '#3a9e9e' : '#333' }}>
          {editingProductId ? '✏️ แก้ไขข้อมูลสินค้า' : '➕ เพิ่มสินค้าใหม่'}
        </h2>
      </header>

      {/*ใช้ <form> เพื่อให้เป็น Semantic Form ที่ถูกต้อง */}
      <form onSubmit={handleConfirm}>
        
        <div className="product-form">
          <div className="image-upload">
            <input type="file" id="product-image" accept="image/*" style={{ display: 'none' }} onChange={handleImageChange} />
            <label htmlFor="product-image" style={{ cursor: 'pointer', display: 'block', width: '100%', height: '100%' }}>
              {imageUrl ? (
                <img src={imageUrl} alt="preview" className="preview-img" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
              ) : (
                <div className="upload-placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', minHeight: '200px', borderRadius: '8px', boxSizing: 'border-box' }}>
                  <span style={{ fontSize: '40px' }}>🖼️</span>
                  <p style={{ marginTop: '10px', color: '#888', fontSize: '20px' }}>คลิกเพื่ออัปโหลดรูปภาพ</p>
                </div>
              )}
            </label>
          </div>

          <div className="form-fields">
            <div className="row">
              <input placeholder="ชื่อสินค้า" value={name} onChange={e => setName(e.target.value)} required />
              <input placeholder="ราคาเริ่มต้น" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
            </div>
            <div className="row">
              <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="dropdown-input" required>
                <option value="">-- หมวดหมู่สินค้า --</option>
                {categoriesList.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
              </select>
              <select value={roomId} onChange={e => setRoomId(e.target.value)} className="dropdown-input">
                <option value="">-- หมวดหมู่ห้อง --</option>
                {roomsList.map(room => <option key={room.id} value={room.name}>{room.name}</option>)}
              </select>
            </div>
            
            <div className="features-container" style={{background: '#f8f8f8', padding: '15px', borderRadius: '15px', marginTop: '10px'}}>
              <label style={{fontWeight: 'bold', marginBottom: '10px', display: 'block', color: '#555'}}>คุณสมบัติพิเศษ:</label>
              <div style={{display: 'flex', flexWrap: 'wrap', gap: '15px'}}>
                {featuresList.map(feat => (
                  <label key={feat.id} style={{display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', background: 'white', padding: '5px 10px', borderRadius: '10px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)'}}>
                    <input type="checkbox" checked={selectedFeatures.includes(feat.name)} onChange={() => toggleFeature(feat.name)} />
                    <span style={{fontSize: '14px'}}>{feat.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="description-section">
          <textarea className="full-textarea" placeholder="รายละเอียดสินค้า" value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <section className="variants-section" style={{ marginTop: '20px' }}>
          <h3>ตัวเลือกสินค้า (สี, วัสดุ, ขนาด, รูปภาพ)</h3>
          {variants.map((variant, index) => (
            <article key={index} className="variant-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px', alignItems: 'center' }}>
              <div style={{ width: '100px', height: '100px', border: '1px dashed #ccc', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#f9f9f9', flexShrink: 0 }}>
                <input type="file" id={`variant-image-${index}`} accept="image/*" style={{ display: 'none' }} onChange={e => handleVariantImageUpload(index, e)} />
                <label htmlFor={`variant-image-${index}`} style={{ cursor: 'pointer', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                  {variant.imageUrl ? (
                    <img src={variant.imageUrl} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <>
                      <span style={{ fontSize: '20px' }}>🖼️</span>
                      <span style={{ fontSize: '10px', color: '#888', marginTop: '4px', textAlign: 'center' }}>เพิ่มรูป</span>
                    </>
                  )}
                </label>
              </div>
              <input placeholder="สี" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} style={{ flex: 1 }} />
              <input placeholder="วัสดุ" value={variant.material} onChange={e => handleVariantChange(index, 'material', e.target.value)} style={{ flex: 1 }} />
              <input placeholder="ขนาด" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} style={{ flex: 1 }} />
              <input placeholder="ราคา" type="number" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{ width: '80px' }} />
              <input placeholder="จำนวน" type="number" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{ width: '80px' }} />

              {variants.length > 1 && (
                <button type="button" onClick={() => removeVariant(index)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', width: '30px', height: '30px', flexShrink: 0 }}>X</button>
              )}
            </article>
          ))}
          <button type="button" onClick={addVariant} style={{ background: '#4CAF50', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>+ เพิ่มตัวเลือก</button>
        </section>

        <div style={{ marginTop: "25px", textAlign: "center", display: "flex", justifyContent: "center", gap: "10px" }}>
          {editingProductId && (
            <button type="button" onClick={onCancel} style={{ padding: "10px 20px", background: "#aaa", color: "white", border: "none", borderRadius: "8px", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>
              ยกเลิกการแก้ไข
            </button>
          )}
          <button type="submit" className="confirm-btn" style={{ background: editingProductId ? '#3a9e9e' : undefined }}>
            {editingProductId ? 'บันทึกการแก้ไข' : 'ยืนยันการเพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </>
  );
};

export default ProductForm;