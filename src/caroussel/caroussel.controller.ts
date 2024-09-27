import { diskStorage } from 'multer';
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete,
  UploadedFile,
  Req,
  Res,
  BadRequestException,
  HttpException,
  HttpStatus,
  UseGuards,
  UseInterceptors,
  Put,
  ParseIntPipe,
} from '@nestjs/common';
import { CarousselService } from './caroussel.service';
import { CreateCarousselDto } from './dto/create-caroussel.dto';
import { UpdateCarousselDto } from './dto/update-caroussel.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';

@Controller('caroussels')
export class CarousselController {
  constructor(private readonly carousselService: CarousselService) {}

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
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Construire l'URL complète de l'image téléchargée
      const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      const caroussel = await this.carousselService.create({
        imageUrl,
      });
      return res.status(200).json({ message: 'carousel Added Successfully' });
    } catch (error) {
      console.log(error);
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

  @Get()
  async findAll() {
    return this.carousselService.findAll();
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: number) {
    return this.carousselService.findOne(id);
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
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.MulterFile,
    @Req() req,
    @Res() res,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Construire l'URL complète de l'image téléchargée
      const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
      const imageUrl = `${baseUrl}/uploads/${file.filename}`;
      const caroussel = await this.carousselService.update(id, {imageUrl});
      return res.status(200).json({ message: 'carousel Update Successfully' });
    } catch (error) {
      console.log(error);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async remove(@Param('id') id: number) {
    return this.carousselService.remove(id);
  }
}
