import { diskStorage } from 'multer';
import {
  Controller,
  Post,
  Put,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
  Res,
  Get,
  UploadedFile,
  BadRequestException,
  UseInterceptors,
  HttpException,
  ParseIntPipe,
  Query,
  Delete,
} from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import {
  NotFoundException,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { CategoriesService } from './categories.service';
import { extname } from 'path';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getAll() {
    return await this.categoriesService.getAllCategry();
  }

  @Get('pagination')
  async getLimit(@Query('page') page = '1', @Query('limit') limit = '3') {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.categoriesService.getAllCategryPagination(pageNumber, limitNumber);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Req() req, @Res() res, @Body() createCategoryDto: CreateCategoryDto) {
    try {
      const userId = req.user.id;
      await this.categoriesService.create(createCategoryDto, userId);
      return res.status(201).json({ message: 'Catégorie ajoutée avec succès.' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur inattendue est survenue lors de la création de la catégorie.',
      });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  async update(
    @Req() req,
    @Res() res,
    @Body() updateCategoryDto: CreateCategoryDto,
    @Param('id', ParseIntPipe) id: number,
  ) {
    try {
      await this.categoriesService.update(id, updateCategoryDto);
      return res.json({ message: 'Catégorie mise à jour avec succès.' });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur inattendue est survenue lors de la mise à jour de la catégorie.',
      });
    }
  }

  @Get(':id')
  async getById(@Param('id', ParseIntPipe) id: number) {
    return await this.categoriesService.getCategoryById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number, @Req() req, @Res() res) {
    try {
      await this.categoriesService.delete(id);
      return res.json({ message: 'Catégorie supprimée avec succès.' });
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur inattendue est survenue lors de la suppression de la catégorie.',
      });
    }
  }
}
