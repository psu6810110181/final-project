import { IsInt, Min, IsNotEmpty } from 'class-validator';

export class UpdateCartDto {
  @IsNotEmpty()
  @IsInt({ message: 'จำนวนต้องเป็นตัวเลขจำนวนเต็มเท่านั้น' }) // กันทศนิยม (1.5)
  @Min(1, { message: 'จำนวนต้องมีอย่างน้อย 1 ชิ้น' })      // กันเลข 0 และ ติดลบ
  quantity: number;
}