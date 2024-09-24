import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarousselDto } from './dto/create-caroussel.dto';
import { UpdateCarousselDto } from './dto/update-caroussel.dto';

@Injectable()
export class CarousselService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(createCarousselDto: CreateCarousselDto) {
    return this.prismaService.caroussel.create({
      data: createCarousselDto,
    });
  }

  async findAll() {
    return this.prismaService.caroussel.findMany();
  }

  async findOne(id: number) {
    const caroussel = await this.prismaService.caroussel.findUnique({
      where: { id },
    });
    if (!caroussel) {
      throw new NotFoundException(`Caroussel with ID ${id} not found`);
    }
    return caroussel;
  }

  async update(id: number, updateCarousselDto: UpdateCarousselDto) {
    const caroussel = await this.prismaService.caroussel.findUnique({
      where: { id },
    });
    if (!caroussel) {
      throw new NotFoundException(`Caroussel with ID ${id} not found`);
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
      throw new NotFoundException(`Caroussel with ID ${id} not found`);
    }
    return this.prismaService.caroussel.delete({
      where: { id },
    });
  }
}
