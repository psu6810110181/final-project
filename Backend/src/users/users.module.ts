import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 1. ต้อง import อันนี้
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity'; // 2. import Entity User มาด้วย

@Module({
  imports: [
    TypeOrmModule.forFeature([User]) // 3. สำคัญมาก! ต้องใส่บรรทัดนี้ครับ
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService] // เผื่อ Module อื่น (เช่น Auth) ต้องมาเรียกใช้ User
})
export class UsersModule {}