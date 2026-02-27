import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '@nestjs/passport'; // 👈 นำเข้า AuthGuard (หรือ JwtAuthGuard ที่คุณสร้างไว้)

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // 1. สร้างรีวิว (ต้องแนบ Token เข้ามาถึงจะสร้างได้)
  @UseGuards(AuthGuard('jwt')) // 👈 เช็ค Login สมมติว่าคุณใช้ JWT Strategy
  @Post()
  create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    // ดึง id ของผู้ใช้จาก payload ของ JWT token (ในระบบคุณใช้ UUID เป็น string)
    const userId = req.user.id; 
    return this.reviewsService.create(userId, createReviewDto);
  }

  // 2. ดึงรีวิวทั้งหมดตาม ID สินค้า (เพื่อแสดงหน้า Product Detail)
  @Get('product/:productId')
  findByProduct(@Param('productId') productId: string) {
    return this.reviewsService.findByProduct(productId);
  }

  @Get()
  findAll() {
    return this.reviewsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(+id); // id ของรีวิวเป็น number
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return this.reviewsService.update(+id, updateReviewDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reviewsService.remove(+id);
  }
}