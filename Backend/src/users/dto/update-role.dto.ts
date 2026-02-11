import { IsString, IsIn } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsIn(['user', 'admin']) // 🔒 บังคับว่าต้องเป็นคำว่า 'user' หรือ 'admin' เท่านั้น
  role: string;
}