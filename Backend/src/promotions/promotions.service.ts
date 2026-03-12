import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
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
    // แก้ไขชื่อตัวแปรให้ตรงกับที่ใช้ใน Query
    const currentDate = new Date(); 
    
    return this.promotionsRepository.find({
      where: {
        isActive: true,
        isFlashSale: true,
        startDate: LessThanOrEqual(currentDate), // เปรียบเทียบวันเริ่มต้น (ต้องน้อยกว่าหรือเท่ากับปัจจุบัน)
        endDate: MoreThanOrEqual(currentDate)    // เปรียบเทียบวันสิ้นสุด (ต้องมากกว่าหรือเท่ากับปัจจุบัน)
      },
      relations: ['products'],
      order: { createdAt: 'DESC' },
    });
  }

  async findActiveSeasonalPromotions(): Promise<Promotion[]> {
    const currentDate = new Date(); 
    
    return this.promotionsRepository.find({
      where: {
        isActive: true,
        isFlashSale: false, // Seasonal promotions have isFlashSale = false
        startDate: LessThanOrEqual(currentDate),
        endDate: MoreThanOrEqual(currentDate)
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
    
    // Validate percentage discount minimum and maximum
    if (promotionData.discountType === 'PERCENTAGE') {
      const discountValue = Number(promotionData.discountValue);
      if (discountValue < 10) {
        throw new ConflictException('ส่วนลดขั้นต่ำสำหรับเปอร์เซ็นต์คือ 10%');
      }
      if (discountValue > 90) {
        throw new ConflictException('ส่วนลดสูงสุดสำหรับเปอร์เซ็นต์คือ 90%');
      }
    }
    
    // Check if this is a seasonal promotion (isFlashSale = false)
    if (promotionData.isFlashSale === false) {
      // Check for existing active seasonal promotions
      const activeSeasonalPromotions = await this.findActiveSeasonalPromotions();
      
      if (activeSeasonalPromotions.length > 0) {
        throw new ConflictException(
          'ไม่สามารถสร้าง Seasonal Promotion ใหม่ได้ เนื่องจากมี Seasonal Promotion ที่กำลังทำงานอยู่แล้ว ' +
          'กรุณาปิด Seasonal Promotion ปัจจุบันก่อนสร้างใหม่'
        );
      }
    }
    
    const promotion = this.promotionsRepository.create(promotionData);
    
    if (productIds && productIds.length > 0) {
      // จะเพิ่ม products หลังจากสร้าง promotion แล้ว
      const savedPromotion = await this.promotionsRepository.save(promotion);
      const result = Array.isArray(savedPromotion) ? savedPromotion[0] : savedPromotion;
      
      // อัปเดตความสัมพันธ์กับ products
      await this.promotionsRepository
        .createQueryBuilder()
        .relation(Promotion, 'products')
        .of(result.id)
        .add(productIds);
      
      return this.findOne(result.id);
    }
    
    const result = await this.promotionsRepository.save(promotion);
    return Array.isArray(result) ? result[0] : result;
  }

  async update(id: string, updatePromotionDto: any): Promise<Promotion> {
    const { productIds, ...promotionData } = updatePromotionDto;
    
    // Validate percentage discount minimum and maximum
    if (promotionData.discountType === 'PERCENTAGE') {
      const discountValue = Number(promotionData.discountValue);
      if (discountValue < 10) {
        throw new ConflictException('ส่วนลดขั้นต่ำสำหรับเปอร์เซ็นต์คือ 10%');
      }
      if (discountValue > 90) {
        throw new ConflictException('ส่วนลดสูงสุดสำหรับเปอร์เซ็นต์คือ 90%');
      }
    }
    
    const promotion = await this.findOne(id);
    Object.assign(promotion, promotionData);

    // Check if trying to activate a seasonal promotion
    if (promotionData.isActive === true && promotion.isFlashSale === false) {
      // Check for existing active seasonal promotions (excluding this one)
      const activeSeasonalPromotions = await this.findActiveSeasonalPromotions();
      const otherActiveSeasonalPromotions = activeSeasonalPromotions.filter(p => p.id !== id);
      
      if (otherActiveSeasonalPromotions.length > 0) {
        throw new ConflictException(
          'ไม่สามารถเปิดใช้งาน Seasonal Promotion นี้ได้ เนื่องจากมี Seasonal Promotion อื่นที่กำลังทำงานอยู่แล้ว ' +
          'กรุณาปิด Seasonal Promotion ปัจจุบันก่อนเปิดใช้งานอันนี้'
        );
      }
    }
    
    await this.promotionsRepository.save(promotion);

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
    
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const promotion = await this.findOne(id);
    await this.promotionsRepository.remove(promotion);
  }

  async toggleStatus(id: string, isActive: boolean): Promise<Promotion> {
    const promotion = await this.findOne(id);
    
    // Check if trying to activate a seasonal promotion
    if (isActive === true && promotion.isFlashSale === false) {
      // Check for existing active seasonal promotions (excluding this one)
      const activeSeasonalPromotions = await this.findActiveSeasonalPromotions();
      const otherActiveSeasonalPromotions = activeSeasonalPromotions.filter(p => p.id !== id);
      
      if (otherActiveSeasonalPromotions.length > 0) {
        throw new ConflictException(
          'ไม่สามารถเปิดใช้งาน Seasonal Promotion นี้ได้ เนื่องจากมี Seasonal Promotion อื่นที่กำลังทำงานอยู่แล้ว ' +
          'กรุณาปิด Seasonal Promotion ปัจจุบันก่อนเปิดใช้งานอันนี้'
        );
      }
    }
    
    promotion.isActive = isActive;
    const result = await this.promotionsRepository.save(promotion);
    return Array.isArray(result) ? result[0] : result;
  }
}