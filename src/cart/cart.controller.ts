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

@Controller('cart') // tu peux aussi changer le nom du contrôleur ici si tu veux un chemin en français
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
          message: 'Panier introuvable',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Panier récupéré avec succès',
        data: cart,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors de la récupération du panier',
      });
    }
  }

  @Post('create')
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
          "Une erreur inattendue s'est produite lors de l'ajout de l'article au panier.",
      });
    }
  }

  @Patch(':cartItemId')
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
        message: 'Article du panier mis à jour avec succès',
        data: updatedItem,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Échec de la mise à jour de l'article du panier",
      });
    }
  }

  @Delete(':cartItemId')
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
        message: "Article supprimé du panier avec succès",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Échec de la suppression de l'article du panier",
      });
    }
  }

  @Delete('/vider')
  @UseGuards(JwtAuthGuard)
  async clearCart(@Req() req, @Res() res) {
    const userId = req.user.id;
    try {
      await this.cartService.clearCart(userId);
      return res.status(200).json({
        success: true,
        message: 'Panier vidé avec succès',
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Une erreur est survenue lors du vidage du panier',
      });
    }
  }
}
