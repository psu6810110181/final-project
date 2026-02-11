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

  async create(createUserDto: CreateUserDto) {
    // 2. เข้ารหัส Password ก่อนบันทึก
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    // 3. สร้าง User ด้วยรหัสผ่านที่เข้ารหัสแล้ว
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    
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
    Object.assign(user, updateUserDto);
    return await this.usersRepository.save(user);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    return await this.usersRepository.remove(user);
  }
}