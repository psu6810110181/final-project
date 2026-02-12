// src/products/entities/product.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { CartItem } from '../../cart_items/entities/cart_item.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 0 })
  price: number; // ใส่ไว้กันเหนียว เพราะเดี๋ยว Cart ต้องใช้คำนวณ

  @Column({ default: 'Test Product' })
  name: string;

  @Column({ default: 0 })
  stock: number;

  @Column({ nullable: true }) // ยอมให้เป็น null ได้ (กัน error เพราะข้อมูลเก่าเรายังไม่มีรูป)
  image: string;

  // 🔗 ต้องมีอันนี้ CartItem ถึงจะหายแดง
  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];
}