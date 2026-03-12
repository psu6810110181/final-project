import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
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
    if (user) {
        delete (user as any).password;
    }
    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const existingUser = await this.usersRepository.findOne({
      where: [
        { email: createUserDto.email },
        { username: createUserDto.username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === createUserDto.email) {
        throw new ConflictException('อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่น');
      }
      if (existingUser.username === createUserDto.username) {
        throw new ConflictException('ชื่อผู้ใช้งานนี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น');
      }
    }

    const newUser = this.usersRepository.create(createUserDto);
    
    const salt = await bcrypt.genSalt();
    newUser.password = await bcrypt.hash(createUserDto.password, salt);
    
    const savedUser = await this.usersRepository.save(newUser);
    return this.sanitizeUser(savedUser);
  }

  // ---------------------------------------------------------
  // 📧 Logic สำหรับขอเปลี่ยน Email
  // ---------------------------------------------------------
  async requestEmailChange(userId: string, currentPassword: string, newEmail: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // ตรวจสอบว่า Email ใหม่ซ้ำกับในระบบไหม
    const existingEmail = await this.usersRepository.findOne({ where: { email: newEmail } });
    if (existingEmail) {
      throw new BadRequestException('อีเมลนี้มีผู้ใช้งานแล้ว');
    }

    // *จำลองการเปลี่ยนอีเมล (ในอนาคตอาจจะเพิ่มระบบส่งอีเมลยืนยัน)*
    user.email = newEmail;
    await this.usersRepository.save(user);

    return { message: 'เปลี่ยนอีเมลสำเร็จ' };
  }

  // ---------------------------------------------------------
  // 🔑 Logic สำหรับเปลี่ยนรหัสผ่าน
  // ---------------------------------------------------------
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    // ตรวจสอบรหัสผ่านปัจจุบัน
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');
    }

    // เข้ารหัส (Hash) รหัสผ่านใหม่
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // บันทึกลง Database
    user.password = hashedPassword;
    await this.usersRepository.save(user);

    return { message: 'เปลี่ยนรหัสผ่านสำเร็จ' };
  }

  async findAll() { 
    const users = await this.usersRepository.find();
    return users.map(user => this.sanitizeUser(user));
  }
  
  async findOne(id: string) {
      const user = await this.usersRepository.findOneBy({ id });
      if (!user) throw new NotFoundException(`User not found`);
      return this.sanitizeUser(user);
  }

  async findOneByUsername(username: string) {
    return await this.usersRepository.findOneBy({ username });
  }

  // ✅ 1. เพิ่มฟังก์ชันหา User ด้วย Email
  async findOneByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.usersRepository.findOneBy({ id }); 
    if (!user) throw new NotFoundException('User not found');

    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt();
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, salt);
    }

    Object.assign(user, updateUserDto);
    
    const updatedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(updatedUser);
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

  async updateProfileImage(userId: string, filename: string) {
    const user = await this.usersRepository.findOneBy({ id: userId });
    
    if (!user) {
        throw new NotFoundException('User not found');
    }

    user.userImage = filename;
    
    const savedUser = await this.usersRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  // ✅ 2. เพิ่มฟังก์ชันบันทึก Token สำหรับรีเซ็ตรหัสผ่าน
  async updateResetToken(id: string, token: string, expires: Date) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    // ต้องแน่ใจว่าใน Entity มี 2 column นี้นะครับ
    (user as any).resetPasswordToken = token;
    (user as any).resetPasswordExpires = expires;

    await this.usersRepository.save(user);
  }

  // ✅ 3. เพิ่มฟังก์ชันค้นหา User จาก Token
  async findByResetToken(token: string) {
    return await this.usersRepository.findOne({
      where: { resetPasswordToken: token } as any
    });
  }

  // ✅ 4. เพิ่มฟังก์ชันอัปเดตรหัสผ่านใหม่และลบ Token ทิ้ง
  async updatePasswordAndClearToken(id: string, hashedPassword: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    user.password = hashedPassword;
    (user as any).resetPasswordToken = null;
    (user as any).resetPasswordExpires = null;

    await this.usersRepository.save(user);
  }
}