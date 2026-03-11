import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Bookmark } from './entities/bookmark.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class BookmarksService {
  constructor(
    @InjectRepository(Bookmark)
    private bookmarkRepository: Repository<Bookmark>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addBookmark(userId: string, productId: string) {
    const product = await this.productRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException('ไม่พบสินค้าที่ต้องการบันทึก');
    }

    const existingBookmark = await this.bookmarkRepository.findOne({
      where: { user: { id: userId }, product: { id: productId } },
    });

    if (existingBookmark) {
      throw new ConflictException('สินค้านี้อยู่ในรายการที่สนใจแล้ว');
    }

    const newBookmark = this.bookmarkRepository.create({
      user: { id: userId },
      product: { id: productId },
    });

    return this.bookmarkRepository.save(newBookmark);
  }

  async getBookmarksByUser(userId: string) {
    return this.bookmarkRepository.find({
      where: { user: { id: userId } },
      relations: ['product'], // ดึงข้อมูลสินค้าที่เกี่ยวข้องมาด้วยเพื่อส่งไปให้ Frontend
      order: { createdAt: 'DESC' },
    });
  }

  async removeBookmark(userId: string, productId: string) {
    const result = await this.bookmarkRepository.delete({
      user: { id: userId },
      product: { id: productId },
    });

    if (result.affected === 0) {
      throw new NotFoundException('ไม่พบบุ๊กมาร์กนี้ในระบบ');
    }
    return { message: 'ลบสินค้าออกจากรายการที่สนใจสำเร็จ' };
  }
}