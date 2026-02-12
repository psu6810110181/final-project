import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItemsService } from './order_items.service';
// ❌ ลบบรรทัดนี้ออก: import { OrderItemsController } ...
import { OrderItem } from './entities/order_item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OrderItem])],
  controllers: [], // ❌ ลบ OrderItemsController ออกจากวงเล็บ (ปล่อยว่างไว้ หรือลบบรรทัดนี้ทิ้งก็ได้)
  providers: [OrderItemsService],
  exports: [TypeOrmModule, OrderItemsService] // Export Service เผื่อที่อื่นต้องใช้
})
export class OrderItemsModule {}