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

  async findAll(): Promise<Product[]> {
    // ✅ เพิ่ม relations: ['variants'] เพื่อให้ดึงข้อมูลตัวเลือกสินค้าออกมาด้วย
    return await this.productsRepository.find({
      relations: ['variants']
    });
  }

  async findOne(id: string): Promise<Product> {
    // ✅ เพิ่ม relations: ['variants'] เพื่อให้ดึงข้อมูลตัวเลือกสินค้าออกมาด้วย
    const product = await this.productsRepository.findOne({ 
      where: { id },
      relations: ['variants']
    });
    
    if (!product) {
      throw new NotAcceptableException(`Product with ID ${id} not found`)
    }
    return product ;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateProductDto);
    return await this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const result = await this.productsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Product with ID ${id} not found`)
    }
  }
}