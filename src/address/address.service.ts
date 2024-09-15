import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) {}

  async createAddress(createAddressDto: CreateAddressDto, userId: number) {
    return this.prismaService.address.create({
      data: {
        ...createAddressDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  async getUserAddresses(userId: number) {
    return this.prismaService.address.findMany({
      where: { userId },
    });
  }

  async getAddressById(id: number, userId: number) {
    const address = await this.prismaService.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return address;
  }

  async updateAddress(
    id: number,
    updateAddressDto: UpdateAddressDto,
    userId: number,
  ) {
    const address = await this.prismaService.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return this.prismaService.address.update({
      where: { id },
      data: updateAddressDto,
    });
  }

  async deleteAddress(id: number, userId: number) {
    const address = await this.prismaService.address.findFirst({
      where: { id, userId },
    });
    if (!address) {
      throw new NotFoundException('Address not found');
    }
    return this.prismaService.address.delete({
      where: { id },
    });
  }
}
