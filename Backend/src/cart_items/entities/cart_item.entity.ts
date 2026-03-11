import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Product } from '../../products/entities/product.entity';
import { ProductVariant } from '../../products/entities/product-variant.entity'; // ✅ นำเข้า ProductVariant

@Entity()
export class CartItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', default: 1 })
  quantity: number; // จำนวนสินค้าที่เลือก

  // 🔗 ความสัมพันธ์: User 1 คน มี CartItem ได้หลายอัน
  @ManyToOne(() => User, (user) => user.cartItems, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'int', default: 0 })
  installationQty: number; // จำนวนชิ้นที่ต้องการให้ติดตั้ง

  // 🔗 ความสัมพันธ์: Product 1 ชิ้น ไปอยู่ใน CartItem ของหลายคนได้
  @ManyToOne(() => Product, (product) => product.cartItems, { onDelete: 'CASCADE' })
  product: Product;

  // ✅ เพิ่มความสัมพันธ์: ผูกกับ Variant (ตัวเลือกสินค้า)
  // ใส่ nullable: true ไว้ เผื่อสินค้าชิ้นนั้นเป็นสินค้าเดี่ยวๆ ไม่มีตัวเลือก
  @ManyToOne(() => ProductVariant, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'variant_id' }) // ระบุชื่อคอลัมน์ใน DB ให้ชัดเจน
  variant: ProductVariant;
}
  variant: ProductVariant;
}