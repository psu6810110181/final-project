import { Controller, Post, Get, Body, Param, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
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

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res) {
    try {
      const result = await this.authService.googleLogin(req.user);
      
      // ✅ ดึง URL ของ Frontend จาก .env (ถ้าไม่มีจะตกหล่นไปใช้ localhost)
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      
      res.redirect(
        `${frontendUrl}/auth/callback?token=${result.access_token}&user=${encodeURIComponent(JSON.stringify(result.user))}`
      );
    } catch (error) {
      console.error('Google callback error:', error);
      
      // ✅ แก้ให้ตอน Error ก็เด้งกลับไปที่โดเมนจริงด้วย
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
      res.redirect(`${frontendUrl}/login`);
    }
  }
}