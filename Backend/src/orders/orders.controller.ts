import { 
  Controller, Post, Get, Patch, Body, UseGuards, Req, Param, 
  UseInterceptors, UploadedFile, BadRequestException 
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';

import { OrdersService } from './orders.service';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('orders')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  // --- ส่วนของ User ---

  @Post('checkout')
  // 👇 แก้ไขตรงนี้: รับ address มาจาก Body
  async create(@Req() req, @Body('address') address: string) {
    // ส่ง address ไปให้ Service
    return this.ordersService.checkout(req.user, address);
  }

  @Get('my-orders')
  async findMyOrders(@Req() req) {
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
  async uploadSlip(@Param('id') id: string, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('กรุณาแนบไฟล์สลิป');
    return this.ordersService.updatePaymentSlip(id, file.filename);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  // --- ส่วนของ Admin ---

  @Get() 
  @Roles('admin')
  async findAll() {
    return this.ordersService.findAll();
  }

  @Patch(':id/status')
  @Roles('admin')
  async updateStatus(
    @Param('id') id: string, 
    @Body('status') status: string 
  ) {
    return this.ordersService.updateStatus(id, status);
  }
}