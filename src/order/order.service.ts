import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { addDays } from 'date-fns'; // Pour calculer la date de livraison estimée

@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) {}

  async createOrder(createOrderDto: CreateOrderDto) {
    const { userId, status, items, payments } = createOrderDto;

    try {
      // Vérifie si l'utilisateur existe
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { id: true }, // Ne sélectionne que l'id, sans le mot de passe
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Calcul du total de la commande et mise à jour du stock des produits
      let total = 0;

      for (const item of items) {
        const product = await this.prismaService.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(
            `Product with ID ${item.productId} not found`,
          );
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Not enough stock for product ${product.name}. Available stock: ${product.stock}`,
          );
        }

        // Mettre à jour le stock du produit
        await this.prismaService.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        total += item.price * item.quantity;
      }

      // Calculer la date de livraison estimée (une semaine à partir de maintenant)
      const estimatedDelivery = addDays(new Date(), 7);

      // Crée la commande
      const order = await this.prismaService.order.create({
        data: {
          total,
          status: status || 'PENDING',
          estimatedDelivery, // Ajout du temps de livraison estimé
          user: {
            connect: { id: userId },
          },
          items: {
            create: items.map((item) => ({
              product: {
                connect: { id: item.productId },
              },
              quantity: item.quantity,
              price: item.price,
            })),
          },
          payments: {
            create: payments,
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      return order;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }

      // Gestion des erreurs internes
      console.log(error);
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the order',
      );
    }
  }

  // Méthode pour récupérer toutes les commandes
  async getAllOrders() {
    try {
      const orders = await this.prismaService.order.findMany({
        include: {
          items: true, // Inclure les items de la commande
          payments: true, // Inclure les paiements
          user: true, // Inclure les informations de l'utilisateur
        },
      });

      // Supprimer les champs `password` et `role` des données de l'utilisateur dans les commandes
      orders.forEach((order) => {
        if (order.user) {
          delete order.user.password;
          delete order.user.role;
        }
      });

      return orders;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the orders',
      );
    }
  }

  // Méthode pour récupérer une commande par son ID
  async getOrderById(orderId: number) {
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true }, // Inclure les items et paiements si nécessaire
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  // Méthode pour récupérer les commandes d'un utilisateur
  async getOrderByUserId(userId: number) {
    const orders = await this.prismaService.order.findMany({
      where: { userId: userId },
      include: { items: true, payments: true }, // Inclure les items et paiements si nécessaire
    });

    if (orders.length === 0) {
      throw new NotFoundException(`No orders found for user with ID ${userId}`);
    }

    return orders;
  }
}
