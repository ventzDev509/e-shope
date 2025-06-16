import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ImageUploadService } from './../image-upload/image-upload.service';

@Controller('products')
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly imageUploadService: ImageUploadService,
  ) { }

  @Get()
  async getAllProduct() {
    return await this.productService.getAllProducts();
  }
  @Get('withPagination')
  async getAllProductWithPagination(@Query('page') page = '1', @Query('limit') limit = '3', @Req() req) {
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.productService.getProductsWithPagination(pageNumber, limitNumber);
  }
  @UseGuards(JwtAuthGuard)
  @Get('paginated')
  async getAllProductPaginated(@Query('page') page = '1', @Query('limit') limit = '3', @Req() req) {
    const userId = req.user.id;
    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return await this.productService.getProductsByAdminWithPagination(userId, pageNumber, limitNumber);
  }





  @Get(':id')
  async getAllProductById(@Param('id', ParseIntPipe) productId: number) {
    return await this.productService.getProductById(productId);
  }



  @Get('admin')
  @UseGuards(JwtAuthGuard)
  async getProductsByAdmin(@Req() req, @Res() res) {
    const userId = req.user.id;
    try {
      const products = await this.productService.getProductsByAdmin(userId);
      return res.status(HttpStatus.OK).json(products);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Une erreur inattendue s’est produite.' });
    }
  }

  @Post('image')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          cb(
            new BadRequestException('Seuls les fichiers image sont autorisés.'),
            false,
          );
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.MulterFile) {
    if (!file) {
      throw new BadRequestException('Aucun fichier n’a été envoyé.');
    }

    const baseUrl = process.env.UPLOAD_LINK;
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    return {
      message: 'Image téléchargée avec succès.',
      filePath: file.path,
      fileName: file.filename,
      imageUrl: imageUrl,
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    const primaryFile = files.find(file => file.fieldname === 'primaryFile');
    const secondaryFiles = files.filter(file =>
      file.fieldname.startsWith('secondaryFile_'),
    );

    if (!primaryFile) {
      throw new Error('L’image principale est requise.');
    }

    const primaryUpload = await this.imageUploadService.uploadImage(primaryFile);
    const secondaryUploads = await Promise.all(
      secondaryFiles.map(file => this.imageUploadService.uploadImage(file)),
    );

    createProductDto.imageUrl = primaryUpload.url || '';
    createProductDto.imageUrls = secondaryUploads.map(upload => upload.url) || [];

    try {
      const product = await this.productService.createProduct(
        createProductDto,
        userId,
      );
      return res.status(HttpStatus.CREATED).json(product);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur inattendue est survenue lors de la création du produit.',
      });
    }
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(AnyFilesInterceptor())
  async updateProduct(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: any,
    @UploadedFiles() files: Express.Multer.File[],
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    // Trouver les fichiers selon leur nom de champ
    const primaryFile = files?.find(file => file.fieldname === 'primaryFile');
    const secondaryFiles = files?.filter(file =>
      file.fieldname.startsWith('secondaryFile_'),
    );

    try {
      // Si une nouvelle image principale est envoyée
      if (primaryFile) {
        const primaryUpload = await this.imageUploadService.uploadImage(primaryFile);
        updateProductDto.imageUrl = primaryUpload.url;
      }

      // Si des nouvelles images secondaires sont envoyées
      if (secondaryFiles && secondaryFiles.length > 0) {
        const secondaryUploads = await Promise.all(
          secondaryFiles.map(file => this.imageUploadService.uploadImage(file)),
        );
        updateProductDto.imageUrls = secondaryUploads.map(upload => upload.url);
      }

      const updatedProduct = await this.productService.updateProduct(
        id,
        updateProductDto,
        userId,
      );

      return res.status(HttpStatus.OK).json(updatedProduct);
    } catch (error) {
      console.log(error)
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      console.log(updateProductDto)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Une erreur est survenue lors de la mise à jour du produit.',
      });
    }
  }



  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deleteProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    try {
      const result = await this.productService.deleteProduct(productId, userId);
      return res.status(HttpStatus.OK).json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Une erreur inattendue s’est produite.' });
    }
  }

  @Get('search')
  async searchProducts(@Query('name') name: string, @Req() req) {
    return this.productService.searchProductsByName(name);
  }

  @Get('admin/search')
  @UseGuards(JwtAuthGuard)
  async searchProductsByAdmin(@Query('name') name: string, @Req() req) {
    const userId = req.user.id;
    return this.productService.searchProductsByNameByAdmin(name, userId);
  }


  @Get('category/:id')
  async getProductsByCategory(
    @Param('id', ParseIntPipe) categoryId: number,
    @Query('page') page= '1', 
    @Query('limit') limit = '10',
  ) {
     const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    return this.productService.getProductsByCategory(categoryId, pageNumber, limitNumber);
  }

}
