// mail.service.ts
import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
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
  async sendConfirmationEmail(email: string, confirmationLink: string) {
    await this.transporter.sendMail({
      to: email,
      subject: 'Confirmez votre compte',
      html: `
        <h3>Bienvenue !</h3>
        <p>Cliquez sur le lien ci-dessous pour confirmer votre email :</p>
        <a href="${confirmationLink}">Confirmer mon email</a>
      `,
    });
  }


  async sendPasswordResetEmail(to: string, token: string) {
    const resetLink = `${process.env.LINK}/reset-password?token=${token}&email=${to}`;

    const templatePath = path.join(process.cwd(), 'templates', 'reset-password.hbs');


    const source = fs.readFileSync(templatePath, 'utf8');
    const compiledTemplate = handlebars.compile(source);

    const html = compiledTemplate({
      resetLink,
      year: new Date().getFullYear()

    });

    const mailOptions = {
      from: 'CaribbeanCart <eventzmarceille@gmail.com>',
      to,
      subject: 'Réinitialisation de votre mot de passe',
      html,
    };

    await this.transporter.sendMail(mailOptions);
  }
}