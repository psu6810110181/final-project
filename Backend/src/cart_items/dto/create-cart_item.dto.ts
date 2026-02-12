import { IsNotEmpty, IsNumber, Min, IsUUID, IsOptional, IsBoolean } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  // 👇 เพิ่มส่วนนี้เข้าไปครับ
  @IsOptional()
  @IsBoolean()
  requestInstallation?: boolean; 
}