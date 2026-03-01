import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { Product } from '../products/entities/product.entity';

@Entity('promotions')
export class Promotion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ['PERCENTAGE', 'FIXED_AMOUNT'],
    default: 'PERCENTAGE'
  })
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';

  @Column('decimal', { precision: 5, scale: 2 })
  discountValue: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isFlashSale: boolean;

  @ManyToMany(() => Product, product => product.promotions)
  @JoinTable({
    name: 'promotion_products',
    joinColumn: { name: 'promotion_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' }
  })
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
