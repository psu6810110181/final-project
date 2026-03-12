import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private mailerService: MailerService, // Inject MailerService
  ) {}

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
  // 📧 1. ขอเปลี่ยน Email (ส่งลิงก์ยืนยันไปที่อีเมลใหม่)
  // ---------------------------------------------------------
  async requestEmailChange(userId: string, currentPassword: string, newEmail: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');

    const existingEmail = await this.usersRepository.findOne({ where: { email: newEmail } });
    if (existingEmail) throw new BadRequestException('อีเมลนี้มีผู้ใช้งานแล้ว');

    // สร้าง Token มีอายุ 15 นาที
    const token = jwt.sign({ id: user.id, newEmail }, process.env.JWT_SECRET || 'homealright-secret', { expiresIn: '15m' });
    
    // สร้างลิงก์ยืนยัน (ชี้ไปที่ Frontend)
    const confirmUrl = `http://localhost:5173/verify-email?token=${token}`;

    try {
      // ส่งอีเมล
      await this.mailerService.sendMail({
        to: newEmail,
        subject: 'ยืนยันการเปลี่ยนอีเมล - HomeAlright',
        html: `
          <div style="font-family: Arial, sans-serif; text-align: center; color: #333; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #148F96;">HomeAlright</h2>
            <p>สวัสดีคุณ <b>${user.username}</b></p>
            <p>ระบบได้รับคำขอเปลี่ยนอีเมลของคุณเป็น <b>${newEmail}</b></p>
            <p>กรุณาคลิกปุ่มด้านล่างเพื่อยืนยัน (ลิงก์จะหมดอายุใน 15 นาที):</p>
            <a href="${confirmUrl}" style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #148F96; color: white; text-decoration: none; border-radius: 8px; font-weight: bold;">ยืนยันอีเมลใหม่</a>
            <p style="font-size: 12px; color: #999;">หากคุณไม่ได้เป็นผู้ขอทำรายการนี้ กรุณาละเว้นอีเมลฉบับนี้</p>
          </div>
        `,
      });
    } catch (error) {
      console.error('Email Error:', error);
      throw new BadRequestException('ไม่สามารถส่งอีเมลได้ กรุณาตรวจสอบอีเมลใหม่และลองอีกครั้ง');
    }

    return { message: 'ระบบได้ส่งลิงก์ยืนยันไปยังอีเมลใหม่ของคุณแล้ว' };
  }

  // ---------------------------------------------------------
  // 📧 2. ยืนยันการเปลี่ยน Email จาก Token
  // ---------------------------------------------------------
  async verifyEmailChange(token: string) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'homealright-secret') as any;
      
      const user = await this.usersRepository.findOneBy({ id: decoded.id });
      if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

      const existingEmail = await this.usersRepository.findOneBy({ email: decoded.newEmail });
      if (existingEmail) throw new BadRequestException('อีเมลนี้ถูกใช้งานไปแล้ว');

      // อัปเดตอีเมลใหม่ลงฐานข้อมูล
      user.email = decoded.newEmail;
      await this.usersRepository.save(user);

      return { message: 'ยืนยันการเปลี่ยนอีเมลสำเร็จ' };
    } catch (error) {
      throw new BadRequestException('ลิงก์ยืนยันไม่ถูกต้อง หรือหมดอายุแล้ว กรุณาทำรายการใหม่อีกครั้ง');
    }
  }

  // ---------------------------------------------------------
  // 🔑 Logic สำหรับเปลี่ยนรหัสผ่าน
  // ---------------------------------------------------------
  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new BadRequestException('รหัสผ่านปัจจุบันไม่ถูกต้อง');

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(newPassword, salt);

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

  async updateResetToken(id: string, token: string, expires: Date) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    (user as any).resetPasswordToken = token;
    (user as any).resetPasswordExpires = expires;

    await this.usersRepository.save(user);
  }

  async findByResetToken(token: string) {
    return await this.usersRepository.findOne({
      where: { resetPasswordToken: token } as any
    });
  }

  async updatePasswordAndClearToken(id: string, hashedPassword: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) throw new NotFoundException('User not found');

    user.password = hashedPassword;
    (user as any).resetPasswordToken = null;
    (user as any).resetPasswordExpires = null;

    await this.usersRepository.save(user);
  }
}