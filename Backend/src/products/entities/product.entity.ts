import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn, ManyToMany } from 'typeorm';
import { CartItem } from '../../cart_items/entities/cart_item.entity';
import { ProductVariant } from './product-variant.entity';
import { Review } from '../../reviews/entities/review.entity';
import { Promotion } from '../../promotions/promotion.entity';
// ✅ 1. เพิ่ม Import OrderItem
import { OrderItem } from '../../order_items/entities/order_item.entity'; 

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true }) 
  description: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  price: number;

  @Column('int', { default: 0 })
  stock: number;

  @Column({ default: 'General' })
  category: string; 

  @Column({ nullable: true })
  room: string; 

  @Column("simple-array", { nullable: true }) 
  features: string[];

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  color: string;

  @Column({ nullable: true })
  material: string;

  @Column({ nullable: true })
  size: string;

  @Column('int', { nullable: true })
  mainStock: number;

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

  // ✅ 2. เพิ่ม Property orderItems เพื่อผูกความสัมพันธ์กับ OrderItem
  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];
}