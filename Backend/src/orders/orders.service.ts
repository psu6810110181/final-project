import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
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

  // ... (checkout logic เหมือนเดิม) ...
  async checkout(user: User, address: string) {
     // (คงโค้ดเดิมไว้เลยครับ ไม่ต้องแก้)
     // แต่เช็คให้ชัวร์ว่า shippingAddress: address || user.address อยู่แล้ว
     // ...
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

      const order = this.ordersRepository.create({
        user: user,
        totalAmountProduct,
        totalAmountInstallation,
        totalAmount,
        status: 'PENDING',
        installationCharge: totalAmountInstallation,
        shippingAddress: address || user.address 
      });
      const savedOrder = await queryRunner.manager.save(order);

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

  // ✅ แก้ไข: รับ userId และ role เพื่อเช็คสิทธิ์
  async findOne(orderId: string, userId: string, role: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'user'],
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    // 🔒 Security Check: ถ้าไม่ใช่ Admin และไม่ใช่เจ้าของ -> ห้ามดู!
    if (role !== 'admin' && order.user.id !== userId) {
      throw new ForbiddenException('คุณไม่มีสิทธิ์ดูคำสั่งซื้อนี้');
    }

    return order;
  }

  async findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' }
    });
  }

  // ✅ แก้ไข: เช็คสิทธิ์ก่อนอัปสลิป
  async updatePaymentSlip(orderId: string, fileName: string, userId: string, role: string) {
    const order = await this.ordersRepository.findOne({ 
        where: { id: orderId },
        relations: ['user'] 
    });
    
    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    // 🔒 Security Check
    if (role !== 'admin' && order.user.id !== userId) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขคำสั่งซื้อนี้');
    }

    order.paymentSlipImage = fileName;
    order.status = 'WAITING_FOR_VERIFICATION'; 
    await this.ordersRepository.save(order);
    
    return { message: 'อัปโหลดสลิปเรียบร้อย', fileName };
  }

// 5. ดูออเดอร์ทั้งหมดในระบบ (Admin)
  async findAll() {
    return this.ordersRepository.find({
      // ✅ เพิ่ม 'items.product' เข้าไปใน array นี้ครับ
      relations: ['user', 'items', 'items.product'], 
      order: { orderDate: 'DESC' }
    });
  }

  async updateStatus(orderId: string, status: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'] 
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    if (status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const item of order.items) {
        const product = item.product;
        product.stock += item.quantity; 
        await this.productsRepository.save(product);
      }
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }
}