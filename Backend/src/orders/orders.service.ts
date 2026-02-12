import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(CartItem) private cartItemsRepository: Repository<CartItem>,
    private dataSource: DataSource, // ใช้สำหรับทำ Transaction
  ) {}

  async checkout(user: User) {
    // 1. ดึงของในตะกร้าของ User ออกมา
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('ไม่มีสินค้าในตะกร้า');
    }

    // 2. เริ่ม Transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmountProduct = 0;
      let totalAmountInstallation = 0;

      // 3. ตรวจสอบสต็อกและคำนวณยอดเงิน
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(`สินค้า ${item.product.name} เหลือไม่พอ`);
        }
        
        totalAmountProduct += Number(item.product.price) * item.quantity;
        
        // ถ้ามีการติ๊กขอรับบริการติดตั้ง (สมมติค่าติดตั้ง 500 ต่อชิ้น ถ้า item นั้นต้องการ)
        // ในที่นี้เราอิงตามฟิลด์ requestInstallation ใน CartItem (ถ้าคุณมี)
        // หรือถ้าใน UI เป็นยอดรวม 0 บาทตามรูป ก็ตั้งเป็น 0 ไว้ก่อนครับ
        if (item.requestInstallation) { 
            totalAmountInstallation += 0; // ปรับเปลี่ยนตัวเลขตามความต้องการ
        }
      }

      const totalAmount = totalAmountProduct + totalAmountInstallation;

      // 4. สร้าง Order (ใบหลัก)
      const order = this.ordersRepository.create({
        user: user,
        totalAmountProduct: totalAmountProduct,
        totalAmountInstallation: totalAmountInstallation,
        totalAmount: totalAmount,
        status: 'PENDING',
        installationCharge: totalAmountInstallation
      });
      const savedOrder = await queryRunner.manager.save(order);

      // 5. ย้ายจาก CartItem ไปเป็น OrderItem และตัดสต็อก
      for (const item of cartItems) {
        // สร้าง OrderItem
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: item.product,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
          requestInstallation: item.requestInstallation || false
        });
        await queryRunner.manager.save(orderItem);

        // ตัดสต็อกสินค้า
        item.product.stock -= item.quantity;
        await queryRunner.manager.save(item.product);
      }

      // 6. ล้างตะกร้า
      await queryRunner.manager.delete(CartItem, { user: { id: user.id } });

      // ยืนยัน Transaction
      await queryRunner.commitTransaction();

      return {
        message: 'สร้างคำสั่งซื้อสำเร็จ',
        orderId: savedOrder.id,
        total: savedOrder.totalAmount
      };

    } catch (err) {
      // หากเกิด Error ให้ยกเลิกทั้งหมด
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      // ปล่อยการเชื่อมต่อ
      await queryRunner.release();
    }
  }

  async updatePaymentSlip(orderId: string, fileName: string) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    
    if (!order) {
      throw new BadRequestException('ไม่พบคำสั่งซื้อนี้');
    }

    order.paymentSlipImage = fileName; // บันทึกชื่อไฟล์ลงฟิลด์ตาม ER Diagram
    order.status = 'WAITING_FOR_VERIFICATION'; // อัปเดตสถานะเป็นรอตรวจสอบ
    
    await this.ordersRepository.save(order);
    
    return {
      message: 'อัปโหลดสลิปเรียบร้อยแล้ว รอการตรวจสอบสถานะ',
      fileName: fileName
    };
 }
}