import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UserRole } from '@prisma/client';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly prismaService: PrismaService) {}

  async getAllProducts() {
    try {
      const products = await this.prismaService.product.findMany({
        include: {
          category: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          colors: true,
          sizes: true,
          additionalImages: true,
        },
      });

      // Ajout du calcul du prix final avec le rabais pour chaque produit
      const productsWithFinalPrice = products.map((product) => {
        // Vérifier si le discount est défini et non nul
        const finalPrice =
          product.discount != null
            ? product.price - (product.price * product.discount) / 100
            : product.price;

        return {
          ...product,
          finalPrice, // Ajout du champ finalPrice dans la réponse
        };
      });

      return productsWithFinalPrice;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching products',
      );
    }
  }

  async getProductById(productId: number) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: {
          id: productId,
        },
        include: {
          category: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          colors: true,
          sizes: true,
          additionalImages: true,
        },
      });

      if (!product) {
        throw new NotFoundException(`Product with ID ${productId} not found`);
      }

      // Vérifier si le discount est défini et non nul
      const finalPrice =
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price;

      // Retourner le produit avec le champ finalPrice ajouté
      return {
        ...product,
        finalPrice, // Ajout du champ finalPrice dans la réponse
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching the product',
      );
    }
  }

  async getProductsByAdmin(userId: number) {
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to view these products.',
      );
    }

    const products = await this.prismaService.product.findMany({
      where: { createdBy: userId },
      include: {
        category: true, // Inclure les informations de catégorie si nécessaire
      },
    });

    // Ajout du calcul du prix final avec le rabais pour chaque produit
    const productsWithFinalPrice = products.map((product) => {
      // Vérifier si le discount est défini et non nul
      const finalPrice =
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price;

      return {
        ...product,
        finalPrice, // Ajout du champ finalPrice dans la réponse
      };
    });
    return productsWithFinalPrice;
  }

  async createProduct(createProductDto: CreateProductDto, userId: number) {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      colors,
      sizes,
      imageUrl,
      imageUrls,
      offer, // Nouveau champ
      discount, // Nouveau champ
    } = createProductDto;

    try {
      // Vérifier si la catégorie existe
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      const product = await this.prismaService.product.create({
        data: {
          name,
          description,
          price,
          stock,
          category: {
            connect: { id: categoryId },
          },
          admin: {
            connect: { id: userId },
          },
          colors: {
            create: colors?.map((colorName) => ({ name: colorName })),
          },
          sizes: {
            create: sizes?.map((sizeValue) => ({ name: sizeValue })),
          },
          imageUrl, // Image principale
          additionalImages: {
            create: imageUrls?.map((url) => ({ imageUrls: url })),
          },
          offer, // Ajouter le champ `offer`
          discount, // Ajouter le champ `discount`
        },
        include: {
          colors: true,
          sizes: true,
          additionalImages: true,
        },
      });

      return product;
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while creating the product',
      );
    }
  }

  async updateProduct(
    productId: number,
    updateProductDto: UpdateProductDto,
    userId: number,
  ) {
    const {
      name,
      description,
      price,
      stock,
      categoryId,
      colors,
      sizes,
      imageUrls,
      offer, // Nouveau champ
      discount, // Nouveau champ
    } = updateProductDto;

    try {
      const user = await this.prismaService.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        throw new ForbiddenException('User not found.');
      }

      if (user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          'You do not have permission to update this product.',
        );
      }

      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.createdBy !== userId) {
        throw new ForbiddenException(
          'You do not have permission to update this product.',
        );
      }

      // Vérifier si la catégorie existe
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
      });

      if (!category) {
        throw new NotFoundException(`Category with ID ${categoryId} not found`);
      }

      // Mettre à jour les données principales du produit
      const updatedProduct = await this.prismaService.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          price,
          stock,
          category: {
            connect: { id: categoryId },
          },
          colors: {
            deleteMany: {}, // Supprimer les couleurs existantes
            create: colors?.map((colorName) => ({ name: colorName })), // Ajouter de nouvelles couleurs
          },
          sizes: {
            deleteMany: {}, // Supprimer les tailles existantes
            create: sizes?.map((sizeValue) => ({ name: sizeValue })), // Ajouter de nouvelles tailles
          },
          offer, // Mettre à jour le champ `offer`
          discount, // Mettre à jour le champ `discount`
        },
        include: {
          colors: true,
          sizes: true,
          additionalImages: true, // Inclure les images associées
        },
      });

      // Mettre à jour les images du produit
      if (imageUrls && imageUrls.length > 0) {
        // Supprimer les images existantes
        await this.prismaService.productImage.deleteMany({
          where: { productId: productId },
        });

        // Créer de nouvelles images
        await this.prismaService.productImage.createMany({
          data: imageUrls.map((url) => ({
            imageUrls: url,
            productId: updatedProduct.id,
          })),
        });
      }

      return updatedProduct;
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

  async deleteProduct(productId: number, userId: number) {
    try {
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      if (product.createdBy !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this product.',
        );
      }

      await this.prismaService.product.delete({
        where: { id: productId },
      });

      return { message: 'Product successfully deleted.' };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'An unexpected error occurred while deleting the product.',
      );
    }
  }

  async searchProductsByName(name: string) {
    const lowerCaseName = name.toLowerCase();

    const products = await this.prismaService.product.findMany({
      where: {
        name: {
          contains: lowerCaseName,
        },
      },
      include: {
        colors: true,
        sizes: true,
        additionalImages: true,
      },
    });

    if (products.length === 0) {
      throw new NotFoundException('No products found with the given name');
    }

    // Ajout du calcul du prix final avec le rabais pour chaque produit
    const productsWithFinalPrice = products.map((product) => {
      // Vérifier si le discount est défini et non nul
      const finalPrice =
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price;

      return {
        ...product,
        finalPrice, // Ajout du champ finalPrice dans la réponse
      };
    });

    return productsWithFinalPrice;
  }

  async searchProductsByNameByAdmin(name: string, userId: number) {
    const lowerCaseName = name.toLowerCase();

    const products = await this.prismaService.product.findMany({
      where: {
        name: {
          contains: lowerCaseName,
        },
        createdBy: userId,
      },
      include: {
        colors: true,
        sizes: true,
      },
    });

    if (products.length === 0) {
      throw new NotFoundException('No products found with the given name');
    }
    // Ajout du calcul du prix final avec le rabais pour chaque produit
    const productsWithFinalPrice = products.map((product) => {
      // Vérifier si le discount est défini et non nul
      const finalPrice =
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price;

      return {
        ...product,
        finalPrice, // Ajout du champ finalPrice dans la réponse
      };
    });

    return productsWithFinalPrice;
  }

  async getProductsByCategory(categoryId: number) {
    try {
      const category = await this.prismaService.category.findUnique({
        where: { id: categoryId },
      });

      // if (!category) {
      //   throw new NotFoundException(`Category with ID ${categoryId} not found`);
      // }
 
      const products = await this.prismaService.product.findMany({
        where: { categoryId: categoryId },
        include: {
          category: true,
          colors: true,
          sizes: true,
          additionalImages: true,
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      if (products.length === 0) {
        throw new NotFoundException(
          `No products found for category with ID ${categoryId}`,
        );
      }
      // Ajout du calcul du prix final avec le rabais pour chaque produit
      const productsWithFinalPrice = products.map((product) => {
        // Vérifier si le discount est défini et non nul
        const finalPrice =
          product.discount != null
            ? product.price - (product.price * product.discount) / 100
            : product.price;

        return {
          ...product,
          finalPrice, // Ajout du champ finalPrice dans la réponse
        };
      });

      return productsWithFinalPrice;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching products by category',
      );
    }
  }
}
