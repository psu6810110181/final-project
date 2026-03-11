import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete,
  UseGuards
} from '@nestjs/common';
import { PromotionsService } from './promotions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

// ❌ เอา @UseGuards(JwtAuthGuard) ตรงนี้ออก
@Controller('promotions')
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

  // ✅ ให้ GET ทั้งหมดเป็น Public (ไม่ต้อง Login ก็ดูโปรโมชันได้)
  @Get()
  findAll() {
    return this.promotionsService.findAll();
  }

  @Get('flash-sales')
  findActiveFlashSales() {
    return this.promotionsService.findActiveFlashSales();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.promotionsService.findOne(id);
  }

  // ✅ นำ @UseGuards มาใส่เฉพาะการจัดการข้อมูลที่ต้องยืนยันตัวตน
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createPromotionDto: any) {
    return this.promotionsService.create(createPromotionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: any) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.promotionsService.toggleStatus(id, isActive);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}