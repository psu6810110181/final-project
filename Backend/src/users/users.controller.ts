import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UpdateRoleDto } from './dto/update-role.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. สมัครสมาชิก
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ---------------------------------------------------------
  // ✅ [NEW] เพิ่มอันนี้ครับ: แก้ไขโปรไฟล์ตัวเอง (ที่อยู่/เบอร์โทร)
  // ---------------------------------------------------------
  // ต้องวางไว้ "ก่อน" @Patch(':id') นะครับ ไม่งั้นมันจะชนกัน
  @Patch('profile')
  @UseGuards(AuthGuard('jwt')) // แค่ Login ก็เข้าได้
  async updateProfile(@Req() req, @Body() body: { address?: string; phone?: string; email?: string }) {
    // ดึง ID จาก Token โดยตรง (req.user.id) -> ปลอดภัย 100% แก้ของคนอื่นไม่ได้
    return this.usersService.updateProfile(req.user.id, body);
  }

  // 2. ดูรายชื่อ User ทั้งหมด (Admin)
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // 3. ดูข้อมูล User ตาม ID
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) 
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 4. แก้ไขข้อมูล (แบบ Admin แก้ให้ หรือแก้แบบระบุ ID)
  // อันนี้เอาไว้ให้ Admin ใช้แก้ Password หรือข้อมูลสำคัญให้ User
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin') // 🔒 ล็อกให้เฉพาะ Admin ใช้ท่านั้น (User ธรรมดาให้ไปใช้ /profile ข้างบน)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 5. ลบ User (Admin)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 6. เปลี่ยน Role (Admin)
  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() req: any) {
    if (id === req.user.id) { 
      throw new ForbiddenException('Admin cannot change their own role');
    }
    return this.usersService.updateRole(id, updateRoleDto.role);
  }
}