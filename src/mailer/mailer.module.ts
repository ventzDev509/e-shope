import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { MailService } from './mailer.service';

@Module({
  imports: [
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // Remplacez par votre hôte SMTP
        port: 587, // Le port SMTP, généralement 587 pour TLS
        secure: false, // Si vous utilisez TLS, mettez secure à false
        auth: {
          user: 'eventzmarceille190@gmail.com', // Remplacez par votre email
          pass: 'marceille46123390', // Remplacez par votre mot de passe
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@example.com>', // Remplacez par l'adresse email de l'expéditeur par défaut
      },
      template: {
        dir: join(__dirname, '../mailer/templates'), // Chemin vers les templates d'email
        adapter: new HandlebarsAdapter(), // Utilisez Handlebars comme moteur de templates
        options: {
          strict: true,
        },
      },
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
 