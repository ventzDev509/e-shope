import {
  Injectable,
  ConflictException,
  NotFoundException,
  InternalServerErrorException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class CategoriesService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto, userId: number) {
    const { name, imageUrl } = createCategoryDto;

    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException("Utilisateur non trouvé.");
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Vous n'avez pas la permission de créer une catégorie.");
    }

    try {
      const existingCategory = await this.prismaService.category.findUnique({
        where: { name },
      });

      if (existingCategory) {
        throw new ConflictException("Une catégorie avec ce nom existe déjà.");
      }

      const category = await this.prismaService.category.create({
        data: { name, imageUrl },
      });

      return category;
    } catch (error) {
      throw new ConflictException("Une catégorie avec ce nom existe déjà.");
    }
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const { name, imageUrl } = updateCategoryDto;

    try {
      const existingCategory = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException("Catégorie non trouvée.");
      }

      const updatedCategory = await this.prismaService.category.update({
        where: { id },
        data: { name, imageUrl },
      });

      return updatedCategory;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException(
        "Une erreur inattendue est survenue lors de la mise à jour de la catégorie.",
      );
    }
  }

  async getAllCategry() {
    return await this.prismaService.category.findMany();
  }

  async getCategoryById(id: number) {
    const category = await this.prismaService.category.findUnique({
      where: { id },
      include:{
        products: true
      }
    });

    if (!category) {
      throw new NotFoundException("Catégorie non trouvée.");
    }

    return category;
  }

  async getAllCategryPagination(page: number = 1, limit: number = 3) {
    const skip = (page - 1) * limit;

    try {
      const [categories, total] = await Promise.all([
        this.prismaService.category.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include:{
            products: true
          }
        }),
        this.prismaService.category.count(),
        
      ]);

      return {
        data: categories,
        total,
        page,
        lastPage: Math.ceil(total / limit),
      };
    } catch (error) {
      throw new InternalServerErrorException(
        "Une erreur est survenue lors de la récupération des catégories avec pagination.",
      );
    }
  }

  async delete(id: number) {
    const ifExist = await this.prismaService.category.findUnique({
      where: { id },
    });

    if (!ifExist) {
      throw new NotFoundException("Catégorie non trouvée.");
    }

    return await this.prismaService.category.delete({
      where: { id },
    });
  }
}
