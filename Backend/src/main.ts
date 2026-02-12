import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // 1. ✅ เปิดให้ Frontend ยิง API เข้ามาได้ (CORS)
  app.enableCors({
    origin: '*', // หรือระบุ 'http://localhost:5173' เพื่อความปลอดภัยสูงสุด
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // 2. ✅ เปิดใช้งาน DTO Validation (สำคัญมาก!)
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // ตัดตัวแปรขยะที่ไม่ได้อยู่ใน DTO ทิ้งอัตโนมัติ
    transform: true, // แปลง Type อัตโนมัติ (เช่น string -> number)
  }));

  // 3. ✅ ตั้งค่าให้เข้าถึงไฟล์รูปภาพได้ (ถ้าไม่ได้ใช้ ServeStaticModule ใน app.module)
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  await app.listen(3000);
}
bootstrap();