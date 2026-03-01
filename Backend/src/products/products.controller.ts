import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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
  create(@Body() createProductDto: CreateProductDto, @UploadedFile() file: Express.Multer.File) {
    if (file) createProductDto.image = file.filename;
    return this.productsService.create(createProductDto);
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
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @UploadedFile() file: Express.Multer.File) {
    if (file) updateProductDto.image = file.filename;
    return this.productsService.update(id, updateProductDto);
  }

  @Get() findAll() { return this.productsService.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.productsService.findOne(id); }
  @Delete(':id') remove(@Param('id') id: string) { return this.productsService.remove(id); }
}