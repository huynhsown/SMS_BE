export interface CategorySummary {
	_id: string;
	name: string;
	slug: string;
}

export interface ProductSummaryDto {
	_id: string;
	name: string;
	slug: string;
	images: string[];
	price: number;
	discountPrice: number;
	discountPercent: number;
	stock: number;
	viewCount: number;
	soldCount: number;
	category?: CategorySummary;
	inStock: boolean;
	createdAt: Date;
}

export interface HomeProductsDto {
	newest: ProductSummaryDto[];
	bestsellers: ProductSummaryDto[];
	mostViewed: ProductSummaryDto[];
	topDiscounts: ProductSummaryDto[];
}

export interface PaginatedProductsDto {
	products: ProductSummaryDto[];
	total: number;
	page: number;
	limit: number;
	totalPages: number;
	nextCursor?: string; // Cho Lazy Loading
	hasMore: boolean; // Có còn sản phẩm không
}