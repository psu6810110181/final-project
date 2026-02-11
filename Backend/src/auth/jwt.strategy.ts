import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'; // 1. Import

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 2. Inject ConfigService เข้ามา
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET')!, // 3. ดึงค่าจาก .env ตรงนี้
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username, role: payload.role };
  }
}