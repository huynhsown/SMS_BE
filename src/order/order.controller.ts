import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { OrderService } from './order.service';
import { CheckoutDto, OrderResponseDto } from './dto/order.dto';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post('checkout')
  async checkout(
    @Body() body: CheckoutDto,
    @Headers('authorization') authHeader: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.checkout(body, authHeader);
  }

  @Get(':id')
  async getOrder(
    @Param('id') id: string,
    @Headers('authorization') authHeader: string,
  ): Promise<OrderResponseDto> {
    return this.orderService.getOrderById(id, authHeader);
  }

  @Get()
  async listOrders(
    @Headers('authorization') authHeader: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    return this.orderService.listOrders(authHeader, Number(page), Number(limit));
  }
}
