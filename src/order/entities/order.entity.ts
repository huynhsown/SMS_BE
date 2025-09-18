import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export class ShippingAddress {
  fullName: string;
  phone: string;
  street: string;
}

export class OrderItem {
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  discountPrice: number;
  discountPercent: number;
  quantity: number;
  totalPrice: number;
  totalDiscountPrice: number;
}

@Entity('sms_order')
export class Order {
  @ObjectIdColumn()
  _id: ObjectId;

  @Column()
  userId: string;

  @Column()
  items: OrderItem[];

  @Column({ default: 0 })
  subtotal: number;

  @Column({ default: 0 })
  shippingFee: number;

  @Column({ default: 0 })
  total: number;

  @Column()
  paymentMethod: 'COD';

  @Column({ default: 'pending' })
  status: 'pending' | 'confirmed' | 'cancelled';

  @Column()
  shippingAddress: ShippingAddress;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
