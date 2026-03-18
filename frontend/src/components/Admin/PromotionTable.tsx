import React from "react";
import { type Promotion } from "../../services/api";

interface PromotionTableProps {
  promotions: Promotion[];
  loading: boolean;
  colors: any;
  handleToggleStatus: (id: string, status: boolean) => void;
  handleEdit: (promo: Promotion) => void;
  handleDelete: (id: string) => void;
  formatDate: (date: string) => string;
}

const PromotionTable: React.FC<PromotionTableProps> = ({
  promotions, loading, colors, handleToggleStatus, handleEdit, handleDelete, formatDate
}) => {
  const getStatusStyle = (isActive: boolean) => {
    return isActive 
      ? { bg: colors.successLight, color: colors.success }
      : { bg: colors.dangerLight, color: colors.danger };
  };

  return (
    <section aria-labelledby="manage-promotions-heading" style={{ background: colors.bgWhite, borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: `1px solid ${colors.border}`, overflow: 'hidden' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: colors.textMuted }}>กำลังโหลดข้อมูล...</div>
      ) : (
        <div style={{ overflowX: 'auto', padding: '1px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '1000px' }}>
            <thead style={{ background: colors.bgLight, borderBottom: `2px solid ${colors.border}` }}>
              <tr>
                {['ชื่อโปรโมชั่น', 'ประเภท', 'มูลค่า', 'ระยะเวลา', 'สถานะ'].map(h => (
                  <th key={h} scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase' }}>{h}</th>
                ))}
                <th scope="col" style={{ padding: '16px 20px', color: colors.textMuted, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', textAlign: 'right' }}>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {promotions.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: colors.textMuted, fontStyle: 'italic' }}>ยังไม่มีโปรโมชั่นในระบบ</td></tr>
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
                        <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', background: statusStyle.bg, color: statusStyle.color }}>{promotion.isActive ? 'ใช้งาน' : 'ปิดใช้งาน'}</span>
                      </td>
                      <td style={{ padding: '16px 20px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button onClick={() => handleToggleStatus(promotion.id, promotion.isActive)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: promotion.isActive ? colors.warningLight : colors.successLight, color: promotion.isActive ? colors.warning : colors.success, fontWeight: '500' }}>{promotion.isActive ? 'ปิด' : 'เปิด'}</button>
                        <button onClick={() => handleEdit(promotion)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: colors.infoLight, color: colors.info, fontWeight: '500' }}>แก้ไข</button>
                        <button onClick={() => handleDelete(promotion.id)} style={{ padding: '8px 12px', borderRadius: '8px', border: `1px solid ${colors.border}`, fontSize: '12px', cursor: 'pointer', background: colors.dangerLight, color: colors.danger, fontWeight: '500' }}>ลบ</button>
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
  );
};

export default PromotionTable;