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

@Controller('promotions')
@UseGuards(JwtAuthGuard)
export class PromotionsController {
  constructor(private readonly promotionsService: PromotionsService) {}

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

  @Post()
  create(@Body() createPromotionDto: any) {
    return this.promotionsService.create(createPromotionDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePromotionDto: any) {
    return this.promotionsService.update(id, updatePromotionDto);
  }

  @Patch(':id/toggle')
  toggleStatus(@Param('id') id: string, @Body('isActive') isActive: boolean) {
    return this.promotionsService.toggleStatus(id, isActive);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.promotionsService.remove(id);
  }
}
