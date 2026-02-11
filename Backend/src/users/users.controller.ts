import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards,Req,ForbiddenException} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport'; // 1. ตรวจสอบว่า Login หรือยัง
import { RolesGuard } from '../auth/roles.guard'; // 2. ตรวจสอบว่าเป็น Role อะไร (ดึงจากไฟล์เมื่อวาน)
import { Roles } from '../auth/roles.decorator'; // 3. ตัวแปะป้ายว่าใครเข้าได้บ้าง
import { UpdateRoleDto } from './dto/update-role.dto';
import { Request } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // 🟢 1. สมัครสมาชิก (Register) -> เปิดสาธารณะ ใครก็เข้าได้
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // 🔴 2. ดูรายชื่อ User ทั้งหมด -> ต้องเป็น Admin เท่านั้น
  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard) // ต้อง Login + ต้องผ่านด่านตรวจ Role
  @Roles('admin') // ระบุว่า "เฉพาะ admin นะ"
  findAll() {
    return this.usersService.findAll();
  }

  // 🟡 3. ดูข้อมูล User คนใดคนหนึ่ง -> ต้อง Login แล้ว
  @Get(':id')
  @UseGuards(AuthGuard('jwt')) 
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // 🟡 4. แก้ไขข้อมูล -> ต้อง Login แล้ว
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  // 🔴 5. ลบ User -> อันตราย! ให้เฉพาะ Admin ทำได้
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/role')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  updateRole(
    @Param('id') id: string, 
    @Body() updateRoleDto: UpdateRoleDto,
    @Req() req: any, // 👈 รับค่า Request มาเพื่อดูว่า "ใครเป็นคนกด"
  ) {
    // 🛡️ เช็ค: ถ้า ID ที่จะแก้ ตรงกับ ID ของตัวเอง -> ห้ามทำ!
    if (id === req.user.id) { 
      throw new ForbiddenException('Admin cannot change their own role');
    }

    return this.usersService.updateRole(id, updateRoleDto.role);
  }
}