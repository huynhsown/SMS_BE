import { IsArray, IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsPhoneNumber, IsPositive, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class CheckoutItemDto {
  @IsString()
  productId: string;

  @IsNumber()
  @Min(1)
  quantity: number;
}

export class ShippingAddressDto {
  @IsString() @IsNotEmpty() fullName: string;
  @IsString() @IsNotEmpty() phone: string; // For simplicity, not strict phone validator
  @IsString() @IsNotEmpty() street: string;
}

export class CheckoutDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CheckoutItemDto)
  items: CheckoutItemDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress: ShippingAddressDto;

  @IsIn(['COD'])
  paymentMethod: 'COD';
}

export class OrderResponseDto {
  _id: string;
  userId: string;
  items: any[];
  subtotal: number;
  shippingFee: number;
  total: number;
  paymentMethod: 'COD';
  status: string;
  shippingAddress: ShippingAddressDto;
  createdAt: Date;
}
