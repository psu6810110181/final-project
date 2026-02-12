import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  // 👇 เพิ่มอันนี้ (ต้องชื่อตรงกับ Entity นะครับ)
  userImage?: string; 
}