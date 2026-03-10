import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CreateProductVariantDto {
  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsOptional()
  price?: number;

  @IsNumber()
  @IsOptional()
  stock?: number;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  price: number; // ราคาโชว์หน้าแรก

  // 👈 เพิ่ม stock เข้าไปในคลาสหลักด้วย เพราะหน้า Home เรียกใช้ค่านี้
  @IsNumber()
  @IsOptional()
  @Type(() => Number) // 👈 เพิ่มบรรทัดนี้
  stock?: number;

  @IsString()
  @IsOptional()
  room?: string;

  @IsArray()
  @IsOptional()
  features?: string[];
  
  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsOptional()
  image?: string;

  // Main product attributes
  @IsString()
  @IsOptional()
  color?: string;

  @IsString()
  @IsOptional()
  material?: string;

  @IsString()
  @IsOptional()
  size?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  mainStock?: number;

  // 👇 รับค่าเป็น Array ของ Variants
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants?: CreateProductVariantDto[];
}