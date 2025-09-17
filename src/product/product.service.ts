import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';
import { ObjectId } from 'mongodb';
import { CreateProductDto } from './dto/create-product.dto';
import { PaginationDto } from './dto/pagination.dto';
import { HomeProductsDto, ProductSummaryDto, PaginatedProductsDto } from './dto/product-response.dto';

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
			_id: product._id.toString(),
			name: product.name,
			slug: product.slug,
			images: product.images,
			price: product.price,
			discountPrice: product.discountPrice,
			discountPercent: product.discountPercent,
			stock: product.stock,
			viewCount: product.viewCount,
			soldCount: product.soldCount,
			description: product.description,
			category: category ? { _id: category._id.toString(), name: category.name, slug: category.slug } : undefined,
			inStock: product.stock > 0,
			createdAt: product.createdAt,
			updatedAt: product.updatedAt,
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
			discountPrice: dto.discountPrice ?? 0,
			discountPercent: dto.discountPercent ?? 0,
			description: dto.description ?? '',
			categoryId: dto.categoryId,
		});
		await this.productRepository.save(product);
		return product;
	}

	async getHomeProducts(): Promise<HomeProductsDto> {
		// 8 sản phẩm mới nhất
		const newest = await this.productRepository.find({
			order: { createdAt: 'DESC' },
			take: 8,
		});

		// 6 sản phẩm bán chạy nhất
		const bestsellers = await this.productRepository.find({
			order: { soldCount: 'DESC' },
			take: 6,
		});

		// 8 sản phẩm được xem nhiều nhất
		const mostViewed = await this.productRepository.find({
			order: { viewCount: 'DESC' },
			take: 8,
		});

		// 4 sản phẩm khuyến mãi cao nhất
		const topDiscounts = await this.productRepository.find({
			where: { discountPercent: { $gt: 0 } as any },
			order: { discountPercent: 'DESC' },
			take: 4,
		});

		return {
			newest: await this.enrichProductsWithCategory(newest),
			bestsellers: await this.enrichProductsWithCategory(bestsellers),
			mostViewed: await this.enrichProductsWithCategory(mostViewed),
			topDiscounts: await this.enrichProductsWithCategory(topDiscounts),
		};
	}

	async getPaginatedProducts(pagination: PaginationDto): Promise<PaginatedProductsDto> {
		const { page = 1, limit = 10, categoryId, search, cursor } = pagination;
		const pageNum = Number(page);
		const limitNum = Number(limit);
		const skip = (pageNum - 1) * limitNum;

		const query: any = {};

		if (categoryId) {
			query.categoryId = categoryId;
		}

		if (search) {
			query.$or = [
				{ name: { $regex: search, $options: 'i' } },
				{ description: { $regex: search, $options: 'i' } }
			];
		}

		// Cursor-based pagination cho Lazy Loading
		if (cursor) {
			query.createdAt = { $lt: new Date(cursor) };
		}

		const [products, total] = await this.productRepository.findAndCount({
			where: query,
			order: { createdAt: 'DESC' },
			skip,
			take: limitNum,
		});

		const totalPages = Math.ceil(total / limitNum);
		const nextCursor = products.length > 0 ? products[products.length - 1].createdAt.toISOString() : undefined;

		return {
			products: await this.enrichProductsWithCategory(products),
			total,
			page: pageNum,
			limit: limitNum,
			totalPages,
			nextCursor,
			hasMore: products.length === limitNum,
		};
	}

	async getProductsByCategorySlug(categorySlug: string, pagination: PaginationDto): Promise<PaginatedProductsDto> {
		// Tìm category theo slug
		const category = await this.categoryRepository.findOne({ where: { slug: categorySlug } });
		if (!category) throw new HttpException('Category not found', 404);

		// Lấy sản phẩm theo categoryId
		return this.getPaginatedProducts({
			...pagination,
			categoryId: category._id.toString(),
		});
	}

	async incrementViewCount(slug: string) {
		const product = await this.productRepository.findOne({ where: { slug } });
		if (product) {
			product.viewCount += 1;
			await this.productRepository.save(product);
		}
	}

	private async enrichProductsWithCategory(products: Product[]): Promise<ProductSummaryDto[]> {
		const result: ProductSummaryDto[] = [];

		for (const product of products) {
			let category: Category | null = null;
			if (product.categoryId) {
				try {
					category = await this.categoryRepository.findOne({ 
						where: { _id: new ObjectId(product.categoryId) } as any 
					});
				} catch (_) {
					category = null;
				}
			}

			result.push({
				_id: product._id.toString(),
				name: product.name,
				slug: product.slug,
				images: product.images,
				price: product.price,
				discountPrice: product.discountPrice,
				discountPercent: product.discountPercent,
				stock: product.stock,
				viewCount: product.viewCount,
				soldCount: product.soldCount,
				category: category ? { 
					_id: category._id.toString(), 
					name: category.name, 
					slug: category.slug 
				} : undefined,
				inStock: product.stock > 0,
				createdAt: product.createdAt,
			});
		}

		return result;
	}
}


