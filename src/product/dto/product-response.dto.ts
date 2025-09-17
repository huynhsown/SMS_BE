export class ProductSummaryDto {
  _id: string;
  name: string;
  slug: string;
  images: string[];
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  stock: number;
  viewCount: number;
  soldCount: number;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  inStock: boolean;
  createdAt: Date;
}

export class HomeProductsDto {
  newest: ProductSummaryDto[];
  bestsellers: ProductSummaryDto[];
  mostViewed: ProductSummaryDto[];
  topDiscounts: ProductSummaryDto[];
}

export class PaginatedProductsDto {
  products: ProductSummaryDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
