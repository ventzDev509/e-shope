import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  Req,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { Request } from 'express';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createAddress(
    @Body() createAddressDto: CreateAddressDto,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id; 
    const response = await this.addressService.createAddress(
      createAddressDto,
      userId,
    );
    return res.status(200).json({
      success: true,
      data: response,
      message: 'Adresse ajoutée avec succès !'
    });
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getUserAddresses(@Req() req, @Res() res) {
    const userId = req.user.id;
    const response = await this.addressService.getUserAddresses(userId);
    return res.status(200).json(response);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getAddressById(@Param('id') id: number, @Req() req, @Res() res) {
    const userId = req.user.id;
    return this.addressService.getAddressById(id, userId);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async updateAddress(
    @Param('id') id: number,
    @Body() updateAddressDto: UpdateAddressDto,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    return this.addressService.updateAddress(id, updateAddressDto, userId);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteAddress(@Param('id') id: number, @Req() req, @Res() res) {
    const userId = req.user.id;
    return this.addressService.deleteAddress(id, userId);
  }
}
