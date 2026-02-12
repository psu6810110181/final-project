import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './entities/order_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  exports: [TypeOrmModule], // ส่งออกให้ OrdersModule เอาไปใช้
})
export class OrderItemsModule {}