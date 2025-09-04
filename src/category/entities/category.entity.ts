import { Entity, ObjectIdColumn, ObjectId, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('sms_category')
export class Category {
	@ObjectIdColumn()
	_id: ObjectId;

	@Column()
	name: string;

	@Index({ unique: true })
	@Column()
	slug: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}


