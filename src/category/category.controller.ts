import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	async findAll() {
		return this.categoryService.findAll();
	}

	@Get(':slug')
	async getBySlug(@Param('slug') slug: string) {
		return this.categoryService.findBySlug(slug);
	}

	@Post()
	async create(@Body() dto: CreateCategoryDto) {
		return this.categoryService.create(dto);
	}
}


