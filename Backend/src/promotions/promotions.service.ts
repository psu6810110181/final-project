import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm'; // ✅ นำเข้า Operator ที่ถูกต้อง
import { Promotion } from './promotion.entity';

@Injectable()
export class PromotionsService {
  constructor(
    @InjectRepository(Promotion)
    private promotionsRepository: Repository<Promotion>,
  ) {}

  async findAll(): Promise<Promotion[]> {
    return this.promotionsRepository.find({
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveFlashSales(): Promise<Promotion[]> {
    const now = new Date();
    return this.promotionsRepository.find({
      where: {
        isActive: true,
        isFlashSale: true,
        startDate: LessThanOrEqual(now), // ✅ เปลี่ยนเป็น Syntax ของ TypeORM
        endDate: MoreThanOrEqual(now),   // ✅ เปลี่ยนเป็น Syntax ของ TypeORM
      },
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Promotion> {
    const promotion = await this.promotionsRepository.findOne({
      where: { id },
      relations: ['products'],
    });
    
    if (!promotion) {
      throw new NotFoundException(`Promotion with ID ${id} not found`);
    }
    
    return promotion;
  }

  async create(createPromotionDto: any): Promise<Promotion> {
    const { productIds, ...promotionData } = createPromotionDto;
    
    const promotion = this.promotionsRepository.create(promotionData);
    
    if (productIds && productIds.length > 0) {
      // จะเพิ่ม products หลังจากสร้าง promotion แล้ว
      const savedPromotion = await this.promotionsRepository.save(promotion);
      const result = Array.isArray(savedPromotion) ? savedPromotion[0] : savedPromotion;
      
      // อัปเดตความสัมพันธ์กับ products
      if (productIds.length > 0) {
        await this.promotionsRepository
          .createQueryBuilder()
          .relation(Promotion, 'products')
          .of(result.id)
          .add(productIds);
      }
      
      return this.findOne(result.id);
    }
    
    const result = await this.promotionsRepository.save(promotion);
    return Array.isArray(result) ? result[0] : result;
  }

  async update(id: string, updatePromotionDto: any): Promise<Promotion> {
    const { productIds, ...promotionData } = updatePromotionDto;
    
    const promotion = await this.findOne(id);
    Object.assign(promotion, promotionData);
    
    // อัปเดตความสัมพันธ์กับ products ถ้ามีการเปลี่ยนแปลง
    if (productIds !== undefined) {
      // ลบความสัมพันธ์เก่าทั้งหมด
      if (promotion.products && promotion.products.length > 0) {
        await this.promotionsRepository
          .createQueryBuilder()
          .relation(Promotion, 'products')
          .of(id)
          .remove(promotion.products.map(p => p.id));
      }
      
      // เพิ่มความสัมพันธ์ใหม่
      if (productIds.length > 0) {
        await this.promotionsRepository
          .createQueryBuilder()
          .relation(Promotion, 'products')
          .of(id)
          .add(productIds);
      }
    }
    
    const result = await this.promotionsRepository.save(promotion);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionsRepository.remove(promotion);
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Promotion> {
    const promotion = await this.findOne(id);
    promotion.isActive = isActive;
    const result = await this.promotionsRepository.save(promotion);
    return Array.isArray(result) ? result[0] : result;
  }
}