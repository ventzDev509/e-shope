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
      throw new NotFoundException('Panier non trouvé');
    }

    return cart;
  }

  async addItemToCart(userId: number, createCartItemDto: CreateCartItemDto) {
    const { productId, quantity, colors, sizes } = createCartItemDto;
  
    try {
      // Vérifier si le produit existe
      const product = await this.prisma.product.findUnique({
        where: { id: productId },
      });
  
      if (!product) {
        throw new Error('Produit non trouvé.');
      }
  
      // Trouver ou créer le panier
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

      // Créer un nouvel article dans le panier
      const cartItem = await this.prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          colors,
          sizes,
        },
      });

      // Retourner un message de succès
      return {
        success: true,
        message: 'Article ajouté au panier avec succès.',
        cartItem,
      };
  
    } catch (error) {
      console.error('Erreur lors de l\'ajout de l\'article au panier :', error);
  
      return {
        success: false,
        message: error.message || 'Impossible d\'ajouter l\'article au panier. Veuillez réessayer plus tard.',
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
      throw new NotFoundException('Article du panier non trouvé');
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
      throw new NotFoundException('Article du panier non trouvé');
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

    return { message: 'Panier vidé avec succès' };
  }
}
