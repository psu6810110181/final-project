// Backend/src/products/products.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  create(@Body() body: any, @UploadedFile() file: Express.Multer.File) {
    if (file) body.image = file.filename;
    
    // ✅ แปลงข้อมูลที่ถูก FormData ทำเป็น String ให้กลับมาเป็นชนิดเดิม
    if (body.price) body.price = Number(body.price);
    if (body.stock) body.stock = Number(body.stock);
    if (typeof body.features === 'string') body.features = JSON.parse(body.features);
    if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);

    // โยนข้อมูลที่แปลงเสร็จแล้วเข้า Service (ซึ่งจะตรงกับโครงสร้าง CreateProductDto พอดี)
    return this.productsService.create(body);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('image', {
    storage: diskStorage({
      destination: './uploads',
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `product-${uniqueSuffix}${extname(file.originalname)}`);
      },
    }),
  }))
  update(@Param('id') id: string, @Body() body: any, @UploadedFile() file: Express.Multer.File) {
    if (file) body.image = file.filename;

    // ✅ แปลงข้อมูลที่ถูก FormData ทำเป็น String ให้กลับมาเป็นชนิดเดิม
    if (body.price) body.price = Number(body.price);
    if (body.stock) body.stock = Number(body.stock);
    if (typeof body.features === 'string') body.features = JSON.parse(body.features);
    if (typeof body.variants === 'string') body.variants = JSON.parse(body.variants);

    return this.productsService.update(id, body);
  }

  @Get() findAll() { return this.productsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.productsService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.productsService.remove(id); }
}