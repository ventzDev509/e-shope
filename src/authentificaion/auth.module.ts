import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { usersService } from 'src/users/users.service';
import { usersModule } from 'src/users/users.module';
import { PasswordService } from './password.service';
import { MailModule } from 'src/mailer/mailer.module';
import { GoogleStrategy } from './google.strategy';

@Module({
  controllers: [AuthController,],
  providers: [AuthService, PrismaService, JwtStrategy, usersService, PasswordService, GoogleStrategy],
  imports: [
    usersModule,
    PassportModule,
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: process.env.EXPIRE_IN,
      },
    }),
  ],
})
export class AuthModule {}
