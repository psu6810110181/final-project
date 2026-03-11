import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity'; // ✅ นำเข้า Variant

@Module({
  // ✅ เพิ่ม ProductVariant เข้าไปใน forFeature
  imports: [TypeOrmModule.forFeature([Order, OrderItem, CartItem, Product, ProductVariant])],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}