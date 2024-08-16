// src/product/product.controller.ts

import {
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
  UseGuards,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getAllProduct() {
    return await this.productService.getAllProducts();
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
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'An unexpected error occurred' });
    }
  }


  @Post()
  @UseGuards(JwtAuthGuard)
  async createProduct(
    @Body() createProductDto: CreateProductDto,
    @Req() req,
    @Res() res,
  ) {
    const userId = req.user.id; // Assuming user ID is available in the request
    const product = await this.productService.createProduct(
      createProductDto,
      userId,
    );
    return res.json(product);
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
  async searchProducts(
    @Query('name') name: string,
    @Req() req,
  ) {
    return this.productService.searchProductsByName(name );
  }

  @Get('admin/search')
  @UseGuards(JwtAuthGuard)
  async searchProductsByAdmin(
    @Query('name') name: string,
    @Req() req,
  ) {
    const userId = req.user.id;
    return this.productService.searchProductsByNameByAdmin(name, userId);
  }
}
