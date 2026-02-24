import { IsNumber, IsString, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsOptional()
  comment: string;

  @IsNumber()
  productId: number;
}