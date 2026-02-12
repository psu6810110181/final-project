import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req, Patch } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('cart-items') // ใช้ cart-items หรือ cart แล้วแต่คุณเลือก (ให้ตรงกับ Frontend)
@UseGuards(AuthGuard('jwt'))
export class CartItemsController {
  constructor(private readonly cartItemsService: CartItemsService) {}

  @Post()
  create(@Body() createCartItemDto: CreateCartItemDto, @Req() req) {
    // ส่ง User ทั้งก้อนไป (เพราะ Service ต้องการ User Object)
    return this.cartItemsService.addToCart(createCartItemDto, req.user);
  }

  @Get()
  getCart(@Req() req) {
    // ส่งแค่ ID ไป (เพราะ Service ต้องการแค่ ID มา Query)
    return this.cartItemsService.getCartSummary(req.user.id);
  }

  @Patch(':id')
  // รับ Body เป็น { quantity: 5 }
  update(@Param('id') id: string, @Body('quantity') quantity: number, @Req() req) {
    return this.cartItemsService.update(id, quantity, req.user.id);
  }

  @Delete()
  clearCart(@Req() req) {
    return this.cartItemsService.clearCart(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.cartItemsService.remove(id, req.user.id);
  }
}