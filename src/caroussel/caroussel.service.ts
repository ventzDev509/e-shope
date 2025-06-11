import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarousselDto } from './dto/create-caroussel.dto';
import { UpdateCarousselDto } from './dto/update-caroussel.dto';

@Injectable()
export class CarousselService {
  constructor(private readonly prismaService: PrismaService) { }

  async create(createCarousselDto: CreateCarousselDto) {
    return this.prismaService.caroussel.create({
      data: createCarousselDto,
    });
  }

  async findAll() {
    return this.prismaService.caroussel.findMany();
  }
  async findWithPagination(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await this.prismaService.$transaction([
      this.prismaService.caroussel.findMany({
        skip,
        take: limit,
        orderBy: { id: 'desc' },
      }),
      this.prismaService.caroussel.count(),
    ]);

    return {
      data,
      total,
      page,
      lastPage: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const caroussel = await this.prismaService.caroussel.findUnique({
      where: { id },
    });
    if (!caroussel) {
      throw new NotFoundException(
        `Aucun carrousel trouvé avec l'identifiant ${id}.`,
      );
    }
    return caroussel;
  }

  async update(id: number, updateCarousselDto: UpdateCarousselDto) {
    const caroussel = await this.prismaService.caroussel.findUnique({
      where: { id },
    });
    if (!caroussel) {
      throw new NotFoundException(
        `Impossible de mettre à jour : aucun carrousel trouvé avec l'identifiant ${id}.`,
      );
    }
    return this.prismaService.caroussel.update({
      where: { id },
      data: updateCarousselDto,
    });
  }

  async remove(id: number) {
    const caroussel = await this.prismaService.caroussel.findUnique({
      where: { id },
    });

    if (!caroussel) {
      throw new NotFoundException(
        `Impossible de supprimer : aucun carrousel trouvé avec l'identifiant ${id}.`,
      );
    }
    return this.prismaService.caroussel.delete({
      where: { id },
    });
    
  }
}
