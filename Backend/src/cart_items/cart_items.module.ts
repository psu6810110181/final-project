import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity'; // ✅ นำเข้า Variant

@Module({
  // ✅ เพิ่ม ProductVariant เข้าไปใน forFeature
  imports: [TypeOrmModule.forFeature([CartItem, Product, ProductVariant])], 
  controllers: [CartItemsController],
  providers: [CartItemsService],
})
export class CartItemsModule {}