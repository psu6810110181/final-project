import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { User } from '../users/entities/user.entity';
import { ProductVariant } from '../products/entities/product-variant.entity'; // ✅ Import ProductVariant
import Stripe from 'stripe'; 

@Injectable()
export class OrdersService {
  private stripe: Stripe; 

  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(CartItem) private cartItemsRepository: Repository<CartItem>,
    private dataSource: DataSource,
  ) {
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), { apiVersion: '2026-02-25.clover' as any });
  }

  async createStripeSession(orderId: string, totalAmount: number, userId: string) {
    const frontendUrl = process.env.FRONTEND_URL;
    return await this.stripe.checkout.sessions.create({
      payment_method_types: ['card', 'promptpay'], 
      line_items: [{
        price_data: {
          currency: 'thb',
          product_data: { name: `ออเดอร์หมายเลข: ${orderId}` },
          unit_amount: Math.round(totalAmount * 100), 
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${frontendUrl}/orders?success=true`,
      cancel_url: `${frontendUrl}/orders?canceled=true`,
      metadata: { orderId, userId },
    });
  }

  // 1. Checkout
  async checkout(user: User, address: string) {
    // ✅ ดึงตะกร้ามาพร้อมโปรโมชันและ Variant 
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: user.id } }, 
      relations: ['product', 'product.promotions', 'variant'], 
    });

    if (cartItems.length === 0) throw new BadRequestException('ไม่มีสินค้าในตะกร้า');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmountProduct = 0;
      let totalInstallQty = 0; 

      // ✅ คำนวณราคาส่วนลดใน Loop
      for (const item of cartItems) {
        let finalPrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
        const stockToCheck = item.variant ? item.variant.stock : item.product.stock;

        if (stockToCheck < item.quantity) {
          throw new BadRequestException(`สินค้า ${item.product.name} เหลือไม่พอ`);
        }

        // ประมวลผลหักส่วนลดโปรโมชันถ้ามี
        if (item.product.promotions && item.product.promotions.length > 0) {
            const activePromo = item.product.promotions.find(p => p.isActive);
            if (activePromo) {
                if (activePromo.discountType === 'PERCENTAGE') {
                    finalPrice = finalPrice - (finalPrice * Number(activePromo.discountValue) / 100);
                } else if (activePromo.discountType === 'FIXED_AMOUNT') {
                    finalPrice = Math.max(0, finalPrice - Number(activePromo.discountValue));
                }
            }
        }

        // แนบ finalPrice ไว้ที่ item ชั่วคราวเพื่อให้ตอน save OrderItem นำไปใช้ได้สะดวก
        (item as any).finalPriceAtPurchase = finalPrice; 

        totalAmountProduct += finalPrice * item.quantity;
        totalInstallQty += item.installationQty || 0; 
      }

      let totalAmountInstallation = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
      const totalAmount = totalAmountProduct + totalAmountInstallation + 150;

      const order = this.ordersRepository.create({
        user: user, totalAmountProduct, totalAmountInstallation, totalAmount,
        status: 'PENDING', installationCharge: totalAmountInstallation,
        shippingAddress: address || user.address 
      });
      const savedOrder = await queryRunner.manager.save(order);

      // สร้าง Order Items
      for (const item of cartItems) {
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder, 
          product: item.product, 
          variant: item.variant, // ✅ บันทึก variant เผื่อ Order History ใช้งาน
          quantity: item.quantity,
          priceAtPurchase: (item as any).finalPriceAtPurchase, // ✅ บันทึกราคาตอนซื้อที่หักส่วนลดแล้ว
          installationQty: item.installationQty || 0 
        });
        await queryRunner.manager.save(orderItem);
      }

      await queryRunner.manager.delete(CartItem, { user: { id: user.id } });
      const session = await this.createStripeSession(savedOrder.id, totalAmount, user.id);
      
      await queryRunner.commitTransaction();
      return { message: 'สร้างคำสั่งซื้อสำเร็จ', orderId: savedOrder.id, url: session.url };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  // 2. ดูรายละเอียด Order
  async findOne(orderId: string, userId: string, role: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId }, relations: ['items', 'items.product', 'items.variant', 'user'], // ✅ เพิ่ม items.variant
    });
    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
    if (role !== 'admin' && order.user.id !== userId) throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
    return order;
  }

  // 3. ดูประวัติการสั่งซื้อ
  async findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.variant', 'reviews', 'reviews.product'], // ✅ เพิ่ม items.variant
      order: { orderDate: 'DESC' }
    });
  }

  // 4. ดูออเดอร์ทั้งหมดในระบบ
  async findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'items', 'items.product', 'items.variant'], order: { orderDate: 'DESC' } // ✅ เพิ่ม items.variant
    });
  }

  // 5. อัปเดตสถานะ 
  async updateStatus(orderId: string, status: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId }, relations: ['items', 'items.product', 'items.variant'] // ✅ เพิ่ม items.variant
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    // ถ้าเพิ่งจ่ายเงินสำเร็จ ให้ตัดสต็อกเลย 
    // ✅ โดยแยกตัดสต็อกของ variant กรณีมี variant
    if (status === 'PAID' && order.status !== 'PAID') {
      for (const item of order.items) {
        if (item.variant) {
            item.variant.stock -= item.quantity;
            await this.dataSource.getRepository(ProductVariant).save(item.variant);
        } else {
            const product = item.product;
            product.stock -= item.quantity; 
            await this.productsRepository.save(product);
        }
      }
    }

    // ถ้ากดยกเลิกและ "เคยจ่ายเงิน(หักสต็อกไปแล้ว)" ค่อยคืนสต็อก
    if (status === 'CANCELLED' && order.status === 'PAID') {
      for (const item of order.items) {
        if (item.variant) {
            item.variant.stock += item.quantity;
            await this.dataSource.getRepository(ProductVariant).save(item.variant);
        } else {
            const product = item.product;
            product.stock += item.quantity; 
            await this.productsRepository.save(product);
        }
      }
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }

  // 6. ยกเลิกออเดอร์โดยผู้ใช้งาน
  async cancelMyOrder(orderId: string, userId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId }, relations: ['user', 'items', 'items.product'],
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
    if (order.user.id !== userId) throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
    if (order.status !== 'PENDING') throw new BadRequestException('สถานะนี้ไม่สามารถยกเลิกได้');

    order.status = 'CANCELLED';
    await this.ordersRepository.save(order);
    return { message: 'ยกเลิกคำสั่งซื้อสำเร็จ' };
  }

  // 7. ลบออเดอร์
  async removeOrder(orderId: string) {
    const order = await this.ordersRepository.findOne({ where: { id: orderId }, relations: ['items'] });
    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect(); await queryRunner.startTransaction();
    try {
      if (order.items && order.items.length > 0) await queryRunner.manager.remove(order.items);
      await queryRunner.manager.remove(order);
      await queryRunner.commitTransaction();
      return { message: 'ลบคำสั่งซื้อสำเร็จเรียบร้อย' };
    } catch (err) {
      await queryRunner.rollbackTransaction(); throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async clearUserCart(userId: string) {
    await this.cartItemsRepository.delete({ user: { id: userId } });
  }
}