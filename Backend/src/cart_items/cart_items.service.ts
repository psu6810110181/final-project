import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
// import { CreateCartItemDto } from './dto/create-cart_item.dto'; // หากมีการใช้ DTO
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

  // 1. เพิ่มของใส่ตะกร้า (Upsert)
  async addToCart(createCartItemDto: any, user: User) { // เปลี่ยน any เป็น DTO ของคุณถ้ามี
    const { productId, quantity } = createCartItemDto;

    // 1.1 เช็คสินค้า
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 1.2 เช็คตะกร้าเดิม
    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: product.id },
      },
    });

    // 1.3 เช็คสต็อก (ของเดิม + ของใหม่ > สต็อกไหม?)
    const currentQty = existingItem ? existingItem.quantity : 0;
    if (currentQty + quantity > product.stock) {
        throw new BadRequestException(
          `ของมีไม่พอครับ! (คลังมี: ${product.stock}, ตะกร้าคุณมี: ${currentQty}, จะเพิ่มอีก: ${quantity})`
        );
    }

    // 1.4 บันทึก
    if (existingItem) {
      existingItem.quantity += quantity;
      return await this.cartItemsRepository.save(existingItem);
    } else {
      const newItem = this.cartItemsRepository.create({
        quantity,
        product,
        user,
      });
      return await this.cartItemsRepository.save(newItem);
    }
  }

  // 2. ลบของออกจากตะกร้า (ลบทีละชิ้น)
  async remove(id: string, user: User) {
    const item = await this.cartItemsRepository.findOne({
      where: { id, user: { id: user.id } }, // ✅ เช็คความเป็นเจ้าของ
    });

    if (!item) {
      throw new NotFoundException(`Cart item not found`);
    }

    return await this.cartItemsRepository.remove(item);
  }

  // 👇 เพิ่มใหม่: ล้างตะกร้าทั้งหมดของ User คนนั้น
  async clearCart(user: User) {
    // ลบรายการทั้งหมดที่มี user.id ตรงกับคนที่ยิง Request มา
    await this.cartItemsRepository.delete({ user: { id: user.id } });
    
    // คืนค่าบอกว่าลบสำเร็จ
    return {
      message: 'Cart cleared successfully',
      statusCode: 200
    };
  }

  // 3. แก้ไขจำนวน (Security Fixed 🛡️)
  async update(id: string, quantity: number, user: User) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id },
      relations: ['product', 'user'], // Load user มาเช็ค
    });

    if (!cartItem) throw new NotFoundException('Item not found');

    // 🛡️ เช็คว่าเป็นของ user คนนี้จริงไหม?
    if (cartItem.user.id !== user.id) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขตะกร้าของคนอื่น');
    }

    // เช็คสต็อก
    if (quantity > cartItem.product.stock) {
      throw new BadRequestException(`Product out of stock! Only ${cartItem.product.stock} left.`);
    }

    cartItem.quantity = quantity;
    return await this.cartItemsRepository.save(cartItem);
  }

  // 4. ดึงข้อมูลตะกร้า + สรุปยอดเงิน
  async getCartSummary(userId: string) {
    // 1. ดึงรายการตะกร้าเหมือนเดิม
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });

    let subTotal = 0;
    
    // 2. วนลูปคำนวณเงิน
    const items = cartItems.map((item) => {
      const totalLine = item.product.price * item.quantity;
      subTotal += totalLine;
      return {
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: totalLine,
        image: item.product.image 
      };
    });

    // 3. Logic คำนวณยอดสุทธิ
    const shippingFee = subTotal >= 5000 ? 0 : 150;
    const installationFee = 0; // ค่าติดตั้ง (ส่งไปให้ครบตาม UI)

    return {
      items: items, // รายการสินค้า
      summary: {    // สรุปยอดเงิน
        subTotal: subTotal,
        shippingFee: shippingFee,
        installationFee: installationFee,
        grandTotal: subTotal + shippingFee + installationFee
      }
    };
  }
}