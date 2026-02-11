import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config'; // 👈 เรียกใช้ ConfigService
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AdminsModule } from './admins/admins.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. โหลดไฟล์ .env เข้ามาในระบบก่อน
    ConfigModule.forRoot({
      isGlobal: true, // ให้เรียกใช้ ConfigService ได้ทุกที่โดยไม่ต้อง import ใหม่
    }),

    // 2. เชื่อมต่อ Database แบบ Async (รออ่านค่า .env ให้เสร็จก่อน)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),      // อ่านค่า DB_HOST จาก .env
        port: configService.get<number>('DB_PORT'),      // อ่านค่า DB_PORT
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, // โหลด Entity (ตาราง) อัตโนมัติ
        synchronize: true,      // (Dev Mode) แก้โค้ดปุ๊บ DB เปลี่ยนตาม
      }),
      inject: [ConfigService], // ฉีด ConfigService เข้าไปใช้งาน
    }),

    UsersModule,

    AdminsModule,

    ProductsModule,

    OrdersModule,

    OrderItemsModule,

    ReviewsModule,

    CartItemsModule,

    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}