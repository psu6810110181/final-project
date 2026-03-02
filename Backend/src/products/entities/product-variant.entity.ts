import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Product } from './product.entity';

@Entity()
export class ProductVariant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  color: string;

  @Column({ length: 50 })
  material: string;

  @Column({ length: 50 })
  size: string; // หรือจะแยกเป็น width/length/height ก็ได้ แต่นิยมรวมเป็น string เช่น "10x20x30 cm" เพื่อความง่ายในการเลือก

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('int')
  stock: number;

  @Column({ nullable: true })
  image: string;

  @ManyToOne(() => Product, (product) => product.variants, { onDelete: 'CASCADE' })
  product: Product;
}