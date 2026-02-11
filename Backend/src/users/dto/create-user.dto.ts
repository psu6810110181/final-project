import { IsString, IsEmail, IsNotEmpty, IsOptional, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
  // username Varchar(50) NOT NULL
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกชื่อผู้ใช้' })
  @MaxLength(50, { message: 'ชื่อผู้ใช้ห้ามเกิน 50 ตัวอักษร' })
  username: string;

  // password Varchar(100) NOT NULL
  @IsString()
  @IsNotEmpty({ message: 'กรุณากรอกรหัสผ่าน' })
  @MinLength(6, { message: 'รหัสผ่านต้องยาวอย่างน้อย 6 ตัว' }) // เพิ่มขั้นต่ำให้เพื่อความปลอดภัย
  @MaxLength(100)
  password: string;

  // email Varchar(100) NOT NULL
  @IsEmail({}, { message: 'รูปแบบอีเมลไม่ถูกต้อง' })
  @IsNotEmpty({ message: 'กรุณากรอกอีเมล' })
  @MaxLength(100)
  email: string;

  // phone Varchar(15)
  @IsOptional() // ใน ERD ไม่ได้ขีดเส้นใต้ว่า NOT NULL ชัดเจน ขอเผื่อเป็น Optional ไว้ก่อนครับ
  @IsString()
  @MaxLength(15, { message: 'เบอร์โทรห้ามเกิน 15 หลัก' })
  phone?: string;

  // address Varchar(255)
  @IsOptional()
  @IsString()
  @MaxLength(255)
  address?: string;

  // user_image Varchar(255)
  @IsOptional() // ตอนสมัครสมาชิกอาจจะยังไม่มีรูป ให้ว่างได้ไปก่อน
  @IsString()
  userImage?: string;

  // role Varchar(15)
  @IsOptional()
  @IsString()
  @MaxLength(15)
  role?: string; // ถ้าไม่ส่งมา ใน Entity เราตั้ง default เป็น 'user' ไว้แล้ว
}