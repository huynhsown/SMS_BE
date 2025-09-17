import { IsOptional, IsString, IsNumber, Min, Max } from 'class-validator';
import { Transform } from 'class-transformer';

export class PaginationDto {
	@IsOptional()
	@Transform(({ value }) => value ? parseInt(value) : 1)
	@IsNumber()
	@Min(1)
	page?: number = 1;

	@IsOptional()
	@Transform(({ value }) => value ? parseInt(value) : 10)
	@IsNumber()
	@Min(1)
	@Max(100)
	limit?: number = 10;

	@IsOptional()
	@IsString()
	categoryId?: string;

	@IsOptional()
	@IsString()
	search?: string;

	@IsOptional()
	@IsString()
	cursor?: string; // Cho Lazy Loading
}