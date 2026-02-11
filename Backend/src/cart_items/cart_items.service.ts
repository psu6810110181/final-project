import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common'; // 👈 เพิ่ม BadRequestException
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cart_item.entity';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
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

  // 1. เพิ่มของใส่ตะกร้า (Logic: Upsert + Check Stock)
  async addToCart(createCartItemDto: CreateCartItemDto, user: User) {
    const { productId, quantity } = createCartItemDto;

    // 1. เช็คสินค้า: มีในโลกไหม?
    const product = await this.productsRepository.findOne({ where: { id: productId } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${productId} not found`);
    }

    // 2. เช็คตะกร้า: User เคยหยิบชิ้นนี้หรือยัง?
    const existingItem = await this.cartItemsRepository.findOne({
      where: {
        user: { id: user.id },
        product: { id: product.id }, // ✅ ใช้ product.id เพื่อความชัวร์ของ Type
      },
    });

    // 🛑 3. [NEW] เช็คสต็อกก่อนบันทึก!
    // คำนวณจำนวนที่มีอยู่เดิมในตะกร้า (ถ้าไม่มีคือ 0)
    const currentQty = existingItem ? existingItem.quantity : 0;
    
    // ถ้า (ของในตะกร้าเดิม + ของที่จะเพิ่มใหม่) > สต็อกจริงในคลัง
    if (currentQty + quantity > product.stock) {
       throw new BadRequestException(
         `ของมีไม่พอครับ! (คลังมี: ${product.stock}, ตะกร้าคุณมี: ${currentQty}, จะเพิ่มอีก: ${quantity})`
       );
    }

    // 4. บันทึก (Save)
    if (existingItem) {
      // 🅰️ มีแล้ว: อัปเดตจำนวน
      existingItem.quantity += quantity;
      return await this.cartItemsRepository.save(existingItem);
    } else {
      // 🅱️ ยังไม่มี: สร้างใหม่
      const newItem = this.cartItemsRepository.create({
        quantity,
        product,
        user,
      });
      return await this.cartItemsRepository.save(newItem);
    }
  }

  // 2. ดูตะกร้าของฉัน
  async findAll(user: User) {
    return await this.cartItemsRepository.find({
      where: { user: { id: user.id } },
      relations: ['product'],
      order: { id: 'DESC' },
    });
  }

  // 3. ลบของออกจากตะกร้า
  async remove(id: string, user: User) {
    const item = await this.cartItemsRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!item) {
      throw new NotFoundException(`Cart item not found`);
    }

    return await this.cartItemsRepository.remove(item);
  }
}