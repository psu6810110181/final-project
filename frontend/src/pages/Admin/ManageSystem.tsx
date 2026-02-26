import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
import { 
  getAllCategories, createCategory, type Category,
  getAllRooms, createRoom, type Room,
  getAllFeatures, createFeature, type Feature,
  getAllProducts, type Product,
  deleteCategory, deleteRoom, deleteFeature
} from "../../services/api";

interface ManageSystemProps {
  onEditProduct: (productId: string) => void;
}

const ManageSystem: React.FC<ManageSystemProps> = ({ onEditProduct }) => {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);       
  const [featuresList, setFeaturesList] = useState<Feature[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  
  const [newItemName, setNewItemName] = useState("");
  const [activeTab, setActiveTab] = useState<'category' | 'room' | 'feature'>('category'); 

  useEffect(() => {
    fetchMasterData();
    fetchProducts();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, rms, fts] = await Promise.all([
        getAllCategories(), getAllRooms(), getAllFeatures()
      ]);
      setCategoriesList(cats); setRoomsList(rms); setFeaturesList(fts);
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

  const handleAddMasterData = async () => {
    if (!newItemName.trim()) return;
    try {
      if (activeTab === 'category') await createCategory(newItemName);
      else if (activeTab === 'room') await createRoom(newItemName);
      else if (activeTab === 'feature') await createFeature(newItemName);
      
      setNewItemName(""); 
      fetchMasterData(); 
      alert(`เพิ่ม ${activeTab} สำเร็จ!`);
    } catch (error) {
      console.error(error);
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
    }
  };

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

  const handleDeleteMasterData = async (id: number) => {
    if (window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบรายการนี้?')) {
      try {
        if (activeTab === 'category') {
          await deleteCategory(id);
          setCategoriesList(prev => prev.filter(item => item.id !== id));
        } else if (activeTab === 'room') {
          await deleteRoom(id);
          setRoomsList(prev => prev.filter(item => item.id !== id));
        } else if (activeTab === 'feature') {
          await deleteFeature(id);
          setFeaturesList(prev => prev.filter(item => item.id !== id));
        }
      } catch (error) {
        console.error("Error deleting data:", error);
        alert("ไม่สามารถลบได้ (อาจมีสินค้านำไปใช้งานอยู่)");
      }
    }
  };

  return (
    <div className="manage-system-view">
      <h2>แก้ไข / ลบสินค้า</h2>
      <div className="product-list-section">
        {productsList.length === 0 ? (
          <p style={{ color: '#888', textAlign: 'center', padding: '20px' }}>ยังไม่มีสินค้าในระบบ</p>
        ) : (
          productsList.map(product => (
            <div key={product.id} className="product-list-item" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'white', borderRadius: '12px', padding: '12px 16px', marginBottom: '10px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <div style={{ width: '70px', height: '70px', flexShrink: 0, borderRadius: '8px', overflow: 'hidden', background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {product.image ? <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span style={{ fontSize: '28px' }}>🖼️</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#333' }}>{product.name}</div>
                <div style={{ fontSize: '14px', color: '#e07b39', marginTop: '3px' }}>฿{Number(product.price).toLocaleString()}</div>
                <div style={{ fontSize: '13px', color: '#888', marginTop: '2px' }}>In stock {product.stock ?? '-'} Each</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button onClick={() => onEditProduct(product.id)} style={{ background: '#3a9e9e', color: 'white', border: 'none', borderRadius: '20px', padding: '7px 22px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', minWidth: '80px' }}>Edit</button>
                <button onClick={() => handleDeleteProduct(product.id)} style={{ background: '#d94f2e', color: 'white', border: 'none', borderRadius: '20px', padding: '7px 22px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px', minWidth: '80px' }}>Delete</button>
              </div>
            </div>
          ))
        )}
      </div>

      <h2 style={{ marginTop: '30px' }}>แก้ไข / ลบคุณสมบัติ</h2>
      <div className="tab-control-bar">
        <button onClick={() => setActiveTab('category')} className={activeTab === 'category' ? 'active' : ''}>สินค้า</button>
        <button onClick={() => setActiveTab('room')} className={activeTab === 'room' ? 'active' : ''}>ห้อง</button>
        <button onClick={() => setActiveTab('feature')} className={activeTab === 'feature' ? 'active' : ''}>คุณสมบัติ</button>
      </div>

      <div className="master-data-container">
        <div className="category-list">
          {(activeTab === 'category' ? categoriesList : activeTab === 'room' ? roomsList : featuresList).map(i => (
            <div key={i.id} className="category-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{activeTab === 'category' ? '📂' : activeTab === 'room' ? '🏠' : '✨'} {i.name}</span>
              <button onClick={() => handleDeleteMasterData(i.id)} style={{ background: 'none', border: 'none', color: '#e74c3c', cursor: 'pointer', fontSize: '16px' }} title="ลบ">❌</button>
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
  );
};

export default ManageSystem;