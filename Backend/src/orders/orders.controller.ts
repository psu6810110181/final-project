import { Controller, Get, Post, Patch, Body, Param, UseGuards, Req, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

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
  async uploadSlip(@Param('id') id: string, @UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) throw new BadRequestException('กรุณาแนบไฟล์สลิป');
    // ✅ ส่ง User ID ไปเช็คด้วยว่าอัปโหลดให้ถูกใบไหม
    return this.ordersService.updatePaymentSlip(id, file.filename, req.user.id, req.user.role);
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