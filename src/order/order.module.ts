import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Product } from 'src/product/entities/product.entity';
import { Cart } from 'src/cart/entities/cart.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Product, Cart])],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
