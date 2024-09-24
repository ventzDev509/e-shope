import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOffreVisibleDto } from './dto/create-offre-visible.dto';
import { UpdateOffreVisibleDto } from './dto/update-offre-visible.dto';
@Injectable()
export class OffreVisibleService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createOffreVisibleDto: CreateOffreVisibleDto) {
    return this.prismaService.offreVisible.create({
      data: createOffreVisibleDto,
    });
  } 

  //  toutes les offres visibles, avec les détails du produit
  async findAll() {
    return this.prismaService.offreVisible.findMany({
      include: {
        product: true, 
      },
    });
  }

  //  une offre visible spécifique, avec les détails du produit
  async findOne(id: number) {
    const offreVisible = await this.prismaService.offreVisible.findUnique({
      where: { id },
      include: {
        product: true, 
      },
    });

    if (!offreVisible) {
      throw new NotFoundException(`OffreVisible with ID ${id} not found`);
    }

    return offreVisible;
  }

  async update(id: number, updateOffreVisibleDto: UpdateOffreVisibleDto) {
    const offreVisible = await this.prismaService.offreVisible.findUnique({
      where: { id },
    });

    if (!offreVisible) {
      throw new NotFoundException(`OffreVisible with ID ${id} not found`);
    }

    return this.prismaService.offreVisible.update({
      where: { id },
      data: updateOffreVisibleDto,
    });
  }

  async remove(id: number) {
    const offreVisible = await this.prismaService.offreVisible.findUnique({
      where: { id },
    });

    if (!offreVisible) {
      throw new NotFoundException(`OffreVisible with ID ${id} not found`);
    }

    return this.prismaService.offreVisible.delete({
      where: { id },
    });
  }
}
 