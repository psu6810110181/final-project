// ManageSystem.tsx
import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
import { 
  getAllCategories, createCategory, type Category,
  getAllRooms, createRoom, type Room,
  getAllFeatures, createFeature, type Feature,
  getAllProducts, type Product,
  deleteCategory, deleteRoom, deleteFeature,
  getAllColors, createColor, type Color, deleteColor,
  getAllMaterials, createMaterial, type Material, deleteMaterial,
  getAllSizes, createSize, type Size, deleteSize,
  type Variant
} from "../../services/api";
import Confirm from "../../components/Confirm";
import toast from "react-hot-toast";

interface ManageSystemProps {
  onEditProduct: (productId: string) => void;
}

const ManageSystem: React.FC<ManageSystemProps> = ({ onEditProduct }) => {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);       
  const [featuresList, setFeaturesList] = useState<Feature[]>([]);
  const [colorsList, setColorsList] = useState<Color[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [sizesList, setSizesList] = useState<Size[]>([]);
  const [productsList, setProductsList] = useState<Product[]>([]);
  
  const [newItemName, setNewItemName] = useState("");
  const [activeTab, setActiveTab] = useState<'category' | 'room' | 'feature' | 'color' | 'material' | 'size'>('category'); 
  
  // Confirm state
  const [confirm, setConfirm] = useState<{ 
    message: string; 
    onConfirm: () => void; 
    type?: 'danger' | 'warning' | 'info' 
  } | null>(null); 

  // --- Design System Colors (อิงจาก ProductForm) ---
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

  useEffect(() => {
    fetchMasterData();
    fetchProducts();
  }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, rms, fts] = await Promise.all([
        getAllCategories(), getAllRooms(), getAllFeatures()
      ]);
      setCategoriesList(cats || []); 
      setRoomsList(rms || []); 
      setFeaturesList(fts || []);
    } catch (error) { console.error(error); }

    try {
      const cols = await getAllColors().catch(() => []);
      const mats = await getAllMaterials().catch(() => []);
      const szs = await getAllSizes().catch(() => []);
      setColorsList(cols || []); 
      setMaterialsList(mats || []); 
      setSizesList(szs || []);
    } catch (error) { console.error(error); }
  };

  const fetchProducts = async () => {
    try {
      const products = await getAllProducts();
      setProductsList(products);
    } catch (error) { console.error(error); }
  };

  // ✅ ฟังก์ชันตรวจสอบสินค้าที่มีสต็อกต่ำกว่า 20 ชิ้น
  const getLowStockProducts = () => {
    const lowStockItems: Array<{
      product: Product;
      lowStockType: 'main' | 'variant';
      stockLevel: number;
      variantInfo?: Variant;
    }> = [];

    productsList.forEach(product => {
      // ตรวจสอบสต็อกหลัก
      if (product.stock < 20) {
        lowStockItems.push({
          product,
          lowStockType: 'main',
          stockLevel: product.stock
        });
      }

      // ตรวจสองสต็อกของ variants
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          const variantStock = parseInt(variant.stock) || 0;
          if (variantStock < 20) {
            lowStockItems.push({
              product,
              lowStockType: 'variant',
              stockLevel: variantStock,
              variantInfo: variant
            });
          }
        });
      }
    });

    return lowStockItems;
  };

  const handleAddMasterData = async () => {
    if (!newItemName.trim()) return;
    try {
      if (activeTab === 'category') await createCategory(newItemName);
      else if (activeTab === 'room') await createRoom(newItemName);
      else if (activeTab === 'feature') await createFeature(newItemName);
      else if (activeTab === 'color') await createColor(newItemName);
      else if (activeTab === 'material') await createMaterial(newItemName);
      else if (activeTab === 'size') await createSize(newItemName);
      
      setNewItemName(""); 
      fetchMasterData(); 
      toast.success("เพิ่มข้อมูลสำเร็จ!");
    } catch (error) { 
      toast.error("เกิดข้อผิดพลาด"); 
    }
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setConfirm({
      message: `ยืนยันการลบสินค้า "${productName}" นี้?`,
      onConfirm: async () => {
        try {
          await api.delete(`/products/${productId}`);
          fetchProducts();
          toast.success("ลบสินค้าสำเร็จ");
        } catch (error) { 
          toast.error("ลบไม่สำเร็จ"); 
        }
      },
      type: 'danger'
    });
  };

  const handleDeleteMasterData = async (id: number, itemName: string) => {
    setConfirm({
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${itemName}" นี้?`,
      onConfirm: async () => {
        try {
          if (activeTab === 'category') await deleteCategory(id);
          else if (activeTab === 'room') await deleteRoom(id);
          else if (activeTab === 'feature') await deleteFeature(id);
          else if (activeTab === 'color') await deleteColor(id);
          else if (activeTab === 'material') await deleteMaterial(id);
          else if (activeTab === 'size') await deleteSize(id);
          fetchMasterData();
          toast.success("ลบข้อมูลสำเร็จ");
        } catch (error) { 
          toast.error("ไม่สามารถลบได้"); 
        }
      },
      type: 'danger'
    });
  };

  const getActiveList = () => {
    if (activeTab === 'category') return categoriesList;
    if (activeTab === 'room') return roomsList;
    if (activeTab === 'feature') return featuresList;
    if (activeTab === 'color') return colorsList;
    if (activeTab === 'material') return materialsList;
    return sizesList;
  };

  const getActiveIcon = () => {
    const icons = { category: '📂', room: '🏠', feature: '✨', color: '🎨', material: '🪵', size: '📏' };
    return icons[activeTab];
  };

  const getActiveNameTH = () => {
    const names = { category: 'หมวดหมู่สินค้า', room: 'หมวดหมู่ห้อง', feature: 'คุณสมบัติพิเศษ', color: 'สี', material: 'วัสดุ', size: 'ขนาด' };
    return names[activeTab];
  };

  // ✅ เพิ่มฟังก์ชันแปลง URL รูปภาพให้ดึงจาก Backend
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith('http')) return img;
    return `${API_BASE_URL}/uploads/${img}`;
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* =========================================
          ส่วนที่ 1: จัดการรายการสินค้า
      ========================================= */}
      <section style={{ marginBottom: '40px' }} aria-labelledby="manage-products-heading">
        
        {/* Semantic Header แบบเดียวกับฟอร์ม */}
        <header style={{ 
          background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`,
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px'
        }}>
          <div style={{
            width: '64px', height: '64px', background: colors.primaryLight, borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', 
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', flexShrink: 0
          }} aria-hidden="true">
            📦
          </div>
          <div>
            <h2 id="manage-products-heading" style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              จัดการรายการสินค้า
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>
              ดูรายละเอียด แก้ไขข้อมูล หรือลบสินค้าที่มีอยู่ในระบบหน้าร้าน
            </p>
          </div>
        </header>

        {/* ✅ Stock Alert Section */}
        {(() => {
          const lowStockItems = getLowStockProducts();
          if (lowStockItems.length === 0) return null;
          
          return (
            <div style={{
              background: colors.dangerLight,
              border: `1px solid ${colors.danger}`,
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{
                fontSize: '24px',
                animation: 'pulse 2s infinite'
              }}>⚠️</div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '700', 
                  color: colors.danger, 
                  fontSize: '16px',
                  marginBottom: '4px'
                }}>
                  แจ้งเตือนสต็อกสินค้าใกล้หมด ({lowStockItems.length} รายการ)
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#991B1B',
                  lineHeight: '1.4'
                }}>
                  {lowStockItems.slice(0, 3).map((item, index) => (
                    <span key={index}>
                      {item.product.name}
                      {item.lowStockType === 'variant' && item.variantInfo && (
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>
                          ({item.variantInfo.color}/{item.variantInfo.size})
                        </span>
                      )}
                      <span style={{ fontWeight: '700' }}> คงเหลือ {item.stockLevel} ชิ้น</span>
                      {index < Math.min(lowStockItems.length - 1, 2) && ', '}
                    </span>
                  ))}
                  {lowStockItems.length > 3 && (
                    <span style={{ fontStyle: 'italic' }}>
                      {' '}และอีก {lowStockItems.length - 3} รายการ
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
        
        {/* Semantic List สำหรับแสดงสินค้า */}
        <ul style={{ 
          listStyle: 'none', padding: 0, margin: 0, 
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' 
        }}>
          {productsList.length === 0 ? (
            <li style={{ color: colors.textMuted, gridColumn: '1/-1', textAlign: 'center', padding: '50px', background: colors.bgWhite, borderRadius: '16px', border: `1px dashed ${colors.border}` }}>
              ยังไม่มีสินค้าในระบบ
            </li>
          ) : (
            productsList.map(product => (
              <li key={product.id}>
                <article className="product-card" style={{ 
                  display: 'flex', alignItems: 'center', gap: '20px', background: colors.bgWhite, 
                  borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`,
                  transition: 'all 0.2s ease', cursor: 'default'
                }}>
                  <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', background: colors.bgLight, flexShrink: 0, border: `1px solid ${colors.border}` }}>
                    {/* ✅ ครอบ product.image ด้วยฟังก์ชัน getImageUrl() */}
                    {product.image ? (
                      <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ fontSize: '30px', display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} aria-hidden="true">🖼️</div>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: '600', fontSize: '16px', color: colors.textMain, margin: '0 0 6px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {product.name}
                    </h3>
                    <div style={{ fontSize: '18px', color: colors.secondary, fontWeight: '700' }}>
                      ฿{Number(product.price).toLocaleString()}
                    </div>
                    <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ 
                        display: 'inline-block', 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: (product.stock || 0) > 20 ? '#10B981' : (product.stock || 0) > 0 ? '#F59E0B' : colors.danger 
                      }}></span>
                      สต็อก: {product.stock ?? '0'} ชิ้น
                      {(product.stock ?? 0) < 20 && (product.stock ?? 0) > 0 && (
                        <span style={{ 
                          background: '#FEF3C7', 
                          color: '#92400E', 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          marginLeft: '4px'
                        }}>
                          ใกล้หมด
                        </span>
                      )}
                      {(product.stock ?? 0) === 0 && (
                        <span style={{ 
                          background: colors.dangerLight, 
                          color: colors.danger, 
                          padding: '2px 6px', 
                          borderRadius: '4px', 
                          fontSize: '11px', 
                          fontWeight: '600',
                          marginLeft: '4px'
                        }}>
                          หมด
                        </span>
                      )}
                    </div>
                    
                    {/* ✅ Show variant stock alerts if any variant is low */}
                    {product.variants && product.variants.some(v => (parseInt(v.stock) || 0) < 20) && (
                      <div style={{ fontSize: '12px', color: '#92400E', marginTop: '4px' }}>
                        ⚠️ มี variant ใกล้หมด
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button 
                      onClick={() => onEditProduct(product.id)} 
                      style={{ background: colors.primaryLight, color: colors.primary, border: `1px solid #CCFBF1`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#CCFBF1'}
                      onMouseOut={(e) => e.currentTarget.style.background = colors.primaryLight}
                    >
                      แก้ไข
                    </button>
                    <button 
                      onClick={() => handleDeleteProduct(product.id, product.name)} 
                      style={{ background: colors.dangerLight, color: colors.danger, border: `1px solid #FEE2E2`, borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', transition: 'background 0.2s' }}
                      onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                      onMouseOut={(e) => e.currentTarget.style.background = colors.dangerLight}
                    >
                      ลบ
                    </button>
                  </div>
                </article>
              </li>
            ))
          )}
        </ul>
      </section>

      {/* =========================================
          ส่วนที่ 2: จัดการคุณสมบัติ (Master Data)
      ========================================= */}
      <section aria-labelledby="master-data-heading">
        
        {/* Semantic Header */}
        <header style={{ 
          background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.secondary}`,
          marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px'
        }}>
          <div style={{
            width: '64px', height: '64px', background: colors.secondaryLight, borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', 
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', flexShrink: 0
          }} aria-hidden="true">
            ⚙️
          </div>
          <div>
            <h2 id="master-data-heading" style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              จัดการคุณสมบัติระบบ
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>
              เพิ่มหรือลบตัวเลือกต่างๆ ที่จะนำไปใช้ในฟอร์มเพิ่มสินค้า เช่น หมวดหมู่ ขนาด สี และวัสดุ
            </p>
          </div>
        </header>

        <div style={{ background: colors.bgWhite, borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}` }}>
          
          {/* Tab Navigation */}
          <nav aria-label="Master Data Tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '30px', padding: '6px', background: colors.bgLight, borderRadius: '12px', width: 'fit-content', border: `1px solid ${colors.border}` }}>
            {[
              { id: 'category', n: 'หมวดหมู่สินค้า' }, { id: 'room', n: 'ห้อง' }, { id: 'feature', n: 'คุณสมบัติพิเศษ' },
              { id: 'color', n: 'สี' }, { id: 'material', n: 'วัสดุ' }, { id: 'size', n: 'ขนาด' }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)} 
                aria-pressed={activeTab === tab.id}
                style={{ 
                  padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s',
                  background: activeTab === tab.id ? colors.bgWhite : 'transparent',
                  color: activeTab === tab.id ? colors.secondary : colors.textMuted,
                  boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                {tab.n}
              </button>
            ))}
          </nav>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 350px)', gap: '40px', alignItems: 'start' }}>
            
            {/* List of Chips */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start' }}>
              {getActiveList().length === 0 ? (
                <li style={{ color: colors.textMuted, fontSize: '14px', fontStyle: 'italic' }}>ยังไม่มีข้อมูลในหมวดหมู่นี้</li>
              ) : (
                getActiveList().map(i => (
                  <li key={i.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 8px 16px', 
                    background: colors.bgWhite, border: `1px solid ${colors.border}`, borderRadius: '30px', 
                    boxShadow: '0 1px 2px rgba(0,0,0,0.02)', fontSize: '14px', color: colors.textMain, fontWeight: '500'
                  }}>
                    <span aria-hidden="true">{getActiveIcon()}</span>
                    <span>{i.name}</span>
                    <button 
                        onClick={() => handleDeleteMasterData(i.id, i.name)} 
                        aria-label={`ลบ ${i.name}`}
                        style={{ background: colors.dangerLight, color: colors.danger, border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'background 0.2s', marginLeft: '4px' }}
                        onMouseOver={(e) => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseOut={(e) => e.currentTarget.style.background = colors.dangerLight}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                  </li>
                ))
              )}
            </ul>

            {/* Add Form Sidebox */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleAddMasterData(); }}
              style={{ padding: '24px', background: colors.bgLight, borderRadius: '16px', border: `1px solid ${colors.border}` }}
            >
              <h4 style={{ margin: '0 0 16px 0', color: colors.textMain, fontSize: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true">✨</span> เพิ่ม{getActiveNameTH()}ใหม่
              </h4>
              <label htmlFor="new-master-item" className="sr-only" style={{ display: 'none' }}>ชื่อ{getActiveNameTH()}</label>
              <input 
                  id="new-master-item"
                  placeholder={`กรอกชื่อ${getActiveNameTH()}...`} 
                  value={newItemName} 
                  onChange={(e) => setNewItemName(e.target.value)} 
                  required 
                  style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${colors.border}`, marginBottom: '16px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' }}
                  onFocus={(e) => e.currentTarget.style.border = `1px solid ${colors.secondary}`}
                  onBlur={(e) => e.currentTarget.style.border = `1px solid ${colors.border}`}
              />
              <button type="submit" style={{ 
                  width: '100%', padding: '12px', background: colors.secondary, color: 'white', 
                  border: 'none', borderRadius: '10px', fontWeight: '600', fontSize: '15px', cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(214, 90, 49, 0.2)', transition: 'transform 0.1s'
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                เพิ่มข้อมูล
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* สไตล์เพิ่มเติมสำหรับ Hover Product Card */}
      <style>{`
        .product-card:hover {
            transform: translateY(-4px) !important;
            box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08) !important;
            border-color: #CBD5E1 !important;
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
      
      {/* Custom Confirm */}
      {confirm && (
        <Confirm
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
          type={confirm.type}
        />
      )}
    </div>
  );
};

export default ManageSystem;
