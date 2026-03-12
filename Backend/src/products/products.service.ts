// Backend/src/products/products.service.ts
import { Injectable, NotAcceptableException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return await this.productsRepository.save(product);
  }

  // Backend/src/products/products.service.ts

  async findAll(page: number = 1, limit: number = 12) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.productsRepository.findAndCount({
      // ✅ แก้ไข: ใส่เฉพาะชื่อ Property ที่มี @OneToMany, @ManyToMany ใน entity เท่านั้น
      relations: ['variants', 'promotions', 'reviews'], 
      skip: skip,
      take: limit,
      order: { createdAt: 'DESC' }, // หรือ order: { id: 'DESC' }
    });

    return {
      data,
      meta: {
        total, 
        page, 
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // ✅ เปลี่ยน Return Type เป็น Promise<any> เพื่อให้ส่งค่า soldCount พ่วงไปได้โดยไม่ติด Error
  async findOne(id: string): Promise<any> {
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['variants', 'promotions', 'orderItems', 'orderItems.order']
    });
    
    if (!product) {
      throw new NotAcceptableException(`Product with ID ${id} not found`);
    }

    // ✅ คำนวณจำนวนที่ขายไปแล้ว (เอาเฉพาะ Order ที่สถานะเป็น PAID)
    let soldCount = 0;
    if (product.orderItems && product.orderItems.length > 0) {
        soldCount = product.orderItems.reduce((acc, item) => {
            if (item.order && item.order.status === 'PAID') {
                return acc + item.quantity;
            }
            return acc;
        }, 0);
    }

    // ✅ วิธีที่ถูกต้อง: ใช้ Destructuring เพื่อแยก orderItems ออก แทนการใช้คำสั่ง delete
    const { orderItems, ...productWithoutOrderItems } = product;

    // ส่งข้อมูลสินค้าที่ไม่มี orderItems แล้ว พร้อมกับแนบ soldCount กลับไปให้ Frontend
    return { ...productWithoutOrderItems, soldCount };
  }
  
  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    // ตอน Update เราไม่จำเป็นต้องเอา soldCount ไปบันทึกทับใน DB เลยแยกดึงข้อมูล
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException(`Product with ID ${id} not found`);

    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
  }
}