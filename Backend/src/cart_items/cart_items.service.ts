import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm'; 
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto'; 
import { User } from '../users/entities/user.entity';
import { Product } from '../products/entities/product.entity';
import { ProductVariant } from '../products/entities/product-variant.entity'; 

function getDiscountedPrice(product: any): number {
  let price = Number(product.price);
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
export class CartItemsService {
  constructor(
    @InjectRepository(CartItem)
    private cartItemsRepository: Repository<CartItem>,
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
    @InjectRepository(ProductVariant) 
    private variantsRepository: Repository<ProductVariant>,
  ) {}

  async addToCart(createCartItemDto: CreateCartItemDto, user: User) { 
    const { productId, quantity, installationQty, variantId } = createCartItemDto; 

    if (quantity <= 0) {
      throw new BadRequestException('จำนวนสินค้าที่เพิ่มเข้าตะกร้าต้องมากกว่า 0 ชิ้น');
    }

    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) throw new NotFoundException(`Product with ID ${productId} not found`);

    // ... โค้ดด้านบน ...
    let variant: ProductVariant | null = null;
    if (variantId) {
      variant = await this.variantsRepository.findOne({ where: { id: variantId } });
      if (!variant) throw new NotFoundException(`ไม่พบตัวเลือกสินค้านี้`);
    }

    // ✅ แยกเงื่อนไข where ออกมาให้ TypeORM อ่านง่ายขึ้น
    const whereCondition: any = {
      user: { id: user.id },
      product: { id: product.id },
    };

    if (variantId) {
      whereCondition.variant = { id: variantId };
    } else {
      whereCondition.variant = IsNull(); // ถ้าไม่มีตัวเลือก ให้หาอันที่ variant เป็นค่าว่าง
    }

    const existingItem = await this.cartItemsRepository.findOne({
      where: whereCondition,
    });

    const stockToCheck = variant ? variant.stock : product.stock;
    // ... โค้ดด้านล่างเหมือนเดิม ...
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    if (currentQty + quantity > stockToCheck) {
        throw new BadRequestException(
          `ของมีไม่พอครับ! (คลังมี: ${stockToCheck}, ตะกร้าคุณมี: ${currentQty}, จะเพิ่มอีก: ${quantity})`
        );
    }

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
        variant: variant as any, // ✅ แก้เส้นแดงตรงนี้โดยเติม as any
        user,
      });
      return await this.cartItemsRepository.save(newItem);
    }
  }

  async remove(id: string, userId: string) {
    const item = await this.cartItemsRepository.findOne({ where: { id, user: { id: userId } } });
    if (!item) throw new NotFoundException(`ไม่พบสินค้าในตะกร้า หรือคุณไม่มีสิทธิ์ลบ`);
    return await this.cartItemsRepository.remove(item);
  }

  async clearCart(userId: string) {
    await this.cartItemsRepository.delete({ user: { id: userId } }); 
    return { message: 'Cart cleared successfully', statusCode: 200 };
  }

  async update(id: string, quantity: number | undefined, installationQty: number | undefined, userId: string) {
    const cartItem = await this.cartItemsRepository.findOne({ where: { id }, relations: ['product', 'variant', 'user'] });
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

  async getCartSummary(userId: string) {
    const cartItems = await this.cartItemsRepository.find({
      where: { user: { id: userId } }, 
      relations: ['product', 'product.promotions', 'variant'], 
    });

    let subTotal = 0;
    let totalInstallQty = 0; 

    const items = cartItems.map((item) => {
      const basePrice = item.variant ? Number(item.variant.price) : Number(item.product.price);
      
      let finalPrice = basePrice;
      if (item.product.promotions && item.product.promotions.length > 0) {
        const activePromo = item.product.promotions.find((p: any) => p.isActive);
        if (activePromo) {
          if (activePromo.discountType === 'PERCENTAGE') {
            finalPrice -= (finalPrice * (activePromo.discountValue / 100));
          } else if (activePromo.discountType === 'FIXED_AMOUNT') {
            finalPrice -= activePromo.discountValue;
          }
        }
      }
      finalPrice = Math.max(0, finalPrice);

      const totalLine = finalPrice * item.quantity; 
      subTotal += totalLine;
      totalInstallQty += item.installationQty || 0; 

      return {
        id: item.id,            
        quantity: item.quantity,
        product: item.product,  
        variant: item.variant, 
        installationQty: item.installationQty, 
        total: totalLine        
      };
    });

    let totalInstallationFee = 0;
    if (totalInstallQty > 0) {
      totalInstallationFee = totalInstallQty >= 4 ? 990 : (totalInstallQty * 400);
    }

    const shippingFee = cartItems.length > 0 ? 150 : 0; 
    
    return {
      items: items,
      summary: {
        subTotal: subTotal,
        shippingFee: shippingFee,
        installationFee: totalInstallationFee, 
        grandTotal: subTotal + shippingFee + totalInstallationFee
      }
    };
  }
}