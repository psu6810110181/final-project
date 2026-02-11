import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common'; // 1. อย่าลืม import บรรทัดนี้

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 2. เพิ่มบรรทัดนี้ลงไปครับ (สำคัญมาก!)
  app.useGlobalPipes(new ValidationPipe()); 
  
  // ให้ยอมรับข้อมูลจากที่อื่นได้ (CORS)
  app.enableCors();

  await app.listen(3000);
}
bootstrap();