import { HttpException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
const MonCash = require('moncash'); // ✅ import correct
import qs from 'qs';

@Injectable()
export class PaymentsService {
 private readonly clientId = process.env.MONCASH_CLIENT_ID;
  private readonly clientSecret = process.env.MONCASH_CLIENT_SECRET;
  private readonly host = process.env.MONCASH_HOST; // exemple: sandbox.moncashbutton.digicelgroup.com/Api
  private readonly gatewayBase = process.env.MONCASH_GATEWAY_BASE; // exemple: https://sandbox.moncashbutton.digicelgroup.com/Moncash-middleware

  private async getAccessToken(): Promise<string> {
    const url = `https://${this.clientId}:${this.clientSecret}@${this.host}/oauth/token`;
    const response = await axios.post(url, qs.stringify({
      grant_type: 'client_credentials',
      scope: 'read,write'
    }), {
      headers: { Accept: 'application/json' },
    });
    return response.data.access_token;
  }

  async createPayment(orderId: string, amount: number) {
    const token = await this.getAccessToken();
    const url = `https://${this.host}/v1/CreatePayment`;
    const response = await axios.post(
      url,
      { orderId, amount },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );
    const paymentToken = response.data.payment_token.token;
    return {
      redirectUrl: `${this.gatewayBase}/Payment/Redirect?token=${paymentToken}`,
      paymentToken,
    };
  }
}
