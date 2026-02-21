import React, { useState, useEffect } from "react";
import "./AdminDashboard.css";
// Import API
import { 
  createProduct, 
  getAllCategories, createCategory, type Category,
  getAllRooms, createRoom, type Room,
  getAllFeatures, createFeature, type Feature,
  getAllProducts, type Product
} from "../services/api";
import api from "../services/api"; // สำหรับ delete/update product

// Interface สำหรับ Variant
interface Variant {
  color: string;
  material: string;
  size: string;
  price: string;
  stock: string;
}

const AdminDashboard: React.FC = () => {
  // ---------------------------------------------------------
  //  State สำหรับควบคุมหน้าหลัก (เมนูขวา)
  // ---------------------------------------------------------
  const [activeView, setActiveView] = useState<'addProduct' | 'manageSystem' | 'manageOrders'>('addProduct');

  // State ข้อมูลหลัก
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState(""); 
  const [roomId, setRoomId] = useState(""); 
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]); 
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // State สำหรับ Master Data (List)
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);       
  const [featuresList, setFeaturesList] = useState<Feature[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);

  // State สำหรับสร้าง Master Data ใหม่
  const [newItemName, setNewItemName] = useState("");
  const [activeTab, setActiveTab] = useState<'category' | 'room' | 'feature'>('category'); 

  // State สำหรับ Edit Product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // State สำหรับ Variants
  const [variants, setVariants] = useState<Variant[]>([
    { color: "", material: "", size: "", price: "", stock: "" },
  ]);

  // Load Data on Mount
  useEffect(() => {
    fetchMasterData();
    fetchProducts();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, rms, fts] = await Promise.all([
        getAllCategories(),
        getAllRooms(),
        getAllFeatures()
      ]);
      setCategoriesList(cats);
      setRoomsList(rms);
      setFeaturesList(fts);
    } catch (error) {
      console.error("Failed to fetch master data", error);
    }
  };

  const fetchProducts = async () => {
    try {
      const products = await getAllProducts();
      setProductsList(products);
    } catch (error) {
      console.error("Failed to fetch products", error);
    }
  };

  const toggleFeature = (featureName: string) => {
    setSelectedFeatures(prev => 
      prev.includes(featureName) 
        ? prev.filter(f => f !== featureName) 
        : [...prev, featureName]              
    );
  };

  const handleAddMasterData = async () => {
    if (!newItemName.trim()) return;
    try {
      if (activeTab === 'category') {
        await createCategory(newItemName);
      } else if (activeTab === 'room') {
        await createRoom(newItemName);
      } else if (activeTab === 'feature') {
        await createFeature(newItemName);
      }
      
      setNewItemName(""); 
      fetchMasterData(); 
      alert(`เพิ่ม ${activeTab} สำเร็จ!`);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

  // ---- Delete Product ----
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("ยืนยันการลบสินค้านี้?")) return;
    try {
      await api.delete(`/products/${productId}`);
      alert("ลบสินค้าเรียบร้อยแล้ว");
      fetchProducts();
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("เกิดข้อผิดพลาดในการลบสินค้า");
    }
  };

  // ---- Open Edit Modal ----
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(String(product.price));
    setEditDescription(product.description || "");
    setEditImageUrl(product.image || "");
    setEditCategoryId(product.category || "");
    setIsEditModalOpen(true);
  };

  // ---- Save Edit ----
  const handleSaveEdit = async () => {
    if (!editingProduct) return;
    try {
      await api.patch(`/products/${editingProduct.id}`, {
        name: editName,
        price: parseFloat(editPrice),
        description: editDescription,
        image: editImageUrl,
        category: editCategoryId,
      });
      alert("แก้ไขสินค้าเรียบร้อยแล้ว");
      setIsEditModalOpen(false);
      setEditingProduct(null);
      fetchProducts();
    } catch (error) {
      console.error("Error updating product:", error);
      alert("เกิดข้อผิดพลาดในการแก้ไขสินค้า");
    }
  };

  const handleVariantChange = (index: number, field: keyof Variant, value: string) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const addVariant = () => {
    setVariants([...variants, { color: "", material: "", size: "", price: "", stock: "" }]);
  };

  const removeVariant = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    setVariants(newVariants);
  };

  const handleConfirm = async () => {
    try {
      if (!name || !price || !categoryId) {
        alert("กรุณากรอกชื่อสินค้า, ราคา และเลือกหมวดหมู่");
        return;
      }
      const totalStock = variants.reduce((sum, variant) => sum + (parseInt(variant.stock) || 0), 0);
      const payload = {
        name,
        stock: totalStock, // ใช้ stock รวมจากทุก variant
        price: parseFloat(price),
        category: categoryId, 
        room: roomId,                 
        features: selectedFeatures,   
        description,
        image: imageUrl,
        variants: variants.map(v => ({
          ...v,
          price: parseFloat(v.price),
          stock: parseInt(v.stock)
        }))
      };
      await createProduct(payload);
      alert("บันทึกสินค้าเรียบร้อยแล้ว");
      
      setName(""); setPrice(""); setDescription(""); setImageUrl("");
      setCategoryId(""); setRoomId(""); setSelectedFeatures([]);
      setVariants([{ color: "", material: "", size: "", price: "", stock: "" }]);
      fetchProducts();
    } catch (error) {
      console.error("Error adding product:", error);
      alert("เกิดข้อผิดพลาดในการเพิ่มสินค้า");
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-body">
        
        {/* ---------------------------------------------------------
                   MAIN SECTION (สลับแสดงผลตามเมนูขวา)
            --------------------------------------------------------- */}
        <div className="main-section">
          
          {/* ส่วนที่ 1: หน้าเพิ่มสินค้า */}
          {activeView === 'addProduct' && (
            <>
              <div className="product-form">
                <div className="image-upload">
                  {imageUrl ? (
                      <img src={imageUrl} alt="preview" className="preview-img" />
                  ) : (
                      <div className="upload-placeholder"><span>🖼️</span></div>
                  )}
                </div>

                <div className="form-fields">
                  <div className="row">
                    <input placeholder="ชื่อสินค้า" value={name} onChange={e => setName(e.target.value)} />
                    <input placeholder="ราคาเริ่มต้น" type="number" value={price} onChange={e => setPrice(e.target.value)} />
                  </div>
                  <div className="row">
                    <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="dropdown-input">
                      <option value="">-- หมวดหมู่สินค้า --</option>
                      {categoriesList.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                    </select>
                    <select value={roomId} onChange={e => setRoomId(e.target.value)} className="dropdown-input">
                      <option value="">-- หมวดหมู่ห้อง --</option>
                      {roomsList.map(room => <option key={room.id} value={room.name}>{room.name}</option>)}
                    </select>
                  </div>
                  <div className="row">
                    <input placeholder="Image URL" value={imageUrl} onChange={e => setImageUrl(e.target.value)} style={{width: '100%'}} />
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

              <div className="variants-section" style={{ marginTop: '20px' }}>
                <h3>ตัวเลือกสินค้า (สี, วัสดุ, ขนาด)</h3>
                {variants.map((variant, index) => (
                    <div key={index} className="variant-row" style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                        <input placeholder="สี" value={variant.color} onChange={e => handleVariantChange(index, 'color', e.target.value)} style={{flex: 1}} />
                        <input placeholder="วัสดุ" value={variant.material} onChange={e => handleVariantChange(index, 'material', e.target.value)} style={{flex: 1}} />
                        <input placeholder="ขนาด" value={variant.size} onChange={e => handleVariantChange(index, 'size', e.target.value)} style={{flex: 1}} />
                        <input placeholder="ราคา" type="number" value={variant.price} onChange={e => handleVariantChange(index, 'price', e.target.value)} style={{width: '80px'}} />
                        <input placeholder="จำนวน" type="number" value={variant.stock} onChange={e => handleVariantChange(index, 'stock', e.target.value)} style={{width: '80px'}} />
                        {variants.length > 1 && <button onClick={() => removeVariant(index)} style={{ background: 'red', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', width: '30px' }}>X</button>}
                    </div>
                ))}
                <button onClick={addVariant} style={{ background: '#4CAF50', color: 'white', padding: '8px 15px', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>+ เพิ่มตัวเลือก</button>
              </div>

              <div style={{ marginTop: "25px", textAlign: "center" }}>
                <button className="confirm-btn" onClick={handleConfirm}>ยืนยันการเพิ่มสินค้า</button>
              </div>
            </>
          )}

          {/* ส่วนที่ 2: หน้าแก้ไข/ลบคุณสมบัติ + รายการสินค้า */}
          {activeView === 'manageSystem' && (
            <div className="manage-system-view">

              {/* --- ส่วนบน: รายการสินค้า --- */}
              <h2>แก้ไข / ลบสินค้า</h2>
              <div className="product-list-section">
                {productsList.length === 0 ? (
                  <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>ยังไม่มีสินค้าในระบบ</p>
                ) : (
                  productsList.map(product => (
                    <div key={product.id} className="product-list-item" style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px',
                      background: 'white',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      marginBottom: '10px',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)'
                    }}>
                      {/* รูปสินค้า */}
                      <div style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <span style={{ fontSize: '28px' }}>🖼️</span>
                        )}
                      </div>

                      {/* ข้อมูลสินค้า */}
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{product.name}</div>
                        <div style={{ fontSize: '14px', color: '#e07b39', marginTop: '3px' }}>
                          ฿{Number(product.price).toLocaleString()}
                        </div>
                        <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>
                          In stock {product.stock ?? '-'} Each
                        </div>
                      </div>

                      {/* ปุ่ม Edit / Delete */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <button
                          onClick={() => handleOpenEdit(product)}
                          style={{
                            background: '#3a9e9e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '7px 22px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            minWidth: '80px'
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          style={{
                            background: '#d94f2e',
                            color: 'white',
                            border: 'none',
                            borderRadius: '20px',
                            padding: '7px 22px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            fontSize: '14px',
                            minWidth: '80px'
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* --- ส่วนล่าง: จัดการ Category/Room/Feature --- */}
              <h2 style={{ marginTop: '30px' }}>แก้ไข / ลบคุณสมบัติ</h2>
              <div className="tab-control-bar">
                <button onClick={() => setActiveTab('category')} className={activeTab === 'category' ? 'active' : ''}>สินค้า</button>
                <button onClick={() => setActiveTab('room')} className={activeTab === 'room' ? 'active' : ''}>ห้อง</button>
                <button onClick={() => setActiveTab('feature')} className={activeTab === 'feature' ? 'active' : ''}>คุณสมบัติ</button>
              </div>

              <div className="master-data-container">
                <div className="category-list">
                  {(activeTab === 'category' ? categoriesList : activeTab === 'room' ? roomsList : featuresList).map(i => (
                    <div key={i.id} className="category-item">
                      <span>{activeTab === 'category' ? '📂' : activeTab === 'room' ? '🏠' : '✨'} {i.name}</span>
                    </div>
                  ))}
                </div>

                <div className="add-category-box">
                   <h4>เพิ่ม {activeTab === 'category' ? 'หมวดหมู่' : activeTab === 'room' ? 'ห้อง' : 'คุณสมบัติ'} ใหม่</h4>
                   <input placeholder={`ชื่อ...`} value={newItemName} onChange={(e) => setNewItemName(e.target.value)} />
                   <button className="orange-btn" onClick={handleAddMasterData}>บันทึกข้อมูล</button>
                </div>
              </div>
            </div>
          )}

          {/* ส่วนที่ 3: หน้าจัดการคำสั่งซื้อ (Placeholder) */}
          {activeView === 'manageOrders' && (
            <div className="manage-orders-view">
              <h2>จัดการคำสั่งซื้อ</h2>
              <p style={{textAlign: 'center', marginTop: '50px', color: '#888'}}>ส่วนจัดการคำสั่งซื้อจะอยู่ตรงนี้</p>
            </div>
          )}

        </div>
        
        {/* ---------------------------------------------------------
                    RIGHT NAVIGATION SIDEBAR 
            --------------------------------------------------------- */}
        <div className="side-navigation">
          <div className="nav-header">จัดการระบบ</div> 
          <button 
            className={`nav-item-btn ${activeView === 'addProduct' ? 'active' : ''}`}
            onClick={() => setActiveView('addProduct')}
          >
            ➕ เพิ่มสินค้า
          </button>
          <button 
            className={`nav-item-btn ${activeView === 'manageSystem' ? 'active' : ''}`}
            onClick={() => setActiveView('manageSystem')}
          >
            ⚙️ แก้ไข/ลบคุณสมบัติ
          </button>
          <button 
            className={`nav-item-btn ${activeView === 'manageOrders' ? 'active' : ''}`}
            onClick={() => setActiveView('manageOrders')}
          >
            📦 จัดการคำสั่งซื้อ
          </button>
        </div>

      </div>

      {/* ---------------------------------------------------------
                  EDIT PRODUCT MODAL
          --------------------------------------------------------- */}
      {isEditModalOpen && editingProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '30px',
            width: '500px', maxWidth: '90vw', boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
          }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#333' }}>✏️ แก้ไขสินค้า</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>ชื่อสินค้า</label>
                <input
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>ราคา</label>
                <input
                  type="number"
                  value={editPrice}
                  onChange={e => setEditPrice(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>หมวดหมู่</label>
                <select
                  value={editCategoryId}
                  onChange={e => setEditCategoryId(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                >
                  <option value="">-- เลือกหมวดหมู่ --</option>
                  {categoriesList.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>Image URL</label>
                <input
                  value={editImageUrl}
                  onChange={e => setEditImageUrl(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '13px', color: '#666', display: 'block', marginBottom: '4px' }}>รายละเอียด</label>
                <textarea
                  value={editDescription}
                  onChange={e => setEditDescription(e.target.value)}
                  rows={3}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => { setIsEditModalOpen(false); setEditingProduct(null); }}
                style={{ padding: '9px 20px', borderRadius: '8px', border: '1px solid #ccc', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSaveEdit}
                style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: '#3a9e9e', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}
              >
                บันทึกการแก้ไข
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminDashboard;