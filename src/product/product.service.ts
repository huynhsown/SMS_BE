import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ObjectId } from 'mongodb';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductService {
	@InjectRepository(Product)
	private productRepository: Repository<Product>;

	@InjectRepository(Category)
	private categoryRepository: Repository<Category>;

	async getBySlug(slug: string) {
		const product = await this.productRepository.findOne({ where: { slug } });
		if (!product) throw new HttpException('Product not found', 404);
		let category: Category | null = null;
		if (product.categoryId) {
			try {
				category = await this.categoryRepository.findOne({ where: { _id: new ObjectId(product.categoryId) } as any });
			} catch (_) {
				category = null;
			}
		}
		return {
			...product,
			category: category ? { _id: category._id, name: category.name, slug: category.slug } : null,
			inStock: product.stock > 0,
		};
	}

	async create(dto: CreateProductDto) {
		const exist = await this.productRepository.findOne({ where: { slug: dto.slug } });
		if (exist) throw new HttpException('Product slug already exists', 400);
		// validate category exists
		try {
			const category = await this.categoryRepository.findOne({ where: { _id: new ObjectId(dto.categoryId) } as any });
			if (!category) throw new Error('notfound');
		} catch (_) {
			throw new HttpException('Invalid categoryId', 400);
		}
		const product = this.productRepository.create({
			name: dto.name,
			slug: dto.slug,
			images: dto.images ?? [],
			stock: dto.stock ?? 0,
			price: dto.price ?? 0,
			description: dto.description ?? '',
			categoryId: dto.categoryId,
		});
		await this.productRepository.save(product);
		return product;
	}
}


