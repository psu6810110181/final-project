import { Injectable, BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order_items/entities/order_item.entity';
import { CartItem } from '../cart_items/entities/cart_item.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity'; // ✅ นำเข้า Variant
import { User } from '../users/entities/user.entity';
import Stripe from 'stripe'; 

function getDiscountedPrice(product: any, variantPrice?: number): number {
  let price = variantPrice ? Number(variantPrice) : Number(product.price);
  if (product.promotions && product.promotions.length > 0) {
    const activePromo = product.promotions.find((p: any) => p.isActive);
    if (activePromo) {
      if (activePromo.discountType === 'PERCENTAGE') {
        price = price - (price * (activePromo.discountValue / 100));
      } else if (activePromo.discountType === 'FIXED_AMOUNT') {
        price = price - activePromo.discountValue;
      }
    }
  }
  return Math.max(0, price);
}

@Injectable()
export class OrdersService {
  private stripe: Stripe; 

  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant) private variantsRepository: Repository<ProductVariant>, // ✅ Inject Repository
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

  async checkout(user: User, address: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: user.id } }, 
      relations: ['product', 'product.promotions', 'variant'], // ✅ ดึง variant
    });

    if (cartItems.length === 0) throw new BadRequestException('ไม่มีสินค้าในตะกร้า');

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let totalAmountProduct = 0;
      let totalInstallQty = 0; 

      for (const item of cartItems) {
        // ✅ เลือกสต็อกที่จะเช็ค
        const stockToCheck = item.variant ? item.variant.stock : item.product.stock;
        if (stockToCheck < item.quantity) {
          throw new BadRequestException(`สินค้า ${item.product.name} เหลือไม่พอ`);
        }
        
        // ✅ คำนวณราคาโดยส่งราคา Variant เข้าไปด้วย (ถ้ามี)
        const finalPrice = getDiscountedPrice(item.product, item.variant ? item.variant.price : undefined);
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

      for (const item of cartItems) {
        const finalPrice = getDiscountedPrice(item.product, item.variant ? item.variant.price : undefined);
        const orderItem = queryRunner.manager.create(OrderItem, {
          order: savedOrder, 
          product: item.product, 
          variant: item.variant, // ✅ บันทึก variant ลง OrderItem ด้วย
          quantity: item.quantity,
          priceAtPurchase: finalPrice, 
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

  async retryPayment(orderId: string, userId: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId },
      relations: ['items', 'items.product', 'items.product.promotions', 'items.variant', 'user'], // ✅ โหลด variant
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
    if (order.user.id !== userId) throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
    if (order.status !== 'PENDING') throw new BadRequestException('ออเดอร์นี้ไม่ได้อยู่ในสถานะรอชำระเงิน');

    let totalAmountProduct = 0;
    for (const item of order.items) {
      const currentPrice = getDiscountedPrice(item.product, item.variant ? item.variant.price : undefined);
      item.priceAtPurchase = currentPrice;
      totalAmountProduct += currentPrice * item.quantity;
      await this.dataSource.getRepository(OrderItem).save(item);
    }

    order.totalAmountProduct = totalAmountProduct;
    order.totalAmount = totalAmountProduct + Number(order.totalAmountInstallation) + 150;
    const updatedOrder = await this.ordersRepository.save(order);

    const session = await this.createStripeSession(updatedOrder.id, updatedOrder.totalAmount, userId);
    return { url: session.url };
  }

  async findOne(orderId: string, userId: string, role: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId }, relations: ['items', 'items.product', 'items.variant', 'user'], // ✅
    });
    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');
    if (role !== 'admin' && order.user.id !== userId) throw new ForbiddenException('ไม่มีสิทธิ์เข้าถึง');
    return order;
  }

  async findMyOrders(userId: string) {
    return this.ordersRepository.find({
      where: { user: { id: userId } },
      relations: ['items', 'items.product', 'items.variant', 'reviews', 'reviews.product'], // ✅
      order: { orderDate: 'DESC' }
    });
  }

  async findAll() {
    return this.ordersRepository.find({
      relations: ['user', 'items', 'items.product', 'items.variant'], order: { orderDate: 'DESC' } // ✅
    });
  }

  // ✅ ตัดสต็อก รองรับ Variant
  async updateStatus(orderId: string, status: string) {
    const order = await this.ordersRepository.findOne({
      where: { id: orderId }, relations: ['items', 'items.product', 'items.variant'] // ✅ โหลด Variant
    });

    if (!order) throw new NotFoundException('ไม่พบคำสั่งซื้อ');

    if (status === 'PAID' && order.status !== 'PAID') {
      for (const item of order.items) {
        if (item.variant) {
          item.variant.stock -= item.quantity; 
          await this.variantsRepository.save(item.variant);
        } else {
          item.product.stock -= item.quantity; 
          await this.productsRepository.save(item.product);
        }
      }
    }

    if (status === 'CANCELLED' && order.status === 'PAID') {
      for (const item of order.items) {
        if (item.variant) {
          item.variant.stock += item.quantity; 
          await this.variantsRepository.save(item.variant);
        } else {
          item.product.stock += item.quantity; 
          await this.productsRepository.save(item.product);
        }
      }
    }

    order.status = status;
    return this.ordersRepository.save(order);
  }

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