import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Req() req, @Res() res) {
    const userId = req.user.id;

    try {
      const cart = await this.cartService.getCartByUser(userId);

      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while retrieving the cart',
      });
    }
  }

  @Post('add')
  @UseGuards(JwtAuthGuard)
  async addItemToCart(
    @Body() createCartItemDto: CreateCartItemDto,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;

    try {
      const result = await this.cartService.addItemToCart(
        userId,
        createCartItemDto,
      );

      if (result.success) {
        return res.status(200).json({
          message: result.message,
          data: result.cartItem,
        });
      } else {
        return res.status(400).json({
          message: result.message,
        });
      }
    } catch (error) {
      return res.status(500).json({
        message:
          'An unexpected error occurred while adding the item to the cart.',
      });
    }
  }

  @Patch('update/:cartItemId')
  @UseGuards(JwtAuthGuard)
  async updateCartItem(
    @Param('cartItemId') cartItemId: string,
    @Body() updateCartItemDto: UpdateCartItemDto,
    @Req() req,
    @Res() res,
  ) {
    const cartItemIdNumber = Number(cartItemId);
    const userId = req.user.id;

    try {
      const updatedItem = await this.cartService.updateCartItem(
        userId,
        cartItemIdNumber,
        updateCartItemDto,
      );

      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: updatedItem,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to update cart item',
      });
    }
  }

  @Delete('remove/:cartItemId')
  @UseGuards(JwtAuthGuard)
  async removeCartItem(
    @Param('cartItemId') cartItemId: string,
    @Req() req,
    @Res() res,
  ) {
    const cartItemIdNumber = Number(cartItemId);
    const userId = req.user.id;

    try {
      await this.cartService.removeCartItem(userId, cartItemIdNumber);

      return res.status(200).json({
        success: true,
        message: 'Cart item removed successfully',
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || 'Failed to remove cart item',
      });
    }
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Req() req, @Res() res) {
    const userId = req.user.id;
  
    try {
      await this.cartService.clearCart(userId);
  
      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'An error occurred while clearing the cart',
      });
    }
  }
  
}
