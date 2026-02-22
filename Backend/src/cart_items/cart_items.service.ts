import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto'; // ✅ ใช้ DTO
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  // 1. เพิ่มของใส่ตะกร้า (Logic เดิมของคุณ + Type ที่ถูกต้อง)
  async addToCart(createCartItemDto: CreateCartItemDto, user: User) { // ✅ แก้ any เป็น DTO
    const { productId, quantity, installationQty } = createCartItemDto; // เปลี่ยนเป็นดึง installationQty

    if (quantity <= 0) {
      throw new BadRequestException('จำนวนสินค้าที่เพิ่มเข้าตะกร้าต้องมากกว่า 0 ชิ้น');
    }

    // 1.1 เช็คสินค้า
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 1.2 เช็คตะกร้าเดิม (ของ User คนนี้เท่านั้น)
    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: product.id },
      },
    });

    // 1.3 เช็คสต็อก (Logic เดิมของคุณ)
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity > product.stock) {
        throw new BadRequestException(
          `ของมีไม่พอครับ! (คลังมี: ${product.stock}, ตะกร้าคุณมี: ${currentQty}, จะเพิ่มอีก: ${quantity})`
        );
    }

    // 1.4 บันทึก
    if (existingItem) {
      existingItem.quantity += quantity;
      // บวกจำนวนติดตั้งเพิ่มเข้าไป และบังคับว่าห้ามเกินจำนวนสินค้าทั้งหมด
      if (installationQty !== undefined) {
         existingItem.installationQty += installationQty;
         if (existingItem.installationQty > existingItem.quantity) {
             existingItem.installationQty = existingItem.quantity;
         }
      }
      return await this.cartItemsRepository.save(existingItem);
    } else {
      const newItem = this.cartItemsRepository.create({
        quantity,
        installationQty: installationQty || 0, // ค่าเริ่มต้น
        product,
        user,
      });
      return await this.cartItemsRepository.save(newItem);
    }
  }

  // 2. ลบของออกจากตะกร้า (Secure ✅)
  async remove(id: string, userId: string) {
    const item = await this.cartItemsRepository.findOne({
      where: { id, user: { id: userId } }, // ✅ เช็คว่าเป็นเจ้าของตะกร้าจริงๆ
    });

    if (!item) {
      throw new NotFoundException(`ไม่พบสินค้าในตะกร้า หรือคุณไม่มีสิทธิ์ลบ`);
    }

    return await this.cartItemsRepository.remove(item);
  }

  // 3. ล้างตะกร้าทั้งหมด (Secure ✅)
  async clearCart(userId: string) {
    await this.cartItemsRepository.delete({ user: { id: userId } }); // ✅ ลบเฉพาะของตัวเอง
    return {
      message: 'Cart cleared successfully',
      statusCode: 200
    };
  }

// 4. แก้ไขจำนวน (Secure + Logic เดิม ✅)
  async update(id: string, quantity: number | undefined, installationQty: number | undefined, userId: string) {
    const cartItem = await this.cartItemsRepository.findOne({ where: { id }, relations: ['product', 'user'] });
    if (!cartItem) throw new NotFoundException('Item not found');
    if (cartItem.user.id !== userId) throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขตะกร้าของคนอื่น');

    if (quantity !== undefined) {
      if (quantity <= 0) throw new BadRequestException('จำนวนสินค้าต้องมากกว่า 0');
      if (quantity > cartItem.product.stock) throw new BadRequestException(`สินค้าหมด! เหลือเพียง ${cartItem.product.stock} ชิ้น`);
      cartItem.quantity = quantity;
    }
    
    if (installationQty !== undefined) {
      cartItem.installationQty = installationQty;
    }

    // เซฟตี้: ห้ามให้ติดตั้งเยอะกว่าจำนวนที่ซื้อ
    if (cartItem.installationQty > cartItem.quantity) {
      cartItem.installationQty = cartItem.quantity;
    }

    return await this.cartItemsRepository.save(cartItem);
  }

// ใน Backend/src/cart_items/cart_items.service.ts

  async getCartSummary(userId: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: userId } }, 
      relations: ['product'],
    });

    let subTotal = 0;
    let totalInstallQty = 0; // ✅ เปลี่ยนจากเก็บเงิน เป็นเก็บ 'จำนวนชิ้นรวม' ก่อน

    const items = cartItems.map((item) => {
      const totalLine = Number(item.product.price) * item.quantity;
      subTotal += totalLine;
      
      // ✅ ลบ if (item.requestInstallation) แบบเก่าออก 
      // แล้วเปลี่ยนเป็นบวกจำนวนชิ้นที่ต้องติดตั้งเข้าไปแทน
      totalInstallQty += item.installationQty || 0; 

      return {
        id: item.id,            
        quantity: item.quantity,
        product: item.product,  
        installationQty: item.installationQty, 
        total: totalLine        
      };
    });

    // ✅ คำนวณค่าติดตั้งตรงนี้ (หลังจบลูป map)
    let totalInstallationFee = 0;
    if (totalInstallQty > 0) {
      totalInstallationFee = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
    }

    const shippingFee = subTotal >= 5000 ? 0 : 150; // (ตัวอย่างเงื่อนไขส่งฟรีของคุณ)
    
    return {
      items: items,
      summary: {
        subTotal: subTotal,
        shippingFee: shippingFee,
        installationFee: totalInstallationFee, // ส่งค่าติดตั้งที่คำนวณใหม่กลับไป
        grandTotal: subTotal + shippingFee + totalInstallationFee
      }
    };
  }
}