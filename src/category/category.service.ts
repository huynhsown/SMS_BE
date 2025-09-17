import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoryService {
	@InjectRepository(Category)
	private categoryRepository: Repository<Category>;

	async findAll() {
		return this.categoryRepository.find();
	}

	async findBySlug(slug: string) {
		const category = await this.categoryRepository.findOne({ where: { slug } });
		if (!category) throw new HttpException('Category not found', 404);
		return category;
	}

	async create(dto: CreateCategoryDto) {
		const exists = await this.categoryRepository.findOne({ where: { slug: dto.slug } });
		if (exists) throw new HttpException('Category slug already exists', 400);
		const category = this.categoryRepository.create({ name: dto.name, slug: dto.slug });
		await this.categoryRepository.save(category);
		return category;
	}
}


