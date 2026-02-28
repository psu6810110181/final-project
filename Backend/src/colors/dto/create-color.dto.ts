import { IsString, IsNotEmpty } from 'class-validator';

export class CreateColorDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}