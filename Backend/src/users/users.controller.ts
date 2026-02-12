import { 
  Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, ForbiddenException,
  UseInterceptors, UploadedFile, BadRequestException
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
// 👇 import สำหรับจัดการไฟล์
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 1. สมัครสมาชิก
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // ---------------------------------------------------------
  // ✅ แก้ไขโปรไฟล์ตัวเอง + อัปโหลดรูปภาพ 🖼️
  // ---------------------------------------------------------
  @Patch('profile')
  @UseGuards(AuthGuard('jwt'))
  @UseInterceptors(FileInterceptor('file', { // รับไฟล์ชื่อ 'file' จาก Frontend
    storage: diskStorage({
      destination: './uploads/profiles', // เก็บในโฟลเดอร์นี้
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `user-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async updateProfile(
    @Req() req, 
    @Body() body: UpdateUserDto, // ใช้ UpdateUserDto เพื่อรองรับทุก field (address, phone, etc.)
    @UploadedFile() file?: Express.Multer.File 
  ) {
    // ถ้ามีรูปแนบมาด้วย ให้เพิ่มชื่อรูปลงใน body
    if (file) {
      body.userImage = file.filename;
    }
    
    // เรียก Service โดยใช้ ID จาก Token (req.user.userId) -> ปลอดภัย
    // หมายเหตุ: เช็คใน JWT Strategy อีกทีนะครับว่าใช้ .userId หรือ .id หรือ .sub
    // ปกติถ้าใช้ req.user.id ก็ใส่ req.user.id ครับ
    return this.usersService.update(req.user.id, body); 
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

  // 4. แก้ไขข้อมูล (Admin แก้ให้ User อื่น)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', { // Admin ก็ควรอัปรูปให้ User ได้ด้วย
     storage: diskStorage({
      destination: './uploads/profiles', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `user-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(
    @Param('id') id: string, 
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (file) {
      updateUserDto.userImage = file.filename;
    }
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