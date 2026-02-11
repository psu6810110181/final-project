import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt'; // 1. import bcrypt

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

// src/users/users.service.ts

  async create(createUserDto: CreateUserDto) {
    // 1. สร้าง Object User ใหม่
    const newUser = this.usersRepository.create(createUserDto);
    
    // 2. 🛡️ บังคับยัดเยียดให้เป็น 'user' เท่านั้น! (ป้องกัน Hacker ส่ง role: admin มา)
    newUser.role = 'user'; 

    // 3. เข้ารหัสรหัสผ่าน (ถ้ายังไม่ได้ทำ)
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(createUserDto.password, salt);

    // 4. บันทึก
    return await this.usersRepository.save(newUser);
  }

  async updateRole(id: string, role: string) {
    // 1. หา User คนนั้นก่อน
    const user = await this.usersRepository.findOne({ where: { id } });
    
    // 2. ถ้าไม่เจอ ให้แจ้ง error
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // 3. เปลี่ยน Role
    user.role = role;

    // 4. บันทึก
    return await this.usersRepository.save(user);
  }

  async findOneByUsername(username: string) { // 4. เพิ่มฟังก์ชันหาด้วย username (เอาไว้ใช้ตอน Login)
    return await this.usersRepository.findOneBy({ username });
  }

  // ... (findAll, findOne, update, remove อันเดิมคงไว้เหมือนเดิม) ...
  async findAll() { return await this.usersRepository.find(); }
  
  async findOne(id: string) {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User not found`);
      return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // 1. ตรวจสอบว่าในข้อมูลที่ส่งมา มีการขอเปลี่ยน password ไหม
    if (updateUserDto.password) {
      // 🔐 ถ้ามี ให้ทำการ Hash ก่อนเซฟ
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // 2. รวมข้อมูลใหม่ทับข้อมูลเก่า
    Object.assign(user, updateUserDto);

    // 3. บันทึก
    return await this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.usersRepository.remove(user);
  }
}