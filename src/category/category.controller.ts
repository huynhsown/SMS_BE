import { Body, Controller, Post, Get } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Controller('categories')
export class CategoryController {
	constructor(private readonly categoryService: CategoryService) {}

	@Get()
	async findAll() {
		return this.categoryService.findAll();
	}

	@Post()
	async create(@Body() dto: CreateCategoryDto) {
		return this.categoryService.create(dto);
	}
}


