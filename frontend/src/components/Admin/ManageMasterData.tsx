import React, { useState, useEffect } from "react";
import { 
  getAllCategories, createCategory, type Category, deleteCategory,
  getAllRooms, createRoom, type Room, deleteRoom,
  getAllFeatures, createFeature, type Feature, deleteFeature,
  getAllColors, createColor, type Color, deleteColor,
  getAllMaterials, createMaterial, type Material, deleteMaterial,
  getAllSizes, createSize, type Size, deleteSize
} from "../../services/api";
import Confirm from "../Confirm";
import toast from "react-hot-toast";

const ManageMasterData: React.FC = () => {
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);       
  const [featuresList, setFeaturesList] = useState<Feature[]>([]);
  const [colorsList, setColorsList] = useState<Color[]>([]);
  const [materialsList, setMaterialsList] = useState<Material[]>([]);
  const [sizesList, setSizesList] = useState<Size[]>([]);
  
  const [newItemName, setNewItemName] = useState("");
  const [activeTab, setActiveTab] = useState<'category' | 'room' | 'feature' | 'color' | 'material' | 'size'>('category'); 
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' } | null>(null); 

  const colors = {
    secondary: '#D65A31', secondaryLight: '#FCE8E1', textMain: '#1F2937', textMuted: '#6B7280',
    border: '#E5E7EB', bgLight: '#F9FAFB', bgWhite: '#FFFFFF', danger: '#EF4444', dangerLight: '#FEF2F2',
    success: '#10B981', successLight: '#ECFDF5' // เพิ่มสีเขียวสำหรับข้อมูลใหม่
  };

  useEffect(() => { fetchMasterData(); }, []);

  const fetchMasterData = async () => {
    try {
      const [cats, rms, fts] = await Promise.all([getAllCategories(), getAllRooms(), getAllFeatures()]);
      setCategoriesList(Array.isArray(cats) ? cats : (cats as any)?.data || []); 
      setRoomsList(Array.isArray(rms) ? rms : (rms as any)?.data || []); 
      setFeaturesList(Array.isArray(fts) ? fts : (fts as any)?.data || []);
    } catch (error) { console.error(error); }

    try {
      const cols = await getAllColors().catch(() => []);
      const mats = await getAllMaterials().catch(() => []);
      const szs = await getAllSizes().catch(() => []);
      setColorsList(Array.isArray(cols) ? cols : (cols as any)?.data || []); 
      setMaterialsList(Array.isArray(mats) ? mats : (mats as any)?.data || []); 
      setSizesList(Array.isArray(szs) ? szs : (szs as any)?.data || []);
    } catch (error) { console.error(error); }
  };

  const getActiveList = () => {
    let list: any[] = [];
    if (activeTab === 'category') list = categoriesList;
    else if (activeTab === 'room') list = roomsList;
    else if (activeTab === 'feature') list = featuresList;
    else if (activeTab === 'color') list = colorsList;
    else if (activeTab === 'material') list = materialsList;
    else list = sizesList;

    return Array.isArray(list) ? list : [];
  };

  // ✅ ฟังก์ชันตรวจสอบว่าคำที่พิมพ์มา ซ้ำกับในลิสต์หรือไม่
  const isDuplicate = () => {
    if (!newItemName.trim()) return false;
    const currentList = getActiveList();
    return currentList.some(
      item => item.name.trim().toLowerCase() === newItemName.trim().toLowerCase()
    );
  };

  const handleAddMasterData = async () => {
    if (!newItemName.trim()) return;
    if (isDuplicate()) {
      toast.error("ไม่อนุญาตให้เพิ่มข้อมูลซ้ำ");
      return;
    }

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

  const handleDeleteMasterData = async (id: number, itemName: string) => {
    setConfirm({
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบรายการ "${itemName}" นี้?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          if (activeTab === 'category') await deleteCategory(id);
          else if (activeTab === 'room') await deleteRoom(id);
          else if (activeTab === 'feature') await deleteFeature(id);
          else if (activeTab === 'color') await deleteColor(id);
          else if (activeTab === 'material') await deleteMaterial(id);
          else if (activeTab === 'size') await deleteSize(id);
          fetchMasterData(); toast.success("ลบข้อมูลสำเร็จ");
        } catch (error) { toast.error("ไม่สามารถลบได้"); }
      }
    });
  };

  const getActiveIcon = () => ({ category: '📂', room: '🏠', feature: '✨', color: '🎨', material: '🪵', size: '📏' }[activeTab]);
  const getActiveNameTH = () => ({ category: 'หมวดหมู่สินค้า', room: 'หมวดหมู่ห้อง', feature: 'คุณสมบัติพิเศษ', color: 'สี', material: 'วัสดุ', size: 'ขนาด' }[activeTab]);

  // ✅ เช็คสถานะเพื่อเปลี่ยนสี
  const duplicate = isDuplicate();
  const isNewAndValid = newItemName.trim().length > 0 && !duplicate;

  let inputBorderColor = colors.border;
  let inputBgColor = '#ffffff';
  let message = "";

  if (duplicate) {
    inputBorderColor = colors.danger;
    inputBgColor = colors.dangerLight;
    message = "❌ ชื่อนี้มีอยู่ในระบบแล้ว";
  } else if (isNewAndValid) {
    inputBorderColor = colors.success;
    inputBgColor = colors.successLight;
    message = "✅ สามารถเพิ่มข้อมูลนี้ได้";
  }

  return (
    <section>
      <header style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)', border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.secondary}`, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '64px', height: '64px', background: colors.secondaryLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>⚙️</div>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>จัดการคุณสมบัติระบบ</h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>เพิ่มหรือลบตัวเลือกต่างๆ ที่จะนำไปใช้ในฟอร์มเพิ่มสินค้า</p>
        </div>
      </header>

      <div style={{ background: colors.bgWhite, borderRadius: '16px', padding: '30px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}` }}>
        <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '30px', padding: '6px', background: colors.bgLight, borderRadius: '12px', width: 'fit-content', border: `1px solid ${colors.border}` }}>
          {[{ id: 'category', n: 'หมวดหมู่สินค้า' }, { id: 'room', n: 'ห้อง' }, { id: 'feature', n: 'คุณสมบัติพิเศษ' }, { id: 'color', n: 'สี' }, { id: 'material', n: 'วัสดุ' }, { id: 'size', n: 'ขนาด' }].map(tab => (
            <button 
              key={tab.id} onClick={() => { setActiveTab(tab.id as any); setNewItemName(""); }} 
              style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '14px', transition: 'all 0.2s', background: activeTab === tab.id ? colors.bgWhite : 'transparent', color: activeTab === tab.id ? colors.secondary : colors.textMuted, boxShadow: activeTab === tab.id ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
            >
              {tab.n}
            </button>
          ))}
        </nav>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(300px, 350px)', gap: '40px', alignItems: 'start' }}>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '12px', alignContent: 'flex-start' }}>
            {getActiveList().length === 0 ? (
              <li style={{ color: colors.textMuted, fontSize: '14px', fontStyle: 'italic' }}>ยังไม่มีข้อมูลในหมวดหมู่นี้</li>
            ) : (
              getActiveList().map(i => (
                <li key={i.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px 8px 16px', background: colors.bgWhite, border: `1px solid ${colors.border}`, borderRadius: '30px', fontSize: '14px', color: colors.textMain, fontWeight: '500' }}>
                  <span>{getActiveIcon()}</span><span>{i.name}</span>
                  <button onClick={() => handleDeleteMasterData(i.id, i.name)} style={{ background: colors.dangerLight, color: colors.danger, border: 'none', width: '24px', height: '24px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </li>
              ))
            )}
          </ul>

          {/* ✅ ฟอร์มเพิ่มข้อมูลที่อัปเดตระบบตรวจสอบแล้ว */}
          <form onSubmit={(e) => { e.preventDefault(); handleAddMasterData(); }} style={{ padding: '24px', background: colors.bgLight, borderRadius: '16px', border: `1px solid ${colors.border}` }}>
            <h4 style={{ margin: '0 0 16px 0', color: colors.textMain, fontSize: '16px' }}>✨ เพิ่ม{getActiveNameTH()}ใหม่</h4>
            
            <input 
              placeholder={`กรอกชื่อ${getActiveNameTH()}...`} 
              value={newItemName} 
              onChange={(e) => setNewItemName(e.target.value)} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '10px', 
                border: `2px solid ${inputBorderColor}`, 
                backgroundColor: inputBgColor,
                marginBottom: message ? '8px' : '16px', 
                fontSize: '14px', 
                outline: 'none', 
                boxSizing: 'border-box',
                transition: 'all 0.3s ease'
              }} 
            />
            
            {/* แสดงข้อความแจ้งเตือน */}
            {message && (
              <div style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: duplicate ? colors.danger : colors.success, 
                marginBottom: '16px',
                paddingLeft: '4px'
              }}>
                {message}
              </div>
            )}

            <button 
              type="submit" 
              disabled={duplicate || !newItemName.trim()}
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: duplicate || !newItemName.trim() ? '#9CA3AF' : colors.secondary, 
                color: 'white', 
                border: 'none', 
                borderRadius: '10px', 
                fontWeight: '600', 
                fontSize: '15px', 
                cursor: duplicate || !newItemName.trim() ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              เพิ่มข้อมูล
            </button>
          </form>
        </div>
      </div>
      {confirm && <Confirm message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} type={confirm.type} />}
    </section>
  );
};

export default ManageMasterData;