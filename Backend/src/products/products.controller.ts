import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFiles, Query } from '@nestjs/common';
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
    const mainImage = files?.find(f => f.fieldname === 'image');
    if (mainImage) body.image = mainImage.filename;
    
    // ✅ แปลงค่าให้เป็นตัวเลข (เพิ่ม mainStock เข้ามาด้วย)
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.stock !== undefined) body.stock = Number(body.stock);
    if (body.mainStock !== undefined) body.mainStock = Number(body.mainStock); // 👈 เพิ่มบรรทัดนี้
    
    if (typeof body.features === 'string') body.features = JSON.parse(body.features);
    if (typeof body.variants === 'string') {
        body.variants = JSON.parse(body.variants);
        
        if (Array.isArray(body.variants)) {
            body.variants = body.variants.map((variant, index) => {
                const variantImage = files?.find(f => f.fieldname === `variantImage_${index}`);
                if (variantImage) {
                    variant.image = variantImage.filename;
                }
                // แปลงสต็อกของ variant เป็นตัวเลขเผื่อไว้ด้วย
                if (variant.stock !== undefined) variant.stock = Number(variant.stock);
                if (variant.price !== undefined) variant.price = Number(variant.price);
                return variant;
            });
        }
    }

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
    const mainImage = files?.find(f => f.fieldname === 'image');
    if (mainImage) body.image = mainImage.filename;

    // ✅ แปลงค่าให้เป็นตัวเลข (เพิ่ม mainStock เข้ามาด้วย)
    if (body.price !== undefined) body.price = Number(body.price);
    if (body.stock !== undefined) body.stock = Number(body.stock);
    if (body.mainStock !== undefined) body.mainStock = Number(body.mainStock); // 👈 เพิ่มบรรทัดนี้

    if (typeof body.features === 'string') body.features = JSON.parse(body.features);
    if (typeof body.variants === 'string') {
        body.variants = JSON.parse(body.variants);
        
        if (Array.isArray(body.variants)) {
            body.variants = body.variants.map((variant, index) => {
                const variantImage = files?.find(f => f.fieldname === `variantImage_${index}`);
                if (variantImage) {
                    variant.image = variantImage.filename;
                }
                if (variant.stock !== undefined) variant.stock = Number(variant.stock);
                if (variant.price !== undefined) variant.price = Number(variant.price);
                return variant;
            });
        }
    }

    return this.productsService.update(id, body);
  }

  @Get()
  findAll(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '12',
  ) {
    // แปลง string จาก url ให้เป็น number ก่อนส่งให้ service
    return this.productsService.findAll(+page, +limit); 
  }
  
  @Get(':id') findOne(@Param('id') id: string) { return this.productsService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.productsService.remove(id); }
}