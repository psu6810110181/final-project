import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartItemsService } from './cart_items.service';
import { CartItemsController } from './cart_items.controller';
import { CartItem } from './entities/cart_item.entity';
import { Product } from '../products/entities/product.entity'; // ⚠️ อย่าลืม Import

@Module({
  imports: [TypeOrmModule.forFeature([CartItem, Product])], // 👈 ใส่ให้ครบทั้งคู่
  controllers: [CartItemsController],
  providers: [CartItemsService],
  exports: [CartItemsService], //เผื่อ OrdersModule มาเรียกใช้
})
export class CartItemsModule {}