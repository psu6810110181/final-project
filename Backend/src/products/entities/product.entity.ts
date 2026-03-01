import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { CartItem } from '../../cart_items/entities/cart_item.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Promotion } from '../../promotions/promotion.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true }) // เพิ่มรายละเอียดสินค้า
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ default: 'General' })
  category: string; // หมวดหมู่สินค้า (Single Select)

  // เพิ่มหมวดหมู่ห้อง (Single Select)
  @Column({ nullable: true })
  room: string; 

  // เพิ่มคุณสมบัติพิเศษ (Multi Select) - เก็บเป็น Array ของ String
  @Column("simple-array", { nullable: true }) 
  features: string[];

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => ProductVariant, (variant) => variant.product, { cascade: true })
  variants: ProductVariant[];

  @Column({ default: false })
  isInstallable: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @ManyToMany(() => Promotion, promotion => promotion.products)
  promotions: Promotion[];
}