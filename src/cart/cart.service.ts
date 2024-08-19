import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getCartByUser(userId: number) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new NotFoundException('Cart not found');
    }

    return cart;
  }

  async addItemToCart(userId: number, createCartItemDto: CreateCartItemDto) {
    const { productId, quantity } = createCartItemDto;
  
    try {
      // Check if the product exists
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
  
      if (!product) {
        throw new Error('Product not found.');
      }
  
      // Find or create the cart
      let cart = await this.prisma.cart.findUnique({
        where: { userId },
      });
  
      if (!cart) {
        cart = await this.prisma.cart.create({
          data: {
            userId,
          },
        });
      }
  
      // Check if the item already exists in the cart
      const existingCartItem = await this.prisma.cartItem.findFirst({
        where: {
          cartId: cart.id,
          productId,
        },
      });
  
      let cartItem;
      if (existingCartItem) {
        // Update existing item quantity
        cartItem = await this.prisma.cartItem.update({
          where: { id: existingCartItem.id },
          data: { quantity: existingCartItem.quantity + quantity },
        });
      } else {
        // Create new cart item
        cartItem = await this.prisma.cartItem.create({
          data: {
            cartId: cart.id,
            productId,
            quantity,
          },
        });
      }
  
      // Return success message
      return {
        success: true,
        message: existingCartItem ? 'Cart item updated successfully.' : 'Item added to cart successfully.',
        cartItem,
      };
  
    } catch (error) {
      // Log the error for debugging purposes
      console.error('Error adding item to cart:', error);
  
      // Return error message
      return {
        success: false,
        message: error.message || 'Unable to add item to cart. Please try again later.',
      };
    }
  }  
  
  async updateCartItem(
    userId: number,
    cartItemId: number,
    updateCartItemDto: UpdateCartItemDto,
  ) {
    const cart = await this.getCartByUser(userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: updateCartItemDto,
    });
  }

  async removeCartItem(userId: number, cartItemId: number) {
    const cart = await this.getCartByUser(userId);

    const cartItem = await this.prisma.cartItem.findUnique({
      where: { id: cartItemId },
    });

    if (!cartItem || cartItem.cartId !== cart.id) {
      throw new NotFoundException('Cart item not found');
    }

    return this.prisma.cartItem.delete({
      where: { id: cartItemId },
    });
  }

  async clearCart(userId: number) {
    const cart = await this.getCartByUser(userId);

    await this.prisma.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return { message: 'Cart cleared successfully' };
  }
}
