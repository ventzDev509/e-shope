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
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Dossier où les images seront stockées
        filename: (req, file, cb) => {
          // Générer un nom de fichier unique en utilisant la date et un identifiant aléatoire
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadImage(
    @UploadedFile() file: Express.MulterFile,
    @Req() req,
    @Res() res,
    @Body() CreateCategoryDto: CreateCategoryDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Construire l'URL complète de l'image téléchargée
      const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      const userId = req.user.id;
      const category = await this.categoriesService.create(
        CreateCategoryDto,
        userId,
        imageUrl,
      );
      return res.status(200).json({ message: 'Category Added Successfully' });
    } catch (error) {
      // Handle known exceptions
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }

      // Handle unexpected errors
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred while creating the product',
      });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads', // Dossier où les images seront stockées
        filename: (req, file, cb) => {
          // Générer un nom de fichier unique en utilisant la date et un identifiant aléatoire
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async update(
    @UploadedFile() file: Express.MulterFile,
    @Req() req,
    @Res() res,
    @Body() CreateCategoryDto: CreateCategoryDto,
    @Param('id',ParseIntPipe) id: number,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Construire l'URL complète de l'image téléchargée
      const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      const category = await this.categoriesService.update(
        id,
        CreateCategoryDto,
        imageUrl,
      );
      return res.json({ message: 'Category Update Successfully' });
    } catch (error) {
      // Handle known exceptions
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }

      // Handle unexpected errors
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'An unexpected error occurred while creating the product',
      });
    }
  }

}
