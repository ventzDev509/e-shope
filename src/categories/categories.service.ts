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

  async create(createCategoryDto: CreateCategoryDto, userId: number,imageUrl:string) {
    const { name } = createCategoryDto;

    // Vérifie si l'utilisateur est un administrateur
    const user = await this.prismaService.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new ForbiddenException('User not found.');
    }

    if (user.role !== UserRole.ADMIN) {
      throw new ForbiddenException(
        'You do not have permission to create a category.',
      );
    }

    try {
      // Vérifie si une catégorie avec le même nom existe déjà
      const existingCategory = await this.prismaService.category.findUnique({
        where: { name },
      });

      if (existingCategory) {
        throw new ConflictException(
          'A category with this name already exists.',
        );
      }

      // Crée la nouvelle catégorie
      const category = await this.prismaService.category.create({
        data: { name,imageUrl },
      });
      if (category) {
        return category;
      }
    } catch (error) {
      // Gère les erreurs internes de manière appropriée
      throw new ConflictException('A category with this name already exists.');
    }
  } 

  async update(id: number, updateCategoryDto: UpdateCategoryDto,imageUrl:string) {
    const { name } = updateCategoryDto;

    try {
      // Vérifie si la catégorie existe
      const existingCategory = await this.prismaService.category.findUnique({
        where: { id },
      });

      if (!existingCategory) {
        throw new NotFoundException('Category not found.');
      }

      // Met à jour la catégorie
      const updatedCategory = await this.prismaService.category.update({
        where: { id },
        data: { name,imageUrl },
      });

      return updatedCategory;
    } catch (error) {
      console.log(error)
      if (error instanceof NotFoundException) {
        throw error; // Catégorie non trouvée
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred while updating the category.',
        );
      }
    }
  }
  async getAllCategry() {
    const response = await this.prismaService.category.findMany();
    if (response) {
      return response;
    }
  }
}
