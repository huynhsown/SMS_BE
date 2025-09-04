import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';

@Controller('products')
export class ProductController {
	constructor(private readonly productService: ProductService) {}

	@Get(':slug')
	async getDetail(@Param('slug') slug: string) {
		return this.productService.getBySlug(slug);
	}

	@Post()
	async create(@Body() dto: CreateProductDto) {
		return this.productService.create(dto);
	}
}


