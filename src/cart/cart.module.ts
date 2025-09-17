import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cart } from './entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';
import { CartService } from './cart.service';
import { CartController } from './cart.controller';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

function ensureCartIdCookie(req: Request, res: Response, next: NextFunction) {
  const COOKIE_NAME = 'cart_id';
  let id = req.cookies?.[COOKIE_NAME];
  if (!id) {
    id = `guest_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    res.cookie(COOKIE_NAME, id, {
      httpOnly: false,
      sameSite: 'lax',
      secure: false,
      maxAge: 1000 * 60 * 60 * 24 * 365
    });
  }
  (req as any).cartUserId = id;
  next();
}

@Module({
	imports: [TypeOrmModule.forFeature([Cart, Product])],
	controllers: [CartController],
	providers: [CartService],
	exports: [CartService], 
})
export class CartModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(ensureCartIdCookie).forRoutes(CartController);
	}
}