import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('sms_cart')
export class Cart {
	@ObjectIdColumn()
	_id: ObjectId;

	@Column()
	userId: string; 

	@Column()
	items: CartItem[];

	@Column({ default: 0 })
	totalAmount: number; 

	@Column({ default: 0 })
	totalDiscountAmount: number;

	@Column({ default: 0 })
	finalAmount: number; 

	@Column({ default: 0 })
	totalItems: number; 

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}

export class CartItem {
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