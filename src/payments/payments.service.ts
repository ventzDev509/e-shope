import { Injectable } from '@nestjs/common';
import * as moncash from 'moncash';
import { v4 as uuidv4 } from 'uuid'; 
@Injectable()
export class PaymentsService {
  constructor() {
    // Configure MonCash with your credentials
  }

  async capturePaymentByOrderId(orderId: string): Promise<any> {
    const moncash_ = moncash.configure({
      clientId: process.env.MONCASH_CLIENT_ID,
      clientSecret: process.env.MONCASH_CLIENT_SECRET,
      mode: 'sandbox', // or 'live'
    });
    return new Promise((resolve, reject) => {
      moncash_.capture.getByOrderId(orderId, (err, capture) => {
        if (err) {
          console.error('Error:', err.type);
          reject(err);
        } else {
          resolve(capture);
        }
      });
    });
  }

  // Nouvelle méthode pour créer un paiement
  async createPayment(amount: number): Promise<any> {
    const moncash_ = new moncash({
      clientId: process.env.MONCASH_CLIENT_ID,
      clientSecret: process.env.MONCASH_CLIENT_SECRET,
      mode: 'sandbox', // or 'live'
    });
    const orderId = uuidv4();
    const response =await  new Promise((resolve, reject) => {
      moncash_.payment.create({ amount, orderId }, (err, payment) => {
        if (err) {
          console.error('Error:', err);
          reject(err);
        } else {
          const paymentURI = moncash_.payment.redirectUri(payment);
          resolve({ payment, paymentURI });
        }
      });
    }); 
    console.log(response)
    return response
  }
}
