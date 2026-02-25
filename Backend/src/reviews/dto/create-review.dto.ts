import { IsInt, IsString, Min, Max, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsUUID() // เปลี่ยนจาก IsInt เป็น IsUUID
  @IsNotEmpty()
  productId: string; // เปลี่ยนจาก number เป็น string

  @IsUUID() // เปลี่ยนจาก IsInt เป็น IsUUID
  @IsNotEmpty()
  orderId: string; // เปลี่ยนจาก number เป็น string

  @IsInt()
  @Min(1)
  @Max(5)
  @IsNotEmpty()
  rating: number;

  @IsString()
  @IsOptional()
  comment?: string;
}