import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true; // ถ้าไม่ได้ระบุ Role แปลว่าใครก็เข้าได้
    }
    const { user } = context.switchToHttp().getRequest();
    
    // user.role ต้องตรงกับที่ระบุ (เช่น user เป็น 'admin' ถึงจะผ่าน)
    return requiredRoles.includes(user.role);
  }
}