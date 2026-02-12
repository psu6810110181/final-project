import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
// 👇 ถอยไป 2 ขั้นเพื่อเข้าโฟลเดอร์ order_items
import { OrderItem } from '../../order_items/entities/order_item.entity';

@Entity('orders')
export class Order {
  // PK: order_id (Varchar 255) -> TypeORM ใช้ uuid สร้าง string อัตโนมัติ
  @PrimaryGeneratedColumn('uuid', { name: 'order_id' })
  id: string;

  // FK: user_id
  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ความสัมพันธ์ไปหา OrderItem
  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  // NOT_NULL: order_date
  @CreateDateColumn({ name: 'order_date', type: 'timestamp' })
  orderDate: Date;

  // NOT_NULL: total_amount_product
  @Column({ name: 'total_amount_product', type: 'decimal', precision: 10, scale: 2 })
  totalAmountProduct: number;

  // NOT_NULL: total_amount_installation
  @Column({ name: 'total_amount_installation', type: 'decimal', precision: 10, scale: 2 })
  totalAmountInstallation: number;

  // NOT_NULL: total_amount (Grand Total)
  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  // NOT_NULL: status (Varchar 20)
  @Column({ name: 'status', type: 'varchar', length: 20, default: 'PENDING' })
  status: string;

  // payment_slip_image (Varchar 255)
  @Column({ name: 'payment_slip_image', type: 'varchar', length: 255, nullable: true })
  paymentSlipImage: string;

  // installationcharge (Decimal 10,2)
  @Column({ name: 'installationcharge', type: 'decimal', precision: 10, scale: 2, nullable: true, default: 0 })
  installationCharge: number;

  // 💡 จุดสังเกต: ใน ER Diagram ไม่มีฟิลด์เก็บ "ที่อยู่จัดส่ง" (Shipping Address) 
  // ถ้าคุณต้องการให้บิลแต่ละใบเก็บที่อยู่ไว้ เผื่อ User เปลี่ยนที่อยู่ทีหลัง แนะนำให้ปลดคอมเมนต์เพิ่มอันนี้เข้าไปครับ
  @Column({ name: 'shipping_address', type: 'text', nullable: true })
  shippingAddress: string;
}