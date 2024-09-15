
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { APP_PIPE } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AuthModule } from './authentificaion/auth.module';
import { usersModule } from './users/users.module';
import { ProductModule } from './product/product.module';
import { CategoriesModule } from './categories/categories.module';
import { OrderModule } from './order/order.module';
import { CartModule } from './cart/cart.module';
import { MailModule } from './mailer/mailer.module';
import { AddressModule } from './address/address.module';
import { CarousselModule } from './caroussel/caroussel.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    usersModule,
    AuthModule,
    ProductModule,
    CategoriesModule,
    OrderModule,
    CartModule,
    MailModule,
    AddressModule,
    CarousselModule,
  ],
  providers: [ 
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
