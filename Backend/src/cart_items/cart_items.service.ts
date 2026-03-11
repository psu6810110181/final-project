import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity';

@Injectable()
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant)
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  // 1. เพิ่มของใส่ตะกร้า
  async addToCart(createCartItemDto: CreateCartItemDto, user: User) {
    const { productId, quantity, installationQty, variantId } = createCartItemDto;

    if (quantity <= 0) {
      throw new BadRequestException('จำนวนสินค้าที่เพิ่มเข้าตะกร้าต้องมากกว่า 0 ชิ้น');
    }

    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

    let variant: ProductVariant | null = null;
    if (variantId) {
      variant = await this.variantsRepository.findOne({ where: { id: variantId } });
      if (!variant) throw new NotFoundException(`ไม่พบตัวเลือกสินค้านี้`);
    }

    // เช็คตะกร้าเดิม (ของ User คนนี้เท่านั้น) โดยแยกตาม Variant อย่างปลอดภัย
    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: product.id },
        variant: variant ? { id: variant.id } : IsNull(),
      },
    });

    // เช็คสต็อก (อิงตาม variant หรือ สินค้าหลัก)
    const stockToCheck = variant ? variant.stock : product.stock;
    const currentQty = existingItem ? existingItem.quantity : 0;

    if (currentQty + quantity > stockToCheck) {
      throw new BadRequestException(
        `ของมีไม่พอครับ! (คลังมี: ${stockToCheck}, ตะกร้าคุณมี: ${currentQty}, จะเพิ่มอีก: ${quantity})`
      );
    }

    // บันทึกข้อมูล
    if (existingItem) {
      existingItem.quantity += quantity;
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
        installationQty: installationQty || 0,
        product,
        variant: variant || undefined, // ส่ง undefined เพื่อป้องกัน TypeORM Error
        user,
      });
      return await this.cartItemsRepository.save(newItem);
    }
  }

  // 2. ลบของออกจากตะกร้า
  async remove(id: string, userId: string) {
    const item = await this.cartItemsRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!item) {
      throw new NotFoundException(`ไม่พบสินค้าในตะกร้า หรือคุณไม่มีสิทธิ์ลบ`);
    }

    return await this.cartItemsRepository.remove(item);
  }

  // 3. ล้างตะกร้าทั้งหมด
  async clearCart(userId: string) {
    await this.cartItemsRepository.delete({ user: { id: userId } });
    return {
      message: 'Cart cleared successfully',
      statusCode: 200,
    };
  }

  // 4. แก้ไขจำนวน
  async update(id: string, quantity: number | undefined, installationQty: number | undefined, userId: string) {
    const cartItem = await this.cartItemsRepository.findOne({ 
      where: { id }, 
      relations: ['product', 'variant', 'user'] 
    });
    
    if (!cartItem) throw new NotFoundException('Item not found');
    if (cartItem.user.id !== userId) throw new ForbiddenException('คุณไม่มีสิทธิ์แก้ไขตะกร้าของคนอื่น');

    const stockToCheck = cartItem.variant ? cartItem.variant.stock : cartItem.product.stock;

    if (quantity !== undefined) {
      if (quantity <= 0) throw new BadRequestException('จำนวนสินค้าต้องมากกว่า 0');
      if (quantity > stockToCheck) throw new BadRequestException(`สินค้าหมด! เหลือเพียง ${stockToCheck} ชิ้น`);
      cartItem.quantity = quantity;
    }

    if (installationQty !== undefined) cartItem.installationQty = installationQty;
    if (cartItem.installationQty > cartItem.quantity) cartItem.installationQty = cartItem.quantity;

    return await this.cartItemsRepository.save(cartItem);
  }

  // 5. ดึงข้อมูลตะกร้า
  async getCartSummary(userId: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: userId } },
      relations: ['product', 'product.promotions', 'variant'],
    });

    let subTotal = 0;
    let totalInstallQty = 0;

    const items = cartItems.map((item) => {
      let finalPrice = item.variant ? Number(item.variant.price) : Number(item.product.price);

      // คำนวณราคาส่วนลดแสดงหน้าตะกร้า (ถ้ามี)
      if (item.product.promotions && item.product.promotions.length > 0) {
        const activePromo = item.product.promotions.find((p: any) => p.isActive);
        if (activePromo) {
          if (activePromo.discountType === 'PERCENTAGE') {
            finalPrice = finalPrice - (finalPrice * Number(activePromo.discountValue) / 100);
          } else if (activePromo.discountType === 'FIXED_AMOUNT') {
            finalPrice = Math.max(0, finalPrice - Number(activePromo.discountValue));
          }
        }
      }

      const totalLine = finalPrice * item.quantity;
      subTotal += totalLine;
      totalInstallQty += item.installationQty || 0;

      return {
        id: item.id,
        quantity: item.quantity,
        product: item.product,
        variant: item.variant,
        installationQty: item.installationQty,
        total: totalLine,
      };
    });

    let totalInstallationFee = 0;
    if (totalInstallQty > 0) {
      totalInstallationFee = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
    }

    // คิดค่าส่ง (ถ้าไม่มีของในตะกร้า = 0, ถ้ายอดถึง 5,000 = ส่งฟรี, ไม่ถึง = 150)
    let shippingFee = 0;
    if (cartItems.length > 0) {
        shippingFee = subTotal >= 5000 ? 0 : 150;
    }

    return {
      items: items,
      summary: {
        subTotal: subTotal,
        shippingFee: shippingFee,
        installationFee: totalInstallationFee,
        grandTotal: subTotal + shippingFee + totalInstallationFee,
      },
    };
  }
}