import { Controller, Get, Param, Post, Body, Res, Query } from '@nestjs/common';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) { }

  @Post('pay')
  async createPayment(@Body() body: { orderId: string; amount: number }) {
    return this.paymentsService.createPayment(body.orderId, body.amount);
  }

  // @Get('redirect')
  // async redirect(@Query('token') token: string, @Res() res: Response) {
  //   // Tu peux enregistrer le token dans la base si besoin
  //   res.send(`Paiement reçu, token: ${token}`);
  // }

  
}
