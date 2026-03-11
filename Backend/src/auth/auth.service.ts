import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  // 1. ตรวจสอบว่า Username/Password ถูกไหม
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByUsername(username);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password, ...result } = user; // ตัด password ออกก่อนส่งกลับ
      return result;
    }
    return null;
  }

  // 2. สร้าง Token (Login สำเร็จ)
  async login(user: any) {
    const payload = { username: user.username, sub: user.id, role: user.role }; // แนบ Role ไปใน Token เลย
    return {
      access_token: this.jwtService.sign(payload),
      user: { 
        id: user.id,
        username: user.username,
        role: user.role,
        address: user.address,     // ✅ เพิ่มบรรทัดนี้ ส่งที่อยู่กลับไป
        email: user.email,         // ✅ (แนะนำ) ส่ง email เผื่อได้ใช้ในหน้า Profile
        phone: user.phone,         // ✅ (แนะนำ) ส่งเบอร์โทร
        userImage: user.userImage  // ✅ (แนะนำ) ส่งรูปภาพโปรไฟล์
      }
    };
  }
  async forgotPassword(email: string) {
    const user = await this.usersService.findOneByEmail(email); // ต้องมั่นใจว่าใน UsersService มี findOneByEmail
    if (!user) {
      throw new NotFoundException('ไม่พบบัญชีที่ใช้อีเมลนี้');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetPasswordExpires = new Date(Date.now() + 3600000); // หมดอายุใน 1 ชั่วโมง

    // บันทึก Token ลง DB (ต้องไปเพิ่มฟังก์ชัน update ใน usersService ด้วย)
    await this.usersService.updateResetToken(user.id, resetToken, resetPasswordExpires);

    const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;

    await this.mailerService.sendMail({
      to: user.email,
      subject: 'คำขอรีเซ็ตรหัสผ่าน - HomeAlright',
      html: `
        <h3>สวัสดีคุณ ${user.username}</h3>
        <p>คุณได้ทำการขอรีเซ็ตรหัสผ่าน กรุณาคลิกที่ลิงก์ด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
        <a href="${resetUrl}">คลิกที่นี่เพื่อรีเซ็ตรหัสผ่าน</a>
        <p>ลิงก์นี้จะหมดอายุใน 1 ชั่วโมง หากคุณไม่ได้เป็นผู้ขอ กรุณาเพิกเฉยต่ออีเมลฉบับนี้</p>
      `,
    });

    return { message: 'ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว' };
  }
  // 4. ฟังก์ชันรีเซ็ตรหัสผ่านใหม่
  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByResetToken(token); // ต้องเพิ่มใน UsersService
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new BadRequestException('ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // อัปเดตรหัสผ่านใหม่และเคลียร์ Token
    await this.usersService.updatePasswordAndClearToken(user.id, hashedPassword);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ สามารถเข้าสู่ระบบได้เลย' };
  }
}
