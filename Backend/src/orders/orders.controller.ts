import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req, Res, Headers, type RawBodyRequest } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Request, type Response } from 'express';
import Stripe from 'stripe'; 

@Controller('orders')
export class OrdersController {
  private stripe: Stripe;

  constructor(private readonly ordersService: OrdersService) {
    // ✅ เติม as any กัน Type Error แบบเดียวกับใน Service
    this.stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), { apiVersion: '2026-02-25.clover' as any });
  }

  @Post('checkout')
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  create(@Req() req, @Body('address') address: string) {
    return this.ordersService.checkout(req.user, address);
  }

  // ✅ แก้ไขฟังก์ชันชำระเงินต่อ ให้เรียก Service ที่จะไปอัปเดตราคาโปรโมชั่นก่อน
  @Post(':id/retry-payment')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  async retryPayment(@Param('id') id: string, @Req() req) {
    // โยนไปให้ Service จัดการอัปเดตราคาและขอ URL ใหม่ให้เลย
    return this.ordersService.retryPayment(id, req.user.id);
  }

  @Get('my-orders')
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  findMyOrders(@Req() req) {
    return this.ordersService.findMyOrders(req.user.id);
  }

  @Patch(':id/cancel')
  @UseGuards(AuthGuard('jwt'), RolesGuard) 
  async cancelMyOrder(@Param('id') id: string, @Req() req) { 
    return this.ordersService.cancelMyOrder(id, req.user.id); 
  }

  @Post('webhook')
  async stripeWebhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response, @Headers('stripe-signature') signature: string) {    
    let event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req.rawBody as Buffer, 
        signature,
        String(process.env.STRIPE_WEBHOOK_SECRET)
      );
    } catch (err: any) {
      console.log('Webhook Error:', err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const orderId = session.metadata?.orderId; 
      const userId = session.metadata?.userId; 

      if (orderId) {
        await this.ordersService.updateStatus(orderId, 'PAID');
        if (userId) await this.ordersService.clearUserCart(userId);
      }
    }
    res.json({ received: true });
  }

  @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findAll() { return this.ordersService.findAll(); }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  findOne(@Param('id') id: string, @Req() req) { return this.ordersService.findOne(id, req.user.id, req.user.role); }
  
  @Patch(':id/status')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  updateStatus(@Param('id') id: string, @Body('status') status: string) { return this.ordersService.updateStatus(id, status); }
  
  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles('admin')
  removeOrder(@Param('id') id: string) { return this.ordersService.removeOrder(id); }
}