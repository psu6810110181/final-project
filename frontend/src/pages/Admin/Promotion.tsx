import React, { useState, useEffect, useRef } from "react";
import api, { type Promotion, type Product } from "../../services/api";
import Confirm from "../../components/Confirm";
import toast from "react-hot-toast";

const formatDateTimeLocal = (dateString: string | undefined) => {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';

    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch {
    return '';
  }
};

const getMinDateTimeLocal = (dateString: string) => {
  const selectedDate = new Date(dateString);
  const now = new Date();
  
  if (selectedDate.toDateString() === now.toDateString()) {
    return formatDateTimeLocal(now.toISOString());
  } else {
    return formatDateTimeLocal(selectedDate.toISOString());
  }
};

const PromotionManager: React.FC = () => {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
  const [openDiscountDropdown, setOpenDiscountDropdown] = useState<boolean>(false);
  const discountDropdownRef = useRef<HTMLDivElement>(null);
  
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
    isActive: true,
    season: ''
  });

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

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const response = await api.get('/promotions', getAuthHeader());
      // ✅ แก้ไข: ป้องกัน Error ถ้า Backend ส่งข้อมูลแบบมี Pagination
      const promoData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setPromotions(promoData);
      setError(null);
    } catch (error: any) {
      console.error("Failed to fetch promotions", error);
      if (error.response) {
        if (error.response.status === 401) {
          setError("ไม่ได้รับสิทธิ์เข้าถึง (401 Unauthorized) - กรุณาตรวจสอบการ Login ของคุณ");
        } else if (error.response.status === 404) {
          setError("ไม่พบ API endpoint สำหรับโปรโมชั่น - ต้องสร้างใน Backend ก่อน");
        } else {
          setError(`ไม่สามารถโหลดข้อมูลโปรโมชั่นได้: ${error.response.statusText}`);
        }
      } else if (error.request) {
        setError("ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ - กรุณาตรวจสอบว่า Backend กำลังทำงานอยู่");
      } else {
        setError(`เกิดข้อผิดพลาด: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // ✅ แก้ไข: เพิ่ม limit เพื่อให้ดึงสินค้ามาเลือกจัดโปรโมชั่นได้ครบ และรองรับ Pagination Format
      const response = await api.get('/products?limit=1000');
      const productsData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
      setProducts(productsData);
    } catch (error) {
      console.error("Failed to fetch products:", error);
    }
  };

  useEffect(() => {
    fetchPromotions();
    fetchProducts();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (discountDropdownRef.current && !discountDropdownRef.current.contains(event.target as Node)) {
        setOpenDiscountDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateSelectedProducts = (discountType: string, discountValue: string) => {
    if (discountType === 'FIXED_AMOUNT' && discountValue) {
      const discountAmount = Number(discountValue);
      const invalidProducts: string[] = [];
      
      formData.productIds.forEach(productId => {
        const product = products.find(p => p.id === productId);
        if (product) {
          const productPrice = typeof product.price === 'string' ? Number(product.price) : product.price;
          if (productPrice < discountAmount) {
            invalidProducts.push(product.name);
          }
        }
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
      
      if (product) {
        const productPrice = typeof product.price === 'string' ? Number(product.price) : product.price;
        
        if (productPrice < discountAmount && !formData.productIds.includes(productId)) {
          toast.error(`ไม่สามารถเพิ่มสินค้า "${product.name}" ได้เนื่องจากราคาสินค้า (฿${productPrice.toLocaleString()}) ต่ำกว่าจำนวนเงินที่ลด (฿${discountAmount.toLocaleString()})`);
          return;
        }
      }
    }
    
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
      isActive: true,
      season: ''
    });
    setEditingPromotion(null);
    setShowForm(false);
    setOpenDiscountDropdown(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.discountValue || !formData.startDate || !formData.endDate) {
      toast.error("กรุณากรอกข้อมูลที่จำเป็นทั้งหมด");
      return;
    }

    if (formData.discountType === 'PERCENTAGE') {
      const discountValue = Number(formData.discountValue);
      if (discountValue > 90) {
        toast.error("ส่วนลดสูงสุดคือ 90%");
        return;
      }
    }

    try {
      const promotionData = {
        ...formData,
        discountValue: Number(formData.discountValue),
        productIds: formData.productIds,
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString()
      };

      if (editingPromotion) {
        await api.patch(`/promotions/${editingPromotion.id}`, promotionData, getAuthHeader());
        toast.success("อัปเดตโปรโมชั่นสำเร็จ!");
      } else {
        await api.post('/promotions', promotionData, getAuthHeader());
        toast.success("สร้างโปรโมชั่นสำเร็จ!");
      }
      
      resetForm();
      fetchPromotions();
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      toast.error("เกิดข้อผิดพลาดในการบันทึกโปรโมชั่น");
    }
  };

  const handleEdit = (promotion: Promotion) => {
    setEditingPromotion(promotion);
    setFormData({
      title: promotion.title,
      description: promotion.description,
      discountType: promotion.discountType,
      discountValue: promotion.discountValue.toString(),
      startDate: formatDateTimeLocal(promotion.startDate),
      endDate: formatDateTimeLocal(promotion.endDate),
      isFlashSale: promotion.isFlashSale,
      productIds: promotion.products?.map(p => p.id) || [],
      isActive: promotion.isActive,
      season: (promotion as any).season || ''
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
      toast.error("เกิดข้อผิดพลาดในการเปลี่ยนสถานะโปรโมชั่น");
    }
  };

  const getStatusStyle = (isActive: boolean) => {
    return isActive 
      ? { bg: colors.successLight, color: colors.success }
      : { bg: colors.dangerLight, color: colors.danger };
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('th-TH', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch {
      return 'Invalid Date';
    }
  };

  const discountOptions = [
    { value: 'PERCENTAGE', label: 'เปอร์เซ็นต์ (%)' },
    { value: 'FIXED_AMOUNT', label: 'จำนวนเงินคงที่ (บาท)' }
  ];

  const seasonOptions = [
    { value: 'SUMMER', label: 'Summer (ฤดูร้อน)', icon: '☀️' },
    { value: 'WINTER', label: 'Winter (ฤดูหนาว)', icon: '❄️' },
    { value: 'SPRING', label: 'Spring (ฤดูใบไม้ผลิ)', icon: '🌸' },
    { value: 'AUTUMN', label: 'Autumn (ฤดูใบไม้ร่วง)', icon: '🍂' }
  ];

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
              {formData.isFlashSale ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                  placeholder="เช่น Flash Sale ลดราคา 20%"
                />
              ) : (
                <div>
                  <select
                    value={formData.season}
                    onChange={(e) => {
                      const selectedSeason = e.target.value;
                      const seasonOption = seasonOptions.find(opt => opt.value === selectedSeason);
                      setFormData({
                        ...formData, 
                        season: selectedSeason,
                        title: seasonOption ? seasonOption.label : ''
                      });
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '12px', 
                      border: `1px solid ${colors.border}`, 
                      borderRadius: '8px', 
                      fontSize: '14px', 
                      outline: 'none',
                      backgroundColor: colors.bgWhite,
                      cursor: 'pointer'
                    }}
                  >
                    <option value="">เลือกฤดูกาล...</option>
                    {seasonOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.icon} {option.label}
                      </option>
                    ))}
                  </select>
                  <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px' }}>
                    ชื่อโปรโมชั่นจะถูกกำหนดอัตโนมัติตามฤดูกาลที่เลือก
                  </div>
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }} ref={discountDropdownRef}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                ประเภทส่วนลด *
              </label>
              <div 
                onClick={() => setOpenDiscountDropdown(!openDiscountDropdown)}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', backgroundColor: colors.bgWhite, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', userSelect: 'none' }}
              >
                <span>
                  {discountOptions.find(opt => opt.value === formData.discountType)?.label}
                </span>
                <svg 
                  width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" 
                  style={{ 
                    transform: openDiscountDropdown ? 'rotate(180deg)' : 'rotate(0deg)', 
                    transition: 'transform 0.2s ease-in-out',
                    color: colors.textMuted
                  }}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {openDiscountDropdown && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  marginTop: '4px',
                  backgroundColor: colors.bgWhite,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 50,
                  padding: '6px 0'
                }}>
                  {discountOptions.map(opt => (
                    <div
                      key={opt.value}
                      onClick={() => {
                        const newType = opt.value as 'PERCENTAGE' | 'FIXED_AMOUNT';
                        if (!validateSelectedProducts(newType, formData.discountValue)) return;
                        setFormData({...formData, discountType: newType});
                        setOpenDiscountDropdown(false);
                      }}
                      style={{
                        padding: '10px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        color: colors.textMain,
                        transition: 'background 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = colors.bgLight}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <div style={{
                        width: '16px',
                        height: '16px',
                        borderRadius: '50%',
                        border: `1px solid ${formData.discountType === opt.value ? colors.primary : '#9CA3AF'}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {formData.discountType === opt.value && (
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: colors.primary }} />
                        )}
                      </div>
                      {opt.label}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                มูลค่าส่วนลด *
              </label>
              <input
                type="number"
                value={formData.discountValue}
                onChange={(e) => {
                  const value = e.target.value;
                  if (formData.discountType === 'PERCENTAGE' && Number(value) > 90) {
                    toast.error('ส่วนลดสูงสุดคือ 90%');
                    return;
                  }
                  if (!validateSelectedProducts(formData.discountType, value)) return;
                  setFormData({...formData, discountValue: value});
                }}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                placeholder={formData.discountType === 'PERCENTAGE' ? 'เช่น 20 (สูงสุด 90%)' : 'เช่น 1000 (ไม่มีขีดจำกัด)'}
                min="0"
                max={formData.discountType === 'PERCENTAGE' ? 90 : undefined}
                step={formData.discountType === 'PERCENTAGE' ? '0.01' : '1'}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                🎯 ประเภทโปรโมชั่น
              </label>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isFlashSale: true})}
                  style={{
                    flex: 1, padding: '12px 16px', border: `2px solid ${formData.isFlashSale ? colors.secondary : colors.border}`,
                    borderRadius: '8px', background: formData.isFlashSale ? colors.secondaryLight : colors.bgWhite,
                    color: formData.isFlashSale ? colors.secondary : colors.textMuted, cursor: 'pointer', fontSize: '14px',
                    fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                  }}
                >
                  🔥 Flash Sale
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, isFlashSale: false})}
                  style={{
                    flex: 1, padding: '12px 16px', border: `2px solid ${!formData.isFlashSale ? colors.primary : colors.border}`,
                    borderRadius: '8px', background: !formData.isFlashSale ? colors.primaryLight : colors.bgWhite,
                    color: !formData.isFlashSale ? colors.primary : colors.textMuted, cursor: 'pointer', fontSize: '14px',
                    fontWeight: '600', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'all 0.2s'
                  }}
                >
                  📅 Seasonal Promotion
                </button>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                🛍️ เลือกสินค้าที่เข้าร่วมโปรโมชั่น
              </label>
              <div style={{ border: `1px solid ${colors.border}`, borderRadius: '8px', padding: '12px', maxHeight: '200px', overflowY: 'auto', backgroundColor: colors.bgWhite }}>
                <div style={{ fontSize: '12px', color: colors.textMuted, marginBottom: '8px' }}>
                  เลือกสินค้า (เลือกแล้ว {formData.productIds.length} ชิ้น)
                </div>
                {products.length === 0 ? (
                  <div style={{ color: colors.textMuted, fontStyle: 'italic', fontSize: '14px' }}>
                    กำลังโหลด หรือไม่มีสินค้าในระบบ...
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {products.map((product) => {
                      // ✅ เช็คว่าสินค้าชิ้นนี้ไปโผล่อยู่ในโปรโมชั่นที่กำลัง Active อยู่หรือไม่ (และต้องไม่ใช่โปรโมชั่นนี้ที่กำลังแก้ไข)
                      const activePromoForThisProduct = promotions.find(promo => 
                        promo.isActive && 
                        promo.id !== editingPromotion?.id && 
                        promo.products?.some(p => p.id === product.id)
                      );
                      
                      const isAlreadyInOtherPromo = !!activePromoForThisProduct;

                      return (
                        <label 
                          key={product.id} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'flex-start', 
                            cursor: isAlreadyInOtherPromo ? 'not-allowed' : 'pointer', 
                            padding: '10px', 
                            borderRadius: '6px', 
                            backgroundColor: isAlreadyInOtherPromo 
                                ? colors.dangerLight 
                                : (formData.productIds.includes(product.id) ? colors.primaryLight : 'transparent'),
                            border: `1px solid ${isAlreadyInOtherPromo ? '#FECACA' : 'transparent'}`,
                            transition: 'background 0.2s',
                            marginBottom: '4px'
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.productIds.includes(product.id)}
                            onChange={() => !isAlreadyInOtherPromo && handleProductToggle(product.id)}
                            disabled={isAlreadyInOtherPromo}
                            style={{ marginRight: '10px', marginTop: '3px', width: '16px', height: '16px', cursor: isAlreadyInOtherPromo ? 'not-allowed' : 'pointer' }}
                          />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '14px', fontWeight: '600', color: isAlreadyInOtherPromo ? colors.danger : colors.textMain }}>
                                {product.name}
                            </div>
                            <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '2px' }}>
                              ฿{typeof product.price === 'string' ? Number(product.price).toLocaleString() : product.price.toLocaleString()}
                              {product.category && ` • ${product.category}`}
                            </div>
                            
                            {isAlreadyInOtherPromo && (
                              <div style={{ 
                                marginTop: '6px', 
                                display: 'inline-block', 
                                backgroundColor: colors.danger, 
                                color: 'white', 
                                fontSize: '11px', 
                                fontWeight: 'bold', 
                                padding: '2px 8px', 
                                borderRadius: '4px' 
                              }}>
                                ⚠️ ติดโปรโมชั่น: {activePromoForThisProduct.title}
                              </div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                วันที่และเวลาเริ่มต้น *
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.startDate)}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                min={formData.startDate ? getMinDateTimeLocal(formData.startDate) : formatDateTimeLocal(new Date().toISOString())}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: colors.textMain }}>
                วันที่และเวลาสิ้นสุด *
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(formData.endDate)}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                min={formatDateTimeLocal(formData.startDate)}
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
              style={{ width: '100%', padding: '12px', border: `1px solid ${colors.border}`, borderRadius: '8px', fontSize: '14px', minHeight: '100px', resize: 'vertical', outline: 'none' }}
              placeholder="รายละเอียดเพิ่มเติม..."
            />
          </div>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={resetForm} style={{ padding: '12px 24px', border: `1px solid ${colors.border}`, borderRadius: '8px', background: colors.bgWhite, color: colors.textMuted, cursor: 'pointer', fontSize: '14px', fontWeight: '500' }}>
              ยกเลิก
            </button>
            <button type="submit" style={{ padding: '12px 24px', border: 'none', borderRadius: '8px', background: colors.primary, color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
              {editingPromotion ? 'อัปเดตโปรโมชั่น' : 'สร้างโปรโมชั่น'}
            </button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article style={{ maxWidth: '1200px', margin: '0 auto', padding: '10px 0', fontFamily: "'Prompt', sans-serif" }}>
      <header style={{ 
        background: 'linear-gradient(to right, #ffffff, #f8fafc)',
        padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`,
        marginBottom: '28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ width: '64px', height: '64px', background: colors.primaryLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }} aria-hidden="true">
            🎯
          </div>
          <div>
            <h2 id="manage-promotions-heading" style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>จัดการโปรโมชั่นสินค้า</h2>
            <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>สร้าง แก้ไข และจัดการโปรโมชั่นสำหรับสินค้า</p>
          </div>
        </div>
        <button onClick={() => setShowForm(true)} style={{ padding: '12px 20px', background: colors.primary, color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>➕</span> สร้างโปรโมชั่นใหม่
        </button>
      </header>

      {error && (
        <div style={{ background: colors.dangerLight, color: colors.danger, padding: '16px 20px', borderRadius: '12px', marginBottom: '24px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '10px', border: `1px solid #FECACA` }} role="alert">
          <span aria-hidden="true">⚠️</span> {error}
        </div>
      )}

      <section aria-labelledby="manage-promotions-heading" style={{ background: colors.bgWhite, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>กำลังโหลดข้อมูล...</div>
        ) : (
          <div style={{ overflowX: 'auto', padding: '1px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
              <thead style={{ background: colors.bgLight, borderBottom: `2px solid ${colors.border}` }}>
                <tr>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>ชื่อโปรโมชั่น</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>ประเภท</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>มูลค่า</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>ระยะเวลา</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>สถานะ</th>
                  <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {promotions.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: colors.textMuted, fontStyle: 'italic' }}>ยังไม่มีโปรโมชั่นในระบบ</td>
                  </tr>
                ) : (
                  promotions.map((promotion) => {
                    const statusStyle = getStatusStyle(promotion.isActive);
                    return (
                      <tr key={promotion.id} style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: '15px', color: colors.textMain, fontWeight: '600' }}>{promotion.title}</div>
                          {promotion.description && <div style={{ fontSize: '13px', color: colors.textMuted }}>{promotion.description.length > 50 ? `${promotion.description.substring(0, 50)}...` : promotion.description}</div>}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                          {promotion.discountType === 'PERCENTAGE' ? 'เปอร์เซ็นต์' : 'จำนวนเงิน'}
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '15px', color: colors.secondary, fontWeight: '700' }}>
                          {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : `฿${Number(promotion.discountValue).toLocaleString()}`}
                          <div style={{ fontSize: '12px', color: colors.textMuted, fontWeight: '400' }}>{promotion.isFlashSale ? '🔥 Flash Sale' : '📅 Seasonal'}</div>
                        </td>
                        <td style={{ padding: '16px 20px', fontSize: '14px', color: colors.textMain }}>
                          <div>{formatDate(promotion.startDate)}</div>
                          <div style={{ fontSize: '12px', color: colors.textMuted }}>ถึง {formatDate(promotion.endDate)}</div>
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color }}>
                            {promotion.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}
                          </span>
                        </td>
                        <td style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button onClick={() => handleToggleStatus(promotion.id, promotion.isActive)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: promotion.isActive ? colors.warningLight : colors.successLight, color: promotion.isActive ? colors.warning : colors.success, fontWeight: '500' }}>
                            {promotion.isActive ? 'ปิด' : 'เปิด'}
                          </button>
                          <button onClick={() => handleEdit(promotion)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: colors.infoLight, color: colors.info, fontWeight: '500' }}>
                            แก้ไข
                          </button>
                          <button onClick={() => handleDelete(promotion.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: colors.dangerLight, color: colors.danger, fontWeight: '500' }}>
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
      {confirm && <Confirm message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} type={confirm.type} />}
    </article>
  );
};

export default PromotionManager;