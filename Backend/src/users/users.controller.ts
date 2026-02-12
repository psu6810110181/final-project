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
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/profiles',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `user-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  async updateProfile(
    @Req() req, 
    @Body() body: UpdateUserDto, 
    @UploadedFile() file?: Express.Multer.File 
  ) {
    if (file) {
      body.userImage = file.filename;
    }
    
    // ✅ ใช้ ID จาก Token เสมอ เพื่อความปลอดภัย
    return this.usersService.update(req.user.id, body); 
  }

  // 2. ดูรายชื่อ User ทั้งหมด (Admin)
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() {
    return this.usersService.findAll();
  }

  // 3. ดูข้อมูล User ตาม ID (Secure 🔒)
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) 
  findOne(@Param('id') id: string, @Req() req) {
    // 🛡️ Security Check: ต้องเป็น Admin หรือ เจ้าของ ID เท่านั้น
    if (req.user.role !== 'admin' && req.user.id !== id) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์ดูข้อมูลผู้ใช้นี้');
    }
    return this.usersService.findOne(id);
  }

  // 4. แก้ไขข้อมูล (Admin)
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file', {
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