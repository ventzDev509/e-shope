import { Controller, Post, Put, Body, Param, HttpCode, HttpStatus, UseGuards, Req, Res } from '@nestjs/common';

import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { NotFoundException, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async create(@Body() createCategoryDto: CreateCategoryDto, @Req() req,
  @Res() res,) {
    const userId = req.user.id;
      const category = await this.categoriesService.create(createCategoryDto,userId);
      if(category){
        res.json("Category add succefully")
      }
     
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  async update(@Param('id') id: number, @Body() updateCategoryDto: UpdateCategoryDto) {
    try {
      const category = await this.categoriesService.update(id, updateCategoryDto);
      return category;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error; // Catégorie non trouvée
      } else {
        throw new InternalServerErrorException('An unexpected error occurred while updating the category.');
      }
    }
  }
}
