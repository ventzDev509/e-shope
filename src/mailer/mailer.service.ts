// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        auth: {
            user: 'eventzmarceille190@gmail.com',
            pass: 'tzqwakgcyvtmvlmd'
        }
    });
  } 
 
  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${process.env.LINK}/reset-password?token=${token}&email=${to}`;
    const mailOptions = {
      from: 'carribean-cart <eventzmarceille@gmail>',
      to: to,
      subject: 'Password Reset Request',
      html: `<p>You requested a password reset. Click the link below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p>`,
    };
    
    await this.transporter.sendMail(mailOptions);
  }
}