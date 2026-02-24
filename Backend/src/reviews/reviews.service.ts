import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { User } from '../users/entities/user.entity'; // ตรวจสอบ path ให้ดีครับ


@Injectable()
export class ReviewsService {
  constructor(
    // ✅ ต้องมีบรรทัดนี้เพื่อให้ Service รู้จัก reviewRepository
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}
  async create(userId: number, dto: CreateReviewDto) {
  // สร้าง Object ใหม่โดยระบุความสัมพันธ์ผ่าน ID
  const newReview = this.reviewRepository.create({
    rating: dto.rating,
    comment: dto.comment,
    // ระบุเป็น Object ที่มี id เพื่อให้ TypeORM เชื่อมความสัมพันธ์ให้
    user: { id: userId } as any, 
    product: { id: dto.productId } as any
  });

  return await this.reviewRepository.save(newReview);
}

  async findByProduct(productId: string) {
  return await this.reviewRepository.find({
    where: { product: { id: productId } }, // แปลงเลขเป็น stringให้ตรงกับประเภทของ id ใน Product.entity.ts
    relations: ['user'] ,
    order: { createdAt: 'DESC' }
  });


  }
}
