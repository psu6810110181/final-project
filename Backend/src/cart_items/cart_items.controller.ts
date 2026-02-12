import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Patch } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { UpdateCartDto } from './dto/update-cart_item.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart') // 👈 ใช้ชื่อ path สั้นๆ ว่า 'cart'
@UseGuards(AuthGuard('jwt')) // 🔒 ล็อกกุญแจทั้ง Controller
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  create(@Body() createCartItemDto: CreateCartItemDto, @Req() req) {
    // req.user มาจาก Token (JWT) ที่เราส่งไป
    return this.cartItemsService.addToCart(createCartItemDto, req.user);
  }

  // 👇 เพิ่มใหม่: ล้างตะกร้าทั้งหมด (ข้อ 5)
  @Delete()
  clearCart(@Req() req) {
    return this.cartItemsService.clearCart(req.user);
  }

  // ลบสินค้าบางรายการ (ข้อ 4)
  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.cartItemsService.remove(id, req.user);
  }

  // ดึงตะกร้าพร้อมยอดเงิน
  @Get()
  getCart(@Req() req) {
    return this.cartItemsService.getCartSummary(req.user.id);
  }

  // ปุ่ม +/- (ส่ง quantity ใหม่มา)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCartDto: UpdateCartDto, @Req() req) { // 👈 รับ req
    return this.cartItemsService.update(id, updateCartDto.quantity, req.user); // 👈 ส่ง user ไปให้ service
  }
}