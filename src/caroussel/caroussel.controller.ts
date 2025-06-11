import { diskStorage } from 'multer';
import {
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  Req,
  BadRequestException,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Put,
  ParseIntPipe,
  UploadedFiles,
  Query,
} from '@nestjs/common';
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { CarousselService } from './caroussel.service';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { ImageUploadService } from './../image-upload/image-upload.service';
import { CreateCarousselDto } from './dto/create-caroussel.dto';

@Controller('caroussels')
export class CarousselController {
  constructor(
    private readonly carousselService: CarousselService,
    private readonly imageUploadService: ImageUploadService,
  ) { }

  @Post('')
  async uploadImage(
    @Req() req,
    @Res() res,
    @Body() createCarousselDto: CreateCarousselDto,
  ) {
    try {
      await this.carousselService.create(createCarousselDto);
      return res
        .status(200)
        .json({ message: 'Carrousel ajouté avec succès.' });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return res
          .status(error.getStatus())
          .json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          'Une erreur inattendue est survenue lors de la création du carrousel.',
      });
    }
  }

  @Get()
  async findAll(@Res() res: Response) {
    try {
      const response = await this.carousselService.findAll();

      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader(
        'Access-Control-Allow-Methods',
        'GET,HEAD,PUT,PATCH,POST,DELETE',
      );
      res.setHeader(
        'Access-Control-Allow-Headers',
        'Content-Type, Authorization',
      );

      res.json(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des carrousels :', error);
      res.status(500).json({ message: 'Erreur serveur.' });
    }
  }


  @Get('pagination')
  async getLimit(@Query('page') page = '1', @Query('limit') limit = '3') {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.carousselService.findWithPagination(pageNumber, limitNumber);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return this.carousselService.findOne(id);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.MulterFile,
    @Req() req,
    @Res() res,
  ) {
    if (!file) {
      throw new BadRequestException('Aucun fichier n\'a été téléchargé.');
    }

    try {
      const baseUrl = process.env.UPLOAD_LINK;
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      const caroussel = await this.carousselService.update(id, { imageUrl });
      return res
        .status(200)
        .json({ message: 'Carrousel mis à jour avec succès.' });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return res
          .status(error.getStatus())
          .json({ message: error.message });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message:
          'Une erreur inattendue est survenue lors de la mise à jour du carrousel.',
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      const res = await this.carousselService.remove(id);
      if(res){
        return ({ message: 'Catégorie supprimée avec succès.' })
      }
    } catch (error) {
      console.log(error)
    }
  }
}
