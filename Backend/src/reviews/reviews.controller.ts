import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  // 1. สร้างรีวิว (ต้องแนบ Token เข้ามาถึงจะสร้างได้)
  @UseGuards(AuthGuard('jwt')) 
  @Post()
  async create(@Request() req, @Body() createReviewDto: CreateReviewDto) {
    // ดึง id ของผู้ใช้จาก payload ของ JWT token
    const userId = req.user.id; 
    return await this.reviewsService.create(userId, createReviewDto);
  }

  // ✅ 2. เพิ่ม Endpoint GET /reviews สำหรับดึงข้อมูลรีวิวทั้งหมด (หน้า Admin ใช้ Endpoint นี้)
  @Get()
  async findAll() {
    return await this.reviewsService.findAll();
  }

  // 3. ดึงรีวิวทั้งหมดตาม ID สินค้า (เพื่อแสดงหน้า Product Detail)
  @Get('product/:productId')
  async findByProduct(@Param('productId') productId: string) {
    return await this.reviewsService.findByProduct(productId);
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