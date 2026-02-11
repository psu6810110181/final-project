import { Controller, Get, Post, Body, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CartItemsService } from './cart_items.service';
import { CreateCartItemDto } from './dto/create-cart_item.dto';
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

  @Get()
  findAll(@Req() req) {
    return this.cartItemsService.findAll(req.user);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.cartItemsService.remove(id, req.user);
  }
}