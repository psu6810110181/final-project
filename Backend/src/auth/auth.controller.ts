import { Controller, Post, Body, Param, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // 1. ล็อกอินเข้าสู่ระบบ
  @Post('login')
  async login(@Body() req) {
    // รับ username, password มาเช็ค
    const user = await this.authService.validateUser(req.username, req.password);
    if (!user) {
      throw new UnauthorizedException('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
    }
    return this.authService.login(user);
  }

  // 2. ขอรีเซ็ตรหัสผ่าน (ส่งอีเมล)
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }

  // 3. ตั้งรหัสผ่านใหม่ (ผ่านลิงก์ที่ส่งไปในอีเมล)
  @Post('reset-password/:token')
  async resetPassword(
    @Param('token') token: string,
    @Body('password') password: string,
  ) {
    return this.authService.resetPassword(token, password);
  }
}