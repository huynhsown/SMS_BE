import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';
import { ObjectId } from 'mongodb';
import { CartResponseDto, CartItemResponseDto } from './dto/cart.dto';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class CartService {
  @InjectRepository(Cart)
  private cartRepository: Repository<Cart>;

  @InjectRepository(Product)
  private productRepository: Repository<Product>;

  private extractUserId(authHeader: string): string {
    if (!authHeader) throw new HttpException('Missing Authorization header', 401);

    const token = authHeader.replace('Bearer ', '');
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      return decoded.sub || decoded.userId || decoded.id;
    } catch (e) {
      throw new HttpException('Invalid or expired token', 401);
    }
  }

  // Lấy giỏ hàng
  async getCart(authHeader: string): Promise<CartResponseDto> {
    const userId = this.extractUserId(authHeader);

    let cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepository.create({
        userId,
        items: [],
        totalAmount: 0,
        totalDiscountAmount: 0,
        finalAmount: 0,
        totalItems: 0,
      });
      await this.cartRepository.save(cart);
    }

    await this.validateAndUpdateCartItems(cart);
    return this.formatCartResponse(cart);
  }

  async removeFromCart(productId: string, authHeader: string): Promise<CartResponseDto> {
    const userId = this.extractUserId(authHeader);
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) throw new HttpException('Cart not found', 404);

    cart.items = cart.items.filter(item => item.productId.toString() !== productId.toString());
    this.calculateCartTotals(cart);
    await this.cartRepository.save(cart);
    return this.formatCartResponse(cart);
  }

  async clearCart(authHeader: string): Promise<void> {
    const userId = this.extractUserId(authHeader);
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (cart) {
      cart.items = [];
      this.calculateCartTotals(cart);
      await this.cartRepository.save(cart);
    }
  }

  private calculateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    cart.totalDiscountAmount = cart.items.reduce(
      (sum, item) => sum + (item.totalPrice - item.totalDiscountPrice),
      0,
    );
    cart.finalAmount = cart.totalAmount - cart.totalDiscountAmount;
  }

  private async formatCartResponse(cart: Cart): Promise<CartResponseDto> {
    const items: CartItemResponseDto[] = [];

    for (const item of cart.items) {
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(item.productId) } as any,
      });

      items.push({
        ...item,
        inStock: product ? product.stock >= item.quantity : false,
        availableStock: product ? product.stock : 0,
      });
    }

    return {
      _id: cart._id.toString(),
      userId: cart.userId,
      items,
      totalAmount: cart.totalAmount,
      totalDiscountAmount: cart.totalDiscountAmount,
      finalAmount: cart.finalAmount,
      totalItems: cart.totalItems,
      createdAt: cart.createdAt,
      updatedAt: cart.updatedAt,
    };
  }

  private async validateAndUpdateCartItems(cart: Cart): Promise<void> {
    let needsUpdate = false;

    for (let i = cart.items.length - 1; i >= 0; i--) {
      const item = cart.items[i];
      const product = await this.productRepository.findOne({
        where: { _id: new ObjectId(item.productId) } as any,
      });

      if (!product) {
        cart.items.splice(i, 1);
        needsUpdate = true;
      } else if (
        item.price !== product.price ||
        item.discountPrice !== (product.discountPrice || product.price)
      ) {
        item.price = product.price;
        item.discountPrice = product.discountPrice || product.price;
        item.discountPercent = product.discountPercent || 0;
        item.totalPrice = item.price * item.quantity;
        item.totalDiscountPrice = item.discountPrice * item.quantity;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      this.calculateCartTotals(cart);
      await this.cartRepository.save(cart);
    }
  }
}
