import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  async create(userId: number, dto: CreateReviewDto) {
    // 🛠 ใช้ .insert() แทน .save() เพื่อบังคับให้บันทึกแค่ Review 
    // ตัดปัญหา TypeORM พยายามไป Update ตาราง User และ Product
    await this.reviewRepository.insert({
      rating: dto.rating,
      comment: dto.comment,
      user: { id: userId } as any, 
      product: { id: dto.productId } as any
    });

    return { message: 'บันทึกรีวิวสำเร็จ' };
  }

  async findByProduct(productId: string) {
    return await this.reviewRepository.find({
      where: { product: { id: productId } }, 
      relations: ['user'] ,
      order: { createdAt: 'DESC' }
    });
  }
}