import React, { useState, useEffect } from "react";
import api from "../../services/api"; 
import { getAllProducts, type Product, type Variant } from "../../services/api";
import Confirm from "../Confirm";
import toast from "react-hot-toast";
import { Package, AlertTriangle, Image as ImageIcon, Edit, Trash2 } from "lucide-react"; // ✅ นำเข้า Icons

interface ManageProductsListProps {
  onEditProduct: (productId: string) => void;
}

const ManageProductsList: React.FC<ManageProductsListProps> = ({ onEditProduct }) => {
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [confirm, setConfirm] = useState<{ message: string; onConfirm: () => void; type?: 'danger' | 'warning' | 'info' } | null>(null);

  const colors = {
    primary: '#148F96', primaryLight: '#E6F7F8', secondary: '#D65A31', textMain: '#1F2937',
    textMuted: '#6B7280', border: '#E5E7EB', bgLight: '#F9FAFB', bgWhite: '#FFFFFF',
    danger: '#EF4444', dangerLight: '#FEF2F2', warning: '#F59E0B', warningLight: '#FEF3C7',
    success: '#10B981', // ✅ เพิ่มสีนี้เข้าไป
    successLight: '#D1FAE5' // ✅ เพิ่มสีนี้เผื่อไว้ด้วยครับ
    
  };

  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const products = await getAllProducts();
      setProductsList(Array.isArray(products) ? products : (products as any)?.data || []);
    } catch (error) { 
      console.error(error); 
    }
  };

  const getLowStockProducts = () => {
    const lowStockItems: Array<{ product: Product; lowStockType: 'main' | 'variant'; stockLevel: number; variantInfo?: Variant; }> = [];
    
    if (!Array.isArray(productsList)) return lowStockItems;

    productsList.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        product.variants.forEach(variant => {
          const variantStock = parseInt(variant.stock) || 0;
          if (variantStock < 20) lowStockItems.push({ product, lowStockType: 'variant', stockLevel: variantStock, variantInfo: variant });
        });
      } else {
        const mainStock = product.mainStock ?? product.stock ?? 0;
        if (mainStock < 20) lowStockItems.push({ product, lowStockType: 'main', stockLevel: mainStock });
      }
    });
    return lowStockItems;
  };

  const handleDeleteProduct = async (productId: string, productName: string) => {
    setConfirm({
      message: `ยืนยันการลบสินค้า "${productName}" นี้?`,
      type: 'danger',
      onConfirm: async () => {
        try {
          await api.delete(`/products/${productId}`);
          fetchProducts();
          toast.success("ลบสินค้าสำเร็จ");
        } catch (error) { toast.error("ลบไม่สำเร็จ"); }
      }
    });
  };

  const getImageUrl = (img: string) => {
    if (!img) return "";
    if (img.startsWith('http')) return img;
    return `${API_BASE_URL}/uploads/${img}`;
  };

  const lowStockItems = getLowStockProducts();

  return (
    <section style={{ marginBottom: '40px' }}>
      
      {/* Header */}
      <header style={{ background: 'linear-gradient(to right, #ffffff, #f8fafc)', padding: '24px 32px', borderRadius: '16px', boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.04)', border: `1px solid ${colors.border}`, borderLeft: `8px solid ${colors.primary}`, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={{ width: '64px', height: '64px', background: colors.primaryLight, borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: colors.primary }}>
          <Package size={32} />
        </div>
        <div>
          <h2 style={{ margin: 0, color: '#1E293B', fontSize: '24px', fontWeight: '700' }}>จัดการรายการสินค้า</h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748B', fontSize: '15px' }}>ดูรายละเอียด แก้ไขข้อมูล หรือลบสินค้าที่มีอยู่ในระบบหน้าร้าน</p>
        </div>
      </header>

      {/* Alert สต็อกใกล้หมด */}
      {lowStockItems.length > 0 && (
        <div style={{ background: colors.dangerLight, border: `1px solid ${colors.danger}`, borderRadius: '12px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ color: colors.danger, animation: 'pulse 2s infinite' }}>
            <AlertTriangle size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: '700', color: colors.danger, fontSize: '16px', marginBottom: '4px' }}>
              แจ้งเตือนสต็อกสินค้าใกล้หมด ({lowStockItems.length} รายการ)
            </div>
            <div style={{ fontSize: '14px', color: '#991B1B', lineHeight: '1.4' }}>
              {lowStockItems.slice(0, 3).map((item, index) => (
                <span key={index}>
                  {item.product.name}
                  {item.lowStockType === 'variant' && item.variantInfo && <span style={{ fontSize: '12px', opacity: 0.8 }}> ({item.variantInfo.color}/{item.variantInfo.size})</span>}
                  <span style={{ fontWeight: '700' }}> คงเหลือ {item.stockLevel} ชิ้น</span>
                  {index < Math.min(lowStockItems.length - 1, 2) && ', '}
                </span>
              ))}
              {lowStockItems.length > 3 && <span style={{ fontStyle: 'italic' }}> และอีก {lowStockItems.length - 3} รายการ</span>}
            </div>
          </div>
        </div>
      )}
      
      {/* รายการสินค้า */}
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {(!Array.isArray(productsList) || productsList.length === 0) ? (
          <li style={{ color: colors.textMuted, gridColumn: '1/-1', textAlign: 'center', padding: '50px', background: colors.bgWhite, borderRadius: '16px', border: `1px dashed ${colors.border}` }}>
            ยังไม่มีสินค้าในระบบ
          </li>
        ) : (
          productsList.map(product => (
            <li key={product.id}>
              <article className="product-card" style={{ display: 'flex', alignItems: 'center', gap: '20px', background: colors.bgWhite, borderRadius: '16px', padding: '20px', border: `1px solid ${colors.border}`, transition: 'all 0.2s ease' }}>
                
                {/* รูปภาพ */}
                <div style={{ width: '90px', height: '90px', borderRadius: '12px', overflow: 'hidden', background: colors.bgLight, flexShrink: 0, border: `1px solid ${colors.border}` }}>
                  {product.image ? (
                    <img src={getImageUrl(product.image)} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ color: colors.textMuted, display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                      <ImageIcon size={30} />
                    </div>
                  )}
                </div>

                {/* ข้อมูล */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{ fontWeight: '600', fontSize: '16px', color: colors.textMain, margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</h3>
                    <span style={{ background: colors.primaryLight, color: colors.primary, padding: '2px 8px', borderRadius: '12px', fontSize: '11px', fontWeight: '600' }}>สินค้าหลัก</span>
                  </div>
                  <div style={{ fontSize: '18px', color: colors.secondary, fontWeight: '700' }}>฿{Number(product.price).toLocaleString()}</div>
                  
                  {(product.mainColor || product.mainMaterial || product.mainSize) && (
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {product.mainColor && <span style={{ background: colors.bgLight, padding: '2px 6px', borderRadius: '4px' }}>สี: {product.mainColor}</span>}
                      {product.mainMaterial && <span style={{ background: colors.bgLight, padding: '2px 6px', borderRadius: '4px' }}>วัสดุ: {product.mainMaterial}</span>}
                      {product.mainSize && <span style={{ background: colors.bgLight, padding: '2px 6px', borderRadius: '4px' }}>ขนาด: {product.mainSize}</span>}
                    </div>
                  )}
                  
                  {/* สต็อกหลัก */}
                  <div style={{ fontSize: '13px', color: colors.textMuted, marginTop: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ 
                      display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', 
                      background: (product.mainStock || product.stock || 0) > 20 ? colors.success || '#10B981' : (product.mainStock || product.stock || 0) > 0 ? colors.warning : colors.danger 
                    }}></span>
                    สต็อก: {product.mainStock ?? product.stock ?? '0'} ชิ้น
                    
                    {(product.mainStock ?? product.stock ?? 0) < 20 && (product.mainStock ?? product.stock ?? 0) > 0 && (
                      <span style={{ background: colors.warningLight, color: '#92400E', padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        ใกล้หมด
                      </span>
                    )}
                    {(product.mainStock ?? product.stock ?? 0) === 0 && (
                      <span style={{ background: colors.dangerLight, color: colors.danger, padding: '2px 6px', borderRadius: '4px', fontSize: '11px', fontWeight: '600' }}>
                        หมด
                      </span>
                    )}
                  </div>
                  
                  {/* แจ้งเตือน Variant */}
                  {product.variants && product.variants.length > 0 && (
                    <div style={{ fontSize: '12px', color: colors.textMuted, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ color: colors.primary, fontWeight: '600' }}>{product.variants.length} ตัวเลือก</span>
                      {product.variants.some(v => (parseInt(v.stock) || 0) < 20) && (
                        <span style={{ color: '#92400E', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangle size={12} /> มีรุ่นใกล้หมด
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* ปุ่ม Action */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button 
                    onClick={() => onEditProduct(product.id)} 
                    style={{ background: colors.primaryLight, color: colors.primary, border: `1px solid #CCFBF1`, borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Edit size={14} /> แก้ไข
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(product.id, product.name)} 
                    style={{ background: colors.dangerLight, color: colors.danger, border: `1px solid #FEE2E2`, borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontWeight: '600', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Trash2 size={14} /> ลบ
                  </button>
                </div>
              </article>
            </li>
          ))
        )}
      </ul>
      <style>{`
        .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -4px rgba(0,0,0,0.08); border-color: #CBD5E1; } 
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      
      {confirm && <Confirm message={confirm.message} onConfirm={confirm.onConfirm} onCancel={() => setConfirm(null)} type={confirm.type} />}
    </section>
  );
};

export default ManageProductsList;