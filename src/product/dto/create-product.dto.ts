import { IsArray, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductDto {
	@IsString()
	@IsNotEmpty()
	name: string;

	@IsString()
	@IsNotEmpty()
	slug: string;

	@IsArray()
	@IsString({ each: true })
	images: string[];

	@IsNumber()
	@Min(0)
	stock: number;

	@IsNumber()
	@Min(0)
	price: number;

	@IsString()
	@IsOptional()
	description?: string;

	@IsString()
	@IsNotEmpty()
	categoryId: string;
}


