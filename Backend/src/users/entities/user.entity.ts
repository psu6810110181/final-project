import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Review } from '../../reviews/entities/review.entity';
import { CartItem } from '../../cart_items/entities/cart_item.entity';

@Entity('user') // ชื่อตารางใน DB
export class User {
  // [cite: 2, 3, 4] PK เป็น Varchar(255) -> ใช้ UUID
  @PrimaryGeneratedColumn('uuid', { name: 'user_id' })
  id: string;

  // [cite: 5, 6] user_image Varchar(255)
  @Column({ name: 'user_image', length: 255, nullable: true })
  userImage: string;

  // [cite: 7, 8, 9] username Varchar(50) NOT NULL
  @Column({ length: 50 })
  username: string;

  // [cite: 11, 12, 13] password Varchar(100) NOT NULL
  @Column({ length: 100 })
  password: string;

  // [cite: 20, 21] email Varchar(100) NOT NULL
  @Column({ length: 100, unique: true })
  email: string;

  // [cite: 25, 26] phone Varchar(15)
  @Column({ length: 15, nullable: true })
  phone: string;

  // [cite: 30, 31] address Varchar(255)
  @Column({ length: 255, nullable: true })
  address: string;

  // [cite: 32, 33] role Varchar(15)
  @Column({ length: 15, default: 'user' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  // [cite: 39] User "places" Order
  //@OneToMany(() => Order, (order) => order.user)
  //orders: Order[];

  // [cite: 38] User "writes" Review
  //@OneToMany(() => Review, (review) => review.user)
 // reviews: Review[];
  @OneToMany(() => CartItem, (cartItem) => cartItem.user)
  cartItems: CartItem[];
}