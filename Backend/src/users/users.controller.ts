import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException,
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import sharp from 'sharp'; // ใช้ sharp แบบนี้ตามที่คุณแก้ไว้
import * as fs from 'fs';
import * as path from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. สมัครสมาชิก
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ---------------------------------------------------------
  // ✅ แก้ไขโปรไฟล์ตัวเอง + อัปโหลดรูปภาพ (มี Sharp Resize) 🖼️
  // ---------------------------------------------------------
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file')) // รับไฟล์จาก Frontend ที่ชื่อฟิลด์ 'file'
  async updateProfile(
    @Req() req, 
    @Body() body: UpdateUserDto, 
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false, // ไม่บังคับว่าต้องมีรูป (เผื่อแก้แค่ชื่อ/เบอร์โทร)
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // Max 5MB
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }), // เฉพาะไฟล์รูป
        ],
      }),
    ) file?: Express.Multer.File 
  ) {
    // ถ้ามีการอัปโหลดไฟล์มาด้วย ให้ทำการ Resize
    if (file) {
      const filename = `user-${req.user.id}-${Date.now()}.jpeg`;
      const uploadPath = path.join('./uploads/profiles', filename);

      // สร้างโฟลเดอร์ถ้ายังไม่มี
      if (!fs.existsSync('./uploads/profiles')) {
        fs.mkdirSync('./uploads/profiles', { recursive: true });
      }

      // ✅ ใช้ Sharp ย่อรูปและบันทึก
      await sharp(file.buffer)
        .resize(300, 300, { // บังคับขนาด 300x300 pixel เพื่อให้เป็นสี่เหลี่ยมจัตุรัสพอดี
          fit: 'cover',
        })
        .toFormat('jpeg')
        .jpeg({ quality: 80 }) // ลดขนาดไฟล์ลงเล็กน้อยเพื่อความเร็ว
        .toFile(uploadPath);
      
      // เอาชื่อไฟล์ใส่เข้าไปใน DTO เพื่อไปอัปเดตลง DB (เก็บแค่ชื่อไฟล์พอ)
      body.userImage = filename;
    }
    
    // อัปเดตข้อมูล (ใช้ ID จาก Token ที่ล็อกอินอยู่)
    return this.usersService.update(req.user.id, body); 
  }

  // ---------------------------------------------------------
  // 📧 ขอเปลี่ยน Email
  // ---------------------------------------------------------
  @Post('change-email-request')
  @UseGuards(AuthGuard('jwt'))
  async requestEmailChange(@Req() req, @Body() body: { currentPassword: string; newEmail: string }) {
    return this.usersService.requestEmailChange(req.user.id, body.currentPassword, body.newEmail);
  }

  // ---------------------------------------------------------
  // 🔑 เปลี่ยนรหัสผ่าน
  // ---------------------------------------------------------
  @Post('change-password')
  @UseGuards(AuthGuard('jwt'))
  async changePassword(@Req() req, @Body() body: { currentPassword: string; newPassword: string }) {
    return this.usersService.changePassword(req.user.id, body.currentPassword, body.newPassword);
  }

  // 2. ดูรายชื่อ User ทั้งหมด (Admin เท่านั้น)
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // ✅ เพิ่ม Endpoint ดึง Profile ของตัวเอง (ที่ Frontend ต้องใช้แสดงข้อมูล)
  @Get('profile/me')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Req() req) {
    return this.usersService.findOne(req.user.id);
  }

  // 3. ดูข้อมูล User ตาม ID (ดูได้เฉพาะตัวเอง หรือ Admin)
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) 
  findOne(@Param('id') id: string, @Req() req) {
    if (req.user.role !== 'admin' && req.user.id !== id) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์ดูข้อมูลผู้ใช้นี้');
    }
    return this.usersService.findOne(id);
  }

  // 4. แก้ไขข้อมูลผู้ใช้โดย Admin 
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file')) // ให้ Admin อัปโหลดรูปให้ User ได้ด้วย
  async update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      const filename = `user-${id}-${Date.now()}.jpeg`;
      const uploadPath = path.join('./uploads/profiles', filename);
      
      if (!fs.existsSync('./uploads/profiles')) {
        fs.mkdirSync('./uploads/profiles', { recursive: true });
      }

      await sharp(file.buffer)
        .resize(300, 300, { fit: 'cover' })
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(uploadPath);

      updateUserDto.userImage = filename;
    }
    return this.usersService.update(id, updateUserDto);
  }

  // 5. ลบ User (Admin เท่านั้น)
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  // 6. เปลี่ยน Role (Admin เท่านั้น)
  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  updateRole(@Param('id') id: string, @Body() updateRoleDto: UpdateRoleDto, @Req() req: any) {
    // ป้องกันไม่ให้ Admin ลดสิทธิ์ตัวเองโดยไม่ได้ตั้งใจ
    if (id === req.user.id) { 
      throw new ForbiddenException('ไม่สามารถเปลี่ยนสถานะบัญชีของตัวเองได้');
    }
    return this.usersService.updateRole(id, updateRoleDto.role);
  }
}