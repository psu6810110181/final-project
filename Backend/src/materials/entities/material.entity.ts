import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Material {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;
}