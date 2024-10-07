import {
  Controller,
  Post,
  Body,
  HttpStatus,
  Res,
  HttpException,
  Get,
  UseGuards,
  Req,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { Response } from 'express';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/authentificaion/auth.guard';

@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllOrders() {
    return this.orderService.getAllOrders();
  }
  @Get('/byUser')
  @UseGuards(JwtAuthGuard)
  async getAllOrdersByUser(@Req() req, @Res() res) {
    const userId = req.user.id;
    const response = await this.orderService.getOrderByUserId(userId);
    return res.json(response);
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  async createOrder(
    @Body() createOrderDto: CreateOrderDto,
    @Res() res: Response,
    @Req() req,
  ) {
    const userId = req.user.id;
    try {
      const order = await this.orderService.createOrder(createOrderDto, userId);
      return res.status(HttpStatus.CREATED).json(order);
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
  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getOrderById(
    @Param('id', ParseIntPipe) orderId: number,
    @Res() res: Response,
    @Req() req,
  ) {
    try {
      const response = await this.orderService.getOrderById(orderId);
      return res.status(HttpStatus.CREATED).json(response);
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

  @Get('/status/:querry')
  @UseGuards(JwtAuthGuard)
  async getOrderByStatus(
    @Param('querry') querry: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const userId = req.user.id;
    try {
      const response = await this.orderService.getOrderByStatus(querry, userId);
      return res.status(HttpStatus.CREATED).json(response);
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
  @Get('/payment/:querry')
  @UseGuards(JwtAuthGuard)
  async getOrderByPaymentStatus(
    @Param('querry') querry: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const userId = req.user.id;
    try {   
      const response = await this.orderService.getOrderByPaymentStatus(querry, userId);
      return res.status(HttpStatus.CREATED).json(response);
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
  @Put('/status/:id/:status')
  @UseGuards(JwtAuthGuard)
  async updateStatus(
    @Param('id',ParseIntPipe) id: number,
    @Param('status') status: string,
    @Res() res: Response,
    @Req() req,
  ) {
    const userId = req.user.id;
    try {
      const response = await this.orderService.updateOrderStatus(
        id,
        status,
        userId,
      );
      return res.json(response);
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
}
