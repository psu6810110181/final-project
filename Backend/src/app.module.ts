// app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ProductsModule } from './products/products.module';
import { OrdersModule } from './orders/orders.module';
import { OrderItemsModule } from './order_items/order_items.module';
import { ReviewsModule } from './reviews/reviews.module';
import { CartItemsModule } from './cart_items/cart_items.module';
import { AuthModule } from './auth/auth.module';
// 👇 1. Import เพิ่มสำหรับ Serve Static Files
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { CategoriesModule } from './categories/categories.module';
import { RoomsModule } from './rooms/rooms.module';
import { FeaturesModule } from './features/features.module';

// 👇 เพิ่ม Import สำหรับ Colors, Materials, Sizes ที่เราเพิ่งสร้าง
import { ColorsModule } from './colors/colors.module';
import { MaterialsModule } from './materials/materials.module';
import { SizesModule } from './sizes/sizes.module';

@Module({
  imports: [
    // 1. โหลดไฟล์ .env
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 👇 2. เพิ่มส่วนนี้: เปิดให้เข้าถึงโฟลเดอร์ uploads ผ่าน URL
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'), // ชี้ไปที่โฟลเดอร์ uploads (อยู่นอก src)
      serveRoot: '/uploads', // เรียกผ่าน http://localhost:3000/uploads/...
    }),

    // 3. เชื่อมต่อ Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities: true, // ตรงนี้เจ๋งมาก! มันจะดึง Entity ใหม่ๆ ของเราไปสร้างตารางให้อัตโนมัติ
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

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
    
    // 👇 นำ Module ลงทะเบียนใช้งานในระบบ
    ColorsModule,
    MaterialsModule,
    SizesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}