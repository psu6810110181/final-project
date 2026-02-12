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
    const { productId, quantity, requestInstallation } = createCartItemDto;

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
      // อัปเดตตัวเลือกติดตั้งด้วยถ้ามีการส่งมาใหม่
      if (requestInstallation !== undefined) existingItem.requestInstallation = requestInstallation;
      return await this.cartItemsRepository.save(existingItem);
    } else {
      const newItem = this.cartItemsRepository.create({
        quantity,
        requestInstallation: requestInstallation || false,
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
  async update(id: string, quantity: number, userId: string) {
    const cartItem = await this.cartItemsRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });

    if (!cartItem) throw new NotFoundException('Item not found');

    // 🛡️ Security: เช็คว่าเป็นของ user คนนี้จริงไหม?
    if (cartItem.user.id !== userId) {
        throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขตะกร้าของคนอื่น');
    }

    // เช็คสต็อก (Logic เดิม)
    if (quantity > cartItem.product.stock) {
      throw new BadRequestException(`สินค้าหมด! เหลือเพียง ${cartItem.product.stock} ชิ้น`);
    }

    cartItem.quantity = quantity;
    return await this.cartItemsRepository.save(cartItem);
  }

  // 5. ดึงข้อมูลตะกร้า + สรุปยอดเงิน (Logic เดิมของคุณที่สำคัญมาก! 💰)
  async getCartSummary(userId: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: userId } }, // ✅ ดึงเฉพาะของตัวเอง
      relations: ['product'],
    });

    let subTotal = 0;
    let totalInstallationFee = 0; // เพิ่มตัวแปรเก็บค่าติดตั้งรวม

    const items = cartItems.map((item) => {
      const totalLine = Number(item.product.price) * item.quantity;
      subTotal += totalLine;
      
      // ถ้ามีค่าติดตั้ง (สมมติ 500 บาทต่อชิ้น หรือต่อออเดอร์ ตาม Logic คุณ)
      // ใน OrderService คุณคิด 500 ดังนั้นตรงนี้ควรโชว์ให้ตรงกัน
      if (item.requestInstallation) {
          totalInstallationFee += 500; 
      }

      return {
        id: item.id,
        productId: item.product.id,
        productName: item.product.name,
        price: Number(item.product.price), // แปลงเป็น Number กันเหนียว
        quantity: item.quantity,
        total: totalLine,
        image: item.product.image,
        requestInstallation: item.requestInstallation
      };
    });

    // Logic คำนวณค่าส่งเดิมของคุณ
    const shippingFee = subTotal >= 5000 ? 0 : 150;
    
    return {
      items: items,
      summary: {
        subTotal: subTotal,
        shippingFee: shippingFee,
        installationFee: totalInstallationFee, // ส่งค่าติดตั้งกลับไปโชว์ด้วย
        grandTotal: subTotal + shippingFee + totalInstallationFee
      }
    };
  }
}