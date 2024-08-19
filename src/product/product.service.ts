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
          category: true, // Inclure les informations de catégorie si nécessaire
          admin: {
            select: {
              id: true,
              name: true,
              email: true,
              // Ne pas inclure le champ password
            },
          },
        },
      });

      return products;
    } catch (error) {
      throw new InternalServerErrorException(
        'An unexpected error occurred while fetching products',
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
        // Ne pas inclure le champ password
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

    return products;
  }

  async createProduct(createProductDto: CreateProductDto, userId: number) {
    const { name, description, price, stock, categoryId, colors, sizes,imageUrl } = createProductDto;
  
    try {
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
          imageUrl: imageUrl, // Utilisation du chemin de l'image uploadée
        },
        include: {
          colors: true,
          sizes: true,
        },
      });
  
      return product;
    } catch (error) {
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
    const { name, description, price, stock, categoryId, colors, sizes } =
      updateProductDto;

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

      // const existingProduct = await this.prismaService.product.findFirst({
      //   where: { name },
      // });

      // if (existingProduct && existingProduct.id !== productId) {
      //   throw new ConflictException('A product with this name already exists.');
      // }

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
            create: colors?.map((colorName) => ({ name: colorName })), // Utilisation du champ `name` pour créer les couleurs
          },
          sizes: {
            create: sizes?.map((sizeValue) => ({ name: sizeValue })), // Même logique pour les tailles
          },
        },
        include: {
          colors: true,
          sizes: true,
        },
      });

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
      },
    });

    if (products.length === 0) {
      throw new NotFoundException('No products found with the given name');
    }

    return products;
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

    return products;
  }
}
