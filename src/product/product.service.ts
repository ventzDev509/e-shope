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
          category: true, // Include category information if needed
          admin: true, // Include admin information if needed
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
    // Check if the user exists and is an admin
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('You do not have permission to view these products.');
    }

    // Retrieve all products created by the admin
    const products = await this.prismaService.product.findMany({
      where: { createdBy: userId },
    });

    return products;
  }

  

  async createProduct(createProductDto: CreateProductDto, userId: number) {
    const { name, description, price, stock, categoryId } = createProductDto;

    try {
      const existingProduct = await this.prismaService.product.findFirst({
        where: { name },
      });
    
      if (existingProduct) {
        throw new ConflictException('A product with this name already exists.');
      }
    
      // Create the product
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
        },
      });
      if(product){
        return product;
      }
    
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof ConflictException) {
        // This is expected; no need to treat it as an internal server error
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
    const { name, description, price, stock, categoryId } = updateProductDto;

    try {
      // Vérifie si l'utilisateur est un administrateur
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

      // Vérifie si le produit existe
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Vérifie si l'utilisateur est l'administrateur qui a créé le produit
      if (product.createdBy !== userId) {
        throw new ForbiddenException(
          'You do not have permission to update this product.',
        );
      }

      // Vérifie si une autre produit avec le même nom existe déjà
      const existingProduct = await this.prismaService.product.findFirst({
        where: { name },
      });

      if (existingProduct && existingProduct.id !== productId) {
        throw new ConflictException('A product with this name already exists.');
      }

      // Mise à jour du produit
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
        },
      });

      return updatedProduct;
    } catch (error) {
      // Gérer les erreurs spécifiques
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }

      // Gestion des erreurs internes
      throw new InternalServerErrorException(
        'An unexpected error occurred while updating the product',
      );
    }
  }


  async deleteProduct(productId: number, userId: number) {
    try {
      // Fetch the product to check ownership
      const product = await this.prismaService.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found.');
      }

      // Check if the requesting user is the admin who created the product
      if (product.createdBy !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this product.',
        );
      }

      // Delete the product
      await this.prismaService.product.delete({
        where: { id: productId },
      });

      return { message: 'Product successfully deleted.' };
      
    } catch (error) {
      // Handle specific exceptions
      if (error instanceof NotFoundException || error instanceof ForbiddenException) {
        throw error;
      }

      // Handle internal errors
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
          contains: lowerCaseName, // Partial match
        }
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
          contains: lowerCaseName, // Partial match
        },
        createdBy: userId, // Ensure only products created by the specific admin are returned
      },
    });

    if (products.length === 0) {
      throw new NotFoundException('No products found with the given name');
    }

    return products;
  }
}
