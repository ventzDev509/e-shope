import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

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

      // Calcul du total de la commande en fonction des items
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

        total += item.price * item.quantity;
      }

      // Crée la commande
      const order = await this.prismaService.order.create({
        data: {
          total,
          status: status || 'PENDING',
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
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Gestion des erreurs internes
      console.log(error)
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the order',
      );
    }
  }

  // Method to retrieve all orders
  async getAllOrders() {
    try {
      const orders = await this.prismaService.order.findMany({
        include: {
          items: true, // Include order items
          payments: true, // Include payments
          user: true, // Include user information
        },
      });

      // Remove the `password` and the `role` field from each user's data in the orders
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
  async getOrderById(orderId: number) {
    // Vérifie si la commande existe
    const order = await this.prismaService.order.findUnique({
      where: { id: orderId },
      include: { items: true, payments: true }, // Inclure les items et paiements si nécessaire
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }
}
