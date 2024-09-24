import { Controller, Get, Param, Post, Body, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('capture/:orderId')
  async capturePayment(@Param('orderId') orderId: string) {
    try {
      const capture = await this.paymentsService.capturePaymentByOrderId(orderId);
      return capture;
    } catch (error) {
      return {
        message: 'Payment capture failed',
        error: error.message,
      };
    }
  }

  @Post('create')
  async createPayment(@Body() body: { amount: number },@Res()res) {
    try {
      const { amount } = body;
      const payment = await this.paymentsService.createPayment(amount);
      return res.json(payment);
    } catch (error) {
      return {
        message: 'Payment creation failed',
        error: error.message,
      };
    }
  }
}
