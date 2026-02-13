import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'; // ✅ เพิ่ม ConflictException
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

  // Helper function: ลบ password ออกจาก user object
  private sanitizeUser(user: User): User {
    if (user) delete (user as any).password;
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    // 🚨 1. ตรวจสอบว่ามี username หรือ email นี้ในระบบหรือยัง
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username }
      ]
    });

    // 🚨 2. ถ้าเจอข้อมูลซ้ำ ให้โยน Error แจ้งเตือนแบบเจาะจง
    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
      }
    }

    // 3. ถ้าไม่ซ้ำ ก็ดำเนินการสร้าง User ใหม่ตามปกติ
    const newUser = this.usersRepository.create(createUserDto);
    // newUser.role = 'user'; // (ปกติ default ใน Entity จะเป็น user อยู่แล้ว แต่ใส่ไว้ก็ดีครับ)
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(createUserDto.password, salt);
    
    await this.usersRepository.save(newUser);
    return this.sanitizeUser(newUser); // ✅ ส่งกลับแบบไม่มี password
  }

  async findAll() { 
    const users = await this.usersRepository.find();
    return users.map(user => this.sanitizeUser(user)); // ✅ ลบ password ทุกคน
  }
  
  async findOne(id: string) {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User not found`);
      return this.sanitizeUser(user); // ✅ ลบ password
  }

  async findOneByUsername(username: string) {
    // ⚠️ อันนี้ต้อง 'มี password' เพราะต้องเอาไปเช็คตอน Login
    // ห้ามใช้ใน Controller ที่ส่งข้อมูลกลับหา User โดยตรง
    return await this.usersRepository.findOneBy({ username });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // ต้องใช้ findOne แบบติด password มาก่อน เพื่อมา update
    // แต่เราใช้ findOneBy ({ id }) แทน findOne() ของเรา เพราะ findOne() ของเราลบ password ไปแล้ว
    const user = await this.usersRepository.findOneBy({ id }); 
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    // รวมร่างข้อมูล
    Object.assign(user, updateUserDto);
    
    const updatedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(updatedUser); // ✅ ส่งกลับแบบไม่มี password
  }

  async updateRole(id: string, role: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    
    user.role = role;
    const savedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  async remove(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');
    return await this.usersRepository.remove(user);
  }
}