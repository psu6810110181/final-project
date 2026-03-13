// Backend/src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { RoomsModule } from './rooms/rooms.module';
import { FeaturesModule } from './features/features.module';
import { ColorsModule } from './colors/colors.module';
import { MaterialsModule } from './materials/materials.module';
import { SizesModule } from './sizes/sizes.module';
import { PromotionsModule } from './promotions/promotions.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';

@Module({
  imports: [
    // 1. โหลดไฟล์ .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. ตั้งค่าระบบส่งอีเมล (ดึงข้อมูลจาก .env)
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('MAIL_HOST', 'smtp.gmail.com'),
          port: configService.get<number>('MAIL_PORT', 587),
          secure: false, // ใช้ false สำหรับพอร์ต 587
          auth: {
            user: configService.get<string>('MAIL_USER'),
            pass: configService.get<string>('MAIL_PASS'),
          },
        },
        defaults: {
          from: '"HomeAlright" <noreply@homealright.com>', // ชื่อผู้ส่งเริ่มต้น
        },
      }),
      inject: [ConfigService],
    }),

    // 3. เปิดให้เข้าถึงโฟลเดอร์ uploads ผ่าน URL
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),

    // 4. เชื่อมต่อ Database (รองรับ Neon Database)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        // ✅ 4.1 ตรวจสอบว่ามีการใส่ DATABASE_URL (ของ Neon) มาหรือไม่
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl, // ใช้ Connection String จาก Neon
            autoLoadEntities: true,
            synchronize: true, // ⚠️ เปลี่ยนเป็น false หากขึ้น Production จริงและใช้ Migration
            ssl: true,         // ✅ บังคับเปิด SSL สำหรับ Neon
            extra: {
              ssl: {
                rejectUnauthorized: false, // ป้องกันปัญหาสายหลุดจาก Certificate
              },
            },
          };
        }

        // ✅ 4.2 ถ้าไม่มี DATABASE_URL ให้กลับไปใช้ Config เดิมเผื่อไว้ (เช่นรัน Local)
        const dbType = configService.get<string>('DB_TYPE', 'postgres');
        
        if (dbType === 'postgres') {
          return {
            type: 'postgres',
            host: configService.get<string>('DB_HOST'),
            port: configService.get<number>('DB_PORT'),
            username: configService.get<string>('DB_USERNAME'),
            password: configService.get<string>('DB_PASSWORD'),
            database: configService.get<string>('DB_DATABASE'),
            autoLoadEntities: true,
            synchronize: true,
          };
        } else {
          return {
            type: 'sqlite',
            database: configService.get<string>('DB_DATABASE', './data/finalproject.db'),
            autoLoadEntities: true,
            synchronize: true,
          };
        }
      },
      inject: [ConfigService],
    }),

    // Modules ต่างๆ ในระบบ
    UsersModule,
    ProductsModule,
    OrdersModule,
    OrderItemsModule,
    ReviewsModule,
    CartItemsModule,
    AuthModule,
    CategoriesModule,
    RoomsModule,
    FeaturesModule,
    ColorsModule,
    MaterialsModule,
    SizesModule,
    PromotionsModule,
    BookmarksModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}