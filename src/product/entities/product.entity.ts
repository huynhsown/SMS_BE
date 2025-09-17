import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sms_product')
export class Product {
	@ObjectIdColumn()
	_id: ObjectId;

	@Column()
	name: string;

	@Index({ unique: true })
	@Column()
	slug: string;

	@Column()
	images: string[];

	@Column({ default: 0 })
	stock: number;

	@Column({ default: 0 })
	price: number;

	@Column({ default: 0 })
	discountPrice: number; // Giá sau khi giảm

	@Column({ default: 0 })
	discountPercent: number; // Phần trăm giảm giá

	@Column({ default: 0 })
	viewCount: number; // Số lượt xem

	@Column({ default: 0 })
	soldCount: number; // Số lượng đã bán

	@Column()
	description: string;

	// reference to category by id
	@Column()
	categoryId: string; // store as string of ObjectId hex

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}


