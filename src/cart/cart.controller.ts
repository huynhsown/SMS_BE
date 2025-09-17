import { 
	Controller, 
	Get, 
	Delete, 
	Param, 
	Headers 
  } from '@nestjs/common';
  import { CartService } from './cart.service';
  import { CartResponseDto } from './dto/cart.dto';
  
@Controller('cart')
  	export class CartController {
		constructor(private readonly cartService: CartService) {}
  
	@Get()
	async getCart(
	  @Headers('authorization') authHeader: string
	): Promise<CartResponseDto> {
	  return this.cartService.getCart(authHeader);
	}
  
	@Delete('remove/:productId')
	async removeFromCart(
	  @Param('productId') productId: string,
	  @Headers('authorization') authHeader: string,
	): Promise<CartResponseDto> {
	  return this.cartService.removeFromCart(productId, authHeader);
	}
  
	@Delete('clear')
	async clearCart(
	  @Headers('authorization') authHeader: string,
	): Promise<void> {
	  return this.cartService.clearCart(authHeader);
	}
}
  