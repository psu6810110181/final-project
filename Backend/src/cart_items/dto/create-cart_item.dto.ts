import { IsNotEmpty, IsNumber, Min, IsUUID, IsOptional } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  installationQty?: number;

  // ✅ เพิ่มฟิลด์รับ ID ของ Variant (เป็น Optional เผื่อสินค้าไม่มีตัวเลือก)
  @IsOptional()
  @IsNumber()
  variantId?: number;
}