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
    private dataSource: DataSource, // ✅ Inject DataSource ตรงนี้ครั้งเดียวพอ
  ) {}

  // 1. Checkout (สร้างคำสั่งซื้อ)
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
      let totalInstallQty = 0; // เพิ่มตัวแปรนับจำนวนชิ้นที่ต้องการติดตั้ง

      for (const item of cartItems) {
        // เช็คสต็อก
        if (item.product.stock < item.quantity) {
          throw new BadRequestException(`สินค้า ${item.product.name} เหลือไม่พอ`);
        }
        totalAmountProduct += Number(item.product.price) * item.quantity;
        
        // เก็บนับจำนวนชิ้น (อิงตาม logic เดิมที่เช็ค requestInstallation)
        if (item.requestInstallation) { 
            totalInstallQty += item.quantity; 
        }
      }

      // Logic ใหม่: 4 ชิ้นขึ้นไป 990 บาท, ต่ำกว่า 4 ชิ้น ชิ้นละ 400 บาท
      let totalAmountInstallation = 0;
      if (totalInstallQty > 0) {
         totalAmountInstallation = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
      }

      // เพิ่มค่าส่ง 150 บาทเหมือน Frontend
      const shippingFee = cartItems.length > 0 ? 150 : 0;
      const totalAmount = totalAmountProduct + totalAmountInstallation + shippingFee;

      // สร้าง Order
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

      // สร้าง Order Items และตัดสต็อก
      for (const item of cartItems) {
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

      // ลบตะกร้า
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

  // 2. ดูรายละเอียด Order (เจ้าของ + Admin)
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

  // 3. ดูประวัติการสั่งซื้อของตัวเอง
  async findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product'],
      order: { orderDate: 'DESC' }
    });
  }

  // 4. อัปโหลดสลิป (User + Admin)
  async updatePaymentSlip(orderId: string, fileName: string, userId: string, role: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction(); // เริ่ม Transaction

    try {
        // ใช้ manager ของ queryRunner แทน repository ปกติ
        const order = await queryRunner.manager.findOne(Order, { 
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
        
        await queryRunner.manager.save(order); // Save ผ่าน Transaction
        
        await queryRunner.commitTransaction(); // ยืนยันการบันทึก
        return { message: 'อัปโหลดสลิปเรียบร้อย', fileName };

    } catch (err) {
        await queryRunner.rollbackTransaction(); // ถ้าพลาด ยกเลิกทั้งหมด
        throw err;
    } finally {
        await queryRunner.release(); // ปล่อย Connection
    }
  }

  // 5. ดูออเดอร์ทั้งหมดในระบบ (Admin)
  async findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'items', 'items.product'], 
      order: { orderDate: 'DESC' }
    });
  }

  // 6. อัปเดตสถานะ (Admin) + คืนสต็อกถ้า Cancel
  async updateStatus(orderId: string, status: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product'] 
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    // ถ้าเปลี่ยนสถานะเป็น CANCELLED และสถานะเดิมไม่ใช่ CANCELLED -> คืนสต็อก
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