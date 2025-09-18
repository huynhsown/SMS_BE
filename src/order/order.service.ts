import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from 'src/product/entities/product.entity';
import { Cart } from 'src/cart/entities/cart.entity';
import { CheckoutDto, OrderResponseDto } from './dto/order.dto';
import { ObjectId } from 'mongodb';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class OrderService {
  @InjectRepository(Order)
  private orderRepository: Repository<Order>;

  @InjectRepository(Product)
  private productRepository: Repository<Product>;

  @InjectRepository(Cart)
  private cartRepository: Repository<Cart>;

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

  async checkout(dto: CheckoutDto, authHeader: string): Promise<OrderResponseDto> {
    const userId = this.extractUserId(authHeader);
    if (dto.paymentMethod !== 'COD') {
      throw new HttpException('Chỉ hỗ trợ phương thức COD', 400);
    }
    if (!dto.items || dto.items.length === 0) {
      throw new HttpException('Giỏ hàng trống', 400);
    }

    // Load products and validate stock
    const productIds = dto.items.map(i => new ObjectId(i.productId));
    const products = await this.productRepository.find({ where: { _id: { $in: productIds } as any } as any });
    const productMap = new Map(products.map(p => [p._id.toString(), p]));

    let subtotal = 0;
    const items = dto.items.map(i => {
      const p = productMap.get(i.productId);
      if (!p) throw new HttpException('Sản phẩm không tồn tại', 404);
      if (p.stock < i.quantity) throw new HttpException(`Sản phẩm ${p.name} không đủ số lượng`, 400);
      const price = p.price;
      const discountPrice = p.discountPrice || p.price;
      const discountPercent = p.discountPercent || 0;
      const totalPrice = price * i.quantity;
      const totalDiscountPrice = discountPrice * i.quantity;
      subtotal += totalDiscountPrice;
      return {
        productId: p._id.toString(),
        name: p.name,
        slug: p.slug,
        image: p.images?.[0] || '',
        price,
        discountPrice,
        discountPercent,
        quantity: i.quantity,
        totalPrice,
        totalDiscountPrice,
      };
    });

    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    const order = this.orderRepository.create({
      userId,
      items,
      subtotal,
      shippingFee,
      total,
      paymentMethod: 'COD',
      status: 'pending',
      shippingAddress: dto.shippingAddress,
    });
    const saved = await this.orderRepository.save(order);

    // Deduct stock and increase soldCount (explicit update to avoid $inc replacement error)
    for (const item of items) {
      const prod = productMap.get(item.productId);
      if (prod) {
        const newStock = Math.max(0, (prod.stock || 0) - item.quantity);
        const newSold = (prod.soldCount || 0) + item.quantity;
        await this.productRepository.update(
          { _id: new ObjectId(item.productId) } as any,
          { stock: newStock, soldCount: newSold } as any
        );
      }
    }

    // Clear cart for the user
    const cart = await this.cartRepository.findOne({ where: { userId } });
    if (cart) {
      cart.items = [];
      cart.totalAmount = 0;
      cart.totalDiscountAmount = 0;
      cart.finalAmount = 0;
      cart.totalItems = 0;
      await this.cartRepository.save(cart);
    }

    return {
      _id: saved._id.toString(),
      userId: saved.userId,
      items: saved.items,
      subtotal: saved.subtotal,
      shippingFee: saved.shippingFee,
      total: saved.total,
      paymentMethod: saved.paymentMethod,
      status: saved.status,
      shippingAddress: saved.shippingAddress,
      createdAt: saved.createdAt,
    };
  }

  async getOrderById(id: string, authHeader: string): Promise<OrderResponseDto> {
    const userId = this.extractUserId(authHeader);
    const order = await this.orderRepository.findOne({ where: { _id: new ObjectId(id) } as any });
    if (!order) throw new HttpException('Order not found', 404);
    if (order.userId !== userId) throw new HttpException('Forbidden', 403);
    return {
      _id: order._id.toString(),
      userId: order.userId,
      items: order.items,
      subtotal: order.subtotal,
      shippingFee: order.shippingFee,
      total: order.total,
      paymentMethod: order.paymentMethod,
      status: order.status,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    };
  }

  async listOrders(authHeader: string, page = 1, limit = 10) {
    const userId = this.extractUserId(authHeader);
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.max(1, Math.min(50, Number(limit) || 10));
    const skip = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      this.orderRepository.find({
        where: { userId } as any,
        order: { createdAt: 'DESC' } as any,
        skip,
        take: limitNum,
      }),
      this.orderRepository.count({ where: { userId } as any }),
    ]);

    return {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
      orders: orders.map(o => ({
        _id: o._id.toString(),
        subtotal: o.subtotal,
        shippingFee: o.shippingFee,
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        createdAt: o.createdAt,
        itemCount: o.items?.reduce((s,i)=>s+(i.quantity||0),0) || 0,
      })),
    };
  }
}
