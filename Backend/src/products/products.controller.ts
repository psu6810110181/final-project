// Backend/src/products/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@Body() body: any, @UploadedFiles() files: Array<Express.Multer.File>) {
    // 📌 1. จัดการภาพหลัก ค้นหาไฟล์ที่ส่งมาด้วยชื่อ fieldname ว่า 'image'
    const mainImage = files?.find(f => f.fieldname === 'image');
    if (mainImage) body.image = mainImage.filename;
    
    // ✅ แปลงข้อมูลที่ถูก FormData ทำเป็น String ให้กลับมาเป็นชนิดเดิม
    if (body.price) body.price = Number(body.price);
    if (body.stock) body.stock = Number(body.stock);
    if (typeof body.features === 'string') body.features = JSON.parse(body.features);
    if (typeof body.variants === 'string') {
        body.variants = JSON.parse(body.variants);
        
        // 📌 2. จัดการภาพตัวเลือก (Variants) นำชื่อไฟล์ใส่กลับเข้าไปใน Object ของ variant ตาม index
        if (Array.isArray(body.variants)) {
            body.variants = body.variants.map((variant, index) => {
                const variantImage = files?.find(f => f.fieldname === `variantImage_${index}`);
                if (variantImage) {
                    variant.image = variantImage.filename;
                }
                return variant;
            });
        }
    }

    // โยนข้อมูลที่แปลงเสร็จแล้วเข้า Service (ซึ่งจะตรงกับโครงสร้าง CreateProductDto พอดี)
    return this.productsService.create(body);
  }

  @Patch(':id')
  @UseInterceptors(AnyFilesInterceptor({
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFiles() files: Array<Express.Multer.File>) {
    // 📌 1. จัดการภาพหลัก ค้นหาไฟล์ที่ส่งมาด้วยชื่อ fieldname ว่า 'image'
    const mainImage = files?.find(f => f.fieldname === 'image');
    if (mainImage) body.image = mainImage.filename;

    // ✅ แปลงข้อมูลที่ถูก FormData ทำเป็น String ให้กลับมาเป็นชนิดเดิม
    if (body.price) body.price = Number(body.price);
    if (body.stock) body.stock = Number(body.stock);
    if (typeof body.features === 'string') body.features = JSON.parse(body.features);
    if (typeof body.variants === 'string') {
        body.variants = JSON.parse(body.variants);
        
        // 📌 2. จัดการภาพตัวเลือก (Variants) นำชื่อไฟล์ใส่กลับเข้าไปใน Object ของ variant ตาม index
        if (Array.isArray(body.variants)) {
            body.variants = body.variants.map((variant, index) => {
                const variantImage = files?.find(f => f.fieldname === `variantImage_${index}`);
                if (variantImage) {
                    variant.image = variantImage.filename;
                }
                return variant;
            });
        }
    }

    return this.productsService.update(id, body);
  }

  @Get() findAll() { return this.productsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.productsService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.productsService.remove(id); }
}