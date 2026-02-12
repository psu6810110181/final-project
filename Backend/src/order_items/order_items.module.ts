import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsService } from './order_items.service';
import { OrderItemsController } from './order_items.controller';
import { OrderItem } from './entities/order_item.entity'; // เช็ค path ให้ตรงนะครับ

@Module({
  // 👇 เพิ่ม TypeOrmModule เพื่อลงทะเบียน Entity OrderItem
  imports: [TypeOrmModule.forFeature([OrderItem])],
  controllers: [OrderItemsController],
  providers: [OrderItemsService],
  // 👇 Export ออกไปเพื่อให้ OrdersModule สามารถเรียกใช้ได้ (ถ้าจำเป็น)
  exports: [TypeOrmModule] 
})
export class OrderItemsModule {}