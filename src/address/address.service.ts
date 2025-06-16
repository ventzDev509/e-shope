import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressService {
  constructor(private readonly prismaService: PrismaService) { }

  async createAddress(createAddressDto: CreateAddressDto, userId: number) {
    const {
      firstName,
      lastName,
      email,
      telephone,
      street,
      city,
      state,
      zipCode,
      country,
      addressDetails,
    } = createAddressDto;

    // Vérifie si l'utilisateur a déjà une adresse
    const existingAddresses = await this.prismaService.address.findMany({
      where: { userId },
    });
    const isFirstAddress = existingAddresses.length === 0;

    // Crée l'adresse liée à l'utilisateur 
    return await this.prismaService.address.create({
      data: {
        firstName,
        lastName,
        email,
        telephone,
        street,
        city,
        state: state ?? '',
        zipCode: zipCode ?? '',
        country: country ?? 'Haïti',
        addressDetails,
        default: isFirstAddress,
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
