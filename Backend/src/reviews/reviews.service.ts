import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // แก้ไขรับ userId เป็น string ให้ตรงกับ UUID
  async create(userId: string, createReviewDto: CreateReviewDto) {
    // 1. ตรวจสอบว่าเคยรีวิวสินค้านี้ใน Order นี้ไปแล้วหรือยัง
    const existingReview = await this.reviewRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: createReviewDto.productId },
        order: { id: createReviewDto.orderId }
      }
    });

    if (existingReview) {
      throw new BadRequestException('คุณได้รีวิวสินค้านี้ในคำสั่งซื้อนี้ไปแล้ว');
    }

    // 2. สร้างรีวิวใหม่
    const newReview = this.reviewRepository.create({
      rating: createReviewDto.rating,
      comment: createReviewDto.comment,
      user: { id: userId },
      product: { id: createReviewDto.productId },
      order: { id: createReviewDto.orderId },
    });

    return await this.reviewRepository.save(newReview);
  }

  // ดึงรีวิวทั้งหมดของสินค้าชิ้นนั้น เพื่อเอาไปแสดงหน้า ProductDetail
  // แก้ไขรับ productId เป็น string
  async findByProduct(productId: string) {
    return await this.reviewRepository.find({
      where: { product: { id: productId } },
      relations: ['user'], 
      select: {
        user: {
          id: true,
          username: true, // แก้ไขให้ตรงกับ User Entity ของคุณ
          userImage: true, // ดึงรูปไปใช้ด้วย
        }
      },
      order: { createdAt: 'DESC' } // เรียงลำดับจากล่าสุด
    });
  }

  // ✅ อัปเดตให้เรียงข้อมูลจากล่าสุด และดึง Relation ที่จำเป็นมาแสดงในหน้า Admin
  async findAll() {
    return await this.reviewRepository.find({ 
      relations: ['user', 'product', 'order'], // หากมี productVariant ใน entity ให้ใส่ 'productVariant' เพิ่มเข้าไปใน Array นี้ได้ครับ
      order: { createdAt: 'DESC' } 
    });
  }

  // review id เป็น number ถูกแล้ว ตาม Entity ของ review
  findOne(id: number) {
    return this.reviewRepository.findOne({ 
      where: { id },
      relations: ['user', 'product', 'order']
    });
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    return `This action updates a #${id} review`;
  }

  remove(id: number) {
    return `This action removes a #${id} review`;
  }
}