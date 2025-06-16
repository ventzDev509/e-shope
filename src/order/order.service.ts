import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { addDays } from 'date-fns'; // Pour calculer la date de livraison estimée
import { UserRole } from '@prisma/client';
 
@Injectable()
export class OrderService {
  constructor(private readonly prismaService: PrismaService) { }

  async createOrder(createOrderDto: CreateOrderDto, userId: number) {
    const { status, items, payments, addressId, newAddress } = createOrderDto;

    try {
      // Vérifie si l'utilisateur existe
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
        select: { id: true },
      });

      if (!user) {
        throw new NotFoundException('Utilisateur non trouvé');
      }

      // Si une nouvelle adresse est fournie, la créer et l’utiliser
      let addressToUseId = addressId;

      if (!addressId && newAddress) {
        const createdAddress = await this.prismaService.address.create({
          data: {
            ...newAddress,
            user: { connect: { id: userId } },
          },
        });

        addressToUseId = createdAddress.id;
      }

      // Vérifie si l’adresse existe et appartient à l’utilisateur
      const address = await this.prismaService.address.findUnique({
        where: { id: addressToUseId },
        select: { id: true, userId: true },
      });

      if (!address || address.userId !== userId) {
        throw new NotFoundException("Adresse non trouvée ou n'appartient pas à l'utilisateur");
      }

      // Calcul du total de la commande et mise à jour du stock des produits
      let total = 0;

      for (const item of items) {
        const product = await this.prismaService.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new NotFoundException(`Produit avec l'ID ${item.productId} non trouvé`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Stock insuffisant pour le produit ${product.name}. Stock disponible : ${product.stock}`,
          );
        }

        // Mise à jour du stock
        await this.prismaService.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        total += item.price * item.quantity;
      }

      const estimatedDelivery = addDays(new Date(), 7);

      const order = await this.prismaService.order.create({
        data: {
          total,
          status: status || 'PENDING',
          estimatedDelivery,
          user: { connect: { id: userId } },
          address: { connect: { id: addressToUseId } },
          items: {
            create: items.map((item) => ({
              product: { connect: { id: item.productId } },
              quantity: item.quantity,
              price: item.price,
              colors: item.colors ? item.colors.join(',') : '',
              sizes: item.sizes ? item.sizes.join(',') : '',
            })),
          },
          payments: {
            create: payments,
          },
        },
        include: {
          items: { include: { product: true } },
          payments: true,
          address: true,
        },
      });
      console.log(order)
      return order;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Une erreur est survenue lors de la création de la commande',
      );
    }
  }

  // Méthode pour récupérer toutes les commandes
  async getAllOrders() {
    try {
      const orders = await this.prismaService.order.findMany({
        include: {
          items: {
            include: {
              product: {
                include: {
                  additionalImages: true, // Inclure les images du produit
                },
              },
            },
          },
          payments: true, // Inclure les paiements
          user: true, // Inclure les informations de l'utilisateur
          address: true, // Inclure les détails de l'adresse dans la réponse
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
      include: {
        items: {
          include: {
            product: {
              include: {
                additionalImages: false, // Inclure les images du produit
                sizes: true,
                colors: true,
              },
            },
          },
        },
        payments: true, // Inclure les paiements
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    return order;
  }

  // Méthode pour récupérer les commandes d'un utilisateur
  async getOrderByUserId(userId: number) {
    try {
      const orders = await this.prismaService.order.findMany({
        where: { userId: userId },
        include: {
          items: {
            include: {
              product: {
                include: {
                  sizes: true,
                  colors: true,
                  additionalImages: false, // Inclure les images du produit
                },
              },
            },
          },

          payments: true, // Inclure les paiements
          user: true, // Inclure l'utilisateur
        },
      });

      if (orders.length === 0) {
        throw new NotFoundException(
          `No orders found for user with ID ${userId}`,
        );
      }
      return orders;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the user orders',
      );
    }
  }
  // get order by status
  async getOrderByStatus(status: string, userId: number) {
    try {
      const orders = await this.prismaService.order.findMany({
        where: {
          status: {
            equals: status,
            // mode: 'insensitive', // Rend la recherche insensible à la casse
          },
          userId: userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  sizes: true,
                  colors: true,
                  additionalImages: false, // Inclure les images du produit
                },
              },
            },
          },

          payments: true, // Inclure les paiements
          user: true, // Inclure l'utilisateur
        },
      });

      if (orders.length === 0) {
        throw new NotFoundException(
          `No orders found for user with ID ${userId}`,
        );
      }
      return orders;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the user orders',
      );
    }
  }
  // get order by status unpaid
  async getOrderByPaymentStatus(status: string, userId: number) {
    try {
      const orders = await this.prismaService.order.findMany({
        where: {
          userId: userId,
        },
        include: {
          items: {
            include: {
              product: {
                include: {
                  sizes: true,
                  colors: true,
                  additionalImages: false, // Inclure les images du produit
                },
              },
            },
          },

          payments: true, // Inclure les paiements
          user: true, // Inclure l'utilisateur
        },
      });

      if (orders.length === 0) {
        throw new NotFoundException(
          `No orders found for user with ID ${userId}`,
        );
      }

      const orderUnpaid = orders.filter((order) =>
        order.payments.some((payment) => payment.status === status),
      );
      return orderUnpaid;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while retrieving the user orders',
      );
    }
  }

  async updateOrderStatus(id: number, status: string, userId: number) {
    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found.');
      }

      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You do not have permission to update this Order.',
        );
      }
      const order = await this.prismaService.order.findUnique({
        where: { id: id },
      });
      if (!order) {
        throw new NotFoundException('order not found');
      }

      const response = await this.prismaService.order.update({
        where: { id: id },
        data: {
          status: status,
        },
      });
      return response;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the product',
      );
    }
  }
}
