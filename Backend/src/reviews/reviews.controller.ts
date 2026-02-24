import { 
  Controller, 
  Post, 
  Body, 
  Get, 
  Param
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // 1. ส่งรีวิวใหม่ (ส่ง userId มาใน Body ตรงๆ เพื่อทดสอบ)
  @Post()
  async create(@Body() dto: CreateReviewDto & { userId: number }) {
    // ส่งทั้ง dto และ userId ที่รับมาไปให้ service
    return await this.reviewsService.create(dto.userId, dto);
  }

  // 2. ดึงรีวิวตาม ID สินค้า
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return await this.reviewsService.findByProduct(productId);
  }
}