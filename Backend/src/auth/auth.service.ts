import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
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
    };
  }
}