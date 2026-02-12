import { Controller, Post, UseGuards, Req, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
// ลบ import { Express } form 'express' ออกไปเลยครับ

@Controller('orders')
@UseGuards(AuthGuard('jwt'))
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  async create(@Req() req) {
    return this.ordersService.checkout(req.user);
  }

  @Post('upload-slip/:id')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/slips', 
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `slip-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  // ตรงนี้ถ้ายังแดง ให้ลองเปลี่ยนเป็น file: Express.Multer.File (แบบไม่ต้อง import) 
  // หรือถ้าไม่หายจริงๆ ให้ใช้ file: any ไปก่อนเพื่อทดสอบ แต่แนะนำให้แก้เรื่อง Type ดีกว่าครับ
  async uploadSlip(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('กรุณาแนบไฟล์สลิป');
    }
    return this.ordersService.updatePaymentSlip(id, file.filename);
  }
}