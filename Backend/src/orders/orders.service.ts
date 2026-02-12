import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
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
    private dataSource: DataSource,
  ) {}

  // 1. สร้างคำสั่งซื้อ (User)
  // 👇 แก้ไขตรงนี้: รับ address เพิ่มเข้ามา
  async checkout(user: User, address: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
    });

    if (cartItems.length === 0) {
      throw new BadRequestException('ไม่มีสินค้าในตะกร้า');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmountProduct = 0;
      let totalAmountInstallation = 0;

      // คำนวณยอดและตัดสต็อก
      for (const item of cartItems) {
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(`สินค้า ${item.product.name} เหลือไม่พอ`);
        }
        totalAmountProduct += Number(item.product.price) * item.quantity;
        
        if (item.requestInstallation) { 
            totalAmountInstallation += 500; 
        }
      }

      const totalAmount = totalAmountProduct + totalAmountInstallation;

      // สร้าง Order
      const order = this.ordersRepository.create({
        user: user,
        totalAmountProduct,
        totalAmountInstallation,
        totalAmount,
        status: 'PENDING',
        installationCharge: totalAmountInstallation,
        // 👇 เพิ่มบรรทัดนี้: บันทึกที่อยู่จัดส่ง (Snapshot)
        shippingAddress: address || user.address 
      });
      const savedOrder = await queryRunner.manager.save(order);

      // ย้าย Cart -> OrderItem และตัดสต็อกจริง
      for (const item of cartItems) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder,
          product: item.product,
          quantity: item.quantity,
          priceAtPurchase: item.product.price,
          requestInstallation: item.requestInstallation || false
        });
        await queryRunner.manager.save(orderItem);

        item.product.stock -= item.quantity;
        await queryRunner.manager.save(item.product);
      }

      await queryRunner.manager.delete(CartItem, { user: { id: user.id } });
      await queryRunner.commitTransaction();

      return {
        message: 'สร้างคำสั่งซื้อสำเร็จ',
        orderId: savedOrder.id,
        total: savedOrder.totalAmount
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 2. อัปโหลดสลิป (User)
  async updatePaymentSlip(orderId: string, fileName: string) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId } });
    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    order.paymentSlipImage = fileName;
    order.status = 'WAITING_FOR_VERIFICATION'; 
    await this.ordersRepository.save(order);
    
    return { message: 'อัปโหลดสลิปเรียบร้อย', fileName };
  }

  // 3. ดูรายการของตัวเอง (User)
  async findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' }
    });
  }

  // 4. ดูรายละเอียดออเดอร์เดียว (User/Admin)
  async findOne(orderId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });
    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
    return order;
  }

  // ---------------------------------------------------------
  // 👇 ส่วนของ Admin 👇
  // ---------------------------------------------------------

  // 5. ดูออเดอร์ทั้งหมดในระบบ (Admin)
  async findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'items'], 
      order: { orderDate: 'DESC' }
    });
  }

  // 6. อัปเดตสถานะ (Admin: อนุมัติ / ส่งของ / ยกเลิก)
  async updateStatus(orderId: string, status: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'] 
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    // คืนสต็อกกรณียกเลิก
    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const product = item.product;
        product.stock += item.quantity; 
        await this.productsRepository.save(product);
      }
    }

    if (order.status === 'CANCELLED' && status !== 'CANCELLED') {
        throw new BadRequestException('ออเดอร์นี้ถูกยกเลิกไปแล้ว ไม่สามารถเปลี่ยนสถานะได้');
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }
}