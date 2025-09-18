import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItem } from './entities/cart.entity';
import { Product } from 'src/product/entities/product.entity';
import { ObjectId } from 'mongodb';
import { CartResponseDto, CartItemResponseDto, AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';
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

  // Thêm sản phẩm vào giỏ
  async addToCart(dto: AddToCartDto, authHeader: string): Promise<CartResponseDto> {
    const userId = this.extractUserId(authHeader);
    const { productId, quantity } = dto;

    const product = await this.productRepository.findOne({ where: { _id: new ObjectId(productId) } as any });
    if (!product) throw new HttpException('Product not found', 404);
    if (quantity < 1) throw new HttpException('Quantity must be at least 1', 400);

    let cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) {
      cart = this.cartRepository.create({ userId, items: [], totalAmount: 0, totalDiscountAmount: 0, finalAmount: 0, totalItems: 0 });
    }

    const existing = cart.items.find(i => i.productId?.toString() === productId.toString());
    const price = product.price;
    const discountPrice = product.discountPrice || product.price;
    const discountPercent = product.discountPercent || 0;

    if (existing) {
      existing.quantity += quantity;
      existing.price = price;
      existing.discountPrice = discountPrice;
      existing.discountPercent = discountPercent;
      existing.totalPrice = existing.price * existing.quantity;
      existing.totalDiscountPrice = existing.discountPrice * existing.quantity;
    } else {
      const item: CartItem = {
        productId: product._id.toString(),
        name: product.name,
        slug: product.slug,
        image: product.images?.[0] || '',
        price,
        discountPrice,
        discountPercent,
        quantity,
        totalPrice: price * quantity,
        totalDiscountPrice: discountPrice * quantity,
      };
      cart.items.push(item);
    }

    this.calculateCartTotals(cart);
    await this.cartRepository.save(cart);
    await this.validateAndUpdateCartItems(cart);
    return this.formatCartResponse(cart);
  }

  // Cập nhật số lượng sản phẩm trong giỏ
  async updateCartItem(dto: UpdateCartItemDto, authHeader: string): Promise<CartResponseDto> {
    const userId = this.extractUserId(authHeader);
    const { productId, quantity } = dto;

    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (!cart) throw new HttpException('Cart not found', 404);

    const idx = cart.items.findIndex(i => i.productId?.toString() === productId.toString());
    if (idx === -1) throw new HttpException('Item not found in cart', 404);

    if (quantity <= 0) {
      cart.items.splice(idx, 1);
    } else {
      const product = await this.productRepository.findOne({ where: { _id: new ObjectId(productId) } as any });
      if (!product) throw new HttpException('Product not found', 404);
      const price = product.price;
      const discountPrice = product.discountPrice || product.price;
      const discountPercent = product.discountPercent || 0;
      const item = cart.items[idx];
      item.quantity = quantity;
      item.price = price;
      item.discountPrice = discountPrice;
      item.discountPercent = discountPercent;
      item.totalPrice = price * quantity;
      item.totalDiscountPrice = discountPrice * quantity;
    }

    this.calculateCartTotals(cart);
    await this.cartRepository.save(cart);
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
