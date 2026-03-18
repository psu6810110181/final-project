import React, { useState, useEffect } from "react";
import api, { type Promotion, type Product } from "../../services/api";
import Confirm from "../../components/Confirm";
import toast from "react-hot-toast";

// นำเข้า Component ลูกที่ถูกแยกออกไป
import PromotionForm from "../../components/Admin/PromotionForm";
import PromotionTable from "../../components/Admin/PromotionTable";

const formatDateTimeLocal = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}T${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  } catch { return ''; }
};

const getMinDateTimeLocal = (dateString: string) => {
  const selectedDate = new Date(dateString);
  const now = new Date();
  return selectedDate.toDateString() === now.toDateString() ? formatDateTimeLocal(now.toISOString()) : formatDateTimeLocal(selectedDate.toISOString());
};

const PromotionManager: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [openDiscountDropdown, setOpenDiscountDropdown] = useState<boolean>(false);
  
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' } | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED_AMOUNT',
    discountValue: '', startDate: '', endDate: '', isFlashSale: false, productIds: [] as string[], isActive: true, season: ''
  });

  const colors = {
    primary: '#148F96', primaryLight: '#E6F7F8', secondary: '#D65A31', secondaryLight: '#FCE8E1',
    textMain: '#1F2937', textMuted: '#6B7280', border: '#E5E7EB', bgLight: '#F9FAFB', bgWhite: '#FFFFFF',
    danger: '#EF4444', dangerLight: '#FEF2F2', success: '#10B981', successLight: '#D1FAE5',
    warning: '#F59E0B', warningLight: '#FEF3C7', info: '#3B82F6', infoLight: '#DBEAFE'
  };

  const getAuthHeader = () => ({ headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } });

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/promotions', getAuthHeader());
      setPromotions(Array.isArray(response.data) ? response.data : (response.data?.data || []));
      setError(null);
    } catch (error: any) {
      setError(`ไม่สามารถโหลดข้อมูลโปรโมชั่นได้`);
    } finally { setLoading(false); }
  };

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products?limit=1000');
      setProducts(Array.isArray(response.data) ? response.data : (response.data?.data || []));
    } catch (error) { console.error("Failed to fetch products"); }
  };

  useEffect(() => { fetchPromotions(); fetchProducts(); }, []);

  const validateSelectedProducts = (discountType: string, discountValue: string) => {
    if (discountType === 'FIXED_AMOUNT' && discountValue) {
      const discountAmount = Number(discountValue);
      const invalidProducts: string[] = [];
      formData.productIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product && Number(product.price) < discountAmount) invalidProducts.push(product.name);
      });
      if (invalidProducts.length > 0) {
        toast.error(`สินค้าต่อไปนี้มีราคาต่ำกว่าจำนวนเงินที่ลด: ${invalidProducts.join(', ')}`);
        return false;
      }
    }
    return true;
  };

  const handleProductToggle = (productId: string) => {
    if (formData.discountType === 'FIXED_AMOUNT' && formData.discountValue) {
      const discountAmount = Number(formData.discountValue);
      const product = products.find(p => p.id === productId);
      if (product && Number(product.price) < discountAmount && !formData.productIds.includes(productId)) {
        toast.error(`ไม่สามารถเพิ่มสินค้านี้ได้เนื่องจากราคาต่ำกว่าส่วนลด`);
        return;
      }
    }
    setFormData(prev => ({
      ...prev,
      productIds: prev.productIds.includes(productId) ? prev.productIds.filter(id => id !== productId) : [...prev.productIds, productId]
    }));
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', discountType: 'PERCENTAGE', discountValue: '', startDate: '', endDate: '', isFlashSale: false, productIds: [], isActive: true, season: '' });
    setEditingPromotion(null); setShowForm(false); setOpenDiscountDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นทั้งหมด"); return;
    }
    try {
      const promotionData = { ...formData, discountValue: Number(formData.discountValue), startDate: new Date(formData.startDate).toISOString(), endDate: new Date(formData.endDate).toISOString() };
      if (editingPromotion) {
        await api.patch(`/promotions/${editingPromotion.id}`, promotionData, getAuthHeader());
        toast.success("อัปเดตโปรโมชั่นสำเร็จ!");
      } else {
        await api.post('/promotions', promotionData, getAuthHeader());
        toast.success("สร้างโปรโมชั่นสำเร็จ!");
      }
      resetForm(); fetchPromotions();
    } catch (error) { toast.error("เกิดข้อผิดพลาดในการบันทึกโปรโมชั่น"); }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title, description: promotion.description, discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(), startDate: formatDateTimeLocal(promotion.startDate),
      endDate: formatDateTimeLocal(promotion.endDate), isFlashSale: promotion.isFlashSale,
      productIds: promotion.products?.map(p => p.id) || [], isActive: promotion.isActive, season: (promotion as any).season || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    setConfirm({
      message: `คุณแน่ใจหรือไม่ว่าต้องการลบโปรโมชั่นนี้?`,
      onConfirm: async () => {
        try { await api.delete(`/promotions/${id}`, getAuthHeader()); toast.success("ลบสำเร็จ!"); fetchPromotions(); }
        catch (error) { toast.error("ลบไม่สำเร็จ"); }
      }, type: 'danger'
    });
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/promotions/${id}/toggle`, { isActive: !currentStatus }, getAuthHeader());
      toast.success("เปลี่ยนสถานะสำเร็จ!"); fetchPromotions();
    } catch (error) { toast.error("เปลี่ยนสถานะไม่สำเร็จ"); }
  };

  const formatDate = (dateString: string) => {
    try { return new Date(dateString).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }); }
    catch { return 'Invalid Date'; }
  };

  if (showForm) {
    return (
      <PromotionForm 
        formData={formData} setFormData={setFormData} editingPromotion={editingPromotion}
        products={products} promotions={promotions} handleSubmit={handleSubmit} resetForm={resetForm}
        formatDateTimeLocal={formatDateTimeLocal} getMinDateTimeLocal={getMinDateTimeLocal} colors={colors}
        openDiscountDropdown={openDiscountDropdown} setOpenDiscountDropdown={setOpenDiscountDropdown}
        validateSelectedProducts={validateSelectedProducts} handleProductToggle={handleProductToggle}
      />
    );
  }

  return (
    <article style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      <header style={{ 
        background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: '24px 32px', borderRadius: '16px', 
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)', border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`,
        marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '64px', height: '64px', background: colors.primaryLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>🎯</div>
          <div>
            <h2 style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>จัดการโปรโมชั่นสินค้า</h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>สร้าง แก้ไข และจัดการโปรโมชั่น</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '12px 20px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
          ➕ สร้างโปรโมชั่นใหม่
        </button>
      </header>

      {error && <div style={{ background: colors.dangerLight, color: colors.danger, padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '500' }}>⚠️ {error}</div>}

      <PromotionTable 
        promotions={promotions} loading={loading} colors={colors} 
        handleToggleStatus={handleToggleStatus} handleEdit={handleEdit} handleDelete={handleDelete} formatDate={formatDate} 
      />

      {confirm && <Confirm message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} type={confirm.type} />}
    </article>
  );
};

export default PromotionManager;