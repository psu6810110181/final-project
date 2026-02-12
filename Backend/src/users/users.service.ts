import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = this.usersRepository.create(createUserDto);
    newUser.role = 'user'; 
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(createUserDto.password, salt);
    return await this.usersRepository.save(newUser);
  }

  // ---------------------------------------------------------
  // ✅ [NEW] ฟังก์ชันสำหรับ User แก้ข้อมูลตัวเอง
  // ---------------------------------------------------------
  async updateProfile(id: string, updateData: { address?: string; phone?: string; email?: string }) {
    // 1. หา User
    const user = await this.findOne(id);

    // 2. อัปเดตเฉพาะค่าที่ส่งมา (ถ้าไม่ส่งมา ให้ใช้ค่าเดิม)
    // เขียนแบบนี้ชัดเจนและปลอดภัยกว่า Object.assign สำหรับเคสนี้ครับ
    if (updateData.address !== undefined) user.address = updateData.address;
    if (updateData.phone !== undefined) user.phone = updateData.phone;
    // if (updateData.email !== undefined) user.email = updateData.email; // ถ้าจะให้แก้เมลด้วย

    // 3. บันทึก
    return await this.usersRepository.save(user);
  }

  async updateRole(id: string, role: string) {
    const user = await this.findOne(id);
    user.role = role;
    return await this.usersRepository.save(user);
  }

  async findOneByUsername(username: string) {
    return await this.usersRepository.findOneBy({ username });
  }

  async findAll() { return await this.usersRepository.find(); }
  
  async findOne(id: string) {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User not found`);
      return user;
  }

  // อันนี้สำหรับ Admin แก้ไขข้อมูล (รวมถึง Reset Password)
  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.usersRepository.remove(user);
  }
}