// Promotion.tsx
import React, { useState, useEffect } from "react";
import api, { type Promotion, type Product } from "../../services/api";
import Confirm from "../../components/Confirm";
import toast from "react-hot-toast";

const PromotionManager: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  
  // Confirm state
  const [confirm, setConfirm] = useState<{ 
    message: string; 
    onConfirm: () => void; 
    type?: 'danger' | 'warning' | 'info' 
  } | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: '',
    startDate: '',
    endDate: '',
    isFlashSale: false,
    productIds: [] as string[],
    isActive: true
  });

  // --- Design System Colors ---
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
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningLight: '#FEF3C7',
    info: '#3B82F6',
    infoLight: '#DBEAFE'
  };

  // ฟังก์ชันดึง Token ป้องกัน Error 401
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      console.log("Fetching promotions...");
      const response = await api.get('/promotions', getAuthHeader());
      console.log("Promotions response:", response);
      setPromotions(response.data);
      setError(null);
    } catch (error: any) {
      console.error("Failed to fetch promotions", error);
      
      // Debug error details
      if (error.response) {
        console.error("Fetch error response:", error.response);
        console.error("Fetch error status:", error.response.status);
        if (error.response.status === 401) {
          setError("ไม่ได้รับสิทธิ์เข้าถึง (401 Unauthorized) - กรุณาตรวจสอบการ Login ของคุณ");
        } else if (error.response.status === 404) {
          setError("ไม่พบ API endpoint สำหรับโปรโมชั่น - ต้องสร้างใน Backend ก่อน");
        } else {
          setError(`ไม่สามารถโหลดข้อมูลโปรโมชั่นได้: ${error.response.statusText}`);
        }
      } else if (error.request) {
        console.error("Fetch error request:", error.request);
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ - กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่");
      } else {
        console.error("Fetch error message:", error.message);
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products');
      setProducts(response.data);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  const handleProductToggle = (productId: string) => {
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter(id => id !== productId)
        : [...prev.productIds, productId]
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      discountType: 'PERCENTAGE',
      discountValue: '',
      startDate: '',
      endDate: '',
      isFlashSale: false,
      productIds: [],
      isActive: true
    });
    setEditingPromotion(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นทั้งหมด");
      return;
    }

    try {
      const promotionData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        productIds: formData.productIds,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      console.log("Submitting promotion data:", promotionData);
      console.log("Auth header:", getAuthHeader());

      if (editingPromotion) {
        console.log("Updating promotion ID:", editingPromotion.id);
        await api.patch(`/promotions/${editingPromotion.id}`, promotionData, getAuthHeader());
        toast.success("อัปเดตโปรโมชั่นสำเร็จ!");
      } else {
        console.log("Creating new promotion...");
        const response = await api.post('/promotions', promotionData, getAuthHeader());
        console.log("Create promotion response:", response);
        toast.success("สร้างโปรโมชั่นสำเร็จ!");
      }
      
      resetForm();
      fetchPromotions();
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      
      // Debug error details
      if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
        toast.error(`เกิดข้อผิดพลาดในการบันทึกโปรโมชั่น: ${error.response.data?.message || error.response.statusText || 'Unknown error'}`);
      } else if (error.request) {
        console.error("Error request:", error.request);
        toast.error("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ - กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่");
      } else {
        console.error("Error message:", error.message);
        toast.error(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      startDate: promotion.startDate.split('T')[0],
      endDate: promotion.endDate.split('T')[0],
      isFlashSale: promotion.isFlashSale,
      productIds: promotion.products?.map(p => p.id) || [],
      isActive: promotion.isActive
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setConfirm({
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่นนี้?\n(การกระทำนี้ไม่สามารถย้อนกลับได้)`,
      onConfirm: async () => {
        try {
          await api.delete(`/promotions/${id}`, getAuthHeader());
          toast.success("ลบโปรโมชั่นสำเร็จ!");
          fetchPromotions();
        } catch (error) {
          console.error("Error deleting promotion:", error);
          toast.error("เกิดข้อผิดพลาดในการลบโปรโมชั่น");
        }
      },
      type: 'danger'
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/promotions/${id}/toggle`, { isActive: !currentStatus }, getAuthHeader());
      toast.success(`${!currentStatus ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}โปรโมชั่นสำเร็จ!`);
      fetchPromotions();
    } catch (error) {
      console.error("Error toggling promotion status:", error);
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะโปรโมชั่น");
    }
  };

  const getStatusStyle = (isActive: boolean) => {
    return isActive 
      ? { bg: colors.successLight, color: colors.success }
      : { bg: colors.dangerLight, color: colors.danger };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (showForm) {
    return (
      <article style={{ maxWidth: '800px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
        <header style={{ 
          background: 'linear-gradient(to right, #ffffff, #f8fafc)',
          padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
          border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`,
          marginBottom: '28px'
        }}>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>
            {editingPromotion ? 'แก้ไขโปรโมชั่น' : 'สร้างโปรโมชั่นใหม่'}
          </h2>
        </header>

        <form onSubmit={handleSubmit} style={{ background: colors.bgWhite, padding: '32px', borderRadius: '16px', border: `1px solid ${colors.border}` }}>
          <div style={{ display: 'grid', gap: '20px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                ชื่อโปรโมชั่น *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                placeholder="เช่น ลดราคา 20%"
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                ประเภทส่วนลด *
              </label>
              <select
                value={formData.discountType}
                onChange={(e) => setFormData({...formData, discountType: e.target.value as 'PERCENTAGE' | 'FIXED_AMOUNT'})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
              >
                <option value="PERCENTAGE">เปอร์เซ็นต์ (%)</option>
                <option value="FIXED_AMOUNT">จำนวนเงินคงที่ (บาท)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                มูลค่าส่วนลด *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => setFormData({...formData, discountValue: e.target.value})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'เช่น 20' : 'เช่น 100'}
                min="0"
                step={formData.discountType === 'PERCENTAGE' ? '0.01' : '1'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                🎯 ประเภทโปรโมชั่น
              </label>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.isFlashSale}
                  onChange={(e) => setFormData({...formData, isFlashSale: e.target.checked})}
                  style={{ marginRight: '8px', width: '16px', height: '16px' }}
                />
                <span style={{ fontSize: '14px' }}>
                  {formData.isFlashSale ? '🔥 Flash Sale (แสดงหน้าแรก)' : '📅 Seasonal Promotion (โปรโมชั่นปกติ)'}
                </span>
              </label>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                🛍️ เลือกสินค้าที่เข้าร่วมโปรโมชั่น
              </label>
              <div style={{ 
                border: `1px solid ${colors.border}`, 
                borderRadius: '8px', 
                padding: '12px',
                maxHeight: '200px',
                overflowY: 'auto',
                backgroundColor: colors.bgWhite
              }}>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>
                  เลือกสินค้าที่ต้องการลดราคา (เลือก {formData.productIds.length} สินค้า)
                </div>
                {products.length === 0 ? (
                  <div style={{ color: colors.textMuted, fontStyle: 'italic' }}>
                    กำลังโหลดรายการสินค้า...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {products.map((product) => (
                      <label 
                        key={product.id} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '4px',
                          backgroundColor: formData.productIds.includes(product.id) ? colors.primaryLight : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.productIds.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          style={{ marginRight: '8px', width: '14px', height: '14px' }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '13px', fontWeight: '500' }}>
                            {product.name}
                          </div>
                          <div style={{ fontSize: '11px', color: colors.textMuted }}>
                            ฿{typeof product.price === 'string' ? Number(product.price).toLocaleString() : product.price.toLocaleString()}
                            {product.category && ` • ${product.category}`}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                วันที่เริ่มต้น *
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                วันที่สิ้นสุด *
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px' }}
                min={formData.startDate}
              />
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
              รายละเอียดโปรโมชั่น
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', minHeight: '100px', resize: 'vertical' }}
              placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับโปรโมชั่น..."
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={resetForm}
              style={{ padding: '12px 24px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: colors.bgWhite, color: colors.textMuted, cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: colors.primary, color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
            >
              {editingPromotion ? 'อัปเดตโปรโมชั่น' : 'สร้างโปรโมชั่น'}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      
      {/* Header */}
      <header style={{ 
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
        padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`,
        marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{
            width: '64px', height: '64px', background: colors.primaryLight, borderRadius: '16px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', 
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.04)', flexShrink: 0
          }} aria-hidden="true">
            🎯
          </div>
          <div>
            <h2 id="manage-promotions-heading" style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700', letterSpacing: '-0.5px' }}>
              จัดการโปรโมชั่นสินค้า
            </h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>
              สร้าง แก้ไข และจัดการโปรโมชั่นสำหรับสินค้าเฟอร์นิเจอร์
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ 
            padding: '12px 20px', background: colors.primary, color: 'white', border: 'none', 
            borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', 
            display: 'flex', alignItems: 'center', gap: '8px', transition: 'background 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#0E7C82'}
          onMouseOut={(e) => e.currentTarget.style.background = colors.primary}
        >
          <span>➕</span> สร้างโปรโมชั่นใหม่
        </button>
      </header>

      {/* Error Alert */}
      {error && (
        <div style={{ background: colors.dangerLight, color: colors.danger, padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid #FECACA` }} role="alert">
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}

      {/* Table Section */}
      <section aria-labelledby="manage-promotions-heading" style={{ background: colors.bgWhite, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>
            กำลังโหลดข้อมูลโปรโมชั่น...
          </div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '1px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              
              <thead style={{ background: colors.bgLight, borderBottom: `2px solid ${colors.border}` }}>
                <tr>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ชื่อโปรโมชั่น</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ประเภทส่วนลด</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>มูลค่า</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ระยะเวลา</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>สถานะ</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              
              <tbody>
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: colors.textMuted, fontStyle: 'italic' }}>
                      ยังไม่มีโปรโมชั่นในระบบ
                    </td>
                  </tr>
                ) : (
                  promotions.map((promotion) => {
                    const statusStyle = getStatusStyle(promotion.isActive);
                    
                    return (
                      <tr key={promotion.id} className="promotion-row" style={{ borderBottom: `1px solid ${colors.border}`, transition: 'background 0.2s' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div>
                            <div style={{ fontSize: '15px', color: colors.textMain, fontWeight: '600', marginBottom: '4px' }}>
                              {promotion.title}
                            </div>
                            {promotion.description && (
                              <div style={{ fontSize: '13px', color: colors.textMuted }}>
                                {promotion.description.length > 50 ? `${promotion.description.substring(0, 50)}...` : promotion.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                          {promotion.discountType === 'PERCENTAGE' ? 'เปอร์เซ็นต์' : 'จำนวนเงินคงที่'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '15px', color: colors.secondary, fontWeight: '700' }}>
                          {promotion.discountType === 'PERCENTAGE' 
                            ? `${promotion.discountValue}%`
                            : `฿${Number(promotion.discountValue).toLocaleString()}`
                          }
                          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '400', marginTop: '2px' }}>
                            {promotion.isFlashSale ? '🔥 Flash Sale' : '📅 Seasonal'} 
                            {promotion.products && promotion.products.length > 0 && ` • ${promotion.products.length} สินค้า`}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                          <div>{formatDate(promotion.startDate)}</div>
                          <div style={{ fontSize: '12px', color: colors.textMuted }}>
                            ถึง {formatDate(promotion.endDate)}
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ 
                            display: 'inline-block', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
                            background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.color}40`
                          }}>
                            {promotion.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={() => handleToggleStatus(promotion.id, promotion.isActive)}
                            style={{ 
                              padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', 
                              background: promotion.isActive ? colors.warningLight : colors.successLight, 
                              color: promotion.isActive ? colors.warning : colors.success, fontWeight: '500'
                            }}
                            title={promotion.isActive ? 'ปิดใช้งานโปรโมชั่น' : 'เปิดใช้งานโปรโมชั่น'}
                          >
                            {promotion.isActive ? 'ปิด' : 'เปิด'}
                          </button>
                          <button
                            onClick={() => handleEdit(promotion)}
                            style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: colors.infoLight, color: colors.info, fontWeight: '500' }}
                            title="แก้ไขโปรโมชั่น"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(promotion.id)}
                            style={{ 
                              padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', 
                              background: colors.dangerLight, color: colors.danger, fontWeight: '500'
                            }}
                            title="ลบโปรโมชั่น"
                          >
                            ลบ
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Hover styles */}
      <style>{`
        .promotion-row:hover {
          background-color: #F8FAFC !important;
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
    </article>
  );
};

export default PromotionManager;
