import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity'; // 👈 เช็ค Path ให้ถูก
import { CartItem } from '../cart_items/entities/cart_item.entity'; // 👈 ต้องใช้ใน Checkout

@Module({
  imports: [
    // 💡 หัวใจสำคัญคือบรรทัดนี้ ต้องมีครบทั้ง 3 Entity ครับ
    TypeOrmModule.forFeature([Order, Product, CartItem]) 
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}