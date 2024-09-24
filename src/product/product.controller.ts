// src/product/product.controller.ts

import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProduct() {
    return await this.productService.getAllProducts();
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
      // Handle known exceptions
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      // Handle unexpected errors
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
    }
  }
  @Post('image')
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
        if (!file.mimetype.match(/\/(jpg|jpeg|png|webp)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadImage(@UploadedFile() file: Express.MulterFile) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Construire l'URL complète de l'image téléchargée
    const baseUrl = process.env.UPLOAD_LINK; // Remplacez par l'URL de votre serveur
    const imageUrl = `${baseUrl}/uploads/${file.filename}`;

    return {
      message: 'Image uploaded successfully',
      filePath: file.path,
      fileName: file.filename,
      imageUrl: imageUrl, // Retourner l'URL complète de l'image
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.MulterFile,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id; // Assuming user ID is available in the request
    const imagePath = file?.path; // Get the file path from the uploaded file

    try {
      const product = await this.productService.createProduct(
        createProductDto,
        userId,
      );
      return res.status(HttpStatus.CREATED).json(product);
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
  async updateProduct(
    @Param('id', ParseIntPipe) productId: number,
    @Body() updateProductDto: UpdateProductDto,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id;
    try {
      const updatedProduct = await this.productService.updateProduct(
        productId,
        updateProductDto,
        userId,
      );
      return res.status(HttpStatus.OK).json(updatedProduct);
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
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
      return res.status(HttpStatus.OK).json(result); // Return success message
    } catch (error) {
      // Handle known exceptions
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({ message: error.message });
      }

      // Handle unexpected errors
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'An unexpected error occurred' });
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
  async getProductsByCategory(@Param('id', ParseIntPipe) categoryId: number) {
    return this.productService.getProductsByCategory(categoryId);
  }
}
