import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class AddToCartDto {
	@IsString()
	productId: string;

	@IsNumber()
	@Min(1)
	quantity: number;

	@IsOptional()
	@IsString()
	userId?: string; // Optional, có thể dùng session ID cho guest
}

export class UpdateCartItemDto {
	@IsString()
	productId: string;

	@IsNumber()
	@Min(0)
	quantity: number; // Nếu = 0 thì xóa item khỏi cart
}

export class RemoveFromCartDto {
	@IsString()
	productId: string;
}

// Response DTOs
export class CartItemResponseDto {
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
	inStock: boolean;
	availableStock: number;
}

export class CartResponseDto {
	_id: string;
	userId: string;
	items: CartItemResponseDto[];
	totalAmount: number;
	totalDiscountAmount: number;
	finalAmount: number;
	totalItems: number;
	createdAt: Date;
	updatedAt: Date;
}