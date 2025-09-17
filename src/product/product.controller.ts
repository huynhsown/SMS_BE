import { Body, Controller, Get, Param, Post, Query, Patch } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from './dto/pagination.dto';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	// Lấy sản phẩm cho trang chủ
	@Get('home')
	async getHomeProducts() {
		return this.productService.getHomeProducts();
	}

	// Lấy danh sách sản phẩm với phân trang
	@Get()
	async getPaginatedProducts(@Query() pagination: PaginationDto) {
		return this.productService.getPaginatedProducts(pagination);
	}

	// Lấy sản phẩm theo danh mục (Lazy Loading)
	@Get('category/:categorySlug')
	async getProductsByCategory(@Param('categorySlug') categorySlug: string, @Query() pagination: PaginationDto) {
		return this.productService.getProductsByCategorySlug(categorySlug, pagination);
	}

	// Lấy chi tiết sản phẩm và tăng lượt xem
	@Get(':slug')
	async getDetail(@Param('slug') slug: string) {
		// Tăng lượt xem
		await this.productService.incrementViewCount(slug);
		return this.productService.getBySlug(slug);
	}

	// Tạo sản phẩm mới
	@Post()
	async create(@Body() dto: CreateProductDto) {
		return this.productService.create(dto);
	}
}


