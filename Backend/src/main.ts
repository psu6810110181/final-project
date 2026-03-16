import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  // ✅ 1. เพิ่ม { rawBody: true } ตรงนี้ครับ เพื่อให้ Stripe สามารถอ่านข้อมูลและอัปเดตสถานะเป็น PAID ได้
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });
  
  // 2. เปิดให้ Frontend ยิง API เข้ามาได้ (CORS)
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  app.enableCors({
    origin: [frontendUrl, 'http://localhost:5173'], 
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 3. เปิดใช้งาน DTO Validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, 
    transform: true, 
  }));

  // 4. ตั้งค่าให้เข้าถึงไฟล์รูปภาพได้
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(process.env.APP_PORT!);
}
bootstrap();