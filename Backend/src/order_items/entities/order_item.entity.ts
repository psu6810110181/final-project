import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity'; 
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity'; // ✅ นำเข้า ProductVariant

@Entity('order_items')
export class OrderItem {
  // PK: order_item_id (Varchar 255)
  @PrimaryGeneratedColumn('uuid', { name: 'order_item_id' })
  id: string;

  // FK: order_id
  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // FK: product_id
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  // ✅ FK: variant_id (เพิ่มความสัมพันธ์กับตัวเลือกสินค้าใน Order)
  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'variant_id' })
  variant: ProductVariant;

  // NOT_NULL: quantity
  @Column({ name: 'quantity', type: 'int' })
  quantity: number;

  // NOT_NULL: price_at_purchase
  @Column({ name: 'price_at_purchase', type: 'decimal', precision: 10, scale: 2 })
  priceAtPurchase: number;

  // requestInstallation (Boolean) -> เก็บว่าสินค้านี้ขอรับบริการติดตั้งไหม
  @Column({ type: 'int', default: 0 })
  installationQty: number; // จำนวนชิ้นที่ต้องการให้ติดตั้ง

}