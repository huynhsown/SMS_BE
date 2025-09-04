import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Category } from 'src/category/entities/category.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Product, Category])],
	controllers: [ProductController],
	providers: [ProductService],
})
export class ProductModule {}


