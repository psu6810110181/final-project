import { IsNotEmpty, IsNumber, Min, IsUUID } from 'class-validator';

export class CreateCartItemDto {
  @IsNotEmpty()
  @IsUUID()
  productId: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantity: number;
}