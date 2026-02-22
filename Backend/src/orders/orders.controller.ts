import { 
  Controller, Get, Post, Patch, Body, Param, UseGuards, Req, 
  UseInterceptors, UploadedFile, BadRequestException, ParseFilePipe, 
  MaxFileSizeValidator, FileTypeValidator 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import sharp from 'sharp'; // ✅ Import sharp แบบ Default
import * as fs from 'fs';
import * as path from 'path';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post('checkout')
  create(@Req() req, @Body('address') address: string) {
    return this.ordersService.checkout(req.user, address);
  }

  @Get('my-orders')
  findMyOrders(@Req() req) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  @Patch(':id/cancel')
  async cancelMyOrder(@Param('id') id: string, @Req() req) { // ✅ เปลี่ยนจาก @Request เป็น @Req
    // โยน orderId และ userId ไปให้ Service ตรวจสอบ
    return this.ordersService.cancelMyOrder(id, req.user.id); 
  }

  // ---------------------------------------------------------
  // ✅ อัปโหลดสลิป: Validate + Resize (Sharp) 🧾
  // ---------------------------------------------------------
  @Post('upload-slip/:id')
  @UseInterceptors(FileInterceptor('file')) // รับไฟล์เข้ามาใน Buffer (RAM)
  async uploadSlip(
    @Param('id') id: string, 
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          // 1. เช็คขนาดไฟล์ไม่เกิน 5MB
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), 
          // 2. เช็คว่าเป็นรูปภาพเท่านั้น
          new FileTypeValidator({ fileType: '.(png|jpeg|jpg|webp)' }), 
        ],
      }),
    ) file: Express.Multer.File, 
    @Req() req
  ) {
    if (!file) throw new BadRequestException('กรุณาแนบไฟล์สลิป');

    // ตั้งชื่อไฟล์สลิป
    const filename = `slip-${id}-${Date.now()}.jpeg`;
    const uploadDir = './uploads/slips';
    const uploadPath = path.join(uploadDir, filename);

    // ตรวจสอบว่ามีโฟลเดอร์ไหม ถ้าไม่มีให้สร้าง
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // ✅ ใช้ Sharp ย่อรูปสลิป
    await sharp(file.buffer)
      .resize(800) // กำหนดความกว้าง 800px (ความสูงจะปรับ auto ตามสัดส่วน)
      .toFormat('jpeg')
      .jpeg({ quality: 80 }) // บีบอัดคุณภาพ 80%
      .toFile(uploadPath);

    // ✅ ส่ง User ID ไปเช็คด้วยว่าอัปโหลดให้ถูกใบไหม
    return this.ordersService.updatePaymentSlip(id, filename, req.user.id, req.user.role);
  }
  

  // --- Admin Zone ---
  @Get()
  @Roles('admin')
  findAll() {
    return this.ordersService.findAll();
  }

  @Get(':id')
  @Roles('admin')
  findOne(@Param('id') id: string, @Req() req) {
    // ✅ ส่ง User ID และ Role ไปให้ Service ตรวจสอบสิทธิ์
    return this.ordersService.findOne(id, req.user.id, req.user.role);
  }
  
  @Patch(':id/status')
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.ordersService.updateStatus(id, status);
  }
}