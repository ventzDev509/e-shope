import {
  Injectable,
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private readonly prisma: PrismaService) { }

  async getAllProducts() {
    try {
      const products = await this.prisma.product.findMany({
        include: {
          category: true,
          admin: {
            select: { id: true, name: true, email: true },
          },
          colors: true,
          sizes: true,
          additionalImages: true,
        },
      });

      return products.map((product) => ({
        ...product,
        finalPrice:
          product.discount != null
            ? product.price - (product.price * product.discount) / 100
            : product.price,
      }));
    } catch (error) {
      throw new InternalServerErrorException(
        "Une erreur est survenue lors de la récupération des produits.",
      );
    }
  }
  async getProductsWithPagination(
    page: number = 1,
    limit: number = 2,
  ) {
    try {
      // Récupérer total des produits
      const total = await this.prisma.product.count();

      // Récupérer les produits paginés
      const products = await this.prisma.product.findMany({
        include: {
          category: true,
          admin: {
            select: { id: true, name: true, email: true },
          },
          colors: true,
          sizes: true,
          additionalImages: true,
          feature: true,
        },
        skip: (page - 1) * limit,
        take: limit,
      });

      // Calculer le prix final avec discount
      const formattedProducts = products.map((product) => ({
        ...product,
        finalPrice:
          product.discount != null
            ? product.price - (product.price * product.discount) / 100
            : product.price,
      }));

      return {
        data: formattedProducts,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log(error);
      throw error; // ou retourner null/undefined selon le besoin
    }
  }


  async getProductById(productId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        admin: {
          select: { id: true, name: true, email: true },
        },
        colors: true,
        sizes: true,
        additionalImages: true,
        feature: true,
      },
    });

    if (!product) {
      throw new NotFoundException(
        `Produit avec l'identifiant ${productId} introuvable.`,
      );
    }

    return {
      ...product,
      finalPrice:
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price,
    };
  }

  async getProductsByAdmin(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission d'accéder à ces produits.",
      );
    }

    const products = await this.prisma.product.findMany({
      where: { createdBy: userId },
      include: {
        category: true,
        colors: true,
        sizes: true,
        additionalImages: true,
      },
    });

    return products.map((product) => ({
      ...product,
      finalPrice:
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price,
    }));
  }

  async getProductsByAdminWithPagination(
    userId: number,
    page: number = 1,
    limit: number = 2,
  ) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });

      if (!user || user.role !== UserRole.ADMIN) {
        throw new ForbiddenException(
          "Vous n'avez pas la permission d'accéder à ces produits.",
        );
      }

      const [products, total] = await Promise.all([
        this.prisma.product.findMany({
          where: { createdBy: userId },
          include: {
            category: true,
            admin: {
              select: { id: true, name: true, email: true },
            },
            colors: true,
            sizes: true,
            additionalImages: true,
            feature: true,
          },
          skip: (page - 1) * limit,
          take: limit,
        }),
        this.prisma.product.count({ where: { createdBy: userId } }),
      ]);

      const formattedProducts = products.map((product) => ({
        ...product,
        finalPrice:
          product.discount != null
            ? product.price - (product.price * product.discount) / 100
            : product.price,
      }));

      return {
        data: formattedProducts,
        total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error) {
      console.log(error)
    }
  }

  async createProduct(createProductDto: CreateProductDto, userId: number) {
    const {
      name,
      description,
      colors,
      sizes,
      imageUrl,
      imageUrls,
      offer,
      price: rawPrice,
      stock: rawStock,
      discount: rawDiscount,
      categoryId: rawCategoryId,
      feature
    } = createProductDto;

    const price = Number(rawPrice);
    const stock = Number(rawStock);
    const discount = Number(rawDiscount);
    const categoryId = Number(rawCategoryId)

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${categoryId} introuvable.`);
    }

    try {
      const product = await this.prisma.product.create({
        data: {
          name,
          description,
          price,
          stock,
          imageUrl,
          offer,
          discount,
          category: { connect: { id: categoryId } },
          admin: { connect: { id: userId } },
          colors: {
            create: colors?.map((name) => ({ name })),
          },
          sizes: {
            create: sizes?.map((name) => ({ name })),
          },
          additionalImages: {
            create: imageUrls?.map((url) => ({ imageUrls: url })),
          },
          feature: {
            create: feature?.map((name) => ({ name })),
          },

        },
        include: {
          colors: true,
          sizes: true,
          additionalImages: true,
        },
      });

      return product;
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(
        "Erreur lors de la création du produit.",
      );
    }
  }

  async updateProduct(
    productId: number,
    dto: any,
    userId: number,
  ) {
    const {
      name,
      description,
      colors,
      sizes,
      imageUrl,
      imageUrls,
      offer,
      price: rawPrice,
      stock: rawStock,
      discount: rawDiscount,
      categoryId: rawCategoryId,
      feature
    } = dto;


    const price = Number(rawPrice);
    const stock = Number(rawStock);
    const discount = Number(rawDiscount);
    const categoryId = Number(rawCategoryId)
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: {
        additionalImages: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable.');
    }

    if (product.createdBy !== userId) {
      throw new ForbiddenException("Vous n'avez pas la permission de modifier ce produit.");
    }

    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException(`Catégorie avec l'ID ${categoryId} introuvable.`);
    }

    try {
      const updatedProduct = await this.prisma.product.update({
        where: { id: productId },
        data: {
          name,
          description,
          price,
          stock,
          offer,
          discount,
          category: { connect: { id: categoryId } },
          imageUrl: imageUrl || product.imageUrl,
          colors: {
            deleteMany: {},
            create: colors?.map((name: string) => ({ name })) || [],
          },
          sizes: {
            deleteMany: {},
            create: sizes?.map((name: string) => ({ name })) || [],
          },
          feature: {
            deleteMany: {},
            create: feature?.map((name: string) => ({ name })) || [],
          },
        },
      });

      if (imageUrls && imageUrls.length > 0) {
        await this.prisma.productImage.deleteMany({ where: { productId } });

        await this.prisma.productImage.createMany({
          data: imageUrls.map((url: any) => ({
            productId,
            imageUrls: url,
          })),
        });
      }

      return await this.prisma.product.findUnique({
        where: { id: productId },
        include: {
          colors: true,
          sizes: true,
          additionalImages: true,
          category: true,
        },
      });
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException(
        "Erreur lors de la mise à jour du produit.",
      );
    }
  }

  async deleteProduct(productId: number, userId: number) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produit introuvable.');
    }

    if (product.createdBy !== userId) {
      throw new ForbiddenException(
        "Vous n'avez pas la permission de supprimer ce produit.",
      );
    }

    try {
      await this.prisma.product.delete({ where: { id: productId } });
      return { message: 'Produit supprimé avec succès.' };
    } catch (error) {
      throw new InternalServerErrorException(
        'Erreur lors de la suppression du produit.',
      );
    }
  }

  async searchProductsByName(name: string) {
    const products = await this.prisma.product.findMany({
      where: {
        name: {
          contains: name,
        },
      },
      include: {
        colors: true,
        sizes: true,
        additionalImages: true,
      },
    });

    if (products.length === 0) {
      throw new NotFoundException(
        "Aucun produit trouvé avec le nom fourni.",
      );
    }

    return products.map((product) => ({
      ...product,
      finalPrice:
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price,
    }));
  }

  async searchProductsByNameByAdmin(name: string, userId: number) {
    const products = await this.prisma.product.findMany({
      where: {
        name: {
          contains: name,
        },
        createdBy: userId,
      },
      include: {
        colors: true,
        sizes: true,
        additionalImages: true,
        feature: true,
      },
    });

    if (products.length === 0) {
      throw new NotFoundException(
        "Aucun produit trouvé pour cet administrateur avec ce nom.",
      );
    }

    return products.map((product) => ({
      ...product,
      finalPrice:
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price,
    }));
  }

  async getProductsByCategory(id: number, page = 1, limit = 10) {
    const category = await this.prisma.category.findFirst({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Catégorie introuvable.`);
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where: { categoryId: category.id },
        include: {
          colors: true,
          sizes: true,
          additionalImages: true,
          feature: true,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }, // optionnel, pour trier
      }),
      this.prisma.product.count({
        where: { categoryId: category.id },
      }),
    ]);

    const data = products.map((product) => ({
      ...product,
      finalPrice:
        product.discount != null
          ? product.price - (product.price * product.discount) / 100
          : product.price,
    }));

    return {
      data,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }


}
